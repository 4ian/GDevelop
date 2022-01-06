// @flow
import * as React from 'react';
import MUITabs from '@material-ui/core/Tabs';
import MUITab from '@material-ui/core/Tab';

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
export class Tabs<TabName> extends React.Component<TabsProps<TabName>, {||}> {
  render() {
    return (
      <MUITabs
        variant="fullWidth"
        textColor="primary"
        value={this.props.value}
        onChange={(e, newValue) => this.props.onChange(newValue)}
      >
        {this.props.children}
      </MUITabs>
    );
  }
}

// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabProps = {|
  label: React.Node,
  value: string,
  tabIndex?: string,
  disabled?: boolean,
|};

/**
 * A Tab based on Material-UI Tab.
 */
export class Tab extends React.Component<TabProps, {||}> {
  render() {
    return <MUITab {...this.props} />;
  }
}
