// @flow
import { getPublicApi } from '../../EditorFunctions/PublicApi';
import { type McpServerTool } from './McpServerTool';
import { getScriptApiDefinitionWithLocalFiles } from './LocalFilesAsAttachments';
import { getScriptApiDefinitionExcerpt } from './ScriptApiDefinitionExcerpt';

export const SCRIPT_API_DEFINITION_URI = 'gdevelop://docs/script-api.d.ts';
export const EVENT_SCRIPT_GUIDE_URI = 'gdevelop://docs/event-script-guide.md';
export const GAMEPLAY_HARNESS_GUIDE_URI =
  'gdevelop://docs/gameplay-test-harness-guide.md';

export const readGameplayHarnessGuideToolName =
  'read_gameplay_test_harness_guide';

const readScriptApiDefinitionTool: McpServerTool = {
  definition: {
    name: 'read_script_api_definition',
    description:
      'Read the TypeScript definition of the functions a `run_script` script can call, with their output types (also the resource ' +
      SCRIPT_API_DEFINITION_URI +
      '). Read it before writing a script. It is long (about 140 KB): give `functions` to read only the functions the script calls.',
    inputSchema: {
      type: 'object',
      properties: {
        functions: {
          type: 'string',
          description:
            'Optional: the names of the functions to read, separated by commas (like "describe_instances, put_3d_instances"). Only their declarations are given, with the types they share. If not set, the whole definition is given.',
        },
      },
    },
    annotations: { readOnlyHint: true },
  },
  isAvailable: () => true,
  call: async toolArguments => ({
    value: getScriptApiDefinitionExcerpt(
      getScriptApiDefinitionWithLocalFiles(),
      typeof toolArguments.functions === 'string' ? toolArguments.functions : ''
    ),
    isError: false,
  }),
};

const readGameplayHarnessGuideTool: McpServerTool = {
  definition: {
    name: readGameplayHarnessGuideToolName,
    description:
      'Read the guide of the `harness` a gameplay test (`run_gameplay_test`) is written with: its API (stepping frames, simulating inputs, reading the objects, asserting) and the rules of reliable tests (also the resource ' +
      GAMEPLAY_HARNESS_GUIDE_URI +
      '). Read it before writing a test.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  isAvailable: () => true,
  call: async () => ({
    value: getPublicApi().gameplayHarnessGuide,
    isError: false,
  }),
};

export const docTools: Array<McpServerTool> = [
  readScriptApiDefinitionTool,
  readGameplayHarnessGuideTool,
];
