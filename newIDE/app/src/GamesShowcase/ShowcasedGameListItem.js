// @flow
import * as React from 'react';
import { type ShowcasedGame } from '../Utils/GDevelopServices/Game';
import { Card } from '@material-ui/core';
import Text from '../UI/Text';
import { Column, Line, Spacer } from '../UI/Grid';
import { MarkdownText } from '../UI/MarkdownText';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import TagChips from '../UI/TagChips';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ShowcasedGameTitle from './ShowcasedGameTitle';
import ShowcasedGameButton from './ShowcasedGameButtons';

const styles = {
  thumbnailImageWithDescription: {
    objectFit: 'contain',
    verticalAlign: 'middle',
    backgroundColor: 'black',
    width: 200,
  },
  thumbnailImageWithoutDescription: {
    objectFit: 'cover',
    verticalAlign: 'middle',
    backgroundColor: 'black',
    width: 200,
    maxHeight: 120,
  },
  smallScreenThumbnailImage: {
    objectFit: 'contain',
    verticalAlign: 'middle',
    backgroundColor: 'black',
    maxHeight: 150,
  },
  card: {
    flex: 1,
  },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    paddingBottom: 8,
    paddingTop: 8,
  },
};

type Props = {|
  showcasedGame: ShowcasedGame,
  onHeightComputed: number => void,
|};

export const ShowcasedGameListItem = ({
  showcasedGame,
  onHeightComputed,
}: Props) => {
  // Report the height of the item once it's known.
  const [isLoaded, setIsLoaded] = React.useState(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const isImageLoadingRef = React.useRef(true);
  const notifyHeightChanged = React.useCallback(
    () => {
      if (!isLoaded && !isImageLoadingRef.current) {
        setIsLoaded(true);
      }

      // But don't report the height while the image is loading, as it could
      // make some "jumps" in the scroll when scrolling up.
      if (containerRef.current && !isImageLoadingRef.current)
        onHeightComputed(containerRef.current.getBoundingClientRect().height);
    },
    [onHeightComputed, isLoaded]
  );
  React.useLayoutEffect(notifyHeightChanged);

  const windowWidth = useResponsiveWindowWidth();
  const hasDescription = !!showcasedGame.description;

  return (
    <div
      style={{
        ...styles.container,
        visibility: isLoaded ? undefined : 'hidden',
        animation: isLoaded ? 'fade-in 0.5s' : undefined,
      }}
      ref={containerRef}
    >
      <Card style={styles.card}>
        <ResponsiveLineStackLayout noMargin>
          <CorsAwareImage
            style={
              windowWidth === 'small'
                ? styles.smallScreenThumbnailImage
                : hasDescription
                ? styles.thumbnailImageWithDescription
                : styles.thumbnailImageWithoutDescription
            }
            src={showcasedGame.thumbnailUrl}
            alt={showcasedGame.title}
            onError={() => {
              isImageLoadingRef.current = false;
              notifyHeightChanged();
            }}
            onLoad={() => {
              isImageLoadingRef.current = false;
              notifyHeightChanged();
            }}
          />
          <Line expand>
            <Column expand>
              <ShowcasedGameTitle showcasedGame={showcasedGame} />
              {showcasedGame.genres.length ? (
                <TagChips tags={showcasedGame.genres} />
              ) : null}
              <Text size="body2" displayInlineAsSpan>
                <MarkdownText
                  source={showcasedGame.description}
                  allowParagraphs
                />
              </Text>
              <Spacer />
              <ShowcasedGameButton showcasedGame={showcasedGame} />
            </Column>
          </Line>
        </ResponsiveLineStackLayout>
      </Card>
    </div>
  );
};
