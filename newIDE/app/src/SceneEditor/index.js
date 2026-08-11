// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import LayerRemoveDialog from '../LayersList/LayerRemoveDialog';
import LayerEditorDialog from '../LayersList/LayerEditorDialog';
import enumerateLayers from '../LayersList/EnumerateLayers';
import ObjectInstanceVariablesDialog from '../VariablesList/ObjectInstanceVariablesDialog';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import ObjectExporterDialog from '../ObjectEditor/ObjectExporterDialog';
import ObjectImporterDialog from '../ObjectEditor/ObjectImporterDialog';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import EventsBasedObjectScenePropertiesDialog from './EventsBasedObjectScenePropertiesDialog';
import ExtractAsExternalLayoutDialog from './ExtractAsExternalLayoutDialog';
import ExtractAsCustomObjectDialog from './CustomObjectExtractor/ExtractAsCustomObjectDialog';
import NewObjectDialog from '../AssetStore/NewObjectDialog';
import { type InstallAssetOutput } from '../AssetStore/InstallAsset';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import MosaicEditorsDisplayToolbar from './MosaicEditorsDisplay/Toolbar';
import SwipeableDrawerEditorsDisplayToolbar from './SwipeableDrawerEditorsDisplay/Toolbar';
import { SplitEditorToolbar } from '../MainFrame/Toolbar/SplitEditorToolbar';
import { serializeToJSObject } from '../Utils/Serializer';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import Window from '../Utils/Window';
import { ResponsiveWindowMeasurer } from '../UI/Responsive/ResponsiveWindowMeasurer';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { shortenString } from '../Utils/StringHelpers';
import getObjectByName from '../Utils/GetObjectByName';
import UseSceneEditorCommands from './UseSceneEditorCommands';
import { type InstancesEditorSettings } from '../InstancesEditor/InstancesEditorSettings';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import EditSceneIcon from '../UI/CustomSvgIcons/EditScene';
import {
  type HistoryState,
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from '../Utils/History';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import {
  type ObjectWithContext,
  type GroupWithContext,
} from '../ObjectsList/EnumerateObjects';
import InfoBar from '../UI/Messages/InfoBar';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import SceneVariablesDialog from '../VariablesList/SceneVariablesDialog';
import { onObjectAdded, onInstanceAdded } from '../Hints/ObjectsAdditionalWork';
import { type InfoBarDetails } from '../Hints/ObjectsAdditionalWork';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { MOVEMENT_BIG_DELTA } from '../UI/KeyboardShortcuts';
import {
  getInstanceInLayoutWithPersistentUuid,
  getInstancesInLayoutForObject,
} from '../Utils/Layout';
import { zoomInFactor, zoomOutFactor } from '../Utils/ZoomUtils';
import debounce from 'lodash/debounce';
import { mapFor } from '../Utils/MapFor';
import MosaicEditorsDisplay from './MosaicEditorsDisplay';
import SwipeableDrawerEditorsDisplay from './SwipeableDrawerEditorsDisplay';
import { type SceneEditorsDisplayInterface } from './EditorsDisplay.flow';
import newNameGenerator from '../Utils/NewNameGenerator';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import {
  getObjectFolderOrObjectUnifiedName,
  type ObjectFolderOrObjectWithContext,
} from '../ObjectsList/EnumerateObjectFolderOrObject';
import uniq from 'lodash/uniq';
import {
  cleanNonExistingObjectFolderOrObjectWithContexts,
  getObjectFolderOrObjectWithContextFromObjectName,
} from './ObjectFolderOrObjectsSelection';
import objectTypeToDefaultName from '../ObjectsList/ObjectTypeToDefaultName';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../MainFrame/ResourcesWatcher';
import {
  unserializeFromJSObject,
  serializeObjectWithCleanDefaultBehaviorFlags,
} from '../Utils/Serializer';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type TileMapTileSelection } from '../InstancesEditor/TileSetVisualizer';
import { extractAsCustomObject } from './CustomObjectExtractor/CustomObjectExtractor';
import { isVariantEditable } from '../ObjectEditor/Editors/CustomObjectPropertiesEditor';
import { addSerializedInstances } from '../InstancesEditor/InstancesAdder';
import { type EditorViewPosition2D } from '../InstancesEditor';
import { type CustomObjectDragItem } from '../ProjectManager/ProjectManagerItemDragAndDrop';
import {
  createSpriteObjectFromImageFile,
  createSpriteObjectsFromImageFiles,
  getSupportedImageFilePaths,
  hasClipboardImage,
  writeImageFromClipboardToProjectFolder,
} from './CreateSpriteFromImage';
import {
  create3DModelObjectsFromGLBFiles,
  getSupported3DModelFilePaths,
} from './Create3DModelFromGLB';
import {
  changeViewPosition,
  registerCustomObjectDroppedInEmbeddedGameFrameCallback,
  register3DModelFilesDroppedInEmbeddedGameFrameCallback,
  setCameraState,
} from '../EmbeddedGame/EmbeddedGameFrame';
import Rectangle from '../Utils/Rectangle';
import { getContentAABB as getEditorContentAABB } from './GetContentAABB';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';
import { type WillDeleteObjectChanges } from '../EditorFunctions/OutsideEditorChanges';
import {
  type EventsBasedObjectChildrenEditedOptions,
  getImageResourceNamesForEditedObject,
  shouldResetObjectRendererForCustomObjectChildrenEdit,
} from './CustomObjectResourceReload';
import { type ObjectGroupEditorTab } from '../ObjectGroupEditor/EditedObjectGroupEditorDialog';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const path = optionalRequire('path');
const url = optionalRequire('url');

// The kind of the last selection whose properties are shown in the side panel.
// NOTE: Upstream imports this as `type LastSelectionType` from
// './EditorsDisplay.flow', but that (sibling) module does not currently export
// it, so the union is kept in sync locally here.
type LastSelectionType = 'instance' | 'object' | 'layer' | 'objectGroup';

type EmbeddedGameFrameDropPosition = {|
  x: number,
  y: number,
  z: number,
  layerName: string,
|};

const BASE_LAYER_NAME = '';
const INSTANCES_CLIPBOARD_KIND = 'Instances';

const isExternalResourceFile = (file: string): boolean =>
  file.indexOf('http://') === 0 ||
  file.indexOf('https://') === 0 ||
  file.indexOf('data:') === 0 ||
  file.indexOf('blob:') === 0 ||
  file.indexOf('file://') === 0;

const getLocalFileUrl = (absolutePath: string): string => {
  if (url && url.pathToFileURL)
    return url.pathToFileURL(absolutePath).toString();
  return `file:///${absolutePath.replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

const getRuntimeProjectResourceDataArray = (project: gdProject): Array<any> => {
  const serializedProject = serializeToJSObject(project);
  const resourceDataArray =
    serializedProject.resources &&
    Array.isArray(serializedProject.resources.resources)
      ? serializedProject.resources.resources
      : [];

  if (!path) return resourceDataArray;
  const projectFile = project.getProjectFile();
  const projectRootPath = projectFile ? path.dirname(projectFile) : null;
  if (!projectRootPath) return resourceDataArray;

  return resourceDataArray.map(resourceData => {
    const file = resourceData.file;
    if (typeof file !== 'string' || !file || isExternalResourceFile(file)) {
      return resourceData;
    }

    const absolutePath = path.isAbsolute(file)
      ? file
      : path.join(projectRootPath, file);
    return {
      ...resourceData,
      file: getLocalFileUrl(absolutePath),
    };
  });
};

const normalizeResourceFileIdentifier = (identifier: string): string =>
  identifier.replace(/\\/g, '/').toLowerCase();

const get3DModelResourceFileIdentifiers = ({
  project,
  objects,
}: {|
  project: gdProject,
  objects: Array<gdObject>,
|}): Array<string> => {
  const resourceFiles = [];
  const resourcesManager = project.getResourcesManager();

  objects.forEach(object => {
    if (object.getType() !== 'Scene3D::Model3DObject') return;

    const model3DConfiguration = gd.asModel3DConfiguration(
      object.getConfiguration()
    );
    const resourceName = model3DConfiguration.getModelResourceName();
    if (!resourceName || !resourcesManager.hasResource(resourceName)) return;

    const resourceFile = resourcesManager.getResource(resourceName).getFile();
    if (resourceFile) resourceFiles.push(resourceFile);
  });

  return resourceFiles;
};

const getTopLayerName = (
  layersContainer: gdLayersContainer,
  ignoredLayerName?: string
): string => {
  for (
    let layerIndex = layersContainer.getLayersCount() - 1;
    layerIndex >= 0;
    layerIndex--
  ) {
    const layerName = layersContainer.getLayerAt(layerIndex).getName();
    if (layerName !== ignoredLayerName) return layerName;
  }

  return BASE_LAYER_NAME;
};

const getInitialChosenLayer = (
  layersContainer: gdLayersContainer,
  initialSelectedLayer: string
): string => {
  if (
    initialSelectedLayer &&
    layersContainer.hasLayerNamed(initialSelectedLayer)
  ) {
    return initialSelectedLayer;
  }

  return getTopLayerName(layersContainer);
};

interface InstancePersistentUuidData {
  persistentUuid: string;
}

interface SelectedInstanceData {
  persistentUuid: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth?: number; // Not defined for 2D instances.
}

interface InstanceNumberProperty {
  name: string;
  value: number;
}
interface InstanceStringProperty {
  name: string;
  value: string;
}

interface InstanceData extends InstancePersistentUuidData {
  layer: string;
  locked?: boolean;
  sealed?: boolean;
  name: string;

  x: number;
  y: number;
  z?: number;

  angle: number;
  rotationX?: number;
  rotationY?: number;

  zOrder: number;
  opacity?: number;

  flippedX?: boolean;
  flippedY?: boolean;
  flippedZ?: boolean;

  customSize: boolean;
  width: number;
  height: number;
  depth?: number;

  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;

  numberProperties: InstanceNumberProperty[];
  stringProperties: InstanceStringProperty[];
  initialVariables: any[];
}

type InstanceChanges = {|
  isSendingBackSelectionForDefaultSize: boolean,
  updatedInstances: Array<InstanceData>,
  addedInstances: Array<InstanceData>,
  selectedInstances: Array<SelectedInstanceData>,
  removedInstances: Array<InstancePersistentUuidData>,
  objectNameToEdit: string | null,
|};

export type EditorId =
  | 'objects-list'
  | 'properties'
  | 'object-groups-list'
  | 'instances-list'
  | 'layers-list';

const PANEL_EDITOR_IDS: Array<EditorId> = [
  'objects-list',
  'object-groups-list',
  'properties',
  'instances-list',
  'layers-list',
];

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

type Props = {|
  editorId: string,
  gameEditorMode: 'embedded-game' | 'instances-editor',
  setGameEditorMode: ('embedded-game' | 'instances-editor') => void,
  onRestartInGameEditor: (reason: string) => void,
  showRestartInGameEditorAfterErrorButton: boolean,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  layout: gdLayout | null,
  externalLayout?: gdExternalLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant | null,

  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  layersContainer: gdLayersContainer,
  initialInstances: gdInitialInstancesContainer,

  getInitialInstancesEditorSettings: () => InstancesEditorSettings,

  onOpenMoreSettings?: ?() => void,
  onOpenEvents: (sceneName: string) => void,
  onObjectEdited: (
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) => void,
  onObjectGroupEdited: (objectGroupWithContext: GroupWithContext) => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject,
    options?: EventsBasedObjectChildrenEditedOptions
  ) => void,

  onObjectsDeleted: () => void,
  onObjectGroupsDeleted: () => void,

  setToolbar: (?React.Node) => void,
  resourceManagementProps: ResourceManagementProps,
  isActive: boolean,
  unsavedChanges?: ?UnsavedChanges,
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
  onExtractAsExternalLayout?: (name: string) => void,
  onExtractAsEventBasedObject: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onOpenPrefabDetailEditor: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject
  ) => void,
  onOpenPrefabSettings: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject
  ) => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onEffectAdded: () => void,
  onObjectListsModified: ({ isNewObjectTypeUsed: boolean }) => void,
  triggerHotReloadInGameEditorIfNeeded: () => void,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  previewDebuggerServer: ?PreviewDebuggerServer,
|};

type State = {|
  setupGridOpen: boolean,
  scenePropertiesDialogOpen: boolean,
  layersListOpen: boolean,
  onCloseLayerRemoveDialog: ?(
    doRemove: boolean,
    newLayer: string | null
  ) => void,
  layerRemoved: ?string,
  editedLayer: ?gdLayer,
  editedLayerInitialTab: 'properties' | 'effects',
  isAssetExporterDialogOpen: boolean,
  isAssetImporterDialogOpen: boolean,
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  variablesEditedInstance: ?gdInitialInstance,
  invisibleLayerOnWhichInstancesHaveJustBeenAdded: string | null,
  extractAsExternalLayoutDialogOpen: boolean,
  extractAsCustomObjectDialogOpen: boolean,
  newObjectDialogOpen: boolean,

  editedGroup: gdObjectGroup | null,
  isCreatingNewGroup: boolean,
  editedGroupInitialTab: ObjectGroupEditorTab | null,

  instancesEditorSettings: InstancesEditorSettings,
  history: HistoryState,

  layoutVariablesDialogOpen: boolean,
  showAdditionalWorkInfoBar: boolean,
  additionalWorkInfoBar: InfoBarDetails,

  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  chosenLayer: string,
  selectedLayer: gdLayer | null,
  selectedObjectGroup: gdObjectGroup | null,

  tileMapTileSelection: ?TileMapTileSelection,

  lastSelectionType: LastSelectionType,
|};

const getSceneEditorHistoryContext = (
  props: Props
): {| editor: string, subject?: string |} => {
  if (props.layout) {
    return {
      editor: 'Scene editor',
      subject: props.layout.getName(),
    };
  }
  if (props.externalLayout) {
    return {
      editor: 'External layout editor',
      subject: props.externalLayout.getName(),
    };
  }
  if (props.eventsBasedObjectVariant) {
    return {
      editor: 'Custom object variant editor',
      subject: props.eventsBasedObjectVariant.getName(),
    };
  }
  if (props.eventsBasedObject) {
    return {
      editor: 'Custom object editor',
      subject: props.eventsBasedObject.getName(),
    };
  }

  return {
    editor: 'Scene editor',
  };
};

const getInstanceOperationLabel = (verb: string, instancesCount: number) =>
  `${verb} ${instancesCount === 1 ? 'instance' : 'instances'}`;

const getMoveInstancesToLayerOperationLabel = (
  layerName: string,
  instancesCount: number
) =>
  `Move ${instancesCount === 1 ? 'instance' : 'instances'} to ${layerName ||
    'Base layer'}`;

type CopyCutPasteOptions = {|
  useLastCursorPosition?: boolean,
  pasteInTheForeground?: boolean,
|};

export type SceneEditorSelectionSnapshot = {|
  selectionProvider: 'SceneEditor',
  isActive: boolean,
  sceneName: string | null,
  externalLayoutName: string | null,
  eventsBasedObjectName: string | null,
  eventsBasedObjectVariantName: string | null,
  lastSelectionType: LastSelectionType,
  selectedLayerName: string | null,
  chosenLayerName: string,
  selectedObjectNames: Array<string>,
  selectedInstanceObjectNames: Array<string>,
  activeSelectedObjectNames: Array<string>,
  selectedObjects: Array<{|
    kind: 'object' | 'folder',
    name: string,
    global: boolean,
  |}>,
  selectedInstances: Array<{|
    id: string,
    objectName: string,
    layer: string,
    x: number,
    y: number,
    z: number,
    angle: number,
    zOrder: number,
    locked: boolean,
    sealed: boolean,
    hasCustomSize: boolean,
    customWidth: number | null,
    customHeight: number | null,
    hasCustomDepth: boolean,
    customDepth: number | null,
  |}>,
|};

const editSceneIconReactNode = <EditSceneIcon />;

export default class SceneEditor extends React.Component<Props, State> {
  instancesSelection: InstancesSelection;
  contextMenu: ?ContextMenuInterface;
  editorDisplay: ?SceneEditorsDisplayInterface;
  resourceExternallyChangedCallbackId: ?string;
  unregisterDebuggerCallback: (() => void) | null = null;
  unregister3DModelFilesDroppedInEmbeddedGameFrameCallback:
    | (() => void)
    | null = null;
  unregisterCustomObjectDroppedInEmbeddedGameFrameCallback:
    | (() => void)
    | null = null;
  editorViewPosition2D: EditorViewPosition2D = { viewX: null, viewY: null };
  _reloadResourcesCounter: number = 0;
  _ignoredResourceChangeIdentifiers: { [string]: number } = {};

  constructor(props: Props) {
    super(props);

    this.instancesSelection = new InstancesSelection();

    const initialInstancesEditorSettings = props.getInitialInstancesEditorSettings();

    this.state = {
      setupGridOpen: false,
      scenePropertiesDialogOpen: false,
      layersListOpen: false,
      onCloseLayerRemoveDialog: null,
      layerRemoved: null,
      editedLayer: null,
      editedLayerInitialTab: 'properties',
      isAssetExporterDialogOpen: false,
      isAssetImporterDialogOpen: false,
      editedObjectWithContext: null,
      editedObjectInitialTab: 'properties',
      variablesEditedInstance: null,
      editedGroup: null,
      isCreatingNewGroup: false,
      editedGroupInitialTab: null,
      extractAsExternalLayoutDialogOpen: false,
      extractAsCustomObjectDialogOpen: false,
      newObjectDialogOpen: false,

      instancesEditorSettings: initialInstancesEditorSettings,
      history: getHistoryInitialState(props.initialInstances, {
        historyMaxSize: 50,
        historyContext: getSceneEditorHistoryContext(props),
      }),

      layoutVariablesDialogOpen: false,

      showAdditionalWorkInfoBar: false,
      additionalWorkInfoBar: {
        identifier: 'default-additional-work',
        message: '',
        touchScreenMessage: '',
      },
      tileMapTileSelection: null,

      selectedObjectFolderOrObjectsWithContext: [],
      chosenLayer: getInitialChosenLayer(
        props.layersContainer,
        initialInstancesEditorSettings.selectedLayer
      ),
      selectedLayer: null,
      selectedObjectGroup: null,
      invisibleLayerOnWhichInstancesHaveJustBeenAdded: null,

      lastSelectionType: 'instance',
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.history !== prevState.history)
      if (this.props.unsavedChanges)
        this.props.unsavedChanges.triggerUnsavedChanges();

    this._sync3DModelFilesDroppedInEmbeddedGameFrameCallback();
    this._syncCustomObjectDroppedInEmbeddedGameFrameCallback();
  }

  componentDidMount() {
    // Sync the saved gameEditorMode from instancesEditorSettings to MainFrame.
    if (
      this.props.isActive &&
      this.state.instancesEditorSettings.gameEditorMode
    ) {
      this.props.setGameEditorMode(
        this.state.instancesEditorSettings.gameEditorMode
      );
    }

    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
    if (this.props.previewDebuggerServer && !this.unregisterDebuggerCallback) {
      this.unregisterDebuggerCallback = this.props.previewDebuggerServer.registerCallbacks(
        {
          onErrorReceived: () => {},
          onConnectionClosed: () => {},
          onConnectionOpened: () => {},
          onConnectionErrored: () => {},
          onServerStateChanged: () => {},
          onHandleParsedMessage: ({ id, parsedMessage }) => {
            if (parsedMessage.editorId !== this.props.editorId) {
              return; // Message is not for this editor - ignore it.
            }

            if (parsedMessage.command === 'notifyGraphicsContextLost') {
              // Even if the in0game editor is not visible, a lost context needs
              // to have the in-game editor restarted as it is impossible to use for the user.
              console.info(
                'Embedded game frame notified the graphics context was lost, restarting the editor...'
              );
              this.props.onRestartInGameEditor(
                'relaunched-because-graphics-context-lost'
              );
            }

            // The rest of the messages are only relevant when the embedded game editor is visible.
            if (this.props.gameEditorMode !== 'embedded-game') {
              return;
            }
            if (parsedMessage.command === 'updateInstances') {
              this.onReceiveInstanceChanges(parsedMessage.payload);
            } else if (parsedMessage.command === 'setCameraState') {
              setCameraState(parsedMessage.editorId, parsedMessage.payload);
            } else if (parsedMessage.command === 'openContextMenu') {
              this._onContextMenu(
                parsedMessage.payload.cursorX,
                parsedMessage.payload.cursorY
              );
            } else if (parsedMessage.command === 'undo') {
              if (canUndo(this.state.history)) {
                this.undo();
              }
            } else if (parsedMessage.command === 'redo') {
              if (canRedo(this.state.history)) {
                this.redo();
              }
            } else if (parsedMessage.command === 'copy') {
              this.copySelection();
            } else if (parsedMessage.command === 'paste') {
              this.paste();
            } else if (parsedMessage.command === 'cut') {
              this.cutSelection();
            }
          },
        }
      );
    }
    this._sync3DModelFilesDroppedInEmbeddedGameFrameCallback();
    this._syncCustomObjectDroppedInEmbeddedGameFrameCallback();
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
    if (this.unregisterDebuggerCallback) {
      this.unregisterDebuggerCallback();
      this.unregisterDebuggerCallback = null;
    }
    if (this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback) {
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback();
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback = null;
    }
    if (this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback) {
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback();
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback = null;
    }
  }

  _sync3DModelFilesDroppedInEmbeddedGameFrameCallback = () => {
    const shouldRegister =
      this.props.isActive && this.props.gameEditorMode === 'embedded-game';

    if (
      shouldRegister &&
      !this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback
    ) {
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback = register3DModelFilesDroppedInEmbeddedGameFrameCallback(
        this._on3DModelFilesDroppedInEmbeddedGameFrame
      );
    } else if (
      !shouldRegister &&
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback
    ) {
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback();
      this.unregister3DModelFilesDroppedInEmbeddedGameFrameCallback = null;
    }
  };

  _syncCustomObjectDroppedInEmbeddedGameFrameCallback = () => {
    const shouldRegister =
      this.props.isActive && this.props.gameEditorMode === 'embedded-game';

    if (
      shouldRegister &&
      !this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback
    ) {
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback = registerCustomObjectDroppedInEmbeddedGameFrameCallback(
        this._onCustomObjectDroppedInEmbeddedGameFrame
      );
    } else if (
      !shouldRegister &&
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback
    ) {
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback();
      this.unregisterCustomObjectDroppedInEmbeddedGameFrameCallback = null;
    }
  };

  onEditorReloaded() {
    this._sendSelectedInstances();
  }

  getInstancesEditorSettings(): any {
    return this.state.instancesEditorSettings;
  }

  getEditorSelectionSnapshot(): SceneEditorSelectionSnapshot {
    const selectedObjects: Array<{|
      kind: 'object' | 'folder',
      name: string,
      global: boolean,
    |}> = this.state.selectedObjectFolderOrObjectsWithContext.map(
      objectFolderOrObjectWithContext => {
        const {
          objectFolderOrObject,
          global,
        } = objectFolderOrObjectWithContext;
        const kind: 'object' | 'folder' = objectFolderOrObject.isFolder()
          ? 'folder'
          : 'object';
        return {
          kind,
          name: getObjectFolderOrObjectUnifiedName(objectFolderOrObject),
          global,
        };
      }
    );
    const selectedObjectNames = selectedObjects
      .filter(selectedObject => selectedObject.kind === 'object')
      .map(selectedObject => selectedObject.name);
    const selectedInstances = this.instancesSelection
      .getSelectedInstances()
      .map(instance => ({
        id: instance.getPersistentUuid().slice(0, 10),
        objectName: instance.getObjectName(),
        layer: instance.getLayer(),
        x: instance.getX(),
        y: instance.getY(),
        z: instance.getZ(),
        angle: instance.getAngle(),
        zOrder: instance.getZOrder(),
        locked: instance.isLocked(),
        sealed: instance.isSealed(),
        hasCustomSize: instance.hasCustomSize(),
        customWidth: instance.hasCustomSize()
          ? instance.getCustomWidth()
          : null,
        customHeight: instance.hasCustomSize()
          ? instance.getCustomHeight()
          : null,
        hasCustomDepth: instance.hasCustomDepth(),
        customDepth: instance.hasCustomDepth()
          ? instance.getCustomDepth()
          : null,
      }));
    const selectedInstanceObjectNames = uniq(
      selectedInstances.map(instance => instance.objectName)
    );

    return {
      selectionProvider: 'SceneEditor',
      isActive: this.props.isActive,
      sceneName: this.props.layout ? this.props.layout.getName() : null,
      externalLayoutName: this.props.externalLayout
        ? this.props.externalLayout.getName()
        : null,
      eventsBasedObjectName: this.props.eventsBasedObject
        ? this.props.eventsBasedObject.getName()
        : null,
      eventsBasedObjectVariantName: this.props.eventsBasedObjectVariant
        ? this.props.eventsBasedObjectVariant.getName()
        : null,
      lastSelectionType: this.state.lastSelectionType,
      selectedLayerName: this.state.selectedLayer
        ? this.state.selectedLayer.getName()
        : null,
      chosenLayerName: this.state.chosenLayer,
      selectedObjectNames,
      selectedInstanceObjectNames,
      activeSelectedObjectNames:
        this.state.lastSelectionType === 'instance'
          ? selectedInstanceObjectNames
          : selectedObjectNames,
      selectedObjects,
      selectedInstances,
    };
  }

  onReceiveInstanceChanges(changes: InstanceChanges) {
    // TODO: adapt all of this to get all instances in one shot.
    // and reorganize this.
    const modifiedInstances: gdInitialInstance[] = [];
    changes.updatedInstances.forEach(instanceData => {
      const {
        persistentUuid,
        x,
        y,
        z,
        angle,
        rotationY,
        rotationX,
        customSize,
        width,
        height,
        depth,
        defaultWidth,
        defaultHeight,
        defaultDepth,
      } = instanceData;
      const instance = getInstanceInLayoutWithPersistentUuid(
        this.props.initialInstances,
        persistentUuid
      );
      if (!instance) return;

      instance.setX(x);
      instance.setY(y);
      if (z !== undefined && Number.isFinite(z)) {
        instance.setZ(z);
      }
      instance.setAngle(angle);
      if (rotationY !== undefined && Number.isFinite(rotationY)) {
        instance.setRotationY(rotationY);
      }
      if (rotationX !== undefined && Number.isFinite(rotationX)) {
        instance.setRotationX(rotationX);
      }
      instance.setHasCustomSize(customSize);
      if (customSize) {
        instance.setCustomWidth(width || 0);
        instance.setCustomHeight(height || 0);
      }
      const hasCustomDepth = Number.isFinite(depth);
      instance.setHasCustomDepth(hasCustomDepth);
      if (hasCustomDepth && depth !== undefined && Number.isFinite(depth)) {
        instance.setCustomDepth(depth);
      }
      instance.setDefaultWidth(defaultWidth || 0);
      instance.setDefaultHeight(defaultHeight || 0);
      instance.setDefaultDepth(defaultDepth || 0);

      modifiedInstances.push(instance);
    });
    if (modifiedInstances.length > 0) {
      this._onInstancesMoved(modifiedInstances);
    }

    const newlySelectedInstances = changes.selectedInstances
      .map(selectedInstanceData => {
        const {
          persistentUuid,
          defaultWidth,
          defaultHeight,
          defaultDepth,
        } = selectedInstanceData;
        const instance = getInstanceInLayoutWithPersistentUuid(
          this.props.initialInstances,
          persistentUuid
        );
        if (instance) {
          instance.setDefaultWidth(defaultWidth);
          instance.setDefaultHeight(defaultHeight);
          instance.setDefaultDepth(defaultDepth || 0);
        }
        return instance || null;
      })
      .filter(Boolean);

    const justRemovedInstances = changes.removedInstances
      .map(removedInstanceData => {
        const { persistentUuid } = removedInstanceData;
        const instance = getInstanceInLayoutWithPersistentUuid(
          this.props.initialInstances,
          persistentUuid
        );
        return instance || null;
      })
      .filter(Boolean);

    if (justRemovedInstances.length) {
      // Make sure no deleted instance stays selected.
      this.instancesSelection.selectInstances({
        instances: [],
        layersLocks: null,
        multiSelect: false,
      });

      // Immediately update the properties editor to ensure they keep no reference
      // to the deleted instances.
      this.forceUpdatePropertiesEditor();

      justRemovedInstances.forEach(instance => {
        this.props.initialInstances.removeInstance(instance);
      });

      this.setState(
        {
          selectedObjectFolderOrObjectsWithContext: [],
          history: saveToHistory(
            this.state.history,
            this.props.initialInstances,
            'DELETE',
            {
              operationLabel: getInstanceOperationLabel(
                'Delete',
                justRemovedInstances.length
              ),
            }
          ),
        },
        () => {
          this.updateToolbar();
        }
      );
    }

    const justAddedInstances = changes.addedInstances.map(addedInstance => {
      const instance: gdInitialInstance = this.props.initialInstances.insertNewInitialInstance();
      unserializeFromJSObject(
        instance,
        addedInstance,
        'unserializeFrom',
        this.props.project
      );
      return instance;
    });
    if (justAddedInstances.length) {
      this._onInstancesAdded(justAddedInstances);
    }

    if (!changes.isSendingBackSelectionForDefaultSize) {
      this.instancesSelection.selectInstances({
        instances: newlySelectedInstances,
        multiSelect: false,
        layersLocks: null,
        ignoreSeal: true,
      });
      this._selectObjectOfInstances(newlySelectedInstances);
    }

    if (changes.objectNameToEdit) {
      this.editObjectInPropertiesPanel(changes.objectNameToEdit);
    }
  }

  // A human-readable name of the edited scene / external layout / custom object
  // variant, used to make resource reload logs easier to audit.
  _getReloadContextName = (): string => {
    const {
      layout,
      externalLayout,
      eventsFunctionsExtension,
      eventsBasedObject,
      eventsBasedObjectVariant,
    } = this.props;
    return externalLayout
      ? externalLayout.getName()
      : layout
      ? layout.getName()
      : [eventsFunctionsExtension, eventsBasedObject, eventsBasedObjectVariant]
          .filter(Boolean)
          .map(item => item.getName())
          .join(' > ');
  };

  _reloadResources = async (
    resourceNames: string[],
    reason: string,
    { reloadFromDisk = true }: {| reloadFromDisk?: boolean |} = {}
  ) => {
    const { project } = this.props;
    const { editorDisplay } = this;

    const name = this._getReloadContextName();

    if (!editorDisplay) return;

    // Use a unique reason for each reload to avoid concurrent calls resuming rendering too early.
    const pauseReason = `resource-reload-${++this._reloadResourcesCounter}`;

    try {
      console.info(
        reloadFromDisk && resourceNames.length > 0
          ? `Reloading ${
              resourceNames.length
            } resource(s) from disk for "${name}" (reason: ${reason}): ${resourceNames.join(
              ', '
            )}.`
          : `Refreshing "${name}" renderers without reloading resources from disk (reason: ${reason}).`
      );

      // When reloading textures, there can be a short time during which
      // the existing texture is removed but the InstancesEditor tries to use it
      // through the RenderedInstance's, triggering crashes. So the scene rendering
      // is paused during this period.
      editorDisplay.startSceneRendering(false, pauseReason);
      // Reloading textures from the disk is only necessary when a resource file
      // actually changed (e.g. an image edited in an external editor). Otherwise
      // we only need to reset the renderers below so they pick up the new object
      // configuration - reloading every texture from the disk would be needlessly
      // slow (especially for custom objects using a lot of resources).
      if (reloadFromDisk) {
        for (const resourceName of resourceNames) {
          await PixiResourcesLoader.reloadResource(project, resourceName);
        }
      }

      editorDisplay.forceUpdateObjectsList();

      // Find all the objects using the resources that were reloaded.
      const objectNames = new Set<string>();
      for (const resourceName of resourceNames) {
        const objectsCollector = new gd.ObjectsUsingResourceCollector(
          project.getResourcesManager(),
          resourceName
        );
        // $FlowIgnore - Flow does not know ObjectsUsingResourceCollector inherits from ArbitraryObjectsWorker
        // $FlowFixMe[incompatible-type]
        gd.ProjectBrowserHelper.exposeProjectObjects(project, objectsCollector);
        objectsCollector
          .getObjectNames()
          .toJSArray()
          .forEach(objectName => {
            objectNames.add(objectName);
          });
        objectsCollector.delete();
      }
      ObjectsRenderingService.renderersCacheClearingMethods.forEach(clear =>
        clear(project)
      );

      if (objectNames.size > 0) {
        console.info(
          `Resetting renderers of object(s) directly using these resources in "${name}": ${[
            ...objectNames,
          ].join(', ')}.`
        );
      }
      objectNames.forEach(objectName => {
        editorDisplay.instancesHandlers.resetInstanceRenderersFor(objectName);
      });
    } finally {
      editorDisplay.startSceneRendering(true, pauseReason);
    }
  };

  onResourceExternallyChanged = async (resourceInfo: {|
    identifier: string,
  |}) => {
    const { project } = this.props;

    if (this._shouldIgnoreResourceExternalChange(resourceInfo.identifier)) {
      console.info(
        `Ignoring resource watcher event for "${
          resourceInfo.identifier
        }" because it was just imported into the 3D editor.`
      );
      return;
    }

    const resourceNames = project
      .getResourcesManager()
      .getResourceNamesWithFile(resourceInfo.identifier)
      .toJSArray();
    if (resourceNames.length === 0) {
      console.warn(
        `A resource with file "${
          resourceInfo.identifier
        }" was changed, but no resource(s) with this file were found.`
      );
      return;
    }

    await this._reloadResources(resourceNames, 'resource file changed');
  };

  _ignoreResourceExternalChangesForFiles = (resourceFiles: Array<string>) => {
    const expiresAt = Date.now() + 5000;
    resourceFiles.forEach(resourceFile => {
      this._ignoredResourceChangeIdentifiers[
        normalizeResourceFileIdentifier(resourceFile)
      ] = expiresAt;
    });
  };

  _shouldIgnoreResourceExternalChange = (identifier: string): boolean => {
    const normalizedIdentifier = normalizeResourceFileIdentifier(identifier);
    const expiresAt = this._ignoredResourceChangeIdentifiers[
      normalizedIdentifier
    ];
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      delete this._ignoredResourceChangeIdentifiers[normalizedIdentifier];
      return false;
    }

    return true;
  };

  onInstancesModifiedOutsideEditor = () => {
    // /!\ Drop the selection to avoid keeping any references to deleted instances.
    // This could be avoided if the selection used something like UUID to address instances.
    this.instancesSelection.clearSelection();

    // /!\ Force the instances editor to destroy and mount again the
    // renderers to avoid keeping any references to existing instances
    if (this.editorDisplay)
      this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
    this.updateToolbar();

    this._sendHotReloadAllInstances();
  };

  onObjectsModifiedOutsideEditor = () => {
    // Force refresh of the objects list.
    this.forceUpdateObjectsList();
  };

  onWillDeleteObject = (changes: WillDeleteObjectChanges) => {
    // Called before the object is actually deleted, so it's still safe to
    // read `editedObjectWithContext.object` here.
    const { editedObjectWithContext } = this.state;
    if (
      editedObjectWithContext &&
      editedObjectWithContext.object.getName() === changes.objectName
    ) {
      this.editObject(null);
    }

    // Clear the objects-list selection now, before actually deleting the
    // object, to prevent any stale reference in a re-render after deletion
    // (exact same fix and rationale as the manual delete flow's
    // `_onDeleteObjects`).
    this.setState({ selectedObjectFolderOrObjectsWithContext: [] });

    // Drop only the selected instances of this object (mirrors the manual
    // delete flow, which does the same before removing the object), rather
    // than waiting for the `onInstancesModifiedOutsideEditor` call that
    // follows the actual removal and would clear the whole selection.
    this.instancesSelection.unselectInstancesOfObject(changes.objectName);
  };

  onObjectGroupsModifiedOutsideEditor = () => {
    // /!\ Drop the group selection to avoid keeping any reference to a group
    // that could have been deleted or re-created in memory.
    if (this.state.selectedObjectGroup) {
      this.setState({ selectedObjectGroup: null });
    }

    // Force refresh of the object groups list.
    this.forceUpdateObjectGroupsList();
  };

  _canAddObject = (): boolean => {
    const { eventsBasedObject, eventsBasedObjectVariant } = this.props;
    return (
      !eventsBasedObject ||
      eventsBasedObject.getDefaultVariant() === eventsBasedObjectVariant
    );
  };

  updateToolbar = () => {
    const { editorDisplay } = this;
    const { eventsBasedObject, layout } = this.props;
    if (!editorDisplay) return;

    const canOpenEvents = !!layout || !!eventsBasedObject;
    const canAddObject = this._canAddObject();
    const openEventsTooltip = eventsBasedObject
      ? t`Open object events`
      : t`Open scene events`;

    if (editorDisplay.getName() === 'mosaic') {
      this.props.setToolbar(
        <SplitEditorToolbar
          leadingToolbar={null}
          trailingToolbar={
            <MosaicEditorsDisplayToolbar
              gameEditorMode={this.state.instancesEditorSettings.gameEditorMode}
              setGameEditorMode={this.setGameEditorMode}
              onAddObject={this._openNewObjectDialog}
              canAddObject={canAddObject}
              selectedInstancesCount={
                this.instancesSelection.getSelectedInstances().length
              }
              toggleObjectsList={this.toggleObjectsList}
              toggleObjectGroupsList={this.toggleObjectGroupsList}
              toggleProperties={this.toggleProperties}
              deleteSelection={this.deleteSelection}
              toggleInstancesList={this.toggleInstancesList}
              toggleLayersList={this.toggleLayersList}
              toggleAllPanels={this.toggleAllPanels}
              areAllPanelsShown={PANEL_EDITOR_IDS.every(editorId =>
                editorDisplay.isEditorVisible(editorId)
              )}
              toggleWindowMask={this.toggleWindowMask}
              isWindowMaskShown={
                !!this.state.instancesEditorSettings.windowMask
              }
              toggleGrid={this.toggleGrid}
              isGridShown={!!this.state.instancesEditorSettings.grid}
              openSetupGrid={this.openSetupGrid}
              canUndo={canUndo(this.state.history)}
              canRedo={canRedo(this.state.history)}
              undo={this.undo}
              redo={this.redo}
              onOpenEvents={canOpenEvents ? this.openEvents : null}
              openEventsTooltip={openEventsTooltip}
              onOpenSettings={this.openSceneProperties}
              settingsIcon={editSceneIconReactNode}
              onOpenSceneVariables={this.openSceneVariables}
            />
          }
        />
      );
    } else {
      this.props.setToolbar(
        <SwipeableDrawerEditorsDisplayToolbar
          gameEditorMode={this.props.gameEditorMode}
          setGameEditorMode={this.props.setGameEditorMode}
          onAddObject={this._openNewObjectDialog}
          canAddObject={canAddObject}
          selectedInstancesCount={
            this.instancesSelection.getSelectedInstances().length
          }
          toggleObjectsList={this.toggleObjectsList}
          toggleObjectGroupsList={this.toggleObjectGroupsList}
          toggleProperties={this.toggleProperties}
          deleteSelection={this.deleteSelection}
          toggleInstancesList={this.toggleInstancesList}
          toggleLayersList={this.toggleLayersList}
          toggleAllPanels={this.toggleAllPanels}
          toggleWindowMask={this.toggleWindowMask}
          isWindowMaskShown={!!this.state.instancesEditorSettings.windowMask}
          toggleGrid={this.toggleGrid}
          isGridShown={!!this.state.instancesEditorSettings.grid}
          openSetupGrid={this.openSetupGrid}
          setZoomFactor={this.setZoomFactor}
          getContextMenuZoomItems={this.getContextMenuZoomItems}
          canUndo={canUndo(this.state.history)}
          canRedo={canRedo(this.state.history)}
          undo={this.undo}
          redo={this.redo}
          onOpenEvents={canOpenEvents ? this.openEvents : null}
          openEventsTooltip={openEventsTooltip}
          onOpenSettings={this.openSceneProperties}
          settingsIcon={editSceneIconReactNode}
          onOpenSceneVariables={this.openSceneVariables}
        />
      );
    }
  };

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project
    ) {
      this.instancesSelection.clearSelection();
      this.openSetupGrid(false);
      this.editInstanceVariables(null);
      this.openSceneProperties(false);
    }
    if (!this.props.isActive && nextProps.isActive) {
      // Sync the saved gameEditorMode from instancesEditorSettings to mainframe
      // when the editor becomes active again
      if (this.state.instancesEditorSettings.gameEditorMode) {
        this.props.setGameEditorMode(
          this.state.instancesEditorSettings.gameEditorMode
        );
      }

      // When the scene is refocused, the selections are cleaned
      // to avoid cases where we hold references to instances or objects
      // deleted by something outside of the scene (for example,
      // a global object deleted in another scene).
      this.instancesSelection.cleanNonExistingInstances(
        this.props.initialInstances
      );
      this.setState(({ selectedObjectFolderOrObjectsWithContext }) => ({
        selectedObjectFolderOrObjectsWithContext: cleanNonExistingObjectFolderOrObjectWithContexts(
          this.props.globalObjectsContainer,
          this.props.objectsContainer,
          selectedObjectFolderOrObjectsWithContext
        ),
      }));
    }
  }

  toggleObjectsList = () => {
    if (!this.editorDisplay) return;
    this.editorDisplay.toggleEditorView('objects-list');
  };

  toggleProperties = () => {
    if (!this.editorDisplay) return;
    this.editorDisplay.toggleEditorView('properties');
  };

  toggleObjectGroupsList = () => {
    if (!this.editorDisplay) return;
    this.editorDisplay.toggleEditorView('object-groups-list');
  };

  toggleInstancesList = () => {
    if (!this.editorDisplay) return;
    this.editorDisplay.toggleEditorView('instances-list');
  };

  toggleLayersList = () => {
    if (!this.editorDisplay) return;
    this.editorDisplay.toggleEditorView('layers-list');
  };

  toggleAllPanels = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) return;
    editorDisplay.viewControls.keepCanvasTopCenterScreenCoordinatesOnNextResize();
    const shouldShowAllPanels = PANEL_EDITOR_IDS.some(
      editorId => !editorDisplay.isEditorVisible(editorId)
    );
    editorDisplay.setEditorViewsVisibility(
      PANEL_EDITOR_IDS.map(editorId => ({
        editorId,
        visible: shouldShowAllPanels,
      }))
    );
  };

  ensureEditorPanelVisible = (editorId: EditorId) => {
    if (!this.editorDisplay) return;
    this.editorDisplay.ensureEditorVisible(editorId);
  };

  toggleWindowMask = () => {
    this.setInstancesEditorSettings({
      ...this.state.instancesEditorSettings,
      windowMask: !this.state.instancesEditorSettings.windowMask,
    });
  };

  toggleGrid = () => {
    this.setInstancesEditorSettings({
      ...this.state.instancesEditorSettings,
      grid: !this.state.instancesEditorSettings.grid,
      snap: !this.state.instancesEditorSettings.grid,
    });
  };

  setGameEditorMode = (newMode: 'instances-editor' | 'embedded-game') => {
    this.setInstancesEditorSettings({
      ...this.state.instancesEditorSettings,
      gameEditorMode: newMode,
    });

    // Call the setGameEditorMode from mainframe so it can make some global changes. (ex: hot reload)
    this.props.setGameEditorMode(newMode);
  };

  openSetupGrid = (open: boolean = true) => {
    this.setState({ setupGridOpen: open });
  };

  openSceneProperties = (open: boolean = true) => {
    this.setState({ scenePropertiesDialogOpen: open });
  };

  openEvents = () => {
    const { eventsBasedObject, layout } = this.props;
    if (!layout && !eventsBasedObject) return;

    this.props.onOpenEvents(layout ? layout.getName() : '');
  };

  openObjectEditor = () => {
    if (!this.instancesSelection.hasSelectedInstances()) {
      return;
    }
    const selectedInstanceObjectName = this.instancesSelection
      .getSelectedInstances()[0]
      .getObjectName();
    this.editObjectByName({
      objectName: selectedInstanceObjectName,
      initialTab: 'properties',
      shouldSelectTheObject: false,
    });
  };

  editLayerEffects = (layer: ?gdLayer) => {
    this.setState({ editedLayer: layer, editedLayerInitialTab: 'effects' });
  };

  editLayer = (layer: ?gdLayer) => {
    this.setState({ editedLayer: layer, editedLayerInitialTab: 'properties' });
  };

  editInstanceVariables = (instance: ?gdInitialInstance) => {
    this.setState({ variablesEditedInstance: instance });
  };

  openSceneVariables = (open: boolean = true) => {
    this.setState({ layoutVariablesDialogOpen: open });
  };

  editObject = (
    editedObject: ?gdObject,
    initialTab: ?ObjectEditorTab,
    callback?: () => void
  ) => {
    const { project } = this.props;
    if (editedObject) {
      this.setState(
        {
          editedObjectWithContext: {
            object: editedObject,
            global: project.getObjects().hasObjectNamed(editedObject.getName()),
          },
          editedObjectInitialTab: initialTab || 'properties',
        },
        callback
      );
    } else {
      this.setState(
        {
          editedObjectWithContext: null,
          editedObjectInitialTab: 'properties',
        },
        callback
      );
    }
  };

  isEditingObject = (): boolean => {
    return !!this.state.editedObjectWithContext;
  };

  openObjectExporterDialog = (open: boolean = true) => {
    this.setState({
      isAssetExporterDialogOpen: open,
    });
  };

  openObjectImporterDialog = (open: boolean = true) => {
    this.setState({
      isAssetImporterDialogOpen: open,
    });
  };

  editObjectByName = ({
    objectName,
    initialTab,
    shouldSelectTheObject,
  }: {
    objectName: string,
    initialTab: ObjectEditorTab,
    shouldSelectTheObject: boolean,
  }) => {
    const { globalObjectsContainer, objectsContainer } = this.props;
    let global = false;
    let container = null;
    if (objectsContainer.hasObjectNamed(objectName)) {
      container = objectsContainer;
    } else if (
      globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName)
    ) {
      global = true;
      container = globalObjectsContainer;
    } else {
      return;
    }
    this.editObject(container.getObject(objectName), initialTab);
    if (shouldSelectTheObject) {
      this._onObjectFolderOrObjectWithContextSelected({
        objectFolderOrObject: container
          .getRootFolder()
          .getObjectNamed(objectName),
        global,
      });
    }
  };

  editObjectInPropertiesPanel = (objectName: string) => {
    const objectFolderOrObjectWithContext = getObjectFolderOrObjectWithContextFromObjectName(
      this.props.globalObjectsContainer,
      this.props.objectsContainer,
      objectName
    );
    if (!objectFolderOrObjectWithContext) return;

    this.setState({
      selectedObjectFolderOrObjectsWithContext: [
        objectFolderOrObjectWithContext,
      ],
      selectedLayer: null,
      selectedObjectGroup: null,
      lastSelectionType: 'object',
    });
    if (this.editorDisplay)
      this.editorDisplay.ensureEditorVisible('properties');
  };

  _editObjectGroup = (
    group: gdObjectGroup,
    initialTab: ?ObjectGroupEditorTab
  ) => {
    this.setState({
      editedGroup: group,
      editedGroupInitialTab: initialTab || null,
      isCreatingNewGroup: false,
    });
  };

  _isObjectGroupGlobal = (group: gdObjectGroup): boolean => {
    const { globalObjectsContainer } = this.props;
    return (
      !!globalObjectsContainer &&
      globalObjectsContainer.getObjectGroups().has(group.getName())
    );
  };

  _createObjectGroup = () => {
    this.setState({ editedGroup: null, isCreatingNewGroup: true });
  };

  _closeObjectGroupEditorDialog = () => {
    if (this.state.editedGroup) {
      this.props.onObjectGroupEdited({
        group: this.state.editedGroup,
        global: this._isObjectGroupGlobal(this.state.editedGroup),
      });
    }
    this.setState({ editedGroup: null, isCreatingNewGroup: false });
  };

  setInstancesEditorSettings = (
    instancesEditorSettings: InstancesEditorSettings
  ) => {
    this.setState(
      {
        instancesEditorSettings,
      },
      () => {
        this.updateToolbar();
      }
    );
    const { previewDebuggerServer } = this.props;
    if (!previewDebuggerServer) return;

    previewDebuggerServer
      .getExistingEmbeddedGameFrameDebuggerIds()
      .forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'setInstancesEditorSettings',
          payload: {
            instancesEditorSettings,
          },
        });
      });
  };

  /**
   * Debounced version of `setInstancesEditorSettings` to be called when the
   * settings have been mutated. The `InstancesEditor` can mutate these settings
   * very quickly (the zoom factor changes 60 times per second when the user does a
   * "pinch to zoom"). In this case, we don't want to have the React updates to be a
   * bottleneck. We let the mutations be done and trigger an update only when the user
   * is done.
   */
  // $FlowFixMe[missing-local-annot]
  _onInstancesEditorSettingsMutated = (debounce(
    (instancesEditorSettings: InstancesEditorSettings) => {
      this.setInstancesEditorSettings(instancesEditorSettings);
    },
    1000,
    { leading: false, trailing: true }
  ): any);

  undo = () => {
    // /!\ Drop the selection to avoid keeping any references to deleted instances.
    // This could be avoided if the selection used something like UUID to address instances.
    this.instancesSelection.clearSelection();
    this.setState(
      {
        history: undo(
          this.state.history,
          this.props.initialInstances,
          this.props.project
        ),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        if (this.editorDisplay)
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
        this.updateToolbar();
        this._sendHotReloadAllInstances();
      }
    );
  };

  redo = () => {
    // /!\ Drop the selection to avoid keeping any references to deleted instances.
    // This could be avoided if the selection used something like UUID to address instances.
    this.instancesSelection.clearSelection();
    this.setState(
      {
        history: redo(
          this.state.history,
          this.props.initialInstances,
          this.props.project
        ),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        if (this.editorDisplay)
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
        this.updateToolbar();
        this._sendHotReloadAllInstances();
      }
    );
  };

  _sendHotReloadAllInstances = () => {
    const { previewDebuggerServer } = this.props;
    if (!previewDebuggerServer) return;

    const instances = serializeToJSObject(this.props.initialInstances);

    previewDebuggerServer
      .getExistingEmbeddedGameFrameDebuggerIds()
      .forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'hotReloadAllInstances',
          payload: {
            instances,
          },
        });
      });
  };

  _onObjectFolderOrObjectWithContextSelected = (
    objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext = null
  ) => {
    const selectedObjectFolderOrObjectsWithContext = [];
    const objectFolderOrObject = objectFolderOrObjectWithContext
      ? exceptionallyGuardAgainstDeadObject(
          objectFolderOrObjectWithContext.objectFolderOrObject
        )
      : null;

    const instancesToSelect =
      objectFolderOrObject && !objectFolderOrObject.isFolder()
        ? getInstancesInLayoutForObject(
            this.props.initialInstances,
            objectFolderOrObject.getObject().getName()
          )
        : [];
    this.instancesSelection.selectInstances({
      instances: instancesToSelect,
      multiSelect: false,
      layersLocks: null,
      ignoreSeal: true,
    });
    this._sendSelectedInstances();

    if (objectFolderOrObjectWithContext && objectFolderOrObject) {
      selectedObjectFolderOrObjectsWithContext.push({
        ...objectFolderOrObjectWithContext,
        objectFolderOrObject,
      });
    }

    this.setState(
      {
        lastSelectionType: 'object',
        selectedObjectFolderOrObjectsWithContext,
        selectedLayer: null,
        selectedObjectGroup: null,
      },
      () => {
        this.forceUpdateInstancesList();
        // We update the toolbar because we need to update the objects selected
        // (for the rename shortcut)
        this.updateToolbar();
      }
    );
  };

  _createNewObjectAndInstanceUnderCursor = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) {
      return;
    }

    const { viewControls } = editorDisplay;
    editorDisplay.openNewObjectDialog({
      instanceSceneCoordinates: viewControls.getLastCursorSceneCoordinates(),
    });
  };

  _openNewObjectDialog = () => {
    if (!this._canAddObject()) {
      return;
    }

    this.setState({ newObjectDialogOpen: true });
  };

  _addObjectFromNewObjectDialog = (objectType: string) => {
    const { project, objectsContainer, globalObjectsContainer } = this.props;

    const defaultName = project.hasEventsBasedObject(objectType)
      ? 'New' +
        (project.getEventsBasedObject(objectType).getDefaultName() ||
          project.getEventsBasedObject(objectType).getName())
      : // $FlowFixMe[invalid-computed-prop]
        objectTypeToDefaultName[objectType] || 'NewObject';
    const name = newNameGenerator(
      defaultName,
      name =>
        objectsContainer.hasObjectNamed(name) ||
        (!!globalObjectsContainer &&
          globalObjectsContainer.hasObjectNamed(name))
    );

    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      project,
      objectType
    );

    const object = objectsContainer.insertNewObject(
      project,
      objectType,
      name,
      objectsContainer.getObjectsCount()
    );
    const objectFolderOrObjectWithContext = {
      objectFolderOrObject: objectsContainer
        .getRootFolder()
        .getObjectChild(name),
      global: false,
    };

    this.setState({ newObjectDialogOpen: false });
    this.editObject(object, 'properties');
    this._onObjectFolderOrObjectWithContextSelected(
      objectFolderOrObjectWithContext
    );
    this._onObjectCreated([object], isTheFirstOfItsTypeInProject, {
      shouldCreateInstance: true,
    });
    this.forceUpdateObjectsList();
  };

  _onObjectsAddedFromAssetsFromNewObjectDialog = ({
    createdObjects: objects,
    isTheFirstOfItsTypeInProject,
  }: InstallAssetOutput) => {
    if (!objects.length) return;

    this._onObjectCreated(objects, isTheFirstOfItsTypeInProject, {
      shouldCreateInstance: true,
    });
    this.forceUpdateObjectsList();
  };

  addInstanceOnTheScene = (
    objectName: string,
    targetPosition: 'center' | 'upperCenter' = 'center'
  ) => {
    if (!this.editorDisplay) {
      return;
    }
    const viewPosition = this.editorDisplay.viewControls.getViewPosition();
    let position = [0, 0];
    if (viewPosition) {
      // $FlowFixMe[incompatible-type]
      position = viewPosition.toSceneCoordinates(
        viewPosition.getWidth() / 2,
        viewPosition.getHeight() /
          // If the target position is the upper center, the Y position is at the first
          // quarter of the screen. Otherwise, it's at the half of the screen.
          (targetPosition === 'upperCenter' ? 4 : 2)
      );
    }
    this._addInstance(position, objectName);
  };

  _addInstance = (pos: [number, number], objectName: string) => {
    if (!objectName || !this.editorDisplay) return;

    const instances = this.editorDisplay.instancesHandlers.addInstances(
      pos,
      [objectName],
      this.state.chosenLayer
    );
    this._onInstancesAddedAndSendToEditor3D(instances);
  };

  _addInstancesForObjectsAtPosition = (
    objects: Array<gdObject>,
    position: [number, number]
  ) => {
    const { editorDisplay } = this;
    if (!editorDisplay || !objects.length) return;

    const newInstances: Array<gdInitialInstance> = [];
    objects.forEach((object, index) => {
      newInstances.push(
        ...editorDisplay.instancesHandlers.addInstances(
          [position[0] + index * 16, position[1] + index * 16],
          [object.getName()],
          this.state.chosenLayer
        )
      );
    });

    this._onInstancesAddedAndSendToEditor3D(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });
    this._onInstancesSelected(newInstances);
    this.forceUpdatePropertiesEditor();
  };

  _doesObjectMatchCustomObjectDragItem = (
    object: gdObject,
    objectType: string,
    variantName: string
  ): boolean => {
    if (object.getType() !== objectType) return false;

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      object.getConfiguration()
    );
    return customObjectConfiguration.getVariantName() === variantName;
  };

  _findObjectMatchingCustomObjectDragItem = (
    objectType: string,
    variantName: string
  ): gdObject | null => {
    const { globalObjectsContainer, objectsContainer } = this.props;
    const findInContainer = (
      container: gdObjectsContainer
    ): gdObject | null => {
      const objectsCount = container.getObjectsCount();
      for (let objectIndex = 0; objectIndex < objectsCount; objectIndex++) {
        const object = container.getObjectAt(objectIndex);
        if (
          this._doesObjectMatchCustomObjectDragItem(
            object,
            objectType,
            variantName
          )
        ) {
          return object;
        }
      }
      return null;
    };

    return (
      findInContainer(objectsContainer) ||
      (globalObjectsContainer ? findInContainer(globalObjectsContainer) : null)
    );
  };

  _getOrCreateObjectFromCustomObjectDragItem = (
    customObjectDragItem: CustomObjectDragItem,
    { notifyInGameEditor = true }: {| notifyInGameEditor?: boolean |} = {}
  ): gdObject | null => {
    if (!this._canAddObject()) return null;

    const {
      extensionName,
      eventsBasedObjectName,
      variantName,
    } = customObjectDragItem;
    const { project, objectsContainer, globalObjectsContainer } = this.props;
    const objectType = gd.PlatformExtension.getObjectFullType(
      extensionName,
      eventsBasedObjectName
    );

    if (!project.hasEventsBasedObject(objectType)) return null;

    const eventsBasedObject = project.getEventsBasedObject(objectType);
    if (
      variantName &&
      !eventsBasedObject.getVariants().hasVariantNamed(variantName)
    ) {
      return null;
    }

    const requestedObjectName = gd.Project.getSafeName(
      customObjectDragItem.sceneObjectName || eventsBasedObjectName
    );
    const isRequestedObjectNameTaken =
      objectsContainer.hasObjectNamed(requestedObjectName) ||
      (!!globalObjectsContainer &&
        globalObjectsContainer.hasObjectNamed(requestedObjectName));

    const getMatchingObjectNamed = (objectName: string): gdObject | null => {
      const object = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        objectName
      );
      if (
        object &&
        this._doesObjectMatchCustomObjectDragItem(
          object,
          objectType,
          variantName
        )
      ) {
        return object;
      }
      return null;
    };

    const exactObject = getMatchingObjectNamed(requestedObjectName);
    if (exactObject) return exactObject;

    // If the requested name is already used by another object, reuse an
    // existing object with the same prefab/variant instead of creating a new
    // uniquely suffixed object every time this prefab is dragged.
    if (isRequestedObjectNameTaken) {
      const matchingObject = this._findObjectMatchingCustomObjectDragItem(
        objectType,
        variantName
      );
      if (matchingObject) return matchingObject;
    }

    const objectName = newNameGenerator(
      requestedObjectName,
      name =>
        objectsContainer.hasObjectNamed(name) ||
        (!!globalObjectsContainer &&
          globalObjectsContainer.hasObjectNamed(name))
    );

    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      project,
      objectType
    );

    const object = objectsContainer.insertNewObject(
      project,
      objectType,
      objectName,
      objectsContainer.getObjectsCount()
    );
    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      object.getConfiguration()
    );
    if (variantName) {
      customObjectConfiguration.setVariantName(variantName);
    }
    customObjectConfiguration.setMarkedAsOverridingEventsBasedObjectChildrenConfiguration(
      false
    );

    this._onObjectsCreated([object], isTheFirstOfItsTypeInProject, {
      notifyInGameEditor,
    });
    this.forceUpdateObjectsList();
    return object;
  };

  _onCustomObjectDropped = (
    customObjectDragItem: CustomObjectDragItem,
    position: [number, number]
  ) => {
    const object = this._getOrCreateObjectFromCustomObjectDragItem(
      customObjectDragItem
    );
    if (!object) return;

    this._addInstancesForObjectsAtPosition([object], position);
  };

  _onInstancesAddedAndSendToEditor3D = (
    instances: Array<gdInitialInstance>
  ) => {
    this._onInstancesAdded(instances);
    this._sendAddedInstances(instances);
  };

  _onInstancesAdded = (instances: Array<gdInitialInstance>) => {
    let invisibleLayerOnWhichInstancesHaveJustBeenAdded = null;
    instances.forEach(instance => {
      if (invisibleLayerOnWhichInstancesHaveJustBeenAdded === null) {
        const layer = this.props.layersContainer.getLayer(instance.getLayer());
        if (!layer.getVisibility()) {
          invisibleLayerOnWhichInstancesHaveJustBeenAdded = instance.getLayer();
        }
      }
      const infoBarDetails = onInstanceAdded({
        instance,
        layersContainer: this.props.layersContainer,
        globalObjectsContainer: this.props.globalObjectsContainer,
        objectsContainer: this.props.objectsContainer,
      });
      if (infoBarDetails) {
        this.setState({
          additionalWorkInfoBar: infoBarDetails,
          showAdditionalWorkInfoBar: true,
        });
      }
    });
    if (invisibleLayerOnWhichInstancesHaveJustBeenAdded !== null) {
      this.onInstanceAddedOnInvisibleLayer(
        invisibleLayerOnWhichInstancesHaveJustBeenAdded
      );
    }

    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'ADD',
          {
            operationLabel: getInstanceOperationLabel('Add', instances.length),
          }
        ),
      },
      () => this.updateToolbar()
    );
  };

  onInstanceAddedOnInvisibleLayer = (layer: ?string) => {
    this.setState({ invisibleLayerOnWhichInstancesHaveJustBeenAdded: layer });
  };

  _sendAddedInstances = (instances: Array<gdInitialInstance>) => {
    const { previewDebuggerServer } = this.props;
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'addInstances',
            payload: {
              instances: instances.map(instance =>
                serializeToJSObject(instance)
              ),
              moveUnderCursor: false,
            },
          });
        });
    }
  };

  _onInstancesSelected = (instances: Array<gdInitialInstance>) => {
    this._sendSelectedInstances();
    this._selectObjectOfInstances(instances);
  };

  _selectObjectOfInstances = (instances: Array<gdInitialInstance>) => {
    if (instances.length === 0) {
      this.setState(
        {
          lastSelectionType: 'instance',
          selectedObjectFolderOrObjectsWithContext: [],
          selectedLayer: null,
          selectedObjectGroup: null,
        },
        this.updateToolbar
      );
      return;
    }
    const { globalObjectsContainer, objectsContainer } = this.props;
    // TODO: Find a way to select efficiently the ObjectFolderOrObject instances
    // representing all the instances selected.
    const lastSelectedInstance = instances[instances.length - 1];
    const objectName = lastSelectedInstance.getObjectName();
    if (
      globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName)
    ) {
      this.setState(
        {
          lastSelectionType: 'instance',
          selectedObjectFolderOrObjectsWithContext: [
            {
              objectFolderOrObject: globalObjectsContainer
                .getRootFolder()
                .getObjectNamed(objectName),
              global: true,
            },
          ],
          selectedLayer: null,
          selectedObjectGroup: null,
        },
        this.updateToolbar
      );
    } else if (objectsContainer.hasObjectNamed(objectName)) {
      this.setState(
        {
          lastSelectionType: 'instance',
          selectedObjectFolderOrObjectsWithContext: [
            {
              objectFolderOrObject: objectsContainer
                .getRootFolder()
                .getObjectNamed(objectName),
              global: false,
            },
          ],
          selectedLayer: null,
          selectedObjectGroup: null,
        },
        this.updateToolbar
      );
    }
  };

  _onInstanceDoubleClicked = (instance: gdInitialInstance) => {
    this.editObjectByName({
      objectName: instance.getObjectName(),
      initialTab: 'properties',
      shouldSelectTheObject: true,
    });
  };

  _onInstancesMovedAndSendToEditor3D = (
    instances: Array<gdInitialInstance>
  ) => {
    this._onInstancesMoved(instances);
    this._sendUpdatedInstances(instances);
  };

  _onInstancesMoved = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT',
          {
            operationLabel: getInstanceOperationLabel('Move', instances.length),
          }
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  _onInstancesResized = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT',
          {
            operationLabel: getInstanceOperationLabel(
              'Resize',
              instances.length
            ),
          }
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  _fitCustomSizedModel3DInstancesToObjectRatio = (
    object: gdObject
  ): Array<gdInitialInstance> => {
    if (object.getType() !== 'Scene3D::Model3DObject') return [];

    const model3DConfiguration = gd.asModel3DConfiguration(
      object.getConfiguration()
    );
    const defaultWidth = model3DConfiguration.getWidth();
    const defaultHeight = model3DConfiguration.getHeight();
    const defaultDepth = model3DConfiguration.getDepth();
    if (
      !Number.isFinite(defaultWidth) ||
      !Number.isFinite(defaultHeight) ||
      !Number.isFinite(defaultDepth) ||
      defaultWidth <= 0 ||
      defaultHeight <= 0 ||
      defaultDepth <= 0
    ) {
      return [];
    }

    const resizedInstances: Array<gdInitialInstance> = [];
    const objectInstances = getInstancesInLayoutForObject(
      this.props.initialInstances,
      object.getName()
    );
    objectInstances.forEach(instance => {
      if (!instance.hasCustomSize() && !instance.hasCustomDepth()) return;

      const currentWidth = instance.hasCustomSize()
        ? instance.getCustomWidth()
        : defaultWidth;
      const currentHeight = instance.hasCustomSize()
        ? instance.getCustomHeight()
        : defaultHeight;
      const currentDepth = instance.hasCustomDepth()
        ? instance.getCustomDepth()
        : defaultDepth;
      if (
        !Number.isFinite(currentWidth) ||
        !Number.isFinite(currentHeight) ||
        !Number.isFinite(currentDepth) ||
        currentWidth <= 0 ||
        currentHeight <= 0 ||
        currentDepth <= 0
      ) {
        return;
      }

      const scale = Math.min(
        currentWidth / defaultWidth,
        currentHeight / defaultHeight,
        currentDepth / defaultDepth
      );
      if (!Number.isFinite(scale) || scale <= 0) return;

      const nextWidth = scale * defaultWidth;
      const nextHeight = scale * defaultHeight;
      const nextDepth = scale * defaultDepth;
      if (
        Math.abs(currentWidth - nextWidth) < 0.000001 &&
        Math.abs(currentHeight - nextHeight) < 0.000001 &&
        Math.abs(currentDepth - nextDepth) < 0.000001
      ) {
        return;
      }

      instance.setHasCustomSize(true);
      instance.setCustomWidth(nextWidth);
      instance.setCustomHeight(nextHeight);
      instance.setHasCustomDepth(true);
      instance.setCustomDepth(nextDepth);
      resizedInstances.push(instance);
    });

    return resizedInstances;
  };

  _onInstancesRotated = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT',
          {
            operationLabel: getInstanceOperationLabel(
              'Rotate',
              instances.length
            ),
          }
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  // $FlowFixMe[missing-local-annot]
  _exportDataOnly = (debounce(() => {
    this.props.hotReloadPreviewButtonProps.launchProjectDataOnlyPreview();
  }, 250): any);

  _onInstancesModified = (instances: Array<gdInitialInstance>) => {
    this._sendUpdatedInstances(instances);
    this.forceUpdate();
    //TODO: Save for redo with debounce (and cancel on unmount)
  };

  _sendUpdatedInstances = (instances: Array<gdInitialInstance>) => {
    const { previewDebuggerServer } = this.props;
    if (!previewDebuggerServer) return;

    previewDebuggerServer
      .getExistingEmbeddedGameFrameDebuggerIds()
      .forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'updateInstances',
          payload: {
            instances: instances.map(instance => serializeToJSObject(instance)),
          },
        });
      });
  };

  _onObjectsModified = (objects: Array<gdObject>) => {
    this._hotReloadObjects({ updatedObjects: objects });
  };

  _onSetAsGlobalObject = (object: gdObject) => {
    this.props.onObjectListsModified({ isNewObjectTypeUsed: false });
  };

  _hotReloadObjects = ({
    updatedObjects,
  }: {|
    updatedObjects: Array<gdObject>,
  |}) => {
    const serializedObjects = updatedObjects
      .filter(object => !!exceptionallyGuardAgainstDeadObject(object))
      .map(object => serializeObjectWithCleanDefaultBehaviorFlags(object));
    const { previewDebuggerServer } = this.props;
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'hotReloadObjects',
            payload: {
              updatedObjects: serializedObjects,
            },
          });
        });
    }
  };

  _hotReloadObjectsAndAddInstancesInEditor3D = ({
    objects,
    instances,
  }: {|
    objects: Array<gdObject>,
    instances: Array<gdInitialInstance>,
  |}) => {
    const { previewDebuggerServer, project } = this.props;
    if (!previewDebuggerServer) return;

    const updatedObjects = objects
      .filter(object => !!exceptionallyGuardAgainstDeadObject(object))
      .map(object => serializeObjectWithCleanDefaultBehaviorFlags(object));
    const serializedInstances = instances.map(instance =>
      serializeToJSObject(instance)
    );
    const resources = getRuntimeProjectResourceDataArray(project);

    previewDebuggerServer
      .getExistingEmbeddedGameFrameDebuggerIds()
      .forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'hotReloadObjectsAndAddInstances',
          payload: {
            resources,
            updatedObjects,
            instances: serializedInstances,
          },
        });
      });
  };

  _onObjectEdited = (
    objectWithContext: ObjectWithContext,
    hasResourceChanged: boolean
  ) => {
    const { project, layout, resourceManagementProps } = this.props;
    // It triggers forceUpdateRenderedInstancesOfObject (or
    // forceUpdateCustomObjectRenderedInstances) on this editor too.
    this.props.onObjectEdited(objectWithContext, hasResourceChanged);
    if (layout) {
      if (objectWithContext.global) {
        gd.WholeProjectRefactorer.behaviorsAddedToGlobalObject(
          project,
          objectWithContext.object.getName()
        );
      } else {
        // TODO EBO Add same refactor for event-based objects
        gd.WholeProjectRefactorer.behaviorsAddedToObjectInScene(
          project,
          layout,
          objectWithContext.object.getName()
        );
      }
    }
    this.updateBehaviorsSharedData();
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();

    if (hasResourceChanged) {
      // ObjectEditorDialog intercepts onResourceUsageChanged callbacks.
      // Send it now that the dialog changes are accepted.
      resourceManagementProps.onResourceUsageChanged();
    } else {
      this._hotReloadObjects({
        updatedObjects: [objectWithContext.object],
      });
    }

    const resizedInstances = hasResourceChanged
      ? this._fitCustomSizedModel3DInstancesToObjectRatio(
          objectWithContext.object
        )
      : [];
    if (resizedInstances.length > 0) {
      this._onInstancesResized(resizedInstances);
    }
  };

  onSelectTileMapTile = (tileMapTileSelection: ?TileMapTileSelection) => {
    this.setState({ tileMapTileSelection });
  };

  _setSelectedInstances = (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean
  ) => {
    this.instancesSelection.selectInstances({
      instances,
      multiSelect,
      layersLocks: null,
      ignoreSeal: true,
    });
    this._onInstancesSelected(instances);
  };

  _sendSelectedInstances = () => {
    const { previewDebuggerServer } = this.props;
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'setSelectedInstances',
            payload: {
              instanceUuids: this.instancesSelection
                .getSelectedInstances()
                .map(instance => instance.getPersistentUuid()),
            },
          });
        });
    }
  };

  _onSelectInstances = (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean,
    targetPosition?: 'center' | 'upperCenter'
  ) => {
    this._setSelectedInstances(instances, multiSelect);
    const { editorDisplay } = this;
    if (editorDisplay) {
      let offset = null;
      const { viewControls } = editorDisplay;
      const viewPosition = viewControls.getViewPosition();
      if (viewPosition && targetPosition === 'upperCenter') {
        offset = [0, viewPosition.toSceneScale(viewPosition.getHeight() / 4)];
      }

      viewControls.centerViewOnLastInstance(instances, offset);
    }

    if (this.props.gameEditorMode === 'embedded-game') {
      changeViewPosition('centerViewOnLastSelectedInstance');
    }
  };

  _getCanvasCenterSceneCoordinates = (): ?[number, number] => {
    const { editorDisplay } = this;
    if (!editorDisplay) return null;

    const viewPosition = editorDisplay.viewControls.getViewPosition();
    if (!viewPosition) return null;

    return viewPosition.toSceneCoordinates(
      viewPosition.getWidth() / 2,
      viewPosition.getHeight() / 2
    );
  };

  /**
   * Create an instance of the given object at the given position,
   * or at the canvas center.
   */
  _addInstanceForNewObject = (
    object: gdObject,
    instanceSceneCoordinates?: ?[number, number]
  ) => {
    const instancePosition =
      instanceSceneCoordinates || this._getCanvasCenterSceneCoordinates();

    if (!instancePosition) {
      return;
    }

    this._addInstancesForObjectsAtPosition([object], instancePosition);
  };

  _onObjectCreated = (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean,
    options?: {|
      shouldCreateInstance?: boolean,
      instanceSceneCoordinates?: ?[number, number],
    |}
  ) => {
    if (objects.length === 0) {
      return;
    }
    this._onObjectsCreated(objects, isTheFirstOfItsTypeInProject);
    if (options && options.shouldCreateInstance) {
      this._addInstanceForNewObject(
        objects[0],
        options.instanceSceneCoordinates
      );
    }
  };

  _onObjectsCreated = (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean,
    { notifyInGameEditor = true }: {| notifyInGameEditor?: boolean |} = {}
  ) => {
    if (objects.length === 0) return;

    objects.forEach(object => {
      const infoBarDetails = onObjectAdded({
        object,
        layersContainer: this.props.layersContainer,
        globalObjectsContainer: this.props.globalObjectsContainer,
        objectsContainer: this.props.objectsContainer,
      });
      if (infoBarDetails) {
        this.setState({
          additionalWorkInfoBar: infoBarDetails,
          showAdditionalWorkInfoBar: true,
        });
      }
    });
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();

    if (notifyInGameEditor) {
      this.props.onObjectListsModified({
        isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
      });
    }
  };

  _onImageFilesDropped = async (
    imageFilePaths: Array<string>,
    position: [number, number]
  ) => {
    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (
      storageProvider.internalName !== 'LocalFile' ||
      !this.props.project.getProjectFile()
    ) {
      Window.showMessageBox(
        'Images can only be dropped into saved local projects.',
        'info'
      );
      return;
    }

    const supportedImageFilePaths = getSupportedImageFilePaths(imageFilePaths);
    if (!supportedImageFilePaths.length) return;

    const isTheFirstSpriteObjectInProject = !gd.UsedObjectTypeFinder.scanProject(
      this.props.project,
      'Sprite'
    );
    try {
      const objects = await createSpriteObjectsFromImageFiles({
        project: this.props.project,
        objectsContainer: this.props.objectsContainer,
        imageFilePaths: supportedImageFilePaths,
      });
      this._onObjectsCreated(objects, isTheFirstSpriteObjectInProject);
      this._addInstancesForObjectsAtPosition(objects, position);
      if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
      await this.props.resourceManagementProps.onFetchNewlyAddedResources();
      this.props.resourceManagementProps.onNewResourcesAdded();
    } catch (error) {
      console.error(
        'Unable to create Sprite object from dropped image:',
        error
      );
      Window.showMessageBox(
        'Unable to create a Sprite object from the dropped image.',
        'error'
      );
    }
  };

  _on3DModelFilesDropped = async (
    modelFilePaths: Array<string>,
    position: [number, number]
  ) => {
    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (
      storageProvider.internalName !== 'LocalFile' ||
      !this.props.project.getProjectFile()
    ) {
      Window.showMessageBox(
        '3D models can only be dropped into saved local projects.',
        'info'
      );
      return;
    }

    const supported3DModelFilePaths = getSupported3DModelFilePaths(
      modelFilePaths
    );
    if (!supported3DModelFilePaths.length) return;

    const isTheFirst3DModelObjectInProject = !gd.UsedObjectTypeFinder.scanProject(
      this.props.project,
      'Scene3D::Model3DObject'
    );
    try {
      const objects = await create3DModelObjectsFromGLBFiles({
        project: this.props.project,
        objectsContainer: this.props.objectsContainer,
        modelFilePaths: supported3DModelFilePaths,
      });
      this._onObjectsCreated(objects, isTheFirst3DModelObjectInProject);
      this._addInstancesForObjectsAtPosition(objects, position);
      if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
      await this.props.resourceManagementProps.onFetchNewlyAddedResources();
      this.props.resourceManagementProps.onNewResourcesAdded();
    } catch (error) {
      console.error(
        'Unable to create 3D model object from dropped GLB:',
        error
      );
      Window.showMessageBox(
        'Unable to create a 3D model object from the dropped GLB file.',
        'error'
      );
    }
  };

  _getDropPositionInEmbeddedGameFrame = async ({
    x,
    y,
  }: {|
    x: number,
    y: number,
  |}): Promise<?EmbeddedGameFrameDropPosition> => {
    const { previewDebuggerServer } = this.props;
    if (!previewDebuggerServer) return null;

    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse({
        command: 'getInGameEditorDropPosition',
        x,
        y,
      });
      const position = answer.payload && answer.payload.position;
      if (!position) return null;

      const dropX = Number(position.x);
      const dropY = Number(position.y);
      const dropZ = Number(position.z);
      if (
        !Number.isFinite(dropX) ||
        !Number.isFinite(dropY) ||
        !Number.isFinite(dropZ)
      ) {
        return null;
      }

      return {
        x: dropX,
        y: dropY,
        z: dropZ,
        layerName:
          typeof position.layerName === 'string'
            ? position.layerName
            : this.state.chosenLayer,
      };
    } catch (error) {
      console.error(
        'Unable to get the embedded 3D editor drop position:',
        error
      );
      return null;
    }
  };

  _addInstancesForObjectsAt3DPosition = (
    objects: Array<gdObject>,
    dropPosition: EmbeddedGameFrameDropPosition
  ): Array<gdInitialInstance> => {
    if (!objects.length) return [];

    const zOrderFinder = new gd.HighestZOrderFinder();
    zOrderFinder.reset();
    this.props.initialInstances.iterateOverInstances(zOrderFinder);
    const zOrder = zOrderFinder.getHighestZOrder() + 1;
    zOrderFinder.delete();

    return objects.map((object, index) => {
      const instance: gdInitialInstance = this.props.initialInstances.insertNewInitialInstance();
      instance.setObjectName(object.getName());
      instance.setX(Math.round(dropPosition.x + index * 16));
      instance.setY(Math.round(dropPosition.y + index * 16));
      instance.setZ(dropPosition.z);
      instance.setLayer(dropPosition.layerName);
      instance.setZOrder(zOrder + index);

      return instance;
    });
  };

  _onCustomObjectDroppedInEmbeddedGameFrame = async ({
    customObjectDragItem,
    x,
    y,
  }: {|
    customObjectDragItem: CustomObjectDragItem,
    x: number,
    y: number,
  |}) => {
    const dropPosition = await this._getDropPositionInEmbeddedGameFrame({
      x,
      y,
    });
    if (!dropPosition) return;

    const objectType = gd.PlatformExtension.getObjectFullType(
      customObjectDragItem.extensionName,
      customObjectDragItem.eventsBasedObjectName
    );
    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      this.props.project,
      objectType
    );
    const objectCountBeforeDrop = this.props.objectsContainer.getObjectsCount();
    const object = this._getOrCreateObjectFromCustomObjectDragItem(
      customObjectDragItem,
      { notifyInGameEditor: false }
    );
    if (!object) return;

    const isNewObject =
      this.props.objectsContainer.getObjectsCount() > objectCountBeforeDrop;
    const instances = this._addInstancesForObjectsAt3DPosition(
      [object],
      dropPosition
    );
    this._onInstancesAdded(instances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances,
      multiSelect: true,
      layersLocks: null,
    });
    this._onInstancesSelected(instances);
    this.forceUpdatePropertiesEditor();

    if (isNewObject) {
      if (isTheFirstOfItsTypeInProject) {
        this.props.onObjectListsModified({
          isNewObjectTypeUsed: true,
        });
      } else {
        this._hotReloadObjectsAndAddInstancesInEditor3D({
          objects: [object],
          instances,
        });
      }
    } else {
      this._sendAddedInstances(instances);
    }
  };

  _on3DModelFilesDroppedInEmbeddedGameFrame = async ({
    modelFilePaths,
    x,
    y,
  }: {|
    modelFilePaths: Array<string>,
    x: number,
    y: number,
  |}) => {
    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (
      storageProvider.internalName !== 'LocalFile' ||
      !this.props.project.getProjectFile()
    ) {
      Window.showMessageBox(
        '3D models can only be dropped into saved local projects.',
        'info'
      );
      return;
    }

    const supported3DModelFilePaths = getSupported3DModelFilePaths(
      modelFilePaths
    );
    if (!supported3DModelFilePaths.length) return;

    const dropPosition = await this._getDropPositionInEmbeddedGameFrame({
      x,
      y,
    });
    if (!dropPosition) return;

    const isTheFirst3DModelObjectInProject = !gd.UsedObjectTypeFinder.scanProject(
      this.props.project,
      'Scene3D::Model3DObject'
    );
    try {
      const objects = await create3DModelObjectsFromGLBFiles({
        project: this.props.project,
        objectsContainer: this.props.objectsContainer,
        modelFilePaths: supported3DModelFilePaths,
      });
      this._ignoreResourceExternalChangesForFiles(
        get3DModelResourceFileIdentifiers({
          project: this.props.project,
          objects,
        })
      );
      const instances = this._addInstancesForObjectsAt3DPosition(
        objects,
        dropPosition
      );

      this._onObjectsCreated(objects, isTheFirst3DModelObjectInProject, {
        notifyInGameEditor: false,
      });
      this._onInstancesAdded(instances);
      if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
      this.instancesSelection.clearSelection();
      this.instancesSelection.selectInstances({
        instances,
        multiSelect: true,
        layersLocks: null,
      });
      this._onInstancesSelected(instances);
      this.forceUpdatePropertiesEditor();

      if (isTheFirst3DModelObjectInProject) {
        this.props.onObjectListsModified({
          isNewObjectTypeUsed: true,
        });
      } else {
        this._hotReloadObjectsAndAddInstancesInEditor3D({ objects, instances });
      }
      this.props.resourceManagementProps
        .onFetchNewlyAddedResources()
        .catch(error => {
          console.error(
            'Unable to fetch newly added resources after dropped GLB:',
            error
          );
        });
    } catch (error) {
      console.error(
        'Unable to create 3D model object from dropped GLB:',
        error
      );
      Window.showMessageBox(
        'Unable to create a 3D model object from the dropped GLB file.',
        'error'
      );
    }
  };

  _onRemoveLayer = (layerName: string, done: boolean => void) => {
    const getNewState = (doRemove: boolean) => {
      const newState: {|
        layerRemoved: null,
        chosenLayer?: string,
        selectedLayer?: null,
      |} = {
        layerRemoved: null,
      };
      if (doRemove && layerName === this.state.chosenLayer) {
        newState.chosenLayer = getTopLayerName(
          this.props.layersContainer,
          layerName
        );
      }
      if (
        doRemove &&
        this.state.selectedLayer &&
        this.state.selectedLayer.getName() === layerName
      ) {
        newState.selectedLayer = null;
      }
      return newState;
    };

    this.setState({
      layerRemoved: layerName,
      onCloseLayerRemoveDialog: (
        doRemove: boolean,
        newLayer: string | null
      ) => {
        this.setState(getNewState(doRemove), () => {
          if (doRemove) {
            if (newLayer === null) {
              this.instancesSelection.unselectInstancesOnLayer(layerName);

              if (this.props.layout) {
                gd.WholeProjectRefactorer.removeLayerInScene(
                  this.props.project,
                  this.props.layout,
                  layerName
                );
              } else if (this.props.eventsBasedObject) {
                gd.WholeProjectRefactorer.removeLayerInEventsBasedObject(
                  this.props.eventsBasedObject,
                  layerName
                );
              }
            } else {
              // Instances are not invalidated, so we can keep the selection.
              if (this.props.layout) {
                gd.WholeProjectRefactorer.mergeLayersInScene(
                  this.props.project,
                  this.props.layout,
                  layerName,
                  newLayer
                );
              } else if (this.props.eventsBasedObject) {
                gd.WholeProjectRefactorer.mergeLayersInEventsBasedObject(
                  this.props.eventsBasedObject,
                  layerName,
                  newLayer
                );
              }
            }
          }

          done(doRemove);
          // /!\ Force the instances editor to destroy and mount again the
          // renderers to avoid keeping any references to existing instances
          if (this.editorDisplay)
            this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();

          this.forceUpdateLayersList();

          // We may have modified the selection, so force an update of editors dealing with it.
          this.forceUpdatePropertiesEditor();
          this.updateToolbar();
        });
      },
    });
  };

  _onLayerRenamed = () => {
    this.forceUpdatePropertiesEditor();
  };

  _sendHotReloadLayers = () => {
    const { previewDebuggerServer, layersContainer, project } = this.props;
    const layers = mapFor(0, layersContainer.getLayersCount(), i => {
      const layer = layersContainer.getLayerAt(i);
      return serializeToJSObject(layer);
    });
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'hotReloadLayers',
            payload: {
              layers,
              areEffectsHidden: project.areEffectsHiddenInEditor(),
            },
          });
        });
    }
  };

  _sendSetBackgroundColor = () => {
    this.forceUpdatePropertiesEditor();
    this.forceUpdateLayersList();
    const { previewDebuggerServer, layout } = this.props;
    if (!layout) {
      return;
    }
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'setBackgroundColor',
            payload: {
              backgroundColor: [
                layout.getBackgroundColorRed(),
                layout.getBackgroundColorGreen(),
                layout.getBackgroundColorBlue(),
              ],
            },
          });
        });
    }
  };

  _onLayersModified = (hasAnyEffectBeenAdded: boolean) => {
    const { onEffectAdded } = this.props;
    if (hasAnyEffectBeenAdded) {
      // This triggers a full hot-reload. We don't need to reload layers specifically.
      onEffectAdded();
    } else {
      this._sendHotReloadLayers();
    }
  };

  _onLayersVisibilityInEditorChanged = () => {
    this._sendHotReloadLayers();
  };

  _onChooseLayer = (layerName: string) => {
    this.setState({
      chosenLayer: layerName,
    });

    const { previewDebuggerServer } = this.props;
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'setSelectedLayer',
            payload: {
              layerName,
            },
          });
        });
    }
  };

  _onSelectLayer = (layer: gdLayer | null) => {
    this.setState({
      selectedLayer: layer,
      lastSelectionType: 'layer',
      selectedObjectGroup: null,
    });
  };

  _onSelectObjectGroup = (objectGroup: gdObjectGroup | null) => {
    this.setState({
      selectedObjectGroup: objectGroup,
      lastSelectionType: 'objectGroup',
      selectedLayer: null,
    });
  };

  _onDeleteObjects = (
    i18n: I18nType,
    objectsWithContext: ObjectWithContext[],
    done: boolean => void
  ) => {
    const { project, layout, eventsBasedObject, onObjectsDeleted } = this.props;

    objectsWithContext.forEach(objectWithContext => {
      const { object, global } = objectWithContext;

      // Close the object's edit dialog if open, clear the objects-list
      // selection and unselect instances of the deleted object - all before
      // gd.WholeProjectRefactorer removes them below (after which they would
      // be invalid references, as pointing to deleted objects).
      this.onWillDeleteObject({ scene: layout, objectName: object.getName() });

      if (layout) {
        if (global) {
          gd.WholeProjectRefactorer.globalObjectRemoved(
            project,
            object.getName()
          );
        } else {
          gd.WholeProjectRefactorer.objectRemovedInScene(
            project,
            layout,
            object.getName()
          );
        }
      } else if (eventsBasedObject) {
        gd.WholeProjectRefactorer.objectRemovedInEventsBasedObject(
          project,
          eventsBasedObject,
          object.getName()
        );
      }
    });

    this.props.onObjectListsModified({ isNewObjectTypeUsed: false });

    // Note: done() actually does the deletion of the objects,
    // so ensure objectsWithContext are not used after this call.
    done(true);
    onObjectsDeleted();

    // /!\ Force the instances editor to destroy and mount again the
    // renderers to avoid keeping any references to existing instances
    if (this.editorDisplay) {
      this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
    }

    // We modified the selection, so force an update of editors dealing with it.
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _getValidatedObjectOrGroupName = (
    newName: string,
    global: boolean,
    i18n: I18nType
  ): any => {
    const { project, layout, projectScopedContainersAccessor } = this.props;

    const projectScopedContainers = projectScopedContainersAccessor.get();
    const objectsContainersList = projectScopedContainers.getObjectsContainersList();
    const variablesContainersList = projectScopedContainers.getVariablesContainersList();

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          objectsContainersList.hasObjectOrGroupNamed(tentativeNewName) ||
          variablesContainersList.has(tentativeNewName)
        ) {
          return true;
        }

        if (global && layout) {
          // If object or group is global, also check for other layouts' objects and groups names.
          const layoutName = layout.getName();
          const layoutsWithObjectOrGroupWithSameName: Array<string> = mapFor(
            0,
            project.getLayoutsCount(),
            i => {
              const otherLayout = project.getLayoutAt(i);
              const otherLayoutName = otherLayout.getName();
              if (layoutName !== otherLayoutName) {
                if (otherLayout.getObjects().hasObjectNamed(tentativeNewName)) {
                  return otherLayoutName;
                }
                const groupContainer = otherLayout
                  .getObjects()
                  .getObjectGroups();
                if (groupContainer.has(tentativeNewName)) {
                  return otherLayoutName;
                }
              }
              return null;
            }
          ).filter(Boolean);

          if (layoutsWithObjectOrGroupWithSameName.length > 0) {
            return true;
          }
        }

        return false;
      }
    );

    return safeAndUniqueNewName;
  };

  _onRenameEditedObject = (newName: string) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObjectFinish(editedObjectWithContext, newName);
    }
  };

  _onRenameObjectFinish = (
    objectWithContext: ObjectWithContext,
    newName: string
  ) => {
    const { object, global } = objectWithContext;
    const {
      project,
      layout,
      eventsBasedObject,
      projectScopedContainersAccessor,
    } = this.props;

    // newName is supposed to have been already validated.
    // Avoid triggering renaming refactoring if name has not really changed
    if (object.getName() === newName) {
      return;
    }

    if (layout) {
      if (global) {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          object.getName(),
          newName,
          /* isObjectGroup=*/ false
        );
      } else {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
          project,
          layout,
          object.getName(),
          newName,
          /* isObjectGroup=*/ false
        );
      }
    } else if (eventsBasedObject) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
        project,
        projectScopedContainersAccessor.get(),
        eventsBasedObject,
        object.getName(),
        newName,
        /* isObjectGroup=*/ false
      );
    }

    object.setName(newName);
    this.props.onObjectListsModified({ isNewObjectTypeUsed: false });
  };

  _onRenameObjectFolderOrObjectWithContextFinish = (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { objectFolderOrObject, global } = objectFolderOrObjectWithContext;

    const unifiedName = getObjectFolderOrObjectUnifiedName(
      objectFolderOrObject
    );
    // Avoid triggering renaming refactoring if name has not really changed
    if (unifiedName === newName) {
      this._onObjectFolderOrObjectWithContextSelected(
        objectFolderOrObjectWithContext
      );
      done(false);
      return;
    }
    // newName is supposed to have been already validated.

    if (objectFolderOrObject.isFolder()) {
      objectFolderOrObject.setFolderName(newName);
      done(true);
      return;
    }

    const object = objectFolderOrObject.getObject();

    this._onRenameObjectFinish({ object, global }, newName);
    this._onObjectFolderOrObjectWithContextSelected(
      objectFolderOrObjectWithContext
    );
    done(true);
  };

  _onMoveInstancesZOrder = (where: 'front' | 'back') => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();

    const layerNames = selectedInstances.reduce(
      (acc: Set<string>, instance) => {
        if (!instance.isLocked()) acc.add(instance.getLayer());
        return acc;
      },
      new Set()
    );

    const highestZOrderFinder = new gd.HighestZOrderFinder();

    const extremeZOrderByLayerName = {};
    layerNames.forEach(layerName => {
      highestZOrderFinder.reset();
      highestZOrderFinder.restrictSearchToLayer(layerName);
      this.props.initialInstances.iterateOverInstances(highestZOrderFinder);
      // $FlowFixMe[prop-missing]
      extremeZOrderByLayerName[layerName] =
        where === 'back'
          ? highestZOrderFinder.getLowestZOrder()
          : highestZOrderFinder.getHighestZOrder();
    });
    highestZOrderFinder.delete();

    selectedInstances.forEach(instance => {
      if (!instance.isLocked()) {
        // $FlowFixMe[invalid-computed-prop]
        const extremeZOrder = extremeZOrderByLayerName[instance.getLayer()];
        // If instance is already at the extreme z order, do nothing.
        if (instance.getZOrder() === extremeZOrder) return;

        instance.setZOrder(extremeZOrder + (where === 'front' ? 1 : -1));
      }
    });
    this.forceUpdateInstancesList();
    this.forceUpdatePropertiesEditor();
  };

  _onMoveInstancesToLayer = (layerName: string) => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    const instancesToMove = selectedInstances.filter(
      instance => !instance.isLocked() && instance.getLayer() !== layerName
    );
    if (!instancesToMove.length) return;

    instancesToMove.forEach(instance => {
      instance.setLayer(layerName);
    });

    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT',
          {
            operationLabel: getMoveInstancesToLayerOperationLabel(
              layerName,
              instancesToMove.length
            ),
          }
        ),
      },
      () => {
        if (this.editorDisplay) {
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
        }
        this.forceUpdateInstancesList();
        this.forceUpdatePropertiesEditor();
        this.updateToolbar();
        this._sendHotReloadAllInstances();
      }
    );
  };

  _onDeleteObjectGroup = (
    groupWithContext: GroupWithContext,
    done: boolean => void
  ) => {
    // Clear the group selection now, before actually deleting the group,
    // to prevent any stale reference in a re-render after deletion (the
    // group properties panel would call into a destroyed gd.ObjectGroup).
    this.setState({ selectedObjectGroup: null });

    // done() actually does the deletion of the object group,
    // so ensure groupWithContext is not used after this call.
    done(true);
    this.props.onObjectGroupsDeleted();
  };

  _onRenameObjectGroup = (
    groupWithContext: GroupWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { group, global } = groupWithContext;
    const {
      project,
      layout,
      eventsBasedObject,
      projectScopedContainersAccessor,
    } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (layout) {
      if (group.getName() !== newName) {
        if (global) {
          gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
            project,
            group.getName(),
            newName,
            /* isObjectGroup=*/ true
          );
        } else {
          gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
            project,
            layout,
            group.getName(),
            newName,
            /* isObjectGroup=*/ true
          );
        }
      }
    } else if (eventsBasedObject) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
        project,
        projectScopedContainersAccessor.get(),
        eventsBasedObject,
        group.getName(),
        newName,
        /* isObjectGroup=*/ true
      );
    }
    done(true);
    this.props.onObjectGroupEdited(groupWithContext);
  };

  canObjectOrGroupBeGlobal = (
    i18n: I18nType,
    objectOrGroupName: string
  ): boolean => {
    const { layout, project } = this.props;
    if (!layout) return false;

    const layoutName = layout.getName();
    const layoutsWithObjectOrGroupWithSameName: Array<string> = mapFor(
      0,
      project.getLayoutsCount(),
      i => {
        const otherLayout = project.getLayoutAt(i);
        const otherLayoutName = otherLayout.getName();
        if (layoutName !== otherLayoutName) {
          if (otherLayout.getObjects().hasObjectNamed(objectOrGroupName)) {
            return otherLayoutName;
          }
          const groupContainer = otherLayout.getObjects().getObjectGroups();
          if (groupContainer.has(objectOrGroupName)) {
            return otherLayoutName;
          }
        }
        return null;
      }
    ).filter(Boolean);

    if (layoutsWithObjectOrGroupWithSameName.length > 0) {
      return Window.showConfirmDialog(
        i18n._(
          t`Making "${objectOrGroupName}" global would conflict with the following scenes that have a group or an object with the same name:${'\n\n - ' +
            layoutsWithObjectOrGroupWithSameName.join('\n\n - ') +
            '\n\n'}Continue only if you know what you're doing.`
        ),
        'warning'
      );
    }
    return true;
  };

  deleteSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    const instancesToDelete = selectedInstances.filter(
      instance => !instance.isLocked()
    );

    this.instancesSelection.clearSelection();
    if (this.editorDisplay)
      this.editorDisplay.instancesHandlers.clearHighlightedInstance();

    // Immediately update the properties editor to ensure they keep no reference
    // to the deleted instances.
    this.forceUpdatePropertiesEditor();

    instancesToDelete.forEach(instance => {
      this.props.initialInstances.removeInstance(instance);
    });

    this.setState(
      {
        selectedObjectFolderOrObjectsWithContext: [],
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'DELETE',
          {
            operationLabel: getInstanceOperationLabel(
              'Delete',
              instancesToDelete.length
            ),
          }
        ),
      },
      () => {
        this.updateToolbar();
      }
    );

    const { previewDebuggerServer } = this.props;
    if (previewDebuggerServer) {
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'deleteSelection',
            payload: {},
          });
        });
    }
  };

  zoomToInitialPosition = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) {
      return;
    }
    editorDisplay.viewControls.zoomToInitialPosition();

    if (this.props.gameEditorMode === 'embedded-game') {
      changeViewPosition('zoomToInitialPosition');
    }
  };

  zoomToFitContent = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) {
      return;
    }
    editorDisplay.viewControls.zoomToFitContent();

    if (this.props.gameEditorMode === 'embedded-game') {
      changeViewPosition('zoomToFitContent');
    }
  };

  getContentAABB = async (): Promise<Rectangle | null> => {
    try {
      return await getEditorContentAABB({
        gameEditorMode: this.props.gameEditorMode,
        previewDebuggerServer: this.props.previewDebuggerServer,
        getInstancesEditorContentAABB: () =>
          this.editorDisplay
            ? this.editorDisplay.instancesHandlers.getContentAABB()
            : null,
      });
    } catch (error) {
      console.error("Can't get the content AABB.", error);
      return null;
    }
  };

  zoomToFitSelection = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) {
      return;
    }
    editorDisplay.viewControls.zoomToFitSelection();

    if (this.props.gameEditorMode === 'embedded-game') {
      changeViewPosition('zoomToFitSelection');
    }
  };

  /**
   * Center the view on the last selected instance, without changing the zoom
   * (same behavior as the "F" shortcut of the in-game (3D) editor).
   */
  focusOnSelection = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) {
      return;
    }
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    if (selectedInstances.length === 0) {
      return;
    }
    editorDisplay.viewControls.centerViewOnLastInstance(selectedInstances);

    if (this.props.gameEditorMode === 'embedded-game') {
      changeViewPosition('centerViewOnLastSelectedInstance');
    }
  };

  getContextMenuZoomItems = (i18n: I18nType): any => {
    return [
      {
        label: i18n._(t`Zoom in`),
        click: this.zoomIn,
        accelerator: 'CmdOrCtrl+numadd',
      },
      {
        label: i18n._(t`Zoom out`),
        click: this.zoomOut,
        accelerator: 'CmdOrCtrl+numsub',
      },
      {
        label: i18n._(t`Focus on selection`),
        click: this.focusOnSelection,
        enabled: this.instancesSelection.hasSelectedInstances(),
        accelerator: 'F',
      },
      {
        label: i18n._(t`Zoom to fit selection`),
        click: this.zoomToFitSelection,
        enabled: this.instancesSelection.hasSelectedInstances(),
        accelerator: 'Shift+num1',
      },
      {
        label: i18n._(t`Zoom to initial position`),
        click: this.zoomToInitialPosition,
        accelerator: 'Shift+num2',
      },
      {
        label: i18n._(t`Zoom to fit content`),
        click: this.zoomToFitContent,
        accelerator: 'Shift+num3',
      },
    ];
  };

  getContextMenuLayoutItems = (i18n: I18nType): any => {
    const { layout } = this.props;

    return [
      {
        label: i18n._(t`Open scene events`),
        click: () => this.props.onOpenEvents(layout ? layout.getName() : ''),
      },
      {
        label: i18n._(t`Open scene properties`),
        click: () => this.openSceneProperties(true),
      },
    ].filter(Boolean);
  };

  getContextMenuInstancesWiseItems = (i18n: I18nType): any => {
    const hasSelectedInstances = this.instancesSelection.hasSelectedInstances();
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    const unlockedSelectedInstances = selectedInstances.filter(
      instance => !instance.isLocked()
    );
    return [
      {
        label: i18n._(t`Copy`),
        click: () => this.copySelection(),
        enabled: hasSelectedInstances,
        accelerator: 'CmdOrCtrl+C',
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cutSelection(),
        enabled: hasSelectedInstances,
        accelerator: 'CmdOrCtrl+X',
      },
      {
        label: i18n._(t`Paste`),
        click: () => this.paste(),
        enabled: Clipboard.has(INSTANCES_CLIPBOARD_KIND) || hasClipboardImage(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        enabled: hasSelectedInstances,
        click: () => {
          this.duplicateSelection();
        },
        accelerator: 'CmdOrCtrl+D',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.deleteSelection(),
        enabled: hasSelectedInstances,
        accelerator: 'Delete',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Bring to front`),
        enabled: hasSelectedInstances,
        click: () => {
          this._onMoveInstancesZOrder('front');
        },
      },
      {
        label: i18n._(t`Send to back`),
        enabled: hasSelectedInstances,
        click: () => {
          this._onMoveInstancesZOrder('back');
        },
      },
      {
        label: i18n._(t`Layer`),
        submenu: enumerateLayers(this.props.layersContainer).map(layer => {
          const areAllUnlockedInstancesAlreadyOnLayer =
            !!unlockedSelectedInstances.length &&
            unlockedSelectedInstances.every(
              instance => instance.getLayer() === layer.value
            );
          return {
            type: 'checkbox',
            label: layer.label,
            checked: areAllUnlockedInstancesAlreadyOnLayer,
            enabled:
              !!unlockedSelectedInstances.length &&
              !areAllUnlockedInstancesAlreadyOnLayer,
            click: () => this._onMoveInstancesToLayer(layer.value),
          };
        }),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Extract`),
        submenu: [
          {
            label: i18n._(t`Extract as a prefab`),
            click: () =>
              this.setState({ extractAsCustomObjectDialogOpen: true }),
            enabled: hasSelectedInstances,
          },
          this.props.layout && {
            label: i18n._(t`Extract as an external layout`),
            click: () =>
              this.setState({ extractAsExternalLayoutDialogOpen: true }),
            enabled: hasSelectedInstances,
          },
        ].filter(Boolean),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Show/Hide instance properties`),
        click: () => this.toggleProperties(),
        enabled: hasSelectedInstances,
      },
    ].filter(Boolean);
  };

  setZoomFactor = (zoomFactor: number) => {
    if (this.editorDisplay) {
      this.editorDisplay.viewControls.setZoomFactor(zoomFactor);
    }
    this._sendSetZoom(zoomFactor);
  };

  _sendSetZoom(zoom: number): void {
    if (this.props.gameEditorMode === 'embedded-game') {
      const { previewDebuggerServer } = this.props;
      if (!previewDebuggerServer) return;
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'setZoom',
            payload: {
              zoom,
            },
          });
        });
    }
  }

  _sendZoomBy(zoomFactor: number): void {
    if (this.props.gameEditorMode === 'embedded-game') {
      const { previewDebuggerServer } = this.props;
      if (!previewDebuggerServer) return;
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'zoomBy',
            payload: {
              zoomFactor,
            },
          });
        });
    }
  }

  zoomIn = () => {
    if (this.editorDisplay) {
      this.editorDisplay.viewControls.zoomBy(zoomInFactor);
    }
    this._sendZoomBy(zoomInFactor);
  };

  zoomOut = () => {
    if (this.editorDisplay)
      this.editorDisplay.viewControls.zoomBy(zoomOutFactor);

    this._sendZoomBy(zoomOutFactor);
  };

  _onContextMenu = (
    x: number,
    y: number,
    ignoreSelectedObjectsForContextMenu?: boolean = false
  ) => {
    if (this.contextMenu) {
      this.contextMenu.open(x, y, {
        ignoreSelectedObjectsForContextMenu: !!ignoreSelectedObjectsForContextMenu,
      });
    }
  };

  isInstanceOf3DObject = (instance: gdInitialInstance): any => {
    const { project, globalObjectsContainer, objectsContainer } = this.props;

    const object = getObjectByName(
      globalObjectsContainer,
      objectsContainer,
      instance.getObjectName()
    );
    return (
      !!object &&
      gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        object.getType()
      ).isRenderedIn3D()
    );
  };

  buildContextMenu = (i18n: I18nType, options: any): any => {
    if (
      options.ignoreSelectedObjectsForContextMenu ||
      !this.instancesSelection.hasSelectedInstances()
    ) {
      return [
        {
          label: i18n._(t`Paste`),
          click: () => this.paste(),
          enabled:
            Clipboard.has(INSTANCES_CLIPBOARD_KIND) || hasClipboardImage(),
          accelerator: 'CmdOrCtrl+V',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Insert new...`),
          click: () => this._createNewObjectAndInstanceUnderCursor(),
        },
        { type: 'separator' },
        ...this.getContextMenuZoomItems(i18n),
        { type: 'separator' },
        ...this.getContextMenuLayoutItems(i18n),
      ];
    }
    const instances = this.instancesSelection.getSelectedInstances();
    if (
      instances.length === 1 ||
      uniq(instances.map(instance => instance.getObjectName())).length === 1
    ) {
      const { project, globalObjectsContainer, objectsContainer } = this.props;
      const objectName = instances[0].getObjectName();
      const object = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        objectName
      );

      const objectMetadata = object
        ? gd.MetadataProvider.getObjectMetadata(
            project.getCurrentPlatform(),
            object.getType()
          )
        : null;

      const objectExtensionName = object
        ? gd.PlatformExtension.getExtensionFromFullObjectType(object.getType())
        : null;
      const customObjectExtension =
        objectExtensionName &&
        project.hasEventsFunctionsExtensionNamed(objectExtensionName)
          ? project.getEventsFunctionsExtension(objectExtensionName)
          : null;

      return [
        object && project.hasEventsBasedObject(object.getType())
          ? {
              label: i18n._(t`Edit prefab`),
              enabled: isVariantEditable(
                gd.asCustomObjectConfiguration(object.getConfiguration()),
                project.getEventsBasedObject(object.getType()),
                customObjectExtension
              ),
              click: () => {
                const customObjectConfiguration = gd.asCustomObjectConfiguration(
                  object.getConfiguration()
                );
                this.props.onOpenEventBasedObjectVariantEditor(
                  gd.PlatformExtension.getExtensionFromFullObjectType(
                    object.getType()
                  ),
                  gd.PlatformExtension.getObjectNameFromFullObjectType(
                    object.getType()
                  ),
                  customObjectConfiguration.getVariantName()
                );
              },
            }
          : null,
        {
          label: i18n._(t`Edit object ${shortenString(objectName, 14)}`),
          click: () =>
            this.editObjectByName({
              objectName,
              initialTab: 'properties',
              shouldSelectTheObject: true,
            }),
        },
        {
          label: i18n._(t`Edit object variables`),
          click: () =>
            this.editObjectByName({
              objectName,
              initialTab: 'variables',
              shouldSelectTheObject: true,
            }),
        },
        {
          label: i18n._(t`Edit behaviors`),
          click: () =>
            this.editObjectByName({
              objectName,
              initialTab: 'behaviors',
              shouldSelectTheObject: true,
            }),
        },
        objectMetadata
          ? {
              label: i18n._(t`Edit effects`),
              click: () =>
                this.editObjectByName({
                  objectName,
                  initialTab: 'effects',
                  shouldSelectTheObject: true,
                }),
              enabled: objectMetadata.hasDefaultBehavior(
                'EffectCapability::EffectBehavior'
              ),
            }
          : null,
        { type: 'separator' },
        ...this.getContextMenuInstancesWiseItems(i18n),
        { type: 'separator' },
        ...this.getContextMenuLayoutItems(i18n),
      ].filter(Boolean);
    }
    return [
      ...this.getContextMenuInstancesWiseItems(i18n),
      { type: 'separator' },
      ...this.getContextMenuLayoutItems(i18n),
    ];
  };

  copySelection = ({
    useLastCursorPosition,
    pasteInTheForeground,
  }: CopyCutPasteOptions = {}) => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    let x = 0;
    let y = 0;
    if (this.editorDisplay) {
      const selectionAABB = this.editorDisplay.instancesHandlers.getSelectionAABB();
      x = selectionAABB.centerX();
      y = selectionAABB.centerY();
    }

    if (this.editorDisplay) {
      Clipboard.set(INSTANCES_CLIPBOARD_KIND, {
        x,
        y,
        pasteInTheForeground: !!pasteInTheForeground,
        instances: serializedSelection,
      });
    }
  };

  cutSelection = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    this.copySelection({ useLastCursorPosition, pasteInTheForeground: true });
    this.deleteSelection();
  };

  duplicateSelection = ({
    useLastCursorPosition,
  }: CopyCutPasteOptions = {}) => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const newInstances = addSerializedInstances({
      project: this.props.project,
      instancesContainer: this.props.initialInstances,
      copyReferential: [-2 * MOVEMENT_BIG_DELTA, -2 * MOVEMENT_BIG_DELTA],
      serializedInstances: serializedSelection,
      doesObjectExistInContext:
        // Instance duplication can only be done in the same scene, so no need to check
        () => true,
    });
    this._onInstancesAddedAndSendToEditor3D(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });

    // Immediately update the properties editor to ensure they keep no reference
    // to the deleted instances.
    this.forceUpdatePropertiesEditor();
  };

  _getScenePastePosition = (
    useLastCursorPosition?: boolean
  ): [number, number] => {
    const { editorDisplay } = this;
    if (!editorDisplay) return [0, 0];

    const viewPosition = editorDisplay.viewControls.getViewPosition();
    if (!viewPosition) return [0, 0];

    const lastPosition = useLastCursorPosition
      ? editorDisplay.viewControls.getLastCursorSceneCoordinates()
      : editorDisplay.viewControls.getLastContextMenuSceneCoordinates();
    return viewPosition.containsPoint(lastPosition[0], lastPosition[1])
      ? lastPosition
      : [viewPosition.getViewX(), viewPosition.getViewY()];
  };

  _pasteInstancesFromClipboard = ({
    clipboardContent,
    useLastCursorPosition,
  }: {|
    clipboardContent: any,
    useLastCursorPosition?: boolean,
  |}): boolean => {
    const instancesContent = SafeExtractor.extractArrayProperty(
      clipboardContent,
      'instances'
    );
    const x = SafeExtractor.extractNumberProperty(clipboardContent, 'x');
    const y = SafeExtractor.extractNumberProperty(clipboardContent, 'y');
    const pasteInTheForeground =
      SafeExtractor.extractBooleanProperty(
        clipboardContent,
        'pasteInTheForeground'
      ) || false;
    if (x === null || y === null || instancesContent === null) return false;

    const newInstances = addSerializedInstances({
      project: this.props.project,
      instancesContainer: this.props.initialInstances,
      copyReferential: [x, y],
      serializedInstances: instancesContent,
      addInstancesInTheForeground: pasteInTheForeground,
      doesObjectExistInContext: objectName =>
        this.props.projectScopedContainersAccessor
          .get()
          .getObjectsContainersList()
          .hasObjectNamed(objectName),
    });

    this._onInstancesAddedAndSendToEditor3D(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });

    const { editorDisplay } = this;
    if (editorDisplay) {
      const position = this._getScenePastePosition(useLastCursorPosition);
      for (const instance of newInstances) {
        instance.setX(instance.getX() + position[0]);
        instance.setY(instance.getY() + position[1]);
      }
      editorDisplay.instancesHandlers.snapSelection(newInstances);
      this._sendUpdatedInstances(newInstances);
    }

    // Immediately update the properties editor to ensure they keep no reference
    // to the deleted instances.
    this.forceUpdatePropertiesEditor();
    return true;
  };

  _pasteImageFromClipboard = async ({
    useLastCursorPosition,
  }: CopyCutPasteOptions = {}) => {
    if (!hasClipboardImage()) return;

    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (
      storageProvider.internalName !== 'LocalFile' ||
      !this.props.project.getProjectFile()
    ) {
      Window.showMessageBox(
        'Images can only be pasted into saved local projects.',
        'info'
      );
      return;
    }

    try {
      const imageFilePath = writeImageFromClipboardToProjectFolder(
        this.props.project
      );
      if (!imageFilePath) return;

      const isTheFirstSpriteObjectInProject = !gd.UsedObjectTypeFinder.scanProject(
        this.props.project,
        'Sprite'
      );
      const object = await createSpriteObjectFromImageFile({
        project: this.props.project,
        objectsContainer: this.props.objectsContainer,
        imageFilePath,
      });
      this._onObjectsCreated([object], isTheFirstSpriteObjectInProject);
      this._addInstancesForObjectsAtPosition(
        [object],
        this._getScenePastePosition(useLastCursorPosition)
      );
      if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
      await this.props.resourceManagementProps.onFetchNewlyAddedResources();
      this.props.resourceManagementProps.onNewResourcesAdded();
    } catch (error) {
      console.error('Unable to create Sprite object from pasted image:', error);
      Window.showMessageBox(
        'Unable to create a Sprite object from the pasted image.',
        'error'
      );
    }
  };

  paste = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
    if (
      this._pasteInstancesFromClipboard({
        clipboardContent,
        useLastCursorPosition,
      })
    ) {
      return;
    }

    this._pasteImageFromClipboard({ useLastCursorPosition });
  };

  extractAsExternalLayout = (chosenName: string) => {
    const { project, layout, onExtractAsExternalLayout } = this.props;
    if (!layout || !onExtractAsExternalLayout) return;

    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const newName = newNameGenerator(chosenName, name =>
      project.hasExternalLayoutNamed(name)
    );
    const newExternalLayout = project.insertNewExternalLayout(
      newName,
      project.getExternalLayoutsCount()
    );
    newExternalLayout.setAssociatedLayout(layout.getName());

    for (const serializedInstance of serializedSelection) {
      const instance = new gd.InitialInstance();
      unserializeFromJSObject(
        instance,
        serializedInstance,
        'unserializeFrom',
        project
      );
      newExternalLayout
        .getInitialInstances()
        .insertInitialInstance(instance)
        .resetPersistentUuid();
      instance.delete();
    }

    this.deleteSelection();

    this.setState({ extractAsExternalLayoutDialogOpen: false });

    onExtractAsExternalLayout(newName);
  };

  extractAsCustomObject = async (
    chosenExtensionName: string,
    isNewExtension: boolean,
    chosenEventsBasedObjectName: string,
    shouldRemoveSceneObjectsWhenNoMoreInstance: boolean
  ) => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      initialInstances,
      onExtractAsEventBasedObject,
    } = this.props;
    const { editorDisplay, deleteSelection, instancesSelection } = this;
    // $FlowFixMe[constant-condition]
    if (!onExtractAsEventBasedObject) return;

    let selectionAABB = new Rectangle();
    if (this.props.gameEditorMode === 'embedded-game') {
      const { previewDebuggerServer } = this.props;
      if (!previewDebuggerServer) return;
      try {
        const answer = await previewDebuggerServer.sendMessageWithResponse({
          command: 'getSelectionAABB',
        });
        selectionAABB.set({
          left: answer.payload.minX,
          top: answer.payload.minY,
          right: answer.payload.maxX,
          bottom: answer.payload.maxY,
          zMin: answer.payload.minZ,
          zMax: answer.payload.maxZ,
        });
      } catch (error) {
        console.error("Can't get the selection AABB.", error);
      }
    } else {
      if (!editorDisplay) return;
      selectionAABB = editorDisplay.instancesHandlers.getSelectionAABB();
    }
    extractAsCustomObject({
      project,
      globalObjects: globalObjectsContainer,
      sceneObjects: objectsContainer,
      initialInstances,
      chosenExtensionName,
      isNewExtension,
      chosenEventsBasedObjectName,
      shouldRemoveSceneObjectsWhenNoMoreInstance,
      selectedInstances: instancesSelection.getSelectedInstances(),
      selectionAABB,
      deleteSelection,
      onExtractAsEventBasedObject,
    });

    this.setState({ extractAsCustomObjectDialogOpen: false });
  };

  onSelectAllInstancesOfObjectInLayout = (objectName: string) => {
    const { initialInstances } = this.props;
    const instancesToSelect = getInstancesInLayoutForObject(
      initialInstances,
      objectName
    );
    this._setSelectedInstances(instancesToSelect, false);
    this.forceUpdateInstancesList();
    this._onInstancesSelected(instancesToSelect);
  };

  updateBehaviorsSharedData = () => {
    const { layout, project } = this.props;
    if (layout) {
      gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
    } else {
      // TODO EBO: refactoring for custom objects.
    }
  };

  forceUpdateObjectsList = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
  };

  forceUpdateObjectGroupsList = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdateObjectGroupsList();
  };

  forceUpdateLayersList = () => {
    // The selected layer could have been deleted when editing a linked external layout.
    if (!this.props.layersContainer.hasLayerNamed(this.state.chosenLayer)) {
      this.setState({
        chosenLayer: getTopLayerName(this.props.layersContainer),
      });
    }
    if (this.editorDisplay) this.editorDisplay.forceUpdateLayersList();
  };

  forceUpdateInstancesList = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdateInstancesList();
  };

  forceUpdatePropertiesEditor = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdatePropertiesEditor();
  };

  forceUpdateCustomObjectRenderedInstances = async (
    editedEventsBasedObject: gdEventsBasedObject,
    {
      editedObject,
      hasResourceChanged = false,
    }: EventsBasedObjectChildrenEditedOptions = {}
  ) => {
    const { project, projectScopedContainersAccessor } = this.props;

    // Reset the custom object renderers FIRST, synchronously. When an
    // events-based object is edited (or an edition is cancelled), its variants'
    // InitialInstancesContainer is freed and recreated (via
    // EventsFunctionsExtension.unserializeFrom /
    // complyVariantsToEventsBasedObject). The cached child renderers still hold
    // references to the freed instances; if a render frame happens before they
    // are reset, RenderedCustomObjectInstance.update() iterates over a freed
    // InitialInstancesContainer and crashes with a use-after-free. Resetting
    // before the (async) resource reload drops those stale references so the
    // next frame rebuilds them from the fresh container.
    // /!\ This reset must stay unconditional (every object) so no stale
    // reference to a freed container survives, even though the reset below (after
    // the reload) is scoped to the objects actually affected by the edit.
    const { editorDisplay } = this;
    if (editorDisplay) {
      projectScopedContainersAccessor.forEachObject(object => {
        editorDisplay.instancesHandlers.resetInstanceRenderersFor(
          object.getName()
        );
      });
    }

    // Only the resources of the object that was actually edited may need to be
    // reloaded from the disk, and only if a resource really changed.
    const objectResourceNames =
      hasResourceChanged && editedObject
        ? getImageResourceNamesForEditedObject(project, editedObject)
        : [];

    // _reloadResources also refreshes the objects list and resets the renderers
    // of every object *directly* using these resources (custom objects nesting
    // the edited one are handled below). The textures are only read again from
    // the disk when a resource really changed.
    await this._reloadResources(objectResourceNames, 'custom object edited', {
      reloadFromDisk: hasResourceChanged,
    });
    // Reset again after resources have been reloaded so renderers that were
    // rebuilt (with possibly outdated textures) during the await are refreshed
    // with the freshly loaded resources. Only the edited object and the objects
    // depending on the edited events-based object need to be reset.
    const editorDisplayAfterReload = this.editorDisplay;
    if (editorDisplayAfterReload) {
      const resetObjectNames = [];
      projectScopedContainersAccessor.forEachObject(object => {
        if (
          shouldResetObjectRendererForCustomObjectChildrenEdit({
            project,
            object,
            editedEventsBasedObject,
            editedObject,
          })
        ) {
          resetObjectNames.push(object.getName());
          editorDisplayAfterReload.instancesHandlers.resetInstanceRenderersFor(
            object.getName()
          );
        }
      });
      if (resetObjectNames.length > 0) {
        console.info(
          `Resetting renderers in "${this._getReloadContextName()}" of the edited object and objects depending on "${editedEventsBasedObject.getName()}": ${resetObjectNames.join(
            ', '
          )}.`
        );
      }
    }
  };

  forceUpdateRenderedInstancesOfObject = (
    object: gdObject,
    hasResourceChanged: boolean = true
  ) => {
    const { project } = this.props;
    const objectResourceNames = getImageResourceNamesForEditedObject(
      project,
      object
    );

    this._reloadResources(objectResourceNames, 'object edited', {
      reloadFromDisk: hasResourceChanged,
    });
  };

  render(): any {
    const {
      project,
      projectScopedContainersAccessor,
      layout,
      eventsFunctionsExtension,
      eventsBasedObject,
      eventsBasedObjectVariant,
      layersContainer,
      initialInstances,
      resourceManagementProps,
      isActive,
    } = this.props;
    const { editedObjectWithContext } = this.state;

    // In theory, we do everything to never have a objectFolderOrObjectWithContext pointing to a dead object,
    // but to be safe we explicitly check if they are dead.
    const selectedObjectFolderOrObjectsWithContext = this.state.selectedObjectFolderOrObjectsWithContext.filter(
      objectFolderOrObjectWithContext => {
        return !!exceptionallyGuardAgainstDeadObject(
          objectFolderOrObjectWithContext.objectFolderOrObject
        );
      }
    );

    const variablesEditedAssociatedObjectName = this.state
      .variablesEditedInstance
      ? this.state.variablesEditedInstance.getObjectName()
      : null;
    const variablesEditedAssociatedObject = variablesEditedAssociatedObjectName
      ? getObjectByName(
          this.props.globalObjectsContainer,
          this.props.objectsContainer,
          variablesEditedAssociatedObjectName
        )
      : null;

    // Deactivate prettier on this variable to prevent spaces to be added by
    // line breaks.
    // prettier-ignore
    const infoBarMessage =
      this.state.invisibleLayerOnWhichInstancesHaveJustBeenAdded !== null ? (
        <Trans>
          You just added an instance to a hidden layer
          ("{this.state.invisibleLayerOnWhichInstancesHaveJustBeenAdded || (
            <Trans>Base layer</Trans>
          )}"). Open the layer panel to make it visible.
        </Trans>
      ) : null;

    const isCustomVariant = eventsBasedObject
      ? eventsBasedObject.getDefaultVariant() !== eventsBasedObjectVariant
      : false;

    return (
      <I18n>
        {({ i18n }) => (
          <ResponsiveWindowMeasurer>
            {({ isMobile }) => {
              const EditorsDisplay = isMobile
                ? SwipeableDrawerEditorsDisplay
                : MosaicEditorsDisplay;
              return (
                <div
                  style={styles.container}
                  id="scene-editor"
                  data-active={isActive ? 'true' : undefined}
                >
                  <UseSceneEditorCommands
                    project={project}
                    layersContainer={this.props.layersContainer}
                    globalObjectsContainer={this.props.globalObjectsContainer}
                    objectsContainer={this.props.objectsContainer}
                    onEditObject={this.editObject}
                    onEditObjectVariables={object => {
                      this.editObject(object, 'variables');
                    }}
                    onOpenSceneProperties={this.openSceneProperties}
                    onEditObjectGroup={this._editObjectGroup}
                    onEditLayerEffects={this.editLayerEffects}
                    onEditLayer={this.editLayer}
                  />
                  <EditorsDisplay
                    ref={ref => (this.editorDisplay = ref)}
                    gameEditorMode={this.props.gameEditorMode}
                    onRestartInGameEditor={this.props.onRestartInGameEditor}
                    showRestartInGameEditorAfterErrorButton={
                      this.props.showRestartInGameEditorAfterErrorButton
                    }
                    project={project}
                    layout={layout}
                    eventsFunctionsExtension={eventsFunctionsExtension}
                    eventsBasedObject={eventsBasedObject}
                    eventsBasedObjectVariant={eventsBasedObjectVariant}
                    getContentAABB={this.getContentAABB}
                    layersContainer={this.props.layersContainer}
                    globalObjectsContainer={this.props.globalObjectsContainer}
                    objectsContainer={this.props.objectsContainer}
                    projectScopedContainersAccessor={
                      projectScopedContainersAccessor
                    }
                    initialInstances={initialInstances}
                    instancesSelection={this.instancesSelection}
                    onSelectInstances={this._onSelectInstances}
                    onInstancesModified={this._onInstancesModified}
                    onAddObjectInstance={this.addInstanceOnTheScene}
                    chosenLayer={this.state.chosenLayer}
                    onChooseLayer={this._onChooseLayer}
                    selectedLayer={this.state.selectedLayer}
                    onSelectLayer={this._onSelectLayer}
                    editLayer={this.editLayer}
                    editLayerEffects={this.editLayerEffects}
                    selectedObjectGroup={this.state.selectedObjectGroup}
                    onSelectObjectGroup={this._onSelectObjectGroup}
                    editInstanceVariables={this.editInstanceVariables}
                    editObjectByName={this.editObjectByName}
                    editObjectInPropertiesPanel={
                      this.editObjectInPropertiesPanel
                    }
                    selectedObjectFolderOrObjectsWithContext={
                      selectedObjectFolderOrObjectsWithContext
                    }
                    onLayerRenamed={this._onLayerRenamed}
                    onLayersModified={() => this._onLayersModified(false)}
                    onBackgroundColorChanged={this._sendSetBackgroundColor}
                    onLayersVisibilityInEditorChanged={
                      this._onLayersVisibilityInEditorChanged
                    }
                    onRemoveLayer={this._onRemoveLayer}
                    tileMapTileSelection={this.state.tileMapTileSelection}
                    onSelectTileMapTile={this.onSelectTileMapTile}
                    onExportAssets={this.openObjectExporterDialog}
                    onImportAssets={this.openObjectImporterDialog}
                    onDeleteObjects={this._onDeleteObjects}
                    getValidatedObjectOrGroupName={
                      this._getValidatedObjectOrGroupName
                    }
                    onCreateObjectGroup={this._createObjectGroup}
                    onEditObjectGroup={this._editObjectGroup}
                    onDeleteObjectGroup={this._onDeleteObjectGroup}
                    onRenameObjectGroup={this._onRenameObjectGroup}
                    canObjectOrGroupBeGlobal={this.canObjectOrGroupBeGlobal}
                    updateBehaviorsSharedData={this.updateBehaviorsSharedData}
                    onEditObject={this.editObject}
                    onOpenEventBasedObjectEditor={
                      this.props.onOpenEventBasedObjectEditor
                    }
                    onOpenEventBasedObjectVariantEditor={
                      this.props.onOpenEventBasedObjectVariantEditor
                    }
                    onOpenPrefabDetailEditor={
                      this.props.onOpenPrefabDetailEditor
                    }
                    onOpenPrefabSettings={this.props.onOpenPrefabSettings}
                    onDeleteEventsBasedObjectVariant={
                      this.props.onDeleteEventsBasedObjectVariant
                    }
                    onRenameObjectFolderOrObjectWithContextFinish={
                      this._onRenameObjectFolderOrObjectWithContextFinish
                    }
                    onObjectCreated={this._onObjectCreated}
                    onObjectEdited={this._onObjectEdited}
                    onObjectsModified={this._onObjectsModified}
                    onEffectAdded={this.props.onEffectAdded}
                    onObjectFolderOrObjectWithContextSelected={
                      this._onObjectFolderOrObjectWithContextSelected
                    }
                    onSetAsGlobalObject={this._onSetAsGlobalObject}
                    historyHandler={{
                      undo: this.undo,
                      redo: this.redo,
                      canUndo: () => canUndo(this.state.history),
                      canRedo: () => canRedo(this.state.history),
                      saveToHistory: (changeContext?: any) =>
                        this.setState({
                          history: saveToHistory(
                            this.state.history,
                            this.props.initialInstances,
                            'EDIT',
                            changeContext || {
                              operationLabel: 'Edit properties',
                            }
                          ),
                        }),
                    }}
                    instancesEditorShortcutsCallbacks={{
                      onCopy: () =>
                        this.copySelection({ useLastCursorPosition: true }),
                      onCut: () =>
                        this.cutSelection({ useLastCursorPosition: true }),
                      onPaste: () =>
                        this.paste({ useLastCursorPosition: true }),
                      onDuplicate: () =>
                        this.duplicateSelection({
                          useLastCursorPosition: true,
                        }),
                      onDelete: this.deleteSelection,
                      onUndo: this.undo,
                      onRedo: this.redo,
                      onZoomOut: this.zoomOut,
                      onZoomIn: this.zoomIn,
                      onShift1: this.zoomToFitSelection,
                      onShift2: this.zoomToInitialPosition,
                      onShift3: this.zoomToFitContent,
                      onFocusOnSelection: this.focusOnSelection,
                    }}
                    onInstancesAdded={this._onInstancesAddedAndSendToEditor3D}
                    onInstancesSelected={this._onInstancesSelected}
                    onInstanceDoubleClicked={this._onInstanceDoubleClicked}
                    onInstancesMoved={this._onInstancesMovedAndSendToEditor3D}
                    onInstancesResized={this._onInstancesResized}
                    onInstancesRotated={this._onInstancesRotated}
                    onImageFilesDropped={this._onImageFilesDropped}
                    on3DModelFilesDropped={this._on3DModelFilesDropped}
                    onCustomObjectDropped={this._onCustomObjectDropped}
                    isInstanceOf3DObject={this.isInstanceOf3DObject}
                    onSelectAllInstancesOfObjectInLayout={
                      this.onSelectAllInstancesOfObjectInLayout
                    }
                    instancesEditorSettings={this.state.instancesEditorSettings}
                    onInstancesEditorSettingsMutated={
                      this._onInstancesEditorSettingsMutated
                    }
                    onContextMenu={this._onContextMenu}
                    resourceManagementProps={this.props.resourceManagementProps}
                    hotReloadPreviewButtonProps={
                      this.props.hotReloadPreviewButtonProps
                    }
                    isActive={isActive}
                    onOpenedEditorsChanged={this.updateToolbar}
                    lastSelectionType={this.state.lastSelectionType}
                    onWillInstallExtension={this.props.onWillInstallExtension}
                    onExtensionInstalled={this.props.onExtensionInstalled}
                    editorViewPosition2D={this.editorViewPosition2D}
                    onEventsBasedObjectChildrenEdited={
                      this.props.onEventsBasedObjectChildrenEdited
                    }
                    openSceneVariables={this.openSceneVariables}
                  />
                  <React.Fragment>
                    {editedObjectWithContext && (
                      <ObjectEditorDialog
                        open
                        object={editedObjectWithContext.object}
                        initialTab={this.state.editedObjectInitialTab}
                        project={project}
                        layout={layout}
                        eventsFunctionsExtension={eventsFunctionsExtension}
                        eventsBasedObject={eventsBasedObject}
                        layersContainer={layersContainer}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        resourceManagementProps={resourceManagementProps}
                        onComputeAllVariableNames={() => {
                          const { editedObjectWithContext } = this.state;
                          if (!editedObjectWithContext) return [];
                          if (!layout) return [];

                          return EventsRootVariablesFinder.findAllObjectVariables(
                            project.getCurrentPlatform(),
                            project,
                            layout, // TODO: Handle this for custom objects?
                            editedObjectWithContext.object.getName()
                          );
                        }}
                        onCancel={() => {
                          if (editedObjectWithContext) {
                            this.props.onObjectEdited(
                              editedObjectWithContext,
                              false
                            );
                          }
                          this.editObject(null);
                          // An hot-reload for an edited image may be on hold.
                          this.props.triggerHotReloadInGameEditorIfNeeded();
                        }}
                        getValidatedObjectOrGroupName={newName =>
                          this._getValidatedObjectOrGroupName(
                            newName,
                            editedObjectWithContext.global,
                            i18n
                          )
                        }
                        onRename={newName => {
                          this._onRenameEditedObject(newName);
                        }}
                        onApply={(
                          hasResourceChanged: boolean,
                          hasAnyEffectBeenAdded: boolean
                        ) => {
                          // The editedObjectWithContext state must be reset
                          // because no hot-reload can happen while an object is edited.
                          const appliedObjectWithContext = editedObjectWithContext;
                          this.editObject(null, undefined, () => {
                            // When resource parameters changed an hot-reload is
                            // already triggered by _onObjectEdited.
                            if (!hasResourceChanged) {
                              // An hot-reload for an edited image may be on hold.
                              this.props.triggerHotReloadInGameEditorIfNeeded();
                            }
                            if (appliedObjectWithContext) {
                              this._onObjectEdited(
                                appliedObjectWithContext,
                                hasResourceChanged
                              );
                            }
                            if (hasAnyEffectBeenAdded) {
                              this.props.onEffectAdded();
                            }
                          });
                        }}
                        hotReloadPreviewButtonProps={
                          this.props.hotReloadPreviewButtonProps
                        }
                        onUpdateBehaviorsSharedData={() =>
                          this.updateBehaviorsSharedData()
                        }
                        openBehaviorEvents={this.props.openBehaviorEvents}
                        onWillInstallExtension={
                          this.props.onWillInstallExtension
                        }
                        onExtensionInstalled={this.props.onExtensionInstalled}
                        onOpenEventBasedObjectEditor={
                          this.props.onOpenEventBasedObjectEditor
                        }
                        onOpenEventBasedObjectVariantEditor={(
                          extensionName: string,
                          eventsBasedObjectName: string,
                          variantName: string
                        ) => {
                          this.props.onOpenEventBasedObjectVariantEditor(
                            extensionName,
                            eventsBasedObjectName,
                            variantName
                          );
                          if (editedObjectWithContext) {
                            this._onObjectEdited(
                              editedObjectWithContext,
                              false
                            );
                          }
                          this.editObject(null);
                        }}
                        onDeleteEventsBasedObjectVariant={
                          this.props.onDeleteEventsBasedObjectVariant
                        }
                        isBehaviorListLocked={isCustomVariant}
                        isVariableListLocked={isCustomVariant}
                      />
                    )}
                  </React.Fragment>
                  {this.state.isAssetExporterDialogOpen && layout && (
                    <ObjectExporterDialog
                      project={project}
                      layout={layout}
                      onClose={() => this.openObjectExporterDialog(false)}
                    />
                  )}
                  {this.state.isAssetImporterDialogOpen && layout && (
                    <ObjectImporterDialog
                      project={project}
                      objectsContainer={this.props.objectsContainer}
                      resourceManagementProps={resourceManagementProps}
                      onEventsBasedObjectChildrenEdited={
                        this.props.onEventsBasedObjectChildrenEdited
                      }
                      onWillInstallExtension={this.props.onWillInstallExtension}
                      onExtensionInstalled={this.props.onExtensionInstalled}
                      onClose={() => {
                        this.openObjectImporterDialog(false);
                        if (this.editorDisplay) {
                          this.editorDisplay.forceUpdateObjectsList();
                          this.props.onObjectListsModified({
                            isNewObjectTypeUsed: true,
                          });
                        }
                      }}
                    />
                  )}
                  {(this.state.editedGroup ||
                    this.state.isCreatingNewGroup) && (
                    <ObjectGroupEditorDialog
                      project={project}
                      projectScopedContainersAccessor={
                        projectScopedContainersAccessor
                      }
                      group={this.state.editedGroup}
                      initialTab={this.state.editedGroupInitialTab}
                      objectsContainer={this.props.objectsContainer}
                      globalObjectsContainer={this.props.globalObjectsContainer}
                      initialInstances={this.props.initialInstances}
                      onCancel={this._closeObjectGroupEditorDialog}
                      onApply={this._closeObjectGroupEditorDialog}
                      onObjectGroupAdded={(objectGroup: gdObjectGroup) => {
                        if (this.editorDisplay) {
                          this.editorDisplay.scrollObjectGroupsListToObjectGroup(
                            objectGroup
                          );
                        }
                        // TODO Set the `global` attribute correctly.
                        this.props.onObjectGroupEdited({
                          group: objectGroup,
                          global: false,
                        });
                      }}
                      onComputeAllVariableNames={() => {
                        const { editedGroup } = this.state;
                        if (!editedGroup) return [];
                        if (!layout) return [];

                        return EventsRootVariablesFinder.findAllObjectVariables(
                          project.getCurrentPlatform(),
                          project,
                          layout, // TODO: Handle this for custom objects?
                          editedGroup.getName()
                        );
                      }}
                      isVariableListLocked={isCustomVariant}
                      isObjectListLocked={isCustomVariant}
                      isGroupGlobal={
                        !!this.state.editedGroup &&
                        this._isObjectGroupGlobal(this.state.editedGroup)
                      }
                      onRenameGroup={this._onRenameObjectGroup}
                      getValidatedObjectOrGroupName={(newName, global) =>
                        this._getValidatedObjectOrGroupName(
                          newName,
                          global,
                          i18n
                        )
                      }
                    />
                  )}
                  {this.state.newObjectDialogOpen && (
                    <NewObjectDialog
                      onClose={() =>
                        this.setState({ newObjectDialogOpen: false })
                      }
                      onCreateNewObject={this._addObjectFromNewObjectDialog}
                      onObjectsAddedFromAssets={
                        this._onObjectsAddedFromAssetsFromNewObjectDialog
                      }
                      project={project}
                      layout={layout}
                      eventsFunctionsExtension={eventsFunctionsExtension}
                      eventsBasedObject={eventsBasedObject}
                      objectsContainer={this.props.objectsContainer}
                      resourceManagementProps={resourceManagementProps}
                      targetObjectFolderOrObjectWithContext={null}
                      onWillInstallExtension={this.props.onWillInstallExtension}
                      onExtensionInstalled={this.props.onExtensionInstalled}
                    />
                  )}
                  {this.state.setupGridOpen && (
                    <SetupGridDialog
                      instancesEditorSettings={
                        this.state.instancesEditorSettings
                      }
                      onChangeInstancesEditorSettings={
                        this.setInstancesEditorSettings
                      }
                      onCancel={() => this.openSetupGrid(false)}
                      onApply={() => this.openSetupGrid(false)}
                    />
                  )}
                  {!!this.state.variablesEditedInstance &&
                    !!variablesEditedAssociatedObject && (
                      <ObjectInstanceVariablesDialog
                        project={project}
                        layout={layout}
                        objectsContainer={this.props.objectsContainer}
                        globalObjectsContainer={
                          this.props.globalObjectsContainer
                        }
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        objectInstance={this.state.variablesEditedInstance}
                        open
                        onCancel={() => this.editInstanceVariables(null)}
                        onApply={() => this.editInstanceVariables(null)}
                        onEditObjectVariables={() => {
                          this.editObject(
                            variablesEditedAssociatedObject,
                            'variables'
                          );
                          this.editInstanceVariables(null);
                        }}
                        hotReloadPreviewButtonProps={
                          this.props.hotReloadPreviewButtonProps
                        }
                        isListLocked={true}
                        initiallySelectedVariable={null}
                      />
                    )}
                  {!!this.state.layerRemoved &&
                    this.state.onCloseLayerRemoveDialog && (
                      <LayerRemoveDialog
                        open
                        project={project}
                        layout={layout}
                        layersContainer={this.props.layersContainer}
                        initialInstances={initialInstances}
                        layerRemoved={this.state.layerRemoved}
                        onClose={this.state.onCloseLayerRemoveDialog}
                      />
                    )}
                  {!!this.state.editedLayer && (
                    <LayerEditorDialog
                      project={project}
                      resourceManagementProps={
                        this.props.resourceManagementProps
                      }
                      projectScopedContainersAccessor={
                        this.props.projectScopedContainersAccessor
                      }
                      layout={layout}
                      eventsFunctionsExtension={eventsFunctionsExtension}
                      eventsBasedObject={eventsBasedObject}
                      layer={this.state.editedLayer}
                      initialInstances={initialInstances}
                      initialTab={this.state.editedLayerInitialTab}
                      onApply={(hasAnyEffectBeenAdded: boolean) => {
                        this._onLayersModified(hasAnyEffectBeenAdded);
                        this.setState({
                          editedLayer: null,
                        });
                      }}
                      onCancel={() =>
                        this.setState({
                          editedLayer: null,
                        })
                      }
                      hotReloadPreviewButtonProps={
                        this.props.hotReloadPreviewButtonProps
                      }
                    />
                  )}
                  {this.state.scenePropertiesDialogOpen && layout && (
                    <ScenePropertiesDialog
                      open
                      project={project}
                      layout={layout}
                      onClose={() => this.openSceneProperties(false)}
                      onApply={() => this.openSceneProperties(false)}
                      onEditVariables={() => this.openSceneVariables(true)}
                      onOpenMoreSettings={this.props.onOpenMoreSettings}
                      resourceManagementProps={
                        this.props.resourceManagementProps
                      }
                      projectScopedContainersAccessor={
                        this.props.projectScopedContainersAccessor
                      }
                      onBackgroundColorChanged={this._sendSetBackgroundColor}
                    />
                  )}
                  {this.state.scenePropertiesDialogOpen &&
                    eventsBasedObject &&
                    eventsBasedObjectVariant && (
                      <EventsBasedObjectScenePropertiesDialog
                        project={project}
                        eventsBasedObject={eventsBasedObject}
                        eventsBasedObjectVariant={eventsBasedObjectVariant}
                        onClose={() => this.openSceneProperties(false)}
                        onApply={() => {
                          this.openSceneProperties(false);

                          const { previewDebuggerServer } = this.props;
                          if (previewDebuggerServer) {
                            previewDebuggerServer
                              .getExistingEmbeddedGameFrameDebuggerIds()
                              .forEach(debuggerId => {
                                previewDebuggerServer.sendMessage(debuggerId, {
                                  command: 'updateInnerArea',
                                  payload: {
                                    areaMinX: eventsBasedObjectVariant.getAreaMinX(),
                                    areaMinY: eventsBasedObjectVariant.getAreaMinY(),
                                    areaMinZ: eventsBasedObjectVariant.getAreaMinZ(),
                                    areaMaxX: eventsBasedObjectVariant.getAreaMaxX(),
                                    areaMaxY: eventsBasedObjectVariant.getAreaMaxY(),
                                    areaMaxZ: eventsBasedObjectVariant.getAreaMaxZ(),
                                  },
                                });
                              });
                          }
                        }}
                        getContentAABB={this.getContentAABB}
                        onEventsBasedObjectChildrenEdited={
                          this.props.onEventsBasedObjectChildrenEdited
                        }
                      />
                    )}
                  {!!this.state.layoutVariablesDialogOpen && layout && (
                    <SceneVariablesDialog
                      open
                      project={project}
                      layout={layout}
                      onApply={() => this.openSceneVariables(false)}
                      onCancel={() => this.openSceneVariables(false)}
                      hotReloadPreviewButtonProps={
                        this.props.hotReloadPreviewButtonProps
                      }
                      isListLocked={false}
                      initiallySelectedVariable={null}
                    />
                  )}
                  <React.Fragment>
                    {this.state.extractAsExternalLayoutDialogOpen && layout && (
                      <ExtractAsExternalLayoutDialog
                        suggestedName={newNameGenerator(
                          i18n._(t`${layout.getName()} part`),
                          name => project.hasExternalLayoutNamed(name)
                        )}
                        onCancel={() =>
                          this.setState({
                            extractAsExternalLayoutDialogOpen: false,
                          })
                        }
                        onApply={chosenName =>
                          this.extractAsExternalLayout(chosenName)
                        }
                      />
                    )}
                    {this.state.extractAsCustomObjectDialogOpen && (
                      <ExtractAsCustomObjectDialog
                        project={project}
                        globalObjectsContainer={
                          this.props.globalObjectsContainer
                        }
                        objectsContainer={this.props.objectsContainer}
                        initialInstances={this.props.initialInstances}
                        selectedInstances={this.instancesSelection.getSelectedInstances()}
                        onCancel={() =>
                          this.setState({
                            extractAsCustomObjectDialogOpen: false,
                          })
                        }
                        onApply={this.extractAsCustomObject}
                      />
                    )}
                    <DismissableInfoBar
                      show={this.state.showAdditionalWorkInfoBar}
                      identifier={this.state.additionalWorkInfoBar.identifier}
                      message={i18n._(this.state.additionalWorkInfoBar.message)}
                      touchScreenMessage={i18n._(
                        this.state.additionalWorkInfoBar.touchScreenMessage
                      )}
                    />
                    <ContextMenu
                      ref={contextMenu => (this.contextMenu = contextMenu)}
                      buildMenuTemplate={this.buildContextMenu}
                    />
                  </React.Fragment>
                  <InfoBar
                    message={infoBarMessage}
                    duration={7000}
                    visible={!!infoBarMessage}
                    hide={() => this.onInstanceAddedOnInvisibleLayer(null)}
                  />
                </div>
              );
            }}
          </ResponsiveWindowMeasurer>
        )}
      </I18n>
    );
  }
}
