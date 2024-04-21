namespace gdjs {
  export namespace deviceVibration {
    /**
     * Vibrate the mobile device.
     * @param duration Value in milliseconds.
     */
    export const startVibration = function (duration: number) {
      if (typeof navigator == 'undefined' || !navigator.vibrate) {
        return;
      }
      navigator.vibrate([duration]);
    };

    /**
     * Vibrate the mobile device in a pattern.
     * You can add multiple comma separated values where every second one determines the silence between vibrations.
     * Example: "200,1000,500" (200ms vibration, 1sec silence, 500ms vibration)
     * @param intervals Comma separated list of values (in ms).
     */
    export const startVibrationPattern = function (intervals: string) {
      const pattern = '^[0-9]+(,[0-9]+)*$';
      if (typeof navigator == 'undefined' || !navigator.vibrate) {
        return;
      }
      if (intervals.match(pattern)) {
        navigator.vibrate(
          intervals.split(',').map((duration) => parseFloat(duration))
        );
      }
    };

    /**
     * Stop the current vibration on the mobile device.
     */
    export const stopVibration = function () {
      if (typeof navigator == 'undefined' || !navigator.vibrate) {
        return;
      }
      navigator.vibrate([]);
    };
  }
}
