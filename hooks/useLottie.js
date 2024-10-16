import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

/**
 * A React Hook to initialize a Lottie animation json.
 * Takes a standard set of lottie options (https://airbnb.io/lottie/#/web?id=usage) as well as
 * an `initSegment` option that will jump to that segement and play.
 *
 * Returns both the lottie animation instance and the animation container.
 *
 * @param {Object} options Options to pass into lottie (see https://airbnb.io/lottie/#/web?id=usage)
 *
 * @returns [Object, Object]
 */

const useLottie = (options, optionalRef) => {
  const ref = useRef(null);
  const container = optionalRef ?? ref;

  const [animationInstance, setInstance] = useState(null); // set local state and setter

  const registerEvents = (anim, eventListeners) => {
    eventListeners.forEach((eventListener) => {
      anim.addEventListener(eventListener.eventName, eventListener.callback);
    });
  };

  const unregisterEvents = (anim, eventListeners) => {
    eventListeners.forEach((eventListener) => {
      anim.removeEventListener(eventListener.eventName, eventListener.callback);
    });
  };

  useEffect(() => {
    if (!container) {
      return null;
    }
    // set the lottie options
    const lottieOptions = { ...options, container: container.current };
    const anim = lottie.loadAnimation(lottieOptions);
    const events = options.events || [];

    // play initial segment if provided
    const playInitSegments = () => {
      if (options.initSegment) {
        anim.playSegments(options.initSegment, true);
      }
    };

    anim.addEventListener('DOMLoaded', playInitSegments);
    registerEvents(anim, events);
    setInstance(anim);

    container.current.setAttribute('aria-hidden', true);

    return () => {
      anim.removeEventListener('DOMLoaded', playInitSegments);
      unregisterEvents(anim, events);
      anim.destroy();
    };
  }, [container]);

  return [animationInstance, container];
};

export default useLottie;
