/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    /**
     * Tools related to strings manipulation, for events generated code.
     */
    export namespace string {
      /**
       * Return a string containing a new line character.
       */
      export const newLine = function () {
        return '\n';
      };

      /**
       * Return a character from its codepoint.
       */
      export const fromCodePoint = function (codePoint) {
        return String.fromCodePoint(codePoint);
      };

      /**
       * Return the uppercased version of the string.
       */
      export const toUpperCase = function (str) {
        return str.toUpperCase();
      };

      /**
       * Return the lowercased version of the string.
       */
      export const toLowerCase = function (str) {
        return str.toLowerCase();
      };

      /**
       * Return a new string containing the substring of the original string.
       */
      export const subStr = function (str, start, len) {
        if (start < str.length && start >= 0) {
          return str.substr(start, len);
        }
        return '';
      };

      /**
       * Return a new string containing the character at the specified position.
       */
      export const strAt = function (str, start) {
        if (start < str.length && start >= 0) {
          return str.substr(start, 1);
        }
        return '';
      };

      /**
       * Return the string repeated.
       */
      export const strRepeat = function (str, count) {
        let result = '';
        for (let i = 0; i < count; i++) {
          result += str;
        }
        return result;
      };

      /**
       * Return the length of the string
       */
      export const strLen = function (str) {
        return str.length;
      };

      /**
       * Search the first occurence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFind = function (str, what) {
        return str.indexOf(what);
      };

      /**
       * Search the last occurence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindLast = function (str, what) {
        return str.lastIndexOf(what);
      };

      /**
       * @deprecated
       */
      export const strRFind = gdjs.evtTools.string.strFindLast;

      /**
       * Search the first occurence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindFrom = function (str, what, pos) {
        return str.indexOf(what, pos);
      };

      /**
       * Search the last occurence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindLastFrom = function (str, what, pos) {
        return str.lastIndexOf(what, pos);
      };

      /**
       * @deprecated
       */
      export const strRFindFrom = gdjs.evtTools.string.strFindLastFrom;
    }
  }
}
