// @flow
import * as React from 'react';
import GamesPlatformFrame, {
  GAMES_PLATFORM_IFRAME_ID,
} from './GamesPlatformFrame';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { generateCustomAuthToken } from '../../../../Utils/GDevelopServices/User';
import PublicProfileContext from '../../../../Profile/PublicProfileContext';
import RouterContext from '../../../RouterContext';

// If the iframe is displaying a game, it will continue playing its sound as long as the iframe
// exists, even if it's not visible. So we don't keep it alive for too long.
const TIMEOUT_TO_UNLOAD_IFRAME_IN_MS = 2000;

type NewProjectActions = {|
  fetchAndOpenNewProjectSetupDialogForExample: (
    exampleSlug: string
  ) => Promise<void>,
|};

type GamesPlatformFrameState = {|
  startTimeoutToUnloadIframe: () => void,
  loadIframeOrRemoveTimeout: () => void,
  iframeLoaded: boolean,
  iframeVisible: boolean,
  configureNewProjectActions: (actions: NewProjectActions) => void,
|};

export const GamesPlatformFrameContext = React.createContext<GamesPlatformFrameState>(
  {
    startTimeoutToUnloadIframe: () => {},
    loadIframeOrRemoveTimeout: () => {},
    iframeLoaded: false,
    iframeVisible: false,
    configureNewProjectActions: () => {},
  }
);

type GamesPlatformFrameStateProviderProps = {|
  children: React.Node,
|};

const GamesPlatformFrameStateProvider = ({
  children,
}: GamesPlatformFrameStateProviderProps) => {
  const [loadIframeInDOM, setLoadIframeInDOM] = React.useState(false);
  const [iframeVisible, setIframeVisible] = React.useState(false);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const [lastGameId, setLastGameId] = React.useState<?string>(null);
  const timeoutToUnloadIframe = React.useRef<?TimeoutID>(null);
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);
  const { onOpenLoginDialog, onOpenCreateAccountDialog } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    newProjectActions,
    setNewProjectActions,
  ] = React.useState<?NewProjectActions>(null);

  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const userId = profile ? profile.id : null;
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
      if (newProjectActions) {
        await newProjectActions.fetchAndOpenNewProjectSetupDialogForExample(
          exampleSlug
        );
      }
    },
    [newProjectActions]
  );

  const startTimeoutToUnloadIframe = React.useCallback(() => {
    // The iframe becomes invisible right away,
    // but we wait a bit before unloading it, so that navigating to another
    // page doesn't cause the iframe to be reloaded.
    setIframeVisible(false);
    timeoutToUnloadIframe.current = setTimeout(() => {
      setLoadIframeInDOM(false);
      setIframeLoaded(false);
    }, TIMEOUT_TO_UNLOAD_IFRAME_IN_MS);
  }, []);

  const loadIframeOrRemoveTimeout = React.useCallback(() => {
    if (timeoutToUnloadIframe.current) {
      clearTimeout(timeoutToUnloadIframe.current);
      timeoutToUnloadIframe.current = null;
    }

    // The iframe is loaded on the same page as where it's displayed,
    // so we assume it's visible right away.
    setLoadIframeInDOM(true);
    setIframeVisible(true);
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
        onOpenLoginDialog();
      }
      if (event.data.id === 'openRegisterDialog') {
        onOpenCreateAccountDialog();
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
    },
    [
      openUserPublicProfile,
      onOpenLoginDialog,
      onOpenCreateAccountDialog,
      notifyIframeToChangeGame,
      onOpenGameTemplate,
      onOpenAssetPack,
      onOpenExample,
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

  const sendTokenToIframeIfConnected = React.useCallback(
    async () => {
      if (iframeLoaded && userId) {
        // The iframe is loaded and the user is authenticated, so we can
        // send that information to the iframe to automatically log the user in.
        // $FlowFixMe - we know it's an iframe.
        const iframe: ?HTMLIFrameElement = document.getElementById(
          GAMES_PLATFORM_IFRAME_ID
        );
        if (iframe && iframe.contentWindow) {
          try {
            const userCustomToken = await generateCustomAuthToken(
              getAuthorizationHeader,
              userId
            );
            iframe.contentWindow.postMessage(
              {
                id: 'connectUserWithCustomToken',
                token: userCustomToken,
              },
              // Specify the target origin to avoid leaking the customToken.
              // Replace with '*' to test locally.
              'https://gd.games'
              // '*'
            );
          } catch (error) {
            console.error(
              'Error while generating custom token. User will not be logged in in the frame.',
              error
            );
            return;
          }
        }
      }
    },
    [iframeLoaded, userId, getAuthorizationHeader]
  );

  React.useEffect(
    () => {
      sendTokenToIframeIfConnected();
    },
    [sendTokenToIframeIfConnected]
  );

  const notifyIframeUserDisconnected = React.useCallback(
    () => {
      if (iframeLoaded && !userId) {
        // $FlowFixMe - we know it's an iframe.
        const iframe: ?HTMLIFrameElement = document.getElementById(
          GAMES_PLATFORM_IFRAME_ID
        );
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              id: 'disconnectUser',
            },
            // No need to specify the target origin, as this info is not sensitive.
            '*'
          );
        }
      }
    },
    [iframeLoaded, userId]
  );

  React.useEffect(
    () => {
      notifyIframeUserDisconnected();
    },
    [notifyIframeUserDisconnected]
  );

  const configureNewProjectActions = React.useCallback(
    (actions: NewProjectActions) => {
      setNewProjectActions(actions);
    },
    [setNewProjectActions]
  );

  const gamesPlatformFrameState = React.useMemo(
    () => ({
      startTimeoutToUnloadIframe,
      loadIframeOrRemoveTimeout,
      iframeLoaded,
      iframeVisible,
      configureNewProjectActions,
    }),
    [
      startTimeoutToUnloadIframe,
      loadIframeOrRemoveTimeout,
      iframeLoaded,
      iframeVisible,
      configureNewProjectActions,
    ]
  );

  return (
    <GamesPlatformFrameContext.Provider value={gamesPlatformFrameState}>
      <GamesPlatformFrame initialGameId={lastGameId} loaded={loadIframeInDOM} />
      {children}
    </GamesPlatformFrameContext.Provider>
  );
};

export default GamesPlatformFrameStateProvider;
