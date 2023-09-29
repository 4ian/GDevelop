// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MUICheckbox from '@material-ui/core/Checkbox';
import { FormHelperText } from '@material-ui/core';

// Reduce checkbox size to avoid overlapping with other checkboxes.
const useStyles = makeStyles({
  root: {
    marginLeft: 9,
    marginRight: 9,
    marginTop: 0, // Material UI adds negative margin triggering a scrollbar.
    marginBottom: 0, // Material UI adds negative margin triggering a scrollbar.
    padding: 0,
  },
});

const useFormGroupStyles = makeStyles({
  root: {
    display: 'block',
  },
});

// We support a subset of the props supported by Material-UI v0.x Checkbox
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void | Promise<void>,
  tooltipOrHelperText?: React.Node,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,

  style?: {|
    display?: 'inline-block',
    marginRight?: number,
    margin?: number,
  |},
  id?: string,
|};

/**
 * A checkbox based on Material-UI checkbox.
 */
const Checkbox = (props: Props) => {
  const { onCheck } = props;
  const classes = useStyles();
  const formGroupClasses = useFormGroupStyles();
  const checkbox = (
    <MUICheckbox
      className={classes.root}
      disabled={props.disabled}
      checked={props.checked}
      onChange={
        onCheck ? event => onCheck(event, event.target.checked) : undefined
      }
      icon={props.uncheckedIcon}
      checkedIcon={props.checkedIcon}
      style={props.label ? undefined : props.style}
      id={props.id}
    />
  );
  return props.label ? (
    <FormGroup classes={formGroupClasses}>
      <FormControlLabel
        control={checkbox}
        label={props.label}
        style={{
          ...props.style,
          cursor: 'default',
        }}
      />
      {props.tooltipOrHelperText && (
        <FormHelperText>{props.tooltipOrHelperText}</FormHelperText>
      )}
    </FormGroup>
  ) : (
    checkbox
  );
};

export default Checkbox;
