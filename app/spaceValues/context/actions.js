import { v4 as uuidv4 } from 'uuid';
import { FEEDBACK_STATE, RESPONSE_STATE, SCREENS } from '../lib/constants';
import {
  markInteractingBuckets,
  parseBucketId,
} from '../lib/buckets';
import {
  getLevelId,
  getIsAnswerModeling,
  getBuckets,
} from './selectors';

export const ACTION_TYPE = {
  // Generic Actions
  SET_SCREEN: 'SET_SCREEN',
  SET_LEVEL_ID: 'SET_LEVEL_ID',
  INITIALIZE_LEVEL: 'INITIALIZE_LEVEL',
  RESET_LEVEL: 'RESET_LEVEL',
  RESET_GAME: 'RESET_GAME',
  COMPLETE_QUESTION: 'COMPLETE_QUESTION',
  NEXT_QUESTION: 'NEXT_QUESTION',
  SUBMIT_RESPONSE: 'SUBMIT_RESPONSE',
  ADD_RESPONSE: 'ADD_RESPONSE',
  CLEAR_RESPONSE: 'CLEAR_RESPONSE',
  INITIALIZE_ITEM: 'INITIALIZE_ITEM',
  SCORE_ITEM: 'SCORE_ITEM',
  RETRY_ITEM: 'RETRY_ITEM',
  // Game-specific actions
  SET_SELECTED_BUCKET: 'SET_SELECTED_BUCKET',
  SET_BUCKET_GROUPS: 'SET_BUCKET_GROUPS',
  SET_BUCKETS: 'SET_BUCKETS',
  SORT_BUCKETS: 'SORT_BUCKETS',
  BREAK_BUCKET: 'BREAK_BUCKET',
  REMOVE_BROKEN_BUCKETS: 'REMOVE_BROKEN_BUCKETS',
  REMOVE_LEAVING_BUCKETS: 'REMOVE_LEAVING_BUCKETS',
  INTERACT_BUCKETS: 'INTERACT_BUCKETS',
  COMBINE_BUCKETS: 'COMBINE_BUCKETS',
  INCORRECT_COMBINE: 'INCORRECT_COMBINE',
  FINISH_FEEDBACK_COMBINE: 'FINISH_FEEDBACK_COMBINE',
  SET_FEEDBACK_STATE: 'SET_FEEDBACK_STATE',
  CONTINUE_MODELING: 'CONTINUE_MODELING',
  START_FEEDBACK_PLACE: 'START_FEEDBACK_PLACE',
  CONTINUE_FEEDBACK_PLACE: 'CONTINUE_FEEDBACK_PLACE',
  RESET_ADDEND_INDEX: 'RESET_ADDEND_INDEX',
  CONTINUE_ADDEND_INDEX: 'CONTINUE_ADDEND_INDEX',
};

export const goToProgressScreen = () => ({
  type: ACTION_TYPE.SET_SCREEN,
  payload: SCREENS.PROGRESS,
});

export const goToStandardScreen = () => ({
  type: ACTION_TYPE.SET_SCREEN,
  payload: SCREENS.STANDARD_VIEW,
});

export const goToResultsScreen = () => ({
  type: ACTION_TYPE.SET_SCREEN,
  payload: SCREENS.RESULTS,
});

export const setLevelId = ({ id, guid }) => ({
  type: ACTION_TYPE.SET_LEVEL_ID,
  payload: {
    id,
    guid,
  },
});

export const initLevel = (items) => ({
  type: ACTION_TYPE.INITIALIZE_LEVEL,
  payload: items,
});

export const resetLevel = () => ({
  type: ACTION_TYPE.RESET_LEVEL,
});

export const resetGame = () => ({
  type: ACTION_TYPE.RESET_GAME,
});

export const initItem = (numbers) => ({
  type: ACTION_TYPE.INITIALIZE_ITEM,
  payload: numbers,
});

export const completeQuestion = () => ({
  type: ACTION_TYPE.COMPLETE_QUESTION,
});

export const goToNextQuestion = () => ({
  type: ACTION_TYPE.NEXT_QUESTION,
});

// Temporary response saved during gameplay
export const addResponse = (val) => ({
  type: ACTION_TYPE.ADD_RESPONSE,
  payload: val,
});

export const clearResponse = () => ({
  type: ACTION_TYPE.CLEAR_RESPONSE,
});

export const scoreItem = (isCorrect) => ({
  type: ACTION_TYPE.SCORE_ITEM,
  payload: Boolean(isCorrect),
});

export const submitResponse = (responseState, feedbackState) => ({
  type: ACTION_TYPE.SUBMIT_RESPONSE,
  payload: { responseState, feedbackState },
});

export const retryItem = (remainingBuckets) => ({
  type: ACTION_TYPE.RETRY_ITEM,
  payload: remainingBuckets,
});

export const startLevel = (level) => (dispatch) => {
  const guid = uuidv4();

  dispatch(setLevelId({ id: level, guid }));
};

export const setSelectedBucket = (index) => ({
  type: ACTION_TYPE.SET_SELECTED_BUCKET,
  payload: index,
});

export const breakBucket = (index) => ({
  type: ACTION_TYPE.BREAK_BUCKET,
  payload: index,
});

export const combineBuckets = () => ({
  type: ACTION_TYPE.COMBINE_BUCKETS,
});

export const interactBuckets =
  (dragBucketIndex, bestDroppable) => (dispatch, getState) => {
    const state = getState();
    const buckets = getBuckets(state);
    const droppableIndex = parseBucketId(bestDroppable);
    dispatch({
      type: ACTION_TYPE.INTERACT_BUCKETS,
      payload: markInteractingBuckets(buckets, dragBucketIndex, droppableIndex),
    });
  };

export const setBuckets = (buckets) => ({
  type: ACTION_TYPE.SET_BUCKETS,
  payload: buckets,
});

export const sortBuckets = (response) => ({
  type: ACTION_TYPE.SORT_BUCKETS,
  payload: response,
});

export const setFeedbackState = (newState) => ({
  type: ACTION_TYPE.SET_FEEDBACK_STATE,
  payload: newState,
});

export const startFeedbackPlace = (newState) => ({
  type: ACTION_TYPE.START_FEEDBACK_PLACE,
  payload: newState,
});

export const continueFeedbackPlace = () => ({
  type: ACTION_TYPE.CONTINUE_FEEDBACK_PLACE,
});

export const resetAddendIndex = () => ({
  type: ACTION_TYPE.RESET_ADDEND_INDEX,
});

export const continueAddendIndex = () => ({
  type: ACTION_TYPE.CONTINUE_ADDEND_INDEX,
});

export const finishFeedbackCombine = () => ({
  type: ACTION_TYPE.FINISH_FEEDBACK_COMBINE,
});

export const continueModeling = () => ({
  type: ACTION_TYPE.CONTINUE_MODELING,
});

export const itemAttempted =
  (response, correctResponse, isEarlyAttempt, isPractice) =>
  (dispatch, getState) => {
    const state = getState();
    const isAnswerModeling = getIsAnswerModeling(state);
    const isCorrect = response === correctResponse;

    if (isCorrect) {
      dispatch(scoreItem(!isAnswerModeling));
    } else if (!isEarlyAttempt) {
      dispatch(sortBuckets(response));
    }

    const responseState = isCorrect
      ? RESPONSE_STATE.CORRECT
      : RESPONSE_STATE.INCORRECT;
    const incorrectFeedbackState = isEarlyAttempt
      ? FEEDBACK_STATE.EARLY_INCORRECT
      : FEEDBACK_STATE.SCAFFOLD_SORT;
    const feedbackState = isCorrect
      ? FEEDBACK_STATE.PREPARE_COMBINE
      : incorrectFeedbackState;

    dispatch(submitResponse(responseState, feedbackState));
  };

export const removeBrokenBuckets = () => ({
  type: ACTION_TYPE.REMOVE_BROKEN_BUCKETS,
});

export const removeLeavingBuckets = () => ({
  type: ACTION_TYPE.REMOVE_LEAVING_BUCKETS,
});

export const countIncorrectCombine = () => ({
  type: ACTION_TYPE.INCORRECT_COMBINE,
});
