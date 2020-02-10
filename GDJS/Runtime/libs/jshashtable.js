/**
 * A generic map (key values) container.
 *
 * Mostly used for storing lists of objects for
 * GDevelop generated events.
 *
 * @constructor
 * @template K,V
 */
function Hashtable()
{
    /** @type {Object<K,V>} */
    this.items = {};
}

/**
 * Construct a Hashtable from a JS object.
 * @param {Object} items The content of the Hashtable.
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
 * @memberof Hashtable
 * @param {K} key The key for the value.
 * @param {V} value The value for the key.
 */
Hashtable.prototype.put = function(key, value) {
    this.items[key] = value;
}

/**
 * Get a value corresponding to a key.
 * @memberof Hashtable
 * @param {K} key The key for the value.
 */
Hashtable.prototype.get = function(key) {
    return this.items[key];
}

/**
 * Verify if a key exists.
 * @memberof Hashtable
 * @param {K} key A key.
 * @returns {boolean} Does the key exists?
 */
Hashtable.prototype.containsKey = function(key) {
    return this.items.hasOwnProperty(key);
}

/**
 * Remove the key-value pair with the key passed.
 * @memberof Hashtable
 * @param {K} key The key for the value.
 */
Hashtable.prototype.remove = function(key) {
    delete this.items[key];
}

/**
 * Get the first key of the Hashtable.
 * @memberof Hashtable
 * @returns {K} The first key of the Hashtable.
 */
Hashtable.prototype.firstKey = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            return k;
        }
    }

    return undefined;
}

/**
 * Push all the keys of the Hashtable to an Array. Warning: Will clear the Array.
 * @memberof Hashtable
 * @param {Array} result The Array where the result gets pushed.
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
 * Push all the values of the Hashtable to an Array. Warning: Will clear the Array.
 * @memberof Hashtable
 * @param {Array} result The Array where the result gets pushed.
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
 * @memberof Hashtable
 */
Hashtable.prototype.clear = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}
