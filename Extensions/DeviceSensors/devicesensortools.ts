namespace gdjs {
  export namespace deviceSensors {
    export namespace orientation {
      let _isActive = false;
      let _absolute = 0;
      let _alpha = 0;
      let _beta = 0;
      let _gamma = 0;

      /**
       * Activate the orientation sensor's listener.
       */
      export const _activateOrientationListener = function () {
        window.addEventListener(
          'deviceorientation',
          gdjs.deviceSensors.orientation._handleOrientation,
          true
        );
        _isActive = true;
      };

      /**
       * Deactivate the orientation sensor's listener.
       */
      export const _deactivateOrientationListener = function () {
        window.removeEventListener(
          'deviceorientation',
          gdjs.deviceSensors.orientation._handleOrientation,
          true
        );
        _isActive = false;
      };

      /**
       * Orientation sensor event callback function.
       */
      export const _handleOrientation = function (event) {
        _absolute = event.absolute ? event.absolute : 0;
        _alpha = event.alpha ? event.alpha : 0;
        _beta = event.beta ? event.beta : 0;
        _gamma = event.gamma ? event.gamma : 0;
      };

      /**
       * Activate the orientation sensor
       */
      export const activateOrientationSensor = function () {
        gdjs.deviceSensors.orientation._activateOrientationListener();
      };

      /**
       * Deactivate the orientation sensor
       */
      export const deactivateOrientationSensor = function () {
        gdjs.deviceSensors.orientation._deactivateOrientationListener();
      };

      /**
       * Check if the orientation sensor is currently active
       * @return The activation state of the orientation sensor
       */
      export const isActive = function (): boolean {
        return _isActive;
      };

      /**
       * Get the value of the device orientation's absolute as a number
       * @return The device orientation's absolute value
       */
      export const getOrientationAbsolute = function (): number {
        return _absolute;
      };

      /**
       * Get the value of the device orientation's alpha as a number (Range: 0 to 360)
       * @return The device orientation's alpha value
       */
      export const getOrientationAlpha = function (): number {
        return _alpha;
      };

      /**
       * Get the value of the device orientation's beta as a number (Range: -180 to 180)
       * @return The device orientation's beta value
       */
      export const getOrientationBeta = function (): number {
        return _beta;
      };

      /**
       * Get the value of the device orientation's gamma as a number (Range: -90 to 90)
       * @return The device orientation's gamma value
       */
      export const getOrientationGamma = function (): number {
        return _gamma;
      };
    }

    export namespace motion {
      let _isActive = false;
      let _rotationAlpha = 0;
      let _rotationBeta = 0;
      let _rotationGamma = 0;
      let _accelerationX = 0;
      let _accelerationY = 0;
      let _accelerationZ = 0;

      /**
       * Activate the motion sensor's listener.
       */
      export const _activateMotionListener = function () {
        window.addEventListener(
          'devicemotion',
          gdjs.deviceSensors.motion._handleMotion,
          true
        );
        _isActive = true;
      };

      /**
       * Deactivate the motion sensor's listener.
       */
      export const _deactivateMotionListener = function () {
        window.removeEventListener(
          'devicemotion',
          gdjs.deviceSensors.motion._handleMotion,
          true
        );
        _isActive = false;
      };

      /**
       * Motion sensor event callback function.
       */
      export const _handleMotion = function (event) {
        if (event.accelerationIncludingGravity) {
          _accelerationX = event.accelerationIncludingGravity.x
            ? event.accelerationIncludingGravity.x
            : 0;
          _accelerationY = event.accelerationIncludingGravity.y
            ? event.accelerationIncludingGravity.y
            : 0;
          _accelerationZ = event.accelerationIncludingGravity.z
            ? event.accelerationIncludingGravity.z
            : 0;
        }
        if (event.rotationRate) {
          _rotationAlpha = event.rotationRate.alpha
            ? event.rotationRate.alpha
            : 0;
          _rotationBeta = event.rotationRate.beta ? event.rotationRate.beta : 0;
          _rotationGamma = event.rotationRate.gamma
            ? event.rotationRate.gamma
            : 0;
        }
      };

      /**
       * Activate the motion sensor
       */
      export const activateMotionSensor = function () {
        gdjs.deviceSensors.motion._activateMotionListener();
      };

      /**
       * Deactivate the motion sensor
       */
      export const deactivateMotionSensor = function () {
        gdjs.deviceSensors.motion._deactivateMotionListener();
      };

      /**
       * Check if the motion sensor is currently active
       * @return The activation state of the motion sensor
       */
      export const isActive = function (): boolean {
        return _isActive;
      };

      /**
       * Get the alpha rotation rate as a number
       * @return The rotation alpha value
       */
      export const getRotationAlpha = function (): number {
        return _rotationAlpha;
      };

      /**
       * Get the beta rotation rate as a number
       * @return The rotation beta value
       */
      export const getRotationBeta = function (): number {
        return _rotationBeta;
      };

      /**
       * Get the gamma rotation rate as a number
       * @return The rotation gamma value
       */
      export const getRotationGamma = function (): number {
        return _rotationGamma;
      };

      /**
       * Get the acceleration value on the X-axis as a number
       * @return Acceleration on the X-axis
       */
      export const getAccelerationX = function (): number {
        return _accelerationX;
      };

      /**
       * Get the acceleration value on the Y-axis as a number
       * @return Acceleration on the Y-axis
       */
      export const getAccelerationY = function (): number {
        return _accelerationY;
      };

      /**
       * Get the acceleration value on the Z-axis as a number
       * @return Acceleration on the Z-axis
       */
      export const getAccelerationZ = function (): number {
        return _accelerationZ;
      };
    }
  }
}
