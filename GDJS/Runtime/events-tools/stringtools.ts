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
       * Return a new string with the content of `str` where the first occurrence of `pattern`
       * is replaced by `replacement`.
       */
      export const strReplaceOne = function (
        str: string,
        pattern: string,
        replacement: string
      ) {
        return str.replace(pattern, replacement);
      };

      /**
       * Return a new string with the content of `str` where all occurrences of `pattern`
       * are replaced by `replacement`.
       */
      export const strReplaceAll = function (
        str: string,
        pattern: string,
        replacement: string
      ) {
        let updatedStr = str;
        let searchStartPosition = 0;

        let patternPosition = updatedStr.indexOf(pattern, searchStartPosition);
        while (patternPosition !== -1) {
          // Replace the pattern by the replacement.
          updatedStr =
            updatedStr.substring(0, patternPosition) +
            replacement +
            updatedStr.substring(
              patternPosition + pattern.length,
              updatedStr.length
            );

          // Start the search again after the replacement.
          // If the pattern to search is empty, add 1 because an empty pattern means that every "empty
          // space" between each character will be matched. If we don't add 1, we would match again the
          // "empty space" just after where we added the replacement.
          searchStartPosition =
            patternPosition +
            replacement.length +
            (pattern.length === 0 ? 1 : 0);

          // An empty string `indexOf` will return 0 when the pattern is an empty string,
          // even if `searchStartPosition` is *after* the end of the string.
          // So bail out manually.
          // Note that if we are just at the end of the string (`searchStartPosition === updatedStr.length`),
          // it's still valid to do a search because if the pattern is an empty string,
          // it should match the "empty space" which is at the very end.
          if (searchStartPosition > updatedStr.length) break;
          patternPosition = updatedStr.indexOf(pattern, searchStartPosition);
        }

        return updatedStr;
      };

      /**
       * @deprecated
       */
      export const strRFindFrom = gdjs.evtTools.string.strFindLastFrom;
    }
  }
}
