// @flow
import * as React from 'react';
import MenuIcon from '../UI/CustomSvgIcons/Menu';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ThemeContext from '../UI/Theme/ThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import { isMacLike } from '../Utils/Platform';
import Window from '../Utils/Window';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
const electron = optionalRequire('electron');

type Props = {|
  onBuildMenuTemplate: () => Array<MenuItemTemplate>,
  children: React.Node,
|};

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

const styles = {
  container: { display: 'flex', flexShrink: 0, alignItems: 'end' },
  leftSideArea: { alignSelf: 'stretch' },
  rightSideArea: { alignSelf: 'stretch', flex: 1 },
  menuIcon: { marginLeft: 4, marginRight: 4 },
};

export default function TabsTitlebar({ children, onBuildMenuTemplate }: Props) {
  const gdevelopTheme = React.useContext(ThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;
  React.useEffect(
    () => {
      Window.setTitleBarColor(backgroundColor);
    },
    [backgroundColor]
  );

  const isDesktopMacos = !!electron && isMacLike();
  const isDesktopWindowsOrLinux = !!electron && !isMacLike();

  // macOS displays the "traffic lights" on the left.
  let leftSideOffset = isDesktopMacos ? 76 : 0;
  // Windows and Linux have their "window controls" on the right
  let rightSideOffset = isDesktopWindowsOrLinux ? 150 : 0;

  // An installed PWA can have window controls displayed as overlay,
  // which we measure here to set the offsets.
  if ('windowControlsOverlay' in navigator) {
    // $FlowFixMe - this API is not handled by Flow.
    const { x, width } = navigator.windowControlsOverlay.getTitlebarAreaRect();
    leftSideOffset = x;
    rightSideOffset = window.innerWidth - x - width;
  }

  return (
    <div style={{ ...styles.container, backgroundColor }}>
      <div
        style={{
          ...styles.leftSideArea,
          width: leftSideOffset,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
      <ElementWithMenu
        element={
          <IconButton
            size="small"
            id="gdevelop-main-menu"
            style={styles.menuIcon}
            color="default"
          >
            <MenuIcon />
          </IconButton>
        }
        buildMenuTemplate={onBuildMenuTemplate}
      />
      {children}
      <div
        style={{
          ...styles.rightSideArea,
          minWidth: rightSideOffset,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
    </div>
  );
}
