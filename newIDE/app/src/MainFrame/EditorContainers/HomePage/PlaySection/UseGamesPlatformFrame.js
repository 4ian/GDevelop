// @flow
import * as React from 'react';
import GamesPlatformFrame, {
  GAMES_PLATFORM_IFRAME_ID,
} from './GamesPlatformFrame';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { generateCustomAuthToken } from '../../../../Utils/GDevelopServices/User';
import PublicProfileContext from '../../../../Profile/PublicProfileContext';
import RouterContext from '../../../RouterContext';
import { retryIfFailed } from '../../../../Utils/RetryIfFailed';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { isNativeMobileApp } from '../../../../Utils/Platform';
import Window from '../../../../Utils/Window';
import { delay } from '../../../../Utils/Delay';
import { useStableUpToDateRef } from '../../../../Utils/UseStableUpToDateCallback';
import { useSoftKeyboardBottomOffset } from '../../../../UI/MobileSoftKeyboard';
import { homepageMobileMenuHeight } from '../HomePageMenuBar';
const electron = optionalRequire('electron');

// If the iframe is displaying a game, it will continue playing its audio as long as the iframe
// exists, even if it's not visible. So we don't keep it alive for too long.
const TIMEOUT_TO_UNLOAD_IFRAME_IN_MS = 2000;

let gdevelopGamesMonetization: {|
  initialize: (rootElement: HTMLElement) => Promise<void>,
  sendCommand: (command: any) => Promise<void>,
|} | null = null;
let gdevelopGamesMonetizationPromise: Promise<void> | null = null;

const ensureGDevelopGamesMonetizationReady = async () => {
  if (!!electron || isNativeMobileApp()) {
    // Not supported on desktop or mobile.
    return;
  }
  if (gdevelopGamesMonetization) {
    // Already loaded.
    return;
  }
  if (gdevelopGamesMonetizationPromise) {
    // Being loaded.
    return gdevelopGamesMonetizationPromise;
  }

  gdevelopGamesMonetizationPromise = (async () => {
    try {
      // Load the library. If it fails, retry or throw so we can retry later.
      const module = await retryIfFailed(
        { times: 2 },
        async () =>
          // $FlowExpectedError - Remote script cannot be found.
          (await import(/* webpackIgnore: true */ 'https://resources.gdevelop.io/a/ggm-web.js'))
            .default
      );
      if (module) {
        await module.initialize(document.body);
        gdevelopGamesMonetization = module;
      }
    } catch (error) {
      console.error('Error while loading GDevelop Games Monetization:', error);
    } finally {
      // If loading fails, retry later.
      gdevelopGamesMonetizationPromise = null;
    }
  })();

  return gdevelopGamesMonetizationPromise;
};

/**
 * Generate a custom token for the user (or `null` if the user is not connected),
 * and keep it prepared to be sent to the Games Platform frame.
 * This avoids doing it at the last moment, and create useless wait on the frame side.
 */
const useUserCustomToken = (): {|
  userCustomToken: ?string,
|} => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const userId = profile ? profile.id : null;

  const [customTokenUserId, setCustomTokenUserId] = React.useState(null);
  const [userCustomToken, setUserCustomToken] = React.useState(null);
  const [lastTokenGenerationTime, setLastTokenGenerationTime] = React.useState(
    0
  );

  // Regenerate a token every 30 minutes (expiration is usually 60 minutes, but be safe)
  // or if the user changed.
  const hasUserChanged = customTokenUserId !== userId;
  const shouldRegenerateToken =
    Date.now() - lastTokenGenerationTime > 1000 * 60 * 30 || hasUserChanged;

  const clearStoredToken = React.useCallback(() => {
    setUserCustomToken(null);
    setLastTokenGenerationTime(0);
    setCustomTokenUserId(null);
  }, []);

  React.useEffect(
    () => {
      if (hasUserChanged) {
        clearStoredToken();
        console.info('User has changed, cleared stored user custom token.');
      }
    },
    [hasUserChanged, clearStoredToken]
  );

  React.useEffect(
    () => {
      (async () => {
        if (!shouldRegenerateToken) return;
        if (!userId) {
          clearStoredToken();
          return;
        }

        try {
          console.info(
            `Generating a custom token for user ${userId}, for usage in the Games Platform frame...`
          );
          const userCustomToken = await retryIfFailed({ times: 2 }, () =>
            generateCustomAuthToken(getAuthorizationHeader, userId)
          );
          setUserCustomToken(userCustomToken);
          setLastTokenGenerationTime(Date.now());
          setCustomTokenUserId(userId);
        } catch (error) {
          console.error(
            'Error while generating custom token. User will not be logged in the Games Platform frame.',
            error
          );
        }
      })();
    },
    [shouldRegenerateToken, userId, getAuthorizationHeader, clearStoredToken]
  );

  return { userCustomToken };
};

const sendSoftKeyboardOffsetToFrame = async (offset: number) => {
  // $FlowFixMe - we know it's an iframe.
  const iframe: ?HTMLIFrameElement = document.getElementById(
    GAMES_PLATFORM_IFRAME_ID
  );
  if (!iframe || !iframe.contentWindow) {
    return;
  }

  try {
    iframe.contentWindow.postMessage(
      {
        type: 'setKeyboardOffset',
        value: offset,
      },
      '*'
    );
  } catch (error) {
    console.error('Error while sending keyboard offset to frame.', error);
    return;
  }
};

export type IframePosition = {|
  top: number,
  left: number,
  width: number,
  height: number,
|};

export type GamesPlatformFrameTools = {|
  startTimeoutToUnloadIframe: () => void,
  loadIframeOrRemoveTimeout: () => void,
  iframeLoaded: boolean,
  iframeVisible: boolean,
  iframeErrored: boolean,
  updateIframePosition: (position: IframePosition) => void,
  renderGamesPlatformFrame: () => React.Node,
|};

type UseGamesPlatformFrameProps = {|
  fetchAndOpenNewProjectSetupDialogForExample: string => Promise<void>,
  onOpenProfileDialog: () => void,
|};

const useGamesPlatformFrame = ({
  fetchAndOpenNewProjectSetupDialogForExample,
  onOpenProfileDialog,
}: UseGamesPlatformFrameProps): GamesPlatformFrameTools => {
  const [loadIframeInDOM, setLoadIframeInDOM] = React.useState(false);
  const [iframeVisible, setIframeVisible] = React.useState(false);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const [iframeErrored, setIframeErrored] = React.useState(false);
  const [iframePosition, setIframePosition] = React.useState<?IframePosition>(null);
  const [lastGameId, setLastGameId] = React.useState<?string>(null);
  const timeoutToUnloadIframe = React.useRef<?TimeoutID>(null);
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);
  const softKeyboardBottomOffset = useSoftKeyboardBottomOffset({
    useCumulatedValue: false,
  });
  const {
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    profile,
  } = React.useContext(AuthenticatedUserContext);

  const {
    navigateToRoute,
    routeArguments,
    removeRouteArguments,
  } = React.useContext(RouterContext);

  const onOpenGameTemplate = React.useCallback(
    (productId: string) => {
      navigateToRoute('store', {
        'game-template': `product-${productId}`,
      });
    },
    [navigateToRoute]
  );

  const onOpenAssetPack = React.useCallback(
    (productId: string) => {
      navigateToRoute('store', {
        'asset-pack': `product-${productId}`,
      });
    },
    [navigateToRoute]
  );

  const onOpenExample = React.useCallback(
    async (exampleSlug: string) => {
      await fetchAndOpenNewProjectSetupDialogForExample(exampleSlug);
    },
    [fetchAndOpenNewProjectSetupDialogForExample]
  );

  const startTimeoutToUnloadIframe = React.useCallback(
    () => {
      if (!loadIframeInDOM && !iframeLoaded) {
        // Already unloaded.
        return;
      }
      if (timeoutToUnloadIframe.current) {
        // Cancel the previous timeout to start a new one.
        clearTimeout(timeoutToUnloadIframe.current);
        timeoutToUnloadIframe.current = null;
      }

      // The iframe becomes invisible right away,
      // but we wait a bit before unloading it, so that navigating to another
      // page doesn't cause the iframe to be reloaded.
      setIframeVisible(false);
      timeoutToUnloadIframe.current = setTimeout(() => {
        setLoadIframeInDOM(false);
        setIframeLoaded(false);
      }, TIMEOUT_TO_UNLOAD_IFRAME_IN_MS);
    },
    [iframeLoaded, loadIframeInDOM]
  );

  const loadIframeOrRemoveTimeout = React.useCallback(() => {
    if (timeoutToUnloadIframe.current) {
      clearTimeout(timeoutToUnloadIframe.current);
      timeoutToUnloadIframe.current = null;
    }

    ensureGDevelopGamesMonetizationReady();

    // The iframe is loaded on the same page as where it's displayed,
    // so we assume it's visible right away.
    setLoadIframeInDOM(true);
    setIframeVisible(true);
    setIframeErrored(false);
  }, []);

  const notifyIframeToChangeGame = React.useCallback(
    (gameId: string) => {
      if (iframeLoaded) {
        // $FlowFixMe - we know it's an iframe.
        const iframe: ?HTMLIFrameElement = document.getElementById(
          GAMES_PLATFORM_IFRAME_ID
        );
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              id: 'openGame',
              gameId,
            },
            '*'
          );
        }
      }
    },
    [iframeLoaded]
  );

  React.useEffect(
    () => {
      const playableGameId = routeArguments['playable-game-id'];
      if (playableGameId) {
        setLastGameId(routeArguments['playable-game-id']);
        removeRouteArguments(['playable-game-id']);
      }
    },
    [routeArguments, removeRouteArguments]
  );

  const handleIframeMessage = React.useCallback(
    async (event: any) => {
      if (
        event.origin !== 'https://gd.games' &&
        event.origin !== 'http://localhost:4000'
      ) {
        return;
      }
      if (event.data.id === 'pageLoaded') {
        setIframeLoaded(true);
        const { gameId } = event.data;
        // If not set, this will reset the gameId, meaning we're on the homepage.
        setLastGameId(gameId || null);
      }
      if (event.data.id === 'openUserProfile') {
        openUserPublicProfile({
          userId: event.data.userId,
          callbacks: {
            // Override the default values as the gd.games iframe will handle
            // those messages instead of the profile frame.
            onGameOpen: () => {},
            onExampleOpen: () => {},
            onGameTemplateOpen: () => {},
            onAssetPackOpen: () => {},
          },
        });
      }
      if (event.data.id === 'openLoginDialog') {
        if (profile) {
          // If the user is already logged in, open the profile dialog instead.
          onOpenProfileDialog();
        } else {
          onOpenLoginDialog();
        }
      }
      if (event.data.id === 'openRegisterDialog') {
        if (profile) {
          // If the user is already logged in, open the profile dialog instead.
          onOpenProfileDialog();
        } else {
          onOpenCreateAccountDialog();
        }
      }
      if (event.data.id === 'openGameTemplate') {
        onOpenGameTemplate(event.data.productId);
      }
      if (event.data.id === 'openAssetPack') {
        onOpenAssetPack(event.data.productId);
      }
      if (event.data.id === 'openExample') {
        if (event.data.exampleSlug) {
          onOpenExample(event.data.exampleSlug);
        }
        if (event.data.exampleShortHeader) {
          onOpenExample(event.data.exampleShortHeader.slug);
        }
      }
      if (event.data.id === 'openGame') {
        notifyIframeToChangeGame(event.data.gameId);
      }
      if (event.data.id === 'sendGgmCommand') {
        try {
          await ensureGDevelopGamesMonetizationReady();

          if (gdevelopGamesMonetization)
            await gdevelopGamesMonetization.sendCommand(event.data.command);
        } catch (error) {
          console.error('Error while sending GGM command:', error);
        }
      }
      if (event.data.id === 'openExternalUrl') {
        if (typeof event.data.url !== 'string') {
          console.warn(
            'Received an invalid URL to open from the games platform:',
            event.data
          );
          return;
        }
        Window.openExternalURL(event.data.url);
      }
    },
    [
      openUserPublicProfile,
      onOpenLoginDialog,
      onOpenCreateAccountDialog,
      notifyIframeToChangeGame,
      onOpenGameTemplate,
      onOpenAssetPack,
      onOpenExample,
      onOpenProfileDialog,
      profile,
    ]
  );

  React.useEffect(
    () => {
      window.addEventListener('message', handleIframeMessage);

      return () => {
        window.removeEventListener('message', handleIframeMessage);
      };
    },
    [handleIframeMessage]
  );

  const { userCustomToken } = useUserCustomToken();

  const sendUserCustomTokenToFrame = React.useCallback(
    async () => {
      if (!iframeLoaded) {
        return;
      }

      // The iframe is loaded:
      // we can now sent the information that the user is connected,
      // to automatically log the user in the frame,
      // or notify it the user is not connected (or just disconnected).

      // $FlowFixMe - we know it's an iframe.
      const iframe: ?HTMLIFrameElement = document.getElementById(
        GAMES_PLATFORM_IFRAME_ID
      );
      if (!iframe || !iframe.contentWindow) {
        console.error('Iframe not found or not accessible.');
        return;
      }

      try {
        if (userCustomToken) {
          console.info('Sending user custom token to Games Platform frame...');
          iframe.contentWindow.postMessage(
            {
              id: 'connectUserWithCustomToken',
              token: userCustomToken,
            },
            // Specify the target origin to avoid leaking the customToken.
            // Use '*' to test locally.
            Window.isDev() ? '*' : 'https://gd.games'
          );
        } else {
          console.info(
            'Notifying the Games Platform frame that the user is not connected (or just disconnected).'
          );
          iframe.contentWindow.postMessage(
            {
              id: 'disconnectUser',
            },
            // No need to specify the target origin, as this info is not sensitive.
            '*'
          );
        }
      } catch (error) {
        console.error(
          'Error while sending user custom token. User will not be logged in the Games Platform frame.',
          error
        );
        return;
      }
    },
    [iframeLoaded, userCustomToken]
  );

  React.useEffect(
    () => {
      sendUserCustomTokenToFrame();
    },
    [sendUserCustomTokenToFrame]
  );

  React.useEffect(
    () => {
      if (!iframeLoaded) {
        return;
      }
      const offset = softKeyboardBottomOffset - homepageMobileMenuHeight;
      sendSoftKeyboardOffsetToFrame(offset);
    },
    // Send keyboard offset to iframe every time it changes.
    [iframeLoaded, softKeyboardBottomOffset]
  );

  // We store an up-to-date reference to the iframeLoaded state, so that we can
  // be sure we read the correct value in the effect below.
  const iframeLoadedRef = useStableUpToDateRef(iframeLoaded);

  React.useEffect(
    () => {
      (async () => {
        if (!iframeVisible) return;
        await delay(12000);
        // Consider the loading of the iframe as a failure if not completed after 12s.
        if (iframeLoadedRef.current) return;
        setIframeErrored(true);
        setIframeVisible(false);
      })();
    },
    [iframeVisible, iframeLoadedRef]
  );

  const renderGamesPlatformFrame = React.useCallback(
    () => (
      <GamesPlatformFrame
        initialGameId={lastGameId}
        loaded={loadIframeInDOM}
        visible={iframeVisible}
        iframePosition={iframePosition}
      />
    ),
    [lastGameId, loadIframeInDOM, iframeVisible, iframePosition]
  );

  const updateIframePosition = React.useCallback(
    (position: IframePosition) => {
      if (
        !iframePosition ||
        iframePosition.top !== position.top ||
        iframePosition.left !== position.left ||
        iframePosition.width !== position.width ||
        iframePosition.height !== position.height
      ) {
        setIframePosition(position);
      }
    },
    [setIframePosition, iframePosition]
  );

  const gamesPlatformFrameTools = React.useMemo(
    () => ({
      startTimeoutToUnloadIframe,
      loadIframeOrRemoveTimeout,
      iframeLoaded,
      iframeVisible,
      iframeErrored,
      updateIframePosition,
      renderGamesPlatformFrame,
    }),
    [
      startTimeoutToUnloadIframe,
      loadIframeOrRemoveTimeout,
      iframeLoaded,
      iframeVisible,
      iframeErrored,
      updateIframePosition,
      renderGamesPlatformFrame,
    ]
  );

  return gamesPlatformFrameTools;
};

export { useGamesPlatformFrame };
