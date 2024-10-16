import styled, { css } from 'styled-components';
import { FLOATING_SIZE, GAME_COLORS } from '../lib/constants';

// Layers for z positioning
// const OVERLAY_Z = 10;
const BACKGROUND_Z = 0;
// const OBJECTS_Z = 1;

export const absoluteContainer = css`
  position: absolute;
  top: 0;
  left: 0;
`;

export const backgroundImage = css`
  background-image: url('${({ $src }) => $src}');
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
`;

export const toggleVisibility = css`
  ${({ $isHidden }) => {
    if ($isHidden) {
      return `
        opacity: 0;
        pointer-events: none;
      `;
    }
    return `
      opacity: 1;
    `;
  }}
  transition: opacity 0.5s ease;
`;

export const toggleOpacity = css`
  ${({ $isHidden }) => {
    if ($isHidden) {
      return `
      opacity: .3;
      pointer-events: none;
    `;
    }
    return `
    opacity: 1;
  `;
  }}
`;

export const toggleDisabledOrHidden = css`
  ${({ $isDisabled, disabled, $isHidden }) => {
    if (!$isHidden && ($isDisabled || disabled)) {
      return `
        opacity: .3;
        pointer-events: none;
      `;
    }
    if ($isHidden) {
      return `
        opacity: 0;
        pointer-events: none;
      `;
    }
    return `opacity: 1;`;
  }}
`;

export const StyledHiddenContainer = styled.div`
  visibility: hidden;
`;

export const StyledButton = styled.button`
  display: inline-block;
  margin: 4px;
  padding: 5px 10px;
  background: transparent;
  font-family: inherit;
  font-size: 1em;
  font-weight: bold;
  color: black;
  border: 2px solid currentcolor;
  border-radius: 5px;
  opacity: 1;
  transition: opacity 0.2s ease;
  ${({ $selected }) =>
    $selected &&
    css`
      color: lightblue;
      border-color: lightblue;
      border-style: inset;
    `};

  &:active {
    color: lightgray;
    border-style: inset;
  }

  &:disabled {
    color: darkgrey;
    opacity: 0;
    pointer-events: none;
  }
`;

export const StyledToggleDisplayDiv = styled.div`
  ${toggleVisibility};
`;

export const StyledLottieDiv = styled.div`
  ${absoluteContainer}
  pointer-events: none;
  z-index: ${({ $z }) => ($z === undefined || $z === null ? BACKGROUND_Z : $z)};
`;

export const StyledImageButton = styled.button`
  ${({ $size }) => css`
    width: ${$size || 100}px;
    height: ${$size || 100}px;
  `}
	position: relative;
  margin: 10px;
  border: none;
  background-size: contain;
  background-color: transparent;
  font-family: inherit;
  font-weight: 700;
  font-size: 28px;
  ${({ $src }) => {
    if (!$src) {
      return `
        border: 1px solid black;
        border-radius: 5px;
        background-color: white;
      `;
    }
    return `background-image: url(${$src}) no-repeat center center`;
  }};
  transition-property: transform, filter;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
  ${toggleDisabledOrHidden};

  &:disabled {
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    cursor: pointer;
  }
`;

// Image buttons that have a separate asset for a pressed/active state
export const StyledPressButton = styled(StyledImageButton)`
  ${({ $src, $isSelected }) => css`
		color: black;
    background-image: url(${($isSelected ? $src.pressed.src : $src.base.src) || ''});
		padding-bottom: 4px;

    &:active {
      background-image: url(${$src.pressed.src});
      padding-top: 2px;
      padding-bottom: 0;
    }
  `};
  background-repeat: no-repeat;
  background-color: transparent;
  background-position: center center;
`;

// Continue buttons are used to continue from feedback screens
export const StyledContinueButton = styled(StyledPressButton)`
  opacity: 1;
  transition: opacity 0.5s ease;
  position: absolute;
  left: 630px;
  top: 355px;
  height: 50px;
  width: 150px;
  z-index: 1;
  margin: 0;
  box-sizing: content-box;

  &:disabled {
    filter: none;
    opacity: 0;
  }
`;

export const buttonPosition = css`
  bottom: 30px;
  right: 15px;
`;

export const StyledPressContinueBtn = styled(StyledPressButton)`
  font-size: var(--font-size-large);
  position: absolute;
  ${buttonPosition}
`;

export const FlexRow = styled.div`
  display: flex;
  ${({ $asCol }) => $asCol && `flex-direction: column`};
  ${({ $isFullWidth }) => $isFullWidth && `width: 100%`};
  ${({ $isCentered }) =>
    $isCentered &&
    `
    justify-content: center;
    align-items: center;
  `}
`;

export const FlexCol = styled(FlexRow)`
  flex-direction: column;
  ${({ $isCentered }) =>
    $isCentered &&
    `
    justify-items: center;
    align-content: center;
  `}
`;

export const StyledDigit = styled.span`
  text-align: right;
	line-height: 1.1;
  ${({ $min = 1 }) => `
    min-width: ${$min}rem;
  `};
  ${({ $isHighlighted }) =>
    $isHighlighted && `border-bottom: 2px solid ${GAME_COLORS.MAIN};`}
`;

export const StyledCheckmark = styled.img`
  visibility: hidden;
  position: absolute;
  top: 100%;
  margin-top: 10px;
  width: 28px;
  height: 20px;
`;

export const StyledFloatingContainer = styled.div`
  margin-top: 28px;
  position: absolute;
  top: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${FLOATING_SIZE}px;
  height: ${FLOATING_SIZE}px;
  border: 2px solid;
  background: ${({ $isFilled }) =>
    $isFilled ? GAME_COLORS.MAIN : 'transparent'};
  border-radius: 10px;
  ${toggleVisibility};
`;

export const StyledItemContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;
