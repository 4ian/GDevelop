import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../InstancesEditor/InstancesList';
import InstancesSelection from './InstancesSelection';
import LayersList from '../LayersList';
import SetupGridDialog from './SetupGridDialog';

import {ToolbarGroup} from 'material-ui/Toolbar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconMenu from '../UI/Menu/IconMenu';
import Paper from 'material-ui/Paper';
import EditorBar from '../UI/EditorBar';
import ToolbarIcon from '../UI/ToolbarIcon';
import InfoBar from '../UI/Messages/InfoBar';

export default class InstancesFullEditor extends Component {
  constructor() {
    super();

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
      }
    };
  }

  componentWillMount() {
    this.props.setToolbar(
      <ToolbarGroup>
        <ToolbarIcon
          onClick={this.toggleObjectsList}
          src="res/ribbon_default/add32.png"
        />
        <ToolbarIcon
          onClick={this._deleteSelection}
          src="res/ribbon_default/deleteselected32.png"
        />
        <ToolbarIcon
          onClick={this.toggleInstancesList}
          src="res/ribbon_default/ObjectsPositionsList32.png"
        />
        <ToolbarIcon
          onClick={this.toggleLayersList}
          src="res/ribbon_default/layers32.png"
        />
        <IconMenu
          iconButtonElement={<ToolbarIcon src="res/ribbon_default/grid32.png" />}
          menuTemplate={[{
            label: "Show grid",
            click: () => this.toggleGrid(),
          }, {
            label: "Setup grid",
            click: () => this.openSetupGrid(),
          }]}
        >
        </IconMenu>
        <IconMenu
          iconButtonElement={<ToolbarIcon src="res/ribbon_default/zoom32.png" />}
          menuTemplate={[
            { label: "5%", click: () => this.setZoomFactor(0.05)},
            { label: "10%", click: () => this.setZoomFactor(0.10)},
            { label: "25%", click: () => this.setZoomFactor(0.25)},
            { label: "50%", click: () => this.setZoomFactor(0.50)},
            { label: "100%", click: () => this.setZoomFactor(1.00)},
            { label: "150%", click: () => this.setZoomFactor(1.50)},
            { label: "200%", click: () => this.setZoomFactor(2.00)},
          ]}
        >
        </IconMenu>
      </ToolbarGroup>
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

  _onObjectSelected = (selectedObjectName) => {
    this.setState({
      selectedObjectName,
    });
  }

  _onNewInstanceAdded = () => {
    this.setState({
      selectedObjectName: null
    });
  }

  _onInstancesSelected = (instances) => {
    this.forceUpdate();
  }

  _onInstancesMoved = (instances) => {
    this.forceUpdate();
  }

  _onInstancesModified = (instances) => {
    this.forceUpdate();
  }

  _onSelectInstances = (instances, centerView = true) => {
    this.instancesSelection.clearSelection();
    instances.forEach(instance => this.instancesSelection.selectInstance(instance));

    if (centerView) {
      this.editor.centerViewOn(instances);
    }
    this.forceUpdate();
  }

  _deleteSelection = () => {
    this.editor.deleteSelection();
  }

  setZoomFactor = (zoomFactor) => {
    this.editor.setZoomFactor(zoomFactor);
  }

  render() {
    const { project, layout, initialInstances } = this.props;

    return (
      <div style={{display: 'flex', flex: 1}}>
        <Paper
          style={{width: 200, zIndex: 1, display: 'flex'}}
          zDepth={2}
        >
          <InstancePropertiesEditor
            project={project}
            layout={layout}
            instances={this.instancesSelection.getSelectedInstances()}
            onInstancesModified={this._onInstancesModified}
          />
        </Paper>
        <div style={{
          flex: 1,
          display: 'flex',
        }}>
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
        </div>
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
            selectedInstances={this.instancesSelection.getSelectedInstances()}
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
