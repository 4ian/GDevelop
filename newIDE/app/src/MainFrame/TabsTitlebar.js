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
import RobotIcon from '../ProjectCreation/RobotIcon';
import PreferencesContext from './Preferences/PreferencesContext';
import TextButton from '../UI/TextButton';
import { useInterval } from '../Utils/UseInterval';
import { useIsMounted } from '../Utils/UseIsMounted';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

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
  askAiContainer: {
    marginBottom: 4,
    marginRight: 1,
    marginLeft: 2,
  },
};

type TabsTitlebarProps = {|
  hidden: boolean,
  toggleProjectManager: () => void,
  renderTabs: (
    onEditorTabHovered: (?EditorTab, {| isLabelTruncated: boolean |}) => void,
    onEditorTabClosing: () => void
  ) => React.Node,
  hasAskAiOpened: boolean,
  onOpenAskAi: () => void,
|};

const useIsAskAiIconAnimated = (shouldDisplayAskAi: boolean) => {
  const isMounted = useIsMounted();

  const [isAskAiIconAnimated, setIsAskAiIconAnimated] = React.useState(true);
  const animate = React.useCallback(
    (animationDuration: number) => {
      if (isMounted.current) {
        setIsAskAiIconAnimated(true);
        setTimeout(() => {
          if (!isMounted.current) return;

          setIsAskAiIconAnimated(false);
        }, animationDuration);
      }
    },
    [isMounted]
  );

  React.useEffect(
    () => {
      // Animate the icon for a long time at the beginning.
      animate(9000);
    },
    [animate]
  );

  useInterval(
    () => {
      setIsAskAiIconAnimated(true);
      setTimeout(() => {
        setIsAskAiIconAnimated(false);
      }, 8000);
    },
    // Animate the icon every 20 minutes.
    shouldDisplayAskAi ? 20 * 60 * 1000 : null
  );

  return isAskAiIconAnimated;
};

/**
 * The titlebar containing a menu, the tabs and giving space for window controls.
 */
export default function TabsTitlebar({
  toggleProjectManager,
  hidden,
  renderTabs,
  hasAskAiOpened,
  onOpenAskAi,
}: TabsTitlebarProps) {
  const isTouchscreen = useScreenType() === 'touch';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;
  const preferences = React.useContext(PreferencesContext);
  const { subscription } = React.useContext(AuthenticatedUserContext);
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

  const isStudentAccount =
    !!subscription &&
    !!subscription.benefitsFromEducationPlan &&
    !subscription.isTeacher;

  const shouldDisplayAskAi =
    preferences.values.showAiAskButtonInTitleBar &&
    !hasAskAiOpened &&
    !isStudentAccount;
  const isAskAiIconAnimated = useIsAskAiIconAnimated(shouldDisplayAskAi);

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
      {renderTabs(onEditorTabHovered, onEditorTabClosing)}
      {shouldDisplayAskAi ? (
        <div
          style={styles.askAiContainer}
          className={WINDOW_NON_DRAGGABLE_PART_CLASS_NAME}
        >
          <TextButton
            icon={<RobotIcon size={16} rotating={isAskAiIconAnimated} />}
            label={'Ask AI'}
            onClick={onOpenAskAi}
          />
        </div>
      ) : null}
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
