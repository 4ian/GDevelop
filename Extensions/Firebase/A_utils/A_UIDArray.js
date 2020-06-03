/**
 * Firebase Tools Collection
 * @fileoverview
 * @author arthuro555
 */


/**
 * A special array where push assigns to the mearest null.
 * Why? This is for storing UIDs. You can see this as a sort of memory optimization:
 * Each time an object is removed, it is replaced with null in the array.
 * Then a new object can reuse that emplacement when pushing, instead of adding an element
 * to the array. Technically the push function is not really pushing anymore,
 * but the name is kept to make it easier for new devs to use (almost same API as classic Array).
 * @class
 * @extends Array
 */
gdjs.UIDArray = function() { Array.call(this); };

gdjs.UIDArray.prototype = Object.create(Array.prototype);

/**
 * Adds an object to the UIDs Array and returns it's UID.
 * @param {any} item - The item to assign a UID to.
 * @returns {number} - The new UID of the object.
 */
gdjs.UIDArray.prototype.push = function(item) {
    for(let i in this) {
        if(this[i] === null) {
            this[i] = item;
            return parseInt(i);
        }
    }
    return Array.prototype.push.call(this, item) - 1;
}

/**
 * Removes an element from the UIDArray by UID.
 * @param {number} uid - The UID of the object to remove.
 */
gdjs.UIDArray.prototype.remove = function(uid) {
    if (uid >= this.length) return; // Don't pollute the array with uneccessary nulls.
    this[uid] = null;
}
