'use client'
import UAParser from 'ua-parser-js';

const { browser } = new UAParser()
  // .setUA(window.navigator.userAgent)
  .getResult();

export const isSafari = browser.name === 'Safari';

export const isMobileSafari = isSafari && navigator.maxTouchPoints > 1;
