/**
 * returns the file extension portion of the whole file name.
 * @param {string} filename - the full name of the file.
 * @returns the extension of the file.
 */
const getFileExtension = (filename) => filename?.split('.').pop().toLowerCase();

export default getFileExtension;

// may be extensions supported by Howler.js
// https://github.com/goldfire/howler.js#codecsext
const SUPPORTED_AUDIO_EXTENSIONS = ['mp3'];

export const isSupportedAudioExtension = (src) =>
  SUPPORTED_AUDIO_EXTENSIONS.includes(getFileExtension(src));
