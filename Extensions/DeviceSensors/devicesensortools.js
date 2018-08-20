/**
 * @memberof gdjs.evtTools
 * @class devicesensors
 * @static
 * @private
 */

gdjs.evtTools.devicesensors = {};
gdjs.evtTools.devicesensors.orientation = {};

gdjs.evtTools.devicesensors.orientation._isActive = false;
gdjs.evtTools.devicesensors.orientation._absolute = 0;
gdjs.evtTools.devicesensors.orientation._alpha = 0;
gdjs.evtTools.devicesensors.orientation._beta =  0;
gdjs.evtTools.devicesensors.orientation._gamma =  0;

gdjs.evtTools.devicesensors.orientation._activateOrientationListener = function() {
  window.addEventListener("deviceorientation", gdjs.evtTools.devicesensors.orientation._handleOrientation, true);
  gdjs.evtTools.devicesensors.orientation._isActive = true;
}

gdjs.evtTools.devicesensors.orientation._deactivateOrientationListener = function() {
  window.removeEventListener('deviceorientation', gdjs.evtTools.devicesensors.orientation._handleOrientation, true);
  gdjs.evtTools.devicesensors.orientation._isActive = false;
}

gdjs.evtTools.devicesensors.orientation._handleOrientation = function(event) {
  gdjs.evtTools.devicesensors.orientation._absolute = event.absolute ? Math.round(event.absolute) : 0;
  gdjs.evtTools.devicesensors.orientation._alpha = event.alpha ? Math.round(event.alpha) : 0;
  gdjs.evtTools.devicesensors.orientation._beta = event.beta ? Math.round(event.beta) : 0;
  gdjs.evtTools.devicesensors.orientation._gamma = event.gamma ? Math.round(event.gamma) : 0;
}

/**
 * Activate the orientation sensor
 */
gdjs.evtTools.devicesensors.orientation.activateOrientationSensor = function() {
  gdjs.evtTools.devicesensors.orientation._activateOrientationListener();
}

/**
 * Deactivate the orientation sensor
 */
gdjs.evtTools.devicesensors.orientation.deactivateOrientationSensor = function() {
  gdjs.evtTools.devicesensors.orientation._deactivateOrientationListener();
}

/**
 * Check if the orientation sensor is currently active
 * @return {boolean} The activation state of the orientation sensor
 */
gdjs.evtTools.devicesensors.orientation.isActive = function() {
  return gdjs.evtTools.devicesensors.orientation._isActive;
}

/**
 * Get the value of the device orientations absolute as a number
 * @return {number} The device orientation's absolute value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationAbsolute = function() {
  return gdjs.evtTools.devicesensors.orientation._absolute;
};

/**
 * Get the value of the device orientations alpha as a number
 * @return {number} The device orientation's alpha value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationAlpha = function() {
  return gdjs.evtTools.devicesensors.orientation._alpha;
};

/**
 * Get the value of the device orientations beta as a number
 * @return {number} The device orientation's beta value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationBeta = function() {
  return gdjs.evtTools.devicesensors.orientation._beta;
};

/**
 * Get the value of the device orientations gamma as a number
 * @return {number} The device orientation's gamma value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationGamma = function() {
  return gdjs.evtTools.devicesensors.orientation._gamma;
};
