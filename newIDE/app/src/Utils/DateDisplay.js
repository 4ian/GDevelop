// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export const getRelativeOrAbsoluteDisplayDate = (
  i18n: I18nType,
  dateAsNumber: number
): React.Node => {
  const nowAsNumber = Date.now();
  if (nowAsNumber - dateAsNumber < 60 * 1000) {
    return i18n._(t`Now`);
  }
  const now = new Date(nowAsNumber);
  const date = new Date(dateAsNumber);

  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    return i18n._(t`Today`);
  }
  const yesterdayAtSameTime = new Date(now);
  yesterdayAtSameTime.setDate(now.getDate() - 1);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    yesterdayAtSameTime.getDate() === date.getDate()
  ) {
    return i18n._(t`Yesterday`);
  }

  const sevenDaysAgoAtFirstHour = new Date(now);
  sevenDaysAgoAtFirstHour.setDate(now.getDate() - 7);
  sevenDaysAgoAtFirstHour.setHours(0, 0, 0, 0);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    sevenDaysAgoAtFirstHour.getTime() <= date.getTime()
  ) {
    return i18n._(t`This week`);
  }
  return i18n.date(date);
};

export const secondsToMinutesAndSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedRemainingSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${formattedRemainingSeconds}`;
};
