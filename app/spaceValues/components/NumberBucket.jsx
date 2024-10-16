import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useTimeoutWhen } from 'rooks';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import {
  PLACE_BUCKET_SIZE,
  INDICATOR_CLASS,
  BUCKET_CLASS,
  PLACE_VALUE,
  INTERACTABLE_CLASS,
  XL_BUCKET_SIZE,
  XL_BLOCK_COUNT_THRESHOLD,
} from '../lib/constants';
import {
  findPlace,
  checkIsNumBreakable,
  findElementCenterPos,
  findDistanceDirection,
  degreesToRadians,
  findDeltaPos,
  findAdjacentPlace,
  generateFloatingClass,
  calcBlocksAcross,
} from '../lib/common';
import BlockGroup from './BlockGroup';
import {
	backgroundImage,
  FlexCol,
  StyledCheckmark,
  StyledFloatingContainer,
  StyledHiddenContainer,
  toggleVisibility,
} from './StyledComponents';
import { useGameStateCtx } from '../context';
import {
  getAnswerModelingState,
  getCurrentQuestion,
  getIsFeedback,
  getIsItemCorrect,
  getSelectedBucket,
  getFeedbackPlace,
  getIsPayoff,
  getIsCombineFeedback,
} from '../context/selectors';
import {
  breakBucket,
  finishFeedbackCombine,
  removeBrokenBuckets,
  removeLeavingBuckets,
  setSelectedBucket,
} from '../context/actions';
import InteractableBucket from './Interactable';
import Blob from './Blob';
import { findBucketElement, generateBucketId } from '../lib/buckets';
import { sfxMap } from '../lib/assets/audioMap';
import targetSvg from '@/public/spaceValues/images/ui/target_xl.svg?url'
import checkmarkSvg from '@/public/spaceValues/images/ui/symbol_check.svg?url'

const StyledBucketContainer = styled(FlexCol)`
  position: relative;
  visibility: hidden;
  align-items: center;
  ${({ $gridPos }) =>
    $gridPos &&
    css`
      grid-column: ${$gridPos.col};
      grid-row: ${$gridPos.row};
    `}
  ${({ $isDragging }) =>
    $isDragging &&
    `
    z-index: 1;
  `};
  ${({
    $place,
    $blockCount,
    $isEmpty,
    $isBreakable,
    $isBaseTenBlocks,
  }) => {
    const getSize = () => {
      if ($isEmpty) {
        return PLACE_BUCKET_SIZE[PLACE_VALUE.TENS];
      }
      if (
        $isBaseTenBlocks &&
        $place === PLACE_VALUE.HUNDREDS &&
        $isBreakable &&
        $blockCount >= XL_BLOCK_COUNT_THRESHOLD
      ) {
        return XL_BUCKET_SIZE;
      }
      return PLACE_BUCKET_SIZE[$place];
    };
    const size = getSize();
    return `
      width: ${size}px;
      height: ${size}px;
      padding-bottom: ${$place === PLACE_VALUE.HUNDREDS ? 50 : 20}px;
    `;
  }}
  z-index: ${({ $isInFront }) => ($isInFront ? 2 : 1)};
`;

const StyledNumber = styled.span`
  font-family: var(--font-family);
  font-size: 29px;
  font-weight: 600;
`;

const StyledBucket = styled(InteractableBucket)`
  flex-direction: column;
  width: 100%;
  height: 100%;
  ${({ $isCentered }) =>
    $isCentered &&
    `
    justify-items: center;
    align-content: center;
  `}
  ${toggleVisibility};
`;

const StyledChildrenContainer = styled(StyledHiddenContainer)`
  height: 100%;
  width: 100%;
  position: relative;
  justify-content: ${({ $isCentered }) => ($isCentered ? 'center' : 'flex-end')};
  align-items: center;
  visibility: hidden;
  padding-bottom: ${({ $place, $isCentered }) => {
    if ($isCentered) {
      return 0;
    }
    return $place === PLACE_VALUE.ONES ? 10 : 20;
  }}px;
`;

const targetOffsetPercent = 5;
const targetPos = `-${targetOffsetPercent}%`;
const targetSize = `${100 + targetOffsetPercent * 2}%`;

const StyledTargetSvg = styled.svg`
  position: absolute;
  height: ${targetSize};
  width: ${targetSize};
  left: ${targetPos};
  top: ${targetPos};
	${'' /* ${backgroundImage}; */}
  ${toggleVisibility};
`;

const SPAWNED_CLASS = 'spawned';

// A draggable and/or droppable "bucket" with a given number
const NumberBucket = ({
  id,
  index,
  number,
  gridPos,
  forcePlace,
  willMove,
  startingPos,
  isBaseTenBlocks,
  onRelease,
  isAllDisabled,
  isBreaking,
  isSpawned,
  isLeaving,
  isGrowing,
  isPulsing,
  isPlaceCorrect,
  isFloatingFeedback,
  onSelect,
  closestDropBucket,
  mouseTrackingData,
  shouldResetDraggable,
  finalCombinePos,
}) => {
  const { gameState, gameDispatch, playSfxInterrupt, playSfx } =
    useGameStateCtx();
  const { targetResponse } = getCurrentQuestion(gameState);
  const selectedBucket = getSelectedBucket(gameState);
  const isFeedback = getIsFeedback(gameState);
  const isCorrect = getIsItemCorrect(gameState);
  const answerModelingState = getAnswerModelingState(gameState);
  const isCombineFeedback = getIsCombineFeedback(gameState);
  const feedbackPlace = getFeedbackPlace(gameState);
  const isPayoff = getIsPayoff(gameState);

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [blobDirection, setBlobDirection] = useState(null);
  const [isCombining, setIsCombining] = useState(false);
  const [isFloatingContainerVisible, setIsFloatingContainerVisible] =
    useState(false);
  const [minTogetherDistance, setMinTogetherDistance] = useState(null);

  const { mouseSpeed, mousePos, mouseDirection } = mouseTrackingData;
  const isEmpty = number === 0;
  const isBreakable = checkIsNumBreakable(number, forcePlace);
  const place = forcePlace || findPlace(number);
  const isDisabled = isAllDisabled || (isFeedback && !isPulsing);
  const isMarkedCorrect = isCorrect && number === targetResponse;
  const isActive = answerModelingState === place || feedbackPlace === place;
  const isDraggable = selectedBucket === null || selectedBucket === id;
  const isLastBucket = isCorrect && isCombineFeedback && index === 0;

  const bucketClass = `${BUCKET_CLASS} ${place.toLowerCase()} ${
    isSpawned ? SPAWNED_CLASS : ''
  }`;
  const bucketId = generateBucketId(id);

  const bucketRef = useRef(null);
  const childrenRef = useRef(null);
  const floatingContainerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const isActivelyPulsing = useRef(false);
  const isInFinalPos = useRef(
    !isEmpty && !willMove && !isSpawned && !isLastBucket,
  );
  const hasBroken = useRef(false);
  const lastPosition = useRef({});
  const isStretchSfxAllowed = useRef(false);

  const combineOrBreakSfx = {
    src: sfxMap['combineOrBreakSfx'],
  };
  const startStretchSfx = {
    src: sfxMap['startStretchSfx'],
  };

  const bucketChildren = (
    <>
      {isBaseTenBlocks ? (
        <BlockGroup number={number} forcePlace={forcePlace} />
      ) : (
        <span />
      )}
      <StyledNumber>{number}</StyledNumber>
    </>
  );

  const stopPulsing = () => {
    if (isActivelyPulsing.current) {
      isActivelyPulsing.current = false;
      gsap.killTweensOf(bucketRef.current);
      gsap.to(bucketRef.current, { clearProps: 'scale', duration: 0.3 });
    }
  };

  const onDragStart = () => {
    isStretchSfxAllowed.current = true;
    setIsDragging(true);
    onSelect();
    gameDispatch(setSelectedBucket(id));
  };

  const onDragEnd = (draggable, droppablesList) => {
    isStretchSfxAllowed.current = false;
    setIsDragging(false);
    setIsDraggedOver(false);
    onRelease(draggable, droppablesList);
  };

  const onHoverIn = () => {
    setIsDraggedOver(true);
  };

  const onHoverOut = () => {
    setIsDraggedOver(false);
  };

  const handleSelect = () => {
    if (isDisabled) {
      return;
    }
    if (isBreakable && !hasBroken.current) {
      hasBroken.current = true;
      onSelect(findElementCenterPos(bucketRef.current));
      gsap.to(bucketRef.current, {
        css: {
          background: ``,
        },
      });
      playSfxInterrupt(combineOrBreakSfx);
      gameDispatch(breakBucket(id));
      return;
    }
    onSelect();
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') {
      return;
    }
    handleSelect();
  };

  const showAll = useCallback(() => {
    if (!bucketRef.current || !childrenRef.current || isEmpty) {
      return;
    }
    gsap.set([bucketRef.current, childrenRef.current], {
      autoAlpha: 1,
    });
  }, [isEmpty]);

  const onCompleteCombine = useCallback(() => {
    gameDispatch(finishFeedbackCombine());
    isAnimatingRef.current = false;
  }, [gameDispatch]);

  const findBucketCenter = () => findElementCenterPos(bucketRef.current);

  const calculateIndicatorPos = () => {
    const indicator = window.document.querySelector(`.${INDICATOR_CLASS}`);
		console.log({indicator})
    const indicatorBounds = indicator.getBoundingClientRect();
    const bucketBounds = bucketRef.current.getBoundingClientRect();

    const distToIndicator = findDeltaPos(finalCombinePos, findBucketCenter());

		console.log({distToIndicator})

    return {
      x: distToIndicator.x + indicatorBounds.width + bucketBounds.width / 4,
      y: distToIndicator.y + indicatorBounds.height,
    };
  };

  const calculateIndicatorDirection = () => {
    const direction = findDistanceDirection(
      finalCombinePos,
      findBucketCenter(),
    );
    return direction + degreesToRadians(180);
  };

  useEffect(() => {
    if (!floatingContainerRef.current || !bucketRef.current) {
      return;
    }
    if (isActive && isFloatingFeedback && !isFloatingContainerVisible) {
      if (isEmpty) {
        gsap.set([bucketRef.current], { autoAlpha: 1 });
      }
      setIsFloatingContainerVisible(true);
    } else if (
      answerModelingState !== null ||
      (!isActive && !isFloatingFeedback)
    ) {
      setIsFloatingContainerVisible(false);
      gsap.set(floatingContainerRef.current, { clearProps: 'all' });
    }
  }, [
    isEmpty,
    isActive,
    isFloatingFeedback,
    answerModelingState,
    isFloatingContainerVisible,
  ]);

  useEffect(() => {
    if (closestDropBucket) {
      setMinTogetherDistance(closestDropBucket.size);
    }
  }, [closestDropBucket]);

  // Handle incorrect/correct answer feedback
  useEffect(() => {
    const noop = () => {};
    if (
      !isLastBucket &&
      (!isFeedback || !isCorrect || isAnimatingRef.current)
    ) {
      return noop;
    }

    const indicatorPos = calculateIndicatorPos();

    if (isLastBucket) {
      if (!isInFinalPos.current) {
        isInFinalPos.current = true;
        setBlobDirection(135);
        gsap
          .timeline()
          .set(bucketRef.current, indicatorPos)
          .to([bucketRef.current, childrenRef.current], {
            autoAlpha: 1,
            duration: 0.2,
          });
      }
      return noop;
    }

    isAnimatingRef.current = true;
    setIsCombining(true);

    setBlobDirection(calculateIndicatorDirection());

    const gs = gsap.to(bucketRef.current, {
      ...indicatorPos,
      onComplete: onCompleteCombine,
      delay: 0.1,
    });

    return () => gs.kill();
  }, [isLastBucket, isFeedback, isCorrect, onCompleteCombine]);

  // Handles early incorrect answer feedback
  useEffect(() => {
    if (isPulsing) {
      isActivelyPulsing.current = true;
      gsap.to(bucketRef.current, {
        scale: 1.2,
        yoyo: true,
        repeat: -1,
      });
    } else {
      stopPulsing();
    }
  }, [isPulsing]);

  // Handles bucket spawning from breaks
  useEffect(() => {
    if (!bucketRef.current || !childrenRef.current || isEmpty || isLastBucket) {
      return;
    }
    // Immediately show buckets in current position
    if (isInFinalPos.current) {
      showAll();
      return;
    }
    const timeline = gsap.timeline().delay(0.2);
    const finalPos = findElementCenterPos(bucketRef.current);
    if (willMove) {
      // Re-position buckets that need to be moved
      const posChange = findDeltaPos(startingPos, finalPos);
      setBlobDirection(findDistanceDirection(startingPos, finalPos));
      timeline
        .set(bucketRef.current, {
          x: posChange.x,
          y: posChange.y,
        })
        .delay(0.5)
        .to(bucketRef.current, {
          x: 0,
          y: 0,
        });
    } else if (isSpawned) {
      // Rotate buckets from break that will not move
      const otherBuckets = document.querySelectorAll(
        `.${BUCKET_CLASS}.${SPAWNED_CLASS}`,
      );
      let totalPos = { x: 0, y: 0 };
      for (const bucket of otherBuckets.values()) {
        if (bucket !== bucketRef.current) {
          const bucketPos = findElementCenterPos(bucket);
          totalPos = {
            x: totalPos.x + bucketPos.x,
            y: totalPos.y + bucketPos.y,
          };
        }
      }
      const avgPosition = {
        x: totalPos.x / (otherBuckets.length - 1),
        y: totalPos.y / (otherBuckets.length - 1),
      };
      const avgDirection = findDistanceDirection(finalPos, avgPosition);
      // Offset by 180 degrees (in radians)
      setBlobDirection(avgDirection + degreesToRadians(180));
    }
    // Fade in buckets not in final position but not moving
    timeline
      .to(
        bucketRef.current,
        {
          autoAlpha: 1,
          duration: 0.2,
        },
        '<',
      )
      .to(
        childrenRef.current,
        {
          autoAlpha: 1,
          duration: 0.2,
          delay: 0.5,
        },
        '>',
      );
  }, [willMove, startingPos, isSpawned, showAll, isEmpty, isLastBucket]);

  // Handles bucket position change
  useEffect(() => {
    if (!bucketRef.current || isLastBucket) {
      return;
    }
    const currPos = findElementCenterPos(bucketRef.current);

    if (!gridPos) {
      isInFinalPos.current = false;

      const { x: lastX = currPos.x, y: lastY = currPos.y } =
        lastPosition.current;

      gsap
        .timeline()
        .set(bucketRef.current, {
          x: lastX - currPos.x,
          y: lastY - currPos.y,
        })
        .to(bucketRef.current, {
          x: 0,
          y: 0,
          onComplete: () => {
            isInFinalPos.current = true;
          },
        });
    }
    lastPosition.current = currPos;
  }, [gridPos, isLastBucket]);

  // Handles broken bucket, soon to be removed
  useEffect(() => {
    if (!isBreaking) {
      return;
    }

    gsap.to(bucketRef.current, {
      autoAlpha: 0,
      duration: 0.5,
      delay: 0.1,
      onComplete: () => gameDispatch(removeBrokenBuckets()),
    });
  }, [isBreaking]);

  // Handles leaving bucket, soon to be removed
  useEffect(() => {
    if (
      !closestDropBucket ||
      !bucketRef.current ||
      (!isLeaving && !isGrowing)
    ) {
      return;
    }

    const timeline = gsap
      .timeline({ defaults: { duration: 0.5 } })
      .to(childrenRef.current, {
        autoAlpha: 0,
        delay: isLeaving ? 0.8 : 0,
      });

    if (isLeaving) {
      const dragElement = window.document.querySelector(`#${bucketId}`);
      const closestBucket = findBucketElement(closestDropBucket?.key);
      const origPosDist = findDeltaPos(
        findElementCenterPos(dragElement),
        findElementCenterPos(bucketRef.current),
      );
      const otherBucketDist = findDeltaPos(
        findElementCenterPos(closestBucket),
        findElementCenterPos(dragElement),
      );
      // Set to be in the current position
      timeline
        .set(`#${bucketId}`, { x: 0, y: 0 }, 0)
        .set(
          bucketRef.current,
          {
            x: origPosDist.x,
            y: origPosDist.y,
          },
          0,
        )
        // Move on top of the growing bucket
        .to(
          `#${bucketId}`,
          {
            autoAlpha: 0,
            x: otherBucketDist.x,
            y: otherBucketDist.y,
            onComplete: () => gameDispatch(removeLeavingBuckets()),
          },
          0.1,
        );
      return;
    }

    timeline.to(childrenRef.current, {
      autoAlpha: 1,
    });
  }, [isLeaving, isGrowing, closestDropBucket]);

  // Handles selected bucket resets
  useEffect(() => {
    if (selectedBucket) {
      setIsDraggedOver(false);
    } else if (!willMove && !isLastBucket) {
      isInFinalPos.current = true;
      showAll();
    }
  }, [selectedBucket, willMove, isLastBucket, showAll]);

  // Handles rotating the dragged blob for blobbing animation
  useEffect(() => {
    if (
      !isStretchSfxAllowed.current ||
      !isDragging ||
      !mousePos ||
      !closestDropBucket ||
      closestDropBucket.dist >= minTogetherDistance
    ) {
      return;
    }
    const direction = findDistanceDirection(closestDropBucket.pos, mousePos);
    setBlobDirection(direction);
    playSfx(startStretchSfx);
  }, [closestDropBucket, mousePos, isDragging]);

  useEffect(() => {
    if (!isPayoff || !childrenRef.current) {
      return;
    }
    gsap.to(childrenRef.current, { autoAlpha: 0, duration: 0.2 });
  });

  return (
    <StyledBucketContainer
      ref={bucketRef}
      className={`${bucketClass}`}
      $place={place}
      $blockCount={calcBlocksAcross(number)}
      $isBaseTenBlocks={isBaseTenBlocks}
      $isBreakable={isBreakable}
      $isDragging={isDragging}
      $gridPos={gridPos}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      $isEmpty={isEmpty}
      tabIndex={isBreakable ? 0 : -1}
      $isInFront={isBreaking || isGrowing || isDragging}
    >
      <StyledBucket
        $isCentered
        $isHidden={isEmpty}
				$place={place}
        className={`${bucketClass} ${INTERACTABLE_CLASS}`}
        disabled={isDisabled || (isBreakable && isDraggable)}
        draggable="false"
        isDraggable={isDraggable}
        id={bucketId}
        index={index}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        isDraggedOver={isDraggedOver}
        isDropReset={shouldResetDraggable}
      >
        <StyledTargetSvg
          src={targetSvg}
          $isHidden={!isMarkedCorrect && !isActive}
        />
        <Blob
          isSpawned={isSpawned}
          isGrowing={isGrowing}
          isLeaving={isLeaving}
          isMoving={selectedBucket === id}
          isCombining={isCombining}
          isAlive={isPayoff}
          closestBlobDistance={closestDropBucket?.dist}
          minTogetherDistance={minTogetherDistance}
          moveSpeed={mouseSpeed}
          movePos={mousePos}
          mouseDirection={mouseDirection}
          blobDirection={blobDirection}
          shouldWatchMouse={closestDropBucket?.key === id}
        />
        <StyledChildrenContainer
          $place={place}
          as={FlexCol}
          $isCentered={!isBaseTenBlocks}
          ref={childrenRef}
        >
          {bucketChildren}
        </StyledChildrenContainer>
      </StyledBucket>
      <StyledFloatingContainer
        className={generateFloatingClass(place)}
        ref={floatingContainerRef}
        $isHidden={!isFloatingContainerVisible}
        $isFilled={false}
      >
        {isPlaceCorrect && (
          <StyledCheckmark src={checkmarkSvg} />
        )}
      </StyledFloatingContainer>
    </StyledBucketContainer>
  );
};

const positionShape = PropTypes.shape({
  x: PropTypes.number,
  y: PropTypes.number,
});

NumberBucket.propTypes = {
  isAllDisabled: PropTypes.bool,
  // Unique ID of this bucket
  id: PropTypes.string.isRequired,
  // Index of this bucket
  index: PropTypes.number.isRequired,
  // Number this bucket represents
  number: PropTypes.number.isRequired,
  gridPos: PropTypes.shape({
    col: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
  }),
  // A place value can be provided to force entire number to be
  // displayed as a certain block type, like ones
  forcePlace: PropTypes.string,
  // Blocks are only displayed if value is true
  isBaseTenBlocks: PropTypes.bool,
  // Handles releasing bucket for bucket drag/drop interaction
  onRelease: PropTypes.func.isRequired,
  // Handles selecting this bucket, either via click or drag start
  onSelect: PropTypes.func.isRequired,
  // If this bucket is pulsing for feedback
  isPulsing: PropTypes.bool,
  // Triggers draggable reset
  shouldResetDraggable: PropTypes.bool,
  // If this bucket was just broken
  isBreaking: PropTypes.bool.isRequired,
  // If this bucket is leaving
  isLeaving: PropTypes.bool.isRequired,
  // If this bucket is absorbing another bucket
  isGrowing: PropTypes.bool.isRequired,
  // If this bucket was just created
  isSpawned: PropTypes.bool.isRequired,
  // If the value in this place is correct for the solution
  isPlaceCorrect: PropTypes.bool.isRequired,
  // If we are in the floating feedback stage
  isFloatingFeedback: PropTypes.bool.isRequired,
  // If this bucket needs to move to it's final location
  willMove: PropTypes.bool.isRequired,
  // Starting position, used for bucket breaking
  startingPos: positionShape,
  // Final position for correct feedback combine
  finalCombinePos: positionShape.isRequired,
  // Closest bucket to this bucket if dragging
  closestDropBucket: PropTypes.shape({
    key: PropTypes.string,
    dist: PropTypes.number,
    size: PropTypes.number,
    pos: positionShape,
  }),
  // Mouse data
  mouseTrackingData: PropTypes.shape({
    mouseSpeed: PropTypes.number,
    mouseDirection: PropTypes.number,
    mousePos: positionShape,
  }),
};

NumberBucket.defaultProps = {
  isAllDisabled: false,
  forcePlace: null,
  gridPos: null,
  startingPos: null,
  isBaseTenBlocks: true,
  shouldResetDraggable: false,
  isPulsing: false,
  closestDropBucket: null,
  mouseTrackingData: {
    mouseSpeed: 0,
    mouseDirection: null,
    mousePos: null,
  },
};

export default NumberBucket;
