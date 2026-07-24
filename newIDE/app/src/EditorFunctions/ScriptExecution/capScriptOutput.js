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

const truncationMarker = (length: number) =>
  `…[truncated from ${length} chars]`;

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
          if (
            serialized.length > MAX_ARG_CHARS ||
            totalArgChars + serialized.length > MAX_TOTAL_ARG_CHARS
          ) {
            cappedArgs = truncationMarker(serialized.length);
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
    returnValue: result.returnValue,
    error: result.error,
    didModifyProject,
  };
};
