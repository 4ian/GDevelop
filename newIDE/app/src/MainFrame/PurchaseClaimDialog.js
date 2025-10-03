// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  claimPurchase,
  type BundleListingData,
} from '../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import Mark from '../UI/CustomSvgIcons/Mark';
import FlatButton from '../UI/FlatButton';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import RouterContext from './RouterContext';

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
  productListingData: ?BundleListingData, // Add more product types in the future.
  purchaseId: string,
  claimableToken: string,
  onClose: () => void,
|};

const PurchaseClaimDialog = ({
  productListingData,
  purchaseId,
  claimableToken,
  onClose,
}: Props) => {
  const {
    getAuthorizationHeader,
    profile,
    onPurchaseSuccessful,
    onRefreshBundlePurchases,
  } = React.useContext(AuthenticatedUserContext);
  const [isActivating, setIsActivating] = React.useState(false);
  const [isPurchaseActivated, setIsPurchaseActivated] = React.useState(false);
  const { showAlert } = useAlertDialog();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { navigateToRoute } = React.useContext(RouterContext);
  const shouldClaimOnOpen = React.useRef(!profile);

  const activatePurchase = React.useCallback(
    async () => {
      if (!profile || isActivating || isPurchaseActivated) return;

      setIsActivating(true);
      let updatedPurchase = null;
      try {
        updatedPurchase = await claimPurchase({
          getAuthorizationHeader,
          purchaseId,
          claimableToken,
          userId: profile.id,
        });
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        let message = t`An error occurred while activating your purchase. Please contact support if the problem persists.`;
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 400 &&
          extractedStatusAndCode.code === 'purchase/already-claimed'
        ) {
          message = t`This purchase has already been activated.`;
        } else if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 403
        ) {
          if (extractedStatusAndCode.code === 'purchase/cannot-claim') {
            message = t`This purchase cannot be claimed.`;
          } else if (extractedStatusAndCode.code === 'purchase/invalid-token') {
            message = t`The token used to claim this purchase is invalid.`;
          }
        } else if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 404
        ) {
          message = t`This purchase could not be found. Please contact support for more information.`;
        } else if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 409
        ) {
          if (extractedStatusAndCode.code === 'purchase/already-owned') {
            message = t`This account already owns this product, you cannot activate it again.`;
          }
        } else if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 500
        ) {
          message = t`The server is currently unavailable. Please try again later.`;
        }
        showAlert({
          title: t`Could not activate purchase`,
          message,
        });
        setIsActivating(false);
        onClose();
        return;
      }

      try {
        if (updatedPurchase.productType === 'BUNDLE') {
          await onRefreshBundlePurchases();
          navigateToRoute('learn', {
            bundle: updatedPurchase.productId,
          });
        }
        onPurchaseSuccessful();
      } finally {
        setIsActivating(false);
        setIsPurchaseActivated(true);
      }
    },
    [
      profile,
      isActivating,
      getAuthorizationHeader,
      purchaseId,
      claimableToken,
      showAlert,
      onRefreshBundlePurchases,
      onPurchaseSuccessful,
      onClose,
      isPurchaseActivated,
      navigateToRoute,
    ]
  );

  React.useEffect(
    () => {
      if (profile && shouldClaimOnOpen.current) {
        // The user has just logged in or signed up, so we can proceed with the
        // claim.
        activatePurchase();
        shouldClaimOnOpen.current = false; // Ensure we don't try to claim again if profile changes.
      }
    },
    [profile, activatePurchase]
  );

  if (!profile) {
    // The dialog is meant to be displayed as soon as the user is authenticated.
    // If they're not, they can be in the middle of logging in or signing up, so
    // we don't show anything, until they're logged in.
    return null;
  }

  const productType = productListingData
    ? productListingData.productType
    : 'product';
  const productName = productListingData ? productListingData.name : '';

  const dialogContents = isPurchaseActivated
    ? {
        subtitle: <Trans>Your {productType} has been activated!</Trans>,
        content: (
          <Line justifyContent="center" alignItems="center" noMargin>
            <Text>
              <Trans>You can now go back to use your new product.</Trans>
            </Text>
          </Line>
        ),
      }
    : {
        subtitle: (
          <Trans>
            The {productType} {productName} will be linked to your account{' '}
            {profile.email}
          </Trans>
        ),
        content: null,
      };

  const dialogActions = [
    <FlatButton
      key="cancel"
      label={isPurchaseActivated ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
      onClick={onClose}
      disabled={isActivating}
    />,
    !isPurchaseActivated ? (
      <DialogPrimaryButton
        key="activate"
        primary
        label={
          isActivating ? <Trans>Activating...</Trans> : <Trans>Activate</Trans>
        }
        onClick={activatePurchase}
        disabled={isActivating}
      />
    ) : null,
  ];

  return (
    <Dialog
      title={<Trans>Activate {productName}</Trans>}
      maxWidth="md"
      open
      onRequestClose={onClose}
      actions={dialogActions}
      onApply={isPurchaseActivated ? onClose : activatePurchase}
      cannotBeDismissed // Prevent the user from continuing by clicking outside.
      flexColumnBody
    >
      <ResponsiveLineStackLayout noMargin alignItems="center">
        {productListingData && (
          <CorsAwareImage
            style={{
              ...styles.previewImage,
              background: gdevelopTheme.paper.backgroundColor.light,
            }}
            src={productListingData.thumbnailUrls[0]}
            alt={`Preview image of product ${productListingData.name}`}
          />
        )}
        <Column>
          <LineStackLayout
            justifyContent="flex-start"
            alignItems="center"
            noMargin
          >
            {isPurchaseActivated && <Mark />}
            <Text size="sub-title">{dialogContents.subtitle}</Text>
          </LineStackLayout>
          {dialogContents.content}
        </Column>
      </ResponsiveLineStackLayout>
    </Dialog>
  );
};

export default PurchaseClaimDialog;
