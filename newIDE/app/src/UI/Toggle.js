// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { type GDevelopTheme } from './Theme';

const useFormStyles = makeStyles({
  root: {
    cursor: 'default',
  },
  labelPlacementStart: { marginLeft: 0 },
  label: { flex: 1 },
});

const useSwitchStyles = ({
  theme,
  toggled,
  disabled,
}: {
  theme: GDevelopTheme,
  toggled: boolean,
  disabled: boolean,
}) =>
  makeStyles({
    thumb: {
      backgroundColor: disabled
        ? theme.switch.thumbColor.disabled
        : toggled
        ? theme.switch.thumbColor.toggled
        : theme.switch.thumbColor.default,
    },
    track: {
      backgroundColor: disabled
        ? theme.switch.trackColor.disabled
        : toggled
        ? theme.switch.trackColor.toggled
        : theme.switch.trackColor.default,
      opacity: '1 !important', // MUI overrides the opacity to 0.5, prevent this.
    },
  })();

// We support a subset of the props supported by Material-UI v0.x Toggle
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label: React.Node,
  toggled: boolean,
  onToggle: (e: {||}, toggled: boolean) => void | Promise<void>,
  disabled?: boolean,
  labelPosition: 'right' | 'left',

  style?: {|
    marginTop?: number,
  |},
|};

/**
 * A toggle based on Material-UI Toggle.
 */
const Toggle = ({
  label,
  toggled,
  onToggle,
  disabled,
  labelPosition,
  style,
}: Props) => {
  const formClasses = useFormStyles();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const switchClasses = useSwitchStyles({
    theme: gdevelopTheme,
    toggled,
    disabled: !!disabled,
  });
  return (
    <FormControlLabel
      control={
        <Switch
          checked={toggled}
          onChange={event => onToggle(event, event.target.checked)}
          classes={switchClasses}
          color="default"
        />
      }
      labelPlacement={labelPosition === 'right' ? 'end' : 'start'}
      label={label}
      disabled={disabled}
      classes={formClasses}
      style={style}
    />
  );
};

export default Toggle;
