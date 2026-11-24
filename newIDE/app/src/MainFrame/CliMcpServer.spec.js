// @flow
import {
  getMcpTools,
  handleMcpMessage,
  makeMcpMessagesQueue,
  type CliMcpServerHandlers,
  type JsonRpcResponse,
} from './CliMcpServer';
import { type McpOpenedProject } from './McpServerTools/McpServerTool';
import {
  makeProjectCreationTools,
  type McpProjectCreation,
  type McpCreateProject,
} from './McpServerTools/ProjectCreationTools';
import {
  makeLookupTools,
  type McpCallLookupTool,
} from './McpServerTools/LookupTools';
import { getScriptApiDefinitionWithLocalFiles } from './McpServerTools/LocalFilesAsAttachments';
import { INSTANCE_POSITION_SEMANTICS_MESSAGE } from '../EditorFunctions';

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

  it('reports the agent connecting', async () => {
    const onAgentConnected = jest.fn<any, void>();
    await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'claude-code', version: '2.1.0' },
        },
      },
      {
        ...makeFakeCliMcpServerHandlers(),
        getOpenedProject: () => null,
        onAgentConnected,
      }
    );

    expect(onAgentConnected).toHaveBeenCalledWith({
      clientName: 'claude-code',
      clientVersion: '2.1.0',
      isReadOnly: false,
      hasOpenedProject: false,
    });
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
    // Only when the editor can call the GDevelop AI backend.
    expect(toolNames).not.toContain('search_resource_store');

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

  it('asks for the paths of local files where the GDevelop AI is given attached files', () => {
    const tool = getMcpTools({ isReadOnly: false }).find(
      tool => tool.name === 'change_project_properties_resources'
    );
    if (!tool) throw new Error('The tool should be listed.');
    const { added_resources, changed_resources } = tool.inputSchema.properties;

    expect(
      getMcpTools({ isReadOnly: false }).filter(tool =>
        JSON.stringify(tool).includes('attached by the user')
      )
    ).toEqual([]);
    expect(tool.description).toContain('add files of this computer');
    expect(added_resources.description).not.toContain('attached');
    expect(
      added_resources.items.properties.attachment_id.description
    ).toContain('The absolute path of a file of this computer.');
    expect(
      changed_resources.items.properties.replace_file_with_attachment_id
        .description
    ).toContain('The absolute path of a file of this computer.');

    const scriptApiDefinition = getScriptApiDefinitionWithLocalFiles();
    expect(scriptApiDefinition).not.toContain('attached by the user');
    expect(scriptApiDefinition).toContain(
      '/** The absolute path of a file of this computer. A file already in the folder'
    );
  });

  it('tells in `run_script` the tools a script cannot call', () => {
    const tools = getMcpTools({
      isReadOnly: false,
      serverTools: makeLookupTools(async () => ({ success: true })),
    });
    const runScriptTool = tools.find(tool => tool.name === 'run_script');
    if (!runScriptTool) throw new Error('No run_script tool.');
    const description = runScriptTool.description;
    expect(description).toContain('`generate_events`');
    expect(description).toContain('`run_gameplay_test`');
    expect(description).toContain('`save_project`');
    expect(description).toContain('`search_resource_store`');
    expect(description).not.toContain('`create_scene`');
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

  it('gives the calls of a script without the arguments of the successful ones', async () => {
    const handlers: CliMcpServerHandlers = {
      ...makeFakeCliMcpServerHandlers(),
      runEditorFunctionCalls: async functionCalls => ({
        success: true,
        didModifyProject: true,
        results: functionCalls.map(functionCall => ({
          ...functionCall,
          success: true,
          output: {
            consoleLogs: ['Done'],
            functionCallRecords: [
              {
                functionName: 'create_scene',
                args: { scene_name: 'Level2' },
                success: true,
                output: { message: 'Created the scene.' },
              },
              {
                functionName: 'create_scene',
                args: { scene_name: '' },
                success: false,
                output: { message: 'Missing scene_name.' },
              },
            ],
          },
        })),
        notRunCalls: [],
      }),
    };
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 13,
        method: 'tools/call',
        params: {
          name: 'run_script',
          arguments: { title: 'Scenes', js_code: 'await create_scene({});' },
        },
      },
      handlers
    );

    const { functionCallRecords, consoleLogs } = JSON.parse(
      getResult(response).content[0].text
    );
    expect(consoleLogs).toEqual(['Done']);
    expect(functionCallRecords).toEqual([
      {
        functionName: 'create_scene',
        success: true,
        output: { message: 'Created the scene.' },
      },
      {
        functionName: 'create_scene',
        args: { scene_name: '' },
        success: false,
        output: { message: 'Missing scene_name.' },
      },
    ]);
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
      'gdevelop://docs/gameplay-test-harness-guide.md',
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

  describe('describe_instances', () => {
    const makeInstance = (index: number, layer: string) => ({
      name: index % 2 ? 'Coin' : 'Wall',
      id: `instance-${index}`,
      x: index + 0.6000000000000001,
      y: 0.123456,
      z: 0,
      angle: 0,
      layer,
      customSize: false,
      width: 32,
      height: 32,
      depth: 39.70189153231568,
      zOrder: 1,
      initialVariables: [{ name: 'Speed', value: 1.23456 }],
    });
    const makeDescribeInstancesHandlers = (
      instances: Array<Object>
    ): CliMcpServerHandlers => ({
      ...makeFakeCliMcpServerHandlers(),
      runEditorFunctionCalls: jest.fn(async functionCalls => ({
        success: true,
        didModifyProject: false,
        results: functionCalls.map(functionCall => ({
          ...functionCall,
          success: true,
          output: {
            success: true,
            instances,
            instancesForSceneNamed: 'Level',
            positionSemantics: INSTANCE_POSITION_SEMANTICS_MESSAGE,
            objectSizeInfo: {
              Wall: {
                width: 32,
                height: 32,
                depth: null,
                originX: 0,
                originY: 0,
                originZ: null,
                centerX: 16.000000001,
                centerY: 16,
                centerZ: null,
              },
            },
          },
        })),
        notRunCalls: [],
      })),
    });
    const describeInstances = async (
      handlers: CliMcpServerHandlers,
      toolArguments: Object
    ): Promise<Object> => {
      const result = getResult(
        await handleMcpMessage(
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: { name: 'describe_instances', arguments: toolArguments },
          },
          handlers
        )
      );
      expect(result.isError).toBe(false);
      return JSON.parse(result.content[0].text);
    };
    const scope = { type: 'scene', scene_name: 'Level' };

    it('documents the left out fields and the positions in its description', () => {
      const tool = getMcpTools({ isReadOnly: false }).find(
        tool => tool.name === 'describe_instances'
      );
      if (!tool) throw new Error('No describe_instances tool.');
      expect(tool.description).toContain('no `layer` means the base layer');
      expect(tool.description).toContain(INSTANCE_POSITION_SEMANTICS_MESSAGE);
      expect(Object.keys(tool.inputSchema.properties)).toEqual(
        expect.arrayContaining([
          'filter_by_layer',
          'limit',
          'offset',
          'summary',
        ])
      );
    });

    it('gives the instances rounded, without their default values', async () => {
      const handlers = makeDescribeInstancesHandlers([
        makeInstance(0, ''),
        { ...makeInstance(1, 'UI'), angle: 90, z: 12.5, customSize: true },
      ]);

      const output = await describeInstances(handlers, { scope });

      expect(handlers.runEditorFunctionCalls).toHaveBeenCalledWith(
        [{ name: 'describe_instances', arguments: { scope } }],
        { runScriptReadOnly: false }
      );
      expect(output).toEqual({
        success: true,
        instancesForSceneNamed: 'Level',
        objectSizeInfo: {
          Wall: {
            width: 32,
            height: 32,
            originX: 0,
            originY: 0,
            centerX: 16,
            centerY: 16,
          },
        },
        instances: [
          {
            name: 'Wall',
            id: 'instance-0',
            x: 0.6,
            y: 0.123,
            width: 32,
            height: 32,
            depth: 39.7,
            zOrder: 1,
            initialVariables: [{ name: 'Speed', value: 1.23456 }],
          },
          {
            name: 'Coin',
            id: 'instance-1',
            x: 1.6,
            y: 0.123,
            z: 12.5,
            angle: 90,
            layer: 'UI',
            customSize: true,
            width: 32,
            height: 32,
            depth: 39.7,
            zOrder: 1,
            initialVariables: [{ name: 'Speed', value: 1.23456 }],
          },
        ],
      });
    });

    it('lists a limited number of instances, telling how to get the next ones', async () => {
      const handlers = makeDescribeInstancesHandlers(
        Array.from({ length: 250 }, (_, index) => makeInstance(index, ''))
      );

      const firstPage = await describeInstances(handlers, { scope });
      expect(firstPage.instances).toHaveLength(100);
      expect(firstPage.instancesCount).toBe(250);
      expect(firstPage.moreInstances).toContain('`offset: 100`');

      const lastPage = await describeInstances(handlers, {
        scope,
        offset: 200,
        limit: 100,
      });
      expect(handlers.runEditorFunctionCalls).toHaveBeenLastCalledWith(
        [{ name: 'describe_instances', arguments: { scope } }],
        { runScriptReadOnly: false }
      );
      expect(lastPage.instances.map(instance => instance.id)).toEqual(
        Array.from({ length: 50 }, (_, index) => `instance-${200 + index}`)
      );
      expect(lastPage.instancesCount).toBe(250);
      expect(lastPage.moreInstances).toBeUndefined();
    });

    it('filters the instances by layer, or summarizes them', async () => {
      const handlers = makeDescribeInstancesHandlers([
        makeInstance(0, ''),
        makeInstance(1, 'UI'),
        makeInstance(2, ''),
        makeInstance(3, 'UI'),
        makeInstance(4, 'Background'),
      ]);

      const uiOutput = await describeInstances(handlers, {
        scope,
        filter_by_layer: ['UI', ''],
      });
      expect(uiOutput.instances.map(instance => instance.id)).toEqual([
        'instance-0',
        'instance-1',
        'instance-2',
        'instance-3',
      ]);
      expect(uiOutput.instancesOnlyOnLayersNamed).toBe('UI,');

      const summaryOutput = await describeInstances(handlers, {
        scope,
        summary: true,
      });
      expect(summaryOutput.instances).toBeUndefined();
      expect(summaryOutput.instancesCount).toBe(5);
      expect(summaryOutput.instancesCountByObjectAndLayer).toEqual([
        { objectName: 'Wall', layer: '', count: 2 },
        { objectName: 'Coin', layer: 'UI', count: 2 },
        { objectName: 'Wall', layer: 'Background', count: 1 },
      ]);
      expect(summaryOutput.positionsRange).toEqual({
        x: [0.6, 4.6],
        y: [0.123, 0.123],
        z: [0, 0],
      });
    });
  });

  it('gives only the asked functions of the script API definition', async () => {
    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'read_script_api_definition',
          arguments: { functions: 'describe_instances, unknown_function' },
        },
      },
      makeFakeCliMcpServerHandlers()
    );

    const text = getResult(response).content[0].text;
    expect(text).toContain('type SimplifiedInstance = {');
    expect(text).toContain('type DescribeInstancesResult = ');
    expect(text).toContain('declare function describe_instances(');
    expect(text).not.toContain('declare function create_scene(');
    expect(text).toContain('No function named unknown_function.');
    expect(text.length).toBeLessThan(
      getScriptApiDefinitionWithLocalFiles().length / 10
    );
  });

  it('gives the gameplay test harness guide, pointed to by `run_gameplay_test`', async () => {
    const tools = getMcpTools({ isReadOnly: false });
    const runGameplayTestTool = tools.find(
      tool => tool.name === 'run_gameplay_test'
    );
    if (!runGameplayTestTool) throw new Error('No run_gameplay_test tool.');
    expect(runGameplayTestTool.description).toContain(
      'read_gameplay_test_harness_guide'
    );

    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: { name: 'read_gameplay_test_harness_guide', arguments: {} },
      },
      makeFakeCliMcpServerHandlers()
    );
    expect(getResult(response).content[0].text).toContain('interface Harness');
  });

  it('reads the docs and searches the stores on the GDevelop AI backend', async () => {
    const callLookupTool = jest.fn(
      async (options: Object): Promise<Object> => ({
        success: true,
        extensionDocumentations: { Physics3D: '# Extension "3D physics"' },
      })
    );
    const handlers: CliMcpServerHandlers = {
      ...makeFakeCliMcpServerHandlers(),
      serverTools: makeLookupTools((callLookupTool: McpCallLookupTool)),
    };
    const listResponse = await handleMcpMessage(
      { jsonrpc: '2.0', id: 10, method: 'tools/list' },
      handlers
    );
    const toolNames = getResult(listResponse).tools.map(tool => tool.name);
    expect(toolNames).toContain('read_full_docs');
    expect(toolNames).toContain('search_docs');
    expect(toolNames).toContain('read_javascript_reference');
    expect(toolNames).toContain('search_object_asset_store');
    expect(toolNames).toContain('search_resource_store');

    const response = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'read_full_docs',
          arguments: { extension_names: 'Physics3D' },
        },
      },
      handlers
    );
    expect(callLookupTool).toHaveBeenCalledWith({
      name: 'read_full_docs',
      args: { extension_names: 'Physics3D' },
      withProjectExtensions: true,
    });
    const result = getResult(response);
    expect(result.isError).toBe(false);
    expect(
      JSON.parse(result.content[0].text).extensionDocumentations.Physics3D
    ).toBe('# Extension "3D physics"');

    callLookupTool.mockImplementationOnce(async () => ({
      success: false,
      message: 'No search terms were provided.',
    }));
    const failedResponse = await handleMcpMessage(
      {
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: {
          name: 'search_object_asset_store',
          arguments: { search_terms: ' ' },
        },
      },
      handlers
    );
    expect(callLookupTool).toHaveBeenLastCalledWith({
      name: 'search_object_asset_store',
      args: { search_terms: ' ' },
      withProjectExtensions: false,
    });
    expect(getResult(failedResponse).isError).toBe(true);
    expect(handlers.runEditorFunctionCalls).not.toHaveBeenCalled();
  });

  it('only reads the docs when read-only', async () => {
    const response = await handleMcpMessage(
      { jsonrpc: '2.0', id: 13, method: 'tools/list' },
      {
        ...makeFakeCliMcpServerHandlers({ isReadOnly: true }),
        serverTools: makeLookupTools(async () => ({ success: true })),
      }
    );
    const toolNames = getResult(response).tools.map(tool => tool.name);
    expect(toolNames).toContain('read_full_docs');
    expect(toolNames).toContain('search_docs');
    expect(toolNames).not.toContain('search_object_asset_store');
    expect(toolNames).not.toContain('search_resource_store');
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
        serverTools: makeProjectCreationTools(projectCreation),
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

    it('lists a limited number of game templates, telling how to get the next ones', async () => {
      const handlers: CliMcpServerHandlers = {
        ...makeFakeCliMcpServerHandlers(),
        getOpenedProject: () => null,
        serverTools: makeProjectCreationTools(makeProjectCreation()),
      };
      const listGameTemplates = async (toolArguments: Object) =>
        JSON.parse(
          getResult(
            await handleMcpMessage(
              {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                  name: 'list_game_templates',
                  arguments: toolArguments,
                },
              },
              handlers
            )
          ).content[0].text
        );

      const firstPage = await listGameTemplates({ limit: 1 });
      expect(firstPage.templates.map(template => template.slug)).toEqual([
        'platformer',
      ]);
      expect(firstPage.message).toBe(
        '1 more templates: call again with `offset: 1`, or narrow the `search`.'
      );

      const lastPage = await listGameTemplates({ limit: 1, offset: 1 });
      expect(lastPage.templates.map(template => template.slug)).toEqual([
        '3d-racing',
      ]);
      expect(lastPage.message).toBeUndefined();
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
        serverTools: makeProjectCreationTools(projectCreation),
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
