// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type Bundle } from '../../../../Utils/GDevelopServices/Asset';
import { type BundleListingData } from '../../../../Utils/GDevelopServices/Shop';
import { SectionRow } from '../SectionContainer';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { Column, Line } from '../../../../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { renderProductPrice } from '../../../../AssetStore/ProductPriceTag';
import {
  getProductsIncludedInBundle,
  getUserProductPurchaseUsageType,
  PurchaseProductButtons,
} from '../../../../AssetStore/ProductPageHelper';
import { shouldUseAppStoreProduct } from '../../../../Utils/AppStorePurchases';
import { Divider } from '@material-ui/core';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { BundleStoreContext } from '../../../../AssetStore/Bundles/BundleStoreContext';
import { sendBundleBuyClicked } from '../../../../Utils/Analytics/EventSender';
import BundlePurchaseDialog from '../../../../AssetStore/Bundles/BundlePurchaseDialog';
import RedemptionCodesDialog from '../../../../RedemptionCode/RedemptionCodesDialog';
import { renderEstimatedTotalPriceFormatted } from '../../../../AssetStore/Bundles/Utils';
import { PrivateGameTemplateStoreContext } from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import {
  CreditsPackageStoreContext,
  getCreditsAmountFromId,
} from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { AssetStoreContext } from '../../../../AssetStore/AssetStoreContext';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import SecureCheckout from '../../../../AssetStore/SecureCheckout/SecureCheckout';
import {
  getPlanIcon,
  getPlanInferredNameFromId,
} from '../../../../Profile/Subscription/PlanCard';
import FlatButton from '../../../../UI/FlatButton';
import Coin from '../../../../Credits/Icons/Coin';
import { type SubscriptionPlanWithPricingSystems } from '../../../../Utils/GDevelopServices/Usage';

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
  coinIcon: {
    width: 13,
    height: 13,
    position: 'relative',
    top: -1,
  },
};

const ResponsiveDivider = () => {
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  return isMobile || isMediumScreen ? (
    <Column noMargin>
      <Divider orientation="horizontal" />
    </Column>
  ) : (
    <Line noMargin>
      <Divider orientation="vertical" />
    </Line>
  );
};

type Props = {|
  bundleListingData: BundleListingData,
  bundle: Bundle,
  getSubscriptionPlansWithPricingSystems: () => Array<SubscriptionPlanWithPricingSystems> | null,
  simulateAppStoreProduct?: boolean,
|};

const BundlePageHeader = ({
  bundle,
  bundleListingData,
  getSubscriptionPlansWithPricingSystems,
  simulateAppStoreProduct,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
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
  const { receivedBundles, bundlePurchases } = authenticatedUser;
  const [
    purchasingBundleListingData,
    setPurchasingBundleListingData,
  ] = React.useState<?BundleListingData>(null);
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  const [
    isRedemptionCodesDialogOpen,
    setIsRedemptionCodesDialogOpen,
  ] = React.useState<boolean>(false);
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

  const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

  const redemptionCodesIncludedInBundle = React.useMemo(
    () =>
      bundleListingData
        ? bundleListingData.includedRedemptionCodes || []
        : null,
    [bundleListingData]
  );

  const includedCreditsAmount = React.useMemo(
    () =>
      (bundleListingData.includedListableProducts || [])
        .filter(product => product.productType === 'CREDIT_PACKAGE')
        .reduce(
          (total, product) => total + getCreditsAmountFromId(product.productId),
          0
        ),
    [bundleListingData]
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
          currency: price ? price.currency : undefined,
          usageType: 'default',
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
        <>
          <SectionRow>
            <Paper background="dark" variant="outlined" style={{ padding: 16 }}>
              <ColumnStackLayout noMargin>
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
                  <ColumnStackLayout expand justifyContent="flex-start">
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
                  </ColumnStackLayout>
                </ResponsiveLineStackLayout>
                <ResponsiveLineStackLayout
                  expand
                  justifyContent="space-between"
                  forceMobileLayout={isMediumScreen}
                >
                  {redemptionCodesIncludedInBundle &&
                    redemptionCodesIncludedInBundle.length > 0 && (
                      <ColumnStackLayout noMargin expand>
                        {redemptionCodesIncludedInBundle.map(
                          (includedRedemptionCode, index) => (
                            <LineStackLayout
                              noMargin
                              alignItems="center"
                              key={`${
                                includedRedemptionCode.givenSubscriptionPlanId
                              }-${index}`}
                            >
                              {getPlanIcon({
                                planId:
                                  includedRedemptionCode.givenSubscriptionPlanId,
                                logoSize: 20,
                              })}
                              <Text>
                                <Trans>
                                  {Math.round(
                                    includedRedemptionCode.durationInDays / 30
                                  )}{' '}
                                  months of
                                  {getPlanInferredNameFromId(
                                    includedRedemptionCode.givenSubscriptionPlanId
                                  )}
                                  subscription included
                                </Trans>
                              </Text>
                            </LineStackLayout>
                          )
                        )}
                        {isAlreadyReceived && (
                          <Line noMargin>
                            <FlatButton
                              primary
                              label={<Trans>See my codes</Trans>}
                              onClick={() =>
                                setIsRedemptionCodesDialogOpen(true)
                              }
                            />
                          </Line>
                        )}
                      </ColumnStackLayout>
                    )}
                  {includedCreditsAmount > 0 && (
                    <Column justifyContent="center" expand noMargin>
                      <LineStackLayout noMargin alignItems="center">
                        <Coin style={styles.coinIcon} />
                        <Text>
                          <Trans>
                            {includedCreditsAmount} credits included
                          </Trans>
                        </Text>
                      </LineStackLayout>
                    </Column>
                  )}
                  <ResponsiveDivider />
                </ResponsiveLineStackLayout>
                {!isAlreadyReceived && (
                  <Paper background="medium" style={{ padding: 16 }}>
                    {!!bundleListingData && (
                      <ResponsiveLineStackLayout
                        justifyContent="space-between"
                        noMargin
                      >
                        {!isMobile && !isMediumScreen && (
                          <Column noMargin justifyContent="center">
                            <LineStackLayout noMargin>
                              <Text noMargin color="secondary">
                                <span style={styles.discountedPrice}>
                                  {renderEstimatedTotalPriceFormatted({
                                    i18n,
                                    bundleListingData,
                                    productListingDatasIncludedInBundle,
                                    redemptionCodesIncludedInBundle,
                                    subscriptionPlansWithPricingSystems,
                                  })}
                                </span>
                              </Text>
                              <div
                                style={{
                                  color: gdevelopTheme.text.color.secondary,
                                }}
                              >
                                {renderProductPrice({
                                  i18n,
                                  productListingData: bundleListingData,
                                  usageType: 'default',
                                })}
                              </div>
                            </LineStackLayout>
                          </Column>
                        )}
                        <ResponsiveLineStackLayout
                          noMargin
                          forceMobileLayout={isMediumScreen}
                        >
                          {!shouldUseOrSimulateAppStoreProduct && (
                            <SecureCheckout />
                          )}
                          <PurchaseProductButtons
                            i18n={i18n}
                            productListingData={bundleListingData}
                            selectedUsageType="default"
                            onUsageTypeChange={() => {}}
                            simulateAppStoreProduct={simulateAppStoreProduct}
                            isAlreadyReceived={isAlreadyReceived}
                            onClickBuy={onClickBuy}
                            onClickBuyWithCredits={() => {}}
                          />
                        </ResponsiveLineStackLayout>
                      </ResponsiveLineStackLayout>
                    )}
                  </Paper>
                )}
              </ColumnStackLayout>
            </Paper>
          </SectionRow>
          {!!purchasingBundleListingData && (
            <BundlePurchaseDialog
              bundleListingData={purchasingBundleListingData}
              usageType="default"
              onClose={() => setPurchasingBundleListingData(null)}
            />
          )}
          {isRedemptionCodesDialogOpen && (
            <RedemptionCodesDialog
              onClose={() => setIsRedemptionCodesDialogOpen(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default BundlePageHeader;
