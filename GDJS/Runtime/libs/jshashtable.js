/**
 * A generic map (key values) container.
 *
 * Mostly used for storing lists of objects for
 * GDevelop generated events.
 *
 * @class Hashtable
 */
function Hashtable()
{
    this.items = {};
}

/**
 * Construct a Hashtable from a JS object.
 * @param {Object} items The content of the Hashtable
 * @returns {Hashtable} The new hashtable
 * @static
 */
Hashtable.newFrom = function(items) {
    var hashtable = new Hashtable();
    hashtable.items = items;
    return hashtable;
}

Hashtable.prototype.put = function(key, value) {
    this.items[key] = value;
}

Hashtable.prototype.get = function(key) {
    return this.items[key];
}

Hashtable.prototype.containsKey = function(key) {
    return this.items.hasOwnProperty(key);
}

Hashtable.prototype.remove = function(key) {
    delete this.items[key];
}

Hashtable.prototype.firstKey = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            return k;
        }
    }

    return undefined;
}

Hashtable.prototype.keys = function(result) {
    result.length = 0;
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            result.push(k);
        }
    }
}

Hashtable.prototype.values = function(result) {
    result.length = 0;
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            result.push(this.items[k]);
        }
    }
}

Hashtable.prototype.clear = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}
