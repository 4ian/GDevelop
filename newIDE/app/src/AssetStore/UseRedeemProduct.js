// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  redeemProduct,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PasswordPromptDialog from './PasswordPromptDialog';
import Window from '../Utils/Window';

type RedeemableProductListingData =
  | PrivateAssetPackListingData
  | PrivateGameTemplateListingData;

/**
 * Claims a product given away to subscribers.
 */
const useRedeemProduct = (): {|
  onWillRedeemProduct: (
    productListingData: RedeemableProductListingData
  ) => void,
  redeemingProductId: ?string,
  passwordPromptDialog: React.Node,
|} => {
  const {
    profile,
    getAuthorizationHeader,
    onPurchaseSuccessful,
  } = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const [redeemingProductId, setRedeemingProductId] = React.useState<?string>(
    null
  );
  const [
    productListingDataWaitingForPassword,
    setProductListingDataWaitingForPassword,
  ] = React.useState<?RedeemableProductListingData>(null);
  const [password, setPassword] = React.useState<string>('');

  const onRedeemProduct = React.useCallback(
    async (productListingData: RedeemableProductListingData) => {
      if (!profile || redeemingProductId) return;
      setProductListingDataWaitingForPassword(null);
      setRedeemingProductId(productListingData.id);
      try {
        await redeemProduct({
          productListingData,
          getAuthorizationHeader,
          userId: profile.id,
          password,
        });
        await onPurchaseSuccessful();
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 402 &&
          extractedStatusAndCode.code ===
            'product-redemption/old-redeemed-subscription'
        ) {
          await showAlert({
            title: t`Error when claiming the product`,
            message: t`The monthly free asset pack perk was not part of your plan at the time you got your subscription to GDevelop. To enjoy this perk, please purchase a new subscription.`,
          });
        } else {
          console.error(
            'An error occurred when claiming the product:',
            extractedStatusAndCode
          );
          await showAlert({
            title: t`Error when claiming the product`,
            message: t`Something wrong happened when claiming the product. Please check your internet connection or try again later.`,
          });
        }
      } finally {
        setRedeemingProductId(null);
      }
    },
    [
      getAuthorizationHeader,
      profile,
      showAlert,
      password,
      onPurchaseSuccessful,
      redeemingProductId,
    ]
  );

  const onWillRedeemProduct = React.useCallback(
    (productListingData: RedeemableProductListingData) => {
      // Password is required in dev environment only so that one cannot freely claim products.
      if (Window.isDev())
        setProductListingDataWaitingForPassword(productListingData);
      else onRedeemProduct(productListingData);
    },
    [onRedeemProduct]
  );

  const passwordPromptDialog = productListingDataWaitingForPassword ? (
    <PasswordPromptDialog
      onApply={() => onRedeemProduct(productListingDataWaitingForPassword)}
      onClose={() => setProductListingDataWaitingForPassword(null)}
      passwordValue={password}
      setPasswordValue={setPassword}
    />
  ) : null;

  return { onWillRedeemProduct, redeemingProductId, passwordPromptDialog };
};

export default useRedeemProduct;
