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
  menuIcon: { marginRight: 4 },
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

  const isMacos = !!electron && isMacLike();
  const isWindowsOrLinux = !!electron && !isMacLike();

  return (
    <div style={{ ...styles.container, backgroundColor }}>
      <div
        style={{
          ...styles.leftSideArea,
          // macOS displays the "traffic lights" on the left.
          width: isMacos ? 76 : 4,
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
          // Windows and Linux have their "window controls" on the right
          minWidth: isWindowsOrLinux ? 150 : 0,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
    </div>
  );
}
