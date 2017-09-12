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
      : new MaterialUIMenuImplementation({ onClose: () => {}});
  }

  componentWillMount() {
    this.setState({
      children: this.menuImplementation.buildFromTemplate(
        this.props.menuTemplate
      ),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.menuTemplate !== nextProps.menuTemplate) {
      this.setState({
        children: this.menuImplementation.buildFromTemplate(
          nextProps.menuTemplate
        ),
      });
    }
  }

  open = (event) => {
    if (!this.iconMenu) return;

    const node = ReactDOM.findDOMNode(this.iconMenu);
    if (!node) return;

    this.menuImplementation.showMenu(node.getBoundingClientRect());
    this.iconMenu.open('unkown', event);
  }

  _onTouchTap = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.iconMenu) return;

    const node = ReactDOM.findDOMNode(this.iconMenu);
    if (!node) return;

    this.menuImplementation.showMenu(node.getBoundingClientRect());
  };

  render() {
    const {menuTemplate, ...iconMenuProps} = this.props; //eslint-disable-line

    return (
      <IconMenu
        {...iconMenuProps}
        onTouchTap={this._onTouchTap}
        ref={iconMenu => this.iconMenu = iconMenu}
        desktop
        {...this.menuImplementation.getMenuProps()}
      >
        {this.state.children}
      </IconMenu>
    );
  }
}
