// @flow
import * as React from 'react';
import RouterContext from '../MainFrame/RouterContext';
import { SubscriptionContext } from '../Profile/Subscription/SubscriptionContext';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from './GDevelopServices/InAppTutorial';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { t } from '@lingui/macro';
import { getListedBundle } from './GDevelopServices/Shop';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type OpenAskAiOptions } from '../AiGeneration/Utils';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';

type Props = {|
  openInAppTutorialDialog: (tutorialId: string) => void,
  openProfileDialog: () => void,
  openAskAi: (?OpenAskAiOptions) => void,
  openStandaloneDialog: () => void,
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
const useOpenInitialDialog = ({
  openInAppTutorialDialog,
  openProfileDialog,
  openAskAi,
  openStandaloneDialog,
}: Props) => {
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);
  const { openCreditsPackageDialog } = React.useContext(
    CreditsPackageStoreContext
  );
  const {
    onOpenCreateAccountDialog,
    onOpenCreateAccountWithPurchaseClaimDialog,
    onOpenPurchaseClaimDialog,
    onOpenLoginDialog,
    authenticated,
    loginState,
  } = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      async function openCorrespondingDialog() {
        switch (routeArguments['initial-dialog']) {
          case 'subscription':
            const recommendedPlanId =
              routeArguments['recommended-plan-id'] || 'gdevelop_silver';

            openSubscriptionDialog({
              analyticsMetadata: {
                reason: 'Landing dialog at opening',
                recommendedPlanId,
                placementId: 'opening-from-link',
              },
            });
            removeRouteArguments(['initial-dialog', 'recommended-plan-id']);
            break;
          case 'profile':
            if (loginState !== 'done') {
              // Wait for the login state to be done (user is authenticated or not) before opening the dialog.
              return;
            }

            if (authenticated) {
              openProfileDialog();
            } else {
              // Similar to signup param, except we open the login dialog,
              // this is meant for users who already have an account.
              onOpenLoginDialog();
            }
            removeRouteArguments(['initial-dialog']);
            break;
          case 'signup':
            if (loginState !== 'done') {
              // Wait for the login state to be done (user is authenticated or not) before opening the dialog.
              return;
            }

            try {
              const claimableToken = routeArguments['claimable-token'];
              const purchaseId = routeArguments['purchase-id'];
              // If there is no purchaseId or claimableToken, just open the signup/profile.
              if (!purchaseId || !claimableToken) {
                if (authenticated) {
                  openProfileDialog();
                } else {
                  onOpenCreateAccountDialog();
                }
                return;
              }

              // Otherwise, try to claim the purchase.
              const bundleId = routeArguments['bundle'];
              let claimedProduct = null;
              if (bundleId) {
                const listedBundle = await getListedBundle({
                  bundleId,
                  visibility: 'all',
                });
                claimedProduct = listedBundle;
              }

              if (!claimedProduct) {
                console.error(
                  `The bundle with id ${bundleId} does not exist. Cannot claim.`
                );
                await showAlert({
                  title: t`Unknown bundle`,
                  message: t`The bundle you are trying to claim does not exist anymore. Please contact support if you think this is an error.`,
                });
                return;
              }

              const claimedProductOptions = {
                productListingData: claimedProduct,
                purchaseId,
                claimableToken,
              };

              if (authenticated) {
                onOpenPurchaseClaimDialog(claimedProductOptions);
              } else {
                onOpenCreateAccountWithPurchaseClaimDialog(
                  claimedProductOptions
                );
              }
            } finally {
              removeRouteArguments([
                'initial-dialog',
                'purchase-id',
                'claimable-token',
                'bundle',
              ]);
            }
            break;
          case 'onboarding':
          case 'guided-lesson':
            const tutorialId = routeArguments['tutorial-id'];
            if (tutorialId) {
              openInAppTutorialDialog(tutorialId);
            } else {
              // backward compatibility, open the fling game tutorial.
              openInAppTutorialDialog(FLING_GAME_IN_APP_TUTORIAL_ID);
            }
            removeRouteArguments(['initial-dialog', 'tutorial-id']);
            break;
          case 'games-dashboard':
            // Do nothing as it should open the games dashboard on the homepage
            // in the manage tab. So the homepage handles the route arguments itself.
            break;
          case 'ask-ai':
            openAskAi({
              mode: 'agent',
              aiRequestId: null,
            });
            removeRouteArguments(['initial-dialog']);
            break;
          case 'standalone':
            openStandaloneDialog();
            // When on the standalone dialog,
            // we don't remove the route argument so that the user always comes back to it
            // when they come back from a checkout flow for instance.
            break;
          case 'credits-purchase':
            openCreditsPackageDialog();
            removeRouteArguments(['initial-dialog']);
            break;
          default:
            break;
        }
      }

      openCorrespondingDialog();
    },
    [
      routeArguments,
      openInAppTutorialDialog,
      openProfileDialog,
      openStandaloneDialog,
      removeRouteArguments,
      openSubscriptionDialog,
      authenticated,
      onOpenCreateAccountDialog,
      onOpenCreateAccountWithPurchaseClaimDialog,
      onOpenLoginDialog,
      openAskAi,
      loginState,
      showAlert,
      gdevelopTheme,
      onOpenPurchaseClaimDialog,
      openCreditsPackageDialog,
    ]
  );
};

export default useOpenInitialDialog;
