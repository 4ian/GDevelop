// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
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
import RouterContext from '../../MainFrame/RouterContext';
import SubscriptionPlanTableSummary from './SubscriptionDialog/SubscriptionPlanTableSummary';

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
  upcomingProduct: { opacity: 0.5 },
};

const getNextMonthStartDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const getMonth = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

type Props = {|
  userSubscriptionPlanEvenIfLegacy: ?SubscriptionPlanWithPricingSystems,
  freeSubscriptionPlan: ?SubscriptionPlanWithPricingSystems,
  onConfirm: () => void,
  onClose: () => void,
  onOpenStore: () => void,
|};

/**
 * Asks to confirm the cancellation, showing the benefits that will be lost,
 * the free products the user has not claimed yet and, for monthly subscriptions,
 * the ones of next month.
 */
const CancelSubscriptionConfirmationDialog = ({
  userSubscriptionPlanEvenIfLegacy,
  freeSubscriptionPlan,
  onConfirm,
  onClose,
  onOpenStore,
}: Props): React.Node => {
  const {
    subscription,
    receivedAssetPacks,
    receivedGameTemplates,
  } = React.useContext(AuthenticatedUserContext);
  const { addRouteArguments } = React.useContext(RouterContext);
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

  const openInStore = (productListingData: ProductListingData) => {
    addRouteArguments(
      productListingData.productType === 'GAME_TEMPLATE'
        ? {
            'initial-dialog': 'store',
            'game-template': productListingData.id,
          }
        : {
            'initial-dialog': 'store',
            'asset-pack': productListingData.id,
          }
    );
    onOpenStore();
  };

  const renderProduct = (
    productListingData: ProductListingData,
    canClaim: boolean
  ) => (
    <div
      key={productListingData.id}
      style={canClaim ? undefined : styles.upcomingProduct}
    >
      <LineStackLayout noMargin alignItems="center">
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
        {canClaim && (
          <RaisedButton
            primary
            label={<Trans>Claim it in the store</Trans>}
            onClick={() => openInStore(productListingData)}
          />
        )}
      </LineStackLayout>
    </div>
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
      <ColumnStackLayout noMargin>
        <I18n>
          {({ i18n }) => (
            <Text>
              {subscription && subscription.endOfPeriodAt ? (
                <Trans>
                  You will keep your premium features until{' '}
                  {i18n.date(subscription.endOfPeriodAt)}. After that, you will
                  lose:
                </Trans>
              ) : (
                <Trans>
                  You will keep your premium features until the end of the
                  period you already paid for. After that, you will lose:
                </Trans>
              )}
            </Text>
          )}
        </I18n>
        {userSubscriptionPlanEvenIfLegacy && (
          <SubscriptionPlanTableSummary
            subscriptionPlanWithPricingSystems={
              userSubscriptionPlanEvenIfLegacy
            }
            comparedSubscriptionPlanWithPricingSystems={freeSubscriptionPlan}
            hideFullTableLink
          />
        )}
        {isLoading ? (
          <PlaceholderLoader />
        ) : (
          <ColumnStackLayout noMargin>
            {unclaimedProductListingDatas &&
              unclaimedProductListingDatas.length > 0 && (
                <ColumnStackLayout noMargin>
                  <Text size="sub-title" noMargin>
                    <Trans>
                      You have not claimed this month's free products
                    </Trans>
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
          </ColumnStackLayout>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default CancelSubscriptionConfirmationDialog;
