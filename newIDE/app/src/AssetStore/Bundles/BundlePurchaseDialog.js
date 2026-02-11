// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  getStripeCheckoutUrl,
  type BundleListingData,
} from '../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
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
import { getUserUUID } from '../../Utils/Analytics/UserUUID';
import { getNewestRedemptionCodeForBundle } from '../../Utils/GDevelopServices/Usage';
import ActivateSubscriptionPromptDialog from '../../Profile/ActivateSubscriptionPromptDialog';

type Props = {|
  bundleListingData: BundleListingData,
  usageType: string,
  onClose: () => void,
  simulateAppStoreProduct?: boolean,
  fastCheckout?: boolean,
  onCloseAfterPurchaseDone?: () => void,
|};

const BundlePurchaseDialog = ({
  bundleListingData,
  usageType,
  onClose,
  simulateAppStoreProduct,
  fastCheckout,
  onCloseAfterPurchaseDone,
}: Props) => {
  const {
    profile,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    receivedBundles,
    onPurchaseSuccessful,
    onRefreshBundlePurchases,
    bundlePurchases,
  } = React.useContext(AuthenticatedUserContext);
  const { openRedeemCodeDialog } = React.useContext(SubscriptionContext);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [
    isCheckingPurchasesAfterLogin,
    setIsCheckingPurchasesAfterLogin,
  ] = React.useState(!receivedBundles);
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);
  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');
  const { showAlert } = useAlertDialog();
  const [isOpeningUrl, setIsOpeningUrl] = React.useState(false);
  const [showActivatePrompt, setShowActivatePrompt] = React.useState(false);
  const [
    redemptionCodeToActivate,
    setRedemptionCodeToActivate,
  ] = React.useState<?string>(null);
  const { getAuthorizationHeader } = React.useContext(AuthenticatedUserContext);

  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const willReceiveAnEmailForThePurchase = !profile && fastCheckout;

  const onStartPurchase = async () => {
    setDisplayPasswordPrompt(false);

    // Purchase with the App Store.
    if (shouldUseOrSimulateAppStoreProduct) {
      if (!profile) {
        return;
      }

      try {
        setIsPurchasing(true);
        await purchaseAppStoreProduct(bundleListingData.appStoreProductId);
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    const price = bundleListingData.prices.find(
      price => price.usageType === usageType
    );
    if (!price) {
      console.error('Unable to find the price for the usage type', usageType);
      await showAlert({
        title: t`An error happened`,
        message: t`Unable to find the price for this bundle. Please try again later.`,
      });
      return;
    }

    // Purchase with web.
    try {
      setIsPurchasing(true);

      if (fastCheckout) {
        const checkoutUrl = getStripeCheckoutUrl({
          productId: bundleListingData.id,
          priceName: price.name,
          userId: profile ? profile.id : undefined,
          userEmail: profile ? profile.email : undefined,
          userUuid: profile ? undefined : getUserUUID(),
          password: password || undefined,
        });
        // Mark the Url as opening if opening in the same tab, as it can take some time to load.
        setIsOpeningUrl(willReceiveAnEmailForThePurchase);
        Window.openExternalURL(checkoutUrl, {
          shouldOpenInSameTabIfPossible: willReceiveAnEmailForThePurchase,
        });
        return;
      }

      // Cannot continue without a profile if not doing fast checkout.
      if (!profile) {
        return;
      }
      const checkoutUrl = getPurchaseCheckoutUrl({
        productId: bundleListingData.id,
        priceName: price.name,
        userId: profile.id,
        userEmail: profile.email,
        password: password || undefined,
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
    // Password is required in dev environment only so that one cannot freely purchase bundles.
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

  const onCloseDialog = React.useCallback(
    () => {
      if (onCloseAfterPurchaseDone && purchaseSuccessful) {
        onCloseAfterPurchaseDone();
      }
      onClose();
    },
    [onCloseAfterPurchaseDone, purchaseSuccessful, onClose]
  );

  // This effect will be triggered when the bundle purchases change,
  // to check if the user has just bought the product.
  React.useEffect(
    () => {
      const checkIfPurchaseIsDone = async () => {
        if (
          isPurchasing &&
          bundlePurchases &&
          bundlePurchases.find(
            userPurchase => userPurchase.productId === bundleListingData.id
          )
        ) {
          // We found the purchase, the user has bought the bundle.
          // We do not close the dialog yet, as we need to trigger a refresh of the products received.
          await onPurchaseSuccessful();
        }
      };
      checkIfPurchaseIsDone();
    },
    [
      isPurchasing,
      bundlePurchases,
      bundleListingData,
      onPurchaseSuccessful,
      onCloseAfterPurchaseDone,
      onRefreshBundlePurchases,
    ]
  );

  useInterval(
    () => {
      onRefreshBundlePurchases();
    },
    isPurchasing && !willReceiveAnEmailForThePurchase ? 3900 : null
  );

  // Listen to the received bundle, to know when a user has just logged in and the received bundles have been loaded.
  // In this case, start a timeout to remove the loader and give some time for the store to refresh.
  React.useEffect(
    () => {
      let timeoutId;
      (async () => {
        if (receivedBundles) {
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
    [receivedBundles]
  );

  // Fetch the newest redemption code for the bundle and show activation prompt
  const fetchNewestCodeAndPromptActivation = React.useCallback(
    async () => {
      if (
        !profile ||
        !bundleListingData.includedRedemptionCodes ||
        bundleListingData.includedRedemptionCodes.length === 0
      ) {
        return;
      }

      try {
        const code = await getNewestRedemptionCodeForBundle(
          getAuthorizationHeader,
          profile.id,
          bundleListingData
        );

        if (code) {
          setRedemptionCodeToActivate(code);
          setShowActivatePrompt(true);
        }
      } catch (error) {
        console.error('Error fetching redemption code:', error);
        // Silently fail - user can redeem manually later
      }
    },
    [profile, bundleListingData, getAuthorizationHeader]
  );

  // If the user has received this particular bundle, either:
  // - they just logged in, and already have it, so we close the dialog.
  // - they just bought it, we display the success message.
  React.useEffect(
    () => {
      if (receivedBundles) {
        const receivedBundle = receivedBundles.find(
          bundle => bundle.id === bundleListingData.id
        );
        if (receivedBundle) {
          if (isPurchasing) {
            setIsPurchasing(false);
            setPurchaseSuccessful(true);
            // Check if bundle has redemption codes and prompt for activation
            fetchNewestCodeAndPromptActivation();
          } else if (!purchaseSuccessful) {
            onCloseDialog();
          }
        }
      }
    },
    [
      receivedBundles,
      bundleListingData,
      isPurchasing,
      onCloseDialog,
      isCheckingPurchasesAfterLogin,
      purchaseSuccessful,
      fetchNewestCodeAndPromptActivation,
    ]
  );

  const dialogContents =
    !profile && !fastCheckout
      ? {
          subtitle: <Trans>Log-in to purchase this item</Trans>,
          content: (
            <CreateProfile
              onOpenLoginDialog={onOpenLoginDialog}
              onOpenCreateAccountDialog={onOpenCreateAccountDialog}
              message={
                <Trans>
                  Bundles and their content will be linked to your user account
                  and available for all your projects. Log-in or sign-up to
                  purchase this bundle. (or restore your existing purchase).
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
                <Trans>You can now go back to use your new bundle.</Trans>
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
              {!willReceiveAnEmailForThePurchase && (
                <Line justifyContent="center" alignItems="center">
                  <CircularProgress size={20} />
                  <Spacer />
                  <Text>
                    <Trans>Waiting for the purchase confirmation...</Trans>
                  </Text>
                </Line>
              )}
              <Spacer />
              <Line justifyContent="center">
                <BackgroundText>
                  {!willReceiveAnEmailForThePurchase ? (
                    <Trans>
                      Once you're done, come back to GDevelop and the bundle
                      will be added to your account automatically.
                    </Trans>
                  ) : (
                    <Trans>
                      Once you're done, you will receive an email confirmation
                      so that you can link the bundle to your account.
                    </Trans>
                  )}
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
          subtitle: profile ? (
            <Trans>
              The bundle {bundleListingData.name} will be linked to your account{' '}
              {profile.email}.
            </Trans>
          ) : (
            <Trans>
              The bundle {bundleListingData.name} will be sent to the email
              address provided in the checkout.
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
      label={
        isOpeningUrl ? (
          <Trans>Loading...</Trans>
        ) : purchaseSuccessful || willReceiveAnEmailForThePurchase ? (
          <Trans>Close</Trans>
        ) : (
          <Trans>Cancel</Trans>
        )
      }
      onClick={onCloseDialog}
      disabled={isOpeningUrl}
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
        title={<Trans>{bundleListingData.name}</Trans>}
        maxWidth="sm"
        open
        onRequestClose={onCloseDialog}
        actions={dialogActions}
        onApply={purchaseSuccessful ? onCloseDialog : onWillPurchase}
        flexColumnBody
        fullscreen="never-even-on-mobile"
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
      {showActivatePrompt && redemptionCodeToActivate && (
        <ActivateSubscriptionPromptDialog
          bundleListingData={bundleListingData}
          onActivateNow={() => {
            setShowActivatePrompt(false);
            openRedeemCodeDialog({
              codeToPrefill: redemptionCodeToActivate,
              autoSubmit: true,
            });
          }}
          onClose={() => {
            setShowActivatePrompt(false);
          }}
        />
      )}
    </>
  );
};

export default BundlePurchaseDialog;
