// @flow

import {
  getMcpPrompts,
  getMcpResources,
  getMcpTools,
  getAllMcpToolsForIntrospection,
  getMcpToolUsageExamples,
  canCallMcpTool,
  type McpPermissionOptions,
} from './McpToolCatalog';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  MULTI_FILE_ENTRY_NAME,
  decomposeLegacyProjectToFiles,
  parseTomlSource,
} from '../ProjectsStorage/MultiFileProjectFormat';
import {
  openMultiFileProject,
  readMultiFileSourceTree,
  resolveGameUriToPath,
} from '../ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject';
import { writeProjectSourceCatalogs } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import {
  buildBehaviorPropertySchemasByType,
  validateProjectSettingsCatalog,
} from '../ProjectsStorage/ProjectSourceCatalog';
import { validateReviewedExtensionJavaScriptAuthoring } from '../ProjectsStorage/JavaScriptAuthoringApi';
import { mapFor } from '../Utils/MapFor';
import {
  keyDefinitions,
  getKeyboardKeyDefinition,
} from '../Utils/KeyboardKeyNames';
import { type EditorCallbacks } from '../EditorFunctions';

import { inspectSignalUsage } from './McpExtensionTools';
import { validateSerializedProject } from './McpProjectTools';

import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const crypto = optionalRequire('crypto');
const electron = optionalRequire('electron');
const nativeImage = electron && electron.nativeImage;

// Monotonic id used to match targeted preview request/response messages.
let nextTargetedRequestId = 1;

const PREVIEW_CLEANUP_RELAUNCH_ACTION =
  'control_preview { action: "close", close_all: true }, then launch_preview { start_paused: true, force_new: true }';

type McpRequestProgress = {|
  phase: string,
|};
type McpRequestProgressReporter = McpRequestProgress => void;

type RendererMcpRequest = {|
  method: string,
  params: any,
  reportProgress?: McpRequestProgressReporter,
|};

type McpTextContent = {|
  type: 'text',
  text: string,
|};

type McpToolResult = {|
  content: Array<McpTextContent>,
  isError?: boolean,
  structuredContent?: Object,
|};

type McpEditorBridgeContext = {|
  getProject: () => ?gdProject,
  getPermissions: () => McpPermissionOptions,
  i18n: any,
  editorCallbacks: EditorCallbacks,
  processEditorFunctionCalls?: Function,
  triggerUnsavedChanges: () => void,
  runCommand: string => boolean,
  // Launch a preview of a specific scene, independent of the editor's active
  // tab. Optional: when absent, launch_preview falls back to runCommand (which
  // previews the active tab) and flags that scene selection was not honored.
  launchPreviewForScene?: (
    sceneName: ?string,
    options?: {| displayCollisionShapes?: boolean |}
  ) => mixed,
  // Resolve the current scene-aware launcher at call time. A project reload
  // replaces and deletes the native gdProject, so a callback captured before
  // reload must not be reused by a later verify_project_change stage.
  getLaunchPreviewForScene?: () => ?(
    sceneName: ?string,
    options?: {| displayCollisionShapes?: boolean |}
  ) => mixed,
  cancelPreviewLaunch?: (reason: string) => mixed,
  getPreviewLaunchState?: () => Object,
  beginPreviewLaunchSequence?: () => boolean,
  endPreviewLaunchSequence?: () => void,
  reloadProjectAndWait?: (
    reportProgress?: McpRequestProgressReporter
  ) => Promise<any>,
  openProjectAndWait?: ({|
    projectPath: string,
    discardUnsavedChanges: boolean,
    reportProgress?: McpRequestProgressReporter,
  |}) => Promise<any>,
  reportProgress?: McpRequestProgressReporter,
  saveProjectAndWait?: () => Promise<any>,
  getPersistenceState?: () => {|
    hasUnsavedChanges: boolean,
    changesCount: number,
    timeOfFirstChangeSinceLastSave: number | null,
  |},
  getEditorSelection?: () => Object,
  getPreviewDebuggerServer?: () => ?Object,
  closeAllPreviews?: () => mixed,
  focusAllPreviews?: () => void,
  injectPreviewClickUserGesture?: (inputs: Array<Object>) => Promise<?Object>,
  capturePreviewPage?: (windowId: ?number) => Promise<?Object>,
  generateEvents?: Function,
  onSceneEventsModifiedOutsideEditor?: Function,
  onInstancesModifiedOutsideEditor?: Function,
  onObjectsModifiedOutsideEditor?: Function,
  onObjectGroupsModifiedOutsideEditor?: Function,
  // Called after an extension is reloaded wholesale (a full unserializeFrom that
  // frees and rebuilds its child containers), so the editor drops stale wrappers
  // for that extension's open tabs/panels and avoids a use-after-free.
  onExtensionModifiedOutsideEditor?: (extensionName: string) => void,
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

type SceneEventsOutsideEditorChanges = {|
  scene: gdLayout,
  newOrChangedAiGeneratedEventIds: Set<string>,
|};

type SceneEventsNotifier = SceneEventsOutsideEditorChanges => void;

const createDeferredSceneEventsNotifier = (
  notifySceneEventsModified: ?SceneEventsNotifier
): ?SceneEventsNotifier => {
  if (!notifySceneEventsModified) return undefined;

  const pendingEventIdsByScene: Map<gdLayout, Set<string>> = new Map();
  let isFlushScheduled = false;

  return changes => {
    let pendingEventIds = pendingEventIdsByScene.get(changes.scene);
    if (!pendingEventIds) {
      pendingEventIds = new Set();
      pendingEventIdsByScene.set(changes.scene, pendingEventIds);
    }
    const eventIds = pendingEventIds;
    changes.newOrChangedAiGeneratedEventIds.forEach(eventId =>
      eventIds.add(eventId)
    );

    if (isFlushScheduled) return;
    isFlushScheduled = true;
    setTimeout(() => {
      isFlushScheduled = false;
      const pendingNotifications = Array.from(pendingEventIdsByScene.entries());
      pendingEventIdsByScene.clear();
      pendingNotifications.forEach(([scene, newOrChangedAiGeneratedEventIds]) =>
        notifySceneEventsModified({
          scene,
          newOrChangedAiGeneratedEventIds,
        })
      );
    }, 0);
  };
};

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
  ...(payload && typeof payload === 'object' && !Array.isArray(payload)
    ? { structuredContent: payload }
    : undefined),
});

const errorResult = (message: string, details?: Object): McpToolResult => {
  const payload = {
    success: false,
    error: message,
    ...(details || {}),
  };
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
};

const getProjectFilesValidationPhase = (code: ?string): string => {
  if (!code) return 'load-and-compose-project-files';
  if (code === 'MULTIFILE_INVALID_TOML') return 'parse-settings';
  if (code === 'PROJECT_CATALOG_REGENERATION_FAILED') {
    return 'regenerate-project-catalogs';
  }
  if (code.startsWith('LAYOUT_')) return 'compile-layout';
  if (code.startsWith('IFDO_')) return 'compile-events';
  if (
    code === 'MULTIFILE_MISSING_FILE' ||
    code === 'MULTIFILE_INVALID_ENTRY' ||
    code === 'MULTIFILE_PATH_ESCAPE'
  ) {
    return 'load-project-files';
  }
  return 'compose-game-json';
};

const getErrorLocation = (error: any): {| line: ?number, column: ?number |} => {
  let line = typeof error.line === 'number' ? error.line : null;
  let column = typeof error.column === 'number' ? error.column : null;
  const message = error && error.message ? String(error.message) : '';
  const tomlLocation = message.match(/\bat row (\d+), col (\d+)/i);
  if (tomlLocation) {
    if (line === null) line = Number(tomlLocation[1]);
    if (column === null) column = Number(tomlLocation[2]);
  }
  return { line, column };
};

const getValidationSourceExcerpt = ({
  projectFile,
  fileUri,
  line,
}: {|
  projectFile: string,
  fileUri: ?string,
  line: ?number,
|}): ?Array<Object> => {
  if (!fs || !path || !fileUri || !line || !fileUri.startsWith('game://')) {
    return null;
  }
  try {
    const sourcePath = path.resolve(
      path.dirname(projectFile),
      ...fileUri.slice('game://'.length).split('/')
    );
    const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n|\r/);
    const firstLine = Math.max(1, line - 2);
    const lastLine = Math.min(lines.length, line + 2);
    const excerpt = [];
    for (let lineNumber = firstLine; lineNumber <= lastLine; lineNumber++) {
      excerpt.push({
        line: lineNumber,
        text: lines[lineNumber - 1],
        isErrorLine: lineNumber === line,
      });
    }
    return excerpt;
  } catch (readError) {
    return null;
  }
};

const getProjectFilesValidationDiagnostic = (
  error: any,
  projectFile: string
): Object => {
  const code =
    error && typeof error.code === 'string'
      ? error.code
      : 'PROJECT_FILES_VALIDATION_FAILED';
  const fileUri =
    error && typeof error.fileUri === 'string' ? error.fileUri : null;
  const { line, column } = getErrorLocation(error);
  let filePath = null;
  if (path && fileUri && fileUri.startsWith('game://')) {
    filePath = resolveGameUriToPath(path.dirname(projectFile), fileUri);
  }
  return {
    severity: 'error',
    phase: getProjectFilesValidationPhase(code),
    code,
    errorType: error && typeof error.name === 'string' ? error.name : 'Error',
    message:
      error && error.message
        ? String(error.message)
        : 'Unable to validate the project files.',
    fileUri: fileUri || undefined,
    filePath: filePath || undefined,
    line: line || undefined,
    column: column || undefined,
    sourceExcerpt:
      getValidationSourceExcerpt({ projectFile, fileUri, line }) || undefined,
  };
};

const addProjectSourceLocationDetails = (
  diagnostic: Object,
  projectFile: string
): Object => {
  const fileUri =
    diagnostic && typeof diagnostic.fileUri === 'string'
      ? diagnostic.fileUri
      : null;
  const line = diagnostic && Number(diagnostic.line || 0);
  if (!fileUri) return diagnostic;
  const filePath =
    path && fileUri.startsWith('game://')
      ? resolveGameUriToPath(path.dirname(projectFile), fileUri)
      : undefined;
  return {
    ...diagnostic,
    filePath,
    sourceExcerpt:
      getValidationSourceExcerpt({ projectFile, fileUri, line }) || undefined,
  };
};

const generateProjectSourceCatalogsFromDisk = async (
  projectFile: string
): Promise<{| projectRoot: string, catalogs: Object |}> => {
  const projectRoot = path ? path.dirname(projectFile) : null;
  if (!projectRoot) {
    throw new Error(
      'Filesystem path support is unavailable, so project catalogs cannot be regenerated.'
    );
  }

  // Bootstrap from disk without trusting the potentially stale generated
  // instruction catalog. Each catalog write is awaited and verified by the
  // project writer before this helper resolves.
  const catalogSource = await openMultiFileProject(projectFile, {
    ignoreInstructionCatalog: true,
    skipEventsCompilation: true,
  });
  const catalogProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    try {
      unserializeFromJSObject(catalogProject, catalogSource);
      const catalogs = await writeProjectSourceCatalogs(
        catalogProject,
        projectRoot
      );
      return { projectRoot, catalogs };
    } catch (error) {
      const catalogError: any = new Error(
        `Unable to regenerate the project source catalogs: ${
          error && error.message ? error.message : String(error)
        }`
      );
      catalogError.name = 'ProjectCatalogRegenerationError';
      catalogError.code = 'PROJECT_CATALOG_REGENERATION_FAILED';
      throw catalogError;
    }
  } finally {
    catalogProject.delete();
  }
};

// Extract the JSON payload from a textResult/errorResult-shaped tool response,
// so one tool can embed another tool's outcome in its own result.

const getSceneNames = (project: gdProject): Array<string> =>
  mapFor(0, project.getLayoutsCount(), index =>
    project.getLayoutAt(index).getName()
  );

const getObjectNames = (objectsContainer: gdObjectsContainer): Array<string> =>
  mapFor(0, objectsContainer.getObjectsCount(), index =>
    objectsContainer.getObjectAt(index).getName()
  );

const getProjectFileLocation = (
  project: gdProject
): {| projectFile: ?string, projectFolder: ?string |} => {
  const projectFile = project.getProjectFile() || null;
  const projectFolder = projectFile && path ? path.dirname(projectFile) : null;
  return { projectFile, projectFolder };
};

const stableJsonStringify = (value: any): string => {
  if (value === undefined) return '"__undefined__"';
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableJsonStringify).join(',')}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`)
    .join(',')}}`;
};

const hashStructuredValue = (value: any): string => {
  const serialized = stableJsonStringify(value);
  if (crypto && typeof crypto.createHash === 'function') {
    return crypto
      .createHash('sha256')
      .update(serialized)
      .digest('hex');
  }

  // Deterministic fallback for browser builds where Node crypto is absent.
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index++) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

const getEditorState = (
  project: ?gdProject,
  permissions: McpPermissionOptions,
  previewLaunchState?: ?Object
) => {
  if (!project) {
    return {
      hasProject: false,
      permissions,
      previewLaunchState: previewLaunchState || undefined,
    };
  }

  const { projectFile, projectFolder } = getProjectFileLocation(project);
  return {
    hasProject: true,
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    // Absolute project file + folder. Project-relative source and resource
    // paths are resolved against projectFolder, which may differ from the
    // caller's current working directory.
    projectFile,
    projectFolder,
    sceneNames: getSceneNames(project),
    permissions,
    previewLaunchState: previewLaunchState || undefined,
  };
};

const getProjectSummary = (project: gdProject, sceneName?: ?string): Object => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
  const { projectFile, projectFolder } = getProjectFileLocation(project);
  const simplifiedProject = simplifiedProjectBuilder.getSimplifiedProject(
    project,
    {
      scopeToScene: sceneName || undefined,
    }
  );
  annotateSummaryBehaviorSources(project, simplifiedProject);
  annotateSummaryInstanceVariables(project, simplifiedProject);
  return {
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    projectFile,
    projectFolder,
    behaviorSourceLegend: {
      explicitSerialized:
        'Behavior is explicitly stored on the object in serialized project data.',
      defaultCapabilityInferred:
        'Behavior is a default GDevelop object capability surfaced by the object API; serialized scene data may still show behaviors: [] because only explicit serialized behaviors are stored there.',
    },
    ...simplifiedProject,
  };
};

const annotateSimplifiedObjectBehaviorSources = (
  object: gdObject,
  simplifiedObject: Object
) => {
  if (!simplifiedObject || !Array.isArray(simplifiedObject.behaviors)) return;
  simplifiedObject.behaviors = simplifiedObject.behaviors.map(behavior => {
    let isDefaultCapability = false;
    try {
      if (object.hasBehaviorNamed(behavior.behaviorName)) {
        const gdBehavior = object.getBehavior(behavior.behaviorName);
        isDefaultCapability = gdBehavior.isDefaultBehavior();
      }
    } catch (error) {
      isDefaultCapability = false;
    }
    return {
      ...behavior,
      behaviorSource: isDefaultCapability
        ? 'defaultCapabilityInferred'
        : 'explicitSerialized',
      isDefaultCapability,
    };
  });
};

const annotateSimplifiedObjectsBehaviorSources = (
  objects: gdObjectsContainer,
  simplifiedObjects: ?Array<Object>
) => {
  if (!Array.isArray(simplifiedObjects)) return;
  simplifiedObjects.forEach(simplifiedObject => {
    const objectName = simplifiedObject && simplifiedObject.objectName;
    if (!objectName || !objects.hasObjectNamed(objectName)) return;
    annotateSimplifiedObjectBehaviorSources(
      objects.getObject(objectName),
      simplifiedObject
    );
  });
};

const annotateSummaryBehaviorSources = (
  project: gdProject,
  simplifiedProject: Object
) => {
  annotateSimplifiedObjectsBehaviorSources(
    project.getObjects(),
    simplifiedProject.globalObjects
  );
  if (!Array.isArray(simplifiedProject.scenes)) return;
  simplifiedProject.scenes.forEach(sceneSummary => {
    const sceneName = sceneSummary && sceneSummary.sceneName;
    if (!sceneName || !project.hasLayoutNamed(sceneName)) return;
    annotateSimplifiedObjectsBehaviorSources(
      project.getLayout(sceneName).getObjects(),
      sceneSummary.objects
    );
  });
};

const collectInitialInstanceVariablesSummary = (
  scene: gdLayout
): Array<Object> => {
  const serializedScene = serializeToJSObject(scene);
  const instances = Array.isArray(serializedScene.instances)
    ? serializedScene.instances
    : [];
  return instances
    .map((instance, sourceIndex) => {
      const initialVariables = Array.isArray(instance.initialVariables)
        ? instance.initialVariables
        : [];
      if (!initialVariables.length) return null;
      return {
        objectName: instance.name || instance.objectName || '',
        sourceIndex,
        instanceId:
          typeof instance.persistentUuid === 'string'
            ? instance.persistentUuid.slice(0, 10)
            : undefined,
        initialVariables,
      };
    })
    .filter(Boolean);
};

const annotateSummaryInstanceVariables = (
  project: gdProject,
  simplifiedProject: Object
) => {
  if (!Array.isArray(simplifiedProject.scenes)) return;
  simplifiedProject.scenes.forEach(sceneSummary => {
    const sceneName = sceneSummary && sceneSummary.sceneName;
    if (!sceneName || !project.hasLayoutNamed(sceneName)) return;
    const instanceInitialVariables = collectInitialInstanceVariablesSummary(
      project.getLayout(sceneName)
    );
    if (instanceInitialVariables.length) {
      sceneSummary.instanceInitialVariables = instanceInitialVariables;
    }
  });
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
const readRuntimeMap = (container: any): { [string]: any } => {
  if (!container || typeof container !== 'object') return {};
  if (container.items && typeof container.items === 'object')
    return container.items;
  return container;
};

const summarizeRuntimePlainValue = (value: any, depth = 0): any => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  ) {
    return value;
  }
  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value;
  }
  if (depth >= 4) return '[Maximum inspection depth reached]';
  if (Array.isArray(value)) {
    return value
      .slice(0, 50)
      .map(item => summarizeRuntimePlainValue(item, depth + 1));
  }
  if (!value || typeof value !== 'object') return undefined;
  const result: Object = {};
  Object.keys(value)
    .slice(0, 50)
    .forEach(key => {
      const summarized = summarizeRuntimePlainValue(value[key], depth + 1);
      if (summarized !== undefined) result[key] = summarized;
    });
  return result;
};

// Extract a readable, bounded value from a serialized GDJS RuntimeVariable.
const readRuntimeVariableValue = (variable: any, depth = 0): any => {
  if (!variable || typeof variable !== 'object') return undefined;
  if (variable._isStructure && variable._children) {
    if (depth >= 4) return '[Maximum variable depth reached]';
    const children = readRuntimeMap(variable._children);
    const result: { [string]: any } = {};
    Object.keys(children)
      .slice(0, 50)
      .forEach(childName => {
        result[childName] = readRuntimeVariableValue(
          children[childName],
          depth + 1
        );
      });
    return result;
  }
  // Prefer the string form when it was the last set; otherwise the number.
  if (variable._stringDirty === false && typeof variable._str === 'string') {
    return summarizeRuntimePlainValue(variable._str);
  }
  if (typeof variable._value === 'number') return variable._value;
  if (typeof variable._str === 'string' && variable._str) {
    return summarizeRuntimePlainValue(variable._str);
  }
  return summarizeRuntimePlainValue(variable._value);
};

const summarizeRuntimeVariables = (variablesContainer: any): Object => {
  const map: { [string]: any } = variablesContainer
    ? readRuntimeMap(variablesContainer._variables)
    : {};
  const result: { [string]: any } = {};
  Object.keys(map)
    .filter(name => name !== 'items')
    .slice(0, 50)
    .forEach(name => {
      result[name] = readRuntimeVariableValue(map[name]);
    });
  return result;
};

const readRuntimeNumber = (value: any): ?number =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const summarizeRuntimeForce = (force: any): ?Object => {
  if (!force || typeof force !== 'object') return null;
  const x = readRuntimeNumber(force._x !== undefined ? force._x : force.x);
  const y = readRuntimeNumber(force._y !== undefined ? force._y : force.y);
  const angle = readRuntimeNumber(
    force._angle !== undefined ? force._angle : force.angle
  );
  const length = readRuntimeNumber(
    force._length !== undefined ? force._length : force.length
  );
  if (
    x === undefined &&
    y === undefined &&
    angle === undefined &&
    length === undefined
  ) {
    return null;
  }
  return { x, y, angle, length };
};

const summarizeRuntimeBehavior = (behavior: any): ?Object => {
  if (!behavior || typeof behavior !== 'object') return null;
  const summary: Object = {
    name:
      typeof behavior.name === 'string'
        ? behavior.name
        : typeof behavior._name === 'string'
        ? behavior._name
        : undefined,
    type:
      typeof behavior.type === 'string'
        ? behavior.type
        : typeof behavior._type === 'string'
        ? behavior._type
        : undefined,
    activated:
      typeof behavior._activated === 'boolean'
        ? behavior._activated
        : typeof behavior.activated === 'boolean'
        ? behavior.activated
        : undefined,
  };
  if (behavior._behaviorData && typeof behavior._behaviorData === 'object') {
    summary.properties = summarizeRuntimePlainValue(behavior._behaviorData);
  }
  if (behavior._behaviorVariables) {
    summary.variables = summarizeRuntimeVariables(behavior._behaviorVariables);
  }

  // Runtime behaviors expose useful state as own scalar fields. Keep the
  // response bounded and exclude graph links/managers that expand the dump.
  const state: Object = {};
  Object.keys(behavior)
    .filter(
      key =>
        ![
          'name',
          '_name',
          'type',
          '_type',
          '_activated',
          'activated',
          'owner',
          '_owner',
          '_runtimeScene',
          '_manager',
          '_behaviorData',
          '_behaviorVariables',
        ].includes(key)
    )
    .slice(0, 50)
    .forEach(key => {
      const value = behavior[key];
      if (
        value === null ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string'
      ) {
        state[key] =
          typeof value === 'string' && value.length > 500
            ? `${value.slice(0, 500)}...`
            : value;
      }
    });
  if (Object.keys(state).length) summary.state = state;
  return summary;
};

const summarizeRuntimeBehaviors = (instance: any): ?Array<Object> => {
  if (!instance || typeof instance !== 'object') return null;
  let behaviors;
  if (Array.isArray(instance._behaviors)) {
    behaviors = instance._behaviors;
  } else if (
    instance._behaviorsTable &&
    typeof instance._behaviorsTable === 'object'
  ) {
    behaviors = Object.values(readRuntimeMap(instance._behaviorsTable));
  } else {
    return null;
  }
  return behaviors
    .slice(0, 50)
    .map(summarizeRuntimeBehavior)
    .filter(Boolean);
};

const makeRuntimeSummaryOptions = (args: Object): Object => {
  const requestedObjects = Array.isArray(args && args.objects)
    ? args.objects.slice(0, 50).map(String)
    : [];
  const requestedIncludes = Array.isArray(args && args.include)
    ? args.include.map(String)
    : [];
  const defaultIncludes = [
    'position',
    'angle',
    'forces',
    'variables',
    'behaviors',
  ];
  const instanceIndexes = Array.isArray(args && args.instance_indexes)
    ? Array.from(
        new Set(
          args.instance_indexes
            .filter(index => Number.isInteger(index) && index >= 0)
            .slice(0, 50)
        )
      )
    : null;
  return {
    positionObjectNames: Array.isArray(args && args.instance_positions_for)
      ? new Set(args.instance_positions_for.map(String))
      : null,
    allInstancePositions: !!(args && args.include_instance_positions),
    instanceObjectNames: new Set(requestedObjects),
    instanceIncludes: new Set(
      requestedIncludes.length ? requestedIncludes : defaultIncludes
    ),
    instanceIndexes,
  };
};

const summarizeRuntimeInstance = (
  instance: any,
  index: number,
  includes: Set<string>
): Object => {
  const summary: Object = {
    index,
    id:
      instance &&
      (typeof instance.id === 'number' || typeof instance.id === 'string')
        ? instance.id
        : undefined,
    persistentUuid:
      instance && typeof instance.persistentUuid === 'string'
        ? instance.persistentUuid
        : instance && typeof instance._persistentUuid === 'string'
        ? instance._persistentUuid
        : undefined,
    networkId:
      instance &&
      (typeof instance.networkId === 'number' ||
        typeof instance.networkId === 'string')
        ? instance.networkId
        : instance &&
          (typeof instance._networkId === 'number' ||
            typeof instance._networkId === 'string')
        ? instance._networkId
        : undefined,
    picked:
      instance && typeof instance.pick === 'boolean'
        ? instance.pick
        : undefined,
  };
  const missingFields = [];

  if (includes.has('position')) {
    const position = {
      x: instance ? readRuntimeNumber(instance.x) : undefined,
      y: instance ? readRuntimeNumber(instance.y) : undefined,
      z: instance
        ? readRuntimeNumber(instance.z !== undefined ? instance.z : instance._z)
        : undefined,
      layer:
        instance && typeof instance.layer === 'string'
          ? instance.layer
          : undefined,
      zOrder: instance ? readRuntimeNumber(instance.zOrder) : undefined,
    };
    if (position.x === undefined && position.y === undefined) {
      missingFields.push('position');
    } else {
      summary.position = position;
    }
  }

  if (includes.has('angle')) {
    const angle = instance ? readRuntimeNumber(instance.angle) : undefined;
    if (angle === undefined) missingFields.push('angle');
    else summary.angle = angle;
  }

  if (includes.has('forces')) {
    const permanentX = instance
      ? readRuntimeNumber(instance._permanentForceX)
      : undefined;
    const permanentY = instance
      ? readRuntimeNumber(instance._permanentForceY)
      : undefined;
    const permanent =
      permanentX !== undefined || permanentY !== undefined
        ? {
            x: permanentX,
            y: permanentY,
            angle:
              permanentX !== undefined && permanentY !== undefined
                ? (Math.atan2(permanentY, permanentX) * 180) / Math.PI
                : undefined,
            length:
              permanentX !== undefined && permanentY !== undefined
                ? Math.sqrt(permanentX * permanentX + permanentY * permanentY)
                : undefined,
          }
        : null;
    const rawInstantaneous = instance
      ? Array.isArray(instance._instantForces)
        ? instance._instantForces
        : Array.isArray(instance._forces)
        ? instance._forces
        : null
      : null;
    const instantaneous = rawInstantaneous
      ? rawInstantaneous
          .slice(0, 50)
          .map(summarizeRuntimeForce)
          .filter(Boolean)
      : null;
    const total = instance
      ? summarizeRuntimeForce(instance._totalForce || instance._averageForce)
      : null;
    const velocity = instance
      ? summarizeRuntimeForce(instance._velocity || instance.velocity)
      : null;
    if (!permanent && instantaneous === null && !total && !velocity) {
      missingFields.push('forces');
    } else {
      summary.forces = {
        permanent: permanent || undefined,
        instantaneous: instantaneous || undefined,
        total: total || undefined,
        velocity: velocity || undefined,
      };
    }
  }

  if (includes.has('variables')) {
    if (!instance || !instance._variables) {
      missingFields.push('variables');
    } else {
      summary.variables = summarizeRuntimeVariables(instance._variables);
    }
  }

  if (includes.has('behaviors')) {
    const behaviors = summarizeRuntimeBehaviors(instance);
    if (behaviors === null) missingFields.push('behaviors');
    else summary.behaviors = behaviors;
  }

  if (missingFields.length) summary.missingFields = missingFields;
  return summary;
};

// Build a compact summary from a runtime game dump payload. Defensive: any
// missing/unrecognized field is simply omitted rather than throwing, because
// the dump is the raw runtime object graph and its shape can vary.
// options.positionObjectNames (Set<string>) → include per-instance x/y/angle for
// those object names.
const summarizeRuntimeGameDump = (
  payload: any,
  options?: Object,
  rendererDiagnostics?: ?Object
): Object => {
  if (!payload || typeof payload !== 'object') {
    return { available: false };
  }
  const positionObjectNames =
    options && options.positionObjectNames instanceof Set
      ? options.positionObjectNames
      : null;
  const wantAllPositions = !!(options && options.allInstancePositions);
  const instanceObjectNames =
    options && options.instanceObjectNames instanceof Set
      ? options.instanceObjectNames
      : new Set();
  const instanceIncludes =
    options && options.instanceIncludes instanceof Set
      ? options.instanceIncludes
      : new Set();
  const instanceIndexes =
    options && Array.isArray(options.instanceIndexes)
      ? options.instanceIndexes
      : null;
  try {
    const summary: Object = {
      available: true,
      paused: !!payload._paused,
      globalVariables: summarizeRuntimeVariables(payload._variables),
      scenes: [],
      rendererDiagnostics: rendererDiagnostics || undefined,
    };

    const stack =
      payload._sceneStack && Array.isArray(payload._sceneStack._stack)
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
      const objectInstanceCounts: { [string]: number } = {};
      const instancePositions: { [string]: Array<Object> } = {};
      const instanceStates: { [string]: Array<Object> } = {};
      const missingInstances: { [string]: Array<number> } = {};
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
              x:
                instance && typeof instance.x === 'number'
                  ? instance.x
                  : undefined,
              y:
                instance && typeof instance.y === 'number'
                  ? instance.y
                  : undefined,
              z:
                instance && typeof instance.z === 'number'
                  ? instance.z
                  : instance && typeof instance._z === 'number'
                  ? instance._z
                  : undefined,
              angle:
                instance && typeof instance.angle === 'number'
                  ? instance.angle
                  : undefined,
              layer:
                instance && typeof instance.layer === 'string'
                  ? instance.layer
                  : undefined,
              zOrder:
                instance && typeof instance.zOrder === 'number'
                  ? instance.zOrder
                  : undefined,
            }));
        }
        if (instanceObjectNames.has(objectName)) {
          const indexes = instanceIndexes
            ? instanceIndexes
            : instances.slice(0, 50).map((instance, index) => index);
          instanceStates[objectName] = [];
          indexes.forEach(index => {
            if (index >= instances.length) {
              if (!missingInstances[objectName]) {
                missingInstances[objectName] = [];
              }
              missingInstances[objectName].push(index);
              return;
            }
            instanceStates[objectName].push(
              summarizeRuntimeInstance(
                instances[index],
                index,
                instanceIncludes
              )
            );
          });
        }
      });
      const missingObjects = Array.from(instanceObjectNames).filter(
        objectName =>
          !Object.prototype.hasOwnProperty.call(instancesMap, objectName)
      );
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
        instanceStates:
          instanceObjectNames.size > 0 ? instanceStates : undefined,
        missingObjects:
          instanceObjectNames.size > 0 ? missingObjects : undefined,
        missingInstances:
          Object.keys(missingInstances).length > 0
            ? missingInstances
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

const buildPreviewDiagnostics = ({
  running,
  previewIds,
  targetId,
  dumpPayload,
  status,
  logs,
  timedOut,
  operation,
}: {|
  running: boolean,
  previewIds?: ?Array<string>,
  targetId?: ?string,
  dumpPayload?: any,
  status?: any,
  logs?: ?Array<Object>,
  timedOut?: boolean,
  operation: string,
|}): Object => {
  const errors = (logs || []).filter(
    entry =>
      entry.command === 'uncaughtException' ||
      entry.command === 'game.crashed' ||
      entry.command === 'error' ||
      (entry.command === 'console.log' &&
        entry.payload &&
        entry.payload.type === 'error' &&
        !entry.payload.internal)
  );
  if (!running) {
    return {
      classification: 'no-running-preview',
      likelyCauses: [
        'No preview window has connected to the debugger yet.',
        'Preview compilation/loading may still be in progress.',
      ],
      recommendedActions: ['launch_preview { start_paused: true }'],
    };
  }
  if (!previewIds || !previewIds.length) {
    return {
      classification: 'preview-not-connected-or-compiling',
      likelyCauses: [
        'The preview server is started but no runtime websocket is connected.',
        'The preview is still compiling/loading, failed before connecting, or was closed.',
      ],
      recommendedActions: [
        'retry after a short delay',
        'launch_preview { start_paused: true }',
      ],
    };
  }
  if (errors.length) {
    return {
      classification: 'runtime-error-or-crash',
      targetDebuggerId: targetId,
      errorCount: errors.length,
      likelyCauses: [
        'The preview runtime reported an uncaught exception, crash, or error-level log.',
      ],
      recommendedActions: [
        'inspect the errors/logs fields',
        'fix the runtime error, then relaunch the preview',
      ],
    };
  }
  if (dumpPayload) {
    return {
      classification: 'responsive',
      targetDebuggerId: targetId,
      likelyCauses: [],
      recommendedActions: [],
    };
  }
  if (status) {
    return {
      classification: 'status-only-no-runtime-dump',
      targetDebuggerId: targetId,
      likelyCauses: [
        'The debugger socket answered status but did not return a runtime dump.',
        'The runtime may be busy, paused during loading, or the debugger dump path is unhealthy.',
      ],
      recommendedActions: [
        'increase timeout_ms',
        'retry gdevelop_inspect_running_preview',
        PREVIEW_CLEANUP_RELAUNCH_ACTION,
      ],
    };
  }
  if (timedOut) {
    return {
      classification: 'debugger-channel-timeout',
      operation,
      targetDebuggerId: targetId,
      likelyCauses: [
        'The targeted preview did not answer the debugger request before timeout.',
        'The window may still be loading, suspended/occluded, or its debugger channel is broken.',
      ],
      recommendedActions: [
        'preview_health_check',
        'control_preview { action: "focus" }',
        PREVIEW_CLEANUP_RELAUNCH_ACTION,
      ],
    };
  }
  return {
    classification: 'connected-unresponsive',
    targetDebuggerId: targetId,
    likelyCauses: [
      'The preview is connected but has not emitted status, logs, or a dump.',
    ],
    recommendedActions: [
      'increase timeout_ms',
      'focus the preview',
      PREVIEW_CLEANUP_RELAUNCH_ACTION,
    ],
  };
};

const getDebuggerLogKey = (entry: Object): string => {
  const payload = entry && entry.payload ? entry.payload : {};
  return [
    entry.command || '',
    payload.timestamp != null ? payload.timestamp : '',
    payload.group || '',
    payload.type || '',
    payload.message || '',
  ].join('\u0001');
};

const mergeUniqueDebuggerLogs = (
  ...logLists: Array<?Array<Object>>
): Array<Object> => {
  const result: Array<Object> = [];
  const seen: Set<string> = new Set();
  logLists.forEach(logList => {
    if (!Array.isArray(logList)) return;
    logList.forEach(entry => {
      if (!entry || typeof entry !== 'object') return;
      const key = getDebuggerLogKey(entry);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(entry);
    });
  });
  return result;
};

const getRecentDebuggerLogs = (
  previewDebuggerServer: Object,
  targetId: string
): Array<Object> => {
  if (
    !previewDebuggerServer ||
    typeof previewDebuggerServer.getRecentLogs !== 'function'
  ) {
    return [];
  }

  try {
    const recentLogs = previewDebuggerServer.getRecentLogs(targetId);
    return Array.isArray(recentLogs) ? recentLogs : [];
  } catch (error) {
    return [];
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
        diagnostics: {
          classification: 'debugger-server-unavailable',
          likelyCauses: [
            'This editor build did not expose a preview debugger server.',
          ],
          recommendedActions: [],
        },
      });
      return;
    }
    if (previewDebuggerServer.getServerState() !== 'started') {
      resolve({
        success: false,
        running: false,
        error:
          'No preview is running. Launch a preview first with launch_preview { start_paused: true }, then inspect it or advance with run_frames.',
        diagnostics: buildPreviewDiagnostics({
          running: false,
          operation: 'inspect',
        }),
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
          'No preview is currently connected. Launch a preview first with launch_preview { start_paused: true }.',
        diagnostics: buildPreviewDiagnostics({
          running: true,
          previewIds: [],
          operation: 'inspect',
        }),
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
    let rendererDiagnostics = null;
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
      const recentLogs = getRecentDebuggerLogs(previewDebuggerServer, targetId);
      const allLogs = mergeUniqueDebuggerLogs(recentLogs, logs);
      const errors = allLogs.filter(
        entry =>
          entry.command === 'uncaughtException' ||
          entry.command === 'game.crashed' ||
          entry.command === 'error' ||
          (entry.command === 'console.log' &&
            entry.payload &&
            entry.payload.type === 'error' &&
            !entry.payload.internal)
      );
      resolve({
        success: true,
        running: true,
        debuggerId: targetId,
        latestDebuggerId: latestId,
        inspectedLatest: targetId === latestId,
        availableDebuggerIds: previewIds,
        // Preview health (#3): distinguish "connected + debugger responded with a
        // dump" from "connected but the debugger channel did not answer" (the OS
        // likely suspended an occluded window). 'responsive' = we got the dump;
        // 'connected-unresponsive' = socket up but no dump before timeout.
        previewHealth: dumpPayload
          ? 'responsive'
          : status
          ? 'connected-status-only'
          : 'connected-unresponsive',
        status,
        // Sounds played since the previous inspect — confirms PlaySound/PlayMusic
        // actions actually fired (the previous audio verification blind spot).
        recentSounds:
          status && Array.isArray(status.recentlyPlayedSounds)
            ? status.recentlyPlayedSounds
            : undefined,
        runtime: summarizeRuntimeGameDump(
          dumpPayload,
          makeRuntimeSummaryOptions(args),
          rendererDiagnostics
        ),
        rendererDiagnostics: rendererDiagnostics || undefined,
        includeRawDump: !!(args && args.include_raw_dump),
        rawDump:
          args && args.include_raw_dump ? dumpPayload || undefined : undefined,
        logs: allLogs,
        recentLogs,
        // Surface runtime errors/crashes prominently: error-type console logs,
        // uncaught exceptions and crash reports. This is the closest available
        // signal to "an expression failed at runtime".
        errors,
        diagnostics: buildPreviewDiagnostics({
          running: true,
          previewIds,
          targetId,
          dumpPayload,
          status,
          logs: allLogs,
          timedOut: !dumpPayload,
          operation: 'inspect',
        }),
        note: dumpPayload
          ? undefined
          : `No runtime dump was received before the timeout - the preview connected but did not respond. Remediation: use ${PREVIEW_CLEANUP_RELAUNCH_ACTION} to close stale previews and launch one paused preview; then advance with run_frames. You can also increase timeout_ms. status/logs may still be useful.`,
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
          // Only accept dump/status/logs from the targeted preview, so a stale
          // window's messages are not mixed into this inspection.
          if (id !== targetId) return;
          if (parsedMessage.command === 'dump') {
            dumpPayload = parsedMessage.payload;
            rendererDiagnostics = parsedMessage.rendererDiagnostics || null;
            // Got what we came for; resolve promptly.
            finish();
          } else if (parsedMessage.command === 'status') {
            status = parsedMessage.payload || parsedMessage.status || null;
          } else if (
            parsedMessage.command === 'console.log' ||
            parsedMessage.command === 'hotReloader.logs' ||
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

// Screenshot helpers can return the exact renderer canvas or an explicit
// full-window capture. The public path below defaults to the renderer canvas,
// forces a render first, checks image quality, and retries suspicious frames.
const resizeScreenshotDataUrlIfNeeded = (
  dataUrl: string,
  width: number,
  height: number,
  args: Object
): {|
  dataUrl: string,
  width: number,
  height: number,
  resizeWarning?: string,
|} => {
  const targetWidth =
    args && typeof args.target_width === 'number'
      ? Math.max(1, Math.floor(args.target_width))
      : args && typeof args.width === 'number'
      ? Math.max(1, Math.floor(args.width))
      : null;
  const targetHeight =
    args && typeof args.target_height === 'number'
      ? Math.max(1, Math.floor(args.target_height))
      : args && typeof args.height === 'number'
      ? Math.max(1, Math.floor(args.height))
      : null;
  if (!targetWidth && !targetHeight) {
    return { dataUrl, width, height };
  }
  if (!targetWidth || !targetHeight) {
    return {
      dataUrl,
      width,
      height,
      resizeWarning:
        'Both target_width and target_height are required for fixed-size screenshot resizing.',
    };
  }
  if (width === targetWidth && height === targetHeight) {
    return { dataUrl, width, height };
  }
  if (!nativeImage) {
    return {
      dataUrl,
      width,
      height,
      resizeWarning:
        'Electron nativeImage is unavailable, so the screenshot could not be resized. Use canvas_only:true to get the canvas intrinsic size when possible.',
    };
  }
  try {
    const image = nativeImage.createFromDataURL(dataUrl);
    const resized = image.resize({ width: targetWidth, height: targetHeight });
    return {
      dataUrl: resized.toDataURL(),
      width: targetWidth,
      height: targetHeight,
    };
  } catch (error) {
    return {
      dataUrl,
      width,
      height,
      resizeWarning: `Could not resize screenshot: ${error.message}`,
    };
  }
};

const inspectScreenshotQuality = (
  dataUrl: string,
  expectedWidth: number,
  expectedHeight: number
): Object => {
  if (!nativeImage) return { analyzed: false };
  try {
    const image = nativeImage.createFromDataURL(dataUrl);
    const size = image.getSize();
    const bitmap = image.toBitmap();
    const pixelCount = size.width * size.height;
    const stride = Math.max(1, Math.floor(pixelCount / 10000));
    let samples = 0;
    let black = 0;
    let transparent = 0;
    for (let pixel = 0; pixel < pixelCount; pixel += stride) {
      const offset = pixel * 4;
      const blue = bitmap[offset];
      const green = bitmap[offset + 1];
      const red = bitmap[offset + 2];
      const alpha = bitmap[offset + 3];
      samples++;
      if (alpha <= 3) transparent++;
      if (alpha > 3 && red <= 3 && green <= 3 && blue <= 3) black++;
    }
    const blackRatio = samples ? black / samples : 1;
    const transparentRatio = samples ? transparent / samples : 1;
    const dimensionsMatch =
      size.width === expectedWidth && size.height === expectedHeight;
    return {
      analyzed: true,
      dimensionsMatch,
      blackRatio: Math.round(blackRatio * 10000) / 10000,
      transparentRatio: Math.round(transparentRatio * 10000) / 10000,
      suspicious:
        !size.width ||
        !size.height ||
        !dimensionsMatch ||
        blackRatio >= 0.92 ||
        transparentRatio >= 0.98,
      pixelHash:
        crypto && typeof crypto.createHash === 'function'
          ? crypto
              .createHash('sha256')
              .update(image.toPNG())
              .digest('hex')
          : undefined,
    };
  } catch (error) {
    return { analyzed: false, suspicious: true, error: error.message };
  }
};

const writeOrReturnScreenshot = (
  dataUrl: string,
  width: number,
  height: number,
  args: Object,
  source: string,
  extra?: ?Object
): Object => {
  const resized = resizeScreenshotDataUrlIfNeeded(dataUrl, width, height, args);
  const finalDataUrl = resized.dataUrl;
  const finalWidth = resized.width;
  const finalHeight = resized.height;
  const base64 = finalDataUrl.replace(/^data:image\/png;base64,/, '');
  const filePath =
    args && typeof args.file_path === 'string' ? args.file_path : null;
  if (!filePath || !fs) {
    return {
      success: true,
      running: true,
      width: finalWidth,
      height: finalHeight,
      dataUrl: finalDataUrl,
      source,
      resizeWarning: resized.resizeWarning,
      ...(extra || {}),
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
      width: finalWidth,
      height: finalHeight,
      dataUrl: finalDataUrl,
      resizeWarning: resized.resizeWarning,
    };
  }
  return {
    success: true,
    running: true,
    filePath,
    width: finalWidth,
    height: finalHeight,
    source,
    resizeWarning: resized.resizeWarning,
    ...(extra || {}),
  };
};

const capturePreviewScreenshotLegacy = async (
  previewDebuggerServer: ?Object,
  args: Object,
  capturePreviewPage?: ?(windowId: ?number) => Promise<?Object>
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;

  // Quick context so the result is self-describing (#5): which preview + the
  // game scene/time the frame reflects, so a stale capture is obvious. Best
  // effort — a throttled window may not answer, then meta is just { debuggerId }.
  const meta: {
    debuggerId: string,
    sceneName?: any,
    sceneElapsedTimeSeconds?: any,
  } = { debuggerId: targetId };
  try {
    const status = await sendTargetedRequest(
      (previewDebuggerServer: any),
      targetId,
      { command: 'refresh' },
      { timeoutMs: 1500, returnFullMessage: true }
    );
    const dump = status && status.matched && status.payload;
    const dumpPayload = dump && dump.payload;
    const runtime = dumpPayload
      ? summarizeRuntimeGameDump(dumpPayload, {})
      : null;
    if (runtime && runtime.scenes && runtime.scenes[0]) {
      meta.sceneName = runtime.scenes[0].name;
      meta.sceneElapsedTimeSeconds = runtime.scenes[0].sceneElapsedTimeSeconds;
    }
  } catch (error) {
    // ignore — meta stays as { debuggerId }
  }

  // 1. Try the main-process capturePage path first — it works even when the
  // preview renderer is suspended (occluded window). It captures the latest
  // preview window when no specific id is mapped.
  if (
    !(args && (args.canvas_only || args.capture_mode === 'canvas')) &&
    typeof capturePreviewPage === 'function'
  ) {
    try {
      const mainResult = await capturePreviewPage(null);
      if (mainResult && mainResult.dataUrl) {
        return writeOrReturnScreenshot(
          mainResult.dataUrl,
          mainResult.width,
          mainResult.height,
          args,
          'main-process-capturePage',
          meta
        );
      }
      // mainResult.error → fall through to the debugger path below.
    } catch (error) {
      // Fall through to the debugger path.
    }
  }

  // 2. Fall back to the renderer-side canvas.toDataURL via the debugger channel.
  // Target the chosen preview specifically (defaults to the latest launched),
  // so a stale game-over window cannot answer the screenshot request first.
  const { matched, payload } = await sendTargetedRequest(
    (previewDebuggerServer: any),
    targetId,
    { command: 'captureScreenshot' }
  );
  if (!matched) {
    return {
      success: false,
      running: true,
      debuggerId: targetId,
      error:
        'Screenshot request timed out: the targeted preview did not reply (a backgrounded/occluded window may be suspended). Try control_preview { action: "focus" } first, or rely on run_frames/inspect which do not need rendering.',
      diagnostics: buildPreviewDiagnostics({
        running: true,
        previewIds: guard.previewIds,
        targetId,
        timedOut: true,
        operation: 'capture_preview_screenshot',
      }),
    };
  }

  if (!payload.dataUrl) {
    return {
      success: false,
      running: true,
      debuggerId: targetId,
      error:
        payload.error ||
        'The preview did not return image data. The game canvas may not be ready yet.',
      width: payload.width,
      height: payload.height,
      diagnostics: {
        classification: 'canvas-not-ready',
        targetDebuggerId: targetId,
        likelyCauses: [
          'The renderer replied, but no canvas image data was available.',
          'The game may still be loading or has not rendered a frame yet.',
        ],
        recommendedActions: [
          'retry after the preview renders',
          'use capture_preview_screenshot for visual checks',
        ],
      },
    };
  }

  return writeOrReturnScreenshot(
    payload.dataUrl,
    payload.width,
    payload.height,
    args,
    'renderer-canvas',
    meta
  );
};

const capturePreviewScreenshot = async (
  previewDebuggerServer: ?Object,
  args: Object,
  capturePreviewPage?: ?(windowId: ?number) => Promise<?Object>
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;
  const meta: Object = { debuggerId: targetId };
  const captureMode =
    args && typeof args.capture_mode === 'string'
      ? args.capture_mode.toLowerCase()
      : 'canvas';
  if (captureMode === 'legacy') {
    return capturePreviewScreenshotLegacy(
      previewDebuggerServer,
      args,
      capturePreviewPage
    );
  }
  const requireCanvas = !!(
    args &&
    (args.canvas_only || args.exact_game_resolution || captureMode === 'canvas')
  );
  const preferWindow = captureMode === 'window' || captureMode === 'page';
  const retryCount =
    args && typeof args.retry_count === 'number'
      ? Math.max(0, Math.min(5, Math.floor(args.retry_count)))
      : 2;
  let lastFailure: ?Object = null;

  try {
    const status = await sendTargetedRequest(
      (previewDebuggerServer: any),
      targetId,
      { command: 'refresh' },
      { timeoutMs: 1500, returnFullMessage: true }
    );
    const dumpPayload =
      status.matched && status.payload ? status.payload.payload : null;
    const runtime = dumpPayload
      ? summarizeRuntimeGameDump(dumpPayload, {})
      : null;
    if (runtime && runtime.scenes && runtime.scenes[0]) {
      meta.sceneName = runtime.scenes[0].name;
      meta.sceneElapsedTimeSeconds = runtime.scenes[0].sceneElapsedTimeSeconds;
    }
  } catch (error) {
    // Screenshot capture can still proceed without runtime metadata.
  }

  if (!preferWindow) {
    for (let attempt = 1; attempt <= retryCount + 1; attempt++) {
      const canvasResult = await sendTargetedRequest(
        (previewDebuggerServer: any),
        targetId,
        { command: 'captureScreenshot' },
        { timeoutMs: 2500 }
      );
      const payload = canvasResult.payload || {};
      if (canvasResult.matched && payload.dataUrl) {
        const quality = inspectScreenshotQuality(
          payload.dataUrl,
          payload.width,
          payload.height
        );
        const result = writeOrReturnScreenshot(
          payload.dataUrl,
          payload.width,
          payload.height,
          args,
          'renderer-canvas',
          {
            ...meta,
            renderedBeforeCapture: payload.rendered,
            capturedAt: payload.capturedAt,
            attempt,
            attempts: attempt,
            exactGameResolution: true,
            quality,
            qualityWarning:
              quality.suspicious && attempt === retryCount + 1
                ? 'The canvas remained mostly black, transparent, or dimensionally inconsistent after automatic retries.'
                : undefined,
          }
        );
        if (!quality.suspicious || attempt === retryCount + 1) return result;
      } else {
        lastFailure = {
          matched: canvasResult.matched,
          error:
            payload.error ||
            'The game canvas did not return image data before timeout.',
          width: payload.width,
          height: payload.height,
        };
      }
      if (attempt <= retryCount) await wait(80 * attempt);
    }
  }

  if (!requireCanvas && typeof capturePreviewPage === 'function') {
    try {
      const mainResult = await capturePreviewPage(null);
      if (mainResult && mainResult.dataUrl) {
        return writeOrReturnScreenshot(
          mainResult.dataUrl,
          mainResult.width,
          mainResult.height,
          args,
          'main-process-capturePage',
          {
            ...meta,
            windowId: mainResult.windowId,
            exactGameResolution: false,
            canvasFailure: lastFailure || undefined,
          }
        );
      }
      lastFailure = lastFailure || (mainResult && { error: mainResult.error });
    } catch (error) {
      lastFailure = lastFailure || { error: error.message };
    }
  }

  return {
    success: false,
    running: true,
    debuggerId: targetId,
    source: requireCanvas ? 'renderer-canvas' : undefined,
    error:
      (lastFailure && lastFailure.error) ||
      'Screenshot capture failed: no game-canvas image was returned.',
    width: lastFailure && lastFailure.width,
    height: lastFailure && lastFailure.height,
    diagnostics: buildPreviewDiagnostics({
      running: true,
      previewIds: guard.previewIds,
      targetId,
      timedOut: !!(lastFailure && !lastFailure.matched),
      operation: 'capture_preview_screenshot',
    }),
  };
};

const getKeyboardKeyDefinitionForCode = (
  keyCode: number,
  location?: number
): ?Object => {
  const matchingLocation =
    typeof location === 'number'
      ? keyDefinitions.find(
          definition =>
            definition.keyCode === keyCode && definition.location === location
        )
      : null;
  return (
    matchingLocation ||
    keyDefinitions.find(
      definition => definition.keyCode === keyCode && definition.location === 0
    ) ||
    keyDefinitions.find(definition => definition.keyCode === keyCode) ||
    null
  );
};

const makeNormalizedKeyboardInput = (
  type: string,
  definition: ?Object,
  keyCode: number,
  location: ?number,
  inputAlias?: string
): Object => ({
  type,
  domCode: definition ? definition.domCode : null,
  keyCode,
  gdevelopKeyName: definition ? definition.gdevelopKeyName : null,
  location:
    typeof location === 'number'
      ? location
      : definition && typeof definition.location === 'number'
      ? definition.location
      : 0,
  inputAlias,
});

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
    let definition =
      code !== null ? getKeyboardKeyDefinitionForCode(code, location) : null;
    if (code === null && typeof raw.key === 'string') {
      definition = getKeyboardKeyDefinition(raw.key);
      if (!definition) {
        return { ok: false, error: `Unknown key name: "${raw.key}".` };
      }
      code = definition.keyCode;
      if (typeof definition.location === 'number') {
        location = definition.location;
      }
    }
    if (code === null) {
      return { ok: false, error: `${type} needs "key" or "key_code".` };
    }
    return {
      ok: true,
      input: { type, keyCode: code, location },
      normalization: makeNormalizedKeyboardInput(
        type,
        definition,
        code,
        location,
        typeof raw.key === 'string' ? raw.key : undefined
      ),
    };
  }
  if (type === 'releaseAllKeys') {
    return { ok: true, input: { type }, normalization: { type } };
  }
  if (type === 'mouseMove') {
    return {
      ok: true,
      input: { type, x: raw.x, y: raw.y },
      normalization: { type, x: raw.x, y: raw.y },
    };
  }
  if (type === 'mouseButtonPressed' || type === 'mouseButtonReleased') {
    const button =
      typeof raw.button === 'number'
        ? raw.button
        : typeof raw.button === 'string'
        ? MOUSE_BUTTON_NAME_TO_CODE[raw.button.toLowerCase()]
        : 0;
    return {
      ok: true,
      input: { type, button: button || 0 },
      normalization: { type, button: button || 0 },
    };
  }
  if (type === 'touchStart' || type === 'touchMove') {
    const input = {
      type,
      identifier: raw.identifier || 0,
      x: raw.x,
      y: raw.y,
    };
    return { ok: true, input, normalization: input };
  }
  if (type === 'touchEnd') {
    const input = { type, identifier: raw.identifier || 0 };
    return { ok: true, input, normalization: input };
  }
  return { ok: false, error: `Unknown input type: "${type}".` };
};

const expandRunFramesInput = (raw: any): Object => {
  const type = raw && typeof raw.type === 'string' ? raw.type.trim() : '';
  if (
    type === 'clickAndHold' ||
    type === 'mouseClickAndHold' ||
    type === 'click_and_hold'
  ) {
    const preInputs: Array<Object> = [];
    const postInputs: Array<Object> = [];
    if (typeof raw.x === 'number' && typeof raw.y === 'number') {
      preInputs.push({ type: 'mouseMove', x: raw.x, y: raw.y });
    }
    const button =
      typeof raw.button === 'number'
        ? raw.button
        : typeof raw.button === 'string'
        ? MOUSE_BUTTON_NAME_TO_CODE[raw.button.toLowerCase()]
        : 0;
    preInputs.push({ type: 'mouseButtonPressed', button: button || 0 });
    postInputs.push({ type: 'mouseButtonReleased', button: button || 0 });
    return {
      ok: true,
      preInputs,
      postInputs,
      frames:
        typeof raw.frames === 'number'
          ? raw.frames
          : typeof raw.hold_frames === 'number'
          ? raw.hold_frames
          : undefined,
    };
  }

  const resolved = resolveSimulatedInput(raw);
  if (!resolved.ok) return resolved;
  return {
    ok: true,
    preInputs: [resolved.input],
    postInputs: [],
    normalizations: [resolved.normalization],
  };
};

const isPreviewClickGestureInput = (input: any): boolean => {
  const type =
    input && typeof input.type === 'string'
      ? input.type.trim().toLowerCase()
      : '';
  return (
    type === 'mousebuttonpressed' ||
    type === 'clickandhold' ||
    type === 'mouseclickandhold' ||
    type === 'click_and_hold'
  );
};

const injectPreviewClickUserGesture = async (
  rawInputs: Array<any>,
  injectUserGesture?: ?(inputs: Array<Object>) => Promise<?Object>
): Promise<?Object> => {
  if (!rawInputs.some(isPreviewClickGestureInput)) return null;
  if (typeof injectUserGesture !== 'function') {
    return {
      success: false,
      attempted: false,
      supported: false,
      error:
        'Native preview click injection is unavailable in this editor build; runtime input was still injected.',
    };
  }

  const result = await injectUserGesture(rawInputs);
  if (result && result.success === false) {
    throw new Error(
      result.error ||
        'The preview window rejected native click/user-gesture injection.'
    );
  }
  return result;
};

const releaseHeldPreviewKeys = async (
  previewDebuggerServer: Object,
  targetId: string,
  timeoutMs: number = 1000
): Promise<Object> => {
  const cleanup = await sendTargetedRequest(
    previewDebuggerServer,
    targetId,
    {
      command: 'simulateInput',
      inputs: [{ type: 'releaseAllKeys' }],
    },
    { timeoutMs }
  );
  return cleanup.matched
    ? {
        attempted: true,
        success: !(cleanup.payload && cleanup.payload.error),
        keysReleased: !(cleanup.payload && cleanup.payload.error),
        applied: cleanup.payload && cleanup.payload.applied,
        error: cleanup.payload && cleanup.payload.error,
      }
    : {
        attempted: true,
        success: false,
        keysReleased: false,
        error:
          (cleanup.payload && cleanup.payload.error) ||
          'The preview did not confirm key cleanup.',
      };
};

// Inject simulated input into a running preview. Sends a 'simulateInput' command
// (request/response) and returns what was applied.
const simulatePreviewInput = async (
  previewDebuggerServer: ?Object,
  args: Object,
  injectUserGesture?: ?(inputs: Array<Object>) => Promise<?Object>
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;

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
  const normalizedInputs = [];
  for (const raw of rawInputs) {
    const result = resolveSimulatedInput(raw);
    if (!result.ok) {
      return { success: false, running: true, error: result.error };
    }
    resolved.push(result.input);
    normalizedInputs.push(result.normalization);
  }

  const userGesture = await injectPreviewClickUserGesture(
    rawInputs,
    injectUserGesture
  );
  const { matched, payload } = await sendTargetedRequest(
    (previewDebuggerServer: any),
    targetId,
    { command: 'simulateInput', inputs: resolved }
  );
  if (!matched) {
    return {
      success: true,
      running: true,
      debuggerId: targetId,
      appliedCount: resolved.length,
      normalizedInputs,
      userGesture: userGesture || undefined,
      note:
        'Input sent but not confirmed (no reply from the targeted preview before timeout). Press and release are separate inputs; hold a key by sending keyPressed without keyReleased.',
    };
  }

  // Confirmation: read back the InputManager state so the caller can tell the
  // game actually received the input (distinguishes input-not-received from a
  // logic bug). Opt out with confirm:false.
  let inputState;
  if (!(args && args.confirm === false)) {
    const confirmResult = await sendTargetedRequest(
      (previewDebuggerServer: any),
      targetId,
      { command: 'getInputState' }
    );
    if (confirmResult.matched) inputState = confirmResult.payload;
  }

  return {
    success: !payload.error,
    running: true,
    debuggerId: targetId,
    applied: payload.applied,
    normalizedInputs,
    userGesture: userGesture || undefined,
    error: payload.error || undefined,
    // InputManager state right after applying the input (pressedKeyCodes,
    // lastPressedKey, mouseX/Y, pressedMouseButtons). If a key you pressed is
    // not in pressedKeyCodes, the game did not receive it (e.g. window not
    // focused / throttled) — not a logic bug.
    inputState,
  };
};

// Atomic runtime-test primitive: inject inputs, step N frames, and read back the
// resulting state in ONE debugger round-trip. The GDJS `runFrames` command drives
// the simulation directly on the websocket callback (no requestAnimationFrame),
// so this works even when the OS throttled a backgrounded/occluded preview window
// (which is exactly the case that breaks the multi-call pause→input→step→inspect
// loop, since each separate call needs the window responsive). Returns the same
// `runtime` summary as gdevelop_inspect_running_preview.
const runPreviewFrames = async (
  previewDebuggerServer: ?Object,
  args: Object,
  injectUserGesture?: ?(inputs: Array<Object>) => Promise<?Object>
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;

  // Inputs are optional — runFrames with no inputs just advances the sim.
  const rawInputs = Array.isArray(args && args.inputs) ? args.inputs : [];
  const resolved: Array<Object> = [];
  const postResolved: Array<Object> = [];
  const normalizedInputs: Array<Object> = [];
  let suggestedFrames: ?number;
  for (const raw of rawInputs) {
    const result = expandRunFramesInput(raw);
    if (!result.ok) {
      return { success: false, running: true, error: result.error };
    }
    resolved.push(...(result.preInputs || []));
    postResolved.push(...(result.postInputs || []));
    normalizedInputs.push(...(result.normalizations || []));
    if (typeof result.frames === 'number' && suggestedFrames === undefined) {
      suggestedFrames = result.frames;
    }
  }

  const frames =
    args && typeof args.frames === 'number'
      ? Math.max(1, Math.min(2000, Math.floor(args.frames)))
      : typeof suggestedFrames === 'number'
      ? Math.max(1, Math.min(2000, Math.floor(suggestedFrames)))
      : 1;
  const frameDeltaMs =
    args && typeof args.frame_delta_ms === 'number'
      ? args.frame_delta_ms
      : undefined;

  // A longer default timeout: stepping many frames + serializing the dump can
  // take a moment, and this is the resilient path for throttled windows.
  const timeoutMs = clampTimeoutMs(args && args.timeout_ms, 6000, 500, 30000);
  if (!(args && args.skip_ready_check === true)) {
    const readiness = await waitForPreviewRuntimeReady(
      (previewDebuggerServer: any),
      targetId,
      {
        timeoutMs: Math.min(3000, timeoutMs),
        operation: 'run_frames.ready-check',
      }
    );
    if (!readiness.ready) {
      return {
        success: false,
        running: true,
        ready: false,
        runtimeReady: false,
        debuggerId: targetId,
        requestedFrames: frames,
        steppedFrames: 0,
        stoppedEarly: true,
        outcome: 'preflight-failed',
        partialStateAvailable: false,
        cleanup: { attempted: false, success: true },
        error:
          'run_frames aborted: the targeted preview is connected but did not answer getStatus, so the runtime debugger channel is not ready.',
        ...readiness,
      };
    }
  }

  const userGesture = await injectPreviewClickUserGesture(
    rawInputs,
    injectUserGesture
  );
  const autoRelease = !!(args && (args.auto_release || args.autoRelease));
  const { matched, payload } = await sendTargetedRequest(
    (previewDebuggerServer: any),
    targetId,
    {
      command: 'runFrames',
      inputs: resolved,
      postInputs: postResolved,
      count: frames,
      fakeElapsedTimeMs: frameDeltaMs,
      autoRelease,
      includeCursorWorldCoordinates: !!(
        args && args.include_cursor_world_coordinates
      ),
      cursorLayers: Array.isArray(args && args.cursor_layers)
        ? args.cursor_layers.map(String)
        : undefined,
    },
    { timeoutMs, returnFullMessage: true }
  );

  if (!matched) {
    const cleanup = autoRelease
      ? await releaseHeldPreviewKeys(
          (previewDebuggerServer: any),
          targetId,
          Math.min(1500, timeoutMs)
        )
      : { attempted: false, success: true };
    return {
      success: false,
      running: true,
      ready: true,
      runtimeReady: true,
      failurePhase: 'renderer-response',
      debuggerId: targetId,
      error:
        'run_frames timed out: the targeted preview did not reply. The window may still be loading; retry, or close all previews with control_preview and relaunch with launch_preview using start_paused=true and force_new=true.',
      requestedFrames: frames,
      steppedFrames: 0,
      stoppedEarly: true,
      outcome: 'timeout',
      partialStateAvailable: false,
      cleanup,
      userGesture: userGesture || undefined,
      diagnostics: buildPreviewDiagnostics({
        running: true,
        previewIds: guard.previewIds,
        targetId,
        timedOut: true,
        operation: 'run_frames',
      }),
    };
  }

  const runMeta = (payload && payload.runFrames) || {};
  const dumpPayload = payload && payload.payload;
  const rendererDiagnostics = payload && payload.rendererDiagnostics;
  let heldKeys = Array.isArray(runMeta.heldKeys) ? runMeta.heldKeys : [];
  let cleanup = runMeta.cleanup || {
    attempted: false,
    success: !autoRelease,
  };
  if (
    autoRelease &&
    (!cleanup.success || !cleanup.keysReleased || heldKeys.length > 0)
  ) {
    const fallbackCleanup = await releaseHeldPreviewKeys(
      (previewDebuggerServer: any),
      targetId,
      Math.min(1500, timeoutMs)
    );
    cleanup = {
      ...cleanup,
      fallback: fallbackCleanup,
      success: !!fallbackCleanup.success,
      keysReleased: !!fallbackCleanup.keysReleased,
    };
    if (fallbackCleanup.success) heldKeys = [];
  }
  const steppedFrames =
    typeof runMeta.steppedFrames === 'number' ? runMeta.steppedFrames : 0;
  const stoppedEarly = !!runMeta.stoppedEarly || steppedFrames < frames;
  const cleanupFailed = autoRelease && !cleanup.success;
  const outcome = cleanupFailed
    ? 'cleanup-failed'
    : runMeta.error
    ? steppedFrames > 0
      ? 'partial'
      : 'failed'
    : stoppedEarly
    ? 'partial'
    : 'completed';
  return {
    success: !runMeta.error && !cleanupFailed,
    running: true,
    debuggerId: targetId,
    applied: runMeta.applied,
    normalizedInputs,
    requestedFrames: frames,
    steppedFrames,
    stoppedEarly,
    outcome,
    failedFrame:
      typeof runMeta.failedFrame === 'number' ? runMeta.failedFrame : undefined,
    eventId:
      runMeta.failure && runMeta.failure.eventId
        ? runMeta.failure.eventId
        : undefined,
    instructionId:
      runMeta.failure && runMeta.failure.instructionId
        ? runMeta.failure.instructionId
        : undefined,
    failure: runMeta.failure || undefined,
    partialStateAvailable:
      runMeta.partialStateAvailable !== undefined
        ? !!runMeta.partialStateAvailable
        : steppedFrames > 0,
    cleanup,
    userGesture: userGesture || undefined,
    recentSounds: Array.isArray(runMeta.recentlyPlayedSounds)
      ? runMeta.recentlyPlayedSounds
      : [],
    deltaMs: runMeta.deltaMs,
    // Keys STILL held after this call. A held key (keyPressed with no release)
    // carries over to subsequent run_frames and keeps driving the game — pass
    // auto_release:true, or send a keyReleased, to clear it.
    heldKeys,
    cursorWorldCoordinates: runMeta.cursorWorldCoordinates || undefined,
    error:
      runMeta.error ||
      (cleanupFailed
        ? cleanup.error || 'run_frames could not confirm key cleanup.'
        : undefined),
    runtime: summarizeRuntimeGameDump(
      dumpPayload,
      makeRuntimeSummaryOptions(args),
      rendererDiagnostics
    ),
    rendererDiagnostics: rendererDiagnostics || undefined,
    note:
      (heldKeys.length && !autoRelease
        ? `NOTE: ${heldKeys.length} key(s) still held (${heldKeys.join(
            ', '
          )}) — they will keep affecting the game on the next call. Pass auto_release:true or send keyReleased to clear. `
        : '') +
      'Frames stepped synchronously on the debugger channel (independent of the render loop), so this works even on a throttled/backgrounded preview window. The game is left paused; control_preview { action: "play" } resumes normal real-time play.',
  };
};

const getPreviewConnectionInfo = (
  previewDebuggerServer: ?Object,
  debuggerId: ?string
): ?Object => {
  if (
    !previewDebuggerServer ||
    !debuggerId ||
    typeof previewDebuggerServer.getConnectionInfo !== 'function'
  ) {
    return null;
  }
  try {
    return previewDebuggerServer.getConnectionInfo(debuggerId);
  } catch (error) {
    return null;
  }
};

// Shared guard: confirm a preview is running and return its server + target id.
const requireRunningPreview = (
  previewDebuggerServer: ?Object,
  args: Object
): Object => {
  if (!previewDebuggerServer) {
    return {
      ok: false,
      result: {
        success: false,
        running: false,
        error: 'No preview debugger server is available in this editor build.',
        diagnostics: {
          classification: 'debugger-server-unavailable',
          likelyCauses: [
            'This editor build did not expose a preview debugger server.',
          ],
          recommendedActions: [],
        },
      },
    };
  }
  if (previewDebuggerServer.getServerState() !== 'started') {
    return {
      ok: false,
      result: {
        success: false,
        running: false,
        error:
          'No preview is running. Launch a preview first with launch_preview { start_paused: true }, then use run_frames.',
        diagnostics: buildPreviewDiagnostics({
          running: false,
          operation: 'runtime-request',
        }),
      },
    };
  }
  const previewIds =
    typeof previewDebuggerServer.getExistingPreviewDebuggerIds === 'function'
      ? previewDebuggerServer.getExistingPreviewDebuggerIds()
      : previewDebuggerServer.getExistingDebuggerIds();
  if (!previewIds || !previewIds.length) {
    const lastConnectionInfo =
      typeof previewDebuggerServer.getLastConnectionInfo === 'function'
        ? previewDebuggerServer.getLastConnectionInfo()
        : null;
    return {
      ok: false,
      result: {
        success: false,
        running: false,
        error: 'No preview is currently connected.',
        connectionInfo: lastConnectionInfo,
        diagnostics: buildPreviewDiagnostics({
          running: true,
          previewIds: [],
          operation: 'runtime-request',
        }),
      },
    };
  }
  const targetId =
    args && typeof args.debugger_id === 'string'
      ? args.debugger_id
      : previewIds[previewIds.length - 1];
  if (
    args &&
    typeof args.debugger_id === 'string' &&
    previewIds.indexOf(targetId) === -1
  ) {
    return {
      ok: false,
      result: {
        success: false,
        running: true,
        error: `Preview debugger id "${targetId}" is not connected.`,
        debuggerId: targetId,
        availableDebuggerIds: previewIds,
        connectionInfo: getPreviewConnectionInfo(
          previewDebuggerServer,
          targetId
        ),
        diagnostics: {
          classification: 'requested-debugger-id-not-connected',
          targetDebuggerId: targetId,
          likelyCauses: [
            'The requested preview was closed.',
            'The debugger id is stale from a previous launch.',
          ],
          recommendedActions: [
            'use the latestDebuggerId from launch_preview or preview_health_check',
            PREVIEW_CLEANUP_RELAUNCH_ACTION,
          ],
        },
      },
    };
  }
  return { ok: true, targetId, previewIds };
};

const previewHealthCheck = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  if (!previewDebuggerServer) {
    return {
      success: true,
      running: false,
      serverState: 'unavailable',
      availableDebuggerIds: [],
      recommendedActions: ['launch_preview'],
      diagnostics: {
        classification: 'debugger-server-unavailable',
        likelyCauses: [
          'This editor build did not expose a preview debugger server.',
        ],
        recommendedActions: [],
      },
      note: 'No preview debugger server is available in this editor build.',
    };
  }
  const serverState =
    typeof previewDebuggerServer.getServerState === 'function'
      ? previewDebuggerServer.getServerState()
      : 'unknown';
  const previewIds =
    serverState === 'started'
      ? (typeof previewDebuggerServer.getExistingPreviewDebuggerIds ===
        'function'
          ? previewDebuggerServer.getExistingPreviewDebuggerIds()
          : previewDebuggerServer.getExistingDebuggerIds()) || []
      : [];
  const running = serverState === 'started' && previewIds.length > 0;
  const latestDebuggerId = previewIds.length
    ? previewIds[previewIds.length - 1]
    : null;
  const requestedDebuggerId =
    args && typeof args.debugger_id === 'string' ? args.debugger_id : null;
  const targetId =
    requestedDebuggerId && previewIds.indexOf(requestedDebuggerId) !== -1
      ? requestedDebuggerId
      : latestDebuggerId;
  const timeoutMs =
    args && typeof args.timeout_ms === 'number'
      ? Math.max(200, Math.min(5000, args.timeout_ms))
      : 1000;

  let matched = false;
  let status = null;
  let pingFailure = null;
  if (running && targetId) {
    const ping = await sendTargetedRequest(
      previewDebuggerServer,
      targetId,
      { command: 'getStatus' },
      { timeoutMs }
    );
    matched = ping.matched;
    status = matched ? ping.payload : null;
    pingFailure = !matched ? ping.payload : null;
  }

  const currentPreviewIds =
    serverState === 'started'
      ? getPreviewDebuggerIds(previewDebuggerServer)
      : [];
  const currentRunning =
    serverState === 'started' && currentPreviewIds.length > 0;
  const currentLatestDebuggerId = currentPreviewIds.length
    ? currentPreviewIds[currentPreviewIds.length - 1]
    : null;
  const responsive = currentRunning && matched;
  const targetDisconnected =
    !!targetId &&
    running &&
    !matched &&
    (currentPreviewIds.indexOf(targetId) === -1 ||
      (pingFailure &&
        (pingFailure.connectionClosed || pingFailure.connectionErrored)));
  const recommendedActions = responsive
    ? [
        'gdevelop_inspect_running_preview',
        'run_frames',
        'capture_preview_screenshot',
      ]
    : currentRunning
    ? ['control_preview { action: "focus" }', PREVIEW_CLEANUP_RELAUNCH_ACTION]
    : ['launch_preview'];
  return {
    success: true,
    running: currentRunning,
    serverState,
    responsive,
    previewHealth: currentRunning
      ? responsive
        ? 'responsive'
        : targetDisconnected
        ? 'target-disconnected'
        : 'connected-unresponsive'
      : 'not-running',
    availableDebuggerIds: currentPreviewIds,
    latestDebuggerId: currentLatestDebuggerId,
    targetDebuggerId: targetId,
    connectionInfo: getPreviewConnectionInfo(previewDebuggerServer, targetId),
    status: status || undefined,
    error: pingFailure && pingFailure.error ? pingFailure.error : undefined,
    diagnostics: buildPreviewDiagnostics({
      running: currentRunning,
      previewIds: currentPreviewIds,
      targetId,
      status,
      timedOut: currentRunning && !responsive && !targetDisconnected,
      operation: 'health_check',
    }),
    recommendedActions,
    recovery:
      currentRunning && currentPreviewIds.length > 1
        ? [PREVIEW_CLEANUP_RELAUNCH_ACTION]
        : [
            'launch_preview { start_paused: true }',
            'control_preview { action: "focus" }',
          ],
    note: responsive
      ? 'The selected preview replied to a debugger status ping.'
      : 'Use this before screenshots/runtime tests when the debugger channel looks stale. For a connected-but-unresponsive preview, close all previews with control_preview, then relaunch with launch_preview using start_paused=true and force_new=true.',
  };
};

const waitUntilPreviewReady = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const timeoutMs = getPreviewReadinessTimeoutMs(args, 6000);
  const readiness = await waitForPreviewRuntimeReady(
    (previewDebuggerServer: any),
    guard.targetId,
    {
      timeoutMs,
      requirePaused: !!(args && (args.require_paused || args.requirePaused)),
      operation: 'wait_until_preview_ready',
    }
  );

  return {
    success: !!readiness.ready,
    running: true,
    ready: !!readiness.ready,
    runtimeReady: !!readiness.ready,
    debuggerId: guard.targetId,
    availableDebuggerIds: guard.previewIds,
    ...readiness,
    note: readiness.ready
      ? 'The selected preview replied to getStatus and is ready for run_frames / inspect.'
      : 'The selected preview is connected but did not answer getStatus before the timeout. Close all previews and relaunch a single paused preview.',
  };
};

const getPreviewDebuggerIds = (
  previewDebuggerServer: ?Object
): Array<string> => {
  if (
    !previewDebuggerServer ||
    typeof previewDebuggerServer.getServerState !== 'function' ||
    previewDebuggerServer.getServerState() !== 'started'
  ) {
    return [];
  }

  if (
    typeof previewDebuggerServer.getExistingPreviewDebuggerIds === 'function'
  ) {
    return previewDebuggerServer.getExistingPreviewDebuggerIds() || [];
  }
  if (typeof previewDebuggerServer.getExistingDebuggerIds === 'function') {
    return previewDebuggerServer.getExistingDebuggerIds() || [];
  }
  return [];
};

const getStringArg = (args: ?Object, names: Array<string>): ?string => {
  if (!args) return null;
  for (const name of names) {
    if (typeof args[name] === 'string' && args[name]) return args[name];
  }
  return null;
};

// Send a request to ONE specific preview and resolve with the reply that comes
// back FROM THAT preview (matched by messageId + source id). This is required
// because the shared sendMessageWithResponse broadcasts to every connected
// preview and resolves on the first reply — which, with several previews open
// (e.g. a stale game-over window), can return the wrong preview's data.
// Falls back to fire-and-forget sendMessage if callbacks are unavailable.
const sendTargetedRequest = (
  previewDebuggerServer: Object,
  targetId: string,
  message: Object,
  options?: {| timeoutMs?: number, returnFullMessage?: boolean |}
): Promise<{| matched: boolean, payload: Object |}> => {
  const timeoutMs = (options && options.timeoutMs) || 2500;
  const returnFullMessage = !!(options && options.returnFullMessage);
  return new Promise(resolve => {
    if (typeof previewDebuggerServer.registerCallbacks !== 'function') {
      // No way to capture a reply: send targeted and report unconfirmed.
      try {
        previewDebuggerServer.sendMessage(targetId, message);
      } catch (error) {
        resolve({ matched: false, payload: { error: error.message } });
        return;
      }
      resolve({ matched: false, payload: {} });
      return;
    }

    // Stamp a unique messageId so we only accept the matching reply.
    const messageId = `mcp-${targetId}-${nextTargetedRequestId++}`;
    let settled = false;
    let unregister = () => {};
    const finish = (result: Object) => {
      if (settled) return;
      settled = true;
      try {
        unregister();
      } catch (error) {
        // ignore
      }
      resolve(result);
    };

    try {
      unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: connection => {
          const closedId = getConnectionDebuggerId(connection);
          if (closedId !== targetId) return;
          finish({
            matched: false,
            payload: {
              error: `Debugger connection "${targetId}" closed before replying.`,
              connectionClosed: true,
            },
          });
        },
        onConnectionOpened: () => {},
        onConnectionErrored: ({ id, errorMessage }) => {
          if (id !== targetId) return;
          finish({
            matched: false,
            payload: {
              error:
                errorMessage ||
                `Debugger connection "${targetId}" errored before replying.`,
              connectionErrored: true,
            },
          });
        },
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (
            id === targetId &&
            parsedMessage &&
            parsedMessage.messageId === messageId
          ) {
            finish({
              matched: true,
              payload: returnFullMessage
                ? parsedMessage
                : parsedMessage.payload || {},
            });
          }
        },
      });
    } catch (error) {
      resolve({ matched: false, payload: { error: error.message } });
      return;
    }

    try {
      previewDebuggerServer.sendMessage(targetId, { ...message, messageId });
    } catch (error) {
      finish({ matched: false, payload: { error: error.message } });
      return;
    }

    setTimeout(() => finish({ matched: false, payload: {} }), timeoutMs);
  });
};

const getConnectionDebuggerId = (connection: any): ?string => {
  if (typeof connection === 'string') return connection;
  if (connection && typeof connection.id === 'string') return connection.id;
  return null;
};

const wait = (timeoutMs: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, timeoutMs));

const clampTimeoutMs = (
  value: any,
  defaultValue: number,
  minValue: number,
  maxValue: number
): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.max(minValue, Math.min(maxValue, value))
    : defaultValue;

const getPreviewReadinessTimeoutMs = (
  args: Object,
  defaultValue: number = 6000
): number =>
  clampTimeoutMs(
    args && (args.ready_timeout_ms || args.readyTimeoutMs || args.timeout_ms),
    defaultValue,
    500,
    30000
  );

const makePreviewRuntimeNotReadyResult = ({
  previewDebuggerServer,
  targetId,
  timeoutMs,
  attempts,
  status,
  operation,
  failurePhase,
  failurePayload,
}: {|
  previewDebuggerServer: Object,
  targetId: string,
  timeoutMs: number,
  attempts: number,
  status: any,
  operation: string,
  failurePhase: string,
  failurePayload?: any,
|}): Object => {
  const previewIds = getPreviewDebuggerIds(previewDebuggerServer);
  const targetStillConnected = previewIds.indexOf(targetId) !== -1;
  return {
    ready: false,
    running: targetStillConnected,
    responsive: false,
    previewHealth: status
      ? 'connected-status-only'
      : targetStillConnected
      ? 'connected-unresponsive'
      : 'not-running',
    failurePhase,
    attempts,
    timeoutMs,
    status: status || undefined,
    connectionInfo:
      typeof previewDebuggerServer.getConnectionInfo === 'function'
        ? previewDebuggerServer.getConnectionInfo(targetId)
        : undefined,
    error:
      failurePayload && failurePayload.error ? failurePayload.error : undefined,
    diagnostics: buildPreviewDiagnostics({
      running: targetStillConnected,
      previewIds,
      targetId,
      status,
      timedOut: targetStillConnected,
      operation,
    }),
  };
};

const waitForPreviewRuntimeReady = async (
  previewDebuggerServer: Object,
  targetId: string,
  options?: {|
    timeoutMs?: number,
    pollIntervalMs?: number,
    requirePaused?: boolean,
    requireSceneName?: boolean,
    expectedSceneName?: ?string,
    operation?: string,
  |}
): Promise<Object> => {
  const timeoutMs = (options && options.timeoutMs) || 6000;
  const pollIntervalMs = (options && options.pollIntervalMs) || 150;
  const requirePaused = !!(options && options.requirePaused);
  const requireSceneName = !!(options && options.requireSceneName);
  const expectedSceneName = options && options.expectedSceneName;
  const operation =
    (options && options.operation) || 'wait_until_preview_ready';
  const startedAt = Date.now();
  let attempts = 0;
  let lastStatus = null;

  while (Date.now() - startedAt < timeoutMs) {
    attempts++;
    const elapsedMs = Date.now() - startedAt;
    const remainingMs = Math.max(1, timeoutMs - elapsedMs);
    const probeTimeoutMs = Math.max(100, Math.min(1000, remainingMs));
    const { matched, payload } = await sendTargetedRequest(
      previewDebuggerServer,
      targetId,
      { command: 'getStatus' },
      { timeoutMs: probeTimeoutMs }
    );
    if (matched) {
      lastStatus = payload;
      const actualSceneName = getStatusSceneName(payload);
      const isSceneReady =
        !requireSceneName ||
        (!!actualSceneName &&
          (!expectedSceneName || actualSceneName === expectedSceneName));
      if (
        (!requirePaused || (payload && payload.isPaused === true)) &&
        isSceneReady
      ) {
        return {
          ready: true,
          responsive: true,
          previewHealth: 'responsive',
          debuggerId: targetId,
          status: payload,
          attempts,
          elapsedMs: Date.now() - startedAt,
        };
      }
    }
    if (
      payload &&
      (payload.connectionClosed === true || payload.connectionErrored === true)
    ) {
      return makePreviewRuntimeNotReadyResult({
        previewDebuggerServer,
        targetId,
        timeoutMs,
        attempts,
        status: lastStatus,
        operation,
        failurePhase: requirePaused ? 'pause-confirmation' : 'runtime-ready',
        failurePayload: payload,
      });
    }

    const remainingAfterProbeMs = timeoutMs - (Date.now() - startedAt);
    if (remainingAfterProbeMs <= 0) break;
    await wait(Math.min(pollIntervalMs, remainingAfterProbeMs));
  }

  return makePreviewRuntimeNotReadyResult({
    previewDebuggerServer,
    targetId,
    timeoutMs,
    attempts,
    status: lastStatus,
    operation,
    failurePhase: requirePaused ? 'pause-confirmation' : 'runtime-ready',
  });
};

const waitForNewPreviewDebuggerId = (
  previewDebuggerServer: Object,
  existingIds: Set<string>,
  timeoutMs: number
): Promise<Object> => {
  const startedAt = Date.now();
  return new Promise(resolve => {
    let settled = false;
    let unregister = () => {};
    let intervalId = null;
    let timeoutId = null;
    let lastConnectionError = null;
    const finish = (result: Object) => {
      if (settled) return;
      settled = true;
      if (intervalId !== null) clearInterval(intervalId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      try {
        unregister();
      } catch (error) {
        // ignore
      }
      resolve({
        ...result,
        elapsedMs: Date.now() - startedAt,
      });
    };
    const checkForNewIds = () => {
      const previewIds = getPreviewDebuggerIds(previewDebuggerServer);
      const newId = previewIds.find(id => !existingIds.has(id));
      if (newId) {
        finish({
          connected: true,
          debuggerId: newId,
          availableDebuggerIds: previewIds,
        });
      }
    };

    try {
      unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: () => {},
        onConnectionOpened: connection => {
          const id = getConnectionDebuggerId(connection);
          if (id && !existingIds.has(id)) {
            finish({
              connected: true,
              debuggerId: id,
              availableDebuggerIds:
                connection && Array.isArray(connection.debuggerIds)
                  ? connection.debuggerIds
                  : getPreviewDebuggerIds(previewDebuggerServer),
            });
            return;
          }
          checkForNewIds();
        },
        onConnectionErrored: ({ id, errorMessage }) => {
          lastConnectionError = { id, errorMessage };
        },
        onHandleParsedMessage: () => {},
      });
    } catch (error) {
      finish({
        connected: false,
        failurePhase: 'debugger-connect',
        error: `Could not watch preview debugger connections: ${error.message}`,
      });
      return;
    }

    checkForNewIds();
    intervalId = setInterval(checkForNewIds, 100);
    timeoutId = setTimeout(
      () =>
        finish({
          connected: false,
          failurePhase: 'debugger-connect',
          availableDebuggerIds: getPreviewDebuggerIds(previewDebuggerServer),
          connectionError: lastConnectionError || undefined,
        }),
      timeoutMs
    );
  });
};

const pausePreviewAndConfirm = async (
  previewDebuggerServer: Object,
  targetId: string,
  timeoutMs: number,
  operation: string
): Promise<Object> => {
  const pauseTimeoutMs = Math.min(2000, Math.max(500, timeoutMs));
  const { matched, payload } = await sendTargetedRequest(
    previewDebuggerServer,
    targetId,
    { command: 'pause', skipDump: true },
    { timeoutMs: pauseTimeoutMs }
  );
  if (matched && payload && payload.isPaused === true) {
    return {
      pauseRequested: true,
      pauseAttempted: true,
      pauseConfirmed: true,
      startPaused: true,
      status: payload,
    };
  }

  const statusConfirmation = await waitForPreviewRuntimeReady(
    previewDebuggerServer,
    targetId,
    {
      timeoutMs: Math.max(500, timeoutMs - pauseTimeoutMs),
      requirePaused: true,
      operation,
    }
  );
  if (statusConfirmation.ready) {
    return {
      pauseRequested: true,
      pauseAttempted: true,
      pauseConfirmed: true,
      startPaused: true,
      status: statusConfirmation.status,
    };
  }

  return {
    ...statusConfirmation,
    pauseRequested: true,
    pauseAttempted: true,
    pauseConfirmed: false,
    startPaused: false,
    status: matched ? payload : statusConfirmation.status,
    failurePhase: 'pause-confirmation',
  };
};

const makeLaunchPreviewNotReadyResult = ({
  launched,
  attached,
  debuggerId,
  availableDebuggerIds,
  readiness,
  startPaused,
  note,
}: {|
  launched: boolean,
  attached?: boolean,
  debuggerId?: ?string,
  availableDebuggerIds?: ?Array<string>,
  readiness: Object,
  startPaused: boolean,
  note: string,
|}): Object => ({
  success: false,
  launched,
  attached: !!attached,
  ready: false,
  runtimeReady: false,
  startPaused: false,
  requestedStartPaused: !!startPaused,
  pauseRequested: !!startPaused,
  pauseAttempted: !!readiness.pauseAttempted,
  pauseConfirmed: false,
  debuggerId,
  availableDebuggerIds,
  ...readiness,
  note,
});

// Decide which layout a preview should run, independent of the editor's
// currently-focused tab. Precedence: explicit scene_name arg → project's first
// layout → the first layout in the project. Returns the resolved expected scene
// (or null when no project is available) and, when scene_name is unknown, an
// error describing the valid scenes so the caller can fail loudly instead of
// silently previewing the wrong (focused) scene.
const resolveExpectedPreviewScene = (
  project: ?gdProject,
  args: ?Object
): {|
  expectedScene: ?string,
  requestedScene: ?string,
  firstLayout: ?string,
  error?: string,
|} => {
  const requestedScene = getStringArg(args, ['scene_name', 'sceneName']);
  if (!project) {
    return {
      expectedScene: requestedScene || null,
      requestedScene,
      firstLayout: null,
    };
  }

  const sceneNames = getSceneNames(project);
  const firstLayout = project.getFirstLayout() || null;

  if (requestedScene) {
    if (!project.hasLayoutNamed(requestedScene)) {
      return {
        expectedScene: null,
        requestedScene,
        firstLayout,
        error: `Scene not found: "${requestedScene}". Available scenes: ${
          sceneNames.length ? sceneNames.join(', ') : '(none)'
        }.`,
      };
    }
    return { expectedScene: requestedScene, requestedScene, firstLayout };
  }

  // No explicit scene: prefer the configured first layout, then the first scene.
  const defaultScene =
    firstLayout && project.hasLayoutNamed(firstLayout)
      ? firstLayout
      : sceneNames.length
      ? sceneNames[0]
      : null;
  return { expectedScene: defaultScene, requestedScene: null, firstLayout };
};

const getStatusSceneName = (status: ?Object): ?string =>
  status && typeof status.sceneName === 'string' ? status.sceneName : null;

// Annotate a successful launch/attach result with scene-selection facts so a
// caller can detect when the running scene is NOT the one it expected (the core
// bug this fixes: launch_preview used to silently report success while running
// whatever scene the editor tab was focused on).
const annotateLaunchSceneResult = (
  result: Object,
  {
    expectedScene,
    requestedScene,
    firstLayout,
    sceneSelectionSupported,
  }: {|
    expectedScene: ?string,
    requestedScene: ?string,
    firstLayout: ?string,
    sceneSelectionSupported: boolean,
  |}
): Object => {
  const annotated: Object = {
    ...result,
    requestedStartPaused: !!result.pauseRequested || !!result.startPaused,
    pauseAttempted:
      result.pauseAttempted !== undefined
        ? !!result.pauseAttempted
        : !!result.pauseConfirmed,
    requestedScene: requestedScene || undefined,
    expectedScene: expectedScene || undefined,
    firstLayout: firstLayout || undefined,
    sceneSelectionSupported,
  };
  const actualScene = getStatusSceneName(result.status);
  if (actualScene) annotated.actualScene = actualScene;

  if (expectedScene && actualScene && actualScene !== expectedScene) {
    annotated.sceneMismatch = true;
    annotated.note = `${
      result.note ? result.note + ' ' : ''
    }WARNING: the running scene is "${actualScene}" but "${expectedScene}" was expected${
      requestedScene
        ? ` (requested scene_name="${requestedScene}")`
        : ' (project first scene)'
    }.${
      sceneSelectionSupported
        ? ''
        : " This editor build cannot target a scene from MCP, so the preview ran the editor's active tab."
    }`;
  } else if (!sceneSelectionSupported && expectedScene && !actualScene) {
    // Could not confirm the scene and could not select it — warn conservatively.
    annotated.note = `${
      result.note ? result.note + ' ' : ''
    }NOTE: this editor build cannot target a specific scene from MCP; the preview runs the editor's active tab, which may not be "${expectedScene}".`;
  }
  return annotated;
};

const launchPreview = async (
  previewDebuggerServer: ?Object,
  runCommand: ?(string) => boolean,
  args: Object,
  options?: {|
    getProject?: ?() => ?gdProject,
    launchPreviewForScene?: ?(
      sceneName: ?string,
      options?: {| displayCollisionShapes?: boolean |}
    ) => mixed,
    cancelPreviewLaunch?: ?(reason: string) => mixed,
  |}
): Promise<Object> => {
  if (typeof runCommand !== 'function') {
    return {
      success: false,
      ready: false,
      failurePhase: 'window-launch',
      error: 'Launching previews is not supported in this editor build.',
    };
  }

  const startPaused = !!(args && (args.start_paused || args.startPaused));
  const displayCollisionShapes =
    args && typeof args.display_collision_shapes === 'boolean'
      ? args.display_collision_shapes
      : args && typeof args.displayCollisionShapes === 'boolean'
      ? args.displayCollisionShapes
      : undefined;
  // Collision-shape display is an export-time preview option. An attached
  // preview cannot be reconfigured, so an explicit value requires a new one.
  const forceNew =
    !!(args && (args.force_new || args.forceNew)) ||
    displayCollisionShapes !== undefined;
  const timeoutMs = getPreviewReadinessTimeoutMs(args, 15000);

  const getProject =
    options && typeof options.getProject === 'function'
      ? options.getProject
      : null;
  const launchPreviewForScene =
    options && typeof options.launchPreviewForScene === 'function'
      ? options.launchPreviewForScene
      : null;
  const cancelPreviewLaunch =
    options && typeof options.cancelPreviewLaunch === 'function'
      ? options.cancelPreviewLaunch
      : null;
  const project = getProject ? getProject() : null;
  const sceneResolution = resolveExpectedPreviewScene(project, args);
  if (sceneResolution.error) {
    return {
      success: false,
      launched: false,
      ready: false,
      failurePhase: 'scene-selection',
      requestedScene: sceneResolution.requestedScene || undefined,
      availableScenes: project ? getSceneNames(project) : undefined,
      error: sceneResolution.error,
    };
  }
  const { expectedScene, requestedScene, firstLayout } = sceneResolution;
  // We can actually launch a chosen scene only when the host provides the
  // scene-aware launcher. Otherwise we fall back to the legacy command (active
  // tab) and flag that scene selection was not honored.
  const sceneSelectionSupported = !!launchPreviewForScene;
  const annotate = (result: Object): Object => {
    const annotatedResult = annotateLaunchSceneResult(result, {
      expectedScene,
      requestedScene,
      firstLayout,
      sceneSelectionSupported,
    });
    if (displayCollisionShapes !== undefined) {
      annotatedResult.displayCollisionShapes = displayCollisionShapes;
    }
    return annotatedResult;
  };
  let launchFailureDetails: ?Object = null;
  const makeWindowLaunchFailure = () => ({
    success: false,
    launched: false,
    ready: false,
    failurePhase: 'window-launch',
    error:
      launchFailureDetails && launchFailureDetails.reason
        ? `Could not launch a preview: ${launchFailureDetails.reason}.`
        : launchFailureDetails && launchFailureDetails.error
        ? `Could not launch a preview: ${launchFailureDetails.error}.`
        : 'Could not launch a preview.',
    launchFailureDetails: launchFailureDetails || undefined,
  });
  // Launch the preview using the scene-aware launcher when available, falling
  // back to the legacy command which previews the editor's active tab.
  const runLaunchCommandWithoutTimeout = async (): Promise<boolean> => {
    launchFailureDetails = null;
    if (launchPreviewForScene) {
      try {
        const launchResult =
          displayCollisionShapes === undefined
            ? await launchPreviewForScene(expectedScene || null)
            : await launchPreviewForScene(expectedScene || null, {
                displayCollisionShapes,
              });
        if (launchResult === false) {
          launchFailureDetails = { reason: 'scene-aware launch was rejected' };
          return false;
        }
        if (
          launchResult &&
          typeof launchResult === 'object' &&
          launchResult.accepted === false
        ) {
          launchFailureDetails = launchResult;
          return false;
        }
        return true;
      } catch (error) {
        launchFailureDetails = {
          error: error && error.message ? error.message : String(error),
        };
        return false;
      }
    }
    if (displayCollisionShapes !== undefined) {
      launchFailureDetails = {
        reason: 'collision-shape-display-is-not-supported',
      };
      return false;
    }
    return runCommand('LAUNCH_DEBUG_PREVIEW');
  };
  const runLaunchCommand = async (): Promise<boolean> => {
    let didTimeOut = false;
    let timeoutId: any = null;
    const didRun = await Promise.race([
      runLaunchCommandWithoutTimeout(),
      new Promise(resolve => {
        timeoutId = setTimeout(() => {
          didTimeOut = true;
          resolve(false);
        }, timeoutMs);
      }),
    ]);
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (!didTimeOut) return !!didRun;

    let cancellation = null;
    if (cancelPreviewLaunch) {
      try {
        cancellation = await cancelPreviewLaunch(
          `the MCP preview launch command did not settle within ${timeoutMs} ms`
        );
      } catch (error) {
        cancellation = {
          error: error && error.message ? error.message : String(error),
        };
      }
    }
    launchFailureDetails = {
      reason: 'preview-launch-command-timeout',
      timeoutMs,
      cancellation: cancellation || undefined,
    };
    return false;
  };

  if (!forceNew && previewDebuggerServer) {
    const connectedIds = getPreviewDebuggerIds(previewDebuggerServer);
    if (connectedIds.length) {
      const attachId = connectedIds[connectedIds.length - 1];
      const readiness = await waitForPreviewRuntimeReady(
        (previewDebuggerServer: any),
        attachId,
        { timeoutMs, operation: 'launch_preview.attach' }
      );
      if (readiness.ready) {
        // If an explicit scene_name was requested and we can target scenes, but
        // the already-running preview is on a different scene, don't silently
        // attach to the wrong scene — fall through to launch a fresh preview on
        // the requested scene instead.
        const attachedScene = getStatusSceneName(readiness.status);
        const needsSceneRelaunch =
          !!requestedScene &&
          sceneSelectionSupported &&
          !!attachedScene &&
          attachedScene !== requestedScene;

        if (!needsSceneRelaunch) {
          if (!startPaused) {
            return annotate({
              success: true,
              ready: true,
              runtimeReady: true,
              launched: false,
              attached: true,
              debuggerId: attachId,
              availableDebuggerIds: connectedIds,
              status: readiness.status,
              startPaused: false,
              note:
                'Attached to the already-running preview (no new window opened). The runtime answered getStatus. It keeps running in real time; for deterministic tests use run_frames, or pass start_paused:true to pause it now, or force_new:true to open a fresh window.',
            });
          }

          const pause = await pausePreviewAndConfirm(
            (previewDebuggerServer: any),
            attachId,
            timeoutMs,
            'launch_preview.attach.pause'
          );
          if (!pause.pauseConfirmed) {
            return makeLaunchPreviewNotReadyResult({
              launched: false,
              attached: true,
              debuggerId: attachId,
              availableDebuggerIds: connectedIds,
              readiness: pause,
              startPaused: true,
              note:
                'Attached to the already-running preview, but start_paused was requested and the pause was not confirmed. The preview may already be running in real time.',
            });
          }

          return annotate({
            success: true,
            ready: true,
            runtimeReady: true,
            launched: false,
            attached: true,
            debuggerId: attachId,
            availableDebuggerIds: connectedIds,
            startPaused: true,
            pauseRequested: true,
            pauseConfirmed: true,
            status: pause.status,
            note:
              'Attached to the already-running preview and paused it (no new window opened). Use run_frames / control_preview { action:"step" } to advance, or control_preview { action:"play" } to resume. Pass force_new:true to open a fresh window instead.',
          });
        }
        // else: fall through to a fresh launch on the requested scene.
      } else {
        return makeLaunchPreviewNotReadyResult({
          launched: false,
          attached: true,
          debuggerId: attachId,
          availableDebuggerIds: connectedIds,
          readiness,
          startPaused,
          note:
            'Attached to an already-connected preview window, but its runtime debugger did not answer getStatus. Close all previews with control_preview, then call launch_preview with start_paused=true and force_new=true.',
        });
      }
    }
  }

  const existingIds = new Set(
    previewDebuggerServer ? getPreviewDebuggerIds(previewDebuggerServer) : []
  );

  if (!previewDebuggerServer) {
    const didRun = await runLaunchCommand();
    if (!didRun) {
      return makeWindowLaunchFailure();
    }

    return annotate({
      success: !startPaused,
      launched: true,
      ready: false,
      runtimeReady: false,
      startPaused: false,
      requestedStartPaused: startPaused,
      pauseRequested: startPaused || undefined,
      pauseAttempted: false,
      pauseConfirmed: false,
      failurePhase: 'debugger-server-unavailable',
      note: startPaused
        ? 'Preview launch was requested, but no preview debugger server is available, so MCP cannot confirm runtime readiness or pause it.'
        : 'Preview launch was requested, but no preview debugger server is available, so MCP cannot confirm runtime readiness.',
    });
  }

  const connectionPromise = waitForNewPreviewDebuggerId(
    (previewDebuggerServer: any),
    existingIds,
    timeoutMs
  );
  const didRun = await runLaunchCommand();
  if (!didRun) {
    return makeWindowLaunchFailure();
  }

  const connection = await connectionPromise;
  if (!connection.connected || !connection.debuggerId) {
    return {
      success: false,
      launched: true,
      ready: false,
      runtimeReady: false,
      startPaused: false,
      requestedStartPaused: startPaused,
      pauseRequested: startPaused || undefined,
      pauseAttempted: false,
      pauseConfirmed: false,
      failurePhase: connection.failurePhase || 'debugger-connect',
      availableDebuggerIds: connection.availableDebuggerIds,
      connectionError: connection.connectionError,
      note:
        'Preview launch command ran, but no new preview debugger id connected before the timeout. The preview may still be compiling or the window launch failed.',
    };
  }

  const readiness = await waitForPreviewRuntimeReady(
    (previewDebuggerServer: any),
    connection.debuggerId,
    {
      timeoutMs: Math.max(500, timeoutMs - (connection.elapsedMs || 0)),
      // A debugger websocket connects before the RuntimeScene is necessarily
      // installed. Pausing at that instant freezes an empty scene stack and
      // makes the first run_frames call incorrectly report zero instances.
      requireSceneName: !!expectedScene,
      expectedSceneName: sceneSelectionSupported ? expectedScene : null,
      operation: 'launch_preview.runtime-ready',
    }
  );
  if (!readiness.ready) {
    return makeLaunchPreviewNotReadyResult({
      launched: true,
      debuggerId: connection.debuggerId,
      availableDebuggerIds: connection.availableDebuggerIds,
      readiness,
      startPaused,
      note:
        'Preview window/debugger id connected, but the runtime did not answer getStatus before the timeout. Treat this preview as not ready; close all previews with control_preview, then call launch_preview with start_paused=true and force_new=true.',
    });
  }

  if (startPaused) {
    const pause = await pausePreviewAndConfirm(
      (previewDebuggerServer: any),
      connection.debuggerId,
      Math.max(500, timeoutMs - (readiness.elapsedMs || 0)),
      'launch_preview.pause'
    );
    if (!pause.pauseConfirmed) {
      return makeLaunchPreviewNotReadyResult({
        launched: true,
        debuggerId: connection.debuggerId,
        availableDebuggerIds: connection.availableDebuggerIds,
        readiness: pause,
        startPaused: true,
        note:
          'Preview runtime answered getStatus, but start_paused was requested and the pause was not confirmed before the timeout.',
      });
    }

    return annotate({
      success: true,
      launched: true,
      ready: true,
      runtimeReady: true,
      startPaused: true,
      pauseRequested: true,
      pauseConfirmed: true,
      debuggerId: connection.debuggerId,
      availableDebuggerIds: connection.availableDebuggerIds,
      status: pause.status,
      note:
        'Preview launched, runtime readiness was confirmed with getStatus, and pause was confirmed. Use run_frames / control_preview { action:"step" } to advance deterministically, or control_preview { action:"play" } to run in real time.',
    });
  }

  return annotate({
    success: true,
    launched: true,
    ready: true,
    runtimeReady: true,
    startPaused: false,
    debuggerId: connection.debuggerId,
    availableDebuggerIds: connection.availableDebuggerIds,
    status: readiness.status,
    note:
      'Preview launched and runtime readiness was confirmed with getStatus. It is running in real time; use run_frames for deterministic stepping.',
  });
};

// Deterministic preview control: pause / play / step N frames. Pausing then
// stepping makes runtime testing reproducible (no wall-clock drift between MCP
// round-trips). Returns the step result when stepping.
const controlPreview = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;
  const action = args && typeof args.action === 'string' ? args.action : 'step';

  if (action === 'pause' || action === 'play') {
    const command = action === 'pause' ? 'pause' : 'play';
    const { matched, payload } = await sendTargetedRequest(
      (previewDebuggerServer: any),
      targetId,
      command === 'pause' ? { command, skipDump: true } : { command },
      { timeoutMs: 1500 }
    );
    if (!matched) {
      return {
        success: true,
        running: true,
        debuggerId: targetId,
        action,
        confirmed: false,
        note:
          'Command sent but not confirmed (no status reply from the targeted preview before timeout).',
      };
    }
    return {
      success: !payload.error,
      running: true,
      debuggerId: targetId,
      action,
      confirmed: true,
      status: payload,
      isPaused: payload.isPaused,
      error: payload.error || undefined,
    };
  }

  // Note: action === 'close' is handled at the tool-handler level (it closes
  // preview windows via the launcher, not the debugger server).

  if (action === 'step') {
    const count = args && typeof args.frames === 'number' ? args.frames : 1;
    const fakeElapsedTimeMs =
      args && typeof args.frame_delta_ms === 'number'
        ? args.frame_delta_ms
        : undefined;
    const { matched, payload } = await sendTargetedRequest(
      (previewDebuggerServer: any),
      targetId,
      { command: 'stepFrames', count, fakeElapsedTimeMs }
    );
    if (!matched) {
      return {
        success: true,
        running: true,
        debuggerId: targetId,
        action: 'step',
        requestedFrames: count,
        note:
          'Step requested but not confirmed (no reply from the targeted preview before timeout).',
      };
    }
    return {
      success: true,
      running: true,
      debuggerId: targetId,
      action: 'step',
      ...payload,
    };
  }

  return {
    success: false,
    running: true,
    error: `Unknown action "${action}". Use pause, play, step, or close.`,
  };
};

// Inject test/debug state into a running preview: set scene/global variables,
// move/spawn/delete instances. For verifying gameplay states that are hard to
// reach naturally (e.g. set GameOver=0, spawn an enemy, move the player).
const setRuntimeState = async (
  previewDebuggerServer: ?Object,
  args: Object
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;
  const operations = Array.isArray(args && args.operations)
    ? args.operations
    : null;
  if (!operations || !operations.length) {
    return {
      success: false,
      running: true,
      error:
        'Missing "operations": an array, e.g. [{ type: "setVariable", scope: "scene", name: "GameOver", value: 0 }].',
    };
  }
  // Target the chosen preview specifically (defaults to the latest), so a stale
  // window does not answer instead.
  const { matched, payload } = await sendTargetedRequest(
    (previewDebuggerServer: any),
    targetId,
    { command: 'setRuntimeState', operations }
  );
  if (!matched) {
    return {
      success: true,
      running: true,
      debuggerId: targetId,
      appliedCount: operations.length,
      note:
        'State sent but not confirmed (no reply from the targeted preview before timeout).',
    };
  }
  return {
    success: !payload.error,
    running: true,
    debuggerId: targetId,
    applied: payload.applied,
    error: payload.error || undefined,
  };
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

  if (uri !== 'gdevelop://project/summary') {
    throw new Error(`Unknown GDevelop MCP resource: ${uri}`);
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

  throw new Error(`Unknown GDevelop MCP resource: ${uri}`);
};

const parseMcpToolResult = (result: McpToolResult): Object => {
  if (!result || !Array.isArray(result.content) || !result.content[0]) {
    return {};
  }
  try {
    return JSON.parse(result.content[0].text);
  } catch (error) {
    return { message: result.content[0].text };
  }
};

const compareVerificationValues = (
  actual: any,
  operator: string,
  expected: any
): boolean => {
  if (operator === 'eq') return actual === expected;
  if (operator === 'ne') return actual !== expected;
  if (operator === 'gt') return actual > expected;
  if (operator === 'gte') return actual >= expected;
  if (operator === 'lt') return actual < expected;
  if (operator === 'lte') return actual <= expected;
  return false;
};

const findRendererLayerDiagnostic = (
  inspection: Object,
  layerName: string
): ?Object => {
  const diagnostics =
    inspection && inspection.rendererDiagnostics
      ? inspection.rendererDiagnostics
      : inspection &&
        inspection.runtime &&
        inspection.runtime.rendererDiagnostics
      ? inspection.runtime.rendererDiagnostics
      : null;
  const scenes =
    diagnostics && Array.isArray(diagnostics.scenes) ? diagnostics.scenes : [];
  for (let sceneIndex = scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
    const layers = Array.isArray(scenes[sceneIndex].layers)
      ? scenes[sceneIndex].layers
      : [];
    const layer = layers.find(item => item && item.layerName === layerName);
    if (layer) return layer;
  }
  return null;
};

const evaluateProjectChangeAssertions = (
  assertions: Array<Object>,
  inspection: Object
): Array<Object> => {
  const runtimeScenes =
    inspection && inspection.runtime && Array.isArray(inspection.runtime.scenes)
      ? inspection.runtime.scenes
      : [];
  const runtimeScene = runtimeScenes[runtimeScenes.length - 1] || null;
  return assertions.map((assertion, index) => {
    let actual;
    let expected = assertion.value;
    let passed = false;
    let details;

    if (assertion.type === 'object_count') {
      actual =
        runtimeScene &&
        runtimeScene.objectInstanceCounts &&
        typeof runtimeScene.objectInstanceCounts[assertion.object_name] ===
          'number'
          ? runtimeScene.objectInstanceCounts[assertion.object_name]
          : 0;
      passed = compareVerificationValues(actual, assertion.operator, expected);
    } else if (assertion.type === 'instance_position_finite') {
      const instanceIndex =
        typeof assertion.instance_index === 'number'
          ? assertion.instance_index
          : 0;
      const positions =
        runtimeScene &&
        runtimeScene.instancePositions &&
        Array.isArray(runtimeScene.instancePositions[assertion.object_name])
          ? runtimeScene.instancePositions[assertion.object_name]
          : [];
      actual = positions[instanceIndex] || null;
      expected = 'finite x/y/z (when z is present)';
      passed =
        !!actual &&
        Number.isFinite(actual.x) &&
        Number.isFinite(actual.y) &&
        (actual.z === undefined || Number.isFinite(actual.z));
    } else if (assertion.type === 'runtime_error_count') {
      actual =
        inspection && Array.isArray(inspection.errors)
          ? inspection.errors.length
          : 0;
      passed = compareVerificationValues(actual, assertion.operator, expected);
    } else {
      const layerName =
        typeof assertion.layer_name === 'string' ? assertion.layer_name : '';
      const layer = findRendererLayerDiagnostic(inspection, layerName);
      const fieldByType = {
        renderer_has_three_group: 'hasThreeGroup',
        renderer_visible_mesh_count: 'visibleThreeMeshCount',
        renderer_failed_texture_count: 'failedTextureCount',
        renderer_rejected_object_count: 'rejected3DRendererObjectCount',
      };
      const field = fieldByType[assertion.type];
      if (!field) {
        details = 'Unsupported assertion type.';
      } else if (!layer) {
        details = `Renderer diagnostics for layer "${layerName}" are unavailable.`;
      } else {
        actual = layer[field];
        passed = compareVerificationValues(
          actual,
          assertion.operator,
          expected
        );
      }
    }

    return {
      index,
      type: assertion.type,
      passed,
      actual,
      expected,
      operator: assertion.operator || undefined,
      objectName: assertion.object_name || undefined,
      layerName: assertion.layer_name || undefined,
      details,
    };
  });
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
  const permission = canCallMcpTool(toolName, permissions);
  if (!permission.canCall) {
    return errorResult(permission.reason || 'MCP tool is not allowed.');
  }

  const project = context.getProject();

  if (toolName === 'verify_project_change') {
    const hasPreviewLaunchSequenceReservation =
      typeof context.beginPreviewLaunchSequence === 'function';
    if (
      hasPreviewLaunchSequenceReservation &&
      !context.beginPreviewLaunchSequence()
    ) {
      return errorResult(
        'Could not start verification because another MCP preview workflow is already in progress.',
        {
          code: 'PREVIEW_LAUNCH_SEQUENCE_ALREADY_IN_PROGRESS',
          success: false,
          runtimeVerified: false,
          completionReady: false,
        }
      );
    }

    try {
      const receipts: Array<Object> = [];
      const runStage = async (
        stage: string,
        name: string,
        stageArgs: Object
      ): Promise<
        | {| failed: true, result: McpToolResult |}
        | {| failed: false, receipt: Object |}
      > => {
        const response = await callMcpTool({
          toolName: name,
          args: stageArgs,
          context,
        });
        const receipt = parseMcpToolResult(response);
        receipts.push({ stage, toolName: name, receipt });
        if (
          response.isError ||
          receipt.success === false ||
          receipt.valid === false
        ) {
          return {
            failed: true,
            result: errorResult(
              `verify_project_change stopped during ${stage}.`,
              {
                code: 'VERIFY_PROJECT_CHANGE_STAGE_FAILED',
                success: false,
                runtimeVerified: false,
                completionReady: false,
                failureStage: stage,
                receipts,
              }
            ),
          };
        }
        return { failed: false, receipt };
      };

      let stageResult = await runStage(
        'validation',
        'validate_project_files',
        {}
      );
      if (stageResult.failed) return stageResult.result;

      if (!args || args.close_existing_previews !== false) {
        stageResult = await runStage('close-previews', 'control_preview', {
          action: 'close',
          close_all: true,
        });
        if (stageResult.failed) return stageResult.result;
      }

      // Stop any preview that may still be compiling from the current native
      // project before reload_project replaces and deletes that project. The
      // sequence reservation prevents tab effects from starting another one.
      stageResult = await runStage('reload', 'reload_project', {
        // verify_project_change already owns the preview launch sequence for
        // the whole validate/close/reload/launch workflow. Avoid trying to
        // acquire the same non-reentrant reservation again in reload_project.
        _preview_launch_sequence_already_reserved: true,
      });
      if (stageResult.failed) return stageResult.result;

      stageResult = await runStage('launch', 'launch_preview', {
        scene_name:
          args && typeof args.scene_name === 'string'
            ? args.scene_name
            : undefined,
        start_paused: true,
        force_new: true,
        timeout_ms:
          args && typeof args.timeout_ms === 'number'
            ? args.timeout_ms
            : undefined,
      });
      if (stageResult.failed) return stageResult.result;
      const debuggerId = stageResult.receipt.debuggerId;

      const assertions =
        args && Array.isArray(args.assertions) ? args.assertions : [];
      const assertionObjectNames = assertions
        .filter(
          assertion =>
            assertion &&
            (assertion.type === 'object_count' ||
              assertion.type === 'instance_position_finite') &&
            typeof assertion.object_name === 'string'
        )
        .map(assertion => assertion.object_name);
      const requestedObjects =
        args && Array.isArray(args.objects) ? args.objects : [];
      const objects = Array.from(
        new Set([...requestedObjects, ...assertionObjectNames])
      );

      stageResult = await runStage('frames', 'run_frames', {
        inputs: args && Array.isArray(args.inputs) ? args.inputs : undefined,
        frames: args && typeof args.frames === 'number' ? args.frames : 1,
        frame_delta_ms:
          args && typeof args.frame_delta_ms === 'number'
            ? args.frame_delta_ms
            : undefined,
        auto_release: true,
        debugger_id: debuggerId || undefined,
        objects: objects.length ? objects : undefined,
        instance_positions_for: objects.length ? objects : undefined,
        include:
          args && Array.isArray(args.include)
            ? args.include
            : objects.length
            ? ['position', 'angle', 'variables', 'behaviors']
            : undefined,
        instance_indexes:
          args && Array.isArray(args.instance_indexes)
            ? args.instance_indexes
            : undefined,
      });
      if (stageResult.failed) return stageResult.result;

      stageResult = await runStage(
        'inspect',
        'gdevelop_inspect_running_preview',
        {
          debugger_id: debuggerId || undefined,
          timeout_ms:
            args && typeof args.timeout_ms === 'number'
              ? args.timeout_ms
              : undefined,
          objects: objects.length ? objects : undefined,
          instance_positions_for: objects.length ? objects : undefined,
          include:
            args && Array.isArray(args.include)
              ? args.include
              : objects.length
              ? ['position', 'angle', 'variables', 'behaviors']
              : undefined,
          instance_indexes:
            args && Array.isArray(args.instance_indexes)
              ? args.instance_indexes
              : undefined,
        }
      );
      if (stageResult.failed) return stageResult.result;
      const inspection = stageResult.receipt;

      const assertionResults = evaluateProjectChangeAssertions(
        assertions,
        inspection
      );
      receipts.push({
        stage: 'assertions',
        assertions: assertionResults,
      });
      const failedAssertion = assertionResults.find(result => !result.passed);
      if (failedAssertion) {
        return errorResult('A runtime verification assertion failed.', {
          code: 'VERIFY_PROJECT_CHANGE_ASSERTION_FAILED',
          success: false,
          runtimeVerified: false,
          completionReady: false,
          failureStage: 'assertions',
          failedAssertion,
          assertions: assertionResults,
          receipts,
        });
      }

      if (args && args.screenshot) {
        stageResult = await runStage(
          'screenshot',
          'capture_preview_screenshot',
          {
            ...args.screenshot,
            debugger_id: debuggerId || args.screenshot.debugger_id,
          }
        );
        if (stageResult.failed) return stageResult.result;
      }

      return textResult({
        success: true,
        runtimeVerified: true,
        completionReady: true,
        sceneName:
          args && typeof args.scene_name === 'string'
            ? args.scene_name
            : undefined,
        debuggerId,
        assertions: assertionResults,
        receipts,
      });
    } finally {
      if (
        hasPreviewLaunchSequenceReservation &&
        context.endPreviewLaunchSequence
      ) {
        context.endPreviewLaunchSequence();
      }
    }
  }

  if (toolName === 'gdevelop_get_editor_state') {
    return textResult(
      getEditorState(
        project,
        permissions,
        context.getPreviewLaunchState ? context.getPreviewLaunchState() : null
      )
    );
  }

  if (toolName === 'open_project') {
    if (!path) {
      return errorResult(
        'Opening a local project is only available in the GDevelop desktop app.',
        { code: 'MCP_OPEN_PROJECT_UNAVAILABLE' }
      );
    }
    const openProjectAndWait = context.openProjectAndWait;
    if (!openProjectAndWait) {
      return errorResult(
        'The GDevelop host did not provide openProjectAndWait, so MCP cannot open a local project.',
        { code: 'MCP_OPEN_PROJECT_UNAVAILABLE' }
      );
    }

    const requestedProjectPath =
      args && typeof args.project_path === 'string'
        ? args.project_path.trim()
        : '';
    if (!requestedProjectPath) {
      return errorResult('project_path must be a non-empty string.', {
        code: 'MCP_OPEN_PROJECT_INVALID_PATH',
      });
    }
    if (!path.isAbsolute(requestedProjectPath)) {
      return errorResult('project_path must be an absolute local path.', {
        code: 'MCP_OPEN_PROJECT_PATH_NOT_ABSOLUTE',
        projectPath: requestedProjectPath,
      });
    }

    const normalizedProjectPath = path.normalize(requestedProjectPath);
    const projectFileName = path.basename(normalizedProjectPath).toLowerCase();
    const projectFileExtension = path
      .extname(normalizedProjectPath)
      .toLowerCase();
    if (
      projectFileName !== MULTI_FILE_ENTRY_NAME &&
      projectFileExtension !== '.json'
    ) {
      return errorResult(
        `project_path must point to ${MULTI_FILE_ENTRY_NAME} or a legacy JSON project file.`,
        {
          code: 'MCP_OPEN_PROJECT_INVALID_ENTRY',
          projectPath: normalizedProjectPath,
        }
      );
    }

    const persistenceState = context.getPersistenceState
      ? context.getPersistenceState()
      : null;
    const discardUnsavedChanges = !!(
      args && args.discard_unsaved_changes === true
    );
    if (
      persistenceState &&
      persistenceState.hasUnsavedChanges &&
      !discardUnsavedChanges
    ) {
      return errorResult(
        'The current project has unsaved in-memory changes. Save them first or retry with discard_unsaved_changes:true.',
        {
          code: 'MCP_OPEN_PROJECT_UNSAVED_CHANGES',
          projectPath: normalizedProjectPath,
          hasUnsavedChanges: true,
          changesCount: persistenceState.changesCount,
        }
      );
    }

    try {
      const openResult = await openProjectAndWait({
        projectPath: normalizedProjectPath,
        discardUnsavedChanges,
        reportProgress: context.reportProgress,
      });
      if (!openResult || openResult.opened === false) {
        return errorResult(
          (openResult && openResult.reason) ||
            'The requested project could not be opened.',
          {
            code: (openResult && openResult.code) || 'MCP_OPEN_PROJECT_FAILED',
            projectPath: normalizedProjectPath,
            open: openResult || undefined,
          }
        );
      }
      return textResult({
        success: true,
        opened: true,
        requestedProjectPath: normalizedProjectPath,
        projectName: openResult.projectName,
        projectFile: openResult.projectFile || normalizedProjectPath,
        discardedUnsavedInMemoryChanges:
          !!persistenceState && persistenceState.hasUnsavedChanges,
        open: openResult,
        nextAction:
          'The requested project is loaded in the editor. Use gdevelop_get_editor_state or gdevelop_get_project_summary to inspect it.',
      });
    } catch (error) {
      return errorResult(
        error && error.message
          ? error.message
          : 'Unable to open the requested project.',
        {
          code: error && error.code ? error.code : 'MCP_OPEN_PROJECT_FAILED',
          projectPath: normalizedProjectPath,
        }
      );
    }
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

  if (toolName === 'generate-catalogs') {
    if (!project) return errorResult('No project opened.');
    const projectFile = project.getProjectFile();
    if (!projectFile) {
      return errorResult(
        'The current project has no disk location. Save it as a multi-file project before generating catalogs.',
        {
          catalogsRegenerated: false,
          phase: 'locate-project-files',
        }
      );
    }
    if (
      !path ||
      path.basename(projectFile).toLowerCase() !== MULTI_FILE_ENTRY_NAME
    ) {
      return errorResult(
        'generate-catalogs requires a local multi-file project whose entry file is project.gdevelop.',
        {
          catalogsRegenerated: false,
          phase: 'locate-project-files',
          projectFile,
        }
      );
    }

    try {
      const {
        projectRoot,
        catalogs,
      } = await generateProjectSourceCatalogsFromDisk(projectFile);
      return textResult({
        success: true,
        projectFile,
        catalogsRegenerated: true,
        writeMode: 'awaited-and-verified',
        catalogs,
        catalogFiles: {
          instructions: path.join(
            projectRoot,
            '.gdevelop',
            'instructions-catalog.json'
          ),
          deprecatedInstructions: path.join(
            projectRoot,
            '.gdevelop',
            'deprecated-instructions-catalog.json'
          ),
          settings: path.join(
            projectRoot,
            '.gdevelop',
            'settings-catalog.json'
          ),
          runtimeApi: path.join(projectRoot, '.gdevelop', 'runtime-api.d.ts'),
          projectApi: path.join(projectRoot, '.gdevelop', 'project-api.d.ts'),
        },
        nextAction:
          'Read the refreshed catalogs before making edits that depend on newly added or changed project structure. Run validate_project_files after the final source edit before reload_project.',
        note:
          'All three generated catalog files and both JavaScript declaration files were written sequentially and verified before this response. Embedded-layout authoring data is included in settings-catalog.json; the retired layout-catalog.json was removed. Project source files and editor memory were not modified.',
      });
    } catch (error) {
      const diagnostic = getProjectFilesValidationDiagnostic(
        error,
        projectFile
      );
      return errorResult('Unable to regenerate the project source catalogs.', {
        catalogsRegenerated: false,
        phase: diagnostic.phase,
        projectFile,
        errors: [diagnostic],
      });
    }
  }

  if (toolName === 'validate_project_files') {
    if (!project) return errorResult('No project opened.');
    const projectFile = project.getProjectFile();
    if (!projectFile) {
      return errorResult(
        'The current project has no disk location. Save it as a multi-file project before validating project files.',
        {
          valid: false,
          phase: 'locate-project-files',
          errors: [
            {
              severity: 'error',
              phase: 'locate-project-files',
              code: 'PROJECT_FILES_UNSAVED_PROJECT',
              message: 'The current project has no disk location.',
            },
          ],
        }
      );
    }
    if (
      !path ||
      path.basename(projectFile).toLowerCase() !== MULTI_FILE_ENTRY_NAME
    ) {
      return errorResult(
        'validate_project_files requires a local multi-file project whose entry file is project.gdevelop.',
        {
          valid: false,
          phase: 'locate-project-files',
          projectFile,
          errors: [
            {
              severity: 'error',
              phase: 'locate-project-files',
              code: 'PROJECT_FILES_INVALID_ENTRY',
              message:
                'The open project is not using project.gdevelop as its entry file.',
              filePath: projectFile,
            },
          ],
        }
      );
    }

    try {
      // Bootstrap without the potentially stale generated instruction catalog,
      // then regenerate every catalog from the disk-source project. Re-open the
      // sources afterward so final event compilation uses the fresh catalog.
      const {
        projectRoot,
        catalogs,
      } = await generateProjectSourceCatalogsFromDisk(projectFile);
      const settingsCatalog = validateProjectSettingsCatalog(
        JSON.parse(
          fs.readFileSync(
            path.join(projectRoot, '.gdevelop', 'settings-catalog.json'),
            'utf8'
          )
        )
      );
      const behaviorPropertySchemasByType = buildBehaviorPropertySchemasByType(
        settingsCatalog
      );
      const serializedProject = await openMultiFileProject(projectFile, {
        behaviorPropertySchemasByType,
      });
      const sourceTree = await readMultiFileSourceTree(projectFile);
      // Avoid a pretty-printed JSON string plus encodeURIComponent/unescape
      // copies. On large 3D projects, those transient strings compete with the
      // embedded scene renderer for the same renderer-process heap.
      const generatedJson = JSON.stringify(serializedProject);
      const generatedGameJson = {
        reconstructedInMemory: true,
        writtenToDisk: false,
        targetPath: path
          ? path.join(path.dirname(projectFile), '.gdevelop', 'game.json')
          : undefined,
        byteLength: Buffer.byteLength(generatedJson, 'utf8'),
      };
      const validation = validateSerializedProject(serializedProject, {
        include_generated_code: true,
        javascript_source_files: sourceTree.files,
      });
      const sourceLocatedErrors = (validation.errors || []).map(diagnostic =>
        addProjectSourceLocationDetails(diagnostic, projectFile)
      );
      const javascriptAuthoring = validation.javascriptAuthoring
        ? {
            ...validation.javascriptAuthoring,
            errors: (validation.javascriptAuthoring.errors || []).map(
              diagnostic =>
                addProjectSourceLocationDetails(diagnostic, projectFile)
            ),
            warnings: (validation.javascriptAuthoring.warnings || []).map(
              diagnostic =>
                addProjectSourceLocationDetails(diagnostic, projectFile)
            ),
            diagnostics: (validation.javascriptAuthoring.diagnostics || []).map(
              diagnostic =>
                addProjectSourceLocationDetails(diagnostic, projectFile)
            ),
            environmentDiagnostics: (
              validation.javascriptAuthoring.environmentDiagnostics || []
            ).map(diagnostic =>
              addProjectSourceLocationDetails(diagnostic, projectFile)
            ),
            sourceDiagnostics: (
              validation.javascriptAuthoring.sourceDiagnostics || []
            ).map(diagnostic =>
              addProjectSourceLocationDetails(diagnostic, projectFile)
            ),
          }
        : validation.javascriptAuthoring;
      const sourceLocatedValidation = {
        ...validation,
        errors: sourceLocatedErrors,
        javascriptAuthoring,
        environmentDiagnostics: (validation.environmentDiagnostics || []).map(
          diagnostic => addProjectSourceLocationDetails(diagnostic, projectFile)
        ),
        sourceDiagnostics: (validation.sourceDiagnostics || []).map(
          diagnostic => addProjectSourceLocationDetails(diagnostic, projectFile)
        ),
      };
      if (!validation.valid) {
        return errorResult(
          'The project files were composed into game.json, but the reconstructed project failed GDevelop validation.',
          {
            valid: false,
            phase: 'validate-generated-game-json',
            validationMode: 'multi-file-disk-sources',
            projectFile,
            catalogsRegenerated: true,
            javascriptApiRegenerated: true,
            catalogs,
            generatedGameJson,
            errors: sourceLocatedErrors,
            validation: sourceLocatedValidation,
          }
        );
      }
      return textResult({
        ...sourceLocatedValidation,
        validationMode: 'multi-file-disk-sources',
        projectFile,
        catalogsRegenerated: true,
        javascriptApiRegenerated: true,
        catalogs,
        generatedGameJson,
        nextAction:
          'RUNTIME VERIFICATION REQUIRED BEFORE COMPLETION: valid:true establishes structural and code-generation validity only; it does not verify runtime gameplay semantics. Call reload_project, then launch a paused preview and use run_frames for every behavior-sensitive change.',
        note:
          'STRUCTURAL VALIDATION ONLY — RUNTIME NOT VERIFIED. Regenerated all project source catalogs and JavaScript declaration files, loaded every referenced multi-file source again using the fresh instruction catalog, type-checked JavaScript event blocks against the generated public API, and reconstructed the legacy game.json representation in memory. Project source files and editor memory were not modified. valid:true proves parsing, reconstruction, project validation, JavaScript authoring-API validation, and extension generated-code preflight only; it does not prove object picking or action side effects at runtime and must not be reported as proof that the game works.',
      });
    } catch (error) {
      const diagnostic = getProjectFilesValidationDiagnostic(
        error,
        projectFile
      );
      return errorResult(
        'Unable to reconstruct game.json from the multi-file project sources.',
        {
          valid: false,
          phase: diagnostic.phase,
          validationMode: 'multi-file-disk-sources',
          projectFile,
          errors: [diagnostic],
        }
      );
    }
  }

  if (toolName === 'reload_project') {
    if (!project) return errorResult('No project opened.');
    if (!context.reloadProjectAndWait) {
      return errorResult(
        'The GDevelop host did not provide reloadProjectAndWait, so MCP cannot reload project files from disk.'
      );
    }
    const reloadProjectAndWait = context.reloadProjectAndWait;

    // Reloading a project remounts editor tabs. A 3D scene tab normally starts
    // its embedded preview as it mounts, which can race the explicit MCP
    // preview, load large 3D resources into the editor renderer, and keep the
    // shared preview launch lock busy. Reserve the preview sequence for a
    // standalone reload just like verify_project_change does for its complete
    // workflow. The internal flag is only used by verify_project_change, which
    // already owns this non-reentrant reservation.
    const previewLaunchSequenceAlreadyReserved = !!(
      args && args._preview_launch_sequence_already_reserved === true
    );
    const beginPreviewLaunchSequence = context.beginPreviewLaunchSequence;
    let didReservePreviewLaunchSequence = false;
    if (
      typeof beginPreviewLaunchSequence === 'function' &&
      !previewLaunchSequenceAlreadyReserved
    ) {
      didReservePreviewLaunchSequence = !!beginPreviewLaunchSequence();
      if (!didReservePreviewLaunchSequence) {
        return errorResult(
          'Could not reload the project because another MCP preview workflow is already in progress.',
          {
            code: 'PREVIEW_LAUNCH_SEQUENCE_ALREADY_IN_PROGRESS',
            success: false,
            reloaded: false,
          }
        );
      }
    }

    const persistenceState = context.getPersistenceState
      ? context.getPersistenceState()
      : null;
    try {
      const reloadResult = await reloadProjectAndWait(context.reportProgress);
      if (reloadResult && reloadResult.reloaded === false) {
        return errorResult(
          reloadResult.reason || 'The project could not be reloaded from disk.',
          { reload: reloadResult }
        );
      }
      const reloadedProject = context.getProject();
      return textResult({
        success: true,
        reloaded: true,
        discardedUnsavedInMemoryChanges:
          !!persistenceState && persistenceState.hasUnsavedChanges,
        projectName: reloadedProject ? reloadedProject.getName() : undefined,
        projectFile: reloadedProject
          ? reloadedProject.getProjectFile() || undefined
          : undefined,
        catalogsRegenerated:
          !!reloadResult && reloadResult.catalogsRegenerated === true,
        catalogs:
          reloadResult && reloadResult.catalogs
            ? reloadResult.catalogs
            : undefined,
        reload: reloadResult || undefined,
        nextAction:
          reloadResult && reloadResult.catalogsRegenerated
            ? 'Project disk sources are loaded and generated catalogs are refreshed. You may now call launch_preview.'
            : 'Project disk sources are loaded. You may now call launch_preview.',
      });
    } catch (error) {
      return errorResult(
        error && error.message
          ? error.message
          : 'Unable to reload the project from disk.',
        {
          code: error && error.code ? error.code : 'MCP_RELOAD_PROJECT_FAILED',
          catalogPhase:
            error && error.catalogPhase ? error.catalogPhase : undefined,
          catalogArtifact:
            error && error.catalogArtifact ? error.catalogArtifact : undefined,
        }
      );
    } finally {
      if (didReservePreviewLaunchSequence && context.endPreviewLaunchSequence) {
        context.endPreviewLaunchSequence();
      }
    }
  }

  if (toolName === 'import_extension') {
    if (!project) return errorResult('No project opened.');
    if (!context.ensureExtensionInstalled) {
      return errorResult(
        'The GDevelop host did not provide the native extension importer.'
      );
    }
    if (!context.saveProjectAndWait) {
      return errorResult(
        'The GDevelop host did not provide awaited project saving, so converted multi-file sources cannot be generated.'
      );
    }
    const ensureExtensionInstalled = context.ensureExtensionInstalled;
    const saveProjectAndWait = context.saveProjectAndWait;

    const extensionName =
      args && typeof args.extension_name === 'string'
        ? args.extension_name.trim()
        : '';
    if (!extensionName) {
      return errorResult('extension_name must be a non-empty string.');
    }
    if (extensionName.length > 128) {
      return errorResult('extension_name must not exceed 128 characters.');
    }
    const projectFile = project.getProjectFile();
    if (
      !path ||
      path.basename(projectFile).toLowerCase() !== MULTI_FILE_ENTRY_NAME
    ) {
      return errorResult(
        'import_extension requires a saved multi-file project whose entry file is project.gdevelop.'
      );
    }

    const wasAlreadyInstalled = project.hasEventsFunctionsExtensionNamed(
      extensionName
    );
    const projectHashBeforeImport = hashStructuredValue(
      serializeToJSObject(project)
    );
    const installedExtensionNames: Array<string> = [];
    let extensionInstallReceipt = null;
    try {
      if (!wasAlreadyInstalled) {
        extensionInstallReceipt = await ensureExtensionInstalled({
          extensionName,
          preflightExtension: async ({ serializedExtension, registryHeader }) =>
            validateReviewedExtensionJavaScriptAuthoring({
              serializedExtension,
              registryHeader,
            }),
          onWillInstallExtension: (names: Array<string>) => {
            if (context.onWillInstallExtension)
              context.onWillInstallExtension(names);
          },
          onExtensionInstalled: (names: Array<string>) => {
            names.forEach(name => {
              if (installedExtensionNames.indexOf(name) === -1)
                installedExtensionNames.push(name);
            });
            if (context.onExtensionInstalled)
              context.onExtensionInstalled(names);
          },
        });
      }

      if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
        return errorResult(
          `The native importer did not add "${extensionName}" to the project. Verify the exact repository/registry name and that it is a project extension rather than a built-in extension.`
        );
      }

      if (!wasAlreadyInstalled) context.triggerUnsavedChanges();
      const saveResult = await saveProjectAndWait();
      if (
        !saveResult ||
        (typeof saveResult === 'object' && saveResult.saved === false)
      ) {
        const saveFailureReason =
          saveResult && typeof saveResult === 'object'
            ? saveResult.reason
            : 'no-save-receipt';
        return errorResult(
          `Extension "${extensionName}" was loaded in editor memory, but its immediate project save failed (${saveFailureReason ||
            'unknown reason'}). Generated multi-file sources were not confirmed.`,
          {
            importerVersion: 3,
            extensionName,
            importedExtensions: installedExtensionNames,
            saved: false,
            save: saveResult || undefined,
          }
        );
      }

      const namesToReport = installedExtensionNames.length
        ? installedExtensionNames
        : [extensionName];
      const decomposedFiles = decomposeLegacyProjectToFiles(
        serializeToJSObject(project)
      );
      const generatedSources: { [string]: Array<string> } = {};
      namesToReport.forEach(name => {
        const extensionSettingsUri = Object.keys(decomposedFiles).find(uri => {
          if (!uri.endsWith('/extension.settings')) return false;
          const settings = parseTomlSource(decomposedFiles[uri], uri);
          return settings.kind === 'extension' && settings.name === name;
        });
        if (!extensionSettingsUri) {
          generatedSources[name] = [];
          return;
        }
        const extensionRoot = extensionSettingsUri.slice(
          0,
          -'extension.settings'.length
        );
        generatedSources[name] = Object.keys(decomposedFiles)
          .filter(uri => uri.indexOf(extensionRoot) === 0)
          .sort((left, right) => left.localeCompare(right));
      });

      const savedSourceTree = await readMultiFileSourceTree(projectFile);
      const savedSourceUris = new Set(Object.keys(savedSourceTree.files));
      const missingGeneratedSources: Array<string> = [];
      Object.keys(generatedSources).forEach(name => {
        generatedSources[name].forEach(uri => {
          if (!savedSourceUris.has(uri)) missingGeneratedSources.push(uri);
        });
      });
      if (missingGeneratedSources.length) {
        return errorResult(
          `Extension "${extensionName}" was saved, but generated multi-file sources could not be read back from disk.`,
          {
            importerVersion: 3,
            extensionName,
            importedExtensions: installedExtensionNames,
            missingGeneratedSources,
            saved: false,
          }
        );
      }

      return textResult({
        success: true,
        importerVersion: 3,
        extensionName,
        alreadyInstalled: wasAlreadyInstalled,
        importedExtensions: installedExtensionNames,
        projectFile,
        generatedSources,
        persistedSourcesVerified: true,
        compatibility:
          extensionInstallReceipt &&
          Array.isArray(extensionInstallReceipt.preflightReceipts)
            ? {
                policy: 'reviewed-store-extension',
                preflightedBeforeMutation: true,
                receipts: extensionInstallReceipt.preflightReceipts,
              }
            : {
                policy: wasAlreadyInstalled
                  ? 'already-installed-no-registry-preflight'
                  : 'host-did-not-return-preflight-receipts',
                preflightedBeforeMutation: false,
                receipts: [],
              },
        save: saveResult,
        nextAction:
          'Edit the generated project files directly. Call reload_project after the final file edit and before launch_preview.',
      });
    } catch (error) {
      const projectHashAfterFailure = hashStructuredValue(
        serializeToJSObject(project)
      );
      return errorResult(
        error && error.message
          ? error.message
          : `Unable to import extension "${extensionName}".`,
        {
          importerVersion: 3,
          extensionName,
          code: error && error.code ? error.code : 'EXTENSION_IMPORT_FAILED',
          importedExtensions: installedExtensionNames,
          installed: false,
          saved: false,
          projectUnchanged: projectHashBeforeImport === projectHashAfterFailure,
          projectHashBefore: projectHashBeforeImport,
          projectHashAfter: projectHashAfterFailure,
          compatibility:
            error && error.extensionCompatibility
              ? error.extensionCompatibility
              : undefined,
          writerError: {
            name: error && error.name ? error.name : undefined,
            code: error && error.code ? error.code : undefined,
            fileUri: error && error.fileUri ? error.fileUri : undefined,
          },
        }
      );
    }
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

  if (toolName === 'preview_health_check') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    return textResult(
      await previewHealthCheck(previewDebuggerServer, args || {})
    );
  }

  if (toolName === 'wait_until_preview_ready') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    return textResult(
      await waitUntilPreviewReady(previewDebuggerServer, args || {})
    );
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
      // When the preview responded, also fetch currently-playing sounds (so a
      // looping BGM can be confirmed even if recentSounds is flooded) and the
      // live input state. Best-effort; skipped if not running or opted out.
      if (
        result &&
        result.running &&
        result.debuggerId &&
        previewDebuggerServer &&
        !(args && args.skip_audio_and_input === true)
      ) {
        const sounds = await sendTargetedRequest(
          (previewDebuggerServer: any),
          result.debuggerId,
          { command: 'getActiveSounds' }
        );
        if (sounds.matched) result.activeSounds = sounds.payload;
        const input = await sendTargetedRequest(
          (previewDebuggerServer: any),
          result.debuggerId,
          { command: 'getInputState' }
        );
        if (input.matched) result.inputState = input.payload;
      }
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
        args || {},
        context.capturePreviewPage
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
        args || {},
        context.injectPreviewClickUserGesture
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'run_frames') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      const result = await runPreviewFrames(
        previewDebuggerServer,
        args || {},
        context.injectPreviewClickUserGesture
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'control_preview') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    // Closing actual preview WINDOWS goes through the preview launcher, not the
    // debugger server. Handle it here where the context callback is available.
    if (args && args.action === 'close') {
      let closedWindows = false;
      let closedDebuggerConnections = false;
      if (typeof context.closeAllPreviews === 'function') {
        await context.closeAllPreviews();
        closedWindows = true;
      }
      if (
        previewDebuggerServer &&
        typeof previewDebuggerServer.closeAllConnections === 'function'
      ) {
        previewDebuggerServer.closeAllConnections();
        closedDebuggerConnections = true;
      }
      if (closedWindows || closedDebuggerConnections) {
        return textResult({
          success: true,
          running: false,
          action: 'close',
          closedAll: true,
          closedWindows,
          closedDebuggerConnections,
          remainingDebuggerIds: getPreviewDebuggerIds(previewDebuggerServer),
          note:
            'Closed all running previews and cleared debugger connections. Relaunch with launch_preview { start_paused: true } before runtime checks.',
        });
      }
      return errorResult(
        'Closing previews is not supported in this editor build.'
      );
    }
    // Focusing/bringing preview windows to front also goes through the launcher.
    // Useful when a backgrounded preview is being throttled by the OS and
    // inspect/screenshot time out.
    if (args && (args.action === 'focus' || args.action === 'bringToFront')) {
      if (typeof context.focusAllPreviews === 'function') {
        const focusedCount = context.focusAllPreviews();
        return textResult({
          success: true,
          action: 'focus',
          focusedAll: true,
          focusedCount:
            typeof focusedCount === 'number' ? focusedCount : undefined,
          note:
            'Requested OS focus + raise for all preview windows. This usually un-throttles a window so inspect/screenshot work again — but the OS may still keep a window occluded (focus is best-effort, not guaranteed). For state verification that does NOT depend on the window rendering at all, use run_frames, which steps the simulation on the debugger channel regardless of focus/throttling.',
        });
      }
      return errorResult(
        'Focusing previews is not supported in this editor build.'
      );
    }
    try {
      return textResult(
        await controlPreview(previewDebuggerServer, args || {})
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'set_runtime_state') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      return textResult(
        await setRuntimeState(previewDebuggerServer, args || {})
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_signal_usage') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectSignalUsage(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'launch_preview') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    const launchPreviewForScene = context.getLaunchPreviewForScene
      ? context.getLaunchPreviewForScene()
      : context.launchPreviewForScene;
    try {
      const result = await launchPreview(
        previewDebuggerServer,
        context.runCommand,
        args || {},
        {
          getProject: context.getProject,
          launchPreviewForScene,
          cancelPreviewLaunch: context.cancelPreviewLaunch,
        }
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  return errorResult(`MCP tool "${toolName}" has no public implementation.`, {
    code: 'MCP_TOOL_NOT_IMPLEMENTED',
    toolName,
  });
};

export const createMcpEditorBridge = (
  context: McpEditorBridgeContext
): McpEditorBridge => {
  // MCP requests arrive outside React's event batching. Keep event model writes
  // synchronous, but refresh mounted event editors on the next task and merge
  // repeated notifications so a large patch cannot re-enter the React tree.
  const deferredContext: McpEditorBridgeContext = {
    ...context,
    onSceneEventsModifiedOutsideEditor:
      createDeferredSceneEventsNotifier(
        context.onSceneEventsModifiedOutsideEditor
      ) || undefined,
  };

  return {
    handleRendererMcpRequest: async ({
      method,
      params,
      reportProgress,
    }: RendererMcpRequest): Promise<any> => {
      const permissions = deferredContext.getPermissions();

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
        const content = await getResourceContent(uri, deferredContext);
        return {
          contents: [content],
        };
      }

      if (method === 'tools/call') {
        const toolName = params && params.name;
        if (typeof toolName !== 'string') throw new Error('Missing tool name.');
        try {
          return await callMcpTool({
            toolName,
            args:
              params.arguments && typeof params.arguments === 'object'
                ? params.arguments
                : {},
            context: reportProgress
              ? { ...deferredContext, reportProgress }
              : deferredContext,
          });
        } catch (error) {
          return errorResult(
            error && error.message
              ? error.message
              : 'Unexpected MCP tool failure.',
            { code: 'INTERNAL_TOOL_ERROR', toolName }
          );
        }
      }

      throw new Error(`Unsupported renderer MCP method: ${method}`);
    },
  };
};
