/**
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

 /**
 * @namespace gdjs
 */
var gdjs = gdjs || {objectsTypes:new Hashtable(), onInitFcts: [], evtTools:{}};

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
gdjs.rgbToHex = function(r, g, b) {
    return "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Get a random integer between 0 and max.
 * @method random
 * @static
 */
gdjs.random = function(max) {
    return Math.floor((Math.random()*max)); 
}
    
/**
 * Convert an angle in degrees to radians.
 * @method toRad
 * @static
 */
gdjs.toRad = function(angleInDegrees) {
    return angleInDegrees/180*3.14159;
}

/**
 * Convert an angle in radians to degrees.
 * @method toDegrees
 * @static
 */
gdjs.toDegrees = function(angleInRadians) {
    return angleInRadians*180/3.14159;
}

/**
 * Register the runtime objects that can be used in runtimeScene.<br>
 * Objects must be part of gdjs and have their property "thisIsARuntimeObjectConstructor"
 * defined and set to the name of the type of the object so as to be recognized.
 * The name of the type of the object must be complete, with the namespace if any. For
 * example, if you are providing a Text object in the TextObject extension, the full name
 * of the type of the object is "TextObject::Text".
 *
 * @method registerObjects
 * @static
 */
gdjs.registerObjects = function() {
    for (var p in this) {
        if (this.hasOwnProperty(p)) {
            if ( gdjs[p].thisIsARuntimeObjectConstructor != undefined) {
                gdjs.objectsTypes.put(gdjs[p].thisIsARuntimeObjectConstructor, gdjs[p]);
            }
        }
    }
}

/**
 * Get the constructor of an object.
 *
 * @method getObjectConstructor
 * @static
 * @param name {String} The name of the type of the object.
 */
gdjs.getObjectConstructor = function(name) {
    if ( name != undefined && gdjs.objectsTypes.containsKey(name) )
        return gdjs.objectsTypes.get(name);
    
    console.log("Object type \""+name+"\" was not found.");
    return gdjs.objectsTypes.get(""); //Create a base empty runtime object.
}

Array.prototype.remove = function(from) {
    //Adapted from the nice article available at 
    //https://www.scirra.com/blog/76/how-to-write-low-garbage-real-time-javascript 
    for (var i = from, len = this.length - 1; i < len; i++)
        this[i] = this[i + 1];

    this.length = len;
};

Array.prototype.createFrom = function(arr) {
    var len = arr.length;
    if ( len != undefined ) {
        this.length = len;
        for (var i = 0; i < len;++i) {
            this[i] = arr[i];
        }
    }
};