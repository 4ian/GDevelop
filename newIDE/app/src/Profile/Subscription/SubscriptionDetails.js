// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import {
  type SubscriptionPlanWithPricingSystems,
  type Subscription,
  hasMobileAppStoreSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
  getSubscriptionPlanPricingSystem,
  canPriceBeFoundInGDevelopPrices,
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
  SubscriptionSuggestionContext,
  type SubscriptionType,
} from './SubscriptionSuggestionContext';
import Paper from '../../UI/Paper';
import PlanSmallCard from './PlanSmallCard';
import { isNativeMobileApp } from '../../Utils/Platform';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import AlertMessage from '../../UI/AlertMessage';
import IndividualPlans from './Icons/IndividualPlans';
import TeamPlans from './Icons/TeamPlans';
import EducationPlans from './Icons/EducationPlans';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import PlaceholderError from '../../UI/PlaceholderError';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';

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
  |},
} = {
  individual: {
    title: <Trans>For Individuals</Trans>,
    description: <Trans>Hobbyists and indie devs</Trans>,
    icon: <IndividualPlans style={{ width: 115, height: 100 }} />,
  },
  team: {
    title: <Trans>For Teams</Trans>,
    description: <Trans>Companies, studios and agencies</Trans>,
    icon: <TeamPlans style={{ width: 175, height: 100 }} />,
  },
  education: {
    title: <Trans>For Education</Trans>,
    description: <Trans>Teachers, courses and universities</Trans>,
    icon: <EducationPlans style={{ width: 110, height: 100 }} />,
  },
};

type Props = {
  subscription: ?Subscription,
  subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[],
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
  subscriptionPlansWithPricingSystems,
  isManageSubscriptionLoading,
  onManageSubscription,
  simulateNativeMobileApp,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const { showAlert } = useAlertDialog();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [
    userSubscriptionPlanWithPricingSystems,
    setUserSubscriptionPlanWithPricingSystems,
  ] = React.useState<?SubscriptionPlanWithPricingSystems>(null);
  const [error, setError] = React.useState<?React.Node>(null);
  const [isLoadingUserPrice, setIsLoadingUserPrice] = React.useState<boolean>(
    false
  );

  React.useEffect(
    () => {
      (async () => {
        setError(null);
        setIsLoadingUserPrice(true);
        try {
          if (!subscription) {
            setUserSubscriptionPlanWithPricingSystems(null);
            return;
          }

          const { planId, pricingSystemId } = subscription;
          if (!planId || !pricingSystemId) {
            setUserSubscriptionPlanWithPricingSystems(null);
            return;
          }

          const matchingSubscriptionPlanWithPrices = subscriptionPlansWithPricingSystems.find(
            plan => subscription.planId === plan.id
          );
          if (!matchingSubscriptionPlanWithPrices) {
            setError(
              <Trans>
                Couldn't find a subscription matching your account. Please get
                in touch with us to fix this issue.
              </Trans>
            );
            setUserSubscriptionPlanWithPricingSystems(null);
            return;
          }

          const {
            pricingSystems,
            ...subscriptionPlan
          } = matchingSubscriptionPlanWithPrices;

          if (!canPriceBeFoundInGDevelopPrices(pricingSystemId)) {
            setUserSubscriptionPlanWithPricingSystems({
              ...subscriptionPlan,
              pricingSystems: [],
            });
            return;
          }

          let pricingSystem = pricingSystems.find(
            price => price.id === subscription.pricingSystemId
          );
          if (!pricingSystem) {
            pricingSystem = await getSubscriptionPlanPricingSystem(
              pricingSystemId
            );
          }
          if (!pricingSystem) {
            setError(
              <Trans>
                Couldn't find a subscription price matching your account. Please
                get in touch with us to fix this issue.
              </Trans>
            );
            setUserSubscriptionPlanWithPricingSystems(null);
            return;
          }

          setUserSubscriptionPlanWithPricingSystems({
            ...subscriptionPlan,
            pricingSystems: [pricingSystem],
          });
        } finally {
          setIsLoadingUserPrice(false);
        }
      })();
    },
    [subscription, subscriptionPlansWithPricingSystems]
  );

  const redemptionCodeExpirationDate =
    subscription && subscription.redemptionCodeValidUntil;
  const isSubscriptionExpired =
    !!redemptionCodeExpirationDate && redemptionCodeExpirationDate < Date.now();
  const isOnOrSimulateMobileApp =
    isNativeMobileApp() || simulateNativeMobileApp;

  if (error) {
    return <PlaceholderError>{error}</PlaceholderError>;
  }
  if (!subscription || isLoadingUserPrice) {
    return <PlaceholderLoader />;
  }

  return (
    <Column noMargin>
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
      {userSubscriptionPlanWithPricingSystems &&
      userSubscriptionPlanWithPricingSystems.id &&
      !isSubscriptionExpired ? (
        isOnOrSimulateMobileApp ? (
          <Paper background="medium" variant="outlined" style={styles.paper}>
            <ResponsiveLineStackLayout alignItems="center" expand noMargin>
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
                        message: t`The subscription of this account comes from outside the app store. Connect with your account on gdevelop.io from your web-browser to manage it.`,
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
                      <RaisedButton
                        key="manage-subscription"
                        label={<Trans>Manage subscription</Trans>}
                        primary
                        onClick={() =>
                          openSubscriptionDialog({
                            analyticsMetadata: { reason: 'Consult profile' },
                          })
                        }
                        disabled={isManageSubscriptionLoading}
                      />,
                    ].filter(Boolean)
              }
              isHighlighted
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
                    <LineStackLayout alignItems="center" noMargin>
                      <img
                        src="res/diamond.svg"
                        style={styles.diamondIcon}
                        alt="diamond"
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
      ) : !isSubscriptionExpired ? (
        isOnOrSimulateMobileApp ? (
          <Paper background="medium" variant="outlined" style={styles.paper}>
            <ResponsiveLineStackLayout alignItems="center" expand noMargin>
              <Column expand noMargin>
                <LineStackLayout alignItems="center">
                  <img
                    src="res/diamond.svg"
                    style={styles.diamondIcon}
                    alt="diamond"
                  />
                  <Text noMargin>
                    <Trans>
                      Unlock full access to GDevelop to create without limits!
                    </Trans>
                  </Text>
                </LineStackLayout>
              </Column>
              <Column noMargin>
                <RaisedButton
                  label={<Trans>Choose a subscription</Trans>}
                  primary
                  onClick={() =>
                    openSubscriptionDialog({
                      analyticsMetadata: { reason: 'Consult profile' },
                    })
                  }
                />
              </Column>
            </ResponsiveLineStackLayout>
          </Paper>
        ) : (
          <ResponsiveLineStackLayout noColumnMargin>
            {Object.keys(subscriptionOptions).map(key => {
              const { title, description, icon } = subscriptionOptions[key];
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
                      primary
                      onClick={() =>
                        openSubscriptionDialog({
                          analyticsMetadata: { reason: 'Consult profile' },
                          filter: key,
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
        <Paper background="medium" variant="outlined" style={styles.paper}>
          <ResponsiveLineStackLayout alignItems="center" expand noMargin>
            <Column expand noMargin>
              <LineStackLayout alignItems="center">
                <img
                  src="res/diamond.svg"
                  style={styles.diamondIcon}
                  alt="diamond"
                />
                <Text noMargin>
                  <Trans>
                    Oh no! Your subscription from the redemption code has
                    expired. You can renew it by redeeming a new code or getting
                    a new subscription.
                  </Trans>
                </Text>
              </LineStackLayout>
            </Column>
            <Column noMargin>
              <RaisedButton
                label={<Trans>Choose a subscription</Trans>}
                primary
                onClick={() =>
                  openSubscriptionDialog({
                    analyticsMetadata: { reason: 'Consult profile' },
                  })
                }
              />
            </Column>
          </ResponsiveLineStackLayout>
        </Paper>
      )}
    </Column>
  );
};

export default SubscriptionDetails;
