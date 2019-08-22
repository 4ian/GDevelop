// @flow
import * as React from 'react';
import Checkbox from './Checkbox';

const styles = {
  root: {
    display: 'inline-block',
    width: 'auto',
    marginRight: 16,
  },
  rootWihoutLabel: {
    display: 'inline-block',
    width: 'auto',
  },
  label: {
    width: 'auto',
  },
};

type Props = {|
  label?: ?React.Node,
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
  <Checkbox
    style={props.label ? styles.root : styles.rootWihoutLabel}
    labelStyle={styles.label}
    {...props}
  />
);
