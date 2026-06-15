// @flow
import { type I18n } from '@lingui/core';

type TranslationFunction = (string => string) | null;
type NotNullTranslationFunction = string => string;

// Avoid flooding the console: only report each string that can't be
// translated once.
const alreadyReportedUntranslatableStrings: Set<string> = new Set();

/**
 * Translate a string using the given i18n module, but never throw.
 *
 * `i18n._` parses the given string as an ICU MessageFormat message. If the
 * string happens to contain something that looks like a malformed ICU token
 * (e.g. `{value, somethingUnknown}` coming from user authored extension/project
 * content), Lingui throws (`formatters[type] is not a function`). As this
 * function is called from libGD.js during functions/extensions generation, such
 * a throw would abort the whole generation. Instead, fall back to the raw,
 * untranslated string so generation can keep going.
 */
const safelyTranslate = (i18nModule: I18n, str: string): string => {
  try {
    return i18nModule._(str);
  } catch (error) {
    if (!alreadyReportedUntranslatableStrings.has(str)) {
      alreadyReportedUntranslatableStrings.add(str);
      console.warn(
        `Could not translate a string (returning it untranslated). The string is probably interpreted as a malformed ICU MessageFormat message: "${str}"`,
        error
      );
    }
    return str;
  }
};

/**
 * Given the i18n object, return the function that can be used
 * to translate strings. Useful for wiring i18n to extensions
 * and libGD.js, where translations is done with a simple string
 * to string function.
 */
export const getTranslationFunction = (i18n: ?I18n): TranslationFunction => {
  const i18nModule = i18n; // Make flow happy, ensure i18nModule is const.
  if (i18nModule) {
    return (str: string) => safelyTranslate(i18nModule, str);
  }

  return null;
};

/**
 * Given the i18n object, return the function that can be used
 * to translate strings. Useful for wiring i18n to extensions
 * and libGD.js, where translations is done with a simple string
 * to string function.
 */
export const getNotNullTranslationFunction = (
  i18n: ?I18n
): NotNullTranslationFunction => {
  const i18nModule = i18n; // Make flow happy, ensure i18nModule is const.
  if (i18nModule) {
    return (str: string) => safelyTranslate(i18nModule, str);
  }

  return (str: string) => str;
};
