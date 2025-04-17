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
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import SectionContainer, { SectionRow } from '../SectionContainer';
import type {
  Course,
  CourseChapter,
} from '../../../../Utils/GDevelopServices/Asset';
import type { CourseCompletion, CourseChapterCompletion } from '../UseCourses';
import FlatButton from '../../../../UI/FlatButton';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { CardWidget, LARGE_WIDGET_SIZE } from '../CardWidget';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { formatTutorialToImageTileComponent, TUTORIAL_CATEGORY_TEXTS } from '.';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';
import Upload from '../../../../UI/CustomSvgIcons/Upload';
import FlingGame from '../InAppTutorials/FlingGame';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import { EducationCard } from './EducationCard';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import RaisedButton from '../../../../UI/RaisedButton';
import Help from '../../../../UI/CustomSvgIcons/Help';
import AnyQuestionDialog from '../AnyQuestionDialog';
import Paper from '../../../../UI/Paper';
import CoursePreviewBanner from '../../../../Course/CoursePreviewBanner';
import CourseCard from './CourseCard';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';

const getColumnsFromWindowSize = (
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

const getTutorialsColumnsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 5 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

type TutorialsRowProps = {|
  limits: ?Limits,
  tutorials: Tutorial[],
  category: TutorialCategory,
  onSelectCategory: (TutorialCategory | null) => void,
  onSelectTutorial: (tutorial: Tutorial) => void,
|};

export const TutorialsRow = ({
  limits,
  tutorials,
  category,
  onSelectCategory,
  onSelectTutorial,
}: TutorialsRowProps) => (
  <I18n>
    {({ i18n }) => (
      <ImageTileRow
        title={TUTORIAL_CATEGORY_TEXTS[category].title}
        description={TUTORIAL_CATEGORY_TEXTS[category].description}
        items={tutorials
          .filter(tutorial => tutorial.category === category)
          .map(tutorial =>
            formatTutorialToImageTileComponent({
              i18n,
              limits,
              tutorial,
              onSelectTutorial,
            })
          )}
        onShowAll={() => onSelectCategory(category)}
        showAllIcon={<ArrowRight fontSize="small" />}
        getColumnsFromWindowSize={getTutorialsColumnsFromWidth}
        getLimitFromWindowSize={getTutorialsColumnsFromWidth}
      />
    )}
  </I18n>
);

type Props = {|
  onTabChange: (tab: HomeTab) => void,
  onSelectCategory: (TutorialCategory | null) => void,
  tutorials: Array<Tutorial>,
  selectInAppTutorial: (tutorialId: string) => void,
  previewedCourse: ?Course,
  courses: ?(Course[]),
  previewedCourseChapters: ?(CourseChapter[]),
  onSelectCourse: (courseId: string | null) => void,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  getCourseChapterCompletion: (
    courseId: string,
    chapterId: string
  ) => CourseChapterCompletion | null,
|};

const MainPage = ({
  onTabChange,
  onSelectCategory,
  tutorials,
  selectInAppTutorial,
  previewedCourse,
  courses,
  previewedCourseChapters,
  onSelectCourse,
  getCourseCompletion,
  getCourseChapterCompletion,
}: Props) => {
  const { limits } = React.useContext(AuthenticatedUserContext);
  const { onLoadInAppTutorialFromLocalFile } = React.useContext(
    InAppTutorialContext
  );
  const {
    palette: { type: paletteType },
  } = React.useContext(GDevelopThemeContext);

  const [isAnyQuestionDialogOpen, setIsAnyQuestionDialogOpen] = React.useState(
    false
  );
  const {
    values: { showInAppTutorialDeveloperMode },
  } = React.useContext(PreferencesContext);
  const {
    windowSize,
    isMobile,
    isLandscape,
    isMediumScreen,
  } = useResponsiveWindowSize();

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

  return (
    <SectionContainer
      title={<Trans>Your learning journey starts here</Trans>}
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
        <CoursePreviewBanner
          course={previewedCourse}
          courseChapters={previewedCourseChapters}
          getCourseCompletion={getCourseCompletion}
          getCourseChapterCompletion={getCourseChapterCompletion}
          onDisplayCourse={() => {
            if (!previewedCourse) return;
            onSelectCourse(previewedCourse.id);
            onSelectCategory('course');
          }}
        />
      </SectionRow>

      <SectionRow>
        <Text size="title">
          <Trans>GameDev official specialization courses</Trans>
        </Text>
        <Line>
          <GridList
            cols={getColumnsFromWindowSize(windowSize, isLandscape)}
            style={styles.grid}
            cellHeight="auto"
            spacing={ITEMS_SPACING * 2}
          >
            {courses
              ? courses.map(course => {
                  const completion = getCourseCompletion(course.id);
                  return (
                    <GridListTile key={course.id}>
                      <CourseCard
                        course={course}
                        completion={completion}
                        onClick={() => {
                          onSelectCourse(course.id);
                          onSelectCategory('course');
                        }}
                      />
                    </GridListTile>
                  );
                })
              : new Array(2).fill(0).map((_, index) => (
                  <GridListTile key={`skeleton-course-${index}`}>
                    <CourseCard course={null} completion={null} />
                  </GridListTile>
                ))}
          </GridList>
        </Line>
      </SectionRow>
      <SectionRow>
        <Line justifyContent="space-between" noMargin alignItems="center">
          <Text noMargin size="title">
            <Trans>Guided lessons</Trans>
          </Text>
          {showInAppTutorialDeveloperMode && (
            <FlatButton
              label={<Trans>Load local lesson</Trans>}
              onClick={onLoadInAppTutorialFromLocalFile}
            />
          )}
        </Line>
        <GuidedLessons selectInAppTutorial={selectInAppTutorial} />
      </SectionRow>
      <SectionRow>
        <ColumnStackLayout noMargin expand>
          <Line noMargin>
            <GridList
              cols={getColumnsFromWindowSize(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={ITEMS_SPACING * 2}
            >
              {limits &&
              limits.quotas['ask-question'] &&
              limits.quotas['ask-question'].max > 0 ? (
                <GridListTile cols={2} style={{ background: 'transparent' }}>
                  <Paper
                    background="light"
                    style={{ display: 'flex', height: '100%' }}
                  >
                    <Column expand>
                      <Line expand alignItems="flex-start">
                        <Help />
                        <ColumnStackLayout expand alignItems="flex-start">
                          <Text noMargin size="block-title">
                            <Trans>Blocked on GDevelop?</Trans>
                          </Text>
                          <RaisedButton
                            label={
                              <Trans>Ask any question, get an answer</Trans>
                            }
                            size="medium"
                            color="success"
                            onClick={() => {
                              setIsAnyQuestionDialogOpen(true);
                            }}
                          />
                        </ColumnStackLayout>
                      </Line>
                    </Column>
                  </Paper>
                </GridListTile>
              ) : null}
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
      <>
        <SectionRow>
          <Line noMargin>
            <Text size="title">
              <Trans>Courses</Trans>
            </Text>
          </Line>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn everything about GDevelop from the ground up</Trans>
            </Text>
          </Line>
          {limits &&
          limits.capabilities.classrooms &&
          limits.capabilities.classrooms.hideUpgradeNotice ? null : (
            <>
              <Spacer />
              <EducationCard
                onSeeResources={() => onSelectCategory('education-curriculum')}
              />
            </>
          )}
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-beginner"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-intermediate"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-advanced"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <Text noMargin size="section-title">
            <Trans>Create and Publish a Fling game</Trans>
          </Text>
          <Text size="body" color="secondary" noMargin>
            <Trans>
              3-part tutorial to creating and publishing a game from scratch.
            </Trans>
          </Text>
          <FlingGame selectInAppTutorial={selectInAppTutorial} />
        </SectionRow>
        <SectionRow>
          <LineStackLayout
            justifyContent="space-between"
            alignItems="center"
            noMargin
            expand
          >
            <Column noMargin>
              <Text size="title">
                <Trans>Guides and tutorials</Trans>
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
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn by doing</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="education-curriculum"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="full-game"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="game-mechanic"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        {selectedTutorial && (
          <PrivateTutorialViewDialog
            tutorial={selectedTutorial}
            onClose={() => setSelectedTutorial(null)}
          />
        )}
      </>
      {isAnyQuestionDialogOpen && (
        <AnyQuestionDialog onClose={() => setIsAnyQuestionDialogOpen(false)} />
      )}
    </SectionContainer>
  );
};

export default MainPage;
