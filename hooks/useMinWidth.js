import { useState, useEffect } from 'react';

 const useMinWidth = (minSize) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
		isValidSize: windowSize.width >= minSize,
		isLoaded: windowSize.width > 0
	};
}

export default useMinWidth