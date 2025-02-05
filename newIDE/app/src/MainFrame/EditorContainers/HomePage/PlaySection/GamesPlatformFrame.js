// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  homepageDesktopMenuBarWidth,
  homepageMediumMenuBarWidth,
} from '../HomePageMenuBar';
import { SECTION_DESKTOP_SPACING } from '../SectionContainer';
import Paper from '../../../../UI/Paper';

export const GAMES_PLATFORM_IFRAME_ID = 'games-platform-frame';

const styles = {
  paper: {
    position: 'absolute',
  },
  iframe: {
    border: 0,
  },
};

// const gdGamesHost = 'https://gd.games';
const gdGamesHost = 'http://localhost:4000';

type Props = {|
  loaded: boolean,
  initialGameId: ?string,
|};

const GamesPlatformFrame = ({ initialGameId, loaded }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();

  // Use a ref to store the initial game id, as we don't want to trigger a re-render
  // when the game id changes.
  const gameId = React.useRef(initialGameId);

  const url = new URL(
    gameId.current
      ? `/embedded/games/${gameId.current}`
      : `/embedded/${paletteType}`,
    gdGamesHost
  );
  if (gameId.current) url.searchParams.set('theme', paletteType);

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

  const containerTop = 37 + 40; // tabs title bar + toolbar
  const containerLeft = isMobile
    ? 0
    : isMediumScreen
    ? homepageMediumMenuBarWidth
    : homepageDesktopMenuBarWidth;
  const containerWidth = isMobile
    ? '100%'
    : isMediumScreen
    ? `calc(100% - ${homepageMediumMenuBarWidth}px`
    : `calc(100% - ${homepageDesktopMenuBarWidth}px`;
  const containerHeight = `calc(100% - ${containerTop}px)`;

  const iframeSideMargin = isMobile ? 0 : SECTION_DESKTOP_SPACING;
  const iframeHeight = 'calc(100% - 4px)';
  const iframeWidth = `calc(100% - ${2 * iframeSideMargin}px)`;

  // We wrap the iframe in a paper, as its content has a transparent background,
  // and we don't want what's behing the iframe to be visible.
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
      }}
    >
      <iframe
        id={GAMES_PLATFORM_IFRAME_ID}
        src={src}
        allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; keyboard-map *; focus-without-user-activation *; screen-wake-lock; clipboard-read; clipboard-write"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts allow-same-origin allow-popups-to-escape-sandbox allow-downloads"
        title="gdgames"
        allowFullScreen
        style={{
          ...styles.iframe,
          height: iframeHeight,
          width: iframeWidth,
          margin: `0 ${iframeSideMargin}px`,
        }}
        onLoad={event => {
          event.currentTarget.focus();
        }}
      />
    </Paper>
  );
};

export default GamesPlatformFrame;
