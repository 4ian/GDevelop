// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  canUpgradeSubscription,
  hasValidSubscriptionPlan,
  type Quota,
  type Subscription,
  type UsagePrice,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import GetSubscriptionCard from './Subscription/GetSubscriptionCard';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import AuthenticatedUserContext from './AuthenticatedUserContext';

const styles = {
  subscriptionContainer: {
    display: 'flex',
    borderRadius: 10,
    alignItems: 'center',
  },
  diamondIcon: {
    width: 50,
    height: 50,
    // Prevent cumulative layout shift by enforcing the ratio.
    aspectRatio: '1',
  },
};

type Props = {|
  subscription: ?Subscription,
  quota: ?Quota,
  usagePrice: ?UsagePrice,
  onChangeSubscription: () => void,
  onStartBuildWithCredits: () => void,
  hidePurchaseWithCredits?: boolean,
|};

const CurrentUsageDisplayer = ({
  subscription,
  quota,
  usagePrice,
  onChangeSubscription,
  onStartBuildWithCredits,
  hidePurchaseWithCredits,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const { profile, limits } = React.useContext(AuthenticatedUserContext);
  const usageCreditPrice = usagePrice ? usagePrice.priceInCredits : 0;

  const onPurchaseBuildWithCredits = React.useCallback(
    () => {
      if (!profile || !limits || !usageCreditPrice) {
        return;
      }

      const currentCreditsAmount = limits.credits.userBalance.amount;
      if (currentCreditsAmount < usageCreditPrice) {
        openCreditsPackageDialog({
          missingCredits: usageCreditPrice - currentCreditsAmount,
        });
        return;
      }

      openCreditsUsageDialog({
        title: <Trans>Start build with credits</Trans>,
        message: (
          <Trans>
            You are about to use {usageCreditPrice} credits to start this build.
            Continue?
          </Trans>
        ),
        onConfirm: async () => {
          // We do not await for the build to start, we assume
          // that the ExportLauncher will handle the error if the build fails.
          onStartBuildWithCredits();
        },
        successMessage: <Trans>Build started!</Trans>,
        closeAutomaticallyAfterSuccess: true,
      });
    },
    [
      profile,
      limits,
      usageCreditPrice,
      openCreditsUsageDialog,
      onStartBuildWithCredits,
      openCreditsPackageDialog,
    ]
  );

  if (!quota || !subscription || !usagePrice) return <PlaceholderLoader />;

  const isFeatureLocked = quota.max === 0;
  const hasSubscription = hasValidSubscriptionPlan(subscription);
  const remainingBuilds = Math.max(quota.max - quota.current, 0);
  const usageRatio = `${quota.current}/${quota.max}`;
  const remainingMultipleMessage =
    quota.period === '30days' ? (
      <Trans>
        You have <b>{remainingBuilds}</b> builds remaining — you have used
        {usageRatio} in the past 30 days.
      </Trans>
    ) : (
      <Trans>
        You have <b>{remainingBuilds}</b> builds remaining — you have used
        {usageRatio} in the past 24h.
      </Trans>
    );
  const remainingSingleMessage =
    quota.period === '30days' ? (
      <Trans>
        You have <b>{remainingBuilds}</b> build remaining — you have used
        {usageRatio} in the past 30 days.
      </Trans>
    ) : (
      <Trans>
        You have <b>{remainingBuilds}</b> build remaining — you have used
        {usageRatio} in the past 24h.
      </Trans>
    );

  const cannotUpgradeSubscription = !canUpgradeSubscription(subscription);

  return (
    <ColumnStackLayout noMargin>
      {hasSubscription ? (
        !quota.limitReached ? (
          <div
            style={{
              ...styles.subscriptionContainer,
              border: `1px solid ${gdevelopTheme.palette.secondary}`,
            }}
          >
            <img
              src="res/diamond.svg"
              style={styles.diamondIcon}
              alt="diamond"
            />
            <Line>
              <Column expand>
                <Text noMargin>
                  {remainingBuilds === 1
                    ? remainingSingleMessage
                    : remainingMultipleMessage}
                </Text>
              </Column>
            </Line>
          </div>
        ) : (
          <GetSubscriptionCard
            subscriptionDialogOpeningReason={
              !isFeatureLocked ? 'Build limit reached' : 'Unlock build type'
            }
            label={<Trans>Upgrade your subscription</Trans>}
            makeButtonRaised
            payWithCreditsOptions={
              hidePurchaseWithCredits
                ? undefined
                : {
                    label: (
                      <Trans>Purchase with {usageCreditPrice} credits</Trans>
                    ),
                    onPayWithCredits: onPurchaseBuildWithCredits,
                  }
            }
            hideButton={cannotUpgradeSubscription}
          >
            <Line>
              {!isFeatureLocked ? (
                <Column noMargin>
                  <Text noMargin>{remainingMultipleMessage}</Text>
                  <Text noMargin>
                    {cannotUpgradeSubscription ? (
                      <Trans>Use GDevelop credits to start an export.</Trans>
                    ) : (
                      <Trans>
                        Use GDevelop credits or upgrade your subscription to
                        increase the limits.
                      </Trans>
                    )}
                  </Text>
                </Column>
              ) : (
                <Column noMargin>
                  <Text noMargin>
                    <Trans>
                      Upgrade your GDevelop subscription to unlock this
                      packaging.
                    </Trans>
                  </Text>
                </Column>
              )}
            </Line>
          </GetSubscriptionCard>
        )
      ) : (
        <GetSubscriptionCard
          subscriptionDialogOpeningReason={
            !isFeatureLocked ? 'Build limit reached' : 'Unlock build type'
          }
          label={<Trans>Get a subscription</Trans>}
          makeButtonRaised={quota.limitReached}
          payWithCreditsOptions={
            !quota.limitReached || hidePurchaseWithCredits
              ? undefined
              : {
                  label: (
                    <Trans>Purchase with {usageCreditPrice} credits</Trans>
                  ),
                  onPayWithCredits: onPurchaseBuildWithCredits,
                }
          }
        >
          <Line>
            {!isFeatureLocked ? (
              <Column noMargin>
                <Text noMargin>
                  {remainingBuilds === 1
                    ? remainingSingleMessage
                    : remainingMultipleMessage}
                </Text>
                <Text noMargin>
                  {quota.limitReached ? (
                    <Trans>
                      Use GDevelop credits or get a subscription to increase the
                      limits.
                    </Trans>
                  ) : (
                    <Trans>
                      Get a GDevelop subscription to increase the limits.
                    </Trans>
                  )}
                </Text>
              </Column>
            ) : (
              <Column noMargin>
                <Text noMargin>
                  <Trans>Get a subscription to unlock this packaging.</Trans>
                </Text>
              </Column>
            )}
          </Line>
        </GetSubscriptionCard>
      )}
    </ColumnStackLayout>
  );
};

export default CurrentUsageDisplayer;
