// @flow
import { type EventsGenerationResult } from '.';
import {
  editorFunctions,
  type EditorFunction,
  type EditorCallbacks,
  type EditorFunctionCall,
  type EditorFunctionGenericOutput,
  type EventsGenerationOptions,
  type AssetSearchAndInstallOptions,
  type AssetSearchAndInstallResult,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
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
  project: gdProject,
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
      if (!editorFunction) {
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

      // Execute the function
      const result: EditorFunctionGenericOutput = await editorFunction.launchFunction(
        {
          project,
          args,
          generateEvents,
          onSceneEventsModifiedOutsideEditor,
          onInstancesModifiedOutsideEditor,
          ensureExtensionInstalled,
          searchAndInstallAsset,
        }
      );
      
      // Handle special case for initialize_project
      if (result._requiresProjectInitialization && editorCallbacks.onCreateProjectFromExample) {
        const { name, exampleSlug } = result._projectInitializationData;
        try {
          await editorCallbacks.onCreateProjectFromExample(name, exampleSlug);
          results.push({
            status: 'finished',
            call_id,
            success: true,
            output: { message: `Project "${name}" initialized from example "${exampleSlug}".` },
          });
        } catch (error) {
          results.push({
            status: 'finished',
            call_id,
            success: false,
            output: { message: `Failed to initialize project: ${error.message}` },
          });
        }
      } else {
        const { success, ...output } = result;
        results.push({
          status: 'finished',
          call_id,
          success,
          output,
        });
      }

      if (success && args) {
        if (name === 'create_scene' && typeof args.scene_name === 'string') {
          createdSceneNames.push(args.scene_name);
        }
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
