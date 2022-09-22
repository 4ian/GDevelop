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
      export const toUpperCase = function (str: string) {
        return str.toUpperCase();
      };

      /**
       * Return the lowercased version of the string.
       */
      export const toLowerCase = function (str: string) {
        return str.toLowerCase();
      };

      /**
       * Return a new string containing the substring of the original string.
       */
      export const subStr = function (
        str: string,
        start: integer,
        len: integer
      ) {
        if (start < str.length && start >= 0) {
          return str.substr(start, len);
        }
        return '';
      };

      /**
       * Return a new string containing the character at the specified position.
       */
      export const strAt = function (str: string, start: integer) {
        if (start < str.length && start >= 0) {
          return str.substr(start, 1);
        }
        return '';
      };

      /**
       * Return the string repeated.
       */
      export const strRepeat = function (str: string, count: integer) {
        let result = '';
        for (let i = 0; i < count; i++) {
          result += str;
        }
        return result;
      };

      /**
       * Return the length of the string
       */
      export const strLen = function (str: string) {
        return str.length;
      };

      /**
       * Search the first occurrence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFind = function (str: string, what: string) {
        return str.indexOf(what);
      };

      /**
       * Search the last occurrence in a string (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindLast = function (str: string, what: string) {
        return str.lastIndexOf(what);
      };

      /**
       * @deprecated
       */
      export const strRFind = gdjs.evtTools.string.strFindLast;

      /**
       * Search the first occurrence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindFrom = function (
        str: string,
        what: string,
        pos: integer
      ) {
        return str.indexOf(what, pos);
      };

      /**
       * Search the last occurrence in a string, starting from a specified position (return the position of the result, from the beginning of the string, or -1 if not found)
       */
      export const strFindLastFrom = function (
        str: string,
        what: string,
        pos: integer
      ) {
        return str.lastIndexOf(what, pos);
      };

      /**
       * @deprecated
       */
      export const strRFindFrom = gdjs.evtTools.string.strFindLastFrom;
    }
  }
}
