import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTimeoutWhen, useWillUnmount } from 'rooks';
import useAudioPlayer from '../../../hooks/useAudioPlayer';
import {
  findPlace,
  findElementCenterPos,
  findDistanceBetween,
  findLargestPlace,
  calcBaseTenDigit,
  checkIsNumBreakable,
} from '../lib/common';
import {
  checkAvailableBuckets,
  findBucket,
  findBucketElement,
  findInteractableBuckets,
  parseBucketId,
} from '../lib/buckets';
import NumberBucket from './NumberBucket';
import { useGameStateCtx } from '../context';
import {
  combineBuckets,
  countIncorrectCombine,
  interactBuckets,
  retryItem,
  setFeedbackState,
  setSelectedBucket,
} from '../context/actions';
import {
  getBuckets,
  getFeedbackState,
  getSelectedBucket,
  getUserResponse,
  getCurrentQuestion,
} from '../context/selectors';
import {
  BASE_GRID_SIZE,
  FEEDBACK_STATE,
  GRID_COL_COUNT,
  GRID_ROW_COUNT,
  INDICATOR_CLASS,
  PLACE_VALUE,
  QUESTION_TYPE_REPRESENTATION,
  SORTED_PLACES,
} from '../lib/constants';
import useTrackMouse from '../hooks/useTrackMouse';
import { sfxMap } from '../lib/assets/audioMap'
import { DragDropProvider } from './DragAndDrop';

const StyledGroupContainer = styled(DragDropProvider)`
  position: relative;
  display: grid;
  width: 100%;
  align-items: center;
  justify-items: center;
  grid-template-columns: repeat(${GRID_COL_COUNT}, ${BASE_GRID_SIZE}px);
  grid-template-rows: repeat(${GRID_ROW_COUNT}, ${BASE_GRID_SIZE}px);
  gap: 2px;
  transition: all 0.2s ease;
`;

// Bucket controller - handles bucket interaction
const BucketController = ({ responseDigits, isFloatingFeedback }) => {
  /* 
  / Global Context
  */
  const { gameState, gameDispatch, playSfxInterrupt } =
    useGameStateCtx();
  const allBuckets = getBuckets(gameState);
  const { numbers, representation } = getCurrentQuestion(gameState);
  const selectedBucket = getSelectedBucket(gameState);
  const feedbackState = getFeedbackState(gameState);
  const userResponse = getUserResponse(gameState);

  /* 
  / Local State and Values
  */
  const [isPulsingBuckets, setIsPulsingBuckets] = useState(false);
  const [closestDropBucket, setClosestDropBucket] = useState(null);
  const [shouldResetDraggable, setShouldResetDraggable] = useState(false);
  const [disableAll, setDisableAll] = useState(false);
  const [sfxTimeout, setSfxTimeout] = useState(null);

  const largestPlace = SORTED_PLACES[findLargestPlace(numbers)];

  const isBaseTenBlocks =
    QUESTION_TYPE_REPRESENTATION[representation] ===
    QUESTION_TYPE_REPRESENTATION.BASE_TEN_BLOCKS;

  const brokenBucket = useRef(null);
  const bestDroppable = useRef(null);
  const finalCombinePos = useRef(null);

  const isEarlyFeedback = feedbackState === FEEDBACK_STATE.EARLY_INCORRECT;

  // Remaining buckets available for breaking or combining
  const interactableBuckets = useMemo(
    () => findInteractableBuckets(allBuckets),
    [allBuckets],
  );

  const mouseTrackingData = useTrackMouse(selectedBucket !== null);
  const { mousePos } = mouseTrackingData;

  /*
  / Audio
  */
  const { playAudio: playWhooshSfx } = useAudioPlayer();
  const combineOrBreakSfx = sfxMap['combineOrBreakSfx'];

  /* 
  / Methods
  */
  const stopPulsing = () => {
    setIsPulsingBuckets(false);
    gameDispatch(retryItem());
  };

  const onSelectBucket = useCallback(
    (startingPos = null) => {
      setShouldResetDraggable(false);
      if (startingPos) {
        setDisableAll(true);
        brokenBucket.current = startingPos;
      }
      if (isEarlyFeedback) {
        stopPulsing();
      }
    },
    [isEarlyFeedback],
  );

  const onReleaseBucket = ({ id: dragId }, droppablesList) => {
    // handle bucket droppable
    const dragBucketKey = parseBucketId(dragId);
    const { number: dragBucketNum, forcePlace: dragForcePlace } =
      allBuckets.find((b) => b.key === dragBucketKey);
    const dragPlace = dragForcePlace || findPlace(dragBucketNum);

    bestDroppable.current = droppablesList.find((dropId) => {
      const { number: dropBucketNum } = findBucket(
        allBuckets,
        parseBucketId(dropId),
      );

      // Cannot combine with breakable buckets
      const isBreakableDrop = checkIsNumBreakable(dropBucketNum);

      const dropPlace = findPlace(dropBucketNum);
      const isNotPlaceMatch = dragPlace !== dropPlace;

      // Only allow interaction if same place value
      if (isNotPlaceMatch || isBreakableDrop) {
        // track incorrect combine
        gameDispatch(countIncorrectCombine());
        return false;
      }

      return true;
    });

    if (bestDroppable.current) {
      setDisableAll(true);
      gameDispatch(interactBuckets(dragBucketKey, bestDroppable.current));
      playSfxInterrupt(combineOrBreakSfx);
    } else {
      setShouldResetDraggable(true);
    }
    gameDispatch(setSelectedBucket(null));
  };

  // Buckets display
  const groupBucketDisplay = useMemo(() => {
    if (!finalCombinePos.current) {
      const indicatorElem = window.document.querySelector(
        `.${INDICATOR_CLASS}`,
      );
      if (!indicatorElem) {
        return [];
      }
      finalCombinePos.current = findElementCenterPos(indicatorElem);
    }
    return allBuckets.map(
      (
        {
          key,
          number,
          forcePlace,
          gridPos,
          willMove,
          isSpawned,
          isBreaking,
          isLeaving,
          isGrowing,
        },
        i,
      ) => (
        <NumberBucket
          key={key}
          id={key}
          isAllDisabled={disableAll}
          gridPos={gridPos}
          index={i}
          number={number}
          shouldResetDraggable={shouldResetDraggable}
          isPulsing={
            isPulsingBuckets && !!interactableBuckets.find((b) => b.key === key)
          }
          isFloatingFeedback={isFloatingFeedback}
          forcePlace={forcePlace}
          onRelease={onReleaseBucket}
          onSelect={onSelectBucket}
          isBaseTenBlocks={isBaseTenBlocks}
          isSpawned={isSpawned}
          isBreaking={isBreaking}
          isLeaving={isLeaving}
          isGrowing={isGrowing}
          isPlaceCorrect={
            calcBaseTenDigit(responseDigits, findPlace(number)) === number
          }
          willMove={willMove}
          startingPos={brokenBucket.current}
          mouseTrackingData={mouseTrackingData}
          closestDropBucket={closestDropBucket}
          finalCombinePos={finalCombinePos.current}
        />
      ),
    );
  }, [
    disableAll,
    allBuckets,
    isPulsingBuckets,
    isFloatingFeedback,
    interactableBuckets,
    onReleaseBucket,
    onSelectBucket,
    mouseTrackingData,
    closestDropBucket,
    selectedBucket,
    responseDigits,
    shouldResetDraggable,
  ]);

  useWillUnmount(() => {
    clearTimeout(sfxTimeout);
  });

  /*
  / Effects
  */
  // Start pulsing when early feedback starts
  useEffect(() => {
    if (isEarlyFeedback) {
      setIsPulsingBuckets(true);
    }
  }, [isEarlyFeedback]);

  // Stop pulsing, once pulsing starts, after 5 seconds
  useTimeoutWhen(
    () => {
      stopPulsing();
    },
    5000,
    isPulsingBuckets,
  );

  useEffect(() => {
    if (allBuckets.length === 0) {
      return;
    }
    if (
      allBuckets.every(
        ({ isSpawned, isGrowing, isLeaving, isBreaking }) =>
          !isSpawned && !isGrowing && !isLeaving && !isBreaking,
      )
    ) {
      bestDroppable.current = null;
      brokenBucket.current = null;
      setClosestDropBucket(null);
      setDisableAll(false);
      if (allBuckets.length > 1) {
        setShouldResetDraggable(true);
      } else {
        setShouldResetDraggable(false);
        if (feedbackState === FEEDBACK_STATE.COMBINE) {
          gameDispatch(setFeedbackState(FEEDBACK_STATE.POST_COMBINE));
          setSfxTimeout(
            setTimeout(() => {
              playSfxInterrupt(sfxMap['expandedFormAppears']);
            }, 300),
          );
        }
      }
    }
  }, [allBuckets, feedbackState]);

  useEffect(() => {
    let timeout;
    if (feedbackState === FEEDBACK_STATE.SCAFFOLD_SORT) {
      playWhooshSfx(sfxMap['whooshSfx']);

      timeout = setTimeout(() => {
				gameDispatch(setFeedbackState(FEEDBACK_STATE.FLOATING_NUMBERS));
      }, 1000);
    } else if (feedbackState === FEEDBACK_STATE.COMBINE) {
      playSfxInterrupt(combineOrBreakSfx);
      gameDispatch(combineBuckets());
    }

    return () => timeout && clearTimeout(timeout);
  }, [userResponse, feedbackState]);

  useEffect(() => {
    if (bestDroppable.current) {
      return;
    }
    if (selectedBucket === null) {
      setClosestDropBucket(null);
      return;
    }
    // check distance to each bucket
    const closestBucket = allBuckets.reduce((closest, bucket) => {
      const { dist: lastDist } = closest;
      if (bucket.key === selectedBucket) {
        return closest;
      }
      const bucketElement = findBucketElement(bucket.key);
      const bucketDistance = findDistanceBetween(
        findElementCenterPos(bucketElement),
        findElementCenterPos(findBucketElement(selectedBucket)),
      );
      if (lastDist && bucketDistance >= lastDist) {
        return closest;
      }
      const bucketPos = findElementCenterPos(bucketElement);
      return {
        key: bucket.key,
        dist: bucketDistance,
        size: bucketElement.getBoundingClientRect().width,
        pos: bucketPos,
      };
    }, {});
    // mark the closest bucket
    // & pass that down for the bucket to use
    setClosestDropBucket(closestBucket);
  }, [allBuckets, selectedBucket, mousePos]);

  return (
    <StyledGroupContainer width="100%">
      {groupBucketDisplay}
    </StyledGroupContainer>
  );
};

BucketController.propTypes = {
  /* eslint-disable-next-line */
  responseDigits: PropTypes.object.isRequired,
  isFloatingFeedback: PropTypes.bool.isRequired,
};

export default BucketController;
