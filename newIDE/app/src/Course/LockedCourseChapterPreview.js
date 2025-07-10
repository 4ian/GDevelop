// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type {
  Course,
  LockedVideoBasedCourseChapter,
  LockedTextBasedCourseChapter,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Lock from '../UI/CustomSvgIcons/Lock';
import { getYoutubeVideoIdFromUrl } from '../Utils/Youtube';

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
  course: Course,
  courseChapter: LockedVideoBasedCourseChapter | LockedTextBasedCourseChapter,
  onClickUnlock: () => void,
|};

const LockedCourseChapterPreview = React.forwardRef<Props, HTMLDivElement>(
  ({ course, courseChapter, onClickUnlock }, ref) => {
    const { windowSize } = useResponsiveWindowSize();
    const youtubeVideoId = courseChapter.videoUrl
      ? getYoutubeVideoIdFromUrl(courseChapter.videoUrl)
      : null;

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
              <RaisedButton
                primary
                fullWidth
                label={<Trans>Unlock the whole course</Trans>}
                onClick={onClickUnlock}
              />
            </ColumnStackLayout>
          </Paper>
        </div>
      </div>
    );
  }
);

export default LockedCourseChapterPreview;
