import { getAvailableLevels, getLevelContent } from '../lib/content';
import {
  LEVEL_MASTERED_ITEMS,
  RESPONSE_STATE,
  MAX_ITEM_ATTEMPTS,
  FEEDBACK_STATE,
} from '../lib/constants';
import { evaluateNumbers } from '../lib/common';

export const getLevelId = (state) => state.level.id;

export const getCurrentScreen = (state) => state.screen.current;

export const getLevelAttemptGuid = (state) => state.level.levelAttemptGuid;

export const getItemIndex = (state) => state.item.index;

export const getItemAttemptNumber = (state) => state.item.attemptNumber;

export const getHasMoreItemAttempts = (state) =>
  getItemAttemptNumber(state) < MAX_ITEM_ATTEMPTS;

export const getResponseState = (state) => state.item.responseState;

export const getIsItemCorrect = (state) =>
  state.item.responseState === RESPONSE_STATE.CORRECT;

export const getIsItemAnswered = (state) =>
  state.item.responseState !== RESPONSE_STATE.NOT_SET;

export const getIsAnswerModeling = (state) =>
  state.item.answerModelingState !== null;

export const getAnswerModelingState = (state) => state.item.answerModelingState;

export const getLevelItems = (state) => {
  const id = getLevelId(state);
  return getLevelContent(id).items;
};

export const getCurrentQuestion = (state) => {
  const itemIndex = getItemIndex(state);
  const thisQuestion = getLevelItems(state)[itemIndex];
  return {
    ...thisQuestion,
    targetResponse: evaluateNumbers(thisQuestion.numbers, '+'),
  };
};

export const getHasNextQuestion = (state) => {
  const itemIndex = getItemIndex(state);
  const levelContent = getLevelItems(state);
  return levelContent.length > itemIndex + 1;
};

export const getLevels = () => getAvailableLevels();

export const getLevelItemsCount = (state) => getLevelItems(state)?.length;

export const getCorrectResponsesCount = (state) =>
  state.level.correctResponsesCount;

export const getIncorrectResponsesCount = (state) =>
  state.level.incorrectResponsesCount;

export const getIsCurrentLevelMastered = (state) => {
  const correctResponses = getCorrectResponsesCount(state);
  return correctResponses >= LEVEL_MASTERED_ITEMS;
};

export const getLevelProgress = (state) => state.level.progressAmount;

export const getUserResponse = (state) => state.item.userResponse;

export const getPreviousResponses = (state) => state.item.previousUserResponses;

export const getIsFeedback = (state) => state.item.feedbackState !== null;

export const getFeedbackState = (state) => state.item.feedbackState;

export const getIsPayoff = (state) =>
  getFeedbackState(state)?.includes(FEEDBACK_STATE.PAYOFF);

export const getIsCombineFeedback = (state) => {
  const feedbackState = getFeedbackState(state);
  const isPayoff = getIsPayoff(state);
  return !!(
    feedbackState === FEEDBACK_STATE.POST_COMBINE ||
    feedbackState === FEEDBACK_STATE.COMBINE ||
    feedbackState === FEEDBACK_STATE.COMPLETE ||
    isPayoff
  );
};

export const getFeedbackPlace = (state) => state.item.feedbackPlace;

export const getAddendIndex = (state) => state.item.addendIndex;

// Game Specific Selectors
export const getSelectedBucket = (state) => state.game.selectedBucket;

export const getBucketGroups = (state) => state.game.bucketGroups;

export const getGroupCount = (state) => getBucketGroups(state).length;

export const getBuckets = (state) => state.game.buckets;

export const getDidAttemptCombineBeforeBreak = (state) =>
  state.game.didAttemptCombineBeforeBreak;

export const getIncorrectCombineCount = (state) =>
  state.game.incorrectCombineCount;

export const getTotalCombineBreakCount = (state) =>
  getIncorrectCombineCount(state) +
  state.game.correctCombineCount +
  state.game.breakCount;
