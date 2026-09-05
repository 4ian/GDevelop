// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Popover from '@material-ui/core/Popover';
import classNames from 'classnames';
import Paper from '../../UI/Paper';
import LinearProgress from '../../UI/LinearProgress';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import CircledInfo from '../../UI/CustomSvgIcons/CircledInfo';
import HelpQuestion from '../../UI/CustomSvgIcons/HelpQuestion';
import Coin from '../../Credits/Icons/Coin';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';
import classes from './AiUsageIndicator.module.css';

const helpPagePath = '/interface/ai/';
const helpPageAnchor = 'cost-of-ai-requests';

type UsageProps = {|
  quota: Quota,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
  /**
   * The share of the context of the opened chat already used (0 to 1, it can
   * exceed 1), or null when no chat is opened or when it's not known.
   */
  contextUsedRatio: ?number,
|};

const getAiCreditsLeft = (quota: Quota) => {
  const aiCreditsAvailable = Math.max(0, quota.max - quota.current);
  const percentage =
    quota.max > 0 ? Math.round((aiCreditsAvailable / quota.max) * 100) : 0;
  return { aiCreditsAvailable, percentage };
};

/** The date and time of the reset of the quota, or null if unknown or past. */
const getResetDateAndTime = (
  quota: Quota
): {| dateString: string, timeString: string |} | null => {
  if (!quota.resetsAt) return null;
  const resetDate = new Date(quota.resetsAt);
  if (resetDate.getTime() - Date.now() <= 0) return null;
  return {
    dateString: resetDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    timeString: resetDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
};

const renderResetSentence = (quota: Quota): React.Node => {
  const resetDateAndTime = getResetDateAndTime(quota);
  if (!resetDateAndTime) {
    return quota.period === '7days' ? (
      <Trans>Your AI credits for the week.</Trans>
    ) : quota.period === '30days' ? (
      <Trans>Your AI credits for the month.</Trans>
    ) : (
      <Trans>Your AI credits for the day.</Trans>
    );
  }
  const { dateString, timeString } = resetDateAndTime;
  return quota.period === '7days' ? (
    <Trans>
      Your weekly AI credits reset on {dateString} at {timeString}.
    </Trans>
  ) : quota.period === '30days' ? (
    <Trans>
      Your monthly AI credits reset on {dateString} at {timeString}.
    </Trans>
  ) : (
    <Trans>
      Your daily AI credits reset on {dateString} at {timeString}.
    </Trans>
  );
};

const UsageBar = ({
  ratio,
  level,
}: {|
  ratio: number,
  level: 'normal' | 'warning' | 'error',
|}): React.Node => (
  <div className={classes.bar} role="presentation">
    <div
      className={classNames(classes.barFill, {
        [classes.barFillWarning]: level === 'warning',
        [classes.barFillError]: level === 'error',
      })}
      style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }}
    />
  </div>
);

/**
 * The details of the AI usage: the AI credits left and when they reset, the
 * GDevelop credits used once they are consumed, and the context used by the
 * opened chat.
 */
export const AiUsagePopoverContent = ({
  quota,
  availableCredits,
  automaticallyUseCreditsForAiRequests,
  contextUsedRatio,
  onOpenSubscriptionDialog,
}: {|
  ...UsageProps,
  onOpenSubscriptionDialog: () => void,
|}): React.Node => {
  const { aiCreditsAvailable, percentage } = getAiCreditsLeft(quota);
  const contextUsedPercentage =
    contextUsedRatio != null ? Math.round(contextUsedRatio * 100) : null;
  const contextLevel =
    contextUsedPercentage == null
      ? 'normal'
      : contextUsedPercentage >= 100
      ? 'error'
      : contextUsedPercentage >= 80
      ? 'warning'
      : 'normal';

  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.content}>
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>
                <Trans>AI credits</Trans>
              </span>
              <span
                className={classNames(classes.sectionValue, {
                  [classes.sectionValueWarning]: quota.limitReached,
                })}
              >
                {quota.limitReached ? (
                  <Trans>All used</Trans>
                ) : (
                  <Trans>{percentage}% left</Trans>
                )}
              </span>
            </div>
            <UsageBar
              ratio={quota.max > 0 ? aiCreditsAvailable / quota.max : 0}
              level={quota.limitReached ? 'warning' : 'normal'}
            />
            <span className={classes.caption}>
              {renderResetSentence(quota)}
            </span>
          </div>
          <div className={classes.separator} />
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <span className={classes.sectionTitle}>
                <Trans>GDevelop credits</Trans>
              </span>
              <span className={classes.sectionValue}>
                <Coin fontSize="inherit" />
                {Math.max(0, availableCredits)}
              </span>
            </div>
            <span className={classes.caption}>
              {automaticallyUseCreditsForAiRequests ? (
                <Trans>
                  Used for the AI once your AI credits are all consumed.
                </Trans>
              ) : (
                <Trans>
                  Can be used for the AI once your AI credits are all consumed.
                </Trans>
              )}
            </span>
          </div>
          {contextUsedPercentage != null && (
            <>
              <div className={classes.separator} />
              <div className={classes.section}>
                <div className={classes.sectionHeader}>
                  <span className={classes.sectionTitle}>
                    <Trans>Chat context</Trans>
                  </span>
                  <span
                    className={classNames(classes.sectionValue, {
                      [classes.sectionValueWarning]: contextLevel === 'warning',
                      [classes.sectionValueError]: contextLevel === 'error',
                    })}
                  >
                    <Trans>{Math.min(100, contextUsedPercentage)}% used</Trans>
                  </span>
                </div>
                <UsageBar ratio={contextUsedRatio || 0} level={contextLevel} />
                <span className={classes.caption}>
                  {contextLevel === 'error' ? (
                    <Trans>
                      This chat is full: the AI wraps up. Start a new chat to
                      continue.
                    </Trans>
                  ) : contextLevel === 'warning' ? (
                    <Trans>
                      This chat is getting long: a new chat will be faster and
                      cheaper.
                    </Trans>
                  ) : (
                    <Trans>The memory of this chat used so far.</Trans>
                  )}
                </span>
              </div>
            </>
          )}
          <div className={classes.footer}>
            <button
              className={classes.needMoreButton}
              onClick={onOpenSubscriptionDialog}
            >
              <Trans>Need more?</Trans>
            </button>
            <button
              className={classes.helpButton}
              onClick={() =>
                Window.openExternalURL(
                  getHelpLink(helpPagePath, helpPageAnchor)
                )
              }
              title={i18n._(t`Learn more about the cost of AI requests`)}
              aria-label={i18n._(t`Learn more about the cost of AI requests`)}
            >
              <HelpQuestion fontSize="inherit" />
            </button>
          </div>
        </div>
      )}
    </I18n>
  );
};

type Props = {|
  quota: Quota | null,
  price: UsagePrice | null,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
  isRefreshingLimits?: boolean,
  /** Show only the bar and the icon, for narrow layouts. */
  hideLabel?: boolean,
  contextUsedRatio: ?number,
  onOpenSubscriptionDialog: () => void,
|};

/**
 * The compact AI usage shown next to the chat input (the AI credits left as a
 * small bar, or the GDevelop credits available once they are consumed), opening
 * a popover with the details.
 */
export const AiUsageIndicator = ({
  quota,
  price,
  availableCredits,
  automaticallyUseCreditsForAiRequests,
  isRefreshingLimits,
  hideLabel,
  contextUsedRatio,
  onOpenSubscriptionDialog,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [anchorElement, setAnchorElement] = React.useState<?HTMLElement>(null);
  const isOpen = !!anchorElement;
  const progressBarColor =
    gdevelopTheme.palette.type === 'light' ? '#7046EC' : '#9979F1';
  const progressTrackColor =
    gdevelopTheme.palette.type === 'light' ? '#D9D9DE' : '#32323B';

  if (!quota || !price) {
    if (isRefreshingLimits) {
      // No value yet: show only the indeterminate bar and the icon, no label.
      return (
        <div className={classes.trigger} aria-busy>
          <span className={classes.triggerBar}>
            <LinearProgress
              variant="indeterminate"
              barColor={progressBarColor}
              trackColor={progressTrackColor}
              style={{ height: 4, borderRadius: 2 }}
            />
          </span>
          <span className={classes.triggerIcon}>
            <CircledInfo color="inherit" fontSize="inherit" />
          </span>
        </div>
      );
    }
    // Placeholder to avoid layout shift.
    return <div className={classes.placeholder} />;
  }

  const { percentage } = getAiCreditsLeft(quota);
  const shouldShowCredits =
    quota.limitReached && automaticallyUseCreditsForAiRequests;

  return (
    <>
      <button
        className={classNames(classes.trigger, {
          [classes.triggerOpen]: isOpen,
        })}
        onClick={event => setAnchorElement(event.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        id="ai-usage-indicator"
      >
        {!hideLabel && (
          <span className={classes.triggerLabel}>
            {shouldShowCredits ? (
              <>
                <Coin fontSize="small" />
                <Trans>{Math.max(0, availableCredits)} credits available</Trans>
              </>
            ) : (
              <Trans>{percentage}% left</Trans>
            )}
          </span>
        )}
        {!shouldShowCredits && (
          <span className={classes.triggerBar}>
            <LinearProgress
              variant={isRefreshingLimits ? 'indeterminate' : 'determinate'}
              value={isRefreshingLimits ? undefined : percentage}
              barColor={progressBarColor}
              trackColor={progressTrackColor}
              style={{ height: 4, borderRadius: 2 }}
            />
          </span>
        )}
        <span className={classes.triggerIcon}>
          <CircledInfo color="inherit" fontSize="inherit" />
        </span>
      </button>
      <Popover
        open={isOpen}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ style: { borderRadius: 10, marginTop: -8 } }}
      >
        <Paper background="light">
          <AiUsagePopoverContent
            quota={quota}
            availableCredits={availableCredits}
            automaticallyUseCreditsForAiRequests={
              automaticallyUseCreditsForAiRequests
            }
            contextUsedRatio={contextUsedRatio}
            onOpenSubscriptionDialog={() => {
              setAnchorElement(null);
              onOpenSubscriptionDialog();
            }}
          />
        </Paper>
      </Popover>
    </>
  );
};
