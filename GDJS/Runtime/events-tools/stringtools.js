/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to strings manipulation, for events generated code.
 *
 * @namespace gdjs.evtTools
 * @class string
 * @static
 * @private
 */
gdjs.evtTools.string = gdjs.evtTools.string || {};

/**
 * Return a string containing a new line character.
 * @method newLine
 * @private
 */
gdjs.evtTools.string.newLine = function() {
    return "\n";
};

/**
 * Return a character from its codepoint.
 * @method fromCodePoint
 * @private
 */
gdjs.evtTools.string.fromCodePoint = function(codePoint) {
    return String.fromCodePoint(codePoint);
};

/**
 * Return the uppercased version of the string.
 * @method toUpperCase
 * @private
 */
gdjs.evtTools.string.toUpperCase = function(str) {
    return str.toUpperCase();
};

/**
 * Return the lowercased version of the string.
 * @method toLowerCase
 * @private
 */
gdjs.evtTools.string.toLowerCase = function(str) {
    return str.toLowerCase()
};

/**
 * Return a new string containing the substring of the original string.
 * @method subStr
 * @private
 */
gdjs.evtTools.string.subStr = function(str, start, len) {
    if ( start < str.length && start >= 0 )
    	return str.substr(start, len);

    return "";
};

/**
 * Return a new string containing the character at the specified position.
 * @method strAt
 * @private
 */
gdjs.evtTools.string.strAt = function(str, start) {
    if ( start < str.length && start >= 0 )
    	return str.substr(start, 1);

    return "";
};

/**
 * Return the string repeated.
 * @method strAt
 * @private
 */
gdjs.evtTools.string.strRepeat = function(str, count) {
    var result = "";
    for ( var i = 0; i < count; i++ )
        result += str;

    return result;
}

/**
 * Return the length of the string
 * @method strLen
 * @private
 */
gdjs.evtTools.string.strLen = function(str) {
    return str.length;
};

/**
 * Search in a string
 * @method strFind
 * @private
 */
gdjs.evtTools.string.strFind = function(str, what) {
    return str.indexOf(what);
};

/**
 * Reverse search in a string
 * @method strRFind
 * @private
 */
gdjs.evtTools.string.strRFind = function(str, what) {
    return str.lastIndexOf(what);
};

/**
 * Search in a string, starting from a specified position.
 * @method strFindFrom
 * @private
 */
gdjs.evtTools.string.strFindFrom = function(str, what, pos) {
    return str.indexOf(what, pos);
};

/**
 * Reverse search in a string, starting from a specified position.
 * @method strRFindFrom
 * @private
 */
gdjs.evtTools.string.strRFindFrom = function(str, what, pos) {
    return str.lastIndexOf(what, pos);
};
