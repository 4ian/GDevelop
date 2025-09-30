// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { CardWidget } from '../CardWidget';
import { Column, Line } from '../../../../UI/Grid';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import { Trans } from '@lingui/macro';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { type CourseCompletion } from '../UseCourses';
import { type Course } from '../../../../Utils/GDevelopServices/Asset';
import { type CourseListingData } from '../../../../Utils/GDevelopServices/Shop';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import Skeleton from '@material-ui/lab/Skeleton';
import { getProductPriceOrOwnedLabel } from '../../../../AssetStore/ProductPriceTag';
import Chip from '../../../../UI/Chip';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';

export const getChipColorFromEnglishLevel = (englishLevel: string) => {
  if (englishLevel.toLowerCase().includes('advanced')) return '#FF8569';
  if (englishLevel.toLowerCase().includes('intermediate')) return '#FFBC57';
  return '#3BF7F4';
};

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 16px 8px 16px',
    // Fix the height so that the card has a consistent height,
    // When owned or not.
    minHeight: 220,
  },
  image: { width: '100%', aspectRatio: '16 / 9' },
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
  },
  skeletonImageContainer: {
    display: 'flex',
    alignItems: 'stretch',
    aspectRatio: '16 / 9',
    flexDirection: 'column',
  },
  newLabel: {
    position: 'absolute',
    top: 7,
    left: 9,
    borderRadius: 4,
    backgroundColor: '#F03F18',
    fontWeight: 'bold',
    color: 'white',
    padding: '2px 6px',
  },
  chip: {
    height: 24,
  },
};

const specializationLabels = {
  'game-development': <Trans>Game Development</Trans>,
  'interaction-design': <Trans>Interaction Design</Trans>,
  marketing: <Trans>Marketing</Trans>,

  // Possible future additions:
  'game-design': <Trans>Game Design</Trans>,
  'programming-scripting': <Trans>Programming & Scripting</Trans>,
  'art-animation': <Trans>Art & Animation</Trans>,
  'audio-sound': <Trans>Audio & Sound</Trans>,
  'production-management': <Trans>Production & Project Management</Trans>,
  'liveops-analytics': <Trans>Live Ops & Analytics</Trans>,
  'narrative-writing': <Trans>Narrative & Writing</Trans>,
};
const specializationColors = {
  'game-development': '#5CB0FF',
  'interaction-design': '#CAC84E',
  marketing: '#FD3AE6',

  // Possible future additions:
  'game-design': '#F28E2B', // orange
  'programming-scripting': '#59A14F', // green
  'art-animation': '#B07AA1', // purple
  'audio-sound': '#E15759', // red
  'production-management': '#9C755F', // brown
  'liveops-analytics': '#76B7B2', // teal
  'narrative-writing': '#79706E', // gray
};

export const getSpecializationConfig = (
  specializationId: string
): {| label: React.Node, color: string |} => {
  let label =
    specializationId === 'loading' ? (
      <Trans>Loading</Trans>
    ) : (
      specializationLabels[specializationId]
    );
  if (!label) {
    console.warn(
      `No label found for specializationId "${specializationId}". Using default label.`
    );
    // Make each word uppercase and replace dashes with spaces
    label = (
      <Trans>
        {specializationId
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())}{' '}
      </Trans>
    );
  }
  const color = specializationColors[specializationId] || '#4F28CD';
  return {
    label,
    color,
  };
};

type Props = {|
  completion: ?CourseCompletion,
  course: ?Course,
  courseListingData: ?CourseListingData,
  onClick?: () => void,
  discountedPrice?: boolean,
  disabled?: boolean,
|};

const CourseCard = ({
  completion,
  course,
  courseListingData,
  onClick,
  discountedPrice,
  disabled,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const specializationConfig = getSpecializationConfig(
    course ? course.specializationId : 'loading'
  );
  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget onClick={disabled ? undefined : onClick} size={'large'}>
          {course && courseListingData ? (
            <Column expand noMargin noOverflowParent>
              <div style={styles.imageContainer}>
                <img
                  src={selectMessageByLocale(i18n, course.imageUrlByLocale)}
                  style={styles.image}
                  alt=""
                />
                {course.newUntil && course.newUntil > Date.now() && (
                  <div style={styles.newLabel}>
                    <Text color="inherit" noMargin displayInlineAsSpan>
                      <Trans>New</Trans>
                    </Text>
                  </div>
                )}
              </div>
              <div style={styles.cardTextContainer}>
                <ColumnStackLayout
                  noMargin
                  expand
                  justifyContent="space-between"
                  useFullHeight
                  noOverflowParent
                >
                  <ColumnStackLayout
                    noMargin
                    expand
                    justifyContent="flex-start"
                    useFullHeight
                    noOverflowParent
                  >
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
                    <LineStackLayout alignItems="center" noMargin>
                      <ColoredLinearProgress
                        value={
                          completion
                            ? (completion.completedChapters /
                                completion.chapters) *
                              100
                            : 0
                        }
                      />
                      <Text
                        displayInlineAsSpan
                        size="body-small"
                        noMargin
                        color="secondary"
                      >
                        {completion
                          ? `${completion.completedChapters}/${
                              completion.chapters
                            }`
                          : '-/-'}
                      </Text>
                    </LineStackLayout>

                    <Text
                      size="sub-title"
                      noMargin
                      color="primary"
                      align="left"
                    >
                      {selectMessageByLocale(i18n, course.titleByLocale)}
                    </Text>
                    <Text noMargin color="secondary" align="left">
                      {selectMessageByLocale(
                        i18n,
                        course.shortDescriptionByLocale
                      )}
                    </Text>
                  </ColumnStackLayout>
                  <div style={{ color: gdevelopTheme.text.color.secondary }}>
                    <Line justifyContent="space-between" alignItems="flex-end">
                      <Chip
                        style={{
                          ...styles.chip,
                          border: `1px solid ${getChipColorFromEnglishLevel(
                            course.levelByLocale.en
                          )}`,
                        }}
                        label={selectMessageByLocale(
                          i18n,
                          course.levelByLocale
                        )}
                        variant="outlined"
                      />
                      {getProductPriceOrOwnedLabel({
                        i18n,
                        productListingData: courseListingData,
                        usageType: 'default',
                        showBothPrices: 'column',
                        owned: !course.isLocked,
                        discountedPrice,
                      })}
                    </Line>
                  </div>
                </ColumnStackLayout>
              </div>
            </Column>
          ) : (
            <Column noMargin expand>
              <div style={styles.skeletonImageContainer}>
                <Skeleton variant="rect" height="100%" />
              </div>
              <Line expand>
                <Column expand>
                  <Skeleton height={20} />
                  <Skeleton height={20} />
                  <Skeleton height={30} />
                  <Skeleton height={100} />
                  <Skeleton height={50} />
                </Column>
              </Line>
            </Column>
          )}
        </CardWidget>
      )}
    </I18n>
  );
};

export default CourseCard;
