// @flow
import * as React from 'react';

import MenuIcon from '../UI/CustomSvgIcons/Menu';
import IconButton from '../UI/IconButton';
import {
  TitleBarLeftSafeMargins,
  TitleBarRightSafeMargins,
} from '../UI/TitleBarSafeMargins';
import { type EditorTab } from './EditorTabs/EditorTabsHandler';
import { getTabId } from './EditorTabs/DraggableEditorTabs';
import { useScreenType } from '../UI/Responsive/ScreenTypeMeasurer';
import TabsTitlebarTooltip from './TabsTitlebarTooltip';
import Window from '../Utils/Window';
import { isMacLike } from '../Utils/Platform';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const WINDOW_DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';
const WINDOW_NON_DRAGGABLE_PART_CLASS_NAME = 'title-bar-non-draggable-part';

const styles = {
  container: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    position: 'relative', // to ensure it is displayed above any global iframe
    minHeight: 42,
    paddingRight: 6,
  },
  menuIcon: {
    marginLeft: 4,
    marginRight: 4,
    // Make the icon slightly bigger to be centered on the row, so it aligns
    // with the project manager icon.
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 33, 29, 0.8)',
    transition: 'background-color 120ms ease',
  },
};

type TabsTitlebarProps = {|
  hidden: boolean,
  toggleProjectManager: () => void,
  renderTabs: (
    onEditorTabHovered: (?EditorTab, {| isLabelTruncated: boolean |}) => void,
    onEditorTabClosing: () => void
  ) => React.Node,
  isLeftMostPane: boolean,
  isRightMostPane: boolean,
  displayMenuIcon: boolean,

  displayAskAi: boolean,
  onAskAiClicked: () => void,
|};

/**
 * The titlebar containing a menu, the tabs and giving space for window controls.
 */
export default function TabsTitlebar({
  toggleProjectManager,
  hidden,
  renderTabs,
  isLeftMostPane,
  isRightMostPane,
  displayMenuIcon,
  displayAskAi,
  onAskAiClicked,
}: TabsTitlebarProps): React.MixedElement {
  void displayAskAi;
  void onAskAiClicked;

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const isTouchscreen = useScreenType() === 'touch';
  const [tooltipData, setTooltipData] = React.useState<?{|
    element: HTMLElement,
    editorTab: EditorTab,
  |}>(null);
  const tooltipTimeoutId = React.useRef<?TimeoutID>(null);

  const onEditorTabHovered = React.useCallback(
    (
      editorTab: ?EditorTab,
      { isLabelTruncated }: {| isLabelTruncated: boolean |}
    ) => {
      if (isTouchscreen) {
        setTooltipData(null);
        return;
      }

      if (tooltipTimeoutId.current) {
        clearTimeout(tooltipTimeoutId.current);
        tooltipTimeoutId.current = null;
      }

      if (editorTab && isLabelTruncated) {
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

  const onEditorTabClosing = React.useCallback(() => {
    // Always clear the tooltip when a tab is closed,
    // as they are multiple actions that can be done to
    // close it, it's safer (close all, close others, close one).
    if (tooltipTimeoutId.current) {
      clearTimeout(tooltipTimeoutId.current);
      tooltipTimeoutId.current = null;
    }
    setTooltipData(null);
  }, []);

  React.useEffect(
    () => {
      return () => {
        if (tooltipTimeoutId.current) {
          clearTimeout(tooltipTimeoutId.current);
        }
      };
    },
    // Clear timeout if necessary when unmounting.
    []
  );

  const handleDoubleClick = React.useCallback(() => {
    // On macOS, double-clicking the title bar should maximize/restore the window
    if (isMacLike()) {
      Window.toggleMaximize();
    }
  }, []);

  return (
    <div
      style={{
        ...styles.container,
        background: `linear-gradient(180deg, ${
          gdevelopTheme.paper.backgroundColor.dark
        } 0%, ${gdevelopTheme.paper.backgroundColor.medium} 130%)`,
        borderBottom: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
        boxShadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
        // Hiding the titlebar should still keep its position in the layout to avoid layout shifts:
        visibility: hidden ? 'hidden' : 'visible',
        pointerEvents: hidden ? undefined : 'all',
      }}
      className={`${WINDOW_DRAGGABLE_PART_CLASS_NAME} carrots-tabs-titlebar`}
      onDoubleClick={handleDoubleClick}
    >
      {isLeftMostPane && <TitleBarLeftSafeMargins />}
      {displayMenuIcon && (
        // $FlowFixMe[incompatible-type]
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
      )}
      {renderTabs(onEditorTabHovered, onEditorTabClosing)}
      {isRightMostPane && <TitleBarRightSafeMargins />}
      {tooltipData && (
        <TabsTitlebarTooltip
          anchorElement={tooltipData.element}
          editorTab={tooltipData.editorTab}
        />
      )}
    </div>
  );
}
