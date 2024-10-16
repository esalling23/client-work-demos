import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useWillUnmount } from 'rooks';
import { useGameStateCtx } from '../context/index';
import {
  getHasNextQuestion,
  getLevelId,
  getLevelItems,
} from '../context/selectors';
import {
  goToNextQuestion,
  initLevel,
  resetGame,
	completeQuestion
} from '../context/actions';
import ProgressBar from '../components/ProgressBar';
import StandardItem from '../components/StandardItem';
import { StyledItemContainer } from '../components/StyledComponents';

const LevelScreen = ({ goBack = () => {}, onDone = () => {} }) => {
  const { gameState, gameDispatch, unloadAudio } =
    useGameStateCtx();

  const hasNextQuestion = getHasNextQuestion(gameState);
  const levelId = getLevelId(gameState);

  const [isLevelComplete, setIsLevelComplete] = useState(false);

  useEffect(() => {
    if (levelId !== null) {
      const itemsInLevel = getLevelItems(gameState);
      gameDispatch(initLevel(itemsInLevel));
    }
  }, []);

  useEffect(() => {
    if (isLevelComplete) {
      onDone();
      setIsLevelComplete(false);
    }
  }, [isLevelComplete, gameDispatch, onDone]);

  useWillUnmount(() => {
    gameDispatch(resetGame());
    unloadAudio();
  });

  const onCompleteItem = () => {
    gameDispatch(resetGame());
		gameDispatch(completeQuestion())
  };

	const continueLevel = () => {
		if (hasNextQuestion) {
			gameDispatch(goToNextQuestion());
    } else {
      setIsLevelComplete(true);
    }
	}

  return (
    <>
      <StyledItemContainer>
        <StandardItem onDone={onCompleteItem} />
      </StyledItemContainer>
      <ProgressBar onAnimationComplete={continueLevel}/>
    </>
  );
};

LevelScreen.propTypes = {
  onDone: PropTypes.func,
};

LevelScreen.defaultProps = {
  onDone: () => {},
};

export default LevelScreen;
