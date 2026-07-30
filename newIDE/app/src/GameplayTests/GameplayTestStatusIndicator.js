// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import Text from '../UI/Text';
import CheckCircleFilled from '../UI/CustomSvgIcons/CheckCircleFilled';
import ErrorFilled from '../UI/CustomSvgIcons/ErrorFilled';
import WarningRound from '../UI/CustomSvgIcons/WarningRound';
import History from '../UI/CustomSvgIcons/History';
import Stop from '../UI/CustomSvgIcons/Stop';
import classes from './GameplayTestStatusIndicator.module.css';

/**
 * The status of a test as displayed in the editor: the statuses reported by
 * the game (see `GameplayTestResult`), plus the transient statuses of a run
 * being launched and the "never run" case.
 */
export type GameplayTestDisplayStatus =
  | 'never-run'
  | 'launching'
  | 'running'
  | 'passed'
  | 'failed'
  | 'error'
  | 'stopped'
  | 'timeout';

export const getDisplayStatusFromTest = (
  test: gdTest
): GameplayTestDisplayStatus => {
  const lastRunStatus = test.getLastRunStatus();
  if (
    lastRunStatus === 'passed' ||
    lastRunStatus === 'failed' ||
    lastRunStatus === 'error' ||
    lastRunStatus === 'stopped' ||
    lastRunStatus === 'timeout'
  ) {
    return lastRunStatus;
  }
  return 'never-run';
};

/** Format the duration of a run, to be shown next to its status. */
export const formatRunDuration = (durationMs: number): string => {
  if (!durationMs) return '-';
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 2 : 1)}s`;
};

export const isGameplayTestStatusInProgress = (
  status: GameplayTestDisplayStatus
): boolean => status === 'launching' || status === 'running';

const statusClasses = {
  'never-run': classes.neverRun,
  launching: classes.inProgress,
  running: classes.inProgress,
  passed: classes.passed,
  failed: classes.failed,
  error: classes.error,
  stopped: classes.stopped,
  timeout: classes.timeout,
};

export const getGameplayTestStatusLabel = (
  status: GameplayTestDisplayStatus
): React.Node => {
  switch (status) {
    case 'passed':
      return <Trans>Passed</Trans>;
    case 'failed':
      return <Trans>Failed</Trans>;
    case 'error':
      return <Trans>Error</Trans>;
    case 'stopped':
      return <Trans>Stopped</Trans>;
    case 'timeout':
      return <Trans>Timed out</Trans>;
    case 'launching':
      return <Trans>Starting the game...</Trans>;
    case 'running':
      return <Trans>Running...</Trans>;
    case 'never-run':
    default:
      return <Trans>Never run</Trans>;
  }
};

const renderStatusIcon = (status: GameplayTestDisplayStatus) => {
  switch (status) {
    case 'passed':
      return <CheckCircleFilled className={classes.icon} />;
    case 'failed':
      return <ErrorFilled className={classes.icon} />;
    case 'error':
      return <WarningRound className={classes.icon} />;
    case 'timeout':
      return <History className={classes.icon} />;
    case 'stopped':
      return <Stop className={classes.icon} />;
    case 'launching':
    case 'running':
      return <span className={classes.spinner} />;
    case 'never-run':
    default:
      return <span className={classes.emptyDot} />;
  }
};

type ChipProps = {|
  status: GameplayTestDisplayStatus,
  /** An additional detail shown next to the status (frames, duration...). */
  details?: React.Node,
  size?: 'small' | 'default',
|};

/**
 * A pill showing the status of a gameplay test run, with a colored icon.
 * Used in the test properties panel and on the gameplay test frame.
 */
export const GameplayTestStatusChip = ({
  status,
  details,
  size,
}: ChipProps): React.Node => (
  <span
    className={classNames({
      [classes.chip]: true,
      [statusClasses[status]]: true,
      [classes.small]: size === 'small',
    })}
  >
    {renderStatusIcon(status)}
    <Text
      noMargin
      color="inherit"
      size={size === 'small' ? 'body-small' : 'body'}
    >
      {getGameplayTestStatusLabel(status)}
    </Text>
    {details && (
      <Text noMargin color="inherit" size="body-small" style={{ opacity: 0.8 }}>
        {details}
      </Text>
    )}
  </span>
);

/**
 * Just the colored icon of a status, to be shown in dense lists
 * (project manager, extension editor...).
 */
export const GameplayTestStatusIcon = ({
  status,
}: {|
  status: GameplayTestDisplayStatus,
|}): React.Node => (
  <span
    className={classNames({
      [classes.iconOnly]: true,
      [statusClasses[status]]: true,
    })}
  >
    {renderStatusIcon(status)}
  </span>
);
