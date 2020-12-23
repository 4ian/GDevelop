/**
 * Firebase Tools Collection
 * @fileoverview
 * @author arthuro555
 */

/**
 * A special array where push tries to reuse old unused indices.
 * Why? This is for storing UIDs. You can see this as a sort of memory optimization:
 * Each time an object is removed, it is replaced with null in the array.
 * Then a new object can reuse that emplacement when pushing, instead of adding an element
 * to the array. Technically the push function is not really pushing anymore,
 * but the name is kept to make it easier for new devs to use (almost same API as classic array).
 * @class
 */
gdjs.UIDArray = function () {
  /**
   * The internal array of UIDs.
   * @type {Array<any>}
   * @private
   */
  this._array = [];
};

/**
 * Adds an object to the UIDs array and returns it's UID.
 * @param {any} item - The item to assign a UID to.
 * @returns {number} - The new UID of the object.
 */
gdjs.UIDArray.prototype.push = function (item) {
  for (let i in this._array) {
    if (this._array[i] === null) {
      this._array[i] = item;
      return parseInt(i);
    }
  }
  return this._array.push(item) - 1;
};

/**
 * Removes an element from the UIDs array by UID.
 * @param {number} uid - The UID of the object to remove.
 */
gdjs.UIDArray.prototype.remove = function (uid) {
  if (uid >= this._array.length) return; // Don't pollute the array with unecessary nulls.
  this._array[uid] = null;
};

/**
 * Get an element from the UIDs array by UID.
 * @param {number} uid - The UID of the object to get.
 */
gdjs.UIDArray.prototype.get = function (uid) {
  if (uid >= this._array.length) return null; // Prevent out of range getting.
  return this._array[uid];
};
