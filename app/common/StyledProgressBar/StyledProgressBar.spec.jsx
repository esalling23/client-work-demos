import React from 'react';
import { render, screen } from '@testing-library/react';
import StyledProgressBar from '.';

describe('<StyledProgressBar />', () => {
  it('renders', () => {
    render(<StyledProgressBar amount={50} onAnimationComplete={() => {}} />);
    const component = screen.getByTestId('styled-progress-bar');
    expect(component).toBeTruthy();
  });

  it('calls a function after animation is complete', () => {
    const mockOnAnimationCompleteFunc = jest.fn(async () => {
      expect(mockOnAnimationCompleteFunc).toHaveBeenCalled();
    });
    render(
      <div data-testid="progress-bar-test">
        <StyledProgressBar
          amount={100}
          onAnimationComplete={mockOnAnimationCompleteFunc}
        />
      </div>,
    );
  });
});
