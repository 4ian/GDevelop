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
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import { ResponsiveWindowMeasurer } from '../UI/Responsive/ResponsiveWindowMeasurer';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { shortenString } from '../Utils/StringHelpers';
import getObjectByName from '../Utils/GetObjectByName';
import UseSceneEditorCommands from './UseSceneEditorCommands';
import { type InstancesEditorSettings } from '../InstancesEditor/InstancesEditorSettings';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
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
import { getInstancesInLayoutForObject } from '../Utils/Layout';
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
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../MainFrame/ResourcesWatcher';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type TileMapTileSelection } from '../InstancesEditor/TileSetVisualizer';
import { extractAsCustomObject } from './CustomObjectExtractor/CustomObjectExtractor';

const gd: libGDevelop = global.gd;

const BASE_LAYER_NAME = '';
const INSTANCES_CLIPBOARD_KIND = 'Instances';

export type EditorId =
  | 'objects-list'
  | 'properties'
  | 'object-groups-list'
  | 'instances-list'
  | 'layers-list';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,

  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  layersContainer: gdLayersContainer,
  initialInstances: gdInitialInstancesContainer,

  getInitialInstancesEditorSettings: () => InstancesEditorSettings,

  onOpenMoreSettings?: ?() => void,
  onOpenEvents: (sceneName: string) => void,
  onObjectEdited: (objectWithContext: ObjectWithContext) => void,
  onEventsBasedObjectChildrenEdited: () => void,

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

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
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
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  variablesEditedInstance: ?gdInitialInstance,
  newObjectInstanceSceneCoordinates: ?[number, number],
  invisibleLayerOnWhichInstancesHaveJustBeenAdded: string | null,
  extractAsExternalLayoutDialogOpen: boolean,
  extractAsCustomObjectDialogOpen: boolean,

  editedGroup: gdObjectGroup | null,
  isCreatingNewGroup: boolean,

  instancesEditorSettings: InstancesEditorSettings,
  history: HistoryState,

  layoutVariablesDialogOpen: boolean,
  showAdditionalWorkInfoBar: boolean,
  additionalWorkInfoBar: InfoBarDetails,

  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  selectedLayer: string,

  tileMapTileSelection: ?TileMapTileSelection,

  lastSelectionType: 'instance' | 'object',
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

  constructor(props: Props) {
    super(props);

    this.instancesSelection = new InstancesSelection();
    this.state = {
      setupGridOpen: false,
      scenePropertiesDialogOpen: false,
      layersListOpen: false,
      onCloseLayerRemoveDialog: null,
      layerRemoved: null,
      editedLayer: null,
      editedLayerInitialTab: 'properties',
      isAssetExporterDialogOpen: false,
      editedObjectWithContext: null,
      editedObjectInitialTab: 'properties',
      variablesEditedInstance: null,
      newObjectInstanceSceneCoordinates: null,
      editedGroup: null,
      isCreatingNewGroup: false,
      extractAsExternalLayoutDialogOpen: false,
      extractAsCustomObjectDialogOpen: false,

      instancesEditorSettings: props.getInitialInstancesEditorSettings(),
      history: getHistoryInitialState(props.initialInstances, {
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
      selectedLayer: BASE_LAYER_NAME,
      invisibleLayerOnWhichInstancesHaveJustBeenAdded: null,

      lastSelectionType: 'instance',
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.history !== prevState.history)
      if (this.props.unsavedChanges)
        this.props.unsavedChanges.triggerUnsavedChanges();
  }

  componentDidMount() {
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }
  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  getInstancesEditorSettings() {
    return this.state.instancesEditorSettings;
  }

  onResourceExternallyChanged = async (resourceInfo: {|
    identifier: string,
  |}) => {
    const { project } = this.props;

    const resourceName = project
      .getResourcesManager()
      .getResourceNameWithFile(resourceInfo.identifier);
    if (resourceName) {
      const { editorDisplay } = this;
      if (!editorDisplay) return;
      try {
        // When reloading textures, there can be a short time during which
        // the existing texture is removed but the InstancesEditor tries to use it
        // through the RenderedInstance's, triggering crashes. So the scene rendering
        // is paused during this period.
        editorDisplay.startSceneRendering(false);
        await PixiResourcesLoader.reloadResource(project, resourceName);

        editorDisplay.forceUpdateObjectsList();

        const objectsCollector = new gd.ObjectsUsingResourceCollector(
          project.getResourcesManager(),
          resourceName
        );
        // $FlowIgnore - Flow does not know ObjectsUsingResourceCollector inherits from ArbitraryObjectsWorker
        gd.ProjectBrowserHelper.exposeProjectObjects(project, objectsCollector);
        const objectNames = objectsCollector.getObjectNames().toJSArray();
        objectsCollector.delete();
        ObjectsRenderingService.renderersCacheClearingMethods.forEach(clear =>
          clear(project)
        );
        objectNames.forEach(objectName => {
          editorDisplay.instancesHandlers.resetInstanceRenderersFor(objectName);
        });
      } finally {
        editorDisplay.startSceneRendering(true);
      }
    }
  };

  updateToolbar = () => {
    const { editorDisplay } = this;
    if (!editorDisplay) return;

    if (editorDisplay.getName() === 'mosaic') {
      this.props.setToolbar(
        <MosaicEditorsDisplayToolbar
          selectedInstancesCount={
            this.instancesSelection.getSelectedInstances().length
          }
          toggleObjectsList={this.toggleObjectsList}
          isObjectsListShown={editorDisplay.isEditorVisible('objects-list')}
          toggleObjectGroupsList={this.toggleObjectGroupsList}
          isObjectGroupsListShown={editorDisplay.isEditorVisible(
            'object-groups-list'
          )}
          toggleProperties={this.toggleProperties}
          isPropertiesShown={editorDisplay.isEditorVisible('properties')}
          deleteSelection={this.deleteSelection}
          toggleInstancesList={this.toggleInstancesList}
          isInstancesListShown={editorDisplay.isEditorVisible('instances-list')}
          toggleLayersList={this.toggleLayersList}
          isLayersListShown={editorDisplay.isEditorVisible('layers-list')}
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
          onOpenSettings={this.openSceneProperties}
          settingsIcon={editSceneIconReactNode}
          onOpenSceneVariables={this.editLayoutVariables}
        />
      );
    } else {
      this.props.setToolbar(
        <SwipeableDrawerEditorsDisplayToolbar
          selectedInstancesCount={
            this.instancesSelection.getSelectedInstances().length
          }
          toggleObjectsList={this.toggleObjectsList}
          toggleObjectGroupsList={this.toggleObjectGroupsList}
          toggleProperties={this.toggleProperties}
          deleteSelection={this.deleteSelection}
          toggleInstancesList={this.toggleInstancesList}
          toggleLayersList={this.toggleLayersList}
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
          onOpenSettings={this.openSceneProperties}
          settingsIcon={editSceneIconReactNode}
          onOpenSceneVariables={this.editLayoutVariables}
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
    this.setState(
      {
        instancesEditorSettings: {
          ...this.state.instancesEditorSettings,
          windowMask: !this.state.instancesEditorSettings.windowMask,
        },
      },
      () => this.updateToolbar()
    );
  };

  toggleGrid = () => {
    this.setState(
      {
        instancesEditorSettings: {
          ...this.state.instancesEditorSettings,
          grid: !this.state.instancesEditorSettings.grid,
          snap: !this.state.instancesEditorSettings.grid,
        },
      },
      () => this.updateToolbar()
    );
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
    this.editObjectByName(selectedInstanceObjectName);
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

  editLayoutVariables = (open: boolean = true) => {
    this.setState({ layoutVariablesDialogOpen: open });
  };

  editObject = (editedObject: ?gdObject, initialTab: ?ObjectEditorTab) => {
    const { project } = this.props;
    if (editedObject) {
      this.setState({
        editedObjectWithContext: {
          object: editedObject,
          global: project.getObjects().hasObjectNamed(editedObject.getName()),
        },
        editedObjectInitialTab: initialTab || 'properties',
      });
    } else {
      this.setState({
        editedObjectWithContext: null,
        editedObjectInitialTab: 'properties',
      });
    }
  };

  openObjectExporterDialog = (open: boolean = true) => {
    this.setState({
      isAssetExporterDialogOpen: open,
    });
  };

  editObjectByName = (objectName: string, initialTab?: ObjectEditorTab) => {
    const { globalObjectsContainer, objectsContainer } = this.props;
    if (objectsContainer.hasObjectNamed(objectName))
      this.editObject(objectsContainer.getObject(objectName), initialTab);
    else if (
      globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName)
    )
      this.editObject(globalObjectsContainer.getObject(objectName), initialTab);
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
      lastSelectionType: 'object',
    });
  };

  _editObjectGroup = (group: ?gdObjectGroup) => {
    this.setState({ editedGroup: group, isCreatingNewGroup: false });
  };

  _createObjectGroup = () => {
    this.setState({ editedGroup: null, isCreatingNewGroup: true });
  };

  _closeObjectGroupEditorDialog = () => {
    this.setState({ editedGroup: null, isCreatingNewGroup: false });
  };

  setInstancesEditorSettings = (
    instancesEditorSettings: InstancesEditorSettings
  ) => {
    this.setState({
      instancesEditorSettings,
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
  _onInstancesEditorSettingsMutated = debounce(
    (instancesEditorSettings: InstancesEditorSettings) => {
      this.setInstancesEditorSettings(instancesEditorSettings);
    },
    1000,
    { leading: false, trailing: true }
  );

  undo = () => {
    // TODO: Do not clear selection so that the user can actually see
    // the changes it is undoing (variable change, instance moved, etc.)
    // or find a way to display a sumup of the change such as "Variable XXX
    // in instance of Enemy changed to YYY"
    this.instancesSelection.clearSelection();
    this.setState(
      {
        history: undo(this.state.history, this.props.initialInstances),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        if (this.editorDisplay)
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
        this.updateToolbar();
      }
    );
  };

  redo = () => {
    this.instancesSelection.clearSelection();
    this.setState(
      {
        history: redo(this.state.history, this.props.initialInstances),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        if (this.editorDisplay)
          this.editorDisplay.instancesHandlers.forceRemountInstancesRenderers();
        this.updateToolbar();
      }
    );
  };

  _onObjectFolderOrObjectWithContextSelected = (
    objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext = null
  ) => {
    const selectedObjectFolderOrObjectsWithContext = [];
    if (objectFolderOrObjectWithContext) {
      selectedObjectFolderOrObjectsWithContext.push(
        objectFolderOrObjectWithContext
      );
    }

    this.setState(
      {
        lastSelectionType: 'object',
        selectedObjectFolderOrObjectsWithContext,
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
      this.state.selectedLayer
    );
    this._onInstancesAdded(instances);
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
          'ADD'
        ),
      },
      () => this.updateToolbar()
    );
  };

  onInstanceAddedOnInvisibleLayer = (layer: ?string) => {
    this.setState({ invisibleLayerOnWhichInstancesHaveJustBeenAdded: layer });
  };

  _onInstancesSelected = (instances: Array<gdInitialInstance>) => {
    if (instances.length === 0) {
      this.setState(
        {
          lastSelectionType: 'instance',
          selectedObjectFolderOrObjectsWithContext: [],
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
        },
        this.updateToolbar
      );
    }
  };

  _onInstanceDoubleClicked = (instance: gdInitialInstance) => {
    this.editObjectByName(instance.getObjectName());
  };

  _onInstancesMoved = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT'
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
  };

  _onInstancesResized = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT'
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
  };

  _onInstancesRotated = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'EDIT'
        ),
      },
      () => this.forceUpdatePropertiesEditor()
    );
  };

  _onInstancesModified = (instances: Array<gdInitialInstance>) => {
    this.forceUpdate();
    //TODO: Save for redo with debounce (and cancel on unmount)
  };

  onSelectTileMapTile = (tileMapTileSelection: ?TileMapTileSelection) => {
    this.setState({ tileMapTileSelection });
  };

  _onSelectInstances = (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean,
    targetPosition?: 'center' | 'upperCenter'
  ) => {
    this.instancesSelection.selectInstances({
      instances,
      multiSelect,
      layersLocks: null,
      ignoreSeal: true,
    });
    if (this.editorDisplay) {
      let offset = null;
      const { viewControls } = this.editorDisplay;
      const viewPosition = viewControls.getViewPosition();
      if (viewPosition && targetPosition === 'upperCenter') {
        offset = [0, viewPosition.toSceneScale(viewPosition.getHeight() / 4)];
      }

      viewControls.centerViewOnLastInstance(instances, offset);
    }
    this.setState({ lastSelectionType: 'instance' });
    this.updateToolbar();
  };

  /**
   * Create an instance of the given object, at the position
   * previously chosen (see `newObjectInstanceSceneCoordinates`).
   */
  _addInstanceForNewObject = (newObjectName: string) => {
    const { newObjectInstanceSceneCoordinates } = this.state;
    if (!newObjectInstanceSceneCoordinates) {
      return;
    }

    this._addInstance(newObjectInstanceSceneCoordinates, newObjectName);
    this.setState({ newObjectInstanceSceneCoordinates: null });
  };

  _onObjectCreated = (object: gdObject) => {
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
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();

    this._addInstanceForNewObject(object.getName());
  };

  _onRemoveLayer = (layerName: string, done: boolean => void) => {
    const getNewState = (doRemove: boolean) => {
      const newState: {| layerRemoved: null, selectedLayer?: string |} = {
        layerRemoved: null,
      };
      if (doRemove && layerName === this.state.selectedLayer) {
        newState.selectedLayer = BASE_LAYER_NAME;
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

  _onDeleteObjects = (
    i18n: I18nType,
    objectsWithContext: ObjectWithContext[],
    done: boolean => void
  ) => {
    const { project, layout, eventsBasedObject } = this.props;

    objectsWithContext.forEach(objectWithContext => {
      const { object, global } = objectWithContext;

      // Unselect instances of the deleted object because these instances
      // will be deleted by gd.WholeProjectRefactorer (and after that, they will
      // be invalid references, as pointing to deleted objects).
      this.instancesSelection.unselectInstancesOfObject(object.getName());

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

    done(true);

    // We modified the selection, so force an update of editors dealing with it.
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _getValidatedObjectOrGroupName = (
    newName: string,
    global: boolean,
    i18n: I18nType
  ) => {
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
      extremeZOrderByLayerName[layerName] =
        where === 'back'
          ? highestZOrderFinder.getLowestZOrder()
          : highestZOrderFinder.getHighestZOrder();
    });
    highestZOrderFinder.delete();

    selectedInstances.forEach(instance => {
      if (!instance.isLocked()) {
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
    done(true);
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
    selectedInstances.forEach(instance => {
      if (instance.isLocked()) return;
      this.props.initialInstances.removeInstance(instance);
    });

    this.instancesSelection.clearSelection();
    if (this.editorDisplay)
      this.editorDisplay.instancesHandlers.clearHighlightedInstance();

    this.setState(
      {
        selectedObjectFolderOrObjectsWithContext: [],
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'DELETE'
        ),
      },
      () => {
        this.updateToolbar();
        this.forceUpdatePropertiesEditor();
      }
    );
  };

  zoomToInitialPosition = () => {
    if (this.editorDisplay)
      this.editorDisplay.viewControls.zoomToInitialPosition();
  };

  zoomToFitContent = () => {
    if (this.editorDisplay) this.editorDisplay.viewControls.zoomToFitContent();
  };

  zoomToFitSelection = () => {
    if (this.editorDisplay)
      this.editorDisplay.viewControls.zoomToFitSelection();
  };

  getContextMenuZoomItems = (i18n: I18nType) => {
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

  getContextMenuLayoutItems = (i18n: I18nType) => {
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

  getContextMenuInstancesWiseItems = (i18n: I18nType) => {
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
    if (this.editorDisplay)
      this.editorDisplay.viewControls.setZoomFactor(zoomFactor);
  };

  zoomIn = () => {
    if (this.editorDisplay)
      this.editorDisplay.viewControls.zoomBy(zoomInFactor);
  };

  zoomOut = () => {
    if (this.editorDisplay)
      this.editorDisplay.viewControls.zoomBy(zoomOutFactor);
  };

  _onContextMenu = (
    x: number,
    y: number,
    ignoreSelectedObjectsForContextMenu?: boolean = false
  ) => {
    if (this.contextMenu)
      this.contextMenu.open(x, y, {
        ignoreSelectedObjectsForContextMenu: !!ignoreSelectedObjectsForContextMenu,
      });
  };

  isInstanceOf3DObject = (instance: gdInitialInstance) => {
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

  buildContextMenu = (i18n: I18nType, options: any) => {
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

      return [
        ...this.getContextMenuInstancesWiseItems(i18n),
        { type: 'separator' },
        {
          label: i18n._(t`Edit object ${shortenString(objectName, 14)}`),
          click: () => this.editObjectByName(objectName, 'properties'),
        },
        {
          label: i18n._(t`Edit object variables`),
          click: () => this.editObjectByName(objectName, 'variables'),
        },
        {
          label: i18n._(t`Edit behaviors`),
          click: () => this.editObjectByName(objectName, 'behaviors'),
        },
        objectMetadata
          ? {
              label: i18n._(t`Edit effects`),
              click: () => this.editObjectByName(objectName, 'effects'),
              enabled: objectMetadata.hasDefaultBehavior(
                'EffectCapability::EffectBehavior'
              ),
            }
          : null,
        object && project.hasEventsBasedObject(object.getType())
          ? {
              label: i18n._(t`Edit children`),
              click: () =>
                this.props.onOpenEventBasedObjectEditor(
                  gd.PlatformExtension.getExtensionFromFullObjectType(
                    object.getType()
                  ),
                  gd.PlatformExtension.getObjectNameFromFullObjectType(
                    object.getType()
                  )
                ),
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
    const { editorDisplay } = this;
    if (!editorDisplay) return;
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const newInstances = editorDisplay.instancesHandlers.addSerializedInstances(
      {
        position: [0, 0],
        copyReferential: [-2 * MOVEMENT_BIG_DELTA, -2 * MOVEMENT_BIG_DELTA],
        serializedInstances: serializedSelection,
        preventSnapToGrid: true,
        doesObjectExistInContext:
          // Instance duplication can only be done in the same scene, so no need to check
          () => true,
      }
    );
    this._onInstancesAdded(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });
    this.forceUpdatePropertiesEditor();
  };

  paste = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    const { editorDisplay } = this;
    if (!editorDisplay) return;

    const position = useLastCursorPosition
      ? editorDisplay.viewControls.getLastCursorSceneCoordinates()
      : editorDisplay.viewControls.getLastContextMenuSceneCoordinates();

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
    const viewPosition = editorDisplay.viewControls.getViewPosition();
    if (!viewPosition) return;

    const newInstances = editorDisplay.instancesHandlers.addSerializedInstances(
      {
        position: viewPosition.containsPoint(position[0], position[1])
          ? position
          : [viewPosition.getViewX(), viewPosition.getViewY()],
        copyReferential: [x, y],
        serializedInstances: instancesContent,
        addInstancesInTheForeground: pasteInTheForeground,
        doesObjectExistInContext: objectName =>
          this.props.projectScopedContainersAccessor
            .get()
            .getObjectsContainersList()
            .hasObjectNamed(objectName),
      }
    );

    this._onInstancesAdded(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });
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
      unserializeFromJSObject(instance, serializedInstance);
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

  extractAsCustomObject = (
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
    if (!onExtractAsEventBasedObject || !editorDisplay) return;

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
      selectionAABB: editorDisplay.instancesHandlers.getSelectionAABB(),
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
    this.instancesSelection.selectInstances({
      instances: instancesToSelect,
      ignoreSeal: true,
      multiSelect: false,
      layersLocks: null,
    });
    this.forceUpdateInstancesList();
    this._onInstancesSelected(instancesToSelect);
  };

  updateBehaviorsSharedData = () => {
    const { layout, project } = this.props;
    if (layout) {
      layout.updateBehaviorsSharedData(project);
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
    if (!this.props.layersContainer.hasLayerNamed(this.state.selectedLayer)) {
      this.setState({ selectedLayer: BASE_LAYER_NAME });
    }
    if (this.editorDisplay) this.editorDisplay.forceUpdateLayersList();
  };

  forceUpdateInstancesList = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdateInstancesList();
  };

  forceUpdatePropertiesEditor = () => {
    if (this.editorDisplay) this.editorDisplay.forceUpdatePropertiesEditor();
  };

  forceUpdateCustomObjectRenderedInstances = () => {
    const { project, projectScopedContainersAccessor } = this.props;

    const resourcesInUse = new gd.ResourcesInUseHelper(
      project.getResourcesManager()
    );
    projectScopedContainersAccessor.forEachObject(object => {
      if (project.hasEventsBasedObject(object.getType())) {
        object.getConfiguration().exposeResources(resourcesInUse);
      }
    });
    const objectResourceNames = resourcesInUse
      .getAllImages()
      .toNewVectorString()
      .toJSArray();
    resourcesInUse.delete();

    PixiResourcesLoader.loadTextures(project, objectResourceNames).then(() => {
      // This callback is executed even if there is no image to load.
      const { editorDisplay } = this;
      if (editorDisplay) {
        projectScopedContainersAccessor.forEachObject(object => {
          editorDisplay.instancesHandlers.resetInstanceRenderersFor(
            object.getName()
          );
        });
      }
      this.forceUpdateObjectsList();
    });
  };

  forceUpdateRenderedInstancesOfObject = (object: gdObject) => {
    const { project } = this.props;

    const resourcesInUse = new gd.ResourcesInUseHelper(
      project.getResourcesManager()
    );
    object.getConfiguration().exposeResources(resourcesInUse);
    const objectResourceNames = resourcesInUse
      .getAllImages()
      .toNewVectorString()
      .toJSArray();
    resourcesInUse.delete();

    PixiResourcesLoader.loadTextures(project, objectResourceNames).then(() => {
      // This callback is executed even if there is no image to load.
      // Images need to be loaded first because instance renderers use the
      // image dimensions to evaluate theirs. It may cause flickering otherwise.
      if (this.editorDisplay) {
        this.editorDisplay.instancesHandlers.resetInstanceRenderersFor(
          object.getName()
        );
      }
      this.forceUpdateObjectsList();
    });
  };

  _onObjectEdited = (objectWithContext: ObjectWithContext) => {
    const { project, layout } = this.props;
    // It triggers forceUpdateRenderedInstancesOfObject on this editor too.
    this.props.onObjectEdited(objectWithContext);
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
  };

  render() {
    const {
      project,
      projectScopedContainersAccessor,
      layout,
      eventsFunctionsExtension,
      eventsBasedObject,
      initialInstances,
      resourceManagementProps,
      isActive,
    } = this.props;
    const {
      editedObjectWithContext,
      selectedObjectFolderOrObjectsWithContext,
    } = this.state;
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

    return (
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
                project={project}
                layout={layout}
                eventsFunctionsExtension={eventsFunctionsExtension}
                eventsBasedObject={eventsBasedObject}
                layersContainer={this.props.layersContainer}
                globalObjectsContainer={this.props.globalObjectsContainer}
                objectsContainer={this.props.objectsContainer}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                initialInstances={initialInstances}
                instancesSelection={this.instancesSelection}
                onSelectInstances={this._onSelectInstances}
                onAddObjectInstance={this.addInstanceOnTheScene}
                selectedLayer={this.state.selectedLayer}
                editLayer={this.editLayer}
                editLayerEffects={this.editLayerEffects}
                editInstanceVariables={this.editInstanceVariables}
                editObjectByName={this.editObjectByName}
                editObjectInPropertiesPanel={this.editObjectInPropertiesPanel}
                selectedObjectFolderOrObjectsWithContext={
                  selectedObjectFolderOrObjectsWithContext
                }
                onLayerRenamed={this._onLayerRenamed}
                onRemoveLayer={this._onRemoveLayer}
                onSelectLayer={(layer: string) =>
                  this.setState({ selectedLayer: layer })
                }
                tileMapTileSelection={this.state.tileMapTileSelection}
                onSelectTileMapTile={this.onSelectTileMapTile}
                onExportAssets={this.openObjectExporterDialog}
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
                onRenameObjectFolderOrObjectWithContextFinish={
                  this._onRenameObjectFolderOrObjectWithContextFinish
                }
                onObjectCreated={this._onObjectCreated}
                onObjectEdited={this._onObjectEdited}
                onObjectFolderOrObjectWithContextSelected={
                  this._onObjectFolderOrObjectWithContextSelected
                }
                historyHandler={{
                  undo: this.undo,
                  redo: this.redo,
                  canUndo: () => canUndo(this.state.history),
                  canRedo: () => canRedo(this.state.history),
                  saveToHistory: () =>
                    this.setState({
                      history: saveToHistory(
                        this.state.history,
                        this.props.initialInstances
                      ),
                    }),
                }}
                instancesEditorShortcutsCallbacks={{
                  onCopy: () =>
                    this.copySelection({ useLastCursorPosition: true }),
                  onCut: () =>
                    this.cutSelection({ useLastCursorPosition: true }),
                  onPaste: () => this.paste({ useLastCursorPosition: true }),
                  onDuplicate: () =>
                    this.duplicateSelection({ useLastCursorPosition: true }),
                  onDelete: this.deleteSelection,
                  onUndo: this.undo,
                  onRedo: this.redo,
                  onZoomOut: this.zoomOut,
                  onZoomIn: this.zoomIn,
                  onShift1: this.zoomToFitSelection,
                  onShift2: this.zoomToInitialPosition,
                  onShift3: this.zoomToFitContent,
                }}
                onInstancesAdded={this._onInstancesAdded}
                onInstancesSelected={this._onInstancesSelected}
                onInstanceDoubleClicked={this._onInstanceDoubleClicked}
                onInstancesMoved={this._onInstancesMoved}
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
              />
              <I18n>
                {({ i18n }) => (
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
                            // Object changes are reverted but not the
                            // resources modified with an external editor.
                            this.props.onObjectEdited(editedObjectWithContext);
                          }
                          this.editObject(null);
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
                        onApply={() => {
                          if (editedObjectWithContext) {
                            this._onObjectEdited(editedObjectWithContext);
                          }
                          this.editObject(null);
                        }}
                        hotReloadPreviewButtonProps={
                          this.props.hotReloadPreviewButtonProps
                        }
                        onUpdateBehaviorsSharedData={() =>
                          this.updateBehaviorsSharedData()
                        }
                        openBehaviorEvents={this.props.openBehaviorEvents}
                      />
                    )}
                  </React.Fragment>
                )}
              </I18n>
              {this.state.isAssetExporterDialogOpen && layout && (
                <ObjectExporterDialog
                  project={project}
                  layout={layout}
                  onClose={() => this.openObjectExporterDialog(false)}
                />
              )}
              {(this.state.editedGroup || this.state.isCreatingNewGroup) && (
                <ObjectGroupEditorDialog
                  project={project}
                  projectScopedContainersAccessor={
                    projectScopedContainersAccessor
                  }
                  group={this.state.editedGroup}
                  objectsContainer={this.props.objectsContainer}
                  globalObjectsContainer={this.props.globalObjectsContainer}
                  onCancel={this._closeObjectGroupEditorDialog}
                  onApply={this._closeObjectGroupEditorDialog}
                  onObjectGroupAdded={(objectGroup: gdObjectGroup) => {
                    if (this.editorDisplay) {
                      this.editorDisplay.scrollObjectGroupsListToObjectGroup(
                        objectGroup
                      );
                    }
                  }}
                  initialTab={'objects'}
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
                />
              )}
              {this.state.setupGridOpen && (
                <SetupGridDialog
                  instancesEditorSettings={this.state.instancesEditorSettings}
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
                    globalObjectsContainer={this.props.globalObjectsContainer}
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
                  resourceManagementProps={this.props.resourceManagementProps}
                  layout={layout}
                  eventsFunctionsExtension={eventsFunctionsExtension}
                  eventsBasedObject={eventsBasedObject}
                  layer={this.state.editedLayer}
                  initialInstances={initialInstances}
                  initialTab={this.state.editedLayerInitialTab}
                  onClose={() =>
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
                  onEditVariables={() => this.editLayoutVariables(true)}
                  onOpenMoreSettings={this.props.onOpenMoreSettings}
                  resourceManagementProps={this.props.resourceManagementProps}
                />
              )}
              {this.state.scenePropertiesDialogOpen && eventsBasedObject && (
                <EventsBasedObjectScenePropertiesDialog
                  project={project}
                  eventsBasedObject={eventsBasedObject}
                  onClose={() => this.openSceneProperties(false)}
                  onApply={() => this.openSceneProperties(false)}
                  getContentAABB={
                    this.editorDisplay
                      ? this.editorDisplay.instancesHandlers.getContentAABB
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
                  onApply={() => this.editLayoutVariables(false)}
                  onCancel={() => this.editLayoutVariables(false)}
                  hotReloadPreviewButtonProps={
                    this.props.hotReloadPreviewButtonProps
                  }
                />
              )}
              <I18n>
                {({ i18n }) => (
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
                )}
              </I18n>
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
    );
  }
}
