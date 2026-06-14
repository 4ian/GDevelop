// @flow
import * as React from 'react';
import {
  getAllEditorTabs,
  getCurrentTabForPane,
  type EditorTab,
  type EditorTabsState,
} from '../MainFrame/EditorTabs/EditorTabsHandler';
import { SceneEditorContainer } from '../MainFrame/EditorContainers/SceneEditorContainer';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type FileMetadata } from '../ProjectsStorage';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import {
  type LaunchPreviewOptions,
  type HotReloaderLog,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  createNewResource,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';

const gd: libGDevelop = global.gd;
const BRIDGE_PROTOCOL_VERSION = 1;
const DEFAULT_BRIDGE_URL = 'ws://127.0.0.1:41677';

type PreviewBridgeState = {|
  hasNonEditionPreviewsRunning: boolean,
  nonEditionPreviewsCount: number,
  gameHotReloadLogs: Array<HotReloaderLog>,
  editorHotReloadLogs: Array<HotReloaderLog>,
  editorUncaughtError: Error | null,
|};

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  editorTabs: EditorTabsState,
  hasUnsavedChanges: boolean,
  unsavedChanges: UnsavedChanges,
  previewState: PreviewBridgeState,
  onSceneEventsModifiedOutsideEditor: ({
    scene: gdLayout,
    newOrChangedAiGeneratedEventIds: Set<string>,
  }) => void,
  onInstancesModifiedOutsideEditor: ({ scene: gdLayout }) => void,
  onObjectsModifiedOutsideEditor: ({
    scene: gdLayout,
    isNewObjectTypeUsed: boolean,
  }) => void,
  onNewResourcesAdded: () => void,
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  onLaunchPreview: (options: LaunchPreviewOptions) => Promise<void>,
|};

type BridgeCall = {|
  type: 'call',
  id: string,
  method: string,
  params?: { [string]: any },
|};

type BridgeSocket = WebSocket & {
  _gdevelopMcpBridgeIsOpen?: boolean,
  ...
};

const getBridgeUrl = (): string | null => {
  if (typeof window === 'undefined' || !window.WebSocket) return null;

  const searchParams = new URLSearchParams(window.location.search);
  const bridgeMode = searchParams.get('gdevelopMcpBridge');
  if (bridgeMode === '0' || bridgeMode === 'false') return null;

  const shouldUseDefaultBridge = bridgeMode === '1' || bridgeMode === 'true';
  const explicitUrl = searchParams.get('gdevelopMcpBridgeUrl');
  if (!explicitUrl && !shouldUseDefaultBridge) return null;

  const token = searchParams.get('gdevelopMcpBridgeToken');
  const url = explicitUrl || DEFAULT_BRIDGE_URL;
  if (!token) return url;

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
};

const safeCall = <T>(callback: () => T, fallback: T): T => {
  try {
    return callback();
  } catch (error) {
    return fallback;
  }
};

const summarizeObjectsContainer = (objectsContainer: gdObjectsContainer) => ({
  objectCount: objectsContainer.getObjectsCount(),
});

const summarizeLayout = (layout: gdLayout) => ({
  name: layout.getName(),
  objectCount: layout.getObjects().getObjectsCount(),
  instanceCount: layout.getInitialInstances().getInstancesCount(),
  eventCount: layout.getEvents().getEventsCount(),
});

const summarizeProject = (project: ?gdProject) => {
  if (!project) {
    return {
      hasProject: false,
    };
  }

  const layouts = [];
  for (let index = 0; index < project.getLayoutsCount(); index++) {
    layouts.push(summarizeLayout(project.getLayoutAt(index)));
  }

  const resourceNames = project
    .getResourcesManager()
    .getAllResourceNames()
    .toJSArray();

  return {
    hasProject: true,
    name: project.getName(),
    projectUuid: project.getProjectUuid(),
    firstLayout: project.getFirstLayout(),
    gameResolutionWidth: project.getGameResolutionWidth(),
    gameResolutionHeight: project.getGameResolutionHeight(),
    layoutCount: project.getLayoutsCount(),
    globalObjects: summarizeObjectsContainer(project.getObjects()),
    resourceCount: resourceNames.length,
    resources: resourceNames.slice(0, 50),
    layouts,
  };
};

const summarizeEditorTab = (tab: EditorTab, paneIdentifier: string) => ({
  key: tab.key,
  kind: tab.kind,
  label: tab.label || '',
  projectItemName: tab.projectItemName,
  paneIdentifier,
  closable: tab.closable,
  hasEditorRef: !!tab.editorRef,
});

const summarizeEditorTabs = (editorTabs: EditorTabsState) => {
  const panes: { [string]: any } = {};
  for (const paneIdentifier in editorTabs.panes) {
    const pane = editorTabs.panes[paneIdentifier];
    const currentTab = getCurrentTabForPane(editorTabs, paneIdentifier);
    panes[paneIdentifier] = {
      currentTabIndex: pane.currentTab,
      currentTab: currentTab
        ? summarizeEditorTab(currentTab, paneIdentifier)
        : null,
      editors: pane.editors.map(tab => summarizeEditorTab(tab, paneIdentifier)),
    };
  }

  return {
    panes,
    allTabs: getAllEditorTabs(editorTabs).map(tab =>
      summarizeEditorTab(tab, 'unknown')
    ),
  };
};

const findActiveEditorTab = (editorTabs: EditorTabsState): ?EditorTab => {
  for (const paneIdentifier of ['center', 'right', 'left', 'external']) {
    const currentTab = getCurrentTabForPane(editorTabs, paneIdentifier);
    if (currentTab && currentTab.editorRef) return currentTab;
  }

  return null;
};

const findActiveSceneEditorContainer = (
  editorTabs: EditorTabsState
): ?SceneEditorContainer => {
  const activeTab = findActiveEditorTab(editorTabs);
  if (!activeTab || !activeTab.editorRef) return null;

  const editorRef = activeTab.editorRef;
  if (!(editorRef instanceof SceneEditorContainer) || !editorRef.editor) {
    return null;
  }

  return editorRef;
};

const getActiveLayoutName = (editorTabs: EditorTabsState): string | null => {
  const activeTab = findActiveEditorTab(editorTabs);
  if (
    activeTab &&
    (activeTab.kind === 'layout' || activeTab.kind === 'layout events') &&
    activeTab.projectItemName
  ) {
    return activeTab.projectItemName;
  }

  return null;
};

const getTargetLayout = (
  project: gdProject,
  editorTabs: EditorTabsState,
  layoutName?: ?string
): gdLayout => {
  if (layoutName) {
    if (!project.hasLayoutNamed(layoutName)) {
      throw new Error(`No layout named "${layoutName}" exists in the project.`);
    }
    return project.getLayout(layoutName);
  }

  const activeLayoutName = getActiveLayoutName(editorTabs);
  if (activeLayoutName && project.hasLayoutNamed(activeLayoutName)) {
    return project.getLayout(activeLayoutName);
  }

  const firstLayoutName = project.getFirstLayout();
  if (firstLayoutName && project.hasLayoutNamed(firstLayoutName)) {
    return project.getLayout(firstLayoutName);
  }

  if (project.getLayoutsCount() > 0) {
    return project.getLayoutAt(0);
  }

  throw new Error('The project has no layout to edit.');
};

const parseParentEventPath = (value: any): Array<number> => {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error('parentEventPath must be an array of event indices.');
  }

  return value.map((segment, index) => {
    if (!Number.isInteger(segment) || segment < 0) {
      throw new Error(
        `parentEventPath[${index}] must be a non-negative integer.`
      );
    }
    return segment;
  });
};

const parseEventPath = (value: any): Array<number> => {
  const path = parseParentEventPath(value);
  if (!path.length) {
    throw new Error('eventPath must point to an existing event.');
  }
  return path;
};

const resolveEventsListAtPath = (
  rootEvents: gdEventsList,
  parentEventPath: Array<number>
): gdEventsList => {
  let currentEvents = rootEvents;
  parentEventPath.forEach((segment, depth) => {
    if (segment >= currentEvents.getEventsCount()) {
      throw new Error(
        `Invalid parentEventPath: index ${segment} is out of bounds at depth ${depth}.`
      );
    }

    const event = currentEvents.getEventAt(segment);
    if (!event.canHaveSubEvents()) {
      throw new Error(
        `Invalid parentEventPath: event at depth ${depth} cannot contain sub-events.`
      );
    }

    currentEvents = event.getSubEvents();
  });

  return currentEvents;
};

const resolveEventLocationAtPath = (
  rootEvents: gdEventsList,
  eventPath: Array<number>
): {| parentEvents: gdEventsList, index: number |} => {
  const parentEventPath = eventPath.slice(0, -1);
  const index = eventPath[eventPath.length - 1];
  const parentEvents = resolveEventsListAtPath(rootEvents, parentEventPath);
  if (index >= parentEvents.getEventsCount()) {
    throw new Error(
      `Invalid eventPath: index ${index} is out of bounds. Maximum event index is ${parentEvents.getEventsCount() -
        1}.`
    );
  }

  return { parentEvents, index };
};

const getInsertionIndex = (eventsList: gdEventsList, value: any): number => {
  if (value == null) return eventsList.getEventsCount();
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('index must be a non-negative integer.');
  }
  if (value > eventsList.getEventsCount()) {
    throw new Error(
      `index ${value} is out of bounds. Maximum insertion index is ${eventsList.getEventsCount()}.`
    );
  }
  return value;
};

const normalizeInstruction = (instruction: any): Object => {
  if (!instruction || typeof instruction !== 'object') {
    throw new Error('Instruction must be an object.');
  }

  const rawType = instruction.type;
  let type;
  if (typeof rawType === 'string') {
    type = {
      value: rawType,
    };
  } else if (rawType && typeof rawType === 'object') {
    type = rawType;
  } else {
    throw new Error('Instruction type must be a string or object.');
  }

  return {
    type,
    parameters: Array.isArray(instruction.parameters)
      ? instruction.parameters.map(parameter => String(parameter))
      : [],
    subInstructions: Array.isArray(instruction.subInstructions)
      ? instruction.subInstructions.map(normalizeInstruction)
      : [],
  };
};

const normalizeInstructions = (value: any): Array<Object> => {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error('Instructions must be an array.');
  return value.map(normalizeInstruction);
};

const createAiGeneratedEventId = (params: { [string]: any }): string => {
  if (
    typeof params.aiGeneratedEventId === 'string' &&
    params.aiGeneratedEventId.trim()
  ) {
    return params.aiGeneratedEventId.trim();
  }

  return `gdevelop-mcp-${Date.now()}`;
};

const createEventJsonsFromParams = (params: {
  [string]: any,
}): Array<Object> => {
  if (Array.isArray(params.events)) {
    return params.events.map(event => {
      if (!event || typeof event !== 'object') {
        throw new Error('events must contain only event objects.');
      }
      return event;
    });
  }

  if (params.event && typeof params.event === 'object') {
    return [params.event];
  }

  const eventType =
    typeof params.type === 'string'
      ? params.type
      : 'BuiltinCommonInstructions::Standard';
  if (eventType === 'BuiltinCommonInstructions::Comment') {
    return [
      {
        type: eventType,
        comment:
          typeof params.comment === 'string'
            ? params.comment
            : String(params.comment || ''),
        comment2: '',
      },
    ];
  }

  return [
    {
      type: eventType,
      conditions: normalizeInstructions(params.conditions),
      actions: normalizeInstructions(params.actions),
      events: Array.isArray(params.subEvents) ? params.subEvents : [],
    },
  ];
};

const createTemporaryEventsList = (
  project: gdProject,
  eventJsons: Array<Object>,
  aiGeneratedEventId?: ?string
): gdEventsList => {
  const temporaryEventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      temporaryEventsList,
      eventJsons,
      'unserializeFrom',
      project
    );
    if (temporaryEventsList.isEmpty()) {
      throw new Error('No event could be created from the supplied JSON.');
    }

    if (aiGeneratedEventId) {
      for (let i = 0; i < temporaryEventsList.getEventsCount(); i++) {
        temporaryEventsList
          .getEventAt(i)
          .setAiGeneratedEventId(aiGeneratedEventId);
      }
    }

    return temporaryEventsList;
  } catch (error) {
    temporaryEventsList.delete();
    throw error;
  }
};

const notifyEventsChanged = (
  props: Props,
  layout: gdLayout,
  aiGeneratedEventId: string
) => {
  props.unsavedChanges.triggerUnsavedChanges();
  props.onSceneEventsModifiedOutsideEditor({
    scene: layout,
    newOrChangedAiGeneratedEventIds: new Set([aiGeneratedEventId]),
  });
};

const notifyObjectsChanged = (
  props: Props,
  layout: gdLayout,
  isNewObjectTypeUsed: boolean
) => {
  props.unsavedChanges.triggerUnsavedChanges();
  props.onObjectsModifiedOutsideEditor({
    scene: layout,
    isNewObjectTypeUsed,
  });
};

const notifyInstancesChanged = (props: Props, layout: gdLayout) => {
  props.unsavedChanges.triggerUnsavedChanges();
  props.onInstancesModifiedOutsideEditor({
    scene: layout,
  });
};

const refreshOpenEditors = (props: Props) => {
  getAllEditorTabs(props.editorTabs).forEach(tab => {
    const editorRef: any = tab.editorRef;
    if (!editorRef) return;
    if (typeof editorRef.forceUpdateEditor === 'function') {
      editorRef.forceUpdateEditor();
    }
    if (
      editorRef.editor &&
      typeof editorRef.editor.refreshResourcesList === 'function'
    ) {
      editorRef.editor.refreshResourcesList();
    }
  });
};

const notifyResourcesChanged = (props: Props) => {
  props.unsavedChanges.triggerUnsavedChanges();
  props.onNewResourcesAdded();
  refreshOpenEditors(props);
};

const requireObjectName = (value: any): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('objectName must be a non-empty string.');
  }
  return value.trim();
};

const getNumberOrDefault = (value: any, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const getLayerName = (value: any): string => {
  return typeof value === 'string' ? value : '';
};

const resourceKinds: Array<ResourceKind> = [
  'audio',
  'image',
  'font',
  'video',
  'json',
  'tilemap',
  'tileset',
  'bitmapFont',
  'model3D',
  'atlas',
  'spine',
  'javascript',
];

const isResourceKind = (value: string): boolean =>
  resourceKinds.includes((value: any));

const getFileNameFromPath = (file: string): string => {
  const parts = file.split(/[\\/]/);
  return parts[parts.length - 1] || file;
};

const guessResourceKind = (file: string): ResourceKind => {
  const extensionParts = file
    .split('?')[0]
    .split('#')[0]
    .split('.');
  const extension = (
    extensionParts[extensionParts.length - 1] || ''
  ).toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) return 'image';
  if (['aac', 'wav', 'mp3', 'ogg', 'flac'].includes(extension)) return 'audio';
  if (['ttf', 'otf', 'woff', 'woff2'].includes(extension)) return 'font';
  if (['mp4', 'webm'].includes(extension)) return 'video';
  if (['ldtk', 'tmj'].includes(extension)) return 'tilemap';
  if (['tsj'].includes(extension)) return 'tileset';
  if (['fnt', 'xml'].includes(extension)) return 'bitmapFont';
  if (['glb', 'gltf'].includes(extension)) return 'model3D';
  if (['atlas'].includes(extension)) return 'atlas';
  if (['js'].includes(extension)) return 'javascript';
  return 'json';
};

const getResourceKind = (
  params: { [string]: any },
  file: string
): ResourceKind => {
  if (typeof params.kind === 'string') {
    if (!isResourceKind(params.kind)) {
      throw new Error(`Unsupported resource kind: ${params.kind}`);
    }
    return (params.kind: any);
  }

  return guessResourceKind(file);
};

const summarizeResource = (resource: gdResource) => {
  const summary = {
    name: resource.getName(),
    file: resource.getFile(),
    kind: resource.getKind(),
    userAdded: resource.isUserAdded(),
    smoothed: null,
  };
  if (resource instanceof gd.ImageResource) {
    return {
      ...summary,
      smoothed: gd.asImageResource(resource).isSmooth(),
    };
  }
  return summary;
};

const serializeParameterMetadata = (parameter: gdParameterMetadata) => ({
  name: parameter.getName(),
  type: parameter.getType(),
  description: parameter.getDescription(),
  longDescription: parameter.getLongDescription(),
  extraInfo: parameter.getExtraInfo(),
  hint: parameter.getHint(),
  defaultValue: parameter.getDefaultValue(),
  optional: parameter.isOptional(),
  codeOnly: parameter.isCodeOnly(),
});

const serializeInstructionMetadata = (
  kind: 'actions' | 'conditions',
  extension: gdPlatformExtension,
  id: string,
  metadata: gdInstructionMetadata
) => {
  const parameters = [];
  for (let index = 0; index < metadata.getParametersCount(); index++) {
    parameters.push(serializeParameterMetadata(metadata.getParameter(index)));
  }

  return {
    kind,
    id,
    extensionName: extension.getName(),
    extensionFullName: extension.getFullName(),
    fullName: metadata.getFullName(),
    description: metadata.getDescription(),
    sentence: metadata.getSentence(),
    group: metadata.getGroup(),
    helpPath: metadata.getHelpPath(),
    hidden: metadata.isHidden(),
    private: metadata.isPrivate(),
    async: metadata.isAsync(),
    optionallyAsync: metadata.isOptionallyAsync(),
    canHaveSubInstructions: metadata.canHaveSubInstructions(),
    deprecationMessage: metadata.getDeprecationMessage(),
    usageComplexity: metadata.getUsageComplexity(),
    functionName: metadata.getFunctionName(),
    asyncFunctionName: metadata.getAsyncFunctionName(),
    includeFiles: metadata.getIncludeFiles().toJSArray(),
    parameters,
  };
};

const serializeExpressionMetadata = (
  kind: 'expressions' | 'stringExpressions',
  extension: gdPlatformExtension,
  id: string,
  metadata: gdExpressionMetadata
) => {
  const parameters = [];
  for (let index = 0; index < metadata.getParametersCount(); index++) {
    parameters.push(serializeParameterMetadata(metadata.getParameter(index)));
  }

  return {
    kind,
    id,
    extensionName: extension.getName(),
    extensionFullName: extension.getFullName(),
    fullName: metadata.getFullName(),
    description: metadata.getDescription(),
    group: metadata.getGroup(),
    returnType: metadata.getReturnType(),
    helpPath: metadata.getHelpPath(),
    shown: metadata.isShown(),
    private: metadata.isPrivate(),
    deprecated: metadata.isDeprecated(),
    deprecationMessage: metadata.getDeprecationMessage(),
    functionName: metadata.getFunctionName(),
    includeFiles: metadata.getIncludeFiles().toJSArray(),
    parameters,
  };
};

const serializeInstructionMap = (
  kind: 'actions' | 'conditions',
  extension: gdPlatformExtension,
  metadataMap: gdMapStringInstructionMetadata
): Array<Object> => {
  const keys = metadataMap.keys();
  try {
    return keys
      .toJSArray()
      .map(id =>
        serializeInstructionMetadata(kind, extension, id, metadataMap.get(id))
      );
  } finally {
    keys.delete();
  }
};

const serializeExpressionMap = (
  kind: 'expressions' | 'stringExpressions',
  extension: gdPlatformExtension,
  metadataMap: gdMapStringExpressionMetadata
): Array<Object> => {
  const keys = metadataMap.keys();
  try {
    return keys
      .toJSArray()
      .map(id =>
        serializeExpressionMetadata(kind, extension, id, metadataMap.get(id))
      );
  } finally {
    keys.delete();
  }
};

const serializeEventMap = (
  extension: gdPlatformExtension,
  metadataMap: gdMapStringEventMetadata
): Array<Object> => {
  const keys = metadataMap.keys();
  try {
    return keys.toJSArray().map(id => {
      const metadata = metadataMap.get(id);
      return {
        kind: 'eventTypes',
        id,
        extensionName: extension.getName(),
        extensionFullName: extension.getFullName(),
        fullName: metadata.getFullName(),
        description: metadata.getDescription(),
        group: metadata.getGroup(),
      };
    });
  } finally {
    keys.delete();
  }
};

const serializeObjectTypes = (
  extension: gdPlatformExtension
): Array<Object> => {
  const objectTypes = extension.getExtensionObjectsTypes();
  try {
    return objectTypes.toJSArray().map(objectType => {
      const metadata = extension.getObjectMetadata(objectType);
      return {
        kind: 'objectTypes',
        id: objectType,
        extensionName: extension.getName(),
        extensionFullName: extension.getFullName(),
        name: metadata.getName(),
        fullName: metadata.getFullName(),
        description: metadata.getDescription(),
        category: metadata.getCategory(),
        assetStoreTag: metadata.getAssetStoreTag(),
        helpPath: metadata.getHelpPath(),
        hidden: metadata.isHidden(),
        private: metadata.isPrivate(),
        renderedIn3D: metadata.isRenderedIn3D(),
      };
    });
  } finally {
    objectTypes.delete();
  }
};

const serializeBehaviorTypes = (
  extension: gdPlatformExtension
): Array<Object> => {
  const behaviorTypes = extension.getBehaviorsTypes();
  try {
    return behaviorTypes.toJSArray().map(behaviorType => {
      const metadata = extension.getBehaviorMetadata(behaviorType);
      return {
        kind: 'behaviorTypes',
        id: behaviorType,
        extensionName: extension.getName(),
        extensionFullName: extension.getFullName(),
        name: metadata.getName(),
        fullName: metadata.getFullName(),
        defaultName: metadata.getDefaultName(),
        description: metadata.getDescription(),
        group: metadata.getGroup(),
        objectType: metadata.getObjectType(),
        helpPath: metadata.getHelpPath(),
        hidden: metadata.isHidden(),
        private: metadata.isPrivate(),
      };
    });
  } finally {
    behaviorTypes.delete();
  }
};

const shouldIncludeReflectionKind = (requestedKind: string, kind: string) =>
  requestedKind === 'all' || requestedKind === kind;

const buildLiveReflectionCatalog = (
  props: Props,
  params: { [string]: any }
) => {
  const requestedKind = typeof params.kind === 'string' ? params.kind : 'all';
  const query =
    typeof params.query === 'string' && params.query.trim()
      ? params.query.trim().toLowerCase()
      : null;
  const limit =
    typeof params.limit === 'number' &&
    Number.isInteger(params.limit) &&
    params.limit > 0
      ? Math.min(params.limit, 2000)
      : 500;
  const platform = props.project
    ? props.project.getCurrentPlatform()
    : gd.JsPlatform.get();
  const extensions = platform.getAllPlatformExtensions();
  const entries: Array<Object> = [];

  try {
    for (let index = 0; index < extensions.size(); index++) {
      const extension = extensions.at(index);
      if (shouldIncludeReflectionKind(requestedKind, 'eventTypes')) {
        entries.push(...serializeEventMap(extension, extension.getAllEvents()));
      }
      if (shouldIncludeReflectionKind(requestedKind, 'actions')) {
        entries.push(
          ...serializeInstructionMap(
            'actions',
            extension,
            extension.getAllActions()
          )
        );
      }
      if (shouldIncludeReflectionKind(requestedKind, 'conditions')) {
        entries.push(
          ...serializeInstructionMap(
            'conditions',
            extension,
            extension.getAllConditions()
          )
        );
      }
      if (shouldIncludeReflectionKind(requestedKind, 'expressions')) {
        entries.push(
          ...serializeExpressionMap(
            'expressions',
            extension,
            extension.getAllExpressions()
          )
        );
      }
      if (shouldIncludeReflectionKind(requestedKind, 'stringExpressions')) {
        entries.push(
          ...serializeExpressionMap(
            'stringExpressions',
            extension,
            extension.getAllStrExpressions()
          )
        );
      }
      if (shouldIncludeReflectionKind(requestedKind, 'objectTypes')) {
        entries.push(...serializeObjectTypes(extension));
      }
      if (shouldIncludeReflectionKind(requestedKind, 'behaviorTypes')) {
        entries.push(...serializeBehaviorTypes(extension));
      }
    }
  } finally {
    extensions.delete();
  }

  const filteredEntries = query
    ? entries.filter(entry =>
        JSON.stringify(entry)
          .toLowerCase()
          .includes(query)
      )
    : entries;

  return {
    ok: true,
    platform: {
      name: platform.getName(),
      fullName: platform.getFullName(),
    },
    kind: requestedKind,
    total: filteredEntries.length,
    returned: Math.min(filteredEntries.length, limit),
    entries: filteredEntries.slice(0, limit),
  };
};

const objectExistsInLayoutScope = (
  project: gdProject,
  layout: gdLayout,
  objectName: string
): boolean => {
  return (
    project.getObjects().hasObjectNamed(objectName) ||
    layout.getObjects().hasObjectNamed(objectName)
  );
};

const createTextObject = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const objectName = requireObjectName(params.objectName);
  const targetObjects =
    params.global === true ? project.getObjects() : layout.getObjects();

  if (objectExistsInLayoutScope(project, layout, objectName)) {
    throw new Error(
      `Object "${objectName}" already exists in this layout scope.`
    );
  }

  const objectType = 'TextObject::Text';
  const isNewObjectTypeUsed = !gd.UsedObjectTypeFinder.scanProject(
    project,
    objectType
  );
  const object = targetObjects.insertNewObject(
    project,
    objectType,
    objectName,
    targetObjects.getObjectsCount()
  );
  object.resetPersistentUuid();

  const textConfiguration = gd.asTextObjectConfiguration(
    object.getConfiguration()
  );
  textConfiguration.setText(
    typeof params.text === 'string' ? params.text : 'Text'
  );
  textConfiguration.setCharacterSize(
    getNumberOrDefault(params.characterSize, 20)
  );
  if (params.color && typeof params.color === 'object') {
    textConfiguration.setColor(
      `${getNumberOrDefault(params.color.r, 0)};${getNumberOrDefault(
        params.color.g,
        0
      )};${getNumberOrDefault(params.color.b, 0)}`
    );
  }

  notifyObjectsChanged(props, layout, isNewObjectTypeUsed);

  return {
    ok: true,
    layoutName: layout.getName(),
    scope: params.global === true ? 'global' : 'layout',
    object: serializeToJSObject(object),
  };
};

const createInstance = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const objectName = requireObjectName(params.objectName);
  if (!objectExistsInLayoutScope(project, layout, objectName)) {
    throw new Error(
      `Object "${objectName}" does not exist in this layout scope.`
    );
  }

  const instance = layout.getInitialInstances().insertNewInitialInstance();
  instance.setObjectName(objectName);
  instance.setX(getNumberOrDefault(params.x, 0));
  instance.setY(getNumberOrDefault(params.y, 0));
  instance.setAngle(getNumberOrDefault(params.angle, 0));
  instance.setLayer(getLayerName(params.layer));
  if (typeof params.zOrder === 'number' && Number.isInteger(params.zOrder)) {
    instance.setZOrder(params.zOrder);
  }
  if (typeof params.width === 'number' || typeof params.height === 'number') {
    instance.setHasCustomSize(true);
    if (typeof params.width === 'number') instance.setCustomWidth(params.width);
    if (typeof params.height === 'number')
      instance.setCustomHeight(params.height);
  }
  instance.resetPersistentUuid();

  notifyInstancesChanged(props, layout);

  return {
    ok: true,
    layoutName: layout.getName(),
    instance: serializeToJSObject(instance),
  };
};

const importResource = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const file =
    typeof params.file === 'string' && params.file.trim()
      ? params.file.trim()
      : typeof params.sourcePath === 'string' && params.sourcePath.trim()
      ? params.sourcePath.trim()
      : '';
  if (!file) throw new Error('file must be a non-empty string.');

  const resourceName =
    typeof params.resourceName === 'string' && params.resourceName.trim()
      ? params.resourceName.trim()
      : getFileNameFromPath(file);
  if (!resourceName) throw new Error('resourceName cannot be empty.');

  const resourceKind = getResourceKind(params, file);
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    if (params.overwrite !== true) {
      throw new Error(
        `Resource "${resourceName}" already exists. Pass overwrite: true to replace it.`
      );
    }
    resourcesManager.removeResource(resourceName);
  }

  const resource = createNewResource(resourceKind);
  if (!resource) throw new Error(`Unsupported resource kind: ${resourceKind}`);

  resource.setName(resourceName);
  resource.setFile(file);
  resource.setUserAdded(params.userAdded !== false);
  if (resource instanceof gd.ImageResource) {
    gd.asImageResource(resource).setSmooth(
      typeof params.smoothed === 'boolean'
        ? params.smoothed
        : project.getScaleMode() !== 'nearest'
    );
  } else {
    applyResourceDefaults(project, resource);
  }

  const added = resourcesManager.addResource(resource);
  resource.delete();
  if (!added) {
    throw new Error(`Resource "${resourceName}" could not be added.`);
  }

  const importedResource = resourcesManager.getResource(resourceName);
  notifyResourcesChanged(props);

  return {
    ok: true,
    resource: summarizeResource(importedResource),
  };
};

const updateSelectedInstances = (props: Props, params: { [string]: any }) => {
  const sceneEditorContainer = findActiveSceneEditorContainer(props.editorTabs);
  if (!sceneEditorContainer || !sceneEditorContainer.editor) {
    throw new Error('The active editor is not a scene editor.');
  }

  const layout = sceneEditorContainer.getLayout();
  if (!layout) throw new Error('No active layout is available.');

  const sceneEditor = sceneEditorContainer.editor;
  if (!sceneEditor) throw new Error('The active editor is not a scene editor.');

  const selectedInstances = sceneEditor.instancesSelection.getSelectedInstances();
  if (!selectedInstances.length) {
    throw new Error('No scene instances are currently selected.');
  }

  selectedInstances.forEach(instance => {
    if (typeof params.x === 'number') instance.setX(params.x);
    if (typeof params.y === 'number') instance.setY(params.y);
    if (typeof params.deltaX === 'number') {
      instance.setX(instance.getX() + params.deltaX);
    }
    if (typeof params.deltaY === 'number') {
      instance.setY(instance.getY() + params.deltaY);
    }
    if (typeof params.angle === 'number') instance.setAngle(params.angle);
    if (typeof params.deltaAngle === 'number') {
      instance.setAngle(instance.getAngle() + params.deltaAngle);
    }
    if (typeof params.layer === 'string') instance.setLayer(params.layer);
    if (typeof params.zOrder === 'number' && Number.isInteger(params.zOrder)) {
      instance.setZOrder(params.zOrder);
    }
    if (typeof params.width === 'number' || typeof params.height === 'number') {
      instance.setHasCustomSize(true);
      if (typeof params.width === 'number')
        instance.setCustomWidth(params.width);
      if (typeof params.height === 'number')
        instance.setCustomHeight(params.height);
    }
  });

  const serializedInstances = selectedInstances.map(instance =>
    serializeToJSObject(instance)
  );

  notifyInstancesChanged(props, layout);

  return {
    ok: true,
    layoutName: layout.getName(),
    updatedCount: serializedInstances.length,
    instances: serializedInstances,
  };
};

const insertCommentEvent = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const comment =
    typeof params.comment === 'string'
      ? params.comment
      : String(params.comment || '');
  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const targetEvents = resolveEventsListAtPath(
    layout.getEvents(),
    parseParentEventPath(params.parentEventPath)
  );
  const index = getInsertionIndex(targetEvents, params.index);
  const aiGeneratedEventId = createAiGeneratedEventId(params);
  const event = targetEvents.insertNewEvent(
    project,
    'BuiltinCommonInstructions::Comment',
    index
  );
  gd.asCommentEvent(event).setComment(comment);
  event.setAiGeneratedEventId(aiGeneratedEventId);

  notifyEventsChanged(props, layout, aiGeneratedEventId);

  return {
    ok: true,
    layoutName: layout.getName(),
    eventPath: [...parseParentEventPath(params.parentEventPath), index],
    aiGeneratedEventId,
    event: serializeToJSObject(event),
  };
};

const insertStandardEvent = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const targetEvents = resolveEventsListAtPath(
    layout.getEvents(),
    parseParentEventPath(params.parentEventPath)
  );
  const index = getInsertionIndex(targetEvents, params.index);
  const aiGeneratedEventId = createAiGeneratedEventId(params);
  const eventJson = {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: normalizeInstructions(params.conditions),
    actions: normalizeInstructions(params.actions),
    events: Array.isArray(params.subEvents) ? params.subEvents : [],
  };

  const temporaryEventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      temporaryEventsList,
      [eventJson],
      'unserializeFrom',
      project
    );
    if (temporaryEventsList.isEmpty()) {
      throw new Error('The standard event could not be created.');
    }

    const insertedCount = temporaryEventsList.getEventsCount();
    for (let i = 0; i < insertedCount; i++) {
      temporaryEventsList
        .getEventAt(i)
        .setAiGeneratedEventId(aiGeneratedEventId);
    }

    targetEvents.insertEvents(temporaryEventsList, 0, insertedCount, index);
  } finally {
    temporaryEventsList.delete();
  }

  notifyEventsChanged(props, layout, aiGeneratedEventId);

  return {
    ok: true,
    layoutName: layout.getName(),
    eventPath: [...parseParentEventPath(params.parentEventPath), index],
    aiGeneratedEventId,
    event: serializeToJSObject(targetEvents.getEventAt(index)),
  };
};

const replaceEvent = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const eventPath = parseEventPath(params.eventPath);
  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const { parentEvents, index } = resolveEventLocationAtPath(
    layout.getEvents(),
    eventPath
  );
  const aiGeneratedEventId = createAiGeneratedEventId(params);
  const replacementEventsList = createTemporaryEventsList(
    project,
    createEventJsonsFromParams(params),
    aiGeneratedEventId
  );

  let insertedCount = 0;
  let removedEvent = null;
  try {
    removedEvent = serializeToJSObject(parentEvents.getEventAt(index));
    parentEvents.removeEventAt(index);
    insertedCount = replacementEventsList.getEventsCount();
    parentEvents.insertEvents(replacementEventsList, 0, insertedCount, index);
  } finally {
    replacementEventsList.delete();
  }

  notifyEventsChanged(props, layout, aiGeneratedEventId);

  const insertedEvents = [];
  for (let i = 0; i < insertedCount; i++) {
    insertedEvents.push(
      serializeToJSObject(parentEvents.getEventAt(index + i))
    );
  }

  return {
    ok: true,
    layoutName: layout.getName(),
    eventPath,
    insertedCount,
    aiGeneratedEventId,
    removedEvent,
    insertedEvents,
  };
};

const deleteEvent = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const eventPath = parseEventPath(params.eventPath);
  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const { parentEvents, index } = resolveEventLocationAtPath(
    layout.getEvents(),
    eventPath
  );
  const event = parentEvents.getEventAt(index);
  const aiGeneratedEventId =
    typeof params.aiGeneratedEventId === 'string' && params.aiGeneratedEventId
      ? params.aiGeneratedEventId
      : event.getAiGeneratedEventId() || `gdevelop-mcp-delete-${Date.now()}`;
  const removedEvent = serializeToJSObject(event);
  parentEvents.removeEventAt(index);

  notifyEventsChanged(props, layout, aiGeneratedEventId);

  return {
    ok: true,
    layoutName: layout.getName(),
    eventPath,
    aiGeneratedEventId,
    removedEvent,
  };
};

const startsWithPath = (
  possibleChildPath: Array<number>,
  possibleParentPath: Array<number>
): boolean => {
  if (possibleChildPath.length < possibleParentPath.length) return false;
  return possibleParentPath.every(
    (segment, index) => possibleChildPath[index] === segment
  );
};

const eventPathsEqual = (
  firstPath: Array<number>,
  secondPath: Array<number>
): boolean =>
  firstPath.length === secondPath.length &&
  firstPath.every((segment, index) => segment === secondPath[index]);

const findEventPathByReference = (
  eventsList: gdEventsList,
  targetEvent: gdBaseEvent,
  currentPath: Array<number> = []
): Array<number> | null => {
  const targetPtr = (targetEvent: any).ptr;
  for (let i = 0; i < eventsList.getEventsCount(); i++) {
    const event = eventsList.getEventAt(i);
    if ((event: any).ptr === targetPtr) {
      return [...currentPath, i];
    }
    if (event.canHaveSubEvents()) {
      const childPath = findEventPathByReference(
        event.getSubEvents(),
        targetEvent,
        [...currentPath, i]
      );
      if (childPath) return childPath;
    }
  }

  return null;
};

const moveEvent = (props: Props, params: { [string]: any }) => {
  const project = props.project;
  if (!project) throw new Error('No project is open in GDevelop.');

  const eventPath = parseEventPath(params.eventPath);
  const sourceParentEventPath = eventPath.slice(0, -1);
  const targetParentEventPath = parseParentEventPath(
    params.targetParentEventPath
  );
  if (startsWithPath(targetParentEventPath, eventPath)) {
    throw new Error(
      'Cannot move an event inside itself or one of its children.'
    );
  }

  const layout = getTargetLayout(project, props.editorTabs, params.layoutName);
  const rootEvents = layout.getEvents();
  const { parentEvents, index } = resolveEventLocationAtPath(
    rootEvents,
    eventPath
  );
  const targetEvents = resolveEventsListAtPath(
    rootEvents,
    targetParentEventPath
  );
  const requestedTargetIndex = getInsertionIndex(targetEvents, params.index);
  const event = parentEvents.getEventAt(index);
  const aiGeneratedEventId =
    typeof params.aiGeneratedEventId === 'string' && params.aiGeneratedEventId
      ? params.aiGeneratedEventId
      : event.getAiGeneratedEventId() || `gdevelop-mcp-move-${Date.now()}`;
  const targetIndex =
    eventPathsEqual(sourceParentEventPath, targetParentEventPath) &&
    requestedTargetIndex > index
      ? requestedTargetIndex - 1
      : requestedTargetIndex;

  const moved = parentEvents.moveEventToAnotherEventsList(
    event,
    targetEvents,
    targetIndex
  );
  if (!moved) throw new Error('The event could not be moved.');

  notifyEventsChanged(props, layout, aiGeneratedEventId);

  return {
    ok: true,
    layoutName: layout.getName(),
    fromEventPath: eventPath,
    toParentEventPath: targetParentEventPath,
    requestedIndex: requestedTargetIndex,
    appliedIndex: targetIndex,
    finalEventPath: findEventPathByReference(rootEvents, event),
    aiGeneratedEventId,
    event: serializeToJSObject(event),
  };
};

const saveProject = async (props: Props, params: { [string]: any }) => {
  const fileMetadata = await props.onSave({
    skipNewVersionWarning: params.skipNewVersionWarning !== false,
  });

  return {
    ok: !!fileMetadata,
    file: fileMetadata
      ? {
          fileIdentifier: fileMetadata.fileIdentifier,
          name: fileMetadata.name,
        }
      : null,
    hasUnsavedChanges: props.unsavedChanges.hasUnsavedChanges,
  };
};

const launchPreview = async (props: Props, params: { [string]: any }) => {
  if (!props.project) throw new Error('No project is open in GDevelop.');

  await props.onLaunchPreview({
    networkPreview: params.networkPreview === true,
    hotReload: params.hotReload === true,
    shouldHardReload: params.shouldHardReload === true,
    fullLoadingScreen: params.fullLoadingScreen === true,
    numberOfWindows:
      typeof params.numberOfWindows === 'number' &&
      Number.isInteger(params.numberOfWindows) &&
      params.numberOfWindows > 0
        ? params.numberOfWindows
        : 1,
  });

  return {
    ok: true,
  };
};

const summarizePreviewState = (previewState: PreviewBridgeState) => ({
  hasNonEditionPreviewsRunning: previewState.hasNonEditionPreviewsRunning,
  nonEditionPreviewsCount: previewState.nonEditionPreviewsCount,
  gameLogCount: previewState.gameHotReloadLogs.length,
  editorLogCount: previewState.editorHotReloadLogs.length,
  editorUncaughtError: previewState.editorUncaughtError
    ? {
        name: previewState.editorUncaughtError.name,
        message: previewState.editorUncaughtError.message,
        stack: previewState.editorUncaughtError.stack,
      }
    : null,
});

const getPreviewLogs = (props: Props, params: { [string]: any }) => {
  const scope = typeof params.scope === 'string' ? params.scope : 'all';
  const includeGame = scope === 'all' || scope === 'game';
  const includeEditor = scope === 'all' || scope === 'editor';

  return {
    ok: true,
    status: summarizePreviewState(props.previewState),
    gameHotReloadLogs: includeGame ? props.previewState.gameHotReloadLogs : [],
    editorHotReloadLogs: includeEditor
      ? props.previewState.editorHotReloadLogs
      : [],
    editorUncaughtError:
      includeEditor && props.previewState.editorUncaughtError
        ? {
            name: props.previewState.editorUncaughtError.name,
            message: props.previewState.editorUncaughtError.message,
            stack: props.previewState.editorUncaughtError.stack,
          }
        : null,
  };
};

const isCanvasLikeElement = (element: any): boolean =>
  !!element &&
  typeof element.toDataURL === 'function' &&
  typeof element.width === 'number' &&
  typeof element.height === 'number' &&
  element.tagName === 'CANVAS';

const findCanvasInDocument = (
  rootDocument: Document,
  selector: string
): any => {
  const directCanvas = rootDocument.querySelector(selector);
  if (isCanvasLikeElement(directCanvas)) return directCanvas;

  const iframes = rootDocument.querySelectorAll('iframe');
  for (let index = 0; index < iframes.length; index++) {
    const iframe = iframes[index];
    try {
      if (iframe.contentDocument) {
        const canvas = findCanvasInDocument(iframe.contentDocument, selector);
        if (canvas) return canvas;
      }
    } catch (error) {
      // Cross-origin frames cannot be inspected.
    }
  }

  return null;
};

const captureScreenshot = (params: { [string]: any }) => {
  if (typeof document === 'undefined') {
    throw new Error('Screenshots can only be captured in the editor window.');
  }

  const selector =
    typeof params.selector === 'string' && params.selector
      ? params.selector
      : 'canvas';
  const canvas = findCanvasInDocument(document, selector);
  if (!canvas) {
    throw new Error(`No canvas found for selector "${selector}".`);
  }

  const includeDataUrl = params.includeDataUrl !== false;
  return {
    ok: true,
    selector,
    width: canvas.width,
    height: canvas.height,
    dataUrl: includeDataUrl ? canvas.toDataURL('image/png') : null,
  };
};

const summarizeSelection = (editorTabs: EditorTabsState) => {
  const activeTab = findActiveEditorTab(editorTabs);
  if (!activeTab) {
    return {
      kind: 'none',
      reason: 'No active editor tab with an editor reference.',
      instances: [],
    };
  }

  const editorRef = activeTab.editorRef;
  if (!(editorRef instanceof SceneEditorContainer) || !editorRef.editor) {
    return {
      kind: activeTab.kind,
      reason:
        'The active editor is not a scene editor with instance selection.',
      instances: [],
    };
  }

  const sceneEditor = editorRef.editor;
  const instancesSelection = sceneEditor.instancesSelection;
  const instances = instancesSelection.getSelectedInstances().map(instance => ({
    objectName: instance.getObjectName(),
    persistentUuid: instance.getPersistentUuid(),
    x: instance.getX(),
    y: instance.getY(),
    angle: instance.getAngle(),
    layer: instance.getLayer(),
    zOrder: instance.getZOrder(),
  }));

  return {
    kind: 'scene-instances',
    layoutName: activeTab.projectItemName,
    selectedInstanceCount: instances.length,
    instances,
  };
};

const buildEditorState = (props: Props) => {
  const activeTab = findActiveEditorTab(props.editorTabs);

  return {
    bridgeProtocolVersion: BRIDGE_PROTOCOL_VERSION,
    timestamp: new Date().toISOString(),
    hasUnsavedChanges: props.hasUnsavedChanges,
    file: props.currentFileMetadata
      ? {
          fileIdentifier: props.currentFileMetadata.fileIdentifier,
          name: props.currentFileMetadata.name,
        }
      : null,
    project: summarizeProject(props.project),
    activeTab: activeTab ? summarizeEditorTab(activeTab, 'active') : null,
    tabs: summarizeEditorTabs(props.editorTabs),
    selection: summarizeSelection(props.editorTabs),
    preview: summarizePreviewState(props.previewState),
  };
};

const respond = (socket: BridgeSocket, id: string, result: Object | null) => {
  socket.send(
    JSON.stringify({
      type: 'result',
      id,
      result,
    })
  );
};

const respondError = (socket: BridgeSocket, id: string, message: string) => {
  socket.send(
    JSON.stringify({
      type: 'error',
      id,
      message,
    })
  );
};

export default function AIEditorBridge(props: Props): React.Node {
  const socketRef = React.useRef<?BridgeSocket>(null);
  const propsRef = React.useRef<Props>(props);
  propsRef.current = props;

  const sendStateChanged = React.useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket._gdevelopMcpBridgeIsOpen) return;

    socket.send(
      JSON.stringify({
        type: 'event',
        event: 'stateChanged',
        payload: buildEditorState(propsRef.current),
      })
    );
  }, []);

  React.useEffect(
    () => {
      let retryTimeoutId = null;
      let closed = false;
      const bridgeUrl = getBridgeUrl();
      if (!bridgeUrl) return undefined;

      const connect = () => {
        if (closed) return;
        const socket: BridgeSocket = ((new WebSocket(
          bridgeUrl
        ): any): BridgeSocket);
        socketRef.current = socket;

        socket.onopen = () => {
          socket._gdevelopMcpBridgeIsOpen = true;
          socket.send(
            JSON.stringify({
              type: 'hello',
              role: 'gdevelop-editor',
              editorId: `gdevelop-editor-${Date.now()}`,
              protocolVersion: BRIDGE_PROTOCOL_VERSION,
              capabilities: [
                'editor.getState',
                'editor.getProjectSummary',
                'editor.getTabs',
                'editor.getSelection',
                'editor.getReflectionCatalog',
                'editor.getPreviewStatus',
                'editor.getPreviewLogs',
                'editor.captureScreenshot',
                'editor.importResource',
                'editor.insertCommentEvent',
                'editor.insertStandardEvent',
                'editor.replaceEvent',
                'editor.deleteEvent',
                'editor.moveEvent',
                'editor.createTextObject',
                'editor.createInstance',
                'editor.updateSelectedInstances',
                'editor.saveProject',
                'editor.launchPreview',
              ],
            })
          );
          sendStateChanged();
        };

        socket.onmessage = event => {
          const call = safeCall<BridgeCall | null>(
            () => JSON.parse(String(event.data)),
            null
          );
          if (!call || call.type !== 'call') return;

          try {
            if (call.method === 'editor.getState') {
              respond(socket, call.id, buildEditorState(propsRef.current));
            } else if (call.method === 'editor.getProjectSummary') {
              respond(
                socket,
                call.id,
                summarizeProject(propsRef.current.project)
              );
            } else if (call.method === 'editor.getTabs') {
              respond(
                socket,
                call.id,
                summarizeEditorTabs(propsRef.current.editorTabs)
              );
            } else if (call.method === 'editor.getSelection') {
              respond(
                socket,
                call.id,
                summarizeSelection(propsRef.current.editorTabs)
              );
            } else if (call.method === 'editor.getReflectionCatalog') {
              respond(
                socket,
                call.id,
                buildLiveReflectionCatalog(propsRef.current, call.params || {})
              );
            } else if (call.method === 'editor.getPreviewStatus') {
              respond(
                socket,
                call.id,
                summarizePreviewState(propsRef.current.previewState)
              );
            } else if (call.method === 'editor.getPreviewLogs') {
              respond(
                socket,
                call.id,
                getPreviewLogs(propsRef.current, call.params || {})
              );
            } else if (call.method === 'editor.captureScreenshot') {
              respond(socket, call.id, captureScreenshot(call.params || {}));
            } else if (call.method === 'editor.importResource') {
              const result = importResource(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.insertCommentEvent') {
              const result = insertCommentEvent(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.insertStandardEvent') {
              const result = insertStandardEvent(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.replaceEvent') {
              const result = replaceEvent(propsRef.current, call.params || {});
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.deleteEvent') {
              const result = deleteEvent(propsRef.current, call.params || {});
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.moveEvent') {
              const result = moveEvent(propsRef.current, call.params || {});
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.createTextObject') {
              const result = createTextObject(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.createInstance') {
              const result = createInstance(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.updateSelectedInstances') {
              const result = updateSelectedInstances(
                propsRef.current,
                call.params || {}
              );
              respond(socket, call.id, result);
              sendStateChanged();
            } else if (call.method === 'editor.saveProject') {
              saveProject(propsRef.current, call.params || {}).then(
                result => {
                  respond(socket, call.id, result);
                  sendStateChanged();
                },
                error => {
                  respondError(
                    socket,
                    call.id,
                    error instanceof Error ? error.message : String(error)
                  );
                }
              );
            } else if (call.method === 'editor.launchPreview') {
              launchPreview(propsRef.current, call.params || {}).then(
                result => {
                  respond(socket, call.id, result);
                  sendStateChanged();
                },
                error => {
                  respondError(
                    socket,
                    call.id,
                    error instanceof Error ? error.message : String(error)
                  );
                }
              );
            } else {
              respondError(
                socket,
                call.id,
                `Unknown bridge method: ${call.method}`
              );
            }
          } catch (error) {
            respondError(
              socket,
              call.id,
              error instanceof Error ? error.message : String(error)
            );
          }
        };

        socket.onclose = () => {
          socket._gdevelopMcpBridgeIsOpen = false;
          if (socketRef.current === socket) socketRef.current = null;
          if (!closed) {
            retryTimeoutId = setTimeout(connect, 2000);
          }
        };

        socket.onerror = () => {
          // Keep the editor quiet if the MCP server is not running.
        };
      };

      connect();

      return () => {
        closed = true;
        if (retryTimeoutId) clearTimeout(retryTimeoutId);
        const socket = socketRef.current;
        if (socket) socket.close();
      };
    },
    [sendStateChanged]
  );

  React.useEffect(
    () => {
      sendStateChanged();
    },
    [
      props.project,
      props.currentFileMetadata,
      props.editorTabs,
      props.hasUnsavedChanges,
      props.previewState,
      sendStateChanged,
    ]
  );

  return null;
}
