// @flow
/* global globalThis */

import { getInitialPreferences } from '../MainFrame/Preferences/PreferencesProvider';
import { selectLanguageOrLocale } from './Language';

jest.mock('../locales/LocalesMetadata', () => [
  {
    languageCode: 'pt_PT',
    translationRatio: 0.46,
  },
  {
    languageCode: 'pt_BR',
    translationRatio: 0.95,
  },
  {
    languageCode: 'en',
    translationRatio: 0.04,
  },
  {
    languageCode: 'es_ES',
    translationRatio: 0.97,
  },
  {
    languageCode: 'fr_FR',
    translationRatio: 0.35,
  },
  {
    languageCode: 'fr_CA',
    translationRatio: 0.17,
  },
]);

describe('PreferencesProvider', () => {
  describe('getInitialPreferences', () => {
    const globalScope: any = globalThis;
    const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(
      globalScope,
      'navigator'
    );

    afterEach(() => {
      if (previousNavigatorDescriptor) {
        Object.defineProperty(
          globalScope,
          'navigator',
          previousNavigatorDescriptor
        );
      } else {
        delete globalScope.navigator;
      }
    });

    test('defaults to English without using the browser locale', () => {
      Object.defineProperty(globalScope, 'navigator', {
        configurable: true,
        value: { language: 'es-ES' },
      });

      const preferences = getInitialPreferences();

      expect(preferences.language).toBe('en');
    });
  });
});

describe('selectLanguageOrLocale', () => {
  describe('Browser with language', () => {
    test('return the only translated locale for this language, if good enough', () => {
      expect(selectLanguageOrLocale('es', 'en')).toBe('es_ES');
    });

    test('return the best translated locale among the possible locales for this language, if good enough', () => {
      expect(selectLanguageOrLocale('pt', 'en')).toBe('pt_BR');
    });

    test('return default if the best translated locale is not good enough', () => {
      expect(selectLanguageOrLocale('fr', 'en')).toBe('en');
    });

    test('return default if there is no matching language or locale', () => {
      expect(selectLanguageOrLocale('zh', 'en')).toBe('en');
    });
  });

  describe('Browser with locale', () => {
    test('return locale if exact match exists and if translation ratio is good enough', () => {
      expect(selectLanguageOrLocale('es_ES', 'en')).toBe('es_ES');
    });

    test('return locale if language match exists and if translation ratio is good enough', () => {
      expect(selectLanguageOrLocale('es_US', 'en')).toBe('es_ES');
    });

    test('return default if language match exists but translation ratio is not good enough', () => {
      expect(selectLanguageOrLocale('fr_BE', 'en')).toBe('en');
    });

    test('return default if exact match exists but translation ratio is not good enough', () => {
      expect(selectLanguageOrLocale('pt_PT', 'en')).toBe('en');
    });

    test('return default if there is no matching locale', () => {
      expect(selectLanguageOrLocale('zh_CN', 'en')).toBe('en');
    });
  });
});
