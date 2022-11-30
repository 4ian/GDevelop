// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  listUserPurchases,
  type PrivateAssetPackListingData,
} from '../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CreateProfile from '../../Profile/CreateProfile';
import Text from '../../UI/Text';
import { useInterval } from '../../Utils/UseInterval';
import { getStripeCheckoutUrl } from '../../Utils/GDevelopServices/Shop';
import Window from '../../Utils/Window';
import { Line, Spacer } from '../../UI/Grid';
import CircularProgress from '../../UI/CircularProgress';
import BackgroundText from '../../UI/BackgroundText';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Mark from '../../UI/CustomSvgIcons/Mark';
import FlatButton from '../../UI/FlatButton';
import { LineStackLayout } from '../../UI/Layout';

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  onSuccessfulPurchase: () => Promise<void>,
  onClose: () => void,
|};

const PrivateAssetPackPurchaseDialog = ({
  privateAssetPackListingData,
  onClose,
  onSuccessfulPurchase,
}: Props) => {
  const {
    profile,
    getAuthorizationHeader,
    onLogin,
    onCreateAccount,
    receivedAssetPacks,
  } = React.useContext(AuthenticatedUserContext);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [
    isCheckingPurchasesAfterLogin,
    setIsCheckingPurchasesAfterLogin,
  ] = React.useState(!receivedAssetPacks);
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);
  const onStartPurchase = async () => {
    if (!profile) return;
    try {
      setIsPurchasing(true);
      const checkoutUrl = await getStripeCheckoutUrl(getAuthorizationHeader, {
        stripePriceId: privateAssetPackListingData.prices[0].stripePriceId,
        userId: profile.id,
        customerEmail: profile.email,
      });
      Window.openExternalURL(checkoutUrl);
    } catch (error) {
      console.error('Unable to get the checkout URL', error);
      setIsPurchasing(false);
      showErrorBox({
        message: `Unable to get the checkout URL. Please try again later.`,
        rawError: error,
        errorId: 'asset-pack-checkout-error',
      });
    }
  };

  const checkUserPurchases = React.useCallback(
    async () => {
      if (!profile) return;
      try {
        const userPurchases = await listUserPurchases(getAuthorizationHeader, {
          userId: profile.id,
          productType: 'asset-pack',
          role: 'receiver',
        });
        if (
          userPurchases.find(
            userPurchase =>
              userPurchase.productId === privateAssetPackListingData.id
          )
        ) {
          // We found the purchase, the user has bought the asset pack.
          // We do not close the dialog yet, as we need to trigger a refresh of the asset store.
          await onSuccessfulPurchase();
        }
      } catch (error) {
        console.error('Unable to get the user purchases', error);
        showErrorBox({
          message: `An error happened while checking if your purchase was successful. If you have completed the payment, close and re-open the asset store to see your asset pack!`,
          rawError: error,
          errorId: 'asset-pack-purchase-error',
        });
      }
    },
    [
      profile,
      getAuthorizationHeader,
      privateAssetPackListingData,
      onSuccessfulPurchase,
    ]
  );

  useInterval(
    () => {
      checkUserPurchases();
    },
    isPurchasing ? 3900 : null
  );

  // Listen to the received asset pack, to know when a user has just logged in and the received asset packs have been loaded.
  // In this case, start a timeout to remove the loader and give some time for the asset store to refresh.
  React.useEffect(
    () => {
      let timeoutId;
      (async () => {
        if (receivedAssetPacks) {
          timeoutId = setTimeout(
            () => setIsCheckingPurchasesAfterLogin(false),
            3000
          );
        }
      })();
      return () => {
        clearTimeout(timeoutId);
      };
    },
    [receivedAssetPacks]
  );

  // If the user has received this particular pack, either:
  // - they just logged in, and already have it, so we close the dialog.
  // - they just bought it, we display the success message.
  React.useEffect(
    () => {
      if (receivedAssetPacks) {
        const receivedAssetPack = receivedAssetPacks.find(
          pack => pack.id === privateAssetPackListingData.id
        );
        if (receivedAssetPack) {
          if (isPurchasing) {
            setIsPurchasing(false);
            setPurchaseSuccessful(true);
          } else if (!purchaseSuccessful) {
            onClose();
          }
        }
      }
    },
    [
      receivedAssetPacks,
      privateAssetPackListingData,
      isPurchasing,
      onClose,
      isCheckingPurchasesAfterLogin,
      purchaseSuccessful,
    ]
  );

  const dialogContents = !profile
    ? {
        subtitle: <Trans>Log-in to purchase this item</Trans>,
        content: (
          <CreateProfile
            onLogin={onLogin}
            onCreateAccount={onCreateAccount}
            message={
              <Trans>
                Asset packs will be linked to your user account and available
                for all your projects. Log-in or sign-up to purchase this pack.
              </Trans>
            }
            justifyContent="center"
          />
        ),
      }
    : purchaseSuccessful
    ? {
        subtitle: <Trans>Your purchase has been processed!</Trans>,
        content: (
          <Line justifyContent="center" alignItems="center">
            <Text>
              <Trans>
                You can close this window and go back to the asset store to
                download your assets.
              </Trans>
            </Text>
          </Line>
        ),
      }
    : isPurchasing
    ? {
        subtitle: <Trans>Complete your payment on the web browser</Trans>,
        content: (
          <>
            <Line justifyContent="center" alignItems="center">
              <CircularProgress size={20} />
              <Spacer />
              <Text>Waiting for the purchase confirmation...</Text>
            </Line>
            <Spacer />
            <Line justifyContent="center">
              <BackgroundText>
                <Trans>
                  Once you're done, come back to GDevelop and the assets will be
                  added to your account automatically.
                </Trans>
              </BackgroundText>
            </Line>
          </>
        ),
      }
    : isCheckingPurchasesAfterLogin
    ? {
        subtitle: <Trans>Loading your profile...</Trans>,
        content: (
          <Line justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
          </Line>
        ),
      }
    : {
        subtitle: (
          <Trans>
            The asset pack {privateAssetPackListingData.name} will be linked to
            your account {profile.email}
          </Trans>
        ),
        content: (
          <Line justifyContent="center" alignItems="center">
            <Text>
              <Trans>
                A new secure window will open to complete the purchase.
              </Trans>
            </Text>
          </Line>
        ),
      };

  const allowPurchase =
    profile &&
    !isPurchasing &&
    !purchaseSuccessful &&
    !isCheckingPurchasesAfterLogin;
  const dialogActions = [
    <FlatButton
      key="cancel"
      label={purchaseSuccessful ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
      onClick={onClose}
    />,
    allowPurchase ? (
      <DialogPrimaryButton
        key="continue"
        primary
        label={<Trans>Continue</Trans>}
        onClick={onStartPurchase}
      />
    ) : null,
  ];

  return (
    <Dialog
      title={<Trans>{privateAssetPackListingData.name}</Trans>}
      maxWidth="sm"
      open
      onRequestClose={onClose}
      actions={dialogActions}
      onApply={purchaseSuccessful ? onClose : onStartPurchase}
      cannotBeDismissed // Prevent the user from continuing by clicking outside.
      flexColumnBody
    >
      <LineStackLayout justifyContent="center" alignItems="center">
        {purchaseSuccessful && <Mark />}
        <Text size="sub-title">{dialogContents.subtitle}</Text>
      </LineStackLayout>
      {dialogContents.content}
    </Dialog>
  );
};

export default PrivateAssetPackPurchaseDialog;
