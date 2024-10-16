import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SCREEN_WIDTH, Z_INDEX } from '@/lib/constants/styles';

const StyledProgressDiv = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: ${SCREEN_WIDTH}px;
  height: 10px;
  background: #fff;
  z-index: ${Z_INDEX.PROGRESS_BAR};

  div {
    width: ${({ amount = 0 }) => amount}%;
    height: 100%;
    background: #30a392;
    transition: width 1s;
  }
`;

const StyledProgressBar = React.memo(({ amount, onAnimationComplete }) => {
  const ref = useRef();

  useEffect(() => {
    const curr = ref.current;
    curr.addEventListener('transitionend', onAnimationComplete);
    return () => {
      curr.removeEventListener('transitionend', onAnimationComplete);
    };
  }, [onAnimationComplete]);

  return (
    <StyledProgressDiv amount={amount} data-testid="styled-progress-bar">
      <div ref={ref} />
    </StyledProgressDiv>
  );
});

StyledProgressBar.propTypes = {
  amount: PropTypes.number.isRequired,
  onAnimationComplete: PropTypes.func.isRequired,
};

export default StyledProgressBar;
