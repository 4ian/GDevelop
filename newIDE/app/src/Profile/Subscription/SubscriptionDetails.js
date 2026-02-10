// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import {
  hasMobileAppStoreSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
  isSubscriptionComingFromTeam,
} from '../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import LeftLoader from '../../UI/LeftLoader';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import {
  SubscriptionContext,
  type SubscriptionType,
} from './SubscriptionContext';
import Paper from '../../UI/Paper';
import PlanSmallCard from './PlanSmallCard';
import { isNativeMobileApp } from '../../Utils/Platform';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import IndividualPlans from './Icons/IndividualPlans';
import TeamPlans from './Icons/TeamPlans';
import EducationPlans from './Icons/EducationPlans';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';
import GetSubscriptionCard from './GetSubscriptionCard';
import AuthenticatedUserContext from '../AuthenticatedUserContext';

const styles = {
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
  paper: {
    paddingRight: 6,
    display: 'flex',
  },
  subscription: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
};

const subscriptionOptions: {
  [key: SubscriptionType]: {|
    title: React.Node,
    description: React.Node,
    icon: React.Node,
    buttonColor?: 'primary' | 'premium',
  |},
} = {
  individual: {
    title: <Trans>For Individuals</Trans>,
    description: <Trans>Hobbyists and indie devs</Trans>,
    icon: <IndividualPlans style={{ width: 115, height: 100 }} />,
    buttonColor: 'premium',
  },
  team: {
    title: <Trans>For Teams</Trans>,
    description: <Trans>Companies, studios and agencies</Trans>,
    icon: <TeamPlans style={{ width: 175, height: 100 }} />,
    buttonColor: 'premium',
  },
  education: {
    title: <Trans>For Education</Trans>,
    description: <Trans>Teachers, courses and universities</Trans>,
    icon: <EducationPlans style={{ width: 110, height: 100 }} />,
    buttonColor: 'premium',
  },
};

type Props = {
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
  isManageSubscriptionLoading,
  onManageSubscription,
  simulateNativeMobileApp,
}: Props) => {
  const {
    openSubscriptionDialog,
    getUserSubscriptionPlanEvenIfLegacy,
    getSubscriptionPlansWithPricingSystems,
  } = React.useContext(SubscriptionContext);
  const { subscription, subscriptionPricingSystem } = React.useContext(
    AuthenticatedUserContext
  );
  const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
  const userSubscriptionPlanWithPricingSystems = getUserSubscriptionPlanEvenIfLegacy();
  const { showAlert } = useAlertDialog();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const redemptionCodeExpirationDate =
    subscription && subscription.redemptionCodeValidUntil;
  const isSubscriptionExpired =
    !!redemptionCodeExpirationDate && redemptionCodeExpirationDate < Date.now();
  const isOnOrSimulateMobileApp =
    isNativeMobileApp() || simulateNativeMobileApp;

  const header = (
    <Line alignItems="center">
      <Column noMargin>
        <Text size="block-title">
          <Trans>Subscriptions</Trans>
        </Text>
        <Text size="body" noMargin>
          <Trans>
            Publish to Android, iOS, unlock more cloud projects, leaderboards,
            collaboration features and more online services.{' '}
            <Link
              href="https://gdevelop.io/pricing#feature-comparison"
              onClick={() =>
                Window.openExternalURL(
                  'https://gdevelop.io/pricing#feature-comparison'
                )
              }
            >
              Learn more
            </Link>
          </Trans>
        </Text>
      </Column>
    </Line>
  );

  if (!subscription || !subscriptionPlansWithPricingSystems) {
    return (
      <Column noMargin>
        {header}
        <PlaceholderLoader style={{ minHeight: 205 }} />
      </Column>
    );
  }

  return (
    <Column noMargin>
      {header}
      {userSubscriptionPlanWithPricingSystems &&
      userSubscriptionPlanWithPricingSystems.id &&
      !isSubscriptionExpired ? (
        isOnOrSimulateMobileApp ? (
          <Paper background="medium" variant="outlined" style={styles.paper}>
            <ResponsiveLineStackLayout
              alignItems="center"
              expand
              noMargin
              noResponsiveLandscape
            >
              <Column expand noMargin>
                <LineStackLayout alignItems="center">
                  <img
                    src="res/diamond.svg"
                    style={styles.diamondIcon}
                    alt="diamond"
                  />
                  <Text noMargin>
                    <Trans>
                      You have unlocked full access to GDevelop to create
                      without limits!
                    </Trans>
                  </Text>
                </LineStackLayout>
              </Column>
              <Column noMargin>
                <RaisedButton
                  label={<Trans>Manage subscription</Trans>}
                  primary
                  onClick={() => {
                    if (hasMobileAppStoreSubscriptionPlan(subscription)) {
                      // Would open App Store subscriptions settings.
                    } else {
                      showAlert({
                        title: t`Subscription outside the app store`,
                        message: t`The subscription of this account comes from outside the app store. Connect with your account on editor.gdevelop.io from your web-browser to manage it.`,
                      });
                    }
                  }}
                />
              </Column>
            </ResponsiveLineStackLayout>
          </Paper>
        ) : (
          // On web/desktop, displays the subscription as usual:
          <ColumnStackLayout noMargin>
            <PlanSmallCard
              subscriptionPlanWithPricingSystems={
                userSubscriptionPlanWithPricingSystems
              }
              subscriptionPricingSystem={subscriptionPricingSystem}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
              redemptionCodeExpirationDate={redemptionCodeExpirationDate}
              hidePrice={
                // A redemption code means the price does not really reflect what was paid, so we hide it.
                !!redemptionCodeExpirationDate ||
                hasMobileAppStoreSubscriptionPlan(subscription)
              }
              actions={[
                !redemptionCodeExpirationDate &&
                !hasMobileAppStoreSubscriptionPlan(subscription) &&
                !isSubscriptionComingFromTeam(subscription) &&
                !hasSubscriptionBeenManuallyAdded(subscription) ? (
                  <FlatButton
                    key="manage-payments"
                    label={
                      <LeftLoader isLoading={isManageSubscriptionLoading}>
                        <Trans>Manage payments</Trans>
                      </LeftLoader>
                    }
                    primary
                    onClick={onManageSubscription}
                    disabled={isManageSubscriptionLoading}
                  />
                ) : null,
                !isSubscriptionComingFromTeam(subscription) ? (
                  <RaisedButton
                    key="manage-subscription"
                    label={<Trans>Manage subscription</Trans>}
                    primary
                    onClick={() => {
                      openSubscriptionDialog({
                        analyticsMetadata: {
                          reason: 'Consult profile',
                          placementId: 'profile',
                        },
                      });
                    }}
                    disabled={isManageSubscriptionLoading}
                  />
                ) : null,
              ].filter(Boolean)}
              isHighlighted
              background="medium"
            />
          </ColumnStackLayout>
        )
      ) : !isSubscriptionExpired ? (
        isOnOrSimulateMobileApp ? (
          <GetSubscriptionCard
            label={<Trans>Choose a subscription</Trans>}
            subscriptionDialogOpeningReason="Consult profile"
            placementId="profile"
          >
            <Text noMargin>
              <Trans>
                Unlock full access to GDevelop to create without limits!
              </Trans>
            </Text>
          </GetSubscriptionCard>
        ) : (
          <ResponsiveLineStackLayout noColumnMargin noResponsiveLandscape>
            {Object.keys(subscriptionOptions).map(key => {
              const {
                title,
                description,
                icon,
                buttonColor,
              } = subscriptionOptions[key];
              return (
                <div
                  style={{
                    ...styles.subscription,
                    border: `1px solid ${gdevelopTheme.palette.secondary}`,
                  }}
                  key={key}
                >
                  <Column
                    expand
                    alignItems="center"
                    justifyContent="space-between"
                    noMargin
                    key={key}
                  >
                    {icon}
                    <Column noMargin alignItems="center" expand>
                      <Text size="sub-title" noMargin align="center">
                        {title}
                      </Text>
                      <Text
                        size="body-small"
                        noMargin
                        color="secondary"
                        align="center"
                      >
                        {description}
                      </Text>
                    </Column>
                    <Spacer />
                    <RaisedButton
                      color={buttonColor}
                      onClick={() =>
                        openSubscriptionDialog({
                          analyticsMetadata: {
                            reason: 'Consult profile',
                            placementId: 'profile',
                          },
                        })
                      }
                      label={<Trans>See plans</Trans>}
                      fullWidth
                    />
                  </Column>
                </div>
              );
            })}
          </ResponsiveLineStackLayout>
        )
      ) : (
        <GetSubscriptionCard
          label={<Trans>Choose a subscription</Trans>}
          subscriptionDialogOpeningReason="Consult profile"
          recommendedPlanId="gdevelop_silver"
          placementId="profile"
        >
          <Text noMargin>
            <Trans>
              Oh no! Your subscription from the redemption code has expired. You
              can renew it by redeeming a new code or getting a new
              subscription.
            </Trans>
          </Text>
        </GetSubscriptionCard>
      )}
    </Column>
  );
};

export default SubscriptionDetails;
