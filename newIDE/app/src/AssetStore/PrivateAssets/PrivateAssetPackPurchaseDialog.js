// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  listUserPurchases,
  type PrivateAssetPackListingData,
} from '../../Utils/GDevelopServices/Shop';
import Dialog from '../../UI/Dialog';
import TextButton from '../../UI/TextButton';
import RaisedButton from '../../UI/RaisedButton';
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

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  onSuccessfulPurchase: () => void,
  onClose: () => void,
  onCloseAfterSuccessfulPurchase: () => void,
|};

const PrivateAssetPackPurchaseDialog = ({
  privateAssetPackListingData,
  onClose,
  onCloseAfterSuccessfulPurchase,
  onSuccessfulPurchase,
}: Props) => {
  const {
    profile,
    getAuthorizationHeader,
    onLogin,
    onCreateAccount,
  } = React.useContext(AuthenticatedUserContext);
  const [isBuying, setIsBuying] = React.useState(false);
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);
  const onContinue = async () => {
    if (!profile) return;
    try {
      setIsBuying(true);
      const checkoutUrl = await getStripeCheckoutUrl(getAuthorizationHeader, {
        stripePriceId: privateAssetPackListingData.prices[0].stripePriceId,
        userId: profile.id,
        customerEmail: profile.email,
      });
      Window.openExternalURL(checkoutUrl);
    } catch (error) {
      console.error('Unable to get the checkout URL', error);
      setIsBuying(false);
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
        setIsBuying(false);
        setPurchaseSuccessful(true);
        onSuccessfulPurchase();
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
    isBuying ? 3900 : null
  );
  return (
    <Dialog
      title={<Trans>{privateAssetPackListingData.name}</Trans>}
      maxWidth="sm"
      open
      onRequestClose={onClose}
      actions={[
        <TextButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
        <RaisedButton
          key="continue"
          primary
          label={
            purchaseSuccessful ? <Trans>Close</Trans> : <Trans>Continue</Trans>
          }
          onClick={
            purchaseSuccessful ? onCloseAfterSuccessfulPurchase : onContinue
          }
          disabled={!profile || isBuying}
        />,
      ]}
      onApply={onContinue}
      flexColumnBody
    >
      {!profile ? (
        <CreateProfile
          onLogin={onLogin}
          onCreateAccount={onCreateAccount}
          message={
            <Trans>
              Asset packs will be linked to your user account. Create an account
              or login first to proceed with the purchase.
            </Trans>
          }
          justifyContent="center"
        />
      ) : purchaseSuccessful ? (
        <Text>
          <Trans>
            {privateAssetPackListingData.name} has now been added to your
            account!
          </Trans>
          <Trans>
            You can close this window and go back to the asset store to download
            your assets.
          </Trans>
        </Text>
      ) : isBuying ? (
        <>
          <Line>
            <Text>
              <b>
                <Trans>
                  Your browser will now open to enter your payment details.
                </Trans>
              </b>
            </Text>
          </Line>
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
      ) : (
        <>
          <Text>
            <Trans>
              You are about to purchase the asset pack{' '}
              <b>{privateAssetPackListingData.name}</b> and link it to your user
              account with email
              {profile.email}. You will be able to use it in all your projects.
            </Trans>
          </Text>
          <Text>
            <Trans>
              A new secure window will open to complete the purchase.
            </Trans>
          </Text>
        </>
      )}
    </Dialog>
  );
};

export default PrivateAssetPackPurchaseDialog;
