// @flow
import * as React from 'react';
import { type Tutorial } from '../Utils/GDevelopServices/Tutorial';
import { ListItem } from '@material-ui/core';
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
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
    flex: 1,
  },
  listItem: {
    padding: 0,
    marginTop: 8,
    marginBottom: 8,
  },
};

type Props = {|
  tutorial: Tutorial,
|};

const TutorialListItem = ({ tutorial }: Props) => {
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const isImageLoadingRef = React.useRef(true);

  const windowWidth = useResponsiveWindowWidth();

  return (
    <ListItem
      button
      key={tutorial.id}
      onClick={() => {
        sendTutorialOpened(tutorial.id);
        Window.openExternalURL(tutorial.link);
      }}
      style={styles.listItem}
    >
      <div style={styles.container} ref={containerRef}>
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
              <ResponsiveLineStackLayout noMargin alignItems="baseline" expand>
                <Text noMargin displayInlineAsSpan size="sub-title">
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
      </div>
    </ListItem>
  );
};

export default TutorialListItem;
