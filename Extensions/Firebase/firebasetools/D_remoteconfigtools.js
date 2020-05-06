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

/** Register callback for after firebase initialization. */
gdjs.evtTools.firebase.onAppCreated.push(function() {
    // Synchronisation seems to be impossible when that value isn't preset
    firebase.remoteConfig().settings = {
        minimumFetchIntervalMillis: -1,
    };
});
