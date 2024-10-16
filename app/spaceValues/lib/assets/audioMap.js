import assetUrl from '@/lib/assetUrl'
const basePath = `${assetUrl}spaceValues`;
const sfxPath = `${basePath}/sfx`;

export const commonSfx = {
  hubLogout: `${sfxPath}/sfx_logout.mp3`,
  globalClick: `${sfxPath}/sfx_global_click.mp3`,
  pop: `${sfxPath}/sfx_pop.mp3`,
  glow: `${sfxPath}/sfx_glow.mp3`,
  magic: `${sfxPath}/sfx_magic.mp3`,
  reward: `${sfxPath}/sfx_reward.mp3`,
};

export const sfxMap = {
  correctFeedbackSfx: `${sfxPath}/sfx_alien_error_soft.mp3`,
  incorrectFeedbackSfx: `${sfxPath}/sfx_negative_global.mp3`,
  startStretchSfx: `${sfxPath}/sfx_slime_suck.mp3`,
  combineOrBreakSfx: `${sfxPath}/sfx_slime_squish.mp3`,
  numberPadActiveSfx: `${sfxPath}/sfx_galactic_wipe2.mp3`,
  numberBtnClickSfx: `${sfxPath}/sfx_click_btwn.mp3`,
  actionBtnClickSfx: `${sfxPath}/sfx_button_click2.mp3`,
  expandedFormAppears: `${sfxPath}/sfx_galactic_bloop.mp3`,
  itsAlivePayoffSfx: `${sfxPath}/sfx_creature_babble.mp3`,
  blinkingPayoffSfx: `${sfxPath}/sfx_spring-boing-03.mp3`,
  whooshSfx: `${sfxPath}/sfx_simple_whoosh_clip.mp3`,
  placeValueCorrectFeedbackSfx: `${sfxPath}/sfx_cowbell.mp3`,
  placeValueIncorrectFeedbackSfx: `${sfxPath}/sfx_next_item.mp3`,
};
