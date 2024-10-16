import React from 'react';
import { render, screen } from '@testing-library/react';
import NumberPad from './NumberPad';
import { GameStateCtxProvider } from '../../context';
import { MAX_INPUT_LENGTH } from '../../lib/constants';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('<NumberPad/>', () => {
  it('renders', () => {
    render(
      <GameStateCtxProvider>
        <NumberPad
          activeInputLength={1}
          maxInputLength={MAX_INPUT_LENGTH}
          keysEnabled={[1, 2, 3, 4, 5]}
          canSubmit={false}
          onConfirmChoice={() => {}}
          onClear={() => {}}
          onSubmit={() => {}}
        />
      </GameStateCtxProvider>,
    );
    expect(screen.getAllByTestId('number-pad')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('number-pad-num-key').length).toEqual(10);
  });
});
