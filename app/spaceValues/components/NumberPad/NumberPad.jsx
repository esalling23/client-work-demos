import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { commonSfx, sfxMap } from '../../lib/assets/audioMap'
import useAudioPlayer from '@/hooks/useAudioPlayer';
import NumberButton from './NumberButton';
import {
  addResponse,
} from '../../context/actions';
import { useGameStateCtx } from '../../context';
import {
  StyledPressButton,
  toggleDisabledOrHidden,
  toggleVisibility,
} from '../StyledComponents';
import {
  getIsAnswerModeling,
  getIsFeedback
} from '../../context/selectors';
import { GAME_COLORS } from '../../lib/constants';
import svgMap from '../../lib/assets/svgMap';

const numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3];

const StyledNumPad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 180px;
  height: 226px;
  padding: 40px 13px 16px;
  margin-top: 8px;
  border-top: 2px solid ${GAME_COLORS.MAIN};
  gap: 5px;
  justify-content: center;
  align-content: center;
  ${toggleVisibility};
`;

const StyledClearButton = styled(StyledPressButton)`
  grid-column: 2 / 4;
  width: 100%;
  margin: 0;
  height: auto;
`;

const StyledSubmitButton = styled(StyledPressButton)`
  height: 50px;
  width: 195px;
  right: auto;
  margin: 0;
  margin-top: 21px;
  ${toggleDisabledOrHidden};
`;

const NumberPad = ({
  isDisabled,
  keysDisabled,
  onSubmit,
  onClear,
  activeInputLength,
  maxInputLength,
  canSubmit,
}) => {
  const { gameDispatch, gameState, playSfxInterrupt } =
    useGameStateCtx();
  const isModeling = getIsAnswerModeling(gameState);
  const isFeedback = getIsFeedback(gameState);

  const { playAudio: playSubmitSfx } = useAudioPlayer();

  const numberPadActiveSfx = sfxMap.numberPadActiveSfx;
  const numberBtnClickSfx = sfxMap.numberBtnClickSfx;
  const actionBtnClickSfx = sfxMap.actionBtnClickSfx;

  const isSubmitDisabled = isDisabled || !canSubmit;

  // Map callback function for rendering groups of buttons
  const renderNumButton = useCallback(
    (val) => (
      <NumberButton
        key={uuidv4()}
        isDisabled={isDisabled || keysDisabled.includes(val)}
        onClick={() => {
          playSfxInterrupt(commonSfx.globalClick);
          if (activeInputLength < maxInputLength) {
            gameDispatch(addResponse(val));
          }
        }}
        value={val}
      />
    ),
    [
      keysDisabled,
      isDisabled,
      activeInputLength,
      maxInputLength
    ],
  );

  const internalClear = useCallback(() => {
    playSfxInterrupt(actionBtnClickSfx);
    onClear();
  }, [onClear]);

  const internalSubmit = useCallback(() => {
    playSubmitSfx(actionBtnClickSfx);
    onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    if (!isDisabled) {
      playSfxInterrupt(numberPadActiveSfx);
    }
  }, [isDisabled]);

  return (
    <>
      <StyledNumPad
        $isDisabled={isDisabled}
        $isHidden={isFeedback}
        data-testid="number-pad"
      >
        {/* Number buttons */}
        {numbers.map(renderNumButton)}
        {/* Zero is at the bottom */}
        {renderNumButton(0)}
        {/* Clear or submit */}
        <StyledClearButton
          data-testid="clear-button"
          disabled={isDisabled || !activeInputLength || isModeling}
          onClick={internalClear}
          type="button"
          $src={{
						base: svgMap.clearBtn,
						pressed: svgMap.clearBtnPressed
          }}
        >
          Clear
        </StyledClearButton>
      </StyledNumPad>
      <StyledSubmitButton
        data-testid="submit-button"
        disabled={isSubmitDisabled}
        $isHidden={isFeedback}
        onClick={internalSubmit}
        type="button"
        $src={{
					base: svgMap.doneBtn,
          pressed: svgMap.doneBtnPressed,
        }}
      >
        Done
      </StyledSubmitButton>
    </>
  );
};

NumberPad.propTypes = {
  keysDisabled: PropTypes.arrayOf(PropTypes.number),
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  activeInputLength: PropTypes.number,
  maxInputLength: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool,
};

NumberPad.defaultProps = {
  isDisabled: false,
  keysDisabled: [],
  activeInputLength: 0,
};

export default NumberPad;
