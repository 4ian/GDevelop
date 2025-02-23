// @flow
import * as React from 'react';
import MenuIcon from '../UI/CustomSvgIcons/Menu';
import IconButton from '../UI/IconButton';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Window from '../Utils/Window';
import {
  TitleBarLeftSafeMargins,
  TitleBarRightSafeMargins,
} from '../UI/TitleBarSafeMargins';

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

const styles = {
  container: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'flex-end',
    position: 'relative', // to ensure it is displayed above any global iframe.
  },
  menuIcon: {
    marginLeft: 4,
    marginRight: 4,
    // Make the icon slightly bigger to be centered on the row, so it aligns
    // with the project manager icon.
    width: 34,
    height: 34,
  },
};

type TabsTitlebarProps = {|
  children: React.Node,
  hidden: boolean,
  toggleProjectManager: () => void,
|};

/**
 * The titlebar containing a menu, the tabs and giving space for window controls.
 */
export default function TabsTitlebar({
  children,
  toggleProjectManager,
  hidden,
}: TabsTitlebarProps) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;

  React.useEffect(
    () => {
      Window.setTitleBarColor(backgroundColor);
    },
    [backgroundColor]
  );

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor,
        // Hiding the titlebar should still keep its position in the layout to avoid layout shifts:
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <TitleBarLeftSafeMargins />
      <IconButton
        size="small"
        // Even if not in the toolbar, keep this ID for backward compatibility for tutorials.
        id="main-toolbar-project-manager-button"
        className={DRAGGABLE_PART_CLASS_NAME}
        style={styles.menuIcon}
        color="default"
        onClick={toggleProjectManager}
      >
        <MenuIcon />
      </IconButton>
      {children}
      <TitleBarRightSafeMargins />
    </div>
  );
}
