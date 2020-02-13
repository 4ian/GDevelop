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
     * @type {Map|Object.<string, any>}
     */
    this.items = null;
    if(Map !== undefined) {
        this.items = new Map();
        this.map = true;
    }
    else {
        this.items = {};
        this.map = false;
    }
}

/**
 * Construct a Hashtable from a JS object.
 *
 * @param {Map|Object.<string, any>} items The content of the Hashtable.
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
    if(this.map) { 
        this.items.set(key, value);
        return;
    }
    this.items[key] = value;
}

/**
 * Get a value corresponding to a key, or undefined if not found.
 *
 * @memberof Hashtable
 * @param {string} key The key associated to the value.
 */
Hashtable.prototype.get = function(key) {
    if(this.map) { return this.items.get(key); }
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
    if(this.map) { return this.items.has(key); }
    return this.items.hasOwnProperty(key);
}

/**
 * Remove the value associated to the specified key.
 *
 * @memberof Hashtable
 * @param {string} key The key to remove.
 */
Hashtable.prototype.remove = function(key) {
    if(this.map) { 
        this.items.delete(key); 
        return;
    }
    delete this.items[key];
}

/**
 * Get the first key of the Hashtable.
 *
 * @memberof Hashtable
 * @returns {?string} The first key of the Hashtable, or undefined if empty.
 */
Hashtable.prototype.firstKey = function() {
    if(this.map) {
        for (var k of this.items.keys()) {
            if (this.items.has(k)) {
                return k;
            }
        }
    }
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            return k;
        }
    }

    return undefined;
}

/**
 * Dump all the keys of the Hashtable to an array (which is cleared first).
 *
 * @memberof Hashtable
 * @param {Array<string>} result The Array where the result gets pushed.
 */
Hashtable.prototype.keys = function(result) {
    result.length = 0;
    if(this.map) {
        for (var k of this.items.keys()) {
            if (this.items.has(k)) {
                result.push(k);
            }
        }
        return;
    }
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
 * @param {Array} result The Array where the results get pushed.
 */
Hashtable.prototype.values = function(result) {
    result.length = 0;
    if(this.map) {
        for (var k of this.items.keys()) {
            if (this.items.has(k)) {
                result.push(this.items.get(k));
            }
        }
        return;
    }
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
    if(this.map) {
        this.items.clear();
        return;
    }
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}

Hashtable[Symbol.iterator] = function*() {
    if(this.map) {
        for(var k in this.items.keys()){
            if(this.items.has(k)){
                yield this.items.get(k);
            }
        }
    } else {
        for (var k in this.items) {
            if (this.items.hasOwnProperty(k)) {
                yield this.items[k];
            }
        }
    }
}
