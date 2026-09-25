// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import LayerRemoveDialog from '../LayersList/LayerRemoveDialog';
import LayerEditorDialog from '../LayersList/LayerEditorDialog';
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
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import MosaicEditorsDisplayToolbar from './MosaicEditorsDisplay/Toolbar';
import SwipeableDrawerEditorsDisplayToolbar from './SwipeableDrawerEditorsDisplay/Toolbar';
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
  type CompositeTarget,
  type CompositeTargets,
  type RevertableActionType,
  type UndoAction,
  type RedoAction,
  canUndo,
  canRedo,
  getCompositeHistoryInitialState,
  savePartialValueToHistory,
  saveCommandToHistory,
  serializeCompositeTargets,
  refreshCompositeHistoryValue,
  getLastUndoableAction,
  getLastRedoableAction,
  undoComposite,
  redoComposite,
} from '../Utils/History';
import { diffInstancesSnapshots } from '../Utils/InstancesSnapshotDiff';
import '../UI/UndoRedoFlash.css';
import {
  getVariablesContainerHistoryTarget,
  getObjectsContainerHistoryTarget,
  getObjectGroupsContainerHistoryTarget,
} from './ObjectsAndVariablesHistoryTargets';
import {
  getChangedTopLevelKeys,
  findSerializedItemByName,
  getChangedVariableNodeIds,
  hasRemovedVariables,
} from './PropertyRowsFlashDiff';
import { getIntermediateNamedItemsStates } from './GranularNamedItemsHistorySteps';

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
import { shouldCloseOrCancel } from '../UI/KeyboardShortcuts/InteractionKeys';
import isDialogOpen from '../UI/OpenedDialogChecker';
import {
  getInstanceInLayoutWithPersistentUuid,
  getInstancesInLayoutForObject,
} from '../Utils/Layout';
import { zoomInFactor, zoomOutFactor } from '../Utils/ZoomUtils';
import debounce from 'lodash/debounce';
import { mapFor } from '../Utils/MapFor';
import MosaicEditorsDisplay from './MosaicEditorsDisplay';
import SwipeableDrawerEditorsDisplay from './SwipeableDrawerEditorsDisplay';
import {
  type SceneEditorsDisplayInterface,
  type InstancesModificationContext,
} from './EditorsDisplay.flow';
import { type FieldModificationContext } from '../CompactPropertiesEditor';
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
import {
  changeViewPosition,
  setCameraState,
  focusEmbeddedGameFrame,
} from '../EmbeddedGame/EmbeddedGameFrame';
import Rectangle from '../Utils/Rectangle';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';
import { type WillDeleteObjectChanges } from '../EditorFunctions/OutsideEditorChanges';
import {
  type EventsBasedObjectChildrenEditedOptions,
  getImageResourceNamesForEditedObject,
  shouldResetObjectRendererForCustomObjectChildrenEdit,
} from './CustomObjectResourceReload';
import { type LastSelectionType } from './EditorsDisplay.flow';
import { type ObjectGroupEditorTab } from '../ObjectGroupEditor/EditedObjectGroupEditorDialog';

const gd: libGDevelop = global.gd;

// How the attributes of a serialized layer (as found in the history
// snapshots) map to the field ids of `CompactLayerPropertiesSchema` (the
// visibility and the lock of a layer are shown in the layers list instead).
const serializedLayerKeyToPropertyFieldId: { [string]: string } = {
  renderingType: 'Rendering type',
  cameraType: 'Camera type',
  defaultCameraBehavior: 'Default camera behavior',
  camera3DFieldOfView: 'Field of view',
  camera3DNearPlaneDistance: 'Near plane distance',
  camera3DFarPlaneDistance: 'Far plane distance',
  camera2DPlaneMaxDrawingDistance: 'Maximum 2D drawing distance',
  followBaseLayerCamera: 'Automatically follow the base layer',
  ambientLightColorR: 'Ambient light color',
  ambientLightColorG: 'Ambient light color',
  ambientLightColorB: 'Ambient light color',
};

// Same for the scene properties (see `CompactScenePropertiesSchema` and the
// `sceneProperties` history target).
const scenePropertyKeyToPropertyFieldId: { [string]: string } = {
  backgroundColorRed: 'BackgroundColor',
  backgroundColorGreen: 'BackgroundColor',
  backgroundColorBlue: 'BackgroundColor',
  windowDefaultTitle: 'WindowTitle',
  stopSoundsOnStartup: 'ShouldStopSoundsOnStartup',
  resourcesPreloading: 'ResourcesPreloading',
  resourcesUnloading: 'ResourcesUnloading',
};

// How the attributes of a serialized instance (as found in the history
// snapshots) map to the field ids of the compact instance properties editor
// (see `CompactInstancePropertiesSchema.js`).
const serializedInstanceKeyToPropertyFieldId: { [string]: string } = {
  x: 'X',
  y: 'Y',
  z: 'Z',
  angle: 'Angle',
  rotationX: 'Rotation X',
  rotationY: 'Rotation Y',
  zOrder: 'Z Order',
  layer: 'Layer',
  width: 'Width',
  height: 'Height',
  depth: 'Depth',
  // Toggling the custom size is seen in the size fields.
  customSize: 'Width',
  customDepth: 'Depth',
  hidden: 'Hide instance',
  locked: 'Lock instance',
  opacity: 'Opacity',
  keepRatio: 'Keep ratio',
  // The 3 flip toggles are rendered as buttons inside a single group (see
  // `CompactToggleButtons`), which is the only element of the group with an
  // id - individual buttons aren't addressable, so all 3 flash it.
  flippedX: 'Flip',
  flippedY: 'Flip',
  flippedZ: 'Flip',
};

const BASE_LAYER_NAME = '';
const INSTANCES_CLIPBOARD_KIND = 'Instances';

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

// What is selected, remembered by name so it can be found again after the
// history is applied (the actual objects/groups/layers can be destroyed
// and re-created).
type SelectionByName = {|
  lastSelectionType: LastSelectionType,
  selectedObjectNames: Array<string>,
  selectedObjectGroupName: ?string,
  selectedLayerName: ?string,
|};

// Where the change of an undoable step was made: an undo/redo reveals the
// change where it was made. For a panel edit of an object/group/layer's own
// properties (as opposed to an instance's, already revealed by selecting
// the touched instances), `revealSelection` is what was selected when the
// change was made - so an undo/redo re-selects the actual object/group/
// layer that was edited, not whatever happens to be selected right before
// the undo/redo is triggered (see `_recordHistoryStep`/
// `_queuePanelHistorySave`, which fill it in automatically).
type HistoryChangeContext =
  | {| source: 'canvas' |}
  | {|
      source: 'panel',
      editorId: EditorId,
      revealSelection?: SelectionByName,
    |};

// A change that can't be captured by a snapshot of the history targets, as
// it refactors the whole project (see `_applyHistoryCommand`).
type HistoryCommand = {|
  type: 'renameObject' | 'renameObjectGroup',
  global: boolean,
  oldName: string,
  newName: string,
|};

// The keys of the history targets (see `_getHistoryTargets`) - grouped as
// the callers of `_recordHistoryStep` usually can't tell them apart.
const OBJECTS_HISTORY_KEYS = ['objects', 'globalObjects'];
const OBJECT_GROUPS_HISTORY_KEYS = ['objectGroups', 'globalObjectGroups'];
const VARIABLES_HISTORY_KEYS = ['sceneVariables', 'globalVariables'];
// Targets renamed along with an object or a group (see `_renameObjectOrGroup`).
const REFACTORED_HISTORY_KEYS = [
  ...OBJECTS_HISTORY_KEYS,
  ...OBJECT_GROUPS_HISTORY_KEYS,
  'instances',
];
// Targets that other editors (other scenes) can change too.
const SHARED_HISTORY_KEYS = [
  'globalObjects',
  'globalObjectGroups',
  'globalVariables',
];
// In development, check after each step that no target changed without
// being declared (such a change would be silently reverted by an undo).
const CHECK_UNDECLARED_HISTORY_CHANGES =
  // $FlowFixMe[cannot-resolve-name]
  process.env.NODE_ENV === 'development';

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
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onCreateNewExtensionWithBehavior:
    | ((project: gdProject, object: gdObject) => void)
    | null,
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
  newObjectInstanceSceneCoordinates: ?[number, number],
  invisibleLayerOnWhichInstancesHaveJustBeenAdded: string | null,
  extractAsExternalLayoutDialogOpen: boolean,
  extractAsCustomObjectDialogOpen: boolean,

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

type CopyCutPasteOptions = {|
  useLastCursorPosition?: boolean,
  pasteInTheForeground?: boolean,
|};

const editSceneIconReactNode = <EditSceneIcon />;

export default class SceneEditor extends React.Component<Props, State> {
  instancesSelection: InstancesSelection;
  contextMenu: ?ContextMenuInterface;
  editorDisplay: ?SceneEditorsDisplayInterface;
  resourceExternallyChangedCallbackId: ?string;
  unregisterDebuggerCallback: (() => void) | null = null;
  editorViewPosition2D: EditorViewPosition2D = { viewX: null, viewY: null };
  _reloadResourcesCounter: number = 0;

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
      newObjectInstanceSceneCoordinates: null,
      editedGroup: null,
      isCreatingNewGroup: false,
      editedGroupInitialTab: null,
      extractAsExternalLayoutDialogOpen: false,
      extractAsCustomObjectDialogOpen: false,

      instancesEditorSettings: initialInstancesEditorSettings,
      history: getCompositeHistoryInitialState(this._getHistoryTargets(), {
        historyMaxSize: 50,
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
      chosenLayer:
        initialInstancesEditorSettings.selectedLayer || BASE_LAYER_NAME,
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

    // When the editor tab becomes active again, the focus can be lost
    // (staying on the previous tab or on the document body): take it back
    // so the keyboard shortcuts work without a click in the editor. Same
    // when switching between the 2D and 3D editors, which don't listen to
    // the keyboard on the same element.
    if (!prevProps.isActive && this.props.isActive) {
      // Another editor may have changed the shared targets while this one
      // was inactive: refresh them so the next step is based on their
      // actual value (and an undo doesn't revert the other editor's change).
      this._refreshHistoryValue(SHARED_HISTORY_KEYS);
    }
    if (
      (!prevProps.isActive && this.props.isActive) ||
      prevProps.gameEditorMode !== this.props.gameEditorMode
    ) {
      this._ensureKeyboardFocusStaysInEditor();
    }
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
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
    if (this.unregisterDebuggerCallback) {
      this.unregisterDebuggerCallback();
      this.unregisterDebuggerCallback = null;
    }
    // Cancelled, not flushed: the history lives in the state of this
    // component, so there is nothing left to save it to.
    this._flushPendingPanelHistorySaveDebounced.cancel();
  }

  onEditorReloaded() {
    this._sendSelectedInstances();
  }

  getInstancesEditorSettings(): any {
    return this.state.instancesEditorSettings;
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

      this._recordHistoryStep('DELETE', { source: 'canvas' }, ['instances']);
      this.setState(
        {
          selectedObjectFolderOrObjectsWithContext: [],
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

  /**
   * The toolbar is rendered by the app outside of the editor: a click on
   * one of its buttons moves the focus on it, killing the editor keyboard
   * shortcuts (like undo/redo). Wrap the actions staying in the editor so
   * they take the focus back (actions opening a dialog are left untouched:
   * the dialog takes the focus).
   */
  _withFocusReturnedToEditor = (
    action: (...args: Array<any>) => void
  ): ((...args: Array<any>) => void) => (...args) => {
    action(...args);
    this._ensureKeyboardFocusStaysInEditor();
  };

  updateToolbar = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) return;

    if (editorDisplay.getName() === 'mosaic') {
      this.props.setToolbar(
        <MosaicEditorsDisplayToolbar
          gameEditorMode={this.state.instancesEditorSettings.gameEditorMode}
          setGameEditorMode={this._withFocusReturnedToEditor(
            this.setGameEditorMode
          )}
          selectedInstancesCount={
            this.instancesSelection.getSelectedInstances().length
          }
          toggleObjectsList={this._withFocusReturnedToEditor(
            this.toggleObjectsList
          )}
          isObjectsListShown={editorDisplay.isEditorVisible('objects-list')}
          toggleObjectGroupsList={this._withFocusReturnedToEditor(
            this.toggleObjectGroupsList
          )}
          isObjectGroupsListShown={editorDisplay.isEditorVisible(
            'object-groups-list'
          )}
          toggleProperties={this._withFocusReturnedToEditor(
            this.toggleProperties
          )}
          isPropertiesShown={editorDisplay.isEditorVisible('properties')}
          deleteSelection={this._withFocusReturnedToEditor(
            this.deleteSelection
          )}
          toggleInstancesList={this._withFocusReturnedToEditor(
            this.toggleInstancesList
          )}
          isInstancesListShown={editorDisplay.isEditorVisible('instances-list')}
          toggleLayersList={this._withFocusReturnedToEditor(
            this.toggleLayersList
          )}
          isLayersListShown={editorDisplay.isEditorVisible('layers-list')}
          toggleWindowMask={this._withFocusReturnedToEditor(
            this.toggleWindowMask
          )}
          isWindowMaskShown={!!this.state.instancesEditorSettings.windowMask}
          toggleGrid={this._withFocusReturnedToEditor(this.toggleGrid)}
          isGridShown={!!this.state.instancesEditorSettings.grid}
          openSetupGrid={this.openSetupGrid}
          setZoomFactor={this._withFocusReturnedToEditor(this.setZoomFactor)}
          getContextMenuZoomItems={this.getContextMenuZoomItems}
          canUndo={canUndo(this.state.history)}
          canRedo={canRedo(this.state.history)}
          undo={this.undo}
          redo={this.redo}
          onOpenSettings={this.openSceneProperties}
          settingsIcon={editSceneIconReactNode}
          onOpenSceneVariables={this.openSceneVariables}
        />
      );
    } else {
      this.props.setToolbar(
        <SwipeableDrawerEditorsDisplayToolbar
          gameEditorMode={this.props.gameEditorMode}
          setGameEditorMode={this._withFocusReturnedToEditor(
            this.props.setGameEditorMode
          )}
          selectedInstancesCount={
            this.instancesSelection.getSelectedInstances().length
          }
          toggleObjectsList={this._withFocusReturnedToEditor(
            this.toggleObjectsList
          )}
          toggleObjectGroupsList={this._withFocusReturnedToEditor(
            this.toggleObjectGroupsList
          )}
          toggleProperties={this._withFocusReturnedToEditor(
            this.toggleProperties
          )}
          deleteSelection={this._withFocusReturnedToEditor(
            this.deleteSelection
          )}
          toggleInstancesList={this._withFocusReturnedToEditor(
            this.toggleInstancesList
          )}
          toggleLayersList={this._withFocusReturnedToEditor(
            this.toggleLayersList
          )}
          toggleWindowMask={this._withFocusReturnedToEditor(
            this.toggleWindowMask
          )}
          isWindowMaskShown={!!this.state.instancesEditorSettings.windowMask}
          toggleGrid={this._withFocusReturnedToEditor(this.toggleGrid)}
          isGridShown={!!this.state.instancesEditorSettings.grid}
          openSetupGrid={this.openSetupGrid}
          setZoomFactor={this._withFocusReturnedToEditor(this.setZoomFactor)}
          getContextMenuZoomItems={this.getContextMenuZoomItems}
          canUndo={canUndo(this.state.history)}
          canRedo={canRedo(this.state.history)}
          undo={this.undo}
          redo={this.redo}
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
      this._onObjectFolderOrObjectsWithContextSelected([
        {
          objectFolderOrObject: container
            .getRootFolder()
            .getObjectNamed(objectName),
          global,
        },
      ]);
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
      editedGroupInitialTab: initialTab,
      isCreatingNewGroup: false,
    });
  };

  _createObjectGroup = () => {
    this.setState({ editedGroup: null, isCreatingNewGroup: true });
  };

  _closeObjectGroupEditorDialog = () => {
    const { editedGroup } = this.state;
    const changeContext: HistoryChangeContext = editedGroup
      ? {
          source: 'panel',
          editorId: 'properties',
          // The dialog can be opened without selecting the group first.
          revealSelection: {
            lastSelectionType: 'objectGroup',
            selectedObjectNames: [],
            selectedObjectGroupName: editedGroup.getName(),
            selectedLayerName: null,
          },
        }
      : { source: 'panel', editorId: 'object-groups-list' };
    if (editedGroup) {
      const groupsKey = this.props.objectsContainer
        .getObjectGroups()
        .has(editedGroup.getName())
        ? 'objectGroups'
        : 'globalObjectGroups';
      this._recordGranularObjectGroupMembershipHistorySteps(
        groupsKey,
        editedGroup.getName(),
        changeContext
      );
    } else {
      // A brand new (possibly empty) group was just created: it isn't
      // tracked by name yet here, so declare both possible keys the
      // coarse way (this dialog doesn't touch objects in this case).
      this._recordHistoryStep(
        undefined,
        changeContext,
        OBJECT_GROUPS_HISTORY_KEYS
      );
    }
    // The variables tab, if used, refactors the variables of every object of
    // the group at once - recorded as a single step, separate from the
    // membership changes above (splitting it further would mean grouping by
    // variable name across every affected object).
    this._recordHistoryStep(undefined, changeContext, OBJECTS_HISTORY_KEYS);
    if (editedGroup) {
      // TODO Set the `global` attribute correctly.
      this.props.onObjectGroupEdited({
        group: editedGroup,
        global: false,
      });
    }
    this.setState({ editedGroup: null, isCreatingNewGroup: false });
    // The dialog may have changed the group objects and variables: make the
    // properties panel re-read them.
    this.forceUpdatePropertiesEditor();
  };

  /**
   * Split a change to an object group's membership, made all at once by an
   * "Apply" of the full object group editor dialog, into one undoable step
   * per object added or removed - instead of a single step covering the
   * whole group.
   */
  _recordGranularObjectGroupMembershipHistorySteps = (
    groupsKey: string,
    groupName: string,
    changeContext: HistoryChangeContext
  ) => {
    this._flushPendingPanelHistorySave();
    const beforeGroups =
      (this._getLatestHistory().currentValue[groupsKey] || {}).groups || [];
    const beforeGroup = findSerializedItemByName(beforeGroups, groupName);

    const afterValue =
      this._serializeHistoryTargets([groupsKey])[groupsKey] || {};
    const afterGroups = afterValue.groups || [];
    const afterGroup = findSerializedItemByName(afterGroups, groupName);

    if (!beforeGroup || !afterGroup) {
      // The group couldn't be matched by name before/after (shouldn't
      // normally happen from this dialog, which doesn't rename groups) -
      // fall back to a single step for everything, to be safe.
      this._recordHistoryStep(undefined, changeContext, [groupsKey]);
      return;
    }

    let current = beforeGroup.serialized;
    const groupStates: Array<Object> = [];
    getIntermediateNamedItemsStates(
      beforeGroup.serialized.objects || [],
      afterGroup.serialized.objects || []
    ).forEach(objects => {
      current = { ...current, objects };
      groupStates.push(current);
    });

    if (groupStates.length === 0) return;

    const revealedChangeContext = this._withRevealSelection(changeContext);
    groupStates.forEach(serializedGroup => {
      this._setHistory(
        savePartialValueToHistory(
          this._getLatestHistory(),
          {
            [groupsKey]: {
              groups: afterGroups.map(item =>
                item.name === groupName
                  ? { name: groupName, serialized: serializedGroup }
                  : item
              ),
            },
          },
          undefined,
          revealedChangeContext
        )
      );
    });

    this.updateToolbar();
    this._checkNoUndeclaredHistoryChange([groupsKey]);
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

  /**
   * The state tracked by the undo/redo history: everything owned by the
   * edited scene (or events-based object) that the panels and dialogs of
   * this editor can modify, plus the global objects, groups and variables
   * (also shown in the panels). Each step of the history only stores the
   * targets it changed - see `_recordHistoryStep`.
   * Not tracked: the events (the events sheet has its own history), and an
   * object's instances placed in an external layout (deleting the object
   * removes them too, but undo won't bring them back there).
   */
  _getHistoryTargets = (): CompositeTargets => {
    const {
      layout,
      project,
      objectsContainer,
      globalObjectsContainer,
    } = this.props;
    const targets: CompositeTargets = {
      // Objects first: instances, groups and folders reference them.
      objects: this._getObjectsContainerHistoryTarget(objectsContainer),
      objectGroups: this._getObjectGroupsContainerHistoryTarget(
        objectsContainer.getObjectGroups()
      ),
    };
    if (globalObjectsContainer) {
      targets.globalObjects = this._getObjectsContainerHistoryTarget(
        globalObjectsContainer
      );
      targets.globalObjectGroups = this._getObjectGroupsContainerHistoryTarget(
        globalObjectsContainer.getObjectGroups()
      );
    }
    targets.layers = {
      serializableObject: this.props.layersContainer,
      serializationMethodName: 'serializeLayersTo',
      unserializationMethodName: 'unserializeLayersFrom',
    };
    targets.instances = {
      getValue: () => {
        this._ensurePersistentUuidsOfInstances();
        return serializeToJSObject(this.props.initialInstances);
      },
      setValue: (value: Object) => {
        // The default size of an instance is not serialized: it's reported
        // by the 3D editor. Keep it, or the properties panel would show
        // (and use) a size of 0 for the re-created instances.
        const defaultSizes = new Map<string, [number, number, number]>();
        this._forEachInstance(instance => {
          defaultSizes.set(instance.getPersistentUuid(), [
            instance.getDefaultWidth(),
            instance.getDefaultHeight(),
            instance.getDefaultDepth(),
          ]);
        });
        unserializeFromJSObject(
          this.props.initialInstances,
          value,
          'unserializeFrom',
          project
        );
        this._forEachInstance(instance => {
          const defaultSize = defaultSizes.get(instance.getPersistentUuid());
          if (!defaultSize) return;
          instance.setDefaultWidth(defaultSize[0]);
          instance.setDefaultHeight(defaultSize[1]);
          instance.setDefaultDepth(defaultSize[2]);
        });
      },
    };
    targets.globalVariables = this._getVariablesContainerHistoryTarget(
      project.getVariables()
    );
    if (layout) {
      targets.sceneVariables = this._getVariablesContainerHistoryTarget(
        layout.getVariables()
      );
      targets.sceneProperties = {
        getValue: () => ({
          windowDefaultTitle: layout.getWindowDefaultTitle(),
          stopSoundsOnStartup: layout.stopSoundsOnStartup(),
          resourcesPreloading: layout.getResourcesPreloading(),
          resourcesUnloading: layout.getResourcesUnloading(),
          backgroundColorRed: layout.getBackgroundColorRed(),
          backgroundColorGreen: layout.getBackgroundColorGreen(),
          backgroundColorBlue: layout.getBackgroundColorBlue(),
        }),
        setValue: (value: Object) => {
          layout.setWindowDefaultTitle(value.windowDefaultTitle);
          layout.setStopSoundsOnStartup(value.stopSoundsOnStartup);
          layout.setResourcesPreloading(value.resourcesPreloading);
          layout.setResourcesUnloading(value.resourcesUnloading);
          layout.setBackgroundColor(
            value.backgroundColorRed,
            value.backgroundColorGreen,
            value.backgroundColorBlue
          );
        },
      };
      targets.behaviorsSharedData = {
        getValue: () => {
          const value: { [string]: Object } = {};
          layout
            .getAllBehaviorSharedDataNames()
            .toJSArray()
            .forEach(name => {
              const properties = layout
                .getBehaviorSharedData(name)
                .getProperties();
              const propertyValues: { [string]: string } = {};
              properties
                .keys()
                .toJSArray()
                .forEach(propertyName => {
                  propertyValues[propertyName] = properties
                    .get(propertyName)
                    .getValue();
                });
              value[name] = propertyValues;
            });
          return value;
        },
        setValue: (value: Object) => {
          Object.keys(value).forEach(name => {
            if (!layout.hasBehaviorSharedData(name)) return;
            const sharedData = layout.getBehaviorSharedData(name);
            Object.keys(value[name]).forEach(propertyName => {
              sharedData.updateProperty(
                propertyName,
                value[name][propertyName]
              );
            });
          });
        },
      };
    }
    return targets;
  };

  // Persistent UUIDs (of objects, variables) are generated lazily, at their
  // first access - which can happen after a snapshot was taken, making the
  // snapshots differ (and an undo reset them). Generate them before a
  // snapshot.
  _ensurePersistentUuidsOfObject = (object: gdObject) => {
    object.getPersistentUuid();
    object.getVariables().ensurePersistentUuids();
  };

  _forEachInstance = (callback: (instance: gdInitialInstance) => void) => {
    const functor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe[incompatible-type] - typing is not correct.
    // $FlowFixMe[cannot-write]
    functor.invoke = (instancePtr: number) => {
      // $FlowFixMe[incompatible-type] - wrapPointer is not exposed
      callback(gd.wrapPointer(instancePtr, gd.InitialInstance));
    };
    // $FlowFixMe[incompatible-type] - typing is not correct.
    this.props.initialInstances.iterateOverInstances(functor);
    functor.delete();
  };

  _ensurePersistentUuidsOfInstances = () => {
    this._forEachInstance(instance => {
      instance.getVariables().ensurePersistentUuids();
    });
  };

  _getVariablesContainerHistoryTarget = (
    variablesContainer: gdVariablesContainer
  ): CompositeTarget => getVariablesContainerHistoryTarget(variablesContainer);

  _getObjectsContainerHistoryTarget = (
    objectsContainer: gdObjectsContainer
  ): CompositeTarget =>
    getObjectsContainerHistoryTarget(
      objectsContainer,
      this.props.project,
      this._ensurePersistentUuidsOfObject
    );

  _getObjectGroupsContainerHistoryTarget = (
    objectGroupsContainer: gdObjectGroupsContainer
  ): CompositeTarget =>
    getObjectGroupsContainerHistoryTarget(objectGroupsContainer);

  _serializeHistoryTargets = (keys: Array<string>): Object =>
    serializeCompositeTargets(this._getHistoryTargets(), keys);

  /**
   * Return the history, with any modification pending a debounced save
   * (see `_queuePanelHistorySave`) committed to it. Must be used by
   * undo/redo: an uncommitted modification would otherwise be reverted
   * without being redoable (`undo` restores the last *saved* snapshot).
   */
  _getHistoryWithPendingModificationsSaved = (): HistoryState => {
    this._flushPendingPanelHistorySaveDebounced.cancel();
    const pending = this._pendingPanelHistorySave;
    if (!pending) return this._getLatestHistory();

    this._pendingPanelHistorySave = null;
    return savePartialValueToHistory(
      this._getLatestHistory(),
      pending.value,
      undefined,
      pending.changeContext
    );
  };

  undo = (): void => {
    this._applyHistoryChange('undo');
  };

  redo = (): void => {
    this._applyHistoryChange('redo');
  };

  /**
   * A dialog editing a part of the tracked state is open: applying the
   * history would change (or delete) what it's editing.
   */
  _isDialogEditingTrackedStateOpen = (): boolean => {
    const { state } = this;
    return (
      !!state.editedObjectWithContext ||
      !!state.editedGroup ||
      !!state.editedLayer ||
      !!state.variablesEditedInstance ||
      state.scenePropertiesDialogOpen ||
      state.layoutVariablesDialogOpen ||
      state.extractAsExternalLayoutDialogOpen ||
      state.extractAsCustomObjectDialogOpen ||
      state.isAssetExporterDialogOpen ||
      state.isAssetImporterDialogOpen
    );
  };

  _applyHistoryChange = (direction: 'undo' | 'redo') => {
    if (this._isDialogEditingTrackedStateOpen()) return;

    const history = this._getHistoryWithPendingModificationsSaved();
    const canApply = direction === 'undo' ? canUndo(history) : canRedo(history);
    if (!canApply) {
      // Nothing to apply - but a pending modification may just have been
      // committed to the history: keep it.
      if (history !== this._getLatestHistory()) this._setHistory(history);
      return;
    }
    let action: UndoAction | RedoAction;
    let changedKeys: Array<string>;
    if (direction === 'undo') {
      const undoAction = getLastUndoableAction(history);
      if (!undoAction) return;
      action = undoAction;
      changedKeys = Object.keys(undoAction.valueBeforeChange);
    } else {
      const redoAction = getLastRedoableAction(history);
      if (!redoAction) return;
      action = redoAction;
      changedKeys = Object.keys(redoAction.valueAfterChange);
    }
    const changeContext: ?HistoryChangeContext = action.changeContext || null;
    const command: ?HistoryCommand = action.command || null;

    const selectedInstancesPersistentUuids = this.instancesSelection
      .getSelectedInstances()
      .map(instance => instance.getPersistentUuid());
    // What is selected right now (just before applying the change) - the
    // fallback used to restore selection when the action being applied
    // doesn't say what it touched (e.g. an older/canvas-sourced action).
    const currentSelectionByName = this._getCurrentSelectionByName();
    // What was selected when the step being applied was actually made (for
    // a panel edit of an object/group/layer) - the object/group/layer this
    // undo/redo should reveal, which can differ from what's selected now.
    const revealSelectionByName =
      changeContext &&
      changeContext.source === 'panel' &&
      changeContext.revealSelection
        ? changeContext.revealSelection
        : currentSelectionByName;

    // /!\ Drop every reference to what the targets own: it can be deleted
    // (or re-created) when the history is applied. The state is not
    // updated yet though: the selection is put back below, in the same
    // update as the new history, so that the properties panel is never
    // rendered with nothing selected in between (which would unmount it
    // and mount it again - flickering). This relies on nothing being
    // rendered between here and this update: applying the history is
    // synchronous.
    this.instancesSelection.clearSelection();

    if (command) this._applyHistoryCommand(command, direction);

    const valueBeforeChange = history.currentValue;
    const targets = this._getHistoryTargets();
    let newHistory =
      direction === 'undo'
        ? undoComposite(history, targets, this.props.project)
        : redoComposite(history, targets, this.props.project);
    if (command) {
      newHistory = refreshCompositeHistoryValue(
        newHistory,
        targets,
        REFACTORED_HISTORY_KEYS
      );
    }
    // Select the instances touched by the change, so it can be seen -
    // notably in the 3D editor, where the camera is not moved (like
    // other engines do: the change is revealed by the selection). If no
    // instance was touched, restore the previous selection.
    const { changedOrAddedPersistentUuids } = diffInstancesSnapshots(
      valueBeforeChange.instances,
      newHistory.currentValue.instances
    );
    const persistentUuidsToSelect =
      changedOrAddedPersistentUuids.length > 0
        ? changedOrAddedPersistentUuids
        : selectedInstancesPersistentUuids;
    const instancesToSelect = persistentUuidsToSelect
      .map(persistentUuid =>
        getInstanceInLayoutWithPersistentUuid(
          this.props.initialInstances,
          persistentUuid
        )
      )
      .filter(Boolean);
    instancesToSelect.forEach(instance => {
      this.instancesSelection.selectInstance({
        instance,
        multiSelect: true,
        layersLocks: null,
      });
    });
    // Instances only take over the panels when they are what the change
    // touched. Otherwise they just stay selected on the canvas, and the
    // panels show the object/group/layer that was edited.
    const haveTouchedInstancesToShow =
      changedOrAddedPersistentUuids.length > 0 && instancesToSelect.length > 0;
    const selectionState =
      (!haveTouchedInstancesToShow &&
        this._getSelectionStateByName(revealSelectionByName)) ||
      this._getSelectObjectOfInstancesState(instancesToSelect);

    this._latestHistory = newHistory;
    this.setState(
      {
        history: newHistory,
        tileMapTileSelection: null,
        ...selectionState,
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        // (or objects).
        if (this.editorDisplay)
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();

        const haveObjectsChanged =
          !!command ||
          changedKeys.some(
            key =>
              OBJECTS_HISTORY_KEYS.includes(key) ||
              OBJECT_GROUPS_HISTORY_KEYS.includes(key)
          );
        if (haveObjectsChanged) {
          this.forceUpdateObjectsList();
          this.forceUpdateObjectGroupsList();
          if (changedKeys.some(key => OBJECTS_HISTORY_KEYS.includes(key))) {
            // Behaviors may have been added/removed with the objects.
            this.updateBehaviorsSharedData();
            this._refreshHistoryValue(['behaviorsSharedData']);
            this._hotReloadAllObjects();
          }
          this.props.onObjectListsModified({ isNewObjectTypeUsed: false });
        }

        this.forceUpdatePropertiesEditor();
        this._ensureKeyboardFocusStaysInEditor();

        this.forceUpdateLayersList();
        this.updateToolbar();
        this._sendHotReloadAllInstances();
        this._sendHotReloadLayers();
        if (changedKeys.includes('sceneProperties'))
          this._sendSetBackgroundColor();
        // After the instances: the 3D editor can only select the ones it has.
        this._sendSelectedInstances();

        const renamedName = command
          ? direction === 'undo'
            ? command.oldName
            : command.newName
          : null;
        this._revealHistoryChanges(
          valueBeforeChange,
          newHistory.currentValue,
          changeContext,
          changedKeys,
          command && command.type === 'renameObject' ? renamedName : null,
          command && command.type === 'renameObjectGroup' ? renamedName : null
        );
      }
    );
  };

  /**
   * The current selection, by name (an object/group/layer can be destroyed
   * and re-created, so its name - not a reference to it - is what survives
   * an undo/redo).
   */
  _getCurrentSelectionByName = (): SelectionByName => {
    const {
      lastSelectionType,
      selectedObjectGroup,
      selectedLayer,
      selectedObjectFolderOrObjectsWithContext,
    } = this.state;
    // The selection can still reference an object/group/layer that was just
    // deleted (this is called right after a deletion, to record what was
    // selected as the step's revealed selection): guard against the dead
    // C++ wrapper before accessing it.
    const aliveObjectGroup = exceptionallyGuardAgainstDeadObject(
      selectedObjectGroup
    );
    const aliveLayer = exceptionallyGuardAgainstDeadObject(selectedLayer);
    return {
      lastSelectionType,
      selectedObjectNames: selectedObjectFolderOrObjectsWithContext
        .map(({ objectFolderOrObject }) =>
          exceptionallyGuardAgainstDeadObject(objectFolderOrObject)
        )
        .filter(Boolean)
        .filter(objectFolderOrObject => !objectFolderOrObject.isFolder())
        .map(objectFolderOrObject =>
          objectFolderOrObject.getObject().getName()
        ),
      selectedObjectGroupName: aliveObjectGroup
        ? aliveObjectGroup.getName()
        : null,
      selectedLayerName: aliveLayer ? aliveLayer.getName() : null,
    };
  };

  /**
   * Select again, after the history was applied, what was selected in the
   * panels (objects were re-created: they are found by their name). Return
   * false if there was nothing to select in the panels (or it's gone).
   */
  /**
   * The state selecting again, after the history was applied, what was
   * selected in the panels (objects were re-created: they are found by
   * their name) - or null if there is nothing to select in the panels
   * (or it's gone).
   */
  _getSelectionStateByName = ({
    lastSelectionType,
    selectedObjectNames,
    selectedObjectGroupName,
    selectedLayerName,
  }: SelectionByName): ?Partial<State> => {
    const {
      objectsContainer,
      globalObjectsContainer,
      layersContainer,
    } = this.props;
    if (lastSelectionType === 'object' && selectedObjectNames.length > 0) {
      const objectsWithContext = selectedObjectNames
        .map(objectName =>
          getObjectFolderOrObjectWithContextFromObjectName(
            globalObjectsContainer,
            objectsContainer,
            objectName
          )
        )
        .filter(Boolean);
      if (objectsWithContext.length === 0) return null;
      return {
        lastSelectionType: 'object',
        selectedObjectFolderOrObjectsWithContext: objectsWithContext,
        selectedLayer: null,
        selectedObjectGroup: null,
      };
    }
    if (lastSelectionType === 'objectGroup' && selectedObjectGroupName) {
      const groupName = selectedObjectGroupName;
      const groupsContainer = [
        objectsContainer.getObjectGroups(),
        globalObjectsContainer
          ? globalObjectsContainer.getObjectGroups()
          : null,
      ].find(groups => groups && groups.has(groupName));
      if (!groupsContainer) return null;
      return {
        selectedObjectGroup: groupsContainer.get(groupName),
        lastSelectionType: 'objectGroup',
        selectedLayer: null,
        selectedObjectFolderOrObjectsWithContext: [],
      };
    }
    if (
      lastSelectionType === 'layer' &&
      typeof selectedLayerName === 'string'
    ) {
      if (!layersContainer.hasLayerNamed(selectedLayerName)) return null;
      return {
        selectedLayer: layersContainer.getLayer(selectedLayerName),
        lastSelectionType: 'layer',
        selectedObjectGroup: null,
        selectedObjectFolderOrObjectsWithContext: [],
      };
    }
    return null;
  };

  _applyHistoryCommand = (
    command: HistoryCommand,
    direction: 'undo' | 'redo'
  ) => {
    const { oldName, newName } = command;
    const [from, to] =
      direction === 'undo' ? [newName, oldName] : [oldName, newName];
    if (command.type === 'renameObject') {
      this._renameObjectOrGroup(false, command.global, from, to);
    } else if (command.type === 'renameObjectGroup') {
      this._renameObjectOrGroup(true, command.global, from, to);
    }
  };

  /**
   * Rename an object or a group, refactoring the whole project so events
   * and other objects (groups...) keep referring to it.
   */
  _renameObjectOrGroup = (
    isObjectGroup: boolean,
    global: boolean,
    oldName: string,
    newName: string
  ) => {
    const {
      project,
      layout,
      eventsBasedObject,
      projectScopedContainersAccessor,
      objectsContainer,
      globalObjectsContainer,
    } = this.props;
    if (oldName === newName) return;

    if (layout) {
      if (global) {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          oldName,
          newName,
          isObjectGroup
        );
      } else {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
          project,
          layout,
          oldName,
          newName,
          isObjectGroup
        );
      }
    } else if (eventsBasedObject) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
        project,
        projectScopedContainersAccessor.get(),
        eventsBasedObject,
        oldName,
        newName,
        isObjectGroup
      );
    }

    const container = global ? globalObjectsContainer : objectsContainer;
    if (!container) return;
    if (isObjectGroup) {
      const groups = container.getObjectGroups();
      if (groups.has(oldName)) groups.get(oldName).setName(newName);
    } else {
      if (container.hasObjectNamed(oldName))
        container.getObject(oldName).setName(newName);
    }
    this.props.onObjectListsModified({ isNewObjectTypeUsed: false });
  };

  _hotReloadAllObjects = () => {
    const { objectsContainer, globalObjectsContainer } = this.props;
    const updatedObjects = [];
    [objectsContainer, globalObjectsContainer].forEach(container => {
      if (!container) return;
      mapFor(0, container.getObjectsCount(), i =>
        updatedObjects.push(container.getObjectAt(i))
      );
    });
    this._hotReloadObjects({ updatedObjects });
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

  _onObjectFolderOrObjectsWithContextSelected = (
    objectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext> = []
  ) => {
    const aliveObjectFolderOrObjectsWithContext = objectFolderOrObjectsWithContext.filter(
      objectFolderOrObjectWithContext =>
        exceptionallyGuardAgainstDeadObject(
          objectFolderOrObjectWithContext.objectFolderOrObject
        )
    );

    // The selection must stay within a single section (scene objects or
    // global objects): keep only the items matching the first one's scope.
    const selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext> =
      aliveObjectFolderOrObjectsWithContext.length === 0
        ? []
        : aliveObjectFolderOrObjectsWithContext.filter(
            objectFolderOrObjectWithContext =>
              objectFolderOrObjectWithContext.global ===
              aliveObjectFolderOrObjectsWithContext[0].global
          );

    this.setState(
      {
        lastSelectionType: 'object',
        selectedObjectFolderOrObjectsWithContext,
        selectedLayer: null,
        selectedObjectGroup: null,
      },
      () => {
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

    // Remember where to create the instance, when the object will be created.
    this.setState({
      newObjectInstanceSceneCoordinates: editorDisplay.viewControls.getLastCursorSceneCoordinates(),
    });
    editorDisplay.openNewObjectDialog();
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

  _onInstancesAddedAndSendToEditor3D = (
    instances: Array<gdInitialInstance>
  ) => {
    this._onInstancesAdded(instances);
    this._sendAddedInstances(instances);
  };

  _onInstancesAdded = (instances: Array<gdInitialInstance>) => {
    this._onInstancesAddedWithoutRecordingHistory(instances);
    this._recordHistoryStep('ADD', { source: 'canvas' }, ['instances']);
  };

  /**
   * Same as `_onInstancesAdded`, for when the instances are not in their
   * final state yet (like a paste, which then moves them under the cursor):
   * the history step must be recorded afterwards by the caller.
   */
  _onInstancesAddedWithoutRecordingHistory = (
    instances: Array<gdInitialInstance>
  ) => {
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

  /**
   * Deselect everything (instances, objects, layers, object groups), so that
   * the properties panel goes back to the scene properties.
   */
  deselectAll = () => {
    this.instancesSelection.clearSelection();
    this._onInstancesSelected([]);
  };

  _onKeyDown = (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
    if (!shouldCloseOrCancel(event)) return;

    const { target } = event;
    // $FlowFixMe[prop-missing] - target is an Element (possibly from a popped-out window).
    if (target.closest('textarea, input, [contenteditable="true"]')) {
      return; // Escape is handled by the field being edited.
    }
    // $FlowFixMe[prop-missing]
    if (isDialogOpen(target.ownerDocument)) return;

    // Escape first cancels what is in progress, then deselects everything.
    const { editorDisplay } = this;
    if (
      editorDisplay &&
      editorDisplay.instancesHandlers.cancelClickInterception()
    ) {
      return;
    }
    if (this.state.tileMapTileSelection) {
      this.onSelectTileMapTile(null);
      return;
    }

    this.deselectAll();
  };

  /** The state selecting (in the panels) the object of the given instances. */
  _getSelectObjectOfInstancesState = (
    instances: Array<gdInitialInstance>
  ): Partial<State> => {
    const { globalObjectsContainer, objectsContainer } = this.props;
    // TODO: Find a way to select efficiently the ObjectFolderOrObject instances
    // representing all the instances selected.
    const lastSelectedInstance = instances[instances.length - 1];
    const objectName = lastSelectedInstance
      ? lastSelectedInstance.getObjectName()
      : null;
    const container =
      objectName &&
      globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName)
        ? globalObjectsContainer
        : objectName && objectsContainer.hasObjectNamed(objectName)
        ? objectsContainer
        : null;
    return {
      lastSelectionType: 'instance',
      selectedObjectFolderOrObjectsWithContext:
        container && objectName
          ? [
              {
                objectFolderOrObject: container
                  .getRootFolder()
                  .getObjectNamed(objectName),
                global: container === globalObjectsContainer,
              },
            ]
          : [],
      selectedLayer: null,
      selectedObjectGroup: null,
    };
  };

  _selectObjectOfInstances = (instances: Array<gdInitialInstance>) => {
    this.setState(
      this._getSelectObjectOfInstancesState(instances),
      this.updateToolbar
    );
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
    this._recordHistoryStep('EDIT', { source: 'canvas' }, ['instances'], () =>
      this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  _onInstancesResized = (instances: Array<gdInitialInstance>) => {
    this._recordHistoryStep('EDIT', { source: 'canvas' }, ['instances'], () =>
      this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  _onInstancesRotated = (instances: Array<gdInitialInstance>) => {
    this._recordHistoryStep('EDIT', { source: 'canvas' }, ['instances'], () =>
      this.forceUpdatePropertiesEditor()
    );
    this._sendUpdatedInstances(instances);
  };

  // $FlowFixMe[missing-local-annot]
  _exportDataOnly = (debounce(() => {
    this.props.hotReloadPreviewButtonProps.launchProjectDataOnlyPreview();
  }, 250): any);

  _onInstancesModified = (
    instances: Array<gdInitialInstance>,
    context: ?InstancesModificationContext
  ) => {
    this._sendUpdatedInstances(instances);
    this.forceUpdate();

    const editorId = (context && context.editorId) || 'properties';
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `instances/${editorId}/${fieldName}`,
      { source: 'panel', editorId },
      baseValue => this._getInstancesPartialSnapshot(baseValue, instances)
    );
  };

  _onScenePropertiesModified = (context: ?FieldModificationContext) => {
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `sceneProperties/${fieldName}`,
      { source: 'panel', editorId: 'properties' },
      () => this._serializeHistoryTargets(['sceneProperties'])
    );
  };

  _onBackgroundColorChanged = () => {
    // Same key as the background color field of the properties panel,
    // which calls this too before reporting its modification: the last
    // queued context (the properties panel) wins.
    this._queuePanelHistorySave(
      'sceneProperties/BackgroundColor',
      { source: 'panel', editorId: 'layers-list' },
      () => this._serializeHistoryTargets(['sceneProperties'])
    );
    this._sendSetBackgroundColor();
  };

  _onBehaviorSharedDataModified = (context: ?FieldModificationContext) => {
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `behaviorsSharedData/${fieldName}`,
      { source: 'panel', editorId: 'properties' },
      () => this._serializeHistoryTargets(['behaviorsSharedData'])
    );
  };

  _onLayerPropertiesModified = (
    layers: Array<gdLayer>,
    context: ?FieldModificationContext
  ) => {
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `layers/${fieldName}`,
      { source: 'panel', editorId: 'properties' },
      () => this._serializeHistoryTargets(['layers'])
    );
    this.forceUpdateLayersList();
    this._sendHotReloadLayers();
  };

  _onObjectsModified = (
    objects: Array<gdObject>,
    context: ?FieldModificationContext
  ) => {
    this._hotReloadObjects({ updatedObjects: objects });
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `objects/${fieldName}`,
      { source: 'panel', editorId: 'properties' },
      baseValue => this._getObjectsPartialSnapshot(baseValue, objects)
    );
  };

  _onObjectGroupModified = (context: ?FieldModificationContext) => {
    const fieldName = (context && context.fieldName) || '';
    this._queuePanelHistorySave(
      `objectGroups/${fieldName}`,
      { source: 'panel', editorId: 'properties' },
      () => this._serializeHistoryTargets(OBJECT_GROUPS_HISTORY_KEYS)
    );
  };

  _onObjectGroupsModified = () => {
    this._recordHistoryStep(
      undefined,
      { source: 'panel', editorId: 'object-groups-list' },
      OBJECT_GROUPS_HISTORY_KEYS
    );
  };

  // Set while an object refactoring (rename, deletion) is done, as the
  // objects list reports it as a modification too: this flag prevents that
  // generic report from recording a duplicate (or incomplete) step - a
  // specific one is recorded explicitly instead (see `_onRenameObjectFinish`,
  // `_onDeleteObjects`).
  _isRefactoringObjects = false;

  _onObjectFolderOrObjectsModified = () => {
    if (this._isRefactoringObjects) return;
    this._recordHistoryStep(
      undefined,
      { source: 'panel', editorId: 'objects-list' },
      OBJECTS_HISTORY_KEYS
    );
  };

  // The history is kept in the state (to re-render what depends on it), but
  // a change of it must be visible right away to the next change - which
  // can happen in the same event, before the state is updated (like a
  // field left on undo, committing its value, then the undo itself).
  _latestHistory: ?HistoryState = null;

  _getLatestHistory = (): HistoryState =>
    this._latestHistory || this.state.history;

  _setHistory = (history: HistoryState, callback?: () => void) => {
    this._latestHistory = history;
    this.setState({ history }, callback);
  };

  /**
   * Update the cached value of the given targets without saving a step
   * (for targets changed outside of the history).
   */
  _refreshHistoryValue = (keys: Array<string>) => {
    this._setHistory(
      refreshCompositeHistoryValue(
        this._getLatestHistory(),
        this._getHistoryTargets(),
        keys
      )
    );
  };

  /**
   * Save a new step in the history, capturing the current state of the
   * given targets - after any pending panel modification.
   */
  /**
   * A panel edit of an object/group/layer's own properties doesn't say
   * which one it touched otherwise - fill it in from what's currently
   * selected (which is what's being edited), so an undo/redo can reveal
   * the actual object/group/layer touched by this step, not whatever ends
   * up selected by the time the undo/redo is triggered.
   */
  _withRevealSelection = (
    changeContext: HistoryChangeContext
  ): HistoryChangeContext => {
    if (changeContext.source !== 'panel' || changeContext.revealSelection)
      return changeContext;
    return {
      ...changeContext,
      revealSelection: this._getCurrentSelectionByName(),
    };
  };

  _recordHistoryStep = (
    actionType: ?RevertableActionType,
    changeContext: HistoryChangeContext,
    keys: Array<string>,
    callback?: () => void
  ) => {
    this._flushPendingPanelHistorySave();
    this._setHistory(
      savePartialValueToHistory(
        this._getLatestHistory(),
        this._serializeHistoryTargets(keys),
        actionType || undefined,
        this._withRevealSelection(changeContext)
      ),
      () => {
        this.updateToolbar();
        if (callback) callback();
      }
    );
    this._checkNoUndeclaredHistoryChange(keys);
  };

  /**
   * Split a change to a variables container target, made all at once by an
   * "Apply" of the full variables dialog, into one undoable step per
   * variable that was actually added, removed or changed - instead of a
   * single step for the whole dialog session (which could otherwise undo an
   * unrelated pile of edits in one go). See `getIntermediateNamedItemsStates`.
   */
  _recordGranularVariablesHistorySteps = (
    key: string,
    changeContext: HistoryChangeContext
  ) => {
    this._flushPendingPanelHistorySave();
    const beforeVariables =
      (this._getLatestHistory().currentValue[key] || {}).variables || [];
    const afterVariables =
      (this._serializeHistoryTargets([key])[key] || {}).variables || [];
    const intermediateStates = getIntermediateNamedItemsStates(
      beforeVariables,
      afterVariables
    );
    const revealedChangeContext = this._withRevealSelection(changeContext);
    intermediateStates.forEach(variables => {
      this._setHistory(
        savePartialValueToHistory(
          this._getLatestHistory(),
          { [key]: { variables } },
          undefined,
          revealedChangeContext
        )
      );
    });
    this.updateToolbar();
    this._checkNoUndeclaredHistoryChange([key]);
  };

  /**
   * Split a change to an instance's variables, made all at once by an
   * "Apply" of the full instance variables dialog, into one undoable step
   * per variable that changed - instead of a single step for the whole
   * dialog session.
   */
  _recordGranularInstanceVariablesHistorySteps = (
    instance: gdInitialInstance,
    changeContext: HistoryChangeContext
  ) => {
    this._flushPendingPanelHistorySave();
    const persistentUuid = instance.getPersistentUuid();
    const findByUuid = (instances: ?Array<Object>): ?Object =>
      (instances || []).find(item => item.persistentUuid === persistentUuid);

    // Unlike 'objects'/'sceneVariables'/'layers', the 'instances' target's
    // value is a bare array directly (see `_getInstancesPartialSnapshot`,
    // which checks `Array.isArray(baseValue.instances)`), not wrapped in an
    // extra `{instances: [...]}` layer.
    const beforeInstances =
      this._getLatestHistory().currentValue.instances || [];
    const beforeInstance = findByUuid(beforeInstances);

    const afterInstances =
      this._serializeHistoryTargets(['instances']).instances || [];
    const afterInstance = findByUuid(afterInstances);

    if (!beforeInstance || !afterInstance) {
      // The instance couldn't be matched by persistent uuid before/after
      // (shouldn't normally happen) - fall back to a single step, to be safe.
      this._recordHistoryStep(undefined, changeContext, ['instances']);
      return;
    }

    const intermediateStates = getIntermediateNamedItemsStates(
      beforeInstance.initialVariables || [],
      afterInstance.initialVariables || []
    );
    if (intermediateStates.length === 0) return;

    const revealedChangeContext = this._withRevealSelection(changeContext);
    intermediateStates.forEach(initialVariables => {
      this._setHistory(
        savePartialValueToHistory(
          this._getLatestHistory(),
          {
            instances: afterInstances.map(item =>
              item.persistentUuid === persistentUuid
                ? { ...item, initialVariables }
                : item
            ),
          },
          undefined,
          revealedChangeContext
        )
      );
    });

    this.updateToolbar();
    this._checkNoUndeclaredHistoryChange(['instances']);
  };

  /**
   * Split a change to an object, made all at once by an "Apply" of the full
   * object editor dialog, into one undoable step per behavior, effect and
   * variable that changed, plus (only if something else changed too - the
   * object's own type-specific configuration, like a Sprite's animations,
   * which can't be split further) one last step for everything else -
   * instead of a single step covering the whole object.
   *
   * `extraKeys` (e.g. `behaviorsSharedData`, which can silently change as a
   * side effect of editing an object's behaviors) are folded into the last
   * of these steps rather than recorded as their own separate step: they
   * have no visible row of their own to reveal, so giving them a dedicated
   * step would just be an extra undo/redo the user can't see the effect of.
   */
  _recordGranularObjectHistorySteps = (
    objectWithContext: ObjectWithContext,
    changeContext: HistoryChangeContext,
    extraKeys: Array<string> = []
  ) => {
    this._flushPendingPanelHistorySave();
    const key = objectWithContext.global ? 'globalObjects' : 'objects';
    const objectName = objectWithContext.object.getName();

    const beforeObjects =
      (this._getLatestHistory().currentValue[key] || {}).objects || [];
    const beforeObject = findSerializedItemByName(beforeObjects, objectName);

    const afterValue = this._serializeHistoryTargets([key])[key] || {};
    const afterObjects = afterValue.objects || [];
    const afterObject = findSerializedItemByName(afterObjects, objectName);

    if (!beforeObject || !afterObject) {
      // The object couldn't be matched by name before/after (shouldn't
      // normally happen from this dialog, which doesn't rename objects) -
      // fall back to a single step for everything, to be safe.
      this._recordHistoryStep(undefined, changeContext, [key, ...extraKeys]);
      return;
    }

    let current = beforeObject.serialized;
    const objectStates: Array<Object> = [];
    getIntermediateNamedItemsStates(
      beforeObject.serialized.behaviors || [],
      afterObject.serialized.behaviors || []
    ).forEach(behaviors => {
      current = { ...current, behaviors };
      objectStates.push(current);
    });
    getIntermediateNamedItemsStates(
      beforeObject.serialized.effects || [],
      afterObject.serialized.effects || []
    ).forEach(effects => {
      current = { ...current, effects };
      objectStates.push(current);
    });
    getIntermediateNamedItemsStates(
      beforeObject.serialized.variables || [],
      afterObject.serialized.variables || []
    ).forEach(variables => {
      current = { ...current, variables };
      objectStates.push(current);
    });
    // Everything else that changed (the object's own configuration, which
    // has no equivalent way to be split further) as one final step.
    if (JSON.stringify(current) !== JSON.stringify(afterObject.serialized)) {
      objectStates.push(afterObject.serialized);
    }

    if (objectStates.length === 0) {
      // Nothing about the object itself changed - only extraKeys might have.
      if (extraKeys.length > 0)
        this._recordHistoryStep(undefined, changeContext, [key, ...extraKeys]);
      return;
    }

    const revealedChangeContext = this._withRevealSelection(changeContext);
    const extraKeysValue =
      extraKeys.length > 0 ? this._serializeHistoryTargets(extraKeys) : {};
    objectStates.forEach((serializedObject, index) => {
      const isLastState = index === objectStates.length - 1;
      this._setHistory(
        savePartialValueToHistory(
          this._getLatestHistory(),
          {
            [key]: {
              objects: afterObjects.map(item =>
                item.name === objectName
                  ? {
                      name: objectName,
                      type: item.type,
                      serialized: serializedObject,
                    }
                  : item
              ),
              folders: afterValue.folders,
            },
            ...(isLastState ? extraKeysValue : {}),
          },
          undefined,
          revealedChangeContext
        )
      );
    });

    this.updateToolbar();
    this._checkNoUndeclaredHistoryChange([key, ...extraKeys]);
  };

  /**
   * Split a change to a layer, made all at once by an "Apply" of the full
   * layer editor dialog, into one undoable step per effect that changed,
   * plus (only if the layer's own properties changed too) one last step for
   * everything else - instead of a single step covering the whole layer.
   */
  _recordGranularLayerHistorySteps = (
    layer: gdLayer,
    changeContext: HistoryChangeContext
  ) => {
    this._flushPendingPanelHistorySave();
    const layerName = layer.getName();

    const beforeLayers = this._getLatestHistory().currentValue.layers || [];
    const beforeLayer = findSerializedItemByName(beforeLayers, layerName);

    const afterLayers = this._serializeHistoryTargets(['layers']).layers || [];
    const afterLayer = findSerializedItemByName(afterLayers, layerName);

    if (!beforeLayer || !afterLayer) {
      // The layer couldn't be matched by name before/after (shouldn't
      // normally happen from this dialog, which doesn't rename layers) -
      // fall back to a single step for everything, to be safe.
      this._recordHistoryStep(undefined, changeContext, ['layers']);
      return;
    }

    let current = beforeLayer;
    const layerStates: Array<Object> = [];
    getIntermediateNamedItemsStates(
      beforeLayer.effects || [],
      afterLayer.effects || []
    ).forEach(effects => {
      current = { ...current, effects };
      layerStates.push(current);
    });
    // Everything else that changed (the layer's own properties) as one
    // final step.
    if (JSON.stringify(current) !== JSON.stringify(afterLayer)) {
      layerStates.push(afterLayer);
    }

    if (layerStates.length === 0) return;

    const revealedChangeContext = this._withRevealSelection(changeContext);
    layerStates.forEach(serializedLayer => {
      this._setHistory(
        savePartialValueToHistory(
          this._getLatestHistory(),
          {
            layers: afterLayers.map(item =>
              item.name === layerName ? serializedLayer : item
            ),
          },
          undefined,
          revealedChangeContext
        )
      );
    });

    this.updateToolbar();
    this._checkNoUndeclaredHistoryChange(['layers']);
  };

  _recordHistoryCommand = (
    command: HistoryCommand,
    changeContext: HistoryChangeContext
  ) => {
    this._flushPendingPanelHistorySave();
    // The refactoring renamed things in several targets without a step:
    // refresh their cached value so the next step is based on the actual
    // names (an older step, undone, first undoes the rename).
    this._setHistory(
      refreshCompositeHistoryValue(
        saveCommandToHistory(this._getLatestHistory(), command, changeContext),
        this._getHistoryTargets(),
        REFACTORED_HISTORY_KEYS
      ),
      () => this.updateToolbar()
    );
  };

  _checkNoUndeclaredHistoryChange = (declaredKeys: Array<string>) => {
    if (!CHECK_UNDECLARED_HISTORY_CHANGES) return;
    const { currentValue } = this._getLatestHistory();
    const otherKeys = Object.keys(this._getHistoryTargets()).filter(
      key => !declaredKeys.includes(key)
    );
    const actualValue = this._serializeHistoryTargets(otherKeys);
    const getFirstDifferencePath = (a: any, b: any, path: string): ?string => {
      if (a === b) return null;
      if (typeof a !== 'object' || typeof b !== 'object' || !a || !b)
        return `${path}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`;
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const difference = getFirstDifferencePath(
          a[key],
          b[key],
          `${path}.${key}`
        );
        if (difference) return difference;
      }
      return null;
    };
    otherKeys.forEach(key => {
      const difference = getFirstDifferencePath(
        currentValue[key],
        actualValue[key],
        key
      );
      if (difference) {
        console.warn(
          `[SceneEditor history] "${key}" changed without being declared in the last saved step (declared: ${declaredKeys.join(
            ', '
          )}). This change would be reverted by an undo without being redoable. First difference: ${difference}`
        );
      }
    });
  };

  // A modification made from a panel waiting to be saved to the history, so
  // that a rapid series of modifications of the same thing (like typing a
  // position digit by digit, or scrolling a number field) makes a single
  // undoable step. Modifying something else (another field...) saves it
  // first: its snapshot is taken at the time of the modification so that
  // the new modification is not merged in it.
  _pendingPanelHistorySave: null | {|
    key: string,
    changeContext: HistoryChangeContext,
    // The (partial) value of the targets changed by the modification.
    value: Object,
  |} = null;

  _queuePanelHistorySave = (
    key: string,
    changeContext: HistoryChangeContext,
    getValue: (baseValue: Object) => Object
  ) => {
    const pending = this._pendingPanelHistorySave;
    const baseValue = {
      ...this._getLatestHistory().currentValue,
      ...(pending ? pending.value : {}),
    };
    if (pending && pending.key !== key) this._flushPendingPanelHistorySave();

    this._pendingPanelHistorySave = {
      key,
      changeContext: this._withRevealSelection(changeContext),
      value: getValue(baseValue),
    };
    this._flushPendingPanelHistorySaveDebounced();
  };

  _flushPendingPanelHistorySave = () => {
    this._flushPendingPanelHistorySaveDebounced.cancel();
    const pending = this._pendingPanelHistorySave;
    if (!pending) return;

    this._pendingPanelHistorySave = null;
    this._setHistory(
      savePartialValueToHistory(
        this._getLatestHistory(),
        pending.value,
        undefined,
        pending.changeContext
      ),
      () => this.updateToolbar()
    );
    this._checkNoUndeclaredHistoryChange(Object.keys(pending.value));
  };

  // $FlowFixMe[missing-local-annot]
  _flushPendingPanelHistorySaveDebounced = (debounce(() => {
    this._flushPendingPanelHistorySave();
  }, 500): any);

  /**
   * Return the value of the instances target, with the given instances
   * updated to their current state - much cheaper than serializing all the
   * instances of the scene, which can be a lot (this is called at each
   * modification from a panel, like each digit typed in a field).
   */
  _getInstancesPartialSnapshot = (
    baseValue: Object,
    instances: Array<gdInitialInstance>
  ): Object => {
    const baseInstances = baseValue.instances;
    if (!Array.isArray(baseInstances))
      return this._serializeHistoryTargets(['instances']);

    const serializedInstancesByUuid = new Map<string, Object>();
    instances.forEach(instance => {
      instance.getVariables().ensurePersistentUuids();
      serializedInstancesByUuid.set(
        instance.getPersistentUuid(),
        serializeToJSObject(instance)
      );
    });
    let updatedCount = 0;
    const newInstances = baseInstances.map(serializedInstance => {
      const updatedInstance = serializedInstancesByUuid.get(
        serializedInstance.persistentUuid
      );
      if (!updatedInstance) return serializedInstance;
      updatedCount++;
      return updatedInstance;
    });
    // An instance not found in the snapshot: something else changed the
    // instances without being saved. Take a full snapshot to be safe.
    if (updatedCount !== serializedInstancesByUuid.size)
      return this._serializeHistoryTargets(['instances']);

    return { instances: newInstances };
  };

  /**
   * Same as `_getInstancesPartialSnapshot`, for objects (which can be
   * large: sprites with many animations).
   */
  _getObjectsPartialSnapshot = (
    baseValue: Object,
    objects: Array<gdObject>
  ): Object => {
    const { objectsContainer } = this.props;
    const value: { [string]: Object } = {};
    objects.forEach(object => {
      const objectName = object.getName();
      const key = objectsContainer.hasObjectNamed(objectName)
        ? 'objects'
        : 'globalObjects';
      const baseObjectsValue = value[key] || baseValue[key];
      const baseObjects = baseObjectsValue && baseObjectsValue.objects;
      if (!Array.isArray(baseObjects)) {
        value[key] = this._serializeHistoryTargets([key])[key];
        return;
      }
      let found = false;
      this._ensurePersistentUuidsOfObject(object);
      const newObjects = baseObjects.map(serializedObject => {
        if (serializedObject.name !== objectName) return serializedObject;
        found = true;
        return {
          name: objectName,
          type: object.getType(),
          serialized: serializeToJSObject(object),
        };
      });
      if (!found) {
        value[key] = this._serializeHistoryTargets([key])[key];
        return;
      }
      value[key] = { ...baseObjectsValue, objects: newObjects };
    });
    return value;
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

  _onSetAsGlobalObject = (object: gdObject) => {
    this._recordHistoryStep(
      undefined,
      { source: 'panel', editorId: 'objects-list' },
      [...OBJECTS_HISTORY_KEYS, 'behaviorsSharedData']
    );
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
    this._recordGranularObjectHistorySteps(
      objectWithContext,
      {
        source: 'panel',
        editorId: 'properties',
        // The dialog can be opened without selecting the object first.
        revealSelection: {
          lastSelectionType: 'object',
          selectedObjectNames: [objectWithContext.object.getName()],
          selectedObjectGroupName: null,
          selectedLayerName: null,
        },
      },
      ['behaviorsSharedData']
    );
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

  /**
   * Create an instance of the given object, at the position
   * previously chosen (see `newObjectInstanceSceneCoordinates`).
   */
  _addInstanceForNewObject = (newObjectName: string) => {
    const { newObjectInstanceSceneCoordinates } = this.state;
    if (!newObjectInstanceSceneCoordinates) return;
    this._addInstance(newObjectInstanceSceneCoordinates, newObjectName);
    this.setState({ newObjectInstanceSceneCoordinates: null });
  };

  _onObjectCreated = (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => {
    if (objects.length === 0) {
      return;
    }
    // Run the per-object-type additional work for every created object (for
    // instance, a lighting layer is created for a light object): bulk paste
    // and duplicate can create several objects at once.
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

    // "Add under cursor" coordinates are only meaningful when a single new
    // object is created through the dialog flow; bulk paste/duplicate should
    // never auto-place stacked instances at the same position.
    // Saved before the instance is added (which saves its own step), so
    // that undoing the instance never leaves it without its object.
    // Layers too: a layer can be created for the object (like a lighting
    // layer for a light).
    this._recordHistoryStep(
      'ADD',
      { source: 'panel', editorId: 'objects-list' },
      [...OBJECTS_HISTORY_KEYS, 'layers']
    );
    if (objects.length === 1) {
      this._addInstanceForNewObject(objects[0].getName());
    }

    this.props.onObjectListsModified({
      isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
    });
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
        newState.chosenLayer = BASE_LAYER_NAME;
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

          // The history is saved by the layers list once it removed the
          // layer (see `_onLayersModified`), in a single step with the
          // instances removed above.
          if (doRemove) this._removedLayerNameToReveal = layerName;
          done(doRemove);
          this._removedLayerNameToReveal = null;
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
    // The history is saved by the layers list right after (see
    // `_onLayersModified`).
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

  // Set while a layer is removed: undoing the removal shows this layer.
  _removedLayerNameToReveal: ?string = null;

  _onLayersModified = (hasAnyEffectBeenAdded: boolean) => {
    const removedLayerName = this._removedLayerNameToReveal;
    this._removedLayerNameToReveal = null;
    // Instances too: removing a layer removes its instances.
    this._recordHistoryStep(
      undefined,
      {
        source: 'panel',
        editorId: 'layers-list',
        ...(typeof removedLayerName === 'string'
          ? {
              // Undoing the removal shows the layer back (it's not
              // selected anymore at this point: give its name).
              revealSelection: {
                lastSelectionType: 'layer',
                selectedObjectNames: [],
                selectedObjectGroupName: null,
                selectedLayerName: removedLayerName,
              },
            }
          : {}),
      },
      ['layers', 'instances']
    );

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
      // Don't keep references to objects that are not shown anymore (they
      // can be deleted in the meantime).
      selectedObjectFolderOrObjectsWithContext: [],
    });
  };

  _onSelectObjectGroup = (objectGroup: gdObjectGroup | null) => {
    this.setState({
      selectedObjectGroup: objectGroup,
      lastSelectionType: 'objectGroup',
      selectedLayer: null,
      selectedObjectFolderOrObjectsWithContext: [],
    });
  };

  _onDeleteObjects = (
    i18n: I18nType,
    objectsWithContext: ObjectWithContext[],
    done: boolean => void
  ) => {
    const { project, layout, eventsBasedObject, onObjectsDeleted } = this.props;
    const deletedObjectNames = objectsWithContext.map(({ object }) =>
      object.getName()
    );

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
    this._isRefactoringObjects = true;
    done(true);
    this._isRefactoringObjects = false;
    onObjectsDeleted();
    // Deleting an object only removes its own definition, its instances (in
    // this scene, not in external layouts - see the note on
    // `_getHistoryTargets`) and its membership in groups: it doesn't touch
    // events, so - unlike a rename - it can be undone like any other change
    // to these targets.
    this._recordHistoryStep(
      'DELETE',
      {
        source: 'panel',
        editorId: 'objects-list',
        // Undoing the deletion shows the objects back (they are not
        // selected anymore at this point: give their names).
        revealSelection: {
          lastSelectionType: 'object',
          selectedObjectNames: deletedObjectNames,
          selectedObjectGroupName: null,
          selectedLayerName: null,
        },
      },
      [...OBJECTS_HISTORY_KEYS, ...OBJECT_GROUPS_HISTORY_KEYS, 'instances']
    );

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
    // newName is supposed to have been already validated.
    const oldName = object.getName();
    if (oldName === newName) return;

    this._renameObjectOrGroup(false, global, oldName, newName);
    this._recordHistoryCommand(
      { type: 'renameObject', global, oldName, newName },
      { source: 'panel', editorId: 'objects-list' }
    );
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
      this._onObjectFolderOrObjectsWithContextSelected([
        objectFolderOrObjectWithContext,
      ]);
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
    this._onObjectFolderOrObjectsWithContextSelected([
      objectFolderOrObjectWithContext,
    ]);
    this._isRefactoringObjects = true;
    done(true);
    this._isRefactoringObjects = false;
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
    this._recordHistoryStep(
      'DELETE',
      { source: 'panel', editorId: 'object-groups-list' },
      OBJECT_GROUPS_HISTORY_KEYS
    );
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
    const oldName = group.getName();

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
    if (oldName !== newName) {
      this._recordHistoryCommand(
        { type: 'renameObjectGroup', global, oldName, newName },
        { source: 'panel', editorId: 'object-groups-list' }
      );
    }
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

    this._recordHistoryStep('DELETE', { source: 'canvas' }, ['instances']);
    this.setState({
      selectedObjectFolderOrObjectsWithContext: [],
    });

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
        enabled: Clipboard.has(INSTANCES_CLIPBOARD_KIND),
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
      { type: 'separator' },
      {
        label: i18n._(t`Extract`),
        submenu: [
          {
            label: i18n._(t`Extract as a custom object`),
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
          enabled: Clipboard.has(INSTANCES_CLIPBOARD_KIND),
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
        ...this.getContextMenuInstancesWiseItems(i18n),
        { type: 'separator' },
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
        object && project.hasEventsBasedObject(object.getType())
          ? {
              label: i18n._(t`Edit children`),
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

  paste = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
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
    if (x === null || y === null || instancesContent === null) return;

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

    this._onInstancesAddedWithoutRecordingHistory(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });

    const { editorDisplay } = this;
    if (editorDisplay) {
      const viewPosition = editorDisplay.viewControls.getViewPosition();
      if (viewPosition) {
        const lastPosition = useLastCursorPosition
          ? editorDisplay.viewControls.getLastCursorSceneCoordinates()
          : editorDisplay.viewControls.getLastContextMenuSceneCoordinates();
        const position = viewPosition.containsPoint(
          lastPosition[0],
          lastPosition[1]
        )
          ? lastPosition
          : [viewPosition.getViewX(), viewPosition.getViewY()];
        for (const instance of newInstances) {
          instance.setX(instance.getX() + position[0]);
          instance.setY(instance.getY() + position[1]);
        }
        editorDisplay.instancesHandlers.snapSelection(newInstances);
      }
    }
    // Only now that the instances are at their final position.
    this._recordHistoryStep('ADD', { source: 'canvas' }, ['instances']);
    this._sendAddedInstances(newInstances);

    // Immediately update the properties editor to ensure they keep no reference
    // to the deleted instances.
    this.forceUpdatePropertiesEditor();
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

    this._recordHistoryStep(
      undefined,
      { source: 'panel', editorId: 'objects-list' },
      [...OBJECTS_HISTORY_KEYS, 'instances', 'layers']
    );
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
      this.setState({ chosenLayer: BASE_LAYER_NAME });
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
    const { editorDisplay } = this;
    if (editorDisplay) {
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
          editorDisplay.instancesHandlers.resetInstanceRenderersFor(
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

  _containerElement: ?HTMLDivElement = null;

  /**
   * If the focused element disappeared (like a button of the properties
   * panel unmounted after an undo), the focus falls back on the document
   * body - outside of the editor, killing its keyboard shortcuts. Take the
   * focus back in that case.
   */
  _ensureKeyboardFocusStaysInEditor = () => {
    const containerElement = this._containerElement;
    if (!containerElement) return;
    const { activeElement } = document;
    if (
      activeElement &&
      activeElement !== document.body &&
      containerElement.contains(activeElement)
    ) {
      // The keyboard is already usable in the editor: don't move the focus
      // (notably not to the embedded game while a shortcut is being typed
      // in a panel: the game would not know about the modifier keys already
      // held, and ignore the next undo/redo).
      return;
    }

    // In the 3D editor, the keyboard is handled by the embedded game: its
    // in-game editor has its own shortcuts (like "F" to focus the
    // selection) and forwards undo/redo & others back to the editor. Give
    // it the focus instead of the editor container.
    if (
      this.props.gameEditorMode === 'embedded-game' &&
      focusEmbeddedGameFrame()
    ) {
      return;
    }

    containerElement.focus();
  };

  /**
   * Restart the flash animation of an element (remove then re-add the
   * class, with a reflow in between so the animation is seen again).
   */
  _flashElement = (element: HTMLElement) => {
    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    element.classList.remove('undo-redo-property-flash');
    void element.offsetWidth;
    element.classList.add('undo-redo-property-flash');
  };

  _isElementVisible = (element: HTMLElement): boolean =>
    !!(element.offsetWidth || element.offsetHeight);

  /**
   * Find, inside `scopeElement`, the element with `attributeName` set to
   * exactly `attributeValue` - user-controlled values (an object, behavior,
   * effect or variable name) can't safely be embedded in a CSS attribute
   * selector, so every element carrying the attribute is checked instead.
   */
  _findElementByAttribute = (
    scopeElement: HTMLElement,
    attributeName: string,
    attributeValue: string
  ): ?HTMLElement => {
    const elements = scopeElement.querySelectorAll(`[${attributeName}]`);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (
        element instanceof HTMLElement &&
        element.getAttribute(attributeName) === attributeValue
      ) {
        return element;
      }
    }
    return null;
  };

  /**
   * Flash the objects list row of the given object, if visible.
   */
  _flashObjectListRowByName = (objectName: string) => {
    const containerElement = this._containerElement;
    const { editorDisplay } = this;
    if (!containerElement || !editorDisplay) return;
    if (!editorDisplay.isEditorVisible('objects-list')) return;

    // The objects list is virtualized: the row may not even be mounted if
    // it's scrolled out of view - bring it into the rendered window first.
    const object = getObjectByName(
      this.props.globalObjectsContainer,
      this.props.objectsContainer,
      objectName
    );
    if (object) editorDisplay.scrollObjectsListToObject(object);

    const tryFlash = (): boolean => {
      const element = this._findElementByAttribute(
        containerElement,
        'data-object-name',
        objectName
      );
      if (element && this._isElementVisible(element)) {
        this._flashElement(element);
        return true;
      }
      return false;
    };
    if (tryFlash()) return;
    setTimeout(tryFlash, 150);
  };

  _flashObjectGroupsListRowByName = (groupName: string) => {
    const containerElement = this._containerElement;
    const { editorDisplay } = this;
    if (!containerElement || !editorDisplay) return;
    if (!editorDisplay.isEditorVisible('object-groups-list')) return;

    const { objectsContainer, globalObjectsContainer } = this.props;
    const groupsContainer = [
      objectsContainer.getObjectGroups(),
      globalObjectsContainer ? globalObjectsContainer.getObjectGroups() : null,
    ].find(groups => groups && groups.has(groupName));
    if (!groupsContainer) return;
    const group = groupsContainer.get(groupName);
    // Selecting the group shows its properties in the panel, so the change
    // can be seen there too.
    this._onSelectObjectGroup(group);
    editorDisplay.scrollObjectGroupsListToObjectGroup(group);

    this._flashOrRetryThenFallback(() => {
      const element = this._findElementByAttribute(
        containerElement,
        'data-group-name',
        groupName
      );
      if (element && this._isElementVisible(element)) {
        this._flashElement(element);
        return true;
      }
      return false;
    }, containerElement);
  };

  /**
   * Try `tryFlash` (which should flash whatever specific row/panel it can
   * find and return whether it found one), retrying for a bit if it found
   * nothing - a freshly unfolded section or a virtualized list (the
   * variables list only mounts its visible rows, and can take several
   * render cycles to settle after being asked to scroll a long way) can
   * take longer than a couple of frames to finish rendering - then fall
   * back to flashing `fallbackElement`.
   */
  _flashOrRetryThenFallback = (
    tryFlash: () => boolean,
    fallbackElement: HTMLElement
  ) => {
    const retryDelayMs = 100;
    const maxRetries = 10;
    const attempt = (remainingRetries: number) => {
      if (tryFlash()) return;
      if (remainingRetries <= 0) {
        this._flashElement(fallbackElement);
        return;
      }
      setTimeout(() => attempt(remainingRetries - 1), retryDelayMs);
    };
    attempt(maxRetries);
  };

  /**
   * Flash the fields of a section of the properties panel, unfolding it
   * first if needed (its fields are then only rendered a moment later).
   * `onNoFieldFlashed` is called if none of the fields could be found.
   */
  _flashFieldsOfSection = (
    sectionId: string,
    fieldIds: Array<string>,
    onNoFieldFlashed?: () => void
  ) => {
    const containerElement = this._containerElement;
    if (!containerElement || fieldIds.length === 0) return;
    this._unfoldSection(sectionId);

    const retryDelayMs = 100;
    let advancedFieldsShown = false;
    const attempt = (remainingRetries: number) => {
      let flashedAnyField = false;
      fieldIds.forEach(fieldId => {
        const element = this._findElementByAttribute(
          containerElement,
          'id',
          fieldId
        );
        if (element && this._isElementVisible(element)) {
          this._flashElement(element);
          flashedAnyField = true;
        }
      });
      if (flashedAnyField) return;
      // The field can be one of the "advanced" ones, hidden by default.
      if (!advancedFieldsShown) {
        const sectionContent = this._findElementByAttribute(
          containerElement,
          'id',
          `${sectionId}-content`
        );
        const showMoreButton =
          sectionContent &&
          this._findElementByAttribute(
            sectionContent,
            'id',
            'show-advanced-properties-button'
          );
        if (showMoreButton) {
          showMoreButton.click();
          advancedFieldsShown = true;
        }
      }
      if (remainingRetries > 0) {
        setTimeout(() => attempt(remainingRetries - 1), retryDelayMs);
      } else if (onNoFieldFlashed) {
        onNoFieldFlashed();
      }
    };
    attempt(5);
  };

  /**
   * Show the changed fields of a sub panel (a behavior or an effect) of a
   * section of the properties panel: unfold the section, the sub panel and
   * its advanced fields if needed - and flash the changed fields, or the
   * sub panel itself if none of them can be found (the ids of the fields
   * don't always follow the keys of the serialized content).
   */
  _revealChangedFieldsOfSubPanel = (
    sectionId: string,
    subPanelId: string,
    changedKeys: Array<string>
  ) => {
    const containerElement = this._containerElement;
    if (!containerElement) return;
    this._unfoldSection(sectionId);

    const retryDelayMs = 100;
    let subPanelUnfolded = false;
    let advancedFieldsShown = false;
    const attempt = (remainingRetries: number) => {
      const panelElement = this._findElementByAttribute(
        containerElement,
        'id',
        subPanelId
      );
      if (panelElement && this._isElementVisible(panelElement)) {
        if (!subPanelUnfolded) {
          const unfoldButton = this._findElementByAttribute(
            panelElement,
            'id',
            `${subPanelId}-unfold-button`
          );
          if (unfoldButton) {
            unfoldButton.click();
            subPanelUnfolded = true;
            setTimeout(() => attempt(remainingRetries), retryDelayMs);
            return;
          }
          subPanelUnfolded = true;
        }
        const fieldElements = changedKeys
          .map(key => this._findFieldElementByKey(panelElement, key))
          .filter(Boolean);
        if (fieldElements.length > 0) {
          fieldElements.forEach(element => this._flashElement(element));
          return;
        }
        if (!advancedFieldsShown) {
          const showMoreButton = this._findElementByAttribute(
            panelElement,
            'id',
            'show-advanced-properties-button'
          );
          if (showMoreButton) {
            showMoreButton.click();
            advancedFieldsShown = true;
            setTimeout(() => attempt(remainingRetries), retryDelayMs);
            return;
          }
        }
        this._flashElement(panelElement);
        return;
      }
      if (remainingRetries > 0)
        setTimeout(() => attempt(remainingRetries - 1), retryDelayMs);
    };
    attempt(10);
  };

  /**
   * Find the field of the given serialized key in an element - the ids of
   * the fields are the names of the properties, which usually only differ
   * from the keys of the serialized content by their case.
   */
  _findFieldElementByKey = (
    scopeElement: HTMLElement,
    key: string
  ): ?HTMLElement => {
    const lowerCaseKey = key.toLowerCase();
    const elements = scopeElement.querySelectorAll('[id]');
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (
        element instanceof HTMLElement &&
        element.id.toLowerCase() === lowerCaseKey &&
        this._isElementVisible(element)
      )
        return element;
    }
    return null;
  };

  /**
   * Unfold a section of the properties panel (if it's folded), so that a
   * change made inside can be revealed.
   */
  _unfoldSection = (sectionId: string) => {
    const containerElement = this._containerElement;
    if (!containerElement) return;
    const unfoldButton = this._findElementByAttribute(
      containerElement,
      'id',
      `${sectionId}-unfold-button`
    );
    if (unfoldButton) unfoldButton.click();
  };

  /**
   * Flash the rows of the variables (of an object, an instance, a scene...)
   * whose value changed, inside the section identified by `sectionId` - or
   * the section itself if none of the changed variables have a visible row
   * (the section is folded).
   */
  _flashChangedVariableRows = (
    sectionId: string,
    before: ?Array<Object>,
    after: ?Array<Object>
  ) => {
    const containerElement = this._containerElement;
    const { editorDisplay } = this;
    if (!containerElement || !editorDisplay) return;
    const sectionElement = this._findElementByAttribute(
      containerElement,
      'id',
      sectionId
    );
    if (!sectionElement || !this._isElementVisible(sectionElement)) return;

    const changedNodeIds = getChangedVariableNodeIds(before, after);
    if (changedNodeIds.length === 0) {
      // Removed variables have no row anymore: flash the section instead.
      if (hasRemovedVariables(before, after)) {
        this._unfoldSection(sectionId);
        this._flashElement(sectionElement);
      }
      return;
    }

    this._unfoldSection(sectionId);
    // The variables list only renders its visible rows: ask it to scroll to
    // the changed variable before looking it up in the DOM.
    editorDisplay.revealPropertiesVariable(changedNodeIds[0]);

    this._flashOrRetryThenFallback(() => {
      // The section's content (where the rows are) is a sibling of the
      // section's own (always mounted) header element, not a descendant
      // of it - look it up separately (see `TopLevelCollapsibleSection`).
      const contentElement = this._findElementByAttribute(
        containerElement,
        'id',
        `${sectionId}-content`
      );
      if (!contentElement) return false;
      let flashedAnyRow = false;
      changedNodeIds.forEach(nodeId => {
        const element = this._findElementByAttribute(
          contentElement,
          'data-variable-node-id',
          nodeId
        );
        if (element && this._isElementVisible(element)) {
          this._flashElement(element);
          flashedAnyRow = true;
        }
      });
      return flashedAnyRow;
    }, sectionElement);
  };

  /**
   * Flash the panel of each effect (of an object or a layer) whose
   * parameters changed - or the section itself if the panel is folded.
   */
  _flashChangedEffectRows = (
    editorId: EditorId,
    before: ?Array<Object>,
    after: ?Array<Object>,
    getSectionId: (serializedEffect: Object) => string
  ) => {
    const { editorDisplay } = this;
    const containerElement = this._containerElement;
    if (!containerElement || !editorDisplay) return;
    if (!editorDisplay.isEditorVisible(editorId)) return;

    (after || []).forEach(afterEffect => {
      const beforeEffect = findSerializedItemByName(before, afterEffect.name);
      // An added effect is already visible by appearing in the list.
      if (!beforeEffect) return;
      const changedKeys = getChangedTopLevelKeys(beforeEffect, afterEffect, [
        'name',
      ]);
      if (changedKeys.length === 0) return;

      // The parameters are grouped by type: find the ones that changed.
      const changedParameterNames = [];
      ['doubleParameters', 'stringParameters', 'booleanParameters'].forEach(
        parametersKey => {
          const beforeParameters = beforeEffect[parametersKey] || {};
          const afterParameters = afterEffect[parametersKey] || {};
          new Set([
            ...Object.keys(beforeParameters),
            ...Object.keys(afterParameters),
          ]).forEach(parameterName => {
            if (
              beforeParameters[parameterName] !== afterParameters[parameterName]
            )
              changedParameterNames.push(parameterName);
          });
        }
      );
      this._revealChangedFieldsOfSubPanel(
        getSectionId(afterEffect),
        `effect-panel-${afterEffect.name}`,
        changedParameterNames.length > 0 ? changedParameterNames : changedKeys
      );
    });
  };

  /**
   * Flash the panel of each behavior (of an object) whose properties
   * changed - or the section itself if the panel is folded.
   */
  _flashChangedBehaviorRows = (
    before: ?Array<Object>,
    after: ?Array<Object>
  ) => {
    const { editorDisplay } = this;
    const containerElement = this._containerElement;
    if (!containerElement || !editorDisplay) return;
    if (!editorDisplay.isEditorVisible('properties')) return;
    const sectionElement = this._findElementByAttribute(
      containerElement,
      'id',
      'behaviors-section'
    );
    if (!sectionElement || !this._isElementVisible(sectionElement)) return;

    (after || []).forEach(afterBehavior => {
      const beforeBehavior = findSerializedItemByName(
        before,
        afterBehavior.name
      );
      // An added behavior is already visible by appearing in the list.
      if (!beforeBehavior) return;
      const changedKeys = getChangedTopLevelKeys(
        beforeBehavior,
        afterBehavior,
        ['name', 'type']
      );
      if (changedKeys.length === 0) return;

      this._revealChangedFieldsOfSubPanel(
        'behaviors-section',
        `behavior-panel-${afterBehavior.name}`,
        changedKeys
      );
    });
  };

  /**
   * After an undo/redo touching instances, briefly highlight the rows of
   * the properties panel showing the values it changed.
   */
  _flashChangedInstancePropertyRows = (
    instancesBeforeChange: ?Array<Object>,
    instancesAfterChange: ?Array<Object>,
    changedOrAddedPersistentUuids: Array<string>
  ) => {
    if (changedOrAddedPersistentUuids.length === 0) return;
    const containerElement = this._containerElement;
    if (!containerElement) return;

    const byUuid = (instances: ?Array<Object>) =>
      new Map(
        (instances || [])
          .filter(instance => instance.persistentUuid)
          .map(instance => [instance.persistentUuid, instance])
      );
    const instancesByUuidBeforeChange = byUuid(instancesBeforeChange);
    const instancesByUuidAfterChange = byUuid(instancesAfterChange);

    const changedFieldIds = new Set<string>();
    const changedInstanceVariables: Array<{|
      before: ?Array<Object>,
      after: ?Array<Object>,
    |}> = [];
    let anyBehaviorOverrideChanged = false;
    const changedKeysByBehaviorName = new Map<string, Array<string>>();
    changedOrAddedPersistentUuids.forEach(persistentUuid => {
      const beforeInstance = instancesByUuidBeforeChange.get(persistentUuid);
      const afterInstance = instancesByUuidAfterChange.get(persistentUuid);
      // Only flash edited instances: an instance appearing or disappearing
      // (undo/redo of an addition or deletion) is seen on the canvas, and
      // flashing all its rows would be noise.
      if (!beforeInstance || !afterInstance) return;
      new Set([
        ...Object.keys(beforeInstance),
        ...Object.keys(afterInstance),
      ]).forEach(key => {
        if (
          JSON.stringify(beforeInstance[key]) !==
          JSON.stringify(afterInstance[key])
        ) {
          const fieldId = serializedInstanceKeyToPropertyFieldId[key];
          if (fieldId) changedFieldIds.add(fieldId);
        }
      });
      if (
        getChangedVariableNodeIds(
          beforeInstance.initialVariables,
          afterInstance.initialVariables
        ).length > 0 ||
        // Removed variables (undoing an addition) are shown too.
        hasRemovedVariables(
          beforeInstance.initialVariables,
          afterInstance.initialVariables
        )
      ) {
        changedInstanceVariables.push({
          before: beforeInstance.initialVariables,
          after: afterInstance.initialVariables,
        });
      }
      if (
        JSON.stringify(beforeInstance.numberProperties) !==
          JSON.stringify(afterInstance.numberProperties) ||
        JSON.stringify(beforeInstance.stringProperties) !==
          JSON.stringify(afterInstance.stringProperties)
      ) {
        anyBehaviorOverrideChanged = true;
      }
      // The properties of a behavior changed for this instance only.
      const beforeOverridings = beforeInstance.behaviorOverridings || [];
      const afterOverridings = afterInstance.behaviorOverridings || [];
      [...beforeOverridings, ...afterOverridings].forEach(({ name }) => {
        const beforeOverriding = findSerializedItemByName(
          beforeOverridings,
          name
        );
        const afterOverriding = findSerializedItemByName(
          afterOverridings,
          name
        );
        if (
          JSON.stringify(beforeOverriding) !== JSON.stringify(afterOverriding)
        ) {
          changedKeysByBehaviorName.set(
            name,
            getChangedTopLevelKeys(
              beforeOverriding || {},
              afterOverriding || {},
              ['name', 'type']
            )
          );
          anyBehaviorOverrideChanged = true;
        }
      });
    });
    if (
      changedFieldIds.size === 0 &&
      changedInstanceVariables.length === 0 &&
      !anyBehaviorOverrideChanged
    )
      return;

    // Only flash if the panel is shown (`_revealHistoryChanges` opens it
    // if the change was made there).
    const { editorDisplay } = this;
    if (!editorDisplay || !editorDisplay.isEditorVisible('properties')) return;

    // Wait for the properties panel to (re-)render with the new values
    // before flashing its rows.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        changedFieldIds.forEach(fieldId => {
          // Field ids can contain spaces: use an attribute selector.
          const element = containerElement.querySelector(`[id="${fieldId}"]`);
          if (!element) return;
          this._flashElement(element);
        });
        changedInstanceVariables.forEach(({ before, after }) => {
          this._flashChangedVariableRows(
            'instance-variables-section',
            before,
            after
          );
        });
        if (anyBehaviorOverrideChanged) {
          this._unfoldSection('behaviors-section');
          if (changedKeysByBehaviorName.size === 0) {
            const sectionElement = this._findElementByAttribute(
              containerElement,
              'id',
              'behaviors-section'
            );
            if (sectionElement && this._isElementVisible(sectionElement)) {
              this._flashElement(sectionElement);
            }
          }
          changedKeysByBehaviorName.forEach((changedKeys, behaviorName) => {
            this._revealChangedFieldsOfSubPanel(
              'behaviors-section',
              `behavior-panel-${behaviorName}`,
              changedKeys
            );
          });
        }
      });
    });
  };

  /**
   * Flash the properties panel rows of every object (and, as a fallback,
   * its objects list row) whose serialized content changed.
   */
  _flashChangedObjectPropertyRows = (
    objectsBefore: Array<Object>,
    objectsAfter: Array<Object>
  ) => {
    const { editorDisplay } = this;
    const containerElement = this._containerElement;
    if (!containerElement || !editorDisplay) return;

    objectsAfter.forEach(afterObject => {
      const beforeObject = findSerializedItemByName(
        objectsBefore,
        afterObject.name
      );
      // An added object is already visible by appearing in the objects list.
      if (!beforeObject) return;
      const beforeSerialized = beforeObject.serialized || {};
      const afterSerialized = afterObject.serialized || {};
      if (JSON.stringify(beforeSerialized) === JSON.stringify(afterSerialized))
        return;

      // Show the object in the list too (opening its folder if needed).
      this._flashObjectListRowByName(afterObject.name);

      if (editorDisplay.isEditorVisible('properties')) {
        const changedFieldIds = [
          ...getChangedTopLevelKeys(beforeSerialized, afterSerialized, [
            'behaviors',
            'effects',
            'variables',
            'content',
            'name',
            'type',
          ]),
          ...getChangedTopLevelKeys(
            beforeSerialized.content,
            afterSerialized.content
          ),
        ];
        this._flashFieldsOfSection(
          'object-properties-section',
          changedFieldIds
        );

        this._flashChangedBehaviorRows(
          beforeSerialized.behaviors,
          afterSerialized.behaviors
        );
        this._flashChangedEffectRows(
          'properties',
          beforeSerialized.effects,
          afterSerialized.effects,
          () => 'object-effects-section'
        );
        this._flashChangedVariableRows(
          'object-variables-section',
          beforeSerialized.variables,
          afterSerialized.variables
        );
      }
    });
  };

  /**
   * Flash the membership section of every group whose objects changed.
   */
  _flashChangedObjectGroupPropertyRows = (
    groupsBefore: Array<Object>,
    groupsAfter: Array<Object>
  ) => {
    const { editorDisplay } = this;
    const containerElement = this._containerElement;
    if (!containerElement || !editorDisplay) return;
    if (!editorDisplay.isEditorVisible('properties')) return;

    groupsAfter.forEach(afterGroup => {
      const beforeGroup = findSerializedItemByName(
        groupsBefore,
        afterGroup.name
      );
      if (!beforeGroup) return;
      const changedKeys = getChangedTopLevelKeys(
        beforeGroup.serialized,
        afterGroup.serialized,
        ['name']
      );
      if (changedKeys.length === 0) return;

      this._unfoldSection('group-objects-section');
      const sectionElement = this._findElementByAttribute(
        containerElement,
        'id',
        'group-objects-section'
      );
      if (sectionElement && this._isElementVisible(sectionElement)) {
        this._flashElement(sectionElement);
      }
    });
  };

  /**
   * Flash the properties panel rows of every layer whose properties or
   * effects changed.
   */
  _flashChangedLayerPropertyRows = (
    layersBefore: ?Array<Object>,
    layersAfter: ?Array<Object>
  ) => {
    const { editorDisplay } = this;
    const containerElement = this._containerElement;
    if (!containerElement || !editorDisplay) return;

    (layersAfter || []).forEach(afterLayer => {
      const beforeLayer = findSerializedItemByName(
        layersBefore,
        afterLayer.name
      );
      if (!beforeLayer) return;

      if (editorDisplay.isEditorVisible('properties')) {
        const changedKeys = getChangedTopLevelKeys(beforeLayer, afterLayer, [
          'effects',
          'name',
        ]);
        const changedFieldIds = new Set(
          changedKeys
            .map(key => serializedLayerKeyToPropertyFieldId[key])
            .filter(Boolean)
        );
        this._flashFieldsOfSection('layer-properties-section', [
          ...changedFieldIds,
        ]);
      }

      this._flashChangedEffectRows(
        'properties',
        beforeLayer.effects,
        afterLayer.effects,
        // A layer has a section for its 2D effects and one for its 3D ones.
        serializedEffect =>
          gd.MetadataProvider.getEffectMetadata(
            this.props.project.getCurrentPlatform(),
            serializedEffect.effectType
          ).isMarkedAsOnlyWorkingFor3D()
            ? 'layer-3d-effects-section'
            : 'layer-2d-effects-section'
      );
    });
  };

  /**
   * Dispatch to the flash functions above, for every kind of change that
   * has a stable target in the properties panel or the objects list -
   * covering everything `_flashChangedInstancePropertyRows` doesn't (which
   * only handles instances).
   */
  _flashChangedPropertyRows = (
    beforeChange: Object,
    afterChange: Object,
    changedKeys: Array<string>
  ) => {
    const getObjects = (value: ?Object): Array<Object> =>
      (value && value.objects) || [];
    if (changedKeys.some(key => OBJECTS_HISTORY_KEYS.includes(key))) {
      this._flashChangedObjectPropertyRows(
        [
          ...getObjects(beforeChange.objects),
          ...getObjects(beforeChange.globalObjects),
        ],
        [
          ...getObjects(afterChange.objects),
          ...getObjects(afterChange.globalObjects),
        ]
      );
    }

    // An object moved to another folder (or a folder deleted, moving its
    // objects out): show the objects at their new place, opening their
    // folder if needed.
    ['objects', 'globalObjects'].forEach(key => {
      const beforeFolders = beforeChange[key] && beforeChange[key].folders;
      const afterFolders = afterChange[key] && afterChange[key].folders;
      if (
        !beforeFolders ||
        !afterFolders ||
        JSON.stringify(beforeFolders) === JSON.stringify(afterFolders)
      )
        return;
      const getObjectFolderPaths = (
        folder: Object,
        path: string,
        paths: { [string]: string }
      ): { [string]: string } => {
        (folder.children || []).forEach(child => {
          if (child.objectName !== undefined) paths[child.objectName] = path;
          else
            getObjectFolderPaths(
              child,
              `${path}/${child.folderName || ''}`,
              paths
            );
        });
        return paths;
      };
      const beforePaths = getObjectFolderPaths(beforeFolders, '', {});
      const afterPaths = getObjectFolderPaths(afterFolders, '', {});
      Object.keys(afterPaths)
        .filter(
          objectName => beforePaths[objectName] !== afterPaths[objectName]
        )
        .forEach(objectName => this._flashObjectListRowByName(objectName));
    });

    const getGroups = (value: ?Object): Array<Object> =>
      (value && value.groups) || [];
    if (changedKeys.some(key => OBJECT_GROUPS_HISTORY_KEYS.includes(key))) {
      const groupsBefore = [
        ...getGroups(beforeChange.objectGroups),
        ...getGroups(beforeChange.globalObjectGroups),
      ];
      const groupsAfter = [
        ...getGroups(afterChange.objectGroups),
        ...getGroups(afterChange.globalObjectGroups),
      ];
      this._flashChangedObjectGroupPropertyRows(groupsBefore, groupsAfter);
      // Show the groups that changed (or were added/renamed) in the list.
      groupsAfter
        .filter(
          afterGroup =>
            JSON.stringify(
              findSerializedItemByName(groupsBefore, afterGroup.name)
            ) !== JSON.stringify(afterGroup)
        )
        .forEach(afterGroup =>
          this._flashObjectGroupsListRowByName(afterGroup.name)
        );
    }

    if (changedKeys.includes('layers')) {
      this._flashChangedLayerPropertyRows(
        beforeChange.layers,
        afterChange.layers
      );
    }

    if (changedKeys.includes('sceneProperties')) {
      const changedFieldIds = new Set(
        getChangedTopLevelKeys(
          beforeChange.sceneProperties,
          afterChange.sceneProperties
        )
          .map(key => scenePropertyKeyToPropertyFieldId[key])
          .filter(Boolean)
      );
      this._flashFieldsOfSection('scene-properties-section', [
        ...changedFieldIds,
      ]);
    }
    if (changedKeys.includes('behaviorsSharedData')) {
      const before = beforeChange.behaviorsSharedData || {};
      const after = afterChange.behaviorsSharedData || {};
      Object.keys(after)
        .filter(
          name => JSON.stringify(before[name]) !== JSON.stringify(after[name])
        )
        .forEach(name => {
          this._revealChangedFieldsOfSubPanel(
            'scene-behaviors-section',
            `behavior-panel-${name}`,
            getChangedTopLevelKeys(before[name] || {}, after[name] || {})
          );
        });
    }

    if (changedKeys.includes('sceneVariables')) {
      // Unlike an object's or an instance's `variables`/`initialVariables`
      // (already the flat {name, type, value/children} shape), a variables
      // container history target wraps each variable's serialized content
      // under its own `serialized` key (see
      // `getVariablesContainerHistoryTarget`): flatten it back.
      const getVariables = (value: ?Object): Array<Object> =>
        ((value && value.variables) || []).map(item => ({
          name: item.name,
          ...item.serialized,
        }));
      this._flashChangedVariableRows(
        'scene-variables-section',
        getVariables(beforeChange.sceneVariables),
        getVariables(afterChange.sceneVariables)
      );
    }
  };

  /**
   * The history targets edited by the variables list of the properties
   * panel, which depend on what is selected.
   */
  _getSelectionHistoryKeys = (): Array<string> => {
    const { lastSelectionType, selectedObjectGroup } = this.state;
    if (
      lastSelectionType === 'instance' &&
      this.instancesSelection.getSelectedInstances().length > 0
    ) {
      return ['instances'];
    }
    if (lastSelectionType === 'object') return OBJECTS_HISTORY_KEYS;
    if (lastSelectionType === 'objectGroup' && selectedObjectGroup) {
      // The variables of a group are applied to its objects.
      return [...OBJECT_GROUPS_HISTORY_KEYS, ...OBJECTS_HISTORY_KEYS];
    }
    if (lastSelectionType === 'layer') return ['layers'];
    return VARIABLES_HISTORY_KEYS;
  };

  /**
   * After an undo/redo, make sure its effect can be seen - otherwise the
   * undo/redo feels like it did nothing:
   * - a change on state only shown in a panel (layers, scene properties)
   *   opens this panel,
   * - a change on instances all outside of the view moves the view to them.
   */
  _revealHistoryChanges = (
    valueBeforeChange: ?Object,
    valueAfterChange: ?Object,
    changeContext: ?HistoryChangeContext,
    changedKeys: Array<string>,
    renamedObjectName: ?string,
    renamedObjectGroupName: ?string
  ) => {
    const { editorDisplay } = this;
    if (!editorDisplay) return;
    const beforeChange: Object = valueBeforeChange || {};
    const afterChange: Object = valueAfterChange || {};

    // A change made in a panel is only visible there: open this panel. A
    // change made on the canvas is already visible: don't open anything.
    if (changeContext && changeContext.source === 'panel') {
      const isAboutTheScene =
        changedKeys.some(key =>
          ['sceneProperties', 'sceneVariables', 'behaviorsSharedData'].includes(
            key
          )
        ) &&
        // A step about an object can carry the behaviors shared data with
        // it (see `_onObjectEdited`): the object is what to show then.
        !changedKeys.some(
          key =>
            OBJECTS_HISTORY_KEYS.includes(key) ||
            OBJECT_GROUPS_HISTORY_KEYS.includes(key) ||
            key === 'layers'
        );
      if (changeContext.editorId === 'properties' && isAboutTheScene) {
        // Scene properties are only shown in the properties panel when
        // nothing is selected: deselect so the change can be seen.
        this.instancesSelection.clearSelection();
        this.setState({ lastSelectionType: 'instance' });
        this.forceUpdatePropertiesEditor();
        this._sendSelectedInstances();
      }
      editorDisplay.ensureEditorVisible(changeContext.editorId);
    }

    const {
      changedOrAddedPersistentUuids,
      removedInstances,
    } = diffInstancesSnapshots(beforeChange.instances, afterChange.instances);

    this._flashChangedInstancePropertyRows(
      beforeChange.instances,
      afterChange.instances,
      changedOrAddedPersistentUuids
    );
    // Wait for the properties/objects list/layers panels to (re-)render
    // with the new values before flashing their rows (like
    // `_flashChangedInstancePropertyRows` above already does).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._flashChangedPropertyRows(beforeChange, afterChange, changedKeys);
        if (renamedObjectName) {
          this._flashObjectListRowByName(renamedObjectName);
        }
        if (renamedObjectGroupName) {
          this._flashObjectGroupsListRowByName(renamedObjectGroupName);
        }
      });
    });

    const changedInstances = changedOrAddedPersistentUuids
      .map(persistentUuid =>
        getInstanceInLayoutWithPersistentUuid(
          this.props.initialInstances,
          persistentUuid
        )
      )
      .filter(Boolean);

    const removedPositions: Array<[number, number]> = removedInstances.map(
      instance => [Number(instance.x) || 0, Number(instance.y) || 0]
    );
    if (changedInstances.length === 0 && removedPositions.length === 0) return;

    const viewPosition = editorDisplay.viewControls.getViewPosition();
    if (!viewPosition) return;
    // If at least one touched instance is visible - even partly - the user
    // can already see the effect of the undo/redo: don't move the view.
    if (
      changedInstances.some(instance =>
        editorDisplay.viewControls.isInstanceVisibleInViewport(instance)
      )
    )
      return;
    if (removedPositions.some(([x, y]) => viewPosition.containsPoint(x, y)))
      return;

    if (changedInstances.length > 0) {
      editorDisplay.viewControls.scrollViewToLastInstance(changedInstances);
    } else {
      // Only deletions: bring the view to where the last deleted
      // instance was.
      const [x, y] = removedPositions[removedPositions.length - 1];
      editorDisplay.viewControls.scrollViewToPoint(x, y);
    }
  };

  _onKeyDownInEditor = (evt: SyntheticKeyboardEvent<HTMLElement>) => {
    // The instances editor canvas handles its own shortcuts (including
    // undo/redo): don't handle the same event twice.
    if (evt.nativeEvent.defaultPrevented) return;
    // React events bubble through the React tree, not the DOM tree: a
    // shortcut pressed inside a dialog (rendered in a portal, on top of the
    // editor) reaches this handler too. Ignore it - the dialog handles (or
    // ignores) its own shortcuts.
    if (
      evt.target instanceof Node &&
      this._containerElement &&
      !this._containerElement.contains(evt.target)
    ) {
      return;
    }
    const { target } = evt;
    // Let multiline text fields handle their own undo/redo.
    if (
      target instanceof Element &&
      target.closest('textarea, [contenteditable="true"]')
    ) {
      return;
    }
    if (!evt.ctrlKey && !evt.metaKey) return;

    const key = evt.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    evt.preventDefault();

    // A single line field (like a number field that was just scrolled) is
    // left first: the value still being edited is committed - and saved to
    // the history - before the undo/redo, so it's neither lost nor
    // re-applied on top of the undo/redo when the field is left later.
    if (target instanceof HTMLInputElement) {
      target.blur();
      // Keep the keyboard here, for the next undo/redo.
      if (this._containerElement) this._containerElement.focus();
    }

    if (key === 'y' || evt.shiftKey) this.redo();
    else this.undo();
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
                  onKeyDown={evt => {
                    this._onKeyDown(evt);
                    this._onKeyDownInEditor(evt);
                  }}
                  // Allow the container to receive the focus (see
                  // `_ensureKeyboardFocusStaysInEditor`), so the keyboard
                  // shortcuts keep working after an undo/redo.
                  tabIndex={-1}
                  ref={containerElement =>
                    (this._containerElement = containerElement)
                  }
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
                    onScenePropertiesModified={this._onScenePropertiesModified}
                    onBehaviorSharedDataModified={
                      this._onBehaviorSharedDataModified
                    }
                    onLayerPropertiesModified={this._onLayerPropertiesModified}
                    onObjectGroupModified={this._onObjectGroupModified}
                    onObjectGroupsModified={this._onObjectGroupsModified}
                    onObjectFolderOrObjectsModified={
                      this._onObjectFolderOrObjectsModified
                    }
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
                    onBackgroundColorChanged={this._onBackgroundColorChanged}
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
                    onObjectFolderOrObjectsWithContextSelected={
                      this._onObjectFolderOrObjectsWithContextSelected
                    }
                    onSetAsGlobalObject={this._onSetAsGlobalObject}
                    historyHandler={{
                      undo: this.undo,
                      redo: this.redo,
                      canUndo: () => canUndo(this.state.history),
                      canRedo: () => canRedo(this.state.history),
                      // Used by the variables list of the selected
                      // instances (in the properties panel).
                      saveToHistory: (batchKey?: string) => {
                        const changeContext: HistoryChangeContext = {
                          source: 'panel',
                          editorId: 'properties',
                        };
                        const keys = this._getSelectionHistoryKeys();
                        if (!batchKey) {
                          this._recordHistoryStep(
                            undefined,
                            changeContext,
                            keys
                          );
                          return;
                        }
                        this._queuePanelHistorySave(
                          `${keys.join('+')}/variables/${batchKey}`,
                          changeContext,
                          baseValue =>
                            keys[0] === 'instances'
                              ? this._getInstancesPartialSnapshot(
                                  baseValue,
                                  this.instancesSelection.getSelectedInstances()
                                )
                              : this._serializeHistoryTargets(keys)
                        );
                      },
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
                    onCreateNewExtensionWithBehavior={
                      this.props.onCreateNewExtensionWithBehavior
                    }
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
                        onCreateNewExtensionWithBehavior={
                          this.props.onCreateNewExtensionWithBehavior
                        }
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
                      getValidatedObjectOrGroupName={(newName, global) =>
                        this._getValidatedObjectOrGroupName(
                          newName,
                          global,
                          i18n
                        )
                      }
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
                        onApply={() => {
                          const { variablesEditedInstance } = this.state;
                          if (variablesEditedInstance) {
                            this._recordGranularInstanceVariablesHistorySteps(
                              variablesEditedInstance,
                              { source: 'panel', editorId: 'properties' }
                            );
                          }
                          this.editInstanceVariables(null);
                        }}
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
                        const { editedLayer } = this.state;
                        if (editedLayer) {
                          // The change is shown in the properties panel,
                          // with the edited layer selected (the dialog can
                          // be opened without selecting the layer first).
                          this._recordGranularLayerHistorySteps(editedLayer, {
                            source: 'panel',
                            editorId: 'properties',
                            revealSelection: {
                              lastSelectionType: 'layer',
                              selectedObjectNames: [],
                              selectedObjectGroupName: null,
                              selectedLayerName: editedLayer.getName(),
                            },
                          });
                        }
                        if (hasAnyEffectBeenAdded) {
                          // This triggers a full hot-reload. We don't need
                          // to reload layers specifically.
                          this.props.onEffectAdded();
                        } else {
                          this._sendHotReloadLayers();
                        }
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
                      onApply={() => {
                        this._recordHistoryStep(
                          undefined,
                          { source: 'panel', editorId: 'properties' },
                          ['sceneProperties']
                        );
                        this.openSceneProperties(false);
                      }}
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
                        getContentAABB={
                          this.editorDisplay
                            ? this.editorDisplay.instancesHandlers
                                .getContentAABB
                            : () => null
                        }
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
                      onApply={() => {
                        this._recordGranularVariablesHistorySteps(
                          'sceneVariables',
                          { source: 'panel', editorId: 'properties' }
                        );
                        this.openSceneVariables(false);
                      }}
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
