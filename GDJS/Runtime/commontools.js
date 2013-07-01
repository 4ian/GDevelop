/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * @namespace gdjs.evtTools
 * @class common
 * @static
 */
gdjs.evtTools.common = gdjs.evtTools.common || {eventsObjectsMap: new Hashtable()}

/**
 * Clear the map containing objects lists.
 * Should be used by events generated code only.
 */
gdjs.evtTools.common.clearEventsObjectsMap = function() {
    gdjs.evtTools.common.eventsObjectsMap.clear();

    return gdjs.evtTools.common;
}

/**
 * Add an objects list to the objects lists map.
 * Should be used by events generated code only.
 */
gdjs.evtTools.common.addObjectsToEventsMap = function(name, objectList) {
    gdjs.evtTools.common.eventsObjectsMap.put(name, objectList);
    return gdjs.evtTools.common;
}

/**
 * Return the objects lists map.
 * Should be used by events generated code only.
 */
gdjs.evtTools.common.getEventsObjectsMap = function() {
    return gdjs.evtTools.common.eventsObjectsMap.clone();
}

/**
 * Convert a string to a float.
 * @method toNumber
 * @private
 * @static
 */
gdjs.evtTools.common.toNumber = function(str) {
    return parseFloat(str);
}

/**
 * Convert a number to a string.
 * @method toString
 * @private
 * @static
 */
gdjs.evtTools.common.toString = function(num) {
    return num.toString();
}

/**
 * Always return false.
 * @method returnFalse
 * @private
 * @static
 */
gdjs.evtTools.common.returnFalse = function() {
    return false;
}
