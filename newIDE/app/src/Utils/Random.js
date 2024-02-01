// @flow
import shuffle from 'lodash/shuffle';

const randomArrays: {| [size: number]: number[] |} = {};

export const getStableRandomArray = (size: number): number[] => {
  if (randomArrays[size]) return randomArrays[size];

  const randomArray = shuffle(new Array(size).fill(0).map((_, index) => index));
  randomArrays[size] = randomArray;
  return randomArrays[size];
};

export const shuffleArrayWith = <T>(
  array: T[],
  positionArray: number[]
): T[] => {
  if (positionArray.length < array.length) {
    throw new Error(
      'Cannot shuffle an array with a position array of a lesser size.'
    );
  }
  return array
    .map((item, index) => ({ item, position: positionArray[index] }))
    .sort((a, b) => a.position - b.position)
    .map(sortingItem => sortingItem.item);
};

/**
 * Shuffles array. The result will change only if the app is restarted.
 */
export const shuffleStableArray = <T>(array: T[]): T[] => {
  const randomArray = getStableRandomArray(array.length);
  return shuffleArrayWith(array, randomArray);
};
