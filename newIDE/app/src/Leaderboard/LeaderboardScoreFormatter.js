// @flow
import {
  type LeaderboardScoreFormattingCustom,
  type LeaderboardScoreFormattingTime,
  type LeaderboardScoreFormatting,
} from '../Utils/GDevelopServices/Play';
import { roundTo } from '../Utils/Mathematics';

export const orderedTimeUnits = ['hour', 'minute', 'second', 'millisecond'];
const unitToDivider = {
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1,
};
export const unitToNextSeparator = {
  hour: ':',
  minute: ':',
  second: '.',
  millisecond: '',
};

export const formatDuration = (
  durationInSecond: number,
  options: LeaderboardScoreFormattingTime
): string => {
  let formattedDuration = '';
  let durationInMs = Math.round(durationInSecond * 1000);
  const biggestUnitIndex = orderedTimeUnits.indexOf(options.biggestUnit);
  const smallestUnitIndex = orderedTimeUnits.indexOf(options.smallestUnit);
  for (let index = biggestUnitIndex; index <= smallestUnitIndex; index++) {
    const unit = orderedTimeUnits[index];
    const divider = unitToDivider[unit];
    const remainder = durationInMs % divider;
    const quotient = (durationInMs - remainder) / divider;
    formattedDuration += `${quotient
      .toString()
      .padStart(unit === 'millisecond' ? 3 : 2, '0')}${
      index === smallestUnitIndex ? '' : unitToNextSeparator[unit]
    }`;
    durationInMs = remainder;
  }
  return formattedDuration;
};

export const formatCustomScore = (
  score: number,
  options: LeaderboardScoreFormattingCustom
): string => {
  const roundedScore = roundTo(score, options.precision);

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
