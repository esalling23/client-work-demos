/*
  This file addresses a bug in Safari where the audio was not playing on iOS 15.2+
  The solution is to use html5 audio and have HTML5 Audio pool limited to 10.
 */

import { Howler } from 'howler';
import { isSafari } from '../utils/browser/isSafari';
import Logger from '../utils/Logger';

const HTML5_POOL_SIZE = 10;

if (isSafari) {
  Logger.info('Howler: Using Html5 AudioPlayer');

  Howler.html5PoolSize = HTML5_POOL_SIZE;

  Howler._releaseHtml5Audio = (audio) => {
    // only release to the pool if it's not full
    if (
      audio._unlocked &&
      Howler._html5AudioPool.length < Howler.html5PoolSize
    ) {
      Howler._html5AudioPool.push(audio);
    }
    return Howler;
  };

  const makeUnlockedAudio = () => {
    const audio = new window.Audio();
    audio._unlocked = true;
    audio._playedOnce = false;
    audio.onended = () => {
      if (!audio._playedOnce) {
        audio._playedOnce = true;
      }
    };
    return audio;
  };

  Howler._obtainHtml5Audio = () => {
    // If the pool is, look for a howl with an unlocked node that can be unloaded
    // Unload will release any unlocked audio nodes back to the pool
    if (!Howler._html5AudioPool.length) {
      const howls = Howler._howls;
      // eslint-disable-next-line no-plusplus
      for (let i = 0, l = howls.length; i < l; i++) {
        const howl = howls[i];
        if (
          !howl.playing() &&
          howl._sounds.every((s) => s && s._node) &&
          howl._sounds.some((s) => s._node._unlocked && s._node._playedOnce) // at least one audio node is unlocked
        ) {
          howl.unload();
          break;
        }
      }
    }
    let audio = Howler._html5AudioPool.pop();
    // Get the next object from the pool if one exists.

    if (!audio) {
      // Optimistically make unlocked audio
      audio = makeUnlockedAudio();

      // run a test audio and if it fails, be sure to set _unlocked=false on audio we returned
      const testPlay = new window.Audio().play();
      testPlay.catch(() => {
        Logger.warn(
          'HTML5 AudioPlayer pool exhausted, returned a potentially locked audio object.',
        );
        audio._unlocked = false;
      });
    }

    return audio;
  };

  const unlock = () => {
    Howler.usingWebAudio = false;
    Howler._html5AudioPool = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < Howler.html5PoolSize; i++) {
      Howler._html5AudioPool.push(makeUnlockedAudio());
    }
    document.removeEventListener('touchstart', unlock, true);
    document.removeEventListener('touchend', unlock, true);
    document.removeEventListener('click', unlock, true);
    document.removeEventListener('keydown', unlock, true);
  };

  document.addEventListener('touchstart', unlock, true);
  document.addEventListener('touchend', unlock, true);
  document.addEventListener('click', unlock, true);
  document.addEventListener('keydown', unlock, true);
} else {
  Logger.info('Howler: NOT using Html5 AudioPlayer');
}
