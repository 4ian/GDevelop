// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export const getRelativeOrAbsoluteDisplayDate = ({
  i18n,
  dateAsNumber,
  relativeLimit,
  sameDayFormat,
  sameWeekFormat,
  dayBeforeFormat,
}: {|
  i18n: I18nType,
  dateAsNumber: number,
  relativeLimit: 'currentWeek' | 'currentYear',
  sameDayFormat: 'todayAndHour' | 'timeAgo' | 'today',
  sameWeekFormat: 'timeAgo' | 'thisWeek',
  dayBeforeFormat: 'yesterdayAndHour' | 'yesterday',
|}): React.Node => {
  const nowAsNumber = Date.now();
  if (nowAsNumber - dateAsNumber < 60 * 1000) {
    return i18n._(t`Just now`);
  }
  const now = new Date(nowAsNumber);
  const date = new Date(dateAsNumber);

  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    if (sameDayFormat === 'todayAndHour') {
      return (
        i18n._(t`Today`) +
        ` ${i18n.date(date, {
          hour: 'numeric',
        })}`
      );
    } else if (sameDayFormat === 'today') {
      return i18n._(t`Today`);
    } else {
      if (nowAsNumber - dateAsNumber < 3600 * 1000) {
        const minutesAgo = Math.floor(
          (nowAsNumber - dateAsNumber) / (60 * 1000)
        );
        return i18n._(t`${minutesAgo} minutes ago`);
      } else {
        const hoursAgo = Math.floor(
          (nowAsNumber - dateAsNumber) / (3600 * 1000)
        );
        if (hoursAgo === 1) return i18n._(t`1 hour ago`);
        return i18n._(t`${hoursAgo} hours ago`);
      }
    }
  }
  const yesterdayAtSameTime = new Date(now);
  yesterdayAtSameTime.setDate(now.getDate() - 1);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    yesterdayAtSameTime.getDate() === date.getDate()
  ) {
    if (dayBeforeFormat === 'yesterdayAndHour') {
      return (
        i18n._(t`Yesterday`) +
        ` ${i18n.date(date, {
          hour: 'numeric',
        })}`
      );
    } else {
      return i18n._(t`Yesterday`);
    }
  }

  const sevenDaysAgoAtFirstHour = new Date(now);
  sevenDaysAgoAtFirstHour.setDate(now.getDate() - 7);
  sevenDaysAgoAtFirstHour.setHours(0, 0, 0, 0);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    sevenDaysAgoAtFirstHour.getTime() <= date.getTime()
  ) {
    if (sameWeekFormat === 'thisWeek') {
      return i18n._(t`This week`);
    } else {
      const daysAgo = Math.floor(
        (nowAsNumber - dateAsNumber) / (24 * 3600 * 1000)
      );
      if (daysAgo === 1) return i18n._(t`1 day ago`);
      return i18n._(t`${daysAgo} days ago`);
    }
  }
  if (relativeLimit === 'currentWeek') {
    return i18n.date(date);
  }

  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth()
  ) {
    return i18n._(t`This month`);
  }

  if (now.getFullYear() === date.getFullYear()) {
    return i18n._(t`This year`);
  }
  return date.getFullYear();
};

export const secondsToMinutesAndSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedRemainingSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${formattedRemainingSeconds}`;
};
