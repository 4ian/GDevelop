// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EmptyMessage from '../UI/EmptyMessage';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import {
  getGameVideoUrl,
  type PublicGame,
} from '../Utils/GDevelopServices/Game';
import PreviewVideoRecordingContext from '../MainFrame/PreviewVideoRecordingContext';
import { canRecordPreviewVideo } from '../MainFrame/UseCapturesManager';

const videoWidth = 272;

type Props = {|
  publicGame: PublicGame,
  disabled?: boolean,
|};

/**
 * The few seconds of gameplay shown on gd.games: recorded by the creator, or else
 * recorded automatically during previews.
 */
export const GameThumbnailVideo = ({
  publicGame,
  disabled,
}: Props): React.Node => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const { profile } = React.useContext(AuthenticatedUserContext);
  const { currentProjectGameId, onRecordPreviewVideo } = React.useContext(
    PreviewVideoRecordingContext
  );

  const videoUrl = getGameVideoUrl(publicGame);
  const isProjectOpened = currentProjectGameId === publicGame.id;
  const canRecord = canRecordPreviewVideo();

  // Full width on mobile, like the thumbnail displayed next to it.
  const isFullWidth = isMobile && !isLandscape;

  return (
    <ColumnStackLayout noMargin alignItems="center">
      <Paper
        style={{
          width: isFullWidth ? '100%' : videoWidth,
          aspectRatio: '16 / 9',
          overflow: 'hidden', // Keep the radius effect.
          display: 'flex',
        }}
        background="light"
      >
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            muted
            loop
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <EmptyMessage>
            <Trans>No video</Trans>
          </EmptyMessage>
        )}
      </Paper>
      {!publicGame.thumbnailVideoUrl && videoUrl && (
        <Text size="body-small" color="secondary" noMargin>
          <Trans>Recorded automatically during your previews.</Trans>
        </Text>
      )}
      <RaisedButton
        primary
        label={
          publicGame.thumbnailVideoUrl ? (
            <Trans>Record again</Trans>
          ) : (
            <Trans>Record a video</Trans>
          )
        }
        disabled={!profile || !isProjectOpened || !canRecord || disabled}
        onClick={onRecordPreviewVideo}
      />
      {!canRecord ? (
        <Text size="body-small" color="secondary" noMargin>
          <Trans>Videos can't be recorded with this browser.</Trans>
        </Text>
      ) : (
        !isProjectOpened && (
          <Text size="body-small" color="secondary" noMargin>
            <Trans>Open the project of this game to record a video.</Trans>
          </Text>
        )
      )}
    </ColumnStackLayout>
  );
};
