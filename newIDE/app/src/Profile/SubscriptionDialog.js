// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Card from '../UI/Card';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { Column, Line } from '../UI/Grid';
import {
  getSubscriptionPlans,
  type PlanDetails,
  changeUserSubscription,
  getRedirectToCheckoutUrl,
  canSeamlesslyChangeSubscription,
} from '../Utils/GDevelopServices/Usage';
import RaisedButton from '../UI/RaisedButton';
import CheckCircle from '@material-ui/icons/CheckCircle';
import EmptyMessage from '../UI/EmptyMessage';
import { showMessageBox, showErrorBox } from '../UI/Messages/MessageBox';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import {
  sendSubscriptionDialogShown,
  sendChoosePlanClicked,
} from '../Utils/Analytics/EventSender';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import Window from '../Utils/Window';
import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import useConfirmDialog from '../UI/Confirm/useConfirmDialog';

const styles = {
  descriptionText: {
    marginLeft: 16,
    marginRight: 16,
  },
  bulletIcon: { width: 20, height: 20, marginLeft: 5, marginRight: 10 },
  bulletText: { flex: 1 },
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
};

const cancelConfirmationTexts = {
  title: t`Cancel your subscription`,
  message: t`Are you sure you want to cancel your subscription?`,
};
const seamlesslyChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`Are you sure you want to subscribe to this new plan? Your next payment will be pro-rated.`,
};
const cancelAndChangeConfirmationTexts = {
  title: t`Cancel then get a new subscription`,
  message: t`To get a new subscription, we need to cancel your existing one before you can pay for the new one. The change will be immediate but your payment will NOT be pro-rated (you will have to pay as for a new subscription).`,
};

type Props = {|
  open: boolean,
  onClose: Function,
|};

export default function SubscriptionDialog({ open, onClose }: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [
    subscriptionPendingDialogOpen,
    setSubscriptionPendingDialogOpen,
  ] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showConfirmation } = useConfirmDialog();

  React.useEffect(
    () => {
      if (open) {
        sendSubscriptionDialogShown();
      }
    },
    [open]
  );

  const choosePlan = async (i18n: I18nType, plan: PlanDetails) => {
    const { getAuthorizationHeader, subscription, profile } = authenticatedUser;
    if (!profile || !subscription) return;
    sendChoosePlanClicked(plan.planId);

    // Subscribing from an account without a subscription.
    if (
      !subscription.stripeSubscriptionId &&
      !subscription.paypalSubscriptionId
    ) {
      setSubscriptionPendingDialogOpen(true);
      Window.openExternalURL(
        getRedirectToCheckoutUrl(plan.planId || '', profile.id, profile.email)
      );
      return;
    }

    const { planId } = plan;
    if (!planId) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(cancelConfirmationTexts);
      if (!answer) return;

      setIsChangingSubscription(true);
      try {
        await changeUserSubscription(getAuthorizationHeader, profile.id, {
          planId: null,
        });
        await authenticatedUser.onRefreshUserProfile();
        showMessageBox(
          i18n._(
            t`Your subscription is now cancelled. We're sorry to see you go!`
          )
        );
      } catch (rawError) {
        await authenticatedUser.onRefreshUserProfile();
        showErrorBox({
          message: i18n._(
            t`Your subscription could not be cancelled. Please try again later!`
          ),
          rawError,
          errorId: 'subscription-update-error',
        });
      } finally {
        setIsChangingSubscription(false);
      }
    } else {
      // Changing the existing subscription.
      const isSeamlessChange = canSeamlesslyChangeSubscription(subscription);
      const confirmDialogTexts = isSeamlessChange
        ? seamlesslyChangeConfirmationTexts
        : cancelAndChangeConfirmationTexts;

      const answer = await showConfirmation(confirmDialogTexts);
      if (!answer) return;

      if (isSeamlessChange) {
        // Changing the existing subscription without asking for payment details again.
        setIsChangingSubscription(true);
        try {
          await changeUserSubscription(getAuthorizationHeader, profile.id, {
            planId: plan.planId,
          });
          await authenticatedUser.onRefreshUserProfile();
          showMessageBox(
            i18n._(
              t`Congratulations, your new subscription is now active! You can now use the services unlocked with this plan.`
            )
          );
        } catch (rawError) {
          showErrorBox({
            message: i18n._(
              t`Your subscription could not be updated. Please try again later!`
            ),
            rawError,
            errorId: 'subscription-update-error',
          });
        } finally {
          setIsChangingSubscription(false);
        }
      } else {
        // Changing the existing subscription by cancelling first.
        setIsChangingSubscription(true);
        try {
          await changeUserSubscription(getAuthorizationHeader, profile.id, {
            planId: '',
          });
          await authenticatedUser.onRefreshUserProfile();
        } catch (rawError) {
          showErrorBox({
            message: i18n._(
              t`Your subscription could not be cancelled. Please try again later!`
            ),
            rawError,
            errorId: 'subscription-update-error',
          });
        } finally {
          setIsChangingSubscription(false);
        }

        // Then redirect as if a new subscription is being chosen.
        setSubscriptionPendingDialogOpen(true);
        Window.openExternalURL(
          getRedirectToCheckoutUrl(planId, profile.id, profile.email)
        );
      }
    }
  };

  const isLoading =
    !authenticatedUser.subscription ||
    !authenticatedUser.profile ||
    isChangingSubscription;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              key="close"
              primary={false}
              onClick={onClose}
            />,
          ]}
          title={<Trans>GDevelop Premium</Trans>}
          onRequestClose={onClose}
          open={open}
        >
          <ColumnStackLayout noMargin expand>
            <LineStackLayout noMargin alignItems="center">
              <img src="res/diamond.svg" style={styles.diamondIcon} alt="" />
              <Text>
                <Trans>
                  Get a subscription to unlock more one-click exports and other
                  exclusive features as a premium creator in our community. With
                  a subscription, you're also supporting the development of
                  GDevelop, which is an open-source software.
                </Trans>
              </Text>
              <FlatButton
                style={{ flexShrink: 0 }}
                label={<Trans>Read more</Trans>}
                onClick={() =>
                  Window.openExternalURL('https://gdevelop.io/pricing')
                }
              />
            </LineStackLayout>
            {getSubscriptionPlans().map(plan => {
              const isCurrentPlan =
                !!authenticatedUser.subscription &&
                authenticatedUser.subscription.planId === plan.planId;
              return (
                <Card key={plan.planId || ''} isHighlighted={isCurrentPlan}>
                  <Text size="block-title">
                    <span>
                      <b>{plan.name}</b>{' '}
                      {!plan.monthlyPriceInEuros ? null : (
                        <>
                          - <Trans>{plan.monthlyPriceInEuros}€/month</Trans>
                        </>
                      )}
                    </span>
                  </Text>
                  <Text size="sub-title">
                    {plan.smallDescription ? i18n._(plan.smallDescription) : ''}
                  </Text>
                  <Column noMargin>
                    {plan.descriptionBullets.map((descriptionBullet, index) => (
                      <Column key={index} expand>
                        <Line noMargin alignItems="center">
                          {authenticatedUser.subscription &&
                          authenticatedUser.subscription.planId ===
                            plan.planId ? (
                            <CheckCircle
                              style={{
                                ...styles.bulletIcon,
                                color: gdevelopTheme.message.valid,
                              }}
                            />
                          ) : (
                            <CheckCircle style={styles.bulletIcon} />
                          )}
                          <Text style={styles.bulletText}>
                            {i18n._(descriptionBullet.message)}
                          </Text>
                        </Line>
                      </Column>
                    ))}
                  </Column>
                  <LineStackLayout expand justifyContent="flex-end">
                    {authenticatedUser.subscription &&
                    authenticatedUser.subscription.planId === plan.planId ? (
                      <FlatButton
                        disabled
                        label={<Trans>This is your current plan</Trans>}
                        onClick={() => choosePlan(i18n, plan)}
                      />
                    ) : plan.planId ? (
                      <LeftLoader isLoading={isLoading}>
                        <RaisedButton
                          primary
                          disabled={isLoading}
                          label={<Trans>Choose this plan</Trans>}
                          onClick={() => choosePlan(i18n, plan)}
                        />
                      </LeftLoader>
                    ) : (
                      <LeftLoader isLoading={isLoading}>
                        <FlatButton
                          disabled={isLoading}
                          label={<Trans>Cancel your subscription</Trans>}
                          onClick={() => choosePlan(i18n, plan)}
                        />
                      </LeftLoader>
                    )}
                  </LineStackLayout>
                </Card>
              );
            })}
            <Column>
              <Line>
                <EmptyMessage>
                  <Trans>
                    Subscriptions can be stopped at any time. GDevelop uses
                    Stripe.com and PayPal for secure payment. No credit card
                    data is stored by GDevelop: everything is managed by
                    Stripe.com or PayPal secure infrastructure.
                  </Trans>
                </EmptyMessage>
              </Line>
            </Column>
            {!authenticatedUser.authenticated && (
              <PlaceholderMessage>
                <Text>
                  <Trans>
                    Create a GDevelop account to continue. It's free and you'll
                    be able to access to online services like one-click builds:
                  </Trans>
                </Text>
                <LineStackLayout justifyContent="center">
                  <RaisedButton
                    label={<Trans>Create my account</Trans>}
                    primary
                    onClick={authenticatedUser.onCreateAccount}
                  />
                  <FlatButton
                    label={<Trans>Not now, thanks</Trans>}
                    onClick={onClose}
                  />
                </LineStackLayout>
              </PlaceholderMessage>
            )}
            {subscriptionPendingDialogOpen && (
              <SubscriptionPendingDialog
                authenticatedUser={authenticatedUser}
                onClose={() => {
                  setSubscriptionPendingDialogOpen(false);
                  authenticatedUser.onRefreshUserProfile();
                }}
              />
            )}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}
