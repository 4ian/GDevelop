// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CreateProfile from '../../Profile/CreateProfile';
import Text from '../../UI/Text';
import { useInterval } from '../../Utils/UseInterval';
import { getPurchaseCheckoutUrl } from '../../Utils/GDevelopServices/Shop';
import Window from '../../Utils/Window';
import { Line, Spacer } from '../../UI/Grid';
import CircularProgress from '../../UI/CircularProgress';
import BackgroundText from '../../UI/BackgroundText';
import Mark from '../../UI/CustomSvgIcons/Mark';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import {
  shouldUseAppStoreProduct,
  purchaseAppStoreProduct,
} from '../../Utils/AppStorePurchases';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import PasswordPromptDialog from '../PasswordPromptDialog';

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  usageType: string,
  onClose: () => void,
  simulateAppStoreProduct?: boolean,
|};

const PrivateAssetPackPurchaseDialog = ({
  privateAssetPackListingData,
  usageType,
  onClose,
  simulateAppStoreProduct,
}: Props) => {
  const {
    profile,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    receivedAssetPacks,
    onPurchaseSuccessful,
    onRefreshAssetPackPurchases,
    assetPackPurchases,
  } = React.useContext(AuthenticatedUserContext);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [
    isCheckingPurchasesAfterLogin,
    setIsCheckingPurchasesAfterLogin,
  ] = React.useState(!receivedAssetPacks);
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);
  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');
  const { showAlert } = useAlertDialog();

  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const onStartPurchase = async () => {
    if (!profile) return;
    setDisplayPasswordPrompt(false);

    // Purchase with the App Store.
    if (shouldUseOrSimulateAppStoreProduct) {
      try {
        setIsPurchasing(true);
        await purchaseAppStoreProduct(
          privateAssetPackListingData.appStoreProductId
        );
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    const price = privateAssetPackListingData.prices.find(
      price => price.usageType === usageType
    );
    if (!price) {
      console.error('Unable to find the price for the usage type', usageType);
      await showAlert({
        title: t`An error happened`,
        message: t`Unable to find the price for this asset pack. Please try again later.`,
      });
      return;
    }

    // Purchase with web.
    try {
      setIsPurchasing(true);
      const checkoutUrl = getPurchaseCheckoutUrl({
        productId: privateAssetPackListingData.id,
        priceName: price.name,
        userId: profile.id,
        userEmail: profile.email,
        ...(password ? { password } : undefined),
      });
      Window.openExternalURL(checkoutUrl);
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      if (
        extractedStatusAndCode &&
        extractedStatusAndCode.status === 403 &&
        extractedStatusAndCode.code === 'auth/wrong-password'
      ) {
        await showAlert({
          title: t`Operation not allowed`,
          message: t`The password you entered is incorrect. Please try again.`,
        });
      } else {
        console.error('Unable to get the checkout URL', error);
        await showAlert({
          title: t`An error happened`,
          message: t`Unable to get the checkout URL. Please try again later.`,
        });
      }
      setIsPurchasing(false);
    } finally {
      setPassword('');
    }
  };

  const onWillPurchase = () => {
    // Password is required in dev environment only so that one cannot freely purchase asset packs.
    if (Window.isDev()) setDisplayPasswordPrompt(true);
    else onStartPurchase();
  };

  React.useEffect(
    () => {
      onWillPurchase();
    },
    // Launch the start process directly when the dialog is opened, to avoid an extra click.
    // eslint-disable-next-line
    []
  );

  React.useEffect(
    () => {
      const checkIfPurchaseIsDone = async () => {
        if (
          isPurchasing &&
          assetPackPurchases &&
          assetPackPurchases.find(
            userPurchase =>
              userPurchase.productId === privateAssetPackListingData.id
          )
        ) {
          // We found the purchase, the user has bought the asset pack.
          // We do not close the dialog yet, as we need to trigger a refresh of the products received.
          await onPurchaseSuccessful();
        }
      };
      checkIfPurchaseIsDone();
    },
    [
      isPurchasing,
      assetPackPurchases,
      privateAssetPackListingData,
      onPurchaseSuccessful,
      onRefreshAssetPackPurchases,
    ]
  );

  useInterval(
    () => {
      onRefreshAssetPackPurchases();
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
            onOpenLoginDialog={onOpenLoginDialog}
            onOpenCreateAccountDialog={onOpenCreateAccountDialog}
            message={
              <Trans>
                Asset packs will be linked to your user account and available
                for all your projects. Log-in or sign-up to purchase this pack
                (or restore your existing purchase).
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
                You can now go back to the asset store to use the assets in your
                games.
              </Trans>
            </Text>
          </Line>
        ),
      }
    : isPurchasing
    ? {
        subtitle: shouldUseOrSimulateAppStoreProduct ? (
          <Trans>Complete your purchase with the app store.</Trans>
        ) : (
          <Trans>Complete your payment on the web browser</Trans>
        ),
        content: shouldUseOrSimulateAppStoreProduct ? (
          <>
            <ColumnStackLayout justifyContent="center" alignItems="center">
              <CircularProgress size={40} />
              <Text>
                <Trans>
                  The purchase will be linked to your account once done.
                </Trans>
              </Text>
            </ColumnStackLayout>
          </>
        ) : (
          <>
            <Line justifyContent="center" alignItems="center">
              <CircularProgress size={20} />
              <Spacer />
              <Text>
                <Trans>Waiting for the purchase confirmation...</Trans>
              </Text>
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
            your account {profile.email}.
          </Trans>
        ),
        content: shouldUseOrSimulateAppStoreProduct ? null : (
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
        onClick={onWillPurchase}
      />
    ) : null,
  ];

  return (
    <>
      <Dialog
        title={<Trans>{privateAssetPackListingData.name}</Trans>}
        maxWidth="sm"
        open
        onRequestClose={onClose}
        actions={dialogActions}
        onApply={purchaseSuccessful ? onClose : onWillPurchase}
        cannotBeDismissed // Prevent the user from continuing by clicking outside.
        flexColumnBody
      >
        <LineStackLayout justifyContent="center" alignItems="center">
          {purchaseSuccessful && <Mark />}
          <Text size="sub-title">{dialogContents.subtitle}</Text>
        </LineStackLayout>
        {dialogContents.content}
      </Dialog>
      {displayPasswordPrompt && (
        <PasswordPromptDialog
          onApply={onStartPurchase}
          onClose={() => setDisplayPasswordPrompt(false)}
          passwordValue={password}
          setPasswordValue={setPassword}
        />
      )}
    </>
  );
};

export default PrivateAssetPackPurchaseDialog;
