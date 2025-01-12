import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useWillUnmount } from 'rooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import useLottie from '@/hooks/useLottie';
import useAudioPlayer from '@/hooks/useAudioPlayer';
import { StyledLottieDiv, toggleVisibility } from './StyledComponents';
import {
  findDistanceBetween,
  findDistanceDirection,
  findElementCenterPos,
  radiansToDegrees,
} from '../lib/common';
import { sfxMap } from '../lib/assets/audioMap';
import svgMap from '../lib/assets/svgMap';

import blobMove from '@/public/spaceValues/images/animations/Blob_Move.json'
import blobTogether from '@/public/spaceValues/images/animations/Blob_Together.json'
import blobAlive from '@/public/spaceValues/images/animations/Blob_Life.json'
import { useGameStateCtx } from '../context';
import { setFeedbackState } from '../context/actions';
import { BUCKET_SURROUND_PERCENT, FEEDBACK_STATE } from '../lib/constants';

const blobSizeCss = `1${BUCKET_SURROUND_PERCENT * 2}%`;
const blobPosOffset = `-${BUCKET_SURROUND_PERCENT}%`;
const StyledBlobContainer = styled.div`
  width: ${blobSizeCss};
  height: ${blobSizeCss};
  position: absolute;
  top: ${blobPosOffset};
  left: ${blobPosOffset};
  transform-origin: center;
  pointer-events: none;
`;

const StyledBlob = styled(StyledLottieDiv)`
  ${toggleVisibility};
  transition: opacity 0.01s;
  width: 100%;
  height: 100%;
`;

const BLOB_ANIM_STATE = {
  MOVING: 'MOVING',
  MOVING_RETURN: 'MOVING_RETURN',
  TOGETHER: 'TOGETHER',
  TOGETHER_JIGGLE: 'TOGETHER_JIGGLE',
  TOGETHER_COMBINE: 'TOGETHER_COMBINE',
  TOGETHER_APART: 'TOGETHER_APART',
  ALIVE: 'ALIVE',
};

const BLOB_FRAMES = {
  [BLOB_ANIM_STATE.MOVING]: [0, 7],
  [BLOB_ANIM_STATE.MOVING_RETURN]: [8, 13],
  [BLOB_ANIM_STATE.TOGETHER]: [0, 15],
  [BLOB_ANIM_STATE.TOGETHER_JIGGLE]: [16, 30],
};

const Blob = ({
  shouldWatchMouse,
  isSpawned,
  isLeaving,
  isGrowing,
  isMoving,
  isCombining,
  isAlive,
  // moveSpeed, // to do- implement speed
  mouseDirection,
  movePos,
  blobDirection,
  closestBlobDistance,
  minTogetherDistance,
}) => {
  const { gameDispatch, playSfxInterrupt } = useGameStateCtx();

  const blobRef = useRef(null);
  const lastTogetherFrame = useRef(0);
  const lastDirection = useRef(0);
  const hasPlayedMoveAnimation = useRef(false);

  const [animState, setAnimState] = useState(null);
  const [isMoveAnimating, setIsMoveAnimating] = useState(null);
  const [sfxTimeout, setSfxTimeout] = useState(null);

  // State change helpers
  const switchMovingState = (newState) => setAnimState(newState);
  const clearAnimState = () => setAnimState(null);
  const setTogetherState = () => setAnimState(BLOB_ANIM_STATE.TOGETHER);

  const isTogetherAnim = !!animState?.includes(BLOB_ANIM_STATE.TOGETHER);

  const [moveAnim, moveRef] = useLottie({
		animationData: blobMove,
    loop: false,
    autoplay: false,
    events: [
      {
        eventName: 'complete',
        callback: () => setIsMoveAnimating(false),
      },
    ],
  });

  const [togetherAnim, togetherRef] = useLottie({
		animationData: blobTogether,
    loop: false,
    autoplay: false,
    events: [
      {
        eventName: 'complete',
        callback: () => clearAnimState(),
      },
    ],
  });

  const [aliveAnim, aliveRef] = useLottie({
    animationData: blobAlive,
    loop: false,
    autoplay: false,
    events: [
      {
        eventName: 'complete',
        callback: () => setAnimState(BLOB_ANIM_STATE.ALIVE),
      },
    ],
  });

  const { playAudio: playCorrectSfx } = useAudioPlayer();
  const itsAlivePayoffSfx = sfxMap['itsAlivePayoffSfx'];
  const blinkingPayoffSfx = sfxMap['blinkingPayoffSfx'];

  // Prevent infinite re-render w/ memo
  const quickRotateTo = useMemo(() => {
    if (!blobRef.current) {
      return null;
    }
    return gsap.quickTo(blobRef.current, 'rotation', {
      duration: 0.05,
    });
  }, [blobRef.current]);

  const getFramesLength = (frames) => frames[1] - frames[0];

  const rotateBlob = useCallback(
    (rotation, offset = 180) => {
      if (!rotation || !blobRef.current) {
        return;
      }
      if (Math.abs(rotation - lastDirection.current) < 0.01) {
        return;
      }
      // Converts to deg & modifies due to object base rotation
      const rotationDeg = -radiansToDegrees(rotation) + offset;
      quickRotateTo(-rotationDeg);
      lastDirection.current = rotation;
    },
    [quickRotateTo],
  );

  // Handles reset after bubbles are dropped
  const resetAll = useCallback(() => {
    if (!togetherAnim || !moveAnim) {
      return;
    }
    togetherAnim.setDirection(1);
    togetherAnim.firstFrame = 0;
    moveAnim.setDirection(1);
    moveAnim.firstFrame = 0;
  }, [togetherAnim, moveAnim]);

  const animateBlobCombine = useCallback(() => {
    resetAll();
    setAnimState(BLOB_ANIM_STATE.TOGETHER_COMBINE);
    togetherAnim.playSegments(
      [lastTogetherFrame.current, togetherAnim.animationData.op],
      true,
    );
  }, [togetherAnim]);

  const animateBlobTogether = useCallback(
    (distance) => {
      if (!togetherAnim) {
        return;
      }
      resetAll();
      if (distance > minTogetherDistance) {
        clearAnimState();
        return;
      }

      const frames = BLOB_FRAMES[BLOB_ANIM_STATE.TOGETHER];
      // The MIN distance value should show frame 0
      const percentDist =
        (minTogetherDistance - distance) / minTogetherDistance;
      const togetherFrame = Math.floor(percentDist * getFramesLength(frames));

      if (togetherFrame === lastTogetherFrame.current) {
        return;
      }
      setTogetherState();
      togetherAnim.goToAndStop(togetherFrame, true);
      lastTogetherFrame.current = togetherFrame;
    },
    [togetherAnim, minTogetherDistance],
  );

  const animateBlobBackTogether = useCallback(() => {
    if (!lastTogetherFrame.current || !togetherAnim) {
      return;
    }
    setTogetherState();
    togetherAnim.setDirection(-1);
    togetherAnim.play();
    lastTogetherFrame.current = 0;
  }, [togetherAnim]);

  const animateBlobApart = useCallback(
    (direction = -1) => {
      if (!togetherAnim) {
        return;
      }
      resetAll();
      setAnimState(BLOB_ANIM_STATE.TOGETHER_APART);
      togetherAnim.setDirection(direction);
      togetherAnim.goToAndStop(
        BLOB_FRAMES[BLOB_ANIM_STATE.TOGETHER_JIGGLE][1],
        true,
      );
      togetherAnim.playSegments(
        [
          BLOB_FRAMES[BLOB_ANIM_STATE.TOGETHER],
          BLOB_FRAMES[BLOB_ANIM_STATE.TOGETHER_JIGGLE],
        ],
        true,
      );
      lastTogetherFrame.current = 0;
    },
    [togetherAnim],
  );

  useEffect(() => {
    let timeout;
    if (isSpawned && togetherAnim) {
      clearAnimState();
      setTimeout(() => {
        animateBlobApart();
      }, 100);
    }

    return () => timeout && clearTimeout(timeout);
  }, [isSpawned, togetherAnim, animateBlobApart]);

  // Handles animation for dragged bucket
  useEffect(() => {
    if (!moveAnim) {
      return;
    }
    if (!isMoving) {
      if (!hasPlayedMoveAnimation.current) {
        return;
      }
      if (!isMoveAnimating) {
        clearAnimState();
        hasPlayedMoveAnimation.current = false;
      }
      setIsMoveAnimating(true);
      switchMovingState(BLOB_ANIM_STATE.MOVING_RETURN);
      const returnFrames = BLOB_FRAMES[BLOB_ANIM_STATE.MOVING_RETURN];
      moveAnim.playSegments(returnFrames, true);
      return;
    }

    // Only rotate in mouse direction if not animating together
    rotateBlob(mouseDirection, 90);
    if (isMoveAnimating || hasPlayedMoveAnimation.current) {
      return;
    }
    switchMovingState(BLOB_ANIM_STATE.MOVING);
    setIsMoveAnimating(true);
    moveAnim.playSegments(BLOB_FRAMES[BLOB_ANIM_STATE.MOVING], true);
    hasPlayedMoveAnimation.current = true;
  }, [moveAnim, isMoveAnimating, isMoving, mouseDirection, rotateBlob]);

  // Handles watching the mouse
  useEffect(() => {
    if (!togetherAnim || !blobRef.current || isCombining) {
      return;
    }
    togetherAnim.setDirection(1);
    if (shouldWatchMouse && movePos) {
      const boxCenter = findElementCenterPos(moveRef.current);
      // Angle between mouse & the center of the blob
      const angle = findDistanceDirection(movePos, boxCenter);
      rotateBlob(angle);
      // Try to animate together w/ dragged blob
      const distToMouse = findDistanceBetween(
        movePos,
        findElementCenterPos(blobRef.current),
      );
      animateBlobTogether(distToMouse);
      return;
    }
    if (
      isMoving &&
      closestBlobDistance !== null &&
      closestBlobDistance < minTogetherDistance
    ) {
      resetAll();
      animateBlobTogether(closestBlobDistance);
      return;
    }
    if (
      animState !== BLOB_ANIM_STATE.TOGETHER ||
      animState === BLOB_ANIM_STATE.TOGETHER_COMBINE
    ) {
      return;
    }
    animateBlobBackTogether();
    clearAnimState();
  }, [
    togetherAnim,
    animState,
    isCombining,
    isMoving,
    mouseDirection,
    movePos,
    shouldWatchMouse,
    minTogetherDistance,
    closestBlobDistance,
    rotateBlob,
    animateBlobTogether,
    animateBlobBackTogether,
  ]);

  useEffect(() => {
    if (!isGrowing && !isLeaving && !isCombining) {
      return;
    }

    animateBlobCombine();
  }, [isGrowing, isLeaving, isCombining, animateBlobCombine]);

  const playAnimSfx = () => {
    playCorrectSfx(sfxMap['correctFeedbackSfx']);
    setSfxTimeout(
      setTimeout(() => {
        playSfxInterrupt(itsAlivePayoffSfx, {
          onend: () => playSfxInterrupt(blinkingPayoffSfx),
        });
      }, 730),
    );
  };

  useEffect(() => {
    if (!isAlive || !aliveAnim) {
      return;
    }
    if (animState === BLOB_ANIM_STATE.ALIVE) {
      gameDispatch(setFeedbackState(FEEDBACK_STATE.PAYOFF_COMPLETE));
      return;
    }
    clearAnimState();
    aliveAnim.play();
    playAnimSfx();
  }, [aliveAnim, isAlive, animState]);

  useEffect(() => {
    if (blobDirection !== null) {
      rotateBlob(blobDirection);
    }
  }, [blobDirection]);

  useWillUnmount(() => {
    clearTimeout(sfxTimeout);
  });

  return (
    <StyledBlobContainer ref={blobRef}>
      <StyledBlob $isHidden={isTogetherAnim} ref={moveRef} />
      <StyledBlob $isHidden={!isTogetherAnim} ref={togetherRef} />
      <StyledBlob $isHidden={!isAlive} ref={aliveRef} />
    </StyledBlobContainer>
  );
};

Blob.propTypes = {
  shouldWatchMouse: PropTypes.bool.isRequired,
  isMoving: PropTypes.bool.isRequired,
  isSpawned: PropTypes.bool.isRequired,
  isLeaving: PropTypes.bool.isRequired,
  isGrowing: PropTypes.bool.isRequired,
  isCombining: PropTypes.bool.isRequired,
  isAlive: PropTypes.bool,
  // moveSpeed: PropTypes.number,
  mouseDirection: PropTypes.number,
  movePos: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  closestBlobDistance: PropTypes.number,
  minTogetherDistance: PropTypes.number,
  blobDirection: PropTypes.number,
};

Blob.defaultProps = {
  isAlive: false,
  blobDirection: null,
  mouseDirection: null,
  closestBlobDistance: null,
  minTogetherDistance: 100,
  // moveSpeed: 0,
  movePos: null,
};

export default Blob;
