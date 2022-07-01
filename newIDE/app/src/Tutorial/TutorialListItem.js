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
    width: '100%',
  },
  card: {
    flex: 1,
  },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
  },
};

type Props = {|
  tutorial: Tutorial,
|};

export const TutorialListItem = ({ tutorial }: Props) => {
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const isImageLoadingRef = React.useRef(true);

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
          animation: 'fadein 0.5s',
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
              }}
              onLoad={() => {
                isImageLoadingRef.current = false;
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
