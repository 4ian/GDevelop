// @flow
import {
  describeCliEditorFunctions,
  parseCliEditorFunctionCalls,
  type CliEditorFunctionCall,
  type CliEditorFunctionCallsReport,
} from './CliEditorFunctions';
import { getPublicApi } from '../EditorFunctions/PublicApi';

/**
 * A Model Context Protocol server (https://modelcontextprotocol.io) exposing
 * the editor functions of the opened project, so that an AI agent (Claude
 * Code, Cursor...) can explore and edit the game with the same functions as
 * the GDevelop AI. The messages are received and sent by the main process,
 * on stdin/stdout (the "stdio" transport).
 *
 * Each editor function is a tool, described by the argument schemas of the
 * public API (see `EditorFunctions/PublicApi`). The script API definition
 * and the EventScript guide are given as resources (and the guide in the
 * instructions of the server, as writing events needs it).
 */

const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const SCRIPT_API_DEFINITION_URI = 'gdevelop://docs/script-api.d.ts';
const EVENT_SCRIPT_GUIDE_URI = 'gdevelop://docs/event-script-guide.md';

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

export type McpTool = {|
  name: string,
  description: string,
  inputSchema: Object,
  annotations?: {| readOnlyHint: boolean |},
|};

export type McpOpenedProject = {|
  name: string,
  // The file path (or cloud identifier) of the project, if saved.
  location: string | null,
  // The cloud identifier means nothing to the agent: it is not shown.
  isCloudProject?: boolean,
|};

export type McpGameTemplate = {|
  slug: string,
  name: string,
  shortDescription: string,
  tags: Array<string>,
|};

// Creates the project, opened in the editor, and saves it.
export type McpCreateProject = ({|
  name: string,
  templateSlug: string | null,
|}) => Promise<{| success: boolean, message: string |}>;

export type McpProjectCreation = {|
  listGameTemplates: () => Promise<Array<McpGameTemplate>>,
  createProject: McpCreateProject,
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
  // Absent when a project is always opened (`--mcp`).
  projectCreation?: McpProjectCreation,
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

const describeProject = (project: McpOpenedProject): string =>
  `"${project.name}"` +
  (project.isCloudProject
    ? ' (a cloud project)'
    : project.location
    ? ` (${project.location})`
    : '');

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

const readScriptApiDefinitionTool: McpTool = {
  name: 'read_script_api_definition',
  description:
    'Read the TypeScript definition of the functions a `run_script` script can call, with their output types (also the resource ' +
    SCRIPT_API_DEFINITION_URI +
    '). Read it before writing a script.',
  inputSchema: { type: 'object', properties: {} },
  annotations: { readOnlyHint: true },
};

const listGameTemplatesTool: McpTool = {
  name: 'list_game_templates',
  description:
    'List the game templates (examples) a new project can start from, with `create_project`. Only useful when no project is opened in the editor.',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description:
          'Optional: only list the templates whose name, description or tags contain all these words (separated by spaces), like "platformer" or "3d racing".',
      },
    },
  },
  annotations: { readOnlyHint: true },
};

const createProjectTool: McpTool = {
  name: 'create_project',
  description:
    'Create a new game project, opened in the editor, from a game template (see `list_game_templates`) or empty. Only possible when no project is opened in the editor (the user can open an existing one instead: ask first if they want a new game). The project is saved in the GDevelop cloud projects of the user (they must be logged in); call `save_project` afterwards to save the changes.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: {
        type: 'string',
        description: 'The name of the game.',
      },
      template_slug: {
        type: 'string',
        description:
          'Optional: the `slug` of the game template to start from, from `list_game_templates`. If not set, the project is empty (one scene).',
      },
    },
    required: ['project_name'],
  },
};

const MAX_LISTED_GAME_TEMPLATES = 60;

const filterGameTemplates = (
  templates: Array<McpGameTemplate>,
  search: string
): Array<McpGameTemplate> => {
  const words = search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return templates;
  return templates.filter(template => {
    const text = [template.name, template.shortDescription, ...template.tags]
      .join(' ')
      .toLowerCase();
    return words.every(word => text.includes(word));
  });
};

/**
 * The tools of the server: the editor functions described by the public API
 * (the ones the editor implements), plus the project save and the script API
 * definition.
 */
export const getMcpTools = ({
  isReadOnly,
  canCreateProject = false,
}: {|
  isReadOnly: boolean,
  canCreateProject?: boolean,
|}): Array<McpTool> => {
  const callableFunctions = new Map(
    describeCliEditorFunctions().map(description => [
      description.name,
      description,
    ])
  );
  const functionTools = getPublicApi()
    .functions.filter(publicApiFunction => {
      const callableFunction = callableFunctions.get(publicApiFunction.name);
      if (!callableFunction) return false;
      // A read-only script can still run: it only calls read-only functions.
      return (
        !isReadOnly ||
        !callableFunction.modifiesProject ||
        publicApiFunction.name === 'run_script'
      );
    })
    .map(
      (publicApiFunction): McpTool => {
        const callableFunction = callableFunctions.get(publicApiFunction.name);
        return {
          name: publicApiFunction.name,
          description: publicApiFunction.description,
          inputSchema: publicApiFunction.inputSchema,
          annotations: {
            readOnlyHint:
              !callableFunction || !callableFunction.modifiesProject,
          },
        };
      }
    );

  return [
    ...functionTools,
    readScriptApiDefinitionTool,
    ...(isReadOnly ? [] : [saveProjectTool]),
    ...(canCreateProject ? [listGameTemplatesTool, createProjectTool] : []),
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
];

const readResource = (uri: string): ?{| mimeType: string, text: string |} => {
  if (uri === SCRIPT_API_DEFINITION_URI) {
    return { mimeType: 'text/plain', text: getPublicApi().scriptApiDefinition };
  }
  if (uri === EVENT_SCRIPT_GUIDE_URI) {
    return { mimeType: 'text/markdown', text: getPublicApi().eventScriptGuide };
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

const makeToolResult = (value: any, isError: boolean): McpToolResult => {
  const { value: valueWithoutImages, images } = extractScreenshots(value);
  return {
    content: [
      {
        type: 'text',
        text:
          typeof valueWithoutImages === 'string'
            ? valueWithoutImages
            : JSON.stringify(valueWithoutImages, null, 2),
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
    return makeToolResult(
      {
        message: handlers.projectCreation
          ? 'No project is opened in the GDevelop editor. Ask the user to open the project to work on, or if they want a new game, create it with `create_project`.'
          : 'No project is opened in the GDevelop editor. Ask the user to open the project to work on, then call again.',
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
  if (name === readScriptApiDefinitionTool.name) {
    return makeToolResult(getPublicApi().scriptApiDefinition, false);
  }
  const { projectCreation } = handlers;
  if (projectCreation && name === listGameTemplatesTool.name) {
    const templates = filterGameTemplates(
      await projectCreation.listGameTemplates(),
      typeof toolArguments.search === 'string' ? toolArguments.search : ''
    );
    return makeToolResult(
      {
        // The tags (the features used by the template) are only searched.
        templates: templates
          .slice(0, MAX_LISTED_GAME_TEMPLATES)
          .map(({ slug, name, shortDescription }) => ({
            slug,
            name,
            shortDescription,
          })),
        ...(templates.length > MAX_LISTED_GAME_TEMPLATES
          ? {
              message: `${templates.length -
                MAX_LISTED_GAME_TEMPLATES} more templates: use \`search\` to find others.`,
            }
          : {}),
      },
      false
    );
  }
  if (projectCreation && name === createProjectTool.name) {
    const openedProject = handlers.getOpenedProject
      ? handlers.getOpenedProject()
      : null;
    if (openedProject) {
      return makeToolResult(
        {
          message: `Nothing was done: a project is already opened in the editor (${describeProject(
            openedProject
          )}). A new project can only be created when none is opened: work on this one, or ask the user to close it first.`,
        },
        true
      );
    }
    const projectName =
      typeof toolArguments.project_name === 'string'
        ? toolArguments.project_name.trim()
        : '';
    if (!projectName) {
      return makeToolResult({ message: 'Missing `project_name`.' }, true);
    }
    const result = await projectCreation.createProject({
      name: projectName,
      templateSlug:
        typeof toolArguments.template_slug === 'string' &&
        toolArguments.template_slug.trim()
          ? toolArguments.template_slug.trim()
          : null,
    });
    // The created project is the one the next calls act on.
    if (result.success) session.knownProject = null;
    return makeToolResult(result, !result.success);
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
  const result = report.results[0];
  // A gameplay test that ran and failed is a result, not a tool error: clients
  // drop the images of an error.
  const isGameplayTestReport =
    !!result && !!result.output && typeof result.output.status === 'string';
  return makeToolResult(
    result ? { success: result.success, ...result.output } : report,
    !report.success && !isGameplayTestReport
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
            canCreateProject: !!handlers.projectCreation,
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
