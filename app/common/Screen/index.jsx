import styled, { css } from 'styled-components';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/lib/constants/styles';

export const FullScreenSize = css`
  height: ${SCREEN_HEIGHT}px;
  width: ${SCREEN_WIDTH}px;
`;

export const StyledFullScreen = styled.div`
  position: relative;
  ${FullScreenSize}
`;
