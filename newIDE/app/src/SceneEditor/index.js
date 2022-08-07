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
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import Toolbar from './Toolbar';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
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

import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
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
import { MOVEMENT_BIG_DELTA } from '../UI/KeyboardShortcuts/DeprecatedKeyboardShortcuts';

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
  getInitialInstancesEditorSettings: () => InstancesEditorSettings,
  layout: gdLayout,
  onEditObject?: ?(object: gdObject) => void,
  onOpenMoreSettings?: ?() => void,
  onOpenEvents: (sceneName: string) => void,
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
  editedObjectInitialTab: ?ObjectEditorTab,
  variablesEditedInstance: ?gdInitialInstance,
  selectedObjectNames: Array<string>,
  newObjectInstanceSceneCoordinates: ?[number, number],

  editedGroup: ?gdObjectGroup,

  instancesEditorSettings: Object,
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
  contextMenu: ?ContextMenuInterface;
  editorMosaic: ?EditorMosaic;
  _objectsList: ?ObjectsList;
  _layersList: ?LayersList;
  _propertiesEditor: ?InstancePropertiesEditor;
  _instancesList: ?InstancesList;

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
      selectedObjectNames: [],
      newObjectInstanceSceneCoordinates: null,
      editedGroup: null,

      instancesEditorSettings: props.getInitialInstancesEditorSettings(),
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

  getInstancesEditorSettings() {
    return this.state.instancesEditorSettings;
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
        isGridShown={() => !!this.state.instancesEditorSettings.grid}
        isWindowMaskShown={() =>
          !!this.state.instancesEditorSettings.windowMask
        }
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
        history: saveToHistory(
          this.state.history,
          this.props.initialInstances,
          'ADD'
        ),
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
      layersVisibility: null,
      ignoreSeal: true,
    });

    if (this.editor) this.editor.centerViewOn(instances);
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
                this.instancesSelection.unselectInstancesOnLayer(layerName);
                this.props.initialInstances.removeAllInstancesOnLayer(
                  layerName
                );
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
    selectedInstances.forEach(instance => {
      if (instance.isLocked()) return;
      this.props.initialInstances.removeInstance(instance);
    });

    this.instancesSelection.clearSelection();
    if (this.editor) this.editor.clearHighlightedInstance();

    this.setState(
      {
        selectedObjectNames: [],
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

  _onContextMenu = (
    x: number,
    y: number,
    ignoreSelectedObjectNamesForContextMenu?: boolean = false
  ) => {
    if (this.contextMenu)
      this.contextMenu.open(x, y, {
        ignoreSelectedObjectNamesForContextMenu: !!ignoreSelectedObjectNamesForContextMenu,
      });
  };

  buildContextMenu = (i18n: I18nType, layout: gdLayout, options: any) => {
    let contextMenuItems = [];
    if (
      options.ignoreSelectedObjectNamesForContextMenu ||
      this.state.selectedObjectNames.length === 0
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
      ];
    } else {
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
          click: () => {
            this.duplicateSelection();
          },
        },
        { type: 'separator' },
        {
          label: i18n._(t`Delete`),
          click: () => this.deleteSelection(),
          enabled: this.instancesSelection.hasSelectedInstances(),
          accelerator: 'Delete',
        },
        { type: 'separator' },
        {
          label: i18n._(
            t`Edit object ${shortenString(
              this.state.selectedObjectNames[0],
              14
            )}`
          ),
          click: () =>
            this.editObjectByName(
              this.state.selectedObjectNames[0],
              'properties'
            ),
        },
        {
          label: i18n._(t`Edit object variables`),
          click: () =>
            this.editObjectByName(
              this.state.selectedObjectNames[0],
              'variables'
            ),
        },
        {
          label: i18n._(t`Edit behaviors`),
          click: () =>
            this.editObjectByName(
              this.state.selectedObjectNames[0],
              'behaviors'
            ),
        },
        {
          label: i18n._(t`Edit effects`),
          click: () =>
            this.editObjectByName(this.state.selectedObjectNames[0], 'effects'),
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

  duplicateSelection = () => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    if (!this.editor) return;

    const newInstances = serializedSelection.map(serializedInstance => {
      const instance = new gd.InitialInstance();
      unserializeFromJSObject(instance, serializedInstance);
      instance.setX(instance.getX() + 2 * MOVEMENT_BIG_DELTA);
      instance.setY(instance.getY() + 2 * MOVEMENT_BIG_DELTA);
      const newInstance = this.props.initialInstances
        .insertInitialInstance(instance)
        .resetPersistentUuid();
      instance.delete();
      return newInstance;
    });
    this._onInstancesAdded(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersVisibility: null,
    });
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

    const newInstances = instancesContent.map(serializedInstance => {
      const instance = new gd.InitialInstance();
      unserializeFromJSObject(instance, serializedInstance);
      instance.setX(instance.getX() - x + position[0]);
      instance.setY(instance.getY() - y + position[1]);
      const newInstance = this.props.initialInstances
        .insertInitialInstance(instance)
        .resetPersistentUuid();
      instance.delete();
      return newInstance;
    });
    this._onInstancesAdded(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersVisibility: null,
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

  forceUpdateInstancesList = () => {
    if (this._instancesList) this._instancesList.forceUpdate();
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
    const variablesEditedAssociatedObjectName = this.state
      .variablesEditedInstance
      ? this.state.variablesEditedInstance.getObjectName()
      : null;
    const variablesEditedAssociatedObject = variablesEditedAssociatedObjectName
      ? getObjectByName(project, layout, variablesEditedAssociatedObjectName)
      : null;

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
            initialInstances={initialInstances}
            instancesEditorSettings={this.state.instancesEditorSettings}
            onChangeInstancesEditorSettings={this.setInstancesEditorSettings}
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
          <I18n>
            {({ i18n }) => (
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
                onDeleteObject={this._onDeleteObject(i18n)}
                canRenameObject={this._canObjectOrGroupUseNewName}
                onObjectCreated={this._onObjectCreated}
                onObjectSelected={this._onObjectSelected}
                onRenameObject={this._onRenameObject}
                onAddObjectInstance={this.addInstanceAtTheCenter}
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
        <DismissableInfoBar
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
        <DismissableInfoBar
          identifier="objects-panel-explanation"
          message={
            <Trans>
              Objects panel is already opened: use it to add and edit objects.
            </Trans>
          }
          show={!!this.state.showObjectsListInfoBar}
        />
        <DismissableInfoBar
          identifier="instance-properties-panel-explanation"
          message={
            <Trans>
              Properties panel is already opened. After selecting an instance on
              the scene, inspect and change its properties from this panel.
            </Trans>
          }
          show={!!this.state.showPropertiesInfoBar}
        />
        <DismissableInfoBar
          identifier="layers-panel-explanation"
          message={
            <Trans>
              Layers panel is already opened. You can add new layers and apply
              effects on them from this panel.
            </Trans>
          }
          show={!!this.state.showLayersInfoBar}
        />
        <DismissableInfoBar
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
      </div>
    );
  }
}
