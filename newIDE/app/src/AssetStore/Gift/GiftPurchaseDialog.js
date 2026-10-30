// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  getPurchaseCheckoutUrl,
  getStripeCheckoutUrl,
  getGiftClaimUrl,
  listInvoiceablePurchases,
  type GiftableProductListingData,
  type PurchaseWithProductName,
} from '../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import CircularProgress from '../../UI/CircularProgress';
import BackgroundText from '../../UI/BackgroundText';
import Mark from '../../UI/CustomSvgIcons/Mark';
import { Line, Spacer } from '../../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { useInterval } from '../../Utils/UseInterval';
import Window from '../../Utils/Window';
import { getUserUUID } from '../../Utils/Analytics/UserUUID';
import PasswordPromptDialog from '../PasswordPromptDialog';
import CopyGiftLinkButton from './CopyGiftLinkButton';

type Props = {|
  productListingData: GiftableProductListingData,
  usageType: string,
  onClose: () => void,
|};

const GiftPurchaseDialog = ({
  productListingData,
  usageType,
  onClose,
}: Props): React.Node => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const preferences = React.useContext(PreferencesContext);
  const { showAlert } = useAlertDialog();
  const [checkoutOpenedAt, setCheckoutOpenedAt] = React.useState<?number>(null);
  const [
    giftPurchase,
    setGiftPurchase,
  ] = React.useState<?PurchaseWithProductName>(null);
  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');

  const onStartPurchase = async () => {
    setDisplayPasswordPrompt(false);
    const price = productListingData.prices.find(
      price => price.usageType === usageType
    );
    if (!price) {
      console.error('Unable to find the price for the usage type', usageType);
      await showAlert({
        title: t`An error happened`,
        message: t`Unable to find the price for this product. Please try again later.`,
      });
      return;
    }

    // Logged-in buyers can choose between card and PayPal, others go straight to the card payment.
    const checkoutUrl = profile
      ? getPurchaseCheckoutUrl({
          productId: productListingData.id,
          priceName: price.name,
          userId: profile.id,
          userEmail: profile.email,
          language: preferences.values.language,
          password: password || undefined,
          isGift: true,
        })
      : getStripeCheckoutUrl({
          productId: productListingData.id,
          priceName: price.name,
          userUuid: getUserUUID(),
          password: password || undefined,
          isGift: true,
        });
    setPassword('');
    setCheckoutOpenedAt(Date.now());
    Window.openExternalURL(checkoutUrl);
  };

  const onWillPurchase = () => {
    // Password is required in dev environment only so that one cannot freely purchase products.
    if (Window.isDev()) setDisplayPasswordPrompt(true);
    else onStartPurchase();
  };

  const findGiftPurchase = React.useCallback(
    async () => {
      if (!profile || !checkoutOpenedAt) return;
      try {
        const purchases = await listInvoiceablePurchases(
          getAuthorizationHeader,
          profile.id
        );
        const newGiftPurchase = purchases.find(
          purchase =>
            purchase.isGift &&
            purchase.productId === productListingData.id &&
            new Date(purchase.createdAt).getTime() >= checkoutOpenedAt
        );
        if (newGiftPurchase) setGiftPurchase(newGiftPurchase);
      } catch (error) {
        console.error('Unable to check if the gift was bought:', error);
      }
    },
    [profile, checkoutOpenedAt, getAuthorizationHeader, productListingData.id]
  );

  // Only logged-in buyers can be shown the gift link: others find it in their email.
  useInterval(
    () => {
      findGiftPurchase();
    },
    profile && checkoutOpenedAt && !giftPurchase ? 3900 : null
  );

  const giftClaimUrl = giftPurchase ? getGiftClaimUrl(giftPurchase) : null;
  const productName = productListingData.name;

  const dialogContents = giftClaimUrl
    ? {
        subtitle: <Trans>Your gift is ready!</Trans>,
        content: (
          <ColumnStackLayout noMargin alignItems="center">
            <Text align="center">
              <Trans>
                Send this link to the person you want to offer {productName} to.
                They will be able to activate it on their GDevelop account. You
                also received it by email, and can find it again in your
                purchases, in your profile.
              </Trans>
            </Text>
            <CopyGiftLinkButton giftClaimUrl={giftClaimUrl} primary />
          </ColumnStackLayout>
        ),
      }
    : checkoutOpenedAt
    ? {
        subtitle: <Trans>Complete your payment on the web browser</Trans>,
        content: (
          <>
            {profile && (
              <Line justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
                <Spacer />
                <Text>
                  <Trans>Waiting for the purchase confirmation...</Trans>
                </Text>
              </Line>
            )}
            <Line justifyContent="center">
              <BackgroundText>
                <Trans>
                  Once you're done, you will receive an email with the link to
                  send to the person you want to offer {productName} to.
                </Trans>
              </BackgroundText>
            </Line>
          </>
        ),
      }
    : {
        subtitle: <Trans>Offer {productName} to someone</Trans>,
        content: (
          <Text align="center">
            <Trans>
              After the payment, you will receive a link by email. Send it to
              the person you want to offer {productName} to: they will be able
              to activate it on their GDevelop account.
            </Trans>
          </Text>
        ),
      };

  const dialogActions = [
    <FlatButton
      key="close"
      label={checkoutOpenedAt ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
      onClick={onClose}
    />,
    !checkoutOpenedAt ? (
      <DialogPrimaryButton
        key="continue"
        primary
        label={<Trans>Continue to payment</Trans>}
        onClick={onWillPurchase}
      />
    ) : null,
  ];

  return (
    <>
      <Dialog
        title={<Trans>Buy as a gift</Trans>}
        maxWidth="sm"
        open
        onRequestClose={onClose}
        // $FlowFixMe[incompatible-type]
        actions={dialogActions}
        onApply={checkoutOpenedAt ? onClose : onWillPurchase}
        flexColumnBody
        fullscreen="never-even-on-mobile"
      >
        <LineStackLayout justifyContent="center" alignItems="center">
          {giftClaimUrl && <Mark />}
          <Text size="sub-title" align="center">
            {dialogContents.subtitle}
          </Text>
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

export default GiftPurchaseDialog;
