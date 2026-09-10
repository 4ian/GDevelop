// @flow
import { SafeExtractor } from '../../Utils/SafeExtractor';

/**
 * Reading of what a `run_script` call (script-based agents) was given and what
 * it produced, for display in the chat. Everything is extracted defensively:
 * the payload comes from an AI request, so it can be incomplete, malformed or
 * built by a newer version of the tools.
 */

export type ScriptRecord = {|
  functionName: string,
  message: string | null,
  /** The call arguments, pretty printed. */
  argumentsText: string | null,
  /** The call arguments, on a single line: what tells apart two similar calls. */
  argumentsSummary: string | null,
  isFailed: boolean,
  hasChangedNothing: boolean,
|};

export type ScriptError = {|
  message: string,
  lineNumber: number | null,
  lastCalledFunctionName: string | null,
|};

export type ScriptRun = {|
  records: Array<ScriptRecord>,
  consoleLogs: Array<string>,
  resultText: string | null,
  /** True when the script returned a plain string (shown as text, not as code). */
  isResultTextual: boolean,
  error: ScriptError | null,
|};

/** Consecutive calls to the same function, displayed as a single row. */
export type ScriptRecordGroup = {|
  functionName: string,
  records: Array<ScriptRecord>,
|};

const UNKNOWN_FUNCTION_NAME = '(unknown)';

const stringifyValue = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value || null;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return null;
  }
};

const summarizeValue = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value || null;

  const object = SafeExtractor.extractObject(value);
  if (!object) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return null;
    }
  }

  const summary = Object.keys(object)
    .map(key => {
      try {
        return `${key}: ${JSON.stringify(object[key])}`;
      } catch (error) {
        return key;
      }
    })
    .join(', ');
  return summary || null;
};

const parseScriptRecord = (anything: any): ScriptRecord => {
  const record = SafeExtractor.extractObject(anything);
  const output = SafeExtractor.extractObjectProperty(anything, 'output');
  return {
    functionName:
      SafeExtractor.extractStringProperty(anything, 'functionName') ||
      UNKNOWN_FUNCTION_NAME,
    message: output
      ? SafeExtractor.extractStringProperty(output, 'message')
      : null,
    argumentsText: stringifyValue(record ? record.args : null),
    argumentsSummary: summarizeValue(record ? record.args : null),
    isFailed:
      SafeExtractor.extractBooleanProperty(anything, 'success') === false,
    hasChangedNothing: output
      ? SafeExtractor.extractBooleanProperty(output, 'nothingChanged') === true
      : false,
  };
};

/**
 * Read the `title` and `js_code` of a `run_script` call from its (JSON encoded)
 * arguments.
 */
export const parseRunScriptArguments = (
  functionCallArguments: string
): {| title: string | null, jsCode: string |} => {
  try {
    const parsed = JSON.parse(functionCallArguments);
    return {
      title: SafeExtractor.extractStringProperty(parsed, 'title'),
      jsCode: SafeExtractor.extractStringProperty(parsed, 'js_code') || '',
    };
  } catch (error) {
    return { title: null, jsCode: '' };
  }
};

/**
 * Read what a script produced: the calls it made, its console logs, its return
 * value and the error that stopped it (if any).
 */
export const parseRunScriptOutput = (anything: any): ScriptRun => {
  const scriptOutput = SafeExtractor.extractObject(anything);
  const records = SafeExtractor.extractArrayProperty(
    anything,
    'functionCallRecords'
  );
  const rawError = SafeExtractor.extractObjectProperty(anything, 'error');
  const errorMessage = rawError
    ? SafeExtractor.extractStringProperty(rawError, 'message')
    : null;

  return {
    records: (records || []).map(parseScriptRecord),
    consoleLogs:
      SafeExtractor.extractStringArrayProperty(anything, 'consoleLogs') || [],
    resultText: stringifyValue(scriptOutput ? scriptOutput.returnValue : null),
    isResultTextual:
      !!scriptOutput && typeof scriptOutput.returnValue === 'string',
    error: errorMessage
      ? {
          message: errorMessage,
          lineNumber: SafeExtractor.extractNumberProperty(
            rawError,
            'lineNumber'
          ),
          lastCalledFunctionName: SafeExtractor.extractStringProperty(
            rawError,
            'lastCalledFunctionName'
          ),
        }
      : null,
  };
};

/**
 * Gather the consecutive calls made to the same function, so a script placing
 * 10 instances shows one row instead of 10.
 */
export const groupScriptRecords = (
  records: Array<ScriptRecord>
): Array<ScriptRecordGroup> => {
  const groups: Array<ScriptRecordGroup> = [];
  records.forEach(record => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.functionName === record.functionName) {
      lastGroup.records.push(record);
      return;
    }
    groups.push({ functionName: record.functionName, records: [record] });
  });
  return groups;
};
