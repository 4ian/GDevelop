import React, { Component } from 'react';
import ObjectsList from '../../ObjectsList';
import FullSizeInstancesEditor from '../../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../../InstancesEditor/InstancesList';
import InstancesSelection from './InstancesSelection';
import LayersList from '../../LayersList';
import SetupGridDialog from './SetupGridDialog';
import Toolbar from './Toolbar';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import SmallDrawer from '../../UI/SmallDrawer';
import EditorBar from '../../UI/EditorBar';
import InfoBar from '../../UI/Messages/InfoBar';

const gd = global.gd;

const getHistoryInitialState = (instances) => {
  const serializedElement = new gd.SerializerElement();
  instances.serializeTo(serializedElement);
  const savedInstances = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return {
    undoHistory: [],
    current: savedInstances,
    redoHistory: [],
  };
};

const saveToHistory = (history, instances) => {
  const serializedElement = new gd.SerializerElement();
  instances.serializeTo(serializedElement);
  const savedInstances = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return {
    undoHistory: [...history.undoHistory, history.current],
    current: savedInstances,
    redoHistory: [],
  };
}

const undo = (history, instances) => {
  if (!history.undoHistory.length) {
    return history;
  }

  const newCurrent = history.undoHistory[history.undoHistory.length - 1];

  const serializedNewElement = gd.Serializer.fromJSObject(newCurrent);
  instances.unserializeFrom(serializedNewElement);
  serializedNewElement.delete();

  return {
    undoHistory: history.undoHistory.slice(0, -1),
    current: newCurrent,
    redoHistory: [...history.redoHistory, history.current],
  }
}

const redo = (history, instances) => {
  if (!history.redoHistory.length) {
    return history;
  }

  const newCurrent = history.redoHistory[history.redoHistory.length - 1];

  const serializedNewElement = gd.Serializer.fromJSObject(newCurrent);
  instances.unserializeFrom(serializedNewElement);
  serializedNewElement.delete();

  return {
    undoHistory: [...history.undoHistory, history.current],
    current: newCurrent,
    redoHistory: history.redoHistory.slice(0, -1),
  }
}

export default class InstancesFullEditor extends Component {
  constructor(props) {
    super(props);

    this.instancesSelection = new InstancesSelection();
    this.state = {
      objectsListOpen: false,
      instancesListOpen: false,
      setupGridOpen: false,
      layersListOpen: false,
      options: {
        grid: false,
        snap: false,
        gridWidth: 32,
        gridHeight: 32,
        gridOffsetX: 0,
        gridOffsetY: 0,
      },
      history: getHistoryInitialState(props.initialInstances),
    };
  }

  componentWillMount() {
    this._updateToolbar();
  }

  _updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        showPreviewButton={this.props.showPreviewButton}
        onPreview={this.onPreview}
        instancesSelection={this.instancesSelection}
        toggleObjectsList={this.toggleObjectsList}
        deleteSelection={this.deleteSelection}
        toggleInstancesList={this.toggleInstancesList}
        toggleLayersList={this.toggleLayersList}
        toggleGrid={this.toggleGrid}
        openSetupGrid={this.openSetupGrid}
        setZoomFactor={this.setZoomFactor}
        undo={this.undo}
        redo={this.redo}
      />
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project) {
      this.instancesSelection.clearSelection();
    }
  }

  toggleObjectsList = () => {
    this.setState({objectsListOpen: !this.state.objectsListOpen});
  }

  toggleInstancesList = () => {
    this.setState({instancesListOpen: !this.state.instancesListOpen});
  }

  toggleLayersList = () => {
    this.setState({layersListOpen: !this.state.layersListOpen});
  }

  toggleGrid = () => {
    this.setState({
      options: {
        ...this.state.options,
        grid: !this.state.options.grid,
        snap: !this.state.options.grid,
      }
    });
  }

  openSetupGrid = (open = true) => {
    this.setState({ setupGridOpen: open });
  }

  setOptions = (options) => {
    this.setState({
      options: {
        ...this.state.options,
        ...options,
      },
    });
  }

  undo = () => {
    this.setState({
      history: undo(this.state.history, this.props.initialInstances),
    });
  }

  redo = () => {
    this.setState({
      history: redo(this.state.history, this.props.initialInstances),
    });
  }

  _onObjectSelected = (selectedObjectName) => {
    this.setState({
      selectedObjectName,
    });
  }

  _onNewInstanceAdded = () => {
    this.setState({
      selectedObjectName: null,
      history: saveToHistory(this.state.history, this.props.initialInstances),
    });
  }

  _onInstancesSelected = (instances) => {
    this.forceUpdate();
    this._updateToolbar();
  }

  _onInstancesMoved = (instances) => {
    this.forceUpdate();
    //Save for redo
  }

  _onInstancesModified = (instances) => {
    this.forceUpdate();
    //Save for redo with debounce (and cancel on unmount)?????
  }

  _onSelectInstances = (instances, centerView = true) => {
    this.instancesSelection.clearSelection();
    instances.forEach(instance => this.instancesSelection.selectInstance(instance));

    if (centerView) {
      this.editor.centerViewOn(instances);
    }
    this.forceUpdate();
    this._updateToolbar();
  }

  deleteSelection = () => {
    this.editor.deleteSelection();
    this._updateToolbar();
    //Save for redo
  }

  setZoomFactor = (zoomFactor) => {
    this.editor.setZoomFactor(zoomFactor);
  }

  render() {
    const { project, layout, initialInstances } = this.props;
    const selectedInstances = this.instancesSelection.getSelectedInstances();

    return (
      <div style={{display: 'flex', flex: 1, position: 'relative'}}>
        <SmallDrawer
          open={!!selectedInstances.length}
        >
          <InstancePropertiesEditor
            project={project}
            layout={layout}
            instances={selectedInstances}
            onInstancesModified={this._onInstancesModified}
          />
        </SmallDrawer>
        <FullSizeInstancesEditor
          project={project}
          layout={layout}
          initialInstances={initialInstances}
          selectedObjectName={this.state.selectedObjectName}
          options={this.state.options}
          instancesSelection={this.instancesSelection}
          onNewInstanceAdded={this._onNewInstanceAdded}
          onInstancesSelected={this._onInstancesSelected}
          onInstancesMoved={this._onInstancesMoved}
          editorRef={(editor) => this.editor = editor}
        />
        <Drawer open={this.state.objectsListOpen} openSecondary={true}>
          <EditorBar
            title="Objects"
            iconElementLeft={<IconButton onClick={this.toggleObjectsList}><NavigationClose /></IconButton>}
          />
          <ObjectsList
            freezeUpdate={!this.state.objectsListOpen}
            project={project}
            objectsContainer={layout}
            onObjectSelected={this._onObjectSelected}
          />
        </Drawer>
        <Drawer open={this.state.instancesListOpen} width={500} openSecondary={true}>
          <EditorBar
            title="Instances"
            iconElementLeft={<IconButton onClick={this.toggleInstancesList}><NavigationClose /></IconButton>}
          />
          <InstancesList
            freezeUpdate={!this.state.instancesListOpen}
            instances={initialInstances}
            selectedInstances={selectedInstances}
            onSelectInstances={this._onSelectInstances}
          />
        </Drawer>
        <Drawer open={this.state.layersListOpen} width={400} openSecondary={true}>
          <EditorBar
            title="Layers"
            iconElementLeft={<IconButton onClick={this.toggleLayersList}><NavigationClose /></IconButton>}
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
          options={this.state.options}
          onCancel={() => this.openSetupGrid(false)}
          onApply={(options) => {
            this.setOptions(options);
            this.openSetupGrid(false);
          }}
        />
      </div>
    )
  }
}
