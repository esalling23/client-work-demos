import React, {
  Children,
  cloneElement,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import DragDropContext from './DragDropContext';
import TabMenu from './TabMenu';

const StyledDraggable = styled.div.attrs(
  ({
    position: { x, y },
    isDragging,
    isAnimated,
    lockedDimension,
    snapModifier,
  }) => ({
    style: {
      zIndex: isDragging ? 1 : 0,
      transform: `
        translate(
          ${lockedDimension === 'x' ? 0 : snapModifier(x)}px, 
          ${lockedDimension === 'y' ? 0 : snapModifier(y)}px
        )
        rotate(${isDragging && isAnimated ? 3 : 0}deg)
      `,
      transition:
        x === 0 && y === 0 && isAnimated
          ? 'transform 0.35s cubic-bezier(0.64, 0.57, 0.67, 1.53)'
          : '',
    },
  }),
)`
  z-index: -1;
  user-select: none;
`;

const Draggable = ({
  className,
  children,
  id,
  type,
  label,
  onClick,
  onAudio,
  onDragStart,
  onDragEnd,
  disabled,
  isAnimated,
  lockedDimension,
  snapModifier,
  isDropReset,
}) => {
  // DragDropContext for all draggables
  const {
    draggables,
    droppables,
    registerDraggable,
    unregisterDraggable,
    startDrag,
    keyboardDrag,
    endDrag,
    resetDraggable,
  } = useContext(DragDropContext);

  const draggableRef = useRef(null);
  const originRef = useRef({ x: 0, y: 0 });
  const clickRef = useRef(null);

  const [isTabMenu, setIsTabMenu] = useState(false);

  const draggable = draggables[id] || { id, isDragging: false };
  const { dx = 0, dy = 0, isDragging = false } = draggable;

  const handleDragEnd = (droppablesList) => {
    onDragEnd(draggable, droppablesList);
  };

  const registerWithPosition = () => {
    // Register this Draggable with the context
    const { x, y } = draggableRef.current.getBoundingClientRect();
    originRef.current = { x, y };
    registerDraggable({ id, type, x, y });
  };

  useEffect(() => {
    registerWithPosition();
    window.addEventListener('resize', registerWithPosition);

    return () => {
      // Remove this Draggable from the context if the component unmounts
      unregisterDraggable({ id });
      window.removeEventListener('resize', registerWithPosition);
    };
  }, []);

  const startDragging = ({ clientX, clientY }) => {
    setIsTabMenu(false);

    const { current: element } = draggableRef;
    const { x, y, width, height } = element.getBoundingClientRect();
    originRef.current = { x, y };

    startDrag({
      ...draggable,
      mOffsetX: clientX - x,
      mOffsetY: clientY - y,
      originX: originRef.current.x,
      originY: originRef.current.y,
      width,
      height,
      onDragStart,
      onDragEnd: handleDragEnd,
    });
  };

  const startKeyboardDragging = () => {
    setIsTabMenu(false);
    draggableRef.current.focus();
    const availableDroppables = Object.keys(droppables).filter(
      (key) =>
        // Droppable must NOT be disabled
        !droppables[key].disabled &&
        // Droppable must either not be locked by its type OR if it is locked,
        // the Droppable's key (id) must be the same as the type of this
        // Droppable
        (!droppables[key].lockedByType || key === type),
    );
    if (availableDroppables.length === 1) {
      handleDragEnd(availableDroppables);
    } else {
      const { width, height } = draggableRef.current.getBoundingClientRect();

      startDrag({
        ...draggable,
        isKeyboard: true,
        mOffsetX: 0,
        mOffsetY: 0,
        originX: originRef.current.x,
        originY: originRef.current.y,
        width,
        height,
        onDragStart,
        onDragEnd: handleDragEnd,
      });
      keyboardDrag(0);
    }
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    if (e.button || e.touches?.length > 1) {
      clickRef.current = false;
      endDrag(true);
      return;
    }
    clickRef.current = true;
  };

  const handleMouseMove = (e) => {
    if (disabled || !clickRef.current) return;
    clickRef.current = false;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    if (e.touches?.length > 1) {
      return;
    }
    startDragging({ clientX, clientY });
  };

  const handleMouseUp = () => {
    if (disabled) return;
    if (clickRef.current) {
      clickRef.current = false;
      onClick(draggable);
    }
  };

  /**
   * Handles keyboard controls for Draggable elements. Uses the
   * Space, Enter, Escape, and Up Arrow keys.
   * @param {event} e event object passed on by onkeydown
   */
  const handleKeyDown = (e) => {
    if (disabled) return;
    // Deconstruct the key from the event so that the event can be
    // used to cancel default behavior as necessary
    const { key } = e;
    switch (key) {
      case ' ':
      case 'Enter': {
        if (isDragging) {
          // Prevent the default so users that are zoomed in aren't
          // flung all over the place by this default behavior while
          // trying to use the Draggable
          e.preventDefault();
          // End the drag because that's what these controls should do
          endDrag();
        } else if (onAudio) {
          setIsTabMenu(true);
          draggableRef.current.blur();
        } else {
          startKeyboardDragging();
        }
        break;
      }
      case 'Tab':
      case 'Escape': {
        if (isDragging) {
          // End the drag after removing any Droppable that has been
          // "hovered" because this is canceling a drag
          endDrag(true);
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        if (isDragging) {
          // Prevent the default so users that are zoomed in aren't
          // flung all over the place by this default behavior while
          // trying to use the Draggable
          e.preventDefault();
          keyboardDrag(1);
        }
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        if (isDragging) {
          // Prevent the default so users that are zoomed in aren't
          // flung all over the place by this default behavior while
          // trying to use the Draggable
          e.preventDefault();
          keyboardDrag(-1);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleCancelTabMenu = (key) => {
    if (key === 'Tab') {
      // If the element is tabbed away from (including a Shift+Tab),
      // then the menu should be hidden
      setIsTabMenu(false);
      draggableRef.current.focus();
    } else if (key === 'Escape') {
      setIsTabMenu(false);
      draggableRef.current.focus();
    }
  };

  useEffect(() => {
    if (isDropReset) {
      resetDraggable(id);
    }
  }, [isDropReset]);

  return (
    <>
      <StyledDraggable
        ref={draggableRef}
        className={className}
        id={id}
        tabIndex={disabled || isTabMenu ? -1 : 0}
        aria-label={label}
        aria-hidden={disabled}
        aria-grabbed={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onKeyDown={handleKeyDown}
        position={{ x: dx, y: dy }}
        isDragging={isDragging}
        isAnimated={isAnimated}
        lockedDimension={lockedDimension}
        snapModifier={snapModifier}
        draggable="false"
      >
        {Children.map(children, (child) =>
          cloneElement(child, { draggable: false }),
        )}
      </StyledDraggable>
      {isTabMenu && (
        <TabMenu
          onAudio={() => {
            onAudio(draggable);
          }}
          onSelect={startKeyboardDragging}
          onCancel={handleCancelTabMenu}
        />
      )}
    </>
  );
};

Draggable.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  onAudio: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  isDropReset: PropTypes.bool,
  isAnimated: PropTypes.bool,
  disabled: PropTypes.bool,
  lockedDimension: PropTypes.string,
  snapModifier: PropTypes.func,
};

Draggable.defaultProps = {
  className: '',
  children: null,
  type: null,
  label: '',
  onClick: () => {},
  onAudio: null,
  onDragStart: () => {},
  onDragEnd: () => {},
  isDropReset: false,
  isAnimated: true,
  disabled: false,
  lockedDimension: null,
  snapModifier: (val) => val,
};

export default Draggable;
