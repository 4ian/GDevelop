// @flow
import { createMcpEditorBridge } from './McpEditorBridge';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const fs = require('fs');
const os = require('os');
const path = require('path');

const gd: libGDevelop = global.gd;

describe('McpEditorBridge', () => {
  const getInitialInstances = (
    initialInstances: gdInitialInstancesContainer
  ): Array<gdInitialInstance> => {
    const instances = [];
    const instanceGetter = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[cannot-write]
    instanceGetter.invoke = instancePtr => {
      const instance: gdInitialInstance = gd.wrapPointer(
        // $FlowFixMe[incompatible-type]
        instancePtr,
        gd.InitialInstance
      );
      instances.push(instance);
    };
    // $FlowFixMe[incompatible-type]
    initialInstances.iterateOverInstances(instanceGetter);
    instanceGetter.delete();
    return instances;
  };

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
      expect(invalidColorValidation.issues[0].parameterValue).toBe('220;30;55');
      expect(invalidColorValidation.issues[0].suggestion).toContain(
        '"220;30;55"'
      );
      expect(invalidColorValidation.issueSummary.byType).toEqual(
        expect.objectContaining({
          'invalid-parameter': expect.any(Number),
        })
      );
      expect(
        invalidColorValidation.issueSummary.rootCauses[0].suggestion
      ).toContain('"220;30;55"');
      expect(layout.getEvents().getEventsCount()).toBe(0);
    } finally {
      project.delete();
    }
  });

  it('validates event JSON files without writing and lints scene event organization', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const eventsFile = path.join(tempDir, 'events.json');
    fs.writeFileSync(
      eventsFile,
      JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: 'console.log("bad");',
        },
      ])
    );

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const validateFileResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'validate_events_json_file',
          arguments: {
            scene_name: 'Level1',
            events_json_file: eventsFile,
            summary_only: true,
          },
        },
      });
      const validation = JSON.parse(validateFileResponse.content[0].text);
      expect(validateFileResponse.isError).not.toBe(true);
      expect(validation.valid).toBe(false);
      expect(validation.eventsAsText).toBeUndefined();
      expect(validation.issueSummary.byType).toEqual(
        expect.objectContaining({
          'javascript-event-not-allowed': 1,
        })
      );
      expect(layout.getEvents().getEventsCount()).toBe(0);

      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::JsCode', 1);

      const lintResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: {
            scene_name: 'Level1',
          },
        },
      });
      const lint = JSON.parse(lintResponse.content[0].text);
      expect(lint.valid).toBe(false);
      expect(lint.issues.map(issue => issue.type)).toEqual(
        expect.arrayContaining([
          'root-event-not-group',
          'javascript-event-not-allowed',
        ])
      );
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('sets project-level properties and first layout directly', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Menu', 0);
    project.insertNewLayout('Sky Battle', 1);
    const triggerUnsavedChanges: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
      });

      const firstLayoutResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_first_layout',
          arguments: {
            scene_name: 'Sky Battle',
          },
        },
      });
      const firstLayoutResult = JSON.parse(firstLayoutResponse.content[0].text);
      expect(firstLayoutResponse.isError).not.toBe(true);
      expect(firstLayoutResult.project.firstLayout).toBe('Sky Battle');
      expect(project.getFirstLayout()).toBe('Sky Battle');

      const propertiesResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_project_properties',
          arguments: {
            project_name: 'Sky Battle Deluxe',
            game_resolution_width: 1280,
            game_resolution_height: 720,
            adapt_game_resolution_at_runtime: true,
            min_fps: 20,
            max_fps: 120,
            orientation: 'landscape',
            scale_mode: 'linear',
          },
        },
      });
      const propertiesResult = JSON.parse(propertiesResponse.content[0].text);
      expect(propertiesResponse.isError).not.toBe(true);
      expect(project.getName()).toBe('Sky Battle Deluxe');
      expect(project.getGameResolutionWidth()).toBe(1280);
      expect(project.getGameResolutionHeight()).toBe(720);
      expect(project.getAdaptGameResolutionAtRuntime()).toBe(true);
      expect(project.getMinimumFPS()).toBe(20);
      expect(project.getMaximumFPS()).toBe(120);
      expect(propertiesResult.project.name).toBe('Sky Battle Deluxe');
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(2);
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

  it('creates, updates, inspects, and deletes project extension content', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const triggerUnsavedChanges: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
      });

      const createExtensionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension',
          arguments: {
            extension_name: 'McpExt',
            full_name: 'MCP Extension',
            short_description: 'Created through MCP',
            description: 'A test extension created by MCP tools.',
            version: '1.0.0',
            category: 'Game mechanic',
            tags: ['mcp', 'test'],
          },
        },
      });
      expect(createExtensionResponse.isError).not.toBe(true);

      const invalidFunctionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'InvalidFunction',
            function_type: 'action',
            events_json: '{}',
          },
        },
      });
      expect(invalidFunctionResponse.isError).toBe(true);
      expect(
        project
          .getEventsFunctionsExtension('McpExt')
          .getEventsFunctions()
          .hasEventsFunctionNamed('InvalidFunction')
      ).toBe(false);

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_behavior',
          arguments: {
            extension_name: 'McpExt',
            behavior_name: 'PowerBehavior',
            full_name: 'Power behavior',
            description: 'Adds power to an object.',
            object_type: 'Sprite',
            is_private: true,
          },
        },
      });

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PowerObject',
            full_name: 'Power object',
            description: 'A custom object created through MCP.',
            default_name: 'PowerObject',
            is_rendered_in_3d: true,
            area: {
              min_x: 0,
              min_y: 0,
              min_z: -5,
              max_x: 64,
              max_y: 48,
              max_z: 15,
            },
          },
        },
      });

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'SetPower',
            parent_kind: 'behavior',
            parent_name: 'PowerBehavior',
            function_type: 'action',
            full_name: 'Set power',
            description: 'Set the power value.',
            sentence: 'Set _PARAM1_ power of _PARAM0_',
            parameters: [
              {
                name: 'Power',
                type: 'expression',
                description: 'Power value',
              },
            ],
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_property',
          arguments: {
            extension_name: 'McpExt',
            target_kind: 'behavior',
            target_name: 'PowerBehavior',
            property_name: 'Power',
            property_type: 'Number',
            value: '10',
            label: 'Power',
            description: 'Default power.',
            is_shared: false,
          },
        },
      });

      const inspectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_inspect_extension',
          arguments: {
            extension_name: 'McpExt',
          },
        },
      });
      const inspectedExtension = JSON.parse(inspectResponse.content[0].text);

      expect(inspectedExtension.extension.name).toBe('McpExt');
      expect(inspectedExtension.extension.fullName).toBe('MCP Extension');
      expect(inspectedExtension.freeFunctions).toEqual([]);
      expect(inspectedExtension.behaviors[0].name).toBe('PowerBehavior');
      expect(inspectedExtension.behaviors[0].objectType).toBe('Sprite');
      expect(inspectedExtension.behaviors[0].isPrivate).toBe(true);
      expect(inspectedExtension.behaviors[0].functions[0].name).toBe(
        'SetPower'
      );
      expect(inspectedExtension.behaviors[0].functions[0].parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Power',
            type: 'expression',
            description: 'Power value',
          }),
        ])
      );
      expect(inspectedExtension.behaviors[0].properties[0]).toEqual(
        expect.objectContaining({
          name: 'Power',
          type: 'Number',
          value: '10',
          label: 'Power',
        })
      );
      expect(inspectedExtension.objects[0]).toEqual(
        expect.objectContaining({
          name: 'PowerObject',
          isRenderedIn3D: true,
        })
      );
      expect(inspectedExtension.objects[0].area.maxX).toBe(64);
      expect(triggerUnsavedChanges).toHaveBeenCalled();

      const deletePropertyResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_extension_property',
          arguments: {
            extension_name: 'McpExt',
            target_kind: 'behavior',
            target_name: 'PowerBehavior',
            property_name: 'Power',
            is_shared: false,
          },
        },
      });
      expect(deletePropertyResponse.isError).not.toBe(true);

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'SetPower',
            parent_kind: 'behavior',
            parent_name: 'PowerBehavior',
          },
        },
      });
      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_extension_behavior',
          arguments: {
            extension_name: 'McpExt',
            behavior_name: 'PowerBehavior',
          },
        },
      });
      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PowerObject',
          },
        },
      });
      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_extension',
          arguments: {
            extension_name: 'McpExt',
          },
        },
      });

      const listResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_list_extensions',
          arguments: {},
        },
      });
      const extensions = JSON.parse(listResponse.content[0].text);
      expect(extensions.extensions).toEqual([]);
    } finally {
      project.delete();
    }
  });

  it('notifies opened extension editors when MCP replaces extension function events', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    extension
      .getEventsFunctions()
      .insertNewEventsFunction('SetPower', 0)
      .setFunctionType('Action');
    const onExtensionFunctionEventsModifiedOutsideEditor: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onExtensionFunctionEventsModifiedOutsideEditor,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'SetPower',
            function_type: 'action',
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });

      expect(response.isError).not.toBe(true);
      expect(
        onExtensionFunctionEventsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionName: 'McpExt',
        parentKind: 'extension',
        parentName: null,
        functionName: 'SetPower',
        newOrChangedAiGeneratedEventIds: expect.any(Set),
      });
    } finally {
      project.delete();
    }
  });

  it('imports resources, binds sprite animations, and reads serialized scene data', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    const triggerUnsavedChanges: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
      });

      const resourceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'add_or_update_resource',
          arguments: {
            name: 'PlayerIdle.png',
            file: 'assets/PlayerIdle.png',
            kind: 'image',
            metadata: {
              smooth: false,
            },
          },
        },
      });
      expect(resourceResponse.isError).not.toBe(true);
      expect(project.getResourcesManager().hasResource('PlayerIdle.png')).toBe(
        true
      );

      const resourceViaEditorCallResponse = await bridge.handleRendererMcpRequest(
        {
          method: 'tools/call',
          params: {
            name: 'gdevelop_editor_call',
            arguments: {
              name: 'add_or_update_resource',
              arguments: {
                name: 'EnemyIdle.png',
                file: 'assets/EnemyIdle.png',
                kind: 'image',
              },
            },
          },
        }
      );
      expect(resourceViaEditorCallResponse.isError).not.toBe(true);
      expect(project.getResourcesManager().hasResource('EnemyIdle.png')).toBe(
        true
      );

      const animationsResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_sprite_animations',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Player',
            animations: [
              {
                name: 'Idle',
                directions: [
                  {
                    frames: [
                      {
                        image: 'PlayerIdle.png',
                        origin: { x: 4, y: 5 },
                        center: { x: 16, y: 24 },
                        collisionMask: [
                          [
                            { x: 0, y: 0 },
                            { x: 32, y: 0 },
                            { x: 32, y: 48 },
                            { x: 0, y: 48 },
                          ],
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      });
      expect(animationsResponse.isError).not.toBe(true);

      const spriteObject = layout.getObjects().getObject('Player');
      const spriteConfiguration = gd.asSpriteConfiguration(
        spriteObject.getConfiguration()
      );
      const frame = spriteConfiguration
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0);
      expect(frame.getImageName()).toBe('PlayerIdle.png');
      expect(frame.getOrigin().getX()).toBe(4);
      expect(frame.getOrigin().getY()).toBe(5);
      expect(frame.isDefaultCenterPoint()).toBe(false);
      expect(frame.getCenter().getX()).toBe(16);
      expect(frame.getCenter().getY()).toBe(24);
      expect(frame.getCustomCollisionMask().size()).toBe(1);

      const sceneResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'read_serialized_scene',
          arguments: {
            scene_name: 'Level1',
          },
        },
      });
      const scene = JSON.parse(sceneResponse.content[0].text);
      expect(scene.serializedScene.name).toBe('Level1');
      expect(scene.serializedScene.objects[0].name).toBe('Player');

      const eventsResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'read_scene_events_serialized',
          arguments: {
            scene_name: 'Level1',
          },
        },
      });
      const events = JSON.parse(eventsResponse.content[0].text);
      expect(events.sceneName).toBe('Level1');
      expect(events.serializedEvents).toEqual([]);
      expect(triggerUnsavedChanges).toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('reads full project JSON directly and audits resource files and references', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const soundFile = path.join(tempDir, 'Laser.wav');
    fs.writeFileSync(soundFile, 'fake wav content');

    try {
      project.setProjectFile(path.join(tempDir, 'game.json'));
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const audioResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'add_or_update_resource',
          arguments: {
            name: 'Laser.wav',
            file: soundFile,
            kind: 'audio',
            metadata: {
              preloadAsSound: true,
              userAdded: true,
            },
          },
        },
      });
      expect(audioResponse.isError).not.toBe(true);
      const audioResult = JSON.parse(audioResponse.content[0].text);
      expect(audioResult.resource).toEqual(
        expect.objectContaining({
          name: 'Laser.wav',
          kind: 'audio',
          file: expect.stringContaining('Laser.wav'),
          preloadAsSound: true,
          userAdded: true,
        })
      );

      const projectJsonResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'read_game_project_json',
          arguments: {},
        },
      });
      expect(projectJsonResponse.isError).not.toBe(true);
      const projectJson = JSON.parse(projectJsonResponse.content[0].text);
      expect(projectJson.serializedProject.resources.resources[0]).toEqual(
        expect.objectContaining({
          name: 'Laser.wav',
          kind: 'audio',
        })
      );
      expect(projectJson.serializedProjectJson).toContain('Laser.wav');

      const badAudio = new gd.AudioResource();
      badAudio.setName('Broken.wav');
      badAudio.setFile('');
      project.getResourcesManager().addResource(badAudio);
      badAudio.delete();

      const validateResponse = await bridge.handleRendererMcpRequest({
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
                    type: { value: 'PlaySound' },
                    parameters: ['', 'Broken.wav', 'no', '100', '1'],
                  },
                ],
              },
            ]),
          },
        },
      });
      const validation = JSON.parse(validateResponse.content[0].text);
      expect(validation.valid).toBe(false);
      expect(validation.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'resource-empty-file',
            resourceName: 'Broken.wav',
          }),
        ])
      );

      unserializeFromJSObject(
        layout.getEvents(),
        [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'PlaySound' },
                parameters: ['', 'Laser.wav', 'no', '100', '1'],
              },
            ],
          },
        ],
        'unserializeFrom',
        project
      );

      const auditResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_project_resources',
          arguments: {},
        },
      });
      const audit = JSON.parse(auditResponse.content[0].text);
      expect(audit.resourcesByName['Laser.wav']).toEqual(
        expect.objectContaining({
          kind: 'audio',
          fileExists: true,
        })
      );
      expect(audit.invalidResources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Broken.wav',
            issue: 'empty-file',
          }),
        ])
      );
      expect(audit.eventResourceReferences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sceneName: 'Level1',
            resourceName: 'Laser.wav',
            instructionType: 'PlaySound',
            parameterIndex: 1,
          }),
        ])
      );
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('finds scene events and edits event groups without relying on unstable paths', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    unserializeFromJSObject(
      layout.getEvents(),
      [
        {
          aiGeneratedEventId: 'first-event',
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [{ type: { value: 'Hide' }, parameters: ['Player'] }],
        },
        {
          aiGeneratedEventId: 'second-event',
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'PlaySound' },
              parameters: ['', 'Laser.wav', 'no', '100', '1'],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Leave this outside the group',
        },
      ],
      'unserializeFrom',
      project
    );
    const onSceneEventsModifiedOutsideEditor: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onSceneEventsModifiedOutsideEditor,
      });

      const findResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'find_scene_events',
          arguments: {
            scene_name: 'Level1',
            action_type: 'PlaySound',
          },
        },
      });
      const found = JSON.parse(findResponse.content[0].text);
      expect(found.matches[0]).toEqual(
        expect.objectContaining({
          eventPath: 'event-1',
          aiGeneratedEventId: 'second-event',
        })
      );

      const wrapResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'wrap_events_in_group',
          arguments: {
            scene_name: 'Level1',
            group_name: 'Setup',
            target_events: [
              { ai_generated_event_id: 'first-event' },
              { ai_generated_event_id: 'second-event' },
            ],
          },
        },
      });
      expect(wrapResponse.isError).not.toBe(true);
      expect(layout.getEvents().getEventsCount()).toBe(2);
      const groupEvent = gd.asGroupEvent(layout.getEvents().getEventAt(0));
      expect(groupEvent.getName()).toBe('Setup');
      expect(groupEvent.getSubEvents().getEventsCount()).toBe(2);
      expect(
        groupEvent
          .getSubEvents()
          .getEventAt(1)
          .getAiGeneratedEventId()
      ).toBe('second-event');

      const renameResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'rename_group',
          arguments: {
            scene_name: 'Level1',
            group_name: 'Setup',
            new_group_name: 'Initialization',
          },
        },
      });
      expect(renameResponse.isError).not.toBe(true);
      expect(gd.asGroupEvent(layout.getEvents().getEventAt(0)).getName()).toBe(
        'Initialization'
      );

      const ensureIdsResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'ensure_scene_event_ids',
          arguments: {
            scene_name: 'Level1',
            id_prefix: 'mcp-test',
          },
        },
      });
      const ensureIds = JSON.parse(ensureIdsResponse.content[0].text);
      expect(ensureIds.assignedCount).toBeGreaterThan(0);
      expect(
        layout
          .getEvents()
          .getEventAt(1)
          .getAiGeneratedEventId()
      ).toContain('mcp-test');

      const moveResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'move_events_to_group',
          arguments: {
            scene_name: 'Level1',
            group_name: 'Initialization',
            target_events: [{ event_path: 'event-1' }],
          },
        },
      });
      expect(moveResponse.isError).not.toBe(true);
      expect(layout.getEvents().getEventsCount()).toBe(1);
      expect(
        gd
          .asGroupEvent(layout.getEvents().getEventAt(0))
          .getSubEvents()
          .getEventsCount()
      ).toBe(3);
      expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('replaces scene events from a file and exposes a save-and-wait command hook', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const eventsFile = path.join(tempDir, 'events.json');
    fs.writeFileSync(
      eventsFile,
      JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Loaded from file',
        },
      ])
    );
    const saveProjectAndWait: any = jest.fn(async () => ({
      saved: true,
      fileMetadata: {
        fileIdentifier: path.join(tempDir, 'game.json'),
        name: 'game.json',
      },
    }));

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: true,
        }),
        saveProjectAndWait,
      });

      const replaceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'replace_scene_events_from_file',
          arguments: {
            scene_name: 'Level1',
            events_json_file: eventsFile,
            summary_only: true,
          },
        },
      });
      expect(replaceResponse.isError).not.toBe(true);
      const replaceResult = JSON.parse(replaceResponse.content[0].text);
      expect(replaceResult.eventsCount).toBe(1);
      expect(replaceResult.eventsAsText).toBeUndefined();
      expect(replaceResult.serializedEvents).toBeUndefined();
      expect(replaceResult.serializedEventsJson).toBeUndefined();
      expect(layout.getEvents().getEventsCount()).toBe(1);
      expect(serializeToJSObject(layout.getEvents())[0].comment).toBe(
        'Loaded from file'
      );

      const saveResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_save_project_and_wait',
          arguments: {},
        },
      });
      const saveResult = JSON.parse(saveResponse.content[0].text);
      expect(saveResult.saved).toBe(true);
      expect(saveProjectAndWait).toHaveBeenCalled();
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('replaces and deletes scene objects with complete serialized definitions', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const objects = layout.getObjects();
    objects.insertNewObject(project, 'TextObject::Text', 'Player', 0);
    const sprite = objects.insertNewObject(project, 'Sprite', 'Template', 1);
    const serializedSprite = serializeToJSObject(sprite);
    serializedSprite.name = 'Player';
    const instance = layout.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Player');
    instance.setX(10);
    instance.setY(20);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const replaceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'replace_object_definition',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Player',
            serialized_object: serializedSprite,
          },
        },
      });
      expect(replaceResponse.isError).not.toBe(true);
      expect(
        layout
          .getObjects()
          .getObject('Player')
          .getType()
      ).toBe('Sprite');
      expect(layout.getObjects().hasObjectNamed('Template')).toBe(true);

      const deleteResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'delete_scene_object',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Player',
            delete_instances: true,
          },
        },
      });
      expect(deleteResponse.isError).not.toBe(true);
      expect(layout.getObjects().hasObjectNamed('Player')).toBe(false);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(0);
    } finally {
      project.delete();
    }
  });

  it('returns compact resource audits and can batch create scene assets', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const imageFile = path.join(tempDir, 'Player.png');
    fs.writeFileSync(imageFile, 'fake png content');

    try {
      project.setProjectFile(path.join(tempDir, 'game.json'));
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const batchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bulk_edit_scene_assets',
          arguments: {
            scene_name: 'Level1',
            resources: [
              {
                name: 'Player.png',
                file: imageFile,
                kind: 'image',
              },
            ],
            objects: [
              {
                object_name: 'Player',
                object_type: 'Sprite',
                serialized_object: {
                  name: 'Player',
                  type: 'Sprite',
                  variables: [],
                  effects: [],
                  behaviors: [],
                  animations: [],
                },
              },
            ],
            sprite_animations: [
              {
                object_name: 'Player',
                animations: [
                  {
                    name: 'Idle',
                    frames: [
                      {
                        image: 'Player.png',
                      },
                    ],
                  },
                ],
              },
            ],
            instances: [
              {
                object_name: 'Player',
                x: 64,
                y: 96,
              },
            ],
          },
        },
      });
      const batchResult = JSON.parse(batchResponse.content[0].text);
      expect(batchResponse.isError).not.toBe(true);
      expect(batchResult.counts).toEqual({
        resources: 1,
        objects: 1,
        spriteAnimations: 1,
        instances: 1,
      });
      expect(project.getResourcesManager().hasResource('Player.png')).toBe(
        true
      );
      expect(layout.getObjects().hasObjectNamed('Player')).toBe(true);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(1);

      const auditResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_project_resources',
          arguments: {
            compact: true,
          },
        },
      });
      const audit = JSON.parse(auditResponse.content[0].text);
      expect(audit.compact).toBe(true);
      expect(audit.summary.totalResources).toBe(1);
      expect(audit.summary.invalidResourcesCount).toBe(0);
      expect(audit.stringReferences).toBeUndefined();
      expect(audit.resourcesByName).toBeUndefined();
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('sets object properties and rejects invalid scene patches before writing', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout
      .getObjects()
      .insertNewObject(project, 'TextObject::Text', 'Label', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const setResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_object_properties',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Label',
            properties: {
              text: 'Score: 0',
              characterSize: 36,
              color: '255;0;128',
            },
          },
        },
      });
      expect(setResponse.isError).not.toBe(true);
      const labelProperties = layout
        .getObjects()
        .getObject('Label')
        .getConfiguration()
        .getProperties();
      expect(labelProperties.get('text').getValue()).toBe('Score: 0');
      expect(labelProperties.get('characterSize').getValue()).toBe('36');
      expect(labelProperties.get('color').getValue()).toBe('255;0;128');

      const textObjectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_text_object_properties',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Label',
            text: 'Lives: 3',
            character_size: 42,
            color: '255;255;255',
            bold: true,
            italic: true,
            text_alignment: 'center',
            vertical_text_alignment: 'center',
            outline: {
              enabled: true,
              color: '0;0;0',
              thickness: 2,
            },
          },
        },
      });
      const textObjectResult = JSON.parse(textObjectResponse.content[0].text);
      expect(textObjectResponse.isError).not.toBe(true);
      expect(textObjectResult.properties).toEqual(
        expect.objectContaining({
          text: 'Lives: 3',
          characterSize: 42,
          color: '255;255;255',
          bold: true,
          italic: true,
          textAlignment: 'center',
          verticalTextAlignment: 'center',
          outlineEnabled: true,
        })
      );

      const invalidPatchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_scene_patch',
          arguments: {
            scene_name: 'Level1',
            patch: [
              {
                op: 'remove',
                path: '/objects/0/type',
              },
            ],
          },
        },
      });
      expect(invalidPatchResponse.isError).toBe(true);
      expect(
        layout
          .getObjects()
          .getObject('Label')
          .getType()
      ).toBe('TextObject::Text');

      const validPatchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_scene_patch',
          arguments: {
            scene_name: 'Level1',
            patch: [
              {
                op: 'replace',
                path: '/objects/0/name',
                value: 'LabelPatched',
              },
            ],
          },
        },
      });
      expect(validPatchResponse.isError).not.toBe(true);
      expect(layout.getObjects().hasObjectNamed('LabelPatched')).toBe(true);
    } finally {
      project.delete();
    }
  });

  it('creates, updates, and deletes 2D instances with structured put_2d_instances payloads', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    const onInstancesModifiedOutsideEditor: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onInstancesModifiedOutsideEditor,
      });

      const createResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'put_2d_instances',
          arguments: {
            scene_name: 'Level1',
            operation: 'create',
            instances: [
              {
                object_name: 'Player',
                x: 128,
                y: 256,
                zOrder: 3,
                customSize: {
                  width: 64,
                  height: 32,
                },
              },
            ],
          },
        },
      });
      const createResult = JSON.parse(createResponse.content[0].text);
      expect(createResponse.isError).not.toBe(true);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(1);
      const instanceId = createResult.changes[0].id;
      let instance = getInitialInstances(layout.getInitialInstances())[0];
      expect(instance.getObjectName()).toBe('Player');
      expect(instance.getX()).toBe(128);
      expect(instance.getY()).toBe(256);
      expect(instance.getZOrder()).toBe(3);
      expect(instance.getCustomWidth()).toBe(64);
      expect(instance.getCustomHeight()).toBe(32);

      const updateResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'put_2d_instances',
          arguments: {
            scene_name: 'Level1',
            operation: 'update',
            instances: [
              {
                id: instanceId,
                x: 300,
                y: 400,
                angle: 45,
              },
            ],
          },
        },
      });
      expect(updateResponse.isError).not.toBe(true);
      instance = getInitialInstances(layout.getInitialInstances())[0];
      expect(instance.getX()).toBe(300);
      expect(instance.getY()).toBe(400);
      expect(instance.getAngle()).toBe(45);

      const deleteResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'put_2d_instances',
          arguments: {
            scene_name: 'Level1',
            operation: 'delete',
            instances: [
              {
                id: instanceId,
              },
            ],
          },
        },
      });
      expect(deleteResponse.isError).not.toBe(true);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(0);
      expect(onInstancesModifiedOutsideEditor).toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('returns tool schemas and usage examples for MCP clients', async () => {
    const bridge = makeBridge();

    const schemaResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'inspect_tool_schema',
        arguments: {
          tool_name: 'put_2d_instances',
        },
      },
    });
    const schema = JSON.parse(schemaResponse.content[0].text);
    expect(schema.tool.name).toBe('put_2d_instances');
    expect(schema.tool.inputSchema.properties.instances.type).toBe('array');
    expect(schema.examples[0].arguments.instances[0].customSize.width).toBe(64);

    const variableSchemaResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'inspect_tool_schema',
        arguments: {
          tool_name: 'add_or_edit_variable',
        },
      },
    });
    const variableSchema = JSON.parse(variableSchemaResponse.content[0].text);
    expect(variableSchema.tool.inputSchema.required).toEqual(
      expect.arrayContaining([
        'variable_scope',
        'variable_name_or_path',
        'value',
      ])
    );
    expect(variableSchema.examples[0].arguments.variable_scope).toBe('scene');

    const examplesResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'get_tool_usage_examples',
        arguments: {
          tool_name: 'add_or_update_resource',
        },
      },
    });
    const examples = JSON.parse(examplesResponse.content[0].text);
    expect(examples.examples[0].arguments.kind).toBe('image');
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
