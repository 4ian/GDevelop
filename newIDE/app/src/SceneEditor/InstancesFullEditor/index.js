import React, { Component } from 'react';
import ObjectsList from '../../ObjectsList';
import FullSizeInstancesEditor
  from '../../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor
  from '../../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../../InstancesEditor/InstancesList';
import LayersList from '../../LayersList';
import LayerRemoveDialog from '../../LayersList/LayerRemoveDialog';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import InstancesSelection from './InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import ScenePropertiesDialog from './ScenePropertiesDialog';
import Toolbar from './Toolbar';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import Clipboard from '../../Utils/Clipboard';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import EditorMosaic from '../../UI/EditorMosaic';
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
} from './History';
const gd = global.gd;

export default class InstancesFullEditor extends Component {
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

      variablesEditedInstance: null,
      selectedObjectName: null,

      uiSettings: props.initialUiSettings,
      history: getHistoryInitialState(props.initialInstances),
    };
  }

  componentWillMount() {
    this.zOrderFinder = new gd.HighestZOrderFinder();
  }

  componentDidMount() {
    this._updateToolbar();
  }

  componentWillUnmount() {
    this.keyboardShortcuts.unmount();
  }

  getUiSettings() {
    return this.state.uiSettings;
  }

  _updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        showPreviewButton={this.props.showPreviewButton}
        onPreview={this.props.onPreview}
        instancesSelection={this.instancesSelection}
        toggleObjectsList={this.toggleObjectsList}
        deleteSelection={this.deleteSelection}
        toggleInstancesList={this.toggleInstancesList}
        toggleLayersList={this.toggleLayersList}
        toggleWindowMask={this.toggleWindowMask}
        toggleGrid={this.toggleGrid}
        openSetupGrid={this.openSetupGrid}
        setZoomFactor={this.setZoomFactor}
        canUndo={canUndo(this.state.history)}
        canRedo={canRedo(this.state.history)}
        undo={this.undo}
        redo={this.redo}
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

  toggleObjectsList = () => {
    this.setState({ objectsListOpen: !this.state.objectsListOpen });
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
        this._updateToolbar();
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
        this._updateToolbar();
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
      () => this._updateToolbar()
    );
  };

  _onInstancesSelected = instances => {
    this.forceUpdate();
    this._updateToolbar();
  };

  _onInstancesMoved = instances => {
    this.setState({
      history: saveToHistory(this.state.history, this.props.initialInstances),
    });
  };

  _onInstancesModified = instances => {
    this.forceUpdate();
    //TODO: Save for redo with debounce (and cancel on unmount)
  };

  _onSelectInstances = (instances, centerView = true) => {
    this.instancesSelection.clearSelection();
    instances.forEach(instance =>
      this.instancesSelection.selectInstance(instance));

    if (centerView) {
      this.editor.centerViewOn(instances);
    }
    this.forceUpdate();
    this._updateToolbar();
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
            this._updateToolbar();
          }
        );
      },
    });
  };

  _onRenameLayer = (oldName, newName, done) => {
    this.props.initialInstances.moveInstancesToLayer(oldName, newName);
    done(true);
  };

  deleteSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    selectedInstances.map(instance =>
      this.props.initialInstances.removeInstance(instance));

    this.instancesSelection.clearSelection();
    this.editor.clearHighlightedInstance();

    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.initialInstances),
      },
      () => this._updateToolbar()
    );
  };

  setZoomFactor = zoomFactor => {
    this.editor.setZoomFactor(zoomFactor);
  };

  _onContextMenu = (x, y) => {
    this.contextMenu.open(x, y);
  };

  copySelection = () => {
    const serializedSelection = this.instancesSelection
      .getSelectedInstances()
      .map(instance => serializeToJSObject(instance));

    const position = this.editor.getLastContextMenuPosition();
    Clipboard.set('instances', {
      x: position[0],
      y: position[1],
      instances: serializedSelection,
    });
  };

  cutSelection = () => {
    this.copySelection();
    this.deleteSelection();
  };

  paste = () => {
    const clipboardContent = Clipboard.get('instances');
    if (!clipboardContent) return;

    const position = this.editor.getLastContextMenuPosition();
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

  render() {
    const { project, layout, initialInstances } = this.props;
    const selectedInstances = this.instancesSelection.getSelectedInstances();

    const editors = {
      properties: (
        <InstancePropertiesEditor
          project={project}
          layout={layout}
          instances={selectedInstances}
          onInstancesModified={this._onInstancesModified}
          editInstanceVariables={this.editInstanceVariables}
        />
      ),
      'instances-editor': (
        <FullSizeInstancesEditor
          project={project}
          layout={layout}
          initialInstances={initialInstances}
          onAddInstance={this._onAddInstance}
          options={this.state.uiSettings}
          instancesSelection={this.instancesSelection}
          onDeleteSelection={this.deleteSelection}
          onInstancesSelected={this._onInstancesSelected}
          onInstancesMoved={this._onInstancesMoved}
          onContextMenu={this._onContextMenu}
          editorRef={editor => this.editor = editor}
        />
      ),
    };

    return (
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <EditorMosaic
          editors={editors}
          initialEditorNames={['properties', 'instances-editor']}
        />
        <Drawer
          open={this.state.objectsListOpen}
          openSecondary={true}
          containerStyle={{ overflow: 'hidden' }}
        >
          <EditorBar
            title="Objects"
            iconElementLeft={
              <IconButton onClick={this.toggleObjectsList}>
                <NavigationClose />
              </IconButton>
            }
          />
          <ObjectsList
            freezeUpdate={!this.state.objectsListOpen}
            project={project}
            objectsContainer={layout}
            onObjectSelected={this._onObjectSelected}
            onEditObject={this.props.onEditObject}
          />
        </Drawer>
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
        />
        <ContextMenu
          ref={contextMenu => this.contextMenu = contextMenu}
          menuTemplate={[
            {
              label: 'Scene properties',
              click: () => this.openSceneProperties(true),
            },
            { type: 'separator' },
            {
              label: 'Copy',
              click: () => this.copySelection(),
            },
            {
              label: 'Cut',
              click: () => this.cutSelection(),
            },
            {
              label: 'Paste',
              click: () => this.paste(),
            },
          ]}
        />
      </div>
    );
  }
}
