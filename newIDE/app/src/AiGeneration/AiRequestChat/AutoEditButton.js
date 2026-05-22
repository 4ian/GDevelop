// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ButtonBase from '@material-ui/core/ButtonBase';
import Paper from '../../UI/Paper';
import classes from './AutoEditButton.module.css';

type Props = {|
  isAutoEditEnabled: boolean,
  onToggle: () => void,
  disabled?: boolean,
|};

const styles = {
  paper: {
    borderRadius: 8,
    display: 'flex',
  },
  button: {
    padding: '7px 12px',
    fontSize: 14,
    fontFamily: 'var(--gdevelop-modern-font-family)',
    color: 'inherit',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
};

const AutoEditButton = ({
  isAutoEditEnabled,
  onToggle,
  disabled,
}: Props): React.Node => (
  <Paper
    background="light"
    style={{ ...styles.paper, opacity: disabled ? 0.5 : 1 }}
  >
    <ButtonBase onClick={onToggle} disabled={disabled} style={styles.button}>
      <Trans>Auto edit</Trans>
      <span
        className={`${classes.statusPill} ${
          isAutoEditEnabled ? classes.statusPillOn : classes.statusPillOff
        }`}
      >
        {isAutoEditEnabled ? <Trans>On</Trans> : <Trans>Off</Trans>}
      </span>
    </ButtonBase>
  </Paper>
);

export default AutoEditButton;
