/**
 * Firebase Tools Collection
 * @fileoverview
 * @author arthuro555
 */

/**
 * Firebase Analytics Tools
 * @namespace
 */
gdjs.evtTools.firebase.analytics = {};

/**
 * Logs an event/conversion for that user on the analytics.
 * @param {string} eventName The event being triggered.
 * @param {string | Object} [eventData] Additional data for the event.
 */
gdjs.evtTools.firebase.analytics.log = function (eventName, eventData) {
  let analytics = gdjs.evtTools.firebase.analytics._analyticsInstance;
  let eventProperties;
  if (eventData) {
    try {
      eventProperties = JSON.parse(eventData);
    } catch {
      eventProperties = { eventData: eventData };
    }
  }
  analytics.logEvent(eventName, eventProperties);
};

/**
 * Sets the User ID (the name under wich the user will appear on the analytics).
 * Should be unique if possible.
 * @param {string | number} newUID The new User ID.
 */
gdjs.evtTools.firebase.analytics.setUserID = function (newUID) {
  let analytics = gdjs.evtTools.firebase.analytics._analyticsInstance;
  analytics.setUserId(newUID);
};

/**
 * Set an user's property.
 * @param {string} propertyName The property's name.
 * @param {string | Object} [propertyData] The data associated to the property.
 */
gdjs.evtTools.firebase.analytics.setProperty = function (
  propertyName,
  propertyData
) {
  let analytics = gdjs.evtTools.firebase.analytics._analyticsInstance;
  let properties = {};
  try {
    properties[propertyName] = JSON.parse(propertyData);
  } catch {
    properties[propertyName] = propertyData;
  }
  analytics.setUserProperties(properties);
};

// Initialization step required by firebase analytics
gdjs.registerFirstRuntimeSceneLoadedCallback(function () {
  gdjs.evtTools.firebase.analytics._analyticsInstance = firebase.analytics();
});

// Callback for setting the analytics current view to the current scene.
gdjs.registerRuntimeSceneLoadedCallback(function (runtimeScene) {
  if (gdjs.evtTools.firebase.analytics._analyticsInstance)
    gdjs.evtTools.firebase.analytics._analyticsInstance.setCurrentScreen(
      runtimeScene.getName()
    );
});
