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

const isLanguage = (languageOrLocale: string): boolean => {
  return languageOrLocale.split('_').length === 1;
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
  const translationRatioThreshold = 0.5;
  const languageMetadata = LocalesMetadata.filter(
    localeMetadata => localeMetadata.languageCode === languageOrLocale
  );
  // If we have a good-enough translation for the exact language or locale, we use it.
  if (languageMetadata.length > 0) {
    if (languageMetadata[0].translationRatio > translationRatioThreshold) {
      return languageOrLocale;
    } else {
      return defaultLanguage;
    }
  }
  if (isLanguage(languageOrLocale)) {
    // If it is a language, we look for corresponding locales
    const localeCandidates = LocalesMetadata.filter(localeMetadata =>
      localeMetadata.languageCode.startsWith(languageOrLocale)
    ).sort((a, b) => (a.translationRatio > b.translationRatio ? -1 : 1));

    if (localeCandidates.length === 0) return defaultLanguage;
    // If translation ratio is not enough, return default
    if (localeCandidates[0].translationRatio < translationRatioThreshold)
      return defaultLanguage;
    return localeCandidates[0].languageCode;
  }

  return defaultLanguage;
};
