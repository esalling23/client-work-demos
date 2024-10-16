import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import LEVEL_TYPE from '@/lib/constants/levelTypes';
import config, { GAME_ID } from '../config';
import { getLevels } from '../context/selectors';
import { absoluteContainer, backgroundImage } from '../components/StyledComponents';

import progressBg from '@/public/spaceValues/images/other/progressScreenBg.svg'
import titleImage from '@/public/spaceValues/images/other/progressScreenTitle.svg'
import LevelButton from '@/app/common/ProgressScreen/LevelButton';
import { GAME_COLORS } from '../lib/constants';
import Image from 'next/image';
import svgMap from '../lib/assets/svgMap'

const StyledContent = styled.div`
  display: contents;
`;

const StyledTitle = styled.img`
  position: absolute;
  width: 400px;
  top: 160px;
`;

const StyledProgressScreenBg = styled.img`
  margin-top: 0;
  height: 100%;
  width: 100%;
  ${absoluteContainer};
`;

const SpaceValuesProgressScreen = ({ onLevelClick }) => {
  return (
    <StyledContent data-testid={`progress-screen-${GAME_ID}`}>
      <div className="flex justify-center w-full">
        <StyledProgressScreenBg 
					src={svgMap.progressScreen}
				/>
        <StyledTitle
          data-testid={`progress-title-${GAME_ID}`}
          title={config.displayName}
          as={titleImage}
        />
				<LevelButton 
					id={`level-1`}
					onClick={() => onLevelClick({ type: 'level', id: 1 })}
					mainColor={GAME_COLORS.ALT}
					shadowColor={GAME_COLORS.BUTTON_SHADOW}
					isPractice
				>Play</LevelButton>
      </div>
    </StyledContent>
  );
};

SpaceValuesProgressScreen.propTypes = {
  onLevelClick: PropTypes.func,
  lastLevelClicked: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
  }),
};

SpaceValuesProgressScreen.defaultProps = {
  onLevelClick: () => {},
  lastLevelClicked: { type: LEVEL_TYPE.LEVEL, id: 1 },
};

export default SpaceValuesProgressScreen;
