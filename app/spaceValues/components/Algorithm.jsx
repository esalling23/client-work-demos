import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import gsap from 'gsap';
import {
  backgroundImage,
  FlexCol,
  FlexRow,
  StyledDigit,
  StyledToggleDisplayDiv,
  toggleVisibility,
} from './StyledComponents';
import {
  breakNumber,
  calcBaseTenDigit,
  checkIsNotNum,
  findExpandedDigits,
  findExpandedSolutionDigits,
} from '../lib/common';
import {
  getCurrentQuestion,
  getIsFeedback,
  getUserResponse,
  getFeedbackPlace,
  getAddendIndex,
  getAnswerModelingState,
  getIsPayoff,
} from '../context/selectors';
import { useGameStateCtx } from '../context';
import {
  FEEDBACK_STATE,
  GAME_COLORS,
  INDICATOR_CLASS,
  SOLUTION_ROW_CLASS,
} from '../lib/constants';
import {
  setFeedbackState,
} from '../context/actions';

import pointerSvg from '@/public/spaceValues/images/ui/pointer.svg'
import aliveIndicatorSvg from '@/public/spaceValues/images/ui/box_life.svg'
import inputBoxSvg from '@/public/spaceValues/images/ui/leftpanel_inputbox.svg?url';

const StyledAlgorithm = styled(FlexCol)`
  position: relative;
  visibility: hidden;
  font-size: 25px;
  font-weight: 700;
  height: 115px;
  ${({ $isExpanded, $isPayoff }) =>
    $isExpanded
      ? `
    position: absolute;
    width: auto;
    border: 4px solid ${$isPayoff ? 'transparent' : GAME_COLORS.MAIN};
    border-radius: 10px;
    padding: 10px;
    left: 73px;
    top: 90px;
    font-size: 24px;
    font-weight: 600;
    line-height: 26px;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    font-family: var(--font-family);
  `
      : `
    width: 88px;
    font-size: 
  `}
`;

const StyledTopContainer = styled(FlexRow)`
  border-bottom: 2px solid ${GAME_COLORS.MAIN};
  align-items: flex-end;
`;

const StyledBottomContainer = styled(FlexRow)`
  align-items: flex-end;
`;

const StyledRow = styled(FlexRow)`
  justify-content: flex-end;
  margin: 2px 0;
  ${({ $isExpanded }) =>
    $isExpanded &&
    css`
      > span {
        margin: 0 2px;
      }
    `};
  ${toggleVisibility}
`;

const StyledAdditionSymbol = styled(StyledDigit)`
  margin-right: 4px;
  ${({ $isExpanded }) => $isExpanded && 'margin-left: 4px;'};
`;

const StyledRowsContainer = styled(FlexCol)`
  width: ${({ $isExpanded }) => ($isExpanded ? 'auto' : '3rem')};
`;

const StyledResponseInput = styled(FlexRow)`
  width: 100%;
  height: 30px;
  margin-top: 8px;
  color: ${GAME_COLORS.DARK};
  ${backgroundImage};
  background-size: contain;
	position: relative;
  ${({ $isDisabled }) => $isDisabled && `opacity: 0.2`};
`;

const StyledIndicator = styled.img`
  width: 100px;
  height: 40px;
  position: absolute;
  left: 100%;
  top: 52px;
`;

const StyledPayoffImage = styled.img`
  ${'' /* width: 100%; */}
  height: 100%;
  position: absolute;
  top: 0;
	right: 0;
  justify-self: center;
  ${toggleVisibility};
`;

// Displays expanded or unexpanded 'algorithm' equation of adding 2 numbers
// Handles related feedback of floating numbers within solution row
const Algorithm = ({ isExpanded, isSubmitDisabled, isHidden, places }) => {
  const { gameDispatch, gameState } = useGameStateCtx();
  const { numbers, targetResponse } = getCurrentQuestion(gameState);
  const isFeedback = getIsFeedback(gameState);
  const userResponse = getUserResponse(gameState);
  const feedbackPlace = getFeedbackPlace(gameState);
  const addendIndex = getAddendIndex(gameState);
  const answerModelingState = getAnswerModelingState(gameState);
  const isPayoff = getIsPayoff(gameState);

  const algorithmRef = useRef(null);

  const expandedDigits = useMemo(() => findExpandedDigits(numbers), [numbers]);

  const solutionRow = useMemo(() => {
    if (!isExpanded) {
      return breakNumber(userResponse);
    }
    return findExpandedSolutionDigits(places, expandedDigits);
  }, [userResponse, expandedDigits]);

  useEffect(() => {
    if (!algorithmRef.current) {
      return;
    }
    if (isExpanded) {
      if (isHidden) {
        gsap.set(algorithmRef.current, { clearProps: 'all', xPercent: 0 });
        return;
      }
      gsap.fromTo(
        algorithmRef.current,
        {
          xPercent: -100,
          autoAlpha: 0,
        },
        {
          xPercent: 0,
          autoAlpha: 1,
          onComplete: () =>
            gameDispatch(setFeedbackState(FEEDBACK_STATE.COMPLETE)),
        },
      );
      return;
    }
    gsap.to(algorithmRef.current, {
      autoAlpha: isHidden ? 0 : 1,
    });
  }, [isExpanded, isHidden]);

  const generateRowDigits = useCallback(
    (digits, isSolutionRow, rowIndex = null) =>
      places.map((place, placeIndex) => {
        const digitValue = digits[place];
        const shouldBeUnderlined =
          digitValue !== 0 &&
          place === answerModelingState &&
          (rowIndex === addendIndex || addendIndex >= 2);
        const isHighlighted = isSolutionRow && feedbackPlace === place;
        if (checkIsNotNum(digits[place])) {
          return '';
        }
        const isNotFirstDigit = Boolean(digits[places[placeIndex - 1]]);
        const solutionDigit = calcBaseTenDigit(solutionRow, place);
        const solutionDigitCount = solutionDigit
          ? solutionDigit.toString().length
          : 1;
        return (
          <React.Fragment key={uuidv4()}>
            {isExpanded && isNotFirstDigit && (
              <StyledAdditionSymbol $isExpanded key={uuidv4()}>
                +
              </StyledAdditionSymbol>
            )}
            <StyledDigit
              $min={isExpanded ? solutionDigitCount : 1}
              $isHighlighted={isHighlighted}
              key={uuidv4()}
            >
              {isExpanded ? calcBaseTenDigit(digits, place) : digitValue}
            </StyledDigit>
          </React.Fragment>
        );
      }),
    [
      places,
      solutionRow,
      isExpanded,
      answerModelingState,
      addendIndex,
      feedbackPlace,
    ],
  );

  const generateRow = useCallback(
    (digits, isSolutionRow, rowIndex) => (
      <React.Fragment key={uuidv4()}>
        <StyledRow key={uuidv4()} $isExpanded={isExpanded}>
          {generateRowDigits(digits, isSolutionRow, rowIndex)}
        </StyledRow>
      </React.Fragment>
    ),
    [generateRowDigits, isExpanded],
  );

  const solutionRowDisplay = useMemo(
    () => (
      <StyledRowsContainer $isExpanded={isExpanded}>
        {generateRow(solutionRow, true)}
      </StyledRowsContainer>
    ),
    [generateRow, userResponse, isExpanded],
  );

  const algorithmTotalDisplay = useMemo(
    () => (
      <StyledRow $isHidden={isPayoff} $isExpanded isSolutionRow key={uuidv4()}>
        <StyledDigit key={uuidv4()}>=</StyledDigit>
        <StyledDigit key={uuidv4()}>{targetResponse}</StyledDigit>
      </StyledRow>
    ),
    [targetResponse, isPayoff],
  );

  const responseInputDisplay = useMemo(
    () => (
      <StyledResponseInput
        $isCentered
        $isExpanded={isExpanded}
        $isDisabled={isSubmitDisabled}
        key="user-response-input-display"
				$src={inputBoxSvg.src}
      >
        {userResponse ? solutionRowDisplay : ''}
      </StyledResponseInput>
    ),
    [isSubmitDisabled, userResponse, solutionRow, isExpanded, solutionRowDisplay],
  );

  const algorithmRowsDisplay = useMemo(() => {
    const rowsDisplay = expandedDigits.map((digits, i) =>
      generateRow(digits, false, i),
    );
    return (
      <StyledRowsContainer $isExpanded={isExpanded}>
        {rowsDisplay}
      </StyledRowsContainer>
    );
  }, [generateRow, expandedDigits, isExpanded]);

  const bottomNumberDisplay = useMemo(() => {
    const baseSolutionRow = (
      <>
        <StyledAdditionSymbol />
        {solutionRowDisplay}
      </>
    );
    if (isFeedback || isExpanded) {
      return baseSolutionRow;
    }
    return responseInputDisplay;
  }, [
    isExpanded,
    isFeedback,
    solutionRowDisplay,
    algorithmTotalDisplay,
    responseInputDisplay,
  ]);

  const algorithmContents = (
    <StyledToggleDisplayDiv $isHidden={isPayoff && isExpanded}>
      <StyledTopContainer>
        <StyledAdditionSymbol>+</StyledAdditionSymbol>
        {algorithmRowsDisplay}
      </StyledTopContainer>
      <StyledBottomContainer className={SOLUTION_ROW_CLASS}>
        {bottomNumberDisplay}
      </StyledBottomContainer>
    </StyledToggleDisplayDiv>
  );

  const payoffImage = (
    <StyledPayoffImage
			as={aliveIndicatorSvg}
      $isHidden={!isExpanded || !isPayoff}
    />
  );

  return (
    <StyledAlgorithm
      ref={algorithmRef}
      $isExpanded={isExpanded}
      $isPayoff={isPayoff}
    >
      {algorithmContents}
      {payoffImage}
      {isExpanded && (
        <>
          {algorithmTotalDisplay}
          <StyledIndicator
            className={INDICATOR_CLASS}
						as={pointerSvg}
          />
        </>
      )}
    </StyledAlgorithm>
  );
};

Algorithm.propTypes = {
  // If expanded, the digit includes additional 0's to indicate it's place
  // Ex: if the digit was a 5 in the tens place, it would be 50
  isExpanded: PropTypes.bool,
  isSubmitDisabled: PropTypes.bool,
  isHidden: PropTypes.bool,
  places: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Algorithm.defaultProps = {
  isHidden: false,
  isExpanded: false,
  isSubmitDisabled: true,
};

export default Algorithm;
