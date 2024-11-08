// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import EmptyMessage from '../UI/EmptyMessage';
import Paper from '../UI/Paper';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import {
  createGameResourceSignedUrls,
  updateGame,
  type Game,
} from '../Utils/GDevelopServices/Game';
import { uploadBlobFile } from '../ExportAndShare/BrowserExporters/BrowserFileUploader';
import { CorsAwareImage } from '../UI/CorsAwareImage';

const styles = {
  image: {
    display: 'block',
    objectFit: 'scale-down', // Match gd.games format.
  },
  fullWidthContainer: {
    width: '100%',
    aspectRatio: '16 / 9',
    height: 'auto',
    justifyContent: 'center',
    overflow: 'hidden', // Keep the radius effect.
  },
  thumbnailContainer: {
    height: 153,
    width: 272,
    overflow: 'hidden', // Keep the radius effect.
  },
  mobileThumbnailContainer: {
    height: 84,
    width: 150,
    overflow: 'hidden', // Keep the radius effect.
  },
  thumbnail: {
    aspectRatio: '16 / 9',
    width: 272,
  },
  mobileThumbnail: {
    aspectRatio: '16 / 9',
    width: 150,
  },
  fullWidthThumbnail: {
    width: '100%',
    height: 'auto',
  },
};

type Props = {|
  thumbnailUrl?: ?string,
  gameName: string,
  background?: 'light' | 'medium' | 'dark',
  gameId?: string,
  canUpdateThumbnail?: boolean,
  disabled?: boolean,
  onGameUpdated?: (updatedGame: Game) => void,
  onUpdatingGame?: (isUpdatingGame: boolean) => void,
  fullWidthOnMobile?: boolean,
|};

export const GameThumbnail = ({
  disabled,
  canUpdateThumbnail,
  thumbnailUrl,
  gameName,
  gameId,
  onGameUpdated,
  onUpdatingGame,
  background = 'light',
  fullWidthOnMobile,
}: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const { showAlert } = useAlertDialog();
  const gamesPlatformThumbnailFileInputRef = React.useRef<HTMLInputElement | null>(
    null
  );

  const updateGameThumbnail = async () => {
    if (!profile || !gameId) {
      return;
    }

    if (
      !gamesPlatformThumbnailFileInputRef.current ||
      !gamesPlatformThumbnailFileInputRef.current.files ||
      !gamesPlatformThumbnailFileInputRef.current.files[0]
    ) {
      console.error("Could't find selected file. Aborting thumbnail update.");
      return;
    }
    const file = gamesPlatformThumbnailFileInputRef.current.files[0];
    const fileType = file.type;
    if (
      !fileType ||
      (fileType !== 'image/png' &&
        fileType !== 'image/jpeg' &&
        fileType !== 'image/webp')
    ) {
      await showAlert({
        title: t`Invalid file`,
        message: t`Only PNG, JPEG and WEBP files are supported.`,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (onUpdatingGame) onUpdatingGame(true);
      // 1. Get signed url to upload for the thumbnail.
      const response = await createGameResourceSignedUrls({
        uploadType: 'game-thumbnail',
        files: [
          {
            contentType: fileType,
          },
        ],
      });
      const signedUrls = response.signedUrls;
      if (!signedUrls || signedUrls.length === 0) {
        throw new Error('No signed url returned');
      }
      const { signedUrl, publicUrl } = signedUrls[0];

      // 2. Upload the thumbnail.
      await uploadBlobFile(
        file,
        {
          signedUrl,
          contentType: fileType,
        },
        () => {}
      );

      // 3. Update the game with the new thumbnail.
      const updatedGame = await updateGame(
        getAuthorizationHeader,
        profile.id,
        gameId,
        {
          thumbnailUrl: publicUrl,
        }
      );
      if (onGameUpdated) onGameUpdated(updatedGame);
    } catch (error) {
      console.error('Error while updating thumbnail:', error);
      await showAlert({
        title: t`Cannot update thumbnail`,
        message: t`There was an error while updating the game's thumbnail on gd.games. Verify your internet connection or try again later.`,
      });
    } finally {
      // Reset input value so that if the user selects the same file again,
      // the onChange callback is called.
      if (gamesPlatformThumbnailFileInputRef.current) {
        gamesPlatformThumbnailFileInputRef.current.value = '';
      }
      setIsLoading(false);
      if (onUpdatingGame) onUpdatingGame(false);
    }
  };

  return (
    <ColumnStackLayout noMargin alignItems="center">
      <Paper
        style={{
          ...(isMobile && !isLandscape
            ? fullWidthOnMobile
              ? styles.fullWidthContainer
              : styles.mobileThumbnailContainer
            : styles.thumbnailContainer),
          whiteSpace: 'normal',
          display: 'flex',
        }}
        background={background}
      >
        {thumbnailUrl ? (
          <CorsAwareImage
            src={thumbnailUrl}
            style={{
              ...styles.image,
              ...(isMobile && !isLandscape
                ? fullWidthOnMobile
                  ? styles.fullWidthThumbnail
                  : styles.mobileThumbnail
                : styles.thumbnail),
            }}
            alt={gameName}
          />
        ) : (
          <EmptyMessage>
            <Trans>No thumbnail set</Trans>
          </EmptyMessage>
        )}
      </Paper>
      {canUpdateThumbnail && gameId && (
        <RaisedButton
          primary
          disabled={!profile || isLoading || disabled}
          onClick={() => {
            if (gamesPlatformThumbnailFileInputRef.current) {
              gamesPlatformThumbnailFileInputRef.current.click();
            }
          }}
          label={
            isLoading ? (
              <Trans>Updating...</Trans>
            ) : thumbnailUrl ? (
              <Trans>Change thumbnail</Trans>
            ) : (
              <Trans>Select a thumbnail</Trans>
            )
          }
        />
      )}
      {canUpdateThumbnail && gameId && (
        <input
          type="file"
          onChange={updateGameThumbnail}
          ref={gamesPlatformThumbnailFileInputRef}
          style={{ display: 'none' }}
        />
      )}
    </ColumnStackLayout>
  );
};
