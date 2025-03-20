// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import {
  getEditorTabMetadata,
  type EditorTab,
  type EditorKind,
} from './EditorTabs/EditorTabsHandler';
import { ColumnStackLayout } from '../UI/Layout';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';

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

const TabsTitlebarTooltip = ({ anchorElement, editorTab }: Props) => {
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
  let subtitle = null;
  if (
    [
      'layout',
      'layout events',
      'external layout',
      'external events',
      'events functions extension',
    ].includes(editorTabMetadata.editorKind)
  ) {
    subtitle = editorTabMetadata.projectItemName;
  } else if (
    editorTabMetadata.editorKind === 'custom object' &&
    editorTabMetadata.projectItemName
  ) {
    const nameParts = editorTabMetadata.projectItemName.split('::');
    const customObjectName = nameParts[1];
    if (customObjectName) {
      subtitle = customObjectName;
    }
  }

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

export default TabsTitlebarTooltip;
