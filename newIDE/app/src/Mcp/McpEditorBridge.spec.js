// @flow
import { createMcpEditorBridge } from './McpEditorBridge';
import { autoQuoteEventParameters } from './McpEventKnowledge';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { decomposeLegacyProjectToFiles } from '../ProjectsStorage/MultiFileProjectFormat';
import { writeMultiFileSourceTree } from '../ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject';
import { getBehaviorsRegistry } from '../Utils/GDevelopServices/Extension';

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

  const waitForDeferredNotifications = () =>
    new Promise(resolve => setTimeout(resolve, 0));

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
    expect(response.tools.map(tool => tool.name)).not.toContain('create_scene');
  });

  it('generates and verifies all three catalogs before returning', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-generate-catalogs-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.settings');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Catalog generation test');
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(serializeToJSObject(project));
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
    };
    Object.keys(catalogFiles).forEach(key => {
      fs.writeFileSync(catalogFiles[key], '{ stale catalog', 'utf8');
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
    Object.keys(catalogFiles).forEach(key => {
      expect(() =>
        JSON.parse(fs.readFileSync(catalogFiles[key], 'utf8'))
      ).not.toThrow();
    });
    expect(result.generatedGameJson).toBeUndefined();
    expect(result.nextAction).toContain('Read the refreshed catalogs');
  });

  it('validates multi-file disk sources without reloading the editor', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-validate-project-files-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.settings');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Disk validation test');
    project.setProjectFile(projectFile);
    project.insertNewLayout('Scene', 0);
    const files = decomposeLegacyProjectToFiles(serializeToJSObject(project));
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
    expect(result.nextAction).toContain('reload_project');
  });

  it('reports the source file and location for invalid project files', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-invalid-project-files-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.settings');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(projectFile);
    const files = decomposeLegacyProjectToFiles(serializeToJSObject(project));
    files['game://project.settings'] += '\ninvalid = [\n';
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
        fileUri: 'game://project.settings',
        filePath: projectFile,
      }),
    ]);
  });

  it('reloads project files from disk and returns a synchronization receipt', async () => {
    let currentProject: any = {
      getName: () => 'Before reload',
      getProjectFile: () => 'C:\\game\\project.settings',
    };
    const reloadProjectAndWait: any = (jest.fn(async () => {
      currentProject = {
        getName: () => 'After reload',
        getProjectFile: () => 'C:\\game\\project.settings',
      };
      return {
        reloaded: true,
        fileIdentifier: 'C:\\game\\project.settings',
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
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: { name: 'reload_project', arguments: {} },
    });
    const result = JSON.parse(response.content[0].text);

    expect(response.isError).not.toBe(true);
    expect(reloadProjectAndWait).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        reloaded: true,
        discardedUnsavedInMemoryChanges: true,
        projectName: 'After reload',
        projectFile: 'C:\\game\\project.settings',
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
  });

  it('imports an extension through the native host and returns generated multi-file sources', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-extension-import-')
    );
    const projectFile = path.join(temporaryDirectory, 'project.settings');
    const project = new gd.Project();
    project.setProjectFile(projectFile);
    const ensureExtensionInstalled = jest.fn(async options => {
      const extension = project.insertNewEventsFunctionsExtension(
        options.extensionName,
        0
      );
      extension.getEventsFunctions().insertNewEventsFunction('FormatRating', 0);
      options.onExtensionInstalled([options.extensionName]);
    });
    const saveProjectAndWait = jest.fn(async () => {
      await writeMultiFileSourceTree({
        entryPath: projectFile,
        files: decomposeLegacyProjectToFiles(serializeToJSObject(project)),
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

  it('does not report an extension import as successful without disk persistence', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-mcp-extension-unsaved-')
    );
    const project = new gd.Project();
    project.setProjectFile(path.join(temporaryDirectory, 'project.settings'));
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
      'save_and_relaunch_preview_paused { timeout_ms: 10000 }'
    );
  });

  it('rejects CLOSE_PREVIEW as a command and points to preview relaunch cleanup', async () => {
    const runCommand = jest.fn();
    const bridge = makeBridge({
      getPermissions: () => ({
        allowWriteTools: false,
        allowCommandTools: true,
      }),
      runCommand,
    });

    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'gdevelop_run_command',
        arguments: { commandName: 'CLOSE_PREVIEW' },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain(
      'CLOSE_PREVIEW is not a GDevelop command'
    );
    expect(response.content[0].text).toContain(
      'save_and_relaunch_preview_paused'
    );
    expect(runCommand).not.toHaveBeenCalled();
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

  it('reads and edits global config through focused MCP tools', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const triggerUnsavedChanges = jest.fn();

    try {
      const projectWithGlobalConfig: any = project;
      projectWithGlobalConfig.setGlobalConfigJson(
        JSON.stringify({
          cards: {
            PeaShooter: { name: 'PeaShooter', price: 100 },
          },
        })
      );

      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
      });

      const summaryResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_project_summary',
          arguments: {},
        },
      });
      const summary = JSON.parse(summaryResponse.content[0].text);
      expect(summary.globalConfigSummary.topLevelKeys).toContain('cards');
      expect(summary.globalConfigSummary.placeholderExamples).toContain(
        '{{cards.PeaShooter.price}}'
      );

      const readValueResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_global_config',
          arguments: {
            placeholder_path: '{{cards.PeaShooter.price}}',
          },
        },
      });
      const readValue = JSON.parse(readValueResponse.content[0].text);
      expect(readValue.exists).toBe(true);
      expect(readValue.value).toBe(100);

      const resourceResponse = await bridge.handleRendererMcpRequest({
        method: 'resources/read',
        params: {
          uri: 'gdevelop://project/global-config.json',
        },
      });
      expect(
        JSON.parse(resourceResponse.contents[0].text).cards.PeaShooter.price
      ).toBe(100);

      const replaceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_set_global_config',
          arguments: {
            global_config: {
              cards: {
                Sunflower: { name: 'Sunflower', price: 50 },
              },
            },
          },
        },
      });
      const replaceResult = JSON.parse(replaceResponse.content[0].text);
      expect(replaceResult.success).toBe(true);

      const setValueResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_set_global_config_value',
          arguments: {
            placeholder_path: '{{cards.Sunflower.canUse}}',
            value: true,
          },
        },
      });
      const setValueResult = JSON.parse(setValueResponse.content[0].text);
      expect(setValueResult.previousExists).toBe(false);
      expect(setValueResult.value).toBe(true);

      const setObjectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_set_global_config_value',
          arguments: {
            placeholder_path: '{{cards.WallNut}}',
            value_json: '{"name":"WallNut","price":50}',
          },
        },
      });
      const setObjectResult = JSON.parse(setObjectResponse.content[0].text);
      expect(setObjectResult.value.name).toBe('WallNut');

      const deleteResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_delete_global_config_value',
          arguments: {
            placeholder_path: '{{cards.Sunflower.canUse}}',
          },
        },
      });
      const deleteResult = JSON.parse(deleteResponse.content[0].text);
      expect(deleteResult.deleted).toBe(true);

      const finalConfig = JSON.parse(
        projectWithGlobalConfig.getGlobalConfigJson()
      );
      expect(finalConfig.cards.Sunflower.price).toBe(50);
      expect(finalConfig.cards.Sunflower.canUse).toBeUndefined();
      expect(finalConfig.cards.WallNut.name).toBe('WallNut');
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(4);

      const invalidPathResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_set_global_config_value',
          arguments: {
            placeholder_path: 'cards.Sunflower.price',
            value: 75,
          },
        },
      });
      expect(invalidPathResponse.isError).toBe(true);
      expect(invalidPathResponse.content[0].text).toContain(
        'placeholder syntax'
      );
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
      const localVariableExample = examples.examples.find(
        example => example.name === 'Standard event with a local variable'
      );
      if (!localVariableExample)
        throw new Error('Missing local variable example');
      expect(localVariableExample.events_json).toContain('"variables"');
      expect(localVariableExample.events_json).toContain('DamageThisTick');
      expect(examples.variableExpressionSyntax.localVariable).toContain(
        'event-local variables'
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
    layout
      .getObjects()
      .insertNewObject(project, 'TextObject::Text', 'StatusLabel', 1);

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
            include_rendered_events: true,
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
      const invalidColorIssue = invalidColorValidation.issues.find(
        issue =>
          issue.type === 'invalid-parameter' &&
          issue.parameterValue === '220;30;55'
      );
      if (!invalidColorIssue) {
        throw new Error('Expected an invalid color parameter issue.');
      }
      expect(invalidColorIssue.suggestion).toContain('"220;30;55"');
      expect(invalidColorValidation.issueSummary.byType).toEqual(
        expect.objectContaining({
          'invalid-parameter': expect.any(Number),
        })
      );
      const invalidColorRootCause = invalidColorValidation.issueSummary.rootCauses.find(
        rootCause =>
          rootCause.suggestion && rootCause.suggestion.includes('"220;30;55"')
      );
      expect(invalidColorRootCause).toBeTruthy();
      expect(layout.getEvents().getEventsCount()).toBe(0);

      const invalidTextResponse = await bridge.handleRendererMcpRequest({
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
                    type: { value: 'TextObject::String' },
                    parameters: ['StatusLabel', '=', 'Game Over\nPress Space'],
                  },
                ],
              },
            ]),
          },
        },
      });
      const invalidTextValidation = JSON.parse(
        invalidTextResponse.content[0].text
      );
      expect(invalidTextValidation.valid).toBe(false);
      const invalidTextIssue = invalidTextValidation.issues.find(
        issue => issue.suggestion && issue.suggestion.includes('NewLine()')
      );
      expect(invalidTextIssue).toBeTruthy();

      layout.getObjects().insertNewObject(project, 'Sprite', 'GroundSlot', 2);
      layout
        .getObjects()
        .getObject('GroundSlot')
        .getVariables()
        .insertNew('Occupied', 0)
        .setBool(false);
      const legacyObjectVariableResponse = await bridge.handleRendererMcpRequest(
        {
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
                      type: { value: 'ObjectVariableAsBoolean' },
                      parameters: ['GroundSlot', 'Occupied', 'false'],
                    },
                  ],
                  actions: [],
                },
              ]),
            },
          },
        }
      );
      const legacyObjectVariableValidation = JSON.parse(
        legacyObjectVariableResponse.content[0].text
      );
      expect(legacyObjectVariableValidation.valid).toBe(false);
      expect(legacyObjectVariableValidation.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'legacy-function-only-instruction-in-scene-events',
            instructionType: 'ObjectVariableAsBoolean',
            replacementType: 'BooleanObjectVariable',
          }),
        ])
      );
      expect(
        legacyObjectVariableValidation.issues.find(
          issue =>
            issue.type === 'legacy-function-only-instruction-in-scene-events'
        ).suggestion
      ).toContain('BooleanObjectVariable');
    } finally {
      project.delete();
    }
  });

  it('flags Or/And children placed under the wrong key (would be silently dropped)', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({ getProject: () => project });

      // WRONG: Or children under "conditions" instead of "subInstructions".
      const wrong = await bridge.handleRendererMcpRequest({
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
                    type: { value: 'BuiltinCommonInstructions::Or' },
                    parameters: [],
                    conditions: [
                      {
                        type: { value: 'KeyPressed' },
                        parameters: ['', 'Left'],
                      },
                      { type: { value: 'KeyPressed' }, parameters: ['', 'q'] },
                    ],
                  },
                ],
                actions: [],
              },
            ]),
          },
        },
      });
      const wrongResult = JSON.parse(wrong.content[0].text);
      expect(wrongResult.valid).toBe(false);
      expect(wrongResult.issues.map(i => i.type)).toContain(
        'empty-or-misplaced-sub-instructions'
      );
      expect(
        wrongResult.issues.find(
          i => i.type === 'empty-or-misplaced-sub-instructions'
        ).suggestion
      ).toMatch(/subInstructions/);

      // CORRECT: children under "subInstructions" → no such error.
      const right = await bridge.handleRendererMcpRequest({
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
                    type: { value: 'BuiltinCommonInstructions::Or' },
                    parameters: [],
                    subInstructions: [
                      {
                        type: { value: 'KeyPressed' },
                        parameters: ['', 'Left'],
                      },
                      { type: { value: 'KeyPressed' }, parameters: ['', 'q'] },
                    ],
                  },
                ],
                actions: [],
              },
            ]),
          },
        },
      });
      const rightResult = JSON.parse(right.content[0].text);
      expect(rightResult.issues.map(i => i.type)).not.toContain(
        'empty-or-misplaced-sub-instructions'
      );
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

  it('lints Group colors: default color and duplicate colors are flagged', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const events = layout.getEvents();
    // Group 0: left at the default color (74;176;228) → should be flagged.
    events.insertNewEvent(project, 'BuiltinCommonInstructions::Group', 0);
    // Group 1 & 2: same explicit color → duplicate-color should be flagged.
    const g1 = gd.asGroupEvent(
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Group', 1)
    );
    g1.setName('Player input');
    g1.setBackgroundColor(10, 20, 30);
    const g2 = gd.asGroupEvent(
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Group', 2)
    );
    g2.setName('Enemy behavior');
    g2.setBackgroundColor(10, 20, 30);

    try {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: { scene_name: 'Level1' },
        },
      });
      const lint = JSON.parse(response.content[0].text);
      const types = lint.issues.map(issue => issue.type);
      expect(types).toEqual(
        expect.arrayContaining(['group-default-color', 'group-duplicate-color'])
      );
      const duplicate = lint.issues.find(
        issue => issue.type === 'group-duplicate-color'
      );
      expect(duplicate.color).toBe('10;20;30');
      expect(duplicate.groups).toHaveLength(2);
    } finally {
      project.delete();
    }
  });

  it('lints Group colors: distinct explicit colors produce no color issues', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const events = layout.getEvents();
    const g1 = gd.asGroupEvent(
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Group', 0)
    );
    g1.setName('Player input');
    g1.setBackgroundColor(10, 20, 30);
    const g2 = gd.asGroupEvent(
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Group', 1)
    );
    g2.setName('UI');
    g2.setBackgroundColor(200, 100, 50);

    try {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: { scene_name: 'Level1' },
        },
      });
      const lint = JSON.parse(response.content[0].text);
      const types = lint.issues.map(issue => issue.type);
      expect(types).not.toContain('group-default-color');
      expect(types).not.toContain('group-duplicate-color');
    } finally {
      project.delete();
    }
  });

  it('inherits parent For Each scope and downgrades collision Create advice', async () => {
    const makeInstruction = (type, parameters) => {
      const instruction = new gd.Instruction();
      instruction.setType(type);
      instruction.setParametersCount(parameters.length);
      parameters.forEach((parameter, index) =>
        instruction.setParameter(index, parameter)
      );
      return instruction;
    };
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    ['Enemy', 'Player', 'Impact'].forEach((name, index) =>
      layout.getObjects().insertNewObject(project, 'Sprite', name, index)
    );
    const forEach = gd.asForEachEvent(
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::ForEach', 0)
    );
    forEach.setObjectToPick('Enemy');
    const scopedChild = gd.asStandardEvent(
      forEach
        .getSubEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    const enemyCondition = makeInstruction('PosX', ['Enemy', '>', '0']);
    scopedChild.getConditions().insert(enemyCondition, 0);
    enemyCondition.delete();
    const scopedCreate = makeInstruction('Create', [
      '',
      'Impact',
      'Enemy.X()',
      'Enemy.Y()',
      '""',
    ]);
    scopedChild.getActions().insert(scopedCreate, 0);
    scopedCreate.delete();

    const collisionEvent = gd.asStandardEvent(
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 1)
    );
    const collision = makeInstruction('CollisionNP', [
      'Enemy',
      'Player',
      '',
      '',
      'no',
    ]);
    collisionEvent.getConditions().insert(collision, 0);
    collision.delete();
    const collisionCreate = makeInstruction('Create', [
      '',
      'Impact',
      'Enemy.X()',
      'Enemy.Y()',
      '""',
    ]);
    collisionEvent.getActions().insert(collisionCreate, 0);
    collisionCreate.delete();

    try {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: {
            scene_name: 'Level1',
            require_root_groups: false,
          },
        },
      });
      const lint = JSON.parse(response.content[0].text);
      const createIssues = lint.issues.filter(
        issue => issue.type === 'create-without-for-each'
      );

      expect(createIssues.some(issue => issue.eventPath === 'event-0.0')).toBe(
        false
      );
      const collisionIssue = createIssues.find(
        issue => issue.eventPath === 'event-1'
      );
      expect(collisionIssue).toBeDefined();
      expect(collisionIssue.severity).toBe('info');
      expect(collisionIssue.suggestion).toContain('disabled_rules');
    } finally {
      project.delete();
    }
  });

  it('lints timers: CompareTimer with no ResetTimer is flagged; with one is clean', async () => {
    const buildSceneWithTimer = ({ withReset }: { withReset: boolean }) => {
      // $FlowFixMe[invalid-constructor]
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Level1', 0);
      const events = layout.getEvents();
      const standard = gd.asStandardEvent(
        events.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
      );
      // Condition: CompareTimer "Spawn" > 2 (param 1 = timer name).
      const condition = new gd.Instruction();
      condition.setType('CompareTimer');
      condition.setParametersCount(4);
      condition.setParameter(0, '');
      condition.setParameter(1, '"Spawn"');
      condition.setParameter(2, '>');
      condition.setParameter(3, '2');
      standard.getConditions().insert(condition, 0);
      condition.delete();
      if (withReset) {
        // Action: ResetTimer "Spawn" (param 1 = timer name).
        const action = new gd.Instruction();
        action.setType('ResetTimer');
        action.setParametersCount(2);
        action.setParameter(0, '');
        action.setParameter(1, '"Spawn"');
        standard.getActions().insert(action, 0);
        action.delete();
      }
      return project;
    };

    const lint = async (project: gdProject) => {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: { scene_name: 'Level1' },
        },
      });
      return JSON.parse(response.content[0].text);
    };

    const withoutReset = buildSceneWithTimer({ withReset: false });
    try {
      const result = await lint(withoutReset);
      const timerIssue = result.issues.find(
        issue => issue.type === 'timer-compared-but-never-started'
      );
      expect(timerIssue).toBeDefined();
      expect(timerIssue.timerName).toBe('Spawn');
    } finally {
      withoutReset.delete();
    }

    const withReset = buildSceneWithTimer({ withReset: true });
    try {
      const result = await lint(withReset);
      expect(result.issues.map(issue => issue.type)).not.toContain(
        'timer-compared-but-never-started'
      );
    } finally {
      withReset.delete();
    }
  });

  it('warns when an object-variable instruction operates on an object group', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Enemy1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Enemy2', 1);
    // Define a group "Enemies" containing both.
    const groups = layout.getObjects().getObjectGroups();
    const group = groups.insertNew('Enemies', 0);
    group.addObject('Enemy1');
    group.addObject('Enemy2');
    // An action that changes an object variable on the GROUP.
    const standard = gd.asStandardEvent(
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    const action = new gd.Instruction();
    action.setType('ModVarObjet');
    action.setParametersCount(4);
    action.setParameter(0, 'Enemies');
    action.setParameter(1, 'hp');
    action.setParameter(2, '-');
    action.setParameter(3, '1');
    standard.getActions().insert(action, 0);
    action.delete();

    try {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: { scene_name: 'Level1' },
        },
      });
      const lint = JSON.parse(response.content[0].text);
      const issue = lint.issues.find(
        i => i.type === 'group-objectvar-or-collision'
      );
      expect(issue).toBeDefined();
      expect(issue.groupName).toBe('Enemies');
    } finally {
      project.delete();
    }
  });

  it('create_group auto-assigns a distinct non-default color when none is given', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({ getProject: () => project });
      const make = (name: string) =>
        bridge.handleRendererMcpRequest({
          method: 'tools/call',
          params: {
            name: 'create_group',
            arguments: { scene_name: 'Level1', group_name: name },
          },
        });
      await make('Initialization');
      await make('Player input');

      // Both groups should now have NON-default, DISTINCT colors — so a
      // follow-up lint reports neither default-color nor duplicate-color.
      const lintResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_scene_events',
          arguments: { scene_name: 'Level1' },
        },
      });
      const lint = JSON.parse(lintResponse.content[0].text);
      const types = lint.issues.map(issue => issue.type);
      expect(types).not.toContain('group-default-color');
      expect(types).not.toContain('group-duplicate-color');
    } finally {
      project.delete();
    }
  });

  it('defers and coalesces scene event editor notifications from concurrent MCP writes', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
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
      const createGroup = (groupName: string, eventId: string) =>
        bridge.handleRendererMcpRequest({
          method: 'tools/call',
          params: {
            name: 'create_group',
            arguments: {
              scene_name: 'Level1',
              group_name: groupName,
              ai_generated_event_id: eventId,
            },
          },
        });

      await Promise.all([
        createGroup('Initialization', 'initialization'),
        createGroup('Player input', 'player-input'),
      ]);

      expect(onSceneEventsModifiedOutsideEditor).not.toHaveBeenCalled();
      await waitForDeferredNotifications();
      expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledTimes(1);
      expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: project.getLayout('Level1'),
        newOrChangedAiGeneratedEventIds: new Set(),
      });
      expect(
        project
          .getLayout('Level1')
          .getEvents()
          .getEventsCount()
      ).toBe(2);
    } finally {
      project.delete();
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

  it('applies validated project JSON patches only after dry-run validation', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.setName('Before Patch');
    project.insertNewLayout('Level1', 0);
    const triggerUnsavedChanges: any = jest.fn();
    const onSceneEventsModifiedOutsideEditor: any = jest.fn();
    const onObjectsModifiedOutsideEditor: any = jest.fn();
    const onInstancesModifiedOutsideEditor: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
        onSceneEventsModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
      });

      const dryRunResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_project_json_patch',
          arguments: {
            dry_run: true,
            summary_only: true,
            patch: [
              {
                op: 'replace',
                path: '/properties/name',
                value: 'Dry Run Name',
              },
            ],
          },
        },
      });
      const dryRun = JSON.parse(dryRunResponse.content[0].text);

      expect(dryRunResponse.isError).not.toBe(true);
      expect(dryRun.success).toBe(true);
      expect(dryRun.dryRun).toBe(true);
      expect(project.getName()).toBe('Before Patch');
      expect(triggerUnsavedChanges).not.toHaveBeenCalled();
      expect(onObjectsModifiedOutsideEditor).not.toHaveBeenCalled();

      const applyResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_project_json_patch',
          arguments: {
            summary_only: true,
            snapshot_label: 'before-name-patch',
            patch: [
              {
                op: 'replace',
                path: '/properties/name',
                value: 'After Patch',
              },
            ],
          },
        },
      });
      const applyResult = JSON.parse(applyResponse.content[0].text);

      expect(applyResponse.isError).not.toBe(true);
      expect(applyResult.success).toBe(true);
      expect(applyResult.dryRun).toBe(false);
      expect(applyResult.snapshot.snapshotId).toEqual(expect.any(String));
      expect(applyResult.staleStateAdvisory.previewMayBeStale).toBe(false);
      expect(project.getName()).toBe('After Patch');
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
      await waitForDeferredNotifications();
      expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalled();
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalled();
      expect(onInstancesModifiedOutsideEditor).toHaveBeenCalled();
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

      const scopedMetadataResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_instruction_metadata',
          arguments: {
            kind: 'condition',
            type: 'BooleanObjectVariable',
            target_scope: 'object_function',
            compact: true,
          },
        },
      });
      const scopedMetadata = JSON.parse(scopedMetadataResponse.content[0].text);

      expect(scopedMetadata.eventScopes.scene.label).toContain('Scene');
      expect(scopedMetadata.eventScopes.objectFunction.label).toContain(
        'object function'
      );
      expect(scopedMetadata.targetScopeCompatibility).toEqual(
        expect.objectContaining({
          targetScope: 'object_function',
          valid: expect.any(Boolean),
        })
      );
    } finally {
      project.delete();
    }
  });

  it('hides deprecated instruction aliases and rejects creating them', async () => {
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
            query: 'Hide',
            kind: 'action',
            limit: 10,
          },
        },
      });
      const search = JSON.parse(searchResponse.content[0].text);
      const resultTypes = search.results.map(result => result.type);
      expect(resultTypes).toContain('Hide');
      expect(resultTypes).not.toContain('Cache');

      const metadataResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_instruction_metadata',
          arguments: {
            kind: 'action',
            type: 'Cache',
          },
        },
      });
      const metadata = JSON.parse(metadataResponse.content[0].text);
      expect(metadata.deprecated).toBe(true);
      expect(metadata.error).toContain('Cache');
      expect(metadata.suggestion).toContain('Hide');
      expect(metadata.replacementTypes).toContain('Hide');

      const actionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_action',
          arguments: {
            type: 'Cache',
            parameters: { '0': 'Player' },
          },
        },
      });
      expect(actionResponse.isError).toBe(true);
      expect(actionResponse.content[0].text).toContain('Cache');
      expect(actionResponse.content[0].text).toContain('Hide');

      const conditionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_condition',
          arguments: {
            type: 'DepartScene',
            parameters: {},
          },
        },
      });
      expect(conditionResponse.isError).toBe(true);
      expect(conditionResponse.content[0].text).toContain('DepartScene');
      expect(conditionResponse.content[0].text).toContain('SceneJustBegins');
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
            sentence: 'Set _PARAM2_ power of _PARAM0_',
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

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'OtherPower',
            parent_kind: 'behavior',
            parent_name: 'PowerBehavior',
            function_type: 'action',
            sentence: 'Other power action for _PARAM0_',
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
            summary_only: true,
          },
        },
      });
      const filteredBehaviorResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_inspect_extension_behavior',
          arguments: {
            extension_name: 'McpExt',
            behavior_name: 'PowerBehavior',
            function_name: 'SetPower',
          },
        },
      });
      const filteredBehavior = JSON.parse(
        filteredBehaviorResponse.content[0].text
      );
      expect(filteredBehavior.behavior.functions.map(fn => fn.name)).toEqual([
        'SetPower',
      ]);
      expect(filteredBehavior.behavior.serializedBehavior).toBeUndefined();

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

  it('supports compact extension inspect and dry-run extension object writes', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    const liveObjectBeforeDryRun = extension
      .getEventsBasedObjects()
      .insertNew('AlreadyOpenPrefab', 0);
    liveObjectBeforeDryRun.setAreaMinX(0);
    liveObjectBeforeDryRun.setAreaMinY(0);
    liveObjectBeforeDryRun.setAreaMaxX(32);
    liveObjectBeforeDryRun.setAreaMaxY(16);
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

      const dryRunResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'DryPrefab',
            full_name: 'Dry prefab',
            dry_run: true,
            summary_only: true,
            serialized_object: {
              name: 'DryPrefab',
              defaultName: 'DryPrefab',
              areaMinX: 0,
              areaMinY: 0,
              areaMaxX: 64,
              areaMaxY: 16,
              objects: [],
              instances: [],
              eventsFunctions: [],
              propertyDescriptors: [],
              variants: [],
            },
          },
        },
      });
      const dryRunResult = JSON.parse(dryRunResponse.content[0].text);

      expect(dryRunResponse.isError).not.toBe(true);
      expect(dryRunResult.dryRun).toBe(true);
      expect(
        project
          .getEventsFunctionsExtension('McpExt')
          .getEventsBasedObjects()
          .has('DryPrefab')
      ).toBe(false);
      expect(
        project.hasEventsFunctionsExtensionNamed('__McpValidation_McpExt')
      ).toBe(false);
      expect(liveObjectBeforeDryRun.getName()).toBe('AlreadyOpenPrefab');
      expect(
        liveObjectBeforeDryRun.getVariants().hasVariantNamed('MissingVariant')
      ).toBe(false);
      expect(triggerUnsavedChanges).not.toHaveBeenCalled();

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'RealPrefab',
            full_name: 'Real prefab',
            summary_only: true,
            area: { min_x: 0, min_y: 0, max_x: 32, max_y: 12 },
          },
        },
      });

      const inspectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_inspect_extension',
          arguments: {
            extension_name: 'McpExt',
            summary_only: true,
          },
        },
      });
      const inspected = JSON.parse(inspectResponse.content[0].text);

      expect(inspected.mode).toBe('summary_only');
      expect(inspected.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'AlreadyOpenPrefab',
            childObjectsCount: 0,
          }),
          expect.objectContaining({
            name: 'RealPrefab',
            childObjectsCount: 0,
          }),
        ])
      );
      expect(inspected.serializedExtension).toBeUndefined();
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
    } finally {
      project.delete();
    }
  });

  it('finds matching events in extension functions and across the project', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
      .setAiGeneratedEventId('scene-event');
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    const eventsFunction = extension
      .getEventsFunctions()
      .insertNewEventsFunction('UpdateHealthBar', 0);
    eventsFunction.setFunctionType(gd.EventsFunction.Action);
    const standard = gd.asStandardEvent(
      eventsFunction
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    const action = new gd.Instruction();
    action.setType('SetNumberVariable');
    action.setParametersCount(3);
    action.setParameter(0, 'HealthBarValue');
    action.setParameter(1, '=');
    action.setParameter(2, '100');
    standard.getActions().insert(action, 0);
    action.delete();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const extensionSearchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'find_extension_events',
          arguments: {
            extension_name: 'McpExt',
            parameter_contains: 'HealthBarValue',
            summary_only: true,
          },
        },
      });
      const extensionSearch = JSON.parse(
        extensionSearchResponse.content[0].text
      );
      expect(extensionSearch.count).toBe(1);
      expect(extensionSearch.matches[0]).toEqual(
        expect.objectContaining({
          extensionName: 'McpExt',
          parentKind: 'extension',
          functionName: 'UpdateHealthBar',
        })
      );
      expect(extensionSearch.matches[0].serializedEvent).toBeUndefined();

      const projectSearchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'find_project_events',
          arguments: {
            text_contains: 'HealthBarValue',
            summary_only: true,
          },
        },
      });
      const projectSearch = JSON.parse(projectSearchResponse.content[0].text);
      expect(projectSearch.count).toBe(1);
      expect(projectSearch.matches[0].scope).toBe('extension');
    } finally {
      project.delete();
    }
  });

  it('lints and rejects extension function variable-parameter misuse', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    const badFunction = extension
      .getEventsFunctions()
      .insertNewEventsFunction('BadAddSun', 0);
    badFunction.setFunctionType(gd.EventsFunction.Action);
    badFunction.setSentence('Add sun to _PARAM1_');
    badFunction
      .getParameters()
      .insertNewParameter('SunCountVariable', 0)
      .setType('variable');
    const badEvent = gd.asStandardEvent(
      badFunction
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    const badCondition = new gd.Instruction();
    badCondition.setType('NumberVariable');
    badCondition.setParametersCount(3);
    badCondition.setParameter(0, 'SunCountVariable');
    badCondition.setParameter(1, '>');
    badCondition.setParameter(2, '0');
    badEvent.getConditions().insert(badCondition, 0);
    badCondition.delete();
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

      const lintResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_extension_function_events',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'BadAddSun',
          },
        },
      });
      const lintResult = JSON.parse(lintResponse.content[0].text);

      expect(lintResponse.isError).not.toBe(true);
      expect(lintResult.valid).toBe(false);
      expect(lintResult.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'function-variable-parameter-used-as-direct-variable',
            parameterName: 'SunCountVariable',
          }),
        ])
      );
      expect(lintResult.variableParameterUsageHint).toContain(
        'CopyArgumentToVariable2'
      );

      const dryRunResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'BadAddSunDryRun',
            function_type: 'action',
            sentence: 'Add sun to _PARAM1_',
            parameters: [
              {
                name: 'SunCountVariable',
                type: 'variable',
              },
            ],
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                aiGeneratedEventId: 'bad-add-sun',
                conditions: [
                  {
                    type: { value: 'NumberVariable' },
                    parameters: ['SunCountVariable', '>', '0'],
                  },
                ],
                actions: [],
              },
            ],
            dry_run: true,
            summary_only: true,
          },
        },
      });

      expect(dryRunResponse.isError).toBe(true);
      expect(dryRunResponse.content[0].text).toContain(
        'function-variable-parameter-used-as-direct-variable'
      );
      expect(dryRunResponse.content[0].text).toContain(
        'CopyArgumentToVariable2'
      );
      expect(
        extension.getEventsFunctions().hasEventsFunctionNamed('BadAddSunDryRun')
      ).toBe(false);
      expect(triggerUnsavedChanges).not.toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('validates extension events JSON without using the write tool', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: false,
          allowCommandTools: false,
        }),
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_validate_extension_events_json',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'BadAddSun',
            function_type: 'action',
            sentence: 'Add sun to _PARAM1_',
            parameters: [
              {
                name: 'SunCountVariable',
                type: 'variable',
              },
            ],
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'NumberVariable' },
                    parameters: ['SunCountVariable', '>', '0'],
                  },
                ],
                actions: [],
              },
            ],
            summary_only: true,
          },
        },
      });
      const validation = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain(
        'function-variable-parameter-used-as-direct-variable'
      );
      expect(
        extension.getEventsFunctions().hasEventsFunctionNamed('BadAddSun')
      ).toBe(false);
      expect(
        project.hasEventsFunctionsExtensionNamed('__McpValidation_McpExt')
      ).toBe(false);
    } finally {
      project.delete();
    }
  });

  it('warns when an object function creates an external object parameter', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('McpExt', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PlantCard',
            full_name: 'Plant card',
            summary_only: true,
          },
        },
      });
      const createFunctionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            parent_kind: 'object',
            parent_name: 'PlantCard',
            function_name: 'PlacePlant',
            function_type: 'action',
            sentence: 'Place _PARAM1_ from _PARAM0_',
            parameters: [{ name: 'Sunflower', type: 'object' }],
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'Create' },
                    parameters: ['', 'Sunflower', '0', '0', ''],
                  },
                ],
              },
            ],
            summary_only: true,
          },
        },
      });
      expect(createFunctionResponse.isError).not.toBe(true);

      const lintResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'lint_extension_function_events',
          arguments: {
            extension_name: 'McpExt',
            parent_kind: 'object',
            parent_name: 'PlantCard',
            function_name: 'PlacePlant',
          },
        },
      });
      const lintResult = JSON.parse(lintResponse.content[0].text);

      expect(lintResult.valid).toBe(true);
      expect(lintResult.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: 'warning',
            type: 'object-function-create-external-object-parameter',
            parameterName: 'Sunflower',
            parameterIndex: 1,
          }),
        ])
      );
    } finally {
      project.delete();
    }
  });

  it('patches extension event instructions and inspects compact function events', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('McpExt', 0);
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

      const createResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'AddSun',
            function_type: 'action',
            sentence: 'Add sun to _PARAM1_',
            parameters: [
              {
                name: 'SunCountVariable',
                type: 'variable',
              },
            ],
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                aiGeneratedEventId: 'add-sun-count',
                variables: [
                  { name: 'LocalSunCount', type: 'number', value: 0 },
                ],
                conditions: [],
                actions: [
                  {
                    type: { value: 'CopyArgumentToVariable2' },
                    parameters: ['"SunCountVariable"', 'LocalSunCount'],
                  },
                  {
                    type: { value: 'SetNumberVariable' },
                    parameters: ['LocalSunCount', '+', '1'],
                  },
                  {
                    type: { value: 'CopyVariableToArgument2' },
                    parameters: ['"SunCountVariable"', 'LocalSunCount'],
                  },
                ],
              },
            ],
            summary_only: true,
          },
        },
      });
      expect(createResponse.isError).not.toBe(true);
      onExtensionFunctionEventsModifiedOutsideEditor.mockClear();

      const patchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'patch_extension_event_instruction',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'AddSun',
            event_id: 'add-sun-count',
            instruction_kind: 'action',
            instruction_type: 'SetNumberVariable',
            parameters: ['LocalSunCount', '+', '2'],
          },
        },
      });
      const patchResult = JSON.parse(patchResponse.content[0].text);

      expect(patchResponse.isError).not.toBe(true);
      expect(patchResult.after.parameters).toEqual(['LocalSunCount', '+', '2']);
      expect(
        onExtensionFunctionEventsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionName: 'McpExt',
        parentKind: 'extension',
        parentName: null,
        functionName: 'AddSun',
        newOrChangedAiGeneratedEventIds: expect.any(Set),
      });

      const inspectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_inspect_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'AddSun',
            compact: true,
          },
        },
      });
      const inspected = JSON.parse(inspectResponse.content[0].text);

      expect(inspectResponse.isError).not.toBe(true);
      expect(inspected.function.eventsJson).toBeUndefined();
      expect(inspected.function.serializedFunction).toBeUndefined();
      expect(inspected.function.events[0].actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'SetNumberVariable',
            parameters: ['LocalSunCount', '+', '2'],
          }),
        ])
      );
    } finally {
      project.delete();
    }
  });

  it('replaces extension function events from a file and patches extension JSON safely', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('McpExt', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const eventsFile = path.join(tempDir, 'replacement-events.json');
    fs.writeFileSync(
      eventsFile,
      JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Standard',
          aiGeneratedEventId: 'from-file-1',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          aiGeneratedEventId: 'from-file-2',
          conditions: [],
          actions: [],
        },
      ])
    );
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

      const createResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'AddSun',
            function_type: 'action',
            sentence: 'Add sun',
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [],
              },
            ],
            summary_only: true,
          },
        },
      });
      expect(createResponse.isError).not.toBe(true);
      onExtensionFunctionEventsModifiedOutsideEditor.mockClear();

      const replaceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'replace_extension_function_events_from_file',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'AddSun',
            function_type: 'action',
            events_json_file: eventsFile,
            summary_only: true,
          },
        },
      });
      const replaceResult = JSON.parse(replaceResponse.content[0].text);

      expect(replaceResponse.isError).not.toBe(true);
      expect(replaceResult.validationMode).toBe(
        'replace-extension-function-events-from-file'
      );
      expect(replaceResult.beforeEventsCount).toBe(1);
      expect(replaceResult.afterEventsCount).toBe(2);
      expect(
        onExtensionFunctionEventsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionName: 'McpExt',
        parentKind: 'extension',
        parentName: null,
        functionName: 'AddSun',
        newOrChangedAiGeneratedEventIds: expect.any(Set),
      });

      const dryRunPatchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_extension_patch',
          arguments: {
            extension_name: 'McpExt',
            dry_run: true,
            summary_only: true,
            patch: [
              {
                op: 'add',
                path: '/fullName',
                value: 'Dry Run Extension',
              },
            ],
          },
        },
      });
      const dryRunPatch = JSON.parse(dryRunPatchResponse.content[0].text);
      expect(dryRunPatchResponse.isError).not.toBe(true);
      expect(dryRunPatch.dryRun).toBe(true);
      expect(
        project.getEventsFunctionsExtension('McpExt').getFullName()
      ).not.toBe('Dry Run Extension');

      const patchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_extension_patch',
          arguments: {
            extension_name: 'McpExt',
            summary_only: true,
            patch: [
              {
                op: 'add',
                path: '/fullName',
                value: 'Patched Extension',
              },
            ],
          },
        },
      });
      const patchResult = JSON.parse(patchResponse.content[0].text);

      expect(patchResponse.isError).not.toBe(true);
      expect(patchResult.success).toBe(true);
      expect(patchResult.valid).toBe(true);
      expect(patchResult.snapshot.snapshotId).toEqual(expect.any(String));
      expect(project.getEventsFunctionsExtension('McpExt').getFullName()).toBe(
        'Patched Extension'
      );
      // A declaration-only patch must NOT reload the whole extension (which
      // would free child containers and crash open panels).
      expect(patchResult.requiresEditorReload).toBe(false);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
      project.delete();
    }
  });

  it('applies a function-scoped validated patch without freeing sibling object instances', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    // An events-based object WITH an initial instance — exactly the sibling whose
    // InitialInstancesContainer the old wholesale unserializeFrom would free.
    const eventsBasedObject = extension
      .getEventsBasedObjects()
      .insertNew('MyObject', 0);
    eventsBasedObject.getInitialInstances().insertNewInitialInstance();
    // A free function we will patch.
    const freeFunctions = extension.getEventsFunctions();
    const freeFunction = freeFunctions.insertNewEventsFunction('DoThing', 0);
    freeFunction.setFunctionType(0); // Action.

    // Hold a live JS wrapper into the sibling object's instances container, like
    // an open editor panel would. If a full extension reload runs, this wrapper
    // is freed and iterateOverInstances throws UseAfterFreeError.
    const liveInstancesWrapper = eventsBasedObject.getInitialInstances();
    expect(liveInstancesWrapper.getInstancesCount()).toBe(1);

    const onExtensionModifiedOutsideEditor: any = jest.fn();
    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onExtensionModifiedOutsideEditor,
      });

      const patchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_extension_patch',
          arguments: {
            extension_name: 'McpExt',
            scope: 'extension_function',
            function_name: 'DoThing',
            summary_only: true,
            patch: [
              { op: 'replace', path: '/fullName', value: 'Do The Thing' },
            ],
          },
        },
      });
      const patchResult = JSON.parse(patchResponse.content[0].text);

      expect(patchResponse.isError).not.toBe(true);
      expect(patchResult.success).toBe(true);
      expect(patchResult.scope).toBe('extension_function');
      // Narrow commit: no whole-extension reload, no editor refresh needed.
      expect(patchResult.requiresEditorReload).toBe(false);
      expect(onExtensionModifiedOutsideEditor).not.toHaveBeenCalled();
      // The patched function actually changed.
      expect(freeFunctions.getEventsFunction('DoThing').getFullName()).toBe(
        'Do The Thing'
      );
      // The sibling object's instances container wrapper is STILL ALIVE: it was
      // never freed. This is the use-after-free regression guard.
      expect(liveInstancesWrapper.getInstancesCount()).toBe(1);
    } finally {
      project.delete();
    }
  });

  it('reloads the whole extension and asks for an editor refresh on a cross-cutting patch', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    extension.getEventsBasedObjects().insertNew('ObjectA', 0);
    extension.getEventsBasedObjects().insertNew('ObjectB', 1);

    const onExtensionModifiedOutsideEditor: any = jest.fn();
    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onExtensionModifiedOutsideEditor,
      });

      // A whole-extension patch that touches TWO different objects: cannot be
      // narrowed, so a full reload + editor refresh is expected.
      const patchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_extension_patch',
          arguments: {
            extension_name: 'McpExt',
            summary_only: true,
            patch: [
              {
                op: 'replace',
                path: '/eventsBasedObjects/0/fullName',
                value: 'A renamed',
              },
              {
                op: 'replace',
                path: '/eventsBasedObjects/1/fullName',
                value: 'B renamed',
              },
            ],
          },
        },
      });
      const patchResult = JSON.parse(patchResponse.content[0].text);

      expect(patchResponse.isError).not.toBe(true);
      expect(patchResult.success).toBe(true);
      expect(patchResult.requiresEditorReload).toBe(true);
      expect(onExtensionModifiedOutsideEditor).toHaveBeenCalledWith('McpExt');
      expect(
        extension
          .getEventsBasedObjects()
          .get('ObjectA')
          .getFullName()
      ).toBe('A renamed');
      expect(
        extension
          .getEventsBasedObjects()
          .get('ObjectB')
          .getFullName()
      ).toBe('B renamed');
    } finally {
      project.delete();
    }
  });

  it('inspects prefab geometry and binds child Sprite resources from Resource properties', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('McpExt', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const createResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_object',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PlantCardSlot',
            summary_only: true,
            serialized_object: {
              name: 'PlantCardSlot',
              defaultName: 'PlantCardSlot',
              fullName: 'Plant card slot',
              description: 'Reusable plant card slot.',
              areaMinX: 0,
              areaMinY: 0,
              areaMinZ: 0,
              areaMaxX: 100,
              areaMaxY: 80,
              areaMaxZ: 64,
              objects: [
                {
                  adaptCollisionMaskAutomatically: true,
                  assetStoreId: '',
                  name: 'MousePreview',
                  type: 'Sprite',
                  updateIfNotVisible: false,
                  variables: [],
                  effects: [],
                  behaviors: [],
                  animations: [
                    {
                      name: 'Default',
                      useMultipleDirections: false,
                      directions: [
                        {
                          looping: false,
                          timeBetweenFrames: 0.08,
                          sprites: [
                            {
                              hasCustomCollisionMask: true,
                              image: 'OldPlantImage',
                              points: [],
                              originPoint: {
                                name: 'origine',
                                x: 0,
                                y: 0,
                              },
                              centerPoint: {
                                automatic: true,
                                name: 'centre',
                                x: 0,
                                y: 0,
                              },
                              customCollisionMask: [
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
              ],
              objectsFolderStructure: {
                folderName: '__ROOT',
                children: [{ objectName: 'MousePreview' }],
              },
              objectsGroups: [],
              layers: [],
              instances: [
                {
                  angle: 0,
                  customSize: false,
                  height: 0,
                  keepRatio: true,
                  layer: '',
                  name: 'MousePreview',
                  width: 0,
                  x: 4,
                  y: 6,
                  zOrder: 1,
                  numberProperties: [],
                  stringProperties: [],
                  initialVariables: [],
                },
              ],
              eventsFunctions: [],
              eventsFunctionsFolderStructure: { folderName: '__ROOT' },
              propertyDescriptors: [
                {
                  name: 'MousePreviewSpriteImage',
                  type: 'Resource',
                  value: 'NewPlantImage',
                  label: 'Mouse preview sprite image',
                  description: 'Image used for the mouse-following preview.',
                },
              ],
              variants: [],
            },
          },
        },
      });
      expect(createResponse.isError).not.toBe(true);

      const geometryResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_custom_object_runtime_geometry',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PlantCardSlot',
            parent_x: 100,
            parent_y: 200,
            cursor_scene_x: 110,
            cursor_scene_y: 212,
            layer_name: 'HUD',
          },
        },
      });
      const geometry = JSON.parse(geometryResponse.content[0].text);

      expect(geometryResponse.isError).not.toBe(true);
      expect(geometry.parentArea).toEqual(
        expect.objectContaining({ minX: 0, minY: 0, maxX: 100, maxY: 80 })
      );
      expect(geometry.children[0]).toEqual(
        expect.objectContaining({
          childName: 'MousePreview',
          objectType: 'Sprite',
        })
      );
      expect(geometry.children[0].bounds).toEqual(
        expect.objectContaining({ minX: 4, minY: 6, width: 32, height: 48 })
      );
      expect(geometry.children[0].sceneBounds).toEqual(
        expect.objectContaining({ minX: 104, minY: 206, width: 32, height: 48 })
      );
      expect(geometry.children[0].pointCoordinates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'centre',
            customObjectLocalX: 4,
            customObjectLocalY: 6,
            sceneX: 104,
            sceneY: 206,
          }),
        ])
      );
      expect(geometry.renderedSceneBounds).toEqual(
        expect.objectContaining({ minX: 104, minY: 206, width: 32, height: 48 })
      );
      expect(geometry.cursor.localX).toBe(10);
      expect(geometry.cursor.localY).toBe(12);
      expect(geometry.cursor.sceneX).toBe(110);
      expect(geometry.cursor.sceneY).toBe(212);
      expect(geometry.cursor.layer).toBe('HUD');
      expect(geometry.cursor.insideParentArea).toBe(true);
      expect(geometry.cursor.insideRenderedBounds).toBe(true);

      const beforeBindingResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_prefab_property_bindings',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PlantCardSlot',
          },
        },
      });
      const beforeBinding = JSON.parse(beforeBindingResponse.content[0].text);

      expect(beforeBindingResponse.isError).not.toBe(true);
      expect(beforeBinding.childResourceUses[0].resourceName).toBe(
        'OldPlantImage'
      );
      expect(beforeBinding.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propertyName: 'MousePreviewSpriteImage',
            type: 'resource-property-not-dynamically-used',
          }),
        ])
      );

      const bindResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bind_child_sprite_resource_property',
          arguments: {
            extension_name: 'McpExt',
            object_name: 'PlantCardSlot',
            child_object_name: 'MousePreview',
            property_name: 'MousePreviewSpriteImage',
            animation_name: 'Default',
          },
        },
      });
      const bindResult = JSON.parse(bindResponse.content[0].text);

      expect(bindResponse.isError).not.toBe(true);
      expect(bindResult.replacements[0]).toEqual(
        expect.objectContaining({
          beforeResourceName: 'OldPlantImage',
          afterResourceName: 'NewPlantImage',
        })
      );
      expect(bindResult.dynamicBindingCreated).toBe(false);
      expect(bindResult.readback.childResourceUses[0].resourceName).toBe(
        'NewPlantImage'
      );
    } finally {
      project.delete();
    }
  });

  it('extracts scene instances into an events-based object prefab', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'HealthBar', 0);
    layout
      .getObjects()
      .insertNewObject(project, 'TextObject::Text', 'Label', 1);
    const healthBar = layout.getInitialInstances().insertNewInitialInstance();
    healthBar.setObjectName('HealthBar');
    healthBar.setX(200);
    healthBar.setY(100);
    healthBar.setHasCustomSize(true);
    healthBar.setCustomWidth(80);
    healthBar.setCustomHeight(12);
    const label = layout.getInitialInstances().insertNewInitialInstance();
    label.setObjectName('Label');
    label.setX(200);
    label.setY(84);
    label.setHasCustomSize(true);
    label.setCustomWidth(80);
    label.setCustomHeight(12);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const dryRunResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_extract_prefab_from_object',
          arguments: {
            extension_name: 'UI',
            object_name: 'HealthBadge',
            source_kind: 'scene_instances',
            scene_name: 'Level1',
            source_object_names: ['HealthBar', 'Label'],
            dry_run: true,
            summary_only: true,
          },
        },
      });
      const dryRunResult = JSON.parse(dryRunResponse.content[0].text);
      expect(dryRunResponse.isError).not.toBe(true);
      expect(dryRunResult.dryRun).toBe(true);
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(false);
      expect(
        project.hasEventsFunctionsExtensionNamed('__McpValidation_UI')
      ).toBe(false);

      const extractResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_extract_prefab_from_object',
          arguments: {
            extension_name: 'UI',
            object_name: 'HealthBadge',
            source_kind: 'scene_instances',
            scene_name: 'Level1',
            source_object_names: ['HealthBar', 'Label'],
            replace_in_scene_with_prefab_instance: true,
            summary_only: true,
          },
        },
      });
      const result = JSON.parse(extractResponse.content[0].text);
      const prefab = project
        .getEventsFunctionsExtension('UI')
        .getEventsBasedObjects()
        .get('HealthBadge');

      expect(extractResponse.isError).not.toBe(true);
      expect(result.prefabType).toBe('UI::HealthBadge');
      expect(prefab.getObjects().getObjectsCount()).toBe(2);
      expect(prefab.getInitialInstances().getInstancesCount()).toBe(2);
      expect(prefab.getAreaMaxX()).toBe(80);
      expect(prefab.getAreaMaxY()).toBe(28);
      expect(layout.getObjects().hasObjectNamed('HealthBadge')).toBe(true);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(1);
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

  it('returns stale-state advice after changing scene events while previews are running', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    const processEditorFunctionCalls: any = jest.fn(async () => ({
      results: [
        {
          status: 'finished',
          call_id: 'mcp-call',
          success: true,
          didModifyProject: true,
          output: {
            sceneName: 'Level1',
            eventsCount: 1,
          },
        },
      ],
    }));
    const previewDebuggerServer = {
      getServerState: () => 'started',
      getExistingPreviewDebuggerIds: () => ['preview-ws-0'],
      getExistingDebuggerIds: () => ['preview-ws-0'],
    };

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        processEditorFunctionCalls,
        getPreviewDebuggerServer: () => previewDebuggerServer,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'add_scene_events',
          arguments: {
            scene_name: 'Level1',
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(result.staleStateAdvisory.previewMayBeStale).toBe(true);
      expect(result.staleStateAdvisory.runningPreviewDebuggerIds).toEqual([
        'preview-ws-0',
      ]);
      expect(result.staleStateAdvisory.recommendedActions).toContain(
        'save_and_relaunch_preview_paused { timeout_ms: 10000 }'
      );
      expect(result.staleStateAdvisory.editorPanelsMayBeStale).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'scene-events',
            sceneName: 'Level1',
          }),
        ])
      );
    } finally {
      project.delete();
    }
  });

  it('returns stale-state advice after replacing extension function events', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('McpExt', 0);
    extension
      .getEventsFunctions()
      .insertNewEventsFunction('SetPower', 0)
      .setFunctionType('Action');

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
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
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(result.staleStateAdvisory.previewMayBeStale).toBe(false);
      expect(result.staleStateAdvisory.editorPanelsMayBeStale).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'extension-function',
            extensionName: 'McpExt',
            parentKind: 'extension',
            functionName: 'SetPower',
          }),
        ])
      );
    } finally {
      project.delete();
    }
  });

  it('rejects extension function updates with invalid sentence parameters', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewEventsFunctionsExtension('McpExt', 0);
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

      const invalidCreateResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'UpdateEnemyWarrior',
            function_type: 'action',
            full_name: 'Update enemy warrior AI',
            description:
              'Updates enemy warrior AI, combat damage, and health bar UI.',
            sentence:
              'Update enemy warrior systems for _PARAM0_, _PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_',
            parameters: [
              { name: 'Player', type: 'object' },
              { name: 'Enemy_Warrior', type: 'object' },
              { name: 'HealthBar', type: 'object' },
              { name: 'AttackDamage', type: 'expression' },
              { name: 'DeltaTime', type: 'expression' },
            ],
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });

      expect(invalidCreateResponse.isError).toBe(true);
      expect(invalidCreateResponse.content[0].text).toContain('_PARAM5_');
      expect(invalidCreateResponse.content[0].text).toContain('_PARAM0_');
      expect(
        project
          .getEventsFunctionsExtension('McpExt')
          .getEventsFunctions()
          .hasEventsFunctionNamed('UpdateEnemyWarrior')
      ).toBe(false);

      const validCreateResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'UpdateEnemyWarrior',
            function_type: 'action',
            full_name: 'Update enemy warrior AI',
            description:
              'Updates enemy warrior AI, combat damage, and health bar UI.',
            sentence:
              'Update enemy warrior systems for _PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_, _PARAM5_',
            parameters: [
              { name: 'Player', type: 'object' },
              { name: 'Enemy_Warrior', type: 'object' },
              { name: 'HealthBar', type: 'object' },
              { name: 'AttackDamage', type: 'expression' },
              { name: 'DeltaTime', type: 'expression' },
            ],
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });

      expect(validCreateResponse.isError).not.toBe(true);

      const extension = project.getEventsFunctionsExtension('McpExt');
      const eventsFunction = extension
        .getEventsFunctions()
        .getEventsFunction('UpdateEnemyWarrior');
      expect(eventsFunction.getFullName()).toBe('Update enemy warrior AI');
      expect(eventsFunction.getEvents().getEventsCount()).toBe(1);

      const removeParameterResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'UpdateEnemyWarrior',
            function_type: 'action',
            sentence:
              'Update enemy warrior systems for _PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_',
            parameters: [
              { name: 'Player', type: 'object' },
              { name: 'Enemy_Warrior', type: 'object' },
              { name: 'HealthBar', type: 'object' },
              { name: 'AttackDamage', type: 'expression' },
            ],
            events_json:
              '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
          },
        },
      });

      expect(removeParameterResponse.isError).not.toBe(true);
      expect(eventsFunction.getParameters().getParametersCount()).toBe(4);
      expect(
        eventsFunction.getParameters().hasParameterNamed('DeltaTime')
      ).toBe(false);

      const invalidUpdateResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_extension_function',
          arguments: {
            extension_name: 'McpExt',
            function_name: 'UpdateEnemyWarrior',
            function_type: 'action',
            full_name: 'Broken update',
            sentence:
              'Update enemy warrior systems for _PARAM0_, _PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_',
            events_json: '[]',
          },
        },
      });

      expect(invalidUpdateResponse.isError).toBe(true);
      const restoredEventsFunction = extension
        .getEventsFunctions()
        .getEventsFunction('UpdateEnemyWarrior');
      expect(restoredEventsFunction.getFullName()).toBe(
        'Update enemy warrior AI'
      );
      expect(restoredEventsFunction.getEvents().getEventsCount()).toBe(1);
      expect(restoredEventsFunction.getParameters().getParametersCount()).toBe(
        4
      );
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(2);
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

      const collidingImage = new gd.ImageResource();
      collidingImage.setName('Player');
      collidingImage.setFile(path.join(tempDir, 'Player.png'));
      project.getResourcesManager().addResource(collidingImage);
      collidingImage.delete();

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
              { type: { value: 'Hide' }, parameters: ['Player'] },
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
      expect(
        audit.eventResourceReferences.some(
          reference =>
            reference.resourceName === 'Player' &&
            reference.instructionType === 'Hide'
        )
      ).toBe(false);
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
      expect(found.matches[0].serializedEvent).toBeUndefined();

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
      const movedSubEvents = gd
        .asGroupEvent(layout.getEvents().getEventAt(0))
        .getSubEvents();
      expect(movedSubEvents.getEventsCount()).toBe(3);
      const movedEvent = movedSubEvents.getEventAt(2);
      expect(movedEvent.getType()).toBe('BuiltinCommonInstructions::Comment');
      expect(serializeToJSObject(movedSubEvents)[2]).toEqual(
        expect.objectContaining({
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Leave this outside the group',
        })
      );
      await waitForDeferredNotifications();
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

  it('waits for disk persistence and returns matching editor and disk hashes', async () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-save-'));
    const projectFile = path.join(tempDir, 'game.json');
    project.setProjectFile(projectFile);
    fs.writeFileSync(projectFile, JSON.stringify(serializeToJSObject(project)));
    project.setName('Persisted through MCP');
    let dirty = true;
    const saveProjectAndWait: any = jest.fn(async () => {
      fs.writeFileSync(
        projectFile,
        JSON.stringify(serializeToJSObject(project))
      );
      dirty = false;
      return { saved: true };
    });

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: false,
          allowCommandTools: true,
        }),
        getPersistenceState: () => ({
          hasUnsavedChanges: dirty,
          changesCount: dirty ? 1 : 0,
          timeOfFirstChangeSinceLastSave: dirty ? Date.now() - 100 : null,
        }),
        saveProjectAndWait,
      });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_save_project_and_wait',
          arguments: {},
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(true);
      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
      expect(result.persistence.projectFile).toBe(projectFile);
      expect(result.persistence.dirtyBefore).toBe(true);
      expect(result.persistence.dirtyAfter).toBe(false);
      expect(result.persistence.diskWriteObserved).toBe(true);
      expect(result.persistence.hashesMatch).toBe(true);
      expect(result.persistence.editorHash).toBe(result.persistence.diskHash);
      expect(Date.parse(result.persistence.completedAt)).not.toBeNaN();

      project.setName('Persisted through SAVE_PROJECT');
      dirty = true;
      const commandResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_run_command',
          arguments: { commandName: 'SAVE_PROJECT' },
        },
      });
      const commandResult = JSON.parse(commandResponse.content[0].text);
      expect(commandResponse.isError).not.toBe(true);
      expect(commandResult.completed).toBe(true);
      expect(commandResult.persistence.hashesMatch).toBe(true);
      expect(commandResult.persistence.dirtyAfter).toBe(false);
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

  it('deletes scene, object, and initial instance variables with focused tools', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'GroundSlot', 0);
    layout
      .getVariables()
      .insertNew('SceneFlag', 0)
      .setBool(true);
    layout
      .getVariables()
      .insertNew('OldFlag', 1)
      .setBool(true);
    layout
      .getVariables()
      .insertNew('UsedFlag', 2)
      .setBool(true);
    const referenceEvent = gd.asStandardEvent(
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    const referenceAction = new gd.Instruction();
    referenceAction.setType('SetBooleanVariable');
    referenceAction.setParametersCount(3);
    referenceAction.setParameter(0, 'UsedFlag');
    referenceAction.setParameter(1, 'True');
    referenceAction.setParameter(2, '');
    referenceEvent.getActions().insert(referenceAction, 0);
    referenceAction.delete();
    object
      .getVariables()
      .insertNew('ObjectFlag', 0)
      .setBool(true);
    const instance = layout.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('GroundSlot');
    instance
      .getVariables()
      .insertNew('IsAnchor', 0)
      .setBool(true);
    const instanceId = instance.getPersistentUuid().slice(0, 10);
    const onObjectsModifiedOutsideEditor: any = jest.fn();
    const onInstancesModifiedOutsideEditor: any = jest.fn();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        onObjectsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
      });

      const sceneVariableResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'delete_scene_variable',
          arguments: {
            scene_name: 'Level1',
            variable_name_or_path: 'SceneFlag',
          },
        },
      });
      const sceneVariableResult = JSON.parse(
        sceneVariableResponse.content[0].text
      );
      expect(sceneVariableResponse.isError).not.toBe(true);
      expect(sceneVariableResult.deleted).toBe(true);
      expect(layout.getVariables().has('SceneFlag')).toBe(false);

      const batchSceneVariableResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'batch_delete_scene_variables',
          arguments: {
            scene_name: 'Level1',
            variable_names_or_paths: ['OldFlag', 'UsedFlag'],
          },
        },
      });
      const batchSceneVariableResult = JSON.parse(
        batchSceneVariableResponse.content[0].text
      );
      expect(batchSceneVariableResponse.isError).not.toBe(true);
      expect(batchSceneVariableResult.deletedCount).toBe(1);
      expect(layout.getVariables().has('OldFlag')).toBe(false);
      expect(layout.getVariables().has('UsedFlag')).toBe(true);
      expect(batchSceneVariableResult.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            variableNameOrPath: 'UsedFlag',
            skipped: true,
            referenced: true,
          }),
        ])
      );

      const objectVariableResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'delete_object_variable',
          arguments: {
            scene_name: 'Level1',
            object_name: 'GroundSlot',
            variable_name_or_path: 'ObjectFlag',
          },
        },
      });
      const objectVariableResult = JSON.parse(
        objectVariableResponse.content[0].text
      );
      expect(objectVariableResponse.isError).not.toBe(true);
      expect(objectVariableResult.deleted).toBe(true);
      expect(object.getVariables().has('ObjectFlag')).toBe(false);
      expect(onObjectsModifiedOutsideEditor).toHaveBeenCalled();

      const instanceVariableResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'delete_instance_variable',
          arguments: {
            scene_name: 'Level1',
            instance_id: instanceId,
            variable_name_or_path: 'IsAnchor',
          },
        },
      });
      const instanceVariableResult = JSON.parse(
        instanceVariableResponse.content[0].text
      );
      expect(instanceVariableResponse.isError).not.toBe(true);
      expect(instanceVariableResult.deleted).toBe(true);
      expect(instance.getVariables().has('IsAnchor')).toBe(false);
      expect(onInstancesModifiedOutsideEditor).toHaveBeenCalledWith({
        scene: layout,
      });
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
      expect(batchResult.counts).toEqual(
        expect.objectContaining({
          resources: 1,
          objects: 1,
          spriteAnimations: 1,
          instances: 1,
        })
      );
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

  it('creates Sprite and Text objects with high-level authoring tools', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-mcp-'));
    const imageFile = path.join(tempDir, 'Enemy.png');
    fs.writeFileSync(imageFile, 'fake png content');
    const imageResource = new gd.ImageResource();
    imageResource.setName('Enemy.png');
    imageResource.setFile(imageFile);
    project.getResourcesManager().addResource(imageResource);
    imageResource.delete();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const spriteResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_sprite_object_from_resource',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Enemy',
            resource_name: 'Enemy.png',
            animation_name: 'Idle',
            origin: { x: 4, y: 6 },
            center: { x: 16, y: 20 },
            create_instance: true,
            x: 80,
            y: 120,
            zOrder: 5,
          },
        },
      });
      const spriteResult = JSON.parse(spriteResponse.content[0].text);
      expect(spriteResponse.isError).not.toBe(true);
      expect(spriteResult.objectType).toBe('Sprite');
      const spriteObject = layout.getObjects().getObject('Enemy');
      const frame = gd
        .asSpriteConfiguration(spriteObject.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0);
      expect(frame.getImageName()).toBe('Enemy.png');
      expect(frame.getOrigin().getX()).toBe(4);
      expect(frame.getCenter().getY()).toBe(20);
      // Without an explicit collision mask, the frame must default to the full
      // image (bounding box) mask. Otherwise it would serialize to
      // hasCustomCollisionMask:true with an empty mask, making collisions never
      // trigger.
      expect(frame.isFullImageCollisionMask()).toBe(true);
      expect(frame.getCustomCollisionMask().size()).toBe(0);
      expect(layout.getInitialInstances().getInstancesCount()).toBe(1);

      const textResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_text_object',
          arguments: {
            scene_name: 'Level1',
            object_name: 'ScoreLabel',
            text: 'Score: 0',
            character_size: 32,
            color: '255;255;255',
            bold: true,
            create_instance: true,
            x: 16,
            y: 24,
            align: 'center_x',
            initially_hidden: true,
          },
        },
      });
      const textResult = JSON.parse(textResponse.content[0].text);
      expect(textResponse.isError).not.toBe(true);
      expect(textResult.objectType).toBe('TextObject::Text');
      expect(textResult.properties).toEqual(
        expect.objectContaining({
          text: 'Score: 0',
          characterSize: 32,
          bold: true,
        })
      );
      expect(layout.getInitialInstances().getInstancesCount()).toBe(2);
      const textInstance = getInitialInstances(
        layout.getInitialInstances()
      ).find(instance => instance.getObjectName() === 'ScoreLabel');
      expect(textInstance).toBeDefined();
      if (!textInstance)
        throw new Error('ScoreLabel instance was not created.');
      expect(textInstance.hasCustomSize()).toBe(true);
      expect(textInstance.getCustomWidth()).toBeGreaterThan(0);
      expect(textInstance.getCustomHeight()).toBeGreaterThan(0);
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('summarizes project cleanup candidates without mutating the project', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const activeLayout = project.insertNewLayout('Level1', 0);
    const emptyLayout = project.insertNewLayout('Untitled scene', 1);
    project.setFirstLayout('Level1');
    activeLayout.getObjects().insertNewObject(project, 'Sprite', 'Used', 0);
    activeLayout.getObjects().insertNewObject(project, 'Sprite', 'Unused', 1);
    const instance = activeLayout
      .getInitialInstances()
      .insertNewInitialInstance();
    instance.setObjectName('Used');

    try {
      const bridge = makeBridge({
        getProject: () => project,
      });

      const cleanupResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_project_cleanup',
          arguments: {},
        },
      });
      const cleanup = JSON.parse(cleanupResponse.content[0].text);
      expect(cleanupResponse.isError).not.toBe(true);
      expect(cleanup.emptyScenes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sceneName: 'Untitled scene',
            isStartupScene: false,
          }),
        ])
      );
      expect(cleanup.possiblyUnusedSceneObjects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sceneName: 'Level1',
            objectName: 'Unused',
          }),
        ])
      );
      expect(emptyLayout.getObjects().getObjectsCount()).toBe(0);
    } finally {
      project.delete();
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

      const dryRunPatchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_scene_patch',
          arguments: {
            scene_name: 'Level1',
            dry_run: true,
            patch: [
              {
                op: 'replace',
                path: '/objects/0/name',
                value: 'LabelDryRun',
              },
            ],
          },
        },
      });
      const dryRunPatch = JSON.parse(dryRunPatchResponse.content[0].text);
      expect(dryRunPatchResponse.isError).not.toBe(true);
      expect(dryRunPatch.dryRun).toBe(true);
      expect(dryRunPatch.staleStateAdvisory).toBeUndefined();
      expect(dryRunPatch.projectStateChanged).toBeUndefined();
      expect(layout.getObjects().hasObjectNamed('LabelDryRun')).toBe(false);

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

      const compactPatchResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'apply_validated_scene_patch',
          arguments: {
            scene_name: 'Level1',
            summary_only: true,
            patch: [
              {
                op: 'replace',
                path: '/objects/0/name',
                value: 'LabelCompact',
              },
            ],
          },
        },
      });
      const compactPatch = JSON.parse(compactPatchResponse.content[0].text);
      expect(compactPatchResponse.isError).not.toBe(true);
      expect(compactPatch.success).toBe(true);
      expect(compactPatch.serializedScene).toBeUndefined();
      expect(compactPatch.changedPaths).toEqual(['/objects/0/name']);
      expect(layout.getObjects().hasObjectNamed('LabelCompact')).toBe(true);
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
                variables: { index: 2, label: 'hero' },
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
      // Per-instance variables were set on the initial instance.
      expect(instance.getVariables().has('index')).toBe(true);
      expect(
        instance
          .getVariables()
          .get('index')
          .getValue()
      ).toBe(2);
      expect(
        instance
          .getVariables()
          .get('label')
          .getString()
      ).toBe('hero');

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

  it('forwards structured add_scene_events payloads without requiring JSON strings', async () => {
    const processEditorFunctionCalls: any = jest.fn(async () => ({
      results: [
        {
          status: 'finished',
          call_id: 'mcp-call',
          success: true,
          didModifyProject: false,
          output: {
            success: true,
          },
        },
      ],
    }));
    const bridge = makeBridge({
      getPermissions: () => ({
        allowWriteTools: true,
        allowCommandTools: false,
      }),
      processEditorFunctionCalls,
    });

    const structuredEvents = [
      {
        type: 'BuiltinCommonInstructions::Comment',
        comment: 'Structured payload.',
        aiGeneratedEventId: 'structured-event-id',
      },
    ];
    const response = await bridge.handleRendererMcpRequest({
      method: 'tools/call',
      params: {
        name: 'add_scene_events',
        arguments: {
          scene_name: 'Level1',
          event_changes: [
            {
              operation_name: 'insert_at_end',
              generated_events: structuredEvents,
            },
          ],
        },
      },
    });

    expect(response.isError).not.toBe(true);
    const editorCall =
      processEditorFunctionCalls.mock.calls[0][0].functionCalls[0];
    const forwardedArguments = JSON.parse(editorCall.arguments);
    expect(forwardedArguments.event_changes[0].generated_events).toEqual(
      structuredEvents
    );
  });

  it('returns a successful revision receipt when a raw event mutation outlives a reported editor failure', async () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const triggerUnsavedChanges: any = jest.fn();
    const processEditorFunctionCalls: any = jest.fn(async () => {
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);
      return {
        results: [
          {
            status: 'finished',
            call_id: 'mcp-call',
            success: false,
            output: { message: 'You must be logged in to use AI.' },
          },
        ],
      };
    });
    try {
      const bridge = makeBridge({
        getProject: () => project,
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
          name: 'add_scene_events',
          arguments: {
            scene_name: 'Level1',
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Comment',
                comment: 'Applied once.',
              },
            ],
          },
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toEqual(result);
      expect(result.success).toBe(true);
      expect(result.applied).toBe(true);
      expect(result.oldRevision).not.toBe(result.newRevision);
      expect(result.eventSheetRevision).toBe(result.newRevision);
      expect(result.validationState.valid).toBe(true);
      expect(result.saveState.requested).toBe(false);
      expect(result.warning).toContain('logged in');
      expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
    } finally {
      project.delete();
    }
  });

  it('rejects raw event writes against a stale event sheet revision', async () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    const processEditorFunctionCalls: any = jest.fn();
    try {
      const bridge = makeBridge({
        getProject: () => project,
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
            expected_revision: 'fnv1a:stale',
            events_json: [
              {
                type: 'BuiltinCommonInstructions::Comment',
                comment: 'Should not be written.',
              },
            ],
          },
        },
      });

      expect(response.isError).toBe(true);
      expect(response.structuredContent).toEqual(
        expect.objectContaining({
          success: false,
          code: 'EVENT_SHEET_REVISION_CONFLICT',
          eventSheetRevision: expect.stringMatching(/^fnv1a:/),
        })
      );
      expect(processEditorFunctionCalls).not.toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('preserves a structured single Group event while auto-quoting its child events', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    const processEditorFunctionCalls: any = jest.fn(async () => ({
      results: [
        {
          status: 'finished',
          call_id: 'mcp-call',
          success: true,
          didModifyProject: false,
          output: {
            success: true,
          },
        },
      ],
    }));

    try {
      const bridge = makeBridge({
        getProject: () => project,
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
            event_changes: [
              {
                operation_name: 'insert_at_end',
                generated_events: {
                  type: 'BuiltinCommonInstructions::Group',
                  name: 'Timers',
                  aiGeneratedEventId: 'timers-group-id',
                  events: [
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
                  ],
                },
              },
            ],
          },
        },
      });

      expect(response.isError).not.toBe(true);
      const editorCall =
        processEditorFunctionCalls.mock.calls[0][0].functionCalls[0];
      const forwardedArguments = JSON.parse(editorCall.arguments);
      const forwardedEvents = Array.isArray(
        forwardedArguments.event_changes[0].generated_events
      )
        ? forwardedArguments.event_changes[0].generated_events
        : [forwardedArguments.event_changes[0].generated_events];
      expect(forwardedEvents).toHaveLength(1);
      const forwardedGroup = forwardedEvents[0];
      expect(forwardedGroup).toEqual(
        expect.objectContaining({
          type: 'BuiltinCommonInstructions::Group',
          name: 'Timers',
          aiGeneratedEventId: 'timers-group-id',
        })
      );
      expect(forwardedGroup.events).toHaveLength(1);
      expect(forwardedGroup.events[0].actions[0].parameters[1]).toBe(
        '"GameTimer"'
      );
    } finally {
      project.delete();
    }
  });

  it('blocks legacy object-variable boolean conditions before add_scene_events writes', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const processEditorFunctionCalls: any = (jest.fn(): any);

    try {
      const bridge = makeBridge({
        getProject: () => project,
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
            events_json: JSON.stringify([
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'ObjectVariableAsBoolean' },
                    parameters: ['GroundSlot', 'Occupied', 'false'],
                  },
                ],
                actions: [],
              },
            ]),
          },
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'legacy-function-only-instruction-in-scene-events',
            instructionType: 'ObjectVariableAsBoolean',
            replacementType: 'BooleanObjectVariable',
          }),
        ])
      );
      expect(processEditorFunctionCalls).not.toHaveBeenCalled();
      expect(layout.getEvents().getEventsCount()).toBe(0);
    } finally {
      project.delete();
    }
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

  it('flags suspicious empty custom collision masks in resource and cleanup audits', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const spriteObject = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'BrokenCollision', 0);
    const configuration = gd.asSpriteConfiguration(
      spriteObject.getConfiguration()
    );
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite = new gd.Sprite();
    sprite.setImageName('Whatever.png');
    // Reproduce the broken state: custom collision mask enabled but empty.
    sprite.setFullImageCollisionMask(false);
    sprite.getCustomCollisionMask().clear();
    animation.getDirection(0).addSprite(sprite);
    sprite.delete();
    configuration.getAnimations().addAnimation(animation);
    animation.delete();

    try {
      const bridge = makeBridge({ getProject: () => project });

      const resourcesResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: { name: 'inspect_project_resources', arguments: {} },
      });
      const resources = JSON.parse(resourcesResponse.content[0].text);
      expect(resources.summary.suspiciousCollisionMasksCount).toBe(1);
      expect(resources.suspiciousCollisionMasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ objectName: 'BrokenCollision' }),
        ])
      );

      const cleanupResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: { name: 'inspect_project_cleanup', arguments: {} },
      });
      const cleanup = JSON.parse(cleanupResponse.content[0].text);
      expect(cleanup.summary.suspiciousCollisionMasksCount).toBe(1);
      expect(cleanup.suspiciousCollisionMasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ objectName: 'BrokenCollision' }),
        ])
      );
    } finally {
      project.delete();
    }
  });

  it('lists available behaviors with exact behavior types', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    try {
      const bridge = makeBridge({ getProject: () => project });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'list_available_behaviors',
          arguments: { object_name: 'Player', scene_name: 'Level1' },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.objectType).toBe('Sprite');
      expect(result.behaviorsCount).toBeGreaterThan(0);
      // Every returned behavior must expose the exact behaviorType + defaultName.
      result.behaviors.forEach(behavior => {
        expect(typeof behavior.behaviorType).toBe('string');
        expect(behavior.behaviorType.length).toBeGreaterThan(0);
        expect(typeof behavior.defaultName).toBe('string');
      });
      // The platformer behavior should be among compatible behaviors.
      expect(
        result.behaviors.some(
          behavior =>
            behavior.behaviorType ===
            'PlatformBehavior::PlatformerObjectBehavior'
        )
      ).toBe(true);

      // include_properties exposes each behavior TYPE's property schema without
      // adding it to an object.
      const withProps = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'list_available_behaviors',
          arguments: {
            object_name: 'Player',
            scene_name: 'Level1',
            search: 'platformer',
            include_properties: true,
          },
        },
      });
      const propsResult = JSON.parse(withProps.content[0].text);
      const platformer = propsResult.behaviors.find(
        b => b.behaviorType === 'PlatformBehavior::PlatformerObjectBehavior'
      );
      expect(platformer).toBeDefined();
      expect(Array.isArray(platformer.properties)).toBe(true);
      expect(platformer.properties.length).toBeGreaterThan(0);
      expect(typeof platformer.properties[0].name).toBe('string');
    } finally {
      project.delete();
    }
  });

  it('matches multi-word and aliased instruction metadata queries', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);

    try {
      const bridge = makeBridge({ getProject: () => project });

      const search = async (query: string) => {
        const response = await bridge.handleRendererMcpRequest({
          method: 'tools/call',
          params: {
            name: 'gdevelop_search_instruction_metadata',
            arguments: { query, compact: true },
          },
        });
        return JSON.parse(response.content[0].text);
      };

      // Multi-word query that used to return [] with contiguous-substring match.
      const playSound = await search('play sound effect');
      expect(playSound.results.length).toBeGreaterThan(0);
      expect(playSound.results.some(result => /sound/i.test(result.type))).toBe(
        true
      );

      // Aliased intent: "key pressed keyboard".
      const keyPressed = await search('key pressed keyboard');
      expect(keyPressed.results.length).toBeGreaterThan(0);

      // Compact mode keeps literalSyntax hints on parameters.
      const withParams = playSound.results.find(
        result => result.parameters && result.parameters.length
      );
      if (withParams) {
        expect(withParams.parameters[0]).toHaveProperty('literalSyntax');
      }

      // #5: a natural-language query with filler tokens ("modify"/"content"/"of")
      // must still surface the text-setter and a commonTaskHint pointing at the
      // hard-to-guess capability action type.
      const setText = await search('modify text string content of text object');
      expect(setText.commonTaskHints).toBeDefined();
      expect(
        setText.commonTaskHints.some(
          hint =>
            hint.type ===
            'TextContainerCapability::TextContainerBehavior::SetValue'
        )
      ).toBe(true);

      // #6: "play music loop" / BGM intent surfaces a music hint.
      const music = await search('play music loop');
      expect(music.commonTaskHints).toBeDefined();
      expect(music.commonTaskHints.some(hint => /music/i.test(hint.type))).toBe(
        true
      );
    } finally {
      project.delete();
    }
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
                Player: [{}],
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
        arguments: { timeout_ms: 1000 },
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

  it('builds an action instruction from named parameters via create_action', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({ getProject: () => project });

      // SetNumberVariable: [variable, operator, value]. Provide by index.
      const numberResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_action',
          arguments: {
            type: 'SetNumberVariable',
            parameters: { '0': 'Score', '1': '=', '2': '100' },
          },
        },
      });
      const numberResult = JSON.parse(numberResponse.content[0].text);
      expect(numberResponse.isError).not.toBe(true);
      expect(numberResult.instruction.type.value).toBe('SetNumberVariable');
      expect(numberResult.instruction.parameters).toEqual([
        'Score',
        '=',
        '100',
      ]);

      // SetBooleanVariable has a hidden code-only 3rd param — it must be auto
      // filled with "" so the array length is correct.
      const boolResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_action',
          arguments: {
            type: 'SetBooleanVariable',
            parameters: { '0': 'GameOver', '1': 'True' },
          },
        },
      });
      const boolResult = JSON.parse(boolResponse.content[0].text);
      expect(boolResult.instruction.parameters[0]).toBe('GameOver');
      expect(boolResult.instruction.parameters[1]).toBe('True');
      // Trailing code-only param present as "".
      expect(boolResult.instruction.parameters.length).toBeGreaterThanOrEqual(
        3
      );
      expect(boolResult.instruction.parameters[2]).toBe('');
    } finally {
      project.delete();
    }
  });

  it('assigns unique CollisionNP parameter names and builds it without indexes', async () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({ getProject: () => project });
      const metadataResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_get_instruction_metadata',
          arguments: { type: 'CollisionNP', kind: 'condition' },
        },
      });
      const metadata = JSON.parse(metadataResponse.content[0].text);
      const parameterNames = metadata.parameters.map(
        parameter => parameter.parameterName
      );
      expect(new Set(parameterNames).size).toBe(parameterNames.length);
      expect(parameterNames).toEqual(
        expect.arrayContaining(['first_object', 'second_object'])
      );

      const conditionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_condition',
          arguments: {
            type: 'CollisionNP',
            parameters: {
              first_object: 'Player',
              second_object: 'Enemy',
            },
          },
        },
      });
      const condition = JSON.parse(conditionResponse.content[0].text);
      expect(conditionResponse.isError).not.toBe(true);
      expect(condition.instruction.parameters[0]).toBe('Player');
      expect(condition.instruction.parameters[1]).toBe('Enemy');
      expect(
        condition.filled.map(parameter => parameter.parameterName)
      ).toEqual(expect.arrayContaining(['first_object', 'second_object']));
    } finally {
      project.delete();
    }
  });

  it('builds signal instructions with dedicated helpers', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({ getProject: () => project });

      const emitSceneResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_signal_emit_action',
          arguments: {
            target_kind: 'scene',
            signal_name: 'Attack',
            payload: 'heavy',
          },
        },
      });
      const emitScene = JSON.parse(emitSceneResponse.content[0].text);
      expect(emitSceneResponse.isError).not.toBe(true);
      expect(emitScene.actionType).toBe('EmitSceneSignal');
      expect(emitScene.instruction.parameters).toEqual([
        '',
        '"Attack"',
        '"heavy"',
      ]);

      const emitInstanceResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_signal_emit_action',
          arguments: {
            target_kind: 'object_instance',
            instance_id: 'SignalSenderInstanceId()',
            signal_name: 'Attack.Reply',
            payload: 'Blocked',
          },
        },
      });
      const emitInstance = JSON.parse(emitInstanceResponse.content[0].text);
      expect(emitInstanceResponse.isError).not.toBe(true);
      expect(emitInstance.actionType).toBe('EmitSignalToObjectInstance');
      expect(emitInstance.instruction.parameters).toEqual([
        '',
        'SignalSenderInstanceId()',
        '"Attack.Reply"',
        '"Blocked"',
      ]);

      const invalidExtensionTargetResponse = await bridge.handleRendererMcpRequest(
        {
          method: 'tools/call',
          params: {
            name: 'create_signal_emit_action',
            arguments: {
              target_kind: 'picked_objects',
              target_scope: 'object_function',
              objects: 'Enemies',
              signal_name: 'Attack',
            },
          },
        }
      );
      expect(invalidExtensionTargetResponse.isError).toBe(true);
      expect(invalidExtensionTargetResponse.content[0].text).toContain(
        'extension event sheets'
      );

      const receiveResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_signal_received_condition',
          arguments: {
            signal_name: 'Attack',
          },
        },
      });
      const receive = JSON.parse(receiveResponse.content[0].text);
      expect(receiveResponse.isError).not.toBe(true);
      expect(receive.instruction.type.value).toBe('SignalReceived');
      expect(receive.instruction.parameters).toEqual(['', '"Attack"']);

      const genericSignalResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'create_action',
          arguments: {
            type: 'EmitSceneSignal',
            parameters: { '1': 'Attack' },
          },
        },
      });
      const genericSignal = JSON.parse(genericSignalResponse.content[0].text);
      expect(genericSignalResponse.isError).not.toBe(true);
      expect(genericSignal.instruction.parameters[1]).toBe('"Attack"');
    } finally {
      project.delete();
    }
  });

  it('creates object onSignal lifecycle functions through the dedicated tool', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('SignalExt', 0);
    extension.getEventsBasedObjects().insertNew('SignalReceiver', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_create_or_update_on_signal',
          arguments: {
            extension_name: 'SignalExt',
            parent_kind: 'object',
            parent_name: 'SignalReceiver',
            summary_only: true,
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.functionName).toBe('onSignal');
      expect(result.signalSignature).toEqual([
        'Object',
        'SignalName',
        'Payload',
      ]);
      expect(
        result.function.parameters.map(parameter => parameter.name)
      ).toEqual(['Object', 'SignalName', 'Payload']);

      const inspectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'gdevelop_inspect_signal_usage',
          arguments: {
            extension_name: 'SignalExt',
          },
        },
      });
      const usage = JSON.parse(inspectResponse.content[0].text);
      expect(inspectResponse.isError).not.toBe(true);
      expect(usage.onSignalHandlers.totalMatches).toBe(1);
      expect(usage.onSignalHandlers.handlers[0].parentName).toBe(
        'SignalReceiver'
      );
    } finally {
      project.delete();
    }
  });

  it('paints and reads a tilemap instance grid (set/get round-trip)', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    // The TileMap JS-extension object type is not registered in the unit-test
    // env, so create a plain object to hold the instance; set_tilemap_tiles
    // operates on the instance's raw "tilemap" string regardless of object type.
    layout.getObjects().insertNewObject(project, 'Sprite', 'Tiles', 0);

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
          name: 'set_tilemap_tiles',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Tiles',
            create_instance: true,
            x: 0,
            y: 0,
            tile_size: 16,
            tileset_columns: 4,
            map_width: 3,
            map_height: 2,
            // Fill row by id, then override one cell by {col,row} + flip, clear another.
            fill: { x: 0, y: 0, width: 3, height: 1, tile: 0 },
            tiles: [
              { x: 1, y: 1, tile: { col: 2, row: 1, flipX: true } }, // id = 1*4+2 = 6
              { x: 2, y: 0, tile: null }, // clear (was filled by fill)
            ],
          },
        },
      });
      const setResult = JSON.parse(setResponse.content[0].text);
      expect(setResponse.isError).not.toBe(true);
      expect(setResult.success).toBe(true);
      expect(setResult.mapSize).toEqual({ columns: 3, rows: 2 });
      expect(setResult.pixelSize).toEqual({ width: 48, height: 32 });

      // The instance now carries a valid serialized grid.
      const instances = getInitialInstances(layout.getInitialInstances());
      const tilemapRaw = instances[0].getRawStringProperty('tilemap');
      const grid = JSON.parse(tilemapRaw);
      expect(grid.dimX).toBe(3);
      expect(grid.dimY).toBe(2);
      expect(grid.layers[0].id).toBe(0);
      // tiles[y][x]: row 0 = [0, 0, -1] (third cleared); row 1 has the flipped tile at x=1.
      expect(grid.layers[0].tiles[0][0]).toBe(0);
      expect(grid.layers[0].tiles[0][2]).toBe(-1);
      // id 6 OR-ed with the horizontal flip flag (0x80000000 → negative int32).
      expect(grid.layers[0].tiles[1][1] & 0x000000ff).toBe(6);
      expect(grid.layers[0].tiles[1][1] < 0).toBe(true);

      // get_tilemap_tiles decodes it back.
      const getResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'get_tilemap_tiles',
          arguments: { scene_name: 'Level1', object_name: 'Tiles' },
        },
      });
      const getResult = JSON.parse(getResponse.content[0].text);
      expect(getResult.mapSize).toEqual({ columns: 3, rows: 2 });
      expect(getResult.decodedTiles[0][0]).toEqual({ id: 0 });
      expect(getResult.decodedTiles[0][2]).toEqual({ empty: true });
      expect(getResult.decodedTiles[1][1]).toEqual(
        expect.objectContaining({ id: 6, flipX: true })
      );
    } finally {
      project.delete();
    }
  });

  it('inspects tilemap collision cells and checks walkability paths', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Tiles', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_tilemap_tiles',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Tiles',
            create_instance: true,
            tile_size: 16,
            tileset_columns: 4,
            map_width: 4,
            map_height: 3,
            fill: { x: 0, y: 0, width: 4, height: 3, tile: 0 },
            tiles: [{ x: 1, y: 1, tile: 5 }, { x: 2, y: 1, tile: 5 }],
          },
        },
      });

      const collisionResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'set_tilemap_collision_tiles',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Tiles',
            tile_ids: [5],
          },
        },
      });
      const collision = JSON.parse(collisionResponse.content[0].text);
      expect(collisionResponse.isError).not.toBe(true);
      expect(collision.collisionTileIds).toEqual([5]);

      const inspectResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_tilemap_collision',
          arguments: { scene_name: 'Level1', object_name: 'Tiles' },
        },
      });
      const inspect = JSON.parse(inspectResponse.content[0].text);
      expect(inspect.blockedCells).toEqual([
        { x: 1, y: 1, tileId: 5 },
        { x: 2, y: 1, tileId: 5 },
      ]);
      expect(inspect.asciiMask).toEqual(['....', '.##.', '....']);

      const pathResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'check_tilemap_walkability',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Tiles',
            start: { x: 0, y: 1 },
            goal: { x: 3, y: 1 },
          },
        },
      });
      const pathResult = JSON.parse(pathResponse.content[0].text);
      expect(pathResult.reachable).toBe(true);
      expect(pathResult.blockedCells).toEqual([
        { x: 1, y: 1, tileId: 5 },
        { x: 2, y: 1, tileId: 5 },
      ]);
      expect(pathResult.path[0]).toEqual({ x: 0, y: 1 });
      expect(pathResult.path[pathResult.path.length - 1]).toEqual({
        x: 3,
        y: 1,
      });
    } finally {
      project.delete();
    }
  });

  it('inspects tilemap palette ids and static draw order', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-size-'));
    const backgroundImageFile = path.join(tempDir, 'background.png');
    fs.writeFileSync(
      backgroundImageFile,
      Uint8Array.from([
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
        0,
        0,
        0,
        13,
        73,
        72,
        68,
        82,
        0,
        0,
        3,
        192,
        0,
        0,
        2,
        28,
      ])
    );
    layout.getObjects().insertNewObject(project, 'Sprite', 'Tiles', 0);
    const backObject = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Back', 1);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Front', 2);
    const backgroundResource = new gd.ImageResource();
    backgroundResource.setName('Background');
    backgroundResource.setFile(backgroundImageFile);
    project.getResourcesManager().addResource(backgroundResource);
    backgroundResource.delete();
    const backgroundAnimation = new gd.Animation();
    backgroundAnimation.setDirectionsCount(1);
    const backgroundFrame = new gd.Sprite();
    backgroundFrame.setImageName('Background');
    backgroundAnimation.getDirection(0).addSprite(backgroundFrame);
    backgroundFrame.delete();
    gd.asSpriteConfiguration(backObject.getConfiguration())
      .getAnimations()
      .addAnimation(backgroundAnimation);
    backgroundAnimation.delete();
    const atlas = new gd.ImageResource();
    atlas.setName('Tileset');
    atlas.setFile('assets/tiles.png');
    project.getResourcesManager().addResource(atlas);
    atlas.delete();
    const back = layout.getInitialInstances().insertNewInitialInstance();
    back.setObjectName('Back');
    back.setX(0);
    back.setY(0);
    back.setZOrder(1);
    const front = layout.getInitialInstances().insertNewInitialInstance();
    front.setObjectName('Front');
    front.setX(8);
    front.setY(8);
    front.setZOrder(10);

    try {
      const bridge = makeBridge({ getProject: () => project });
      const paletteResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_tilemap_palette',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Tiles',
            atlas_image: 'Tileset',
            tile_size: 16,
            columns: 2,
            rows: 2,
          },
        },
      });
      const palette = JSON.parse(paletteResponse.content[0].text);
      expect(palette.success).toBe(true);
      expect(palette.tiles.map(tile => tile.id)).toEqual([0, 1, 2, 3]);
      expect(palette.tiles[3].sourceRect).toEqual({
        x: 16,
        y: 16,
        width: 16,
        height: 16,
      });

      const orderResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_scene_draw_order',
          arguments: { scene_name: 'Level1' },
        },
      });
      const order = JSON.parse(orderResponse.content[0].text);
      expect(order.bottomToTop.map(instance => instance.objectName)).toEqual([
        'Back',
        'Front',
      ]);
      expect(order.topToBottom[0].objectName).toBe('Front');
      const backBounds = order.bottomToTop.find(
        instance => instance.objectName === 'Back'
      );
      expect(backBounds).toEqual(
        expect.objectContaining({
          width: 960,
          height: 540,
          dimensionSource: 'sprite-image-resource',
          dimensionsExact: true,
        })
      );
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('audits resource paths against allowed asset roots', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-assets-'));
    project.setProjectFile(path.join(tempDir, 'game.json'));
    fs.mkdirSync(path.join(tempDir, 'assets'));
    fs.writeFileSync(path.join(tempDir, 'assets', 'player.png'), '');
    fs.writeFileSync(path.join(tempDir, 'outside.png'), '');

    try {
      const good = new gd.ImageResource();
      good.setName('Player');
      good.setFile('assets/player.png');
      project.getResourcesManager().addResource(good);
      good.delete();
      const bad = new gd.ImageResource();
      bad.setName('Outside');
      bad.setFile('outside.png');
      project.getResourcesManager().addResource(bad);
      bad.delete();

      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'audit_project_asset_sources',
          arguments: { allowed_roots: ['assets'] },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(result.success).toBe(true);
      expect(result.outsideAllowedRoots.map(issue => issue.name)).toEqual([
        'Outside',
      ]);
      expect(result.resourcesByName.Player.isAllowed).toBe(true);
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('patches an event instruction by stable event id and instruction type', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const standard = gd.asStandardEvent(
      layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0)
    );
    standard.setAiGeneratedEventId('health-follow');
    const action = new gd.Instruction();
    action.setType('SetX');
    action.setParametersCount(3);
    action.setParameter(0, 'HealthBar');
    action.setParameter(1, '=');
    action.setParameter(2, 'Enemy.X()-40');
    standard.getActions().insert(action, 0);
    action.delete();

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'patch_scene_event_instruction',
          arguments: {
            scene_name: 'Level1',
            event_id: 'health-follow',
            instruction_kind: 'action',
            instruction_type: 'SetX',
            object_name: 'HealthBar',
            parameters: [
              'HealthBar',
              '=',
              'Enemy.CenterX()-HealthBar.Width()/2',
            ],
            summary_only: true,
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(true);
      expect(result.eventPath).toBe('event-0');
      expect(result.serializedEvents).toBeUndefined();

      const patched = gd.asStandardEvent(layout.getEvents().getEventAt(0));
      expect(
        patched
          .getActions()
          .get(0)
          .getParameter(2)
          .getPlainString()
      ).toBe('Enemy.CenterX()-HealthBar.Width()/2');
    } finally {
      project.delete();
    }
  });

  it('replaces JavaScript event code by stable event id', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const baseEvent = layout
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::JsCode', 0);
    baseEvent.setAiGeneratedEventId('level-script');
    const jsEvent = gd.asJsCodeEvent(baseEvent);
    jsEvent.setInlineCode(
      'runtimeScene.getVariables().get("Old").setNumber(1);'
    );

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'replace_javascript_event_code',
          arguments: {
            scene_name: 'Level1',
            event_id: 'level-script',
            code_string: 'runtimeScene.getVariables().get("Score").add(1);',
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(true);
      expect(result.eventPath).toBe('event-0');
      expect(result.before.code).toContain('"Old"');
      expect(result.after.code).toContain('"Score"');
      expect(result.eventsAsText).toContain('JavaScript event');
      expect(result.eventsAsText).not.toContain('unknown/unsupported');
      expect(
        gd.asJsCodeEvent(layout.getEvents().getEventAt(0)).getInlineCode()
      ).toBe('runtimeScene.getVariables().get("Score").add(1);');
    } finally {
      project.delete();
    }
  });

  it('attaches a UI object to an object top and reports gameplay rule checks', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Enemy', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'EnemyHealthBar', 1);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });
      const attachResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'attach_object_to_object_top',
          arguments: {
            scene_name: 'Level1',
            follower_object_name: 'EnemyHealthBar',
            target_object_name: 'Enemy',
            y_offset: -4,
            event_id: 'enemy-healthbar-follow',
          },
        },
      });
      const attach = JSON.parse(attachResponse.content[0].text);
      expect(attachResponse.isError).not.toBe(true);
      expect(attach.aiGeneratedEventId).toBe('enemy-healthbar-follow');
      expect(attach.expressions.x).toBe(
        'Enemy.CenterX()-EnemyHealthBar.Width()/2'
      );
      expect(attach.expressions.y).toBe('Enemy.Y()-EnemyHealthBar.Height()-4');

      const event = gd.asStandardEvent(layout.getEvents().getEventAt(0));
      expect(event.getAiGeneratedEventId()).toBe('enemy-healthbar-follow');
      expect(
        event
          .getActions()
          .get(0)
          .getType()
      ).toBe('SetX');
      expect(
        event
          .getActions()
          .get(1)
          .getType()
      ).toBe('SetY');

      const rulesResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'inspect_gameplay_rules',
          arguments: {
            scene_name: 'Level1',
            top_attachments: [
              {
                follower_object_name: 'EnemyHealthBar',
                target_object_name: 'Enemy',
              },
            ],
          },
        },
      });
      const rules = JSON.parse(rulesResponse.content[0].text);
      expect(rules.ok).toBe(true);
      expect(rules.checks[0]).toEqual(
        expect.objectContaining({ kind: 'top_attachment', ok: true })
      );
    } finally {
      project.delete();
    }
  });

  it('binds sprite animations from a standard asset directory', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Warrior', 0);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-anims-'));
    project.setProjectFile(path.join(tempDir, 'game.json'));
    fs.mkdirSync(path.join(tempDir, 'assets', 'Warrior', 'Idle'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(tempDir, 'assets', 'Warrior', 'Run'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(tempDir, 'assets', 'Warrior', 'Idle', '0.png'),
      ''
    );
    fs.writeFileSync(
      path.join(tempDir, 'assets', 'Warrior', 'Idle', '1.png'),
      ''
    );
    fs.writeFileSync(
      path.join(tempDir, 'assets', 'Warrior', 'Run', '0.png'),
      ''
    );

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bind_sprite_animations_from_directory',
          arguments: {
            scene_name: 'Level1',
            object_name: 'Warrior',
            directory: 'assets/Warrior',
            frame_duration: 0.1,
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.animationsBound).toEqual([
        expect.objectContaining({ name: 'Idle', frameCount: 2 }),
        expect.objectContaining({ name: 'Run', frameCount: 1 }),
      ]);
      expect(
        project.getResourcesManager().hasResource('Warrior_Idle_0_0')
      ).toBe(true);
      const sprite = gd.asSpriteConfiguration(
        layout
          .getObjects()
          .getObject('Warrior')
          .getConfiguration()
      );
      expect(sprite.getAnimations().getAnimationsCount()).toBe(2);
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('snapshots and restores the project (rollback)', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      // Snapshot, then make a change, then restore and confirm rollback.
      const snapResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: { name: 'snapshot_project', arguments: { label: 'before' } },
      });
      const snap = JSON.parse(snapResponse.content[0].text);
      expect(snap.success).toBe(true);
      expect(typeof snap.snapshotId).toBe('string');

      // Mutate: add a second scene.
      project.insertNewLayout('Level2', 1);
      expect(project.getLayoutsCount()).toBe(2);

      const restoreResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'restore_project_snapshot',
          arguments: { snapshot_id: snap.snapshotId },
        },
      });
      const restore = JSON.parse(restoreResponse.content[0].text);
      expect(restore.success).toBe(true);
      // Rolled back to the single-scene snapshot.
      expect(project.getLayoutsCount()).toBe(1);
      expect(project.hasLayoutNamed('Level1')).toBe(true);
      expect(project.hasLayoutNamed('Level2')).toBe(false);
    } finally {
      project.delete();
    }
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

  it('saves, closes stale previews, relaunches paused, and inspects runtime state', async () => {
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

    expect(response.isError).not.toBe(true);
    expect(result.success).toBe(true);
    expect(result.saved).toBe(true);
    expect(result.closedWindows).toBe(true);
    expect(result.closedDebuggerConnections).toBe(true);
    expect(result.requestedPause).toBe(true);
    expect(result.pauseAttempted).toBe(true);
    expect(result.launch.pauseConfirmed).toBe(true);
    expect(result.launchAttempts).toHaveLength(2);
    expect(result.launchAttempts[0].success).toBe(false);
    expect(result.launchAttempts[1].success).toBe(true);
    expect(result.debuggerId).toBe('preview-ws-new');
    expect(result.sceneName).toBe('Level1');
    expect(result.runtime.objectInstanceCounts.Player).toBe(1);
    expect(saveProjectAndWait).toHaveBeenCalled();
    expect(closeAllPreviews).toHaveBeenCalled();
    expect(closeAllConnections).toHaveBeenCalled();
    expect(runCommand).toHaveBeenCalledTimes(2);
    expect(runCommand).toHaveBeenCalledWith('LAUNCH_DEBUG_PREVIEW');
    expect(
      sent.some(
        entry =>
          entry.id === 'preview-ws-new' && entry.message.command === 'pause'
      )
    ).toBe(true);
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

  it('lists behavior names already on an object', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const hero = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Hero', 0);
    // Add a concrete behavior so objectBehaviors has a known entry. Capability
    // behaviors (Animation/Effect/...) are materialized on project load; this
    // test asserts the objectBehaviors mechanism itself.
    gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
      project,
      hero,
      'DestroyOutsideBehavior::DestroyOutside',
      'DestroyOutside'
    );

    try {
      const bridge = makeBridge({ getProject: () => project });
      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'list_available_behaviors',
          arguments: { object_name: 'Hero', scene_name: 'Level1' },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(Array.isArray(result.objectBehaviors)).toBe(true);
      const entry = result.objectBehaviors.find(
        b => b.behaviorName === 'DestroyOutside'
      );
      expect(entry).toBeDefined();
      expect(entry.behaviorType).toBe('DestroyOutsideBehavior::DestroyOutside');
    } finally {
      project.delete();
    }
  });

  it('batch-adds behaviors and declares variables via bulk_edit_scene_assets', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bulk_edit_scene_assets',
          arguments: {
            scene_name: 'Level1',
            behaviors: [
              {
                object_name: 'Player',
                behavior_type: 'DestroyOutsideBehavior::DestroyOutside',
              },
            ],
            variables: [
              { scope: 'scene', name: 'Score', value: 0, type: 'number' },
              { scope: 'global', name: 'Best', value: 10, type: 'number' },
            ],
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.counts.behaviors).toBe(1);
      expect(result.counts.variables).toBe(2);
      expect(
        layout
          .getObjects()
          .getObject('Player')
          .getAllBehaviorNames()
          .toJSArray()
      ).toContain('DestroyOutside');
      expect(layout.getVariables().has('Score')).toBe(true);
      expect(project.getVariables().has('Best')).toBe(true);
    } finally {
      project.delete();
    }
  });

  it('bulk_edit_scene_assets dry_run does NOT mutate (assets or events)', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const triggerUnsavedChanges: any = jest.fn();
    // A real processEditorFunctionCalls would write events; assert it is NEVER
    // called under dry_run (the previous bug wrote events despite dry_run).
    const processEditorFunctionCalls = jest.fn(async () => ({ results: [] }));

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        triggerUnsavedChanges,
        processEditorFunctionCalls,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bulk_edit_scene_assets',
          arguments: {
            scene_name: 'Level1',
            dry_run: true,
            variables: [{ scope: 'scene', name: 'Score', value: 0 }],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'SetNumberVariable' },
                    parameters: ['Score', '=', '0'],
                  },
                ],
              },
            ],
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(result.dryRun).toBe(true);
      expect(result.mutated).toBe(false);
      // Nothing was written: no scene variable, no events, no events follow-up,
      // and the project was not marked dirty.
      expect(layout.getVariables().has('Score')).toBe(false);
      expect(layout.getEvents().getEventsCount()).toBe(0);
      expect(processEditorFunctionCalls).not.toHaveBeenCalled();
      expect(triggerUnsavedChanges).not.toHaveBeenCalled();
    } finally {
      project.delete();
    }
  });

  it('writes events through bulk_edit_scene_assets with validation', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);

    try {
      // The events part is routed to the add_scene_events editor function, which
      // is exercised via a mocked processEditorFunctionCalls (the real pipeline
      // is integration-tested elsewhere). We assert bulk forwards the events.
      let editorCall: any = null;
      const processEditorFunctionCalls: any = (jest.fn(
        async ({ functionCalls }) => {
          editorCall = functionCalls[0];
          return {
            results: [
              { call_id: 'mcp-call', status: 'success', eventsCount: 1 },
            ],
          };
        }
      ): any);
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        processEditorFunctionCalls,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bulk_edit_scene_assets',
          arguments: {
            scene_name: 'Level1',
            variables: [
              { scope: 'scene', name: 'Score', value: 0, type: 'number' },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  { type: { value: 'SceneJustBegins' }, parameters: [''] },
                ],
                actions: [
                  {
                    type: { value: 'SetNumberVariable' },
                    parameters: ['Score', '=', '0'],
                  },
                ],
              },
            ],
          },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      // The assets part ran (variable declared), and events were forwarded LAST
      // to the add_scene_events editor function with the serialized events.
      expect(result.counts.variables).toBe(1);
      expect(layout.getVariables().has('Score')).toBe(true);
      expect(result.events).toBeDefined();
      expect(processEditorFunctionCalls).toHaveBeenCalled();
      expect(editorCall.name).toBe('add_scene_events');
      expect(editorCall.arguments).toContain('SetNumberVariable');
    } finally {
      project.delete();
    }
  });

  it('blocks bulk_edit_scene_assets legacy event payloads before mutating assets', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    const processEditorFunctionCalls: any = (jest.fn(): any);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
        processEditorFunctionCalls,
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'bulk_edit_scene_assets',
          arguments: {
            scene_name: 'Level1',
            variables: [
              { scope: 'scene', name: 'Score', value: 0, type: 'number' },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'ObjectVariableAsBoolean' },
                    parameters: ['GroundSlot', 'Occupied', 'false'],
                  },
                ],
                actions: [],
              },
            ],
          },
        },
      });
      const result = JSON.parse(response.content[0].text);

      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(false);
      expect(result.error).toContain('event validation failed');
      expect(result.errors[0]).toEqual(
        expect.objectContaining({
          type: 'legacy-function-only-instruction-in-scene-events',
          instructionType: 'ObjectVariableAsBoolean',
          replacementType: 'BooleanObjectVariable',
        })
      );
      expect(layout.getVariables().has('Score')).toBe(false);
      expect(layout.getEvents().getEventsCount()).toBe(0);
      expect(processEditorFunctionCalls).not.toHaveBeenCalled();
    } finally {
      project.delete();
    }
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

  it('generates placeholder image and sound assets', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-gen-'));
    project.setProjectFile(path.join(tempDir, 'game.json'));

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const imageResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'generate_placeholder_asset',
          arguments: {
            name: 'Player',
            asset_type: 'image',
            width: 16,
            height: 16,
            color: '60;120;220',
          },
        },
      });
      const imageResult = JSON.parse(imageResponse.content[0].text);
      expect(imageResponse.isError).not.toBe(true);
      expect(imageResult.success).toBe(true);
      expect(fs.existsSync(imageResult.resolvedFile)).toBe(true);
      expect(fs.statSync(imageResult.resolvedFile).size).toBeGreaterThan(0);
      // PNG magic bytes.
      const header = fs.readFileSync(imageResult.resolvedFile).slice(0, 8);
      expect([...header]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(project.getResourcesManager().hasResource('Player')).toBe(true);

      const soundResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'generate_placeholder_asset',
          arguments: { name: 'Shoot', asset_type: 'sound', duration_ms: 50 },
        },
      });
      const soundResult = JSON.parse(soundResponse.content[0].text);
      expect(soundResult.success).toBe(true);
      expect(fs.existsSync(soundResult.resolvedFile)).toBe(true);
      // WAV RIFF header.
      expect(
        fs
          .readFileSync(soundResult.resolvedFile)
          .slice(0, 4)
          .toString('ascii')
      ).toBe('RIFF');
      expect(project.getResourcesManager().hasResource('Shoot')).toBe(true);

      // Richer image: a gradient circle. Still a valid PNG, larger than 1x1.
      const shapeResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'generate_placeholder_asset',
          arguments: {
            name: 'Orb',
            asset_type: 'image',
            width: 32,
            height: 32,
            shape: 'circle',
            color: '255;0;0',
            color2: '0;0;255',
          },
        },
      });
      const shapeResult = JSON.parse(shapeResponse.content[0].text);
      expect(shapeResult.success).toBe(true);
      expect([
        ...fs.readFileSync(shapeResult.resolvedFile).slice(0, 8),
      ]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);

      // Richer sound: a square wave with ADSR.
      const sqResponse = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'generate_placeholder_asset',
          arguments: {
            name: 'Laser',
            asset_type: 'sound',
            duration_ms: 60,
            waveform: 'square',
            adsr: { attack: 0.05, decay: 0.1, sustain: 0.5, release: 0.3 },
          },
        },
      });
      const sqResult = JSON.parse(sqResponse.content[0].text);
      expect(sqResult.success).toBe(true);
      expect(
        fs
          .readFileSync(sqResult.resolvedFile)
          .slice(0, 4)
          .toString('ascii')
      ).toBe('RIFF');
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('renders a scene layout to a PNG without running the game', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-render-'));
    project.setProjectFile(path.join(tempDir, 'game.json'));
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    // Two placed instances at known positions.
    const instances = layout.getInitialInstances();
    const a = instances.insertNewInitialInstance();
    a.setObjectName('Player');
    a.setX(10);
    a.setY(20);
    const b = instances.insertNewInitialInstance();
    b.setObjectName('Player');
    b.setX(100);
    b.setY(60);

    try {
      const bridge = makeBridge({
        getProject: () => project,
        getPermissions: () => ({
          allowWriteTools: true,
          allowCommandTools: false,
        }),
      });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'render_scene_to_png',
          arguments: { scene_name: 'Level1' },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(true);
      expect(result.instanceCount).toBe(2);
      // PNG was written with the PNG magic header.
      expect(fs.existsSync(result.resolvedFile)).toBe(true);
      const header = fs.readFileSync(result.resolvedFile).slice(0, 8);
      expect([...header]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('searches the community behavior store and returns usable behaviorTypes', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
    // $FlowFixMe[prop-missing] mocked module.
    getBehaviorsRegistry.mockResolvedValue({
      headers: [
        {
          type: 'Flash::Flash',
          name: 'Flash',
          fullName: 'Flash (blink) object',
          description: 'Make the object blink/flash for a duration.',
          category: 'Visual effect',
          extensionName: 'Flash',
          objectType: '',
          tier: 'reviewed',
          allRequiredBehaviorTypes: [],
        },
        {
          type: 'Health::Health',
          name: 'Health',
          fullName: 'Health points',
          description: 'Give health/lives to an object.',
          category: 'Game mechanic',
          extensionName: 'Health',
          objectType: 'Sprite',
          tier: 'reviewed',
          allRequiredBehaviorTypes: [],
        },
        {
          type: 'Old::Deprecated',
          name: 'Deprecated',
          fullName: 'Old flash thing',
          description: 'flash',
          extensionName: 'Old',
          objectType: '',
          isDeprecated: true,
        },
      ],
    });

    try {
      const bridge = makeBridge({ getProject: () => project });

      const response = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'search_behavior_store',
          arguments: { query: 'flash' },
        },
      });
      const result = JSON.parse(response.content[0].text);
      expect(response.isError).not.toBe(true);
      expect(result.success).toBe(true);
      // Matched the Flash behavior, exposed its full behaviorType, and excluded
      // the deprecated one.
      const types = result.behaviors.map(b => b.behaviorType);
      expect(types).toContain('Flash::Flash');
      expect(types).not.toContain('Old::Deprecated');
      const flash = result.behaviors.find(
        b => b.behaviorType === 'Flash::Flash'
      );
      expect(flash.extensionName).toBe('Flash');
      expect(typeof flash.alreadyInstalled).toBe('boolean');

      // object_type filters out behaviors that require a different object type.
      const filtered = await bridge.handleRendererMcpRequest({
        method: 'tools/call',
        params: {
          name: 'search_behavior_store',
          arguments: { object_type: 'TextObject::Text' },
        },
      });
      const filteredResult = JSON.parse(filtered.content[0].text);
      const filteredTypes = filteredResult.behaviors.map(b => b.behaviorType);
      // Flash applies to any object (objectType ''), Health requires Sprite.
      expect(filteredTypes).toContain('Flash::Flash');
      expect(filteredTypes).not.toContain('Health::Health');
    } finally {
      project.delete();
    }
  });
});
