import assetUrl from '@/lib/assetUrl'
const basePath = `${assetUrl}spaceValues/images`;
const uiPath = `${basePath}/ui`;
const otherPath = `${basePath}/other`;


const buttons = {
  numBtn: `${uiPath}/button_number_up.svg`,
  numBtnPressed: `${uiPath}/button_number_down.svg`,
  clearBtn: `${uiPath}/button_clear_up.svg`,
  clearBtnPressed: `${uiPath}/button_clear_down.svg`,
  doneBtn: `${uiPath}/button_done_up.svg`,
  doneBtnPressed: `${uiPath}/button_done_down.svg`,
  nextBtn: `${uiPath}/button_next_up.svg`,
  nextBtnPressed: `${uiPath}/button_next_down.svg`,
  tryAgainBtn: `${uiPath}/button_tryagain_up.svg`,
  tryAgainBtnPressed: `${uiPath}/button_tryagain_down.svg`,
};

const ui = {
  target: `${uiPath}/target_xl.svg`,
  inputBox: `${uiPath}/leftpanel_inputbox.svg`,
  pointer: `${uiPath}/pointer.svg`,
  hundredsBlockStack: `${uiPath}/block_hundred_stack.svg`,
  onrampTensBlock: `${uiPath}/block_ten_onramp.svg`,
  checkmark: `${uiPath}/symbol_check.svg`,
  aliveIndicator: `${uiPath}/box_life.svg`,
};

export default {
  progressScreen: `${otherPath}/progressScreenBg.svg`,
  title: `${otherPath}/progressScreenTitle.svg`,
  gameBg: `${basePath}/environments/background.svg`,
  ...buttons,
  ...ui,
};
