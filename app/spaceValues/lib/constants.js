export const MAX_ITEM_ATTEMPTS = 2;
export const LEVEL_MASTERED_ITEMS = 2;
export const MAX_LEVEL_ATTEMPTS = 3;
export const COMPLETE_AMOUNT = 100;
export const MAX_NUMBER_LENGTH = 5;

export const SCREENS = {
  LOADING: 'LOADING',
  PROGRESS: 'PROGRESS',
  STANDARD_VIEW: 'STANDARD_VIEW',
  RESULTS: 'RESULTS',
};

export const RESPONSE_STATE = {
  NOT_SET: 'NOT_SET',
  CORRECT: 'CORRECT',
  INCORRECT: 'INCORRECT',
};

export const GAME_COLORS = {
  MAIN: '#00F2F5',
  ALT: '#008299',
  DARK: '#020236',
  BUTTON_SHADOW: '#005A6A',
};

export const OPERATOR = {
  ADD: '+',
  SUB: '-',
};

export const PLACE_VALUE = {
  ONES: 'ONES',
  TENS: 'TENS',
  HUNDREDS: 'HUNDREDS',
};

export const PLACE_DIGIT = {
  [PLACE_VALUE.ONES]: 1,
  [PLACE_VALUE.TENS]: 2,
  [PLACE_VALUE.HUNDREDS]: 3,
};

export const QUESTION_TYPE_REPRESENTATION = {
  BASE_TEN_BLOCKS: 'Base Ten Blocks',
  ABSTRACT_REP_NUMBER: 'Abstract Rep- Number',
};

export const FINAL_ADDEND_INDEX = 2;
export const FINAL_MODELING_STEP = 4;

const placeKeys = Object.keys(PLACE_VALUE);
placeKeys.sort((a, b) => PLACE_DIGIT[a] - PLACE_DIGIT[b]);
export const SORTED_PLACES = placeKeys;

export const GRID_ROW_COUNT = 2;
export const GRID_COL_COUNT = 3;

export const BASE_BLOCK_SIZE = 4.5;
export const ONRAMP_BASE_BLOCK_SIZE = 8;
export const BLOCK_GUTTER = 3.6 / 2;

// Pixel sizes for boxes/bubbles based on contents
export const PLACE_BUCKET_SIZE = {
  [PLACE_VALUE.ONES]: 101.3,
  [PLACE_VALUE.TENS]: 150,
  [PLACE_VALUE.HUNDREDS]: 184,
};
export const XL_BUCKET_SIZE = 218.7;

export const BUCKET_SURROUND_PERCENT = 33;
export const FLOATING_SIZE = 80;
export const BASE_GRID_SIZE = XL_BUCKET_SIZE;

export const ONES_GROUP_COUNT = 5;
export const XL_BLOCK_COUNT_THRESHOLD = 23;

export const MAX_ANIM_SPEED = 100;

export const MAX_INPUT_LENGTH = SORTED_PLACES.length;

export const GROUP_CLASS = 'bucket-group-container';
export const BUCKET_CLASS = 'number-bucket';
export const SOLUTION_ROW_CLASS = 'algorithm-solution-row';
export const INTERACTABLE_CLASS = 'interactable';
export const INDICATOR_CLASS = 'algorithm-indicator';

export const MODELING_COMPLETE = 'COMPLETE';

export const FEEDBACK_STATE = {
  // Prepare to combine buckets - will trigger animations
  PREPARE_COMBINE: 'PREPARE_COMBINE',
  // Performs bucket combine - will update bucket state data
  COMBINE: 'COMBINE',
  // After combine is complete - triggers expanded algorithm
  POST_COMBINE: 'POST_COMBINE',
  // Early incorrect state
  EARLY_INCORRECT: 'EARLY_INCORRECT',
  // Scaffold for feedback - sorts buckets in place order
  SCAFFOLD_SORT: 'SCAFFOLD_SORT',
  // Triggers floating number incorrect feedback
  FLOATING_NUMBERS: 'FLOATING_NUMBERS',
  // Feedback is done - allows user to move on
  COMPLETE: 'COMPLETE',
  // Payoff moment for correct items
  PAYOFF: 'PAYOFF',
  // Payoff moment is finished
  PAYOFF_COMPLETE: 'PAYOFF_COMPLETE',
};

export const LEVEL_TYPE = {
  LEVEL: 'level',
  ONRAMP: 'onramp',
};

export const Z_INDEX = {
  GAME_HEADER: 2,
  GAME_SCREEN: 1,
  PROGRESS_BAR: 20,
};

export const COLOR = {
  BACKGROUND: '#002120',
};

export const INIT_GAME = 'METAGAME:INIT_GAME';
export const GAME_PROGRESS = 'METAGAME:GAME_PROGRESS';

export const ENV = {
  SANDBOX: 'sandbox',
  DEV: 'dev',
  CI: 'ci',
  STAGING: 'staging',
  PROD: 'production',
};

export const ALL_ENVS = Object.values(ENV);