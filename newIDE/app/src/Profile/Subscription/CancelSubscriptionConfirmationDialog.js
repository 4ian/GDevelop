// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
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
  product: { flex: 1, minWidth: 0 },
  upcomingProduct: { flex: 1, minWidth: 0, opacity: 0.5 },
};

// Drops happen at the start of each month: the first one missed is the one after the end of the period.
const getFirstMissedDropDate = (endOfPeriodAt: ?number): Date => {
  const date = endOfPeriodAt ? new Date(endOfPeriodAt) : new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
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
 * the first ones they will miss.
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
    missedProductListingDatas,
    setMissedProductListingDatas,
  ] = React.useState<?Array<ProductListingData>>(null);

  const pricingSystem =
    subscription && userSubscriptionPlanEvenIfLegacy
      ? userSubscriptionPlanEvenIfLegacy.pricingSystems.find(
          pricingSystem => pricingSystem.id === subscription.pricingSystemId
        )
      : null;
  const firstMissedDropDate = getFirstMissedDropDate(
    subscription ? subscription.endOfPeriodAt : null
  );
  // Yearly subscribers keep their subscription for months after cancelling.
  const shouldShowMissedProducts =
    !!pricingSystem && pricingSystem.period === 'month';

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
            shouldShowMissedProducts ? listGivenAwayProducts() : [],
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
          const firstMissedDropMonth = getMonth(firstMissedDropDate);
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
          setMissedProductListingDatas(
            givenAwayProducts
              .filter(
                givenAwayProduct =>
                  givenAwayProduct.month === firstMissedDropMonth &&
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
          setMissedProductListingDatas([]);
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
      style={canClaim ? styles.product : styles.upcomingProduct}
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
          {canClaim && (
            <LineStackLayout noMargin>
              <RaisedButton
                primary
                label={<Trans>Claim it in the store</Trans>}
                onClick={() => openInStore(productListingData)}
              />
            </LineStackLayout>
          )}
        </ColumnStackLayout>
      </LineStackLayout>
    </div>
  );

  const isLoading = !unclaimedProductListingDatas || !missedProductListingDatas;

  return (
    <Dialog
      title={<Trans>Cancel your subscription?</Trans>}
      open
      maxWidth="md"
      fullHeight
      onRequestClose={onClose}
      onApply={onConfirm}
      actions={[
        <FlatButton
          key="keep"
          label={<Trans>Keep subscription</Trans>}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key="continue"
          primary
          label={<Trans>Continue cancellation</Trans>}
          onClick={onConfirm}
        />,
      ]}
      flexColumnBody
    >
      {isLoading ? (
        <PlaceholderLoader />
      ) : (
        <ColumnStackLayout noMargin>
          {unclaimedProductListingDatas &&
            unclaimedProductListingDatas.length > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="sub-title" noMargin>
                  <Trans>You have not claimed this month's free products</Trans>
                </Text>
                <ResponsiveLineStackLayout noMargin>
                  {unclaimedProductListingDatas.map(productListingData =>
                    renderProduct(productListingData, true)
                  )}
                </ResponsiveLineStackLayout>
              </ColumnStackLayout>
            )}
          <I18n>
            {({ i18n }) => (
              <Text>
                {subscription && subscription.endOfPeriodAt ? (
                  <Trans>
                    You will keep your premium features until{' '}
                    {i18n.date(subscription.endOfPeriodAt)}. After that, you
                    will lose:
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
              nextSubscriptionPlanWithPricingSystems={freeSubscriptionPlan}
              hideFullTableLink
            />
          )}
          {missedProductListingDatas && missedProductListingDatas.length > 0 && (
            <ColumnStackLayout noMargin>
              <I18n>
                {({ i18n }) => (
                  <Text size="sub-title" noMargin>
                    <Trans>
                      Coming on {i18n.date(firstMissedDropDate)}, free for
                      subscribers
                    </Trans>
                  </Text>
                )}
              </I18n>
              <ResponsiveLineStackLayout noMargin>
                {missedProductListingDatas.map(productListingData =>
                  renderProduct(productListingData, false)
                )}
              </ResponsiveLineStackLayout>
            </ColumnStackLayout>
          )}
        </ColumnStackLayout>
      )}
    </Dialog>
  );
};

export default CancelSubscriptionConfirmationDialog;
