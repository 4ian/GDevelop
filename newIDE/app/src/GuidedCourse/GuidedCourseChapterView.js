// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type { GuidedCourseChapter } from '../Utils/GDevelopServices/Asset';
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
import { Divider } from '@material-ui/core';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import GuidedCourseChapterTaskItem from './GuidedCourseChapterTaskItem';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import Gold from '../Profile/Subscription/Icons/Gold';
import Coin from '../Credits/Icons/Coin';
import Lock from '../UI/CustomSvgIcons/Lock';

const getYoutubeVideoIdFromUrl = (youtubeUrl: ?string): ?string => {
  if (!youtubeUrl || !youtubeUrl.startsWith('https://youtu.be/')) return null;

  const url = new URL(youtubeUrl);

  const lastPartOfUrl = url.pathname.split('/').pop();
  if (!lastPartOfUrl || !lastPartOfUrl.length) {
    console.error(`The video URL is badly formatted ${youtubeUrl}`);
    return null;
  }
  return lastPartOfUrl;
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
  videoContainer: {
    flex: 2,
    maxWidth: 640,
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
    aspectRatio: '16 / 9',
    borderRadius: 4,
    inset: 0,
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
  guidedCourseChapter: GuidedCourseChapter,
  onOpenTemplate: (url: string) => void,
|};

const GuidedCourseChapterView = ({
  guidedCourseChapter,
  onOpenTemplate,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const {
    values: { language },
  } = React.useContext(PreferencesContext);
  const userLanguage2LetterCode = language.split('_')[0];
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const isMobilePortrait = isMobile && !isLandscape;
  const [openTasks, setOpenTasks] = React.useState<boolean>(false);
  const completion = guidedCourseChapter.tasks
    ? { done: 10, total: guidedCourseChapter.tasks.length }
    : null;
  const isFinished = completion ? completion.done === completion.total : false;
  const youtubeVideoId = getYoutubeVideoIdFromUrl(guidedCourseChapter.videoUrl);

  return (
    <ColumnStackLayout expand noMargin>
      <div
        style={{
          ...styles.titleContainer,
          flexDirection: isMobilePortrait ? 'column-reverse' : 'row',
          alignItems: isMobilePortrait ? 'flex-start' : 'center',
          justifyContent: 'space-between',
        }}
      >
        <LineStackLayout noMargin alignItems="center" expand>
          <Text size="title">{guidedCourseChapter.title}</Text>
          {isFinished && !isMobilePortrait && (
            <div
              style={{
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
              {completion.done} of {completion.total} completed
            </Trans>
          </Text>
        ) : null}
      </div>
      {guidedCourseChapter.isLocked ? (
        <ResponsiveLineStackLayout
          expand
          noResponsiveLandscape
          alignItems="stretch"
        >
          {youtubeVideoId && (
            <div style={styles.videoContainer}>
              <CorsAwareImage
                alt={`Video for lesson ${guidedCourseChapter.title}`}
                style={styles.videoThumbnail}
                src={`https://i.ytimg.com/vi/${youtubeVideoId}/sddefault.jpg`}
              />
              <LockedOverlay />
            </div>
          )}
          <Line useFullHeight expand noMargin>
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
                  noResponsiveLandscape
                  noColumnMargin
                >
                  <RaisedButton
                    primary
                    fullWidth
                    icon={<Gold />}
                    label={<Trans>Get a subscription</Trans>}
                    onClick={() =>
                      openSubscriptionDialog({
                        analyticsMetadata: {
                          reason: 'Unlock course chapter',
                        },
                      })
                    }
                  />
                  <FlatButton
                    fullWidth
                    leftIcon={<Coin fontSize="small" />}
                    label={
                      <Trans>
                        Pay {guidedCourseChapter.priceInCredits} credits
                      </Trans>
                    }
                    onClick={() => {}}
                  />
                </ResponsiveLineStackLayout>
              </ColumnStackLayout>
            </Paper>
          </Line>
        </ResponsiveLineStackLayout>
      ) : (
        <ResponsiveLineStackLayout expand noResponsiveLandscape>
          {youtubeVideoId && (
            <div style={styles.videoContainer}>
              <iframe
                title={`Video for lesson ${guidedCourseChapter.title}`}
                type="text/html"
                style={styles.videoIFrame}
                src={`http://www.youtube.com/embed/${youtubeVideoId}?cc_load_policy=1&cc_lang_pref=${
                  // Having another language than `en` as the requested caption language prevents the player from displaying the auto-translated captions.
                  'en'
                }&hl=${userLanguage2LetterCode}`}
                frameBorder="0"
              />
            </div>
          )}
          <ColumnStackLayout noMargin expand>
            <Text size="sub-title">Lesson materials</Text>
            <Paper background="medium" style={styles.sideBar}>
              <ColumnStackLayout noMargin>
                <Text noMargin>
                  <Trans>Template</Trans>
                </Text>
                <Line noMargin>
                  <RaisedButton
                    primary
                    label={<Trans>Open template</Trans>}
                    onClick={() =>
                      onOpenTemplate(guidedCourseChapter.templateUrl)
                    }
                  />
                </Line>
              </ColumnStackLayout>
            </Paper>
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      )}
      {!guidedCourseChapter.isLocked && (
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
                  <Trans>Close tasks</Trans>
                ) : (
                  <Trans>Open tasks</Trans>
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
      {!guidedCourseChapter.isLocked &&
        guidedCourseChapter.tasks.map((item, index) => (
          <GuidedCourseChapterTaskItem
            guidedCourseChapterTask={item}
            key={index.toString()}
            isOpen={openTasks}
            onCheck={() => {}}
            isComplete={false}
            onComplete={() => {}}
          />
        ))}
    </ColumnStackLayout>
  );
};

export default GuidedCourseChapterView;
