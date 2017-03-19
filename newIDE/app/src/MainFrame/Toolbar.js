import React, { Component } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconMenu from '../UI/Menu/IconMenu';
import Window from '../Utils/Window';

export default class MainFrameToolbar extends Component {
  constructor() {
    super();
    this.isDev = Window.isDev();

    this.state = {
      editorToolbar: null,
    };
  }

  setEditorToolbar(editorToolbar) {
    this.setState({
      editorToolbar,
    });
  }

  render() {
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <ToolbarIcon
            onClick={this.props.toggleProjectManager}
            src="res/ribbon_default/projectManager32.png"
          />
          {this.isDev &&
            <IconMenu
              iconButtonElement={
                <ToolbarIcon src="res/ribbon_default/bug32.png" />
              }
              menuTemplate={[
                {
                  label: 'Load builtin game',
                  click: () => this.props.loadBuiltinGame(),
                },
                {
                  label: 'Request update from external editor',
                  click: () => this.props.requestUpdate(),
                },
              ]}
            />}
          <ToolbarSeparator />
        </ToolbarGroup>
        {this.state.editorToolbar || <ToolbarGroup />}
      </Toolbar>
    );
  }
}
