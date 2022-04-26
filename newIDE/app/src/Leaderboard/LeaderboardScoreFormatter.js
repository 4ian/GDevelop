// @flow
import {
  type LeaderboardScoreFormattingCustom,
  type LeaderboardScoreFormattingTime,
  type LeaderboardScoreFormatting,
  type LeaderboardScoreFormattingTimeUnit,
} from '../Utils/GDevelopServices/Play';

const labelToDivider = {
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1,
};
const labelToNextSeparator = {
  hour: ':',
  minute: ':',
  second: '.',
  millisecond: '',
};

const shouldDisplaySeparator = (
  currentUnit: LeaderboardScoreFormattingTimeUnit,
  requestedUnits: LeaderboardScoreFormattingTimeUnit[]
): boolean => {
  switch (currentUnit) {
    case 'hour':
      return requestedUnits.includes('minute');
    case 'minute':
      return requestedUnits.includes('second');
    case 'second':
      return requestedUnits.includes('millisecond');
    default:
      return false;
  }
};

export const formatDuration = (
  durationInSecond: number,
  options: LeaderboardScoreFormattingTime
): string => {
  let formattedDuration = '';
  let durationInMs = Math.round(durationInSecond * 1000);
  for (const unit of ['hour', 'minute', 'second', 'millisecond']) {
    if (options.units.includes(unit)) {
      const divider = labelToDivider[unit];
      const remainder = Math.round((durationInMs % divider) * 1000) / 1000;
      const quotient = (durationInMs - remainder) / divider;
      formattedDuration += `${quotient
        .toString()
        .padStart(unit === 'millisecond' ? 3 : 2, '0')}${
        shouldDisplaySeparator(unit, options.units)
          ? labelToNextSeparator[unit]
          : ''
      }`;
      durationInMs = remainder;
    }
  }
  return formattedDuration;
};

export const formatCustomScore = (
  score: number,
  options: LeaderboardScoreFormattingCustom
): string => {
  const roundedScore =
    Math.round(score * 10 ** options.precision) / 10 ** options.precision;
  return `${options.prefix}${roundedScore.toFixed(
    Math.max(0, options.precision)
  )}${options.suffix}`;
};

export const formatScore = (
  score: number,
  options: LeaderboardScoreFormatting
): string =>
  options.type === 'time'
    ? formatDuration(score, options)
    : formatCustomScore(score, options);
