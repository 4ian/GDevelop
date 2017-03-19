import React, { Component } from 'react';
import ObjectsList from '../../ObjectsList';
import FullSizeInstancesEditor
  from '../../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor
  from '../../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../../InstancesEditor/InstancesList';
import LayersList from '../../LayersList';
import VariablesEditorDialog from '../../VariablesList/VariablesEditorDialog';
import InstancesSelection from './InstancesSelection';
import SetupGridDialog from './SetupGridDialog';
import Toolbar from './Toolbar';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import SmallDrawer from '../../UI/SmallDrawer';
import EditorBar from '../../UI/EditorBar';
import InfoBar from '../../UI/Messages/InfoBar';
import {
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from './History';

export default class InstancesFullEditor extends Component {
  constructor(props) {
    super(props);

    this.instancesSelection = new InstancesSelection();
    this.state = {
      objectsListOpen: false,
      instancesListOpen: false,
      setupGridOpen: false,
      layersListOpen: false,
      variablesEditedInstance: null,
      uiSettings: props.initialUiSettings,
      history: getHistoryInitialState(props.initialInstances),
    };
  }

  componentDidMount() {
    this._updateToolbar();
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

  _onNewInstanceAdded = () => {
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
    this.forceUpdate();
    //Save for redo
  };

  _onInstancesModified = instances => {
    this.forceUpdate();
    //Save for redo with debounce (and cancel on unmount)?????
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

  deleteSelection = () => {
    this.editor.deleteSelection();
    this._updateToolbar();
    //Save for redo
  };

  setZoomFactor = zoomFactor => {
    this.editor.setZoomFactor(zoomFactor);
  };

  render() {
    const { project, layout, initialInstances } = this.props;
    const selectedInstances = this.instancesSelection.getSelectedInstances();

    return (
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SmallDrawer open={!!selectedInstances.length}>
          <InstancePropertiesEditor
            project={project}
            layout={layout}
            instances={selectedInstances}
            onInstancesModified={this._onInstancesModified}
            editInstanceVariables={this.editInstanceVariables}
          />
        </SmallDrawer>
        <FullSizeInstancesEditor
          project={project}
          layout={layout}
          initialInstances={initialInstances}
          selectedObjectName={this.state.selectedObjectName}
          options={this.state.uiSettings /*TODO*/}
          instancesSelection={this.instancesSelection}
          onNewInstanceAdded={this._onNewInstanceAdded}
          onInstancesSelected={this._onInstancesSelected}
          onInstancesMoved={this._onInstancesMoved}
          editorRef={editor => this.editor = editor}
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
      </div>
    );
  }
}
