'use client'

import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDidMount } from 'rooks';
import { StyledFullScreen } from '../common/Screen';
import { LEVEL_TYPE } from './lib/constants';
import { useGameStateCtx, withGameContext } from './context';
import {
  resetLevel,
  goToProgressScreen,
	goToResultsScreen,
	goToStandardScreen,
	startLevel,
} from './context/actions';
import { SCREENS } from './lib/constants';
import LevelScreen from './screens/LevelScreen';
import ResultsScreen from './screens/ResultsScreen';
import ProgressScreen from './screens/ProgressScreen';
import { GAME_ID } from './config';
import { setContent } from './lib/content';
import curriculumJson from '@/public/spaceValues/curriculum/spaceValues.curriculum.0.1.json'
import './styles.css'
import GameContainer from '../common/GameContainer';

const StyledScreen = styled(StyledFullScreen)`
  --font-family: 'Open Sans', serif;

  background-color: grey;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;
  flex-direction: column;
	font-family: var(--font-family);
`;

const App = () => {
  const { gameState, gameDispatch } = useGameStateCtx();
  const [lastLevelClicked, setLastLevelClicked] = useState({
    type: LEVEL_TYPE.LEVEL,
    id: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  const screen = isLoading ? SCREENS.LOADING : gameState.screen.current;

  useDidMount(() => {
    setContent(curriculumJson);
    setIsLoading(false);
  });

  const playGame = useCallback(
    (level) => {
      setIsLoading(true);
      const { id } = level;
      let levelId = Number.isNaN(Number(id)) ? id.toLowerCase() : id;
      setLastLevelClicked(level);
      gameDispatch(goToStandardScreen());
      gameDispatch(startLevel(levelId));
      setIsLoading(false);
    },
    [],
  );

  const goToStart = useCallback(() => {
    gameDispatch(resetLevel());
    gameDispatch(goToProgressScreen());
  }, []);

  const showResults = useCallback(() => {
      gameDispatch(goToResultsScreen());
  }, []);

  const screenComponent = useMemo(() => {
    switch (screen) {
			default:
      case SCREENS.RESULTS:
        return <ResultsScreen onDone={goToStart} />;

      case SCREENS.STANDARD_VIEW:
        return <LevelScreen
					goBack={goToStart}
					onDone={showResults}
				/>;

      case SCREENS.LOADING:
				return <p>Loading...</p>

			case SCREENS.PROGRESS:
			// default:
					return (
						<ProgressScreen
							onLevelClick={playGame}
							lastLevelClicked={lastLevelClicked}
						/>
					);
    }
  }, [
		screen,
		goToStart,
		showResults,
		playGame,
		lastLevelClicked
	]);

  return <GameContainer>
		<StyledScreen data-testid={GAME_ID}>{screenComponent}</StyledScreen>
	</GameContainer>;
};

export default withGameContext(App);
