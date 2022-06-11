// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    cursor: 'default',
  },
});

// We support a subset of the props supported by Material-UI v0.x Toggle
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label?: ?React.Node,
  toggled: boolean,
  onToggle: (e: {||}, toggled: boolean) => void,
  disabled?: boolean,
  labelPosition: 'right',

  style?: {|
    marginTop?: number,
  |},
|};

/**
 * A text field based on Material-UI text field.
 */
const Toggle = (props: Props) => {
  const classes = useStyles();
  return (
    <FormControlLabel
      control={
        <Switch
          checked={props.toggled}
          onChange={event => props.onToggle(event, event.target.checked)}
          color="primary"
        />
      }
      label={props.label}
      disabled={props.disabled}
      classes={classes}
      style={props.style}
    />
  );
};

export default Toggle;
