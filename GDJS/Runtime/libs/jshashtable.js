// @ts-check
/**
 * A generic map (key-value) container.
 *
 * Mostly used for storing lists of objects for
 * GDevelop generated events.
 *
 * @constructor
 */
function Hashtable()
{
    /**
     * The content of the Hashtable. Prefer using methods rather
     * than accessing this internal object, unless you need to iterate
     * on the values.
     * @type {Object.<string, any>}
     */
    this.items = {};
}

/**
 * Construct a Hashtable from a JS object.
 *
 * @param {Object.<string, any>} items The content of the Hashtable.
 * @returns {Hashtable} The new hashtable.
 * @static
 */
Hashtable.newFrom = function(items) {
    var hashtable = new Hashtable();
    hashtable.items = items;
    return hashtable;
}

/**
 * Add a key-value pair to the Hashtable.
 * If a value already exists for this key, it is overwritten.
 *
 * @memberof Hashtable
 * @param {string} key The key.
 * @param {any} value The value to associate to the key.
 */
Hashtable.prototype.put = function(key, value) {
    this.items[key] = value;
}

/**
 * Get a value corresponding to a key, or undefined if not found.
 *
 * @memberof Hashtable
 * @param {string} key The key associated to the value.
 */
Hashtable.prototype.get = function(key) {
    return this.items[key];
}

/**
 * Verify if a key exists in the Hashtable.
 *
 * @memberof Hashtable
 * @param {string} key The key to search in the Hashtable.
 * @returns {boolean} true if the key exists.
 */
Hashtable.prototype.containsKey = function(key) {
    return this.items.hasOwnProperty(key);
}

/**
 * Remove the value associated to the specified key.
 *
 * @memberof Hashtable
 * @param {string} key The key to remove.
 */
Hashtable.prototype.remove = function(key) {
    delete this.items[key];
}

/**
 * Get the first key of the Hashtable.
 *
 * @memberof Hashtable
 * @returns {?string} The first key of the Hashtable, or undefined if empty.
 */
Hashtable.prototype.firstKey = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            return k;
        }
    }

    return null;
}

/**
 * Dump all the keys of the Hashtable to an array (which is cleared first).
 *
 * @memberof Hashtable
 * @param {Array<string>} result The Array where the result gets pushed.
 */
Hashtable.prototype.keys = function(result) {
    result.length = 0;
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            result.push(k);
        }
    }
}

/**
 * Dump all the values of the Hashtable to an array (which is cleared first).
 *
 * @memberof Hashtable
 * @param {Array<any>} result The Array where the results get pushed.
 */
Hashtable.prototype.values = function(result) {
    result.length = 0;
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            result.push(this.items[k]);
        }
    }
}

/**
 * Clear the Hashtable.
 *
 * @memberof Hashtable
 */
Hashtable.prototype.clear = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}
