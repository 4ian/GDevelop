// @flow
import functionsV22 from './v22/functions.json';
import scriptApiDefinitionV22 from './v22/script-api.d.ts';
import eventScriptGuide from './event-script-guide.md';

/**
 * The public API of the editor functions, as given to the external agents
 * (the MCP server and the CLI): what the GDevelop AI is given to call them.
 *
 * The argument schemas and the script API definition are exported from the
 * GDevelop AI backend (`generation-api/scripts/export-editor-functions-api.js`
 * in GDevelop-services) for a version of its tools, and committed here.
 * The EventScript guide is authored here, and read by the prompts of the
 * GDevelop AI (the AiPrompts repository) from this file.
 */

export type PublicApiFunction = {|
  name: string,
  description: string,
  // A JSON Schema of the arguments of the function.
  inputSchema: Object,
|};

export type PublicApi = {|
  toolsVersion: string,
  functions: Array<PublicApiFunction>,
  // The TypeScript definition of the functions a `run_script` script can
  // call, with their output types.
  scriptApiDefinition: string,
  // The syntax of the "EventScript" of `generate_events`.
  eventScriptGuide: string,
|};

export const PUBLIC_API_TOOLS_VERSION = 'v22';

export const getPublicApi = (): PublicApi => ({
  toolsVersion: functionsV22.toolsVersion,
  functions: functionsV22.functions,
  scriptApiDefinition: scriptApiDefinitionV22,
  eventScriptGuide,
});
