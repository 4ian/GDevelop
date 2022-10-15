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
       * Runs a linear interpolation between a and b.
       * @param a Start value.
       * @param b End value.
       * @param x The interpolation value between 0 and 1.
       * @returns The interpolated value, now between a and b.
       */
      export const lerp = function (a: number, b: integer, x: float): number {
        return a + (b - a) * x;
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
    }
  }
}
