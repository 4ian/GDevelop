/**
 * @memberof gdjs.evtTools
 * @class devicesensors
 * @static
 * @private
 */

gdjs.evtTools.devicesensors = {};
gdjs.evtTools.devicesensors.orientation = {};

gdjs.evtTools.devicesensors.orientation._isActive = false;

function _activateOrientationListener() {
  window.addEventListener("deviceorientation", _handleOrientation, true);
  gdjs.evtTools.devicesensors.orientation._isActive = true;
}

function _deactivateOrientationListener() {
  window.removeEventListener('deviceorientation', _handleOrientation, true);
  gdjs.evtTools.devicesensors.orientation._isActive = false;
}

function _handleOrientation(event) {
  gdjs.evtTools.devicesensors.orientation._absolute = event.absolute ? Math.round(event.absolute) : 0;
  gdjs.evtTools.devicesensors.orientation._alpha = event.alpha ? Math.round(event.alpha) : 0;
  gdjs.evtTools.devicesensors.orientation._beta = event.beta ? Math.round(event.beta) : 0;
  gdjs.evtTools.devicesensors.orientation._gamma = event.gamma ? Math.round(event.gamma) : 0;
}

/**
 * Activate the orientation sensor
 */
gdjs.evtTools.devicesensors.orientation.activateOrientationSensor = function() {
  _activateOrientationListener();
}

/**
 * Deactivate the orientation sensor
 */
gdjs.evtTools.devicesensors.orientation.deactivateOrientationSensor = function() {
  _deactivateOrientationListener();
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
 * @return {number} The device orientations absolute value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationAbsolute = function() {
  return gdjs.evtTools.devicesensors.orientation._absolute;
};

/**
 * Get the value of the device orientations alpha as a number
 * @return {number} The device orientations alpha value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationAlpha = function() {
  return gdjs.evtTools.devicesensors.orientation._alpha;
};

/**
 * Get the value of the device orientations beta as a number
 * @return {number} The device orientations beta value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationBeta = function() {
  return gdjs.evtTools.devicesensors.orientation._beta;
};

/**
 * Get the value of the device orientations gamma as a number
 * @return {number} The device orientations gamma value
 */
gdjs.evtTools.devicesensors.orientation.getOrientationGamma = function() {
  return gdjs.evtTools.devicesensors.orientation._gamma;
};
