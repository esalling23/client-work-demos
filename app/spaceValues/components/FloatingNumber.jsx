import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useWillUnmount } from 'rooks';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import useAudioSequence from '../../../hooks/useAudioSequence';
import { StyledDigit } from './StyledComponents';
import {
  FLOATING_SIZE,
  GAME_COLORS,
  SOLUTION_ROW_CLASS,
} from '../lib/constants';
import {
  findDeltaPos,
  findElementCenterPos,
  generateFloatingClass,
} from '../lib/common';
import { useGameStateCtx } from '../context';
import { continueFeedbackPlace } from '../context/actions';
import { sfxMap } from '../lib/assets/audioMap';

const StyledFloatingDigit = styled(StyledDigit)`
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  margin-left: 1rem;
  visibility: hidden;
  height: ${FLOATING_SIZE}px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  font-size: 34px;
  font-weight: 800;
  z-index: 2;
`;

// A floating digit for the purposes of feedback
const FloatingNumber = ({ value, place, isCorrect }) => {
  const { gameDispatch, playSfxInterrupt, unloadAudio } = useGameStateCtx();

  const [sfxTimeout, setSfxTimeout] = useState(null);

  const floatingRef = useRef(null);
  const isMoved = useRef(false);

  const { playAudio: playPlaceValuetFeedbackSfx } = useAudioSequence();

  const placeValueCorrectFeedbackSfx = sfxMap['placeValueCorrectFeedbackSfx']
  const placeValueIncorrectFeedbackSfx = sfxMap['placeValueIncorrectFeedbackSfx']

  useEffect(() => {
    const onComplete = () => gameDispatch(continueFeedbackPlace());
    if (!isMoved.current && floatingRef.current) {
      isMoved.current = true;

      // Get floating element & container positions
      const floatingClass = generateFloatingClass(place);
      const floatingContainer = window.document.querySelector(
        `.${floatingClass}`,
      );
      const containerIcon = window.document.querySelector(
        `.${floatingClass} > img`,
      );
      const startingPos = findElementCenterPos(floatingRef.current);
      const containerPos = findElementCenterPos(floatingContainer);

      // Get algorithm solution row position
      const solutionRow = window.document.querySelector(
        `.${SOLUTION_ROW_CLASS}`,
      );
      const solutionRowPos = findElementCenterPos(solutionRow);
      const startingDelta = findDeltaPos(solutionRowPos, startingPos);

      const finalPos = findDeltaPos(containerPos, startingPos);
      const tl = gsap.timeline();

      const playFloatingNumberSfx = () => {
        setSfxTimeout(
          setTimeout(() => {
            playSfxInterrupt(sfxMap['whooshSfx']);
          }, 1100),
        );
      };

      const playFeedbackSfx = () => {
        const sfx = isCorrect
          ? placeValueCorrectFeedbackSfx
          : placeValueIncorrectFeedbackSfx;
        playPlaceValuetFeedbackSfx(sfx);
      };

      const playIncorrect = () => {
        playFloatingNumberSfx();

        const wiggleTl = gsap.timeline({
          repeat: 2,
          defaults: { duration: 0.05 },
        });
        wiggleTl
          .to(floatingRef.current, {
            x: `+=5`,
            y: `-=5`,
          })
          .to(floatingRef.current, {
            x: `-=5`,
            y: `+=5`,
            onComplete: playFeedbackSfx,
          });
        return wiggleTl;
      };
      const playCorrect = () => {
        playFloatingNumberSfx();

        return gsap.to(
          containerIcon,
          {
            autoAlpha: 1,
            duration: 0.5,
          },
          '<',
        );
      };

      tl.set(floatingRef.current, {
        x: startingDelta.x,
        y: startingDelta.y,
        yPercent: 50,
      })
        .to(
          floatingRef.current,
          {
            autoAlpha: 1,
            duration: 0.2,
          },
          '<',
        )
        .to(floatingRef.current, {
          x: finalPos.x,
          y: finalPos.y,
          yPercent: 0,
          onComplete: () => {
            onComplete();
            return isCorrect ? playFeedbackSfx() : null;
          },
          duration: 1.5,
          delay: 1,
        })
        .to(floatingContainer, {
          css: {
            textAlign: 'center',
            backgroundColor: isCorrect ? GAME_COLORS.MAIN : 'transparent',
          },
          duration: 0.2,
        })
        .set(
          floatingRef.current,
          {
            css: {
              color: isCorrect ? GAME_COLORS.DARK : GAME_COLORS.MAIN,
            },
          },
          '<',
        );

      const nextStep = isCorrect ? playCorrect() : playIncorrect();

      tl.add(nextStep);
    }

    return () => gsap.killTweensOf(onComplete);
  }, []);

  useWillUnmount(() => {
    unloadAudio();
    clearTimeout(sfxTimeout);
  });

  return <StyledFloatingDigit ref={floatingRef}>{value}</StyledFloatingDigit>;
};

FloatingNumber.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  place: PropTypes.string.isRequired,
  isCorrect: PropTypes.bool.isRequired,
};

FloatingNumber.defaultProps = {};

export default FloatingNumber;
