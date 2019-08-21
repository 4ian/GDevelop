// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive.
type Props = {|
  label: React.Node,
  onClick: ?() => void,
  primary?: boolean,
  disabled?: boolean,
  keyboardFocused?: boolean,
  fullWidth?: boolean,
  icon?: React.Node,
  style?: {|
    marginLeft?: number,
  |},
  target?: '_blank',
|};

/**
 * A "flat" button based on Material-UI button.
 */
export default React.forwardRef<Props, FlatButton>((props, ref) => (
  <FlatButton {...props} ref={ref} />
));
