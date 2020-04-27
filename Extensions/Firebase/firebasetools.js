/**
 * Firebase Tools
 * @author arthuro555
 */

/*    Initialization of the firebase SDK    */

/** A Timeout function is used to initialize firebase as soon as the project data has been loaded */
let gdjsWatcher = function() {
    if (gdjs.projectData === undefined) {
        setTimeout(gdjsWatcher, 1);
        return;
    }
    let firebaseConfig;
    try { 
        firebaseConfig = JSON.parse(gdjs.projectData.properties.firebaseConfig);
    } catch {
        console.error("The Firebase configuration is invalid!");
    }
    firebase.initializeApp(firebaseConfig);
};
gdjsWatcher();

/*    Creation of all Namespaces    */

/**
 * Firebase Event Tools
 * @namespace
 */
gdjs.evtTools.firebase = {};

/**
 * Firebase Analytics Tools
 * @namespace
 */
gdjs.evtTools.firebase.analytics = {};

/**
 * Remote Config Tools
 * @namespace
 */
gdjs.evtTools.firebase.RC = {};

/*    Function Definitions    */

/**
 * Enables Firebase Analytics and cache the instance to runtimeGame.
 * @param {gdjs.RuntimeScene} runtimeScene The current {@link gdjs.RuntimeScene} instance.
 */
gdjs.evtTools.firebase.analytics.enable = function(runtimeScene) {
    runtimeScene.getGame()._analyticsInstance = runtimeScene.getGame()._analyticsInstance || firebase.analytics();
}

/**
 * Logs an Event/Conversion for that user on the Analytics.
 * @param {gdjs.RuntimeScene} [runtimeScene] The current {@link gdjs.RuntimeScene} instance.
 * @param {string} eventName The Event being triggered.
 * @param {string} [eventData] Additional Data for the event.
 */
gdjs.evtTools.firebase.analytics.log = function(runtimeScene, eventName, eventData) {
    let analytics = runtimeScene.getGame()._analyticsInstance || firebase.analytics();
    let eventProperties;
    try {
        eventProperties = JSON.parse(eventData);
    } catch {
        eventProperties = {eventData: eventData};
    }
    analytics.logEvent(eventName, eventProperties);
}

/**
 * Sets the User ID (The name under wich the user will appear on the analytics). 
 * Should be Unique if possible.
 * @param {gdjs.RuntimeScene} [runtimeScene] The current {@link gdjs.RuntimeScene} instance.
 * @param {string | number} newUID The new UserID.
 */
gdjs.evtTools.firebase.analytics.setUserID = function(runtimeScene, newUID) {
    let analytics = runtimeScene.getGame()._analyticsInstance || firebase.analytics();
    analytics.setUserId(newUID);
}

/**
 * Set an user's property.
 * @param {gdjs.RuntimeScene} [runtimeScene] The current {@link gdjs.RuntimeScene} instance.
 * @param {string} propertyName The property's name.
 * @param {string} [propertyData] The data associated to the property.
 */
gdjs.evtTools.firebase.analytics.setProperty = function(runtimeScene, propertyName, propertyData) {
    let analytics = runtimeScene.getGame()._analyticsInstance || firebase.analytics();
    let properties = {};
    try {
        properties[propertyName] = JSON.parse(propertyData);
    } catch {
        properties[propertyName] = propertyData;
    }
    console.log(properties);
    analytics.setUserProperties(properties);
}

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

/*    CALLBACK REGISTRATION    */

/** Callback For Setting the analytics current View to the current Scene */
gdjs.registerRuntimeSceneLoadedCallback(function(runtimeScene) {
    if(runtimeScene.getGame()._analyticsInstance) runtimeScene.getGame()._analyticsInstance.setCurrentScreen(runtimeScene.getName());
})
