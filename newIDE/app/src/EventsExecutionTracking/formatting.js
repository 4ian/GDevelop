// @flow
import { formatMilliseconds } from '../Utils/FormatMeasures';

/**
 * Format a value evaluated by the game, for display. Strings are quoted, to
 * tell them apart from a number or from a keyword; `quoteStrings` drops the
 * quotes where the type of the value is already shown by an icon.
 */
export const formatEvaluationValue = (
  value: any,
  maxLength: number = 200,
  quoteStrings: boolean = true
): string => {
  if (value === undefined) return 'undefined';
  const text =
    typeof value === 'string'
      ? quoteStrings
        ? `"${value}"`
        : value
      : JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
};

/** Format what an instruction (or an event) took, as shown in the sheets. */
export const formatExecutionDuration = (durationMs: number): string =>
  durationMs < 0.01 ? '< 0.01 ms' : formatMilliseconds(durationMs);
