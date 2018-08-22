import React from 'react';
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

/**
 * A checkbox based on Material-UI Checkbox, but that can be displayed
 * without having it taking the full width of its container.
 */
export default props => (
  <Checkbox style={styles.root} labelStyle={styles.label} {...props} />
);
