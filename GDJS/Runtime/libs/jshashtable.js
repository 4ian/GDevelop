
function Hashtable(obj)
{
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }
    
    this.put = function(key, value)
    {
        var previous = undefined;
        if (this.items.hasOwnProperty(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.get = function(key) {
        return this.items.hasOwnProperty(key) ? this.items[key] : undefined;
    }

    this.containsKey = function(key)
    {
        return this.items.hasOwnProperty(key);
    }
    
   
    this.remove = function(key)
    {
        if (this.items.hasOwnProperty(key)) {
            var previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }
    
    this.keys = function()
    {
        var keys = [];
        for (var k in this.items) {
            if (this.items.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function()
    {
        var values = [];
        for (var k in this.items) {
            if (this.items.hasOwnProperty(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }
    
    this.entries = function()
    {
        var entries = [];
        for (var k in this.items) {
            if (this.items.hasOwnProperty(k)) {
                entries.push([k, this.items[k]]);
            }
        }
        return entries;
    }
    
    this.clear = function()
    {
        for (var k in this.items) {
            if (this.items.hasOwnProperty(k)) {
                delete this.items[k];
            }
        }
        this.length = 0;
    }
    
    this.clone = function()
    {
        return new Hashtable(this.items);
    }
}