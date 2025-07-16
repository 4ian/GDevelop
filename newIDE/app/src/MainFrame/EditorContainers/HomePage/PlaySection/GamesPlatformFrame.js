// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { homepageMobileMenuHeight } from '../HomePageMenuBar';
import Paper from '../../../../UI/Paper';
import { type IframePosition } from './UseGamesPlatformFrame';

export const GAMES_PLATFORM_IFRAME_ID = 'games-platform-frame';

const styles = {
  paper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  iframe: {
    border: 0,
    width: '100%',
    height: '100%',
  },
};

const gdGamesHost = 'https://gd.games';
// const gdGamesHost = 'http://localhost:4000';

// Increment this when a breaking change is made to the embedded games platform.
export const gamesPlatformEmbeddedVersion = 'v1';

type Props = {|
  loaded: boolean,
  visible: boolean,
  initialGameId: ?string,
  iframePosition: ?IframePosition,
|};

const GamesPlatformFrame = ({
  initialGameId,
  loaded,
  visible,
  iframePosition,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;

  // Use a ref to store the initial game id, as we don't want to trigger a re-render
  // when the game id changes.
  const gameId = React.useRef(initialGameId);

  const url = new URL(
    gameId.current
      ? `/app-embedded/${gamesPlatformEmbeddedVersion}/games/${gameId.current}`
      : `/app-embedded/${gamesPlatformEmbeddedVersion}/${paletteType}`,
    gdGamesHost
  );
  if (gameId.current) url.searchParams.set('theme', paletteType);

  const src = loaded ? url.toString() : '';

  React.useEffect(
    () => {
      if (!loaded) {
        // Every time the frame is unloaded, we reset it for the next load.
        gameId.current = initialGameId;
      }
    },
    [loaded, initialGameId]
  );

  // In this component, do not use useResponsiveWindowSize. Instead, the position
  // of the iframe must be read from iframePosition - which is set by the component
  // responsible for making the iframe visible.
  const containerTop =
    iframePosition && !iframePosition.isMobile ? iframePosition.top : 0;
  const containerLeft = iframePosition ? iframePosition.left : 0;
  const containerWidth = iframePosition ? iframePosition.width : '100%';
  const containerHeight =
    iframePosition && !iframePosition.isMobile
      ? iframePosition.height
      : `calc(100% - ${homepageMobileMenuHeight}px)`;

  // We wrap the iframe in a paper, as its content has a transparent background,
  // and we don't want what's behind the iframe to be visible.
  return (
    <Paper
      square
      background="dark"
      style={{
        ...styles.paper,
        width: containerWidth,
        height: containerHeight,
        left: containerLeft,
        top: containerTop,
        display: visible ? 'block' : 'none',
      }}
    >
      <iframe
        id={GAMES_PLATFORM_IFRAME_ID}
        src={src}
        allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; keyboard-map *; focus-without-user-activation *; screen-wake-lock; clipboard-read; clipboard-write; web-share"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts allow-same-origin allow-popups-to-escape-sandbox allow-downloads"
        title="gdgames"
        allowFullScreen
        style={styles.iframe}
        onLoad={event => {
          event.currentTarget.focus();
        }}
      />
    </Paper>
  );
};

export default GamesPlatformFrame;
