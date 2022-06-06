// @flow
import * as React from 'react';
import MuiChip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    cursor: 'default',
  },
  deleteIcon: {
    cursor: 'default', // Hover is enough, no need for a different cursor.
  },
});

type Props = {|
  label?: string | React.Node | void,
  color?: 'default' | 'primary' | 'secondary',
  icon?: React.Node,
  size?: 'small' | 'medium',
  variant?: 'default' | 'outlined',
  avatar?: React.Node,
  style?: Object,
  onClick?: (() => void) | null,
  onBlur?: (() => void) | null,
  onFocus?: (() => void) | null,
  onDelete?: ((event: any) => void) | null,
|};

const Chip = (props: Props) => (
  <MuiChip
    label={props.label}
    icon={props.icon}
    size={props.size}
    variant={props.variant}
    avatar={props.avatar}
    style={props.style}
    onClick={props.onClick}
    onBlur={props.onBlur}
    onFocus={props.onFocus}
    onDelete={props.onDelete}
    classes={useStyles()}
  />
);

export default Chip;
