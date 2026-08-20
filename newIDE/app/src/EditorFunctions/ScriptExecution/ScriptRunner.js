// @flow
import { type EditorFunctionGenericOutput } from '..';
import { NON_SCRIPTABLE_FUNCTION_NAMES } from './NonScriptableFunctionNames';

/**
 * Runs an AI-written JavaScript script whose editor functions are exposed as
 * plain async functions, replacing N tool calls (N LLM round trips) by one.
 * Mirrors `EditorFunctionCallRunner.processEditorFunctionCalls`: calls run
 * strictly sequentially and the script stops at the first failure, with
 * everything executed before it left applied and reported.
 *
 * `evaluateScript`'s shadowing of the browser globals is hygiene, NOT a
 * security boundary: the script comes from our own backend LLM and can do no
 * more than that LLM already can through individual tool calls. Swap it for a
 * Worker / QuickJS-WASM sandbox if third-party prompts ever run here.
 */

export type ExposedScriptFunction = {|
  name: string,
  /** Same contract as `EditorFunction.launchFunction`, already bound to the project and collaborators. */
  launch: (args: any) => Promise<EditorFunctionGenericOutput>,
  modifiesProject: boolean,
|};

export type ScriptFunctionCallRecord = {|
  functionName: string,
  args: any,
  success: boolean,
  output: any,
  didModifyProject?: true,
|};

export type ScriptExecutionError = {|
  message: string,
  /** 1-based line number in the script source, when it could be extracted. */
  lineNumber: number | null,
  /** The name of the last editor function called before the error, if any. */
  lastCalledFunctionName: string | null,
|};

export type ScriptExecutionResult = {|
  success: boolean,
  functionCallRecords: Array<ScriptFunctionCallRecord>,
  consoleLogs: Array<string>,
  returnValue: any,
  error: ScriptExecutionError | null,
  /**
   * Scene names created by calls made inside the script (accumulated from each
   * call's `meta.newSceneNames`), so the caller can auto-open them like a
   * standalone `create_scene` tool call does.
   */
  newSceneNames: Array<string>,
|};

/**
 * Thrown internally to stop the script at the first failed function call.
 * The failed call is already recorded, so it must not be reported twice.
 */
class FunctionCallFailedError extends Error {
  functionName: string;

  constructor(functionName: string, message: string) {
    super(message);
    this.name = 'FunctionCallFailedError';
    this.functionName = functionName;
  }
}

/**
 * Globals shadowed inside the evaluated script, so honest code only reaches
 * the exposed functions, `console` and the JavaScript builtins.
 */
const shadowedGlobalNames = [
  'window',
  'self',
  'globalThis',
  'global',
  'document',
  'navigator',
  'location',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'Worker',
  'importScripts',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  // Note: `eval` cannot be shadowed (it is not a valid strict-mode parameter
  // name) — acceptable, as this shadowing is hygiene, not a security boundary.
  'require',
  'process',
  'module',
  'exports',
];

/**
 * The number of lines added before the script source in the function body
 * built by `evaluateScript` — used to map error line numbers back to the
 * script source. Checked by tests, so it cannot silently drift.
 */
// `function anonymous(...params\n) {\n` = 2 lines, then `"use strict";`
// and `return (async () => {` = 2 more lines before the script source.
const SCRIPT_SOURCE_LINE_OFFSET = 4;

/**
 * Extracts the 1-based line number of an error in the script source,
 * from a V8-style stack trace (Chrome, Electron, Node). Returns null when
 * it cannot be determined (other engines, native frames...).
 */
const extractScriptLineNumber = (error: Error): number | null => {
  const stack = error.stack;
  if (!stack) return null;

  // The evaluated function frames appear as `<anonymous>:line:column`
  // (or `eval at ...` in some engines). Take the first such frame.
  const match = stack.match(/<anonymous>:(\d+):\d+/);
  if (!match) return null;

  const rawLineNumber = parseInt(match[1], 10);
  if (Number.isNaN(rawLineNumber)) return null;

  const lineNumber = rawLineNumber - SCRIPT_SOURCE_LINE_OFFSET;
  return lineNumber >= 1 ? lineNumber : null;
};

/**
 * Extracts the name of the missing identifier from a `ReferenceError`, or null
 * for any other error. V8 (Chrome, Electron, Node) says "X is not defined",
 * JavaScriptCore says "Can't find variable: X".
 */
const extractUndefinedName = (error: Error): string | null => {
  if (error.name !== 'ReferenceError') return null;
  const message = error.message || '';
  const match =
    /^(\w+) is not defined$/.exec(message) ||
    /^Can't find variable: (\w+)$/.exec(message);
  return match ? match[1] : null;
};

/**
 * The two causes seen in the failure reports, both of which the agent can
 * correct on the next turn once named: calling one of its own tools from inside
 * a script, and an object shorthand with no variable of that name.
 */
const buildUndefinedNameMessage = ({
  undefinedName,
  exposedFunctionNames,
}: {|
  undefinedName: string,
  exposedFunctionNames: Array<string>,
|}): string => {
  const availableFunctions = `Functions available inside a script: ${exposedFunctionNames.join(
    ', '
  )}.`;
  if (NON_SCRIPTABLE_FUNCTION_NAMES.has(undefinedName)) {
    return (
      `"${undefinedName}" is a tool, not a function available inside a script: ` +
      'call it directly as a tool call, outside of any script. ' +
      availableFunctions
    );
  }
  return (
    `"${undefinedName}" is not defined — check for a typo, or for an object ` +
    'shorthand used without a variable of that name (write ' +
    `\`{ ${undefinedName}: someValue }\`). ${availableFunctions}`
  );
};

/**
 * Formats a value logged by the script, so it's readable in the report
 * given back to the agent.
 */
const formatLoggedValue = (value: any): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

/**
 * Evaluates the script source as the body of an async function, with the
 * exposed functions and `console` in scope and the browser globals shadowed.
 */
const evaluateScript = ({
  jsCode,
  scopedValues,
}: {|
  jsCode: string,
  scopedValues: { [string]: any },
|}): Promise<any> => {
  const scopedNames = Object.keys(scopedValues);
  const parameterNames = [...scopedNames, ...shadowedGlobalNames];

  // Keep in sync with SCRIPT_SOURCE_LINE_OFFSET: the script source must
  // start at line `SCRIPT_SOURCE_LINE_OFFSET + 1` of the built function.
  const functionBody = [
    '"use strict";',
    'return (async () => {',
    jsCode,
    '})();',
  ].join('\n');

  // eslint-disable-next-line no-new-func
  const scriptFunction: any = new Function(
    // $FlowFixMe[incompatible-type] - the Function constructor accepts parameter names then the body.
    ...[...parameterNames, functionBody]
  );
  const scopedArguments = scopedNames.map(name => scopedValues[name]);

  // Promise.resolve so that a synchronously thrown error is also converted
  // into a rejected promise by the caller's try/catch on await.
  return Promise.resolve(scriptFunction(...scopedArguments));
};

export const executeScript = async ({
  jsCode,
  exposedFunctions,
  maxFunctionCallsCount,
}: {|
  jsCode: string,
  exposedFunctions: Array<ExposedScriptFunction>,
  /** A safety net against runaway loops making editor function calls. */
  maxFunctionCallsCount?: number,
|}): Promise<ScriptExecutionResult> => {
  const functionCallRecords: Array<ScriptFunctionCallRecord> = [];
  const consoleLogs: Array<string> = [];
  const newSceneNames: Array<string> = [];
  const maxCallsCount = maxFunctionCallsCount || 600;

  let pendingCallFunctionName: string | null = null;
  let lastCalledFunctionName: string | null = null;

  const scopedValues: { [string]: any } = {};
  for (const exposedFunction of exposedFunctions) {
    const { name, launch, modifiesProject } = exposedFunction;
    // The closures intentionally share the run-scoped `pendingCallFunctionName`
    // / `lastCalledFunctionName` state to enforce sequential execution across
    // all exposed functions (covered by ScriptRunner.spec.js).
    // eslint-disable-next-line no-loop-func
    scopedValues[name] = async (args: any) => {
      if (pendingCallFunctionName) {
        throw new Error(
          `Called "${name}" while "${pendingCallFunctionName}" is still running. ` +
            'Editor functions run sequentially: `await` every call (no Promise.all).'
        );
      }
      if (functionCallRecords.length >= maxCallsCount) {
        throw new Error(
          `The script made more than ${maxCallsCount} function calls — it was stopped. ` +
            'Split the work into smaller scripts.'
        );
      }

      pendingCallFunctionName = name;
      lastCalledFunctionName = name;
      try {
        const result = await launch(args);
        const { success, meta, ...output } = result;
        // Accumulate scene names created by this call so the caller can
        // auto-open them (a standalone create_scene tool call does this via
        // meta.newSceneNames; a script must not lose it).
        if (meta && Array.isArray(meta.newSceneNames)) {
          newSceneNames.push(...meta.newSceneNames);
        }
        functionCallRecords.push({
          functionName: name,
          args,
          success: !!success,
          output,
          didModifyProject: modifiesProject && success ? true : undefined,
        });
        if (!success) {
          throw new FunctionCallFailedError(
            name,
            `Function "${name}" failed: ${output.message ||
              'no error message given'}. The script was stopped (everything executed before is applied).`
          );
        }
        return { success, ...output };
      } catch (error) {
        if (error instanceof FunctionCallFailedError) throw error;

        // A thrown error (bug, invalid arguments...) is recorded like
        // `processEditorFunctionCalls` records it: as a failed call.
        functionCallRecords.push({
          functionName: name,
          args,
          success: false,
          output: { message: error.message || 'Unknown error' },
        });
        throw new FunctionCallFailedError(
          name,
          `Function "${name}" failed: ${error.message || 'Unknown error'}. ` +
            'The script was stopped (everything executed before is applied).'
        );
      } finally {
        pendingCallFunctionName = null;
      }
    };
  }

  // Agents regularly write `await functions.create_scene(...)`, assuming the
  // exposed functions live in a namespace. Give them one, bound to the very
  // same wrappers, instead of failing the script on a `ReferenceError`.
  scopedValues.functions = { ...scopedValues };

  scopedValues.console = {
    log: (...values: Array<any>) => {
      consoleLogs.push(values.map(formatLoggedValue).join(' '));
    },
    info: (...values: Array<any>) => {
      consoleLogs.push(values.map(formatLoggedValue).join(' '));
    },
    warn: (...values: Array<any>) => {
      consoleLogs.push('[warning] ' + values.map(formatLoggedValue).join(' '));
    },
    error: (...values: Array<any>) => {
      consoleLogs.push('[error] ' + values.map(formatLoggedValue).join(' '));
    },
  };

  try {
    const returnValue = await evaluateScript({ jsCode, scopedValues });
    return {
      success: true,
      functionCallRecords,
      consoleLogs,
      returnValue: returnValue === undefined ? null : returnValue,
      error: null,
      newSceneNames,
    };
  } catch (error) {
    const isFunctionCallFailure = error instanceof FunctionCallFailedError;
    const undefinedName = isFunctionCallFailure
      ? null
      : extractUndefinedName(error);
    return {
      success: false,
      functionCallRecords,
      consoleLogs,
      returnValue: null,
      error: {
        message: undefinedName
          ? buildUndefinedNameMessage({
              undefinedName,
              exposedFunctionNames: exposedFunctions.map(({ name }) => name),
            })
          : error.message || 'Unknown error',
        // For a failed function call, the interruption is expected: the
        // useful location is the call itself, already in the records.
        lineNumber: isFunctionCallFailure
          ? null
          : extractScriptLineNumber(error),
        lastCalledFunctionName,
      },
      newSceneNames,
    };
  }
};
