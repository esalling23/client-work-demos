import React from 'react';
import StyledProgressBar from '@/app/common/StyledProgressBar';
import { useGameStateCtx } from '../context';
import { getLevelProgress } from '../context/selectors';

/**
 * basic StandardView component that manages level loading and completing
 * @param {Object} props
 * @param {Function} props.onComplete - function to call when progress bar reaches 100% full
 * @returns {JSX.Element}
 */
const ProgressBar = ({ onAnimationComplete }) => {
  const { gameState } = useGameStateCtx();

  const progressAmount = getLevelProgress(gameState);

  return (
    <div style={{ zIndex: 20 }}>
      <StyledProgressBar
        amount={progressAmount}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
};

export default ProgressBar;
