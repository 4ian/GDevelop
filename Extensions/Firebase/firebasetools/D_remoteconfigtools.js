/**
 * Firebase Tools Collection
 * @fileoverview
 * @author arthuro555
 */

/**
 * Remote Config Tools
 * @namespace
 */
gdjs.evtTools.firebase.RC = {};

/**
 * Set the interval between auto-config updates
 */
gdjs.evtTools.firebase.RC.setAutoUpdateInterval = function(interval) {
    firebase.remoteConfig().settings = {
        minimumFetchIntervalMillis: interval,
    };
}

/**
 * Set the default offline configuration.
 * @param {gdjs.Variable} variable The Structure is 
 */
gdjs.evtTools.firebase.RC.setDefaultConfig = function(variable) {
    firebase.remoteConfig().defaultConfig = JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable));
}
