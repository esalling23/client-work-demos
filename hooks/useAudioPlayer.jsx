import React, { useCallback, useRef, useState } from 'react';
import { useWillUnmount } from 'rooks';
import { AudioPlayer, parseHowlConfig } from '../lib/Audio';

const useAudioPlayer = () => {
  const howlRef = useRef();

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const unloadAudio = useCallback(() => {
    if (howlRef.current && howlRef.current._state !== 'unloaded') {
      howlRef.current.unload();
    }
  }, [howlRef]);

  const playAudio = useCallback(
    (...args) => {
      const {
        interrupt = false,
        continuePlayingAfterUnmount = false,
        ...howlConfig
      } = parseHowlConfig(...args);

      if (!interrupt && howlRef.current && howlRef.current.playing()) {
        return howlRef.current;
      }

      unloadAudio();

      const howl = new AudioPlayer({
        autoplay: true,
        ...howlConfig,
      });

      howl.on('play', () => {
        if (howlRef.current && !howlRef.current._willUnmount) {
          setIsAudioPlaying(true);
        }
      });

      howl.on('halt', () => {
        if (howlRef.current && !howlRef.current._willUnmount) {
          setIsAudioPlaying(false);
        }
      });

      howl._continuePlayingAfterUnmount = continuePlayingAfterUnmount;

      howlRef.current = howl;

      return howl;
    },
    [howlRef, setIsAudioPlaying, unloadAudio],
  );

  const playAudioPromise = useCallback(
    (...args) =>
      new Promise((resolve) => {
        const howl = playAudio(...args);
        howl.on('end', resolve);
        howl.on('loaderror', resolve);
        howl.on('playerror', resolve);
      }),
    [playAudio],
  );

  useWillUnmount(() => {
    if (howlRef.current) {
      howlRef.current._willUnmount = true;
      if (!howlRef.current._continuePlayingAfterUnmount) {
        unloadAudio();
      }
    }
  });

  return {
    playAudio,
    unloadAudio,
    isAudioPlaying,
    howlRef,
    playAudioPromise,
  };
};

export const withAudioPlayer = (Wrapped) =>
  React.forwardRef((props, ref) => {
    const audioProps = useAudioPlayer();

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Wrapped {...props} {...audioProps} ref={ref} />;
  });

export default useAudioPlayer;
