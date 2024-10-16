import React from 'react';
import StyledProgressBar from '.';

export default {
  title: 'StyledProgressBar',
  component: StyledProgressBar,
};

const Template = (args) => <StyledProgressBar {...args} />;

export const HalfProgress = Template.bind({});

HalfProgress.argTypes = {
  amount: { description: 'number' },
  onAnimationComplete: { description: 'function' },
};

HalfProgress.args = {
  amount: 50,
  onAnimationComplete: () => {},
};

export const CompletedProgress = Template.bind({});

CompletedProgress.args = {
  amount: 100,
  onAnimationComplete: () => {},
};
