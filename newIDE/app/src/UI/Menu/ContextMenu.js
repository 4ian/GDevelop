// TODO: this needs to be flow-typed
import React from 'react';
import { I18n } from '@lingui/react';
import Menu from '@material-ui/core/Menu';
import Fade from '@material-ui/core/Fade';
import ElectronMenuImplementation from './ElectronMenuImplementation';
import MaterialUIMenuImplementation from './MaterialUIMenuImplementation';
import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

class MaterialUIContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorX: 0,
      anchorY: 0,
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
    return this.state.open ? (
      <I18n>
        {({ i18n }) => (
          <Menu
            open={this.state.open}
            anchorPosition={{
              left: this.state.anchorX,
              top: this.state.anchorY,
            }}
            anchorReference={'anchorPosition'}
            onClose={this._onClose}
            TransitionComponent={Fade}
            {...this.menuImplementation.getMenuProps()}
          >
            {this.menuImplementation.buildFromTemplate(
              this.props.buildMenuTemplate(i18n)
            )}
          </Menu>
        )}
      </I18n>
    ) : // Don't render the menu when it's not opened, as `buildMenuTemplate` could
    // be running logic to compute some labels or `enabled` flag values - and might
    // not be prepared to do that when the menu is not opened.
    null;
  }
}

class ElectronContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.menuImplementation = new ElectronMenuImplementation();
  }

  open = (x, y) => {
    this.menuImplementation.buildFromTemplate(
      this.props.buildMenuTemplate(this.props.i18n)
    );
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

const ElectronContextMenuWrapper = React.forwardRef((props, ref) => {
  const electronContextMenu = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    open: (x, y) => {
      if (electronContextMenu.current) electronContextMenu.current.open(x, y);
    },
  }));

  return (
    <I18n>
      {({ i18n }) => (
        <ElectronContextMenu {...props} i18n={i18n} ref={electronContextMenu} />
      )}
    </I18n>
  );
});

export default (electron ? ElectronContextMenuWrapper : MaterialUIContextMenu);
