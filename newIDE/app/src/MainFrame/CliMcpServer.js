// @flow
import {
  describeCliEditorFunctions,
  parseCliEditorFunctionCalls,
  type CliEditorFunctionCall,
  type CliEditorFunctionCallsReport,
} from './CliEditorFunctions';
import {
  getPublicApi,
  type PublicApiFunction,
} from '../EditorFunctions/PublicApi';
import { NON_SCRIPTABLE_FUNCTION_NAMES } from '../EditorFunctions/ScriptExecution/NonScriptableFunctionNames';
import {
  describeProject,
  type McpOpenedProject,
  type McpServerTool,
  type McpTool,
} from './McpServerTools/McpServerTool';
import {
  docTools,
  readGameplayHarnessGuideToolName,
  SCRIPT_API_DEFINITION_URI,
  EVENT_SCRIPT_GUIDE_URI,
  GAMEPLAY_HARNESS_GUIDE_URI,
} from './McpServerTools/DocTools';

/**
 * A Model Context Protocol server (https://modelcontextprotocol.io) exposing
 * the editor functions of the opened project, so that an AI agent (Claude
 * Code, Cursor...) can explore and edit the game with the same functions as
 * the GDevelop AI. The messages are received and sent by the main process,
 * on stdin/stdout (the "stdio" transport).
 *
 * Each editor function is a tool, described by the argument schemas of the
 * public API (see `EditorFunctions/PublicApi`), and the other tools (docs,
 * project creation...) are `McpServerTools`. The script API definition,
 * the EventScript guide and the gameplay test harness guide are given as
 * resources (and the EventScript guide in the instructions of the server, as
 * writing events needs it).
 */

const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

type JsonRpcId = string | number;

type JsonRpcMessage = {|
  jsonrpc: '2.0',
  // Missing (or null) for a notification.
  id?: JsonRpcId | null,
  method?: string,
  params?: any,
|};

export type JsonRpcResponse =
  | {| jsonrpc: '2.0', id: JsonRpcId, result: any |}
  | {|
      jsonrpc: '2.0',
      id: JsonRpcId | null,
      error: {| code: number, message: string |},
    |};

type McpContent =
  | {| type: 'text', text: string |}
  | {| type: 'image', data: string, mimeType: string |};

type McpToolResult = {|
  content: Array<McpContent>,
  isError: boolean,
|};

export type McpToolCallReport = {|
  toolName: string,
  clientName: string | null,
  success: boolean,
  durationMs: number,
|};

export type CliMcpServerHandlers = {|
  getServerVersion: () => string,
  // Absent when the project can't change during the session (`--mcp` opens
  // the one given in the arguments).
  getOpenedProject?: () => ?McpOpenedProject,
  onToolCalled?: (report: McpToolCallReport) => void,
  // Added to the docs tools, which are always there.
  serverTools?: Array<McpServerTool>,
  // Only the functions not modifying the project are exposed, and scripts
  // can only call them.
  isReadOnly: boolean,
  runEditorFunctionCalls: (
    functionCalls: Array<CliEditorFunctionCall>,
    options: {| runScriptReadOnly: boolean |}
  ) => Promise<CliEditorFunctionCallsReport>,
  saveProject: () => Promise<boolean>,
|};

/** What an MCP session remembers between its messages. */
type McpSession = {|
  clientName: string | null,
  // The project the tools act on, as last told to the client.
  knownProject: ?McpOpenedProject,
|};

const makeMcpSession = (): McpSession => ({
  clientName: null,
  knownProject: null,
});

const isSameProject = (
  project: McpOpenedProject,
  otherProject: McpOpenedProject
): boolean =>
  project.location || otherProject.location
    ? project.location === otherProject.location
    : project.name === otherProject.name;

const saveProjectTool: McpTool = {
  name: 'save_project',
  description:
    'Save the GDevelop project with the changes made so far. The changes made by the other tools are kept in memory until this is called.',
  inputSchema: { type: 'object', properties: {} },
};

const getAvailableServerTools = (
  handlers: CliMcpServerHandlers
): Array<McpServerTool> =>
  [...docTools, ...(handlers.serverTools || [])].filter(serverTool =>
    serverTool.isAvailable({ isReadOnly: handlers.isReadOnly })
  );

/**
 * The tools of the server: the editor functions described by the public API
 * (the ones the editor implements), the project save and the server tools.
 */
export const getMcpTools = ({
  isReadOnly,
  serverTools = [],
}: {|
  isReadOnly: boolean,
  serverTools?: Array<McpServerTool>,
|}): Array<McpTool> => {
  const callableFunctions = new Map(
    describeCliEditorFunctions().map(description => [
      description.name,
      description,
    ])
  );
  const publicApiFunctions = getPublicApi().functions.filter(
    publicApiFunction => {
      const callableFunction = callableFunctions.get(publicApiFunction.name);
      if (!callableFunction) return false;
      // A read-only script can still run: it only calls read-only functions.
      return (
        !isReadOnly ||
        !callableFunction.modifiesProject ||
        publicApiFunction.name === 'run_script'
      );
    }
  );
  const otherTools = [
    ...(isReadOnly ? [] : [saveProjectTool]),
    ...serverTools.map(serverTool => serverTool.definition),
  ];
  // Agents try to call them in scripts (the script API definition declares
  // `generate_events` and `run_gameplay_test`).
  const nonScriptableToolNames = [
    ...publicApiFunctions
      .map(publicApiFunction => publicApiFunction.name)
      .filter(
        name => name !== 'run_script' && NON_SCRIPTABLE_FUNCTION_NAMES.has(name)
      ),
    ...otherTools.map(tool => tool.name),
  ];
  const getDescription = ({ name, description }: PublicApiFunction) => {
    if (name === 'run_gameplay_test')
      return `${description} Read \`${readGameplayHarnessGuideToolName}\` before writing the \`source\` of a test.`;
    if (name === 'run_script')
      return `${description} These are tools, not functions a script can call: ${nonScriptableToolNames
        .map(toolName => `\`${toolName}\``)
        .join(', ')}.`;
    return description;
  };

  return [
    ...publicApiFunctions.map(
      (publicApiFunction): McpTool => {
        const callableFunction = callableFunctions.get(publicApiFunction.name);
        return {
          name: publicApiFunction.name,
          description: getDescription(publicApiFunction),
          inputSchema: publicApiFunction.inputSchema,
          annotations: {
            readOnlyHint:
              !callableFunction || !callableFunction.modifiesProject,
          },
        };
      }
    ),
    ...otherTools,
  ];
};

const getOpenedProjectInstructions = (
  openedProject: ?McpOpenedProject
): string =>
  openedProject
    ? `The project opened in the editor, which the tools act on, is ${describeProject(
        openedProject
      )}. If the user opens another project in this window, the next tool call fails once to tell it.`
    : 'No project is opened in the editor yet: the tools fail until the user opens one, or until a new project is created with `create_project` (ask the user first).';

export const getMcpInstructions = ({
  isReadOnly,
  openedProject,
}: {|
  isReadOnly: boolean,
  // Undefined when the project can't change during the session.
  openedProject?: ?McpOpenedProject,
|}): string =>
  [
    ...(openedProject !== undefined
      ? [getOpenedProjectInstructions(openedProject)]
      : []),
    'This server edits the GDevelop game project opened in the GDevelop editor, with the functions the GDevelop AI uses. Each tool is one of these functions.',
    'Explore before editing: `read_game_project_json` gives the scenes, objects, variables and events of the project; the `inspect_*` and `describe_instances` tools give details.',
    'Prefer `run_script` for several related steps: it runs JavaScript calling the functions as async functions. Read `read_script_api_definition` first for their exact signatures and outputs.',
    'Events (the game logic) are written with `generate_events`, giving an `event_script` for each batch: the "EventScript" syntax below. The script is compiled by the GDevelop backend; on compile errors nothing is applied and the errors are returned, fix the script and call again. Events cannot be written from a description.',
    'Resources (images, 3D models, sounds, musics, fonts) need no file: images and 3D models come with the objects created from the asset store (`create_or_replace_object`); a new sound or music is installed from the free library when events use a new audio file name, and a new font when the font property of an object is set to a new name. Find the exact names with `search_resource_store` rather than inventing them, so that the right file is installed.',
    'Gameplay tests (`run_gameplay_test`) play the game in a real preview, simulating the inputs of the player: read `read_gameplay_test_harness_guide` before writing one.',
    isReadOnly
      ? 'The project is opened read-only: only the functions not modifying it are available.'
      : 'The changes are kept in memory: call `save_project` once a coherent set of changes is done.',
    '',
    '# EventScript syntax',
    '',
    getPublicApi().eventScriptGuide,
  ].join('\n');

const resources = [
  {
    uri: SCRIPT_API_DEFINITION_URI,
    name: 'Script API definition',
    description:
      'The TypeScript definition of the functions a `run_script` script can call, with their output types.',
    mimeType: 'text/plain',
  },
  {
    uri: EVENT_SCRIPT_GUIDE_URI,
    name: 'EventScript guide',
    description: 'The syntax of the `event_script` of `generate_events`.',
    mimeType: 'text/markdown',
  },
  {
    uri: GAMEPLAY_HARNESS_GUIDE_URI,
    name: 'Gameplay test harness guide',
    description:
      'The API of the `harness` of the gameplay tests (`run_gameplay_test`), and the rules of reliable tests.',
    mimeType: 'text/markdown',
  },
];

const readResource = (uri: string): ?{| mimeType: string, text: string |} => {
  if (uri === SCRIPT_API_DEFINITION_URI) {
    return { mimeType: 'text/plain', text: getPublicApi().scriptApiDefinition };
  }
  if (uri === EVENT_SCRIPT_GUIDE_URI) {
    return { mimeType: 'text/markdown', text: getPublicApi().eventScriptGuide };
  }
  if (uri === GAMEPLAY_HARNESS_GUIDE_URI) {
    return {
      mimeType: 'text/markdown',
      text: getPublicApi().gameplayHarnessGuide,
    };
  }
  return null;
};

/**
 * The screenshots of a gameplay test (base64 JPEGs in `screenshots`) are given
 * as images, which the client shows to its model: the text keeps their label
 * and frame only.
 */
const extractScreenshots = (
  value: any
): {| value: any, images: Array<McpContent> |} => {
  if (!value || typeof value !== 'object' || !Array.isArray(value.screenshots))
    return { value, images: [] };
  const images: Array<McpContent> = [];
  const screenshots = value.screenshots.map(screenshot => {
    if (!screenshot || typeof screenshot.jpegBase64 !== 'string')
      return screenshot;
    const { jpegBase64, ...withoutImage } = screenshot;
    images.push({ type: 'image', data: jpegBase64, mimeType: 'image/jpeg' });
    return { ...withoutImage, image: 'attached below' };
  });
  return { value: { ...value, screenshots }, images };
};

/**
 * The calls a script made are given back with their outputs: the arguments of
 * the successful ones are dropped, as the agent wrote them in its script.
 */
const withoutSuccessfulCallsArguments = (output: any): any => {
  if (!output || !Array.isArray(output.functionCallRecords)) return output;
  return {
    ...output,
    functionCallRecords: output.functionCallRecords.map(record => {
      if (!record || !record.success) return record;
      const { args, ...recordWithoutArgs } = record;
      return recordWithoutArgs;
    }),
  };
};

// Results are re-read by the model at each of its next turns: no indentation.
const makeToolResult = (value: any, isError: boolean): McpToolResult => {
  const { value: valueWithoutImages, images } = extractScreenshots(value);
  return {
    content: [
      {
        type: 'text',
        text:
          typeof valueWithoutImages === 'string'
            ? valueWithoutImages
            : JSON.stringify(valueWithoutImages),
      },
      ...images,
    ],
    isError,
  };
};

/**
 * Refuses a call when no project is opened, or once when the opened project
 * is not the one the client was told about: the agent must not edit another
 * project than the one it was working on without noticing it.
 */
const checkOpenedProject = (
  handlers: CliMcpServerHandlers,
  session: McpSession
): ?McpToolResult => {
  if (!handlers.getOpenedProject) return null;
  const openedProject = handlers.getOpenedProject();
  if (!openedProject) {
    const hints = getAvailableServerTools(handlers)
      .map(serverTool => serverTool.noOpenedProjectHint)
      .filter(Boolean);
    return makeToolResult(
      {
        message: `No project is opened in the GDevelop editor. Ask the user to open the project to work on, ${
          hints.length ? `or ${hints.join(', or ')}` : 'then call again'
        }.`,
      },
      true
    );
  }
  const knownProject = session.knownProject;
  session.knownProject = openedProject;
  if (!knownProject || isSameProject(knownProject, openedProject)) return null;
  return makeToolResult(
    {
      message: `Nothing was done: the project opened in the GDevelop editor is now ${describeProject(
        openedProject
      )}, not ${describeProject(
        knownProject
      )} anymore. Check with the user that it is the project to work on, then call again.`,
    },
    true
  );
};

const callTool = async (
  name: string,
  toolArguments: any,
  handlers: CliMcpServerHandlers,
  session: McpSession
): Promise<McpToolResult> => {
  const serverTool = getAvailableServerTools(handlers).find(
    serverTool => serverTool.definition.name === name
  );
  if (serverTool) {
    const { value, isError } = await serverTool.call(toolArguments, {
      getOpenedProject: handlers.getOpenedProject,
    });
    // The opened project is the one the next calls act on.
    if (serverTool.opensProject && !isError) session.knownProject = null;
    return makeToolResult(value, isError);
  }

  const openedProjectError = checkOpenedProject(handlers, session);
  if (openedProjectError) return openedProjectError;
  if (name === saveProjectTool.name) {
    if (handlers.isReadOnly) {
      return makeToolResult(
        { message: 'The project is opened read-only.' },
        true
      );
    }
    const saved = await handlers.saveProject();
    return makeToolResult(
      { success: saved, message: saved ? 'Project saved.' : 'Save failed.' },
      !saved
    );
  }

  const tool = getMcpTools({ isReadOnly: handlers.isReadOnly }).find(
    tool => tool.name === name
  );
  if (!tool) {
    return makeToolResult({ message: `Unknown tool: ${name}.` }, true);
  }
  const report = await handlers.runEditorFunctionCalls(
    parseCliEditorFunctionCalls({ name, arguments: toolArguments }),
    { runScriptReadOnly: handlers.isReadOnly }
  );
  // A tool call is a single function call, so it has a single result.
  const [result] = report.results;
  if (!result) throw new Error(`No result for the call to ${name}.`);
  // A gameplay test that ran and failed is a result, not a tool error: clients
  // drop the images of an error.
  const isGameplayTestReport =
    !!result.output && typeof result.output.status === 'string';
  return makeToolResult(
    {
      success: result.success,
      ...(name === 'run_script'
        ? withoutSuccessfulCallsArguments(result.output)
        : result.output),
    },
    !result.success && !isGameplayTestReport
  );
};

/**
 * Handle one JSON-RPC message: returns the response to send, or null for a
 * notification.
 */
export const handleMcpMessage = async (
  message: JsonRpcMessage,
  handlers: CliMcpServerHandlers,
  session: McpSession = makeMcpSession()
): Promise<JsonRpcResponse | null> => {
  const { id, method, params } = message;
  if (id === undefined || id === null) return null;

  try {
    if (method === 'initialize') {
      const requestedProtocolVersion: string =
        params && typeof params.protocolVersion === 'string'
          ? params.protocolVersion
          : '';
      session.clientName =
        params &&
        params.clientInfo &&
        typeof params.clientInfo.name === 'string'
          ? params.clientInfo.name
          : null;
      const openedProject = handlers.getOpenedProject
        ? handlers.getOpenedProject()
        : undefined;
      if (openedProject) session.knownProject = openedProject;
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(
            requestedProtocolVersion
          )
            ? requestedProtocolVersion
            : SUPPORTED_PROTOCOL_VERSIONS[0],
          capabilities: { tools: {}, resources: {} },
          serverInfo: {
            name: 'gdevelop',
            version: handlers.getServerVersion(),
          },
          instructions: getMcpInstructions({
            isReadOnly: handlers.isReadOnly,
            openedProject,
          }),
        },
      };
    }
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: getMcpTools({
            isReadOnly: handlers.isReadOnly,
            serverTools: getAvailableServerTools(handlers),
          }),
        },
      };
    }
    if (method === 'tools/call') {
      const toolName =
        params && typeof params.name === 'string' ? params.name : '';
      const startTime = Date.now();
      let result: McpToolResult;
      try {
        result = await callTool(
          toolName,
          (params && params.arguments) || {},
          handlers,
          session
        );
      } catch (error) {
        result = makeToolResult(
          { message: error.message || 'Unknown error' },
          true
        );
      }
      if (handlers.onToolCalled) {
        handlers.onToolCalled({
          toolName,
          clientName: session.clientName,
          success: !result.isError,
          durationMs: Date.now() - startTime,
        });
      }
      return { jsonrpc: '2.0', id, result };
    }
    if (method === 'resources/list') {
      return { jsonrpc: '2.0', id, result: { resources } };
    }
    if (method === 'resources/read') {
      const uri = params && typeof params.uri === 'string' ? params.uri : '';
      const resource = readResource(uri);
      if (!resource) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32002, message: `Resource not found: ${uri}` },
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        result: { contents: [{ uri, ...resource }] },
      };
    }
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method || ''}` },
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      result: makeToolResult(
        { message: error.message || 'Unknown error' },
        true
      ),
    };
  }
};

/**
 * Handle the lines received on stdin, one at a time (the project must not be
 * changed by two calls at the same time), sending each response.
 */
export const makeMcpMessagesQueue = ({
  handlers,
  send,
}: {|
  handlers: CliMcpServerHandlers,
  send: (text: string) => void,
|}): ((line: string) => void) => {
  let queue: Promise<void> = Promise.resolve();
  const session = makeMcpSession();
  return (line: string) => {
    queue = queue.then(async () => {
      let message: JsonRpcMessage;
      try {
        message = JSON.parse(line);
      } catch (error) {
        send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error.' },
          })
        );
        return;
      }
      const response = await handleMcpMessage(message, handlers, session);
      if (response) send(JSON.stringify(response));
    });
  };
};
