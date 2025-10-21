// @flow
import { type EventsGenerationResult } from '.';
import {
  editorFunctions,
  editorFunctionsWithoutProject,
  type EditorFunction,
  type EditorFunctionWithoutProject,
  type EditorCallbacks,
  type EditorFunctionCall,
  type EditorFunctionGenericOutput,
  type EventsGenerationOptions,
  type AssetSearchAndInstallOptions,
  type AssetSearchAndInstallResult,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from '.';

export type EditorFunctionCallResult =
  | {|
      status: 'working',
      call_id: string,
    |}
  | {|
      status: 'finished',
      call_id: string,
      success: boolean,
      output: any,
    |}
  | {|
      status: 'ignored',
      call_id: string,
    |};

export type ProcessEditorFunctionCallsOptions = {|
  project: gdProject | null,
  functionCalls: Array<EditorFunctionCall>,
  editorCallbacks: EditorCallbacks,
  ignore: boolean,
  generateEvents: (
    options: EventsGenerationOptions
  ) => Promise<EventsGenerationResult>,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  ensureExtensionInstalled: (options: {|
    extensionName: string,
  |}) => Promise<void>,
  searchAndInstallAsset: (
    options: AssetSearchAndInstallOptions
  ) => Promise<AssetSearchAndInstallResult>,
|};

export const processEditorFunctionCalls = async ({
  functionCalls,
  project,
  editorCallbacks,
  generateEvents,
  onSceneEventsModifiedOutsideEditor,
  onInstancesModifiedOutsideEditor,
  onObjectsModifiedOutsideEditor,
  onObjectGroupsModifiedOutsideEditor,
  ignore,
  ensureExtensionInstalled,
  searchAndInstallAsset,
}: ProcessEditorFunctionCallsOptions): Promise<{|
  results: Array<EditorFunctionCallResult>,
  createdSceneNames: Array<string>,
|}> => {
  const results: Array<EditorFunctionCallResult> = [];
  const createdSceneNames: Array<string> = [];

  for (const functionCall of functionCalls) {
    const call_id = functionCall.call_id;
    if (ignore) {
      results.push({
        status: 'ignored',
        call_id,
      });
      continue;
    }

    const name = functionCall.name;
    if (!project && name !== 'initialize_project') {
      results.push({
        status: 'finished',
        call_id,
        success: false,
        output: {
          message: 'No project opened.',
        },
      });
      continue;
    }
    let args;
    try {
      try {
        args = JSON.parse(functionCall.arguments);
      } catch (error) {
        console.error('Error parsing arguments: ', error);
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: 'Invalid arguments (not a valid JSON string).',
          },
        });
      }

      if (name === null) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: 'Missing or invalid function name.',
          },
        });
        continue;
      }

      if (args === null) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: `Invalid arguments for function: ${name}.`,
          },
        });
        continue;
      }

      // Check if the function exists
      const editorFunction: EditorFunction | null =
        editorFunctions[name] || null;
      const editorFunctionWithoutProject: EditorFunctionWithoutProject | null =
        editorFunctionsWithoutProject[name] || null;
      if (!editorFunction && !editorFunctionWithoutProject) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: `Unknown function: ${name}.`,
          },
        });
        continue;
      }

      const argumentsWithoutProject = {
        args,
        editorCallbacks,
        generateEvents,
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        ensureExtensionInstalled,
        searchAndInstallAsset,
      };

      // Execute the function
      let result: EditorFunctionGenericOutput;
      if (editorFunction) {
        if (project) {
          result = await editorFunction.launchFunction({
            ...argumentsWithoutProject,
            project,
          });
        } else {
          result = ({
            success: false,
            message: `Function ${name} requires a project to be opened before being used.`,
          }: EditorFunctionGenericOutput);
        }
      } else if (editorFunctionWithoutProject) {
        result = await editorFunctionWithoutProject.launchFunction(
          argumentsWithoutProject
        );
      } else {
        result = ({
          success: false,
          message: `Unknown function with name: ${name}. Please use something else as this seems not supported or existing.`,
        }: EditorFunctionGenericOutput);
      }

      const { success, meta, ...output } = result;
      results.push({
        status: 'finished',
        call_id,
        success,
        output,
      });

      if (meta && meta.newSceneNames) {
        createdSceneNames.push(...meta.newSceneNames);
      }
    } catch (error) {
      results.push({
        status: 'finished',
        call_id,
        success: false,
        output: { message: error.message || 'Unknown error' },
      });
    }
  }

  return { results, createdSceneNames };
};
