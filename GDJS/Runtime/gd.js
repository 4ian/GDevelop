/**
 * @module gdjs
 */
var gdjs = gdjs || {};

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 */
gdjs.rgbToHex = function(r, g, b) {
    return "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

gdjs.random = function(max) {
    return Math.floor((Math.random()*max)); 
}
    
/**
 * Convert an angle in degrees to radians.
 */
gdjs.toRad = function(angleInDegrees) {
    return angleInDegrees/180*3.14159;
}

/**
 * Convert an angle in radians to degrees.
 */
gdjs.toDegrees = function(angleInRadians) {
    return angleInRadians*180/3.14159;
}

gdjs.returnFalse = function() {
    return false;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from) {
  /*var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);*/
  
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