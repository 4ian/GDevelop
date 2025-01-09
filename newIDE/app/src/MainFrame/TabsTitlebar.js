// @flow
import * as React from 'react';
import MenuIcon from '../UI/CustomSvgIcons/Menu';
import IconButton from '../UI/IconButton';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import { isMacLike } from '../Utils/Platform';
import Window, { useWindowControlsOverlayWatcher } from '../Utils/Window';
import useForceUpdate from '../Utils/UseForceUpdate';
const electron = optionalRequire('electron');

type Props = {|
  children: React.Node,
  toggleProjectManager: () => void,
|};

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

const styles = {
  container: { display: 'flex', flexShrink: 0, alignItems: 'flex-end' },
  leftSideArea: { alignSelf: 'stretch', flexShrink: 0 },
  rightSideArea: { alignSelf: 'stretch', flex: 1 },
  menuIcon: { marginLeft: 4, marginRight: 4 },
};

/**
 * The titlebar containing a menu, the tabs and giving space for window controls.
 */
export default function TabsTitlebar({
  children,
  toggleProjectManager,
}: Props) {
  const forceUpdate = useForceUpdate();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;
  React.useEffect(
    () => {
      Window.setTitleBarColor(backgroundColor);
    },
    [backgroundColor]
  );

  // An installed PWA can have window controls displayed as overlay. If supported,
  // we set up a listener to detect any change and force a refresh that will read
  // the latest size of the controls.
  useWindowControlsOverlayWatcher({ onChanged: forceUpdate });

  // macOS displays the "traffic lights" on the left.
  const isDesktopMacos = !!electron && isMacLike();
  let leftSideOffset = isDesktopMacos ? 76 : 0;

  const isDesktopWindowsOrLinux = !!electron && !isMacLike();
  // Windows and Linux have their "window controls" on the right
  let rightSideOffset = isDesktopWindowsOrLinux ? 150 : 0;

  // An installed PWA can have window controls displayed as overlay,
  // which we measure here to set the offsets.
  // $FlowFixMe - this API is not handled by Flow.
  const { windowControlsOverlay } = navigator;
  if (windowControlsOverlay) {
    if (windowControlsOverlay.visible) {
      const { x, width } = windowControlsOverlay.getTitlebarAreaRect();
      leftSideOffset = x;
      rightSideOffset = window.innerWidth - x - width;
    }
  }
  const rightSideAdditionalOffsetToGiveSpaceToDrag = 30;

  return (
    <div style={{ ...styles.container, backgroundColor }}>
      <div
        style={{
          ...styles.leftSideArea,
          width: leftSideOffset,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
      <IconButton
        size="small"
        id="gdevelop-main-menu"
        style={styles.menuIcon}
        color="default"
        onClick={toggleProjectManager}
      >
        <MenuIcon />
      </IconButton>
      {children}
      <div
        style={{
          ...styles.rightSideArea,
          minWidth:
            rightSideOffset + rightSideAdditionalOffsetToGiveSpaceToDrag,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
    </div>
  );
}
