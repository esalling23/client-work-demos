import combineReducers from 'react-combine-reducers';
import {
  FEEDBACK_STATE,
  MAX_ITEM_ATTEMPTS,
  MODELING_COMPLETE,
  RESPONSE_STATE,
  SCREENS,
  SORTED_PLACES,
} from '../lib/constants';
import {
  combineAllBuckets,
  generateBrokenBuckets,
  generateBucketsFromNumbers,
  updateInteractingBuckets,
  fillInMissingBuckets,
} from '../lib/buckets';
import {
  checkIsNumBreakable,
  findAdjacentPlace,
  findLargestPlace,
} from '../lib/common';
import { ACTION_TYPE } from './actions';

export const initialState = {
  screen: {
    current: SCREENS.PROGRESS,
  },
  level: {
    id: 1,
    levelAttemptGuid: null,
    correctResponsesCount: 0,
    incorrectResponsesCount: 0,
    standardItems: [],
    progressAmount: 0,
  },
  item: {
    index: 0,
    attemptNumber: 1,
    responseState: RESPONSE_STATE.NOT_SET,
    answerModelingState: null,
    userResponse: null,
    isPayoff: false,
    feedbackState: null,
    feedbackPlace: null,
    addendIndex: 0,
  },
  game: {
    buckets: [],
    selectedBucket: null,
    incorrectCombineCount: 0,
    correctCombineCount: 0,
    breakCount: 0,
    didAttemptCombineBeforeBreak: false,
  },
};

const screenReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPE.SET_SCREEN:
      return {
        ...state,
        current: action.payload,
      };
    default:
      return state;
  }
};

const levelReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPE.RESET_LEVEL:
      return initialState.level;
    case ACTION_TYPE.SET_LEVEL_ID:
      return {
        ...state,
        id: action.payload.id,
        levelAttemptGuid: action.payload.guid,
      };
    case ACTION_TYPE.INITIALIZE_LEVEL:
      return {
        ...state,
        standardItems: action.payload,
      };
    case ACTION_TYPE.SCORE_ITEM:
      return {
        ...state,
        correctResponsesCount: state.correctResponsesCount + action.payload,
        incorrectResponsesCount:
          state.incorrectResponsesCount + !action.payload,
      };
    case ACTION_TYPE.COMPLETE_QUESTION: {
      const currProgress =
        state.progressAmount + 100 / state.standardItems.length;
      return {
        ...state,
        progressAmount: currProgress > 100 ? 100 : currProgress,
      };
    }

    default:
      return state;
  }
};

const gameReducer = (state, { type, payload }) => {
  switch (type) {
    case ACTION_TYPE.RESET_LEVEL:
    case ACTION_TYPE.RESET_GAME:
      return initialState.game;
    case ACTION_TYPE.INITIALIZE_ITEM:
      return {
        ...initialState.game,
        // Longhand so we pass proper values to class generator
        buckets: generateBucketsFromNumbers(payload, true),
      };
    case ACTION_TYPE.RETRY_ITEM:
      return {
        ...initialState.game,
        buckets: state.buckets,
        didAttemptCombineBeforeBreak: state.didAttemptCombineBeforeBreak,
      };
    case ACTION_TYPE.SET_BUCKETS:
      return {
        ...state,
        buckets: payload,
      };
    case ACTION_TYPE.SORT_BUCKETS:
      return {
        ...state,
        buckets: fillInMissingBuckets(state.buckets, payload).map((bucket) => ({
          ...bucket,
          gridPos: null,
        })),
      };
    case ACTION_TYPE.SET_SELECTED_BUCKET:
      return {
        ...state,
        selectedBucket: payload,
      };
    case ACTION_TYPE.BREAK_BUCKET:
      return {
        ...state,
        breakCount: state.breakCount + 1,
        selectedBucket: null,
        buckets: generateBrokenBuckets(state.buckets, payload),
      };
    case ACTION_TYPE.REMOVE_BROKEN_BUCKETS: {
      const resetBuckets = state.buckets
        .filter((b) => !b.isBreaking)
        .map((b) => ({ ...b, willMove: false, isSpawned: false }));
      return {
        ...state,
        buckets: resetBuckets,
      };
    }
    case ACTION_TYPE.REMOVE_LEAVING_BUCKETS: {
      if (
        state.buckets.every((bucket) => !bucket.isLeaving && !bucket.isGrowing)
      ) {
        return state;
      }
      return {
        ...state,
        buckets: updateInteractingBuckets(state.buckets),
      };
    }
    case ACTION_TYPE.INTERACT_BUCKETS:
      return {
        ...state,
        selectedBucket: null,
        correctCombineCount: state.correctCombineCount + 1,
        buckets: payload,
      };
    case ACTION_TYPE.INCORRECT_COMBINE: {
      const anyOriginalBreakable = state.buckets.find(
        (b) => b.isOriginal && checkIsNumBreakable(b.number),
      );
      return {
        ...state,
        incorrectCombineCount: state.incorrectCombineCount + 1,
        // If any buckets are original & can be broken
        // mark that user attempted combine before breaking all available buckets
        didAttemptCombineBeforeBreak: Boolean(anyOriginalBreakable),
      };
    }
    case ACTION_TYPE.COMBINE_BUCKETS:
      return {
        ...state,
        buckets: [combineAllBuckets(state.buckets)],
      };
    default:
      return state;
  }
};

const itemReducer = (state, { type, payload }) => {
  switch (type) {
    case ACTION_TYPE.SET_LEVEL_ID:
    case ACTION_TYPE.RESET_LEVEL:
      return initialState.item;
    case ACTION_TYPE.NEXT_QUESTION:
      return {
        ...state,
        ...initialState.item,
        index: state.index + 1,
      };
    case ACTION_TYPE.SUBMIT_RESPONSE:
      return {
        ...state,
        responseState: payload.responseState,
        feedbackState: payload.feedbackState,
      };
    case ACTION_TYPE.CONTINUE_FEEDBACK_PLACE: {
      const nextPlace = findAdjacentPlace(state.feedbackPlace);
      if (!nextPlace) {
        return {
          ...state,
          feedbackPlace: null,
          feedbackState: FEEDBACK_STATE.COMPLETE,
        };
      }
      return {
        ...state,
        feedbackPlace: nextPlace,
      };
    }
    case ACTION_TYPE.RESET_ADDEND_INDEX: {
      return {
        ...state,
        addendIndex: initialState.item.addendIndex,
      };
    }
    case ACTION_TYPE.CONTINUE_ADDEND_INDEX: {
      return {
        ...state,
        addendIndex: state.addendIndex + 1,
      };
    }
    case ACTION_TYPE.START_FEEDBACK_PLACE:
      return {
        ...state,
        feedbackPlace: payload,
        addendIndex: 0,
      };
    case ACTION_TYPE.SET_FEEDBACK_STATE:
      return {
        ...state,
        feedbackState: payload,
      };
    case ACTION_TYPE.FINISH_FEEDBACK_COMBINE: {
      // Prevent unnecessary state change
      if (state.feedbackState !== FEEDBACK_STATE.PREPARE_COMBINE) {
        return state;
      }
      return {
        ...state,
        feedbackState: FEEDBACK_STATE.COMBINE,
      };
    }
    case ACTION_TYPE.CONTINUE_MODELING: {
      if (state.answerModelingState === MODELING_COMPLETE) {
        return state;
      }
      const nextState = findAdjacentPlace(state.answerModelingState);
      if (!nextState) {
        return {
          ...state,
          answerModelingState: MODELING_COMPLETE,
          addendIndex: 0,
        };
      }
      return {
        ...state,
        addendIndex: 0,
        answerModelingState: nextState,
      };
    }
    case ACTION_TYPE.RETRY_ITEM: {
      const attempts = state.attemptNumber;
      return {
        ...state,
        responseState: RESPONSE_STATE.NOT_SET,
        answerModelingState:
          attempts >= MAX_ITEM_ATTEMPTS
            ? SORTED_PLACES[findLargestPlace(payload)]
            : null,
        attemptNumber: attempts + 1,
        userResponse: initialState.item.userResponse,
        feedbackState: initialState.item.feedbackState,
        feedbackPlace: initialState.item.feedbackPlace,
        addendIndex: initialState.item.addendIndex,
      };
    }
    case ACTION_TYPE.ADD_RESPONSE: {
      const newResponseValue = state.userResponse
        ? state.userResponse.toString() + payload
        : payload;
      return {
        ...state,
        userResponse: newResponseValue,
      };
    }
    case ACTION_TYPE.CLEAR_RESPONSE:
      return {
        ...state,
        userResponse: initialState.item.userResponse,
      };
    default:
      return state;
  }
};

const [combinedReducer, combinedState] = combineReducers({
  screen: [screenReducer, initialState.screen],
  level: [levelReducer, initialState.level],
  game: [gameReducer, initialState.game],
  item: [itemReducer, initialState.item],
});

export { combinedReducer, combinedState };
