import React, { Component } from 'react';
import IconMenu from 'material-ui/IconMenu';
import ReactDOM from 'react-dom';
import ElectronMenuImplementation from './ElectronMenuImplementation';
import MaterialUIMenuImplementation from './MaterialUIMenuImplementation';
import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

export default class GDIconMenu extends Component {
  constructor() {
    super();
    this.state = {
      children: undefined,
    };
    this.menuImplementation = electron
      ? new ElectronMenuImplementation()
      : new MaterialUIMenuImplementation({ onClose: () => {} });
  }

  open = event => {
    if (!this.iconMenu) return;

    const node = ReactDOM.findDOMNode(this.iconMenu);
    if (!node) return;

    this.setState({
      children: this.menuImplementation.buildFromTemplate(
        this.props.buildMenuTemplate()
      ),
    });
    this.menuImplementation.showMenu(node.getBoundingClientRect());

    this.iconMenu.open('unknown', event);
  };

  _onClick = event => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.iconMenu) return;

    const node = ReactDOM.findDOMNode(this.iconMenu);
    if (!node) return;

    this.setState({
      children: this.menuImplementation.buildFromTemplate(
        this.props.buildMenuTemplate()
      ),
    });
    this.menuImplementation.showMenu(node.getBoundingClientRect());
  };

  render() {
    const { buildMenuTemplate, ...iconMenuProps } = this.props; //eslint-disable-line

    // Use disableAutoFocus to avoid making TextField lose focus.
    // See material-ui bug: https://github.com/callemall/material-ui/issues/4387
    return (
      <IconMenu
        {...iconMenuProps}
        onClick={this._onClick}
        ref={iconMenu => (this.iconMenu = iconMenu)}
        desktop
        disableAutoFocus
        {...this.menuImplementation.getMenuProps()}
      >
        {this.state.children}
      </IconMenu>
    );
  }
}
