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
       * Get the number of children in a variable.
       * @param variable Variable.
       * @returns The number of children in the variable.
       */
      export const getVariableChildCount = function (
        variable: gdjs.Variable
      ): number {
        if (variable.isStructure() == false) {
          return 0;
        }
        return Object.keys(variable.getAllChildren()).length;
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
    }
  }
}
