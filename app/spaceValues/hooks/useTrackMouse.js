import { useEffect, useRef, useState } from 'react';
import { MAX_ANIM_SPEED } from '../lib/constants';

// Threshold for changing rotation
const ROT_THRESHOLD = 1;

export default (shouldTrack) => {
  const lastMousePos = useRef(null);
  const lastMouseMoveTime = useRef(null);

  const [mouseSpeed, setMouseSpeed] = useState(0);
  const [mousePos, setMousePos] = useState(null);
  const [mouseDirection, setMouseDirection] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!shouldTrack) {
        return;
      }
      const now = Date.now();
      // Handle touch event
      let mouseEvent = e;
      if (e.touches) {
        const touch = e.touches[0];
        mouseEvent = touch;
      }
      const setTimePos = (time) => {
        lastMouseMoveTime.current = time || Date.now();
        lastMousePos.current = {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
        };
      };
      if (!lastMousePos.current) {
        setTimePos();
      }

      // Find change in position
      const { x: lastX, y: lastY } = lastMousePos.current;
      const deltaX = lastX - mouseEvent.clientX;
      const deltaY = lastY - mouseEvent.clientY;

      // Calculate speed
      const deltaT = now - lastMouseMoveTime.current;
      const totalMovement = Math.max(deltaX, deltaY);
      const speed = Math.min(
        0,
        Math.max(Math.round((totalMovement / deltaT) * 1000), MAX_ANIM_SPEED),
      );
      setMouseSpeed(speed);

      // Calculate rotation
      if (
        Math.abs(deltaX) > ROT_THRESHOLD ||
        Math.abs(deltaY) > ROT_THRESHOLD
      ) {
        setMouseDirection(Math.atan2(deltaY, deltaX));
      }

      // Set new values for next calculation
      setMousePos(lastMousePos.current);
      setTimePos(now);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [shouldTrack]);

  return {
    mouseSpeed,
    mousePos,
    // The angle at which the mouse is moving
    mouseDirection,
  };
};
