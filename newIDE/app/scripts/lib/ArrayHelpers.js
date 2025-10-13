// @ts-check

/**
 * @template T
 * @param {Array<T>} array
 * @param {(T) => string} getKey
 * @returns {Record<string, Array<T>>}
 */
const groupBy = (array, getKey) => {
  /** @type {Record<string, Array<T>>} */
  const table = {};
  for (const element of array) {
    const key = getKey(element);
    let group = table[key];
    if (!group) {
      group = [];
      table[key] = group;
    }
    group.push(element);
  }
  return table;
};

/**
 * @template T
 * @param {Record<string, Array<T>>} table
 * @returns {Record<string, Array<T>>}
 */
const sortKeys = table => {
  /** @type {Record<string, Array<T>>} */
  const sortedTable = {};
  for (const key of Object.keys(table).sort()) {
    sortedTable[key] = table[key];
  }
  return sortedTable;
};

module.exports = {
  groupBy,
  sortKeys,
};