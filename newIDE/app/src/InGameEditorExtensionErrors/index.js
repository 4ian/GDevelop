// @flow
import { isExtensionFromStore } from '../EditorFunctions/SimplifiedProject/SimplifiedExtensions';
import { type AiRequestFunctionCallOutput } from '../Utils/GDevelopServices/Generation';

const MAX_ERRORS_GIVEN_TO_AI = 3;
const MAX_STACK_LINES_GIVEN_TO_AI = 4;

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

/** The request pre-filled in the chat to ask the AI to fix the errors. */
export const getAskAiToFixInGameEditorExtensionErrorsText = (
  errors: Array<InGameEditorExtensionError>
): string =>
  [
    'The scene editor reported errors in the code of extensions:',
    ...errors.map(
      error =>
        `- ${getInGameEditorExtensionErrorOrigin(error)}: ${error.message}`
    ),
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
              stack: error.stack
                .split('\n')
                .slice(0, MAX_STACK_LINES_GIVEN_TO_AI)
                .join('\n'),
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
