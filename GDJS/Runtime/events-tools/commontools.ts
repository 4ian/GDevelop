/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace common {
      /**
       * Get the value of a variable. Equivalent to `variable.getAsNumber()`.
       * @param variable Variable.
       * @returns The content of the variable, as a number.
       */
      export const getVariableNumber = function (
        variable: gdjs.Variable
      ): number {
        return variable.getAsNumber();
      };

      /**
       * Get the string of a variable. Equivalent to `variable.getAsString()`.
       * @param variable Variable.
       * @returns The content of the variable, as a string.
       */
      export const getVariableString = function (
        variable: gdjs.Variable
      ): string {
        return variable.getAsString();
      };

      /**
       * Compares the boolean value of a variable.
       * Equivalent to `variable.getAsBoolean() === boolean`.
       * This shortcut function is needed for events code generation.
       *
       * @param {gdjs.Variable} variable
       * @param {boolean} compareWith
       * @returns {boolean}
       * @private
       */
      export const getVariableBoolean = function (
        variable: gdjs.Variable,
        compareWith: boolean
      ): boolean {
        return variable.getAsBoolean() === compareWith;
      };

      /**
       * Set the boolean value of a variable. Equivalent to `variable.setBoolean()`.
       * This shortcut function is needed for events code generation.
       *
       * @param {gdjs.Variable} variable
       * @param {boolean} bool The new boolean value of the variable.
       * @private
       */
      export const setVariableBoolean = function (
        variable: gdjs.Variable,
        newValue: boolean
      ) {
        variable.setBoolean(newValue);
      };

      /**
       * Toggles the boolean value of a variable.
       * @param {gdjs.Variable} variable Variable.
       * @private
       */
      export const toggleVariableBoolean = function (variable: gdjs.Variable) {
        variable.setBoolean(!variable.getAsBoolean());
      };

      /**
       * Check if a scene variable exists.
       * @param runtimeScene The scene.
       * @param variableName Name of the scene variable.
       * @returns true if the scene variable exits, false otherwise.
       */
      export const sceneVariableExists = function (
        runtimeScene: gdjs.RuntimeScene,
        variableName: string
      ): boolean {
        return runtimeScene.getVariables().has(variableName);
      };

      /**
       * Check if a global variable exists.
       * @param runtimeScene The scene.
       * @param variableName Name of the global variable.
       * @returns true if the global variable exits, false otherwise.
       */
      export const globalVariableExists = function (
        runtimeScene: gdjs.RuntimeScene,
        variableName: string
      ): boolean {
        return runtimeScene.getGame().getVariables().has(variableName);
      };

      /**
       * Check if a child exists in a variable.
       * @param variable Variable.
       * @param childName Name of the child.
       * @returns true if child exist in the variable, false otherwise.
       */
      export const variableChildExists = function (
        variable: gdjs.Variable,
        childName: string
      ): boolean {
        return variable.hasChild(childName);
      };

      /**
       * Remove the child with the given name in a variable.
       * @param variable Variable.
       * @param childName Name of the child.
       * @returns The new variable, with the child removed.
       */
      export const variableRemoveChild = function (
        variable: gdjs.Variable,
        childName: string
      ): void {
        variable.removeChild(childName);
      };

      /**
       * Clear the children in a variable.
       * @param variable Variable.
       */
      export const variableClearChildren = function (variable: gdjs.Variable) {
        variable.clearChildren();
      };

      /**
       * Pushes a variable onto an array.
       * @param {gdjs.Variable} array
       * @param {gdjs.Variable} variable
       * @private
       */
      export const variablePushCopy = function (
        array: gdjs.Variable,
        variable: gdjs.Variable
      ) {
        array.pushVariableCopy(variable);
      };

      /**
       * Pushes a value onto an array.
       * @param {gdjs.Variable} array
       * @param {string | float | boolean} value
       * @private
       */
      export const valuePush = function (
        array: gdjs.Variable,
        value: string | float | boolean
      ) {
        array.pushValue(value);
      };

      /**
       * Removes an index from an array.
       *
       * @param {gdjs.Variable} array
       * @param {number} index
       * @private
       */
      export const variableRemoveAt = function (
        array: gdjs.Variable,
        index: number
      ) {
        array.removeAtIndex(index);
      };

      /**
       * Get the number of children in a variable.
       * @param variable Variable.
       * @returns The number of children in the variable.
       */
      export const getVariableChildCount = function (
        variable: gdjs.Variable
      ): number {
        return variable.getChildrenCount();
      };

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
      export const clamp = function (
        x: float,
        min: number,
        max: float
      ): number {
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
       * This is also known as g=etting the cartesian coordinates of a 2D vector, using its polar coordinates.
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
    }
  }
}
