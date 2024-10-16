import { keyframes, css } from 'styled-components';

export const popupKeyframes = keyframes`
  0% {
    transform: scale(0);
  }

  60% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
`;

export const popup = css`
  transform: scale(1);
  animation: ${popupKeyframes} 0.7s backwards;
  animation-delay: ${({ animationDelay }) => animationDelay || 0}ms;
  transition: all 0.15s ease-in-out;
  ${({ disabled }) => !disabled && '&:hover { transform: scale(1.1); }'}
`;
