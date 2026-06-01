// @flow
import { createMcpEditorBridge } from './McpEditorBridge';

const gd: libGDevelop = global.gd;

describe('McpEditorBridge', () => {
  const makeBridge = (overrides: Object = {}) =>
    createMcpEditorBridge({
      getProject: () => null,
      getPermissions: () => ({
        allowWriteTools: false,
        allowCommandTools: false,
      }),
      i18n: {
        _: message => message.id,
      },
      editorCallbacks: {
        onOpenLayout: jest.fn(),
        onCreateProject: jest.fn(),
      },
      processEditorFunctionCalls: jest.fn(),
      triggerUnsavedChanges: jest.fn(),
      runCommand: jest.fn(),
      ...overrides,
    });

  it('lists MCP tools using current permissions', async () => {
    const bridge = makeBridge();

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/list',
      params: {},
    });

    expect(response.tools.map(tool => tool.name)).toContain(
      'gdevelop_get_editor_state'
    );
    expect(response.tools.map(tool => tool.name)).not.toContain('create_scene');
  });

  it('returns editor state without an open project', async () => {
    const bridge = makeBridge();

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_get_editor_state',
        arguments: {},
      },
    });

    expect(response.content[0].text).toContain('"hasProject": false');
  });

  it('returns the current editor selection UI state', async () => {
    const bridge = makeBridge({
      getEditorSelection: () => ({
        hasActiveSelectionProvider: true,
        selections: [
          {
            paneIdentifier: 'center',
            tabKey: 'layout_Level',
            editorKind: 'layout',
            projectItemName: 'Level',
            sceneName: 'Level',
            lastSelectionType: 'instance',
            selectedObjectNames: ['Player'],
            selectedInstances: [
              {
                id: 'abcdef1234',
                objectName: 'Player',
                layer: '',
                x: 100,
                y: 200,
              },
            ],
          },
        ],
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_get_editor_selection',
        arguments: {},
      },
    });
    const selection = JSON.parse(response.content[0].text);

    expect(selection.hasActiveSelectionProvider).toBe(true);
    expect(selection.selections[0].selectedObjectNames).toEqual(['Player']);
    expect(selection.selections[0].selectedInstances[0].id).toBe('abcdef1234');
  });

  it('returns a project summary when a project is open', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.setName('MCP Test Game');
    project.insertNewLayout('Level1', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_project_summary',
          arguments: {},
        },
      });

      expect(response.content[0].text).toContain('MCP Test Game');
      expect(response.content[0].text).toContain('Level1');
    } finally {
      project.delete();
    }
  });

  it('returns event JSON examples and operation reference for MCP clients', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const examplesResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_events_json_examples',
          arguments: {
            scene_name: 'Level1',
          },
        },
      });
      const examples = JSON.parse(examplesResponse.content[0].text);

      expect(examples.eventJsonShape).toContain(
        'BuiltinCommonInstructions::Standard'
      );
      expect(examples.examples[0].events_json).toContain('SceneJustBegins');
      expect(examples.examples[0].event_changes[0].operation_name).toBe(
        'insert_at_end'
      );

      const operationResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_event_operation_reference',
          arguments: {},
        },
      });
      const reference = JSON.parse(operationResponse.content[0].text);

      expect(reference.operations.map(operation => operation.name)).toContain(
        'replace_all_actions'
      );
      expect(reference.targetPathFormat).toContain('event-0.1');
    } finally {
      project.delete();
    }
  });

  it('validates and renders events JSON without modifying a scene', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getVariables().insertNew('Score', 0);
    layout
      .getObjects()
      .insertNewObject(project, 'PrimitiveDrawing::Drawer', 'ShapePainter', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_validate_events_json',
          arguments: {
            scene_name: 'Level1',
            events_json: JSON.stringify([
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'SceneJustBegins' },
                    parameters: [''],
                  },
                ],
                actions: [
                  {
                    type: { value: 'SetNumberVariable' },
                    parameters: ['Score', '=', '0'],
                  },
                ],
              },
            ]),
          },
        },
      });
      const validation = JSON.parse(response.content[0].text);

      expect(validation.valid).toBe(true);
      expect(validation.eventsCount).toBe(1);
      expect(validation.eventsAsText).toContain('Score');
      expect(layout.getEvents().getEventsCount()).toBe(0);

      const invalidColorResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_validate_events_json',
          arguments: {
            scene_name: 'Level1',
            events_json: JSON.stringify([
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'PrimitiveDrawing::FillColor' },
                    parameters: ['ShapePainter', '220;30;55'],
                  },
                ],
              },
            ]),
          },
        },
      });
      const invalidColorValidation = JSON.parse(
        invalidColorResponse.content[0].text
      );

      expect(invalidColorValidation.valid).toBe(false);
      expect(invalidColorValidation.issues[0].type).toBe('invalid-parameter');
      expect(invalidColorValidation.issues[0].parameterValue).toBe(
        '220;30;55'
      );
      expect(layout.getEvents().getEventsCount()).toBe(0);
    } finally {
      project.delete();
    }
  });

  it('searches and returns instruction metadata', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const searchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_search_instruction_metadata',
          arguments: {
            query: 'SceneJustBegins',
            kind: 'condition',
            limit: 5,
          },
        },
      });
      const search = JSON.parse(searchResponse.content[0].text);

      expect(search.results.map(result => result.type)).toContain(
        'SceneJustBegins'
      );

      const metadataResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_instruction_metadata',
          arguments: {
            kind: 'action',
            type: 'SetNumberVariable',
          },
        },
      });
      const metadata = JSON.parse(metadataResponse.content[0].text);

      expect(metadata.type).toBe('SetNumberVariable');
      expect(metadata.kind).toBe('action');
      expect(metadata.parameters.length).toBeGreaterThan(0);
      expect(metadata.parameters[0].type).toBe('variableOrProperty');
    } finally {
      project.delete();
    }
  });

  it('blocks write tools when write permission is disabled', async () => {
    const bridge = makeBridge();

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'create_scene',
        arguments: { scene_name: 'Blocked' },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Write MCP tools are disabled');
  });

  it('forwards allowed editor function calls and marks unsaved changes', async () => {
    const triggerUnsavedChanges: any = jest.fn();
    const processEditorFunctionCalls: any = (jest.fn(): any);
    processEditorFunctionCalls.mockResolvedValue({
      results: [
        {
          status: 'finished',
          call_id: 'mcp-call',
          success: true,
          didModifyProject: true,
          output: { message: 'Created scene.' },
        },
      ],
      createdSceneNames: [],
      createdProject: null,
    });
    const bridge = makeBridge({
      getPermissions: () => ({
        allowWriteTools: true,
        allowCommandTools: false,
      }),
      processEditorFunctionCalls,
      triggerUnsavedChanges,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'create_scene',
        arguments: { scene_name: 'Level2' },
      },
    });

    expect(response.content[0].text).toContain('Created scene.');
    expect(processEditorFunctionCalls).toHaveBeenCalledWith(
      expect.objectContaining({
        functionCalls: [
          {
            name: 'create_scene',
            arguments: JSON.stringify({ scene_name: 'Level2' }),
            call_id: 'mcp-call',
          },
        ],
      })
    );
    expect(triggerUnsavedChanges).toHaveBeenCalled();
  });

  it('blocks MCP event generation-service fallback without direct events', async () => {
    const processEditorFunctionCalls: any = (jest.fn(): any);
    const bridge = makeBridge({
      getPermissions: () => ({
        allowWriteTools: true,
        allowCommandTools: false,
      }),
      processEditorFunctionCalls,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'add_scene_events',
        arguments: {
          scene_name: 'Level1',
          events_description: 'Add click events.',
        },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain(
      'Pass events_json or event_changes'
    );
    expect(processEditorFunctionCalls).not.toHaveBeenCalled();

    const escapeHatchResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_editor_call',
        arguments: {
          name: 'add_scene_events',
          arguments: {
            scene_name: 'Level1',
            events_description: 'Add click events.',
          },
        },
      },
    });

    expect(escapeHatchResponse.isError).toBe(true);
    expect(escapeHatchResponse.content[0].text).toContain(
      'Pass events_json or event_changes'
    );
    expect(processEditorFunctionCalls).not.toHaveBeenCalled();
  });

  it('reads resource URIs', async () => {
    const bridge = makeBridge();

    const response = await bridge.handleRendererMcpRequest({
      method: 'resources/read',
      params: {
        uri: 'gdevelop://editor/state',
      },
    });

    expect(response.contents[0].uri).toBe('gdevelop://editor/state');
    expect(response.contents[0].mimeType).toBe('application/json');
    expect(response.contents[0].text).toContain('"hasProject": false');
  });
});
