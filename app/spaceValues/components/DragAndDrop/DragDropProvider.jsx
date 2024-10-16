import React, { useEffect, useReducer, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import DragDropContext, {
  initialState,
  reducer,
  registerDraggable,
  unregisterDraggable,
  startDrag,
  drag,
  keyboardDrag,
  endDrag,
  registerDroppable,
  unregisterDroppable,
  resetDraggable,
} from './DragDropContext';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

const DragDropProvider = ({ className, children }) => {
  const [
    {
      draggables,
      droppables,
      draggableType,
      isDragging,
      currentDraggableId,
      currentDroppableIds,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const mouseMoveTimer = useRef(null);
  const allowMouseMove = useRef(true);

  const currentDraggable = draggables[currentDraggableId];

  useEffect(
    () => () => {
      clearTimeout(mouseMoveTimer.current);
    },
    [],
  );

  const provided = useMemo(
    () => ({
      draggables,
      droppables,
      draggableType,
      isDragging,
      currentDraggableId,
      currentDroppableIds,
      registerDraggable: (draggable) => dispatch(registerDraggable(draggable)),
      unregisterDraggable: (id) => dispatch(unregisterDraggable(id)),
      startDrag: (draggable) => {
        draggable.onDragStart();
        dispatch(startDrag(draggable));
      },
      keyboardDrag: (increment) => {
        dispatch(keyboardDrag(increment));
      },
      endDrag: (isCanceled) => {
        if (currentDraggable) {
          if (isCanceled) {
            currentDraggable.onDragEnd([]);
          } else if (isDragging) {
            currentDraggable.onDragEnd(currentDroppableIds);
          }
          dispatch(endDrag());
        }
      },
      resetDraggable: (id) => {
        dispatch(resetDraggable(id));
      },
      registerDroppable: (droppable) => dispatch(registerDroppable(droppable)),
      unregisterDroppable: (id) => dispatch(unregisterDroppable(id)),
    }),
    [
      dispatch,
      draggables,
      droppables,
      draggableType,
      isDragging,
      currentDraggableId,
      currentDroppableIds,
    ],
  );

  const onMove = (e) => {
    if (!allowMouseMove.current || !isDragging) return;
    allowMouseMove.current = false;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    dispatch(drag({ x: clientX, y: clientY }));
    mouseMoveTimer.current = setTimeout(() => {
      allowMouseMove.current = true;
    }, 5);
  };

  const onEnd = () => {
    provided.endDrag();
  };

  return (
    <DragDropContext.Provider value={provided}>
      <Container
        className={className}
        onMouseMove={onMove}
        onTouchMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchEnd={onEnd}
      >
        {children}
      </Container>
    </DragDropContext.Provider>
  );
};

DragDropProvider.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

DragDropProvider.defaultProps = { className: '' };

export default DragDropProvider;
