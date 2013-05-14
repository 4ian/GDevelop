/**
 * @module gdjs.commonTools
 */
gdjs.commonTools = gdjs.commonTools || {eventsObjectsMap: new Hashtable()}

/**
 * Clear the map containing objects lists.
 * Should be used by events generated code only.
 */
gdjs.commonTools.clearEventsObjectsMap = function() {
    gdjs.commonTools.eventsObjectsMap.clear();
    
    return gdjs.commonTools;
}

/**
 * Add an objects list to the objects lists map.
 * Should be used by events generated code only.
 */
gdjs.commonTools.addObjectsToEventsMap = function(name, objectList) {
    gdjs.commonTools.eventsObjectsMap.put(name, objectList);
    return gdjs.commonTools;
}

/**
 * Return the objects lists map.
 * Should be used by events generated code only.
 */
gdjs.commonTools.getEventsObjectsMap = function() {
    return gdjs.commonTools.eventsObjectsMap.clone();
}