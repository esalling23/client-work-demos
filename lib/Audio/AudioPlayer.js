import { Howler, Howl } from 'howler';
import { isSafari } from '../utils/browser/isSafari';
import { isSupportedAudioExtension } from '../utils/getFileExtension';

let isHtml5Mode = false;

const setHtml5Mode = (bool = false) => {
  if (isSafari) {
    return;
  }
  Howler.usingWebAudio = bool;
  isHtml5Mode = bool;
};

class AudioPlayer extends Howl {
  constructor(options = {}) {
    // remove custom options and call Howl constructor with the rest
    const { onhalt, onwillunload, unloadOnEnd = true, ...delegated } = options;
    super({ html5: isHtml5Mode, ...delegated });

    // add 'halt' and 'willunload' event listener
    this.unloadOnEnd = unloadOnEnd;
    this._onhalt = onhalt ? [{ fn: onhalt }] : [];
    this._onwillunload = onwillunload ? [{ fn: onwillunload }] : [];

    this.unload = this.unload.bind(this);
    this.onend = this.onend.bind(this);
    this.onstop = this.onstop.bind(this);
    this.onpause = this.onpause.bind(this);

    this.on('end', this.onend);
    this.on('stop', this.onstop);
    this.on('pause', this.onpause);
  }

  onend() {
    this._emit('halt', null);
    if (this.unloadOnEnd) {
      this.unload();
    }
  }

  onstop() {
    this._emit('halt', null);
  }

  onpause() {
    this._emit('halt', null);
  }

  unload() {
    // emit 'willunload' event and call parent unload
    this._emit('willunload', null);

    super.unload();
  }
}

const parseHowlConfig = (audio, options = {}) => {
  const config =
    audio && audio.src
      ? audio
      : {
          ...options,
          src: audio,
        };

  if (!Array.isArray(config.src)) {
    config.src = [config.src];
  }

  if (
    !config.format &&
    config.src.some((url) => !isSupportedAudioExtension(url))
  ) {
    config.format = ['mp3'];
  }

  return config;
};

export { Howler, Howl, AudioPlayer, parseHowlConfig, setHtml5Mode };
