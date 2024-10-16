import React, { useCallback, useState } from 'react';
import useAudioPlayer from './useAudioPlayer';
import useUnmountingTimeouts from './useUnmountingTimeouts';
import { parseHowlConfig } from '../lib/Audio';

const useAudioSequence = () => {
  const { playAudio, unloadAudio, isAudioPlaying } = useAudioPlayer();
  const { setUnmountingTimeout, clearUnmountingTimeouts } =
    useUnmountingTimeouts();
  const [inProgress, setInProgress] = useState(false);

  const playAudioSequence = useCallback(
    ([nextSrc, ...rest]) => {
      const current = nextSrc && parseHowlConfig(nextSrc);
      if (!current) {
        return;
      }

      if (!inProgress) {
        setInProgress(true);
      }

      const { addTimeout, ...howlConfig } = current;

      const howl = playAudio(howlConfig);

      if (!rest.length) {
        howl.on('halt', () => setInProgress(false));
        return;
      }

      const playNext = () => {
        setUnmountingTimeout(() => {
          playAudioSequence(rest);
        }, addTimeout);
      };

      howl.on('end', playNext);
    },
    [playAudio, setUnmountingTimeout],
  );

  const stopAudio = () => {
    setInProgress(false);
    unloadAudio();
  };

  return {
    setUnmountingTimeout,
    clearUnmountingTimeouts,
    playAudioSequence,
    unloadAudio: stopAudio,
    playAudio,
    isAudioPlaying,
    inProgress,
  };
};

export const withAudioSequence = (Wrapped) =>
  React.forwardRef((props, ref) => {
    const audioProps = useAudioSequence();

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Wrapped {...props} {...audioProps} ref={ref} />;
  });

export default useAudioSequence;
