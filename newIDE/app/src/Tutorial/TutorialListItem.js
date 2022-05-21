// @flow
import * as React from 'react';
import { type Tutorial } from '../Utils/GDevelopServices/Tutorial';
import { Card } from '@material-ui/core';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../UI/Text';
import { Column, Line, Spacer } from '../UI/Grid';
import { MarkdownText } from '../UI/MarkdownText';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';

const styles = {
  thumbnailImageWithDescription: {
    objectFit: 'contain',
    verticalAlign: 'middle',
    backgroundColor: 'black',
    width: 200,
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
    padding: 8,
  },
};

type Props = {|
  tutorial: Tutorial,
  onHeightComputed: (number) => void,
|};

export const TutorialListItem = ({ tutorial, onHeightComputed }: Props) => {
  // Report the height of the item once it's known.
  const [isLoaded, setIsLoaded] = React.useState(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const isImageLoadingRef = React.useRef(true);
  const notifyHeightChanged = React.useCallback(() => {
    if (!isLoaded && !isImageLoadingRef.current) {
      setIsLoaded(true);
    }

    // But don't report the height while the image is loading, as it could
    // make some "jumps" in the scroll when scrolling up.
    if (containerRef.current && !isImageLoadingRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  }, [onHeightComputed, isLoaded]);
  React.useLayoutEffect(notifyHeightChanged);

  const windowWidth = useResponsiveWindowWidth();

  return (
    <ButtonBase
      onClick={() => {
        sendTutorialOpened(tutorial.id);
        Window.openExternalURL(tutorial.link);
      }}
      focusRipple
    >
      <div
        style={{
          ...styles.container,
          visibility: isLoaded ? undefined : 'hidden',
          animation: isLoaded ? 'fadein 0.5s' : undefined,
        }}
        ref={containerRef}
      >
        <Card style={styles.card}>
          <ResponsiveLineStackLayout noMargin>
            <CorsAwareImage
              style={
                windowWidth === 'small'
                  ? styles.smallScreenThumbnailImage
                  : styles.thumbnailImageWithDescription
              }
              src={tutorial.thumbnailUrl}
              alt={tutorial.title}
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
                <ResponsiveLineStackLayout
                  noMargin
                  alignItems="baseline"
                  expand
                >
                  <Text noMargin displayInlineAsSpan>
                    {tutorial.title}
                  </Text>
                </ResponsiveLineStackLayout>
                <Text size="body2" displayInlineAsSpan>
                  <MarkdownText source={tutorial.description} allowParagraphs />
                </Text>
                <Spacer />
              </Column>
            </Line>
          </ResponsiveLineStackLayout>
        </Card>
      </div>
    </ButtonBase>
  );
};
