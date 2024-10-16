import { useCallback, useEffect, useRef } from 'react';

const useUnmountingTimeouts = () => {
  const timeoutsRef = useRef([]);

  const setUnmountingTimeout = useCallback((callback, duration = null) => {
    if (duration === null) {
      callback();
      return 0;
    }
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(
        (currentId) => currentId !== id,
      );
      callback();
    }, duration);

    timeoutsRef.current.push(id);

    return id;
  }, []);

  const clearUnmountingTimeouts = useCallback((id) => {
    if (id) {
      clearTimeout(id);
      timeoutsRef.current = timeoutsRef.current.filter(
        (currentId) => currentId !== id,
      );
      return;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearUnmountingTimeouts, []);

  return {
    setUnmountingTimeout,
    clearUnmountingTimeouts,
  };
};

export default useUnmountingTimeouts;
