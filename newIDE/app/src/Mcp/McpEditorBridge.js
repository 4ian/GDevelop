// @flow
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import {
  getMcpPrompts,
  getMcpResources,
  getMcpTools,
  getAllMcpToolsForIntrospection,
  getMcpToolUsageExamples,
  getCapabilitiesSummary,
  canCallMcpTool,
  isKnownMcpTool,
  type McpPermissionOptions,
} from './McpToolCatalog';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import {
  serializeToJSON,
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
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
  buildInstruction,
  collectSerializedEventJsonIssues,
} from './McpEventKnowledge';
import {
  addMissingObjectBehaviors,
  addObjectUndeclaredVariables,
  addUndeclaredVariables,
  applyEventsChanges,
} from '../EditorFunctions/ApplyEventsChanges';
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
  applyValidatedExtensionPatch,
  bindChildSpriteResourceProperty,
  extractPrefabFromObject,
  findExtensionEvents,
  findProjectEvents,
  inspectCustomObjectRuntimeGeometry,
  inspectExtensionBehavior,
  inspectExtensionFunction,
  inspectExtensionObject,
  inspectExtensionProperty,
  inspectPrefabPropertyBindings,
  inspectSignalUsage,
  inspectProjectExtension,
  listProjectExtensions,
  lintExtensionFunctionEvents,
  patchExtensionEventInstruction,
  replaceExtensionFunctionEventsFromFile,
  validateExtensionEventsJson,
} from './McpExtensionTools';
import {
  addOrUpdateResource,
  replaceProjectResource,
  applyValidatedScenePatch,
  bulkEditSceneAssets,
  createSpriteObjectFromResource,
  createTextObject,
  batchDeleteSceneVariables,
  deleteSceneObject,
  deleteSceneVariable,
  deleteObjectVariable,
  deleteInstanceVariable,
  generatePlaceholderAsset,
  renderSceneToPng,
  inspectProjectCleanup,
  inspectProjectResources,
  inspectResourceImages,
  auditProjectAssetSources,
  compareImageFiles,
  cropSceneObjectImage,
  inspectSceneDrawOrder,
  listAvailableBehaviors,
  putStructured2dInstances,
  readSceneEventsSerialized,
  readSerializedScene,
  replaceObjectDefinition,
  setObjectProperties,
  setTextObjectProperties,
  setSpriteAnimations,
  sliceSpriteSheet,
  bindSpriteAnimationsFromDirectory,
  createTilemapObject,
  setTilemapTiles,
  getTilemapTiles,
  inspectTilemapPalette,
  setTilemapCollisionTiles,
  inspectTilemapCollision,
  checkTilemapWalkability,
} from './McpSceneTools';
import {
  attachObjectToObjectTop,
  compareSceneEventsSemantics,
  createGroup,
  ensureSceneEventIds,
  findSceneEvents,
  getSerializedEventsRevision,
  inspectGameplayRules,
  lintSceneEvents,
  moveEventsToGroup,
  patchSceneEventInstruction,
  renameGroup,
  replaceJavascriptEventCode,
  replaceSceneEventsFromFile,
  wrapEventsInGroup,
} from './McpEventTools';
import {
  setFirstLayout,
  setProjectProperties,
  getStaticData,
  setStaticData,
  setStaticDataValue,
  deleteStaticDataValue,
  summarizeStaticData,
  snapshotProject,
  restoreProjectSnapshot,
  applyValidatedProjectJsonPatch,
  syncEditorFromValidatedProjectJson,
  validateCurrentProjectJson,
  validateSerializedProject,
} from './McpProjectTools';
import { ensureOnSignalObjectEventsFunctionProperParameters } from '../EventsFunctionsExtensionEditor/OnSignalEventsFunctionParameters';
import { getBehaviorsRegistry } from '../Utils/GDevelopServices/Extension';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const crypto = optionalRequire('crypto');
const electron = optionalRequire('electron');
const nativeImage = electron && electron.nativeImage;

const hasOwn = (object: any, propertyName: string): boolean =>
  !!object &&
  typeof object === 'object' &&
  Object.keys(object).includes(propertyName);

// Monotonic id used to match targeted preview request/response messages.
let nextTargetedRequestId = 1;

const PREVIEW_CLEANUP_RELAUNCH_ACTION =
  'control_preview { action: "close", close_all: true }, then launch_preview { start_paused: true, force_new: true }';

const closePreviewCommandError =
  'CLOSE_PREVIEW is not a GDevelop command. For stale preview cleanup, call control_preview with action="close" and close_all=true, then call launch_preview with start_paused=true and force_new=true.';

// Score a behavior store header against space-separated query tokens. Returns 0
// for no match; higher is a better match. Every token must match somewhere.
const scoreBehaviorHeaderMatch = (header: Object, query: string): number => {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return 1; // no query → everything matches (browse mode)
  const haystackParts = [
    header.type,
    header.name,
    header.fullName,
    header.description,
    header.category,
    header.extensionName,
    Array.isArray(header.tags) ? header.tags.join(' ') : '',
  ]
    .filter(Boolean)
    .map(value => String(value).toLowerCase());
  const haystack = haystackParts.join(' ');
  let score = 0;
  for (const token of tokens) {
    if (!haystack.includes(token)) return 0; // AND semantics
    // Bonus for matching the most identifying fields.
    if ((header.fullName || '').toLowerCase().includes(token)) score += 3;
    if ((header.name || '').toLowerCase().includes(token)) score += 2;
    score += 1;
  }
  return score;
};

const getDefaultProcessEditorFunctionCalls = (): Function => {
  // Lazily require the runner so focused MCP unit tests do not load the full
  // rendering stack pulled by EditorFunctionCallRunner.
  // $FlowFixMe[unsupported-syntax]
  return require('../EditorFunctions/EditorFunctionCallRunner')
    .processEditorFunctionCalls;
};

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
  launchPreviewForScene?: (sceneName: ?string) => mixed,
  getPreviewLaunchState?: () => Object,
  reloadProjectAndWait?: (
    reportProgress?: McpRequestProgressReporter
  ) => Promise<any>,
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
  capturePreviewPage?: (windowId: ?number) => Promise<?Object>,
  generateEvents?: Function,
  onSceneEventsModifiedOutsideEditor?: Function,
  onExtensionFunctionEventsModifiedOutsideEditor?: Function,
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
const extractToolResultPayload = (toolResult: any): any => {
  if (!toolResult || !Array.isArray(toolResult.content)) return toolResult;
  if (toolResult.structuredContent) return toolResult.structuredContent;
  const text =
    toolResult.content[0] && typeof toolResult.content[0].text === 'string'
      ? toolResult.content[0].text
      : '';
  if (toolResult.isError) return { success: false, error: text };
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

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

const readDiskProjectEvidence = (projectFile: ?string): Object => {
  if (!projectFile) return { exists: false, reason: 'no-project-file' };
  if (!fs) return { exists: false, reason: 'filesystem-unavailable' };
  try {
    const stat = fs.statSync(projectFile);
    const contents = fs.readFileSync(projectFile, 'utf8');
    return {
      exists: true,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      modifiedAtMs: stat.mtimeMs,
      hash: hashStructuredValue(JSON.parse(contents)),
    };
  } catch (error) {
    return {
      exists: false,
      reason: 'read-failed',
      error: error.message,
    };
  }
};

const getPersistenceState = (context: McpEditorBridgeContext): Object => {
  if (typeof context.getPersistenceState !== 'function') {
    return {
      available: false,
      hasUnsavedChanges: undefined,
      changesCount: undefined,
      timeOfFirstChangeSinceLastSave: undefined,
    };
  }
  try {
    return { available: true, ...context.getPersistenceState() };
  } catch (error) {
    return { available: false, error: error.message };
  }
};

const saveProjectWithEvidence = async (
  context: McpEditorBridgeContext
): Promise<Object> => {
  const requestedAtMs = Date.now();
  const requestedAt = new Date(requestedAtMs).toISOString();
  const project = context.getProject();
  const saveProjectAndWait = context.saveProjectAndWait;
  if (!project) {
    if (saveProjectAndWait) {
      try {
        const result = await saveProjectAndWait();
        const saved = !!(
          result &&
          (typeof result !== 'object' ||
            result.saved === undefined ||
            result.saved === true)
        );
        return {
          success: saved,
          saved,
          reason: saved ? 'host-confirmed-without-project-model' : 'no-project',
          requestedAt,
          completedAt: new Date().toISOString(),
          hostReportedSaved: saved,
          result: result || undefined,
        };
      } catch (error) {
        return {
          success: false,
          saved: false,
          reason: 'save-threw',
          requestedAt,
          completedAt: new Date().toISOString(),
          error: error.message,
        };
      }
    }
    return {
      success: false,
      saved: false,
      reason: 'no-project',
      requestedAt,
      completedAt: new Date().toISOString(),
    };
  }
  if (!saveProjectAndWait) {
    return {
      success: false,
      saved: false,
      reason: 'save-handler-unavailable',
      projectFile: project.getProjectFile() || undefined,
      requestedAt,
      completedAt: new Date().toISOString(),
    };
  }

  const projectFile = project.getProjectFile() || null;
  const beforeState = getPersistenceState(context);
  const beforeDisk = readDiskProjectEvidence(projectFile);
  const editorHashBefore = hashStructuredValue(serializeToJSObject(project));
  let rawResult = null;
  let saveError = null;
  try {
    rawResult = await saveProjectAndWait();
  } catch (error) {
    saveError = error;
  }

  const completedAtMs = Date.now();
  const afterState = getPersistenceState(context);
  const editorHash = hashStructuredValue(serializeToJSObject(project));
  const afterDisk = readDiskProjectEvidence(projectFile);
  const hashesMatch = afterDisk.exists
    ? afterDisk.hash === editorHash
    : undefined;
  const diskWriteObserved = !!(
    afterDisk.exists &&
    (!beforeDisk.exists ||
      afterDisk.modifiedAtMs !== beforeDisk.modifiedAtMs ||
      afterDisk.hash !== beforeDisk.hash)
  );
  const dirtyBefore = beforeState.hasUnsavedChanges;
  const dirtyAfter = afterState.hasUnsavedChanges;
  const hostReportedSaved = !!(
    rawResult &&
    (typeof rawResult !== 'object' ||
      rawResult.saved === undefined ||
      rawResult.saved === true)
  );
  const nothingChangedBefore = !!(
    dirtyBefore === false &&
    beforeDisk.exists &&
    beforeDisk.hash === editorHashBefore
  );
  const verifiedLocalSave = !!(
    projectFile &&
    afterDisk.exists &&
    hashesMatch === true &&
    (diskWriteObserved || (hostReportedSaved && !nothingChangedBefore))
  );
  const saved = projectFile ? verifiedLocalSave : hostReportedSaved;

  let reason = 'save-failed';
  if (saveError) reason = 'save-threw';
  else if (saved && diskWriteObserved) reason = 'saved';
  else if (saved) reason = 'saved-and-verified';
  else if (!projectFile && !hostReportedSaved) reason = 'no-project-file';
  else if (nothingChangedBefore && hashesMatch === true)
    reason = 'nothing-changed';
  else if (dirtyBefore === false && hashesMatch === false)
    reason = 'project-not-marked-dirty';
  else if (hostReportedSaved && hashesMatch === false)
    reason = 'disk-verification-failed';

  return {
    success: saved || reason === 'nothing-changed',
    saved,
    reason,
    projectFile: projectFile || undefined,
    requestedAt,
    completedAt: new Date(completedAtMs).toISOString(),
    durationMs: completedAtMs - requestedAtMs,
    dirtyBefore,
    dirtyAfter,
    changesCountBefore: beforeState.changesCount,
    changesCountAfter: afterState.changesCount,
    firstUnsavedChangeAt:
      beforeState.timeOfFirstChangeSinceLastSave != null
        ? new Date(beforeState.timeOfFirstChangeSinceLastSave).toISOString()
        : undefined,
    hostReportedSaved,
    diskWriteObserved,
    editorHashBefore,
    diskHashBefore: beforeDisk.hash,
    editorHash,
    diskHash: afterDisk.hash,
    hashesMatch,
    file: {
      exists: !!afterDisk.exists,
      size: afterDisk.size,
      modifiedAt: afterDisk.modifiedAt,
      error: afterDisk.error,
    },
    error: saveError ? saveError.message : afterDisk.error,
    result: rawResult || undefined,
  };
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
    // Absolute project file + folder. Relative resource paths
    // (add_or_update_resource, bulk_edit_scene_assets) and project-relative
    // file args are resolved against projectFolder — this is the editor's open
    // project folder, which may differ from the agent's cwd.
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
        'Behavior is a default GDevelop object capability surfaced by the object API; read_serialized_scene may still show behaviors: [] because only explicit serialized behaviors are stored there.',
    },
    staticDataSummary: summarizeStaticData(project),
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
const summarizeRuntimeGameDump = (payload: any, options?: Object): Object => {
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
          makeRuntimeSummaryOptions(args)
        ),
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
          'use render_scene_to_png for static layout checks',
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

// Map GDevelop key names to raw DOM key codes (+ location for left/right
// modifiers), so callers can pass "Space"/"Left"/"a" instead of numbers.
// Mirrors GDJS keysNameToCode but stores RAW codes for modifiers (the runtime's
// onKeyPressed re-applies the location offset).
const KEY_NAME_TO_CODE: {
  [string]: {| code: number, location?: number |},
} = (() => {
  const map: { [string]: {| code: number, location?: number |} } = {};
  const add = (name: string, code: number, location?: number) => {
    map[name.toLowerCase()] = location ? { code, location } : { code };
  };
  for (let c = 65; c <= 90; c++) add(String.fromCharCode(c), c); // a-z
  for (let n = 0; n <= 9; n++) add('num' + n, 48 + n);
  for (let n = 0; n <= 9; n++) add('numpad' + n, 96 + n);
  add('space', 32);
  add('return', 13);
  add('enter', 13);
  add('escape', 27);
  add('tab', 9);
  add('back', 8);
  add('backspace', 8);
  add('delete', 46);
  add('insert', 45);
  add('pageup', 33);
  add('pagedown', 34);
  add('end', 35);
  add('home', 36);
  add('pause', 19);
  add('menu', 93);
  add('left', 37);
  add('up', 38);
  add('right', 39);
  add('down', 40);
  add('add', 107);
  add('subtract', 109);
  add('multiply', 106);
  add('divide', 111);
  add('semicolon', 186);
  add('comma', 188);
  add('period', 190);
  add('quote', 222);
  add('slash', 191);
  add('backslash', 220);
  add('equal', 187);
  add('dash', 189);
  add('lbracket', 219);
  add('rbracket', 221);
  add('tilde', 192);
  for (let f = 1; f <= 12; f++) add('f' + f, 111 + f);
  // Modifiers: raw code + location (1 = left, 2 = right).
  add('shift', 16);
  add('lshift', 16, 1);
  add('rshift', 16, 2);
  add('control', 17);
  add('ctrl', 17);
  add('lcontrol', 17, 1);
  add('rcontrol', 17, 2);
  add('alt', 18);
  add('lalt', 18, 1);
  add('ralt', 18, 2);
  add('lsystem', 91, 1);
  add('rsystem', 91, 2);
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
  return { ok: true, preInputs: [resolved.input], postInputs: [] };
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
  args: Object
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
  for (const raw of rawInputs) {
    const result = resolveSimulatedInput(raw);
    if (!result.ok) {
      return { success: false, running: true, error: result.error };
    }
    resolved.push(result.input);
  }

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
  args: Object
): Promise<Object> => {
  const guard = requireRunningPreview(previewDebuggerServer, args);
  if (!guard.ok) return guard.result;
  const targetId = guard.targetId;

  // Inputs are optional — runFrames with no inputs just advances the sim.
  const rawInputs = Array.isArray(args && args.inputs) ? args.inputs : [];
  const resolved: Array<Object> = [];
  const postResolved: Array<Object> = [];
  let suggestedFrames: ?number;
  for (const raw of rawInputs) {
    const result = expandRunFramesInput(raw);
    if (!result.ok) {
      return { success: false, running: true, error: result.error };
    }
    resolved.push(...(result.preInputs || []));
    postResolved.push(...(result.postInputs || []));
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
      makeRuntimeSummaryOptions(args)
    ),
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

const getNonEmptyArg = (args: ?Object, names: Array<string>): ?any => {
  if (!args) return null;
  for (const name of names) {
    const value = args[name];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
};

const getRequiredSignalArg = (
  args: ?Object,
  names: Array<string>,
  label: string
): any => {
  const value = getNonEmptyArg(args, names);
  if (value === null || value === undefined) {
    throw new Error(`Missing ${label}.`);
  }
  return value;
};

const signalStringExpression = (value: any, label: string): string => {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${label}.`);
  }
  const serialized = String(value).trim();
  if (!serialized) throw new Error(`Missing ${label}.`);
  if (/^".*"$/.test(serialized) || /[+()]/.test(serialized)) {
    return serialized;
  }
  return JSON.stringify(serialized);
};

const optionalSignalStringExpression = (
  args: ?Object,
  names: Array<string>
): ?string => {
  const value = getNonEmptyArg(args, names);
  if (value === null || value === undefined) return null;
  return signalStringExpression(value, names[0]);
};

const normalizeSignalTargetKind = (targetKind: any): string => {
  const normalized = String(targetKind || '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_');
  if (normalized === 'picked' || normalized === 'picked_object') {
    return 'picked_objects';
  }
  if (normalized === 'group') return 'object_group';
  if (normalized === 'instance') return 'object_instance';
  if (
    normalized === 'scene' ||
    normalized === 'object_instance' ||
    normalized === 'picked_objects'
  ) {
    return normalized;
  }
  throw new Error(
    'target_kind must be scene, object_instance, or picked_objects.'
  );
};

const signalTargetKindsAllowedInExtensionEvents = new Set([
  'scene',
  'object_instance',
]);

const signalExtensionEventTargetScopes = new Set([
  'extension_function',
  'object_function',
  'prefab_function',
  'behavior_function',
  'async_function',
]);

const buildSignalEmitAction = ({
  project,
  i18n,
  args,
}: {|
  project: gdProject,
  i18n?: any,
  args: Object,
|}): Object => {
  const targetKind = normalizeSignalTargetKind(args && args.target_kind);
  const targetScope = String((args && args.target_scope) || '')
    .trim()
    .toLowerCase();
  if (
    signalExtensionEventTargetScopes.has(targetScope) &&
    !signalTargetKindsAllowedInExtensionEvents.has(targetKind)
  ) {
    throw new Error(
      'In extension event sheets, signal emit actions can only target scene or object_instance.'
    );
  }
  const signalName = signalStringExpression(
    getRequiredSignalArg(args, ['signal_name', 'signalName'], 'signal_name'),
    'signal_name'
  );
  const payload = optionalSignalStringExpression(args, [
    'payload',
    'payload_string',
    'payloadString',
  ]);
  let type = 'EmitSceneSignal';
  const parameters: Object = {};
  let outputLastParameterIndex =
    payload !== null && payload !== undefined ? 2 : 1;
  let obsoleteEmitterParameterIndex = 3;
  const setPayload = (payloadIndex: number) => {
    if (payload !== null && payload !== undefined) {
      parameters[String(payloadIndex)] = payload;
      outputLastParameterIndex = payloadIndex;
    }
  };

  if (targetKind === 'scene') {
    parameters['1'] = signalName;
    setPayload(2);
  } else if (targetKind === 'object_instance') {
    type = 'EmitSignalToObjectInstance';
    outputLastParameterIndex = 2;
    obsoleteEmitterParameterIndex = 4;
    parameters['1'] = String(
      getRequiredSignalArg(
        args,
        ['instance_id', 'instanceId', 'object_id', 'objectId'],
        'instance_id'
      )
    );
    parameters['2'] = signalName;
    setPayload(3);
  } else if (targetKind === 'picked_objects') {
    type = 'EmitSignalToPickedObjects';
    outputLastParameterIndex = 2;
    obsoleteEmitterParameterIndex = 4;
    parameters['1'] = String(
      getRequiredSignalArg(
        args,
        ['objects', 'object_name', 'target_object_name'],
        'objects'
      )
    );
    parameters['2'] = signalName;
    setPayload(3);
  }

  // Old libGD builds still expose a required emitter object slot. Fill it to
  // avoid a stale warning, then trim it from the JSON returned by this helper.
  parameters[String(obsoleteEmitterParameterIndex)] = '';

  const built = buildInstruction({
    project,
    i18n,
    type,
    kind: 'action',
    parameters,
  });
  const parametersLength = outputLastParameterIndex + 1;
  if (
    built.instruction &&
    Array.isArray(built.instruction.parameters) &&
    built.instruction.parameters.length > parametersLength
  ) {
    built.instruction.parameters.length = parametersLength;
  }
  if (
    Array.isArray(built.parameters) &&
    built.parameters.length > parametersLength
  ) {
    built.parameters.length = parametersLength;
  }
  return {
    ...built,
    actionType: type,
    targetKind,
    signalNote:
      'Drop instruction into an event actions array. Signal payload is a string expression; use ToString(...) for numeric values if needed. Signal actions automatically use the owner object as sender in object/prefab functions. Scene and external scene events emit from the scene.',
  };
};

const buildSignalReceivedCondition = ({
  project,
  i18n,
  args,
}: {|
  project: gdProject,
  i18n?: any,
  args: Object,
|}): Object => {
  const signalName = signalStringExpression(
    getRequiredSignalArg(args, ['signal_name', 'signalName'], 'signal_name'),
    'signal_name'
  );
  const built = buildInstruction({
    project,
    i18n,
    type: 'SignalReceived',
    kind: 'condition',
    parameters: { '1': signalName },
  });
  return {
    ...built,
    conditionType: 'SignalReceived',
    signalNote:
      'Drop instruction into a scene or external scene event conditions array only. Use SignalPayload(), SignalSenderObjectName(), or SignalSenderInstanceId() in this event/sub-events to read signal data.',
  };
};

const createOrUpdateOnSignalFunction = (
  project: gdProject,
  args: Object
): Object => {
  const parentKind = String((args && args.parent_kind) || '')
    .trim()
    .toLowerCase();
  if (parentKind !== 'object') {
    throw new Error('parent_kind must be object for onSignal.');
  }
  const signalArgs = {
    ...(args || {}),
    parent_kind: parentKind,
    function_name: 'onSignal',
    function_type: 'action',
    sentence: '',
  };
  delete signalArgs.new_function_name;
  delete signalArgs.parameters;
  delete signalArgs.parameters_mode;
  delete signalArgs.serialized_function;
  const result = createOrUpdateExtensionFunction(project, signalArgs);
  const signalSignature = ['Object', 'SignalName', 'Payload'];
  let fixedParameters: Array<Object> = signalSignature.map((name, index) => ({
    index,
    name,
    type: index === 0 ? 'object' : 'string',
    description:
      index === 0 ? 'Object' : index === 1 ? 'Signal name' : 'Payload',
  }));
  let repairedEventsFunction = null;
  const extensionName = args && args.extension_name;
  const parentName = args && args.parent_name;
  if (
    !result.dryRun &&
    typeof extensionName === 'string' &&
    typeof parentName === 'string' &&
    project.hasEventsFunctionsExtensionNamed(extensionName)
  ) {
    const extension = project.getEventsFunctionsExtension(extensionName);
    const objects = extension.getEventsBasedObjects();
    if (objects.has(parentName)) {
      const eventsBasedObject = objects.get(parentName);
      ensureOnSignalObjectEventsFunctionProperParameters(
        extension,
        eventsBasedObject
      );
      const eventsFunctions = eventsBasedObject.getEventsFunctions();
      if (eventsFunctions.hasEventsFunctionNamed('onSignal')) {
        repairedEventsFunction = eventsFunctions.getEventsFunction('onSignal');
        const parameters = repairedEventsFunction.getParameters();
        fixedParameters = fixedParameters.map((parameter, index) => {
          const repairedParameter = parameters.getParameterAt(index);
          return {
            ...parameter,
            name: repairedParameter.getName(),
            type: repairedParameter.getType(),
            description: repairedParameter.getDescription(),
            longDescription: repairedParameter.getLongDescription(),
            extraInfo: repairedParameter.getExtraInfo() || undefined,
          };
        });
      }
    }
  }
  const fixedFunction = result.function
    ? {
        ...result.function,
        parameters: fixedParameters,
        ...(repairedEventsFunction && result.function.serializedFunction
          ? { serializedFunction: serializeToJSObject(repairedEventsFunction) }
          : {}),
      }
    : result.function;
  return {
    ...result,
    function: fixedFunction,
    extensionName: args && args.extension_name,
    parentKind,
    parentName: args && args.parent_name,
    functionName: 'onSignal',
    signalSignature,
  };
};

const getStaleStateTargetForTool = (
  toolName: string,
  args: ?Object,
  result?: ?Object
): Object => {
  const sceneName =
    getStringArg(args, ['scene_name', 'sceneName']) ||
    (result && typeof result.sceneName === 'string' ? result.sceneName : null);

  if (
    toolName === 'add_scene_events' ||
    toolName === 'generate_events' ||
    toolName === 'replace_scene_events_from_file' ||
    toolName === 'create_group' ||
    toolName === 'wrap_events_in_group' ||
    toolName === 'move_events_to_group' ||
    toolName === 'rename_group' ||
    toolName === 'ensure_scene_event_ids' ||
    toolName === 'patch_scene_event_instruction' ||
    toolName === 'attach_object_to_object_top'
  ) {
    return {
      kind: 'scene-events',
      sceneName,
    };
  }

  if (
    toolName === 'gdevelop_create_or_update_extension_function' ||
    toolName === 'gdevelop_create_or_update_on_signal' ||
    toolName === 'patch_extension_event_instruction' ||
    toolName === 'replace_extension_function_events_from_file' ||
    (toolName === 'apply_validated_extension_patch' &&
      result &&
      result.scope === 'extension_function')
  ) {
    const parentKind =
      (result && typeof result.parentKind === 'string'
        ? result.parentKind
        : getStringArg(args, ['parent_kind', 'parentKind'])) || 'extension';
    return {
      kind: 'extension-function',
      extensionName: getStringArg(args, ['extension_name', 'extensionName']),
      parentKind,
      parentName:
        parentKind === 'extension'
          ? null
          : result && typeof result.parentName === 'string'
          ? result.parentName
          : getStringArg(args, ['parent_name', 'parentName']),
      functionName:
        result && typeof result.functionName === 'string'
          ? result.functionName
          : result &&
            result.function &&
            typeof result.function.name === 'string'
          ? result.function.name
          : getStringArg(args, [
              'new_function_name',
              'newFunctionName',
              'function_name',
              'functionName',
            ]),
    };
  }

  if (toolName === 'gdevelop_delete_extension_function') {
    return {
      kind: 'extension-function',
      extensionName: getStringArg(args, ['extension_name', 'extensionName']),
      parentKind:
        getStringArg(args, ['parent_kind', 'parentKind']) || 'extension',
      parentName: getStringArg(args, ['parent_name', 'parentName']),
      functionName: getStringArg(args, ['function_name', 'functionName']),
    };
  }

  if (sceneName) {
    return {
      kind: 'scene',
      sceneName,
    };
  }

  return { kind: 'project' };
};

const buildStaleStateAdvisory = (
  context: McpEditorBridgeContext,
  target: Object
): Object => {
  const previewDebuggerServer = context.getPreviewDebuggerServer
    ? context.getPreviewDebuggerServer()
    : null;
  const previewIds = getPreviewDebuggerIds(previewDebuggerServer);
  const previewMayBeStale = previewIds.length > 0;
  const editorPanelsMayBeStale = [];

  if (target.kind === 'scene-events') {
    editorPanelsMayBeStale.push({
      kind: 'scene-events',
      sceneName: target.sceneName || null,
      reason:
        'Scene events were modified through MCP. Open event-sheet panels are notified, but if the UI still shows old rows, switch tabs or reopen the scene before trusting it.',
    });
  } else if (target.kind === 'extension-function') {
    editorPanelsMayBeStale.push({
      kind: 'extension-function',
      extensionName: target.extensionName || null,
      parentKind: target.parentKind || 'extension',
      parentName: target.parentName || null,
      functionName: target.functionName || null,
      reason:
        'An extension function was modified through MCP. Extension instruction metadata and generated preview code can be cached by open editor panels/previews; save/reload or reopen the extension editor before trusting stale function metadata, then relaunch preview before runtime verification.',
    });
  } else if (target.kind === 'scene') {
    editorPanelsMayBeStale.push({
      kind: 'scene',
      sceneName: target.sceneName || null,
      reason:
        'Scene data was modified through MCP. If the layout/object panels still show old data, switch tabs or reopen the scene before trusting them.',
    });
  }

  return {
    projectStateChanged: true,
    target,
    previewMayBeStale,
    runningPreviewDebuggerIds: previewIds,
    latestDebuggerId: previewIds.length
      ? previewIds[previewIds.length - 1]
      : null,
    recommendedActions: previewMayBeStale
      ? [
          ...(target.kind === 'extension-function'
            ? [
                'gdevelop_save_project_and_wait',
                'reload/reopen the project if extension instruction metadata or generated preview code still looks stale',
              ]
            : []),
          PREVIEW_CLEANUP_RELAUNCH_ACTION,
          'fallback: gdevelop_save_project_and_wait; control_preview { action: "close", close_all: true }; launch_preview { start_paused: true, force_new: true, timeout_ms: 15000 }; wait_until_preview_ready { require_paused: true }',
          'run runtime checks/screenshots only after relaunching the preview',
        ]
      : [],
    editorPanelsMayBeStale,
    message: previewMayBeStale
      ? 'The project changed while one or more previews were running. Existing previews do not automatically reload changed events/resources; close all previews with control_preview, then call launch_preview with start_paused=true and force_new=true before final runtime verification.'
      : 'The project changed through MCP. No running preview was detected, but already-open editor panels can still need a refresh if they show old state.',
  };
};

const withStaleStateAdvisory = (
  payload: any,
  context: McpEditorBridgeContext,
  target: Object
): Object => {
  const staleStateAdvisory = buildStaleStateAdvisory(context, target);
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return {
      ...payload,
      staleStateAdvisory,
    };
  }
  return {
    result: payload,
    staleStateAdvisory,
  };
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

const notifyProjectModelChangedOutsideEditor = (
  project: gdProject,
  context: McpEditorBridgeContext
) => {
  for (let index = 0; index < project.getLayoutsCount(); index++) {
    const scene = project.getLayoutAt(index);
    if (context.onSceneEventsModifiedOutsideEditor) {
      context.onSceneEventsModifiedOutsideEditor({
        scene,
        newOrChangedAiGeneratedEventIds: new Set(),
      });
    }
    if (context.onObjectsModifiedOutsideEditor) {
      context.onObjectsModifiedOutsideEditor({
        scene,
        isNewObjectTypeUsed: false,
      });
    }
    if (context.onInstancesModifiedOutsideEditor) {
      context.onInstancesModifiedOutsideEditor({ scene });
    }
    if (context.onObjectGroupsModifiedOutsideEditor) {
      context.onObjectGroupsModifiedOutsideEditor({ scene });
    }
  }
};

const waitForPreviewRuntimeReady = async (
  previewDebuggerServer: Object,
  targetId: string,
  options?: {|
    timeoutMs?: number,
    pollIntervalMs?: number,
    requirePaused?: boolean,
    operation?: string,
  |}
): Promise<Object> => {
  const timeoutMs = (options && options.timeoutMs) || 6000;
  const pollIntervalMs = (options && options.pollIntervalMs) || 150;
  const requirePaused = !!(options && options.requirePaused);
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
      if (!requirePaused || (payload && payload.isPaused === true)) {
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
    launchPreviewForScene?: ?(sceneName: ?string) => mixed,
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
  const forceNew = !!(args && (args.force_new || args.forceNew));
  const timeoutMs = getPreviewReadinessTimeoutMs(args, 6000);

  const getProject =
    options && typeof options.getProject === 'function'
      ? options.getProject
      : null;
  const launchPreviewForScene =
    options && typeof options.launchPreviewForScene === 'function'
      ? options.launchPreviewForScene
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
  const annotate = (result: Object): Object =>
    annotateLaunchSceneResult(result, {
      expectedScene,
      requestedScene,
      firstLayout,
      sceneSelectionSupported,
    });
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
  const runLaunchCommand = async (): Promise<boolean> => {
    launchFailureDetails = null;
    if (launchPreviewForScene) {
      try {
        const launchResult = await launchPreviewForScene(expectedScene || null);
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
    return runCommand('LAUNCH_DEBUG_PREVIEW');
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

// Auto-quote safe bare string literals (e.g. layer "HUD", a timer identifier) in
// the events_json / event_changes[].generated_events of an add_scene_events
// payload, so callers do not have to remember to escape them. Mutates a shallow
// copy of args and returns it; never throws (best-effort normalization).
const autoQuoteAddSceneEventsArgs = (
  project: ?gdProject,
  args: Object
): Object => {
  if (!project || !args) return args;
  const normalizeEventsPayload = (eventsPayload: any): any => {
    if (
      typeof eventsPayload !== 'string' &&
      !Array.isArray(eventsPayload) &&
      !(eventsPayload && typeof eventsPayload === 'object')
    ) {
      return eventsPayload;
    }

    const originalWasString = typeof eventsPayload === 'string';
    let parsed;
    try {
      parsed = originalWasString
        ? JSON.parse(eventsPayload)
        : JSON.parse(JSON.stringify(eventsPayload));
      if (parsed && !Array.isArray(parsed) && typeof parsed.type === 'string') {
        parsed = [parsed];
      } else if (
        parsed &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.events)
      ) {
        parsed = parsed.events;
      }
      if (!Array.isArray(parsed)) return eventsPayload;
      const changed = autoQuoteEventParameters(project, parsed);
      if (originalWasString) {
        return changed > 0 ? JSON.stringify(parsed) : eventsPayload;
      }
      return changed > 0 ? parsed : eventsPayload;
    } catch (error) {
      // Leave invalid JSON untouched; validation will report it.
      return eventsPayload;
    }
  };

  const next = { ...args };
  if (
    typeof next.events_json === 'string' ||
    Array.isArray(next.events_json) ||
    (next.events_json && typeof next.events_json === 'object')
  ) {
    next.events_json = normalizeEventsPayload(next.events_json);
  }
  if (Array.isArray(next.event_changes)) {
    next.event_changes = next.event_changes.map(change => {
      if (!change || typeof change !== 'object') return change;
      const updated = { ...change };
      if (
        typeof updated.generated_events === 'string' ||
        Array.isArray(updated.generated_events) ||
        (updated.generated_events &&
          typeof updated.generated_events === 'object')
      ) {
        updated.generated_events = normalizeEventsPayload(
          updated.generated_events
        );
      }
      if (
        typeof updated.generatedEvents === 'string' ||
        Array.isArray(updated.generatedEvents) ||
        (updated.generatedEvents && typeof updated.generatedEvents === 'object')
      ) {
        updated.generatedEvents = normalizeEventsPayload(
          updated.generatedEvents
        );
      }
      return updated;
    });
  }
  return next;
};

const getEventsJsonArgument = (args: ?Object): string | null => {
  if (!args) return null;
  const eventsJson = args.events_json || args.eventsJson || args.events;
  if (typeof eventsJson === 'string') return eventsJson;
  if (eventsJson !== null && eventsJson !== undefined) {
    return JSON.stringify(eventsJson);
  }
  return null;
};

const getSceneEventsRevision = (
  project: gdProject,
  sceneName: string
): string => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene "${sceneName}" does not exist.`);
  }
  return getSerializedEventsRevision(
    serializeToJSObject(project.getLayout(sceneName).getEvents())
  );
};

const makeSimulationEventChanges = (args: Object): Array<any> => {
  const eventsJson = getEventsJsonArgument(args);
  if (eventsJson) {
    return [
      {
        operationName: args.operation_name || 'insert_at_end',
        operationTargetEvent: args.operation_target_event || null,
        generatedEvents: eventsJson,
      },
    ];
  }
  if (!Array.isArray(args.event_changes)) return [];
  return args.event_changes.map(change => ({
    operationName:
      (change && (change.operation_name || change.operationName)) ||
      'insert_at_end',
    operationTargetEvent:
      (change &&
        (change.operation_target_event || change.operationTargetEvent)) ||
      null,
    generatedEvents:
      change && change.generated_events !== undefined
        ? typeof change.generated_events === 'string'
          ? change.generated_events
          : JSON.stringify(change.generated_events)
        : change && change.generatedEvents !== undefined
        ? typeof change.generatedEvents === 'string'
          ? change.generatedEvents
          : JSON.stringify(change.generatedEvents)
        : null,
  }));
};

const applyEventChangeDependenciesForSimulation = ({
  project,
  scene,
  args,
}: {
  project: gdProject,
  scene: gdLayout,
  args: Object,
}) => {
  if (!Array.isArray(args.event_changes)) return;
  args.event_changes.forEach(change => {
    if (!change || typeof change !== 'object') return;
    addUndeclaredVariables({
      project,
      scene,
      undeclaredVariables:
        change.undeclared_variables || change.undeclaredVariables || [],
    });
    const objectVariables =
      change.undeclared_object_variables ||
      change.undeclaredObjectVariables ||
      {};
    Object.keys(objectVariables).forEach(objectName =>
      addObjectUndeclaredVariables({
        project,
        scene,
        objectName,
        undeclaredVariables: objectVariables[objectName] || [],
      })
    );
    const missingBehaviors =
      change.missing_object_behaviors || change.missingObjectBehaviors || {};
    Object.keys(missingBehaviors).forEach(objectName =>
      addMissingObjectBehaviors({
        project,
        scene,
        objectName,
        missingBehaviors: missingBehaviors[objectName] || [],
      })
    );
  });
};

const dryRunSceneEventChanges = ({
  project,
  args,
}: {
  project: gdProject,
  args: Object,
}): Object => {
  const sceneName =
    args && typeof args.scene_name === 'string' ? args.scene_name : '';
  if (!sceneName) throw new Error('Missing scene_name.');
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene "${sceneName}" does not exist.`);
  }
  const eventChanges = makeSimulationEventChanges(args);
  if (!eventChanges.length) {
    throw new Error('Provide events_json or one or more event_changes.');
  }

  const currentSerializedEvents = serializeToJSObject(
    project.getLayout(sceneName).getEvents()
  );
  const currentRevision = getSerializedEventsRevision(currentSerializedEvents);
  const expectedRevision = args.expected_revision || args.expectedRevision;
  if (expectedRevision && expectedRevision !== currentRevision) {
    return {
      success: false,
      valid: false,
      dryRun: true,
      changed: false,
      code: 'EVENT_SHEET_REVISION_CONFLICT',
      sceneName,
      expectedRevision,
      eventSheetRevision: currentRevision,
      error:
        'The scene event sheet changed after it was read. Read it again and rebuild the patch against the current revision.',
    };
  }

  const validationProject = gd.ProjectHelper.createNewGDJSProject();
  try {
    unserializeFromJSObject(validationProject, serializeToJSObject(project));
    const validationScene = validationProject.getLayout(sceneName);
    applyEventChangeDependenciesForSimulation({
      project: validationProject,
      scene: validationScene,
      args,
    });
    const application = applyEventsChanges(
      validationProject,
      validationScene.getEvents(),
      eventChanges,
      args.generated_event_id || 'mcp-generated-event'
    );
    const proposedSerializedEvents = serializeToJSObject(
      validationScene.getEvents()
    );
    const proposedRevision = getSerializedEventsRevision(
      proposedSerializedEvents
    );
    if (application.errors.length) {
      return {
        success: false,
        valid: false,
        dryRun: true,
        changed: false,
        code: 'EVENT_PATCH_INVALID',
        sceneName,
        eventSheetRevision: currentRevision,
        proposedEventSheetRevision: proposedRevision,
        errors: application.errors,
      };
    }

    const validation = validateEventsJson({
      project: validationProject,
      sceneName,
      eventsJson: JSON.stringify(proposedSerializedEvents),
      allowJavaScriptEvents: !!args.allow_javascript_events,
      dedupeErrors: !!args.dedupe_errors,
      summaryOnly: args.summary_only !== false,
      errorsOnly: !!args.errors_only,
      includeRenderedEvents: !!args.include_rendered_events,
      includeNormalizedJson: !!args.include_normalized_json,
    });
    return {
      ...validation,
      success: validation.valid,
      dryRun: true,
      changed: false,
      wouldModify: proposedRevision !== currentRevision,
      sceneName,
      eventSheetRevision: currentRevision,
      proposedEventSheetRevision: proposedRevision,
      requestedOperations: eventChanges.length,
      lowLevelMutations: application.applied,
    };
  } finally {
    validationProject.delete();
  }
};

const normalizeSerializedEventsInputForValidation = (value: any): any => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    if (typeof value.type === 'string') return [value];
    if (Array.isArray(value.events)) return value.events;
  }
  return value;
};

const getGeneratedEventsPayload = (change: Object): any => {
  if (!change || typeof change !== 'object') return undefined;
  if (hasOwn(change, 'generated_events')) {
    return change.generated_events;
  }
  if (hasOwn(change, 'generatedEvents')) {
    return change.generatedEvents;
  }
  return undefined;
};

const collectAddSceneEventsRawIssues = (args: ?Object): Array<Object> => {
  if (!args) return [];
  const issues: Array<Object> = [];
  const validatePayload = (source: string, payload: any) => {
    if (payload === null || payload === undefined) return;
    if (typeof payload === 'string' && payload.trim() === '') return;

    let parsed;
    try {
      parsed =
        typeof payload === 'string'
          ? JSON.parse(payload)
          : JSON.parse(JSON.stringify(payload));
    } catch (error) {
      issues.push({
        severity: 'error',
        type: 'invalid-events-json',
        source,
        suggestion: `Fix ${source}: it must be valid serialized events JSON.`,
        error: error && error.message ? error.message : String(error),
      });
      return;
    }

    const normalized = normalizeSerializedEventsInputForValidation(parsed);
    if (!Array.isArray(normalized)) {
      issues.push({
        severity: 'error',
        type: 'invalid-events-json-shape',
        source,
        suggestion: `Fix ${source}: use a serialized events array, a single serialized event object, or { events: [...] } before calling add_scene_events.`,
      });
      return;
    }

    collectSerializedEventJsonIssues(normalized).forEach(issue => {
      issues.push({
        ...issue,
        source,
      });
    });
  };

  validatePayload('events_json', args.events_json);
  validatePayload('eventsJson', args.eventsJson);
  validatePayload('events', args.events);

  if (Array.isArray(args.event_changes)) {
    args.event_changes.forEach((change, index) => {
      const payload = getGeneratedEventsPayload(change);
      if (payload === undefined || payload === null) return;
      validatePayload(`event_changes[${index}].generated_events`, payload);
    });
  }

  return issues;
};

const makeAddSceneEventsPreflightFailure = (args: ?Object): ?Object => {
  const issues = collectAddSceneEventsRawIssues(args).filter(
    issue => issue.severity === 'error'
  );
  if (!issues.length) return null;
  return {
    success: false,
    valid: false,
    error:
      'add_scene_events validation failed before writing. No events were created.',
    errors: issues,
    issues,
    note:
      'Fix the serialized event JSON and retry. In scene/layout events, use current instruction types such as BooleanObjectVariable instead of legacy function-only forms such as ObjectVariableAsBoolean.',
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

  if (uri === 'gdevelop://project/static-data.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getStaticData(project, {}).staticData, null, 2),
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
  const isSceneEventWrite = !!(
    project &&
    (toolName === 'add_scene_events' || toolName === 'generate_events') &&
    args &&
    typeof args.scene_name === 'string' &&
    project.hasLayoutNamed(args.scene_name)
  );
  const oldRevision = isSceneEventWrite
    ? getSceneEventsRevision((project: any), args.scene_name)
    : undefined;
  const processEditorFunctionCalls =
    context.processEditorFunctionCalls ||
    getDefaultProcessEditorFunctionCalls();

  let results: Array<any>;
  try {
    ({ results } = await processEditorFunctionCalls({
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
    }));
  } catch (error) {
    const newRevision = isSceneEventWrite
      ? getSceneEventsRevision((project: any), args.scene_name)
      : undefined;
    if (isSceneEventWrite && oldRevision !== newRevision) {
      context.triggerUnsavedChanges();
      const saveState =
        args && args.save === true
          ? {
              requested: true,
              ...(context.saveProjectAndWait
                ? await saveProjectWithEvidence(context)
                : {
                    success: false,
                    saved: false,
                    reason: 'save-handler-unavailable',
                  }),
            }
          : {
              requested: false,
              persistenceState: getPersistenceState(context),
            };
      return textResult({
        success: true,
        applied: true,
        sceneName: args.scene_name,
        oldRevision,
        newRevision,
        eventSheetRevision: newRevision,
        editorReportedSuccess: false,
        validationState: {
          valid: true,
          source: 'revision-readback-after-editor-exception',
        },
        saveState,
        warning: error.message,
      });
    }
    throw error;
  }

  const firstResult = results && results[0];
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

  let output = firstResult.output;
  if (
    firstResult.didModifyProject &&
    output &&
    typeof output === 'object' &&
    !Array.isArray(output)
  ) {
    output = {
      ...output,
      persistenceState: getPersistenceState(context),
    };
  }
  const newRevision = isSceneEventWrite
    ? getSceneEventsRevision((project: any), args.scene_name)
    : undefined;
  const eventMutationObserved = !!(
    isSceneEventWrite &&
    (oldRevision !== newRevision ||
      firstResult.didModifyProject ||
      (output &&
        typeof output === 'object' &&
        (output.applied === true || output.lowLevelMutations > 0)))
  );
  const recoveredMutationAfterReportedFailure = !!(
    !firstResult.success && eventMutationObserved
  );
  if (recoveredMutationAfterReportedFailure && !firstResult.didModifyProject) {
    context.triggerUnsavedChanges();
  }
  if (isSceneEventWrite && output && typeof output === 'object') {
    let saveState = {
      requested: false,
      persistenceState: getPersistenceState(context),
    };
    if (
      args &&
      args.save === true &&
      (firstResult.success || recoveredMutationAfterReportedFailure)
    ) {
      saveState = {
        requested: true,
        ...(context.saveProjectAndWait
          ? await saveProjectWithEvidence(context)
          : {
              success: false,
              saved: false,
              reason: 'save-handler-unavailable',
            }),
      };
    }
    output = {
      ...output,
      success: firstResult.success || recoveredMutationAfterReportedFailure,
      sceneName: args.scene_name,
      applied: eventMutationObserved,
      oldRevision,
      newRevision,
      eventSheetRevision: newRevision,
      validationState: output.validationState || {
        valid: firstResult.success || recoveredMutationAfterReportedFailure,
        source: 'direct-event-preflight',
      },
      saveState,
    };
  }

  // The event sheet revision is the source of truth. If an editor integration
  // reports an unrelated failure after the model changed, returning an error
  // would encourage a retry that duplicates the mutation.
  if (recoveredMutationAfterReportedFailure) {
    return textResult({
      ...(output && typeof output === 'object' ? output : {}),
      success: true,
      applied: true,
      editorReportedSuccess: false,
      warning:
        firstResult.output && firstResult.output.message
          ? firstResult.output.message
          : 'The editor reported a failure after the event sheet revision changed. The mutation was kept and verified by revision readback.',
    });
  }

  return firstResult.success
    ? textResult(
        firstResult.didModifyProject
          ? withStaleStateAdvisory(
              output,
              context,
              getStaleStateTargetForTool(toolName, args, output)
            )
          : output
      )
    : errorResult(
        firstResult.output && firstResult.output.message
          ? firstResult.output.message
          : JSON.stringify(firstResult.output || {}, null, 2),
        output && typeof output === 'object' && !Array.isArray(output)
          ? output
          : undefined
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
    return textResult(
      getEditorState(
        project,
        permissions,
        context.getPreviewLaunchState ? context.getPreviewLaunchState() : null
      )
    );
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
    if (!/(?:^|[\\/])project\.settings$/i.test(projectFile)) {
      return errorResult(
        'generate-catalogs requires a local multi-file project whose entry file is project.settings.',
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
          settings: path.join(
            projectRoot,
            '.gdevelop',
            'settings-catalog.json'
          ),
          layouts: path.join(projectRoot, '.gdevelop', 'layout-catalog.json'),
          runtimeApi: path.join(projectRoot, '.gdevelop', 'runtime-api.d.ts'),
          projectApi: path.join(projectRoot, '.gdevelop', 'project-api.d.ts'),
        },
        nextAction:
          'Read the refreshed catalogs before making edits that depend on newly added or changed project structure. Run validate_project_files after the final source edit before reload_project.',
        note:
          'All three generated catalog files and both JavaScript declaration files were written sequentially and verified before this response. Project source files and editor memory were not modified.',
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
    if (!/(?:^|[\\/])project\.settings$/i.test(projectFile)) {
      return errorResult(
        'validate_project_files requires a local multi-file project whose entry file is project.settings.',
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
                'The open project is not using project.settings as its entry file.',
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
      const generatedJson = JSON.stringify(serializedProject, null, 2);
      const generatedGameJson = {
        reconstructedInMemory: true,
        writtenToDisk: false,
        targetPath: path
          ? path.join(path.dirname(projectFile), '.gdevelop', 'game.json')
          : undefined,
        byteLength: unescape(encodeURIComponent(generatedJson)).length,
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
    if (!/[\\/]project\.settings$/i.test(projectFile)) {
      return errorResult(
        'import_extension requires a saved multi-file project whose entry file is project.settings.'
      );
    }

    const wasAlreadyInstalled = project.hasEventsFunctionsExtensionNamed(
      extensionName
    );
    const installedExtensionNames: Array<string> = [];
    try {
      if (!wasAlreadyInstalled) {
        await ensureExtensionInstalled({
          extensionName,
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
        save: saveResult,
        nextAction:
          'Edit the generated project files directly. Call reload_project after the final file edit and before launch_preview.',
      });
    } catch (error) {
      return errorResult(
        error && error.message
          ? error.message
          : `Unable to import extension "${extensionName}".`,
        {
          importerVersion: 3,
          extensionName,
          importedExtensions: installedExtensionNames,
          writerError: {
            name: error && error.name ? error.name : undefined,
            code: error && error.code ? error.code : undefined,
            fileUri: error && error.fileUri ? error.fileUri : undefined,
          },
        }
      );
    }
  }

  if (toolName === 'gdevelop_read_project_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      truncateText(serializeToJSON(project), args.maxLength || undefined)
    );
  }

  if (toolName === 'gdevelop_get_static_data') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(getStaticData(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
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
    const validationArgs = args || {};
    return textResult(
      validateEventsJson({
        project,
        sceneName:
          validationArgs && typeof validationArgs.scene_name === 'string'
            ? validationArgs.scene_name
            : null,
        eventsJson: getEventsJsonArgument(validationArgs),
        allowJavaScriptEvents: !!validationArgs.allow_javascript_events,
        dedupeErrors: !!validationArgs.dedupe_errors,
        summaryOnly: validationArgs.summary_only !== false,
        errorsOnly: !!validationArgs.errors_only,
        includeRenderedEvents: !!validationArgs.include_rendered_events,
        includeNormalizedJson: !!validationArgs.include_normalized_json,
      })
    );
  }

  if (toolName === 'gdevelop_validate_extension_events_json') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(validateExtensionEventsJson(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'validate_current_project_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(validateCurrentProjectJson(project, args || {}));
  }

  if (toolName === 'inspect_custom_object_runtime_geometry') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(
        inspectCustomObjectRuntimeGeometry(project, args || {})
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_prefab_property_bindings') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectPrefabPropertyBindings(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
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
        summaryOnly: !(args && args.summary_only === false),
        dedupeErrors: !!(args && args.dedupe_errors),
        errorsOnly: !!(args && args.errors_only),
        includeRenderedEvents: !!(args && args.include_rendered_events),
        includeNormalizedJson: !!(args && args.include_normalized_json),
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
        compact: !(args && args.compact === false),
        targetScope:
          args && typeof args.target_scope === 'string'
            ? args.target_scope
            : null,
      })
    );
  }

  if (toolName === 'gdevelop_get_instruction_metadata') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getExactInstructionMetadata({
        project,
        i18n: context.i18n,
        type: args && typeof args.type === 'string' ? args.type : null,
        kind: args && typeof args.kind === 'string' ? args.kind : null,
        compact: !(args && args.compact === false),
        targetScope:
          args && typeof args.target_scope === 'string'
            ? args.target_scope
            : null,
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

  if (toolName === 'gdevelop_capabilities') {
    return textResult(getCapabilitiesSummary(context.getPermissions()));
  }

  if (toolName === 'gdevelop_refresh_tool_catalog') {
    const permissions = context.getPermissions();
    const capabilities = getCapabilitiesSummary(permissions);
    return textResult({
      success: true,
      permissions: capabilities.permissions,
      tools: getMcpTools(permissions),
      categories: capabilities.categories,
      note:
        'Returned the current GDevelop MCP tool catalog from the editor. If your MCP host uses deferred tools, run tool_search for gdevelop after this so the host exposes newly listed tools.',
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

  if (toolName === 'create_action' || toolName === 'create_condition') {
    if (!project) return errorResult('No project opened.');
    const type = args && typeof args.type === 'string' ? args.type : '';
    if (!type) return errorResult('Missing instruction "type".');
    try {
      const built = buildInstruction({
        project,
        i18n: context.i18n,
        type,
        kind: toolName === 'create_condition' ? 'condition' : 'action',
        parameters: (args && args.parameters) || {},
      });
      return textResult(built);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'create_signal_emit_action') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(
        buildSignalEmitAction({
          project,
          i18n: context.i18n,
          args: args || {},
        })
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'create_signal_received_condition') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(
        buildSignalReceivedCondition({
          project,
          i18n: context.i18n,
          args: args || {},
        })
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'read_serialized_scene') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(readSerializedScene(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'get_tilemap_tiles') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(getTilemapTiles(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_tilemap_palette') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectTilemapPalette(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_tilemap_collision') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectTilemapCollision(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'check_tilemap_walkability') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(checkTilemapWalkability(project, args || {}));
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

  if (toolName === 'inspect_resource_images') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectResourceImages(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'audit_project_asset_sources') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(auditProjectAssetSources(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'compare_image_files') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(compareImageFiles(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'crop_scene_object_image') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(cropSceneObjectImage(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'inspect_scene_draw_order') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectSceneDrawOrder(project, args || {}));
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

  if (toolName === 'search_behavior_store') {
    // Search the COMMUNITY behavior registry (asset store) for behaviors that
    // may not be installed yet. Returns each behavior's full `behavior_type` to
    // pass to add_behavior, which installs the extension automatically.
    try {
      const query = args && typeof args.query === 'string' ? args.query : '';
      const objectType = (args && (args.object_type || args.objectType)) || '';
      const limit =
        args && typeof args.limit === 'number'
          ? Math.max(1, Math.min(50, Math.floor(args.limit)))
          : 20;

      const registry = await getBehaviorsRegistry();
      const headers = Array.isArray(registry.headers) ? registry.headers : [];

      // Which extensions are already installed in this project's platform.
      const platform = project ? project.getCurrentPlatform() : null;
      const isInstalled = (extensionName: string): boolean => {
        if (!platform || !extensionName) return false;
        try {
          return platform.isExtensionLoaded(extensionName);
        } catch (e) {
          return false;
        }
      };

      const scored = headers
        .filter(
          header =>
            !header.isDeprecated &&
            // If an object type is given, only behaviors that apply to it (or to
            // any object — empty objectType means "any").
            (!objectType ||
              !header.objectType ||
              header.objectType === objectType)
        )
        .map(header => ({
          score: scoreBehaviorHeaderMatch(header, query),
          header,
        }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ header }) => ({
          // The exact value to pass to add_behavior as behavior_type.
          behaviorType: header.type,
          name: header.name,
          fullName: header.fullName,
          description: header.description,
          category: header.category || undefined,
          extensionName: header.extensionName,
          // Empty objectType means it works on any object type.
          requiredObjectType: header.objectType || '',
          tier: header.tier || undefined,
          requiredBehaviorTypes:
            header.allRequiredBehaviorTypes &&
            header.allRequiredBehaviorTypes.length
              ? header.allRequiredBehaviorTypes
              : undefined,
          alreadyInstalled: isInstalled(header.extensionName),
        }));

      return textResult({
        success: true,
        query,
        objectType: objectType || undefined,
        totalMatches: scored.length,
        behaviors: scored,
        note:
          'Community behaviors from the asset store. To use one, call add_behavior with its behaviorType (and scene_name + object_name) — the extension is installed automatically. For behaviors already in the project, prefer list_available_behaviors. Do NOT write events from scratch to replicate a behavior; install and configure it instead (inspect_behavior_properties / change_behavior_property).',
      });
    } catch (error) {
      return errorResult(
        `Could not fetch the behavior store registry: ${
          error && error.message ? error.message : String(error)
        }. (Requires network access.)`
      );
    }
  }

  if (toolName === 'inspect_gameplay_rules') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectGameplayRules(project, args || {}));
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
        args || {}
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
      const result = await runPreviewFrames(previewDebuggerServer, args || {});
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

  if (toolName === 'find_scene_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(findSceneEvents(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'find_extension_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(findExtensionEvents(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'find_project_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(findProjectEvents(project, args || {}));
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

  if (toolName === 'lint_scene_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(lintSceneEvents(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'lint_extension_function_events') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(lintExtensionFunctionEvents(project, args || {}));
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

  if (toolName === 'launch_preview') {
    const previewDebuggerServer = context.getPreviewDebuggerServer
      ? context.getPreviewDebuggerServer()
      : null;
    try {
      const result = await launchPreview(
        previewDebuggerServer,
        context.runCommand,
        args || {},
        {
          getProject: context.getProject,
          launchPreviewForScene: context.launchPreviewForScene,
        }
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_run_command') {
    const commandName =
      args && typeof args.commandName === 'string' ? args.commandName : '';
    if (!commandName) return errorResult('Missing commandName.');
    if (commandName.trim().toUpperCase() === 'CLOSE_PREVIEW') {
      return errorResult(closePreviewCommandError);
    }
    const commandMetadata = commandsList[((commandName: any): CommandName)];
    if (!commandMetadata) {
      return errorResult(`Unknown command: ${commandName}.`);
    }
    if (commandName.trim().toUpperCase() === 'SAVE_PROJECT') {
      const persistence = await saveProjectWithEvidence(context);
      return persistence.success
        ? textResult({
            success: true,
            commandName,
            completed: true,
            persistence,
          })
        : errorResult('The project save did not complete successfully.', {
            commandName,
            completed: true,
            persistence,
          });
    }
    const didRun = context.runCommand(commandName);
    return didRun
      ? textResult({
          commandName,
          launched: true,
          ...(commandName === 'LAUNCH_NEW_PREVIEW' ||
          commandName === 'LAUNCH_DEBUG_PREVIEW'
            ? {
                note:
                  'For MCP runtime tests, prefer launch_preview { start_paused: true }, then run_frames. It attaches to the debugger and avoids stale or already-running previews.',
              }
            : undefined),
        })
      : errorResult(`Unknown or unavailable command: ${commandName}.`);
  }

  if (toolName === 'gdevelop_save_project_and_wait') {
    if (!context.saveProjectAndWait) {
      return errorResult(
        'The GDevelop host did not provide saveProjectAndWait, so MCP cannot confirm that the project was written to disk.'
      );
    }
    try {
      const persistence = await saveProjectWithEvidence(context);
      // Post-save consistency snapshot (#11): report project-level facts so the
      // caller can confirm the saved state matches intent without a separate read.
      const project = context.getProject ? context.getProject() : null;
      let consistency;
      if (project) {
        const sceneNames: Array<string> = [];
        for (let i = 0; i < project.getLayoutsCount(); i++) {
          sceneNames.push(project.getLayoutAt(i).getName());
        }
        consistency = {
          projectName: project.getName(),
          projectFile: project.getProjectFile() || undefined,
          firstLayout: project.getFirstLayout() || undefined,
          sceneCount: sceneNames.length,
          sceneNames,
        };
      }
      return textResult({
        success: persistence.success,
        saved: persistence.saved,
        reason: persistence.reason,
        persistence,
        consistency,
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
      !getEventsJsonArgument(editorFunctionArgs) &&
      !editorFunctionArgs.event_changes
    ) {
      return errorResult(mcpDirectEventsRequiredMessage);
    }
    return callEditorFunction({
      toolName: args.name,
      args:
        args.name === 'add_scene_events' || args.name === 'generate_events'
          ? autoQuoteAddSceneEventsArgs(
              context.getProject(),
              editorFunctionArgs
            )
          : editorFunctionArgs,
      context,
    });
  }

  let eventWriteArgs = args || {};
  if (toolName === 'add_scene_events' || toolName === 'generate_events') {
    if (
      !getEventsJsonArgument(eventWriteArgs) &&
      !eventWriteArgs.event_changes
    ) {
      return errorResult(mcpDirectEventsRequiredMessage);
    }
    const sceneName = eventWriteArgs.scene_name;
    if (typeof sceneName !== 'string' || !sceneName) {
      return errorResult('Missing scene_name.');
    }
    let currentRevision;
    if (project) {
      try {
        currentRevision = getSceneEventsRevision(project, sceneName);
      } catch (error) {
        return errorResult(error.message);
      }
    }
    const expectedRevision =
      eventWriteArgs.expected_revision || eventWriteArgs.expectedRevision;
    if (project && expectedRevision && expectedRevision !== currentRevision) {
      return errorResult(
        'The scene event sheet changed after it was read. Read it again and rebuild the patch against the current revision.',
        {
          code: 'EVENT_SHEET_REVISION_CONFLICT',
          sceneName,
          expectedRevision,
          eventSheetRevision: currentRevision,
        }
      );
    }
    if (
      project &&
      (eventWriteArgs.dry_run === true || eventWriteArgs.dryRun === true)
    ) {
      try {
        return textResult(
          dryRunSceneEventChanges({
            project,
            args: eventWriteArgs,
          })
        );
      } catch (error) {
        return errorResult(error.message);
      }
    }
    if (
      !getEventsJsonArgument(eventWriteArgs) &&
      !eventWriteArgs.event_changes
    ) {
      return errorResult(mcpDirectEventsRequiredMessage);
    }
  }

  let extensionWriteToolHandler = null;
  if (toolName === 'gdevelop_create_or_update_extension') {
    extensionWriteToolHandler = createOrUpdateExtension;
  } else if (toolName === 'gdevelop_delete_extension') {
    extensionWriteToolHandler = deleteExtension;
  } else if (toolName === 'gdevelop_create_or_update_extension_function') {
    extensionWriteToolHandler = createOrUpdateExtensionFunction;
  } else if (toolName === 'gdevelop_create_or_update_on_signal') {
    extensionWriteToolHandler = createOrUpdateOnSignalFunction;
  } else if (toolName === 'replace_extension_function_events_from_file') {
    extensionWriteToolHandler = replaceExtensionFunctionEventsFromFile;
  } else if (toolName === 'patch_extension_event_instruction') {
    extensionWriteToolHandler = patchExtensionEventInstruction;
  } else if (toolName === 'apply_validated_extension_patch') {
    extensionWriteToolHandler = applyValidatedExtensionPatch;
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
  } else if (toolName === 'gdevelop_extract_prefab_from_object') {
    extensionWriteToolHandler = extractPrefabFromObject;
  } else if (toolName === 'gdevelop_create_or_update_extension_property') {
    extensionWriteToolHandler = createOrUpdateExtensionProperty;
  } else if (toolName === 'gdevelop_delete_extension_property') {
    extensionWriteToolHandler = deleteExtensionProperty;
  } else if (toolName === 'bind_child_sprite_resource_property') {
    extensionWriteToolHandler = bindChildSpriteResourceProperty;
  }

  if (extensionWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const extensionArgs = args || {};
      const extensionPatchSnapshot =
        toolName === 'apply_validated_extension_patch' &&
        !(
          extensionArgs &&
          (extensionArgs.dry_run === true || extensionArgs.dryRun === true)
        )
          ? snapshotProject(project, {
              label: `before-validated-extension-patch-${(extensionArgs &&
                (extensionArgs.extension_name ||
                  extensionArgs.extensionName)) ||
                'extension'}`,
            })
          : null;
      const result = extensionWriteToolHandler(project, extensionArgs);
      if (extensionPatchSnapshot && result.success && !result.dryRun) {
        result.snapshot = extensionPatchSnapshot;
      }
      const extensionFunctionEventsChanged =
        toolName === 'patch_extension_event_instruction' ||
        toolName === 'replace_extension_function_events_from_file' ||
        (toolName === 'apply_validated_extension_patch' &&
          result.scope === 'extension_function') ||
        (toolName === 'gdevelop_create_or_update_extension_function' &&
          extensionArgs &&
          (getEventsJsonArgument(extensionArgs) ||
            (extensionArgs.serialized_function &&
              typeof extensionArgs.serialized_function === 'object'))) ||
        (toolName === 'gdevelop_create_or_update_on_signal' &&
          extensionArgs &&
          getEventsJsonArgument(extensionArgs));
      if (
        extensionFunctionEventsChanged &&
        !result.dryRun &&
        context.onExtensionFunctionEventsModifiedOutsideEditor
      ) {
        context.onExtensionFunctionEventsModifiedOutsideEditor({
          extensionName: result.extensionName || extensionArgs.extension_name,
          parentKind:
            result.parentKind || extensionArgs.parent_kind || 'extension',
          parentName:
            result.parentKind === 'extension' ||
            extensionArgs.parent_kind === 'extension'
              ? null
              : result.parentName || extensionArgs.parent_name || null,
          functionName:
            result.functionName ||
            (result.function && result.function.name
              ? result.function.name
              : extensionArgs.new_function_name || extensionArgs.function_name),
          newOrChangedAiGeneratedEventIds: new Set(),
        });
      }
      // A wholesale extension reload (apply_validated_extension_patch with a
      // cross-cutting change) frees and rebuilds the extension's C++ child
      // containers. Tell the editor to drop stale wrappers for that extension's
      // open tabs/panels, otherwise a later render can use-after-free.
      if (
        !result.dryRun &&
        result.requiresEditorReload &&
        context.onExtensionModifiedOutsideEditor
      ) {
        context.onExtensionModifiedOutsideEditor(
          result.extensionName || extensionArgs.extension_name
        );
      }
      if (
        !result.dryRun &&
        result.success !== false &&
        result.didModifyProject !== false
      ) {
        context.triggerUnsavedChanges();
      }
      return textResult(
        withStaleStateAdvisory(
          result,
          context,
          getStaleStateTargetForTool(toolName, extensionArgs, result)
        )
      );
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

  if (toolName === 'snapshot_project') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(snapshotProject(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }
  if (toolName === 'restore_project_snapshot') {
    if (!project) return errorResult('No project opened.');
    try {
      const result = restoreProjectSnapshot(project, args || {});
      context.triggerUnsavedChanges();
      notifyProjectModelChangedOutsideEditor(project, context);
      return textResult(
        withStaleStateAdvisory(
          result,
          context,
          getStaleStateTargetForTool(toolName, args, result)
        )
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (
    toolName === 'apply_validated_project_json_patch' ||
    toolName === 'sync_editor_from_validated_project_json'
  ) {
    if (!project) return errorResult('No project opened.');
    try {
      const result =
        toolName === 'apply_validated_project_json_patch'
          ? applyValidatedProjectJsonPatch(project, args || {})
          : syncEditorFromValidatedProjectJson(project, args || {});
      if (result.success && !result.dryRun) {
        context.triggerUnsavedChanges();
        notifyProjectModelChangedOutsideEditor(project, context);
        if (result.shouldSave && context.saveProjectAndWait) {
          result.save = await saveProjectWithEvidence(context);
        } else if (result.shouldSave) {
          result.save = {
            saved: false,
            error:
              'The GDevelop host did not provide saveProjectAndWait, so MCP could not save after applying the patch.',
          };
        }
      }
      return textResult(
        result.success && !result.dryRun
          ? withStaleStateAdvisory(
              result,
              context,
              getStaleStateTargetForTool(toolName, args, result)
            )
          : result
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  let staticDataWriteToolHandler = null;
  if (toolName === 'gdevelop_set_static_data') {
    staticDataWriteToolHandler = setStaticData;
  } else if (toolName === 'gdevelop_set_static_data_value') {
    staticDataWriteToolHandler = setStaticDataValue;
  } else if (toolName === 'gdevelop_delete_static_data_value') {
    staticDataWriteToolHandler = deleteStaticDataValue;
  }

  if (staticDataWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = staticDataWriteToolHandler(project, args || {});
      if (result.didModifyProject !== false) {
        context.triggerUnsavedChanges();
      }
      return textResult(
        result.didModifyProject !== false
          ? withStaleStateAdvisory(
              result,
              context,
              getStaleStateTargetForTool(toolName, args, result)
            )
          : result
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (projectWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = projectWriteToolHandler(project, args || {});
      const didModifyProject =
        result.success !== false && result.didModifyProject !== false;
      if (didModifyProject) context.triggerUnsavedChanges();
      return textResult(
        didModifyProject
          ? withStaleStateAdvisory(
              result,
              context,
              getStaleStateTargetForTool(toolName, args, result)
            )
          : result
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  let sceneWriteToolHandler = null;
  if (toolName === 'add_or_update_resource') {
    sceneWriteToolHandler = addOrUpdateResource;
  } else if (toolName === 'replace_project_resource') {
    sceneWriteToolHandler = replaceProjectResource;
  } else if (toolName === 'generate_placeholder_asset') {
    sceneWriteToolHandler = generatePlaceholderAsset;
  } else if (toolName === 'render_scene_to_png') {
    sceneWriteToolHandler = renderSceneToPng;
  } else if (toolName === 'create_sprite_object_from_resource') {
    sceneWriteToolHandler = createSpriteObjectFromResource;
  } else if (toolName === 'create_text_object') {
    sceneWriteToolHandler = createTextObject;
  } else if (toolName === 'bulk_edit_scene_assets') {
    sceneWriteToolHandler = bulkEditSceneAssets;
  } else if (toolName === 'set_sprite_animations') {
    sceneWriteToolHandler = setSpriteAnimations;
  } else if (toolName === 'slice_sprite_sheet') {
    sceneWriteToolHandler = sliceSpriteSheet;
  } else if (toolName === 'bind_sprite_animations_from_directory') {
    sceneWriteToolHandler = bindSpriteAnimationsFromDirectory;
  } else if (toolName === 'create_tilemap_object') {
    sceneWriteToolHandler = createTilemapObject;
  } else if (toolName === 'set_tilemap_tiles') {
    sceneWriteToolHandler = setTilemapTiles;
  } else if (toolName === 'set_tilemap_collision_tiles') {
    sceneWriteToolHandler = setTilemapCollisionTiles;
  } else if (toolName === 'replace_object_definition') {
    sceneWriteToolHandler = replaceObjectDefinition;
  } else if (toolName === 'delete_scene_object') {
    sceneWriteToolHandler = deleteSceneObject;
  } else if (toolName === 'delete_scene_variable') {
    sceneWriteToolHandler = deleteSceneVariable;
  } else if (toolName === 'batch_delete_scene_variables') {
    sceneWriteToolHandler = batchDeleteSceneVariables;
  } else if (toolName === 'delete_object_variable') {
    sceneWriteToolHandler = deleteObjectVariable;
  } else if (toolName === 'delete_instance_variable') {
    sceneWriteToolHandler = deleteInstanceVariable;
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
  } else if (toolName === 'patch_scene_event_instruction') {
    sceneWriteToolHandler = patchSceneEventInstruction;
  } else if (toolName === 'replace_javascript_event_code') {
    sceneWriteToolHandler = replaceJavascriptEventCode;
  } else if (toolName === 'attach_object_to_object_top') {
    sceneWriteToolHandler = attachObjectToObjectTop;
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
      const sceneArgs = args || {};
      if (
        toolName === 'bulk_edit_scene_assets' &&
        (getEventsJsonArgument(sceneArgs) ||
          Array.isArray(sceneArgs.event_changes))
      ) {
        const eventsJson = getEventsJsonArgument(sceneArgs);
        const eventsArgs = {
          scene_name: sceneArgs.scene_name,
          events_json: eventsJson,
          event_changes: Array.isArray(sceneArgs.event_changes)
            ? sceneArgs.event_changes
            : undefined,
        };
        const preflightFailure = makeAddSceneEventsPreflightFailure(
          autoQuoteAddSceneEventsArgs(project, eventsArgs)
        );
        if (preflightFailure) {
          return textResult({
            ...preflightFailure,
            error:
              'bulk_edit_scene_assets event validation failed before writing. No scene asset or event changes were applied.',
          });
        }
      }

      const runSceneWriteTool: (
        project: gdProject,
        args: Object,
        callbacks: Object
      ) => Object = (sceneWriteToolHandler: any);
      const result = runSceneWriteTool(project, sceneArgs, {
        onSceneEventsModifiedOutsideEditor:
          context.onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor:
          context.onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor: context.onObjectsModifiedOutsideEditor,
      });
      // A dry_run handler returns without mutating - don't mark the project
      // dirty and don't run any follow-up writes (e.g. the bulk events step).
      const isDryRun = !!(
        (sceneArgs.dry_run === true || sceneArgs.dryRun === true) &&
        result &&
        result.dryRun === true
      );
      const didModifyProject = !!(
        result &&
        result.success !== false &&
        result.didModifyProject !== false
      );
      if (!isDryRun && didModifyProject) context.triggerUnsavedChanges();

      // bulk_edit_scene_assets can also write events in the same call. Events are
      // applied LAST (after resources/objects/animations/behaviors/variables/
      // instances) and go through the SAME validated add_scene_events path - no
      // structural validation (e.g. Or/And subInstructions checks) is bypassed.
      // CRITICAL: when dry_run is set, the assets handler returned WITHOUT
      // mutating; we must NOT write events either, or dry_run would still change
      // the project (a dangerous bug). Skip the events follow-up entirely.
      if (
        !isDryRun &&
        toolName === 'bulk_edit_scene_assets' &&
        (getEventsJsonArgument(sceneArgs) ||
          Array.isArray(sceneArgs.events) ||
          Array.isArray(sceneArgs.event_changes))
      ) {
        const eventsJson = getEventsJsonArgument(sceneArgs);
        const eventsArgs = {
          scene_name: sceneArgs.scene_name,
          events_json: eventsJson,
          event_changes: Array.isArray(sceneArgs.event_changes)
            ? sceneArgs.event_changes
            : undefined,
        };
        const eventsResponse = await callEditorFunction({
          toolName: 'add_scene_events',
          args: autoQuoteAddSceneEventsArgs(project, eventsArgs),
          context,
        });
        // Surface the events outcome alongside the assets result. callEditorFunction
        // returns a textResult-shaped object; attach its parsed content if possible.
        const combinedResult = {
          ...result,
          events: extractToolResultPayload(eventsResponse),
        };
        return textResult(
          withStaleStateAdvisory(
            combinedResult,
            context,
            getStaleStateTargetForTool('add_scene_events', eventsArgs, result)
          )
        );
      }

      if (isDryRun || !didModifyProject) {
        return textResult(result);
      }

      return textResult(
        withStaleStateAdvisory(
          result,
          context,
          getStaleStateTargetForTool(toolName, sceneArgs, result)
        )
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }

  const finalArgs =
    (toolName === 'add_scene_events' || toolName === 'generate_events') &&
    eventWriteArgs
      ? autoQuoteAddSceneEventsArgs(project, eventWriteArgs)
      : args || {};
  if (toolName === 'add_scene_events' || toolName === 'generate_events') {
    const preflightFailure = makeAddSceneEventsPreflightFailure(finalArgs);
    if (preflightFailure) return textResult(preflightFailure);
  }

  return callEditorFunction({
    toolName,
    args: finalArgs,
    context,
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
