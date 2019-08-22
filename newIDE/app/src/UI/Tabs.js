// @flow
import * as React from 'react';
import { Tabs as MUITabs, Tab as MUITab } from 'material-ui/Tabs';

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
    return <MUITabs {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x Tabs
// They should be self descriptive - refer to Material UI docs otherwise.
type TabProps = {|
  label: React.Node,
  value: string,
  children?: React.Node,
|};

/**
 * A Tab based on Material-UI Tab.
 */
export class Tab extends React.Component<TabProps, {||}> {
  // Set muiName to let Material-UI's v0.x Tabs recognise
  // the component.
  static muiName = 'Tab';
  render() {
    return <MUITab {...this.props} />;
  }
}
