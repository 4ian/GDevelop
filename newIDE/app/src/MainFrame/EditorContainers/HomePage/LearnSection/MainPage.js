// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Window from '../../../../Utils/Window';
import { Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import { type HomeTab } from '../HomePageMenu';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import SectionContainer, { SectionRow } from '../SectionContainer';
import type {
  Course,
  CourseChapter,
} from '../../../../Utils/GDevelopServices/Asset';
import type { CourseCompletion, CourseChapterCompletion } from '../UseCourses';
import FlatButton from '../../../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { CardWidget, LARGE_WIDGET_SIZE } from '../CardWidget';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';
import Upload from '../../../../UI/CustomSvgIcons/Upload';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import RaisedButton from '../../../../UI/RaisedButton';
import Help from '../../../../UI/CustomSvgIcons/Help';
import Paper from '../../../../UI/Paper';
import CourseCard from './CourseCard';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import Link from '../../../../UI/Link';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import TutorialsRow from './TutorialsRow';
import { getColumnsFromWindowSize, type LearnCategory } from './Utils';
import ExampleStore from '../../../../AssetStore/ExampleStore';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import Carousel from '../../../../UI/Carousel';

const NUMBER_OF_SCROLLS = 2; // Number of times the carousel can be scrolled to see all items.
const MAX_COLUMNS = getColumnsFromWindowSize('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
  helpItem: {
    padding: 10,
    flex: 1,
    display: 'flex',
  },
};

type Props = {|
  onTabChange: (tab: HomeTab) => void,
  onSelectCategory: (category: LearnCategory) => void,
  selectInAppTutorial: (tutorialId: string) => void,
  previewedCourse: ?Course,
  courses: ?(Course[]),
  onSelectCourse: (courseId: string) => void,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  getCourseChapterCompletion: (
    courseId: string,
    chapterId: string
  ) => CourseChapterCompletion | null,
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
  onOpenNewProjectSetupDialog: () => void,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
|};

const MainPage = ({
  onTabChange,
  onSelectCategory,
  selectInAppTutorial,
  previewedCourse,
  courses,
  onSelectCourse,
  getCourseCompletion,
  getCourseChapterCompletion,
  onOpenAskAi,
  onOpenNewProjectSetupDialog,
  onSelectPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
}: Props) => {
  const { limits } = React.useContext(AuthenticatedUserContext);
  const {
    palette: { type: paletteType },
  } = React.useContext(GDevelopThemeContext);

  const { listedCourses } = React.useContext(CourseStoreContext);
  const {
    windowSize,
    isMobile,
    isLandscape,
    isMediumScreen,
  } = useResponsiveWindowSize();

  const displayedCourses = React.useMemo(
    () => {
      if (!courses) return null;
      const numberOfColumnsToScroll =
        getColumnsFromWindowSize(windowSize, isLandscape) *
        (NUMBER_OF_SCROLLS + 1);
      return courses.slice(0, numberOfColumnsToScroll);
    },
    [courses, windowSize, isLandscape]
  );

  const [
    selectedTutorial,
    setSelectedTutorial,
  ] = React.useState<Tutorial | null>(null);

  const helpItems: {
    title: React.Node,
    description: React.Node,
    action: () => void,
    disabled?: boolean,
  }[] = [
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: () =>
        Window.openExternalURL('https://wiki.gdevelop.io/gdevelop5/'),
    },
    {
      title: <Trans>Forums</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => Window.openExternalURL('https://forum.gdevelop.io'),
    },
    {
      title: <Trans>Discord</Trans>,
      description: <Trans>Join the discussion</Trans>,
      action: () => Window.openExternalURL('https://discord.gg/gdevelop'),
    },
  ].filter(Boolean);

  const numberOfColumns = getColumnsFromWindowSize(windowSize, isLandscape);

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          chipText={<Trans>Start for free</Trans>}
          title={<Trans>Official Game Dev courses</Trans>}
          titleAdornment={
            <Line noMargin justifyContent="flex-end">
              <FlatButton
                onClick={() => onSelectCategory('all-courses')}
                label={<Trans>See all</Trans>}
                rightIcon={<ArrowRight fontSize="small" />}
              />
            </Line>
          }
          subtitleText={
            <Trans>
              Break into the{' '}
              <Link
                href={'https://gdevelop.io/blog/indie-mobile-creators-2025'}
                onClick={() =>
                  Window.openExternalURL(
                    'https://gdevelop.io/blog/indie-mobile-creators-2025'
                  )
                }
              >
                booming industry
              </Link>{' '}
              of casual gaming. Sharpen your skills and become a professional.
              Start for free:
            </Trans>
          }
          customPaperStyle={{
            backgroundAttachment: 'local',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
            backgroundSize: isMobile && !isLandscape ? 'contain' : 'auto',
            backgroundImage: `url('res/premium/premium_dialog_background.png'),${
              paletteType === 'dark'
                ? 'linear-gradient(180deg, #322659 0px, #3F2458 20px, #1D1D26 200px, #1D1D26 100%)'
                : 'linear-gradient(180deg, #CBBAFF 0px, #DEBBFF 20px, #F5F5F7 200px, #F5F5F7 100%)'
            }`,
          }}
        >
          <SectionRow>
            <Line>
              <Carousel
                items={
                  displayedCourses && listedCourses
                    ? displayedCourses.map(course => {
                        const completion = getCourseCompletion(course.id);
                        const courseListingData = listedCourses.find(
                          listedCourse => listedCourse.id === course.id
                        );
                        return {
                          renderItem: () => (
                            <GridListTile key={course.id}>
                              <CourseCard
                                course={course}
                                courseListingData={courseListingData}
                                completion={completion}
                                onClick={() => {
                                  onSelectCourse(course.id);
                                }}
                              />
                            </GridListTile>
                          ),
                        };
                      })
                    : new Array(6).fill(0).map((_, index) => ({
                        renderItem: () => (
                          <GridListTile key={`skeleton-course-${index}`}>
                            <CourseCard
                              course={null}
                              courseListingData={null}
                              completion={null}
                            />
                          </GridListTile>
                        ),
                      }))
                }
              />
            </Line>
          </SectionRow>
          <SectionRow>
            <LineStackLayout
              justifyContent="space-between"
              alignItems="center"
              noMargin
              expand
            >
              <Column noMargin>
                <Text size="section-title">
                  <Trans>In-app tutorials</Trans>
                </Text>
              </Column>
              <Column noMargin>
                <FlatButton
                  onClick={() => onSelectCategory('in-app-tutorials')}
                  label={<Trans>See all</Trans>}
                  rightIcon={<ArrowRight fontSize="small" />}
                />
              </Column>
            </LineStackLayout>
            <GuidedLessons
              selectInAppTutorial={selectInAppTutorial}
              displayAsCarousel
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="all-tutorials"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <Column noMargin expand>
                <Text size="section-title">
                  <Trans>Learn by dissecting ready-made games</Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <Line noMargin justifyContent="flex-end">
                  <FlatButton
                    onClick={onOpenNewProjectSetupDialog}
                    label={<Trans>See all</Trans>}
                    rightIcon={<ArrowRight fontSize="small" />}
                  />
                </Line>
              </Column>
            </LineStackLayout>
            <Spacer />
            <ExampleStore
              onSelectExampleShortHeader={onSelectExampleShortHeader}
              onSelectPrivateGameTemplateListingData={
                onSelectPrivateGameTemplateListingData
              }
              i18n={i18n}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
              hideSearch
              onlyShowGames
              hidePremiumTemplates
              limitRowsTo={1}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="full-game"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <LineStackLayout
              justifyContent="space-between"
              alignItems="center"
              noMargin
              expand
            >
              <Column noMargin>
                <Text size="section-title">
                  <Trans>Want to know more?</Trans>
                </Text>
              </Column>
              <LineStackLayout noMargin>
                {!isMobile && (
                  <FlatButton
                    onClick={() => {
                      Window.openExternalURL(
                        'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                      );
                    }}
                    primary
                    leftIcon={<Upload />}
                    label={
                      isMediumScreen ? (
                        <Trans>Submit an example</Trans>
                      ) : (
                        <Trans>Submit your project as an example</Trans>
                      )
                    }
                  />
                )}
                {!isMobile && (
                  <FlatButton
                    onClick={() => {
                      Window.openExternalURL(
                        'https://airtable.com/shrv295oHlsuS69el'
                      );
                    }}
                    primary
                    leftIcon={<TranslateIcon />}
                    label={
                      isMediumScreen ? (
                        <Trans>Submit a tutorial</Trans>
                      ) : (
                        <Trans>
                          Submit a tutorial translated in your language
                        </Trans>
                      )
                    }
                  />
                )}
              </LineStackLayout>
            </LineStackLayout>
          </SectionRow>
          <SectionRow>
            <ColumnStackLayout noMargin expand>
              <Line noMargin>
                <GridList
                  cols={numberOfColumns}
                  style={styles.grid}
                  cellHeight="auto"
                  spacing={ITEMS_SPACING * 2}
                >
                  <GridListTile cols={1} style={{ background: 'transparent' }}>
                    <Paper
                      background="light"
                      style={{ display: 'flex', height: '100%' }}
                    >
                      <Column expand>
                        <Line expand alignItems="flex-start">
                          <Help />
                          <ColumnStackLayout expand alignItems="flex-start">
                            <Text noMargin size="block-title" align="left">
                              <Trans>Blocked on GDevelop?</Trans>
                            </Text>
                            <RaisedButton
                              size="large"
                              color="success"
                              label={<Trans>Ask the AI</Trans>}
                              rightIcon={<ArrowRight />}
                              onClick={() =>
                                onOpenAskAi({
                                  mode: 'chat',
                                  aiRequestId: null,
                                  paneIdentifier: 'center',
                                })
                              }
                            />
                          </ColumnStackLayout>
                        </Line>
                      </Column>
                    </Paper>
                  </GridListTile>
                  {helpItems.map((helpItem, index) => (
                    <GridListTile key={index}>
                      <CardWidget
                        onClick={helpItem.action}
                        key={index}
                        size="large"
                        disabled={helpItem.disabled}
                        useDefaultDisabledStyle
                      >
                        <div style={styles.helpItem}>
                          <ColumnStackLayout
                            expand
                            justifyContent="center"
                            useFullHeight
                          >
                            <Text noMargin size="block-title">
                              {helpItem.title}
                            </Text>
                            <Text noMargin size="body" color="secondary">
                              {helpItem.description}
                            </Text>
                          </ColumnStackLayout>
                        </div>
                      </CardWidget>
                    </GridListTile>
                  ))}
                </GridList>
              </Line>
            </ColumnStackLayout>
          </SectionRow>
          {selectedTutorial && (
            <PrivateTutorialViewDialog
              tutorial={selectedTutorial}
              onClose={() => setSelectedTutorial(null)}
            />
          )}
        </SectionContainer>
      )}
    </I18n>
  );
};

export default MainPage;
