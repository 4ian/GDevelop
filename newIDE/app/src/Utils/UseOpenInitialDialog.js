// @flow
import * as React from 'react';
import RouterContext from '../MainFrame/RouterContext';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from './GDevelopServices/InAppTutorial';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { t, Trans } from '@lingui/macro';
import Text from '../UI/Text';
import {
  getListedBundle,
  type BundleListingData,
} from './GDevelopServices/Shop';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ColumnStackLayout } from '../UI/Layout';

const styles = {
  previewImage: {
    width: '100%',
    maxWidth: 400,
    display: 'block',
    objectFit: 'contain',
    borderRadius: 8,
    border: '1px solid lightgrey',
    boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    transition: 'opacity 0.3s ease-in-out',
    position: 'relative',
  },
};

type Props = {|
  openInAppTutorialDialog: (tutorialId: string) => void,
  openProfileDialog: () => void,
  openAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
  openStandaloneDialog: () => void,
  openPurchaseClaimDialogWhenAuthenticated: ({|
    productListingData: ?BundleListingData,
    purchaseId: string,
    claimableToken: string,
  |}) => void,
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
  openPurchaseClaimDialogWhenAuthenticated,
}: Props) => {
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const {
    onOpenCreateAccountDialog,
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
          case 'signup':
            if (loginState !== 'done') {
              // Wait for the login state to be done (user is authenticated or not) before opening the dialog.
              return;
            }

            const claimableToken = routeArguments['claimable-token'];
            const purchaseId = routeArguments['purchase-id'];
            if (purchaseId && claimableToken) {
              const bundleId = routeArguments['bundle'];
              let claimedProduct = null;
              if (bundleId) {
                const listedBundle = await getListedBundle({
                  bundleId,
                  visibility: 'all',
                });
                if (!listedBundle) {
                  console.error(
                    `The bundle with id ${bundleId} does not exist. Cannot claim.`
                  );
                  await showAlert({
                    title: t`Unknown bundle`,
                    message: t`The bundle you are trying to claim does not exist anymore. Please contact support if you think this is an error.`,
                  });
                  removeRouteArguments([
                    'initial-dialog',
                    'purchase-id',
                    'claimable-token',
                    'bundle',
                  ]);
                  return;
                }
                claimedProduct = listedBundle;
              }

              openPurchaseClaimDialogWhenAuthenticated({
                purchaseId,
                claimableToken,
                productListingData: claimedProduct,
              });
              if (!authenticated) {
                onOpenCreateAccountDialog({
                  customHeader: (
                    <ColumnStackLayout
                      justifyContent="center"
                      alignItems="center"
                      noMargin
                    >
                      {claimedProduct &&
                        claimedProduct.productType === 'BUNDLE' && (
                          <CorsAwareImage
                            style={{
                              ...styles.previewImage,
                              background:
                                gdevelopTheme.paper.backgroundColor.light,
                            }}
                            src={claimedProduct.thumbnailUrls[0]}
                            alt={`Preview image of bundle ${
                              claimedProduct.name
                            }`}
                          />
                        )}
                      <Text size="section-title" align="center" noMargin>
                        <Trans>
                          Login or create an account to activate your purchase!
                        </Trans>
                      </Text>
                    </ColumnStackLayout>
                  ),
                });
              }

              removeRouteArguments([
                'initial-dialog',
                'purchase-id',
                'claimable-token',
                'bundle',
              ]);
              return;
            }

            if (authenticated) {
              openProfileDialog();
            } else {
              onOpenCreateAccountDialog();
            }
            removeRouteArguments([
              'initial-dialog',
              'purchase-id',
              'claimable-token',
            ]);
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
              paneIdentifier: 'center',
            });
            removeRouteArguments(['initial-dialog']);
            break;
          case 'standalone':
            openStandaloneDialog();
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
      onOpenLoginDialog,
      openAskAi,
      loginState,
      showAlert,
      gdevelopTheme,
      openPurchaseClaimDialogWhenAuthenticated,
    ]
  );
};

export default useOpenInitialDialog;
