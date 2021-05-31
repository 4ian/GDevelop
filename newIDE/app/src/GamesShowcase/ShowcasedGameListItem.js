// @flow
import * as React from 'react';
import {
  type ShowcasedGame,
  type ShowcasedGameLink,
} from '../Utils/GDevelopServices/Game';
import { Card } from '@material-ui/core';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line, Spacer } from '../UI/Grid';
import { MarkdownText } from '../UI/MarkdownText';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import RaisedButton from '../UI/RaisedButton';
import TagChips from '../UI/TagChips';
import Apple from '../UI/CustomSvgIcons/Apple';
import Window from '../Utils/Window';
import { sendShowcaseGameLinkOpened } from '../Utils/Analytics/EventSender';
import GooglePlay from '../UI/CustomSvgIcons/GooglePlay';
import Steam from '../UI/CustomSvgIcons/Steam';
import Twitter from '../UI/CustomSvgIcons/Twitter';
import Instagram from '../UI/CustomSvgIcons/Instagram';
import Twitch from '../UI/CustomSvgIcons/Twitch';
import ItchIo from '../UI/CustomSvgIcons/ItchIo';
import Microsoft from '../UI/CustomSvgIcons/Microsoft';
import GetAppIcon from '@material-ui/icons/GetApp';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import YouTubeIcon from '@material-ui/icons/YouTube';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

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
    padding: 8,
  },
};

type Props = {|
  showcasedGame: ShowcasedGame,
  onHeightComputed: number => void,
|};

const getFullUrl = url =>
  url.startsWith('/') ? 'https://gdevelop-app.com' + url : url;

const getLinkIconAndLabel = (url: string, type: string) => {
  // Supported links:
  if (type === '') {
    return { icon: <PlayArrowIcon />, label: <Trans>Play or download</Trans> };
  } else if (type === 'learn-more') {
    return { icon: null, label: <Trans>Learn more</Trans> };
  } else if (type === 'download' || type === 'download-win-mac-linux') {
    return { icon: <GetAppIcon />, label: <Trans>Download</Trans> };
  } else if (type === 'play') {
    return { icon: <PlayArrowIcon />, label: <Trans>Play</Trans> };
  }
  // Officially supported stores/websites/social medias:
  else if (type === 'App Store') {
    return { icon: <Apple />, label: 'iOS' };
  } else if (type === 'Play Store') {
    return { icon: <GooglePlay />, label: 'Android' };
  } else if (type === 'Steam') {
    return { icon: <Steam />, label: 'Steam' };
  } else if (type === 'Trailer') {
    return { icon: <YouTubeIcon />, label: <Trans>Trailer</Trans> };
  } else if (type === 'itch.io') {
    return { icon: <ItchIo />, label: 'itch.io' };
  } else if (type === 'Game Jolt') {
    return { icon: <FlashOnIcon />, label: 'Game Jolt' };
  } else if (type === 'Twitter') {
    return { icon: <Twitter />, label: 'Twitter' };
  } else if (type === 'Microsoft Store') {
    return { icon: <Microsoft />, label: 'Microsoft Store' };
  } else if (type === 'Instagram') {
    return { icon: <Instagram />, label: 'Instagram' };
  } else if (type === 'Twitch') {
    return { icon: <Twitch />, label: 'Twitch' };
  }

  return { icon: null, label: type };
};

const LinkButton = ({
  link,
  showcasedGame,
}: {|
  link: ShowcasedGameLink,
  showcasedGame: ShowcasedGame,
|}) => {
  const { url, type } = link;
  return (
    <RaisedButton
      key={type + '-' + url}
      primary
      {...getLinkIconAndLabel(url, type)}
      onClick={() => {
        sendShowcaseGameLinkOpened(showcasedGame.title, type);
        Window.openExternalURL(getFullUrl(url));
      }}
    />
  );
};

export const ShowcasedGameListItem = ({
  showcasedGame,
  onHeightComputed,
}: Props): React.Element<'div'> => {
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

  const firstLinks = showcasedGame.links.slice(0, 3);
  const otherLinks = showcasedGame.links.slice(3);

  return (
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
              <ResponsiveLineStackLayout noMargin alignItems="baseline" expand>
                <Text noMargin displayInlineAsSpan>
                  {showcasedGame.title}
                </Text>
                <Text noMargin size="body2" displayInlineAsSpan>
                  <Trans>by {showcasedGame.author}</Trans>
                </Text>
              </ResponsiveLineStackLayout>
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
              <ResponsiveLineStackLayout
                justifyContent="flex-end"
                noColumnMargin
              >
                {firstLinks.map((link, index) => (
                  <LinkButton
                    key={index}
                    link={link}
                    showcasedGame={showcasedGame}
                  />
                ))}
              </ResponsiveLineStackLayout>
              <ResponsiveLineStackLayout
                justifyContent="flex-end"
                noColumnMargin
              >
                {otherLinks.map((link, index) => (
                  <LinkButton
                    key={index}
                    link={link}
                    showcasedGame={showcasedGame}
                  />
                ))}
              </ResponsiveLineStackLayout>
            </Column>
          </Line>
        </ResponsiveLineStackLayout>
      </Card>
    </div>
  );
};
