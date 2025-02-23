// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  homepageDesktopMenuBarWidth,
  homepageMediumMenuBarWidth,
  homepageMobileMenuHeight,
} from '../HomePageMenuBar';
import Paper from '../../../../UI/Paper';

export const GAMES_PLATFORM_IFRAME_ID = 'games-platform-frame';

const styles = {
  paper: {
    position: 'absolute',
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
|};

const GamesPlatformFrame = ({ initialGameId, loaded, visible }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();

  // Use a ref to store the initial game id, as we don't want to trigger a re-render
  // when the game id changes.
  const gameId = React.useRef(initialGameId);

  const url = new URL(
    gameId.current
      ? `/app-embedded/${gamesPlatformEmbeddedVersion}/games/${gameId.current}`
      : isMobile
      ? // On mobile, go directly to a random game if none is specified.
        `/app-embedded/${gamesPlatformEmbeddedVersion}/games/random`
      : // On desktop, access the homepage.
        `/app-embedded/${gamesPlatformEmbeddedVersion}/${paletteType}`,
    gdGamesHost
  );
  if (gameId.current || isMobile) url.searchParams.set('theme', paletteType);

  const src = loaded ? url.toString() : '';

  React.useEffect(
    () => {
      if (!loaded && initialGameId) {
        // Every time the frame is unloaded on a gameId, we reset it for the next load.
        gameId.current = initialGameId;
      }
    },
    [loaded, initialGameId]
  );

  const containerTop = isMobile ? 0 : 37 + 40; // tabs title bar + toolbar
  const containerBottom = isMobile ? homepageMobileMenuHeight : 0;
  const containerLeft = isMobile
    ? 0
    : isMediumScreen
    ? homepageMediumMenuBarWidth
    : homepageDesktopMenuBarWidth;
  const containerWidth = `calc(100% - ${containerLeft}px`;
  const containerHeight = `calc(100% - ${containerTop + containerBottom}px)`;

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
        allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; keyboard-map *; focus-without-user-activation *; screen-wake-lock; clipboard-read; clipboard-write"
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
