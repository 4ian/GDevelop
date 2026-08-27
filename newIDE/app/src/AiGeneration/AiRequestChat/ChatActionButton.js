// @flow
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './ChatActionButton.module.css';

type Props = {|
  label: React.Node,
  onClick: () => void | Promise<void>,
  icon?: React.Node,
  /**
   * `primary` for the action the user is expected to take, `quiet` for the one
   * that dismisses the row, `premium` for the one leading to a purchase.
   */
  emphasis?: 'primary' | 'default' | 'quiet' | 'premium',
  disabled?: boolean,
  tooltip?: React.Node,
|};

/**
 * A compact button for the actions offered by a row of the AI chat (approving
 * an edit, retrying a failed request...). Kept lighter than the buttons of the
 * rest of the editor so a row stays at the scale of the conversation.
 */
export const ChatActionButton = ({
  label,
  onClick,
  icon,
  emphasis = 'default',
  disabled,
  tooltip,
}: Props): React.Node => {
  const button = (
    <ButtonBase
      className={classNames({
        [classes.button]: true,
        [classes.buttonPrimary]: emphasis === 'primary',
        [classes.buttonQuiet]: emphasis === 'quiet',
        [classes.buttonPremium]: emphasis === 'premium',
      })}
      onClick={onClick}
      disabled={disabled}
      disableRipple
      focusVisibleClassName={classes.buttonFocusVisible}
    >
      {icon && <span className={classes.icon}>{icon}</span>}
      {label}
    </ButtonBase>
  );

  if (!tooltip) return button;

  return (
    <Tooltip title={tooltip} placement="top" enterDelay={400}>
      {/* A span is needed so the tooltip still shows on a disabled button. */}
      <span className={classes.tooltipWrapper}>{button}</span>
    </Tooltip>
  );
};
