/**
 * @memberof gdjs
 * @class deviceSensors
 * @static
 * @private
 */

gdjs.deviceSensors = {
  orientation: {
    _isActive: 0,
    _absolute: 0,
    _alpha: 0,
    _beta: 0,
    _gamma: 0
  }
};

 /**
  * Activate the orientation sensor's listener.
  * @private
 */
gdjs.deviceSensors.orientation._activateOrientationListener = function() {
  window.addEventListener("deviceorientation", gdjs.deviceSensors.orientation._handleOrientation, true);
  gdjs.deviceSensors.orientation._isActive = 1;
}

 /**
  * Deactivate the orientation sensor's listener.
  * @private
 */
gdjs.deviceSensors.orientation._deactivateOrientationListener = function() {
  window.removeEventListener('deviceorientation', gdjs.deviceSensors.orientation._handleOrientation, true);
  gdjs.deviceSensors.orientation._isActive = 0;
}

 /**
  * Orientation sensor event callback function.
  * @private
 */
gdjs.deviceSensors.orientation._handleOrientation = function(event) {
  gdjs.deviceSensors.orientation._absolute = event.absolute ? Math.round(event.absolute) : 0;
  gdjs.deviceSensors.orientation._alpha = event.alpha ? Math.round(event.alpha) : 0;
  gdjs.deviceSensors.orientation._beta = event.beta ? Math.round(event.beta) : 0;
  gdjs.deviceSensors.orientation._gamma = event.gamma ? Math.round(event.gamma) : 0;
}

/**
 * Activate the orientation sensor
 */
gdjs.deviceSensors.orientation.activateOrientationSensor = function() {
  gdjs.deviceSensors.orientation._activateOrientationListener();
}

/**
 * Deactivate the orientation sensor
 */
gdjs.deviceSensors.orientation.deactivateOrientationSensor = function() {
  gdjs.deviceSensors.orientation._deactivateOrientationListener();
}

/**
 * Check if the orientation sensor is currently active
 * @return {number} The activation state of the orientation sensor (0=false/1=true)
 */
gdjs.deviceSensors.orientation.isActive = function() {
  return gdjs.deviceSensors.orientation._isActive;
}

/**
 * Get the value of the device orientations absolute as a number
 * @return {number} The device orientation's absolute value
 */
gdjs.deviceSensors.orientation.getOrientationAbsolute = function() {
  return gdjs.deviceSensors.orientation._absolute;
};

/**
 * Get the value of the device orientations alpha as a number (Range: 0 to 360)
 * @return {number} The device orientation's alpha value
 */
gdjs.deviceSensors.orientation.getOrientationAlpha = function() {
  return gdjs.deviceSensors.orientation._alpha;
};

/**
 * Get the value of the device orientations beta as a number (Range: -180 to 180)
 * @return {number} The device orientation's beta value
 */
gdjs.deviceSensors.orientation.getOrientationBeta = function() {
  return gdjs.deviceSensors.orientation._beta;
};

/**
 * Get the value of the device orientations gamma as a number (Range: -90 to 90)
 * @return {number} The device orientation's gamma value
 */
gdjs.deviceSensors.orientation.getOrientationGamma = function() {
  return gdjs.deviceSensors.orientation._gamma;
};
