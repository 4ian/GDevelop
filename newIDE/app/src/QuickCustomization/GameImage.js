// @flow
import * as React from 'react';
import { getGameMainImageUrl, type Game } from '../Utils/GDevelopServices/Game';
import Paper from '../UI/Paper';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../UI/Layout';
import { Trans } from '@lingui/macro';
import RaisedButton from '../UI/RaisedButton';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import Text from '../UI/Text';
import EmptyMessage from '../UI/EmptyMessage';

const imageHeight = 250;
const imageWidth = (250 * 16) / 9;

const styles = {
  paper: {
    overflow: 'hidden', // Keep the radius effect.
    justifyContent: 'center',
    maxWidth: 400, // Prevent taking too much space.
    width: '100%',
    height: 'auto', // Let the height be determined by the image.
  },
  paperNoImage: {
    height: imageHeight, // Apply the same height as the image when there is no image.
  },
  image: {
    display: 'block',
    objectFit: 'scale-down',
    width: imageWidth,
    height: imageHeight,
  },
  imageMobile: {
    width: '100%',
    height: 'auto',
    maxHeight: imageHeight, // Prevent taking too much space on mobile, especially for portrait games.
  },
};

type Props = {|
  project: gdProject,
  game: ?Game,
  previewScreenshotUrls: Array<string>,
  onLaunchPreview: () => Promise<void>,
  disabled?: boolean,
|};

const GameImage = ({
  project,
  game,
  previewScreenshotUrls,
  onLaunchPreview,
  disabled,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();

  const gameThumbnailUrl = React.useMemo(
    () => {
      if (game) {
        const gameImageUrl = getGameMainImageUrl(game);
        if (gameImageUrl) return gameImageUrl;
      }

      if (previewScreenshotUrls.length)
        return previewScreenshotUrls[previewScreenshotUrls.length - 1];

      return undefined;
    },
    [game, previewScreenshotUrls]
  );

  return (
    <Paper
      style={{
        ...styles.paper,
        ...(!gameThumbnailUrl ? styles.paperNoImage : {}),
        whiteSpace: 'normal',
        display: 'flex',
      }}
      background="light"
    >
      {gameThumbnailUrl ? (
        <CorsAwareImage
          alt="Customize your game with GDevelop"
          src={gameThumbnailUrl}
          style={{
            ...styles.image,
            ...(isMobile ? styles.imageMobile : {}),
          }}
        />
      ) : !disabled ? (
        <ColumnStackLayout
          noMargin
          expand
          alignItems="center"
          justifyContent="center"
        >
          <Text>
            <Trans>Start a preview to generate a thumbnail!</Trans>
          </Text>
          <RaisedButton
            color="success"
            size="medium"
            label={<Trans>Preview</Trans>}
            onClick={onLaunchPreview}
            icon={<PreviewIcon />}
          />
        </ColumnStackLayout>
      ) : (
        <EmptyMessage>
          <Trans>
            No thumbnail for your game, you can update it in your Game
            Dashboard!
          </Trans>
        </EmptyMessage>
      )}
    </Paper>
  );
};

export default GameImage;
