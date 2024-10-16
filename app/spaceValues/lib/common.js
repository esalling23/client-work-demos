import { evaluate } from 'mathjs';
import {
  PLACE_VALUE,
  BASE_BLOCK_SIZE,
  BLOCK_GUTTER,
  PLACE_DIGIT,
  SORTED_PLACES,
  ONRAMP_BASE_BLOCK_SIZE,
  ONES_GROUP_COUNT,
} from './constants';

export const getBaseBlockSize = (isOnramp) =>
  isOnramp ? ONRAMP_BASE_BLOCK_SIZE : BASE_BLOCK_SIZE;

export const generateIndexArray = (length, change = 0) =>
  new Array(length).fill().map((_el, i) => i + change);

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const radiansToDegrees = (radians) => radians * (180 / Math.PI);

export const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

export const checkIsNotNum = (num) => num === null || Number.isNaN(Number(num));

export const calcBlockOffset = (offset) =>
  offset * (BLOCK_GUTTER + BASE_BLOCK_SIZE);

export const calcBaseTenValue = (digitCount) => 10 ** (digitCount - 1);

export const calcBaseTen = (place) => calcBaseTenValue(PLACE_DIGIT[place]);

export const findDigits = (num) => num.toString().split('');

export const findLargestPlace = (numbers) =>
  numbers.reduce((largest, n) => (largest > n ? largest : n)).toString()
    .length - 1;

export const findPlace = (num, forcePlaceIndex = null) => {
  const placeIndex =
    typeof forcePlaceIndex === 'number'
      ? forcePlaceIndex
      : findDigits(num).length - 1;
  return SORTED_PLACES[placeIndex];
};

export const findAdjacentPlace = (place, toLeft = false) => {
  // Sorted smallest to largest
  const index = SORTED_PLACES.indexOf(place);
  const adjacentIndex = toLeft ? index + 1 : index - 1;
  return SORTED_PLACES[adjacentIndex] || null;
};

export const evaluateNumbers = (numbers, operator = '+') =>
  numbers.reduce((total, num) => evaluate(`${total} ${operator} ${num}`));

// Breaks a number ex: 124 into place values { HUNDREDS: 1, TENS: 2, ONES: 4 }
export const breakNumber = (num) => {
  if (checkIsNotNum(num) || num.length === 0) {
    return {};
  }
  const numDigits = findDigits(num);
  return numDigits.reduce((placeValues, digit, i) => {
    const place = Object.keys(PLACE_VALUE)[numDigits.length - 1 - i];
    return {
      ...placeValues,
      [place]: Number(digit),
    };
  }, {});
};

export const calcBaseTenDigit = (digits, place) =>
  (digits[place] || 0) * calcBaseTen(place);

export const calculateBlockSize = (place, isOnramp) => {
  const baseSize = getBaseBlockSize(isOnramp);
  const size = {
    height: baseSize,
    width: baseSize,
  };
  const isHundreds = place === PLACE_VALUE.HUNDREDS;
  if (place === PLACE_VALUE.TENS || isHundreds) {
    size.height *= 10;
  }
  if (isHundreds) {
    size.width *= 10;
  }
  if (isOnramp && place !== PLACE_VALUE.ONES) {
    size.height += 20;
  }
  return size;
};

export const calcBlocksAcross = (number) => {
  const digits = breakNumber(number);
  const blockCount = Object.keys(digits).reduce((total, place) => {
    let num = digits[place];
    if (place === PLACE_VALUE.ONES) {
      // ones are stacked in groups
      num = Math.ceil(num / ONES_GROUP_COUNT);
    } else if (place === PLACE_VALUE.HUNDREDS) {
      // the first hundred should count as 9 blocks, each subsequent only 1
      // this value is 8 because if the hundreds place is 3 we want 2 + 9 === 3 + 8
      num += 8;
    }
    return total + num;
  }, 0);
  return blockCount;
};

export const checkIsNumBreakable = (number, forcePlace) => {
  const digits = breakNumber(number);
  const placeCount = Object.values(digits).filter((val) => val > 0).length;
  return placeCount > 1 && !forcePlace;
};

export const findElementCenterPos = (element) => {
  const { top, left, right, bottom } = element.getBoundingClientRect();

  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
  };
};

export const findDeltaPos = (pos1, pos2) => ({
  x: pos1.x - pos2.x,
  y: pos1.y - pos2.y,
});

export const findDistanceBetween = (pos1, pos2) => {
  const { x: dx, y: dy } = findDeltaPos(pos1, pos2);
  return Math.hypot(dx, dy);
};

export const findDistanceDirection = (pos1, pos2) => {
  const { x: dx, y: dy } = findDeltaPos(pos1, pos2);
  return Math.atan2(dy, dx);
};

export const findElementDistance = (el1, el2) => {
  const pos1 = findElementCenterPos(el1);
  const pos2 = findElementCenterPos(el2);

  return findDistanceBetween(pos1, pos2);
};

export const findElementDirection = (el1, el2) => {
  const pos1 = findElementCenterPos(el1);
  const pos2 = findElementCenterPos(el2);

  return findDistanceDirection(pos1, pos2);
};

export const findExpandedDigits = (numbers) =>
  numbers.map((n) => {
    const brokenNum = breakNumber(n);
    return brokenNum;
  });

// Calculates digits of combined digit values
export const findExpandedSolutionDigits = (places, digits) =>
  places.reduce((solutionDigits, place) => {
    const placeTotal = digits.reduce(
      (total, num) => total + (num[place] || 0),
      0,
    );
    return {
      ...solutionDigits,
      [place]: placeTotal,
    };
  }, {});

export const generateFloatingClass = (place) => `floating-${place}`;
