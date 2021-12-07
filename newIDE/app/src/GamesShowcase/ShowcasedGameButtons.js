// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import GetAppIcon from '@material-ui/icons/GetApp';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import YouTubeIcon from '@material-ui/icons/YouTube';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import { sendShowcaseGameLinkOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import {
  type ShowcasedGame,
  type ShowcasedGameLink,
} from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import GooglePlay from '../UI/CustomSvgIcons/GooglePlay';
import Steam from '../UI/CustomSvgIcons/Steam';
import Twitter from '../UI/CustomSvgIcons/Twitter';
import Instagram from '../UI/CustomSvgIcons/Instagram';
import Twitch from '../UI/CustomSvgIcons/Twitch';
import ItchIo from '../UI/CustomSvgIcons/ItchIo';
import Microsoft from '../UI/CustomSvgIcons/Microsoft';
import Apple from '../UI/CustomSvgIcons/Apple';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

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

const renderLayout = (
  children: Array<React.Node>,
  forceColumn: boolean
): React.Node =>
  forceColumn ? (
    <ColumnStackLayout justifyContent="flex-end" noMargin>
      {children}
    </ColumnStackLayout>
  ) : (
    <ResponsiveLineStackLayout justifyContent="flex-end" noColumnMargin>
      {children}
    </ResponsiveLineStackLayout>
  );

const ShowcasedGameButton = ({
  showcasedGame,
  forceColumn = false,
}: {|
  showcasedGame: ShowcasedGame,
  forceColumn?: boolean,
|}): React.Node => {
  const { links } = showcasedGame;

  const windowWidth = useResponsiveWindowWidth();

  const firstLinks = links.slice(0, 3);
  const otherLinks = links.slice(3);
  return (
    <>
      {renderLayout(
        firstLinks.map((link, index) => (
          <LinkButton key={index} link={link} showcasedGame={showcasedGame} />
        )),
        forceColumn
      )}
      {otherLinks.length > 0 && (
        <>
          {(windowWidth === 'small' || forceColumn) && <Spacer />}
          {renderLayout(
            otherLinks.map((link, index) => (
              <LinkButton
                key={index}
                link={link}
                showcasedGame={showcasedGame}
              />
            )),
            forceColumn
          )}
        </>
      )}
    </>
  );
};

export default ShowcasedGameButton;
