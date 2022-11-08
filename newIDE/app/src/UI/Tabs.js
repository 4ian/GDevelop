// @flow
import * as React from 'react';
import MUITabs from '@material-ui/core/Tabs';
import MUITab from '@material-ui/core/Tab';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from './Theme/ThemeContext';

const styles = {
  tabs: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  selectedTab: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tabIndicator: {
    height: 3,
  },
  tabScrollButton: {
    width: 25,
  },
};

// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabProps<TabName> = {|
  label: React.Node,
  value: TabName,
  tabIndex: number,
  disabled?: boolean,
  id?: ?string,
  style: Object, // Allow additional style from the Tabs component.
|};

/**
 * A Tab based on Material-UI Tab.
 */
function Tab<TabName>(props: TabProps<TabName>) {
  return <MUITab {...props} />;
}
// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabsProps<TabName> = {|
  value?: TabName,
  onChange: TabName => void,
  options: Array<{|
    label: React.Node,
    value: TabName,
    id?: string,
    disabled?: boolean,
  |}>,
  variant?: 'scrollable',
|};

/**
 * Tabs based on Material-UI Tabs.
 */
export function Tabs<TabName>({
  value,
  onChange,
  options,
  variant,
}: TabsProps<TabName>) {
  const windowWidth = useResponsiveWindowWidth();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  // Ensure tabs are scrollable when they reach too many options on the screen.
  const shouldScroll =
    (windowWidth === 'small' && options.length >= 3) ||
    (windowWidth === 'medium' && options.length >= 5) ||
    (windowWidth === 'large' && options.length >= 7);
  const automaticScreenVariant = shouldScroll ? 'scrollable' : 'fullWidth';
  return (
    <MUITabs
      variant={variant || automaticScreenVariant}
      textColor="primary"
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      scrollButtons={variant || shouldScroll ? 'on' : 'off'}
      style={styles.tabs}
      TabIndicatorProps={{
        style: {
          ...styles.tabIndicator,
          backgroundColor: gdevelopTheme.tabs.indicator.backgroundColor,
        },
      }}
      TabScrollButtonProps={{
        style: styles.tabScrollButton,
      }}
    >
      {options.map((option, index) => {
        const isTabSelected = option.value === value;
        const selectedTabIndex = options.findIndex(
          option => option.value === value
        );
        // Apply a specific style if it's far from the selected tab.
        // 2 to the right, 1 to the left, as we apply a border on the left of the tab.
        const isTabDistant =
          index !== 0 &&
          (index - selectedTabIndex >= 2 || selectedTabIndex - index >= 1);
        return (
          <Tab
            value={option.value}
            disabled={option.disabled}
            label={option.label}
            id={option.id}
            tabIndex={index}
            key={index}
            style={{
              flex: 1, // Ensure the tab is taking all the space available.
              ...(isTabSelected
                ? styles.selectedTab
                : isTabDistant
                ? {
                    borderLeft: `1px solid ${
                      gdevelopTheme.tabs.separator.color
                    }`,
                  }
                : {}),
            }}
          />
        );
      })}
    </MUITabs>
  );
}
