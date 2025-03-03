// @flow
// Note: this file does not use export/imports and use Flow comments *and* JS doc to allow its usage
// from both Flow (in the IDE) and TypeScript (in Node.js).

/**
 * @template T
 * @param {number} start
 * @param {number} end
 * @param {(i: number) => T} func
 * @returns {Array<T>}
 */
const mapFor = /*:: <T> */ (
  start /*: number */,
  end /*: number */,
  func /*: (number) => T */
) /*: Array<T> */ => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
};

/**
 * @template T
 * @param {number} start
 * @param {number} end
 * @param {(i: number) => T} func
 * @returns {Array<T>}
 */
const mapReverseFor = /*:: <T> */ (
  start /*: number */,
  end /*: number */,
  func /*: (number) => T */
) /*: Array<T> */ => {
  const result = [];
  for (let i = end - 1; i >= start; i--) {
    result.push(func(i));
  }
  return result;
};

/*flow-include
type CppVector<T> = {
  +size: () => number,
  +at: (number) => T,
}
*/

/**
 * @template T
 * @typedef {{size: () => number, at: (i: number) => T}} CppVector
 */

/**
 * @template T, U
 * @param {CppVector<T>} start
 * @param {(item: T, i: number) => U} func
 * @returns {Array<U>}
 */
const mapVector = /*:: <T, U> */ (
  cppVector /*: CppVector<T> */,
  func /*: (T, number) => U */
) /*: Array<U> */ => {
  return mapFor(0, cppVector.size(), i => func(cppVector.at(i), i));
};

module.exports = {
  mapFor,
  mapReverseFor,
  mapVector,
};
