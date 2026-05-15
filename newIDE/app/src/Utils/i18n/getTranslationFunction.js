// @flow
import { type I18n } from '@lingui/core';

type TranslationFunction = (string => string) | null;
type NotNullTranslationFunction = string => string;

// Lingui interprets translation keys as ICU MessageFormat templates.
// Descriptions/sentences coming from third-party events extensions may legitimately
// contain `{x}` / `{x, y}` substrings that look like placeholders but are not real
// ones (e.g. `Output format: {key, value}`). Such strings throw inside `i18n._`
// (`formatters[type] is not a function`), aborting metadata generation for the
// whole extension. Fall back to the raw string in that case.
const safeTranslate = (i18nModule: I18n, str: string): string => {
  try {
    return i18nModule._(str);
  } catch (error) {
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
    return (str: string) => safeTranslate(i18nModule, str);
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
    return (str: string) => safeTranslate(i18nModule, str);
  }

  return (str: string) => str;
};
