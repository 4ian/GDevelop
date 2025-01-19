// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type { CourseChapter } from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { Line, Spacer } from '../UI/Grid';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Divider from '@material-ui/core/Divider';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import Cloud from '../UI/CustomSvgIcons/Cloud';
import CourseChapterTaskItem from './CourseChapterTaskItem';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import GoldCompact from '../Profile/Subscription/Icons/GoldCompact';
import Coin from '../Credits/Icons/Coin';
import Lock from '../UI/CustomSvgIcons/Lock';
import { rankLabel } from '../Utils/Ordinal';
import type { CourseChapterCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import Window from '../Utils/Window';
import PasswordPromptDialog from '../AssetStore/PasswordPromptDialog';

const getYoutubeVideoIdFromUrl = (youtubeUrl: ?string): ?string => {
  if (!youtubeUrl || !youtubeUrl.startsWith('https://youtu.be/')) return null;

  try {
    const url = new URL(youtubeUrl);

    const lastPartOfUrl = url.pathname.split('/').pop();
    if (!lastPartOfUrl || !lastPartOfUrl.length) {
      console.error(`The video URL is badly formatted ${youtubeUrl}`);
      return null;
    }
    return lastPartOfUrl;
  } catch (error) {
    console.error(`Could not parse youtube url ${youtubeUrl}:`, error);
    return null;
  }
};

const styles = {
  stickyTitle: {
    position: 'sticky',
    top: -1, // If 0, it somehow lets a 1px gap between the parent, letting the user see the text scroll behind.
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    display: 'flex',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  videoAndMaterialsContainer: {
    display: 'flex',
    marginTop: 8,
    gap: 8,
    alignItems: 'stretch',
    flexWrap: 'wrap',
    marginBottom: 8,
    flex: 1,
    minWidth: 0,
  },
  lockedChapterTextContainer: {
    // Similar to Line component but without the minWidth:0 that somehow
    // prevents container to wrap when overflowing.
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  videoContainer: {
    flex: 2,
    minWidth: 300,
    display: 'flex',
    position: 'relative',
  },
  videoIFrame: { flex: 1, aspectRatio: '16 / 9' },
  videoThumbnail: {
    flex: 1,
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    width: '100%',
    borderRadius: 4,
  },
  lockerImage: { height: 60, width: 60 },
  lockedOverlay: {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    inset: 0,
    height: `100%`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white', // Force text/icon color since it's on a dark overlay.
  },
  sideBar: { padding: 16, display: 'flex' },
};

const LockedOverlay = () => (
  <div style={styles.lockedOverlay}>
    <Lock style={styles.lockerImage} />
  </div>
);

type Props = {|
  chapterIndex: number,
  courseChapter: CourseChapter,
  onOpenTemplate: () => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  onBuyWithCredits: (CourseChapter, string) => Promise<void>,
|};

const CourseChapterView = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      chapterIndex,
      courseChapter,
      onOpenTemplate,
      onCompleteTask,
      isTaskCompleted,
      getChapterCompletion,
      onBuyWithCredits,
    },
    ref
  ) => {
    const { openSubscriptionDialog } = React.useContext(
      SubscriptionSuggestionContext
    );
    const {
      values: { language },
    } = React.useContext(PreferencesContext);
    const [
      displayPasswordPrompt,
      setDisplayPasswordPrompt,
    ] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>('');
    const userLanguage2LetterCode = language.split('_')[0];
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { isMobile, isLandscape, windowSize } = useResponsiveWindowSize();
    const isMobilePortrait = isMobile && !isLandscape;
    const [openTasks, setOpenTasks] = React.useState<boolean>(false);
    const completion = getChapterCompletion(courseChapter.id);
    const isFinished = completion
      ? completion.completedTasks >= completion.tasks
      : false;
    const youtubeVideoId = getYoutubeVideoIdFromUrl(courseChapter.videoUrl);
    const [isPurchasing, setIsPurchasing] = React.useState<boolean>(false);

    const onClickBuyWithCredits = React.useCallback(
      async () => {
        if (!courseChapter.isLocked) return;

        setDisplayPasswordPrompt(false);
        setIsPurchasing(true);
        try {
          await onBuyWithCredits(courseChapter, password);
        } finally {
          setIsPurchasing(false);
        }
      },
      [courseChapter, onBuyWithCredits, password]
    );

    const onWillBuyWithCredits = React.useCallback(
      async () => {
        // Password is required in dev environment only so that one cannot freely claim asset packs.
        if (Window.isDev()) setDisplayPasswordPrompt(true);
        else onClickBuyWithCredits();
      },
      [onClickBuyWithCredits]
    );

    return (
      <ColumnStackLayout expand noMargin>
        <div
          ref={ref}
          style={{
            ...styles.titleContainer,
            flexDirection: isMobilePortrait ? 'column-reverse' : 'row',
            alignItems: isMobilePortrait ? 'flex-start' : 'center',
            justifyContent: 'space-between',
          }}
        >
          <LineStackLayout noMargin alignItems="center" expand>
            <Text size="title">
              {chapterIndex + 1}. {courseChapter.title}
            </Text>
            {isFinished && !isMobilePortrait && (
              <div
                style={{
                  display: 'flex',
                  color: gdevelopTheme.statusIndicator.success,
                }}
              >
                <CheckCircle />
              </div>
            )}
          </LineStackLayout>
          {isFinished ? (
            <div
              style={{
                ...styles.statusContainer,
                color: gdevelopTheme.statusIndicator.success,
              }}
            >
              {isMobilePortrait && <CheckCircle />}
              <Text color="inherit" noMargin>
                <Trans>Finished</Trans>
              </Text>
            </div>
          ) : completion ? (
            <Text color="secondary" noMargin>
              <Trans>
                {completion.completedTasks} of {completion.tasks} completed
              </Trans>
            </Text>
          ) : null}
        </div>
        {courseChapter.isLocked ? (
          <div style={styles.videoAndMaterialsContainer}>
            {youtubeVideoId && (
              <div
                style={{
                  ...styles.videoContainer,
                  maxWidth: windowSize === 'xlarge' ? 960 : 640,
                }}
              >
                <img
                  alt={`Video for lesson ${courseChapter.title}`}
                  style={styles.videoThumbnail}
                  src={`https://i.ytimg.com/vi/${youtubeVideoId}/sddefault.jpg`}
                />
                <LockedOverlay />
              </div>
            )}
            <div style={styles.lockedChapterTextContainer}>
              <Paper background="medium" style={styles.sideBar}>
                <ColumnStackLayout noMargin justifyContent="center">
                  <Text noMargin size="sub-title">
                    <Trans>Unlock this lesson to finish the course</Trans>
                  </Text>
                  <Text noMargin>
                    <Trans>
                      Use your GDevelop credits to purchase lessons in this
                      course; or get a subscription to get them for free.
                    </Trans>
                  </Text>
                  <ResponsiveLineStackLayout
                    noMargin
                    noColumnMargin
                    forceMobileLayout={
                      windowSize === 'small' || windowSize === 'medium'
                    }
                  >
                    <RaisedButton
                      primary
                      fullWidth
                      icon={<GoldCompact fontSize="small" />}
                      disabled={isPurchasing}
                      label={<Trans>Get a subscription</Trans>}
                      onClick={() =>
                        openSubscriptionDialog({
                          analyticsMetadata: {
                            reason: 'Unlock course chapter',
                            recommendedPlanId: 'gdevelop_silver',
                          },
                        })
                      }
                    />
                    {courseChapter.priceInCredits && (
                      <FlatButton
                        fullWidth
                        leftIcon={<Coin fontSize="small" />}
                        disabled={isPurchasing}
                        label={
                          <Trans>
                            Pay {courseChapter.priceInCredits} credits
                          </Trans>
                        }
                        onClick={onWillBuyWithCredits}
                      />
                    )}
                  </ResponsiveLineStackLayout>
                </ColumnStackLayout>
              </Paper>
            </div>
          </div>
        ) : (
          <div style={styles.videoAndMaterialsContainer}>
            {youtubeVideoId && (
              <div
                style={{
                  ...styles.videoContainer,
                  maxWidth: windowSize === 'xlarge' ? 960 : 640,
                }}
              >
                <iframe
                  title={`Video for lesson ${courseChapter.title}`}
                  type="text/html"
                  style={styles.videoIFrame}
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?cc_load_policy=1&cc_lang_pref=${
                    // Having another language than `en` as the requested caption language prevents the player from displaying the auto-translated captions.
                    'en'
                  }&hl=${userLanguage2LetterCode}`}
                  frameBorder="0"
                />
              </div>
            )}
            <ColumnStackLayout noMargin expand>
              <Text size="sub-title" noMargin>
                <Trans>Chapter materials</Trans>
              </Text>
              <Paper background="medium" style={styles.sideBar}>
                <ColumnStackLayout noMargin>
                  <Line noMargin>
                    <Text noMargin>{rankLabel[chapterIndex + 1]}</Text>
                    &nbsp;
                    <Text noMargin>
                      <Trans>Chapter</Trans>
                    </Text>
                    &nbsp;-&nbsp;
                    <Text noMargin>
                      <Trans>Template</Trans>
                    </Text>
                  </Line>
                  <Line noMargin>
                    <RaisedButton
                      primary
                      icon={<Cloud fontSize="small" />}
                      label={<Trans>Open template</Trans>}
                      onClick={onOpenTemplate}
                    />
                  </Line>
                </ColumnStackLayout>
              </Paper>
            </ColumnStackLayout>
          </div>
        )}
        {!courseChapter.isLocked && (
          <div
            style={{
              ...styles.stickyTitle,
              backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
            }}
          >
            <Divider />
            <Spacer />
            <Line alignItems="center" justifyContent="space-between" noMargin>
              <Text size="block-title">
                <Trans>Tasks</Trans>
              </Text>
              <FlatButton
                primary
                label={
                  openTasks ? (
                    <Trans>Close all tasks</Trans>
                  ) : (
                    <Trans>Open all tasks</Trans>
                  )
                }
                leftIcon={
                  openTasks ? (
                    <ChevronArrowTop size="small" />
                  ) : (
                    <ChevronArrowBottom size="small" />
                  )
                }
                onClick={() => setOpenTasks(!openTasks)}
              />
            </Line>
            <Spacer />
            <Divider />
          </div>
        )}
        {!courseChapter.isLocked &&
          courseChapter.tasks.map((item, taskIndex) => (
            <CourseChapterTaskItem
              courseChapterTask={item}
              key={taskIndex.toString()}
              isOpen={openTasks}
              isComplete={isTaskCompleted(courseChapter.id, taskIndex)}
              onComplete={isCompleted =>
                onCompleteTask(courseChapter.id, taskIndex, isCompleted)
              }
            />
          ))}
        {displayPasswordPrompt && (
          <PasswordPromptDialog
            onApply={onClickBuyWithCredits}
            onClose={() => setDisplayPasswordPrompt(false)}
            passwordValue={password}
            setPasswordValue={setPassword}
          />
        )}
      </ColumnStackLayout>
    );
  }
);

export default CourseChapterView;
