// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import StatusChip, {
  StatusDot,
  StatusIcon,
  StatusSpinner,
  type StatusChipTone,
} from '../UI/StatusChip';
import CheckCircleFilled from '../UI/CustomSvgIcons/CheckCircleFilled';
import ErrorFilled from '../UI/CustomSvgIcons/ErrorFilled';
import WarningRound from '../UI/CustomSvgIcons/WarningRound';
import History from '../UI/CustomSvgIcons/History';
import Stop from '../UI/CustomSvgIcons/Stop';
import Pause from '../UI/CustomSvgIcons/Pause';

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
  | 'timeout'
  // The run was frozen because GDevelop was left in the background (the
  // browser stops running games in a hidden page) and did not finish. Says
  // nothing about the game: not a failure.
  | 'paused';

export const getDisplayStatusFromTest = (
  test: gdTest
): GameplayTestDisplayStatus => {
  const lastRunStatus = test.getLastRunStatus();
  if (
    lastRunStatus === 'passed' ||
    lastRunStatus === 'failed' ||
    lastRunStatus === 'error' ||
    lastRunStatus === 'stopped' ||
    lastRunStatus === 'timeout' ||
    lastRunStatus === 'paused'
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

const statusTones: { [GameplayTestDisplayStatus]: StatusChipTone } = {
  'never-run': 'neutral',
  launching: 'progress',
  running: 'progress',
  passed: 'success',
  failed: 'error',
  error: 'warning',
  stopped: 'neutral',
  timeout: 'warning',
  paused: 'info',
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
    case 'paused':
      return <Trans>Paused</Trans>;
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
      return <CheckCircleFilled />;
    case 'failed':
      return <ErrorFilled />;
    case 'error':
      return <WarningRound />;
    case 'timeout':
      return <History />;
    case 'stopped':
      return <Stop />;
    case 'paused':
      return <Pause />;
    case 'launching':
    case 'running':
      // The chip shows its own spinner for a status in progress.
      return null;
    case 'never-run':
    default:
      return <StatusDot />;
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
  <StatusChip
    tone={statusTones[status]}
    icon={renderStatusIcon(status)}
    loading={isGameplayTestStatusInProgress(status)}
    label={getGameplayTestStatusLabel(status)}
    details={details}
    size={size}
  />
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
  <StatusIcon
    tone={statusTones[status]}
    icon={
      isGameplayTestStatusInProgress(status) ? (
        <StatusSpinner />
      ) : (
        renderStatusIcon(status)
      )
    }
  />
);
