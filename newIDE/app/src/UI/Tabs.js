// @flow
import * as React from 'react';
import MUITabs from '@material-ui/core/Tabs';
import MUITab from '@material-ui/core/Tab';
import GDevelopThemeContext from './Theme/ThemeContext';

// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabsProps<TabName> = {|
  value?: TabName,
  onChange: TabName => void,
  children: React.Node, // Should be Tab
|};

/**
 * Tabs based on Material-UI Tabs.
 */
export function Tabs<TabName>(props: TabsProps<TabName>) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <MUITabs
      variant="fullWidth"
      textColor="primary"
      indicatorColor={gdevelopTheme.isModern ? 'primary' : 'secondary'}
      value={props.value}
      onChange={(e, newValue) => props.onChange(newValue)}
    >
      {props.children}
    </MUITabs>
  );
}

// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabProps = {|
  label: React.Node,
  value: string,
  tabIndex?: string,
  disabled?: boolean,
  id?: ?string,
|};

/**
 * A Tab based on Material-UI Tab.
 */
export class Tab extends React.Component<TabProps, {||}> {
  render() {
    return <MUITab {...this.props} />;
  }
}
