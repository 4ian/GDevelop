// @flow
import { type LeaderboardScoreFormattingCustom } from '../Utils/GDevelopServices/Play';
type DurationFormattingOption = 'hour' | 'minute' | 'second' | 'millisecond';

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
  currentUnit: DurationFormattingOption,
  options: DurationFormattingOption[]
): boolean => {
  switch (currentUnit) {
    case 'hour':
      return options.includes('minute');
    case 'minute':
      return options.includes('second');
    case 'second':
      return options.includes('millisecond');
    default:
      return false;
  }
};

export const formatDuration = (
  durationInSecond: number,
  options: DurationFormattingOption[]
): string => {
  let formattedDuration = '';
  let durationInMs = Math.round(durationInSecond * 1000);
  for (const unit of ['hour', 'minute', 'second', 'millisecond']) {
    if (options.includes(unit)) {
      const divider = labelToDivider[unit];
      const remainder = Math.round((durationInMs % divider) * 1000) / 1000;
      const quotient = (durationInMs - remainder) / divider;
      formattedDuration += `${quotient
        .toString()
        .padStart(unit === 'millisecond' ? 3 : 2, '0')}${
        shouldDisplaySeparator(unit, options) ? labelToNextSeparator[unit] : ''
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
    Math.round(score * 10 ** options.decimalPlacesNumber) /
    10 ** options.decimalPlacesNumber;
  return `${options.scorePrefix}${roundedScore.toFixed(
    options.decimalPlacesNumber
  )}${options.scoreSuffix}`;
};
