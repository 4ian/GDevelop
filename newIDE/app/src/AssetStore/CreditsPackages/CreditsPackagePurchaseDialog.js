// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  type CreditsPackageListingData,
  getPurchaseCheckoutUrl,
} from '../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CreateProfile from '../../Profile/CreateProfile';
import Text from '../../UI/Text';
import { useInterval } from '../../Utils/UseInterval';
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
  creditsPackageListingData: CreditsPackageListingData,
  onClose: () => void,
  onCloseWhenPurchaseSuccessful: () => void,
  simulateAppStoreProduct?: boolean,
|};

const CreditsPackagePurchaseDialog = ({
  creditsPackageListingData,
  onClose,
  onCloseWhenPurchaseSuccessful,
  simulateAppStoreProduct,
}: Props) => {
  const {
    profile,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    limits,
    onRefreshLimits,
  } = React.useContext(AuthenticatedUserContext);
  const [initialCreditsAmount, setInitialCreditsAmount] = React.useState(null);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
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
          creditsPackageListingData.appStoreProductId
        );
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    // Purchase with web.
    try {
      setIsPurchasing(true);
      const checkoutUrl = await getPurchaseCheckoutUrl({
        productId: creditsPackageListingData.id,
        priceName: creditsPackageListingData.prices[0].name,
        userId: profile.id,
        userEmail: profile.email,
        password,
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
    // Password is required in dev environment only so that one cannot freely purchase credits.
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

  useInterval(
    () => {
      onRefreshLimits();
    },
    isPurchasing ? 3900 : null
  );

  // Listen to the limits being loaded the first time (either when the dialog is opened, or when the user logs in)
  // In this case, save the user balance before the purchase.
  React.useEffect(
    () => {
      (async () => {
        if (limits && initialCreditsAmount === null) {
          setInitialCreditsAmount(limits.credits.userBalance.amount);
        }
      })();
    },
    [limits, initialCreditsAmount]
  );

  // If the limits change, check the user balance and close the dialog if the purchase was successful.
  React.useEffect(
    () => {
      if (initialCreditsAmount !== null && limits && isPurchasing) {
        const newCreditsAmount = limits.credits.userBalance.amount;
        if (newCreditsAmount > initialCreditsAmount) {
          setIsPurchasing(false);
          setPurchaseSuccessful(true);
        }
      }
    },
    [initialCreditsAmount, isPurchasing, purchaseSuccessful, limits]
  );

  const dialogContents = !profile
    ? {
        subtitle: <Trans>Log-in to purchase these credits</Trans>,
        content: (
          <CreateProfile
            onOpenLoginDialog={onOpenLoginDialog}
            onOpenCreateAccountDialog={onOpenCreateAccountDialog}
            message={
              <Trans>
                Credits will be linked to your user account. Log-in or sign-up
                to purchase them!
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
              <Trans>You can now use them across the app!</Trans>
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
                  Once you're done, come back to GDevelop and the credits will
                  be added to your account automatically.
                </Trans>
              </BackgroundText>
            </Line>
          </>
        ),
      }
    : !limits
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
            {creditsPackageListingData.name} will be added to your account
            {profile.email}.
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
    profile && !isPurchasing && !purchaseSuccessful && !!limits;
  const dialogActions = [
    <FlatButton
      key="cancel"
      label={purchaseSuccessful ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
      onClick={() => {
        if (purchaseSuccessful) {
          onCloseWhenPurchaseSuccessful();
        }

        onClose();
      }}
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
        title={creditsPackageListingData.name}
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

export default CreditsPackagePurchaseDialog;
