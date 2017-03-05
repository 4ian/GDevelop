import React, {Component} from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Measure from 'react-measure';
import optionalRequire from '../../Utils/OptionalRequire.js';

const electron = optionalRequire('electron');

class MaterialUIMenuImplementation {
  buildFromTemplate(template) {
    return template.map((item) => {
      if (item.type === 'separator') {
        return <Divider />;
      }

      return (<MenuItem
        key={item.label}
        primaryText={item.label}
        onTouchTap={() => item.click()}
      />);
    })
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
    }
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
    console.log(dimensions)
    if (this.menu) {
      setTimeout(
        () => this.menu.popup(dimensions.left, dimensions.top + dimensions.height)
      );
    }
  }

  getMenuProps() {
    return {
      open: false,
    }
  }
}

export default class GDIconMenu extends Component {
  constructor() {
    super();
    this.state = {
      children: undefined,
    };
    this.menuImplementation = electron ?
      new ElectronMenuImplementation() :
      new MaterialUIMenuImplementation() ;
  }

  componentWillMount() {
    this.setState({
      children: this.menuImplementation.buildFromTemplate(this.props.menuTemplate),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.menuTemplate !== nextProps.menuTemplate) {
      this.setState({
        children: this.menuImplementation.buildFromTemplate(nextProps.menuTemplate),
      });
    }
  }

  _onTouchTap(dimensions) {
    this.menuImplementation.showMenu(dimensions);
  }

  render() {
    return (
      <Measure>
        { dimensions =>
          <IconMenu
            {...this.props}
            onTouchTap={this._onTouchTap.bind(this, dimensions)}
            {...this.menuImplementation.getMenuProps()}
          >
            {this.state.children}
          </IconMenu>
        }
      </Measure>
    )
  }
}
