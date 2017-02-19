import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';

import {ToolbarGroup} from 'material-ui/Toolbar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import EditorBar from '../UI/EditorBar';
import ToolbarIcon from '../UI/ToolbarIcon';
import InfoBar from '../UI/Messages/InfoBar';

export default class InstancesFullEditor extends Component {
  constructor() {
    super();
    this.state = {
      objectsListOpen: false,
      options: {
        grid: false,
        snap: false,
        gridWidth: 32,
        gridHeight: 64+32,
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
        <IconMenu
          iconButtonElement={<ToolbarIcon src="res/ribbon_default/grid32.png" />}
        >
          <MenuItem primaryText="Show grid" onTouchTap={() => this.toggleGrid()} />
          <MenuItem primaryText="Setup grid" onTouchTap={() => {/*TODO*/}} />
        </IconMenu>
        <IconMenu
          iconButtonElement={<ToolbarIcon src="res/ribbon_default/zoom32.png" />}
        >
          <MenuItem primaryText="5%" onTouchTap={() => this.setZoomFactor(0.05)} />
          <MenuItem primaryText="10%" onTouchTap={() => this.setZoomFactor(0.10)} />
          <MenuItem primaryText="25%" onTouchTap={() => this.setZoomFactor(0.25)} />
          <MenuItem primaryText="50%" onTouchTap={() => this.setZoomFactor(0.50)} />
          <MenuItem primaryText="100%" onTouchTap={() => this.setZoomFactor(1.00)} />
          <MenuItem primaryText="150%" onTouchTap={() => this.setZoomFactor(1.50)} />
          <MenuItem primaryText="200%" onTouchTap={() => this.setZoomFactor(2.00)} />
        </IconMenu>
      </ToolbarGroup>
    );
  }

  toggleObjectsList = () => {
    this.setState({objectsListOpen: !this.state.objectsListOpen});
  }

  toggleGrid = () => {
    this.setState({
      options: {
        ...this.state.options,
        grid: !this.state.options.grid,
        snap: !this.state.options.snap,
      }
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
        <div style={{
          width: 200,
          overflowY: 'scroll',
        }}>
          <InstancePropertiesEditor instances={this.state.selectedInstances}/>
        </div>
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
        <InfoBar
          message="Touch/click on the scene to add the object"
          show={!!this.state.selectedObjectName}
        />
      </div>
    )
  }
}
