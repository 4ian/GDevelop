import React, { Component } from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import ReactDOM from 'react-dom';
import optionalRequire from '../../Utils/OptionalRequire.js';

const electron = optionalRequire('electron');

class MaterialUIMenuImplementation {
  buildFromTemplate(template) {
    return template.map(item => {
      if (item.type === 'separator') {
        return <Divider />;
      }

      return (
        <MenuItem
          key={item.label}
          primaryText={item.label}
          onTouchTap={() => item.click()}
        />
      );
    });
  }

  showMenu() {
    // Automatically done by IconMenu
  }

  getMenuProps() {
    return {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
    };
  }
}

class ElectronMenuImplementation {
  buildFromTemplate(template) {
    if (!electron) return;

    const { Menu } = electron.remote;
    this.menu = Menu.buildFromTemplate(template);

    return undefined;
  }

  showMenu(dimensions) {
    if (!electron) return;
    console.log(dimensions);
    if (this.menu) {
      setTimeout(() =>
        this.menu.popup(
          Math.round(dimensions.left),
          Math.round(dimensions.top + dimensions.height)
        ));
    }
  }

  getMenuProps() {
    return {
      open: false,
    };
  }
}

export default class GDIconMenu extends Component {
  constructor() {
    super();
    this.state = {
      children: undefined,
    };
    this.menuImplementation = electron
      ? new ElectronMenuImplementation()
      : new MaterialUIMenuImplementation();
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

  _onTouchTap = () => {
    if (!this.iconMenu) return;

    const node = ReactDOM.findDOMNode(this.iconMenu);
    if (!node) return;

    this.menuImplementation.showMenu(node.getBoundingClientRect());
  };

  render() {
    return (
      <IconMenu
        {...this.props}
        onTouchTap={this._onTouchTap}
        ref={iconMenu => this.iconMenu = iconMenu}
        {...this.menuImplementation.getMenuProps()}
      >
        {this.state.children}
      </IconMenu>
    );
  }
}
