import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { StyledPressButton } from '../StyledComponents';
import { GAME_COLORS } from '../../lib/constants';
import numBtn from '@/public/spaceValues/images/ui/button_number_up.svg?url'
import numBtnPressed from '@/public/spaceValues/images/ui/button_number_down.svg?url'

const StyledNumberButton = styled(StyledPressButton)`
  width: 52px;
  height: 54px;
  color: ${GAME_COLORS.DARK};
  font-size: 28px;
  margin: 0;
	z-index: 10;
`;

const NumberButton = ({ value, isDisabled, onClick }) => {
  const buttonSrc = {
		base: numBtn,
		pressed: numBtnPressed
  };
  return (
    <StyledNumberButton
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      $src={buttonSrc}
      data-testid="number-pad-num-key"
    >
      {value}
    </StyledNumberButton>
  );
};

NumberButton.propTypes = {
  value: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NumberButton;
