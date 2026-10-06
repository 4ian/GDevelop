// @flow
import { isExtensionFromStore } from '../EditorFunctions/SimplifiedProject/SimplifiedExtensions';
import { type AiRequestFunctionCallOutput } from '../Utils/GDevelopServices/Generation';

const MAX_ERRORS_GIVEN_TO_AI = 3;
const MAX_CALL_CHAIN_LENGTH = 6;

// The names generated for the functions of extensions, like
// `gdjs.evtsExt__MyExtension__MyFunction.func` for a free function or
// `gdjs.evtsExt__MyExtension__MyBehavior.MyBehavior.prototype.doStepPreEventsContext.func`
// for a method (V8 can omit `prototype`).
const extensionFunctionNameRegex = /^gdjs\.evtsExt__(.+?)__(.+?)\.(?:.+?\.(?:prototype\.)?(.+)Context\.)?func$/;
// The generated names replace `_` with `_95`.
const demangle = (mangledName: string) => mangledName.replace(/_95/g, '_');

/**
 * An error thrown by the code of an extension while the in-game editor
 * displays a scene: the editor reported it and went on.
 */
export type InGameEditorExtensionError = {|
  // Different each time the error appears again (after a hot reload).
  id: number,
  key: string,
  extensionName: string | null,
  // `onCreated`, `doStepPostEvents`, `onHotReloading`, `onDestroy`,
  // `editorCallback` or `toolbar`.
  phase: string,
  // The object or behavior type running the code, if any.
  type: string | null,
  message: string,
  stack: string,
  count: number,
|};

// Read by the Ask AI editor when it sends the results of function calls (it
// can be in a popped out window, outside of the main frame).
let latestInGameEditorExtensionErrors: Array<InGameEditorExtensionError> = [];
export const setLatestInGameEditorExtensionErrors = (
  errors: Array<InGameEditorExtensionError>
) => {
  latestInGameEditorExtensionErrors = errors;
};
export const getLatestInGameEditorExtensionErrors = (): Array<InGameEditorExtensionError> =>
  latestInGameEditorExtensionErrors;

export const isInGameEditorExtensionErrorFromStore = (
  project: ?gdProject,
  { extensionName }: InGameEditorExtensionError
): boolean =>
  !!project &&
  !!extensionName &&
  project.hasEventsFunctionsExtensionNamed(extensionName) &&
  isExtensionFromStore(project.getEventsFunctionsExtension(extensionName));

/** Where the error happened, like "doStepPostEvents of MyExtension::MyObject". */
export const getInGameEditorExtensionErrorOrigin = ({
  extensionName,
  phase,
  type,
}: InGameEditorExtensionError): string =>
  type
    ? `${phase} of ${type}`
    : `${phase} of ${extensionName || 'an extension'}`;

/**
 * The functions of extensions in the stack of the error, from the outermost
 * to where it was thrown, like
 * "MyExtension::MyObject.doStepPostEvents → MyExtension::MyFunction → JavaScript code event".
 * The locations in the generated code are left out: they point to nothing the
 * AI can read.
 */
export const getInGameEditorExtensionErrorCallChain = (
  stack: string
): string | null => {
  const functionNames = stack
    .split('\n')
    .map(line => {
      const match = line.match(
        /^\s*at (?:async )?([^\s(]+)(?: \[as ([^\]]+)\])?/
      );
      return match ? match[2] || match[1] : null;
    })
    .filter(Boolean);
  const callChain: Array<string> = [];
  functionNames.forEach((functionName, index) => {
    const extensionFunctionMatch = functionName.match(
      extensionFunctionNameRegex
    );
    const name = extensionFunctionMatch
      ? `${demangle(extensionFunctionMatch[1])}::${demangle(
          extensionFunctionMatch[2]
        )}${
          extensionFunctionMatch[3]
            ? `.${demangle(extensionFunctionMatch[3])}`
            : ''
        }`
      : functionName.startsWith('userFunc0x')
      ? 'JavaScript code event'
      : // Where the error was thrown, even outside of an extension.
      index === 0
      ? functionName
      : null;
    if (name && callChain[0] !== name) callChain.unshift(name);
  });
  if (callChain.length === 0) return null;
  return (callChain.length > MAX_CALL_CHAIN_LENGTH
    ? [...callChain.slice(0, 2), '…', ...callChain.slice(-3)]
    : callChain
  ).join(' → ');
};

/** The request pre-filled in the chat to ask the AI to fix the errors. */
export const getAskAiToFixInGameEditorExtensionErrorsText = (
  errors: Array<InGameEditorExtensionError>
): string =>
  [
    'The scene editor reported errors in the code of extensions:',
    ...errors.map(error => {
      const callChain = getInGameEditorExtensionErrorCallChain(error.stack);
      return `- ${getInGameEditorExtensionErrorOrigin(error)}: ${
        error.message
      }${callChain ? ` (in ${callChain})` : ''}`;
    }),
    'Can you fix them?',
  ].join('\n');

/**
 * The errors not given to the AI yet (at most a few), added to the last of the
 * outputs of function calls sent to it: an error appears after its change is
 * hot-reloaded, so after the output of the call that made the change.
 */
export const addInGameEditorExtensionErrorsToFunctionCallOutputs = ({
  functionCallOutputs,
  errors,
  givenErrorIds,
  project,
}: {|
  functionCallOutputs: Array<AiRequestFunctionCallOutput>,
  errors: Array<InGameEditorExtensionError>,
  givenErrorIds: Set<number>,
  project: ?gdProject,
|}): {|
  functionCallOutputs: Array<AiRequestFunctionCallOutput>,
  newlyGivenErrorIds: Array<number>,
|} => {
  const lastOutput = functionCallOutputs[functionCallOutputs.length - 1];
  const errorsToGive = errors.filter(error => !givenErrorIds.has(error.id));
  if (!lastOutput || errorsToGive.length === 0) {
    return { functionCallOutputs, newlyGivenErrorIds: [] };
  }
  let parsedOutput;
  try {
    parsedOutput = JSON.parse(lastOutput.output);
  } catch (error) {
    return { functionCallOutputs, newlyGivenErrorIds: [] };
  }

  const givenErrors = errorsToGive.slice(0, MAX_ERRORS_GIVEN_TO_AI);
  return {
    functionCallOutputs: [
      ...functionCallOutputs.slice(0, -1),
      {
        ...lastOutput,
        output: JSON.stringify({
          ...parsedOutput,
          inGameEditorErrors: {
            note:
              'The code of extensions threw these errors while the scene editor displayed the scene (it kept working). Fix them if they come from your changes, otherwise tell the user. A store extension is read-only.',
            errors: givenErrors.map(error => ({
              extensionName: error.extensionName,
              ...(isInGameEditorExtensionErrorFromStore(project, error)
                ? { isStoreExtension: true }
                : {}),
              where: getInGameEditorExtensionErrorOrigin(error),
              message: error.message,
              timesThrown: error.count,
              callChain: getInGameEditorExtensionErrorCallChain(error.stack),
            })),
            ...(errorsToGive.length > givenErrors.length
              ? { notShownCount: errorsToGive.length - givenErrors.length }
              : {}),
          },
        }),
      },
    ],
    newlyGivenErrorIds: givenErrors.map(error => error.id),
  };
};
