// @flow
import * as React from 'react';
import Checkbox from 'material-ui/Checkbox';

const styles = {
  root: {
    width: 'auto',
    marginRight: 16,
  },
  label: {
    width: 'auto',
  },
};

type Props = {|
  label: React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,
|};

/**
 * A checkbox based on Material-UI Checkbox, but that can be displayed
 * without having it taking the full width of its container.
 */
export default (props: Props) => (
  <Checkbox style={styles.root} labelStyle={styles.label} {...props} />
);
