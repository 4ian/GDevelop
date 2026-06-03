// @flow
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import {
  getMcpPrompts,
  getMcpResources,
  getMcpTools,
  getAllMcpToolsForIntrospection,
  getMcpToolUsageExamples,
  canCallMcpTool,
  isKnownMcpTool,
  type McpPermissionOptions,
} from './McpToolCatalog';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import { serializeToJSON } from '../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { mapFor } from '../Utils/MapFor';
import { type EditorCallbacks } from '../EditorFunctions';
import {
  getEventOperationReference,
  getEventsJsonExamples,
  getExactInstructionMetadata,
  searchInstructionMetadata,
  validateEventsJsonFile,
  validateEventsJson,
  autoQuoteEventParameters,
} from './McpEventKnowledge';
import {
  createOrUpdateExtension,
  createOrUpdateExtensionBehavior,
  createOrUpdateExtensionFunction,
  createOrUpdateExtensionObject,
  createOrUpdateExtensionProperty,
  deleteExtension,
  deleteExtensionBehavior,
  deleteExtensionFunction,
  deleteExtensionObject,
  deleteExtensionProperty,
  inspectExtensionBehavior,
  inspectExtensionFunction,
  inspectExtensionObject,
  inspectExtensionProperty,
  inspectProjectExtension,
  listProjectExtensions,
} from './McpExtensionTools';
import {
  addOrUpdateResource,
  applyValidatedScenePatch,
  bulkEditSceneAssets,
  createSpriteObjectFromResource,
  createTextObject,
  deleteSceneObject,
  inspectProjectCleanup,
  inspectProjectResources,
  listAvailableBehaviors,
  putStructured2dInstances,
  readSceneEventsSerialized,
  readSerializedScene,
  replaceObjectDefinition,
  setObjectProperties,
  setTextObjectProperties,
  setSpriteAnimations,
} from './McpSceneTools';
import {
  compareSceneEventsSemantics,
  createGroup,
  ensureSceneEventIds,
  findSceneEvents,
  lintSceneEvents,
  moveEventsToGroup,
  renameGroup,
  replaceSceneEventsFromFile,
  wrapEventsInGroup,
} from './McpEventTools';
import { setFirstLayout, setProjectProperties } from './McpProjectTools';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const getDefaultProcessEditorFunctionCalls = (): Function => {
  // Lazily require the runner so focused MCP unit tests do not load the full
  // rendering stack pulled by EditorFunctionCallRunner.
  // $FlowFixMe[unsupported-syntax]
  return require('../EditorFunctions/EditorFunctionCallRunner')
    .processEditorFunctionCalls;
};

type RendererMcpRequest = {|
  method: string,
  params: any,
|};

type McpTextContent = {|
  type: 'text',
  text: string,
|};

type McpToolResult = {|
  content: Array<McpTextContent>,
  isError?: boolean,
|};

type McpEditorBridgeContext = {|
  getProject: () => ?gdProject,
  getPermissions: () => McpPermissionOptions,
  i18n: any,
  editorCallbacks: EditorCallbacks,
  processEditorFunctionCalls?: Function,
  triggerUnsavedChanges: () => void,
  runCommand: string => boolean,
  saveProjectAndWait?: () => Promise<any>,
  getEditorSelection?: () => Object,
  getPreviewDebuggerServer?: () => ?Object,
  generateEvents?: Function,
  onSceneEventsModifiedOutsideEditor?: Function,
  onExtensionFunctionEventsModifiedOutsideEditor?: Function,
  onInstancesModifiedOutsideEditor?: Function,
  onObjectsModifiedOutsideEditor?: Function,
  onObjectGroupsModifiedOutsideEditor?: Function,
  ensureExtensionInstalled?: Function,
  onWillInstallExtension?: Function,
  onExtensionInstalled?: Function,
  searchAndInstallAsset?: Function,
  searchAndInstallResources?: Function,
  getAssetStoreTagForNewObject?: string => string | null,
|};

type McpEditorBridge = {|
  handleRendererMcpRequest: RendererMcpRequest => Promise<any>,
|};

const textResult = (payload: any): McpToolResult => ({
  content: [
    {
      type: 'text',
      text:
        typeof payload === 'string'
          ? payload
          : JSON.stringify(payload, null, 2),
    },
  ],
});

const errorResult = (message: string): McpToolResult => ({
  isError: true,
  content: [
    {
      type: 'text',
      text: message,
    },
  ],
});

const mcpDirectEventsRequiredMessage =
  'MCP add_scene_events writes events directly and does not call the GDevelop event generation service. Pass events_json or event_changes.';

const truncateText = (text: string, maxLength?: number): string => {
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(
    0,
    maxLength
  )}\n\n[Truncated by GDevelop MCP server at ${maxLength} characters.]`;
};

const getSceneNames = (project: gdProject): Array<string> =>
  mapFor(0, project.getLayoutsCount(), index =>
    project.getLayoutAt(index).getName()
  );

const getObjectNames = (objectsContainer: gdObjectsContainer): Array<string> =>
  mapFor(0, objectsContainer.getObjectsCount(), index =>
    objectsContainer.getObjectAt(index).getName()
  );

const getEditorState = (
  project: ?gdProject,
  permissions: McpPermissionOptions
) => {
  if (!project) {
    return {
      hasProject: false,
      permissions,
    };
  }

  return {
    hasProject: true,
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    sceneNames: getSceneNames(project),
    permissions,
  };
};

const getProjectSummary = (project: gdProject, sceneName?: ?string): Object => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
  return {
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    ...simplifiedProjectBuilder.getSimplifiedProject(project, {
      scopeToScene: sceneName || undefined,
    }),
  };
};

const getProjectExtensionsSummary = (project: gdProject): Object => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
  return simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(project);
};

const getObjectsSummary = (project: gdProject, sceneName?: ?string): Object => {
  const result: Object = {
    globalObjects: getObjectNames(project.getObjects()),
  };

  if (sceneName) {
    if (!project.hasLayoutNamed(sceneName)) {
      return {
        ...result,
        error: `Scene not found: "${sceneName}".`,
      };
    }

    const scene = project.getLayout(sceneName);
    result.sceneName = sceneName;
    result.sceneObjects = getObjectNames(scene.getObjects());
    return result;
  }

  result.scenes = getSceneNames(project).map(name => {
    const scene = project.getLayout(name);
    return {
      sceneName: name,
      sceneObjects: getObjectNames(scene.getObjects()),
    };
  });
  return result;
};

const getCommandSummaries = () =>
  Object.keys(commandsList).map(commandName => {
    const commandMetadata = commandsList[((commandName: any): CommandName)];
    const { displayText } = commandMetadata;
    return {
      commandName,
      area: commandMetadata.area,
      displayText:
        typeof displayText === 'string'
          ? displayText
          : displayText && displayText.id,
      handledByElectron: !!commandMetadata.handledByElectron,
    };
  });

// ---------------------------------------------------------------------------
// Runtime preview inspection
//
// A running preview connects to the editor's preview debugger server. Sending
// it { command: 'refresh' } makes it reply with a { command: 'dump', payload }
// message containing the full serialized RuntimeGame. We capture that dump plus
// the live status and any console/error logs, and return a compact, defensively
// extracted summary (scene name, per-object live instance counts, top-level
// variable values) so an AI can verify the game actually runs and behaves,
// instead of only knowing a preview was "launched".
// ---------------------------------------------------------------------------

// Read a GDJS Hashtable-like container ({ items: {...} }) or a plain object map.
const readRuntimeMap = (container: any): Object => {
  if (!container || typeof container !== 'object') return {};
  if (container.items && typeof container.items === 'object')
    return container.items;
  return container;
};

// Extract a readable value from a serialized GDJS RuntimeVariable.
const readRuntimeVariableValue = (variable: any): any => {
  if (!variable || typeof variable !== 'object') return undefined;
  if (variable._isStructure && variable._children) {
    const children = readRuntimeMap(variable._children);
    const result = {};
    Object.keys(children).forEach(childName => {
      result[childName] = readRuntimeVariableValue(children[childName]);
    });
    return result;
  }
  // Prefer the string form when it was the last set; otherwise the number.
  if (variable._stringDirty === false && typeof variable._str === 'string')
    return variable._str;
  if (typeof variable._value === 'number') return variable._value;
  if (typeof variable._str === 'string' && variable._str) return variable._str;
  return variable._value;
};

const summarizeRuntimeVariables = (variablesContainer: any): Object => {
  const map = variablesContainer
    ? readRuntimeMap(variablesContainer._variables)
    : {};
  const result = {};
  Object.keys(map).forEach(name => {
    if (name === 'items') return;
    result[name] = readRuntimeVariableValue(map[name]);
  });
  return result;
};

// Build a compact summary from a runtime game dump payload. Defensive: any
// missing/unrecognized field is simply omitted rather than throwing, because
// the dump is the raw runtime object graph and its shape can vary.
// options.positionObjectNames (Set<string>) → include per-instance x/y/angle for
// those object names.
const summarizeRuntimeGameDump = (payload: any, options?: Object): Object => {
  if (!payload || typeof payload !== 'object') {
    return { available: false };
  }
  const positionObjectNames =
    options && options.positionObjectNames instanceof Set
      ? options.positionObjectNames
      : null;
  const wantAllPositions = !!(options && options.allInstancePositions);
  try {
    const summary: Object = {
      available: true,
      paused: !!payload._paused,
      globalVariables: summarizeRuntimeVariables(payload._variables),
      scenes: [],
    };

    const stack =
      payload._sceneStack &&
      Array.isArray(payload._sceneStack._stack)
        ? payload._sceneStack._stack
        : [];
    summary.runningScenesCount = stack.length;
    stack.forEach(scene => {
      if (!scene || typeof scene !== 'object') return;
      // Live instances are in `_instances` (Hashtable<RuntimeObject[]>), keyed
      // by object name. `_objects` is the static ObjectData templates (one per
      // name), NOT instances — reading it would always report 0/1, which is the
      // bug where every count showed 0. Note `_allInstancesList` is stripped
      // from the dump by the runtime, so totals are summed from `_instances`.
      const instancesMap = readRuntimeMap(scene._instances);
      const objectInstanceCounts = {};
      const instancePositions = {};
      let totalInstances = 0;
      Object.keys(instancesMap).forEach(objectName => {
        if (objectName === 'items') return;
        const list = instancesMap[objectName];
        const instances = Array.isArray(list)
          ? list
          : Array.isArray(list && list.items)
          ? list.items
          : [];
        objectInstanceCounts[objectName] = instances.length;
        totalInstances += instances.length;
        // RuntimeObject stores live position as public x/y (not _x/_y).
        if (
          wantAllPositions ||
          (positionObjectNames && positionObjectNames.has(objectName))
        ) {
          instancePositions[objectName] = instances
            .slice(0, 50)
            .map(instance => ({
              x: instance && typeof instance.x === 'number' ? instance.x : undefined,
              y: instance && typeof instance.y === 'number' ? instance.y : undefined,
              angle:
                instance && typeof instance.angle === 'number'
                  ? instance.angle
                  : undefined,
              zOrder:
                instance && typeof instance.zOrder === 'number'
                  ? instance.zOrder
                  : undefined,
            }));
        }
      });
      // Scene clock: _timeManager._timeFromStart is ms since the scene started.
      const timeManager = scene._timeManager;
      const sceneElapsedTimeMs =
        timeManager && typeof timeManager._timeFromStart === 'number'
          ? timeManager._timeFromStart
          : undefined;
      summary.scenes.push({
        name: scene._name,
        isLoaded: scene._isLoaded !== false,
        // Game-time since this scene started (NOT debugger/wall-clock time — do
        // not infer game speed from MCP round-trip latency).
        sceneElapsedTimeMs,
        sceneElapsedTimeSeconds:
          sceneElapsedTimeMs !== undefined
            ? Math.round(sceneElapsedTimeMs) / 1000
            : undefined,
        totalInstances,
        objectInstanceCounts,
        instancePositions:
          Object.keys(instancePositions).length > 0
            ? instancePositions
            : undefined,
        sceneVariables: summarizeRuntimeVariables(scene._variables),
      });
    });

    return summary;
  } catch (error) {
    return {
      available: true,
      summaryError: `Could not fully summarize runtime dump: ${error.message}`,
    };
  }
};

// Capture runtime state from a running preview. Returns a promise that resolves
// to the inspection result (or an error-shaped object). timeoutMs bounds the
// wait for the dump reply.
const captureRunningPreviewState = (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  return new Promise(resolve => {
    if (!previewDebuggerServer) {
      resolve({
        success: false,
        running: false,
        error:
          'No preview debugger server is available in this editor build. Runtime inspection is unsupported here.',
      });
      return;
    }
    if (previewDebuggerServer.getServerState() !== 'started') {
      resolve({
        success: false,
        running: false,
        error:
          'No preview is running. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }, then inspect it.',
      });
      return;
    }

    const previewIds =
      typeof previewDebuggerServer.getExistingPreviewDebuggerIds === 'function'
        ? previewDebuggerServer.getExistingPreviewDebuggerIds()
        : previewDebuggerServer.getExistingDebuggerIds();
    if (!previewIds || !previewIds.length) {
      resolve({
        success: false,
        running: false,
        error:
          'No preview is currently connected. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }.',
      });
      return;
    }

    const requestedId =
      args && typeof args.debugger_id === 'string' ? args.debugger_id : null;
    // Debugger ids are assigned incrementally (preview-ws-0, preview-ws-1, ...),
    // so the LAST id is the most recently launched preview. Default to it so a
    // fresh "Launch new preview" is inspected instead of a stale, already
    // game-over window from a previous run.
    const latestId = previewIds[previewIds.length - 1];
    const targetId =
      requestedId && previewIds.indexOf(requestedId) !== -1
        ? requestedId
        : latestId;

    const timeoutMs =
      args && typeof args.timeout_ms === 'number'
        ? Math.max(200, Math.min(10000, args.timeout_ms))
        : 2500;

    const logs = [];
    let dumpPayload = null;
    let status = null;
    let settled = false;
    let unregister = () => {};

    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        unregister();
      } catch (error) {
        // Ignore unregister failures.
      }
      resolve({
        success: true,
        running: true,
        debuggerId: targetId,
        latestDebuggerId: latestId,
        inspectedLatest: targetId === latestId,
        availableDebuggerIds: previewIds,
        status,
        runtime: summarizeRuntimeGameDump(dumpPayload, {
          positionObjectNames: Array.isArray(args && args.instance_positions_for)
            ? new Set(args.instance_positions_for.map(String))
            : null,
          allInstancePositions: !!(args && args.include_instance_positions),
        }),
        includeRawDump: !!(args && args.include_raw_dump),
        rawDump:
          args && args.include_raw_dump ? dumpPayload || undefined : undefined,
        logs,
        // Surface runtime errors/crashes prominently: error-type console logs,
        // uncaught exceptions and crash reports. This is the closest available
        // signal to "an expression failed at runtime".
        errors: logs.filter(
          entry =>
            entry.command === 'uncaughtException' ||
            entry.command === 'game.crashed' ||
            entry.command === 'error' ||
            (entry.command === 'console.log' &&
              entry.payload &&
              entry.payload.type === 'error' &&
              !entry.payload.internal)
        ),
        note: dumpPayload
          ? undefined
          : 'No runtime dump was received before the timeout. The preview may be paused, loading, or not responding. status/logs may still be useful.',
      });
    };

    try {
      unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: receivedError => {
          logs.push({
            command: 'error',
            payload: {
              message:
                (receivedError && receivedError.message) ||
                String(receivedError),
              type: 'error',
            },
          });
        },
        onServerStateChanged: () => {},
        onConnectionClosed: () => {},
        onConnectionOpened: () => {},
        onConnectionErrored: ({ errorMessage }) => {
          logs.push({
            command: 'error',
            payload: { message: errorMessage, type: 'error' },
          });
        },
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (!parsedMessage || typeof parsedMessage !== 'object') return;
          if (parsedMessage.command === 'dump') {
            dumpPayload = parsedMessage.payload;
            // Got what we came for; resolve promptly.
            finish();
          } else if (parsedMessage.command === 'status') {
            status = parsedMessage.payload || parsedMessage.status || null;
          } else if (
            parsedMessage.command === 'console.log' ||
            parsedMessage.command === 'hotReloaderLogs' ||
            parsedMessage.command === 'uncaughtException' ||
            parsedMessage.command === 'game.crashed'
          ) {
            logs.push(parsedMessage);
          }
        },
      });
    } catch (error) {
      resolve({
        success: false,
        running: true,
        error: `Could not register debugger callbacks: ${error.message}`,
      });
      return;
    }

    try {
      previewDebuggerServer.sendMessage(targetId, { command: 'getStatus' });
      previewDebuggerServer.sendMessage(targetId, { command: 'refresh' });
    } catch (error) {
      finish();
      return;
    }

    setTimeout(finish, timeoutMs);
  });
};

// Capture a screenshot of the current rendered frame from a running preview.
// Uses the debugger request/response channel (sendMessageWithResponse) to ask
// the running game for canvas.toDataURL, then writes the PNG to disk (or returns
// the data URL when no file path is given / filesystem is unavailable).
const capturePreviewScreenshot = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  if (!previewDebuggerServer) {
    return {
      success: false,
      running: false,
      error:
        'No preview debugger server is available in this editor build. Screenshot capture is unsupported here.',
    };
  }
  if (previewDebuggerServer.getServerState() !== 'started') {
    return {
      success: false,
      running: false,
      error:
        'No preview is running. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }, then capture a screenshot.',
    };
  }
  const previewIds =
    typeof previewDebuggerServer.getExistingPreviewDebuggerIds === 'function'
      ? previewDebuggerServer.getExistingPreviewDebuggerIds()
      : previewDebuggerServer.getExistingDebuggerIds();
  if (!previewIds || !previewIds.length) {
    return {
      success: false,
      running: false,
      error:
        'No preview is currently connected. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }.',
    };
  }
  if (typeof previewDebuggerServer.sendMessageWithResponse !== 'function') {
    return {
      success: false,
      running: true,
      error:
        'This editor build does not support request/response debugger messages required for screenshots.',
    };
  }

  let response;
  try {
    response = await previewDebuggerServer.sendMessageWithResponse({
      command: 'captureScreenshot',
    });
  } catch (error) {
    return {
      success: false,
      running: true,
      error: `Screenshot request failed or timed out: ${error.message ||
        error}. The preview may be loading or not responding.`,
    };
  }

  const payload = (response && response.payload) || {};
  if (!payload.dataUrl) {
    return {
      success: false,
      running: true,
      error:
        payload.error ||
        'The preview did not return image data. The game canvas may not be ready yet.',
      width: payload.width,
      height: payload.height,
    };
  }

  const base64 = payload.dataUrl.replace(/^data:image\/png;base64,/, '');
  const filePath =
    args && typeof args.file_path === 'string' ? args.file_path : null;

  // No file path requested, or filesystem not available: return the data URL.
  if (!filePath || !fs) {
    return {
      success: true,
      running: true,
      width: payload.width,
      height: payload.height,
      dataUrl: payload.dataUrl,
      note: filePath
        ? 'Filesystem access is unavailable; returning the data URL instead of writing a file.'
        : 'No file_path given; returning the PNG as a base64 data URL.',
    };
  }

  try {
    if (path) {
      const directory = path.dirname(filePath);
      if (directory && !fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
    }
    fs.writeFileSync(filePath, base64, 'base64');
  } catch (error) {
    return {
      success: false,
      running: true,
      error: `Could not write screenshot to "${filePath}": ${error.message}`,
      width: payload.width,
      height: payload.height,
      dataUrl: payload.dataUrl,
    };
  }

  return {
    success: true,
    running: true,
    filePath,
    width: payload.width,
    height: payload.height,
  };
};

// Map GDevelop key names to raw DOM key codes (+ location for left/right
// modifiers), so callers can pass "Space"/"Left"/"a" instead of numbers.
// Mirrors GDJS keysNameToCode but stores RAW codes for modifiers (the runtime's
// onKeyPressed re-applies the location offset).
const KEY_NAME_TO_CODE: { [string]: {| code: number, location?: number |} } = (() => {
  const map = {};
  const add = (name, code, location) => {
    map[name.toLowerCase()] = location ? { code, location } : { code };
  };
  for (let c = 65; c <= 90; c++) add(String.fromCharCode(c), c); // a-z
  for (let n = 0; n <= 9; n++) add('num' + n, 48 + n);
  for (let n = 0; n <= 9; n++) add('numpad' + n, 96 + n);
  add('space', 32); add('return', 13); add('enter', 13); add('escape', 27);
  add('tab', 9); add('back', 8); add('backspace', 8); add('delete', 46);
  add('insert', 45); add('pageup', 33); add('pagedown', 34); add('end', 35);
  add('home', 36); add('pause', 19); add('menu', 93);
  add('left', 37); add('up', 38); add('right', 39); add('down', 40);
  add('add', 107); add('subtract', 109); add('multiply', 106); add('divide', 111);
  add('semicolon', 186); add('comma', 188); add('period', 190); add('quote', 222);
  add('slash', 191); add('backslash', 220); add('equal', 187); add('dash', 189);
  add('lbracket', 219); add('rbracket', 221); add('tilde', 192);
  for (let f = 1; f <= 12; f++) add('f' + f, 111 + f);
  // Modifiers: raw code + location (1 = left, 2 = right).
  add('shift', 16); add('lshift', 16, 1); add('rshift', 16, 2);
  add('control', 17); add('ctrl', 17); add('lcontrol', 17, 1); add('rcontrol', 17, 2);
  add('alt', 18); add('lalt', 18, 1); add('ralt', 18, 2);
  add('lsystem', 91, 1); add('rsystem', 91, 2);
  return map;
})();

const MOUSE_BUTTON_NAME_TO_CODE: { [string]: number } = {
  left: 0,
  right: 1,
  middle: 2,
  back: 3,
  forward: 4,
};

// Resolve one high-level input descriptor to the low-level shape the runtime
// simulateInput command expects. Returns { ok, input?, error? }.
const resolveSimulatedInput = (raw: any): Object => {
  if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') {
    return { ok: false, error: 'Each input needs a string "type".' };
  }
  const type = raw.type;
  if (type === 'keyPressed' || type === 'keyReleased') {
    let code = typeof raw.key_code === 'number' ? raw.key_code : null;
    let location = typeof raw.location === 'number' ? raw.location : undefined;
    if (code === null && typeof raw.key === 'string') {
      const mapped = KEY_NAME_TO_CODE[raw.key.toLowerCase()];
      if (!mapped) {
        return { ok: false, error: `Unknown key name: "${raw.key}".` };
      }
      code = mapped.code;
      if (mapped.location !== undefined) location = mapped.location;
    }
    if (code === null) {
      return { ok: false, error: `${type} needs "key" or "key_code".` };
    }
    return { ok: true, input: { type, keyCode: code, location } };
  }
  if (type === 'releaseAllKeys') {
    return { ok: true, input: { type } };
  }
  if (type === 'mouseMove') {
    return { ok: true, input: { type, x: raw.x, y: raw.y } };
  }
  if (type === 'mouseButtonPressed' || type === 'mouseButtonReleased') {
    const button =
      typeof raw.button === 'number'
        ? raw.button
        : typeof raw.button === 'string'
        ? MOUSE_BUTTON_NAME_TO_CODE[raw.button.toLowerCase()]
        : 0;
    return { ok: true, input: { type, button: button || 0 } };
  }
  if (type === 'touchStart' || type === 'touchMove') {
    return {
      ok: true,
      input: { type, identifier: raw.identifier || 0, x: raw.x, y: raw.y },
    };
  }
  if (type === 'touchEnd') {
    return { ok: true, input: { type, identifier: raw.identifier || 0 } };
  }
  return { ok: false, error: `Unknown input type: "${type}".` };
};

// Inject simulated input into a running preview. Sends a 'simulateInput' command
// (request/response) and returns what was applied.
const simulatePreviewInput = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  if (!previewDebuggerServer) {
    return {
      success: false,
      running: false,
      error:
        'No preview debugger server is available in this editor build. Input simulation is unsupported here.',
    };
  }
  if (previewDebuggerServer.getServerState() !== 'started') {
    return {
      success: false,
      running: false,
      error:
        'No preview is running. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }, then simulate input.',
    };
  }
  const previewIds =
    typeof previewDebuggerServer.getExistingPreviewDebuggerIds === 'function'
      ? previewDebuggerServer.getExistingPreviewDebuggerIds()
      : previewDebuggerServer.getExistingDebuggerIds();
  if (!previewIds || !previewIds.length) {
    return {
      success: false,
      running: false,
      error: 'No preview is currently connected.',
    };
  }
  const rawInputs = Array.isArray(args && args.inputs) ? args.inputs : null;
  if (!rawInputs || !rawInputs.length) {
    return {
      success: false,
      running: true,
      error:
        'Missing "inputs": an array of input descriptors, e.g. [{ type: "keyPressed", key: "Left" }].',
    };
  }
  const resolved = [];
  for (const raw of rawInputs) {
    const result = resolveSimulatedInput(raw);
    if (!result.ok) {
      return { success: false, running: true, error: result.error };
    }
    resolved.push(result.input);
  }

  const targetId =
    args && typeof args.debugger_id === 'string'
      ? args.debugger_id
      : previewIds[previewIds.length - 1];

  // Prefer request/response so we can report what the runtime applied; fall back
  // to fire-and-forget sendMessage if unsupported.
  if (typeof previewDebuggerServer.sendMessageWithResponse === 'function') {
    try {
      const response = await previewDebuggerServer.sendMessageWithResponse({
        command: 'simulateInput',
        inputs: resolved,
      });
      const payload = (response && response.payload) || {};
      return {
        success: !payload.error,
        running: true,
        debuggerId: targetId,
        applied: payload.applied,
        error: payload.error || undefined,
      };
    } catch (error) {
      // Fall through to fire-and-forget.
    }
  }
  try {
    previewDebuggerServer.sendMessage(targetId, {
      command: 'simulateInput',
      inputs: resolved,
    });
  } catch (error) {
    return {
      success: false,
      running: true,
      error: `Could not send input to the preview: ${error.message}`,
    };
  }
  return {
    success: true,
    running: true,
    debuggerId: targetId,
    appliedCount: resolved.length,
    note:
      'Input sent (fire-and-forget; this build does not confirm application). Press and release are separate inputs; hold a key by sending keyPressed without keyReleased.',
  };
};

// Auto-quote safe bare string literals (e.g. layer "HUD", a timer identifier) in
// the events_json / event_changes[].generated_events of an add_scene_events
// payload, so callers do not have to remember to escape them. Mutates a shallow
// copy of args and returns it; never throws (best-effort normalization).
const autoQuoteAddSceneEventsArgs = (
  project: ?gdProject,
  args: Object
): Object => {
  if (!project || !args) return args;
  const normalizeJsonString = (jsonString: any): any => {
    if (typeof jsonString !== 'string' || !jsonString.trim()) return jsonString;
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return jsonString;
      const changed = autoQuoteEventParameters(project, parsed);
      return changed > 0 ? JSON.stringify(parsed) : jsonString;
    } catch (error) {
      // Leave invalid JSON untouched; validation will report it.
      return jsonString;
    }
  };

  const next = { ...args };
  if (typeof next.events_json === 'string') {
    next.events_json = normalizeJsonString(next.events_json);
  }
  if (Array.isArray(next.event_changes)) {
    next.event_changes = next.event_changes.map(change => {
      if (!change || typeof change !== 'object') return change;
      const updated = { ...change };
      if (typeof updated.generated_events === 'string') {
        updated.generated_events = normalizeJsonString(updated.generated_events);
      }
      if (typeof updated.generatedEvents === 'string') {
        updated.generatedEvents = normalizeJsonString(updated.generatedEvents);
      }
      return updated;
    });
  }
  return next;
};

const getPrompt = (name: string) => {
  const prompt = getMcpPrompts().find(prompt => prompt.name === name);
  if (!prompt) return null;
  return {
    description: prompt.description,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt.description,
        },
      },
    ],
  };
};

const getResourceContent = async (
  uri: string,
  context: McpEditorBridgeContext
) => {
  const project = context.getProject();
  const permissions = context.getPermissions();

  if (uri === 'gdevelop://editor/state') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getEditorState(project, permissions), null, 2),
    };
  }

  if (!project) {
    throw new Error('No project opened.');
  }

  if (uri === 'gdevelop://project/summary') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getProjectSummary(project), null, 2),
    };
  }

  if (uri === 'gdevelop://project/json') {
    return {
      uri,
      mimeType: 'application/json',
      text: serializeToJSON(project),
    };
  }

  if (uri === 'gdevelop://project/extensions-summary') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getProjectExtensionsSummary(project), null, 2),
    };
  }

  if (uri === 'gdevelop://project/resources.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(inspectProjectResources(project), null, 2),
    };
  }

  const sceneResourceMatch = uri.match(
    /^gdevelop:\/\/scene\/([^/]+)\/(events\.txt|events\.json|instances\.json|objects\.json|scene\.json)$/
  );
  if (!sceneResourceMatch) {
    throw new Error(`Unknown GDevelop MCP resource: ${uri}`);
  }

  const sceneName = decodeURIComponent(sceneResourceMatch[1]);
  const resourceKind = sceneResourceMatch[2];
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }

  if (resourceKind === 'events.txt') {
    return {
      uri,
      mimeType: 'text/plain',
      text: renderNonTranslatedEventsAsText({
        eventsList: project.getLayout(sceneName).getEvents(),
      }),
    };
  }

  if (resourceKind === 'events.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(
        readSceneEventsSerialized(project, { scene_name: sceneName }),
        null,
        2
      ),
    };
  }

  if (resourceKind === 'scene.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(
        readSerializedScene(project, { scene_name: sceneName }),
        null,
        2
      ),
    };
  }

  if (resourceKind === 'objects.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getObjectsSummary(project, sceneName), null, 2),
    };
  }

  const instancesResult = await callMcpTool({
    toolName: 'describe_instances',
    args: { scene_name: sceneName },
    context,
  });
  return {
    uri,
    mimeType: 'application/json',
    text: instancesResult.content[0].text,
  };
};

const callEditorFunction = async ({
  toolName,
  args,
  context,
}: {|
  toolName: string,
  args: Object,
  context: McpEditorBridgeContext,
|}): Promise<McpToolResult> => {
  const project = context.getProject();
  const processEditorFunctionCalls =
    context.processEditorFunctionCalls ||
    getDefaultProcessEditorFunctionCalls();

  const { results } = await processEditorFunctionCalls({
    project,
    i18n: context.i18n,
    editorCallbacks: context.editorCallbacks,
    toolOptions: { includeEventsJson: true },
    functionCalls: [
      {
        name: toolName,
        arguments: JSON.stringify(args || {}),
        call_id: 'mcp-call',
      },
    ],
    relatedAiRequestId: 'mcp',
    getRelatedAiRequestLastMessages: () => ({
      lastUserMessage: null,
      lastAssistantMessages: [],
    }),
    generateEvents:
      context.generateEvents ||
      (async () => ({
        generationCompleted: false,
        errorMessage: 'Event generation is not available through MCP.',
      })),
    onSceneEventsModifiedOutsideEditor:
      context.onSceneEventsModifiedOutsideEditor || (() => {}),
    onInstancesModifiedOutsideEditor:
      context.onInstancesModifiedOutsideEditor || (() => {}),
    onObjectsModifiedOutsideEditor:
      context.onObjectsModifiedOutsideEditor || (() => {}),
    onObjectGroupsModifiedOutsideEditor:
      context.onObjectGroupsModifiedOutsideEditor || (() => {}),
    ensureExtensionInstalled:
      context.ensureExtensionInstalled || (async () => {}),
    onWillInstallExtension: context.onWillInstallExtension || (() => {}),
    onExtensionInstalled: context.onExtensionInstalled || (() => {}),
    searchAndInstallAsset:
      context.searchAndInstallAsset ||
      (async () => ({
        status: 'error',
        message: 'Asset search is not available through MCP.',
        createdObjects: [],
        assetShortHeader: null,
        isTheFirstOfItsTypeInProject: false,
      })),
    searchAndInstallResources:
      context.searchAndInstallResources ||
      (async () => ({
        results: [],
      })),
    getAssetStoreTagForNewObject:
      context.getAssetStoreTagForNewObject || (() => null),
  });

  const firstResult = results[0];
  if (!firstResult) {
    return errorResult('The editor function did not return a result.');
  }

  if (firstResult.status === 'aborted') {
    return errorResult('The editor function was aborted.');
  }

  if (firstResult.status === 'working') {
    return textResult(firstResult);
  }

  if (firstResult.didModifyProject) {
    context.triggerUnsavedChanges();
  }

  return firstResult.success
    ? textResult(firstResult.output)
    : errorResult(
        firstResult.output && firstResult.output.message
          ? firstResult.output.message
          : JSON.stringify(firstResult.output || {}, null, 2)
      );
};

const callMcpTool = async ({
  toolName,
  args,
  context,
}: {|
  toolName: string,
  args: Object,
  context: McpEditorBridgeContext,
|}): Promise<McpToolResult> => {
  const permissions = context.getPermissions();
  const targetToolName =
    toolName === 'gdevelop_editor_call' && args && typeof args.name === 'string'
      ? args.name
      : toolName;
  const permission = canCallMcpTool(targetToolName, permissions);
  if (!permission.canCall) {
    return errorResult(permission.reason || 'MCP tool is not allowed.');
  }

  const project = context.getProject();

  if (toolName === 'gdevelop_get_editor_state') {
    return textResult(getEditorState(project, permissions));
  }

  if (toolName === 'gdevelop_get_editor_selection') {
    return textResult(
      context.getEditorSelection
        ? context.getEditorSelection()
        : {
            hasActiveSelectionProvider: false,
            selections: [],
            primarySelection: null,
          }
    );
  }

  if (toolName === 'gdevelop_get_project_summary') {
    if (!project) return errorResult('No project opened.');
    return textResult(getProjectSummary(project, args.sceneName));
  }

  if (toolName === 'gdevelop_read_project_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      truncateText(serializeToJSON(project), args.maxLength || undefined)
    );
  }

  if (toolName === 'read_game_project_json') {
    if (!project) return errorResult('No project opened.');
    const serializedProject = JSON.parse(serializeToJSON(project));
    return textResult({
      success: true,
      projectName: project.getName(),
      projectUuid: project.getProjectUuid(),
      serializedProject,
      serializedProjectJson: truncateText(
        JSON.stringify(serializedProject, null, 2),
        args.maxLength || undefined
      ),
    });
  }

  if (toolName === 'gdevelop_list_scenes') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getSceneNames(project).map(sceneName => ({
        sceneName,
      }))
    );
  }

  if (toolName === 'gdevelop_list_objects') {
    if (!project) return errorResult('No project opened.');
    return textResult(getObjectsSummary(project, args.sceneName));
  }

  if (toolName === 'gdevelop_list_extensions') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(listProjectExtensions(project));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectProjectExtension(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_function') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionFunction(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_behavior') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionBehavior(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_object') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionObject(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_property') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionProperty(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_list_commands') {
    return textResult(getCommandSummaries());
  }

  if (toolName === 'gdevelop_get_events_json_examples') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getEventsJsonExamples({
        project,
        sceneName:
          args && typeof args.scene_name === 'string' ? args.scene_name : null,
        includeExistingSceneEvents: !!(
          args && args.include_existing_scene_events
        ),
      })
    );
  }

  if (toolName === 'gdevelop_get_event_operation_reference') {
    return textResult(getEventOperationReference());
  }

  if (toolName === 'gdevelop_validate_events_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      validateEventsJson({
        project,
        sceneName:
          args && typeof args.scene_name === 'string' ? args.scene_name : null,
        eventsJson:
          args && typeof args.events_json === 'string'
            ? args.events_json
            : null,
        allowJavaScriptEvents: !!(args && args.allow_javascript_events),
        dedupeErrors: !!(args && args.dedupe_errors),
      })
    );
  }

  if (toolName === 'validate_events_json_file') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      validateEventsJsonFile({
        project,
        sceneName:
          args && typeof args.scene_name === 'string' ? args.scene_name : null,
        eventsJsonFile:
          args && typeof args.events_json_file === 'string'
            ? args.events_json_file
            : null,
        allowJavaScriptEvents: !!(args && args.allow_javascript_events),
        summaryOnly: !!(args && args.summary_only),
        dedupeErrors: !!(args && args.dedupe_errors),
      })
    );
  }

  if (toolName === 'gdevelop_search_instruction_metadata') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      searchInstructionMetadata({
        project,
        i18n: context.i18n,
        query: args && typeof args.query === 'string' ? args.query : null,
        kind: args && typeof args.kind === 'string' ? args.kind : null,
        limit: args && typeof args.limit === 'number' ? args.limit : null,
        compact: !!(args && args.compact),
      })
    );
  }

  if (toolName === 'gdevelop_get_instruction_metadata') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getExactInstructionMetadata({
        project,
        type: args && typeof args.type === 'string' ? args.type : null,
        kind: args && typeof args.kind === 'string' ? args.kind : null,
        compact: !!(args && args.compact),
      })
    );
  }

  if (toolName === 'inspect_tool_schema') {
    const requestedToolName =
      args && typeof args.tool_name === 'string' ? args.tool_name : null;
    const tools = getAllMcpToolsForIntrospection();
    if (requestedToolName) {
      const tool = tools.find(tool => tool.name === requestedToolName);
      if (!tool) return errorResult(`Unknown MCP tool: ${requestedToolName}.`);
      return textResult({
        tool,
        examples: getMcpToolUsageExamples(requestedToolName)[requestedToolName],
        callPermission: canCallMcpTool(requestedToolName, permissions),
      });
    }

    return textResult({
      tools: tools.map(tool => ({
        tool,
        examples: getMcpToolUsageExamples(tool.name)[tool.name],
        callPermission: canCallMcpTool(tool.name, permissions),
      })),
    });
  }

  if (toolName === 'get_tool_usage_examples') {
    const requestedToolName =
      args && typeof args.tool_name === 'string' ? args.tool_name : null;
    return textResult({
      examples: requestedToolName
        ? getMcpToolUsageExamples(requestedToolName)[requestedToolName]
        : getMcpToolUsageExamples(),
    });
  }

  if (toolName === 'read_serialized_scene') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(readSerializedScene(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'read_scene_events_serialized') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(readSceneEventsSerialized(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_project_resources') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectProjectResources(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_project_cleanup') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectProjectCleanup(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'list_available_behaviors') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(listAvailableBehaviors(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_running_preview') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      const result = await captureRunningPreviewState(
        previewDebuggerServer,
        args || {}
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'capture_preview_screenshot') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      const result = await capturePreviewScreenshot(
        previewDebuggerServer,
        args || {}
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'simulate_preview_input') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      const result = await simulatePreviewInput(
        previewDebuggerServer,
        args || {}
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'find_scene_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(findSceneEvents(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'lint_scene_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(lintSceneEvents(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'compare_scene_events_semantics') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(compareSceneEventsSemantics(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_run_command') {
    const commandName =
      args && typeof args.commandName === 'string' ? args.commandName : '';
    if (!commandName) return errorResult('Missing commandName.');
    const commandMetadata = commandsList[((commandName: any): CommandName)];
    if (!commandMetadata) {
      return errorResult(`Unknown command: ${commandName}.`);
    }
    const didRun = context.runCommand(commandName);
    return didRun
      ? textResult({ commandName, launched: true })
      : errorResult(`Unknown or unavailable command: ${commandName}.`);
  }

  if (toolName === 'gdevelop_save_project_and_wait') {
    if (!context.saveProjectAndWait) {
      return errorResult(
        'The GDevelop host did not provide saveProjectAndWait, so MCP cannot confirm that the project was written to disk.'
      );
    }
    try {
      const result = await context.saveProjectAndWait();
      return textResult({
        saved: !!result,
        result,
      });
    } catch (error) {
      return errorResult(
        error && error.message
          ? error.message
          : 'Unable to save the project through MCP.'
      );
    }
  }

  if (toolName === 'gdevelop_editor_call') {
    if (!args || typeof args.name !== 'string') {
      return errorResult('Missing EditorFunction name.');
    }
    const editorFunctionArgs =
      args.arguments && typeof args.arguments === 'object'
        ? args.arguments
        : {};
    if (args.name !== 'gdevelop_editor_call' && isKnownMcpTool(args.name)) {
      return callMcpTool({
        toolName: args.name,
        args: editorFunctionArgs,
        context,
      });
    }
    if (
      (args.name === 'add_scene_events' || args.name === 'generate_events') &&
      !editorFunctionArgs.events_json &&
      !editorFunctionArgs.event_changes
    ) {
      return errorResult(mcpDirectEventsRequiredMessage);
    }
    return callEditorFunction({
      toolName: args.name,
      args:
        args.name === 'add_scene_events' || args.name === 'generate_events'
          ? autoQuoteAddSceneEventsArgs(context.getProject(), editorFunctionArgs)
          : editorFunctionArgs,
      context,
    });
  }

  if (
    (toolName === 'add_scene_events' || toolName === 'generate_events') &&
    !args.events_json &&
    !args.event_changes
  ) {
    return errorResult(mcpDirectEventsRequiredMessage);
  }

  let extensionWriteToolHandler = null;
  if (toolName === 'gdevelop_create_or_update_extension') {
    extensionWriteToolHandler = createOrUpdateExtension;
  } else if (toolName === 'gdevelop_delete_extension') {
    extensionWriteToolHandler = deleteExtension;
  } else if (toolName === 'gdevelop_create_or_update_extension_function') {
    extensionWriteToolHandler = createOrUpdateExtensionFunction;
  } else if (toolName === 'gdevelop_delete_extension_function') {
    extensionWriteToolHandler = deleteExtensionFunction;
  } else if (toolName === 'gdevelop_create_or_update_extension_behavior') {
    extensionWriteToolHandler = createOrUpdateExtensionBehavior;
  } else if (toolName === 'gdevelop_delete_extension_behavior') {
    extensionWriteToolHandler = deleteExtensionBehavior;
  } else if (toolName === 'gdevelop_create_or_update_extension_object') {
    extensionWriteToolHandler = createOrUpdateExtensionObject;
  } else if (toolName === 'gdevelop_delete_extension_object') {
    extensionWriteToolHandler = deleteExtensionObject;
  } else if (toolName === 'gdevelop_create_or_update_extension_property') {
    extensionWriteToolHandler = createOrUpdateExtensionProperty;
  } else if (toolName === 'gdevelop_delete_extension_property') {
    extensionWriteToolHandler = deleteExtensionProperty;
  }

  if (extensionWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = extensionWriteToolHandler(project, args || {});
      if (
        toolName === 'gdevelop_create_or_update_extension_function' &&
        args &&
        (typeof args.events_json === 'string' ||
          (args.serialized_function &&
            typeof args.serialized_function === 'object')) &&
        context.onExtensionFunctionEventsModifiedOutsideEditor
      ) {
        context.onExtensionFunctionEventsModifiedOutsideEditor({
          extensionName: args.extension_name,
          parentKind: result.parentKind || args.parent_kind || 'extension',
          parentName:
            result.parentKind === 'extension' ||
            args.parent_kind === 'extension'
              ? null
              : args.parent_name || null,
          functionName:
            result.function && result.function.name
              ? result.function.name
              : args.new_function_name || args.function_name,
          newOrChangedAiGeneratedEventIds: new Set(),
        });
      }
      context.triggerUnsavedChanges();
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  let projectWriteToolHandler = null;
  if (toolName === 'set_project_properties') {
    projectWriteToolHandler = setProjectProperties;
  } else if (toolName === 'set_first_layout') {
    projectWriteToolHandler = setFirstLayout;
  }

  if (projectWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = projectWriteToolHandler(project, args || {});
      context.triggerUnsavedChanges();
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  let sceneWriteToolHandler = null;
  if (toolName === 'add_or_update_resource') {
    sceneWriteToolHandler = addOrUpdateResource;
  } else if (toolName === 'create_sprite_object_from_resource') {
    sceneWriteToolHandler = createSpriteObjectFromResource;
  } else if (toolName === 'create_text_object') {
    sceneWriteToolHandler = createTextObject;
  } else if (toolName === 'bulk_edit_scene_assets') {
    sceneWriteToolHandler = bulkEditSceneAssets;
  } else if (toolName === 'set_sprite_animations') {
    sceneWriteToolHandler = setSpriteAnimations;
  } else if (toolName === 'replace_object_definition') {
    sceneWriteToolHandler = replaceObjectDefinition;
  } else if (toolName === 'delete_scene_object') {
    sceneWriteToolHandler = deleteSceneObject;
  } else if (toolName === 'set_object_properties') {
    sceneWriteToolHandler = setObjectProperties;
  } else if (toolName === 'set_text_object_properties') {
    sceneWriteToolHandler = setTextObjectProperties;
  } else if (
    toolName === 'put_2d_instances' &&
    args &&
    Array.isArray(args.instances)
  ) {
    sceneWriteToolHandler = putStructured2dInstances;
  } else if (toolName === 'apply_validated_scene_patch') {
    sceneWriteToolHandler = applyValidatedScenePatch;
  } else if (toolName === 'create_group') {
    sceneWriteToolHandler = createGroup;
  } else if (toolName === 'wrap_events_in_group') {
    sceneWriteToolHandler = wrapEventsInGroup;
  } else if (toolName === 'move_events_to_group') {
    sceneWriteToolHandler = moveEventsToGroup;
  } else if (toolName === 'rename_group') {
    sceneWriteToolHandler = renameGroup;
  } else if (toolName === 'ensure_scene_event_ids') {
    sceneWriteToolHandler = ensureSceneEventIds;
  } else if (toolName === 'replace_scene_events_from_file') {
    sceneWriteToolHandler = replaceSceneEventsFromFile;
  }

  if (sceneWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = sceneWriteToolHandler(project, args || {}, {
        onSceneEventsModifiedOutsideEditor:
          context.onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor:
          context.onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor: context.onObjectsModifiedOutsideEditor,
      });
      context.triggerUnsavedChanges();
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  return callEditorFunction({
    toolName,
    args:
      (toolName === 'add_scene_events' || toolName === 'generate_events') &&
      args
        ? autoQuoteAddSceneEventsArgs(project, args)
        : args || {},
    context,
  });
};

export const createMcpEditorBridge = (
  context: McpEditorBridgeContext
): McpEditorBridge => ({
  handleRendererMcpRequest: async ({
    method,
    params,
  }: RendererMcpRequest): Promise<any> => {
    const permissions = context.getPermissions();

    if (method === 'tools/list') {
      return {
        tools: getMcpTools(permissions),
      };
    }

    if (method === 'resources/list') {
      return {
        resources: getMcpResources(),
      };
    }

    if (method === 'prompts/list') {
      return {
        prompts: getMcpPrompts(),
      };
    }

    if (method === 'prompts/get') {
      const prompt = getPrompt(params && params.name);
      if (!prompt)
        throw new Error(`Unknown GDevelop MCP prompt: ${params.name}`);
      return prompt;
    }

    if (method === 'resources/read') {
      const uri = params && params.uri;
      if (typeof uri !== 'string') throw new Error('Missing resource uri.');
      const content = await getResourceContent(uri, context);
      return {
        contents: [content],
      };
    }

    if (method === 'tools/call') {
      const toolName = params && params.name;
      if (typeof toolName !== 'string') throw new Error('Missing tool name.');
      return callMcpTool({
        toolName,
        args:
          params.arguments && typeof params.arguments === 'object'
            ? params.arguments
            : {},
        context,
      });
    }

    throw new Error(`Unsupported renderer MCP method: ${method}`);
  },
});
