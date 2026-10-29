// @flow
import { type I18n as I18nType } from '@lingui/core';
import {
  editorFunctions,
  type EditorCallbacks,
  type LaunchFunctionCollaborators,
} from '../EditorFunctions';
import { processEditorFunctionCalls } from '../EditorFunctions/EditorFunctionCallRunner';
import { PUBLIC_API_TOOLS_VERSION } from '../EditorFunctions/PublicApi';
import { NON_SCRIPTABLE_FUNCTION_NAMES } from '../EditorFunctions/ScriptExecution/NonScriptableFunctionNames';
import {
  makeCoalescedOutsideEditorChanges,
  type OutsideEditorChangesNotifications,
} from '../EditorFunctions/CoalescedOutsideEditorChanges';
import { type EditorFunctionsServices } from '../AiGeneration/UseEditorFunctionsServices';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import {
  type StorageProvider,
  type SaveAsLocation,
  type FileMetadata,
} from '../ProjectsStorage';

// The editor has only a stub for these functions: they are resolved by the
// GDevelop AI backend, as part of an AI request.
const AI_BACKEND_FUNCTION_NAMES = new Set([
  'read_full_docs',
  'search_docs',
  'search_object_asset_store',
  'search_resource_store',
  'create_or_update_plan',
  'report_fulfilment_problem',
  'run_edit_agent',
  'run_explorer_agent',
  'run_tests',
  'get_game_starter_summary',
]);

// Old names of functions, still accepted but not listed.
const LEGACY_FUNCTION_NAMES = new Set([
  'create_object',
  'inspect_object_properties',
  'change_object_property',
  'remove_behavior',
  'add_scene_events',
]);

// A project is always opened by the CLI.
const WITHOUT_PROJECT_FUNCTION_NAMES = new Set(['initialize_project']);

const isCallableFromCli = (name: string): boolean =>
  !!editorFunctions[name] &&
  !AI_BACKEND_FUNCTION_NAMES.has(name) &&
  !WITHOUT_PROJECT_FUNCTION_NAMES.has(name);

export type CliEditorFunctionDescription = {|
  name: string,
  modifiesProject: boolean,
  callableFromScript: boolean,
|};

export const describeCliEditorFunctions = (): Array<CliEditorFunctionDescription> =>
  Object.keys(editorFunctions)
    .filter(name => isCallableFromCli(name) && !LEGACY_FUNCTION_NAMES.has(name))
    .sort()
    .map(name => ({
      name,
      modifiesProject: editorFunctions[name].modifiesProject,
      callableFromScript: !NON_SCRIPTABLE_FUNCTION_NAMES.has(name),
    }));

export type CliEditorFunctionCall = {|
  name: string,
  arguments: { [string]: any },
|};

/**
 * Read the calls given to the CLI: `{ "name": ..., "arguments": {...} }` or
 * an array of them (`arguments` can also be a JSON string, like the calls
 * made by the AI).
 */
export const parseCliEditorFunctionCalls = (
  json: any
): Array<CliEditorFunctionCall> => {
  const calls = Array.isArray(json) ? json : [json];
  return calls.map((call, index) => {
    if (!call || typeof call !== 'object' || typeof call.name !== 'string') {
      throw new Error(
        `Call #${index} must be an object like { "name": "inspect_variables", "arguments": {...} }.`
      );
    }
    const callArguments =
      typeof call.arguments === 'string'
        ? JSON.parse(call.arguments)
        : call.arguments || {};
    if (typeof callArguments !== 'object' || Array.isArray(callArguments)) {
      throw new Error(`The arguments of call #${index} must be an object.`);
    }
    return { name: call.name, arguments: callArguments };
  });
};

export type CliEditorFunctionCallReport = {|
  name: string,
  arguments: { [string]: any },
  success: boolean,
  output: any,
|};

export type CliEditorFunctionCallsReport = {|
  success: boolean,
  didModifyProject: boolean,
  results: Array<CliEditorFunctionCallReport>,
  // The calls after the first failure are not run, like in a script.
  notRunCalls: Array<CliEditorFunctionCall>,
|};

/**
 * What the editor functions notify (to refresh the opened editors) or wait
 * for (to close the editors of what they delete). Nothing is opened when the
 * CLI runs headless.
 */
export type CliEditorFunctionsEditorCallbacks = {|
  notifications: OutsideEditorChangesNotifications,
  ...Pick<
    LaunchFunctionCollaborators,
    | 'onProjectItemRenamedOutsideEditor'
    | 'onWillDeleteScene'
    | 'onWillDeleteGameplayTest'
    | 'onWillDeleteObject'
    | 'onWillDeleteExtensionItem'
  >,
|};

/** What the editor uses to create a project for an AI agent. */
export type CliProjectCreationCallbacks = {|
  createEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  saveProjectAsWithStorageProvider: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
|};

export type CliEditorFunctionsCollaborators = {|
  ...CliEditorFunctionsEditorCallbacks,
  ...Pick<
    LaunchFunctionCollaborators,
    'onWillInstallExtension' | 'onExtensionInstalled'
  >,
  services: EditorFunctionsServices,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  onExtensionsRegenerated: () => void,
|};

// The CLI does not open editors for what the functions create or change.
const cliEditorCallbacks: EditorCallbacks = {
  onOpenLayout: () => {},
  onOpenExternalLayout: () => {},
  onCreateProject: async () => {
    throw new Error('A project is already opened by the CLI.');
  },
  onOpenEventsFunctionsExtension: () => {},
  onOpenCustomObjectEditor: () => {},
};

/**
 * Run the calls one after the other, with the same implementations and
 * collaborators as the calls made by the GDevelop AI, stopping at the first
 * failure (everything run before stays applied).
 */
export const runCliEditorFunctionCalls = async ({
  project,
  i18n,
  functionCalls,
  runScriptReadOnly,
  collaborators,
}: {|
  project: gdProject,
  i18n: I18nType,
  functionCalls: Array<CliEditorFunctionCall>,
  runScriptReadOnly: boolean,
  collaborators: CliEditorFunctionsCollaborators,
|}): Promise<CliEditorFunctionCallsReport> => {
  const { services, eventsFunctionsExtensionsState } = collaborators;
  services.prefetchStores();
  const coalescedOutsideEditorChanges = makeCoalescedOutsideEditorChanges({
    project,
    eventsFunctionsExtensionsState,
    notifications: collaborators.notifications,
    onExtensionsRegenerated: collaborators.onExtensionsRegenerated,
  });

  const results: Array<CliEditorFunctionCallReport> = [];
  let didModifyProject = false;
  let failedCallIndex: number | null = null;
  try {
    for (let index = 0; index < functionCalls.length; index++) {
      const functionCall = functionCalls[index];
      if (!isCallableFromCli(functionCall.name)) {
        results.push({
          ...functionCall,
          success: false,
          output: {
            message: AI_BACKEND_FUNCTION_NAMES.has(functionCall.name)
              ? `"${
                  functionCall.name
                }" is handled by the GDevelop AI, it can't be called from the CLI.`
              : `Unknown function: "${
                  functionCall.name
                }". Use LIST_EDITOR_FUNCTIONS to list the functions.`,
          },
        });
        failedCallIndex = index;
        break;
      }

      const {
        results: [result],
      } = await processEditorFunctionCalls({
        project,
        functionCalls: [
          {
            name: functionCall.name,
            arguments: JSON.stringify(functionCall.arguments),
            call_id: `cli-call-${index}`,
          },
        ],
        i18n,
        editorCallbacks: cliEditorCallbacks,
        toolOptions: null,
        toolsVersion: PUBLIC_API_TOOLS_VERSION,
        runScriptReadOnly,
        relatedAiRequestId: null,
        getRelatedAiRequestLastMessages: () => ({
          lastUserMessage: null,
          lastAssistantMessages: [],
        }),
        generateEvents: services.generateEvents,
        onSceneEventsModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onObjectsModifiedOutsideEditor,
        onEffectsModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onEffectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onObjectGroupsModifiedOutsideEditor,
        onProjectItemRenamedOutsideEditor:
          collaborators.onProjectItemRenamedOutsideEditor,
        onWillDeleteScene: collaborators.onWillDeleteScene,
        onWillDeleteGameplayTest: collaborators.onWillDeleteGameplayTest,
        onWillDeleteObject: collaborators.onWillDeleteObject,
        sendChangesToEditor: coalescedOutsideEditorChanges.flush,
        onExtensionsModifiedOutsideEditor:
          coalescedOutsideEditorChanges.onExtensionsModifiedOutsideEditor,
        ensureExtensionsUpToDate:
          coalescedOutsideEditorChanges.ensureExtensionsUpToDate,
        reloadExtensionMetadata:
          coalescedOutsideEditorChanges.reloadExtensionMetadata,
        onWillDeleteExtensionItem: collaborators.onWillDeleteExtensionItem,
        ensureExtensionInstalled: services.ensureExtensionInstalled,
        onWillInstallExtension: collaborators.onWillInstallExtension,
        onExtensionInstalled: collaborators.onExtensionInstalled,
        searchAndInstallAsset: services.searchAndInstallAsset,
        searchAndInstallEffectAsset: services.searchAndInstallEffectAsset,
        searchAndInstallResources: services.searchAndInstallResources,
        attachmentsForResources: services.attachmentsForResources,
        getAssetStoreTagForNewObject: services.getAssetStoreTagForNewObject,
      });

      const success = result.status === 'finished' && result.success;
      if (result.status === 'finished' && result.didModifyProject) {
        didModifyProject = true;
      }
      results.push({
        ...functionCall,
        success,
        output: result.status === 'finished' ? result.output : null,
      });
      if (!success) {
        failedCallIndex = index;
        break;
      }
    }
  } finally {
    coalescedOutsideEditorChanges.flush();
    // Regenerate the extensions left dirty, so the project is saved with
    // up-to-date generated code.
    await coalescedOutsideEditorChanges.ensureExtensionsUpToDate();
  }

  return {
    success: failedCallIndex === null,
    didModifyProject,
    results,
    notRunCalls:
      failedCallIndex === null ? [] : functionCalls.slice(failedCallIndex + 1),
  };
};
