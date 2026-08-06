// @flow
import { createMcpEditorBridge } from './McpEditorBridge';
import { autoQuoteEventParameters } from './McpEventKnowledge';
import { serializeToJSObject } from '../Utils/Serializer';
import { decomposeLegacyProjectToFiles } from '../ProjectsStorage/MultiFileProjectFormat';
import { writeMultiFileSourceTree } from '../ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject';

// Mock the behavior store registry fetch (search_behavior_store) so the test
// does not hit the network.
jest.mock('../Utils/GDevelopServices/Extension', () => ({
  getBehaviorsRegistry: jest.fn(),
}));

// $FlowFixMe[cannot-resolve-module]
const fs = require('fs');
// $FlowFixMe[cannot-resolve-module]
const os = require('os');
// $FlowFixMe[cannot-resolve-module]
const path = require('path');

const gd: libGDevelop = global.gd;

describe('McpEditorBridge', () => {
  const serializeProjectWithConstants = (project: gdProject): Object => ({
    ...serializeToJSObject(project),
    constants: JSON.parse(project.getConstantsJson()),
  });

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

  // Build a mock preview debugger server that answers TARGETED requests: when
  // sendMessage(id, {command, messageId}) is called, it replies (via the
  // registered onHandleParsedMessage callback) from that id with the same
  // messageId. `responders` maps a command to a payload (or a function of the
  // message returning a payload).
  const makeTargetedPreviewServer = ({
    debuggerIds = ['preview-ws-0'],
    responders = {},
    closeOnSendCommands = [],
    errorOnSendCommands = {},
  }: Object = {}) => {
    let callbacks: any = null;
    let currentDebuggerIds: Array<string> = debuggerIds;
    return {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => currentDebuggerIds,
      getExistingDebuggerIds: () => currentDebuggerIds,
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      connectDebugger: (id: string) => {
        currentDebuggerIds = [...currentDebuggerIds, id];
        if (callbacks) {
          callbacks.onConnectionOpened({
            id,
            debuggerIds: currentDebuggerIds,
          });
        }
      },
      sendMessage: (id: string, message: any) => {
        if (closeOnSendCommands.indexOf(message.command) !== -1) {
          currentDebuggerIds = currentDebuggerIds.filter(
            debuggerId => debuggerId !== id
          );
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onConnectionClosed({
              id,
              debuggerIds: currentDebuggerIds,
            });
          }, 2);
          return;
        }
        const errorMessage = errorOnSendCommands[message.command];
        if (errorMessage) {
          currentDebuggerIds = currentDebuggerIds.filter(
            debuggerId => debuggerId !== id
          );
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onConnectionErrored({ id, errorMessage });
            callbacks.onConnectionClosed({
              id,
              debuggerIds: currentDebuggerIds,
            });
          }, 2);
          return;
        }
        const responder = responders[message.command];
        if (responder === undefined || !callbacks) return;
        const payload =
          typeof responder === 'function' ? responder(message) : responder;
        if (
          message.command === 'refresh' &&
          payload &&
          typeof payload === 'object' &&
          payload.__dump
        ) {
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'dump',
                payload: payload.__dump,
                rendererDiagnostics: payload.rendererDiagnostics,
              },
            });
          }, 2);
          return;
        }
        // Reply asynchronously from the targeted id, echoing the messageId. When
        // the payload carries a __fullMessage object, merge its top-level fields
        // into the reply (run_frames replies put run metadata as a sibling of
        // payload and the bridge reads the full parsed message).
        setTimeout(() => {
          if (!callbacks) return;
          const fullMessage =
            payload && typeof payload === 'object' && payload.__fullMessage
              ? payload.__fullMessage
              : null;
          callbacks.onHandleParsedMessage({
            id,
            parsedMessage: fullMessage
              ? {
                  command: `${message.command}-reply`,
                  messageId: message.messageId,
                  ...fullMessage,
                }
              : {
                  command: `${message.command}-reply`,
                  messageId: message.messageId,
                  payload,
                },
          });
        }, 2);
      },
      closeAllConnections: () => {
        const previousIds = currentDebuggerIds;
        currentDebuggerIds = [];
        if (callbacks) {
          previousIds.forEach(id =>
            callbacks.onConnectionClosed({ id, debuggerIds: [] })
          );
        }
      },
    };
  };

  it('lists MCP tools using current permissions', async () => {
    const bridge = makeBridge();

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/list',
      params: {},
    });

    expect(response.tools.map(tool => tool.name)).toContain(
      'gdevelop_get_editor_state'
    );
    expect(response.tools.map(tool => tool.name)).toContain(
      'validate_project_files'
    );
    expect(response.tools.map(tool => tool.name)).toContain(
      'generate-catalogs'
    );
    expect(response.tools.map(tool => tool.name)).toContain('reload_project');
    expect(response.tools.map(tool => tool.name)).toContain('open_project');
    expect(response.tools.map(tool => tool.name)).not.toContain('create_scene');
  });

  it('opens a specific local project and returns the loaded project receipt', async () => {
    const projectPath = path.join(
      os.tmpdir(),
      'gdevelop-mcp-open-project',
      'project.gdevelop'
    );
    const reportProgress: any = jest.fn();
    const openProjectAndWait: any = jest.fn(async request => ({
      opened: true,
      projectName: 'Opened project',
      projectFile: request.projectPath,
    }));
    const bridge = makeBridge({
      openProjectAndWait,
      getPersistenceState: () => ({
        hasUnsavedChanges: false,
        changesCount: 0,
        timeOfFirstChangeSinceLastSave: null,
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'open_project',
        arguments: { project_path: projectPath },
      },
      reportProgress,
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        opened: true,
        projectName: 'Opened project',
        projectFile: path.normalize(projectPath),
        discardedUnsavedInMemoryChanges: false,
      })
    );
    expect(openProjectAndWait).toHaveBeenCalledWith({
      projectPath: path.normalize(projectPath),
      discardUnsavedChanges: false,
      reportProgress,
    });
  });

  it('refuses to replace unsaved editor state unless explicitly allowed', async () => {
    const projectPath = path.join(
      os.tmpdir(),
      'gdevelop-mcp-open-project',
      'project.gdevelop'
    );
    const openProjectAndWait: any = jest.fn();
    const bridge = makeBridge({
      openProjectAndWait,
      getPersistenceState: () => ({
        hasUnsavedChanges: true,
        changesCount: 3,
        timeOfFirstChangeSinceLastSave: 123,
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'open_project',
        arguments: { project_path: projectPath },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.code).toBe('MCP_OPEN_PROJECT_UNSAVED_CHANGES');
    expect(result.changesCount).toBe(3);
    expect(openProjectAndWait).not.toHaveBeenCalled();
  });

  it('opens another project when unsaved-state discard is explicit', async () => {
    const projectPath = path.join(
      os.tmpdir(),
      'gdevelop-mcp-open-project',
      'project.gdevelop'
    );
    const openProjectAndWait: any = jest.fn(async request => ({
      opened: true,
      projectName: 'Replacement project',
      projectFile: request.projectPath,
    }));
    const bridge = makeBridge({
      openProjectAndWait,
      getPersistenceState: () => ({
        hasUnsavedChanges: true,
        changesCount: 3,
        timeOfFirstChangeSinceLastSave: 123,
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'open_project',
        arguments: {
          project_path: projectPath,
          discard_unsaved_changes: true,
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.discardedUnsavedInMemoryChanges).toBe(true);
    expect(openProjectAndWait).toHaveBeenCalledWith(
      expect.objectContaining({ discardUnsavedChanges: true })
    );
  });

  it('rejects relative and unsupported project entry paths', async () => {
    const openProjectAndWait: any = jest.fn();
    const bridge = makeBridge({ openProjectAndWait });

    const relativeResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'open_project',
        arguments: { project_path: 'games/project.gdevelop' },
      },
    });
    const unsupportedResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'open_project',
        arguments: {
          project_path: path.join(os.tmpdir(), 'games', 'renamed.gdevelop'),
        },
      },
    });

    expect(JSON.parse(relativeResponse.content[0].text).code).toBe(
      'MCP_OPEN_PROJECT_PATH_NOT_ABSOLUTE'
    );
    expect(JSON.parse(unsupportedResponse.content[0].text).code).toBe(
      'MCP_OPEN_PROJECT_INVALID_ENTRY'
    );
    expect(openProjectAndWait).not.toHaveBeenCalled();
  });

  it('generates and verifies all catalogs and JavaScript declarations before returning', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-generate-catalogs-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Catalog generation test');
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://scenes/Scene/Scene.events'] = 'if SceneJustBegins\n';
    await writeMultiFileSourceTree({
      entryPath: projectFile,
      files,
    });
    const catalogDirectory = path.join(temporaryDirectory, '.gdevelop');
    fs.mkdirSync(catalogDirectory, { recursive: true });
    const catalogFiles = {
      instructions: path.join(catalogDirectory, 'instructions-catalog.json'),
      settings: path.join(catalogDirectory, 'settings-catalog.json'),
      layouts: path.join(catalogDirectory, 'layout-catalog.json'),
      runtimeApi: path.join(catalogDirectory, 'runtime-api.d.ts'),
      projectApi: path.join(catalogDirectory, 'project-api.d.ts'),
    };
    [
      catalogFiles.instructions,
      catalogFiles.settings,
      catalogFiles.layouts,
    ].forEach(catalogFile => {
      fs.writeFileSync(catalogFile, '{ stale catalog', 'utf8');
    });
    const reloadProjectAndWait = jest.fn();
    const bridge = makeBridge({
      getProject: () => project,
      reloadProjectAndWait,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'generate-catalogs', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(reloadProjectAndWait).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        projectFile,
        catalogsRegenerated: true,
        writeMode: 'awaited-and-verified',
        catalogs: expect.objectContaining({
          instructions: expect.any(Object),
          settings: expect.any(Object),
          layouts: expect.any(Object),
        }),
        catalogFiles,
      })
    );
    [
      catalogFiles.instructions,
      catalogFiles.settings,
      catalogFiles.layouts,
    ].forEach(catalogFile => {
      expect(() =>
        JSON.parse(fs.readFileSync(catalogFile, 'utf8'))
      ).not.toThrow();
    });
    expect(fs.readFileSync(catalogFiles.runtimeApi, 'utf8')).toContain(
      'declare namespace gdjs'
    );
    expect(fs.readFileSync(catalogFiles.projectApi, 'utf8')).toContain(
      'declare namespace GDevelopProject'
    );
    expect(result.generatedGameJson).toBeUndefined();
    expect(result.nextAction).toContain('Read the refreshed catalogs');
  });

  it('validates multi-file disk sources without reloading the editor', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-validate-project-files-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Disk validation test');
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://scenes/Scene/Scene.events'] = 'if SceneJustBegins\n';
    await writeMultiFileSourceTree({
      entryPath: projectFile,
      files,
    });
    const catalogDirectory = path.join(temporaryDirectory, '.gdevelop');
    fs.mkdirSync(catalogDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(catalogDirectory, 'instructions-catalog.json'),
      '{ stale and invalid catalog',
      'utf8'
    );
    const reloadProjectAndWait = jest.fn();
    const bridge = makeBridge({
      getProject: () => project,
      reloadProjectAndWait,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'validate_project_files', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(reloadProjectAndWait).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        valid: true,
        validationMode: 'multi-file-disk-sources',
        projectFile,
        catalogsRegenerated: true,
        javascriptApiRegenerated: true,
        catalogs: expect.objectContaining({
          instructions: expect.any(Object),
          settings: expect.any(Object),
          layouts: expect.any(Object),
        }),
        generatedGameJson: expect.objectContaining({
          reconstructedInMemory: true,
          writtenToDisk: false,
          byteLength: expect.any(Number),
        }),
        validationScope: expect.objectContaining({
          projectUnserialization: 'checked',
          projectSerializationRoundTrip: 'checked',
          projectValidation: 'checked',
          extensionGeneratedCode: 'checked',
          javascriptAuthoringApi: 'checked',
          runtimeGameplaySemantics: 'not-verified',
        }),
        runtimeSemanticsVerified: false,
        validationResultKind: 'structural-validation',
        completionStatus: 'runtime-verification-required',
        runtimeVerificationRequired: true,
        completionWarning: expect.stringContaining(
          'valid:true does not prove that the game works'
        ),
        javascriptAuthoring: expect.objectContaining({
          checked: true,
          checkedBlocks: 0,
          typescriptAvailable: true,
          typescriptVersion: expect.any(String),
          environmentDiagnostics: [],
          sourceDiagnostics: [],
        }),
        runtimeVerificationRecommendation: expect.stringContaining(
          'paused preview'
        ),
      })
    );
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop', 'instructions-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop', 'settings-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop', 'layout-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop', 'runtime-api.d.ts')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop', 'project-api.d.ts')
      )
    ).toBe(true);
    expect(result.nextAction).toContain('reload_project');
    expect(result.nextAction).toContain('does not verify runtime');
    expect(result.nextAction).toContain('RUNTIME VERIFICATION REQUIRED');
    expect(result.note).toContain('does not prove object picking');
    expect(result.note).toContain('RUNTIME NOT VERIFIED');
  });

  it('reports strict JavaScript API errors against the original events source', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-invalid-javascript-api-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://scenes/Scene/Scene.events'] = `@js strict=true
runtimeScene._instances.length;
@end js
`;
    await writeMultiFileSourceTree({ entryPath: projectFile, files });
    const bridge = makeBridge({ getProject: () => project });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'validate_project_files', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          code: 'JS_API_PRIVATE_MEMBER',
          fileUri: 'game://scenes/Scene/Scene.events',
          filePath: path.join(
            temporaryDirectory,
            'scenes',
            'Scene',
            'Scene.events'
          ),
          line: 2,
          sourceExcerpt: expect.arrayContaining([
            expect.objectContaining({
              isErrorLine: true,
              text: expect.stringContaining('_instances'),
            }),
          ]),
        }),
      ])
    );
  });

  it('reports the source file and location for invalid project files', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-invalid-project-files-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(projectFile);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://project.gdevelop'] += '\ninvalid = [\n';
    await writeMultiFileSourceTree({ entryPath: projectFile, files });
    const bridge = makeBridge({ getProject: () => project });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'validate_project_files', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        severity: 'error',
        phase: 'parse-settings',
        code: 'MULTIFILE_INVALID_TOML',
        fileUri: 'game://project.gdevelop',
        filePath: projectFile,
      }),
    ]);
  });

  it('stops verify_project_change at validation without mutating runtime state', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-verify-invalid-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(projectFile);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://project.gdevelop'] += '\ninvalid = [\n';
    await writeMultiFileSourceTree({ entryPath: projectFile, files });
    const reloadProjectAndWait: any = jest.fn();
    const runCommand: any = jest.fn();
    const beginPreviewLaunchSequence: any = jest.fn(() => true);
    const endPreviewLaunchSequence: any = jest.fn();
    const bridge = makeBridge({
      getProject: () => project,
      reloadProjectAndWait,
      runCommand,
      beginPreviewLaunchSequence,
      endPreviewLaunchSequence,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'verify_project_change',
        arguments: {
          scene_name: 'Scene',
          assertions: [
            { type: 'runtime_error_count', operator: 'eq', value: 0 },
          ],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        runtimeVerified: false,
        completionReady: false,
        failureStage: 'validation',
      })
    );
    expect(result.receipts).toHaveLength(1);
    expect(result.receipts[0]).toEqual(
      expect.objectContaining({
        stage: 'validation',
        toolName: 'validate_project_files',
        receipt: expect.objectContaining({ valid: false }),
      })
    );
    expect(reloadProjectAndWait).not.toHaveBeenCalled();
    expect(runCommand).not.toHaveBeenCalled();
    expect(beginPreviewLaunchSequence).toHaveBeenCalledTimes(1);
    expect(endPreviewLaunchSequence).toHaveBeenCalledTimes(1);
  });

  it('rejects verify_project_change when another preview workflow owns the sequence', async () => {
    const reloadProjectAndWait: any = jest.fn();
    const beginPreviewLaunchSequence: any = jest.fn(() => false);
    const endPreviewLaunchSequence: any = jest.fn();
    const bridge = makeBridge({
      reloadProjectAndWait,
      beginPreviewLaunchSequence,
      endPreviewLaunchSequence,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'verify_project_change',
        arguments: { scene_name: 'Scene' },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.code).toBe('PREVIEW_LAUNCH_SEQUENCE_ALREADY_IN_PROGRESS');
    expect(reloadProjectAndWait).not.toHaveBeenCalled();
    expect(beginPreviewLaunchSequence).toHaveBeenCalledTimes(1);
    expect(endPreviewLaunchSequence).not.toHaveBeenCalled();
  });

  it('completes verify_project_change only after runtime and renderer assertions pass', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-verify-success-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Runtime verification test');
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(
      serializeProjectWithConstants(project)
    );
    files['game://scenes/Scene/Scene.events'] = 'if SceneJustBegins\n';
    await writeMultiFileSourceTree({ entryPath: projectFile, files });

    const dumpPayload = {
      _paused: true,
      _sceneStack: {
        _stack: [
          {
            _name: 'Scene',
            _isLoaded: true,
            _instances: {
              items: {
                Cube: [
                  {
                    x: 10,
                    y: 20,
                    z: 30,
                    angle: 0,
                    layer: 'Base layer',
                    zOrder: 1,
                  },
                ],
              },
            },
            _objects: { items: { Cube: { name: 'Cube' } } },
            _variables: { _variables: {} },
          },
        ],
      },
    };
    const rendererDiagnostics = {
      scenes: [
        {
          sceneName: 'Scene',
          layers: [
            {
              layerName: 'Base layer',
              hasThreeGroup: true,
              visibleThreeMeshCount: 1,
              failedTextureCount: 0,
              rejected3DRendererObjectCount: 0,
            },
          ],
        },
      ],
    };
    const previewDebuggerServer: any = makeTargetedPreviewServer({
      debuggerIds: [],
      responders: {
        getStatus: { isPaused: true, sceneName: 'Scene' },
        pause: { isPaused: true, sceneName: 'Scene' },
        runFrames: {
          __fullMessage: {
            runFrames: {
              requestedFrames: 2,
              steppedFrames: 2,
              stoppedEarly: false,
              error: null,
              cleanup: {
                attempted: true,
                success: true,
                keysReleased: true,
              },
            },
            payload: dumpPayload,
            rendererDiagnostics,
          },
        },
        refresh: { __dump: dumpPayload, rendererDiagnostics },
      },
    });
    const staleLaunchPreviewForScene: any = jest.fn(() => {
      throw new Error('The pre-reload project object was destroyed.');
    });
    const workflowOrder: Array<string> = [];
    const freshLaunchPreviewForScene: any = jest.fn(async sceneName => {
      expect(sceneName).toBe('Scene');
      workflowOrder.push('launch');
      setTimeout(
        () => previewDebuggerServer.connectDebugger('preview-ws-1'),
        1
      );
      return { accepted: true };
    });
    let currentLaunchPreviewForScene = staleLaunchPreviewForScene;
    const reloadProjectAndWait: any = jest.fn(async () => {
      workflowOrder.push('reload');
      currentLaunchPreviewForScene = freshLaunchPreviewForScene;
      return {
        reloaded: true,
        catalogsRegenerated: true,
      };
    });
    const bridge = makeBridge({
      getProject: () => project,
      reloadProjectAndWait,
      launchPreviewForScene: staleLaunchPreviewForScene,
      getLaunchPreviewForScene: () => currentLaunchPreviewForScene,
      getPreviewDebuggerServer: () => previewDebuggerServer,
      closeAllPreviews: jest.fn(async () => {
        workflowOrder.push('close');
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'verify_project_change',
        arguments: {
          scene_name: 'Scene',
          frames: 2,
          timeout_ms: 1000,
          assertions: [
            {
              type: 'object_count',
              object_name: 'Cube',
              operator: 'eq',
              value: 1,
            },
            {
              type: 'instance_position_finite',
              object_name: 'Cube',
              instance_index: 0,
            },
            { type: 'runtime_error_count', operator: 'eq', value: 0 },
            {
              type: 'renderer_has_three_group',
              layer_name: 'Base layer',
              operator: 'eq',
              value: true,
            },
            {
              type: 'renderer_visible_mesh_count',
              layer_name: 'Base layer',
              operator: 'gte',
              value: 1,
            },
          ],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        runtimeVerified: true,
        completionReady: true,
        sceneName: 'Scene',
        debuggerId: 'preview-ws-1',
      })
    );
    expect(result.assertions).toHaveLength(5);
    expect(result.assertions.every(assertion => assertion.passed)).toBe(true);
    expect(result.receipts.map(receipt => receipt.stage)).toEqual([
      'validation',
      'close-previews',
      'reload',
      'launch',
      'frames',
      'inspect',
      'assertions',
    ]);
    expect(reloadProjectAndWait).toHaveBeenCalledTimes(1);
    expect(staleLaunchPreviewForScene).not.toHaveBeenCalled();
    expect(freshLaunchPreviewForScene).toHaveBeenCalledTimes(1);
    expect(workflowOrder).toEqual(['close', 'reload', 'launch']);
  });

  it('reloads project files from disk and returns a synchronization receipt', async () => {
    const reportProgress = jest.fn();
    const beginPreviewLaunchSequence: any = jest.fn(() => true);
    const endPreviewLaunchSequence: any = jest.fn();
    let currentProject: any = {
      getName: () => 'Before reload',
      getProjectFile: () => 'C:\\game\\project.gdevelop',
    };
    const reloadProjectAndWait: any = (jest.fn(async receivedReporter => {
      expect(receivedReporter).toBe(reportProgress);
      receivedReporter({ phase: 'editor-loading' });
      currentProject = {
        getName: () => 'After reload',
        getProjectFile: () => 'C:\\game\\project.gdevelop',
      };
      return {
        reloaded: true,
        fileIdentifier: 'C:\\game\\project.gdevelop',
        catalogsRegenerated: true,
        catalogs: {
          instructions: { actions: 123 },
          settings: { objectTypes: 45 },
          layouts: { contexts: 2 },
        },
      };
    }): any);
    const bridge = makeBridge({
      getProject: () => currentProject,
      reloadProjectAndWait,
      getPersistenceState: () => ({
        hasUnsavedChanges: true,
        changesCount: 2,
        timeOfFirstChangeSinceLastSave: 123,
      }),
      beginPreviewLaunchSequence,
      endPreviewLaunchSequence,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'reload_project', arguments: {} },
      reportProgress,
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(reloadProjectAndWait).toHaveBeenCalledTimes(1);
    expect(reportProgress).toHaveBeenCalledWith({ phase: 'editor-loading' });
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        reloaded: true,
        discardedUnsavedInMemoryChanges: true,
        projectName: 'After reload',
        projectFile: 'C:\\game\\project.gdevelop',
        catalogsRegenerated: true,
        catalogs: {
          instructions: { actions: 123 },
          settings: { objectTypes: 45 },
          layouts: { contexts: 2 },
        },
      })
    );
    expect(result.nextAction).toContain('catalogs are refreshed');
    expect(result.nextAction).toContain('launch_preview');
    expect(beginPreviewLaunchSequence).toHaveBeenCalledTimes(1);
    expect(endPreviewLaunchSequence).toHaveBeenCalledTimes(1);
  });

  it('rejects reload_project when another MCP preview workflow owns the sequence', async () => {
    const reloadProjectAndWait: any = jest.fn();
    const beginPreviewLaunchSequence: any = jest.fn(() => false);
    const endPreviewLaunchSequence: any = jest.fn();
    const bridge = makeBridge({
      getProject: () => ({
        getName: () => 'Busy project',
        getProjectFile: () => 'C:\\game\\project.gdevelop',
      }),
      reloadProjectAndWait,
      beginPreviewLaunchSequence,
      endPreviewLaunchSequence,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'reload_project', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.code).toBe('PREVIEW_LAUNCH_SEQUENCE_ALREADY_IN_PROGRESS');
    expect(result.reloaded).toBe(false);
    expect(reloadProjectAndWait).not.toHaveBeenCalled();
    expect(beginPreviewLaunchSequence).toHaveBeenCalledTimes(1);
    expect(endPreviewLaunchSequence).not.toHaveBeenCalled();
  });

  it('preserves catalog subphase diagnostics when reload fails', async () => {
    const catalogError: any = new Error('Unable to replace settings catalog.');
    catalogError.code = 'MCP_RELOAD_CATALOG_SUBPHASE_FAILED';
    catalogError.catalogPhase = 'catalog-settings-writing';
    catalogError.catalogArtifact = 'settings';
    const beginPreviewLaunchSequence: any = jest.fn(() => true);
    const endPreviewLaunchSequence: any = jest.fn();
    const bridge = makeBridge({
      getProject: () => ({
        getName: () => 'Catalog failure project',
        getProjectFile: () => 'C:\\game\\project.gdevelop',
      }),
      reloadProjectAndWait: jest.fn(async () => {
        throw catalogError;
      }),
      beginPreviewLaunchSequence,
      endPreviewLaunchSequence,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'reload_project', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Unable to replace settings catalog.',
        code: 'MCP_RELOAD_CATALOG_SUBPHASE_FAILED',
        catalogPhase: 'catalog-settings-writing',
        catalogArtifact: 'settings',
      })
    );
    expect(beginPreviewLaunchSequence).toHaveBeenCalledTimes(1);
    expect(endPreviewLaunchSequence).toHaveBeenCalledTimes(1);
  });

  it('imports a reviewed extension with JavaScript warnings and returns generated multi-file sources', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-extension-import-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.gdevelop');
    const project = new gd.Project();
    project.setProjectFile(projectFile);
    const ensureExtensionInstalled: any = jest.fn(async (options: any) => {
      const compatibility = await options.preflightExtension({
        serializedExtension: {
          name: 'StarRatingBar',
          eventsFunctions: [
            {
              name: 'FormatRating',
              events: [
                {
                  type: 'BuiltinCommonInstructions::JsCode',
                  useStrict: true,
                  inlineCode: 'const broken = ;',
                },
              ],
            },
          ],
          eventsBasedBehaviors: [],
          eventsBasedObjects: [],
        },
        registryHeader: { name: 'StarRatingBar', version: '1.0.0' },
      });
      expect(compatibility.valid).toBe(true);
      expect(compatibility.errors).toEqual([]);
      expect(compatibility.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'JS_API_SYNTAX_ERROR' }),
        ])
      );
      const extension = project.insertNewEventsFunctionsExtension(
        options.extensionName,
        0
      );
      extension.getEventsFunctions().insertNewEventsFunction('FormatRating', 0);
      options.onExtensionInstalled([options.extensionName]);
      return { installed: true, preflightReceipts: [compatibility] };
    });
    const saveProjectAndWait = jest.fn(async () => {
      await writeMultiFileSourceTree({
        entryPath: projectFile,
        files: decomposeLegacyProjectToFiles(
          serializeProjectWithConstants(project)
        ),
      });
      return { saved: true };
    });
    const triggerUnsavedChanges = jest.fn();
    const bridge = makeBridge({
      getProject: () => project,
      getPermissions: () => ({
        allowWriteTools: false,
        allowCommandTools: false,
      }),
      ensureExtensionInstalled,
      saveProjectAndWait,
      triggerUnsavedChanges,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'import_extension',
        arguments: { extension_name: 'StarRatingBar' },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(ensureExtensionInstalled).toHaveBeenCalledWith(
      expect.objectContaining({ extensionName: 'StarRatingBar' })
    );
    expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
    expect(saveProjectAndWait).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        importerVersion: 3,
        extensionName: 'StarRatingBar',
        alreadyInstalled: false,
        importedExtensions: ['StarRatingBar'],
        persistedSourcesVerified: true,
        compatibility: expect.objectContaining({
          policy: 'reviewed-store-extension',
          preflightedBeforeMutation: true,
          receipts: [
            expect.objectContaining({
              valid: true,
              warnings: expect.arrayContaining([
                expect.objectContaining({ code: 'JS_API_SYNTAX_ERROR' }),
              ]),
            }),
          ],
        }),
      })
    );
    expect(result.generatedSources.StarRatingBar).toContain(
      'game://extensions/StarRatingBar/extension.settings'
    );
    expect(result.generatedSources.StarRatingBar).toEqual(
      expect.arrayContaining([
        'game://extensions/StarRatingBar/functions/FormatRating/function.settings',
        'game://extensions/StarRatingBar/functions/FormatRating/FormatRating.events',
      ])
    );
    project.delete();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('blocks a registry extension with mismatched downloaded identity before project mutation or saving', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-extension-preflight-')
    );
    const project = new gd.Project();
    project.setProjectFile(path.join(temporaryDirectory, 'project.gdevelop'));
    const saveProjectAndWait: any = jest.fn();
    const ensureExtensionInstalled: any = jest.fn(async options => {
      const compatibility = await options.preflightExtension({
        serializedExtension: {
          name: 'DifferentExtension',
          eventsFunctions: [],
          eventsBasedBehaviors: [],
          eventsBasedObjects: [],
        },
        registryHeader: { name: 'Raycaster3D', version: '2.0.0' },
      });
      const error: any = new Error(
        'Extension "Raycaster3D" is incompatible with strict JavaScript.'
      );
      error.code = 'EXTENSION_STRICT_API_INCOMPATIBLE';
      error.extensionCompatibility = compatibility;
      throw error;
    });
    const bridge = makeBridge({
      getProject: () => project,
      ensureExtensionInstalled,
      saveProjectAndWait,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'import_extension',
        arguments: { extension_name: 'Raycaster3D' },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        code: 'EXTENSION_STRICT_API_INCOMPATIBLE',
        installed: false,
        saved: false,
        projectUnchanged: true,
        compatibility: expect.objectContaining({
          valid: false,
          code: 'EXTENSION_STRICT_API_INCOMPATIBLE',
        }),
      })
    );
    expect(project.hasEventsFunctionsExtensionNamed('Raycaster3D')).toBe(false);
    expect(saveProjectAndWait).not.toHaveBeenCalled();
    project.delete();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('does not report an extension import as successful without disk persistence', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-extension-unsaved-')
    );
    const project = new gd.Project();
    project.setProjectFile(path.join(temporaryDirectory, 'project.gdevelop'));
    const bridge = makeBridge({
      getProject: () => project,
      ensureExtensionInstalled: async options => {
        project.insertNewEventsFunctionsExtension(options.extensionName, 0);
        options.onExtensionInstalled([options.extensionName]);
      },
      // Simulate a host that claims to have saved without writing the source
      // tree. The import tool must detect this during its disk read-back.
      saveProjectAndWait: async () => ({ saved: true }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'import_extension',
        arguments: { extension_name: 'UnsavedExtension' },
      },
    });

    expect(response.isError).toBe(true);
    const result = JSON.parse(response.content[0].text);
    expect(result).toEqual(
      expect.objectContaining({
        importerVersion: 3,
        writerError: expect.objectContaining({ code: 'ENOENT' }),
      })
    );
    expect(response.content[0].text).not.toContain(
      '"persistedSourcesVerified": true'
    );
    project.delete();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('returns unexpected tool failures as structured JSON', async () => {
    const bridge = makeBridge({
      getProject: () => {
        throw new Error('Project model is unavailable.');
      },
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'gdevelop_get_editor_state', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(response.structuredContent).toEqual(result);
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        code: 'INTERNAL_TOOL_ERROR',
        toolName: 'gdevelop_get_editor_state',
        error: 'Project model is unavailable.',
      })
    );
  });

  it('rejects MCP tools removed from the public catalog', async () => {
    const bridge = makeBridge();

    for (const name of [
      'validate_current_project_json',
      'gdevelop_refresh_tool_catalog',
      'gdevelop_capabilities',
      'create_action',
      'create_signal_emit_action',
      'create_signal_received_condition',
      'create_signal_subscription_action',
      'gdevelop_create_or_update_on_signal',
    ]) {
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: { name, arguments: {} },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).toBe(true);
      expect(result.error).toBe(`Unknown MCP tool: ${name}.`);
    }
  });

  it('reports preview health and recovery actions without a running preview', async () => {
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => ({
        getServerState: () => 'stopped',
        getExistingPreviewDebuggerIds: () => [],
        getExistingDebuggerIds: () => [],
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'preview_health_check',
        arguments: {},
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    expect(result.running).toBe(false);
    expect(result.recommendedActions).toContain('launch_preview');
  });

  it('pings a running preview for health checks', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'preview_health_check',
        arguments: { timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.running).toBe(true);
    expect(result.responsive).toBe(true);
    expect(result.previewHealth).toBe('responsive');
    expect(result.status.sceneName).toBe('Level1');
  });

  it('reports a connected but unresponsive preview in health checks', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {},
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'preview_health_check',
        arguments: { timeout_ms: 200 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.running).toBe(true);
    expect(result.responsive).toBe(false);
    expect(result.previewHealth).toBe('connected-unresponsive');
    expect(result.recommendedActions).toContain(
      'control_preview { action: "close", close_all: true }, then launch_preview { start_paused: true, force_new: true }'
    );
  });

  it('does not keep a stale preview id alive when health-check target disconnects', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      closeOnSendCommands: ['getStatus'],
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'preview_health_check',
        arguments: { timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.running).toBe(false);
    expect(result.responsive).toBe(false);
    expect(result.previewHealth).toBe('not-running');
    expect(result.availableDebuggerIds).toEqual([]);
    expect(result.latestDebuggerId).toBe(null);
    expect(result.error).toContain('closed before replying');
  });

  it('waits until a selected preview answers getStatus', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'wait_until_preview_ready',
        arguments: { require_paused: true, timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    expect(result.ready).toBe(true);
    expect(result.debuggerId).toBe('preview-ws-0');
    expect(result.status.sceneName).toBe('Level1');
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

  it('includes preview launch state in editor state when provided', async () => {
    const bridge = makeBridge({
      getPreviewLaunchState: () => ({
        previewLoading: 'preview',
        launchInProgress: true,
        launchPhase: 'launching',
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_get_editor_state',
        arguments: {},
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(result.previewLaunchState).toEqual({
      previewLoading: 'preview',
      launchInProgress: true,
      launchPhase: 'launching',
    });
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
          {
            paneIdentifier: 'right',
            tabKey: 'resources',
            editorKind: 'resources',
            projectItemName: null,
            selectionProvider: 'ResourcesEditor',
            isActive: true,
            selectedProjectFile: {
              id: 'D:/Project/assets/coin.png',
              name: 'coin.png',
              absolutePath: 'D:\\Project\\assets\\coin.png',
              relativePath: 'assets/coin.png',
              type: 'file',
              extension: '.png',
              resourceName: 'coin',
              resourceKind: 'image',
            },
            selectedResource: {
              name: 'coin',
              kind: 'image',
              file: 'assets/coin.png',
            },
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
    expect(selection.selections[1].selectionProvider).toBe('ResourcesEditor');
    expect(selection.selections[1].selectedProjectFile.relativePath).toBe(
      'assets/coin.png'
    );
    expect(selection.selections[1].selectedResource.name).toBe('coin');
  });

  it('returns a project summary when a project is open', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.setName('MCP Test Game');
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    const instance = layout.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Player');
    instance
      .getVariables()
      .insertNew('IsAnchor', 0)
      .setBool(true);

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

      const summary = JSON.parse(response.content[0].text);
      expect(summary.projectName).toBe('MCP Test Game');
      expect(summary.scenes[0].sceneName).toBe('Level1');
      expect(summary.behaviorSourceLegend.defaultCapabilityInferred).toContain(
        'default GDevelop object capability'
      );
      const player = summary.scenes[0].objects.find(
        object => object.objectName === 'Player'
      );
      expect(player.behaviors[0]).toEqual(
        expect.objectContaining({
          behaviorSource: expect.any(String),
          isDefaultCapability: expect.any(Boolean),
        })
      );
      expect(summary.scenes[0].instanceInitialVariables).toEqual([
        expect.objectContaining({
          objectName: 'Player',
          sourceIndex: 0,
          initialVariables: [
            expect.objectContaining({
              name: 'IsAnchor',
              type: 'boolean',
            }),
          ],
        }),
      ]);
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
          tool_name: 'verify_project_change',
        },
      },
    });
    const schema = JSON.parse(schemaResponse.content[0].text);
    expect(schema.tool.name).toBe('verify_project_change');
    expect(schema.tool.inputSchema.properties.assertions.type).toBe('array');
    expect(schema.examples[0].arguments.assertions[0].type).toBe(
      'runtime_error_count'
    );

    const variableSchemaResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'inspect_tool_schema',
        arguments: {
          tool_name: 'simulate_preview_input',
        },
      },
    });
    const variableSchema = JSON.parse(variableSchemaResponse.content[0].text);
    expect(variableSchema.tool.inputSchema.properties.inputs.type).toBe(
      'array'
    );
    expect(variableSchema.examples[0].arguments.inputs[0].type).toBe(
      'keyPressed'
    );

    const examplesResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'get_tool_usage_examples',
        arguments: {
          tool_name: 'run_frames',
        },
      },
    });
    const examples = JSON.parse(examplesResponse.content[0].text);
    expect(examples.examples[0].arguments.frames).toBe(30);
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

  it('rejects unlisted internal resource URIs', async () => {
    const bridge = makeBridge();

    await expect(
      bridge.handleRendererMcpRequest({
        method: 'resources/read',
        params: {
          uri: 'gdevelop://project/json',
        },
      })
    ).rejects.toThrow('Unknown GDevelop MCP resource');
  });

  it('inspects a running preview through the debugger server', async () => {
    // A mock preview debugger server that replies to a refresh with a dump.
    const dumpPayload = {
      _paused: false,
      _variables: {
        _variables: {
          Coins: {
            _value: 7,
            _str: '',
            _stringDirty: true,
            _isStructure: false,
          },
        },
      },
      _sceneStack: {
        _stack: [
          {
            _name: 'Level1',
            _isLoaded: true,
            // Live instances live in `_instances` (Hashtable), keyed by object
            // name; `_objects` is the static template data and must NOT be the
            // source of counts.
            _instances: {
              items: {
                Player: [
                  {
                    id: 7,
                    persistentUuid: 'player-instance-uuid',
                    x: 10,
                    y: 20,
                    angle: 180,
                    layer: 'Gameplay',
                    zOrder: 3,
                    pick: true,
                    _permanentForceX: -720,
                    _permanentForceY: 0,
                    _instantForces: [{ _x: 5, _y: 0, _angle: 0, _length: 5 }],
                    _totalForce: {
                      _x: -715,
                      _y: 0,
                      _angle: 180,
                      _length: 715,
                    },
                    _variables: {
                      _variables: {
                        Health: {
                          _value: 3,
                          _str: '',
                          _stringDirty: true,
                          _isStructure: false,
                        },
                      },
                    },
                    _behaviors: [
                      {
                        name: 'Fire',
                        type: 'FireBullet::FireBullet',
                        _activated: true,
                        _cooldown: 0.25,
                      },
                    ],
                  },
                ],
                Enemy: [{}, {}],
              },
            },
            _objects: {
              items: {
                Player: { name: 'Player' },
                Enemy: { name: 'Enemy' },
              },
            },
            _variables: {
              _variables: {
                Score: {
                  _value: 42,
                  _str: '',
                  _stringDirty: true,
                  _isStructure: false,
                },
              },
            },
          },
        ],
      },
    };
    const recentCustomLog = {
      command: 'console.log',
      payload: {
        message: 'GroundSlot clicked: index=0, row=0, column=0, occupied=false',
        type: 'info',
        group: 'DebuggerTools',
        internal: false,
        timestamp: 1234,
      },
    };

    let callbacks: any = null;
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => ['preview-ws-0', 'preview-ws-1'],
      getExistingDebuggerIds: () => ['preview-ws-0', 'preview-ws-1'],
      getRecentLogs: (id: string) =>
        id === 'preview-ws-1' ? [recentCustomLog] : [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (message.command === 'refresh' && callbacks) {
          // Simulate the running game replying asynchronously with a dump.
          setTimeout(() => {
            if (callbacks)
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: { command: 'dump', payload: dumpPayload },
              });
          }, 5);
        }
      },
    };

    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_inspect_running_preview',
        arguments: {
          timeout_ms: 1000,
          objects: ['Player', 'Enemy', 'MissingObject'],
          include: ['position', 'angle', 'forces', 'variables', 'behaviors'],
          instance_indexes: [0, 2],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result.running).toBe(true);
    // Defaults to the latest (last) preview, not the stale first one.
    expect(result.debuggerId).toBe('preview-ws-1');
    expect(result.latestDebuggerId).toBe('preview-ws-1');
    expect(result.inspectedLatest).toBe(true);
    expect(result.runtime.available).toBe(true);
    expect(result.runtime.scenes[0].name).toBe('Level1');
    expect(result.runtime.scenes[0].objectInstanceCounts).toEqual(
      expect.objectContaining({ Player: 1, Enemy: 2 })
    );
    expect(result.runtime.scenes[0].totalInstances).toBe(3);
    expect(result.runtime.scenes[0].sceneVariables.Score).toBe(42);
    expect(result.runtime.globalVariables.Coins).toBe(7);
    expect(result.runtime.scenes[0].instanceStates.Player[0]).toEqual(
      expect.objectContaining({
        index: 0,
        id: 7,
        persistentUuid: 'player-instance-uuid',
        picked: true,
        position: { x: 10, y: 20, layer: 'Gameplay', zOrder: 3 },
        angle: 180,
        variables: { Health: 3 },
        behaviors: [
          expect.objectContaining({
            name: 'Fire',
            type: 'FireBullet::FireBullet',
            activated: true,
            state: { _cooldown: 0.25 },
          }),
        ],
      })
    );
    expect(result.runtime.scenes[0].instanceStates.Player[0].forces).toEqual(
      expect.objectContaining({
        permanent: expect.objectContaining({
          x: -720,
          y: 0,
          angle: 180,
          length: 720,
        }),
        instantaneous: [{ x: 5, y: 0, angle: 0, length: 5 }],
        total: { x: -715, y: 0, angle: 180, length: 715 },
      })
    );
    expect(result.runtime.scenes[0].missingObjects).toEqual(['MissingObject']);
    expect(result.runtime.scenes[0].instanceStates.Enemy[0]).toEqual({
      index: 0,
      missingFields: ['position', 'angle', 'forces', 'variables', 'behaviors'],
    });
    expect(result.runtime.scenes[0].missingInstances).toEqual({
      Player: [2],
      Enemy: [2],
    });
    expect(result.recentLogs).toEqual([recentCustomLog]);
    expect(result.logs).toEqual(expect.arrayContaining([recentCustomLog]));
  });

  it('reports when no preview is running for runtime inspection', async () => {
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => ({
        getServerState: () => 'stopped',
        getExistingPreviewDebuggerIds: () => [],
        getExistingDebuggerIds: () => [],
        registerCallbacks: () => () => {},
        sendMessage: () => {},
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_inspect_running_preview',
        arguments: {},
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.running).toBe(false);
    expect(result.error).toContain('launch_preview');
    expect(result.diagnostics.classification).toBe('no-running-preview');
  });

  it('captures a preview screenshot as a base64 data URL', async () => {
    // 1x1 transparent PNG.
    const onePixelPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMCAQDLuRBYAAAAAElFTkSuQmCC';
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        captureScreenshot: {
          dataUrl: onePixelPng,
          width: 1,
          height: 1,
          error: null,
        },
        refresh: {
          __fullMessage: { payload: { _sceneStack: { _stack: [] } } },
        },
      },
    });

    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'capture_preview_screenshot', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.dataUrl).toBe(onePixelPng);
    expect(result.source).toBe('renderer-canvas');
    expect(result.exactGameResolution).toBe(true);
    expect(result.attempt).toBe(1);
  });

  it('captures the renderer canvas when canvas_only is requested', async () => {
    const onePixelPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMCAQDLuRBYAAAAAElFTkSuQmCC';
    const capturePreviewPage: any = jest.fn(async () => ({
      dataUrl: onePixelPng,
      width: 10,
      height: 10,
    }));
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        captureScreenshot: {
          dataUrl: onePixelPng,
          width: 1,
          height: 1,
          error: null,
        },
        refresh: {
          __fullMessage: { payload: { _sceneStack: { _stack: [] } } },
        },
      },
    });

    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
      capturePreviewPage,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'capture_preview_screenshot',
        arguments: { canvas_only: true },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.source).toBe('renderer-canvas');
    expect(result.width).toBe(1);
    expect(capturePreviewPage).not.toHaveBeenCalled();
  });

  it('captures a screenshot from the requested debugger_id', async () => {
    const onePixelPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMCAQDLuRBYAAAAAElFTkSuQmCC';
    const requestedIds: Array<string> = [];
    let callbacks: any = null;
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => ['preview-ws-0', 'preview-ws-1'],
      getExistingDebuggerIds: () => ['preview-ws-0', 'preview-ws-1'],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        requestedIds.push(id);
        setTimeout(
          () =>
            callbacks &&
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'screenshot',
                messageId: message.messageId,
                payload: { dataUrl: onePixelPng, width: 1, height: 1 },
              },
            }),
          2
        );
      },
    };
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'capture_preview_screenshot',
        arguments: { debugger_id: 'preview-ws-0' },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.success).toBe(true);
    // It must have addressed only the requested (older) preview, not latest —
    // both the metadata refresh and the screenshot target that id.
    expect(requestedIds.every(id => id === 'preview-ws-0')).toBe(true);
    expect(requestedIds).toContain('preview-ws-0');
    expect(result.debuggerId).toBe('preview-ws-0');
  });

  it('launch_preview with start_paused pauses the new preview on connect', async () => {
    let callbacks: any = null;
    const sent: Array<any> = [];
    const runCommand = jest.fn((commandName: string) => {
      // Simulate the new preview connecting shortly after launch.
      if (commandName === 'LAUNCH_DEBUG_PREVIEW' && callbacks) {
        setTimeout(() => {
          if (callbacks && callbacks.onConnectionOpened)
            callbacks.onConnectionOpened({
              id: 'preview-ws-0',
              debuggerIds: ['preview-ws-0'],
            });
        }, 2);
      }
      return true;
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        sent.push({ id, message });
        if (
          (message.command === 'getStatus' || message.command === 'pause') &&
          message.messageId &&
          callbacks
        ) {
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'status',
                messageId: message.messageId,
                payload: {
                  isPaused: message.command === 'pause',
                  sceneName: 'Level1',
                },
              },
            });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { start_paused: true, timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result.launched).toBe(true);
    expect(result.startPaused).toBe(true);
    expect(result.pauseConfirmed).toBe(true);
    expect(result.debuggerId).toBe('preview-ws-0');
    expect(runCommand).toHaveBeenCalledWith('LAUNCH_DEBUG_PREVIEW');
    // A pause command was sent to the newly-connected preview.
    expect(
      sent.some(s => s.id === 'preview-ws-0' && s.message.command === 'pause')
    ).toBe(true);
    expect(
      sent.some(
        s =>
          s.id === 'preview-ws-0' &&
          s.message.command === 'pause' &&
          s.message.skipDump === true
      )
    ).toBe(true);
  });

  it('launch_preview attaches to an already-running preview instead of opening a new window', async () => {
    const runCommand = jest.fn(() => true);
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {
        getStatus: { isPaused: false, sceneName: 'Level1' },
      },
    });
    const bridge = makeBridge({
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'launch_preview', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.attached).toBe(true);
    expect(result.launched).toBe(false);
    expect(result.debuggerId).toBe('preview-ws-0');
    // No new preview window was opened.
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('launch_preview attaches and pauses an existing preview in place with start_paused', async () => {
    const runCommand = jest.fn(() => true);
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {
        getStatus: { isPaused: false, sceneName: 'Level1' },
        pause: { isPaused: true, sceneName: 'Level1' },
      },
    });
    const bridge = makeBridge({
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { start_paused: true, timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.attached).toBe(true);
    expect(result.launched).toBe(false);
    expect(result.startPaused).toBe(true);
    expect(result.pauseConfirmed).toBe(true);
    expect(result.debuggerId).toBe('preview-ws-0');
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('launch_preview with force_new opens a new window even if a preview is connected', async () => {
    let callbacks: any = null;
    let debuggerIds: Array<string> = ['preview-ws-0'];
    const runCommand = jest.fn((commandName: string) => {
      if (commandName === 'LAUNCH_DEBUG_PREVIEW' && callbacks) {
        setTimeout(() => {
          debuggerIds = ['preview-ws-0', 'preview-ws-1'];
          callbacks &&
            callbacks.onConnectionOpened({
              id: 'preview-ws-1',
              debuggerIds,
            });
        }, 2);
      }
      return true;
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => debuggerIds,
      getExistingDebuggerIds: () => debuggerIds,
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (message.command === 'getStatus' && message.messageId && callbacks) {
          setTimeout(() => {
            callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: {
                  command: 'status',
                  messageId: message.messageId,
                  payload: { isPaused: false, sceneName: 'Level1' },
                },
              });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'launch_preview', arguments: { force_new: true } },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.attached).not.toBe(true);
    expect(result.launched).toBe(true);
    expect(result.ready).toBe(true);
    expect(result.debuggerId).toBe('preview-ws-1');
    expect(runCommand).toHaveBeenCalledWith('LAUNCH_DEBUG_PREVIEW');
  });

  it('launch_preview defaults to the project first scene, not the active tab', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('global (for external)', 0);
    project.insertNewLayout('main', 1);
    project.setFirstLayout('main');

    const launchedScenes: Array<?string> = [];
    let callbacks: any = null;
    const launchPreviewForScene = jest.fn((sceneName: ?string) => {
      launchedScenes.push(sceneName);
      // Simulate the new preview connecting and running the requested scene.
      setTimeout(() => {
        if (callbacks && callbacks.onConnectionOpened)
          callbacks.onConnectionOpened({
            id: 'preview-ws-0',
            debuggerIds: ['preview-ws-0'],
          });
      }, 2);
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (
          (message.command === 'getStatus' || message.command === 'pause') &&
          message.messageId &&
          callbacks
        ) {
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'status',
                messageId: message.messageId,
                payload: {
                  isPaused: message.command === 'pause',
                  sceneName: 'main',
                },
              },
            });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      getProject: () => project,
      runCommand: jest.fn(() => true),
      launchPreviewForScene,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { start_paused: true, timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.launched).toBe(true);
    expect(result.expectedScene).toBe('main');
    expect(result.firstLayout).toBe('main');
    expect(result.actualScene).toBe('main');
    expect(result.sceneMismatch).toBeUndefined();
    expect(result.sceneSelectionSupported).toBe(true);
    // The first scene was launched, not the editor's active tab.
    expect(launchedScenes).toEqual(['main']);

    project.delete();
  });

  it('waits for the first runtime scene before pausing a newly connected preview', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Game', 0);
    project.setFirstLayout('Game');

    let statusProbeCount = 0;
    const previewDebuggerServer: any = makeTargetedPreviewServer({
      debuggerIds: [],
      responders: {
        getStatus: () => ({
          isPaused: false,
          sceneName: ++statusProbeCount >= 2 ? 'Game' : null,
        }),
        pause: { isPaused: true, sceneName: 'Game' },
      },
    });
    const launchPreviewForScene = jest.fn(() => {
      setTimeout(
        () => previewDebuggerServer.connectDebugger('preview-ws-0'),
        1
      );
      return { accepted: true };
    });
    const bridge = makeBridge({
      getProject: () => project,
      launchPreviewForScene,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: {
          scene_name: 'Game',
          start_paused: true,
          timeout_ms: 1000,
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    expect(result.pauseConfirmed).toBe(true);
    expect(result.actualScene).toBe('Game');
    expect(statusProbeCount).toBeGreaterThanOrEqual(2);
    expect(launchPreviewForScene).toHaveBeenCalledWith('Game');

    project.delete();
  });

  it('launch_preview reports scene-aware launch rejection without waiting for a debugger connection', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('main', 0);
    project.setFirstLayout('main');

    const launchPreviewForScene = jest.fn(async () => ({
      accepted: false,
      reason: 'preview-launch-already-in-progress',
      launchState: {
        previewLoading: 'preview',
        launchInProgress: true,
        launchPhase: 'launching',
      },
    }));
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: jest.fn(() => () => {}),
    };
    const bridge = makeBridge({
      getProject: () => project,
      runCommand: jest.fn(() => true),
      launchPreviewForScene,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { start_paused: true, timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(false);
    expect(result.launched).toBe(false);
    expect(result.failurePhase).toBe('window-launch');
    expect(result.error).toContain('preview-launch-already-in-progress');
    expect(result.launchFailureDetails.launchState).toEqual({
      previewLoading: 'preview',
      launchInProgress: true,
      launchPhase: 'launching',
    });
    project.delete();
  });

  it('launch_preview cancels a scene-aware launch command that never settles', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('main', 0);
    project.setFirstLayout('main');

    const launchPreviewForScene = jest.fn(() => new Promise(() => {}));
    const cancelPreviewLaunch = jest.fn(() => ({
      cancelled: true,
      releasedMcpLaunchReservation: true,
      releasedPreviewPreparation: true,
    }));
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: jest.fn(() => () => {}),
    };
    const bridge = makeBridge({
      getProject: () => project,
      runCommand: jest.fn(() => true),
      launchPreviewForScene,
      cancelPreviewLaunch,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { start_paused: true, timeout_ms: 500 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(false);
    expect(result.launched).toBe(false);
    expect(result.failurePhase).toBe('window-launch');
    expect(result.error).toContain('preview-launch-command-timeout');
    expect(result.launchFailureDetails.timeoutMs).toBe(500);
    expect(result.launchFailureDetails.cancellation).toEqual(
      expect.objectContaining({
        releasedMcpLaunchReservation: true,
        releasedPreviewPreparation: true,
      })
    );
    expect(cancelPreviewLaunch).toHaveBeenCalledTimes(1);
    expect(cancelPreviewLaunch.mock.calls[0][0]).toContain('500 ms');

    project.delete();
  });

  it('launch_preview honors an explicit scene_name', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('main', 0);
    project.insertNewLayout('Boss', 1);
    project.setFirstLayout('main');

    const launchedScenes: Array<?string> = [];
    let callbacks: any = null;
    const launchPreviewForScene = jest.fn((sceneName: ?string) => {
      launchedScenes.push(sceneName);
      setTimeout(() => {
        if (callbacks && callbacks.onConnectionOpened)
          callbacks.onConnectionOpened({
            id: 'preview-ws-0',
            debuggerIds: ['preview-ws-0'],
          });
      }, 2);
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (message.command === 'getStatus' && message.messageId && callbacks) {
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'status',
                messageId: message.messageId,
                payload: { isPaused: false, sceneName: 'Boss' },
              },
            });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      getProject: () => project,
      runCommand: jest.fn(() => true),
      launchPreviewForScene,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { scene_name: 'Boss', timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.requestedScene).toBe('Boss');
    expect(result.expectedScene).toBe('Boss');
    expect(result.actualScene).toBe('Boss');
    expect(result.sceneMismatch).toBeUndefined();
    expect(launchedScenes).toEqual(['Boss']);

    project.delete();
  });

  it('launch_preview rejects an unknown scene_name with the available scenes', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('main', 0);
    project.setFirstLayout('main');

    const bridge = makeBridge({
      getProject: () => project,
      runCommand: jest.fn(() => true),
      launchPreviewForScene: jest.fn(),
      getPreviewDebuggerServer: () => null,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { scene_name: 'DoesNotExist' },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(result.success).toBe(false);
    expect(result.failurePhase).toBe('scene-selection');
    expect(result.error).toContain('DoesNotExist');
    expect(result.error).toContain('main');
    expect(result.availableScenes).toEqual(['main']);

    project.delete();
  });

  it('launch_preview flags a scene mismatch when scene selection is not supported', async () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('global (for external)', 0);
    project.insertNewLayout('main', 1);
    project.setFirstLayout('main');

    // No launchPreviewForScene callback => legacy command path => previews the
    // editor's active tab, which here is reported as the wrong scene.
    let callbacks: any = null;
    const runCommand = jest.fn((commandName: string) => {
      if (commandName === 'LAUNCH_DEBUG_PREVIEW' && callbacks) {
        setTimeout(() => {
          if (callbacks && callbacks.onConnectionOpened)
            callbacks.onConnectionOpened({
              id: 'preview-ws-0',
              debuggerIds: ['preview-ws-0'],
            });
        }, 2);
      }
      return true;
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => [],
      getExistingDebuggerIds: () => [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (message.command === 'getStatus' && message.messageId && callbacks) {
          setTimeout(() => {
            if (!callbacks) return;
            callbacks.onHandleParsedMessage({
              id,
              parsedMessage: {
                command: 'status',
                messageId: message.messageId,
                payload: {
                  isPaused: false,
                  sceneName: 'global (for external)',
                },
              },
            });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      getProject: () => project,
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(result.launched).toBe(true);
    expect(result.expectedScene).toBe('main');
    expect(result.actualScene).toBe('global (for external)');
    expect(result.sceneMismatch).toBe(true);
    expect(result.sceneSelectionSupported).toBe(false);
    expect(runCommand).toHaveBeenCalledWith('LAUNCH_DEBUG_PREVIEW');

    project.delete();
  });

  it('does not expose the retired save-and-relaunch preview helper', async () => {
    const saveProjectAndWait: any = jest.fn(async () => ({
      saved: true,
      consistency: { projectName: 'Preview Test' },
    }));
    const closeAllPreviews: any = jest.fn();
    const sent: Array<Object> = [];
    let callbacks: any = null;
    let debuggerIds: Array<string> = ['preview-ws-old'];
    const dumpPayload = {
      _paused: true,
      _variables: {
        _variables: {},
      },
      _sceneStack: {
        _stack: [
          {
            _name: 'Level1',
            _isLoaded: true,
            _instances: {
              items: {
                Player: [{}],
              },
            },
            _objects: {
              items: {
                Player: { name: 'Player' },
              },
            },
            _variables: {
              _variables: {},
            },
          },
        ],
      },
    };
    let launchCommandCount = 0;
    const runCommand = jest.fn((commandName: string) => {
      if (commandName === 'LAUNCH_DEBUG_PREVIEW') launchCommandCount++;
      if (
        commandName === 'LAUNCH_DEBUG_PREVIEW' &&
        launchCommandCount === 2 &&
        callbacks
      ) {
        setTimeout(() => {
          debuggerIds = ['preview-ws-new'];
          callbacks &&
            callbacks.onConnectionOpened({
              id: 'preview-ws-new',
              debuggerIds,
            });
        }, 2);
      }
      return true;
    });
    const closeAllConnections: any = jest.fn(() => {
      const previousIds = debuggerIds;
      debuggerIds = [];
      if (callbacks) {
        previousIds.forEach(id =>
          callbacks.onConnectionClosed({ id, debuggerIds: [] })
        );
      }
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => debuggerIds,
      getExistingDebuggerIds: () => debuggerIds,
      getRecentLogs: () => [],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      closeAllConnections,
      sendMessage: (id: string, message: any) => {
        sent.push({ id, message });
        if (
          (message.command === 'getStatus' || message.command === 'pause') &&
          message.messageId &&
          callbacks
        ) {
          setTimeout(() => {
            callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: {
                  command: 'status',
                  messageId: message.messageId,
                  payload: {
                    isPaused: message.command === 'pause',
                    sceneName: 'Level1',
                  },
                },
              });
          }, 2);
        }
        if (message.command === 'refresh' && callbacks) {
          setTimeout(() => {
            callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: { command: 'dump', payload: dumpPayload },
              });
          }, 2);
        }
      },
    };
    const bridge = makeBridge({
      getPermissions: () => ({
        allowWriteTools: false,
        allowCommandTools: true,
      }),
      saveProjectAndWait,
      closeAllPreviews,
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'save_and_relaunch_preview_paused',
        arguments: { timeout_ms: 250 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).toBe(true);
    expect(result.error).toContain('Unknown MCP tool');
    expect(saveProjectAndWait).not.toHaveBeenCalled();
    expect(closeAllPreviews).not.toHaveBeenCalled();
    expect(closeAllConnections).not.toHaveBeenCalled();
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('launch_preview reports not ready when a new preview connects but never answers getStatus', async () => {
    let callbacks: any = null;
    let debuggerIds: Array<string> = [];
    const runCommand = jest.fn((commandName: string) => {
      if (commandName === 'LAUNCH_DEBUG_PREVIEW' && callbacks) {
        setTimeout(() => {
          debuggerIds = ['preview-ws-23'];
          callbacks &&
            callbacks.onConnectionOpened({
              id: 'preview-ws-23',
              debuggerIds,
            });
        }, 2);
      }
      return true;
    });
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => debuggerIds,
      getExistingDebuggerIds: () => debuggerIds,
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (jest.fn(): any),
    };
    const bridge = makeBridge({
      runCommand,
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'launch_preview',
        arguments: { force_new: true, start_paused: true, timeout_ms: 250 },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(false);
    expect(result.launched).toBe(true);
    expect(result.ready).toBe(false);
    expect(result.startPaused).toBe(false);
    expect(result.pauseConfirmed).toBe(false);
    expect(result.debuggerId).toBe('preview-ws-23');
    expect(result.failurePhase).toBe('runtime-ready');
    expect(result.previewHealth).toBe('connected-unresponsive');
  });

  it('writes a preview screenshot to a file when file_path is given', async () => {
    const onePixelPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMCAQDLuRBYAAAAAElFTkSuQmCC';
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        captureScreenshot: {
          dataUrl: onePixelPng,
          width: 1,
          height: 1,
          error: null,
        },
        refresh: {
          __fullMessage: { payload: { _sceneStack: { _stack: [] } } },
        },
      },
    });
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-shot-'));
    const filePath = path.join(tempDir, 'frame.png');

    try {
      const bridge = makeBridge({
        getPreviewDebuggerServer: () => previewDebuggerServer,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'capture_preview_screenshot',
          arguments: { file_path: filePath },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('reports when no preview is running for a screenshot', async () => {
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => ({
        getServerState: () => 'started',
        getExistingPreviewDebuggerIds: () => [],
        getExistingDebuggerIds: () => [],
        getLastConnectionInfo: () => ({
          debuggerId: 'preview-ws-9',
          connected: false,
          closedAt: '2026-07-10T00:00:00.000Z',
          disconnectReason: 'websocket-closed',
          code: 1001,
          socketState: 'closed',
        }),
        sendMessageWithResponse: () => Promise.resolve({}),
      }),
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'capture_preview_screenshot', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.success).toBe(false);
    expect(result.error).toContain('connected');
    expect(result.connectionInfo).toEqual(
      expect.objectContaining({
        debuggerId: 'preview-ws-9',
        disconnectReason: 'websocket-closed',
        socketState: 'closed',
      })
    );
  });

  it('auto-quotes bare identifier-like string parameters', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    try {
      // ResetTimer (builtin action) parameter 1 is a timer name (identifier),
      // which must be a quoted string expression. A bare value should be wrapped.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ResetTimer' },
              parameters: ['', 'GameTimer'],
            },
          ],
        },
      ];
      const changed = autoQuoteEventParameters(project, events);
      expect(changed).toBeGreaterThanOrEqual(1);
      expect(events[0].actions[0].parameters[1]).toBe('"GameTimer"');

      // An already-quoted value and an expression are left untouched.
      const events2 = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ResetTimer' },
              parameters: ['', '"AlreadyQuoted"'],
            },
          ],
        },
      ];
      const changed2 = autoQuoteEventParameters(project, events2);
      expect(changed2).toBe(0);
      expect(events2[0].actions[0].parameters[1]).toBe('"AlreadyQuoted"');
    } finally {
      project.delete();
    }
  });

  it('simulates input into a running preview with key-name mapping', async () => {
    let captured: any = null;
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        simulateInput: message => {
          captured = message;
          return { applied: ['keyPressed:37'], error: null };
        },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'simulate_preview_input',
        arguments: { inputs: [{ type: 'keyPressed', key: 'Left' }] },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    // "Left" must map to DOM key code 37.
    expect(captured.command).toBe('simulateInput');
    expect(captured.inputs[0]).toEqual(
      expect.objectContaining({ type: 'keyPressed', keyCode: 37 })
    );
  });

  it('injects a native preview user gesture before simulated mouse input', async () => {
    const callOrder = [];
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        simulateInput: () => {
          callOrder.push('runtime-input');
          return { applied: ['mouseButtonPressed:0'], error: null };
        },
      },
    });
    const injectPreviewClickUserGesture: any = jest.fn(async inputs => {
      callOrder.push('native-user-gesture');
      return {
        success: true,
        attempted: true,
        supported: true,
        nativeClickInjected: true,
        audioContextState: 'running',
        audioUnlocked: true,
      };
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
      injectPreviewClickUserGesture,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'simulate_preview_input',
        arguments: {
          inputs: [
            { type: 'mouseMove', x: 320, y: 180 },
            { type: 'mouseButtonPressed', button: 'left' },
          ],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(callOrder).toEqual(['native-user-gesture', 'runtime-input']);
    expect(injectPreviewClickUserGesture).toHaveBeenCalledWith([
      { type: 'mouseMove', x: 320, y: 180 },
      { type: 'mouseButtonPressed', button: 'left' },
    ]);
    expect(result.userGesture).toEqual(
      expect.objectContaining({
        nativeClickInjected: true,
        audioContextState: 'running',
        audioUnlocked: true,
      })
    );
  });

  it.each(['2', 'Num2', 'Digit2'])(
    'normalizes main-keyboard digit alias %s for preview input',
    async key => {
      let captured: any = null;
      const previewDebuggerServer = makeTargetedPreviewServer({
        responders: {
          simulateInput: message => {
            captured = message;
            return { applied: ['keyPressed:50'], error: null };
          },
        },
      });
      const bridge = makeBridge({
        getPreviewDebuggerServer: () => previewDebuggerServer,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'simulate_preview_input',
          arguments: { inputs: [{ type: 'keyPressed', key }] },
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(captured.inputs[0]).toEqual(
        expect.objectContaining({ keyCode: 50, location: 0 })
      );
      expect(result.normalizedInputs[0]).toEqual(
        expect.objectContaining({
          domCode: 'Digit2',
          keyCode: 50,
          gdevelopKeyName: 'Num2',
          location: 0,
          inputAlias: key,
        })
      );
    }
  );

  it('keeps Numpad2 distinct and describes raw key code 50', async () => {
    const captured = [];
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        simulateInput: message => {
          captured.push(message);
          return { applied: [], error: null };
        },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const numpadResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'simulate_preview_input',
        arguments: { inputs: [{ type: 'keyPressed', key: 'Numpad2' }] },
      },
    });
    const rawCodeResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'simulate_preview_input',
        arguments: { inputs: [{ type: 'keyPressed', key_code: 50 }] },
      },
    });
    const numpadResult = JSON.parse(numpadResponse.content[0].text);
    const rawCodeResult = JSON.parse(rawCodeResponse.content[0].text);

    expect(captured[0].inputs[0]).toEqual(
      expect.objectContaining({ keyCode: 98, location: 3 })
    );
    expect(numpadResult.normalizedInputs[0]).toEqual(
      expect.objectContaining({
        domCode: 'Numpad2',
        gdevelopKeyName: 'Numpad2',
        keyCode: 98,
        location: 3,
      })
    );
    expect(rawCodeResult.normalizedInputs[0]).toEqual(
      expect.objectContaining({
        domCode: 'Digit2',
        gdevelopKeyName: 'Num2',
        keyCode: 50,
      })
    );
  });

  it('rejects an unknown key name for input simulation', async () => {
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => ({
        getServerState: () => 'started',
        getExistingPreviewDebuggerIds: () => ['preview-ws-0'],
        getExistingDebuggerIds: () => ['preview-ws-0'],
        sendMessageWithResponse: () => Promise.resolve({}),
        sendMessage: () => {},
      }),
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'simulate_preview_input',
        arguments: { inputs: [{ type: 'keyPressed', key: 'NotARealKey' }] },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown key name');
  });

  it('run_frames injects input, steps frames, and returns runtime state in one call', async () => {
    let capturedRunFrames: any = null;
    const runDumpPayload = {
      _paused: true,
      _sceneStack: {
        _stack: [
          {
            _name: 'Level1',
            _isLoaded: true,
            _instances: {
              items: {
                Bullet: [
                  { x: 10, y: 20, angle: 0, layer: 'HUD', zOrder: 7 },
                  {},
                  {},
                ],
              },
            },
            _objects: { items: { Bullet: { name: 'Bullet' } } },
            _variables: { _variables: {} },
          },
        ],
      },
    };
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
        runFrames: message => {
          capturedRunFrames = message;
          // Reply with the full framesRan message shape: run metadata as a
          // sibling of payload (the dump), which the bridge reads in full.
          return {
            __fullMessage: {
              runFrames: {
                applied: ['keyPressed:32'],
                steppedFrames: 5,
                stoppedEarly: false,
                deltaMs: 1000 / 60,
                error: null,
              },
              payload: runDumpPayload,
            },
          };
        },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          inputs: [{ type: 'keyPressed', key: 'Space' }],
          frames: 5,
          instance_positions_for: ['Bullet'],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    // The single request carried the inputs (Space -> 32) and the frame count.
    expect(capturedRunFrames.command).toBe('runFrames');
    expect(capturedRunFrames.count).toBe(5);
    expect(capturedRunFrames.inputs[0]).toEqual(
      expect.objectContaining({ type: 'keyPressed', keyCode: 32 })
    );
    expect(result.steppedFrames).toBe(5);
    // The returned runtime snapshot is summarized from the dump in the SAME reply.
    expect(result.runtime.available).toBe(true);
    expect(result.runtime.scenes[0].objectInstanceCounts).toEqual(
      expect.objectContaining({ Bullet: 3 })
    );
    expect(result.runtime.scenes[0].instancePositions.Bullet[0]).toEqual(
      expect.objectContaining({ x: 10, y: 20, layer: 'HUD', zOrder: 7 })
    );
  });

  it('run_frames reports partial failure coordinates and confirmed cleanup', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
        runFrames: {
          __fullMessage: {
            runFrames: {
              applied: ['keyPressed:32', 'autoReleasedKeys'],
              requestedFrames: 24,
              steppedFrames: 17,
              stoppedEarly: false,
              failedFrame: 18,
              partialStateAvailable: true,
              failure: {
                code: 'AMBIGUOUS_OBJECT_PICKING',
                eventId: 'enemy-fire-3',
                instructionId: 'action-1',
              },
              cleanup: {
                attempted: true,
                success: true,
                keysReleased: true,
              },
              heldKeys: [],
              error: 'Ambiguous object picking.',
            },
            payload: {
              _paused: true,
              _sceneStack: { _stack: [] },
            },
          },
        },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          inputs: [{ type: 'keyPressed', key: 'Space' }],
          frames: 24,
          auto_release: true,
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(result.success).toBe(false);
    expect(result.outcome).toBe('partial');
    expect(result.requestedFrames).toBe(24);
    expect(result.steppedFrames).toBe(17);
    expect(result.stoppedEarly).toBe(true);
    expect(result.failedFrame).toBe(18);
    expect(result.eventId).toBe('enemy-fire-3');
    expect(result.instructionId).toBe('action-1');
    expect(result.partialStateAvailable).toBe(true);
    expect(result.cleanup).toEqual(
      expect.objectContaining({ success: true, keysReleased: true })
    );
    expect(result.heldKeys).toEqual([]);
  });

  it('run_frames performs fallback key release when runtime cleanup is incomplete', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
        runFrames: {
          __fullMessage: {
            runFrames: {
              steppedFrames: 1,
              stoppedEarly: true,
              heldKeys: [32],
              cleanup: {
                attempted: true,
                success: false,
                keysReleased: false,
                error: 'Initial cleanup failed.',
              },
              error: 'Event failed.',
            },
            payload: {
              _paused: true,
              _sceneStack: { _stack: [] },
            },
          },
        },
        simulateInput: { applied: ['releaseAllKeys'], error: null },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          inputs: [{ type: 'keyPressed', key: 'Space' }],
          frames: 2,
          auto_release: true,
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(result.cleanup.success).toBe(true);
    expect(result.cleanup.keysReleased).toBe(true);
    expect(result.cleanup.fallback.applied).toEqual(['releaseAllKeys']);
    expect(result.heldKeys).toEqual([]);
  });

  it('run_frames expands clickAndHold and returns cursor world coordinates', async () => {
    let capturedRunFrames: any = null;
    const injectPreviewClickUserGesture: any = jest.fn(async () => ({
      success: true,
      attempted: true,
      supported: true,
      nativeClickInjected: true,
      audioContextState: 'running',
      audioUnlocked: true,
    }));
    const previewDebuggerServer = makeTargetedPreviewServer({
      responders: {
        getStatus: { isPaused: true, sceneName: 'Level1' },
        runFrames: message => {
          capturedRunFrames = message;
          return {
            __fullMessage: {
              runFrames: {
                applied: [
                  'mouseMove',
                  'mouseButtonPressed:0',
                  'mouseButtonReleased:0',
                ],
                steppedFrames: 3,
                stoppedEarly: false,
                deltaMs: 1000 / 60,
                heldKeys: [],
                recentlyPlayedSounds: [
                  {
                    soundName: 'sfx_place.wav',
                    isMusic: false,
                    channel: null,
                  },
                ],
                cursorWorldCoordinates: {
                  sceneName: 'Level1',
                  canvasX: 420,
                  canvasY: 180,
                  layers: [
                    {
                      layerName: 'HUD',
                      exists: true,
                      worldX: 300,
                      worldY: 100,
                    },
                  ],
                },
                error: null,
              },
              payload: {
                _paused: true,
                _sceneStack: { _stack: [] },
              },
            },
          };
        },
      },
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
      injectPreviewClickUserGesture,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          inputs: [{ type: 'clickAndHold', x: 420, y: 180, button: 'left' }],
          frames: 3,
          include_cursor_world_coordinates: true,
          cursor_layers: ['HUD'],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(capturedRunFrames.inputs).toEqual([
      { type: 'mouseMove', x: 420, y: 180 },
      { type: 'mouseButtonPressed', button: 0 },
    ]);
    expect(capturedRunFrames.postInputs).toEqual([
      { type: 'mouseButtonReleased', button: 0 },
    ]);
    expect(capturedRunFrames.includeCursorWorldCoordinates).toBe(true);
    expect(capturedRunFrames.cursorLayers).toEqual(['HUD']);
    expect(injectPreviewClickUserGesture).toHaveBeenCalledWith([
      { type: 'clickAndHold', x: 420, y: 180, button: 'left' },
    ]);
    expect(result.userGesture).toEqual(
      expect.objectContaining({
        nativeClickInjected: true,
        audioContextState: 'running',
        audioUnlocked: true,
      })
    );
    expect(result.recentSounds).toEqual([
      {
        soundName: 'sfx_place.wav',
        isMusic: false,
        channel: null,
      },
    ]);
    expect(result.cursorWorldCoordinates.layers[0]).toEqual(
      expect.objectContaining({ layerName: 'HUD', worldX: 300 })
    );
  });

  it('run_frames fails during readiness preflight when the connected preview is unresponsive', async () => {
    const sent: Array<Object> = [];
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-23'],
      responders: {},
    });
    const originalSendMessage = previewDebuggerServer.sendMessage;
    previewDebuggerServer.sendMessage = (id: string, message: any) => {
      sent.push({ id, message });
      originalSendMessage(id, message);
    };
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          debugger_id: 'preview-ws-23',
          frames: 1,
          timeout_ms: 250,
          instance_positions_for: ['GroundSlot'],
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(false);
    expect(result.ready).toBe(false);
    expect(result.failurePhase).toBe('runtime-ready');
    expect(result.previewHealth).toBe('connected-unresponsive');
    expect(sent.some(entry => entry.message.command === 'getStatus')).toBe(
      true
    );
    expect(sent.some(entry => entry.message.command === 'runFrames')).toBe(
      false
    );
  });

  it('run_frames stops readiness polling when the targeted preview disconnects', async () => {
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-23'],
      closeOnSendCommands: ['getStatus'],
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'run_frames',
        arguments: {
          debugger_id: 'preview-ws-23',
          frames: 1,
          timeout_ms: 1000,
        },
      },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(false);
    expect(result.ready).toBe(false);
    expect(result.running).toBe(false);
    expect(result.previewHealth).toBe('not-running');
    expect(result.error).toContain('closed before replying');
    expect(result.diagnostics.classification).toBe('no-running-preview');
  });

  it('steps frames and sets runtime state via control tools', async () => {
    const sent: Array<any> = [];
    let callbacks: any = null;
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => ['preview-ws-0'],
      getExistingDebuggerIds: () => ['preview-ws-0'],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        sent.push(message);
        // Reply (with matching messageId) to request/response commands.
        let payload = null;
        if (message.command === 'stepFrames') {
          payload = { steppedFrames: message.count, deltaMs: 16, paused: true };
        } else if (message.command === 'setRuntimeState') {
          payload = { applied: ['setVariable:scene.GameOver'], error: null };
        } else if (message.command === 'pause') {
          payload = { isPaused: true, sceneName: 'Level1' };
        }
        if (payload && message.messageId && callbacks) {
          setTimeout(
            () =>
              callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: {
                  command: `${message.command}-reply`,
                  messageId: message.messageId,
                  payload,
                },
              }),
            2
          );
        }
      },
    };
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });

    const stepResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'control_preview',
        arguments: { action: 'step', frames: 30 },
      },
    });
    const stepResult = JSON.parse(stepResponse.content[0].text);
    expect(stepResult.success).toBe(true);
    expect(stepResult.steppedFrames).toBe(30);
    const stepFramesMessage: any = sent.find(m => m.command === 'stepFrames');
    expect(stepFramesMessage.count).toBe(30);

    const pauseResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'control_preview', arguments: { action: 'pause' } },
    });
    const pauseResult = JSON.parse(pauseResponse.content[0].text);
    expect(pauseResult.success).toBe(true);
    expect(pauseResult.confirmed).toBe(true);
    expect(pauseResult.isPaused).toBe(true);
    const pauseMessage: any = sent.find(m => m.command === 'pause');
    expect(pauseMessage.skipDump).toBe(true);

    const stateResponse = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'set_runtime_state',
        arguments: {
          operations: [
            { type: 'setVariable', scope: 'scene', name: 'GameOver', value: 0 },
          ],
        },
      },
    });
    const stateResult = JSON.parse(stateResponse.content[0].text);
    expect(stateResult.success).toBe(true);
    expect(stateResult.applied).toContain('setVariable:scene.GameOver');
  });

  it('closes all previews via control_preview close', async () => {
    const closeAllPreviews: any = jest.fn();
    const previewDebuggerServer = makeTargetedPreviewServer({
      debuggerIds: ['preview-ws-0'],
      responders: {},
    });
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
      closeAllPreviews,
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'control_preview', arguments: { action: 'close' } },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.success).toBe(true);
    expect(result.closedAll).toBe(true);
    expect(result.closedDebuggerConnections).toBe(true);
    expect(result.remainingDebuggerIds).toEqual([]);
    expect(closeAllPreviews).toHaveBeenCalled();
  });

  it('reports recent sounds from the preview status', async () => {
    const dumpPayload = { _paused: false, _sceneStack: { _stack: [] } };
    let callbacks: any = null;
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => ['preview-ws-0'],
      getExistingDebuggerIds: () => ['preview-ws-0'],
      registerCallbacks: (registered: any) => {
        callbacks = registered;
        return () => {
          callbacks = null;
        };
      },
      sendMessage: (id: string, message: any) => {
        if (!callbacks) return;
        if (message.command === 'getStatus') {
          setTimeout(
            () =>
              callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: {
                  command: 'status',
                  payload: {
                    isPaused: false,
                    recentlyPlayedSounds: [
                      { soundName: 'Shoot', isMusic: false, channel: null },
                    ],
                  },
                },
              }),
            2
          );
        } else if (message.command === 'refresh') {
          setTimeout(
            () =>
              callbacks &&
              callbacks.onHandleParsedMessage({
                id,
                parsedMessage: { command: 'dump', payload: dumpPayload },
              }),
            4
          );
        }
      },
    };
    const bridge = makeBridge({
      getPreviewDebuggerServer: () => previewDebuggerServer,
    });
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_inspect_running_preview',
        arguments: { timeout_ms: 1000 },
      },
    });
    const result = JSON.parse(response.content[0].text);
    expect(result.recentSounds).toEqual([
      { soundName: 'Shoot', isMusic: false, channel: null },
    ]);
  });
});
