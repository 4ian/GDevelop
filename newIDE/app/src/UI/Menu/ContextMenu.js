import React from 'react';
import Menu from 'material-ui/Menu';
import Popover from 'material-ui/Popover';
import ElectronMenuImplementation from './ElectronMenuImplementation';
import MaterialUIMenuImplementation from './MaterialUIMenuImplementation';
import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

class MaterialUIContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.menuImplementation = new MaterialUIMenuImplementation({
      onClose: this._onClose,
    });
  }

  open = (x, y) => {
    this.setState(
      {
        anchorX: x,
        anchorY: y,
      },
      () => {
        this.setState({
          open: true,
        });
      }
    );
  };

  _onClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div>
        <div
          ref={element => (this.anchorEl = element)}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            left: this.state.anchorX,
            top: this.state.anchorY,
          }}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.anchorEl}
          onRequestClose={this._onClose}
          {...this.menuImplementation.getMenuProps()}
        >
          <Menu desktop width={256}>
            {this.menuImplementation.buildFromTemplate(
              this.props.buildMenuTemplate()
            )}
          </Menu>
        </Popover>
      </div>
    );
  }
}

class ElectronContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.menuImplementation = new ElectronMenuImplementation();
  }

  open = (x, y) => {
    this.menuImplementation.buildFromTemplate(this.props.buildMenuTemplate());
    this.menuImplementation.showMenu({
      left: x || 0,
      top: y || 0,
      width: 0,
      height: 0,
    });
  };

  render() {
    return null;
  }
}

export default (electron ? ElectronContextMenu : MaterialUIContextMenu);
