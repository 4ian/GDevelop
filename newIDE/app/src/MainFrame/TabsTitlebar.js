// @flow
import * as React from 'react';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import MenuIcon from '../UI/CustomSvgIcons/Menu';
import IconButton from '../UI/IconButton';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Window from '../Utils/Window';
import {
  TitleBarLeftSafeMargins,
  TitleBarRightSafeMargins,
} from '../UI/TitleBarSafeMargins';
import {
  getEditorTabMetadata,
  type EditorTab,
  type EditorKind,
} from './EditorTabs/EditorTabsHandler';
import { getTabId } from './EditorTabs/DraggableEditorTabs';

import { ColumnStackLayout } from '../UI/Layout';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';
import { useScreenType } from '../UI/Responsive/ScreenTypeMeasurer';
import { Trans } from '@lingui/macro';

const WINDOW_DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';
const WINDOW_NON_DRAGGABLE_PART_CLASS_NAME = 'title-bar-non-draggable-part';

const editorKindToLabel: { [kind: EditorKind]: React.Node } = {
  layout: <Trans>Scene</Trans>,
  'layout events': <Trans>Scene events</Trans>,
  'external layout': <Trans>External layout</Trans>,
  'external events': <Trans>External events</Trans>,
  'events functions extension': <Trans>Extension</Trans>,
  'custom object': <Trans>Object</Trans>,
  debugger: <Trans>Debugger</Trans>,
  resources: <Trans>Resources</Trans>,
  'start page': <Trans>Homepage</Trans>,
};

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
  paper: {
    padding: '8px 10px',
    minWidth: 180,
  },
  tabIcon: {
    marginLeft: 4,
    marginRight: 4,
    display: 'flex',
  },
  emptyTabIcon: {
    marginLeft: 4,
    marginRight: 4,
    height: 20,
    width: 24,
    display: 'flex',
  },
  tooltip: {
    zIndex: 3,
    maxWidth: 'min(90%, 300px)',
  },
};

type Props = {|
  anchorElement: HTMLElement,
  editorTab: EditorTab,
|};

const Tooltip = ({ anchorElement, editorTab }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [tooltipStyle, setTooltipStyle] = React.useState<Object>(
    styles.tooltip
  );

  const brightness = gdevelopTheme.palette.type === 'dark' ? 0.978 : 0.224;

  const editorTabMetadata = getEditorTabMetadata(editorTab);

  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        setTooltipStyle(currentStyle => ({
          ...currentStyle,
          transition: 'transform 150ms ease-in-out',
        }));
      }, 100);
      return () => clearTimeout(timeoutId);
    },
    // Apply transition after first display of tooltip to avoid having the
    // transition weirdly applied from the 0;0 coordinates.
    []
  );

  const title = editorKindToLabel[editorTabMetadata.editorKind];
  const subtitle = [
    'layout',
    'layout events',
    'events functions extension',
  ].includes(editorTabMetadata.editorKind)
    ? editorTabMetadata.projectItemName
    : editorTabMetadata.editorKind === 'custom object' &&
      editorTabMetadata.projectItemName
    ? editorTabMetadata.projectItemName.split('::')[1]
    : null;

  return (
    <Popper
      id="tabs-titlebar-tooltip"
      open={true}
      anchorEl={anchorElement}
      transition
      placement={'bottom-start'}
      popperOptions={{
        modifiers: {
          arrow: { enabled: false },
          offset: {
            enabled: true,
            offset: '0,5',
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: document.querySelector('.main-frame'),
          },
        },
      }}
      style={tooltipStyle}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
          <Paper
            style={{
              ...styles.paper,
              backgroundColor: gdevelopTheme.paper.backgroundColor.light,
            }}
            elevation={4}
          >
            <ColumnStackLayout noMargin>
              <Line alignItems="center" noMargin>
                {editorTab.icon || editorTab.renderCustomIcon ? (
                  <span style={styles.tabIcon}>
                    {editorTab.renderCustomIcon
                      ? editorTab.renderCustomIcon(brightness)
                      : editorTab.icon}
                  </span>
                ) : null}
                <Text noMargin>{title}</Text>
              </Line>
              {subtitle && (
                <Line alignItems="center" noMargin>
                  <span style={styles.emptyTabIcon} />
                  <Text noMargin>{subtitle}</Text>
                </Line>
              )}
            </ColumnStackLayout>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
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
          if (tooltipData) {
            setTooltipData({ editorTab, element });
          } else {
            tooltipTimeoutId.current = setTimeout(() => {
              setTooltipData({ editorTab, element });
            }, 500);
          }
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
        <Tooltip
          anchorElement={tooltipData.element}
          editorTab={tooltipData.editorTab}
        />
      )}
    </div>
  );
}
