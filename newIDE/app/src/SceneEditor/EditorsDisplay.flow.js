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

export type SceneEditorsDisplayProps = {|
  project: gdProject,
  layout: gdLayout,
  initialInstances: gdInitialInstancesContainer,
  instancesSelection: InstancesSelection,
  selectedLayer: string,
  onSelectInstances: (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean,
    targetPosition?: 'center' | 'upperCenter'
  ) => void,
  editInstanceVariables: (instance: ?gdInitialInstance) => void,
  editObjectByName: (objectName: string, initialTab?: ObjectEditorTab) => void,
  onEditObject: gdObject => void,
  selectedObjectNames: string[],
  onSelectLayer: (layerName: string) => void,
  editLayerEffects: (layer: ?gdLayer) => void,
  editLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, done: (boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    done: (boolean) => void
  ) => void,
  onObjectCreated: gdObject => void,
  onObjectSelected: (?ObjectWithContext) => void,
  onExportObject: (object: ?gdObject) => void,
  onDeleteObject: (
    i18n: I18nType,
    objectWithContext: ObjectWithContext,
    cb: (boolean) => void
  ) => void,
  onAddObjectInstance: (
    objectName: string,
    targetPosition?: 'center' | 'upperCenter'
  ) => void,
  onRenameObjectFinish: (
    objectWithContext: ObjectWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
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

  canInstallPrivateAsset: () => boolean,

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
  forceUpdateInstancesPropertiesEditor: () => void,
  forceUpdateObjectsList: () => void,
  forceUpdateObjectGroupsList: () => void,
  forceUpdateLayersList: () => void,
  openNewObjectDialog: () => void,
  toggleEditorView: (editorId: EditorId) => void,
  isEditorVisible: (editorId: EditorId) => boolean,
  renameObjectWithContext: (ObjectWithContext) => void,
  viewControls: {|
    zoomBy: (factor: number) => void,
    setZoomFactor: (factor: number) => void,
    zoomToInitialPosition: () => void,
    zoomToFitContent: () => void,
    zoomToFitSelection: (Array<gdInitialInstance>) => void,
    centerViewOnLastInstance: (
      Array<gdInitialInstance>,
      offset?: ?[number, number]
    ) => void,
    getLastCursorSceneCoordinates: () => [number, number],
    getLastContextMenuSceneCoordinates: () => [number, number],
    getViewPosition: () => ?ViewPosition,
  |},
  instancesHandlers: {|
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
    |}) => Array<gdInitialInstance>,
  |},
|};
