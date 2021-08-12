// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import uniq from 'lodash/uniq';
import ObjectsList from '../ObjectsList';
import ObjectGroupsList from '../ObjectGroupsList';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import InstancesEditor from '../InstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../InstancesEditor/InstancesList';
import LayersList from '../LayersList';
import LayerRemoveDialog from '../LayersList/LayerRemoveDialog';
import LayerEditorDialog from '../LayersList/LayerEditorDialog';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import Toolbar from './Toolbar';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import FullSizeInstancesEditorWithScrollbars from '../InstancesEditor/FullSizeInstancesEditorWithScrollbars';
import EditorMosaic from '../UI/EditorMosaic';
import InfoBar from '../UI/Messages/InfoBar';
import ContextMenu from '../UI/Menu/ContextMenu';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { shortenString } from '../Utils/StringHelpers';
import getObjectByName from '../Utils/GetObjectByName';
import UseSceneEditorCommands from './UseSceneEditorCommands';

import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
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

const gd: libGDevelop = global.gd;

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

const initialMosaicEditorNodesSmallWindow = {
  direction: 'row',
  first: 'instances-editor',
  second: 'objects-list',
  splitPercentage: 70,
};

type Props = {|
  initialInstances: gdInitialInstancesContainer,
  initialUiSettings: Object,
  layout: gdLayout,
  onEditObject?: ?(object: gdObject) => void,
  onOpenMoreSettings?: ?() => void,
  project: gdProject,
  setToolbar: (?React.Node) => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  isActive: boolean,
  unsavedChanges?: ?UnsavedChanges,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

type State = {|
  setupGridOpen: boolean,
  scenePropertiesDialogOpen: boolean,
  layersListOpen: boolean,
  layerRemoveDialogOpen: boolean,
  onCloseLayerRemoveDialog: ?(doRemove: boolean, newLayer: string) => void,
  layerRemoved: ?string,
  editedLayer: ?gdLayer,
  editedLayerInitialTab: 'properties' | 'effects',
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?string,
  variablesEditedInstance: ?gdInitialInstance,
  variablesEditedObject: ?gdObject,
  selectedObjectNames: Array<string>,
  newObjectInstanceSceneCoordinates: ?[number, number],

  editedGroup: ?gdObjectGroup,

  uiSettings: Object,
  history: HistoryState,

  showObjectsListInfoBar: boolean,
  layoutVariablesDialogOpen: boolean,
  showPropertiesInfoBar: boolean,
  showLayersInfoBar: boolean,
  showInstancesInfoBar: boolean,
  showAdditionalWorkInfoBar: boolean,
  additionalWorkInfoBar: InfoBarDetails,

  // State for tags of objects:
  selectedObjectTags: SelectedTags,
|};

type CopyCutPasteOptions = { useLastCursorPosition?: boolean };

export default class SceneEditor extends React.Component<Props, State> {
  static defaultProps = {
    setToolbar: () => {},
  };

  instancesSelection: InstancesSelection;
  editor: ?InstancesEditor;
  contextMenu: ?ContextMenu;
  editorMosaic: ?EditorMosaic;
  _objectsList: ?ObjectsList;
  _layersList: ?LayersList;
  _propertiesEditor: ?InstancePropertiesEditor;

  constructor(props: Props) {
    super(props);

    this.instancesSelection = new InstancesSelection();
    this.state = {
      setupGridOpen: false,
      scenePropertiesDialogOpen: false,
      layersListOpen: false,
      layerRemoveDialogOpen: false,
      onCloseLayerRemoveDialog: null,
      layerRemoved: null,
      editedLayer: null,
      editedLayerInitialTab: 'properties',
      editedObjectWithContext: null,
      editedObjectInitialTab: 'properties',
      variablesEditedInstance: null,
      variablesEditedObject: null,
      selectedObjectNames: [],
      newObjectInstanceSceneCoordinates: null,
      editedGroup: null,

      uiSettings: props.initialUiSettings,
      history: getHistoryInitialState(props.initialInstances, {
        historyMaxSize: 50,
      }),

      showObjectsListInfoBar: false,
      layoutVariablesDialogOpen: false,
      showPropertiesInfoBar: false,
      showLayersInfoBar: false,
      showInstancesInfoBar: false,

      showAdditionalWorkInfoBar: false,
      additionalWorkInfoBar: {
        identifier: 'default-additional-work',
        message: '',
        touchScreenMessage: '',
      },

      selectedObjectTags: [],
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.history !== prevState.history)
      if (this.props.unsavedChanges)
        this.props.unsavedChanges.triggerUnsavedChanges();
  }

  getUiSettings() {
    return this.state.uiSettings;
  }

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        instancesSelection={this.instancesSelection}
        openObjectsList={this.openObjectsList}
        openObjectGroupsList={this.openObjectGroupsList}
        openProperties={this.openProperties}
        deleteSelection={this.deleteSelection}
        toggleInstancesList={this.toggleInstancesList}
        toggleLayersList={this.toggleLayersList}
        toggleWindowMask={this.toggleWindowMask}
        toggleGrid={this.toggleGrid}
        isGridShown={() => !!this.state.uiSettings.grid}
        isWindowMaskShown={() => !!this.state.uiSettings.windowMask}
        openSetupGrid={this.openSetupGrid}
        setZoomFactor={this.setZoomFactor}
        centerView={this.centerView}
        canUndo={canUndo(this.state.history)}
        canRedo={canRedo(this.state.history)}
        undo={this.undo}
        redo={this.redo}
        zoomIn={this.zoomIn}
        zoomOut={this.zoomOut}
        onOpenSettings={this.openSceneProperties}
      />
    );
  }

  componentWillReceiveProps(nextProps: Props) {
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

  openObjectsList = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('objects-list', 'end', 75, 'column')) {
      this.setState({
        showObjectsListInfoBar: true,
      });
    }
  };

  openProperties = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('properties', 'start', 25, 'column')) {
      this.setState({
        showPropertiesInfoBar: true,
      });
    }
  };

  openObjectGroupsList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.openEditor('object-groups-list', 'end', 75, 'column');
  };

  toggleInstancesList = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('instances-list', 'end', 75, 'row')) {
      this.setState({
        showInstancesInfoBar: true,
      });
    }
  };

  toggleLayersList = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('layers-list', 'end', 75, 'row')) {
      this.setState({
        showLayersInfoBar: true,
      });
    }
  };

  toggleWindowMask = () => {
    this.setState({
      uiSettings: {
        ...this.state.uiSettings,
        windowMask: !this.state.uiSettings.windowMask,
      },
    });
  };

  toggleGrid = () => {
    this.setState({
      uiSettings: {
        ...this.state.uiSettings,
        grid: !this.state.uiSettings.grid,
        snap: !this.state.uiSettings.grid,
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

  editObjectVariables = (object: ?gdObject) => {
    this.setState({ variablesEditedObject: object });
  };

  editLayoutVariables = (open: boolean = true) => {
    this.setState({ layoutVariablesDialogOpen: open });
  };

  editObject = (editedObject: ?gdObject, initialTab: ?string) => {
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

  editObjectByName = (objectName: string) => {
    const { project, layout } = this.props;
    if (layout.hasObjectNamed(objectName))
      this.editObject(layout.getObject(objectName));
    else if (project.hasObjectNamed(objectName))
      this.editObject(project.getObject(objectName));
  };

  editGroup = (group: ?gdObjectGroup) => {
    this.setState({ editedGroup: group });
  };

  setUiSettings = (uiSettings: Object) => {
    this.setState({
      uiSettings: {
        ...this.state.uiSettings,
        ...uiSettings,
      },
    });
  };

  undo = () => {
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

  _onObjectSelected = (selectedObjectName: string) => {
    if (!selectedObjectName) {
      this.setState({
        selectedObjectNames: [],
      });
    } else {
      this.setState({
        selectedObjectNames: [selectedObjectName],
      });
    }
  };

  _createNewObjectAndInstanceUnderCursor = () => {
    if (!this.editor) {
      return;
    }

    // Remember where to create the instance, when the object will be created
    this.setState({
      newObjectInstanceSceneCoordinates: this.editor.getLastCursorSceneCoordinates(),
    });

    if (this._objectsList)
      this._objectsList.setState({ newObjectDialogOpen: true });
  };

  _onAddInstanceUnderCursor = () => {
    if (!this.state.selectedObjectNames.length || !this.editor) {
      return;
    }

    const objectSelected = this.state.selectedObjectNames[0];
    const cursorPosition = this.editor.getLastCursorSceneCoordinates();
    this._addInstance(cursorPosition, objectSelected);
    this.setState({
      selectedObjectNames: [objectSelected],
    });
  };

  _addInstance = (pos: [number, number], objectName: string) => {
    if (!objectName || !this.editor) return;

    const instances = this.editor.addInstances(pos, [objectName]);
    this._onInstancesAdded(instances);
  };

  _onInstancesAdded = (instances: Array<gdInitialInstance>) => {
    instances.forEach(instance => {
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

    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this.updateToolbar()
    );
  };

  _onInstancesSelected = (instances: Array<gdInitialInstance>) => {
    this.setState({
      selectedObjectNames: uniq(
        instances.map(instance => instance.getObjectName())
      ),
    });
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _onInstanceDoubleClicked = (instance: gdInitialInstance) => {
    this.editObjectByName(instance.getObjectName());
  };

  _onInstancesMoved = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this.forceUpdatePropertiesEditor()
    );
  };

  _onInstancesResized = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this.forceUpdatePropertiesEditor()
    );
  };

  _onInstancesRotated = (instances: Array<gdInitialInstance>) => {
    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
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
    centerView: boolean = true
  ) => {
    this.instancesSelection.selectInstances(instances, false);

    if (centerView) {
      if (this.editor) this.editor.centerViewOn(instances);
    }
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

    this._addInstanceForNewObject(object.getName());
  };

  _onRemoveLayer = (layerName: string, done: boolean => void) => {
    this.setState({
      layerRemoveDialogOpen: true,
      layerRemoved: layerName,
      onCloseLayerRemoveDialog: (doRemove, newLayer) => {
        this.setState(
          {
            layerRemoveDialogOpen: false,
          },
          () => {
            if (doRemove) {
              if (newLayer === null) {
                this.props.initialInstances.removeAllInstancesOnLayer(
                  layerName
                );
              } else {
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
            this.updateToolbar();
          }
        );
      },
    });
  };

  _onRenameLayer = (
    oldName: string,
    newName: string,
    done: boolean => void
  ) => {
    this.props.initialInstances.moveInstancesToLayer(oldName, newName);
    done(true);
  };

  _onDeleteObject = (
    objectWithContext: ObjectWithContext,
    done: boolean => void
  ) => {
    const { object, global } = objectWithContext;
    const { project, layout } = this.props;

    const answer = Window.showConfirmDialog(
      'Do you want to remove all references to this object in groups and events (actions and conditions using the object)?'
    );

    // Unselect instances of the deleted object because these instances
    // will be deleted by gd.WholeProjectRefactorer (and after that, they will
    // be invalid references, as pointing to deleted objects).
    this.instancesSelection.unselectInstancesOfObject(object.getName());

    if (global) {
      gd.WholeProjectRefactorer.globalObjectOrGroupRemoved(
        project,
        object.getName(),
        /* isObjectGroup=*/ false,
        !!answer
      );
    } else {
      gd.WholeProjectRefactorer.objectOrGroupRemovedInLayout(
        project,
        layout,
        object.getName(),
        /* isObjectGroup=*/ false,
        !!answer
      );
    }

    done(true);

    // We modified the selection, so force an update of editors dealing with it.
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _canObjectOrGroupUseNewName = (newName: string) => {
    const { project, layout } = this.props;

    if (
      layout.hasObjectNamed(newName) ||
      project.hasObjectNamed(newName) ||
      layout.getObjectGroups().has(newName) ||
      project.getObjectGroups().has(newName)
    ) {
      showWarningBox('Another object or group with this name already exists.', {
        delayToNextTick: true,
      });
      return false;
    } else if (!gd.Project.validateName(newName)) {
      showWarningBox(
        'This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.',
        { delayToNextTick: true }
      );
      return false;
    }

    return true;
  };

  _onRenameEditedObject = (newName: string) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObject(editedObjectWithContext, newName, () => {});
    }
  };

  _onRenameObject = (
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
    done(true);
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

  deleteSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    selectedInstances.map(instance =>
      this.props.initialInstances.removeInstance(instance)
    );

    this.instancesSelection.clearSelection();
    if (this.editor) this.editor.clearHighlightedInstance();

    this.setState(
      {
        selectedObjectNames: [],
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => {
        this.updateToolbar();
        this.forceUpdatePropertiesEditor();
      }
    );
  };

  centerView = () => {
    if (this.editor) this.editor.centerView();
  };

  setZoomFactor = (zoomFactor: number) => {
    if (this.editor) this.editor.setZoomFactor(zoomFactor);
  };

  zoomIn = () => {
    if (this.editor) this.editor.zoomBy(0.1);
  };

  zoomOut = () => {
    if (this.editor) this.editor.zoomBy(-0.1);
  };

  _onContextMenu = (x: number, y: number) => {
    if (this.contextMenu) this.contextMenu.open(x, y);
  };

  copySelection = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    if (this.editor) {
      const position = useLastCursorPosition
        ? this.editor.getLastCursorSceneCoordinates()
        : this.editor.getLastContextMenuSceneCoordinates();
      Clipboard.set(INSTANCES_CLIPBOARD_KIND, {
        x: position[0],
        y: position[1],
        instances: serializedSelection,
      });
    }
  };

  cutSelection = (options: CopyCutPasteOptions = {}) => {
    this.copySelection(options);
    this.deleteSelection();
  };

  paste = ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    if (!this.editor) return;

    const position = useLastCursorPosition
      ? this.editor.getLastCursorSceneCoordinates()
      : this.editor.getLastContextMenuSceneCoordinates();

    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
    const instancesContent = SafeExtractor.extractArrayProperty(
      clipboardContent,
      'instances'
    );
    const x = SafeExtractor.extractNumberProperty(clipboardContent, 'x');
    const y = SafeExtractor.extractNumberProperty(clipboardContent, 'y');
    if (x === null || y === null || instancesContent === null) return;

    instancesContent
      .map(serializedInstance => {
        const instance = new gd.InitialInstance();
        unserializeFromJSObject(instance, serializedInstance);
        return instance;
      })
      .forEach(instance => {
        instance.setX(instance.getX() - x + position[0]);
        instance.setY(instance.getY() - y + position[1]);
        this.props.initialInstances
          .insertInitialInstance(instance)
          .resetPersistentUuid();
        instance.delete();
      });
  };

  updateBehaviorsSharedData = () => {
    const { layout, project } = this.props;
    layout.updateBehaviorsSharedData(project);
  };

  forceUpdateObjectsList = () => {
    if (this._objectsList) this._objectsList.forceUpdateList();
  };

  forceUpdateLayersList = () => {
    if (this._layersList) this._layersList.forceUpdate();
  };

  forceUpdatePropertiesEditor = () => {
    if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
  };

  reloadResourcesFor = (object: gdObject) => {
    const { project } = this.props;

    const resourcesInUse = new gd.ResourcesInUseHelper();
    object.exposeResources(resourcesInUse);
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

  render() {
    const {
      project,
      layout,
      initialInstances,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      isActive,
    } = this.props;
    const selectedInstances = this.instancesSelection.getSelectedInstances();

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
                editObjectVariables={this.editObjectVariables}
                onEditObjectByName={this.editObjectByName}
                ref={propertiesEditor =>
                  (this._propertiesEditor = propertiesEditor)
                }
                unsavedChanges={this.props.unsavedChanges}
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
            resourceSources={resourceSources}
            resourceExternalEditors={resourceExternalEditors}
            onChooseResource={onChooseResource}
            onEditLayerEffects={this.editLayerEffects}
            onEditLayer={this.editLayer}
            onRemoveLayer={this._onRemoveLayer}
            onRenameLayer={this._onRenameLayer}
            layersContainer={layout}
            unsavedChanges={this.props.unsavedChanges}
            ref={layersList => (this._layersList = layersList)}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        ),
      },
      'instances-list': {
        type: 'secondary',
        title: t`Instances list`,
        renderEditor: () => (
          <InstancesList
            instances={initialInstances}
            selectedInstances={selectedInstances}
            onSelectInstances={this._onSelectInstances}
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
            initialInstances={initialInstances}
            options={this.state.uiSettings}
            onChangeOptions={this.setUiSettings}
            instancesSelection={this.instancesSelection}
            onDeleteSelection={this.deleteSelection}
            onInstancesAdded={this._onInstancesAdded}
            onInstancesSelected={this._onInstancesSelected}
            onInstanceDoubleClicked={this._onInstanceDoubleClicked}
            onInstancesMoved={this._onInstancesMoved}
            onInstancesResized={this._onInstancesResized}
            onInstancesRotated={this._onInstancesRotated}
            selectedObjectNames={this.state.selectedObjectNames}
            onContextMenu={this._onContextMenu}
            onCopy={() => this.copySelection({ useLastCursorPosition: true })}
            onCut={() => this.cutSelection({ useLastCursorPosition: true })}
            onPaste={() => this.paste({ useLastCursorPosition: true })}
            onUndo={this.undo}
            onRedo={this.redo}
            onZoomOut={this.zoomOut}
            onZoomIn={this.zoomIn}
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
          <ObjectsList
            getThumbnail={ObjectsRenderingService.getThumbnail.bind(
              ObjectsRenderingService
            )}
            project={project}
            objectsContainer={layout}
            layout={layout}
            events={layout.getEvents()}
            resourceSources={resourceSources}
            resourceExternalEditors={resourceExternalEditors}
            onChooseResource={onChooseResource}
            selectedObjectNames={this.state.selectedObjectNames}
            onEditObject={this.props.onEditObject || this.editObject}
            onDeleteObject={this._onDeleteObject}
            canRenameObject={this._canObjectOrGroupUseNewName}
            onObjectCreated={this._onObjectCreated}
            onObjectSelected={this._onObjectSelected}
            onRenameObject={this._onRenameObject}
            onObjectPasted={() => this.updateBehaviorsSharedData()}
            selectedObjectTags={this.state.selectedObjectTags}
            onChangeSelectedObjectTags={selectedObjectTags =>
              this.setState({
                selectedObjectTags,
              })
            }
            getAllObjectTags={this._getAllObjectTags}
            ref={objectsList => (this._objectsList = objectsList)}
            unsavedChanges={this.props.unsavedChanges}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        ),
      },
      'object-groups-list': {
        type: 'secondary',
        title: t`Object Groups`,
        renderEditor: () => (
          <ObjectGroupsList
            globalObjectGroups={project.getObjectGroups()}
            objectGroups={layout.getObjectGroups()}
            onEditGroup={this.editGroup}
            onDeleteGroup={this._onDeleteGroup}
            onRenameGroup={this._onRenameGroup}
            canRenameGroup={this._canObjectOrGroupUseNewName}
            unsavedChanges={this.props.unsavedChanges}
          />
        ),
      },
    };
    return (
      <div style={styles.container}>
        <UseSceneEditorCommands
          project={project}
          layout={layout}
          onEditObject={this.props.onEditObject || this.editObject}
          onEditObjectVariables={this.editObjectVariables}
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
                        initialMosaicEditorNodesSmallWindow
                      : getDefaultEditorMosaicNode('scene-editor') ||
                        initialMosaicEditorNodes
                  }
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
        {this.state.editedObjectWithContext && (
          <ObjectEditorDialog
            open
            object={this.state.editedObjectWithContext.object}
            initialTab={this.state.editedObjectInitialTab}
            project={project}
            resourceSources={resourceSources}
            resourceExternalEditors={resourceExternalEditors}
            onChooseResource={onChooseResource}
            onCancel={() => {
              if (this.state.editedObjectWithContext) {
                this.reloadResourcesFor(
                  this.state.editedObjectWithContext.object
                );
              }
              this.editObject(null);
            }}
            canRenameObject={this._canObjectOrGroupUseNewName}
            onRename={newName => {
              this._onRenameEditedObject(newName);
            }}
            onApply={() => {
              if (this.state.editedObjectWithContext) {
                this.reloadResourcesFor(
                  this.state.editedObjectWithContext.object
                );
              }
              this.editObject(null);
              this.updateBehaviorsSharedData();
              this.forceUpdateObjectsList();

              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
            }}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            onUpdateBehaviorsSharedData={() => this.updateBehaviorsSharedData()}
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
        <InfoBar
          identifier="instance-drag-n-drop-explanation"
          message={
            <Trans>
              Drag and Drop the object to the scene or use the right click menu
              to add an instance of it.
            </Trans>
          }
          touchScreenMessage={
            <Trans>
              Drag and Drop the object icon to the scene or long press to show
              options to edit the object.
            </Trans>
          }
          show={!!this.state.selectedObjectNames.length}
        />
        <InfoBar
          identifier="objects-panel-explanation"
          message={
            <Trans>
              Objects panel is already opened: use it to add and edit objects.
            </Trans>
          }
          show={!!this.state.showObjectsListInfoBar}
        />
        <InfoBar
          identifier="instance-properties-panel-explanation"
          message={
            <Trans>
              Properties panel is already opened. After selecting an instance on
              the scene, inspect and change its properties from this panel.
            </Trans>
          }
          show={!!this.state.showPropertiesInfoBar}
        />
        <InfoBar
          identifier="layers-panel-explanation"
          message={
            <Trans>
              Layers panel is already opened. You can add new layers and apply
              effects on them from this panel.
            </Trans>
          }
          show={!!this.state.showLayersInfoBar}
        />
        <InfoBar
          identifier="instances-panel-explanation"
          message={
            <Trans>
              Instances panel is already opened. You can search instances in the
              scene and click one to move the view to it.
            </Trans>
          }
          show={!!this.state.showInstancesInfoBar}
        />
        {this.state.setupGridOpen && (
          <SetupGridDialog
            open
            gridOptions={this.state.uiSettings}
            onCancel={() => this.openSetupGrid(false)}
            onApply={gridOptions => {
              this.setUiSettings(gridOptions);
              this.openSetupGrid(false);
            }}
          />
        )}
        {!!this.state.variablesEditedInstance && (
          <VariablesEditorDialog
            open
            variablesContainer={
              this.state.variablesEditedInstance &&
              this.state.variablesEditedInstance.getVariables()
            }
            onCancel={() => this.editInstanceVariables(null)}
            onApply={() => this.editInstanceVariables(null)}
            emptyExplanationMessage={
              <Trans>
                Instance variables will override the default values of the
                variables of the object.
              </Trans>
            }
            title={<Trans>Instance Variables</Trans>}
            onEditObjectVariables={() => {
              if (!this.instancesSelection.hasSelectedInstances()) {
                return;
              }
              const associatedObjectName = this.instancesSelection
                .getSelectedInstances()[0]
                .getObjectName();
              const object = getObjectByName(
                project,
                layout,
                associatedObjectName
              );
              if (object) {
                this.editObjectVariables(object);
                this.editInstanceVariables(null);
              }
            }}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            onComputeAllVariableNames={() => {
              const variablesEditedInstance = this.state
                .variablesEditedInstance;
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
        {!!this.state.variablesEditedObject && (
          <VariablesEditorDialog
            open
            variablesContainer={
              this.state.variablesEditedObject &&
              this.state.variablesEditedObject.getVariables()
            }
            onCancel={() => this.editObjectVariables(null)}
            onApply={() => this.editObjectVariables(null)}
            emptyExplanationMessage={
              <Trans>
                When you add variables to an object, any instance of the object
                put on the scene or created during the game will have these
                variables attached to it.
              </Trans>
            }
            title={<Trans>Object Variables</Trans>}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            onComputeAllVariableNames={() => {
              const variablesEditedObject = this.state.variablesEditedObject;
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
        {!!this.state.layerRemoveDialogOpen && (
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
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
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
              <InfoBar
                show={this.state.showAdditionalWorkInfoBar}
                identifier={this.state.additionalWorkInfoBar.identifier}
                message={i18n._(this.state.additionalWorkInfoBar.message)}
                touchScreenMessage={i18n._(
                  this.state.additionalWorkInfoBar.touchScreenMessage
                )}
              />
              <ContextMenu
                ref={contextMenu => (this.contextMenu = contextMenu)}
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: this.state.selectedObjectNames.length
                      ? i18n._(
                          t`Add an Instance of ${shortenString(
                            this.state.selectedObjectNames[0],
                            7
                          )}`
                        )
                      : '',
                    click: () => this._onAddInstanceUnderCursor(),
                    visible: this.state.selectedObjectNames.length > 0,
                  },
                  {
                    label: i18n._(t`Insert a New Object`),
                    click: () => this._createNewObjectAndInstanceUnderCursor(),
                    visible: this.state.selectedObjectNames.length === 0,
                  },
                  {
                    label: this.state.selectedObjectNames.length
                      ? i18n._(
                          t`Edit Object ${shortenString(
                            this.state.selectedObjectNames[0],
                            14
                          )}`
                        )
                      : '',
                    click: () =>
                      this.editObjectByName(this.state.selectedObjectNames[0]),
                    visible: this.state.selectedObjectNames.length > 0,
                  },
                  {
                    label: i18n._(t`Scene properties`),
                    click: () => this.openSceneProperties(true),
                  },
                  { type: 'separator' },
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
                  { type: 'separator' },
                  {
                    label: i18n._(t`Undo`),
                    click: this.undo,
                    enabled: canUndo(this.state.history),
                    accelerator: 'CmdOrCtrl+Z',
                  },
                  {
                    label: i18n._(t`Redo`),
                    click: this.redo,
                    enabled: canRedo(this.state.history),
                    accelerator: 'CmdOrCtrl+Shift+Z',
                  },
                  {
                    label: i18n._(t`Delete`),
                    click: () => this.deleteSelection(),
                    enabled: this.instancesSelection.hasSelectedInstances(),
                  },
                ]}
              />
            </React.Fragment>
          )}
        </I18n>
      </div>
    );
  }
}
