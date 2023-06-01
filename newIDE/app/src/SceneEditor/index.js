// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import uniq from 'lodash/uniq';
import ObjectsList, { type ObjectsListInterface } from '../ObjectsList';
import ObjectGroupsList from '../ObjectGroupsList';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import InstancesEditor from '../InstancesEditor';
import InstancePropertiesEditor, {
  type InstancePropertiesEditorInterface,
} from '../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../InstancesEditor/InstancesList';
import LayersList, { type LayersListInterface } from '../LayersList';
import LayerRemoveDialog from '../LayersList/LayerRemoveDialog';
import LayerEditorDialog from '../LayersList/LayerEditorDialog';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import ObjectExporterDialog from '../ObjectEditor/ObjectExporterDialog';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import Toolbar from './Toolbar';
import { serializeToJSObject } from '../Utils/Serializer';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import FullSizeInstancesEditorWithScrollbars from '../InstancesEditor/FullSizeInstancesEditorWithScrollbars';
import EditorMosaic from '../UI/EditorMosaic';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { showWarningBox } from '../UI/Messages/MessageBox';
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
  enumerateObjects,
} from '../ObjectsList/EnumerateObjects';
import TagsButton from '../UI/EditorMosaic/TagsButton';
import CloseButton from '../UI/EditorMosaic/CloseButton';
import InfoBar from '../UI/Messages/InfoBar';
import {
  type SelectedTags,
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../Utils/TagsHelper';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import SceneVariablesDialog from './SceneVariablesDialog';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { onObjectAdded, onInstanceAdded } from '../Hints/ObjectsAdditionalWork';
import { type InfoBarDetails } from '../Hints/ObjectsAdditionalWork';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { MOVEMENT_BIG_DELTA } from '../UI/KeyboardShortcuts';
import { getInstancesInLayoutForObject } from '../Utils/Layout';
import { zoomInFactor, zoomOutFactor } from '../Utils/ZoomUtils';
import debounce from 'lodash/debounce';
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

const BASE_LAYER_NAME = '';
const INSTANCES_CLIPBOARD_KIND = 'Instances';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

const initialMosaicEditorNodes = {
  direction: 'row',
  first: 'properties',
  splitPercentage: 23,
  second: {
    direction: 'row',
    first: 'instances-editor',
    second: 'objects-list',
    splitPercentage: 77,
  },
};

const getInitialMosaicEditorNodesSmallWindow = () => ({
  direction: Window.getOrientation() === 'portrait' ? 'column' : 'row',
  first: 'instances-editor',
  second: 'objects-list',
  splitPercentage: 70,
});

type Props = {|
  initialInstances: gdInitialInstancesContainer,
  getInitialInstancesEditorSettings: () => InstancesEditorSettings,
  layout: gdLayout,
  onEditObject?: ?(object: gdObject) => void,
  onOpenMoreSettings?: ?() => void,
  onOpenEvents: (sceneName: string) => void,
  project: gdProject,
  setToolbar: (?React.Node) => void,
  resourceManagementProps: ResourceManagementProps,
  isActive: boolean,
  unsavedChanges?: ?UnsavedChanges,
  canInstallPrivateAsset: () => boolean,
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,

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
  exportedObject: ?gdObject,
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  variablesEditedInstance: ?gdInitialInstance,
  newObjectInstanceSceneCoordinates: ?[number, number],
  invisibleLayerOnWhichInstancesHaveJustBeenAdded: string | null,

  editedGroup: ?gdObjectGroup,

  instancesEditorSettings: Object,
  history: HistoryState,

  layoutVariablesDialogOpen: boolean,
  showAdditionalWorkInfoBar: boolean,
  additionalWorkInfoBar: InfoBarDetails,

  // State for tags of objects:
  selectedObjectTags: SelectedTags,

  renamedObjectWithContext: ?ObjectWithContext,
  selectedObjectsWithContext: Array<ObjectWithContext>,
  selectedLayer: string,
|};

type CopyCutPasteOptions = {|
  useLastCursorPosition?: boolean,
  pasteInTheForeground?: boolean,
|};

export default class SceneEditor extends React.Component<Props, State> {
  static defaultProps = {
    setToolbar: () => {},
  };

  instancesSelection: InstancesSelection;
  editor: ?InstancesEditor;
  contextMenu: ?ContextMenuInterface;
  editorMosaic: ?EditorMosaic;
  _objectGroupsList: ?ObjectGroupsList;
  _objectsList: ?ObjectsListInterface;
  _layersList: ?LayersListInterface;
  _propertiesEditor: ?InstancePropertiesEditorInterface;
  _instancesList: ?InstancesList;

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
      exportedObject: null,
      editedObjectWithContext: null,
      editedObjectInitialTab: 'properties',
      variablesEditedInstance: null,
      newObjectInstanceSceneCoordinates: null,
      editedGroup: null,

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

      selectedObjectTags: [],

      renamedObjectWithContext: null,
      selectedObjectsWithContext: [],
      selectedLayer: BASE_LAYER_NAME,
      invisibleLayerOnWhichInstancesHaveJustBeenAdded: null,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.history !== prevState.history)
      if (this.props.unsavedChanges)
        this.props.unsavedChanges.triggerUnsavedChanges();
  }

  getInstancesEditorSettings() {
    return this.state.instancesEditorSettings;
  }

  updateToolbar = () => {
    const openedEditorNames = this.editorMosaic
      ? this.editorMosaic.getOpenedEditorNames()
      : [];
    this.props.setToolbar(
      <Toolbar
        instancesSelection={this.instancesSelection}
        toggleObjectsList={this.toggleObjectsList}
        isObjectsListShown={openedEditorNames.includes('objects-list')}
        toggleObjectGroupsList={this.toggleObjectGroupsList}
        isObjectGroupsListShown={openedEditorNames.includes(
          'object-groups-list'
        )}
        toggleProperties={this.toggleProperties}
        isPropertiesShown={openedEditorNames.includes('properties')}
        deleteSelection={this.deleteSelection}
        toggleInstancesList={this.toggleInstancesList}
        isInstancesListShown={openedEditorNames.includes('instances-list')}
        toggleLayersList={this.toggleLayersList}
        isLayersListShown={openedEditorNames.includes('layers-list')}
        toggleWindowMask={this.toggleWindowMask}
        isWindowMaskShown={() =>
          !!this.state.instancesEditorSettings.windowMask
        }
        toggleGrid={this.toggleGrid}
        isGridShown={() => !!this.state.instancesEditorSettings.grid}
        openSetupGrid={this.openSetupGrid}
        setZoomFactor={this.setZoomFactor}
        getContextMenuZoomItems={this.getContextMenuZoomItems}
        canUndo={canUndo(this.state.history)}
        canRedo={canRedo(this.state.history)}
        undo={this.undo}
        redo={this.redo}
        onOpenSettings={this.openSceneProperties}
        settingsIcon={<EditSceneIcon />}
        canRenameObject={this.state.selectedObjectsWithContext.length === 1}
        onRenameObject={this._startRenamingSelectedObject}
      />
    );
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
  }

  toggleObjectsList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('objects-list', 'end', 75, 'column');
  };

  toggleProperties = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('properties', 'start', 25, 'column');
  };

  toggleObjectGroupsList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('object-groups-list', 'end', 75, 'column');
  };

  toggleInstancesList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('instances-list', 'end', 75, 'row');
  };

  toggleLayersList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('layers-list', 'end', 75, 'row');
  };

  toggleWindowMask = () => {
    this.setState({
      instancesEditorSettings: {
        ...this.state.instancesEditorSettings,
        windowMask: !this.state.instancesEditorSettings.windowMask,
      },
    });
  };

  toggleGrid = () => {
    this.setState({
      instancesEditorSettings: {
        ...this.state.instancesEditorSettings,
        grid: !this.state.instancesEditorSettings.grid,
        snap: !this.state.instancesEditorSettings.grid,
      },
    });
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
          global: project.hasObjectNamed(editedObject.getName()),
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

  openObjectExporterDialog = (object: ?gdObject) => {
    if (object) {
      this.setState({
        exportedObject: object,
      });
    } else {
      this.setState({
        exportedObject: null,
      });
    }
  };

  editObjectByName = (objectName: string, initialTab?: ObjectEditorTab) => {
    const { project, layout } = this.props;
    if (layout.hasObjectNamed(objectName))
      this.editObject(layout.getObject(objectName), initialTab);
    else if (project.hasObjectNamed(objectName))
      this.editObject(project.getObject(objectName), initialTab);
  };

  editGroup = (group: ?gdObjectGroup) => {
    this.setState({ editedGroup: group });
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
        if (this.editor) this.editor.forceRemount();
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
        if (this.editor) this.editor.forceRemount();
        this.updateToolbar();
      }
    );
  };

  _onObjectSelected = (objectWithContext: ?ObjectWithContext = null) => {
    const selectedObjectsWithContext = [];
    if (objectWithContext) {
      selectedObjectsWithContext.push(objectWithContext);
    }

    this.setState(
      {
        selectedObjectsWithContext,
      },
      () => {
        // We update the toolbar because we need to update the objects selected
        // (for the rename shortcut)
        this.updateToolbar();
      }
    );
  };

  _createNewObjectAndInstanceUnderCursor = () => {
    if (!this.editor) {
      return;
    }

    // Remember where to create the instance, when the object will be created
    this.setState({
      newObjectInstanceSceneCoordinates: this.editor.getLastCursorSceneCoordinates(),
    });

    if (this._objectsList) this._objectsList.openNewObjectDialog();
    else this.toggleObjectsList();
  };

  addInstanceAtTheCenter = (objectName: string) => {
    const { editor } = this;
    if (editor)
      this._addInstance(
        [editor.grid.viewPosition.viewX, editor.grid.viewPosition.viewY],
        objectName
      );
  };

  _addInstance = (pos: [number, number], objectName: string) => {
    if (!objectName || !this.editor) return;

    const instances = this.editor.addInstances(
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
        const layer = this.props.layout.getLayer(instance.getLayer());
        if (!layer.getVisibility()) {
          invisibleLayerOnWhichInstancesHaveJustBeenAdded = instance.getLayer();
        }
      }
      const infoBarDetails = onInstanceAdded(
        instance,
        this.props.layout,
        this.props.project
      );
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
    const { project, layout } = this.props;
    const instancesObjectNames = uniq(
      instances.map(instance => instance.getObjectName())
    );

    const selectedObjectsWithContext = enumerateObjects(project, layout, {
      names: instancesObjectNames,
    }).allObjectsList;

    this.setState(
      {
        selectedObjectsWithContext,
      },
      () => {
        this.updateToolbar();
      }
    );
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

  _onSelectInstances = (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean
  ) => {
    this.instancesSelection.selectInstances({
      instances,
      multiSelect,
      layersLocks: null,
      ignoreSeal: true,
    });

    if (this.editor) this.editor.centerViewOnLastInstance(instances);
    this.forceUpdateInstancesList();
    this.forceUpdatePropertiesEditor();
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
    const infoBarDetails = onObjectAdded(
      object,
      this.props.layout,
      this.props.project
    );
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
              this.props.initialInstances.removeAllInstancesOnLayer(layerName);
            } else {
              // Instances are not invalidated, so we can keep the selection.
              this.props.initialInstances.moveInstancesToLayer(
                layerName,
                newLayer
              );
            }
          }

          done(doRemove);
          // /!\ Force the instances editor to destroy and mount again the
          // renderers to avoid keeping any references to existing instances
          if (this.editor) this.editor.forceRemount();

          this.forceUpdateLayersList();

          // We may have modified the selection, so force an update of editors dealing with it.
          this.forceUpdatePropertiesEditor();
          this.updateToolbar();
        });
      },
    });
  };

  _onRenameObjectStart = (objectWithContext: ?ObjectWithContext) => {
    const selectedObjectsWithContext = [];
    if (objectWithContext) {
      selectedObjectsWithContext.push(objectWithContext);
    }

    this.setState(
      {
        renamedObjectWithContext: objectWithContext,
        selectedObjectsWithContext,
      },
      () => {
        this.updateToolbar();
      }
    );
  };

  _startRenamingSelectedObject = () => {
    this._onRenameObjectStart(this.state.selectedObjectsWithContext[0]);
  };

  _onRenameLayer = (
    oldName: string,
    newName: string,
    done: boolean => void
  ) => {
    this.props.initialInstances.moveInstancesToLayer(oldName, newName);
    done(true);
    this.forceUpdatePropertiesEditor();
  };

  _onCreateLayer = () => {
    this.forceUpdatePropertiesEditor();
  };

  _onDeleteObject = (i18n: I18nType) => (
    objectWithContext: ObjectWithContext,
    done: boolean => void
  ) => {
    const { object, global } = objectWithContext;
    const { project, layout } = this.props;

    const answer = Window.showYesNoCancelDialog(
      i18n._(
        t`Do you want to remove all references to this object in groups and events (actions and conditions using the object)?`
      )
    );

    if (answer === 'cancel') return;
    const shouldRemoveReferences = answer === 'yes';

    // Unselect instances of the deleted object because these instances
    // will be deleted by gd.WholeProjectRefactorer (and after that, they will
    // be invalid references, as pointing to deleted objects).
    this.instancesSelection.unselectInstancesOfObject(object.getName());

    if (global) {
      gd.WholeProjectRefactorer.globalObjectOrGroupRemoved(
        project,
        object.getName(),
        /* isObjectGroup=*/ false,
        shouldRemoveReferences
      );
    } else {
      gd.WholeProjectRefactorer.objectOrGroupRemovedInLayout(
        project,
        layout,
        object.getName(),
        /* isObjectGroup=*/ false,
        shouldRemoveReferences
      );
    }

    done(true);

    // We modified the selection, so force an update of editors dealing with it.
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _canObjectOrGroupUseNewName = (
    newName: string,
    global: boolean,
    i18n: I18nType
  ) => {
    const { project, layout } = this.props;

    if (
      layout.hasObjectNamed(newName) ||
      project.hasObjectNamed(newName) ||
      layout.getObjectGroups().has(newName) ||
      project.getObjectGroups().has(newName)
    ) {
      showWarningBox(
        i18n._(t`Another object or group with this name already exists.`),
        {
          delayToNextTick: true,
        }
      );
      return false;
    }
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return false;
    }

    if (global) {
      // If object or group is global, also check for other layouts' objects and groups names.
      const { layout, project } = this.props;
      const layoutName = layout.getName();
      const layoutsWithObjectOrGroupWithSameName: Array<string> = mapFor(
        0,
        project.getLayoutsCount(),
        i => {
          const otherLayout = project.getLayoutAt(i);
          const otherLayoutName = otherLayout.getName();
          if (layoutName !== otherLayoutName) {
            if (otherLayout.hasObjectNamed(newName)) {
              return otherLayoutName;
            }
            const groupContainer = otherLayout.getObjectGroups();
            if (groupContainer.has(newName)) {
              return otherLayoutName;
            }
          }
          return null;
        }
      ).filter(Boolean);

      if (layoutsWithObjectOrGroupWithSameName.length > 0) {
        return Window.showConfirmDialog(
          i18n._(
            t`Renaming the global object/group "${newName}" would conflict with the following scenes that have a group or an object with that name:${'\n\n - ' +
              layoutsWithObjectOrGroupWithSameName.join('\n\n - ') +
              '\n\n'}Continue only if you know what you're doing.`
          ),
          'warning'
        );
      }
      return true;
    }

    return true;
  };

  _onRenameEditedObject = (newName: string) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObjectFinish(editedObjectWithContext, newName, () => {});
    }
  };

  _onRenameObjectFinish = (
    objectWithContext: ObjectWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { object, global } = objectWithContext;
    const { project, layout } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (object.getName() !== newName) {
      if (global) {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          object.getName(),
          newName,
          /* isObjectGroup=*/ false
        );
      } else {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInLayout(
          project,
          layout,
          object.getName(),
          newName,
          /* isObjectGroup=*/ false
        );
      }
    }

    object.setName(newName);
    this._onObjectSelected(objectWithContext);
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

  _onDeleteGroup = (
    groupWithContext: GroupWithContext,
    done: boolean => void
  ) => {
    const { group, global } = groupWithContext;
    const { project, layout } = this.props;

    const answer = Window.showConfirmDialog(
      'Do you want to remove all references to this group in events (actions and conditions using the group)?'
    );

    if (global) {
      gd.WholeProjectRefactorer.globalObjectOrGroupRemoved(
        project,
        group.getName(),
        /* isObjectGroup=*/ true,
        !!answer
      );
    } else {
      gd.WholeProjectRefactorer.objectOrGroupRemovedInLayout(
        project,
        layout,
        group.getName(),
        /* isObjectGroup=*/ true,
        !!answer
      );
    }

    done(true);
  };

  _onRenameGroup = (
    groupWithContext: GroupWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { group, global } = groupWithContext;
    const { project, layout } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (group.getName() !== newName) {
      if (global) {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          group.getName(),
          newName,
          /* isObjectGroup=*/ true
        );
      } else {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInLayout(
          project,
          layout,
          group.getName(),
          newName,
          /* isObjectGroup=*/ true
        );
      }
    }

    done(true);
  };

  canObjectOrGroupBeGlobal = (
    i18n: I18nType,
    objectOrGroupName: string
  ): boolean => {
    const { layout, project } = this.props;
    const layoutName = layout.getName();
    const layoutsWithObjectOrGroupWithSameName: Array<string> = mapFor(
      0,
      project.getLayoutsCount(),
      i => {
        const otherLayout = project.getLayoutAt(i);
        const otherLayoutName = otherLayout.getName();
        if (layoutName !== otherLayoutName) {
          if (otherLayout.hasObjectNamed(objectOrGroupName)) {
            return otherLayoutName;
          }
          const groupContainer = otherLayout.getObjectGroups();
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
    if (this.editor) this.editor.clearHighlightedInstance();

    this.setState(
      {
        selectedObjectsWithContext: [],
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
    if (this.editor) this.editor.zoomToInitialPosition();
  };

  zoomToFitContent = () => {
    if (this.editor) this.editor.zoomToFitContent();
  };

  zoomToFitSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    if (this.editor) this.editor.zoomToFitSelection(selectedInstances);
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

  setZoomFactor = (zoomFactor: number) => {
    if (this.editor) this.editor.setZoomFactor(zoomFactor);
  };

  zoomIn = () => {
    if (this.editor) this.editor.zoomBy(zoomInFactor);
  };

  zoomOut = () => {
    if (this.editor) this.editor.zoomBy(zoomOutFactor);
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
    const { project, layout } = this.props;

    const object = getObjectByName(project, layout, instance.getObjectName());
    return !!object && object.is3DObject();
  };

  buildContextMenu = (i18n: I18nType, layout: gdLayout, options: any) => {
    let contextMenuItems = [];
    if (
      options.ignoreSelectedObjectsForContextMenu ||
      this.state.selectedObjectsWithContext.length === 0
    ) {
      contextMenuItems = [
        ...contextMenuItems,
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
      ];
    } else {
      const objectName = this.state.selectedObjectsWithContext[0].object.getName();
      contextMenuItems = [
        ...contextMenuItems,
        {
          label: i18n._(t`Copy`),
          click: () => this.copySelection(),
          enabled: this.instancesSelection.hasSelectedInstances(),
          accelerator: 'CmdOrCtrl+C',
        },
        {
          label: i18n._(t`Cut`),
          click: () => this.cutSelection(),
          enabled: this.instancesSelection.hasSelectedInstances(),
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
          enabled: this.instancesSelection.hasSelectedInstances(),
          click: () => {
            this.duplicateSelection();
          },
          accelerator: 'CmdOrCtrl+D',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Bring to front`),
          enabled: this.instancesSelection.hasSelectedInstances(),
          click: () => {
            this._onMoveInstancesZOrder('front');
          },
        },
        {
          label: i18n._(t`Send to back`),
          enabled: this.instancesSelection.hasSelectedInstances(),
          click: () => {
            this._onMoveInstancesZOrder('back');
          },
        },
        { type: 'separator' },
        {
          label: i18n._(t`Show/Hide instance properties`),
          click: () => this.toggleProperties(),
          enabled: this.instancesSelection.hasSelectedInstances(),
        },
        {
          label: i18n._(t`Delete`),
          click: () => this.deleteSelection(),
          enabled: this.instancesSelection.hasSelectedInstances(),
          accelerator: 'Delete',
        },
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
        {
          label: i18n._(t`Edit effects`),
          click: () => this.editObjectByName(objectName, 'effects'),
        },
      ];
    }

    contextMenuItems = [
      ...contextMenuItems,
      { type: 'separator' },
      {
        label: i18n._(t`Open scene events`),
        click: () => this.props.onOpenEvents(layout.getName()),
      },
      {
        label: i18n._(t`Open scene properties`),
        click: () => this.openSceneProperties(true),
      },
    ];

    return contextMenuItems;
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
    if (this.editor) {
      const selectionAABB = this.editor.selectedInstances.getSelectionAABB();
      x = selectionAABB.centerX();
      y = selectionAABB.centerY();
    }

    if (this.editor) {
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
    const { editor } = this;
    if (!editor) return;
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const newInstances = editor.addSerializedInstances({
      position: [0, 0],
      copyReferential: [-2 * MOVEMENT_BIG_DELTA, -2 * MOVEMENT_BIG_DELTA],
      serializedInstances: serializedSelection,
      preventSnapToGrid: true,
    });
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
    const { editor } = this;
    if (!editor) return;

    const position = useLastCursorPosition
      ? editor.getLastCursorSceneCoordinates()
      : editor.getLastContextMenuSceneCoordinates();

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

    const newInstances = editor.addSerializedInstances({
      position: editor.viewPosition.containsPoint(position[0], position[1])
        ? position
        : [editor.viewPosition.viewX, editor.viewPosition.viewY],
      copyReferential: [x, y],
      serializedInstances: instancesContent,
      addInstancesInTheForeground: pasteInTheForeground,
    });

    this._onInstancesAdded(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });
    this.forceUpdatePropertiesEditor();
  };

  onSelectAllInstancesOfObjectInLayout = (objectName: string) => {
    const { layout } = this.props;
    const instancesToSelect = getInstancesInLayoutForObject(layout, objectName);
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
    layout.updateBehaviorsSharedData(project);
  };

  forceUpdateObjectsList = () => {
    if (this._objectsList) this._objectsList.forceUpdateList();
  };

  forceUpdateObjectGroupsList = () => {
    if (this._objectGroupsList) this._objectGroupsList.forceUpdate();
  };

  forceUpdateLayersList = () => {
    // The selected layer could have been deleted when editing a linked external layout.
    if (!this.props.layout.hasLayerNamed(this.state.selectedLayer)) {
      this.setState({ selectedLayer: BASE_LAYER_NAME });
    }
    if (this._layersList) this._layersList.forceUpdate();
  };

  forceUpdateInstancesList = () => {
    if (this._instancesList) this._instancesList.forceUpdate();
  };

  forceUpdatePropertiesEditor = () => {
    if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
  };

  reloadResourcesFor = (object: gdObject) => {
    const { project } = this.props;

    const resourcesInUse = new gd.ResourcesInUseHelper();
    object.getConfiguration().exposeResources(resourcesInUse);
    const objectResourceNames = resourcesInUse
      .getAllImages()
      .toNewVectorString()
      .toJSArray();
    resourcesInUse.delete();

    PixiResourcesLoader.loadTextures(
      project,
      objectResourceNames,
      () => {},
      () => {
        if (this.editor)
          this.editor.resetInstanceRenderersFor(object.getName());
      }
    );
  };

  _getAllObjectTags = (): Array<string> => {
    const { project, layout } = this.props;

    const tagsSet: Set<string> = new Set();
    enumerateObjects(project, layout).allObjectsList.forEach(({ object }) => {
      getTagsFromString(object.getTags()).forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet);
  };

  _buildObjectTagsMenuTemplate = (i18n: I18nType): Array<any> => {
    const { selectedObjectTags } = this.state;

    return buildTagsMenuTemplate({
      noTagLabel: i18n._(t`No tags - add a tag to an object first`),
      getAllTags: this._getAllObjectTags,
      selectedTags: selectedObjectTags,
      onChange: selectedObjectTags => {
        this.setState({ selectedObjectTags });
      },
    });
  };

  _getInstanceSize = (
    initialInstance: gdInitialInstance
  ): [number, number, number] => {
    if (!this.editor) return [0, 0, 0];

    return this.editor.getInstanceSize(initialInstance);
  };

  render() {
    const {
      project,
      layout,
      initialInstances,
      resourceManagementProps,
      isActive,
    } = this.props;
    const { editedObjectWithContext } = this.state;
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    const variablesEditedAssociatedObjectName = this.state
      .variablesEditedInstance
      ? this.state.variablesEditedInstance.getObjectName()
      : null;
    const variablesEditedAssociatedObject = variablesEditedAssociatedObjectName
      ? getObjectByName(project, layout, variablesEditedAssociatedObjectName)
      : null;
    const selectedObjectNames = this.state.selectedObjectsWithContext.map(
      objWithContext => objWithContext.object.getName()
    );
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

    const editors = {
      properties: {
        type: 'secondary',
        title: t`Properties`,
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <InstancePropertiesEditor
                i18n={i18n}
                project={project}
                layout={layout}
                instances={selectedInstances}
                editInstanceVariables={this.editInstanceVariables}
                onEditObjectByName={this.editObjectByName}
                onInstancesModified={instances =>
                  this.forceUpdateInstancesList()
                }
                onGetInstanceSize={this._getInstanceSize}
                ref={propertiesEditor =>
                  (this._propertiesEditor = propertiesEditor)
                }
                unsavedChanges={this.props.unsavedChanges}
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
              />
            )}
          </I18n>
        ),
      },
      'layers-list': {
        type: 'secondary',
        title: t`Layers`,
        renderEditor: () => (
          <LayersList
            project={project}
            selectedLayer={this.state.selectedLayer}
            onSelectLayer={(layer: string) =>
              this.setState({ selectedLayer: layer })
            }
            onEditLayerEffects={this.editLayerEffects}
            onEditLayer={this.editLayer}
            onRemoveLayer={this._onRemoveLayer}
            onRenameLayer={this._onRenameLayer}
            onCreateLayer={this._onCreateLayer}
            layersContainer={layout}
            unsavedChanges={this.props.unsavedChanges}
            ref={layersList => (this._layersList = layersList)}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        ),
      },
      'instances-list': {
        type: 'secondary',
        title: t`Instances List`,
        renderEditor: () => (
          <InstancesList
            instances={initialInstances}
            selectedInstances={selectedInstances}
            onSelectInstances={this._onSelectInstances}
            ref={instancesList => (this._instancesList = instancesList)}
          />
        ),
      },
      'instances-editor': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <FullSizeInstancesEditorWithScrollbars
            project={project}
            layout={layout}
            selectedLayer={this.state.selectedLayer}
            initialInstances={initialInstances}
            instancesEditorSettings={this.state.instancesEditorSettings}
            onInstancesEditorSettingsMutated={
              this._onInstancesEditorSettingsMutated
            }
            instancesSelection={this.instancesSelection}
            onInstancesAdded={this._onInstancesAdded}
            onInstancesSelected={this._onInstancesSelected}
            onInstanceDoubleClicked={this._onInstanceDoubleClicked}
            onInstancesMoved={this._onInstancesMoved}
            onInstancesResized={this._onInstancesResized}
            onInstancesRotated={this._onInstancesRotated}
            selectedObjectNames={selectedObjectNames}
            onContextMenu={this._onContextMenu}
            isInstanceOf3DObject={this.isInstanceOf3DObject}
            instancesEditorShortcutsCallbacks={{
              onCopy: () => this.copySelection({ useLastCursorPosition: true }),
              onCut: () => this.cutSelection({ useLastCursorPosition: true }),
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
            wrappedEditorRef={editor => {
              this.editor = editor;
            }}
            pauseRendering={!isActive}
          />
        ),
      },
      'objects-list': {
        type: 'secondary',
        title: t`Objects`,
        toolbarControls: [
          <I18n key="tags">
            {({ i18n }) => (
              <TagsButton
                buildMenuTemplate={(i18n: I18nType) =>
                  this._buildObjectTagsMenuTemplate(i18n)
                }
              />
            )}
          </I18n>,
          <CloseButton key="close" />,
        ],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <ObjectsList
                getThumbnail={ObjectsRenderingService.getThumbnail.bind(
                  ObjectsRenderingService
                )}
                project={project}
                objectsContainer={layout}
                layout={layout}
                onSelectAllInstancesOfObjectInLayout={
                  this.onSelectAllInstancesOfObjectInLayout
                }
                resourceManagementProps={this.props.resourceManagementProps}
                selectedObjectNames={selectedObjectNames}
                canInstallPrivateAsset={this.props.canInstallPrivateAsset}
                onEditObject={this.props.onEditObject || this.editObject}
                onExportObject={this.openObjectExporterDialog}
                onDeleteObject={this._onDeleteObject(i18n)}
                canRenameObject={(newName, global) =>
                  this._canObjectOrGroupUseNewName(newName, global, i18n)
                }
                onObjectCreated={this._onObjectCreated}
                onObjectSelected={this._onObjectSelected}
                renamedObjectWithContext={this.state.renamedObjectWithContext}
                onRenameObjectStart={this._onRenameObjectStart}
                onRenameObjectFinish={this._onRenameObjectFinish}
                onAddObjectInstance={this.addInstanceAtTheCenter}
                onObjectPasted={() => this.updateBehaviorsSharedData()}
                selectedObjectTags={this.state.selectedObjectTags}
                beforeSetAsGlobalObject={objectName =>
                  this.canObjectOrGroupBeGlobal(i18n, objectName)
                }
                onChangeSelectedObjectTags={selectedObjectTags =>
                  this.setState({
                    selectedObjectTags,
                  })
                }
                getAllObjectTags={this._getAllObjectTags}
                ref={
                  // $FlowFixMe Make this component functional.
                  objectsList => (this._objectsList = objectsList)
                }
                unsavedChanges={this.props.unsavedChanges}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
              />
            )}
          </I18n>
        ),
      },
      'object-groups-list': {
        type: 'secondary',
        title: t`Object Groups`,
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <ObjectGroupsList
                ref={objectGroupsList =>
                  (this._objectGroupsList = objectGroupsList)
                }
                globalObjectGroups={project.getObjectGroups()}
                objectGroups={layout.getObjectGroups()}
                onEditGroup={this.editGroup}
                onDeleteGroup={this._onDeleteGroup}
                onRenameGroup={this._onRenameGroup}
                canRenameGroup={(newName, global) =>
                  this._canObjectOrGroupUseNewName(newName, global, i18n)
                }
                beforeSetAsGlobalGroup={groupName =>
                  this.canObjectOrGroupBeGlobal(i18n, groupName)
                }
                unsavedChanges={this.props.unsavedChanges}
              />
            )}
          </I18n>
        ),
      },
    };

    return (
      <div
        style={styles.container}
        id="scene-editor"
        data-active={isActive ? 'true' : undefined}
      >
        <UseSceneEditorCommands
          project={project}
          layout={layout}
          onEditObject={this.props.onEditObject || this.editObject}
          onEditObjectVariables={object => {
            this.editObject(object, 'variables');
          }}
          onOpenSceneProperties={this.openSceneProperties}
          onOpenSceneVariables={this.editLayoutVariables}
          onEditObjectGroup={this.editGroup}
          onEditLayerEffects={this.editLayerEffects}
          onEditLayer={this.editLayer}
        />
        <ResponsiveWindowMeasurer>
          {windowWidth => (
            <PreferencesContext.Consumer>
              {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
                <EditorMosaic
                  editors={editors}
                  limitToOneSecondaryEditor={windowWidth === 'small'}
                  initialNodes={
                    windowWidth === 'small'
                      ? getDefaultEditorMosaicNode('scene-editor-small') ||
                        getInitialMosaicEditorNodesSmallWindow()
                      : getDefaultEditorMosaicNode('scene-editor') ||
                        initialMosaicEditorNodes
                  }
                  onOpenedEditorsChanged={this.updateToolbar}
                  onPersistNodes={node =>
                    setDefaultEditorMosaicNode(
                      windowWidth === 'small'
                        ? 'scene-editor-small'
                        : 'scene-editor',
                      node
                    )
                  }
                  ref={editorMosaic => (this.editorMosaic = editorMosaic)}
                />
              )}
            </PreferencesContext.Consumer>
          )}
        </ResponsiveWindowMeasurer>
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
                  resourceManagementProps={resourceManagementProps}
                  onComputeAllVariableNames={() => {
                    const { editedObjectWithContext } = this.state;
                    if (!editedObjectWithContext) return [];

                    return EventsRootVariablesFinder.findAllObjectVariables(
                      project.getCurrentPlatform(),
                      project,
                      layout,
                      editedObjectWithContext.object
                    );
                  }}
                  onCancel={() => {
                    if (editedObjectWithContext) {
                      this.reloadResourcesFor(editedObjectWithContext.object);
                    }
                    this.editObject(null);
                  }}
                  canRenameObject={newName =>
                    this._canObjectOrGroupUseNewName(
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
                      this.reloadResourcesFor(editedObjectWithContext.object);
                    }
                    this.editObject(null);
                    this.updateBehaviorsSharedData();
                    this.forceUpdateObjectsList();

                    if (this.props.unsavedChanges)
                      this.props.unsavedChanges.triggerUnsavedChanges();
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
        {this.state.exportedObject && (
          <ObjectExporterDialog
            object={this.state.exportedObject}
            onClose={() => {
              this.openObjectExporterDialog(null);
            }}
          />
        )}
        {!!this.state.editedGroup && (
          <ObjectGroupEditorDialog
            project={project}
            group={this.state.editedGroup}
            objectsContainer={layout}
            globalObjectsContainer={project}
            onCancel={() => this.editGroup(null)}
            onApply={() => this.editGroup(null)}
          />
        )}
        {this.state.setupGridOpen && (
          <SetupGridDialog
            instancesEditorSettings={this.state.instancesEditorSettings}
            onChangeInstancesEditorSettings={this.setInstancesEditorSettings}
            onCancel={() => this.openSetupGrid(false)}
            onApply={() => this.openSetupGrid(false)}
          />
        )}
        {!!this.state.variablesEditedInstance &&
          !!variablesEditedAssociatedObject && (
            <VariablesEditorDialog
              open
              variablesContainer={this.state.variablesEditedInstance.getVariables()}
              inheritedVariablesContainer={variablesEditedAssociatedObject.getVariables()}
              onCancel={() => this.editInstanceVariables(null)}
              onApply={() => this.editInstanceVariables(null)}
              emptyPlaceholderTitle={
                <Trans>Add your first instance variable</Trans>
              }
              emptyPlaceholderDescription={
                <Trans>
                  Instance variables overwrite the default values of the
                  variables of the object.
                </Trans>
              }
              helpPagePath={'/all-features/variables/instance-variables'}
              title={<Trans>Instance Variables</Trans>}
              onEditObjectVariables={
                variablesEditedAssociatedObject
                  ? () => {
                      this.editObject(
                        variablesEditedAssociatedObject,
                        'variables'
                      );
                      this.editInstanceVariables(null);
                    }
                  : undefined
              }
              hotReloadPreviewButtonProps={
                this.props.hotReloadPreviewButtonProps
              }
              onComputeAllVariableNames={() => {
                const { variablesEditedInstance } = this.state;
                if (!variablesEditedInstance) {
                  return [];
                }
                const variablesEditedObject = getObjectByName(
                  project,
                  layout,
                  variablesEditedInstance.getObjectName()
                );
                return variablesEditedObject
                  ? EventsRootVariablesFinder.findAllObjectVariables(
                      project.getCurrentPlatform(),
                      project,
                      layout,
                      variablesEditedObject
                    )
                  : [];
              }}
            />
          )}
        {!!this.state.layerRemoved && this.state.onCloseLayerRemoveDialog && (
          <LayerRemoveDialog
            open
            layersContainer={layout}
            layerRemoved={this.state.layerRemoved}
            onClose={this.state.onCloseLayerRemoveDialog}
          />
        )}
        {!!this.state.editedLayer && (
          <LayerEditorDialog
            project={project}
            resourceManagementProps={this.props.resourceManagementProps}
            layout={layout}
            layer={this.state.editedLayer}
            initialInstances={initialInstances}
            initialTab={this.state.editedLayerInitialTab}
            onClose={() =>
              this.setState({
                editedLayer: null,
              })
            }
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        )}
        {this.state.scenePropertiesDialogOpen && (
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
        {!!this.state.layoutVariablesDialogOpen && (
          <SceneVariablesDialog
            open
            project={project}
            layout={layout}
            onApply={() => this.editLayoutVariables(false)}
            onClose={() => this.editLayoutVariables(false)}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        )}
        <I18n>
          {({ i18n }) => (
            <React.Fragment>
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
                buildMenuTemplate={(i18n, buildOptions) =>
                  this.buildContextMenu(i18n, layout, buildOptions)
                }
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
  }
}
