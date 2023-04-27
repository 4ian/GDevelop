// @flow

import LocalesMetadata from '../locales/LocalesMetadata';

/**
 * Set language in the few main tags of importance
 *
 * @param language as used in i18n with `_`, ex: `en`, `fr_FR`, etc.
 */
export const setLanguageInDOM = (language: string): void => {
  const formattedLanguage = language.replace('_', '-');

  // <html lang=... xml:lang=... >
  const htmlTag = document.getElementsByTagName('html')[0];
  htmlTag.setAttribute('lang', formattedLanguage);
  htmlTag.setAttribute('xml:lang', formattedLanguage);

  // <meta httpEquiv="Content-Language" content=... >
  let metaContentLanguage = document.querySelector(
    'meta[http-equiv="Content-Language"]'
  );
  if (metaContentLanguage) {
    metaContentLanguage.setAttribute('content', formattedLanguage);
  } else {
    metaContentLanguage = document.createElement('meta');
    metaContentLanguage.setAttribute('http-equiv', 'Content-Language');
    metaContentLanguage.setAttribute('content', formattedLanguage);
    document.getElementsByTagName('head')[0].appendChild(metaContentLanguage);
  }
};

export const getBrowserLanguageOrLocale = (): string => {
  return navigator.language.replace('-', '_');
};

const getLanguageOnlyFromLanguageOrLocale = (
  languageOrLocale: string
): ?string => {
  return languageOrLocale.split('_')[0] || null;
};

/**
 * Selects the nearest available language with a minimum translation ratio.
 *
 * @param languageOrLocale
 * @param defaultLanguage Language to be used when no good enough locale/language is found
 */
export const selectLanguageOrLocale = (
  languageOrLocale: string,
  defaultLanguage: string
): string => {
  const translationRatioThreshold = 0.7;
  const languageMetadata = LocalesMetadata.filter(
    localeMetadata => localeMetadata.languageCode === languageOrLocale
  );
  // If we have a good-enough translation for the exact language or locale, we use it.
  if (languageMetadata.length > 0) {
    if (languageMetadata[0].translationRatio > translationRatioThreshold) {
      return languageOrLocale;
    } else {
      // If the translation is not good enough, don't even try to find another translation
      // by language (because if the exact locale exists, it means the locale is important).
      // So return the default language.
      return defaultLanguage;
    }
  }

  // If we can't find a translation for the exact language or locale,
  // try to find a (good enough) translation for the language only.
  const language = getLanguageOnlyFromLanguageOrLocale(languageOrLocale);
  if (language) {
    // Find the language corresponding locales ordered by translation ratio.
    const localeCandidates = LocalesMetadata.filter(localeMetadata =>
      localeMetadata.languageCode.startsWith(language)
    ).sort((a, b) => (a.translationRatio > b.translationRatio ? -1 : 1));

    if (
      localeCandidates.length >= 1 &&
      localeCandidates[0].translationRatio >= translationRatioThreshold
    )
      return localeCandidates[0].languageCode;
  }

  // We found:
  // - no exact language or locale translation (considered good enough or not),
  // - no language-only translation (considered good enough),
  // so return the default language.
  return defaultLanguage;
};
