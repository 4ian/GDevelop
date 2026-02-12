// @flow
import * as React from 'react';
import MuiChip from '@material-ui/core/Chip';
import { makeStyles, useTheme } from '@material-ui/core/styles';

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
  textColor?: 'primary' | 'secondary',
  icon?: React.Node,
  size?: 'small' | 'medium',
  variant?: 'default' | 'outlined',
  avatar?: React.Node,
  style?: Object,
  onClick?: (() => void) | null,
  onBlur?: (() => void) | null,
  onFocus?: (() => void) | null,
  onDelete?: ((event: any) => void) | null,
  disableAutoTranslate?: boolean,
|};

type ChipInterface = {|
  focus: () => void,
|};

const Chip = React.forwardRef<Props, ChipInterface>((props, ref) => {
  const chipRef = React.useRef<?HTMLDivElement>(null);
  const muiTheme = useTheme();
  const focus = () => {
    if (chipRef.current) {
      chipRef.current.focus();
    }
  };
  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  return (
    <MuiChip
      label={props.label}
      icon={props.icon}
      size={props.size}
      variant={props.variant}
      avatar={props.avatar}
      style={{
        ...props.style,
        ...(props.textColor
          ? { color: muiTheme.palette.text[props.textColor] }
          : undefined),
      }}
      onClick={props.onClick}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      onDelete={props.onDelete}
      classes={useStyles()}
      className={props.disableAutoTranslate ? 'notranslate' : ''}
      ref={chipRef}
      color={props.color}
    />
  );
});

export default Chip;
