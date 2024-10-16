import { createContext } from 'react';

/**
 * Checks to see if a box is contained within another box by comparing the
 * four corners of both boxes.
 * @param {object} draggable { left, right, top, bottom }
 * @param {object} droppable { left, right, top, bottom }
 * @returns boolean true if contained, false if not contained
 */
const checkIntersection = (drag, drop) =>
  !(
    drop.left > drag.right ||
    drop.right < drag.left ||
    drop.top > drag.bottom ||
    drop.bottom < drag.top
  );

// Actions for DragDropContext
const REGISTER_DRAGGABLE = 'dragdrop/REGISTER_DRAGGABLE';
const UNREGISTER_DRAGGABLE = 'dragdrop/UNREGISTER_DRAGGABLE';
const RESET_DRAGGABLE = 'dragdrop/RESET_DRAGGABLE';
const START_DRAG = 'dragdrop/START_DRAG';
const DRAG = 'dragdrop/DRAG';
const KEYBOARD_DRAG = 'dragdrop/KEYBOARD_DRAG';
const END_DRAG = 'dragdrop/END_DRAG';
const REGISTER_DROPPABLE = 'dragdrop/REGISTER_DROPPABLE';
const UNREGISTER_DROPPABLE = 'dragdrop/UNREGISTER_DROPPABLE';

export const registerDraggable = (draggable) => ({
  type: REGISTER_DRAGGABLE,
  payload: draggable,
});

export const unregisterDraggable = (id) => ({
  type: UNREGISTER_DRAGGABLE,
  payload: id,
});

export const resetDraggable = (id) => ({
  type: RESET_DRAGGABLE,
  payload: id,
});

export const startDrag = (draggable) => ({
  type: START_DRAG,
  payload: draggable,
});

export const drag = ({ x, y }) => ({
  type: DRAG,
  payload: { x, y },
});

export const keyboardDrag = (increment) => ({
  type: KEYBOARD_DRAG,
  payload: increment,
});

export const endDrag = () => ({ type: END_DRAG });

export const registerDroppable = (droppable) => ({
  type: REGISTER_DROPPABLE,
  payload: droppable,
});

export const unregisterDroppable = (id) => ({
  type: UNREGISTER_DROPPABLE,
  payload: id,
});

export const initialState = {
  draggables: {},
  droppables: {},
  draggableType: null,
  isDragging: false,
  keyboardIndex: null,
  currentDraggableId: null,
  currentDroppableIds: [],
};

export const reducer = (state, { type, payload }) => {
  switch (type) {
    case REGISTER_DRAGGABLE:
      return {
        ...state,
        draggables: {
          ...state.draggables,
          [payload.id]: { ...payload, isDragging: false },
        },
      };
    case UNREGISTER_DRAGGABLE: {
      const newDraggables = { ...state.draggables };
      delete newDraggables[payload];
      return { ...state, draggables: newDraggables };
    }
    case START_DRAG: {
      const draggable = state.draggables[payload.id] || {};
      const { isKeyboard } = payload;

      return {
        ...state,
        draggables: {
          ...state.draggables,
          [payload.id]: { ...draggable, ...payload, isDragging: true },
        },
        draggableType: draggable.type,
        isDragging: true,
        keyboardIndex: isKeyboard ? 0 : null,
        currentDraggableId: payload.id,
      };
    }
    case DRAG: {
      const draggable = state.draggables[state.currentDraggableId];
      const {
        type: draggableType,
        originX,
        originY,
        mOffsetX,
        mOffsetY,
        width,
        height,
      } = draggable;
      const { x, y } = payload;

      const droppables = { ...state.droppables };
      const currentDroppableIds = [];
      Object.keys(droppables).forEach((id) => {
        const {
          x: dropX,
          y: dropY,
          width: dropWidth,
          height: dropHeight,
          lockedByType,
          disabled,
        } = droppables[id];

        const dragX = x - mOffsetX;
        const dragY = y - mOffsetY;

        if (lockedByType && draggableType !== id) {
          droppables[id].isHovering = false;
        } else if (
          !disabled &&
          checkIntersection(
            {
              left: dragX,
              right: dragX + width,
              top: dragY,
              bottom: dragY + height,
            },
            {
              left: dropX,
              right: dropX + dropWidth,
              top: dropY,
              bottom: dropY + dropHeight,
            },
          )
        ) {
          droppables[id].isHovering = true;
          currentDroppableIds.push(id);
        } else {
          droppables[id].isHovering = false;
        }
      });

      return {
        ...state,
        draggables: {
          ...state.draggables,
          [state.currentDraggableId]: {
            ...draggable,
            dx: x - originX - mOffsetX,
            dy: y - originY - mOffsetY,
          },
        },
        droppables,
        currentDroppableIds,
      };
    }
    case KEYBOARD_DRAG: {
      const draggable = state.draggables[state.currentDraggableId];
      const droppables = { ...state.droppables };
      if (droppables.length === 0) return state;

      const keys = Object.keys(droppables).filter(
        (key) =>
          !droppables[key].disabled &&
          (!droppables[key].lockedByType || draggable.type === key),
      );

      if (keys.length === 0) return state;

      const indexedDroppables = keys
        .sort((a, b) => {
          const { index: indexA } = droppables[a];
          const { index: indexB } = droppables[b];
          if (indexA < indexB) return -1;
          if (indexA > indexB) return 1;
          return 0;
        })
        .map((key) => {
          droppables[key].isHovering = false;
          return droppables[key];
        });

      let keyboardIndex = state.keyboardIndex + payload;
      if (keyboardIndex >= indexedDroppables.length) {
        keyboardIndex = 0;
      } else if (keyboardIndex < 0) {
        keyboardIndex = indexedDroppables.length - 1;
      }

      const droppable = indexedDroppables[keyboardIndex];
      droppable.isHovering = true;
      const currentDroppableIds = [droppable.id];

      const {
        x: dragX,
        y: dragY,
        width: dragWidth,
        height: dragHeight,
      } = draggable;
      const {
        x: dropX,
        y: dropY,
        width: dropWidth,
        height: dropHeight,
      } = droppable;
      const dx = dropX - dragX + dropWidth / 2 - dragWidth / 2;
      const dy = dropY - dragY + dropHeight - dragHeight / 2;

      return {
        ...state,
        draggables: {
          ...state.draggables,
          [state.currentDraggableId]: {
            ...draggable,
            dx,
            dy,
          },
        },
        droppables,
        keyboardIndex,
        currentDroppableIds,
      };
    }
    case END_DRAG: {
      const draggable = state.draggables[state.currentDraggableId];
      const droppables = { ...state.droppables };
      Object.keys(droppables).forEach((id) => {
        droppables[id].isHovering = false;
      });

      return {
        ...state,
        draggables: {
          ...state.draggables,
          [state.currentDraggableId]: {
            ...draggable,
            isDragging: false,
          },
        },
        droppables,
        draggableType: null,
        isDragging: false,
        keyboardIndex: null,
        currentDraggableId: null,
        currentDroppableIds: [],
      };
    }
    case RESET_DRAGGABLE: {
      const draggable = state.draggables[payload];
      return {
        ...state,
        draggables: {
          ...state.draggables,
          [payload]: {
            ...draggable,
            dx: 0,
            dy: 0,
          },
        },
      };
    }
    case REGISTER_DROPPABLE:
      return {
        ...state,
        droppables: {
          ...state.droppables,
          [payload.id]: { ...payload, isHovering: false },
        },
      };
    case UNREGISTER_DROPPABLE: {
      const newDroppables = { ...state.droppables };
      delete newDroppables[payload];
      return { ...state, droppables: newDroppables };
    }
    default:
      return initialState;
  }
};

const DragDropContext = createContext({
  draggables: {},
  droppables: {},
  draggableType: null,
  isDragging: false,
  currentDraggableId: null,
  currentDroppableIds: [],
  registerDraggable: () => {},
  unregisterDraggable: () => {},
  startDrag: () => {},
  keyboardDrag: () => {},
  endDrag: () => {},
  registerDroppable: () => {},
  unregisterDroppable: () => {},
});

export default DragDropContext;
