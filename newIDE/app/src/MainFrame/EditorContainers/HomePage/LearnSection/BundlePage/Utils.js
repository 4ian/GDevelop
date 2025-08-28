// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type IncludedRedemptionCode } from '../../../../../Utils/GDevelopServices/Asset';
import {
  type BundleListingData,
  type CourseListingData,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type CreditsPackageListingData,
} from '../../../../../Utils/GDevelopServices/Shop';
import Text from '../../../../../UI/Text';
import { Column } from '../../../../../UI/Grid';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../../UI/Layout';
import {
  renderEstimatedRedemptionCodePriceFormatted,
  renderEstimatedTotalPriceFormatted,
} from '../../../../../AssetStore/Bundles/Utils';
import {
  getPlanIcon,
  getPlanInferredNameFromId,
} from '../../../../../Profile/Subscription/PlanCard';
import Coin from '../../../../../Credits/Icons/Coin';
import { formatDurationOfRedemptionCode } from '../../../../../RedemptionCode/Utils';
import School from '../../../../../UI/CustomSvgIcons/School';
import Hammer from '../../../../../UI/CustomSvgIcons/Hammer';
import Store from '../../../../../UI/CustomSvgIcons/Store';
import { Divider } from '@material-ui/core';
import { getCreditsAmountFromId } from '../../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';

const styles = {
  discountedPrice: { textDecoration: 'line-through', opacity: 0.7 },
  coinIcon: {
    width: 13,
    height: 13,
    position: 'relative',
    top: -1,
  },
};

const getCoursesEstimatedHoursToComplete = (
  courseListingDatas: CourseListingData[]
) => {
  // Ideally we'd look at the Course durationInWeeks, but to avoid too
  // many API calls, we just estimate.
  const totalHours = courseListingDatas.reduce((acc, course) => {
    const estimatedHours = 4 * 5; // Estimate 4h per day, 5 days a week.
    return acc + Math.round(estimatedHours);
  }, 0);
  return Math.round(totalHours);
};

const CoursesLineSummary = ({
  courseListingDatasIncludedInBundle,
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
}: {|
  courseListingDatasIncludedInBundle: CourseListingData[],
  bundleListingData: BundleListingData,
  productListingDatasIncludedInBundle: (
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CreditsPackageListingData
    | CourseListingData
  )[],
  redemptionCodesIncludedInBundle: IncludedRedemptionCode[],
|}) => (
  <I18n>
    {({ i18n }) => (
      <LineStackLayout noMargin alignItems="flex-start">
        <School />
        <Column noMargin>
          <Text noMargin size="sub-title">
            <Trans>
              {courseListingDatasIncludedInBundle.length === 1 ? (
                <Trans>
                  {courseListingDatasIncludedInBundle.length} Course
                </Trans>
              ) : (
                <Trans>
                  {courseListingDatasIncludedInBundle.length} Courses
                </Trans>
              )}
            </Trans>
          </Text>
          <Text color="secondary" noMargin>
            <Trans>
              {getCoursesEstimatedHoursToComplete(
                courseListingDatasIncludedInBundle
              )}{' '}
              hours of material
            </Trans>
          </Text>
          <Text color="secondary" noMargin>
            <span style={styles.discountedPrice}>
              {renderEstimatedTotalPriceFormatted({
                i18n,
                bundleListingData,
                productListingDatasIncludedInBundle,
                redemptionCodesIncludedInBundle,
                filter: 'COURSE',
              })}
            </span>
          </Text>
        </Column>
      </LineStackLayout>
    )}
  </I18n>
);

const AssetPacksLineSummary = ({
  assetPackListingDatasIncludedInBundle,
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
}: {|
  assetPackListingDatasIncludedInBundle: PrivateAssetPackListingData[],
  bundleListingData: BundleListingData,
  productListingDatasIncludedInBundle: (
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CreditsPackageListingData
    | CourseListingData
  )[],
  redemptionCodesIncludedInBundle: IncludedRedemptionCode[],
|}) => (
  <I18n>
    {({ i18n }) => (
      <LineStackLayout noMargin alignItems="flex-start">
        <Store />
        <Column noMargin>
          <Text noMargin size="sub-title">
            <Trans>
              {assetPackListingDatasIncludedInBundle.length === 1 ? (
                <Trans>
                  {assetPackListingDatasIncludedInBundle.length} Asset pack
                </Trans>
              ) : (
                <Trans>
                  {assetPackListingDatasIncludedInBundle.length} Asset packs
                </Trans>
              )}
            </Trans>
          </Text>
          <Text color="secondary" noMargin>
            <Trans>Commercial License</Trans>
          </Text>
          <Text color="secondary" noMargin>
            <span style={styles.discountedPrice}>
              {renderEstimatedTotalPriceFormatted({
                i18n,
                bundleListingData,
                productListingDatasIncludedInBundle,
                redemptionCodesIncludedInBundle,
                filter: 'ASSET_PACK',
              })}
            </span>
          </Text>
        </Column>
      </LineStackLayout>
    )}
  </I18n>
);

const GameTemplatesLineSummary = ({
  gameTemplateListingDatasIncludedInBundle,
  bundleListingData,
  productListingDatasIncludedInBundle,
  redemptionCodesIncludedInBundle,
}: {|
  gameTemplateListingDatasIncludedInBundle: PrivateGameTemplateListingData[],
  bundleListingData: BundleListingData,
  productListingDatasIncludedInBundle: (
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CreditsPackageListingData
    | CourseListingData
  )[],
  redemptionCodesIncludedInBundle: IncludedRedemptionCode[],
|}) => (
  <I18n>
    {({ i18n }) => (
      <LineStackLayout noMargin alignItems="flex-start">
        <Hammer />
        <Column noMargin>
          <Text noMargin size="sub-title">
            <Trans>
              {gameTemplateListingDatasIncludedInBundle.length === 1 ? (
                <Trans>
                  {gameTemplateListingDatasIncludedInBundle.length} Game
                  template
                </Trans>
              ) : (
                <Trans>
                  {gameTemplateListingDatasIncludedInBundle.length} Game
                  templates
                </Trans>
              )}
            </Trans>
          </Text>
          <Text color="secondary" noMargin>
            <Trans>Lifetime access</Trans>
          </Text>
          <Text color="secondary" noMargin>
            <span style={styles.discountedPrice}>
              {renderEstimatedTotalPriceFormatted({
                i18n,
                bundleListingData,
                productListingDatasIncludedInBundle,
                redemptionCodesIncludedInBundle,
                filter: 'GAME_TEMPLATE',
              })}
            </span>
          </Text>
        </Column>
      </LineStackLayout>
    )}
  </I18n>
);

const RedemptionCodeLineSummary = ({
  includedRedemptionCode,
  bundleListingData,
}: {|
  includedRedemptionCode: IncludedRedemptionCode,
  bundleListingData: BundleListingData,
|}) => (
  <I18n>
    {({ i18n }) => (
      <LineStackLayout noMargin alignItems="flex-start">
        {getPlanIcon({
          planId: includedRedemptionCode.givenSubscriptionPlanId,
          logoSize: 20,
        })}
        <Column noMargin>
          <Text noMargin size="sub-title">
            <Trans>
              {getPlanInferredNameFromId(
                includedRedemptionCode.givenSubscriptionPlanId
              )}
              subscription
            </Trans>
          </Text>
          <Text color="secondary" noMargin>
            {formatDurationOfRedemptionCode(
              includedRedemptionCode.durationInDays
            )}
          </Text>
          <Text color="secondary" noMargin>
            <span style={styles.discountedPrice}>
              {renderEstimatedRedemptionCodePriceFormatted(
                bundleListingData,
                includedRedemptionCode,
                i18n
              )}
            </span>
          </Text>
        </Column>
      </LineStackLayout>
    )}
  </I18n>
);

const CreditsLineSummary = ({
  includedCreditsAmount,
}: {
  includedCreditsAmount: number,
}) => (
  <LineStackLayout noMargin alignItems="center">
    <Coin style={styles.coinIcon} />
    <Text noMargin size="sub-title">
      <Trans>{includedCreditsAmount} credits</Trans>
    </Text>
  </LineStackLayout>
);

export const getSummaryLines = ({
  redemptionCodesIncludedInBundle,
  bundleListingData,
  productListingDatasIncludedInBundle,
}: {|
  redemptionCodesIncludedInBundle: IncludedRedemptionCode[],
  bundleListingData: BundleListingData,
  productListingDatasIncludedInBundle: (
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData
    | BundleListingData
    | CreditsPackageListingData
    | CourseListingData
  )[],
|}) => {
  const includedListableProducts =
    bundleListingData.includedListableProducts || [];
  const summaryLineItems = [];

  const includedCourseListableProducts = includedListableProducts.filter(
    product => product.productType === 'COURSE'
  );

  const courseListingDatasIncludedInBundle = includedCourseListableProducts
    .map(product => {
      // $FlowFixMe - We know it's a course because of the filter.
      const courseListingData: ?CourseListingData = productListingDatasIncludedInBundle.find(
        listingData =>
          listingData.id === product.productId &&
          listingData.productType === 'COURSE'
      );

      return courseListingData;
    })
    .filter(Boolean);
  if (courseListingDatasIncludedInBundle.length) {
    summaryLineItems.push(
      <CoursesLineSummary
        courseListingDatasIncludedInBundle={courseListingDatasIncludedInBundle}
        bundleListingData={bundleListingData}
        productListingDatasIncludedInBundle={
          productListingDatasIncludedInBundle
        }
        redemptionCodesIncludedInBundle={redemptionCodesIncludedInBundle}
      />
    );
  }
  const includedAssetPackListableProducts = includedListableProducts.filter(
    product => product.productType === 'ASSET_PACK'
  );

  const assetPackListingDatasIncludedInBundle = includedAssetPackListableProducts
    .map(product => {
      // $FlowFixMe - We know it's an asset pack because of the filter.
      const assetPackListingData: ?PrivateAssetPackListingData = productListingDatasIncludedInBundle.find(
        listingData =>
          listingData.id === product.productId &&
          listingData.productType === 'ASSET_PACK'
      );

      return assetPackListingData;
    })
    .filter(Boolean);

  if (assetPackListingDatasIncludedInBundle.length) {
    summaryLineItems.push(
      <AssetPacksLineSummary
        assetPackListingDatasIncludedInBundle={
          assetPackListingDatasIncludedInBundle
        }
        bundleListingData={bundleListingData}
        productListingDatasIncludedInBundle={
          productListingDatasIncludedInBundle
        }
        redemptionCodesIncludedInBundle={redemptionCodesIncludedInBundle}
      />
    );
  }

  const includedGameTemplateListableProducts = includedListableProducts.filter(
    product => product.productType === 'GAME_TEMPLATE'
  );

  const gameTemplateListingDatasIncludedInBundle = includedGameTemplateListableProducts
    .map(product => {
      // $FlowFixMe - We know it's a game template because of the filter.
      const gameTemplateListingData: ?PrivateGameTemplateListingData = productListingDatasIncludedInBundle.find(
        listingData =>
          listingData.id === product.productId &&
          listingData.productType === 'GAME_TEMPLATE'
      );

      return gameTemplateListingData;
    })
    .filter(Boolean);
  if (gameTemplateListingDatasIncludedInBundle.length) {
    summaryLineItems.push(
      <GameTemplatesLineSummary
        gameTemplateListingDatasIncludedInBundle={
          gameTemplateListingDatasIncludedInBundle
        }
        bundleListingData={bundleListingData}
        productListingDatasIncludedInBundle={
          productListingDatasIncludedInBundle
        }
        redemptionCodesIncludedInBundle={redemptionCodesIncludedInBundle}
      />
    );
  }
  if (redemptionCodesIncludedInBundle.length) {
    redemptionCodesIncludedInBundle.forEach(code => {
      summaryLineItems.push(
        <RedemptionCodeLineSummary
          includedRedemptionCode={code}
          bundleListingData={bundleListingData}
        />
      );
    });
  }

  const includedCreditsAmount = includedListableProducts
    .filter(product => product.productType === 'CREDIT_PACKAGE')
    .reduce(
      (total, product) => total + getCreditsAmountFromId(product.productId),
      0
    );
  if (includedCreditsAmount) {
    summaryLineItems.push(
      <CreditsLineSummary includedCreditsAmount={includedCreditsAmount} />
    );
  }

  const mobileLineItems = [];
  const desktopLineItems = [];
  summaryLineItems.forEach((item, index) => {
    if (index !== 0) {
      desktopLineItems.push(
        <Column>
          <Divider orientation="vertical" />
        </Column>
      );
      if (index % 2 === 1) {
        mobileLineItems.push(
          <Column>
            <Divider orientation="vertical" />
          </Column>
        );
      }
    }
    desktopLineItems.push(item);
    mobileLineItems.push(
      <Column expand noMargin>
        {item}
      </Column>
    );
  });

  // Desktop, everything on one line.
  const desktopLines = [];
  desktopLines.push(
    <ResponsiveLineStackLayout expand>
      {desktopLineItems}
    </ResponsiveLineStackLayout>
  );
  // Mobile, 3 items by line (2 + 1 divider)
  const mobileLines = [];
  for (let i = 0; i < mobileLineItems.length; i += 3) {
    mobileLines.push(
      <LineStackLayout key={i} expand>
        {mobileLineItems.slice(i, i + 3)}
      </LineStackLayout>
    );
  }

  return {
    mobileLines,
    desktopLines,
  };
};
