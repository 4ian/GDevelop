// @flow
import { type EventsGenerationResult } from '.';
import {
  editorFunctions,
  type EditorFunction,
  type EditorFunctionCall,
  type EventsGenerationOptions,
  type AssetSearchAndInstallOptions,
  type AssetSearchAndInstallResult,
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

type EditorFunctionGenericOutput = {|
  success: boolean,
  message?: string,
  eventsForSceneNamed?: string,
  eventsAsText?: string,
  objectName?: string,
  behaviorName?: string,
  properties?: any,
  sharedProperties?: any,
  instances?: any,
|};

export type ProcessEditorFunctionCallsOptions = {|
  project: gdProject,
  functionCalls: Array<EditorFunctionCall>,
  ignore: boolean,
  generateEvents: (
    options: EventsGenerationOptions
  ) => Promise<EventsGenerationResult>,
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
  generateEvents,
  ignore,
  ensureExtensionInstalled,
  searchAndInstallAsset,
}: ProcessEditorFunctionCallsOptions): Promise<
  Array<EditorFunctionCallResult>
> => {
  const results: Array<EditorFunctionCallResult> = [];

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
          ensureExtensionInstalled,
          searchAndInstallAsset,
        }
      );
      const { success, ...output } = result;
      results.push({
        status: 'finished',
        call_id,
        success,
        output,
      });
    } catch (error) {
      results.push({
        status: 'finished',
        call_id,
        success: false,
        output: { message: error.message || 'Unknown error' },
      });
    }
  }

  return results;
};
