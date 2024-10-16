import { shuffle } from 'lodash';
import {
  GRID_COL_COUNT,
  GRID_ROW_COUNT,
  PLACE_DIGIT,
  PLACE_VALUE,
  SORTED_PLACES,
} from './constants';
import Bucket from './Bucket';
import {
  breakNumber,
  calcBaseTenValue,
  checkIsNumBreakable,
  deepCopy,
  findDigits,
  findLargestPlace,
  findPlace,
  generateIndexArray,
} from './common';

export const parseBucketId = (id) => id.split('bucket-')[1];
export const generateBucketId = (key) => `bucket-${key}`;

export const findBucketElement = (key) =>
  window.document.querySelector(`#${generateBucketId(key)}`);

export const generateBucketObject = (number, gridPos, isOriginal, forcePlace) =>
  new Bucket(number, gridPos, isOriginal, forcePlace);

// Generates a grid position, excluding existing positions
export const generateGridPos = (existingBuckets) => {
  // all available positions
  const gridPositions = generateIndexArray(GRID_ROW_COUNT, 1).reduce(
    (allPos, row) => [
      ...allPos,
      ...generateIndexArray(GRID_COL_COUNT, 1).map((col) => ({
        row,
        col,
      })),
    ],
    [],
  );
  // Remove positions already assigned
  existingBuckets.forEach((bucket) => {
    if (bucket.gridPos) {
      const gridPosIndex = gridPositions.findIndex(
        (pos) =>
          pos.row === bucket.gridPos.row && pos.col === bucket.gridPos.col,
      );
      gridPositions.splice(gridPosIndex, 1);
    }
  });
  // Choose random position from remaining
  return shuffle(gridPositions)[0];
};

export const generateBucketsFromNumbers = (numbers, isOriginal = false) =>
  numbers.reduce(
    (generated, n) => [
      ...generated,
      generateBucketObject(n, generateGridPos(generated), isOriginal),
    ],
    [],
  );

export const findBucket = (buckets, key) =>
  buckets.find((bucket) => bucket.key === key);

export const findBucketIndex = (buckets, key) =>
  buckets.findIndex((bucket) => bucket.key === key);

export const filterRemoveBucket = (buckets, key) =>
  buckets.filter((bucket) => bucket.key !== key);

// Returns new buckets after breaking provided bucket index
export const generateBrokenBuckets = (allBuckets, bucketKey) => {
  const { number: bucketNumber, gridPos } = findBucket(allBuckets, bucketKey);
  const breakingIndex = findBucketIndex(allBuckets, bucketKey);
  const allBucketsExceptBroken = filterRemoveBucket(allBuckets, bucketKey);
  const brokenNums = findDigits(bucketNumber);
  const numPlaceValues = brokenNums.reduce((spawningBuckets, num, i) => {
    const digit = Number(num);
    if (digit === 0) {
      return spawningBuckets;
    }
    const place = brokenNums.length - i;
    const number = digit * calcBaseTenValue(place);
    const existingBuckets = [...allBucketsExceptBroken, ...spawningBuckets];
    const newBucket = generateBucketObject(
      number,
      generateGridPos(existingBuckets),
    );
    // keep the first new bucket in place
    if (spawningBuckets.length !== 0) {
      newBucket.willMove = true;
    } else {
      newBucket.gridPos = gridPos;
    }
    newBucket.isSpawned = true;
    return [...spawningBuckets, newBucket];
  }, []);
  const newNums = deepCopy(allBuckets);
  const newBuckets = shuffle(numPlaceValues.slice(1));
  newNums[breakingIndex].isBreaking = true;
  newNums.splice(bucketKey, 0, numPlaceValues[0]);
  newNums.push(...newBuckets);
  return newNums;
};

// Returns filtered array of available buckets to combine/break
export const checkAvailableBuckets = (buckets) =>
  buckets.filter((bucket) => {
    const digits = breakNumber(bucket.number);
    const placeCount = Object.values(digits).filter((val) => val > 0).length;
    const isBreakable = placeCount > 1;
    if (isBreakable) {
      return true;
    }
    const matchingPlaces = buckets.filter(
      (b) => b.number !== 0 && findPlace(bucket.number) === findPlace(b.number),
    );
    return matchingPlaces.length > 1;
  });

export const findInteractableBuckets = (buckets) => {
  const interactableBuckets = buckets.filter((remainingBucket) => {
    if (
      checkIsNumBreakable(remainingBucket.number, remainingBucket.forcePlace)
    ) {
      return true;
    }
    const matchingBucket = buckets.find(
      (b) =>
        findPlace(b.number) === findPlace(remainingBucket.number) &&
        b.key !== remainingBucket.key,
    );
    return matchingBucket;
  });

  return interactableBuckets;
};

export const updateInteractingBuckets = (buckets) => {
  const newBuckets = deepCopy(buckets);
  // There should only ever be one bucket marked as leaving
  const dragIndex = buckets.findIndex((bucket) => bucket.isLeaving);
  const dropIndex = buckets.findIndex((bucket) => bucket.isGrowing);

  // add value to droppable bucket number
  newBuckets[dropIndex].number += newBuckets[dragIndex].number;
  newBuckets[dropIndex].isGrowing = false;
  // remove the dragged bucket
  newBuckets.splice(dragIndex, 1);

  return newBuckets;
};

export const markInteractingBuckets = (buckets, dragKey, dropKey) => {
  const newBuckets = deepCopy(buckets);
  const dragIndex = findBucketIndex(buckets, dragKey);
  const dropIndex = findBucketIndex(buckets, dropKey);
  // mark the bucket that will absorb the other
  newBuckets[dropIndex].isGrowing = true;
  // mark the bucket that will be removed
  newBuckets[dragIndex].isLeaving = true;
  return newBuckets;
};

// Returns one bucket to rule them all
export const combineAllBuckets = (buckets) => {
  const combinedBucketNumber = buckets.reduce(
    (total, bucket) => total + bucket.number,
    0,
  );
  return new Bucket(combinedBucketNumber);
};

export const sortBucketsByPlace = (buckets, isAscending = false) =>
  buckets.sort((a, b) => {
    let forcePlaceIndex = null;
    if (
      a.forcePlace === PLACE_VALUE.HUNDREDS ||
      b.forcePlace === PLACE_VALUE.HUNDREDS
    ) {
      forcePlaceIndex = PLACE_DIGIT[PLACE_VALUE.HUNDREDS] - 1;
    }
    const aPlace = findPlace(a.number, forcePlaceIndex);
    const bPlace = findPlace(b.number, forcePlaceIndex);

    const aPlaceIndex = SORTED_PLACES.indexOf(aPlace);
    const bPlaceIndex = SORTED_PLACES.indexOf(bPlace);

    if (isAscending) {
      if (aPlaceIndex > bPlaceIndex) return 1;
      return -1;
    }
    if (bPlaceIndex > aPlaceIndex) return 1;
    return -1;
  });

export const findMissingPlaces = (buckets, userResponse) => {
  const largestResponsePlace = SORTED_PLACES.indexOf(findPlace(userResponse));
  const largestExistingPlace = findLargestPlace(buckets.map((b) => b.number));
  const largestCalculatedPlace = Math.max(
    largestResponsePlace,
    largestExistingPlace,
  );
  const missingPlaces = SORTED_PLACES.filter((place, placeIndex) => {
    const existingBucket = buckets.find((b) => findPlace(b.number) === place);
    return !existingBucket && placeIndex <= largestCalculatedPlace;
  });
  return missingPlaces;
};

export const fillInMissingBuckets = (buckets, userResponse) => {
  const missingPlaces = findMissingPlaces(buckets, userResponse);
  const newBuckets = missingPlaces.map((place) =>
    generateBucketObject(0, null, false, place),
  );
  return sortBucketsByPlace([...buckets, ...newBuckets]);
};
