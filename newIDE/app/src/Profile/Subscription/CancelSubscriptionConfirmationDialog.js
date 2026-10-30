// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { ImageWithFallback } from '../../UI/ImageWithFallback';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import {
  getClaimableProductListingDatas,
  listGivenAwayProducts,
  listListedPrivateAssetPacks,
  listListedPrivateGameTemplates,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
import { type SubscriptionPlanWithPricingSystems } from '../../Utils/GDevelopServices/Usage';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import useRedeemProduct from '../../AssetStore/UseRedeemProduct';

type ProductListingData =
  | PrivateAssetPackListingData
  | PrivateGameTemplateListingData;

const styles = {
  thumbnail: {
    width: 120,
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
  },
};

const getNextMonthStartDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const getMonth = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

type Props = {|
  userSubscriptionPlanEvenIfLegacy: ?SubscriptionPlanWithPricingSystems,
  onConfirm: () => void,
  onClose: () => void,
|};

/**
 * Asks to confirm the cancellation, showing the free products the user
 * has not claimed yet and, for monthly subscriptions, the ones of next month.
 */
const CancelSubscriptionConfirmationDialog = ({
  userSubscriptionPlanEvenIfLegacy,
  onConfirm,
  onClose,
}: Props): React.Node => {
  const {
    subscription,
    receivedAssetPacks,
    receivedGameTemplates,
  } = React.useContext(AuthenticatedUserContext);
  const {
    onWillRedeemProduct,
    redeemingProductId,
    passwordPromptDialog,
  } = useRedeemProduct();
  const [
    unclaimedProductListingDatas,
    setUnclaimedProductListingDatas,
  ] = React.useState<?Array<ProductListingData>>(null);
  const [
    nextMonthProductListingDatas,
    setNextMonthProductListingDatas,
  ] = React.useState<?Array<ProductListingData>>(null);

  const pricingSystem =
    subscription && userSubscriptionPlanEvenIfLegacy
      ? userSubscriptionPlanEvenIfLegacy.pricingSystems.find(
          pricingSystem => pricingSystem.id === subscription.pricingSystemId
        )
      : null;
  const nextMonthStartDate = getNextMonthStartDate();
  // Yearly subscribers keep their subscription for months after cancelling,
  // and monthly ones whose period ends after next drop will still get it.
  const willMissNextMonthProducts =
    !!pricingSystem &&
    pricingSystem.period === 'month' &&
    !!subscription &&
    (!subscription.endOfPeriodAt ||
      subscription.endOfPeriodAt < nextMonthStartDate.getTime());

  React.useEffect(
    () => {
      (async () => {
        try {
          const [
            privateAssetPackListingDatas,
            privateGameTemplateListingDatas,
            givenAwayProducts,
          ] = await Promise.all([
            listListedPrivateAssetPacks(),
            listListedPrivateGameTemplates(),
            willMissNextMonthProducts ? listGivenAwayProducts() : [],
          ]);
          setUnclaimedProductListingDatas(
            getClaimableProductListingDatas({
              subscription,
              privateAssetPackListingDatas,
              privateGameTemplateListingDatas,
              receivedAssetPacks,
              receivedGameTemplates,
            })
          );
          const nextMonth = getMonth(nextMonthStartDate);
          const productListingDatas: Array<ProductListingData> = [
            ...privateAssetPackListingDatas,
            ...privateGameTemplateListingDatas,
          ];
          const receivedProductIds = new Set(
            [
              ...(receivedAssetPacks || []),
              ...(receivedGameTemplates || []),
            ].map(receivedProduct => receivedProduct.id)
          );
          setNextMonthProductListingDatas(
            givenAwayProducts
              .filter(
                givenAwayProduct =>
                  givenAwayProduct.month === nextMonth &&
                  !receivedProductIds.has(givenAwayProduct.productId)
              )
              .map(givenAwayProduct =>
                productListingDatas.find(
                  productListingData =>
                    productListingData.id === givenAwayProduct.productId
                )
              )
              .filter(Boolean)
          );
        } catch (error) {
          console.error(
            'Unable to load the free products of the subscription:',
            error
          );
          setUnclaimedProductListingDatas([]);
          setNextMonthProductListingDatas([]);
        }
      })();
    },
    // Only load the products once, when the dialog is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const isReceived = (productListingData: ProductListingData) =>
    (productListingData.productType === 'GAME_TEMPLATE'
      ? receivedGameTemplates || []
      : receivedAssetPacks || []
    ).some(receivedProduct => receivedProduct.id === productListingData.id);

  const renderProduct = (
    productListingData: ProductListingData,
    canClaim: boolean
  ) => (
    <LineStackLayout noMargin alignItems="center" key={productListingData.id}>
      <ImageWithFallback
        style={styles.thumbnail}
        src={productListingData.thumbnailUrls[0]}
        alt={productListingData.name}
      />
      <ColumnStackLayout noMargin expand>
        <Text noMargin>{productListingData.name}</Text>
        <Text noMargin color="secondary" size="body-small">
          {productListingData.productType === 'GAME_TEMPLATE' ? (
            <Trans>Game template</Trans>
          ) : (
            <Trans>Asset pack</Trans>
          )}
        </Text>
      </ColumnStackLayout>
      {canClaim &&
        (isReceived(productListingData) ? (
          <Text noMargin color="secondary">
            <Trans>Claimed</Trans>
          </Text>
        ) : (
          <RaisedButton
            primary
            label={
              redeemingProductId === productListingData.id ? (
                <Trans>Please wait</Trans>
              ) : (
                <Trans>Claim for free</Trans>
              )
            }
            disabled={!!redeemingProductId}
            onClick={() => onWillRedeemProduct(productListingData)}
          />
        ))}
    </LineStackLayout>
  );

  const isLoading =
    !unclaimedProductListingDatas || !nextMonthProductListingDatas;

  return (
    <Dialog
      title={<Trans>Cancel your subscription?</Trans>}
      open
      maxWidth="sm"
      onRequestClose={onClose}
      onApply={onClose}
      actions={[
        <FlatButton
          key="continue"
          label={<Trans>Continue</Trans>}
          onClick={onConfirm}
        />,
        <DialogPrimaryButton
          key="keep"
          primary
          label={<Trans>Keep subscription</Trans>}
          onClick={onClose}
        />,
      ]}
      flexColumnBody
    >
      <Text>
        <Trans>
          By canceling your subscription, you will lose all your premium
          features at the end of the period you already paid for.
        </Trans>
      </Text>
      {isLoading ? (
        <PlaceholderLoader />
      ) : (
        <>
          {unclaimedProductListingDatas &&
            unclaimedProductListingDatas.length > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="sub-title" noMargin>
                  <Trans>You have not claimed this month's free products</Trans>
                </Text>
                {unclaimedProductListingDatas.map(productListingData =>
                  renderProduct(productListingData, true)
                )}
              </ColumnStackLayout>
            )}
          {nextMonthProductListingDatas &&
            nextMonthProductListingDatas.length > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="sub-title" noMargin>
                  <Trans>Coming next month, free for subscribers</Trans>
                </Text>
                {nextMonthProductListingDatas.map(productListingData =>
                  renderProduct(productListingData, false)
                )}
              </ColumnStackLayout>
            )}
        </>
      )}
      {passwordPromptDialog}
    </Dialog>
  );
};

export default CancelSubscriptionConfirmationDialog;
