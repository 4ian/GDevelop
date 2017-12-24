import React, { Component } from 'react';

import ObjectsList from '../../ObjectsList';
import ObjectsGroupsList from '../../ObjectsGroupsList';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import InstancesEditor from '../../InstancesEditor';
import InstancePropertiesEditor from '../../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../../InstancesEditor/InstancesList';
import LayersList from '../../LayersList';
import LayerRemoveDialog from '../../LayersList/LayerRemoveDialog';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import ObjectEditorDialog from '../../ObjectEditor/ObjectEditorDialog';
import ObjectsGroupEditorDialog from '../../ObjectsGroupEditor/ObjectsGroupEditorDialog';
import InstancesSelection from './InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import Toolbar from './Toolbar';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import Clipboard from '../../Utils/Clipboard';
import { passFullSize } from '../../UI/FullSizeMeasurer';
import { addScrollbars } from '../../InstancesEditor/ScrollbarContainer';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import EditorMosaic, { MosaicWindow } from '../../UI/EditorMosaic';
import EditorBar from '../../UI/EditorBar';
import InfoBar from '../../UI/Messages/InfoBar';
import ContextMenu from '../../UI/Menu/ContextMenu';
import {
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from '../../Utils/History';
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

export default class InstancesFullEditor extends Component {
  static defaultProps = {
    showObjectsList: true,
    setToolbar: () => {},
  };

  constructor(props) {
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

      editedObject: null,
      variablesEditedInstance: null,
      selectedObjectName: null,

      editedGroup: null,

      uiSettings: props.initialUiSettings,
      history: getHistoryInitialState(props.initialInstances),
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
        showPreviewButton={this.props.showPreviewButton}
        onPreview={this.props.onPreview}
        showObjectsList={this.props.showObjectsList}
        instancesSelection={this.instancesSelection}
        openObjectsList={this.openObjectsList}
        openObjectsGroupsList={this.openObjectsGroupsList}
        openProperties={this.openProperties}
        deleteSelection={this.deleteSelection}
        toggleInstancesList={this.toggleInstancesList}
        toggleLayersList={this.toggleLayersList}
        toggleWindowMask={this.toggleWindowMask}
        toggleGrid={this.toggleGrid}
        isGridShown={() => !!this.state.uiSettings.grid}
        openSetupGrid={this.openSetupGrid}
        setZoomFactor={this.setZoomFactor}
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

  componentWillReceiveProps(nextProps) {
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
    if (!this.editorMosaic.openEditor('objects-list')) {
      this.setState({
        showObjectsListInfoBar: true,
      });
    }
  };

  openProperties = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('properties')) {
      this.setState({
        showPropertiesInfoBar: true,
      });
    }
  };

  openObjectsGroupsList = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.openEditor('objects-groups-list');
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

  openSetupGrid = (open = true) => {
    this.setState({ setupGridOpen: open });
  };

  openSceneProperties = (open = true) => {
    this.setState({ scenePropertiesDialogOpen: open });
  };

  editInstanceVariables = instance => {
    this.setState({ variablesEditedInstance: instance });
  };

  editLayoutVariables = (open = true) => {
    this.setState({ layoutVariablesDialogOpen: open });
  };

  editObject = object => {
    this.setState({ editedObject: object });
  };

  editGroup = group => {
    this.setState({ editedGroup: group });
  };

  setUiSettings = uiSettings => {
    this.setState({
      uiSettings: {
        ...this.state.uiSettings,
        ...uiSettings,
      },
    });
  };

  undo = () => {
    this.setState(
      {
        history: undo(this.state.history, this.props.initialInstances),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        this.editor.forceRemount();
        this.updateToolbar();
      }
    );
  };

  redo = () => {
    this.setState(
      {
        history: redo(this.state.history, this.props.initialInstances),
      },
      () => {
        // /!\ Force the instances editor to destroy and mount again the
        // renderers to avoid keeping any references to existing instances
        this.editor.forceRemount();
        this.updateToolbar();
      }
    );
  };

  _onObjectSelected = selectedObjectName => {
    this.setState({
      selectedObjectName,
    });
  };

  _onAddInstance = (x, y, objectName = '') => {
    const newInstanceObjectName = objectName || this.state.selectedObjectName;
    if (!newInstanceObjectName) return;

    const instance = this.props.initialInstances.insertNewInitialInstance();
    instance.setObjectName(newInstanceObjectName);
    instance.setX(x);
    instance.setY(y);

    this.props.initialInstances.iterateOverInstances(this.zOrderFinder);
    instance.setZOrder(this.zOrderFinder.getHighestZOrder() + 1);
    this.setState(
      {
        selectedObjectName: null,
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this.updateToolbar()
    );
  };

  _onInstancesSelected = instances => {
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _onInstancesMoved = instances => {
    this.setState({
      history: saveToHistory(this.state.history, this.props.initialInstances),
    }, () => this.forceUpdatePropertiesEditor());
  };

  _onInstancesModified = instances => {
    this.forceUpdate();
    //TODO: Save for redo with debounce (and cancel on unmount)
  };

  _onSelectInstances = (instances, centerView = true) => {
    this.instancesSelection.clearSelection();
    instances.forEach(instance =>
      this.instancesSelection.selectInstance(instance)
    );

    if (centerView) {
      if (this.editor) this.editor.centerViewOn(instances);
    }
    this.forceUpdatePropertiesEditor();
    this.updateToolbar();
  };

  _onRemoveLayer = (layerName, done) => {
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
            this.editor.forceRemount();
            this.updateToolbar();
          }
        );
      },
    });
  };

  _onRenameLayer = (oldName, newName, done) => {
    this.props.initialInstances.moveInstancesToLayer(oldName, newName);
    done(true);
  };

  _onDeleteObject = (objectWithContext, done) => {
    const { object, global } = objectWithContext;
    const { project, layout } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      'Do you want to remove all references to this object in groups and events (actions and conditions using the object)?'
    );

    if (global) {
      gd.WholeProjectRefactorer.globalObjectRemoved(
        project,
        object.getName(),
        !!answer
      );
    } else {
      gd.WholeProjectRefactorer.objectRemovedInLayout(
        project,
        layout,
        object.getName(),
        !!answer
      );
    }
    done(true);
  };

  _onRenameObject = (objectWithContext, newName, done) => {
    const { object, global } = objectWithContext;
    const { project, layout } = this.props;

    if (global) {
      gd.WholeProjectRefactorer.globalObjectRenamed(
        project,
        object.getName(),
        newName
      );
    } else {
      gd.WholeProjectRefactorer.objectRenamedInLayout(
        project,
        layout,
        object.getName(),
        newName
      );
    }
    done(true);
  };

  _onDeleteGroup = (groupWithScope, done) => {
    //TODO
    done(true);
  };

  _onRenameGroup = (groupWithScope, newName, done) => {
    //TODO
    done(true);
  };

  deleteSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    selectedInstances.map(instance =>
      this.props.initialInstances.removeInstance(instance)
    );

    this.instancesSelection.clearSelection();
    this.editor.clearHighlightedInstance();

    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => {
        this.updateToolbar();
        this.forceUpdatePropertiesEditor();
      }
    );
  };

  setZoomFactor = zoomFactor => {
    if (this.editor) this.editor.setZoomFactor(zoomFactor);
  };

  zoomIn = () => {
    if (this.editor) this.editor.zoomBy(0.1);
  };

  zoomOut = () => {
    if (this.editor) this.editor.zoomBy(-0.1);
  };

  _onContextMenu = (x, y) => {
    this.contextMenu.open(x, y);
  };

  copySelection = ({ useLastCursorPosition } = {}) => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const position = useLastCursorPosition
      ? this.editor.getLastCursorPosition()
      : this.editor.getLastContextMenuPosition();
    Clipboard.set(INSTANCES_CLIPBOARD_KIND, {
      x: position[0],
      y: position[1],
      instances: serializedSelection,
    });
  };

  cutSelection = options => {
    this.copySelection(options);
    this.deleteSelection();
  };

  paste = ({ useLastCursorPosition } = {}) => {
    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
    if (!clipboardContent) return;

    const position = useLastCursorPosition
      ? this.editor.getLastCursorPosition()
      : this.editor.getLastContextMenuPosition();
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

  forceUpdateObjectsList = () => {
    if (this._objectsList) this._objectsList.forceUpdateList();
  };

  forceUpdatePropertiesEditor = () => {
    if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
  };

  render() {
    const {
      project,
      layout,
      initialInstances,
      resourceSources,
      onChooseResource,
    } = this.props;
    const selectedInstances = this.instancesSelection.getSelectedInstances();

    const editors = {
      properties: (
        <MosaicWindow title="Properties">
          <InstancePropertiesEditor
            project={project}
            layout={layout}
            instances={selectedInstances}
            onInstancesModified={this._onInstancesModified}
            editInstanceVariables={this.editInstanceVariables}
            ref={propertiesEditor =>
              (this._propertiesEditor = propertiesEditor)}
          />
        </MosaicWindow>
      ),
      'instances-editor': (
        <FullSizeInstancesEditor
          project={project}
          layout={layout}
          initialInstances={initialInstances}
          onAddInstance={this._onAddInstance}
          options={this.state.uiSettings}
          onChangeOptions={this.setUiSettings}
          instancesSelection={this.instancesSelection}
          onDeleteSelection={this.deleteSelection}
          onInstancesSelected={this._onInstancesSelected}
          onInstancesMoved={this._onInstancesMoved}
          onContextMenu={this._onContextMenu}
          onCopy={() => this.copySelection({ useLastCursorPosition: true })}
          onCut={() => this.cutSelection({ useLastCursorPosition: true })}
          onPaste={() => this.paste({ useLastCursorPosition: true })}
          onUndo={this.undo}
          onRedo={this.redo}
          onZoomOut={this.zoomOut}
          onZoomIn={this.zoomIn}
          wrappedEditorRef={editor => (this.editor = editor)}
        />
      ),
      'objects-list': (
        <MosaicWindow title="Objects">
          <ObjectsList
            getThumbnail={ObjectsRenderingService.getThumbnail.bind(
              ObjectsRenderingService
            )}
            project={project}
            objectsContainer={layout}
            selectedObjectName={this.state.selectedObjectName}
            onObjectSelected={this._onObjectSelected}
            onEditObject={this.props.onEditObject || this.editObject}
            onDeleteObject={this._onDeleteObject}
            onRenameObject={this._onRenameObject}
            ref={objectsList => (this._objectsList = objectsList)}
          />
        </MosaicWindow>
      ),
      'objects-groups-list': (
        <MosaicWindow title="Objects groups">
          <ObjectsGroupsList
            project={project}
            objectsContainer={layout}
            onEditGroup={this.editGroup}
            onDeleteGroup={this._onDeleteGroup}
            onRenameGroup={this._onRenameGroup}
          />
        </MosaicWindow>
      ),
    };

    return (
      <div style={styles.container}>
        <EditorMosaic
          editors={editors}
          ref={editorMosaic => (this.editorMosaic = editorMosaic)}
          initialEditorNames={
            this.props.showObjectsList
              ? ['properties', 'instances-editor', 'objects-list']
              : ['properties', 'instances-editor']
          }
        />
        <ObjectEditorDialog
          open={!!this.state.editedObject}
          object={this.state.editedObject}
          project={project}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          onCancel={() => this.editObject(null)}
          onApply={() => {
            this.editObject(null);
            this.forceUpdateObjectsList();
          }}
        />
        <ObjectsGroupEditorDialog
          open={!!this.state.editedGroup}
          group={this.state.editedGroup}
          layout={layout}
          project={project}
          onCancel={() => this.editGroup(null)}
          onApply={() => this.editGroup(null)}
        />
        <Drawer
          open={this.state.instancesListOpen}
          width={500}
          openSecondary={true}
          containerStyle={{ overflow: 'hidden' }}
        >
          <EditorBar
            title="Instances"
            iconElementLeft={
              <IconButton onClick={this.toggleInstancesList}>
                <NavigationClose />
              </IconButton>
            }
          />
          <InstancesList
            freezeUpdate={!this.state.instancesListOpen}
            instances={initialInstances}
            selectedInstances={selectedInstances}
            onSelectInstances={this._onSelectInstances}
          />
        </Drawer>
        <Drawer
          open={this.state.layersListOpen}
          width={400}
          openSecondary={true}
        >
          <EditorBar
            title="Layers"
            iconElementLeft={
              <IconButton onClick={this.toggleLayersList}>
                <NavigationClose />
              </IconButton>
            }
          />
          <LayersList
            freezeUpdate={!this.state.layersListOpen}
            onRemoveLayer={this._onRemoveLayer}
            onRenameLayer={this._onRenameLayer}
            layersContainer={layout}
          />
        </Drawer>
        <InfoBar
          message="Touch/click on the scene to add the object"
          show={!!this.state.selectedObjectName}
        />
        <InfoBar
          message="Objects panel is already opened: Use it to add and edit objects."
          show={!!this.state.showObjectsListInfoBar}
        />
        <InfoBar
          message="Properties panel is already opened"
          show={!!this.state.showPropertiesInfoBar}
        />
        <SetupGridDialog
          open={this.state.setupGridOpen}
          gridOptions={this.state.uiSettings}
          onCancel={() => this.openSetupGrid(false)}
          onApply={gridOptions => {
            this.setUiSettings(gridOptions);
            this.openSetupGrid(false);
          }}
        />
        <VariablesEditorDialog
          open={!!this.state.variablesEditedInstance}
          variablesContainer={
            this.state.variablesEditedInstance &&
            this.state.variablesEditedInstance.getVariables()
          }
          onCancel={() => this.editInstanceVariables(null)}
          onApply={() => this.editInstanceVariables(null)}
          emptyExplanationMessage="Instance variables will override the default values of the variables of the object."
        />
        <LayerRemoveDialog
          open={!!this.state.layerRemoveDialogOpen}
          layersContainer={layout}
          layerRemoved={this.state.layerRemoved}
          onClose={this.state.onCloseLayerRemoveDialog}
        />
        <ScenePropertiesDialog
          open={!!this.state.scenePropertiesDialogOpen}
          layout={layout}
          onClose={() => this.openSceneProperties(false)}
          onApply={() => this.openSceneProperties(false)}
          onEditVariables={() => this.editLayoutVariables(true)}
          onOpenMoreSettings={this.props.onOpenMoreSettings}
        />
        <VariablesEditorDialog
          open={!!this.state.layoutVariablesDialogOpen}
          variablesContainer={layout.getVariables()}
          onCancel={() => this.editLayoutVariables(false)}
          onApply={() => this.editLayoutVariables(false)}
          emptyExplanationMessage="Scene variables can be used to store any value or text during the game."
          emptyExplanationSecondMessage="For example, you can have a variable called Score representing the current score of the player."
        />
        <ContextMenu
          ref={contextMenu => (this.contextMenu = contextMenu)}
          buildMenuTemplate={() => [
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
          ]}
        />
      </div>
    );
  }
}
