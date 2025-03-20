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
import { type EditorTab } from './EditorTabs/EditorTabsHandler';
import { getTabId } from './EditorTabs/DraggableEditorTabs';
import { useScreenType } from '../UI/Responsive/ScreenTypeMeasurer';
import TabsTitlebarTooltip from './TabsTitlebarTooltip';

const WINDOW_DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';
const WINDOW_NON_DRAGGABLE_PART_CLASS_NAME = 'title-bar-non-draggable-part';

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
  hidden: boolean,
  toggleProjectManager: () => void,
  renderTabs: (onHoverEditorTab: (?EditorTab) => void) => React.Node,
|};

/**
 * The titlebar containing a menu, the tabs and giving space for window controls.
 */
export default function TabsTitlebar({
  toggleProjectManager,
  hidden,
  renderTabs,
}: TabsTitlebarProps) {
  const isTouchscreen = useScreenType() === 'touch';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;
  const [tooltipData, setTooltipData] = React.useState<?{|
    element: HTMLElement,
    editorTab: EditorTab,
  |}>(null);
  const tooltipTimeoutId = React.useRef<?TimeoutID>(null);

  React.useEffect(
    () => {
      Window.setTitleBarColor(backgroundColor);
    },
    [backgroundColor]
  );

  const onHoverEditorTab = React.useCallback(
    (editorTab: ?EditorTab) => {
      if (isTouchscreen) {
        setTooltipData(null);
        return;
      }

      if (tooltipTimeoutId.current) {
        clearTimeout(tooltipTimeoutId.current);
        tooltipTimeoutId.current = null;
      }

      if (editorTab) {
        const element = document.getElementById(getTabId(editorTab));
        if (element) {
          tooltipTimeoutId.current = setTimeout(
            () => {
              setTooltipData({ editorTab, element });
            },
            // If the tooltip is already displayed, quickly change to the new tab
            // but not too quick because the display might look flickering.
            tooltipData ? 100 : 500
          );
        }
      } else {
        tooltipTimeoutId.current = setTimeout(() => {
          setTooltipData(null);
        }, 50);
      }
    },
    [isTouchscreen, tooltipData]
  );

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor,
        // Hiding the titlebar should still keep its position in the layout to avoid layout shifts:
        visibility: hidden ? 'hidden' : 'visible',
      }}
      className={WINDOW_DRAGGABLE_PART_CLASS_NAME}
    >
      <TitleBarLeftSafeMargins />
      <IconButton
        size="small"
        // Even if not in the toolbar, keep this ID for backward compatibility for tutorials.
        id="main-toolbar-project-manager-button"
        // The whole bar is draggable, so prevent the icon to be draggable,
        // as it can affect the ability to open the menu.
        className={WINDOW_NON_DRAGGABLE_PART_CLASS_NAME}
        style={styles.menuIcon}
        color="default"
        onClick={toggleProjectManager}
      >
        <MenuIcon />
      </IconButton>
      {renderTabs(onHoverEditorTab)}
      <TitleBarRightSafeMargins />
      {tooltipData && (
        <TabsTitlebarTooltip
          anchorElement={tooltipData.element}
          editorTab={tooltipData.editorTab}
        />
      )}
    </div>
  );
}
