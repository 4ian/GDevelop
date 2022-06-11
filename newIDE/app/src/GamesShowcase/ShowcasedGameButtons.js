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
  url.startsWith('/') ? 'https://gdevelop.io' + url : url;

const getLinkIconAndLabel = (url: string, type: string) => {
  switch (type) {
    // Supported links:
    case '':
      return {
        icon: <PlayArrowIcon />,
        label: <Trans>Play or download</Trans>,
      };
    case 'learn-more':
      return { icon: null, label: <Trans>Learn more</Trans> };
    case 'download-win-mac-linux':
    case 'download':
      return { icon: <GetAppIcon />, label: <Trans>Download</Trans> };
    case 'play':
      return { icon: <PlayArrowIcon />, label: <Trans>Play</Trans> };
    // Officially supported stores/websites/social medias:
    case 'App Store':
      return { icon: <Apple />, label: 'iOS' };
    case 'Play Store':
      return { icon: <GooglePlay />, label: 'Android' };
    case 'Steam':
      return { icon: <Steam />, label: 'Steam' };
    case 'Trailer':
      return { icon: <YouTubeIcon />, label: <Trans>Trailer</Trans> };
    case 'itch.io':
      return { icon: <ItchIo />, label: 'itch.io' };
    case 'Game Jolt':
      return { icon: <FlashOnIcon />, label: 'Game Jolt' };
    case 'Twitter':
      return { icon: <Twitter />, label: 'Twitter' };
    case 'Microsoft Store':
      return { icon: <Microsoft />, label: 'Microsoft Store' };
    case 'Instagram':
      return { icon: <Instagram />, label: 'Instagram' };
    case 'Twitch':
      return { icon: <Twitch />, label: 'Twitch' };
    default:
      return { icon: null, label: type };
  }
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
