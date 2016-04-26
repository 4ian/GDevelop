function Hashtable()
{
    // console.log("New hashtable");
    this.items = {};
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

Hashtable.prototype.keys = function() {
    //TODO: search for functions calling keys() and avoid doing it.
    var keys = [];
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    return keys;
}

Hashtable.prototype.values = function() {
    //TODO: search for functions calling values() and avoid doing it.
    var values = [];
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            values.push(this.items[k]);
        }
    }
    return values;
}

Hashtable.prototype.clear = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}
