// @flow
export const mergeArraysPerGroup = <T>(
  arr1: Array<T>,
  arr2: Array<T>,
  howManyPerGroup1: number,
  howManyPerGroup2: number
): Array<T> => {
  let arr1Index = 0;
  let arr2Index = 0;
  const result = [];

  while (arr1Index < arr1.length || arr2Index < arr2.length) {
    const picks1 = arr1.slice(arr1Index, arr1Index + howManyPerGroup1);
    const picks2 = arr2.slice(arr2Index, arr2Index + howManyPerGroup2);
    arr1Index += howManyPerGroup1;
    arr2Index += howManyPerGroup2;

    picks1.forEach(item => result.push(item));
    picks2.forEach(item => result.push(item));
  }

  return result;
};
