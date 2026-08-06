// @flow
import * as React from 'react';
import { Column } from './Grid';
import Text from './Text';
import IconButton from './IconButton';
import Paper from './Paper';
import { Toolbar, ToolbarGroup } from './Toolbar';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

// Same metrics as the home page mobile menu (`HomePageMenuBar`), so the two
// bottom bars look and feel the same.
const iconSize = 24;
const iconButtonPadding = 4;
/**
 * Padding bottom is bigger than padding top to leave space for the Android/iOS
 * bottom navigation bar.
 */
const iconButtonMarginBottom = 12;
const iconButtonLabelSize = 20;
const bottomTabsHeight =
  iconSize +
  iconButtonLabelSize +
  2 * iconButtonPadding +
  iconButtonMarginBottom;

const styles = {
  editorsContainer: {
    display: 'flex',
    flex: 1,
    // Prevent a tall or wide editor (e.g. a code editor) from overflowing
    // the tabs or the screen.
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  editorContainer: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  hiddenEditorContainer: {
    display: 'none',
  },
  tabsContainer: {
    width: '100%',
    fontSize: iconSize,
    height: bottomTabsHeight,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    padding: iconButtonPadding,
    marginBottom: iconButtonMarginBottom,
    fontSize: 'inherit',
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 2,
  },
};

export type EditorBottomTab<TabName> = {|
  value: TabName,
  label: React.Node,
  getIcon: (options: {| color: string, fontSize: string |}) => React.Node,
  renderEditor: () => React.Node,
|};

type Props<TabName> = {|
  tabs: Array<EditorBottomTab<TabName>>,
  currentTab: TabName,
  onChangeTab: TabName => void,
|};

/**
 * Display one editor at a time, switched with icon+label tabs shown at the
 * bottom (same design as the home page menu on mobile) — for small screens,
 * where editors can't be shown side by side (in an `EditorMosaic`). All
 * editors stay mounted (only hidden), so their internal state (scroll
 * position, cursor...) survives tab switches.
 */
const EditorBottomTabsSwitcher = <TabName: string>({
  tabs,
  currentTab,
  onChangeTab,
}: Props<TabName>): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Column expand noMargin noOverflowParent>
      <div style={styles.editorsContainer}>
        {tabs.map(tab => (
          <div
            key={tab.value}
            style={
              tab.value === currentTab
                ? styles.editorContainer
                : styles.hiddenEditorContainer
            }
          >
            {tab.renderEditor()}
          </div>
        ))}
      </div>
      <Paper
        background="medium"
        square
        style={{
          ...styles.tabsContainer,
          borderTop: `1px solid ${gdevelopTheme.home.separator.color}`,
        }}
      >
        <Toolbar height={bottomTabsHeight}>
          <ToolbarGroup spaceOut>
            {tabs.map(tab => {
              const isActive = tab.value === currentTab;
              return (
                <div
                  style={{
                    ...styles.buttonContainer,
                    borderTop: `3px solid ${
                      isActive
                        ? gdevelopTheme.iconButton.selectedBackgroundColor
                        : // Always keep the border so there's no layout shift.
                          'transparent'
                    }`,
                    ...(!isActive
                      ? { color: gdevelopTheme.text.color.secondary }
                      : {}),
                  }}
                  key={tab.value}
                >
                  {/* $FlowFixMe[incompatible-type] */}
                  <IconButton
                    color="inherit"
                    disableRipple
                    disableFocusRipple
                    disableHover
                    style={styles.button}
                    onClick={() => {
                      onChangeTab(tab.value);
                    }}
                    selected={false}
                  >
                    <Column noMargin>
                      <span style={styles.icon}>
                        {tab.getIcon({
                          color: 'inherit',
                          fontSize: 'inherit',
                        })}
                      </span>
                      <Text size="body-small" color="inherit" noMargin>
                        {tab.label}
                      </Text>
                    </Column>
                  </IconButton>
                </div>
              );
            })}
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    </Column>
  );
};

export default EditorBottomTabsSwitcher;
