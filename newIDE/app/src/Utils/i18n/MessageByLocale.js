// @flow
import { type I18n as I18nType } from '@lingui/core';
export type MessageByLocale = { [string]: string };

export const selectMessageByLocale = (
  i18n: I18nType,
  messageByLocale: MessageByLocale
): string => {
  if (!messageByLocale) return '';
  if (typeof messageByLocale === 'string') return messageByLocale;
  if (typeof messageByLocale !== 'object') return '';

  const language = i18n.language;

  if (messageByLocale[language]) return messageByLocale[language];

  const languageFirstCode = language.split('-')[0];
  if (messageByLocale[languageFirstCode])
    return messageByLocale[languageFirstCode];

  if (messageByLocale['en']) return messageByLocale['en'];

  const firstLanguage = Object.keys(messageByLocale)[0];
  if (messageByLocale[firstLanguage]) return messageByLocale[firstLanguage];

  return '';
};
