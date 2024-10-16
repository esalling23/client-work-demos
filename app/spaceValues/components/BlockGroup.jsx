import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { FlexRow } from './StyledComponents';
import {
  PLACE_VALUE,
  BLOCK_GUTTER,
  GAME_COLORS,
  ONES_GROUP_COUNT,
} from '../lib/constants';
import {
  breakNumber,
  calculateBlockSize,
  calcBlockOffset,
  calcBaseTen,
  generateIndexArray,
  calcBaseTenDigit,
  getBaseBlockSize,
} from '../lib/common';
import { useGameStateCtx } from '../context';
import {
  getAddendIndex,
  getAnswerModelingState,
  getCurrentQuestion,
} from '../context/selectors';

import hundredsBlockStack from '@/public/spaceValues/images/ui/block_hundred_stack.svg?url'

// Wrapper
const StyledBlockGroup = styled(FlexRow)`
  position: relative;
  align-items: flex-end;
  justify-content: center;
`;

const getOnesGroupSize = (baseSize) => baseSize + BLOCK_GUTTER;

// Group of blocks for each place (hundreds, tens, ones)
const StyledPlaceBlocks = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  pointer-events: none;
  ${({ $place, $blockCount }) => {
    if ($place === PLACE_VALUE.TENS) {
      return '';
    }
    const size = getOnesGroupSize(getBaseBlockSize(false));
    return `
      height: ${ONES_GROUP_COUNT * size}px;
      width: ${Math.ceil($blockCount / ONES_GROUP_COUNT) * size}px;
      flex-wrap: wrap;
      flex-direction: column;
      justify-content: flex-end;
    `;
  }};
  ${({ $place, $blockCount }) => {
    if ($place !== PLACE_VALUE.HUNDREDS) {
      return ``;
    }
    const { width } = calculateBlockSize($place);
    const offset = calcBlockOffset($blockCount);
    const total = offset + width;
    return `
      width: ${total}px;
      margin-left: -8px;
    `;
  }};
`;

// Individual hundreds, tens, or ones blocks
const StyledBlock = styled.div`
  background: ${({ $src }) =>
    `${$src ? 'transparent' : GAME_COLORS.MAIN} url('${$src}') no-repeat center`};
  background-size: contain;
  ${({ $isHighlighted }) => !$isHighlighted && `opacity: 0.4`};
  ${({ $place, $offset = 0 }) => {
    const { width, height } = calculateBlockSize($place, false);
    const horizontalOffset =
      $place === PLACE_VALUE.ONES && $offset >= ONES_GROUP_COUNT
        ? BLOCK_GUTTER / 2
        : BLOCK_GUTTER;
    return `
      margin: ${BLOCK_GUTTER / 2}px ${horizontalOffset}px;
      width: ${width}px;
      height: ${height}px;
    `;
  }};
  ${({ $offset = 0, $place }) => {
    if ($place !== PLACE_VALUE.HUNDREDS) {
      return ``;
    }
    const topLeft = calcBlockOffset($offset);
    return `
      position: absolute;
      bottom: ${topLeft}px;
      right: ${topLeft}px;
    `;
  }}
`;

// Renders blocks for a given number in a bucket
const BlockGroup = ({ number, forcePlace }) => {
  const { gameState } = useGameStateCtx();
  const addendIndex = getAddendIndex(gameState);
  const { numbers: equationNumbers } = getCurrentQuestion(gameState);
  const answerModelingState = getAnswerModelingState(gameState);

  const digits = breakNumber(number);

  const blockDigits = useMemo(() => {
    if (forcePlace) {
      const total = Object.keys(digits).reduce(
        (totalAcc, place) => totalAcc + calcBaseTenDigit(digits, place),
        0,
      );
      const baseTen = calcBaseTen(forcePlace);
      return { [forcePlace]: Math.floor(total / baseTen) };
    }
    return digits;
  }, [digits, forcePlace]);

  const generatePlaceBlocks = (place) => {
    const brokenEquation = equationNumbers.map((num) => breakNumber(num));

    return generateIndexArray(blockDigits[place]).map((i) => {
      const checkIsHighlighted = () => {
        if (
          answerModelingState !== place ||
          place === PLACE_VALUE.ONES ||
          addendIndex === 2
        ) {
          return true;
        }
        if (addendIndex === 0) {
          return i < brokenEquation[addendIndex][answerModelingState];
        }
        if (addendIndex === 1) {
          const valueDiff =
            blockDigits[answerModelingState] -
            brokenEquation[addendIndex][answerModelingState];
          return i >= valueDiff;
        }
        return true;
      };
      const checkNeedsAsset = () => {
        if (place === PLACE_VALUE.HUNDREDS && i !== 0) {
					return hundredsBlockStack.src
        }
        return '';
      };
      return (
        <StyledBlock
          key={uuidv4()}
          $offset={i}
          $src={checkNeedsAsset()}
          $place={forcePlace || place}
          $isHighlighted={checkIsHighlighted()}
        />
      );
    });
  };

  const allPlaceBlocks = useMemo(
    () =>
      Object.keys(blockDigits).map((place) => {
        const blockNum = blockDigits[place];
        if (blockNum <= 0) {
          return <span key={uuidv4()} />;
        }

        return (
          <StyledPlaceBlocks
            $place={forcePlace || place}
            $blockCount={blockDigits[place]}
            key={uuidv4()}
          >
            {generatePlaceBlocks(place)}
          </StyledPlaceBlocks>
        );
      }),
    [blockDigits, forcePlace],
  );

  return (
    <StyledBlockGroup>{allPlaceBlocks}</StyledBlockGroup>
  );
};

BlockGroup.propTypes = {
  number: PropTypes.number.isRequired,
  forcePlace: PropTypes.string,
};

BlockGroup.defaultProps = {
  forcePlace: null,
};

export default BlockGroup;
