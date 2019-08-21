// @flow
import * as React from 'react';
import MUIRaisedButton from 'material-ui/RaisedButton';

// We support a subset of the props supported by Material-UI v0.x RaisedButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label?: React.Node,
  onClick: ?() => void,
  primary?: boolean,
  disabled?: boolean,
  fullWidth?: boolean,
  icon?: React.Node,
  style?: {|
    marginTop?: number,
    marginBottom?: number,
    marginLeft?: number,
    marginRight?: number,
    margin?: number,
  |},
  labelPosition?: 'before',
|};

/**
 * A raised button based on Material-UI button.
 */
export default class RaisedButton extends React.Component<Props, {||}> {
  render() {
    return <MUIRaisedButton {...this.props} />;
  }
}
