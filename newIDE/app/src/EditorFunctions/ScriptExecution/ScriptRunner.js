// @flow
import { type EditorFunctionGenericOutput } from '..';
import { NON_SCRIPTABLE_FUNCTION_NAMES } from './NonScriptableFunctionNames';

/**
 * Runs an AI-written JavaScript script whose editor functions are exposed as
 * plain async functions, replacing N tool calls (N LLM round trips) by one.
 * Mirrors `EditorFunctionCallRunner.processEditorFunctionCalls`: calls EXECUTE
 * strictly sequentially and the script stops at the first failure, with
 * everything executed before it left applied and reported.
 *
 * A script may however START several calls before awaiting them (typically
 * `Promise.all`): the calls are queued and still run one at a time, in call
 * order. What stays forbidden is ending the script with a call never awaited
 * (fire-and-forget): the call is still run and recorded, but the script is
 * reported as failed, so a missing `await` can never pass silently.
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

  let lastCalledFunctionName: string | null = null;

  // Editor functions always EXECUTE strictly sequentially, but through a FIFO
  // queue instead of forbidding a second call while one is running: a script
  // can start several calls before awaiting them (`Promise.all`) and they run
  // one at a time, in call order (covered by ScriptRunner.spec.js).
  const queuedCalls: Array<{|
    functionName: string,
    execute: () => Promise<any>,
    resolve: (value: any) => void,
    reject: (error: Error) => void,
  |}> = [];
  let runningCallFunctionName: string | null = null;
  let startedCallsCount = 0;

  // Every call promise handed to the script, tracked until it settles: used to
  // refuse fire-and-forget calls (a call still unsettled when the script ends)
  // and to give every call promise a rejection handler (a call whose promise
  // the script never awaits must not surface as an unhandled rejection).
  const unsettledCalls: Set<{| functionName: string |}> = new Set();
  const callSettlements: Array<Promise<void>> = [];
  const waitForAllCallsToSettle = async (): Promise<void> => {
    // Settlement promises never reject, and script termination means no new
    // call can be queued, so a single pass drains everything.
    await Promise.all(callSettlements);
  };

  // The script stops at the first failure: the calls queued behind the failed
  // one (or behind a script error) must never run.
  const cancelQueuedCalls = (cause: Error) => {
    const cancelledCalls = queuedCalls.splice(0, queuedCalls.length);
    for (const cancelledCall of cancelledCalls) {
      cancelledCall.reject(
        new Error(
          `"${cancelledCall.functionName}" was not run — ${cause.message}`
        )
      );
    }
  };

  const processQueue = () => {
    if (runningCallFunctionName !== null) return;
    const call = queuedCalls.shift();
    if (!call) return;
    runningCallFunctionName = call.functionName;
    call.execute().then(
      result => {
        runningCallFunctionName = null;
        call.resolve(result);
        processQueue();
      },
      error => {
        runningCallFunctionName = null;
        // `execute` only rejects with a FunctionCallFailedError: stop at the
        // first failure by cancelling the calls already queued behind it.
        // The failed call is rejected first, so an `await Promise.all(...)`
        // surfaces the failure itself, not a cancellation.
        call.reject(error);
        cancelQueuedCalls(error);
      }
    );
  };

  const scopedValues: { [string]: any } = {};
  for (const exposedFunction of exposedFunctions) {
    const { name, launch, modifiesProject } = exposedFunction;

    // The closures intentionally share the run-scoped queue and records state
    // to enforce sequential execution across all exposed functions.
    // eslint-disable-next-line no-loop-func
    const executeCall = async (args: any): Promise<any> => {
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
      }
    };

    // eslint-disable-next-line no-loop-func
    scopedValues[name] = (args: any): Promise<any> => {
      startedCallsCount++;
      if (startedCallsCount > maxCallsCount) {
        throw new Error(
          `The script made more than ${maxCallsCount} function calls — it was stopped. ` +
            'Split the work into smaller scripts.'
        );
      }

      let resolveCall = (value: any) => {};
      let rejectCall = (error: Error) => {};
      const callPromise = new Promise((resolve, reject) => {
        resolveCall = resolve;
        rejectCall = reject;
      });
      const callToken = { functionName: name };
      unsettledCalls.add(callToken);
      const onSettled = () => {
        unsettledCalls.delete(callToken);
      };
      callSettlements.push(callPromise.then(onSettled, onSettled));

      queuedCalls.push({
        functionName: name,
        execute: () => executeCall(args),
        resolve: resolveCall,
        reject: rejectCall,
      });
      processQueue();
      return callPromise;
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

    if (unsettledCalls.size > 0) {
      // The script ended while some calls were still running or queued: a
      // missing `await`. The calls were legitimately requested, so they are
      // run to completion and recorded — but the script is reported as failed,
      // so a fire-and-forget call can never pass silently (nor race with this
      // report).
      const notAwaitedFunctionNames = [
        ...new Set(Array.from(unsettledCalls).map(call => call.functionName)),
      ];
      await waitForAllCallsToSettle();
      return {
        success: false,
        functionCallRecords,
        consoleLogs,
        returnValue: null,
        error: {
          message:
            `The script ended while some calls were still running (${notAwaitedFunctionNames.join(
              ', '
            )}). They were still executed and recorded, but every call must be ` +
            'awaited before the script ends: `await` each call, or `Promise.all` to group them.',
          lineNumber: null,
          lastCalledFunctionName,
        },
        newSceneNames,
      };
    }

    return {
      success: true,
      functionCallRecords,
      consoleLogs,
      returnValue: returnValue === undefined ? null : returnValue,
      error: null,
      newSceneNames,
    };
  } catch (error) {
    // The script stopped: the calls it queued but that did not start must not
    // run, and the running one (if any) must finish so the records are
    // complete and no call is still mutating the project after this report.
    cancelQueuedCalls(
      new Error(`the script failed (${error.message || 'unknown error'})`)
    );
    await waitForAllCallsToSettle();

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
