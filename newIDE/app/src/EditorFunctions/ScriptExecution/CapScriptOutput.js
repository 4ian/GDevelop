// @flow
import {
  type ScriptExecutionResult,
  type ScriptFunctionCallRecord,
  type ScriptExecutionError,
} from './ScriptRunner';

/**
 * Applies the caps and read-only reduction of the `run_script`
 * function_call_output payload before it is sent to the backend:
 * - read-only records (`inspect_*`/`describe_*`/`read_*`) keep only
 *   `{ message }` (their data must not re-enter the LLM context),
 * - project-modifying records keep their full output, except an
 *   `objectSizeInfo` entry or a hint already given unchanged by an earlier
 *   record (a loop placing instances repeats them on every call),
 * - `args` are truncated (2000 chars each, 30000 total), `raw_json` args
 *   replaced by their size,
 * - `consoleLogs` are capped (100 lines / 8000 chars, with a dropped note).
 *
 * Also computes `didModifyProject` for the whole script (true when any record
 * modified the project), which the runner uses to trigger the editor refresh
 * even when the script ultimately failed.
 */

const MAX_ARG_CHARS = 2000;
const MAX_TOTAL_ARG_CHARS = 30000;
const MAX_LOG_LINES = 100;
const MAX_LOG_CHARS = 8000;
const MAX_RETURN_VALUE_CHARS = 8000;

// A raw configuration is sent back in the args of every write: keep only its
// size, the rest of the args (scope, object, instance ids) stays readable.
const redactRawJson = (key: string, value: any): any =>
  key === 'raw_json' && value !== undefined && value !== null
    ? `[raw JSON, ${
        typeof value === 'string' ? value.length : JSON.stringify(value).length
      } chars]`
    : value;

const truncationMarker = (length: number) =>
  `…[truncated from ${length} chars]`;

// Truncate a serialized string to `maxChars`, keeping a prefix + marker.
const truncateSerialized = (serialized: string, maxChars: number): string =>
  serialized.length <= maxChars
    ? serialized
    : `${serialized.slice(0, maxChars)}${truncationMarker(serialized.length)}`;

/**
 * Sanitize the script `return` value: it is sent as JSON, and an LLM-authored
 * script can `return` something non-serializable (a cycle, a BigInt, a class
 * instance). Round-trip it defensively and cap its size; on failure, fall back
 * to a marker string so the whole request is never wedged by JSON.stringify.
 */
const sanitizeReturnValue = (returnValue: any): any => {
  if (returnValue === null || returnValue === undefined) return null;
  try {
    const serialized = JSON.stringify(returnValue);
    if (serialized === undefined) return '[unserializable value]';
    if (serialized.length > MAX_RETURN_VALUE_CHARS) {
      return truncateSerialized(serialized, MAX_RETURN_VALUE_CHARS);
    }
    // Return the parsed value (plain JSON) so it stays structured for the UI.
    return JSON.parse(serialized);
  } catch (error) {
    return '[unserializable value]';
  }
};

const isReadOnlyScriptFunction = (functionName: string): boolean =>
  /^(inspect_|describe_|read_)/.test(functionName);

const reduceReadOnlyOutput = (output: any): any => {
  if (output && typeof output === 'object' && 'message' in output) {
    return { message: output.message };
  }
  return {};
};

/**
 * Removes from the outputs the `objectSizeInfo` entries and the `hints` that an
 * earlier record of the script already gave unchanged. Only the copy sent to
 * the model is reduced: the script got the full outputs.
 */
const withoutRepeatedSizeInfoAndHints = (
  records: Array<Object>
): Array<Object> => {
  const givenSizeInfoByObjectName = new Map<string, string>();
  const givenHints = new Set<string>();
  return records.map(record => {
    const { output } = record;
    if (!output || typeof output !== 'object' || Array.isArray(output))
      return record;
    const { objectSizeInfo, hints, ...otherOutputFields } = output;
    const newSizeInfo: { [string]: any } = {};
    let hasNewSizeInfo = false;
    if (objectSizeInfo && typeof objectSizeInfo === 'object') {
      Object.keys(objectSizeInfo).forEach(objectName => {
        const serialized = JSON.stringify(objectSizeInfo[objectName]);
        if (givenSizeInfoByObjectName.get(objectName) === serialized) return;
        givenSizeInfoByObjectName.set(objectName, serialized);
        newSizeInfo[objectName] = objectSizeInfo[objectName];
        hasNewSizeInfo = true;
      });
    }
    const newHints = Array.isArray(hints)
      ? hints.filter((hint: Object) => {
          const serialized = JSON.stringify(hint) || '';
          if (givenHints.has(serialized)) return false;
          givenHints.add(serialized);
          return true;
        })
      : [];
    const reducedOutput: { [string]: any } = { ...otherOutputFields };
    if (hasNewSizeInfo) reducedOutput.objectSizeInfo = newSizeInfo;
    if (newHints.length > 0) reducedOutput.hints = newHints;
    return { ...record, output: reducedOutput };
  });
};

export type CappedRunScriptOutput = {|
  success: boolean,
  functionCallRecords: Array<Object>,
  consoleLogs: Array<string>,
  returnValue: any,
  error: ScriptExecutionError | null,
  didModifyProject: boolean,
  newSceneNames: Array<string>,
  newExternalLayoutNames: Array<string>,
|};

export const capScriptExecutionResult = (
  result: ScriptExecutionResult
): CappedRunScriptOutput => {
  let totalArgChars = 0;

  const cappedFunctionCallRecords = result.functionCallRecords.map(
    (record: ScriptFunctionCallRecord) => {
      // Truncate args (kept for the UI `renderForEditor`), per-record and total.
      let cappedArgs = record.args;
      try {
        const serialized = JSON.stringify(record.args, redactRawJson);
        if (serialized !== undefined) {
          if (totalArgChars >= MAX_TOTAL_ARG_CHARS) {
            // Whole-records budget already spent: keep only a marker.
            cappedArgs = truncationMarker(serialized.length);
          } else if (serialized.length > MAX_ARG_CHARS) {
            // Keep a prefix (still useful for the UI) + marker.
            cappedArgs = truncateSerialized(serialized, MAX_ARG_CHARS);
            totalArgChars += MAX_ARG_CHARS;
          } else {
            cappedArgs = JSON.parse(serialized);
            totalArgChars += serialized.length;
          }
        }
      } catch (error) {
        cappedArgs = '[unserializable args]';
      }

      const output = isReadOnlyScriptFunction(record.functionName)
        ? reduceReadOnlyOutput(record.output)
        : record.output;

      return {
        functionName: record.functionName,
        args: cappedArgs,
        success: record.success,
        output,
        ...(record.didModifyProject ? { didModifyProject: true } : {}),
      };
    }
  );

  const functionCallRecords = withoutRepeatedSizeInfoAndHints(
    cappedFunctionCallRecords
  );

  // Cap console logs to the first N lines / M chars, noting the drop.
  let consoleLogs = result.consoleLogs;
  const droppedLines = Math.max(0, consoleLogs.length - MAX_LOG_LINES);
  consoleLogs = consoleLogs.slice(0, MAX_LOG_LINES);
  let totalLogChars = 0;
  const cappedByChars = [];
  let charsDropped = false;
  for (const line of consoleLogs) {
    if (totalLogChars + line.length > MAX_LOG_CHARS) {
      const remaining = MAX_LOG_CHARS - totalLogChars;
      // Keep a prefix of this line rather than dropping all content when a
      // single (e.g. first) line already exceeds the budget.
      if (remaining > 0) {
        cappedByChars.push(truncateSerialized(line, remaining));
      }
      charsDropped = true;
      break;
    }
    cappedByChars.push(line);
    totalLogChars += line.length;
  }
  consoleLogs = cappedByChars;
  if (droppedLines > 0 || charsDropped) {
    consoleLogs = [
      ...consoleLogs,
      `…[console output truncated${
        droppedLines > 0 ? `, ${droppedLines} more line(s) dropped` : ''
      }]`,
    ];
  }

  const didModifyProject = result.functionCallRecords.some(
    record => !!record.didModifyProject
  );

  return {
    success: result.success,
    functionCallRecords,
    consoleLogs,
    returnValue: sanitizeReturnValue(result.returnValue),
    error: result.error,
    didModifyProject,
    newSceneNames: result.newSceneNames || [],
    newExternalLayoutNames: result.newExternalLayoutNames || [],
  };
};
