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
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import InstancesSelection from './InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import Toolbar from './Toolbar';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import Clipboard from '../Utils/Clipboard';
import { passFullSize } from '../UI/FullSizeMeasurer';
import { addScrollbars } from '../InstancesEditor/ScrollbarContainer';
import { type PreviewOptions } from '../Export/PreviewLauncher.flow';
import Drawer from '@material-ui/core/Drawer';
import EditorMosaic from '../UI/EditorMosaic';
import EditorBar, { editorBarHeight } from '../UI/EditorBar';
import InfoBar from '../UI/Messages/InfoBar';
import ContextMenu from '../UI/Menu/ContextMenu';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { shortenString } from '../Utils/StringHelpers';
import getObjectByName from '../Utils/GetObjectByName';

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
import { ScreenTypeMeasurer } from '../UI/Reponsive/ScreenTypeMeasurer';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { type PreviewButtonSettings } from '../MainFrame/Toolbar/PreviewButtons';
const gd = global.gd;

const INSTANCES_CLIPBOARD_KIND = 'Instances';

const FullSizeInstancesEditor = passFullSize(addScrollbars(InstancesEditor), {
  useFlex: true,
});

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

const layersDrawerPaperProps = {
  style: {
    width: 500,
  },
};

const instancesDrawerPaperProps = {
  style: {
    width: 500,
    overflow: 'hidden',
  },
};

const initialEditors = {
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

const initialEditorsSmallWindow = {
  direction: 'row',
  first: 'instances-editor',
  second: 'objects-list',
  splitPercentage: 70,
};

type Props = {|
  previewButtonSettings: PreviewButtonSettings,
  initialInstances: gdInitialInstancesContainer,
  initialUiSettings: Object,
  layout: gdLayout,
  onEditObject: (object: gdObject) => void,
  onOpenDebugger: () => void,
  onOpenMoreSettings: () => void,
  onPreview: (options: PreviewOptions) => void,
  project: gdProject,
  setToolbar: (?React.Node) => void,
  showNetworkPreviewButton: boolean,
  showPreviewButton: boolean,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  isActive: boolean,
|};

type State = {|
  objectsListOpen: boolean,
  instancesListOpen: boolean,
  setupGridOpen: boolean,
  scenePropertiesDialogOpen: boolean,
  layersListOpen: boolean,
  layerRemoveDialogOpen: boolean,
  onCloseLayerRemoveDialog: ?(doRemove: boolean, newLayer: string) => void,
  layerRemoved: ?string,
  editedObjectWithContext: ?ObjectWithContext,
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

  // State for tags of objects:
  selectedObjectTags: SelectedTags,
|};

type CopyCutPasteOptions = { useLastCursorPosition?: boolean };

export default class SceneEditor extends React.Component<Props, State> {
  static defaultProps = {
    setToolbar: () => {},
  };

  zOrderFinder: ?gd.HighestZOrderFinder;
  instancesSelection: InstancesSelection;
  editor: ?InstancesEditor;
  contextMenu: ?ContextMenu;
  editorMosaic: ?EditorMosaic;
  _objectsList: ?ObjectsList;
  _propertiesEditor: ?InstancePropertiesEditor;

  constructor(props: Props) {
    super(props);

    this.instancesSelection = new InstancesSelection();
    this.state = {
      objectsListOpen: false,
      instancesListOpen: false,
      setupGridOpen: false,
      scenePropertiesDialogOpen: false,
      layersListOpen: false,
      layerRemoveDialogOpen: false,
      onCloseLayerRemoveDialog: null,
      layerRemoved: null,
      editedObjectWithContext: null,
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

      selectedObjectTags: [],
    };
  }

  componentWillMount() {
    this.zOrderFinder = new gd.HighestZOrderFinder();
  }

  getUiSettings() {
    return this.state.uiSettings;
  }

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        previewButtonSettings={this.props.previewButtonSettings}
        showPreviewButton={this.props.showPreviewButton}
        onPreview={() => this.props.onPreview({})}
        showNetworkPreviewButton={this.props.showNetworkPreviewButton}
        onNetworkPreview={() => this.props.onPreview({ networkPreview: true })}
        onOpenDebugger={() => {
          this.props.onOpenDebugger();
          this.props.onPreview({});
        }}
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
    if (!this.editorMosaic.openEditor('objects-list', 'end', 75)) {
      this.setState({
        showObjectsListInfoBar: true,
      });
    }
  };

  openProperties = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('properties', 'start', 25)) {
      this.setState({
        showPropertiesInfoBar: true,
      });
    }
  };

  openObjectGroupsList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.openEditor('object-groups-list', 'end', 75);
  };

  toggleInstancesList = () => {
    this.setState({ instancesListOpen: !this.state.instancesListOpen });
  };

  toggleLayersList = () => {
    this.setState({ layersListOpen: !this.state.layersListOpen });
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

  editInstanceVariables = (instance: ?gdInitialInstance) => {
    this.setState({ variablesEditedInstance: instance });
  };

  editObjectVariables = (object: ?gdObject) => {
    this.setState({ variablesEditedObject: object });
  };

  editLayoutVariables = (open: boolean = true) => {
    this.setState({ layoutVariablesDialogOpen: open });
  };

  editObject = (editedObject: ?gdObject) => {
    const { project } = this.props;
    if (editedObject) {
      this.setState({
        editedObjectWithContext: {
          object: editedObject,
          global: project.hasObjectNamed(editedObject.getName()),
        },
      });
    } else {
      this.setState({
        editedObjectWithContext: null,
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

    this.editor.addInstances(pos, [objectName]);
    this.setState(
      {
        selectedObjectNames: [],
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this.updateToolbar()
    );
  };

  _onInstancesAdded = () => {
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

    //eslint-disable-next-line
    const answer = confirm(
      'Do you want to remove all references to this object in groups and events (actions and conditions using the object)?'
    );

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
  };

  _canObjectOrGroupUseNewName = (newName: string) => {
    const { project, layout } = this.props;

    if (
      layout.hasObjectNamed(newName) ||
      project.hasObjectNamed(newName) ||
      layout.getObjectGroups().has(newName) ||
      project.getObjectGroups().has(newName)
    ) {
      showWarningBox('Another object or group with this name already exists.');
      return false;
    } else if (!gd.Project.validateObjectName(newName)) {
      showWarningBox(
        'This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your object name.'
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

    //eslint-disable-next-line
    const answer = confirm(
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
    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
    if (!clipboardContent || !this.editor) return;

    const position = useLastCursorPosition
      ? this.editor.getLastCursorSceneCoordinates()
      : this.editor.getLastContextMenuSceneCoordinates();
    const { x, y } = clipboardContent;
    clipboardContent.instances
      .map(serializedInstance => {
        const instance = new gd.InitialInstance();
        unserializeFromJSObject(instance, serializedInstance);
        return instance;
      })
      .forEach(instance => {
        instance.setX(instance.getX() - x + position[0]);
        instance.setY(instance.getY() - y + position[1]);
        this.props.initialInstances.insertInitialInstance(instance);
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

    PixiResourcesLoader.loadTextures(
      project,
      objectResourceNames,
      () => {},
      () => {
        if (this.editor) this.editor.resetRenderersFor(object.getName());
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
          <InstancePropertiesEditor
            project={project}
            layout={layout}
            instances={selectedInstances}
            editInstanceVariables={this.editInstanceVariables}
            editObjectVariables={this.editObjectVariables}
            onEditObjectByName={this.editObjectByName}
            ref={propertiesEditor =>
              (this._propertiesEditor = propertiesEditor)
            }
          />
        ),
      },
      'instances-editor': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <ScreenTypeMeasurer>
            {screenType => (
              <FullSizeInstancesEditor
                project={project}
                layout={layout}
                initialInstances={initialInstances}
                options={this.state.uiSettings}
                onChangeOptions={this.setUiSettings}
                instancesSelection={this.instancesSelection}
                onDeleteSelection={this.deleteSelection}
                onInstancesAdded={this._onInstancesAdded}
                onInstancesSelected={this._onInstancesSelected}
                onInstancesMoved={this._onInstancesMoved}
                onInstancesResized={this._onInstancesResized}
                onInstancesRotated={this._onInstancesRotated}
                selectedObjectNames={this.state.selectedObjectNames}
                onContextMenu={this._onContextMenu}
                onCopy={() =>
                  this.copySelection({ useLastCursorPosition: true })
                }
                onCut={() => this.cutSelection({ useLastCursorPosition: true })}
                onPaste={() => this.paste({ useLastCursorPosition: true })}
                onUndo={this.undo}
                onRedo={this.redo}
                onZoomOut={this.zoomOut}
                onZoomIn={this.zoomIn}
                wrappedEditorRef={editor => (this.editor = editor)}
                pauseRendering={!isActive}
                screenType={screenType}
              />
            )}
          </ScreenTypeMeasurer>
        ),
      },
      'objects-list': {
        type: 'secondary',
        title: t`Objects`,
        toolbarControls: [
          <I18n key="tags">
            {({ i18n }) => (
              <TagsButton
                buildMenuTemplate={() =>
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
            selectedObjectNames={this.state.selectedObjectNames}
            onEditObject={this.props.onEditObject || this.editObject}
            onDeleteObject={this._onDeleteObject}
            canRenameObject={this._canObjectOrGroupUseNewName}
            onObjectCreated={this._addInstanceForNewObject}
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
          />
        ),
      },
    };
    return (
      <div style={styles.container}>
        <ResponsiveWindowMeasurer>
          {windowWidth => (
            <EditorMosaic
              editors={editors}
              limitToOneSecondaryEditor={windowWidth === 'small'}
              initialNodes={
                windowWidth === 'small'
                  ? initialEditorsSmallWindow
                  : initialEditors
              }
              ref={editorMosaic => (this.editorMosaic = editorMosaic)}
            />
          )}
        </ResponsiveWindowMeasurer>
        {this.state.editedObjectWithContext && (
          <ObjectEditorDialog
            open
            object={this.state.editedObjectWithContext.object}
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
            }}
          />
        )}
        {!!this.state.editedGroup && (
          <ObjectGroupEditorDialog
            project={project}
            open
            group={this.state.editedGroup}
            objectsContainer={layout}
            globalObjectsContainer={project}
            onCancel={() => this.editGroup(null)}
            onApply={() => this.editGroup(null)}
          />
        )}
        <Drawer
          open={this.state.instancesListOpen}
          PaperProps={instancesDrawerPaperProps}
          anchor="right"
          onClose={this.toggleInstancesList}
        >
          <EditorBar
            title={<Trans>Instances</Trans>}
            displayLeftCloseButton
            onClose={this.toggleInstancesList}
          />
          <InstancesList
            freezeUpdate={!this.state.instancesListOpen}
            instances={initialInstances}
            selectedInstances={selectedInstances}
            onSelectInstances={this._onSelectInstances}
            style={{
              height: `calc(100% - ${editorBarHeight}px)`,
            }}
          />
        </Drawer>
        <Drawer
          open={this.state.layersListOpen}
          PaperProps={layersDrawerPaperProps}
          anchor="right"
          onClose={this.toggleLayersList}
        >
          <EditorBar
            title={<Trans>Layers</Trans>}
            displayLeftCloseButton
            onClose={this.toggleLayersList}
          />
          <LayersList
            project={project}
            resourceSources={resourceSources}
            resourceExternalEditors={resourceExternalEditors}
            onChooseResource={onChooseResource}
            freezeUpdate={!this.state.layersListOpen}
            onRemoveLayer={this._onRemoveLayer}
            onRenameLayer={this._onRenameLayer}
            layersContainer={layout}
          />
        </Drawer>
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
          <VariablesEditorDialog
            open
            variablesContainer={layout.getVariables()}
            onCancel={() => this.editLayoutVariables(false)}
            onApply={() => this.editLayoutVariables(false)}
            title={<Trans>Scene Variables</Trans>}
            emptyExplanationMessage={
              <Trans>
                Scene variables can be used to store any value or text during
                the game.
              </Trans>
            }
            emptyExplanationSecondMessage={
              <Trans>
                For example, you can have a variable called Score representing
                the current score of the player.
              </Trans>
            }
          />
        )}
        <ContextMenu
          ref={contextMenu => (this.contextMenu = contextMenu)}
          buildMenuTemplate={() => [
            {
              label: this.state.selectedObjectNames.length
                ? 'Add an Instance of ' +
                  shortenString(this.state.selectedObjectNames[0], 7)
                : '',
              click: () => this._onAddInstanceUnderCursor(),
              visible: this.state.selectedObjectNames.length > 0,
            },
            {
              label: 'Insert a New Object',
              click: () => this._createNewObjectAndInstanceUnderCursor(),
              visible: this.state.selectedObjectNames.length === 0,
            },
            {
              label: this.state.selectedObjectNames.length
                ? 'Edit Object ' +
                  shortenString(this.state.selectedObjectNames[0], 14)
                : '',
              click: () =>
                this.editObjectByName(this.state.selectedObjectNames[0]),
              visible: this.state.selectedObjectNames.length > 0,
            },
            {
              label: 'Scene properties',
              click: () => this.openSceneProperties(true),
            },
            { type: 'separator' },
            {
              label: 'Copy',
              click: () => this.copySelection(),
              enabled: this.instancesSelection.hasSelectedInstances(),
              accelerator: 'CmdOrCtrl+C',
            },
            {
              label: 'Cut',
              click: () => this.cutSelection(),
              enabled: this.instancesSelection.hasSelectedInstances(),
              accelerator: 'CmdOrCtrl+X',
            },
            {
              label: 'Paste',
              click: () => this.paste(),
              enabled: Clipboard.has(INSTANCES_CLIPBOARD_KIND),
              accelerator: 'CmdOrCtrl+V',
            },
            { type: 'separator' },
            {
              label: 'Undo',
              click: this.undo,
              enabled: canUndo(this.state.history),
              accelerator: 'CmdOrCtrl+Z',
            },
            {
              label: 'Redo',
              click: this.redo,
              enabled: canRedo(this.state.history),
              accelerator: 'CmdOrCtrl+Shift+Z',
            },
            {
              label: 'Delete',
              click: () => this.deleteSelection(),
              enabled: this.instancesSelection.hasSelectedInstances(),
            },
          ]}
        />
      </div>
    );
  }
}
