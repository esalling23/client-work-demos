import React, { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import DragDropContext from './DragDropContext';

const Colors = {
  DARK_GRAY: '#6D7979',
  LIGHT_TEAL: '#D9FFFA',
  TEAL: '#019F8E',
  WHITE: '#ffffff',
};

const getBorderStyle = (isDragging, isHovering) => {
  if (isHovering) {
    return css`
      background-color: ${Colors.LIGHT_TEAL};
      border: 5px solid ${Colors.TEAL};

      .custom-droppable-outline {
        display: block;
      }
    `;
  }

  if (isDragging) {
    return css`
      background-color: ${Colors.WHITE};
      border: 5px dashed ${Colors.DARK_GRAY};

      .custom-droppable-outline {
        display: block;
      }
    `;
  }

  return css`
    .custom-droppable-outline {
      display: none;
    }
  `;
};

const StyledDroppable = styled.div`
  background-color: ${Colors.WHITE};
  border: 5px solid transparent;
  box-shadow: 0 0 0 3px ${Colors.WHITE};
  ${({ isDragging, isHovering }) => getBorderStyle(isDragging, isHovering)}
`;

const Droppable = ({
  className,
  children,
  id,
  index,
  onHoverIn,
  onHoverOut,
  lockedByType,
  disabled,
}) => {
  // DragDropContext for all droppables
  const {
    droppables,
    draggableType,
    isDragging,
    registerDroppable,
    unregisterDroppable,
  } = useContext(DragDropContext);

  const droppableRef = useRef(null);

  const droppable = droppables[id] || { id, isHovering: false };
  const { isHovering } = droppable;
  const isDisabled = disabled || (lockedByType && draggableType !== id);

  const registerWithPosition = () => {
    // Register this Droppable with the context
    const { x, y, width, height } =
      droppableRef.current.getBoundingClientRect();
    registerDroppable({
      id,
      index,
      x,
      y,
      width,
      height,
      lockedByType,
      disabled,
    });
  };

  useEffect(() => {
    registerWithPosition();
    window.addEventListener('resize', registerWithPosition);

    return () => {
      // Remove this Droppable from the context if the component unmounts
      unregisterDroppable(id);
      window.removeEventListener('resize', registerWithPosition);
    };
  }, [disabled]);

  useEffect(() => {
    if (isHovering) {
      if (isDisabled || (lockedByType && draggableType !== id)) return;
      onHoverIn(id);
    } else {
      onHoverOut(id);
    }
  }, [isHovering]);

  return (
    <StyledDroppable
      ref={droppableRef}
      className={className}
      id={id}
      isDragging={!isDisabled && isDragging}
      isHovering={!isDisabled && isHovering}
      draggable="false"
    >
      {children}
    </StyledDroppable>
  );
};

Droppable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  index: PropTypes.number.isRequired,
  onHoverIn: PropTypes.func,
  onHoverOut: PropTypes.func,
  lockedByType: PropTypes.bool,
  disabled: PropTypes.bool,
};

Droppable.defaultProps = {
  className: '',
  children: null,
  onHoverIn: () => {},
  onHoverOut: () => {},
  lockedByType: false,
  disabled: false,
};

export default Droppable;
