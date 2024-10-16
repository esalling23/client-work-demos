import { OPERATOR } from '../../../lib/data/constants';
import { calcBlocksAcross, evaluateNumbers } from './common';

describe('utility functions', () => {
  describe('evaluateNumbers', () => {
    it('subtracts numbers', () => {
      const solution = evaluateNumbers([6, 2], OPERATOR.SUB);
      expect(solution).toEqual(4);
    });
    it('adds numbers', () => {
      const solution = evaluateNumbers([6, 2], OPERATOR.ADD);
      expect(solution).toEqual(8);
    });
  });
  describe('calcBlocksAcrss', () => {
    it('counts blocks', () => {
      const number = 398;
      const blocksAcross = calcBlocksAcross(number);
      expect(blocksAcross).toEqual(2 + 9 + 9 + 2);
    });
  });
});
