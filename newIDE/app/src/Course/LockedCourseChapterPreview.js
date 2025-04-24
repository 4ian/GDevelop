// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type {
  CourseChapter,
  LockedVideoBasedCourseChapter,
  LockedTextBasedCourseChapter,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import GoldCompact from '../Profile/Subscription/Icons/GoldCompact';
import Coin from '../Credits/Icons/Coin';
import Lock from '../UI/CustomSvgIcons/Lock';
import Window from '../Utils/Window';
import PasswordPromptDialog from '../AssetStore/PasswordPromptDialog';
import { getYoutubeVideoIdFromUrl } from '../Utils/Youtube';
import AlertMessage from '../UI/AlertMessage';

const styles = {
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
  courseChapter: LockedVideoBasedCourseChapter | LockedTextBasedCourseChapter,
  onBuyWithCredits: (CourseChapter, string) => Promise<void>,
|};

const LockedCourseChapterPreview = React.forwardRef<Props, HTMLDivElement>(
  ({ courseChapter, onBuyWithCredits }, ref) => {
    const { openSubscriptionDialog } = React.useContext(
      SubscriptionSuggestionContext
    );
    const [error, setError] = React.useState<React.Node>(null);
    const [
      displayPasswordPrompt,
      setDisplayPasswordPrompt,
    ] = React.useState<boolean>(false);
    const { windowSize } = useResponsiveWindowSize();
    const [password, setPassword] = React.useState<string>('');
    const youtubeVideoId = courseChapter.videoUrl
      ? getYoutubeVideoIdFromUrl(courseChapter.videoUrl)
      : null;
    const [isPurchasing, setIsPurchasing] = React.useState<boolean>(false);

    const onClickBuyWithCredits = React.useCallback(
      async () => {
        if (!courseChapter.isLocked) return;
        setError(null);
        setDisplayPasswordPrompt(false);
        setIsPurchasing(true);
        try {
          await onBuyWithCredits(courseChapter, password);
        } catch (error) {
          console.error('An error occurred while buying this chapter', error);
          setError(
            <Trans>
              An error occurred while buying this chapter. Please try again
              later.
            </Trans>
          );
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
                  Use your GDevelop credits to purchase lessons in this course;
                  or get a subscription to get them for free.
                </Trans>
              </Text>
              <ResponsiveLineStackLayout
                noMargin
                noColumnMargin
                forceMobileLayout={windowSize === 'medium'}
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
                      <Trans>Pay {courseChapter.priceInCredits} credits</Trans>
                    }
                    onClick={onWillBuyWithCredits}
                  />
                )}
              </ResponsiveLineStackLayout>
              {error && <AlertMessage kind="error">{error}</AlertMessage>}
            </ColumnStackLayout>
          </Paper>
        </div>
        {displayPasswordPrompt && (
          <PasswordPromptDialog
            onApply={onClickBuyWithCredits}
            onClose={() => setDisplayPasswordPrompt(false)}
            passwordValue={password}
            setPasswordValue={setPassword}
          />
        )}
      </div>
    );
  }
);

export default LockedCourseChapterPreview;
