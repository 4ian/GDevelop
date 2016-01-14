/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * EventsContext contains specific tools and data structures used
 * by events generated code only.
 *
 * @namespace gdjs
 * @class EventsContext
 * @constructor
 */
gdjs.EventsContext = function()
{
    this._objectsMapCache = [];

    this._onceTriggers = {};
    this._lastFrameOnceTrigger = {};
};

/**
 * To be called when events begin so that "Trigger once" conditions
 * are properly handled.
 * @method startNewFrame
 */
gdjs.EventsContext.prototype.startNewFrame = function() {
    this.clearObject(this._lastFrameOnceTrigger);
    for (var k in this._onceTriggers) {
        if (this._onceTriggers.hasOwnProperty(k)) {
            this._lastFrameOnceTrigger[k] = this._onceTriggers[k];
            delete this._onceTriggers[k];
        }
    }

    this._currentObjectsMap = 0;
};

/**
 * Used by "Trigger once" conditions: return true only if
 * this method was not called with the same identifier during the last frame.
 * @param triggerId The identifier of the "Trigger once" condition.
 * @method triggerOnce
 */
gdjs.EventsContext.prototype.triggerOnce = function(triggerId) {
    this._onceTriggers[triggerId] = true;

    return !this._lastFrameOnceTrigger.hasOwnProperty(triggerId);
};

gdjs.EventsContext.prototype.clearObject = function(obj) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            delete obj[k];
        }
    }
};

/**
 * Clear the map containing objects lists.
 * @method clearEventsObjectsMap
 */
gdjs.EventsContext.prototype.clearEventsObjectsMap = function() {
    if (this._currentObjectsMap === this._objectsMapCache.length)
        this._objectsMapCache.push(new Hashtable());

    this._objectsMapCache[this._currentObjectsMap].clear();
    return this;
};

/**
 * Add an objects list to the objects lists map.
 * @method addObjectsToEventsMap
 */
gdjs.EventsContext.prototype.addObjectsToEventsMap = function(name, objectList) {
    this._objectsMapCache[this._currentObjectsMap].put(name, objectList);
    return this;
};

/**
 * Return the objects lists map.
 * @method getEventsObjectsMap
 */
gdjs.EventsContext.prototype.getEventsObjectsMap = function() {
    return this._objectsMapCache[this._currentObjectsMap++];
};
