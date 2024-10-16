import React, {
  useState,
  useReducer,
  useContext,
  createContext,
  useCallback,
  useMemo,
} from 'react';
import useAudioSequence from '../../../hooks/useAudioSequence';
import PropTypes from 'prop-types';
import { combinedReducer, combinedState } from './reducer';

export const GameStateCtx = createContext();

export const GameStateCtxProvider = ({ children }) => {
  const { isPractice } = { isPractice: true };
  const [gameState, dispatch] = useReducer(combinedReducer, combinedState);

  const gameDispatch = useCallback(
    (action) => {
      if (typeof action === 'function') {
        action(gameDispatch, () => gameState);
      } else {
        dispatch(action);
      }
    },
    [dispatch, gameState],
  );

  const { playAudio: playSfx, unloadAudio: unloadSfx } = useAudioSequence();

  const playSfxInterrupt = useCallback((asset, options) =>
    playSfx(asset, { interrupt: true, ...options }), [playSfx]);

  const playIncorrectFeedbackAudio = useCallback(() => {
    const sfxAsset = 'audio/sfx/incorrectFeedbackSfx.mp3';

    return playSfxInterrupt(sfxAsset);
  }, [playSfxInterrupt]);

  const unloadAudio = useCallback(() => {
    unloadSfx();
  }, [unloadSfx]);

  const contextValue = useMemo(
    () => ({
      gameState,
      gameDispatch,
      isPractice,
      unloadAudio,
      playSfx,
      playSfxInterrupt,
      playIncorrectFeedbackAudio,
    }),
    [
      gameState,
      gameDispatch,
      isPractice,
      unloadAudio,
			playSfx,
      playSfxInterrupt,
      playIncorrectFeedbackAudio,
    ],
  );

  return (
    <GameStateCtx.Provider value={contextValue}>
      {children}
    </GameStateCtx.Provider>
  );
};

GameStateCtxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGameStateCtx = () => useContext(GameStateCtx);

export const withGameContext = (WrappedComponent) => () =>
  (
    <GameStateCtxProvider>
      <WrappedComponent />
    </GameStateCtxProvider>
  );
