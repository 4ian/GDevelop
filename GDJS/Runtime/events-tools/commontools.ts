/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace common {
      /**
       * Convert a string to a number.
       * @param str String to convert.
       * @returns The parsed number, or NaN if invalid.
       */
      export const toNumber = function (str: string): number {
        return parseFloat(str);
      };

      /**
       * Convert a number to a string.
       * @param num Value to convert to a string.
       * @returns The value as a string.
       */
      export const toString = function (num: number): string {
        //Using String literal is fastest than using toString according to
        //http://jsperf.com/number-to-string/2 and http://jsben.ch/#/ghQYR
        return '' + num;
      };

      /**
       * Negate the boolean.
       * @param bool The boolean to negate.
       * @returns The negated value.
       */
      export const logicalNegation = function (bool: boolean): boolean {
        return !bool;
      };

      /**
       * Normalize a value between `min` and `max` to a value between 0 and 1.
       * @param {number} val The value to normalize
       * @param {number} min The minimum
       * @param {number} max The maximum
       * @returns The normalized value between 0 and 1
       */
      export const normalize = function (
        val: float,
        min: float,
        max: float
      ): number {
        return min === max ? max : (val - min) / (max - min);
      };

      /**
       * Limit a value to a range.
       * @param x Value.
       * @param min The minimum value.
       * @param max The  maximum value.
       * @returns The new value.
       */
      export const clamp = function (x: float, min: float, max: float): float {
        return Math.min(Math.max(x, min), max);
      };

      /**
       * Hyperbolic arc-cosine
       * @param arg Value.
       * @returns The hyperbolic arc-cosine for the value.
       */
      export const acosh = function (arg: integer): number {
        // http://kevin.vanzonneveld.net
        // +   original by: Onno Marsman
        return Math.log(arg + Math.sqrt(arg * arg - 1));
      };

      /**
       * Hyperbolic arcsine
       * @param arg Value.
       * @returns The hyperbolic arcsine for the value.
       */
      export const asinh = function (arg: integer): number {
        // http://kevin.vanzonneveld.net
        // +   original by: Onno Marsman
        return Math.log(arg + Math.sqrt(arg * arg + 1));
      };

      /**
       * Hyperbolic arctangent
       * @param arg Value.
       * @returns The hyperbolic arctangent for the value.
       */
      export const atanh = function (arg: integer): number {
        // http://kevin.vanzonneveld.net
        // +   original by: Onno Marsman
        return 0.5 * Math.log((1 + arg) / (1 - arg));
      };

      /**
       * Hyperbolic cosine
       * @param arg Value.
       * @returns The hyperbolic cosine for the value.
       */
      export const cosh = function (arg: integer): number {
        return (Math.exp(arg) + Math.exp(-arg)) / 2;
      };

      /**
       * Hyperbolic sine
       * @param arg Value.
       * @returns The hyperbolic sine for the value.
       */
      export const sinh = function (arg: integer): number {
        return (Math.exp(arg) - Math.exp(-arg)) / 2;
      };

      /**
       * Hyperbolic tangent
       * @param arg Value.
       * @returns The hyperbolic tangent for the value.
       */
      export const tanh = function (arg: integer): number {
        return (
          (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg))
        );
      };

      /**
       * Cotangent
       * @param arg Value.
       * @returns The cotangent for the value.
       */
      export const cot = function (arg: integer): number {
        return 1 / Math.tan(arg);
      };

      /**
       * Cosecant
       * @param arg Value.
       * @returns The cosecant for the value.
       */
      export const csc = function (arg: integer): number {
        return 1 / Math.sin(arg);
      };

      /**
       * Secant
       * @param arg Value.
       * @returns The secant for the value.
       */
      export const sec = function (arg: integer): number {
        return 1 / Math.cos(arg);
      };

      /**
       * Base-10 logarithm
       * @param arg Value.
       * @returns The base-10 logarithm for the value.
       */
      export const log10 = function (arg: integer): number {
        return Math.log(arg) / Math.LN10;
      };

      /**
       * Base-2 logarithm
       * @param arg Value.
       * @returns The base-2 logarithm for the value.
       */
      export const log2 = function (arg: integer): number {
        return Math.log(arg) / Math.LN2;
      };

      /**
       * Returns the sign of the number. This checks if the value is positive, negative or zero.
       * @param arg Value.
       * @returns Return the sign for the value (1, -1 or 0).
       */
      export const sign = function (arg: integer): number {
        if (arg === 0) {
          return 0;
        }
        return arg > 0 ? +1 : -1;
      };

      /**
       * Cube root
       * @param x Value.
       * @returns Return the cube root for the value.
       */
      export const cbrt = function (x: float): number {
        return Math.pow(x, 1 / 3);
      };

      /**
       * N-th root
       * @param x Base value.
       * @param n Exponent value.
       * @returns Return the n-th root for the value.
       */
      export const nthroot = function (x: float, n: number): number {
        return Math.pow(x, 1 / n);
      };

      /**
       * Modulo operation (the remainder after dividing one number by another)
       * @param x Dividend value.
       * @param y Divisor value.
       * @returns Return the remainder for the values.
       */
      export const mod = function (x: float, y: float): number {
        return x - y * Math.floor(x / y);
      };

      /**
       * Returns the difference between two angles, in degrees.
       * @param angle1 First angle, in degrees.
       * @param angle2 Second angle, in degrees.
       * @returns Return the difference of the angles, in degrees.
       */
      export const angleDifference = function (
        angle1: number,
        angle2: number
      ): number {
        return (
          gdjs.evtTools.common.mod(
            gdjs.evtTools.common.mod(angle1 - angle2, 360.0) + 180.0,
            360.0
          ) - 180.0
        );
      };

      /**
       * Returns the angle, in degrees, between two positions.
       * @param x1 First point X position.
       * @param y1 First point Y position.
       * @param x2 Second point X position.
       * @param y2 Second point Y position.
       * @returns The angle between the positions, in degrees.
       */
      export const angleBetweenPositions = function (
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): number {
        return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      };

      /**
       * Returns the distance, in pixels, between two positions.
       * @param x1 First point X position.
       * @param y1 First point Y position.
       * @param x2 Second point X position.
       * @param y2 Second point Y position.
       * @returns The distance between the positions, in pixels.
       */
      export const distanceBetweenPositions = function (
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      };

      /**
       * Return a linear interpolation between a and b.
       *
       * For instance, `lerp(2, 8, 0.5)` is `5`.
       *
       * @param a Start value.
       * @param b End value.
       * @param x The interpolation value between 0 and 1.
       * @returns The interpolated value, now between a and b.
       */
      export const lerp = function (a: number, b: integer, x: float): number {
        return a + (b - a) * x;
      };

      /**
       * Return an exponential interpolation between `start` and `end`.
       *
       * For instance, `exponentialInterpolation(2, 8, 0.5)` is `4`.
       *
       * @param start Start value.
       * @param end End value.
       * @param progress The interpolation value between 0 and 1.
       * @returns The interpolated value.
       */
      export const exponentialInterpolation = (
        start: float,
        end: float,
        progress: float
      ) => {
        if (progress === 0) {
          return start;
        }
        if (progress === 1) {
          return end;
        }
        if (start <= 0 || end <= 0) {
          // The exponential function is flattened to something like a 90° corner.
          return 0;
        }
        const startLog = Math.log(start);
        const endLog = Math.log(end);
        return Math.exp(startLog + (endLog - startLog) * progress);
      };

      /**
       * Truncate a number.
       * @param x Value.
       * @returns Return the value with all decimal places dropped.
       */
      export const trunc = function (x: float): number {
        return x | 0;
      };

      /**
       * Compute the X position when given an angle and distance relative to the origin (0;0).
       * This is also known as getting the cartesian coordinates of a 2D vector, using its polar coordinates.
       * @param angle The angle, in degrees.
       * @param distance The distance from the object, in pixels.
       */
      export const getXFromAngleAndDistance = function (
        angle: float,
        distance: float
      ): number {
        return distance * Math.cos(gdjs.toRad(angle));
      };

      /**
       * Compute the Y position when given an angle and distance relative to the origin (0;0).
       * This is also known as getting the cartesian coordinates of a 2D vector, using its polar coordinates.
       * @param angle The angle, in degrees.
       * @param distance The distance from the object, in pixels.
       */
      export const getYFromAngleAndDistance = function (
        angle: float,
        distance: float
      ): number {
        return distance * Math.sin(gdjs.toRad(angle));
      };

      /**
       * Rounds a number to the Nth decimal place
       * @param {float} value
       * @param {number} decimalPlace
       * @returns the rounded value
       */
      export const roundTo = function (
        value: float,
        decimalPlace: number
      ): number {
        if (!decimalPlace || !Number.isInteger(decimalPlace))
          return Math.round(value);
        return (
          Math.round(value * Math.pow(10, decimalPlace)) /
          Math.pow(10, decimalPlace)
        );
      };

      /**
       * Rounds down a number to the Nth decimal place
       * @param {float} value
       * @param {number} decimalPlace
       * @returns the rounded value
       */
      export const floorTo = function (
        value: float,
        decimalPlace: number
      ): number {
        if (!decimalPlace || !Number.isInteger(decimalPlace))
          return Math.floor(value);
        return (
          Math.floor(value * Math.pow(10, decimalPlace)) /
          Math.pow(10, decimalPlace)
        );
      };

      /**
       * Rounds up a number to the Nth decimal place
       * @param {float} value
       * @param {number} decimalPlace
       * @returns the rounded value
       */
      export const ceilTo = function (
        value: float,
        decimalPlace: number
      ): number {
        if (!decimalPlace || !Number.isInteger(decimalPlace))
          return Math.ceil(value);
        return (
          Math.ceil(value * Math.pow(10, decimalPlace)) /
          Math.pow(10, decimalPlace)
        );
      };

      /**
       * Pi 3.1415...
       * @returns the Pi number
       */
      export const pi = function (): number {
        return Math.PI;
      };

      /**
       * Linearly interpolates between two angles (in degrees) by taking the shortest direction around the circle.
       * @param angle1 Starting angle, in degrees.
       * @param angle2 Destination angle, in degrees.
       * @param x The interpolation value between 0 and 1.
       * @returns Return the interpolated angle, in degrees.
       */
      export const lerpAngle = function (
        angle1: float,
        angle2: float,
        x: float
      ): float {
        return (
          angle1 + gdjs.evtTools.common.angleDifference(angle2, angle1) * x
        );
      };

      export const resolveAsyncEventsFunction = (
        eventsFunctionContext: EventsFunctionContext
      ) => {
        if (
          !!eventsFunctionContext &&
          !!eventsFunctionContext.task &&
          !!eventsFunctionContext.task.resolve
        )
          eventsFunctionContext.task.resolve();
      };

      const checkIsMobile = (): boolean => {
        if (typeof cc !== 'undefined' && cc.sys) {
          return cc.sys.isMobile;
        }
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Cocoon'.
        else if (typeof Cocoon !== 'undefined' && Cocoon.App) {
          return true;
        } else if (typeof window !== 'undefined' && (window as any).cordova) {
          return true;
        } else if (typeof window !== 'undefined') {
          // Try to detect mobile device browsers.
          if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
              navigator.userAgent
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
              navigator.userAgent.substr(0, 4)
            )
          ) {
            return true;
          }

          // Try to detect iOS
          if (/iPad|iPhone|iPod/.test(navigator.platform)) {
            return true;
          } else {
            if (/MacIntel/.test(navigator.platform)) {
              // Work around for recent iPads that are "desktop-class browsing".
              // We can still detect them using their touchscreen, but this is a hack.
              // If mac laptops start to support touchscreens, this won't work anymore. Hence it's better
              // to test for the presence of a touchscreen if needed rather than checking if the device
              // is "mobile".
              return !!navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
            }
          }
        }

        return false;
      };

      let cachedIsMobile: boolean | null = null;
      /**
       * Check if the game runs on a mobile device (iPhone, iPad, Android).
       * Note that the distinction between what is a mobile device and what is not
       * is becoming blurry. If you use this for mobile controls,
       * prefer to check if the device has touchscreen support.
       */
      export const isMobile = (): boolean => {
        if (cachedIsMobile !== null) {
          return cachedIsMobile;
        }
        return (cachedIsMobile = checkIsMobile());
      };
    }
  }
}
