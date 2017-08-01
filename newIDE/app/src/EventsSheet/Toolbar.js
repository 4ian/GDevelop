import React, { Component } from 'react';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import IconMenu from '../UI/Menu/IconMenu';

export default class Toolbar extends Component {
  render() {
    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={this.props.onAddStandardEvent}
          src="res/ribbon_default/eventadd32.png"
        />
        <ToolbarIcon
          onClick={this.props.onAddSubEvent}
          src="res/ribbon_default/subeventadd32.png"
        />
        <ToolbarIcon
          onClick={this.props.onAddCommentEvent}
          src="res/ribbon_default/commentaireadd32.png"
        />
        <IconMenu
          iconButtonElement={
            <ToolbarIcon src="res/ribbon_default/add32.png" />
          }
          menuTemplate={[
            { label: 'TODO', click: () => {/*TODO*/} },
          ]}
        />
        <ToolbarSeparator/>
        <ToolbarIcon
          onClick={() => {/*TODO*/}}
          src="res/ribbon_default/deleteselected32.png"
        />
        <ToolbarIcon
          onClick={this.props.undo}
          src="res/ribbon_default/undo32.png"
          disabled={!this.props.canUndo || true /*TODO*/}
        />
        <ToolbarIcon
          onClick={this.props.redo}
          src="res/ribbon_default/redo32.png"
          disabled={!this.props.canRedo || true /*TODO*/}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={() => {/*TODO*/}}
          src="res/ribbon_default/search32.png"
        />
      </ToolbarGroup>
    );
  }
}
