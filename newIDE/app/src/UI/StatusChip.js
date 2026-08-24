// @flow
import * as React from 'react';
import classNames from 'classnames';
import Text from './Text';
import classes from './StatusChip.module.css';

/** The meaning of a status, which gives the color of a chip. */
export type StatusChipTone =
  | 'neutral'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'progress';

const toneClasses = {
  neutral: classes.neutral,
  success: classes.success,
  error: classes.error,
  warning: classes.warning,
  info: classes.info,
  progress: classes.progress,
};

/** A spinner, for a status that is being worked on. */
export const StatusSpinner = (): React.Node => (
  <span className={classes.spinner} />
);

/** A hollow dot, for a status that has nothing to show yet. */
export const StatusDot = (): React.Node => <span className={classes.dot} />;

type Props = {|
  label: React.Node,
  /** The meaning of the status. Grey if not specified. */
  tone?: StatusChipTone,
  /** An icon shown before the label: it is sized and colored by the chip. */
  icon?: React.Node,
  /** Show a spinner instead of the icon, for something being done. */
  loading?: boolean,
  /** An additional detail shown after the label (frames, duration...). */
  details?: React.Node,
  size?: 'small' | 'default',
|};

/**
 * A pill showing a status, with an optional icon or spinner colored according
 * to what the status means. All the statuses of a chip have the same height,
 * so that a status changing never moves what is displayed around it.
 */
const StatusChip = ({
  label,
  tone,
  icon,
  loading,
  details,
  size,
}: Props): React.Node => {
  const isSmall = size === 'small';
  return (
    <span
      className={classNames({
        [classes.chip]: true,
        [toneClasses[tone || 'neutral']]: true,
        [classes.small]: isSmall,
      })}
    >
      {(loading || icon) && (
        <span className={classes.iconSlot}>
          {loading ? <StatusSpinner /> : icon}
        </span>
      )}
      <Text
        noMargin
        displayInlineAsSpan
        color="inherit"
        size={isSmall ? 'body-small' : 'body'}
        // A label on a single line, so that a long status cannot make the
        // chip taller.
        style={{ lineHeight: '1', whiteSpace: 'nowrap' }}
      >
        {label}
      </Text>
      {details && (
        <Text
          noMargin
          displayInlineAsSpan
          color="inherit"
          size="body-small"
          style={{ lineHeight: '1', whiteSpace: 'nowrap', opacity: 0.8 }}
        >
          {details}
        </Text>
      )}
    </span>
  );
};

export default StatusChip;

/**
 * Just the icon of a status, colored like the chip would be, to be shown in
 * dense lists where there is no room for a label.
 */
export const StatusIcon = ({
  tone,
  icon,
}: {|
  tone?: StatusChipTone,
  icon: React.Node,
|}): React.Node => (
  <span
    className={classNames({
      [classes.iconOnly]: true,
      [toneClasses[tone || 'neutral']]: true,
    })}
  >
    {icon}
  </span>
);
