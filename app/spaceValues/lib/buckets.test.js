import { PLACE_VALUE } from '../../../lib/data/constants';
import {
  checkAvailableBuckets,
  fillInMissingBuckets,
  findInteractableBuckets,
  findMissingPlaces,
  generateBrokenBuckets,
  generateBucketObject,
  generateBucketsFromNumbers,
  parseBucketId,
  sortBucketsByPlace,
  updateInteractingBuckets,
} from './buckets';

describe('utility functions', () => {
  describe('parseBucketId', () => {
    it('returns a bucket key', () => {
      expect(parseBucketId('bucket-1')).toEqual('1');
      expect(parseBucketId('bucket-n')).toEqual('n');
    });
  });
  describe('generateBucketObject', () => {
    it('generates a bucket object with params', () => {
      const bucket = generateBucketObject(5, null, true);
      expect(bucket.number).toEqual(5);
      expect(bucket.forcePlace).toEqual(null);
      expect(bucket.isOriginal).toBeTruthy();
    });
  });
  describe('generateBrokenBuckets', () => {
    it('generates buckets creates from breaking a given bucket', () => {
      const numbers = [10, 125, 1];
      const buckets = generateBucketsFromNumbers(numbers);

      const newBuckets = generateBrokenBuckets(buckets, buckets[1].key);

      // new buckets
      expect(newBuckets.find((b) => b.number === 100)).toBeTruthy();
      expect(newBuckets.find((b) => b.number === 20)).toBeTruthy();
      expect(newBuckets.find((b) => b.number === 5)).toBeTruthy();
      expect(newBuckets.find((b) => b.number === 10)).toBeTruthy();
      expect(newBuckets.find((b) => b.number === 1)).toBeTruthy();

      // old buckets
      expect(newBuckets.find((b) => b.number === 125).isBreaking).toBeTruthy();
    });
  });
  describe('updateInteractingBuckets', () => {
    it('removes the correct bucket', () => {
      const numbers = [1, 6, 10, 125];
      const buckets = generateBucketsFromNumbers(numbers);
      buckets[1].isGrowing = true;
      buckets[0].isLeaving = true;

      const newBuckets = updateInteractingBuckets(buckets);
      const newGrownBucket = newBuckets[0];
      expect(newGrownBucket.isGrowing).toBeFalsy();
      expect(newGrownBucket.number).toEqual(7);
      expect(newGrownBucket.gridPos).toBeTruthy();
    });
  });
  describe('checkAvailableBuckets', () => {
    it('returns empty array if all buckets are different place values', () => {
      const numbers = [10, 100, 1];
      const buckets = generateBucketsFromNumbers(numbers);
      expect(checkAvailableBuckets(buckets)).toEqual([]);
    });
    it('returns empty array if there is only 1 remaining bucket', () => {
      const numbers = [10];
      const buckets = generateBucketsFromNumbers(numbers);
      expect(checkAvailableBuckets(buckets)).toEqual([]);
    });
  });
  describe('sortBuckets', () => {
    it('sorts buckets descending by default', () => {
      const numbers = [1, 100, 10];
      const buckets = generateBucketsFromNumbers(numbers);

      const sortedBuckets = sortBucketsByPlace(buckets);

      expect(sortedBuckets[0].number).toEqual(100);
      expect(sortedBuckets[2].number).toEqual(1);
    });
    it('sorts buckets ascending with option', () => {
      const numbers = [10, 100, 1];
      const buckets = generateBucketsFromNumbers(numbers);

      const sortedBuckets = sortBucketsByPlace(buckets, true);

      expect(sortedBuckets[0].number).toEqual(1);
      expect(sortedBuckets[2].number).toEqual(100);
    });
  });
  describe('findMissingPlaces', () => {
    it('finds missing places between buckets', () => {
      const numbers = [100, 1];
      const userResponse = '102';
      const buckets = generateBucketsFromNumbers(numbers);

      const missingPlaces = findMissingPlaces(buckets, userResponse);

      expect(missingPlaces.length).toEqual(1);
      expect(missingPlaces.includes(PLACE_VALUE.TENS)).toBeTruthy();
    });
    it('does not include places not between buckets', () => {
      const numbers = [10, 1];
      const userResponse = '12';
      const buckets = numbers.map((n) => generateBucketObject(n));

      const missingPlaces = findMissingPlaces(buckets, userResponse);

      expect(missingPlaces.length).toEqual(0);
      expect(missingPlaces.includes(PLACE_VALUE.HUNDREDS)).toBeFalsy();
    });
  });
  describe('fillInMissingBuckets', () => {
    it('creates a bucket for TENS place with 0 value', () => {
      const numbers = [100, 1];
      const userResponse = '123';
      const buckets = generateBucketsFromNumbers(numbers);

      const filledInBuckets = fillInMissingBuckets(buckets, userResponse);

      expect(
        filledInBuckets.find(
          (b) => b.number === 0 && b.forcePlace === PLACE_VALUE.TENS,
        ),
      ).toBeTruthy();
    });
    it('creates a bucket for HUNDREDS place with 0 value', () => {
      const numbers = [0, 30, 6];
      const userResponse = '123';
      const buckets = generateBucketsFromNumbers(numbers);

      const filledInBuckets = fillInMissingBuckets(buckets, userResponse);

      expect(
        filledInBuckets.find(
          (b) => b.number === 0 && b.forcePlace === PLACE_VALUE.HUNDREDS,
        ),
      ).toBeTruthy();
    });
  });
  describe('findInteractableBuckets', () => {
    it('finds the remaining interactive buckets', () => {
      const numbers = [120, 10, 1, 5];
      const buckets = generateBucketsFromNumbers(numbers);

      const remaining = findInteractableBuckets(buckets);
      expect(remaining.length).toEqual(3);
      expect(remaining.find((b) => b.number === 1)).toBeTruthy();
      expect(remaining.find((b) => b.number === 5)).toBeTruthy();
      expect(remaining.find((b) => b.number === 120)).toBeTruthy();
    });
  });
});
