import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexCol, toggleVisibility } from './StyledComponents';
import { Droppable, Draggable } from './DragAndDrop/index';

const StyledInteractable = styled(FlexCol)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: inherit;
  background-color: transparent;
  box-shadow: none;

  &:disabled {
    border: 0;
  }

  ${toggleVisibility}
`;

// Interactive draggable or droppable
const Interactable = ({
  className,
  id,
  index,
  disabled,
  children,
  onDragStart,
  onDragEnd,
  onHoverIn,
  onHoverOut,
  isDraggable,
  isDraggedOver,
  isDropReset,
}) => {
  const generateComponent = useCallback(
    (isDroppable = false, contents = null) => (
      <StyledInteractable
        className={className}
        isDropReset={isDropReset}
        key={isDroppable ? 'droppable' : 'draggable'}
        as={isDroppable ? Droppable : Draggable}
        disabled={
          isDroppable ? isDraggable || disabled : !isDraggable || disabled
        }
        draggable="false"
        id={id}
        index={index}
        isDraggedOver={isDraggedOver}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        $isHidden={isDroppable ? isDraggable : false}
      >
        {contents}
      </StyledInteractable>
    ),
    [
      className,
      id,
      index,
      isDraggable,
      disabled,
      onDragStart,
      onDragEnd,
      onHoverIn,
      onHoverOut,
      isDropReset,
			isDraggedOver
    ],
  );

  const droppable = generateComponent(true);
  const draggable = generateComponent(
    false,
    <>
      {droppable}
      {children}
    </>,
  );

  return draggable;
};

Interactable.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onHoverIn: PropTypes.func.isRequired,
  onHoverOut: PropTypes.func.isRequired,
  isDraggedOver: PropTypes.bool,
  isDraggable: PropTypes.bool,
};
Interactable.defaultProps = {
  isDraggable: true,
  isDraggedOver: false,
  disabled: false,
  className: '',
};

export default Interactable;
