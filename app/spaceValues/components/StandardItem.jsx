import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { useWillUnmount } from 'rooks';
import styled from 'styled-components';
import gsap from 'gsap';
import useAudioSequence from '@/hooks/useAudioSequence';
import { GAME_ID } from '../config';
import {
  GROUP_CLASS,
  FEEDBACK_STATE,
  MAX_INPUT_LENGTH,
  MODELING_COMPLETE,
  RESPONSE_STATE,
  PLACE_VALUE,
  FINAL_ADDEND_INDEX,
  FINAL_MODELING_STEP,
  GAME_COLORS,
  SORTED_PLACES,
} from '../lib/constants';
import { checkAvailableBuckets } from '../lib/buckets';
import {
  FlexRow,
  backgroundImage,
  StyledContinueButton,
} from './StyledComponents';
import { useGameStateCtx } from '../context';
import {
  getAnswerModelingState,
  getBuckets,
  getCurrentQuestion,
  getFeedbackState,
  getIsAnswerModeling,
  getIsFeedback,
  getIsItemCorrect,
  getUserResponse,
  getAddendIndex,
  getIsCombineFeedback,
  getResponseState,
  getCorrectResponsesCount,
  getItemAttemptNumber,
  getFeedbackPlace,
} from '../context/selectors';
import {
  clearResponse,
  continueModeling,
  initItem,
  itemAttempted,
  retryItem,
  setFeedbackState,
  startFeedbackPlace,
} from '../context/actions';
import Algorithm from './Algorithm';
import NumberPad from './NumberPad/NumberPad';
import {
  breakNumber,
  calcBaseTenDigit,
  checkIsNumBreakable,
  evaluateNumbers,
  findExpandedDigits,
  findLargestPlace,
  generateIndexArray,
} from '../lib/common';
import BucketController from './BucketController';
import FloatingNumber from './FloatingNumber';

import { sfxMap } from '../lib/assets/audioMap';
import svgMap from '../lib/assets/svgMap';

const StyledArea = styled(FlexRow)`
  margin: 0 20px;
  align-items: center;
  position: relative;
`;

const StyledLeftArea = styled(FlexRow)`
  margin: 0;
  width: 205px;
  margin-top: -30px;
  margin-left: 6px;
  align-items: center;
`;

const StyledStandardItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-content: center;
  width: 100%;
  height: 100%;
	font-weight: 800;
  color: ${GAME_COLORS.MAIN};
	${backgroundImage}
`;

const StyledInstruction = styled.h1`
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin: 0;
  margin-bottom: 5px;
	z-index: 10;
	position: relative;
`;

/**
 * This component manages a Standard Question item for this game. It includes the question, possible answers and logic
 * for handling responses and transitioning between various feedback and teaching modes
 */
const StandardItemComponent = ({ onDone }) => {
  /* 
  / Global Context
  */
  const {
    gameState,
    gameDispatch,
    unloadAudio,
    playSfxInterrupt,
    playIncorrectFeedbackAudio,
    isPractice,
  } = useGameStateCtx();
  const { numbers, targetResponse } = getCurrentQuestion(gameState);
  const isFeedback = getIsFeedback(gameState);
  const isCorrect = getIsItemCorrect(gameState);
  const buckets = getBuckets(gameState);
  const feedbackState = getFeedbackState(gameState);
  const isCombineFeedback = getIsCombineFeedback(gameState);
  const feedbackPlace = getFeedbackPlace(gameState);
  const userResponse = getUserResponse(gameState);
  const answerModelingState = getAnswerModelingState(gameState);
  const isModeling = getIsAnswerModeling(gameState);
  const addendIndex = getAddendIndex(gameState);
  const responseState = getResponseState(gameState);
  const correctResponseCount = getCorrectResponsesCount(gameState);
  const attemptNumber = getItemAttemptNumber(gameState);

  /*
  / Audio 
  */
  const { playAudio: playCorrectFeedbackSfx } = useAudioSequence();

  const sessionState = JSON.parse(
    sessionStorage.getItem(`${GAME_ID}_game_state`),
  );
  const incorrectFeedbackSfx = sfxMap['incorrectFeedbackSfx'];
  const actionBtnClickSfx = sfxMap['actionBtnClickSfx'];

  /*
  / Local values
  */
  const [isEarlyAttempt, setIsEarlyAttempt] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);

  const hasSubmittedEarly = useRef(false);
  const gameContents = useRef(null);
  const continueButtonClickedRef = useRef(false);

  const isFloatingFeedback = useMemo(
    () =>
      feedbackState === FEEDBACK_STATE.FLOATING_NUMBERS ||
      (!isCorrect && isFeedback && !isEarlyAttempt),
    [feedbackState, isCorrect, isFeedback, isEarlyAttempt],
  );

  const largestPlace = useMemo(() => {
    const numberArray = [...numbers, userResponse];
    return findLargestPlace(numberArray);
  }, [numbers, userResponse]);

  // Begins with hundreds
  const includedSortedPlaces = useMemo(
    () => SORTED_PLACES.slice(0, largestPlace + 1).reverse(),
    [largestPlace],
  );

  const expandedDigits = useMemo(() => findExpandedDigits(numbers), [numbers]);

  const solutionDigits = useMemo(
    () => breakNumber(evaluateNumbers(numbers)),
    [includedSortedPlaces, expandedDigits],
  );

  const responseDigits = useMemo(
    () => breakNumber(userResponse),
    [userResponse],
  );

  const continueButtonSrc = useMemo(() => {
		if (isCorrect) {
			return {
				base: svgMap.nextBtn,
				pressed: svgMap.nextBtnPressed
			}
		}
    return {
			base: svgMap.tryAgainBtn,
			pressed: svgMap.tryAgainBtnPressed
    };
  }, [isCorrect]);

  const availableBucketCount = useMemo(
    () => checkAvailableBuckets(buckets).length,
    [buckets],
  );

  const canSubmitResponse = useMemo(() => {
    if (buckets.length === 0) {
      return false;
    }

    if (availableBucketCount === 0) {
      setIsEarlyAttempt(false);
      return true;
    }
    return isEarlyAttempt;
  }, [buckets, isEarlyAttempt, availableBucketCount]);

  const instructionText = useMemo(() => {
    if (canSubmitResponse) {
      return 'Complete your mission by entering the sum.';
    }
    if (isCorrect) {
      return 'Mission Complete!';
    }

    return `Find the sum by combining like place values.`;
  }, [canSubmitResponse, isCorrect]);

  const disabledNumbers = useMemo(() => {
    if (!answerModelingState) {
      return [];
    }

    const allNumbers = generateIndexArray(10);
    const allowedNumber = breakNumber(targetResponse)[answerModelingState];
    if (allowedNumber !== undefined && allowedNumber !== null) 
			allNumbers.splice(allowedNumber, 1);
    return allNumbers;
  }, [
    answerModelingState,
    targetResponse,
    // isFeedback,
    addendIndex,
  ]);

  const floatingNumbersDisplay = useMemo(
    () =>
      floatingNumbers.map(({ key, number, place }) => (
        <FloatingNumber
          key={key}
          value={number}
          place={place}
          isCorrect={number === calcBaseTenDigit(solutionDigits, place)}
        />
      )),
    [floatingNumbers, solutionDigits],
  );

  /*
  / Methods
  */
  const handleSubmit = useCallback(() => {
    gameDispatch(
      itemAttempted(
        Number(userResponse),
        targetResponse,
        isEarlyAttempt,
        isPractice,
      ),
    );
    if (isEarlyAttempt) {
      hasSubmittedEarly.current = true;
      setIsEarlyAttempt(false);
    }
  }, [targetResponse, userResponse, isEarlyAttempt, isPractice]);

  const handleReset = () => {
    gameDispatch(initItem(numbers));
  };

  const handleContinue = useCallback(
    (forceCorrect = false) => {
      continueButtonClickedRef.current = true;
      playSfxInterrupt(actionBtnClickSfx, {
        onend: () => {
          continueButtonClickedRef.current = false;
          if (!forceCorrect && !isCorrect) {
            unloadAudio();
            gameDispatch(retryItem(buckets.map((b) => b.number)));
            return;
          }
          if (
            isCorrect &&
            !isModeling &&
            feedbackState === FEEDBACK_STATE.COMPLETE
          ) {
            gameDispatch(setFeedbackState(FEEDBACK_STATE.PAYOFF));
            return;
          }
          gsap.to(gameContents.current.children, {
            autoAlpha: 0,
            duration: 0.1,
            onComplete: onDone,
          });
        },
      });
    },
    [isCorrect, buckets, onDone],
  );

  const resetQuestion = () => {
    gsap.to(gameContents.current.children, { autoAlpha: 1, duration: 0.2 });
    hasSubmittedEarly.current = false;
    setIsEarlyAttempt(false);
    gameDispatch(clearResponse());
    handleReset();
  };

  useWillUnmount(() => {
    unloadAudio();
  });

  /*
  / Effects
  */
  useEffect(() => {
    resetQuestion();
  }, [numbers]);

  useEffect(() => {
    if (userResponse && isModeling) {
      gameDispatch(continueModeling());
    }
  }, [userResponse, isModeling]);

  // Handles allowing early attempt
  useEffect(() => {
    if (buckets.length === 0) {
      return;
    }
    const originalNumberCount = buckets.filter(
      (b) => b.isOriginal && checkIsNumBreakable(b.number),
    ).length;
    if (
      originalNumberCount === 0 &&
      !hasSubmittedEarly.current &&
      availableBucketCount > 0 &&
      !userResponse
    ) {
      setIsEarlyAttempt(true);
    }
  }, [buckets, availableBucketCount]);

  // Start incorrect feedback flow
  useEffect(() => {
    if (feedbackState === FEEDBACK_STATE.FLOATING_NUMBERS) {
      gameDispatch(startFeedbackPlace(includedSortedPlaces[0]));
    }
  }, [feedbackState, includedSortedPlaces]);

  useEffect(() => {
    if (userResponse === null) {
      setFloatingNumbers([]);
    }
  }, [userResponse]);

  useEffect(() => {
    if (
      feedbackState !== FEEDBACK_STATE.FLOATING_NUMBERS ||
      feedbackPlace === null
    ) {
      return;
    }
    setFloatingNumbers((curr) => [
      ...curr,
      {
        number: calcBaseTenDigit(responseDigits, feedbackPlace),
        place: feedbackPlace,
        key: uuidv4(),
      },
    ]);
  }, [feedbackPlace, feedbackState, responseDigits]);

  useEffect(
    () => () =>
      gameContents.current && gsap.killTweensOf(gameContents.current.children),
    [],
  );

  return (
    <StyledStandardItem isCentered ref={gameContents} $src={svgMap.gameBg}>
			{/* <GameBg className="absolute w-full h-full t-0 l-0 z-0"  /> */}
			<div className="my-20 d-contents">
				<StyledInstruction>{instructionText}</StyledInstruction>
				<FlexRow $isFullWidth className="z-10">
					<StyledLeftArea $asCol>
						<StyledInstruction>Your Mission</StyledInstruction>
						<Algorithm
							places={includedSortedPlaces}
							isSubmitDisabled={!canSubmitResponse}
						/>
						{floatingNumbersDisplay}
						<NumberPad
							keysDisabled={disabledNumbers || []}
							isDisabled={isFeedback || !canSubmitResponse}
							maxInputLength={MAX_INPUT_LENGTH}
							activeInputLength={userResponse?.toString().length}
							onSubmit={handleSubmit}
							onClear={() => gameDispatch(clearResponse())}
							canSubmit={
								userResponse !== null &&
								!isFeedback &&
								(!answerModelingState ||
									answerModelingState === MODELING_COMPLETE)
							}
						/>
					</StyledLeftArea>
					<StyledArea $isCentered $isFullWidth className={GROUP_CLASS}>
						<Algorithm
							places={includedSortedPlaces}
							isHidden={!isCorrect || !isCombineFeedback}
							isExpanded={true}
							isSubmitDisabled={!canSubmitResponse}
						/>
						<BucketController
							responseDigits={responseDigits}
							isFloatingFeedback={isFloatingFeedback}
						/>
						{isFeedback && (
							<StyledContinueButton
								disabled={
									continueButtonClickedRef.current ||
									(feedbackState !== FEEDBACK_STATE.COMPLETE &&
										feedbackState !== FEEDBACK_STATE.PAYOFF_COMPLETE &&
										feedbackState !== FEEDBACK_STATE.POST_COMBINE)
								}
								$src={continueButtonSrc}
								// Do NOT pass the event object using shorthand
								onClick={() => handleContinue()}
							>
								{isCorrect ? 'Next' : 'Try Again'}
							</StyledContinueButton>
						)}
					</StyledArea>
				</FlexRow>
			</div>
    </StyledStandardItem>
  );
};

StandardItemComponent.propTypes = {
  onDone: PropTypes.func.isRequired,
};

StandardItemComponent.defaultProps = {};

export default StandardItemComponent;
