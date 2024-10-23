// @flow
import { type I18n as I18nType } from '@lingui/core';

import {
  type GroupWithContext,
  type ObjectWithContext,
} from '../ObjectsList/EnumerateObjects';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type InstancesEditorSettings } from '../InstancesEditor/InstancesEditorSettings';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import { type HistoryHandler } from '../VariablesList/VariablesList';
import { type InstancesEditorShortcutsCallbacks } from '../InstancesEditor';
import { type EditorId } from '.';
import Rectangle from '../Utils/Rectangle';
import ViewPosition from '../InstancesEditor/ViewPosition';
import { type ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type TileMapTileSelection } from '../InstancesEditor/TileSetVisualizer';

export type SceneEditorsDisplayProps = {|
  project: gdProject,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  layersContainer: gdLayersContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  initialInstances: gdInitialInstancesContainer,
  lastSelectionType: 'instance' | 'object',
  instancesSelection: InstancesSelection,
  selectedLayer: string,
  onSelectInstances: (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean,
    targetPosition?: 'center' | 'upperCenter'
  ) => void,
  editInstanceVariables: (instance: ?gdInitialInstance) => void,
  editObjectByName: (objectName: string, initialTab?: ObjectEditorTab) => void,
  editObjectInPropertiesPanel: (objectName: string) => void,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  selectedObjectFolderOrObjectsWithContext: ObjectFolderOrObjectWithContext[],
  onSelectLayer: (layerName: string) => void,
  editLayerEffects: (layer: ?gdLayer) => void,
  editLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, done: (boolean) => void) => void,
  onLayerRenamed: () => void,
  onObjectCreated: gdObject => void,
  onObjectEdited: ObjectWithContext => void,
  onObjectFolderOrObjectWithContextSelected: (
    ?ObjectFolderOrObjectWithContext
  ) => void,
  onExportAssets: () => void,
  onDeleteObjects: (
    i18n: I18nType,
    objectsWithContext: ObjectWithContext[],
    cb: (boolean) => void
  ) => void,
  onAddObjectInstance: (
    objectName: string,
    targetPosition?: 'center' | 'upperCenter'
  ) => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  onCreateObjectGroup: () => void,
  onEditObjectGroup: (?gdObjectGroup) => void,
  onDeleteObjectGroup: (
    groupWithContext: GroupWithContext,
    done: (boolean) => void
  ) => void,
  onRenameObjectGroup: (
    groupWithContext: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  getValidatedObjectOrGroupName: (
    newName: string,
    global: boolean,
    i18n: I18nType
  ) => string,
  canObjectOrGroupBeGlobal: (
    i18n: I18nType,
    objectOrGroupName: string
  ) => boolean,

  updateBehaviorsSharedData: () => void,
  onInstancesAdded: (Array<gdInitialInstance>) => void,
  onInstancesSelected: (Array<gdInitialInstance>) => void,
  onInstanceDoubleClicked: gdInitialInstance => void,
  onInstancesMoved: (Array<gdInitialInstance>) => void,
  onInstancesResized: (Array<gdInitialInstance>) => void,
  onInstancesRotated: (Array<gdInitialInstance>) => void,
  isInstanceOf3DObject: gdInitialInstance => boolean,
  onSelectAllInstancesOfObjectInLayout: string => void,

  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,

  instancesEditorSettings: InstancesEditorSettings,
  onInstancesEditorSettingsMutated: InstancesEditorSettings => void,

  historyHandler: HistoryHandler,
  unsavedChanges?: ?UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onContextMenu: (
    x: number,
    y: number,
    ignoreSelectedObjectsForContextMenu?: boolean
  ) => void,

  resourceManagementProps: ResourceManagementProps,
  isActive: boolean,
  instancesEditorShortcutsCallbacks: InstancesEditorShortcutsCallbacks,

  onOpenedEditorsChanged: () => void,
|};

export type SceneEditorsDisplayInterface = {|
  getName: () => 'mosaic' | 'swipeableDrawer',
  forceUpdateInstancesList: () => void,
  forceUpdatePropertiesEditor: () => void,
  forceUpdateObjectsList: () => void,
  forceUpdateObjectGroupsList: () => void,
  scrollObjectGroupsListToObjectGroup: (objectGroup: gdObjectGroup) => void,
  forceUpdateLayersList: () => void,
  openNewObjectDialog: () => void,
  toggleEditorView: (editorId: EditorId) => void,
  isEditorVisible: (editorId: EditorId) => boolean,
  viewControls: {|
    zoomBy: (factor: number) => void,
    setZoomFactor: (factor: number) => void,
    zoomToInitialPosition: () => void,
    zoomToFitContent: () => void,
    zoomToFitSelection: () => void,
    centerViewOnLastInstance: (
      Array<gdInitialInstance>,
      offset?: ?[number, number]
    ) => void,
    getLastCursorSceneCoordinates: () => [number, number],
    getLastContextMenuSceneCoordinates: () => [number, number],
    getViewPosition: () => ?ViewPosition,
  |},
  startSceneRendering: (start: boolean) => void,
  instancesHandlers: {|
    getContentAABB: () => Rectangle | null,
    getSelectionAABB: () => Rectangle,
    addInstances: (
      pos: [number, number],
      objectNames: Array<string>,
      layer: string
    ) => Array<gdInitialInstance>,
    clearHighlightedInstance: () => void,
    resetInstanceRenderersFor: (objectName: string) => void,
    forceRemountInstancesRenderers: () => void,
    addSerializedInstances: ({|
      position: [number, number],
      copyReferential: [number, number],
      serializedInstances: Array<Object>,
      preventSnapToGrid?: boolean,
      addInstancesInTheForeground?: boolean,
      doesObjectExistInContext: string => boolean,
    |}) => Array<gdInitialInstance>,
  |},
|};
