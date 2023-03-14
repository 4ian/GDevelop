// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
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

export const getLanguageLabelForLocale = (locale: string): React.Node => {
  const languageCode = locale.split(/[-_]/)[0];
  switch (languageCode) {
    case 'en':
      return <Trans>English</Trans>;
    case 'fr':
      return <Trans>French</Trans>;
    case 'pt':
      return <Trans>Portuguese</Trans>;
    case 'es':
      return <Trans>Spanish</Trans>;
    case 'it':
      return <Trans>Italian</Trans>;
    case 'ar':
      return <Trans>Arabic</Trans>;
    case 'id':
      return <Trans>Indonesian</Trans>;
    case 'ja':
      return <Trans>Japanese</Trans>;
    case 'ko':
      return <Trans>Korean</Trans>;
    case 'zh':
      return <Trans>Chinese</Trans>;
    case 'pl':
      return <Trans>Polish</Trans>;
    case 'ru':
      return <Trans>Russian</Trans>;
    case 'sl':
      return <Trans>Slovene</Trans>;
    case 'si':
      return <Trans>Sinhala</Trans>;
    case 'th':
      return <Trans>Thai</Trans>;
    case 'tr':
      return <Trans>Turkish</Trans>;
    case 'uk':
      return <Trans>Ukrainian</Trans>;
    default:
      return null;
  }
};
