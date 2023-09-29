// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import {
  getFormerSubscriptionPlans,
  getSubscriptionPlans,
  type Subscription,
  type PlanDetails,
  hasMobileAppStoreSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
} from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { SubscriptionSuggestionContext } from './SubscriptionSuggestionContext';
import Paper from '../../UI/Paper';
import PlanCard from './PlanCard';
import { isNativeMobileApp } from '../../Utils/Platform';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import AlertMessage from '../../UI/AlertMessage';

const styles = {
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
  paper: {
    paddingRight: 6,
  },
};

type Props = {
  subscription: ?Subscription,
  onManageSubscription: () => void | Promise<void>,
  isManageSubscriptionLoading: boolean,
  simulateNativeMobileApp?: boolean,
};

/**
 * Here are the possible cases:
 * - Subscription null: loading. (The backend always return a subscription)
 * - Subscription with no plan: show a message to invite the user to subscribe.
 * - Subscription bought:
 *   - with Stripe, they can easily manage it only as well as upgrade/downgrade.
 *   - with Paypal, in order to upgrade/downgrade, the subscription need to be canceled first.
 * - Subscription with a redemption code:
 *  - If the code is still valid, show a message to indicate when it will expire
 *    and show a warning if trying to buy a new one as it will cancel the current one.
 *  - If the code is expired, show a message to invite the user to re-subscribe.
 *    We will need to cancel the current expired subscription, but don't show a warning.
 */
const SubscriptionDetails = ({
  subscription,
  isManageSubscriptionLoading,
  onManageSubscription,
  simulateNativeMobileApp,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const { showAlert } = useAlertDialog();

  const userPlan = React.useMemo(
    () => {
      if (!subscription) return null;
      const possiblePlans: Array<PlanDetails> = getSubscriptionPlans().concat(
        getFormerSubscriptionPlans()
      );
      return possiblePlans.find(plan => subscription.planId === plan.planId);
    },
    [subscription]
  );

  const redemptionCodeExpirationDate =
    subscription && subscription.redemptionCodeValidUntil;
  const isSubscriptionExpired =
    !!redemptionCodeExpirationDate && redemptionCodeExpirationDate < Date.now();

  if (!subscription) return <PlaceholderLoader />;

  const isOnOrSimulateMobileApp =
    isNativeMobileApp() || simulateNativeMobileApp;

  return (
    <Column noMargin>
      <Line alignItems="center">
        <Text size="block-title">
          <Trans>My online services subscription</Trans>
        </Text>
      </Line>
      {userPlan && userPlan.planId && !isSubscriptionExpired ? (
        isOnOrSimulateMobileApp ? (
          <RaisedButton
            label={<Trans>Manage subscription</Trans>}
            primary
            onClick={() => {
              if (hasMobileAppStoreSubscriptionPlan(subscription)) {
                // Would open App Store subscriptions settings.
              } else {
                showAlert({
                  title: t`Subscription outside the app store`,
                  message: t`The subscription of this account comes from outside the app store. Connect with your account on gdevelop.io from your web-browser to manage it.`,
                });
              }
            }}
          />
        ) : (
          // On web/desktop, displays the subscription as usual:
          <ColumnStackLayout noMargin>
            <PlanCard
              plan={userPlan}
              hidePrice={
                // A redemption code means the price does not really reflect what was paid, so we hide it.
                !!redemptionCodeExpirationDate ||
                hasMobileAppStoreSubscriptionPlan(subscription) ||
                !!subscription.benefitsFromEducationPlan
              }
              actions={
                subscription.benefitsFromEducationPlan
                  ? null
                  : [
                      !redemptionCodeExpirationDate &&
                      !hasMobileAppStoreSubscriptionPlan(subscription) &&
                      !hasSubscriptionBeenManuallyAdded(subscription) ? (
                        <FlatButton
                          key="manage-online"
                          label={
                            <LeftLoader isLoading={isManageSubscriptionLoading}>
                              <Trans>Manage online</Trans>
                            </LeftLoader>
                          }
                          primary
                          onClick={onManageSubscription}
                          disabled={isManageSubscriptionLoading}
                        />
                      ) : null,
                      <RaisedButton
                        key="manage"
                        label={<Trans>Manage subscription</Trans>}
                        primary
                        onClick={() =>
                          openSubscriptionDialog({ reason: 'Consult profile' })
                        }
                        disabled={isManageSubscriptionLoading}
                      />,
                    ].filter(Boolean)
              }
              isHighlighted={false}
              background="medium"
            />
            {subscription.cancelAtPeriodEnd && (
              <AlertMessage kind="warning">
                <Trans>
                  Your subscription is being cancelled: you will lose the
                  benefits at the end of the period you already paid for.
                </Trans>
              </AlertMessage>
            )}
            {!!redemptionCodeExpirationDate && (
              <I18n>
                {({ i18n }) => (
                  <Paper background="dark" variant="outlined">
                    <LineStackLayout alignItems="center">
                      <img
                        src="res/diamond.svg"
                        style={styles.diamondIcon}
                        alt=""
                      />
                      <Column>
                        <Text>
                          <Trans>
                            Thanks to the redemption code you've used, you have
                            this subscription enabled until{' '}
                            {i18n.date(subscription.redemptionCodeValidUntil)}.
                          </Trans>
                        </Text>
                      </Column>
                    </LineStackLayout>
                  </Paper>
                )}
              </I18n>
            )}
          </ColumnStackLayout>
        )
      ) : (
        <Paper background="medium" variant="outlined" style={styles.paper}>
          <LineStackLayout alignItems="center">
            <img src="res/diamond.svg" style={styles.diamondIcon} alt="" />
            <Column expand>
              <Line>
                {!isSubscriptionExpired ? (
                  isOnOrSimulateMobileApp ? (
                    <Column noMargin>
                      <Text noMargin>
                        <Trans>
                          Unlock full access to GDevelop to create without
                          limits!
                        </Trans>
                      </Text>
                    </Column>
                  ) : (
                    <Column noMargin>
                      <Text noMargin>
                        <Trans>
                          Unlock more one-click exports, cloud projects,
                          leaderboards and remove the GDevelop splashscreen.
                        </Trans>
                      </Text>
                      <Text noMargin>
                        <Trans>
                          With a subscription, you’re also supporting the
                          improvement of GDevelop.
                        </Trans>
                      </Text>
                    </Column>
                  )
                ) : (
                  <Text noMargin>
                    <Trans>
                      Oh no! Your subscription from the redemption code has
                      expired. You can renew it by redeeming a new code or
                      getting a new subscription.
                    </Trans>
                  </Text>
                )}
              </Line>
              <Line justifyContent="flex-end">
                <RaisedButton
                  label={<Trans>Choose a subscription</Trans>}
                  primary
                  onClick={() =>
                    openSubscriptionDialog({ reason: 'Consult profile' })
                  }
                />
              </Line>
            </Column>
          </LineStackLayout>
        </Paper>
      )}
    </Column>
  );
};

export default SubscriptionDetails;
