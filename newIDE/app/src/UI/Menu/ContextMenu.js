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
import { Drawer } from '@material-ui/core';
import { isMobile } from '../../Utils/Platform';
const electron = optionalRequire('electron');

export type ContextMenuInterface = {|
  open: (x: number, y: number, options: any) => void,
|};

type ContextMenuWrapperProps = {|
  buildMenuTemplate: (i18n: I18nType, options: any) => Array<MenuItemTemplate>,
|};

type ContextMenuProps = {|
  ...ContextMenuWrapperProps,
  i18n: I18nType,
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

  if (!openMenu) {
    // Don't render the menu when it's not opened, as `buildMenuTemplate` could
    // be running logic to compute some labels or `enabled` flag values - and might
    // not be prepared to do that when the menu is not opened.
    return null;
  }

  if (isMobile()) {
    const menuTemplate = props.buildMenuTemplate(props.i18n, buildOptions);
    if (!menuTemplate.length) {
      setOpenMenu(false);
      return null;
    }

    return (
      <Drawer
        anchor={'bottom'}
        open={true}
        onClose={() => setOpenMenu(false)}
        transitionDuration={200}
        PaperProps={{
          style: {
            animation: 'swipe-up-ending 0.2s ease-out',
            paddingTop: 4,
            paddingBottom: 18,
            maxWidth: 600,
            margin: 'auto',
            maxHeight: '80vh',
          },
        }}
      >
        {menuImplementation.buildFromTemplate(menuTemplate, forceUpdate)}
      </Drawer>
    );
  }

  return (
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
        props.buildMenuTemplate(props.i18n, buildOptions),
        forceUpdate
      )}
    </Menu>
  );
});

const ElectronContextMenu = React.forwardRef<
  ContextMenuProps,
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

const ContextMenu = electron ? ElectronContextMenu : MaterialUIContextMenu;

export default React.forwardRef<ContextMenuWrapperProps, ContextMenuInterface>(
  (props, ref) => {
    const contextMenuRef = React.useRef<?ContextMenuInterface>(null);
    React.useImperativeHandle(ref, () => ({
      open: (x, y, options) => {
        if (contextMenuRef.current) contextMenuRef.current.open(x, y, options);
      },
    }));

    return (
      <I18n>
        {({ i18n }) => (
          <ContextMenu {...props} i18n={i18n} ref={contextMenuRef} />
        )}
      </I18n>
    );
  }
);
