// @flow

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

const mockGetBrowserLanguageOrLocale = jest.fn();

jest.mock('./Language', () => {
  const originalModule = jest.requireActual('./Language');

  return {
    __esModule: true,
    ...originalModule,
    getBrowserLanguageOrLocale: () => mockGetBrowserLanguageOrLocale(),
  };
});

import { getBrowserLanguageOrLocale } from './Language';
import { getInitialPreferences } from '../MainFrame/Preferences/PreferencesProvider';

describe('PreferencesProvider', () => {
  describe('getInitialPreferences', () => {
    describe('Browser with language', () => {
      test('return the only translated locale for this language, if good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('es');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('es_ES');
      });

      test('return the best translated locale among the possible locales for this language, if good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('pt');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('pt_BR');
      });

      test('return default if the best translated locale is not good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('fr');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('en');
      });

      test('return default if there is no matching language or locale', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('zh');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('en');
      });
    });

    describe('Browser with locale', () => {
      test('return locale if exact match exists and if translation ratio is good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('es_ES');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('es_ES');
      });

      test('return locale if language match exists and if translation ratio is good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('es_US');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('es_ES');
      });

      test('return default if language match exists but translation ratio is not good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('fr_BE');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('en');
      });

      test('return default if exact match exists but translation ratio is not good enough', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('pt_PT');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('en');
      });

      test('return default if there is no matching locale', () => {
        mockGetBrowserLanguageOrLocale.mockReturnValue('zh_CN');
        const preferences = getInitialPreferences();
        expect(preferences.language).toBe('en');
      });
    });
  });
});
