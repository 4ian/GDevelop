// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  hasValidSubscriptionPlan,
  type Quota,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import GetSubscriptionCard from './Subscription/GetSubscriptionCard';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const styles = {
  subscriptionContainer: {
    display: 'flex',
    borderRadius: 10,
    alignItems: 'center',
  },
  diamondIcon: {
    width: 50,
    height: 50,
  },
};

type Props = {|
  subscription: ?Subscription,
  quota: ?Quota,
  numberOfPendingBuilds: number,
  onChangeSubscription: () => void,
|};

const CurrentUsageDisplayer = ({
  subscription,
  quota,
  numberOfPendingBuilds,
  onChangeSubscription,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (!quota || !subscription) return <PlaceholderLoader />;
  const isFeatureLocked = quota.max === 0;
  const hasSubscription = hasValidSubscriptionPlan(subscription);
  const usedBuilds = Math.min(quota.current + numberOfPendingBuilds, quota.max);
  const remainingBuilds = Math.max(quota.max - usedBuilds, 0);
  const usageRatio = `${usedBuilds}/${quota.max}`;
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
              <Column noMargin expand>
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
            makeButtonRaised={remainingBuilds === 0}
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
                    <Trans>
                      Need more power? Upgrade your GDevelop subscription to
                      increase the limits.
                    </Trans>
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
          makeButtonRaised={remainingBuilds === 0}
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
                  <Trans>
                    Increase your limits with a GDevelop subscription.
                  </Trans>
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
