// @flow
import {
  type ScriptExecutionResult,
  type ScriptFunctionCallRecord,
  type ScriptExecutionError,
} from './ScriptRunner';

/**
 * Applies the caps and read-only reduction of the `run_script`
 * function_call_output payload (generation-api `script-api/README.md` §3.4)
 * before it is sent to the backend:
 * - read-only records (`inspect_*`/`describe_*`/`read_*`) keep only
 *   `{ message }` (their data must not re-enter the LLM context),
 * - project-modifying records keep their full output,
 * - `args` are truncated (2000 chars each, 30000 total),
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

export type CappedRunScriptOutput = {|
  success: boolean,
  functionCallRecords: Array<Object>,
  consoleLogs: Array<string>,
  returnValue: any,
  error: ScriptExecutionError | null,
  didModifyProject: boolean,
  newSceneNames: Array<string>,
|};

/**
 * @param {ScriptExecutionResult} result
 * @returns {CappedRunScriptOutput}
 */
export const capScriptExecutionResult = (
  result: ScriptExecutionResult
): CappedRunScriptOutput => {
  let totalArgChars = 0;

  const functionCallRecords = result.functionCallRecords.map(
    (record: ScriptFunctionCallRecord) => {
      // Truncate args (kept for the UI `renderForEditor`), per-record and total.
      let cappedArgs = record.args;
      try {
        const serialized = JSON.stringify(record.args);
        if (serialized !== undefined) {
          if (totalArgChars >= MAX_TOTAL_ARG_CHARS) {
            // Whole-records budget already spent: keep only a marker.
            cappedArgs = truncationMarker(serialized.length);
          } else if (serialized.length > MAX_ARG_CHARS) {
            // Keep a prefix (still useful for the UI) + marker.
            cappedArgs = truncateSerialized(serialized, MAX_ARG_CHARS);
            totalArgChars += MAX_ARG_CHARS;
          } else {
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
  };
};
