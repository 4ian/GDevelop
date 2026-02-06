// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type Bundle } from '../../Utils/GDevelopServices/Asset';
import { type BundleListingData } from '../../Utils/GDevelopServices/Shop';
import Paper from '../../UI/Paper';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import { renderProductPrice } from '../../AssetStore/ProductPriceTag';
import {
  getProductsIncludedInBundle,
  getUserProductPurchaseUsageType,
  PurchaseProductButtons,
} from '../../AssetStore/ProductPageHelper';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import { BundleStoreContext } from '../../AssetStore/Bundles/BundleStoreContext';
import { sendBundleBuyClicked } from '../../Utils/Analytics/EventSender';
import BundlePurchaseDialog from '../../AssetStore/Bundles/BundlePurchaseDialog';
import {
  getEstimatedSavingsFormatted,
  renderEstimatedTotalPriceFormatted,
} from '../../AssetStore/Bundles/Utils';
import { PrivateGameTemplateStoreContext } from '../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { CreditsPackageStoreContext } from '../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { AssetStoreContext } from '../../AssetStore/AssetStoreContext';
import CourseStoreContext from '../../Course/CourseStoreContext';
import SecureCheckout from '../../AssetStore/SecureCheckout/SecureCheckout';
import FlatButton from '../../UI/FlatButton';
import Chip from '../../UI/Chip';
import ProductLimitedTimeOffer from '../../AssetStore/ProductLimitedTimeOffer';
import Skeleton from '@material-ui/lab/Skeleton';
import { getSummaryLines } from './Utils';
import { SectionRow } from '../../MainFrame/EditorContainers/HomePage/SectionContainer';

const styles = {
  title: { overflowWrap: 'anywhere', textWrap: 'wrap' },
  image: { width: 300, aspectRatio: '16 / 9' },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  discountedPrice: { textDecoration: 'line-through', opacity: 0.7 },
  discountChip: {
    height: 24,
    backgroundColor: '#F03F18',
    color: 'white',
  },
};

type Props = {|
  bundleListingData: BundleListingData,
  bundle: Bundle,
  simulateAppStoreProduct?: boolean,
  i18n: I18nType,
  fastCheckout?: boolean,
  onCloseAfterPurchaseDone?: () => void,
|};

const BundlePageHeader = ({
  bundle,
  bundleListingData,
  simulateAppStoreProduct,
  i18n,
  fastCheckout,
  onCloseAfterPurchaseDone,
}: Props) => {
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { creditsPackageListingDatas } = React.useContext(
    CreditsPackageStoreContext
  );
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { listedCourses } = React.useContext(CourseStoreContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { openRedeemCodeDialog } = React.useContext(SubscriptionContext);
  const { receivedBundles, bundlePurchases } = authenticatedUser;
  const [
    purchasingBundleListingData,
    setPurchasingBundleListingData,
  ] = React.useState<?BundleListingData>(null);
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  const isMobileOrMediumScreen = isMobile || isMediumScreen;
  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

  const userBundlePurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
        productId: bundleListingData ? bundleListingData.id : null,
        receivedProducts: receivedBundles,
        productPurchases: bundlePurchases,
        allProductListingDatas: bundleListingDatas,
      }),
    [bundlePurchases, bundleListingData, bundleListingDatas, receivedBundles]
  );
  const isAlreadyReceived = !!userBundlePurchaseUsageType;

  const productListingDatasIncludedInBundle = React.useMemo(
    () =>
      bundleListingData &&
      bundleListingDatas &&
      privateGameTemplateListingDatas &&
      privateAssetPackListingDatas &&
      listedCourses &&
      creditsPackageListingDatas
        ? getProductsIncludedInBundle({
            productListingDatas: [
              ...bundleListingDatas,
              ...privateGameTemplateListingDatas,
              ...privateAssetPackListingDatas,
              ...listedCourses,
              ...creditsPackageListingDatas,
            ],
            productListingData: bundleListingData,
          })
        : null,
    [
      bundleListingData,
      bundleListingDatas,
      privateGameTemplateListingDatas,
      privateAssetPackListingDatas,
      listedCourses,
      creditsPackageListingDatas,
    ]
  );

  const redemptionCodesIncludedInBundle = React.useMemo(
    () =>
      bundleListingData
        ? bundleListingData.includedRedemptionCodes || []
        : null,
    [bundleListingData]
  );

  const summaryLines = React.useMemo(
    () => {
      if (
        !productListingDatasIncludedInBundle ||
        !redemptionCodesIncludedInBundle ||
        !bundleListingData
      )
        return isMobile ? (
          <ColumnStackLayout noMargin>
            <Column expand noMargin>
              <Skeleton height={25} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Column>
            <Column expand noMargin>
              <Skeleton height={25} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Column>
          </ColumnStackLayout>
        ) : (
          <Column expand noMargin>
            <Skeleton height={25} />
            <Skeleton height={20} />
            <Skeleton height={20} />
          </Column>
        );

      if (isAlreadyReceived) {
        return (
          <Line noMargin>
            <FlatButton
              primary
              label={<Trans>Activate my subscription</Trans>}
              onClick={() => openRedeemCodeDialog()}
            />
          </Line>
        );
      }

      const summaryLines = getSummaryLines({
        redemptionCodesIncludedInBundle,
        bundleListingData,
        productListingDatasIncludedInBundle,
      });

      if (isMobile) {
        return summaryLines.mobileLines;
      }
      return summaryLines.desktopLines;
    },
    [
      isAlreadyReceived,
      redemptionCodesIncludedInBundle,
      bundleListingData,
      productListingDatasIncludedInBundle,
      isMobile,
      openRedeemCodeDialog,
    ]
  );

  const estimatedTotalPriceFormatted = React.useMemo(
    () =>
      renderEstimatedTotalPriceFormatted({
        i18n,
        bundleListingData,
        productListingDatasIncludedInBundle,
        redemptionCodesIncludedInBundle,
      }),
    [
      i18n,
      bundleListingData,
      productListingDatasIncludedInBundle,
      redemptionCodesIncludedInBundle,
    ]
  );

  const estimatedSavingsFormatted = React.useMemo(
    () =>
      getEstimatedSavingsFormatted({
        i18n,
        bundleListingData,
        productListingDatasIncludedInBundle,
        redemptionCodesIncludedInBundle,
      }),
    [
      i18n,
      bundleListingData,
      productListingDatasIncludedInBundle,
      redemptionCodesIncludedInBundle,
    ]
  );

  const productPrice = React.useMemo(
    () =>
      renderProductPrice({
        i18n,
        productListingData: bundleListingData,
        usageType: 'default',
        plainText: true,
      }),
    [i18n, bundleListingData]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!bundle) return;
      if (isAlreadyReceived) {
        return;
      }

      try {
        const price = bundleListingData.prices.find(
          price => price.usageType === 'default'
        );

        sendBundleBuyClicked({
          bundleId: bundle.id,
          bundleName: bundle.name,
          bundleTag: bundle.tag,
          usageType: 'default',
          priceValue: price && price.value,
          priceCurrency: price && price.currency,
        });

        setPurchasingBundleListingData(bundleListingData);
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [bundle, bundleListingData, isAlreadyReceived]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Column noOverflowParent noMargin>
          {!isAlreadyReceived && !isMobileOrMediumScreen && (
            <SectionRow>
              <Paper background="medium" style={{ padding: 16 }}>
                {!!bundleListingData && (
                  <LineStackLayout noMargin justifyContent="space-between">
                    {bundleListingData.visibleUntil ? (
                      <ProductLimitedTimeOffer
                        visibleUntil={bundleListingData.visibleUntil}
                      />
                    ) : estimatedTotalPriceFormatted ? (
                      <Column
                        noMargin
                        alignItems="flex-start"
                        justifyContent="center"
                      >
                        <Chip
                          label={<Trans>Bundle</Trans>}
                          style={styles.discountChip}
                        />
                        <Text color="secondary">
                          <Trans>
                            Get {estimatedTotalPriceFormatted} worth of value
                            for less!
                          </Trans>
                        </Text>
                      </Column>
                    ) : (
                      <Skeleton height={24} width={100} />
                    )}
                    {estimatedTotalPriceFormatted &&
                    estimatedSavingsFormatted &&
                    productPrice ? (
                      <LineStackLayout justifyContent="flex-end" noMargin>
                        <Column noMargin alignItems="flex-end">
                          <LineStackLayout>
                            <Text noMargin color="secondary" size="block-title">
                              <span style={styles.discountedPrice}>
                                {estimatedTotalPriceFormatted}
                              </span>
                            </Text>
                            {bundleListingData.visibleUntil && (
                              <Chip
                                label={
                                  <Trans>
                                    {
                                      estimatedSavingsFormatted.savingsPercentageFormatted
                                    }{' '}
                                    OFF
                                  </Trans>
                                }
                                style={styles.discountChip}
                              />
                            )}
                          </LineStackLayout>
                          <Text noMargin size="block-title">
                            {productPrice}
                          </Text>
                        </Column>
                        <ColumnStackLayout noMargin alignItems="center">
                          <PurchaseProductButtons
                            i18n={i18n}
                            productListingData={bundleListingData}
                            selectedUsageType="default"
                            onUsageTypeChange={() => {}}
                            simulateAppStoreProduct={simulateAppStoreProduct}
                            isAlreadyReceived={isAlreadyReceived}
                            onClickBuy={onClickBuy}
                            onClickBuyWithCredits={() => {}}
                            customLabel={
                              <Trans>
                                Buy now and save{' '}
                                {
                                  estimatedSavingsFormatted.savingsPriceFormatted
                                }
                              </Trans>
                            }
                          />
                          {!shouldUseOrSimulateAppStoreProduct && (
                            <SecureCheckout />
                          )}
                        </ColumnStackLayout>
                      </LineStackLayout>
                    ) : (
                      <Column noMargin justifyContent="flex-end">
                        <Skeleton height={24} width={100} />
                        <Skeleton height={24} width={100} />
                      </Column>
                    )}
                  </LineStackLayout>
                )}
              </Paper>
            </SectionRow>
          )}
          {!isAlreadyReceived &&
            isMobileOrMediumScreen &&
            bundleListingData &&
            bundleListingData.visibleUntil && (
              <SectionRow>
                <ProductLimitedTimeOffer
                  visibleUntil={bundleListingData.visibleUntil}
                />
              </SectionRow>
            )}
          <SectionRow>
            <ResponsiveLineStackLayout
              noMargin
              alignItems="center"
              justifyContent="flex-start"
              forceMobileLayout={isMediumScreen}
              expand
            >
              <div style={styles.imageContainer}>
                <img
                  src={bundle.previewImageUrls[0]}
                  style={styles.image}
                  alt=""
                />
              </div>
              <ColumnStackLayout
                expand
                justifyContent="flex-start"
                noMargin={isMobile}
              >
                <Text size="title" noMargin style={styles.title}>
                  {selectMessageByLocale(i18n, bundle.nameByLocale)}
                </Text>
                <Line noMargin>
                  <Text noMargin>
                    {selectMessageByLocale(
                      i18n,
                      bundle.longDescriptionByLocale
                    )}
                  </Text>
                </Line>
                {summaryLines}
              </ColumnStackLayout>
            </ResponsiveLineStackLayout>
          </SectionRow>
          {!isAlreadyReceived && isMobileOrMediumScreen && bundleListingData && (
            <SectionRow>
              <Paper background="medium" style={{ padding: 16 }}>
                {estimatedTotalPriceFormatted &&
                estimatedSavingsFormatted &&
                productPrice ? (
                  <ResponsiveLineStackLayout justifyContent="flex-end" noMargin>
                    <LineStackLayout
                      alignItems="center"
                      justifyContent="center"
                    >
                      {bundleListingData.visibleUntil && (
                        <Chip
                          label={
                            <Trans>
                              {
                                estimatedSavingsFormatted.savingsPercentageFormatted
                              }{' '}
                              OFF
                            </Trans>
                          }
                          style={styles.discountChip}
                        />
                      )}
                      <Text noMargin color="secondary" size="block-title">
                        <span style={styles.discountedPrice}>
                          {estimatedTotalPriceFormatted}
                        </span>
                      </Text>
                      <Text noMargin size="block-title">
                        {productPrice}
                      </Text>
                    </LineStackLayout>
                    <ColumnStackLayout noMargin alignItems="center">
                      <PurchaseProductButtons
                        i18n={i18n}
                        productListingData={bundleListingData}
                        selectedUsageType="default"
                        onUsageTypeChange={() => {}}
                        simulateAppStoreProduct={simulateAppStoreProduct}
                        isAlreadyReceived={isAlreadyReceived}
                        onClickBuy={onClickBuy}
                        onClickBuyWithCredits={() => {}}
                        fullWidth
                        customLabel={
                          <Trans>
                            Buy now and save{' '}
                            {
                              (
                                getEstimatedSavingsFormatted({
                                  i18n,
                                  bundleListingData,
                                  productListingDatasIncludedInBundle,
                                  redemptionCodesIncludedInBundle,
                                }) || {}
                              ).savingsPriceFormatted
                            }
                          </Trans>
                        }
                      />
                      {!shouldUseOrSimulateAppStoreProduct && (
                        <SecureCheckout />
                      )}
                    </ColumnStackLayout>
                  </ResponsiveLineStackLayout>
                ) : (
                  <Column noMargin expand justifyContent="flex-end">
                    <Skeleton height={isMobile ? 60 : 40} />
                    <Skeleton height={isMobile ? 60 : 40} />
                  </Column>
                )}
              </Paper>
            </SectionRow>
          )}
          {!!purchasingBundleListingData && (
            <BundlePurchaseDialog
              bundleListingData={purchasingBundleListingData}
              usageType="default"
              onClose={() => setPurchasingBundleListingData(null)}
              fastCheckout={fastCheckout}
              onCloseAfterPurchaseDone={onCloseAfterPurchaseDone}
            />
          )}
        </Column>
      )}
    </I18n>
  );
};

export default BundlePageHeader;
