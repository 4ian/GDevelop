// @flow
import { getPublicApi } from '../../EditorFunctions/PublicApi';
import { type McpServerTool } from './McpServerTool';

/**
 * Calls a function of the GDevelop AI reading the docs or searching the
 * stores, on its backend: the agent gets the same answers as the GDevelop AI.
 * The extensions of the opened project are documented only when asked.
 */
export type McpCallLookupTool = ({|
  name: string,
  args: Object,
  withProjectExtensions: boolean,
|}) => Promise<{ success: boolean, [string]: any }>;

// The found assets and resources are only useful to change the project.
const STORE_SEARCH_TOOL_NAMES = new Set([
  'search_object_asset_store',
  'search_resource_store',
]);

// What the GDevelop AI knows from its prompts.
const getDescription = (name: string, description: string): string =>
  name === 'search_object_asset_store'
    ? `${description} Create a chosen object with \`create_or_replace_object\`, giving its \`shortId\` as \`asset_id\` (an effect goes on a 3D layer with \`change_scene_properties_layers_effects_groups\`).`
    : description;

export const makeLookupTools = (
  callLookupTool: McpCallLookupTool
): Array<McpServerTool> =>
  getPublicApi().lookupFunctions.map(({ name, description, inputSchema }) => ({
    definition: {
      name,
      description: getDescription(name, description),
      inputSchema,
      annotations: { readOnlyHint: true },
    },
    isAvailable: ({ isReadOnly }) =>
      !isReadOnly || !STORE_SEARCH_TOOL_NAMES.has(name),
    call: async toolArguments => {
      const output = await callLookupTool({
        name,
        args: toolArguments,
        withProjectExtensions: !STORE_SEARCH_TOOL_NAMES.has(name),
      });
      return { value: output, isError: !output.success };
    },
  }));
