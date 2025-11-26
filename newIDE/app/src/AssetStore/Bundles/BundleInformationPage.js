// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Column, Line, Spacer } from '../../UI/Grid';
import BundlePageHeader from './BundlePageHeader';
import { BundleStoreContext } from './BundleStoreContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import {
  getBundle,
  type Bundle,
  type Course,
} from '../../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type BundleListingData,
  type PrivateGameTemplateListingData,
  type CourseListingData,
} from '../../Utils/GDevelopServices/Shop';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import { Trans } from '@lingui/macro';
import AlertMessage from '../../UI/AlertMessage';
import {
  getProductsIncludedInBundle,
  getProductsIncludedInBundleTiles,
} from '../ProductPageHelper';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { AssetStoreContext } from '../AssetStoreContext';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { GridList, GridListTile } from '@material-ui/core';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Text from '../../UI/Text';
import CourseStoreContext from '../../Course/CourseStoreContext';
import { planIdSortingFunction } from '../../Profile/Subscription/PlanCard';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import SubscriptionPlanPricingSummary from '../../Profile/Subscription/PromotionSubscriptionDialog/SubscriptionPlanPricingSummary';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import SubscriptionPlanTableSummary from '../../Profile/Subscription/PromotionSubscriptionDialog/SubscriptionPlanTableSummary';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { LARGE_WIDGET_SIZE } from '../../MainFrame/EditorContainers/HomePage/CardWidget';
import SectionContainer, {
  SectionRow,
} from '../../MainFrame/EditorContainers/HomePage/SectionContainer';
import { type CourseCompletion } from '../../MainFrame/EditorContainers/HomePage/UseCourses';
import CourseCard from '../../MainFrame/EditorContainers/HomePage/LearnSection/CourseCard';

const getColumns = (windowSize: WindowSizeType, isLandscape: boolean) => {
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

const cellSpacing = 10;
const MAX_COLUMNS = getColumns('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const styles = {
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${cellSpacing}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
};

type Props = {|
  bundleListingData: BundleListingData,
  onBack?: () => void | Promise<void>,
  onBundleOpen: BundleListingData => void,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onAssetPackOpen: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onCourseOpen: CourseListingData => void,
  courses: ?Array<Course>,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  noPadding?: boolean,
  noActions?: boolean,
  fastCheckout?: boolean,
  onCloseAfterPurchaseDone?: () => void,
|};

const BundleInformationPage = ({
  bundleListingData,
  onBack,
  onAssetPackOpen,
  onGameTemplateOpen,
  onBundleOpen,
  onCourseOpen,
  courses,
  getCourseCompletion,
  noPadding,
  noActions,
  fastCheckout,
  onCloseAfterPurchaseDone,
}: Props) => {
  const { windowSize, isLandscape, isMobile } = useResponsiveWindowSize();
  const { bundleListingDatas } = React.useContext(BundleStoreContext); // If archived, should use the one passed.
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { privateAssetPackListingDatas } = React.useContext(AssetStoreContext);
  const { listedCourses } = React.useContext(CourseStoreContext);
  const {
    receivedBundles,
    receivedGameTemplates,
    receivedAssetPacks,
  } = React.useContext(AuthenticatedUserContext);
  const { subscriptionPlansWithPricingSystems } = React.useContext(
    SubscriptionContext
  );
  const [bundle, setBundle] = React.useState<?Bundle>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const {
    palette: { type: paletteType },
  } = React.useContext(GDevelopThemeContext);

  const courseAndTheirListingDataIncludedInBundle = React.useMemo(
    (): Array<{|
      course: Course,
      courseListingData: CourseListingData,
    |}> | null => {
      if (!bundle || !bundleListingData || !courses) return null;
      const productListingDatasInBundle = getProductsIncludedInBundle({
        productListingData: bundleListingData,
        productListingDatas: [...(listedCourses || [])],
      });

      if (!productListingDatasInBundle) return null;
      // $FlowIgnore - Flow doesn't understand that we have filtered the products to only include courses.
      const courseListingDatasInBundle: CourseListingData[] = productListingDatasInBundle.filter(
        productListingData => productListingData.productType === 'COURSE'
      );

      return (courseListingDatasInBundle || [])
        .map(courseListingData => {
          const course = courses.find(
            course => course.id === courseListingData.id
          );
          if (!course) return null;
          return {
            course,
            courseListingData,
          };
        })
        .filter(Boolean);
    },
    [bundle, bundleListingData, listedCourses, courses]
  );

  const productsExceptCoursesIncludedInBundleTiles = React.useMemo(
    () =>
      bundle && bundleListingData
        ? getProductsIncludedInBundleTiles({
            product: bundle,
            productListingDatas: [
              ...(bundleListingDatas || []),
              ...(privateGameTemplateListingDatas || []),
              ...(privateAssetPackListingDatas || []),
            ],
            productListingData: bundleListingData,
            receivedProducts: [
              ...(receivedBundles || []),
              ...(receivedGameTemplates || []),
              ...(receivedAssetPacks || []),
            ],
            onPrivateAssetPackOpen: onAssetPackOpen,
            onPrivateGameTemplateOpen: onGameTemplateOpen,
            onBundleOpen,
            onCourseOpen,
            discountedPrice: true,
            disabled: noActions,
          })
        : null,
    [
      bundle,
      bundleListingDatas,
      privateGameTemplateListingDatas,
      privateAssetPackListingDatas,
      receivedBundles,
      receivedGameTemplates,
      receivedAssetPacks,
      bundleListingData,
      onAssetPackOpen,
      onGameTemplateOpen,
      onBundleOpen,
      onCourseOpen,
      noActions,
    ]
  );

  const highestSubscriptionPlanIncludedInBundle = React.useMemo(
    () => {
      if (!bundleListingData) return null;

      const sortedIncludedRedemptionCodes = (
        bundleListingData.includedRedemptionCodes || []
      ).sort((a, b) =>
        planIdSortingFunction(
          a.givenSubscriptionPlanId,
          b.givenSubscriptionPlanId
        )
      );

      if (!sortedIncludedRedemptionCodes.length) return null;

      const planId =
        sortedIncludedRedemptionCodes[sortedIncludedRedemptionCodes.length - 1]
          .givenSubscriptionPlanId;

      return subscriptionPlansWithPricingSystems
        ? subscriptionPlansWithPricingSystems.find(
            subscriptionPlanWithPricingSystems =>
              subscriptionPlanWithPricingSystems.id === planId
          )
        : null;
    },
    [bundleListingData, subscriptionPlansWithPricingSystems]
  );

  React.useEffect(
    () => {
      (async () => {
        try {
          const bundle = await getBundle(bundleListingData.id);

          setBundle(bundle);
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
        }
      })();
    },
    [bundleListingData.id]
  );

  const customSectionPaperStyle = {
    // $FlowIgnore
    ...(noPadding
      ? {
          padding: 0,
        }
      : {}),
    ...(bundleListingData.visibleUntil && !noPadding
      ? {
          backgroundAttachment: 'local',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top',
          backgroundSize: isMobile && !isLandscape ? 'contain' : 'auto',
          backgroundImage: `${
            paletteType === 'dark'
              ? 'linear-gradient(180deg, #6B1A18 0px, #2D2331 5%, #1d1d2600 10%)'
              : 'linear-gradient(180deg, #F03F18 0px, #f5f5f700 10%)'
          }`,
        }
      : {}),
  };

  if (errorText) {
    return (
      <SectionContainer
        flexBody
        backAction={onBack}
        customPaperStyle={customSectionPaperStyle}
      >
        <SectionRow expand>
          <Line alignItems="center" justifyContent="center" expand>
            <AlertMessage kind="error">{errorText}</AlertMessage>
          </Line>
        </SectionRow>
      </SectionContainer>
    );
  }

  if (!bundleListingData || !bundle) {
    return (
      <SectionContainer flexBody customPaperStyle={customSectionPaperStyle}>
        <SectionRow expand>
          <PlaceholderLoader />
        </SectionRow>
      </SectionContainer>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          backAction={onBack}
          customPaperStyle={customSectionPaperStyle}
        >
          <BundlePageHeader
            bundleListingData={bundleListingData}
            bundle={bundle}
            i18n={i18n}
            fastCheckout={fastCheckout}
            onCloseAfterPurchaseDone={onCloseAfterPurchaseDone}
          />
          <Line noMargin>
            <Text size="section-title">
              <Trans>What's included:</Trans>
            </Text>
          </Line>
          {courseAndTheirListingDataIncludedInBundle &&
            courseAndTheirListingDataIncludedInBundle.length > 0 && (
              <Line>
                <GridList
                  cols={getColumns(windowSize, isLandscape)}
                  style={styles.grid}
                  cellHeight="auto"
                  spacing={cellSpacing}
                >
                  {courseAndTheirListingDataIncludedInBundle.map(
                    ({ course, courseListingData }) => {
                      const completion = getCourseCompletion(course.id);
                      return (
                        <GridListTile key={course.id}>
                          <CourseCard
                            course={course}
                            courseListingData={courseListingData}
                            completion={completion}
                            onClick={() => {
                              onCourseOpen(courseListingData);
                            }}
                            discountedPrice
                            disabled={noActions}
                          />
                        </GridListTile>
                      );
                    }
                  )}
                </GridList>
              </Line>
            )}
          {productsExceptCoursesIncludedInBundleTiles && (
            <Line>
              <GridList
                cols={getColumns(windowSize, isLandscape)}
                cellHeight="auto"
                spacing={cellSpacing}
                style={styles.grid}
              >
                {productsExceptCoursesIncludedInBundleTiles}
              </GridList>
            </Line>
          )}
          {highestSubscriptionPlanIncludedInBundle && (
            <ResponsiveLineStackLayout expand noColumnMargin>
              <Column noMargin justifyContent="center">
                <Line expand>
                  <SubscriptionPlanPricingSummary
                    subscriptionPlanWithPricingSystems={
                      highestSubscriptionPlanIncludedInBundle
                    }
                    disabled={false}
                    onClickChoosePlan={async () => {}}
                    seatsCount={0}
                    setSeatsCount={() => {}}
                    period={'month'}
                    setPeriod={() => {}}
                    onlyShowDiscountedPrice
                  />
                </Line>
              </Column>
              <Spacer />
              <Column noMargin>
                <SubscriptionPlanTableSummary
                  subscriptionPlanWithPricingSystems={
                    highestSubscriptionPlanIncludedInBundle
                  }
                  hideFullTableLink
                />
              </Column>
            </ResponsiveLineStackLayout>
          )}
        </SectionContainer>
      )}
    </I18n>
  );
};

export default BundleInformationPage;
