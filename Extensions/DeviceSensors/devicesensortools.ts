namespace gdjs {
  /**
   * @memberof gdjs
   * @class deviceSensors
   * @static
   */
  gdjs.deviceSensors = {
    orientation: {
      _isActive: false,
      _absolute: 0,
      _alpha: 0,
      _beta: 0,
      _gamma: 0,
    },
    motion: {
      _isActive: false,
      _rotationAlpha: 0,
      _rotationBeta: 0,
      _rotationGamma: 0,
      _accelerationX: 0,
      _accelerationY: 0,
      _accelerationZ: 0,
    },
  };

  /**
   * Activate the orientation sensor's listener.
   */
  gdjs.deviceSensors.orientation._activateOrientationListener = function () {
    window.addEventListener(
      'deviceorientation',
      gdjs.deviceSensors.orientation._handleOrientation,
      true
    );
    gdjs.deviceSensors.orientation._isActive = true;
  };

  /**
   * Deactivate the orientation sensor's listener.
   */
  gdjs.deviceSensors.orientation._deactivateOrientationListener = function () {
    window.removeEventListener(
      'deviceorientation',
      gdjs.deviceSensors.orientation._handleOrientation,
      true
    );
    gdjs.deviceSensors.orientation._isActive = false;
  };

  /**
   * Orientation sensor event callback function.
   */
  gdjs.deviceSensors.orientation._handleOrientation = function (event) {
    gdjs.deviceSensors.orientation._absolute = event.absolute
      ? event.absolute
      : 0;
    gdjs.deviceSensors.orientation._alpha = event.alpha ? event.alpha : 0;
    gdjs.deviceSensors.orientation._beta = event.beta ? event.beta : 0;
    gdjs.deviceSensors.orientation._gamma = event.gamma ? event.gamma : 0;
  };

  /**
   * Activate the orientation sensor
   */
  gdjs.deviceSensors.orientation.activateOrientationSensor = function () {
    gdjs.deviceSensors.orientation._activateOrientationListener();
  };

  /**
   * Deactivate the orientation sensor
   */
  gdjs.deviceSensors.orientation.deactivateOrientationSensor = function () {
    gdjs.deviceSensors.orientation._deactivateOrientationListener();
  };

  /**
   * Check if the orientation sensor is currently active
   * @return The activation state of the orientation sensor (0=false/1=true)
   */
  gdjs.deviceSensors.orientation.isActive = function (): number {
    return gdjs.deviceSensors.orientation._isActive;
  };

  /**
   * Get the value of the device orientation's absolute as a number
   * @return The device orientation's absolute value
   */
  gdjs.deviceSensors.orientation.getOrientationAbsolute = function (): number {
    return gdjs.deviceSensors.orientation._absolute;
  };

  /**
   * Get the value of the device orientation's alpha as a number (Range: 0 to 360)
   * @return The device orientation's alpha value
   */
  gdjs.deviceSensors.orientation.getOrientationAlpha = function (): number {
    return gdjs.deviceSensors.orientation._alpha;
  };

  /**
   * Get the value of the device orientation's beta as a number (Range: -180 to 180)
   * @return The device orientation's beta value
   */
  gdjs.deviceSensors.orientation.getOrientationBeta = function (): number {
    return gdjs.deviceSensors.orientation._beta;
  };

  /**
   * Get the value of the device orientation's gamma as a number (Range: -90 to 90)
   * @return The device orientation's gamma value
   */
  gdjs.deviceSensors.orientation.getOrientationGamma = function (): number {
    return gdjs.deviceSensors.orientation._gamma;
  };

  /**
   * Activate the motion sensor's listener.
   */
  gdjs.deviceSensors.motion._activateMotionListener = function () {
    window.addEventListener(
      'devicemotion',
      gdjs.deviceSensors.motion._handleMotion,
      true
    );
    gdjs.deviceSensors.motion._isActive = true;
  };

  /**
   * Deactivate the motion sensor's listener.
   */
  gdjs.deviceSensors.motion._deactivateMotionListener = function () {
    window.removeEventListener(
      'devicemotion',
      gdjs.deviceSensors.motion._handleMotion,
      true
    );
    gdjs.deviceSensors.motion._isActive = false;
  };

  /**
   * Motion sensor event callback function.
   */
  gdjs.deviceSensors.motion._handleMotion = function (event) {
    if (event.accelerationIncludingGravity) {
      gdjs.deviceSensors.motion._accelerationX = event
        .accelerationIncludingGravity.x
        ? event.accelerationIncludingGravity.x
        : 0;
      gdjs.deviceSensors.motion._accelerationY = event
        .accelerationIncludingGravity.y
        ? event.accelerationIncludingGravity.y
        : 0;
      gdjs.deviceSensors.motion._accelerationZ = event
        .accelerationIncludingGravity.z
        ? event.accelerationIncludingGravity.z
        : 0;
    }
    if (event.rotationRate) {
      gdjs.deviceSensors.motion._rotationAlpha = event.rotationRate.alpha
        ? event.rotationRate.alpha
        : 0;
      gdjs.deviceSensors.motion._rotationBeta = event.rotationRate.beta
        ? event.rotationRate.beta
        : 0;
      gdjs.deviceSensors.motion._rotationGamma = event.rotationRate.gamma
        ? event.rotationRate.gamma
        : 0;
    }
  };

  /**
   * Activate the motion sensor
   */
  gdjs.deviceSensors.motion.activateMotionSensor = function () {
    gdjs.deviceSensors.motion._activateMotionListener();
  };

  /**
   * Deactivate the motion sensor
   */
  gdjs.deviceSensors.motion.deactivateMotionSensor = function () {
    gdjs.deviceSensors.motion._deactivateMotionListener();
  };

  /**
   * Check if the motion sensor is currently active
   * @return The activation state of the motion sensor (0=false/1=true)
   */
  gdjs.deviceSensors.motion.isActive = function (): number {
    return gdjs.deviceSensors.motion._isActive;
  };

  /**
   * Get the alpha rotation rate as a number
   * @return The rotation alpha value
   */
  gdjs.deviceSensors.motion.getRotationAlpha = function (): number {
    return gdjs.deviceSensors.motion._rotationAlpha;
  };

  /**
   * Get the beta rotation rate as a number
   * @return The rotation beta value
   */
  gdjs.deviceSensors.motion.getRotationBeta = function (): number {
    return gdjs.deviceSensors.motion._rotationBeta;
  };

  /**
   * Get the gamma rotation rate as a number
   * @return The rotation gamma value
   */
  gdjs.deviceSensors.motion.getRotationGamma = function (): number {
    return gdjs.deviceSensors.motion._rotationGamma;
  };

  /**
   * Get the acceleration value on the X-axis as a number
   * @return Acceleration on the X-axis
   */
  gdjs.deviceSensors.motion.getAccelerationX = function (): number {
    return gdjs.deviceSensors.motion._accelerationX;
  };

  /**
   * Get the acceleration value on the Y-axis as a number
   * @return Acceleration on the Y-axis
   */
  gdjs.deviceSensors.motion.getAccelerationY = function (): number {
    return gdjs.deviceSensors.motion._accelerationY;
  };

  /**
   * Get the acceleration value on the Z-axis as a number
   * @return Acceleration on the Z-axis
   */
  gdjs.deviceSensors.motion.getAccelerationZ = function (): number {
    return gdjs.deviceSensors.motion._accelerationZ;
  };
}
