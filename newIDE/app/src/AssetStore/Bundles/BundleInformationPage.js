// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type BundleListingData,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type CourseListingData,
} from '../../Utils/GDevelopServices/Shop';
import {
  getBundle,
  type Bundle,
  type Course,
} from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import FlatButton from '../../UI/FlatButton';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../../UI/Layout';
import { Column, LargeSpacer, Line } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import Link from '../../UI/Link';
import ResponsiveMediaGallery from '../../UI/ResponsiveMediaGallery';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { sendBundleBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import ScrollView from '../../UI/ScrollView';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import Avatar from '@material-ui/core/Avatar';
import GridList from '@material-ui/core/GridList';
import { BundleStoreContext } from './BundleStoreContext';
import {
  getBundlesContainingProductTiles,
  getOtherProductsFromSameAuthorTiles,
  getProductMediaItems,
  getProductsIncludedInBundle,
  getProductsIncludedInBundleTiles,
  getUserProductPurchaseUsageType,
  PurchaseProductButtons,
} from '../ProductPageHelper';
import SecureCheckout from '../SecureCheckout/SecureCheckout';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import BundlePurchaseDialog from './BundlePurchaseDialog';
import PublicProfileContext from '../../Profile/PublicProfileContext';
import { LARGE_WIDGET_SIZE } from '../../MainFrame/EditorContainers/HomePage/CardWidget';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { AssetStoreContext } from '../AssetStoreContext';
import CourseStoreContext from '../../Course/CourseStoreContext';
import { CreditsPackageStoreContext } from '../CreditsPackages/CreditsPackageStoreContext';
import RedemptionCodesDialog from '../../RedemptionCode/RedemptionCodesDialog';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import { getSummaryLines } from '../../MainFrame/EditorContainers/HomePage/LearnSection/BundlePage/Utils';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  getEstimatedSavingsFormatted,
  renderEstimatedTotalPriceFormatted,
} from './Utils';
import { renderProductPrice } from '../ProductPriceTag';
import Chip from '../../UI/Chip';
import ProductLimitedTimeOffer from '../ProductLimitedTimeOffer';

const cellSpacing = 10;

const getTemplateColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};
const MAX_COLUMNS = getTemplateColumns('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const styles = {
  disabledText: { opacity: 0.6 },
  scrollview: { overflowX: 'hidden' },
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${cellSpacing}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
  leftColumnContainer: {
    flex: 1,
    minWidth: 0, // This is needed for the container to take the right size.
  },
  rightColumnContainer: {
    flex: 2,
  },
  leftColumnContainerMobile: {
    flex: 1,
    minWidth: 0, // This is needed for the container to take the right size.
  },
  rightColumnContainerMobile: {
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
  },
  ownedTag: {
    padding: '4px 8px',
    borderRadius: 4,
    color: 'black',
  },
  playIcon: {
    width: 20,
    height: 20,
  },
  coinIcon: {
    width: 13,
    height: 13,
    position: 'relative',
    top: -1,
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
  bundleListingDatasFromSameCreator?: ?Array<BundleListingData>,
  receivedCourses: ?Array<Course>,
  onBundleOpen: BundleListingData => void,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onAssetPackOpen: (
    privateAssetPackListingData: PrivateAssetPackListingData,
    options?: {|
      forceProductPage?: boolean,
    |}
  ) => void,
  onCourseOpen: CourseListingData => void,
  simulateAppStoreProduct?: boolean,
  i18n: I18nType,
|};

const BundleInformationPage = ({
  bundleListingData,
  bundleListingDatasFromSameCreator,
  receivedCourses,
  onBundleOpen,
  onGameTemplateOpen,
  onAssetPackOpen,
  onCourseOpen,
  simulateAppStoreProduct,
  i18n,
}: Props) => {
  const { id, name, sellerId } = bundleListingData;
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { creditsPackageListingDatas } = React.useContext(
    CreditsPackageStoreContext
  );
  const { listedCourses } = React.useContext(CourseStoreContext);
  const {
    receivedBundles,
    bundlePurchases,
    receivedGameTemplates,
    receivedAssetPacks,
  } = React.useContext(AuthenticatedUserContext);
  const [bundle, setBundle] = React.useState<?Bundle>(null);
  const [
    purchasingBundleListingData,
    setPurchasingBundleListingData,
  ] = React.useState<?BundleListingData>(null);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const {
    windowSize,
    isLandscape,
    isMediumScreen,
    isMobile,
  } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
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
  const isOwningAnotherVariant = React.useMemo(
    () => {
      if (!bundle || isAlreadyReceived || !receivedBundles) return false;

      // Another bundle older version of that bundle can be owned.
      // We look at the tag to determine if the bundle is the same.
      return !!receivedBundles.find(
        receivedBundle => receivedBundle.tag === bundle.tag
      );
    },
    [bundle, isAlreadyReceived, receivedBundles]
  );

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
              ...(bundleListingDatas || []),
              ...(privateGameTemplateListingDatas || []),
              ...(privateAssetPackListingDatas || []),
              ...(listedCourses || []),
              ...(creditsPackageListingDatas || []),
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

  const additionalProductThumbnailsIncludedInBundle: string[] = React.useMemo(
    () => {
      if (!productListingDatasIncludedInBundle) return [];

      const additionalThumbnails = productListingDatasIncludedInBundle
        .map(product => (product.thumbnailUrls || []).slice(0, 2))
        .reduce((acc, thumbnails) => acc.concat(thumbnails), []);
      return additionalThumbnails;
    },
    [productListingDatasIncludedInBundle]
  );

  const productsIncludedInBundleTiles = React.useMemo(
    () =>
      getProductsIncludedInBundleTiles({
        product: bundle,
        productListingDatas: [
          ...(bundleListingDatas || []),
          ...(privateGameTemplateListingDatas || []),
          ...(privateAssetPackListingDatas || []),
          ...(listedCourses || []),
        ],
        productListingData: bundleListingData,
        receivedProducts: [
          ...(receivedBundles || []),
          ...(receivedGameTemplates || []),
          ...(receivedAssetPacks || []),
          ...(receivedCourses || []),
        ],
        onPrivateAssetPackOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
        onPrivateGameTemplateOpen: onGameTemplateOpen,
        onBundleOpen,
        onCourseOpen,
        discountedPrice: true,
      }),
    [
      bundle,
      bundleListingDatas,
      privateGameTemplateListingDatas,
      privateAssetPackListingDatas,
      listedCourses,
      receivedBundles,
      receivedGameTemplates,
      receivedAssetPacks,
      receivedCourses,
      onAssetPackOpen,
      onGameTemplateOpen,
      onBundleOpen,
      onCourseOpen,
      bundleListingData,
    ]
  );

  const bundlesContainingBundleTiles = React.useMemo(
    () =>
      getBundlesContainingProductTiles({
        product: bundle,
        productListingData: bundleListingData,
        productListingDatas: bundleListingDatas,
        receivedProducts: receivedBundles,
        onPrivateAssetPackOpen: product =>
          onAssetPackOpen(product, { forceProductPage: true }),
        onPrivateGameTemplateOpen: onGameTemplateOpen,
        onBundleOpen,
      }),
    [
      bundle,
      bundleListingData,
      bundleListingDatas,
      receivedBundles,
      onAssetPackOpen,
      onGameTemplateOpen,
      onBundleOpen,
    ]
  );

  const otherBundlesFromTheSameAuthorTiles = React.useMemo(
    () =>
      getOtherProductsFromSameAuthorTiles({
        otherProductListingDatasFromSameCreator: bundleListingDatasFromSameCreator,
        currentProductListingData: bundleListingData,
        receivedProducts: receivedBundles,
        onProductOpen: onBundleOpen,
      }),
    [
      bundleListingDatasFromSameCreator,
      bundleListingData,
      receivedBundles,
      onBundleOpen,
    ]
  );

  React.useEffect(
    () => {
      (async () => {
        setIsFetching(true);
        try {
          const [bundle, profile] = await Promise.all([
            getBundle(id),
            getUserPublicProfile(sellerId),
          ]);

          setBundle(bundle);
          setSellerPublicProfile(profile);
        } catch (error) {
          const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
            error
          );
          if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
            setErrorText(
              <Trans>
                Bundle not found - An error occurred, please try again later.
              </Trans>
            );
          } else {
            setErrorText(
              <Trans>An error occurred, please try again later.</Trans>
            );
          }
        } finally {
          setIsFetching(false);
        }
      })();
    },
    [id, sellerId]
  );

  const onClickBuy = React.useCallback(
    async () => {
      if (!bundle || isOwningAnotherVariant) return;
      if (isAlreadyReceived) {
        onBundleOpen(bundleListingData);
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
    [
      bundle,
      bundleListingData,
      isAlreadyReceived,
      isOwningAnotherVariant,
      onBundleOpen,
    ]
  );

  const mediaItems = React.useMemo(
    () =>
      getProductMediaItems({
        product: bundle,
        productListingData: bundleListingData,
        shouldSimulateAppStoreProduct: simulateAppStoreProduct,
        additionalThumbnails: additionalProductThumbnailsIncludedInBundle,
      }),
    [
      bundle,
      bundleListingData,
      simulateAppStoreProduct,
      additionalProductThumbnailsIncludedInBundle,
    ]
  );

  const redemptionCodesIncludedInBundle = React.useMemo(
    () => bundleListingData.includedRedemptionCodes || [],
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
              label={<Trans>See my subscription codes</Trans>}
              onClick={() => setIsRedemptionCodesDialogOpen(true)}
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

  return (
    <I18n>
      {({ i18n }) => (
        <>
          {errorText ? (
            <Line alignItems="center" justifyContent="center" expand>
              <AlertMessage kind="error">{errorText}</AlertMessage>
            </Line>
          ) : isFetching ? (
            <Column expand alignItems="center" justifyContent="center">
              <PlaceholderLoader />
            </Column>
          ) : bundle && sellerPublicProfile ? (
            <Column noOverflowParent expand noMargin>
              <ScrollView autoHideScrollbar style={styles.scrollview}>
                <ResponsiveLineStackLayout
                  noColumnMargin
                  noMargin
                  // Force the columns to wrap on tablets and small screens.
                  forceMobileLayout={isMediumScreen}
                  // Prevent it to wrap when in landscape mode on small screens.
                  noResponsiveLandscape
                  useLargeSpacer
                >
                  <div
                    style={
                      isMobile
                        ? styles.leftColumnContainerMobile
                        : styles.leftColumnContainer
                    }
                  >
                    <ResponsiveMediaGallery
                      mediaItems={mediaItems}
                      altTextTemplate={`Bundle ${name} preview image {mediaIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </div>
                  <div
                    style={
                      isMobile
                        ? styles.rightColumnContainerMobile
                        : styles.rightColumnContainer
                    }
                  >
                    <ColumnStackLayout noMargin>
                      <LineStackLayout
                        noMargin
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text noMargin size="title">
                          {selectMessageByLocale(i18n, bundle.nameByLocale)}
                        </Text>
                        {isAlreadyReceived && (
                          <div
                            style={{
                              ...styles.ownedTag,
                              backgroundColor:
                                gdevelopTheme.statusIndicator.success,
                            }}
                          >
                            <Text color="inherit" noMargin>
                              <Trans>OWNED</Trans>
                            </Text>
                          </div>
                        )}
                      </LineStackLayout>
                      <LineStackLayout noMargin alignItems="center">
                        <Avatar
                          src={sellerPublicProfile.iconUrl}
                          style={styles.avatar}
                        />
                        <Text displayInlineAsSpan size="sub-title">
                          <Link
                            onClick={() =>
                              openUserPublicProfile({
                                userId: sellerPublicProfile.id,
                                callbacks: {
                                  onAssetPackOpen,
                                  onGameTemplateOpen,
                                },
                              })
                            }
                            href="#"
                          >
                            {sellerPublicProfile.username || ''}
                          </Link>
                        </Text>
                      </LineStackLayout>
                      {isOwningAnotherVariant ? (
                        <AlertMessage kind="warning">
                          <Trans>
                            You own an older version of this bundle. Browse the
                            store to access it!
                          </Trans>
                        </AlertMessage>
                      ) : !isAlreadyReceived ? (
                        <ColumnStackLayout noMargin>
                          {bundleListingData.visibleUntil && (
                            <Line>
                              <ProductLimitedTimeOffer
                                visibleUntil={bundleListingData.visibleUntil}
                              />
                            </Line>
                          )}
                          {estimatedTotalPriceFormatted &&
                          estimatedSavingsFormatted &&
                          productPrice ? (
                            <LineStackLayout noMargin>
                              <Column noMargin>
                                <LineStackLayout alignItems="center">
                                  <Text
                                    noMargin
                                    color="secondary"
                                    size="block-title"
                                  >
                                    <span style={styles.discountedPrice}>
                                      {estimatedTotalPriceFormatted}
                                    </span>
                                  </Text>
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
                                </LineStackLayout>
                                <Text noMargin size="block-title" align="right">
                                  {productPrice}
                                </Text>
                              </Column>
                              <ColumnStackLayout noMargin alignItems="center">
                                <PurchaseProductButtons
                                  i18n={i18n}
                                  productListingData={bundleListingData}
                                  selectedUsageType="default"
                                  onUsageTypeChange={() => {}}
                                  simulateAppStoreProduct={
                                    simulateAppStoreProduct
                                  }
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
                            <Column noMargin>
                              <Skeleton height={24} width={100} />
                              <Skeleton height={24} width={100} />
                            </Column>
                          )}
                        </ColumnStackLayout>
                      ) : null}
                      <Text size="body2" displayInlineAsSpan>
                        <MarkdownText
                          source={selectMessageByLocale(
                            i18n,
                            bundle.longDescriptionByLocale
                          )}
                          allowParagraphs
                        />
                      </Text>
                      {summaryLines}
                    </ColumnStackLayout>
                  </div>
                </ResponsiveLineStackLayout>
                {bundlesContainingBundleTiles &&
                bundlesContainingBundleTiles.length ? (
                  <>
                    <ColumnStackLayout noMargin>
                      <LargeSpacer />
                      {bundlesContainingBundleTiles}
                      <LargeSpacer />
                    </ColumnStackLayout>
                  </>
                ) : null}
                {productsIncludedInBundleTiles && (
                  <>
                    <Line>
                      <Text size="block-title">
                        <Trans>Included in this bundle</Trans>
                      </Text>
                    </Line>
                    <Line>
                      <GridList
                        cols={getTemplateColumns(windowSize, isLandscape)}
                        cellHeight="auto"
                        spacing={cellSpacing}
                        style={styles.grid}
                      >
                        {productsIncludedInBundleTiles}
                      </GridList>
                    </Line>
                  </>
                )}
                {otherBundlesFromTheSameAuthorTiles &&
                  otherBundlesFromTheSameAuthorTiles.length > 0 && (
                    <>
                      <Line>
                        <Text size="block-title">
                          <Trans>Similar bundles</Trans>
                        </Text>
                      </Line>
                      <Line>
                        <GridList
                          cols={getTemplateColumns(windowSize, isLandscape)}
                          cellHeight="auto"
                          spacing={cellSpacing}
                          style={styles.grid}
                        >
                          {otherBundlesFromTheSameAuthorTiles}
                        </GridList>
                      </Line>
                    </>
                  )}
              </ScrollView>
            </Column>
          ) : null}
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

export default BundleInformationPage;
