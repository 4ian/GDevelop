// @flow
import * as React from 'react';
import MUIMenuItem from 'material-ui/MenuItem';

// We support a subset of the props supported by Material-UI v0.x MenuItem
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  value: string | number | boolean,
  primaryText: React.Node,
  fullWidth?: boolean,
  disabled?: boolean,
|};

/**
 * A menu item to be used with `SelectField`.
 */
export default class MenuItem extends React.Component<Props, {||}> {
  // Set muiName to let Material-UI's v0.x SelectField recognise
  // the component.
  static muiName = 'MenuItem';

  render() {
    return <MUIMenuItem {...this.props} />;
  }
}
