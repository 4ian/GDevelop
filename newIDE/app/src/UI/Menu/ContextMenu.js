// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type MenuItemTemplate } from './Menu.flow';
import Menu from '@material-ui/core/Menu';
import Fade from '@material-ui/core/Fade';
import ElectronMenuImplementation from './ElectronMenuImplementation';
import MaterialUIMenuImplementation from './MaterialUIMenuImplementation';
import optionalRequire from '../../Utils/OptionalRequire';
import useForceUpdate from '../../Utils/UseForceUpdate';
const electron = optionalRequire('electron');

export type ContextMenuInterface = {|
  open: (x: number, y: number, options: any) => void,
|};

type ContextMenuProps = {|
  buildMenuTemplate: (i18n: I18nType, options: any) => Array<MenuItemTemplate>,
|};

const MaterialUIContextMenu = React.forwardRef<
  ContextMenuProps,
  ContextMenuInterface
>((props, ref) => {
  const [anchorPosition, setAnchorPosition] = React.useState<Array<number>>([
    0,
    0,
  ]);
  const [openMenu, setOpenMenu] = React.useState<boolean>(false);
  const [buildOptions, setBuildOptions] = React.useState<any>({});
  const forceUpdate = useForceUpdate();

  const menuImplementation = new MaterialUIMenuImplementation({
    onClose: () => setOpenMenu(false),
  });

  const open = (x, y, options) => {
    setAnchorPosition([x, y]);
    setBuildOptions(options);
    setOpenMenu(true);
  };

  React.useImperativeHandle(ref, () => ({
    open,
  }));

  return openMenu ? (
    <I18n>
      {({ i18n }) => (
        <Menu
          open
          anchorPosition={{
            left: anchorPosition[0],
            top: anchorPosition[1],
          }}
          anchorReference={'anchorPosition'}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              // Prevent any side effect of a backdrop click that should only
              // close the context menu.
              // When used in the ElementWithMenu component, there are cases where
              // the event propagates to the element on which the menu is set up and
              // then the event bubbles up, triggering click events on its way up.
              event.stopPropagation();
            }
            setOpenMenu(false);
          }}
          TransitionComponent={Fade}
          {...menuImplementation.getMenuProps()}
        >
          {menuImplementation.buildFromTemplate(
            props.buildMenuTemplate(i18n, buildOptions),
            forceUpdate
          )}
        </Menu>
      )}
    </I18n>
  ) : // Don't render the menu when it's not opened, as `buildMenuTemplate` could
  // be running logic to compute some labels or `enabled` flag values - and might
  // not be prepared to do that when the menu is not opened.
  null;
});

type ElectronContextMenuProps = {|
  ...ContextMenuProps,
  i18n: I18nType,
|};

const ElectronContextMenu = React.forwardRef<
  ElectronContextMenuProps,
  ContextMenuInterface
>((props, ref) => {
  const menuImplementation = new ElectronMenuImplementation();

  const open = (x, y, options) => {
    menuImplementation.buildFromTemplate(
      props.buildMenuTemplate(props.i18n, options)
    );
    menuImplementation.showMenu({
      left: x || 0,
      top: y || 0,
      width: 0,
      height: 0,
    });
  };

  React.useImperativeHandle(ref, () => ({
    open,
  }));

  return null;
});

const ElectronContextMenuWrapper = React.forwardRef<
  ContextMenuProps,
  ContextMenuInterface
>((props, ref) => {
  const electronContextMenu = React.useRef<?ContextMenuInterface>(null);
  React.useImperativeHandle(ref, () => ({
    open: (x, y, options) => {
      if (electronContextMenu.current)
        electronContextMenu.current.open(x, y, options);
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
