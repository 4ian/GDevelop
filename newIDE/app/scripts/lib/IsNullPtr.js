// @ts-check

/** @typedef {import('../../../../GDevelop.js/types').EmscriptenObject} EmscriptenObject */

/**
 * Check if the Emscripten object is actually a null pointer.
 *
 * You should normally not use this - instead prefer the null/empty object pattern,
 * with a function `IsBadXxx` to check if the object you're manipulating represents
 * an null/empty object.
 *
 * @param {EmscriptenObject} object
 * @returns {boolean}
 */
const isNullPtr = object => object.ptr === 0;

module.exports = {
  isNullPtr,
};
