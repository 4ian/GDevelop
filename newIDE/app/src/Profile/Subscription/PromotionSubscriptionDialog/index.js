// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  getRedirectToCheckoutUrl,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import { sendChoosePlanClicked } from '../../../Utils/Analytics/EventSender';
import Window from '../../../Utils/Window';
import Text from '../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import RedeemCodeDialog from '../../RedeemCodeDialog';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import { Column, Line } from '../../../UI/Grid';
import SubscriptionOptions from './SubscriptionOptions';
import PromotionSubscriptionPlan from './PromotionSubscriptionPlan';
import { getPlanSpecificRequirements } from '../SubscriptionDialog';
import AlertMessage from '../../../UI/AlertMessage';

type Props = {|
  onClose: Function,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[]),
  recommendedPlanId: string,
  onOpenPendingDialog: (open: boolean) => void,
|};

export default function PromotionSubscriptionDialog({
  onClose,
  subscriptionPlansWithPricingSystems,
  recommendedPlanId,
  onOpenPendingDialog,
}: Props) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [
    educationPlanSeatsCount,
    setEducationPlanSeatsCount,
  ] = React.useState<number>(20);
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const [
    availableRecommendedPlanId,
    setAvailableRecommendedPlanId,
  ] = React.useState(recommendedPlanId);
  const [selectedPlanId, setSelectedPlanId] = React.useState(recommendedPlanId);

  const buyPlan = async (
    i18n: I18nType,
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem
  ) => {
    const { subscription, profile } = authenticatedUser;
    if (!profile || !subscription) return;
    if (subscription.planId) {
      // User already has a subscription, this dialog should not be opened.
      return;
    }

    sendChoosePlanClicked({
      planId: subscriptionPlanPricingSystem.planId,
      pricingSystemId: subscriptionPlanPricingSystem.id,
    });
    onOpenPendingDialog(true);
    const isEducationPlan =
      subscriptionPlanPricingSystem &&
      subscriptionPlanPricingSystem.planId === 'gdevelop_education';
    const quantity = isEducationPlan ? educationPlanSeatsCount : undefined;
    Window.openExternalURL(
      getRedirectToCheckoutUrl({
        pricingSystemId: subscriptionPlanPricingSystem.id,
        userId: profile.id,
        userEmail: profile.email,
        quantity,
      })
    );
  };

  const purchasablePlansWithPricingSystems = React.useMemo(
    () =>
      subscriptionPlansWithPricingSystems
        ? subscriptionPlansWithPricingSystems.filter(
            subscriptionPlanWithPricingSystems =>
              // Hide free plan
              subscriptionPlanWithPricingSystems.pricingSystems.length > 0
          )
        : null,
    [subscriptionPlansWithPricingSystems]
  );

  // If the recommended plan is not available, select the first plan.
  React.useEffect(
    () => {
      if (purchasablePlansWithPricingSystems) {
        if (
          !purchasablePlansWithPricingSystems.find(
            purchasablePlanWithPricingSystems =>
              purchasablePlanWithPricingSystems.id === recommendedPlanId
          )
        ) {
          const firstPlanId = purchasablePlansWithPricingSystems[0].id;
          setSelectedPlanId(firstPlanId);
          setAvailableRecommendedPlanId(firstPlanId);
        }
      }
    },
    [purchasablePlansWithPricingSystems, recommendedPlanId]
  );

  const displayedPlan = React.useMemo(
    () =>
      purchasablePlansWithPricingSystems
        ? purchasablePlansWithPricingSystems.find(
            purchasablePlanWithPricingSystems =>
              purchasablePlanWithPricingSystems.id === selectedPlanId
          )
        : null,
    [purchasablePlansWithPricingSystems, selectedPlanId]
  );

  if (!displayedPlan) {
    return null;
  }

  const isLoading = isRefreshing;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Get GDevelop Premium</Trans>}
            subtitle={
              <Trans>
                Choose a subscription to enjoy the best of game creation.
              </Trans>
            }
            open
            onRequestClose={onClose}
            minHeight="lg"
            maxWidth="lg"
            flexColumnBody
            topBackgroundSrc={'res/premium/premium_dialog_background.png'}
          >
            <ColumnStackLayout noMargin justifyContent="space-between" expand>
              {!purchasablePlansWithPricingSystems ||
              authenticatedUser.loginState === 'loggingIn' ? (
                <PlaceholderLoader />
              ) : (
                <ColumnStackLayout expand noMargin>
                  <PromotionSubscriptionPlan
                    onClickRedeemCode={
                      !authenticatedUser.authenticated
                        ? authenticatedUser.onOpenCreateAccountDialog
                        : () => setRedeemCodeDialogOpen(true)
                    }
                    subscriptionPlanWithPricingSystems={displayedPlan}
                    disabled={isLoading}
                    onClickChoosePlan={async pricingSystem => {
                      if (!authenticatedUser.authenticated) {
                        authenticatedUser.onOpenCreateAccountDialog();
                      } else {
                        await buyPlan(i18n, pricingSystem);
                      }
                    }}
                    seatsCount={educationPlanSeatsCount}
                    setSeatsCount={setEducationPlanSeatsCount}
                  />
                  <SubscriptionOptions
                    subscriptionPlansWithPricingSystems={
                      purchasablePlansWithPricingSystems
                    }
                    selectedPlanId={selectedPlanId}
                    recommendedPlanId={availableRecommendedPlanId}
                    onClick={setSelectedPlanId}
                    disabled={isLoading}
                  />
                </ColumnStackLayout>
              )}
              <Line>
                <ColumnStackLayout noMargin>
                  <Column noMargin>
                    <LineStackLayout noMargin>
                      <Text size="sub-title">❤️</Text>
                      <Text size="sub-title">
                        <Trans>Support What You Love</Trans>
                      </Text>
                    </LineStackLayout>
                    <Text size="body" color="secondary">
                      <Trans>
                        The GDevelop project is open-source, powered by passion
                        and community. Your membership helps the GDevelop
                        company maintain servers, build new features, develop
                        commercial offerings and keep the open-source project
                        thriving. Our goal: make game development fast, fun and
                        accessible to all.
                      </Trans>
                    </Text>
                  </Column>
                  {getPlanSpecificRequirements(
                    i18n,
                    subscriptionPlansWithPricingSystems
                  ).map(planSpecificRequirements => (
                    <AlertMessage
                      kind="info"
                      key={planSpecificRequirements.substring(0, 25)}
                    >
                      {planSpecificRequirements}
                    </AlertMessage>
                  ))}
                </ColumnStackLayout>
              </Line>
            </ColumnStackLayout>
          </Dialog>
          {redeemCodeDialogOpen && (
            <RedeemCodeDialog
              authenticatedUser={authenticatedUser}
              onClose={async hasJustRedeemedCode => {
                setRedeemCodeDialogOpen(false);

                if (hasJustRedeemedCode) {
                  try {
                    setIsRefreshing(true);
                    await authenticatedUser.onRefreshSubscription();
                  } finally {
                    setIsRefreshing(false);
                    onOpenPendingDialog(true);
                  }
                }
              }}
            />
          )}
        </>
      )}
    </I18n>
  );
}
