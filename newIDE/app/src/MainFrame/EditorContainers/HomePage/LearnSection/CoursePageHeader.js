// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type Course } from '../../../../Utils/GDevelopServices/Asset';
import { type CourseListingData } from '../../../../Utils/GDevelopServices/Shop';
import { SectionRow } from '../SectionContainer';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import { Column, Line } from '../../../../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import CoursePurchaseDialog from './CoursePurchaseDialog';
import {
  getChipColorFromEnglishLevel,
  getSpecializationConfig,
} from './CourseCard';
import { renderProductPrice } from '../../../../AssetStore/ProductPriceTag';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import PasswordPromptDialog from '../../../../AssetStore/PasswordPromptDialog';
import Window from '../../../../Utils/Window';
import { PurchaseProductButtons } from '../../../../AssetStore/ProductPageHelper';
import { shouldUseAppStoreProduct } from '../../../../Utils/AppStorePurchases';
import { Divider } from '@material-ui/core';
import classes from './CoursePageHeader.module.css';
import Gold from '../../../../Profile/Subscription/Icons/Gold';
import Chip from '../../../../UI/Chip';
import SecureCheckout from '../../../../AssetStore/SecureCheckout/SecureCheckout';

const styles = {
  title: { overflowWrap: 'anywhere', textWrap: 'wrap' },
  image: { width: 300, aspectRatio: '16 / 9' },
  specializationDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  paper: {
    zIndex: 2, // Make sure the paper is above the background for the border effect.
    flex: 1,
  },
  diamondIcon: {
    width: 20,
    height: 20,
  },
  chip: {
    height: 24,
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
  course: Course,
  onBuyCourseWithCredits: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  onBuyCourse: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  purchasingCourseListingData: ?CourseListingData,
  setPurchasingCourseListingData: (CourseListingData | null) => void,
  simulateAppStoreProduct?: boolean,
|};

const CoursePageHeader = ({
  course,
  onBuyCourseWithCredits,
  onBuyCourse,
  purchasingCourseListingData,
  setPurchasingCourseListingData,
  simulateAppStoreProduct,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { listedCourses } = React.useContext(CourseStoreContext);
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();

  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');

  const onClickBuyWithCredits = React.useCallback(
    async (i18n: I18nType) => {
      if (!course.isLocked) return;
      setDisplayPasswordPrompt(false);

      await onBuyCourseWithCredits(course, password, i18n);
    },
    [course, onBuyCourseWithCredits, password]
  );
  const onWillBuyWithCredits = React.useCallback(
    async (i18n: I18nType) => {
      // Password is required in dev environment only so that one cannot freely claim asset packs.
      if (Window.isDev()) setDisplayPasswordPrompt(true);
      else onClickBuyWithCredits(i18n);
    },
    [onClickBuyWithCredits]
  );

  const specializationConfig = getSpecializationConfig(
    course ? course.specializationId : 'loading'
  );
  const courseListingData = listedCourses
    ? listedCourses.find(listedCourse => listedCourse.id === course.id)
    : null;
  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || simulateAppStoreProduct;

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
                      src={selectMessageByLocale(i18n, course.imageUrlByLocale)}
                      style={styles.image}
                      alt=""
                    />
                  </div>
                  <ColumnStackLayout expand justifyContent="flex-start">
                    {course.includedInSubscriptions.length && (
                      <Line
                        noMargin
                        alignItems="center"
                        justifyContent={
                          isMobile || isMediumScreen ? 'flex-start' : 'flex-end'
                        }
                      >
                        <div className={classes.premiumContainer}>
                          <Paper style={styles.paper} background="medium">
                            <Column>
                              <Line expand alignItems="center" noMargin>
                                <Gold style={styles.diamondIcon} />
                                <Text>
                                  <Trans>
                                    Included with GDevelop subscriptions
                                  </Trans>
                                </Text>
                              </Line>
                            </Column>
                          </Paper>
                        </div>
                      </Line>
                    )}
                    <Text size="title" noMargin style={styles.title}>
                      {selectMessageByLocale(i18n, course.titleByLocale)}
                    </Text>
                    <Line noMargin>
                      <Text noMargin>
                        {selectMessageByLocale(
                          i18n,
                          course.shortDescriptionByLocale
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
                  <Column justifyContent="center" expand noMargin>
                    <Text>
                      <Trans>{course.chaptersTargetCount} chapters</Trans>
                    </Text>
                  </Column>
                  <ResponsiveDivider />
                  <Column
                    justifyContent="center"
                    alignItems="flex-start"
                    expand
                    noMargin
                  >
                    <Chip
                      style={{
                        ...styles.chip,
                        border: `1px solid ${getChipColorFromEnglishLevel(
                          course.levelByLocale.en
                        )}`,
                      }}
                      label={selectMessageByLocale(i18n, course.levelByLocale)}
                      variant="outlined"
                    />
                  </Column>
                  <ResponsiveDivider />
                  <Column justifyContent="center" expand noMargin>
                    <LineStackLayout alignItems="center" noMargin>
                      <span
                        style={{
                          ...styles.specializationDot,
                          backgroundColor: specializationConfig.color,
                        }}
                      />
                      <Text
                        displayInlineAsSpan
                        size="body-small"
                        noMargin
                        color="secondary"
                        style={textEllipsisStyle}
                      >
                        {specializationConfig.label}
                      </Text>
                    </LineStackLayout>
                  </Column>
                </ResponsiveLineStackLayout>
                {course.isLocked && (
                  <Paper background="medium" style={{ padding: 16 }}>
                    {!!courseListingData && (
                      <ResponsiveLineStackLayout
                        justifyContent="space-between"
                        noMargin
                      >
                        {!isMobile && !isMediumScreen && (
                          <Column noMargin justifyContent="center">
                            <div
                              style={{
                                color: gdevelopTheme.text.color.secondary,
                              }}
                            >
                              {renderProductPrice({
                                i18n,
                                productListingData: courseListingData,
                                usageType: 'default',
                                showBothPrices: 'line',
                              })}
                            </div>
                          </Column>
                        )}
                        <ResponsiveLineStackLayout
                          noMargin
                          forceMobileLayout={isMediumScreen}
                        >
                          <PurchaseProductButtons
                            i18n={i18n}
                            productListingData={courseListingData}
                            selectedUsageType="default"
                            onUsageTypeChange={() => {}}
                            simulateAppStoreProduct={
                              shouldUseOrSimulateAppStoreProduct
                            }
                            isAlreadyReceived={!course.isLocked}
                            onClickBuy={() =>
                              onBuyCourse(course, password, i18n)
                            }
                            onClickBuyWithCredits={() =>
                              onWillBuyWithCredits(i18n)
                            }
                          />
                          {!shouldUseOrSimulateAppStoreProduct && (
                            <SecureCheckout />
                          )}
                        </ResponsiveLineStackLayout>
                      </ResponsiveLineStackLayout>
                    )}
                  </Paper>
                )}
              </ColumnStackLayout>
            </Paper>
          </SectionRow>
          {!!purchasingCourseListingData && (
            <CoursePurchaseDialog
              course={course}
              courseListingData={purchasingCourseListingData}
              onClose={() => setPurchasingCourseListingData(null)}
            />
          )}
          {displayPasswordPrompt && (
            <PasswordPromptDialog
              onApply={() => onClickBuyWithCredits(i18n)}
              onClose={() => setDisplayPasswordPrompt(false)}
              passwordValue={password}
              setPasswordValue={setPassword}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default CoursePageHeader;
