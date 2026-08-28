// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import Text from '../../UI/Text';
import Coin from '../../Credits/Icons/Coin';
import Sparkle from '../../UI/CustomSvgIcons/Sparkle';
import CheckCircleFilled from '../../UI/CustomSvgIcons/CheckCircleFilled';
import ArrowRight from '../../UI/CustomSvgIcons/ArrowRight';
import { ChatActionButton } from './ChatActionButton';
import {
  type Quota,
  type SubscriptionPlanWithPricingSystems,
} from '../../Utils/GDevelopServices/Usage';
import {
  getPlanName,
  getPlanPricingSummary,
  getPlanUpsellBulletPoints,
  renderTextWithEmphasis,
} from '../../Profile/Subscription/SubscriptionUpsellUtils';
import classes from './AiCreditsLimitRow.module.css';

// Bullet points shown when the backend didn't send any for the plan (an older
// backend, or a plan without a simplified description).
const getFallbackBulletPoints = (): Array<React.Node> => [
  <Trans>Much more AI usage, every day</Trans>,
  <Trans>GDevelop credits included every month</Trans>,
  <Trans>Remove the export and publishing limits</Trans>,
];

/**
 * When the usage resets, as a short date ("Sep 3"), or null if unknown or
 * already past.
 */
const getResetDateString = (quota: ?Quota): string | null => {
  if (!quota || !quota.resetsAt) return null;
  const resetDate = new Date(quota.resetsAt);
  if (resetDate.getTime() - Date.now() <= 0) return null;
  return resetDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const renderResetSentence = (quota: ?Quota): React.Node => {
  const resetDateString = getResetDateString(quota);
  if (!resetDateString) return null;
  if (!quota) return null;
  return quota.period === '1day' ? (
    <Trans>Your free AI usage comes back on {resetDateString}.</Trans>
  ) : quota.period === '7days' ? (
    <Trans>Your weekly AI usage resets on {resetDateString}.</Trans>
  ) : (
    <Trans>Your monthly AI usage resets on {resetDateString}.</Trans>
  );
};

type Props = {|
  /** The plan to upsell. When absent, only the credits options are offered. */
  suggestedSubscriptionPlan: ?SubscriptionPlanWithPricingSystems,
  /** True when the user already pays for a plan (and can upgrade it). */
  hasSubscription: boolean,
  availableCredits: number,
  /**
   * True when the user has enough GDevelop credits to pay for a request, and is
   * not already paying with them: switching is then all they need to do.
   */
  canSwitchToGDevelopCredits: boolean,
  /** The AI credits quota, used to tell when the free usage comes back. */
  quota: ?Quota,
  onUpgradeSubscription: () => void,
  onSwitchToGDevelopCredits: () => void,
  onBuyCredits: () => void,
|};

/**
 * Shown at the end of the chat when the user ran out of AI credits: what
 * happened, and the two ways to keep building - a subscription (the best value,
 * so featured) or GDevelop credits (immediate, no commitment).
 */
export const AiCreditsLimitRow = ({
  suggestedSubscriptionPlan,
  hasSubscription,
  availableCredits,
  canSwitchToGDevelopCredits,
  quota,
  onUpgradeSubscription,
  onSwitchToGDevelopCredits,
  onBuyCredits,
}: Props): React.Node => {
  const resetSentence = renderResetSentence(quota);

  const renderContent = (i18n: I18nType) => {
    if (!suggestedSubscriptionPlan) {
      // Nothing to upsell (the user is already on the best plan): credits are
      // the only way to continue right now.
      return (
        <>
          <div className={classes.header}>
            <span className={classes.creditsBadge}>
              <Coin fontSize="inherit" />
            </span>
            <div className={classes.headerTexts}>
              <span className={classes.overline}>
                <Trans>AI usage limit reached</Trans>
              </span>
              <Text noMargin size="sub-title">
                <Trans>You're out of AI credits for now</Trans>
              </Text>
            </div>
          </div>
          <Text noMargin size="body-small" color="secondary">
            {canSwitchToGDevelopCredits ? (
              <>
                <Trans>
                  Switch to GDevelop credits to continue this conversation right
                  away - you have {availableCredits} credits left.
                </Trans>{' '}
                {resetSentence}
              </>
            ) : (
              <>
                <Trans>
                  Get GDevelop credits to continue this conversation right away.
                </Trans>{' '}
                {resetSentence}
              </>
            )}
          </Text>
          <div className={classes.actions}>
            {canSwitchToGDevelopCredits ? (
              <ChatActionButton
                emphasis="primary"
                icon={<Coin fontSize="inherit" />}
                label={<Trans>Use my {availableCredits} credits</Trans>}
                onClick={onSwitchToGDevelopCredits}
              />
            ) : (
              <ChatActionButton
                emphasis="premium"
                icon={<Coin fontSize="inherit" />}
                label={<Trans>Get credits</Trans>}
                onClick={onBuyCredits}
              />
            )}
          </div>
        </>
      );
    }

    const planName = getPlanName(i18n, suggestedSubscriptionPlan);
    const {
      monthlyPriceText,
      isBilledAnnually,
      discountPercentage,
    } = getPlanPricingSummary(suggestedSubscriptionPlan);
    const bulletPoints = getPlanUpsellBulletPoints({
      i18n,
      plan: suggestedSubscriptionPlan,
    });

    return (
      <>
        <div className={classes.header}>
          <span className={classes.premiumBadge}>
            <Sparkle fontSize="inherit" />
          </span>
          <div className={classes.headerTexts}>
            <span className={classes.overline}>
              <Trans>AI usage limit reached</Trans>
            </span>
            <Text noMargin size="sub-title">
              {hasSubscription ? (
                <Trans>Keep building - upgrade to {planName}</Trans>
              ) : (
                <Trans>Keep building with {planName}</Trans>
              )}
            </Text>
          </div>
        </div>

        <Text noMargin size="body-small" color="secondary">
          {resetSentence ? (
            <>
              {resetSentence}{' '}
              <Trans>Get more AI usage now, and a lot more with it:</Trans>
            </>
          ) : (
            <Trans>
              Get more AI usage to continue this conversation, and a lot more
              with it:
            </Trans>
          )}
        </Text>

        <ul className={classes.bullets}>
          {(bulletPoints.length > 0
            ? bulletPoints.map(bulletPoint =>
                renderTextWithEmphasis(bulletPoint)
              )
            : getFallbackBulletPoints()
          ).map((bulletPoint, index) => (
            <li key={index} className={classes.bullet}>
              <span className={classes.bulletIcon}>
                <CheckCircleFilled fontSize="inherit" />
              </span>
              <Text noMargin size="body-small">
                {bulletPoint}
              </Text>
            </li>
          ))}
        </ul>

        <div className={classes.actions}>
          <ChatActionButton
            emphasis="premium"
            label={
              hasSubscription ? (
                <Trans>Upgrade to {planName}</Trans>
              ) : (
                <Trans>Get {planName}</Trans>
              )
            }
            icon={<ArrowRight fontSize="inherit" />}
            onClick={onUpgradeSubscription}
          />
          {canSwitchToGDevelopCredits ? (
            <ChatActionButton
              icon={<Coin fontSize="inherit" />}
              label={<Trans>Use my {availableCredits} credits</Trans>}
              tooltip={
                <Trans>
                  Continue right away by paying this conversation with your
                  GDevelop credits.
                </Trans>
              }
              onClick={onSwitchToGDevelopCredits}
            />
          ) : (
            <ChatActionButton
              icon={<Coin fontSize="inherit" />}
              label={<Trans>Buy credits instead</Trans>}
              tooltip={
                <Trans>
                  Credits are a one-off purchase: use them for AI requests, in
                  the asset store and to publish your games.
                </Trans>
              }
              onClick={onBuyCredits}
            />
          )}
        </div>

        {monthlyPriceText && (
          <div className={classes.priceLine}>
            <Text noMargin size="body-small" color="secondary">
              {isBilledAnnually ? (
                <Trans>
                  From {monthlyPriceText}/month, billed annually - cancel
                  anytime.
                </Trans>
              ) : (
                <Trans>From {monthlyPriceText}/month - cancel anytime.</Trans>
              )}
            </Text>
            {discountPercentage ? (
              <span className={classes.discountChip}>
                <Trans>Save {discountPercentage}%</Trans>
              </span>
            ) : null}
          </div>
        )}
      </>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.container}>{renderContent(i18n)}</div>
      )}
    </I18n>
  );
};
