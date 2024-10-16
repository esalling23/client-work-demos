/* eslint-disable no-console */

/**
 * Use this Logger instead direct 'console' object to write text in console.
 *
 * Levels description:
 *  - logger.info() - use console.log() method to show text. Won't work for 'production' mode.
 *  - logger.warn() - use console.warn() method to show text. Won't work for 'production' mode
 *  - logger.error() - use console.error() method to show text. Works for 'production' mode too.
 *
 *  Use 'logger.setLevel(logger.ALL);' to allow all logging levels. Set by default in constructor.
 *  Use 'logger.setLevel(logger.info);' to allow logger.info() logs only.
 *  Use 'logger.setLevel(logger.warn);' to allow logger.warn() logs only.
 *  Use 'logger.setLevel(logger.error);' to allow logger.error() logs only.
 */
class Logger {
  WARN = 'warn';

  ERROR = 'error';

  INFO = 'info';

  ALL = 'all';

  DISABLED = 'disabled';

  #activeLevel;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.#activeLevel = this.ERROR;
    }

    this.#activeLevel = this.ALL;
  }

  warn(...messages) {
    if (!this.isLevelAvailable(this.WARN)) {
      return;
    }

    console.warn(`[WARNING] ${messages.join(', ')}`);
  }

  error(...messages) {
    if (!this.isLevelAvailable(this.ERROR)) {
      return;
    }

    console.error(`[ERROR] ${messages.join(', ')}`);
  }

  info(...messages) {
    if (!this.isLevelAvailable(this.INFO)) {
      return;
    }

    console.log(`[INFO] ${messages.join(', ')}`);
  }

  setLevel(level) {
    this.#activeLevel = level;
  }

  getLevel() {
    return this.#activeLevel;
  }

  isLevelAvailable(level) {
    if (process.env.NODE_ENV === 'production') {
      return level === this.ERROR;
    }

    if (this.#activeLevel === this.DISABLED) {
      return false;
    }

    return this.#activeLevel === this.ALL || this.#activeLevel === level;
  }
}

const logger = new Logger();

export default logger;
