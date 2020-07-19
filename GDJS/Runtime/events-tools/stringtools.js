/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to strings manipulation, for events generated code.
 *
 * @memberof gdjs.evtTools
 * @namespace string
 * @private
 */
gdjs.evtTools.string = gdjs.evtTools.string || {};

/**
 * Return a string containing a new line character.
 * @private
 */
gdjs.evtTools.string.newLine = function() {
    return "\n";
};

/**
 * Return a character from its codepoint.
 * @private
 */
gdjs.evtTools.string.fromCodePoint = function(codePoint) {
    return String.fromCodePoint(codePoint);
};

/**
 * Return the uppercased version of the string.
 * @private
 */
gdjs.evtTools.string.toUpperCase = function(str) {
    return str.toUpperCase();
};

/**
 * Return the lowercased version of the string.
 * @private
 */
gdjs.evtTools.string.toLowerCase = function(str) {
    return str.toLowerCase()
};

/**
 * Return a new string containing the substring of the original string.
 * @private
 */
gdjs.evtTools.string.subStr = function(str, start, len) {
    if ( start < str.length && start >= 0 )
    	return str.substr(start, len);

    return "";
};

/**
 * Return a new string containing the character at the specified position.
 * @private
 */
gdjs.evtTools.string.strAt = function(str, start) {
    if ( start < str.length && start >= 0 )
    	return str.substr(start, 1);

    return "";
};

/**
 * Return the string repeated.
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
 * @private
 */
gdjs.evtTools.string.strLen = function(str) {
    return str.length;
};

/**
 * Search the first occurence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
 * @private
 */
gdjs.evtTools.string.strFind = function(str, what) {
    return str.indexOf(what);
};

/**
 * Search the last occurence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
 * @private
 */
gdjs.evtTools.string.strFindLast = function(str, what) {
    return str.lastIndexOf(what);
};

/**
 * @private
 * @deprecated
 */
gdjs.evtTools.string.strRFind = gdjs.evtTools.string.strFindLast

/**
 * Search the first occurence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
 * @private
 */
gdjs.evtTools.string.strFindFrom = function(str, what, pos) {
    return str.indexOf(what, pos);
};

/**
 * Search the last occurence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
 * @private
 */
gdjs.evtTools.string.strFindLastFrom = function(str, what, pos) {
    return str.lastIndexOf(what, pos);
};

/**
 * @private
 * @deprecated
 */
gdjs.evtTools.string.strRFindFrom = gdjs.evtTools.string.strFindLastFrom;
