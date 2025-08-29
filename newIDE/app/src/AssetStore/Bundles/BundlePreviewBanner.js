// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import Divider from '@material-ui/core/Divider';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import Chip from '../../UI/Chip';
import Text from '../../UI/Text';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../../UI/Paper';
import RaisedButton from '../../UI/RaisedButton';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  getArchivedBundleListingData,
  type BundleListingData,
  type CourseListingData,
} from '../../Utils/GDevelopServices/Shop';
import {
  getProductsIncludedInBundle,
  getUserProductPurchaseUsageType,
} from '../ProductPageHelper';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { AssetStoreContext } from '../AssetStoreContext';
import { BundleStoreContext } from './BundleStoreContext';
import CourseStoreContext from '../../Course/CourseStoreContext';
import { renderProductPrice } from '../ProductPriceTag';
import {
  CreditsPackageStoreContext,
  getCreditsAmountFromId,
} from '../CreditsPackages/CreditsPackageStoreContext';
import {
  getPlanIcon,
  getPlanInferredNameFromId,
} from '../../Profile/Subscription/PlanCard';
import Store from '../../UI/CustomSvgIcons/Store';
import Hammer from '../../UI/CustomSvgIcons/Hammer';
import School from '../../UI/CustomSvgIcons/School';
import Coin from '../../Credits/Icons/Coin';
import Sparkle from '../../UI/CustomSvgIcons/Sparkle';
import {
  getEstimatedSavingsFormatted,
  renderEstimatedTotalPriceFormatted,
} from './Utils';
import { formatDurationOfRedemptionCode } from '../../RedemptionCode/Utils';
import ProductLimitedTimeOffer from '../ProductLimitedTimeOffer';

const highlightColor = '#6CF9F7';

const mobilePadding = 8;
const desktopPadding = 16;

const styles = {
  container: { display: 'flex', borderRadius: 8 },
  leftColumn: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'space-between',
  },
  bundlePreviewContainer: {
    flex: 1,
    background:
      'linear-gradient(90deg, rgba(59, 247, 244, 0.1) 0%, rgba(255, 188, 87, 0.1) 100%)',
    borderLeft: `2px solid ${highlightColor}`,
  },
  discountChip: { height: 24, backgroundColor: '#F03F18', color: 'white' },
  ownedChip: { height: 24, backgroundColor: '#8BE7C4', color: 'black' },
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: '16 / 9' },
  discountedPrice: { textDecoration: 'line-through', opacity: 0.7 },
};

const CourseTile = ({
  courseListingData,
  isAlreadyReceived,
}: {|
  courseListingData: CourseListingData,
  isAlreadyReceived: boolean,
|}) => {
  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout expand>
          <div style={styles.imageContainer}>
            <img
              src={courseListingData.thumbnailUrls[0]}
              style={styles.image}
              alt={courseListingData.name}
            />
          </div>
          <Line noMargin>
            <Text noMargin>{courseListingData.name}</Text>
          </Line>
          {!isAlreadyReceived && (
            <Line noMargin>
              <Text noMargin color="secondary">
                <span style={styles.discountedPrice}>
                  {renderProductPrice({
                    i18n,
                    productListingData: courseListingData,
                    usageType: 'default',
                    plainText: true,
                  })}
                </span>
              </Text>
            </Line>
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

const BundlePreviewTile = ({
  bundleListingData,
}: {
  bundleListingData: ?BundleListingData,
}) => {
  const { isMobile } = useResponsiveWindowSize();
  if (!bundleListingData) return null;

  const includedListableProducts =
    bundleListingData.includedListableProducts || [];
  const includedRedemptionCodes =
    bundleListingData.includedRedemptionCodes || [];
  const numberOfAssetPacks = includedListableProducts.filter(
    product => product.productType === 'ASSET_PACK'
  ).length;
  const numberOfGameTemplates = includedListableProducts.filter(
    product => product.productType === 'GAME_TEMPLATE'
  ).length;
  const numberOfCourses = includedListableProducts.filter(
    product => product.productType === 'COURSE'
  ).length;
  const totalCredits = includedListableProducts
    .filter(product => product.productType === 'CREDITS_PACKAGE')
    .reduce(
      (total, product) => total + getCreditsAmountFromId(product.productId),
      0
    );

  return (
    <div
      style={{
        ...styles.bundlePreviewContainer,
        padding: isMobile ? mobilePadding : desktopPadding,
        margin: isMobile ? -mobilePadding : -desktopPadding,
        marginLeft: isMobile ? -mobilePadding : 0,
        marginTop: isMobile ? 0 : -desktopPadding,
      }}
    >
      <ColumnStackLayout expand>
        <LineStackLayout noMargin alignItems="center">
          <Sparkle style={{ color: highlightColor }} />
          <Text noMargin size="block-title">
            <Trans>This bundle includes:</Trans>
          </Text>
        </LineStackLayout>
        <Spacer />
        {numberOfAssetPacks > 0 && (
          <LineStackLayout noMargin alignItems="center">
            <Store />
            <Text noMargin>
              {numberOfAssetPacks === 1 ? (
                <Trans>{numberOfAssetPacks} Asset Pack</Trans>
              ) : (
                <Trans>{numberOfAssetPacks} Asset Packs</Trans>
              )}
            </Text>
          </LineStackLayout>
        )}
        {numberOfGameTemplates > 0 && (
          <LineStackLayout noMargin alignItems="center">
            <Hammer />
            <Text noMargin>
              {numberOfGameTemplates === 1 ? (
                <Trans>{numberOfGameTemplates} Game Template</Trans>
              ) : (
                <Trans>{numberOfGameTemplates} Game Templates</Trans>
              )}
            </Text>
          </LineStackLayout>
        )}
        {numberOfCourses > 0 && (
          <LineStackLayout noMargin alignItems="center">
            <School />
            <Text noMargin>
              {numberOfCourses === 1 ? (
                <Trans>{numberOfCourses} Course</Trans>
              ) : (
                <Trans>{numberOfCourses} Courses</Trans>
              )}
            </Text>
          </LineStackLayout>
        )}
        {totalCredits > 0 && (
          <LineStackLayout noMargin alignItems="center">
            <Coin />
            <Text noMargin>
              <Trans>{totalCredits} Credits</Trans>
            </Text>
          </LineStackLayout>
        )}
        {includedRedemptionCodes.length > 0 &&
          includedRedemptionCodes.map((redemptionCode, index) => (
            <Line
              noMargin
              alignItems="center"
              key={`${redemptionCode.givenSubscriptionPlanId}-${index}`}
            >
              {getPlanIcon({
                planId: redemptionCode.givenSubscriptionPlanId,
                logoSize: 15,
              })}
              <Text>
                <Trans>
                  {formatDurationOfRedemptionCode(
                    redemptionCode.durationInDays
                  )}{' '}
                  of
                  {getPlanInferredNameFromId(
                    redemptionCode.givenSubscriptionPlanId
                  )}
                  subscription
                </Trans>
              </Text>
            </Line>
          ))}
      </ColumnStackLayout>
    </div>
  );
};

const getColumnsFromWindowSize = (windowSize: WindowSizeType) => {
  if (windowSize === 'xlarge') return 6;
  if (windowSize === 'large') return 4;
  if (windowSize === 'medium') return 3;
  return 2;
};

type Props = {|
  onDisplayBundle: (bundleListingData: BundleListingData) => void,
  i18n: I18nType,
|};

const BundlePreviewBanner = ({ onDisplayBundle, i18n }: Props) => {
  const { isMobile, isLandscape, windowSize } = useResponsiveWindowSize();
  const numberOfTilesToDisplay = getColumnsFromWindowSize(windowSize) - 1; // Reserve one tile for the bundle preview.
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
  const { bundlePurchases, receivedBundles } = authenticatedUser;

  // For the moment, we either display:
  // - the first bundle in the list if none are owned.
  // - the first owned bundle (as a listing data if still listed, or as an archived listing data otherwise)
  // TODO: improve that logic when we'll have more bundles.
  const bundleListingData: BundleListingData | null = React.useMemo(
    () => {
      if (!bundleListingDatas || !receivedBundles) return null;
      if (receivedBundles.length === 0) {
        return bundleListingDatas[0]; // Display the first bundle if none are owned.
      }
      const receivedBundle = receivedBundles[0];
      const bundleListingData = bundleListingDatas.find(
        bundleListingData => bundleListingData.id === receivedBundle.id
      );
      if (bundleListingData) {
        return bundleListingData; // Display the first owned bundle that is still listed.
      }
      // If this bundle is not listed anymore, get an archived listing data for that bundle.
      return getArchivedBundleListingData({
        bundle: receivedBundle,
      });
    },
    [bundleListingDatas, receivedBundles]
  );

  const userBundlePurchaseUsageType = React.useMemo(
    () => {
      if (!bundleListingData) return null;
      return getUserProductPurchaseUsageType({
        productId: bundleListingData.id,
        receivedProducts: receivedBundles,
        productPurchases: bundlePurchases,
        allProductListingDatas: bundleListingDatas,
      });
    },
    [bundlePurchases, bundleListingData, bundleListingDatas, receivedBundles]
  );
  const isAlreadyReceived = !!userBundlePurchaseUsageType;

  const productListingDatasIncludedInBundle = React.useMemo(
    () =>
      bundleListingData
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

  const redemptionCodesIncludedInBundle = React.useMemo(
    () =>
      bundleListingData
        ? bundleListingData.includedRedemptionCodes || []
        : null,
    [bundleListingData]
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
      bundleListingData
        ? renderProductPrice({
            i18n,
            productListingData: bundleListingData,
            usageType: 'default',
            plainText: true,
          })
        : null,
    [i18n, bundleListingData]
  );

  const courseTiles = React.useMemo(
    () => {
      if (isMobile && !isLandscape) {
        return null; // Don't display course tiles on mobile, they take too much space.
      }
      if (!productListingDatasIncludedInBundle) {
        return new Array(numberOfTilesToDisplay).fill(0).map((_, index) => (
          <React.Fragment key={`skeleton-${index}`}>
            {index > 0 &&
              (isMobile && !isLandscape ? (
                <Column noMargin>
                  <Divider orientation="horizontal" />
                </Column>
              ) : (
                <Line noMargin>
                  <Divider orientation="vertical" />
                </Line>
              ))}
            {index > 0 && <Spacer />}
            <Column expand>
              <Skeleton height={140} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <LargeSpacer />
            </Column>
          </React.Fragment>
        ));
      }

      const coursesIncludedInBundle = productListingDatasIncludedInBundle.filter(
        productListingData => productListingData.productType === 'COURSE'
      );

      return new Array(numberOfTilesToDisplay).fill(0).map((_, index) => {
        const courseListingData: ?CourseListingData =
          // $FlowFixMe
          coursesIncludedInBundle[index];
        if (!courseListingData) {
          return <div style={{ flex: 1 }} key={`empty-tile-${index}`} />;
        }

        return (
          <React.Fragment key={`course-${courseListingData.id}`}>
            {index > 0 && (
              <Line noMargin>
                <Divider orientation="vertical" />
              </Line>
            )}
            {index > 0 && <Spacer />}
            <CourseTile
              courseListingData={courseListingData}
              isAlreadyReceived={isAlreadyReceived}
            />
          </React.Fragment>
        );
      });
    },
    [
      isMobile,
      isLandscape,
      numberOfTilesToDisplay,
      productListingDatasIncludedInBundle,
      isAlreadyReceived,
    ]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background="medium"
          variant="outlined"
          style={{
            ...styles.container,
            padding: isMobile ? mobilePadding : desktopPadding,
          }}
        >
          <Column expand noMargin>
            <ResponsiveLineStackLayout
              noResponsiveLandscape
              noMargin
              noColumnMargin
              noOverflowParent
            >
              <div
                style={{
                  ...styles.leftColumn,
                  width: isMobile && !isLandscape ? '100%' : undefined,
                }}
              >
                <ColumnStackLayout noMargin>
                  {bundleListingData ? (
                    <Text noMargin size="block-title">
                      {bundleListingData.nameByLocale
                        ? selectMessageByLocale(
                            i18n,
                            bundleListingData.nameByLocale
                          )
                        : bundleListingData.name}
                    </Text>
                  ) : (
                    <Skeleton height={30} />
                  )}
                  {bundleListingData ? (
                    <Text noMargin>
                      {bundleListingData.descriptionByLocale
                        ? selectMessageByLocale(
                            i18n,
                            bundleListingData.descriptionByLocale
                          )
                        : bundleListingData.description}
                    </Text>
                  ) : (
                    <Skeleton height={30} />
                  )}
                  {isMobile && (
                    <BundlePreviewTile bundleListingData={bundleListingData} />
                  )}
                </ColumnStackLayout>
                {bundleListingData ? (
                  <ColumnStackLayout noMargin>
                    {estimatedSavingsFormatted &&
                    estimatedTotalPriceFormatted &&
                    productPrice !== null ? (
                      <LineStackLayout
                        alignItems="center"
                        justifyContent="space-between"
                        noMargin
                      >
                        <LineStackLayout noMargin alignItems="center">
                          {!isAlreadyReceived && estimatedTotalPriceFormatted && (
                            <Text noMargin color="secondary" size="sub-title">
                              <span style={styles.discountedPrice}>
                                {estimatedTotalPriceFormatted}
                              </span>
                            </Text>
                          )}
                          {(isAlreadyReceived ||
                            !bundleListingData.visibleUntil) && (
                            <Chip
                              label={
                                isAlreadyReceived ? (
                                  <Trans>Owned</Trans>
                                ) : (
                                  <Trans>
                                    {
                                      estimatedSavingsFormatted.savingsPercentageFormatted
                                    }{' '}
                                    OFF
                                  </Trans>
                                )
                              }
                              style={
                                isAlreadyReceived
                                  ? styles.ownedChip
                                  : styles.discountChip
                              }
                            />
                          )}
                        </LineStackLayout>
                        {!isAlreadyReceived && (
                          <Text noMargin size="block-title">
                            {productPrice}
                          </Text>
                        )}
                      </LineStackLayout>
                    ) : (
                      <Skeleton variant="rect" height={20} />
                    )}
                    {!isAlreadyReceived && bundleListingData.visibleUntil && (
                      <Line noMargin expand>
                        <Column noMargin expand>
                          <ProductLimitedTimeOffer
                            visibleUntil={bundleListingData.visibleUntil}
                            hideMinutesAndSeconds
                            alignCenter
                          />
                        </Column>
                      </Line>
                    )}
                    <RaisedButton
                      primary
                      label={
                        isAlreadyReceived ? (
                          <Trans>Browse bundle</Trans>
                        ) : (
                          <Trans>See the bundle</Trans>
                        )
                      }
                      onClick={() => onDisplayBundle(bundleListingData)}
                    />
                  </ColumnStackLayout>
                ) : (
                  <ColumnStackLayout noMargin>
                    <Skeleton variant="rect" height={40} />
                  </ColumnStackLayout>
                )}
              </div>
              {courseTiles}
              {!isMobile && (
                <BundlePreviewTile bundleListingData={bundleListingData} />
              )}
            </ResponsiveLineStackLayout>
          </Column>
        </Paper>
      )}
    </I18n>
  );
};

export default BundlePreviewBanner;
