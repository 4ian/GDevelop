namespace gdjs {
  /**
   * @memberof gdjs
   * @class deviceVibration
   * @static
   */
  gdjs.deviceVibration = {};

  /**
   * Vibrate the mobile device.
   * @param duration Value in milliseconds.
   */
  gdjs.deviceVibration.startVibration = function (duration: number) {
    if (typeof navigator == 'undefined' || !navigator.vibrate) {
      return;
    }
    navigator.vibrate([duration]);
  };

  /**
   * Vibrate the mobile device in a pattern.
   * You can add multiple comma separated values where every second one determines the silence between vibrations.
   * Example: "200,1000,500" (200ms vibration, 1sec silense, 500ms vibration)
   * @param intervals Comma separated list of values (in ms).
   */
  gdjs.deviceVibration.startVibrationPattern = function (intervals: string) {
    const pattern = '^[0-9]+(,[0-9]+)*$';
    if (typeof navigator == 'undefined' || !navigator.vibrate) {
      return;
    }
    if (intervals.match(pattern)) {
      navigator.vibrate(intervals.split(','));
    }
  };

  /**
   * Stop the current vibration on the mobile device.
   */
  gdjs.deviceVibration.stopVibration = function () {
    if (typeof navigator == 'undefined' || !navigator.vibrate) {
      return;
    }
    navigator.vibrate([]);
  };
}
