import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import InstancesList from '../InstancesEditor/InstancesList';
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
    this.state = {
      objectsListOpen: false,
      instancesListOpen: false,
      setupGridOpen: false,
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

  toggleObjectsList = () => {
    this.setState({objectsListOpen: !this.state.objectsListOpen});
  }

  toggleInstancesList = () => {
    this.setState({instancesListOpen: !this.state.instancesListOpen});
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
    this.setState({
      selectedInstances: instances,
    });
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
            instances={this.state.selectedInstances}
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
            onNewInstanceAdded={this._onNewInstanceAdded}
            onInstancesSelected={this._onInstancesSelected}
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
            title="Instances list"
            iconElementLeft={<IconButton onClick={this.toggleInstancesList}><NavigationClose /></IconButton>}
          />
          <InstancesList
            freezeUpdate={!this.state.instancesListOpen}
            instances={initialInstances}
            selectedInstances={this.state.selectedInstances}
            onSelection={() => {/*TODO: Refactor selection outside of InstancesEditorContainer and allow instances list to be used to select instances*/}}
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
