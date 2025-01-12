import React from 'react';
import PropTypes from 'prop-types';
import { useGameStateCtx } from '../context/index';
import {
  getCorrectResponsesCount,
  getLevelItemsCount,
} from '../context/selectors';
import svgMap from '../lib/assets/svgMap';

const ResultsScreen = ({ onDone }) => {
  const { gameState } = useGameStateCtx();

  const correct = getCorrectResponsesCount(gameState);
  const total = getLevelItemsCount(gameState);

  return (
    <div 
			className="w-full h-full font-bold bg-black text-white relative"
		>
			<img 
        src={svgMap.gameBg} 
        className="w-full h-full absolute t-0 l-0 z-0" 
        alt="game background for results screen"
      />
			<div className="z-10 flex flex-col gap-12 h-full w-full items-center justify-center relative">
				<h2 className="text-3xl">{correct} / {total}</h2>
				<button
					className="rounded bg-blue-500 hover:bg-blue-400 hover:scale-1.1 px-6 py-2 text-xl"
					onClick={onDone}
				>Continue</button>
			</div>
    </div>
  );
};

ResultsScreen.propTypes = {
  onDone: PropTypes.func,
};

ResultsScreen.defaultProps = {
  onDone: () => {},
};

export default ResultsScreen;
