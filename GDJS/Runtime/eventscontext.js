/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
	if (this._eventsObjectsMap !== undefined) this._eventsObjectsMap.clear();
	else this._eventsObjectsMap = new Hashtable();

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
};

/**
 * Used by "Trigger once" conditions: Return true only if
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
    this._eventsObjectsMap.clear();
    return this;
};

/**
 * Add an objects list to the objects lists map.
 * @method addObjectsToEventsMap
 */
gdjs.EventsContext.prototype.addObjectsToEventsMap = function(name, objectList) {
    this._eventsObjectsMap.put(name, objectList);
    return this;
};

/**
 * Return the objects lists map.
 * @method getEventsObjectsMap
 */
gdjs.EventsContext.prototype.getEventsObjectsMap = function() {
    return this._eventsObjectsMap.clone();
};
