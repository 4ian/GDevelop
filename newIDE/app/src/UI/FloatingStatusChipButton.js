// @flow
import * as React from 'react';
import StatusChip, { type StatusChipTone } from './StatusChip';
import classes from './FloatingStatusChipButton.module.css';

type Props = {|
  label: React.Node,
  tone?: StatusChipTone,
  icon?: React.Node,
  onClick: (event: SyntheticMouseEvent<HTMLButtonElement>) => void,
|};

/**
 * A status chip that can be clicked, floating above a canvas (like the game
 * displayed by the 3D editor): it has its own background and a shadow.
 */
const FloatingStatusChipButton = ({
  label,
  tone,
  icon,
  onClick,
}: Props): React.Node => (
  <button type="button" className={classes.button} onClick={onClick}>
    <StatusChip tone={tone} icon={icon} label={label} />
  </button>
);

export default FloatingStatusChipButton;
