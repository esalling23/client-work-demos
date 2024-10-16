import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ActiveLevelButtonSVG from './ActiveLevelButtonSVG';
import { popup } from './StyledAnimations';
import { Z_INDEX } from '@/lib/constants/styles';

export const LEVEL_STATUSES = {
  ACTIVE: 'active',
  COMPLETE: 'complete',
  LOCKED: 'locked',
  AVAILABLE: 'available',
};

const StyledButton = styled.button`
  display: flex;
  min-width: 140px;
  height: 150px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  border: none;
  background: none;
  margin: 15px;
  padding-top: ${({ $needsTopPadding }) => ($needsTopPadding ? '20px' : '0')};
  align-items: flex-end;
  justify-content: center;
  ${popup}
`;

const Text = styled.div`
  z-index: ${Z_INDEX.GAME_SCREEN};
  font-family: Quicksand Bold;
  font-style: normal;
  font-weight: bold;
  font-size: ${({ $fontSize }) => $fontSize};
  line-height: 60px;
  color: #fff;
  align-self: center;
  position: relative;
  top: ${({ $isButtonActive }) => ($isButtonActive ? '-10px' : '10px')};
  opacity: ${({ $isButtonActive, $isPractice }) =>
    $isButtonActive || $isPractice ? '1' : '0.7'};
`;

const StatusIcon = styled.div`
  position: absolute;
  top: 3px;
  z-index: 1;
`;

/**
 * A button used to represent and launch a game level.
 * @param {string} id the level ID
 * @param {LEVEL_STATUSES} status the status of the level. Affects button styling and level availability.
 * @param {func} onClick the handler to be called when the LevelButton is clicked
 * @param {string} mainColor the main color of the level button
 * @param {string} shadowColor the shadow color of the level button
 * @param {number} animationDelay currently unused.
 * @param {string} tabIndex currently unused.
 * @param {node} children used to render an icon for onramp levels
 * @param {bool} isPractice whether or not we're in practice mode. Affects button styling and level availability.
 */
const LevelButton = (props) => {
  const {
    id,
    status,
    onClick,
    mainColor,
    shadowColor,
    animationDelay,
    tabIndex,
    children,
    isPractice,
  } = props;
  const fontSize = '48px';
  const isLevelActive = true;

  return (
    <StyledButton
      data-testid={`level-${id}`}
      animationDelay={animationDelay}
      tabIndex={tabIndex}
      disabled={!isLevelActive && status !== LEVEL_STATUSES.AVAILABLE}
      $isButtonActive={status === LEVEL_STATUSES.ACTIVE}
      onClick={onClick}
    >
      <div style={{ position: 'absolute' }}>
				<ActiveLevelButtonSVG
					fillColor={mainColor}
					shadowColor={shadowColor}
				/>
      </div>
      <Text
        $fontSize={fontSize}
        // active levels don't have an icon on the top of the button,
        // so the text needs extra padding to line up with that of the inactive buttons
        $needsTopPadding={isLevelActive}
        $isPractice={isPractice}
      >
        {children}
      </Text>
    </StyledButton>
  );
};

LevelButton.propTypes = {
  id: PropTypes.string.isRequired,
  tabIndex: PropTypes.string,
  onClick: PropTypes.func,
  status: PropTypes.oneOf(Object.values(LEVEL_STATUSES)),
  children: PropTypes.node,
  mainColor: PropTypes.string,
  shadowColor: PropTypes.string,
  animationDelay: PropTypes.number,
  isPractice: PropTypes.bool,
};

LevelButton.defaultProps = {
  children: null,
  mainColor: '#902269',
  shadowColor: '#000000',
  animationDelay: 0,
  tabIndex: '0',
  status: LEVEL_STATUSES.AVAILABLE,
  onClick: () => {},
  isPractice: true,
};

export default LevelButton;
