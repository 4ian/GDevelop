// @flow
import {
  getMcpTools,
  handleMcpMessage,
  makeMcpMessagesQueue,
  type CliMcpServerHandlers,
  type McpOpenedProject,
  type McpProjectCreation,
  type McpCreateProject,
  type JsonRpcResponse,
} from './CliMcpServer';

// The real PixiResourcesLoader transitively imports ESM-only packages that
// Jest cannot parse: replace it with the test mock.
jest.mock('../ObjectsRendering/PixiResourcesLoader', () => {
  const {
    PixiResourcesLoaderMock,
  } = require('../fixtures/TestPixiResourcesLoader');
  return { __esModule: true, default: PixiResourcesLoaderMock };
});

const makeFakeCliMcpServerHandlers = (
  options: {| isReadOnly?: boolean |} = {}
): CliMcpServerHandlers => ({
  getServerVersion: () => '5.6.0',
  isReadOnly: !!options.isReadOnly,
  runEditorFunctionCalls: jest.fn(async functionCalls => ({
    success: true,
    didModifyProject: false,
    results: functionCalls.map(functionCall => ({
      ...functionCall,
      success: true,
      output: { message: `Ran ${functionCall.name}.` },
    })),
    notRunCalls: [],
  })),
  saveProject: jest.fn(async () => true),
});

const getResult = (response: JsonRpcResponse | null): Object => {
  if (!response || !response.result) throw new Error('No result.');
  return response.result;
};

describe('CliMcpServer', () => {
  it('answers the initialization with the protocol version asked by the client and the instructions', async () => {
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-03-26', capabilities: {} },
      },
      makeFakeCliMcpServerHandlers()
    );

    const result = getResult(response);
    expect(result.protocolVersion).toBe('2025-03-26');
    expect(result.capabilities).toEqual({ tools: {}, resources: {} });
    expect(result.serverInfo).toEqual({ name: 'gdevelop', version: '5.6.0' });
    expect(result.instructions).toContain('generate_events');
    // The EventScript guide, needed to write events.
    expect(result.instructions).toContain('always:');
  });

  it('does not answer notifications', async () => {
    expect(
      await handleMcpMessage(
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        makeFakeCliMcpServerHandlers()
      )
    ).toBe(null);
  });

  it('lists one tool per editor function of the public API, with its argument schema', async () => {
    const response = await handleMcpMessage(
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
      makeFakeCliMcpServerHandlers()
    );

    const tools = getResult(response).tools;
    const toolNames = tools.map(tool => tool.name);
    expect(toolNames).toContain('create_scene');
    expect(toolNames).toContain('generate_events');
    expect(toolNames).toContain('run_script');
    expect(toolNames).toContain('run_gameplay_test');
    expect(toolNames).toContain('read_script_api_definition');
    expect(toolNames).toContain('save_project');
    // Handled by the GDevelop AI backend, not by the editor.
    expect(toolNames).not.toContain('search_docs');
    expect(toolNames).not.toContain('run_edit_agent');

    const createSceneTool = tools.find(tool => tool.name === 'create_scene');
    expect(createSceneTool.inputSchema.required).toEqual(['scene_name']);
    expect(createSceneTool.annotations).toEqual({ readOnlyHint: false });
    const inspectVariablesTool = tools.find(
      tool => tool.name === 'inspect_variables'
    );
    expect(inspectVariablesTool.annotations).toEqual({ readOnlyHint: true });
  });

  it('only lists the functions not modifying the project when read-only', () => {
    const toolNames = getMcpTools({ isReadOnly: true }).map(tool => tool.name);
    expect(toolNames).toContain('inspect_variables');
    expect(toolNames).toContain('run_script');
    expect(toolNames).not.toContain('create_scene');
    expect(toolNames).not.toContain('save_project');
  });

  it('runs an editor function called as a tool and returns its output', async () => {
    const handlers = makeFakeCliMcpServerHandlers();
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'create_scene',
          arguments: { scene_name: 'Level2' },
        },
      },
      handlers
    );

    expect(handlers.runEditorFunctionCalls).toHaveBeenCalledWith(
      [{ name: 'create_scene', arguments: { scene_name: 'Level2' } }],
      { runScriptReadOnly: false }
    );
    const result = getResult(response);
    expect(result.isError).toBe(false);
    expect(JSON.parse(result.content[0].text)).toEqual({
      success: true,
      message: 'Ran create_scene.',
    });
  });

  it('runs scripts read-only when the project is opened read-only', async () => {
    const handlers = makeFakeCliMcpServerHandlers({ isReadOnly: true });
    await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'run_script',
          arguments: { title: 'Read', js_code: 'return 1;' },
        },
      },
      handlers
    );

    expect(handlers.runEditorFunctionCalls).toHaveBeenCalledWith(
      [
        {
          name: 'run_script',
          arguments: { title: 'Read', js_code: 'return 1;' },
        },
      ],
      { runScriptReadOnly: true }
    );
  });

  it('refuses a tool that is not exposed', async () => {
    const handlers = makeFakeCliMcpServerHandlers({ isReadOnly: true });
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'create_scene', arguments: { scene_name: 'Level2' } },
      },
      handlers
    );
    expect(getResult(response).isError).toBe(true);
    expect(handlers.runEditorFunctionCalls).not.toHaveBeenCalled();
  });

  it('gives the script API definition and the EventScript guide as resources', async () => {
    const handlers = makeFakeCliMcpServerHandlers();
    const listResponse = await handleMcpMessage(
      { jsonrpc: '2.0', id: 6, method: 'resources/list' },
      handlers
    );
    const uris = getResult(listResponse).resources.map(
      resource => resource.uri
    );
    expect(uris).toEqual([
      'gdevelop://docs/script-api.d.ts',
      'gdevelop://docs/event-script-guide.md',
    ]);

    const readResponse = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 7,
        method: 'resources/read',
        params: { uri: 'gdevelop://docs/script-api.d.ts' },
      },
      handlers
    );
    expect(getResult(readResponse).contents[0].text).toContain(
      'declare function create_scene('
    );

    const toolResponse = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 8,
        method: 'tools/call',
        params: { name: 'read_script_api_definition', arguments: {} },
      },
      handlers
    );
    expect(getResult(toolResponse).content[0].text).toContain(
      'declare function inspect_variables('
    );
  });

  it('gives the screenshots of a gameplay test as images', async () => {
    const handlers = makeFakeCliMcpServerHandlers();
    // $FlowFixMe[prop-missing]
    handlers.runEditorFunctionCalls.mockImplementationOnce(
      async (functionCalls: Array<any>) => ({
        success: true,
        didModifyProject: false,
        results: [
          {
            ...functionCalls[0],
            success: true,
            output: {
              status: 'passed',
              screenshots: [
                { label: 'End of the test', frame: 10, jpegBase64: 'abcd' },
              ],
            },
          },
        ],
        notRunCalls: [],
      })
    );
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: {
          name: 'run_gameplay_test',
          arguments: { scope: { type: 'project' }, test_name: 'Jump' },
        },
      },
      handlers
    );

    const content = getResult(response).content;
    expect(content).toHaveLength(2);
    expect(content[0].text).not.toContain('abcd');
    expect(JSON.parse(content[0].text).screenshots[0]).toEqual({
      label: 'End of the test',
      frame: 10,
      image: 'attached below',
    });
    expect(content[1]).toEqual({
      type: 'image',
      data: 'abcd',
      mimeType: 'image/jpeg',
    });
  });

  it('does not report a failed gameplay test as a tool error', async () => {
    const handlers = makeFakeCliMcpServerHandlers();
    // $FlowFixMe[prop-missing]
    handlers.runEditorFunctionCalls.mockImplementationOnce(
      async (functionCalls: Array<any>) => ({
        success: false,
        didModifyProject: false,
        results: [
          {
            ...functionCalls[0],
            success: false,
            output: {
              status: 'failed',
              screenshots: [{ label: 'start', frame: 1, jpegBase64: 'abcd' }],
            },
          },
        ],
        notRunCalls: [],
      })
    );
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'run_gameplay_test',
          arguments: { scope: { type: 'project' }, test_name: 'Jump' },
        },
      },
      handlers
    );

    const result = getResult(response);
    expect(result.isError).toBe(false);
    expect(JSON.parse(result.content[0].text).success).toBe(false);
    expect(result.content[1].type).toBe('image');
  });

  it('answers the messages in the order they were received', async () => {
    const sentTexts = [];
    const onMessage = makeMcpMessagesQueue({
      handlers: makeFakeCliMcpServerHandlers(),
      send: text => {
        sentTexts.push(text);
      },
    });

    onMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 'save',
        method: 'tools/call',
        params: { name: 'save_project', arguments: {} },
      })
    );
    onMessage('not json');
    onMessage(JSON.stringify({ jsonrpc: '2.0', id: 'ping', method: 'ping' }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(sentTexts.map(text => JSON.parse(text).id)).toEqual([
      'save',
      null,
      'ping',
    ]);
  });
  describe('with the project opened in the editor (live editor server)', () => {
    const makeSession = (getOpenedProject: () => any) => {
      const handlers: CliMcpServerHandlers = {
        ...makeFakeCliMcpServerHandlers(),
        getOpenedProject,
        onToolCalled: jest.fn(),
      };
      const responses = [];
      const onMessage = makeMcpMessagesQueue({
        handlers,
        send: text => {
          responses.push(JSON.parse(text));
        },
      });
      let nextId = 1;
      const send = async (method: string, params: any) => {
        onMessage(
          JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params })
        );
        await new Promise(resolve => setTimeout(resolve, 0));
        return responses[responses.length - 1].result;
      };
      const callTool = (name: string) =>
        send('tools/call', { name, arguments: {} });
      return { handlers, send, callTool };
    };

    it('names the opened project in the instructions', async () => {
      const { send } = makeSession(() => ({
        name: 'My Game',
        location: '/games/my-game/game.json',
      }));
      const result = await send('initialize', {
        protocolVersion: '2025-06-18',
        clientInfo: { name: 'claude-code', version: '1' },
      });
      expect(result.instructions).toContain(
        'is "My Game" (/games/my-game/game.json)'
      );
    });

    it('refuses the calls while no project is opened', async () => {
      let openedProject = null;
      const { handlers, send, callTool } = makeSession(() => openedProject);
      const initializeResult = await send('initialize', {});
      expect(initializeResult.instructions).toContain(
        'No project is opened in the editor yet'
      );

      const refusedResult = await callTool('create_scene');
      expect(refusedResult.isError).toBe(true);
      expect(refusedResult.content[0].text).toContain(
        'No project is opened in the GDevelop editor'
      );
      expect(handlers.runEditorFunctionCalls).not.toHaveBeenCalled();

      // A project opened after the connection is used without a refusal.
      openedProject = { name: 'My Game', location: null };
      expect((await callTool('create_scene')).isError).toBe(false);
    });

    it('refuses once the first call after another project was opened', async () => {
      let openedProject = { name: 'My Game', location: '/a/game.json' };
      const { handlers, send, callTool } = makeSession(() => openedProject);
      await send('initialize', {});
      expect((await callTool('create_scene')).isError).toBe(false);

      openedProject = { name: 'Other Game', location: '/b/game.json' };
      const refusedResult = await callTool('create_scene');
      expect(refusedResult.isError).toBe(true);
      expect(JSON.parse(refusedResult.content[0].text).message).toContain(
        'is now "Other Game" (/b/game.json), not "My Game" (/a/game.json) anymore'
      );
      expect(handlers.runEditorFunctionCalls).toHaveBeenCalledTimes(1);

      expect((await callTool('create_scene')).isError).toBe(false);
      expect(handlers.runEditorFunctionCalls).toHaveBeenCalledTimes(2);
    });

    const makeProjectCreation = (
      createProject: McpCreateProject = async () => ({
        success: true,
        message: 'Created.',
      })
    ): McpProjectCreation => ({
      listGameTemplates: async () => [
        {
          slug: 'platformer',
          name: 'Platformer',
          shortDescription: 'Jump on platforms.',
          tags: ['platformer', '2d'],
        },
        {
          slug: '3d-racing',
          name: 'Racing',
          shortDescription: 'Drive fast cars.',
          tags: ['3d', 'racing'],
        },
      ],
      createProject: jest.fn(createProject),
    });

    it('lists the game templates, filtered by a search', async () => {
      const projectCreation = makeProjectCreation();
      const handlers: CliMcpServerHandlers = {
        ...makeFakeCliMcpServerHandlers(),
        getOpenedProject: () => null,
        projectCreation,
      };
      const toolNames = getResult(
        await handleMcpMessage(
          { jsonrpc: '2.0', id: 1, method: 'tools/list' },
          handlers
        )
      ).tools.map(tool => tool.name);
      expect(toolNames).toContain('list_game_templates');
      expect(toolNames).toContain('create_project');

      const result = getResult(
        await handleMcpMessage(
          {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'list_game_templates',
              arguments: { search: 'Racing' },
            },
          },
          handlers
        )
      );
      expect(result.isError).toBe(false);
      expect(
        JSON.parse(result.content[0].text).templates.map(
          template => template.slug
        )
      ).toEqual(['3d-racing']);
    });

    it('creates a project only when none is opened, then acts on it', async () => {
      let openedProject: ?McpOpenedProject = null;
      const projectCreation = makeProjectCreation(async ({ name }) => {
        openedProject = { name, location: 'cloud-id', isCloudProject: true };
        return { success: true, message: 'Created.' };
      });
      const handlers: CliMcpServerHandlers = {
        ...makeFakeCliMcpServerHandlers(),
        getOpenedProject: () => openedProject,
        projectCreation,
      };
      const responses = [];
      const onMessage = makeMcpMessagesQueue({
        handlers,
        send: text => {
          responses.push(JSON.parse(text));
        },
      });
      const callTool = async (name: string, toolArguments: Object) => {
        onMessage(
          JSON.stringify({
            jsonrpc: '2.0',
            id: responses.length,
            method: 'tools/call',
            params: { name, arguments: toolArguments },
          })
        );
        await new Promise(resolve => setTimeout(resolve, 0));
        return responses[responses.length - 1].result;
      };

      expect(
        (await callTool('create_project', {
          project_name: 'My Racer',
          template_slug: '3d-racing',
        })).isError
      ).toBe(false);
      expect(projectCreation.createProject).toHaveBeenCalledWith({
        name: 'My Racer',
        templateSlug: '3d-racing',
      });
      // The created project is used without the refusal of a changed project.
      expect((await callTool('create_scene', {})).isError).toBe(false);

      const refusedResult = await callTool('create_project', {
        project_name: 'Another',
      });
      expect(refusedResult.isError).toBe(true);
      expect(JSON.parse(refusedResult.content[0].text).message).toContain(
        'a project is already opened in the editor ("My Racer" (a cloud project))'
      );
      expect(projectCreation.createProject).toHaveBeenCalledTimes(1);
    });

    it('reports each tool call with the name of the client', async () => {
      const { handlers, send, callTool } = makeSession(() => ({
        name: 'My Game',
        location: null,
      }));
      await send('initialize', { clientInfo: { name: 'claude-code' } });
      await callTool('create_scene');
      await callTool('not_a_tool');

      expect(handlers.onToolCalled).toHaveBeenCalledTimes(2);
      expect(handlers.onToolCalled).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          toolName: 'create_scene',
          clientName: 'claude-code',
          success: true,
        })
      );
      expect(handlers.onToolCalled).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ toolName: 'not_a_tool', success: false })
      );
    });
  });
});
