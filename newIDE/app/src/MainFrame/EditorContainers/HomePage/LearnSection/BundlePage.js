// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Column, Line } from '../../../../UI/Grid';
import BundlePageHeader from './BundlePageHeader';
import { BundleStoreContext } from '../../../../AssetStore/Bundles/BundleStoreContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import type { CourseCompletion } from '../UseCourses';
import {
  getBundle,
  type Bundle,
  type Course,
} from '../../../../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type BundleListingData,
  type PrivateGameTemplateListingData,
  type CourseListingData,
} from '../../../../Utils/GDevelopServices/Shop';
import { type SubscriptionPlanWithPricingSystems } from '../../../../Utils/GDevelopServices/Usage';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import { Trans } from '@lingui/macro';
import AlertMessage from '../../../../UI/AlertMessage';
import {
  getProductsIncludedInBundle,
  getProductsIncludedInBundleTiles,
} from '../../../../AssetStore/ProductPageHelper';
import { PrivateGameTemplateStoreContext } from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { AssetStoreContext } from '../../../../AssetStore/AssetStoreContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { GridList, GridListTile } from '@material-ui/core';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Text from '../../../../UI/Text';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import CourseCard from './CourseCard';

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
  onBack: () => void,
  getSubscriptionPlansWithPricingSystems: () => Array<SubscriptionPlanWithPricingSystems> | null,
  onBundleOpen: BundleListingData => void,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onAssetPackOpen: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onCourseOpen: CourseListingData => void,
  courses: ?Array<Course>,
  receivedCourses: ?Array<Course>,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
|};

const BundlePage = ({
  bundleListingData,
  onBack,
  getSubscriptionPlansWithPricingSystems,
  onAssetPackOpen,
  onGameTemplateOpen,
  onBundleOpen,
  onCourseOpen,
  courses,
  receivedCourses,
  getCourseCompletion,
}: Props) => {
  const { windowSize, isLandscape } = useResponsiveWindowSize();
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
  const [bundle, setBundle] = React.useState<?Bundle>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);

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
    ]
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

  if (errorText) {
    return (
      <SectionContainer flexBody backAction={onBack}>
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
      <SectionContainer flexBody>
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
          applyTopSpacingAsMarginOnChildrenContainer
          backAction={onBack}
        >
          <Column noOverflowParent noMargin>
            <BundlePageHeader
              bundleListingData={bundleListingData}
              bundle={bundle}
              getSubscriptionPlansWithPricingSystems={
                getSubscriptionPlansWithPricingSystems
              }
            />
          </Column>
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
                          />
                        </GridListTile>
                      );
                    }
                  )}
                </GridList>
              </Line>
            )}
          {productsExceptCoursesIncludedInBundleTiles && (
            <>
              <Line>
                <Text size="block-title">
                  <Trans>Also included in this bundle</Trans>
                </Text>
              </Line>
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
            </>
          )}
        </SectionContainer>
      )}
    </I18n>
  );
};

export default BundlePage;
