namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Player Authentication');
  const authComponents = gdjs.playerAuthenticationComponents;
  // TODO EBO Replace runtimeScene to instanceContainer.
  export namespace playerAuthentication {
    // Authentication information.
    let _username: string | null = null;
    let _userId: string | null = null;
    let _userToken: string | null = null;
    let _justLoggedIn = false;

    let _checkedLocalStorage: boolean = false;

    // Authentication display
    let _authenticationWindow: Window | null = null; // For Web.
    let _authenticationInAppWindow: Window | null = null; // For Cordova.
    let _authenticationRootContainer: HTMLDivElement | null = null;
    let _authenticationLoaderContainer: HTMLDivElement | null = null;
    let _authenticationIframeContainer: HTMLDivElement | null = null;
    let _authenticationTextContainer: HTMLDivElement | null = null;
    let _authenticationBanner: HTMLDivElement | null = null;
    let _initialAuthenticationTimeoutId: NodeJS.Timeout | null = null;
    let _authenticationTimeoutId: NodeJS.Timeout | null = null;

    // Communication methods.
    let _authenticationMessageCallback:
      | ((event: MessageEvent) => void)
      | null = null;
    let _cordovaAuthenticationMessageCallback:
      | ((event: MessageEvent) => void)
      | null = null;
    let _websocket: WebSocket | null = null;

    // Ensure that the condition "just logged in" is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      _justLoggedIn = false;
    });

    // If the extension is used, register an eventlistener to know if the user is
    // logged in while playing the game on GDevelop games platform.
    // Then send a message to the parent iframe to say that the player auth is ready.
    gdjs.registerFirstRuntimeSceneLoadedCallback(
      (runtimeScene: RuntimeScene) => {
        if (getPlatform(runtimeScene) !== 'web') {
          // Automatic authentication is only valid when the game is hosted on GDevelop games platform.
          return;
        }
        removeAuthenticationCallbacks(); // Remove any callback that could have been registered before.
        _authenticationMessageCallback = (event: MessageEvent) => {
          receiveAuthenticationMessage(runtimeScene, event, {
            checkOrigin: true,
          });
        };
        window.addEventListener(
          'message',
          _authenticationMessageCallback,
          true
        );
        logger.info(
          'Notifying parent window that player authentication is ready.'
        );
        window.parent.postMessage(
          {
            id: 'playerAuthReady',
          },
          '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
        );
        // If no answer after 3 seconds, assume that the game is not embedded in GDevelop games platform, and remove the listener.
        _initialAuthenticationTimeoutId = setTimeout(() => {
          logger.info('Removing initial authentication listener.');
          removeAuthenticationCallbacks();
        }, 3000);
      }
    );

    const getLocalStorageKey = (gameId: string) =>
      `${gameId}_authenticatedUser`;

    const getAuthWindowUrl = ({
      runtimeGame,
      gameId,
      connectionId,
    }: {
      runtimeGame: gdjs.RuntimeGame;
      gameId: string;
      connectionId?: string;
    }) => {
      // Uncomment to test the case of a failing loading:
      // return 'https://gd.games.wronglink';

      return `https://gd.games/auth?gameId=${gameId}${
        connectionId ? `&connectionId=${connectionId}` : ''
      }${
        runtimeGame.isUsingGDevelopDevelopmentEnvironment() ? '&dev=true' : ''
      }`;
    };

    /**
     * Helper returning the platform.
     */
    const getPlatform = (
      runtimeScene: RuntimeScene
    ): 'electron' | 'cordova' | 'web' => {
      const runtimeGame = runtimeScene.getGame();
      const electron = runtimeGame.getRenderer().getElectron();
      if (electron) {
        return 'electron';
      }
      if (typeof cordova !== 'undefined') return 'cordova';

      return 'web';
    };

    /**
     * Check if, in some exceptional cases, we allow authentication
     * to be done through a iframe.
     * This is usually discouraged as the user can't verify that the authentication
     * window is a genuine one. It's only to be used in trusted contexts.
     */
    const shouldAuthenticationUseIframe = (runtimeScene: RuntimeScene) => {
      const runtimeGameOptions = runtimeScene.getGame().getAdditionalOptions();
      return (
        runtimeGameOptions &&
        runtimeGameOptions.isPreview &&
        runtimeGameOptions.allowAuthenticationUsingIframeForPreview
      );
    };

    /**
     * Returns true if a user token is present in the local storage.
     */
    export const isAuthenticated = () => {
      if (!_checkedLocalStorage) {
        readAuthenticatedUserFromLocalStorage();
      }
      return _userToken !== null;
    };

    /**
     * Returns true if the user just logged in.
     * Useful to update username or trigger messages in the game.
     */
    export const hasLoggedIn = () => _justLoggedIn;

    /**
     * Returns the username from the local storage.
     */
    export const getUsername = () => {
      if (!_checkedLocalStorage) {
        readAuthenticatedUserFromLocalStorage();
      }
      return _username || '';
    };

    /**
     * Returns the user token from the local storage.
     */
    export const getUserToken = () => {
      if (!_checkedLocalStorage) {
        readAuthenticatedUserFromLocalStorage();
      }
      return _userToken || null;
    };

    /**
     * Returns the username from the local storage.
     */
    export const getUserId = () => {
      if (!_checkedLocalStorage) {
        readAuthenticatedUserFromLocalStorage();
      }
      return _userId || '';
    };

    /**
     * Returns true if the game is registered, false otherwise.
     * Useful to display a message to the user to register the game before logging in.
     */
    const checkIfGameIsRegistered = (
      runtimeGame: gdjs.RuntimeGame,
      gameId: string,
      tries: number = 0
    ): Promise<boolean> => {
      const rootApi = runtimeGame.isUsingGDevelopDevelopmentEnvironment()
        ? 'https://api-dev.gdevelop.io'
        : 'https://api.gdevelop.io';
      const url = `${rootApi}/game/public-game/${gameId}`;
      return fetch(url, { method: 'HEAD' }).then(
        (response) => {
          if (response.status !== 200) {
            logger.warn(
              `Error while fetching the game: ${response.status} ${response.statusText}`
            );

            // If the response is not 404, it may be a timeout, so retry a few times.
            if (response.status === 404 || tries > 2) {
              return false;
            }

            return checkIfGameIsRegistered(runtimeGame, gameId, tries + 1);
          }
          return true;
        },
        (err) => {
          logger.error('Error while fetching game:', err);
          return false;
        }
      );
    };

    /**
     * Remove the user information from the local storage.
     */
    export const logout = (runtimeScene: RuntimeScene) => {
      _username = null;
      _userToken = null;
      _userId = null;

      const gameId = gdjs.projectData.properties.projectUuid;
      if (!gameId) {
        logger.error('Missing game id in project properties.');
        return;
      }
      window.localStorage.removeItem(getLocalStorageKey(gameId));
      cleanUpAuthWindowAndCallbacks(runtimeScene);
      removeAuthenticationBanner(runtimeScene);
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication banner cannot be displayed."
        );
        return;
      }
      authComponents.displayLoggedOutNotification(domElementContainer);
    };

    /**
     * Retrieves the user information from the local storage, and store
     * them in the extension variables.
     */
    const readAuthenticatedUserFromLocalStorage = () => {
      const gameId = gdjs.projectData.properties.projectUuid;
      if (!gameId) {
        logger.error('Missing game id in project properties.');
        return;
      }
      try {
        const authenticatedUserStorageItem = window.localStorage.getItem(
          getLocalStorageKey(gameId)
        );
        if (!authenticatedUserStorageItem) {
          _checkedLocalStorage = true;
          return;
        }
        const authenticatedUser = JSON.parse(authenticatedUserStorageItem);

        _username = authenticatedUser.username;
        _userId = authenticatedUser.userId;
        _userToken = authenticatedUser.userToken;
        _checkedLocalStorage = true;
      } catch (err) {
        logger.warn(
          'Unable to read authentication details from localStorage. Player authentication will not be available.',
          err
        );
      }
    };

    /**
     * Helper to be called on login or error.
     * Removes all the UI and callbacks.
     */
    const cleanUpAuthWindowAndCallbacks = (runtimeScene: RuntimeScene) => {
      removeAuthenticationContainer(runtimeScene);
      clearAuthenticationWindowTimeout();
      if (_websocket) {
        _websocket.close();
        _websocket = null;
      }
      // If a new window was opened (web), close it.
      if (_authenticationWindow) {
        _authenticationWindow.close();
        _authenticationWindow = null;
      }
      // If an in-app browser was used (cordova), close it.
      if (_authenticationInAppWindow) {
        _authenticationInAppWindow.close();
        _authenticationInAppWindow = null;
      }
    };

    const saveAuthKeyToStorage = ({
      username,
      userId,
      userToken,
    }: {
      username: string | null;
      userId: string;
      userToken: string;
    }) => {
      if (!username) {
        logger.warn('The authenticated player does not have a username');
      }
      _username = username;
      _userId = userId;
      _userToken = userToken;
      _justLoggedIn = true;

      const gameId = gdjs.projectData.properties.projectUuid;
      if (!gameId) {
        logger.error('Missing game id in project properties.');
        return;
      }
      try {
        window.localStorage.setItem(
          getLocalStorageKey(gameId),
          JSON.stringify({
            username: _username,
            userId: _userId,
            userToken: _userToken,
          })
        );
      } catch (err) {
        logger.warn(
          'Unable to save the authentication details to localStorage. Player authentication will not be available.',
          err
        );
      }
    };

    /**
     * When the game receives the authentication result, close all the
     * authentication windows, display the notification and focus on the game.
     */
    const handleLoggedInEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      userId: string,
      username: string | null,
      userToken: string
    ) {
      saveAuthKeyToStorage({ userId, username, userToken });
      cleanUpAuthWindowAndCallbacks(runtimeScene);
      removeAuthenticationBanner(runtimeScene);

      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication banner cannot be displayed."
        );
        return;
      }
      authComponents.displayLoggedInNotification(
        domElementContainer,
        _username || 'Anonymous'
      );
      focusOnGame(runtimeScene);
    };

    /**
     * Reads the event sent by the authentication window and
     * display the appropriate banner.
     */
    const receiveAuthenticationMessage = function (
      runtimeScene: gdjs.RuntimeScene,
      event: MessageEvent,
      { checkOrigin }: { checkOrigin: boolean }
    ) {
      const allowedOrigins = ['https://liluo.io', 'https://gd.games'];

      // Check origin of message.
      if (checkOrigin && !allowedOrigins.includes(event.origin)) {
        // Automatic authentication message ignored: wrong origin. Return silently.
        return;
      }
      // Check that message is not malformed.
      if (!event.data.id) {
        throw new Error('Malformed message');
      }

      // Handle message.
      switch (event.data.id) {
        case 'authenticationResult': {
          if (!(event.data.body && event.data.body.token)) {
            throw new Error('Malformed message.');
          }

          handleLoggedInEvent(
            runtimeScene,
            event.data.body.userId,
            event.data.body.username,
            event.data.body.token
          );
          break;
        }
        case 'alreadyAuthenticated': {
          if (!(event.data.body && event.data.body.token)) {
            throw new Error('Malformed message.');
          }

          saveAuthKeyToStorage({
            userId: event.data.body.userId,
            username: event.data.body.username,
            userToken: event.data.body.token,
          });
          removeAuthenticationCallbacks();
          refreshAuthenticationBannerIfAny(runtimeScene);
          break;
        }
      }
    };

    /**
     * Handle any error that can occur as part of the authentication process.
     */
    const handleAuthenticationError = function (
      runtimeScene: gdjs.RuntimeScene,
      message: string
    ) {
      logger.error(message);
      cleanUpAuthWindowAndCallbacks(runtimeScene);

      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication banner cannot be displayed."
        );
        return;
      }
      authComponents.displayErrorNotification(domElementContainer);
      focusOnGame(runtimeScene);
    };

    /**
     * If after 5min, no message has been received from the authentication window,
     * show a notification and remove the authentication container.
     */
    const startAuthenticationWindowTimeout = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      clearAuthenticationWindowTimeout();
      const time = 12 * 60 * 1000; // 12 minutes, in case the user needs time to authenticate.
      _authenticationTimeoutId = setTimeout(() => {
        logger.info(
          'Authentication window did not send message in time. Closing it.'
        );
        cleanUpAuthWindowAndCallbacks(runtimeScene);
        focusOnGame(runtimeScene);
      }, time);
    };

    /**
     * Clear all existing authentication timeouts.
     * Useful when:
     * - a new authentication starts
     * - the authentication succeeded
     * - the authentication window is closed
     */
    const clearAuthenticationWindowTimeout = () => {
      if (_initialAuthenticationTimeoutId)
        clearTimeout(_initialAuthenticationTimeoutId);
      if (_authenticationTimeoutId) clearTimeout(_authenticationTimeoutId);
    };

    /**
     * Helper to create the authentication banner based on the authentication status.
     */
    const createAuthenticationBanner = function (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement {
      const onDismissBanner = () => {
        removeAuthenticationBanner(runtimeScene);
      };
      const onOpenAuthenticationWindow = () => {
        openAuthenticationWindow(runtimeScene);
      };
      return _userToken
        ? authComponents.computeAuthenticatedBanner(
            onOpenAuthenticationWindow,
            onDismissBanner,
            _username
          )
        : authComponents.computeNotAuthenticatedBanner(
            onOpenAuthenticationWindow,
            onDismissBanner
          );
    };

    /**
     * Action to display the banner to the user, depending on their authentication status.
     */
    export const displayAuthenticationBanner = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (_authenticationBanner) {
        // Banner already displayed, ensure it's visible.
        _authenticationBanner.style.opacity = '1';
        return;
      }
      if (!_checkedLocalStorage) {
        readAuthenticatedUserFromLocalStorage();
      }

      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication banner cannot be displayed."
        );
        return;
      }

      _authenticationBanner = createAuthenticationBanner(runtimeScene);
      domElementContainer.appendChild(_authenticationBanner);
    };

    /**
     * Helper to recompute the authentication banner.
     * This is useful if the user is already logged on GDevelop games platform
     * and we want to display the banner with the username.
     */
    const refreshAuthenticationBannerIfAny = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (!_authenticationBanner) return;
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication banner cannot be displayed."
        );
        return;
      }
      const oldAuthenticationBanner = _authenticationBanner;
      _authenticationBanner = createAuthenticationBanner(runtimeScene);
      domElementContainer.replaceChild(
        _authenticationBanner,
        oldAuthenticationBanner
      );
    };

    /**
     * Helper to handle authentication window on Electron.
     * We open a new window, and create a websocket to know when the user is logged in.
     */
    const openAuthenticationWindowForElectron = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) => {
      const wsPlayApi = runtimeScene
        .getGame()
        .isUsingGDevelopDevelopmentEnvironment()
        ? 'wss://api-ws-dev.gdevelop.io/play'
        : 'wss://api-ws.gdevelop.io/play';
      _websocket = new WebSocket(wsPlayApi);
      _websocket.onopen = () => {
        // When socket is open, ask for the connectionId, so that we can open the authentication window.
        if (_websocket) {
          _websocket.send(JSON.stringify({ action: 'getConnectionId' }));
        }
      };
      _websocket.onerror = () => {
        handleAuthenticationError(
          runtimeScene,
          'Error while connecting to the authentication server.'
        );
      };
      _websocket.onmessage = (event) => {
        if (event.data) {
          const messageContent = JSON.parse(event.data);
          switch (messageContent.type) {
            case 'authenticationResult': {
              const messageData = messageContent.data;
              handleLoggedInEvent(
                runtimeScene,
                messageData.userId,
                messageData.username,
                messageData.token
              );
              break;
            }
            case 'connectionId': {
              const messageData = messageContent.data;
              const connectionId = messageData.connectionId;
              if (!connectionId) {
                logger.error('No connectionId received');
                return;
              }

              const targetUrl = getAuthWindowUrl({
                runtimeGame: runtimeScene.getGame(),
                gameId,
                connectionId,
              });

              const electron = runtimeScene
                .getGame()
                .getRenderer()
                .getElectron();
              const openWindow = () => electron.shell.openExternal(targetUrl);

              openWindow();

              // Add the link to the window in case a popup blocker is preventing the window from opening.
              if (_authenticationTextContainer) {
                authComponents.addAuthenticationUrlToTextsContainer(
                  openWindow,
                  _authenticationTextContainer
                );
              }

              break;
            }
          }
        }
      };
    };

    /**
     * Helper to handle authentication window on Cordova.
     * We open an InAppBrowser window, and listen to messages posted on this window.
     */
    const openAuthenticationWindowForCordova = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) => {
      const targetUrl = getAuthWindowUrl({
        runtimeGame: runtimeScene.getGame(),
        gameId,
      });

      _authenticationInAppWindow = cordova.InAppBrowser.open(
        targetUrl,
        'authentication',
        'location=yes' // location=yes is important to show the URL bar to the user.
      );
      // Listen to messages posted on the authentication window, so that we can
      // know when the user is authenticated.
      if (_authenticationInAppWindow) {
        _cordovaAuthenticationMessageCallback = (event: MessageEvent) => {
          receiveAuthenticationMessage(runtimeScene, event, {
            checkOrigin: false, // For Cordova we don't check the origin, as the message is read from the InAppBrowser directly.
          });
        };
        _authenticationInAppWindow.addEventListener(
          'message',
          _cordovaAuthenticationMessageCallback,
          true
        );
      }
    };

    /**
     * Helper to handle authentication window on web.
     * We open a new window, and listen to messages posted back to the game window.
     */
    const openAuthenticationWindowForWeb = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) => {
      // If we're on a browser, open a new window.
      const targetUrl = getAuthWindowUrl({
        runtimeGame: runtimeScene.getGame(),
        gameId,
      });

      // Listen to messages posted by the authentication window, so that we can
      // know when the user is authenticated.
      _authenticationMessageCallback = (event: MessageEvent) => {
        receiveAuthenticationMessage(runtimeScene, event, {
          checkOrigin: true,
        });
      };
      window.addEventListener('message', _authenticationMessageCallback, true);

      const left = screen.width / 2 - 500 / 2;
      const top = screen.height / 2 - 600 / 2;
      const windowFeatures = `left=${left},top=${top},width=500,height=600`;
      const openWindow = () =>
        window.open(targetUrl, 'authentication', windowFeatures);
      _authenticationWindow = openWindow();

      // Add the link to the window in case a popup blocker is preventing the window from opening.
      if (_authenticationTextContainer) {
        authComponents.addAuthenticationUrlToTextsContainer(
          openWindow,
          _authenticationTextContainer
        );
      }
    };

    /**
     * Helper to handle authentication iframe on web.
     * We open an iframe, and listen to messages posted back to the game window.
     */
    const openAuthenticationIframeForWeb = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) => {
      if (
        !_authenticationIframeContainer ||
        !_authenticationLoaderContainer ||
        !_authenticationTextContainer
      ) {
        console.error(
          "Can't open an authentication iframe - no iframe container, loader container or text container was opened for it."
        );
        return;
      }

      const targetUrl = getAuthWindowUrl({
        runtimeGame: runtimeScene.getGame(),
        gameId,
      });

      // Listen to messages posted by the authentication window, so that we can
      // know when the user is authenticated.
      _authenticationMessageCallback = (event: MessageEvent) => {
        receiveAuthenticationMessage(runtimeScene, event, {
          checkOrigin: true,
        });
      };
      window.addEventListener('message', _authenticationMessageCallback, true);

      authComponents.displayIframeInsideAuthenticationContainer(
        _authenticationIframeContainer,
        _authenticationLoaderContainer,
        _authenticationTextContainer,
        targetUrl
      );
    };

    /**
     * Action to display the authentication window to the user.
     */
    export const openAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      // Create the authentication container for the player to wait.
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleAuthenticationError(
          runtimeScene,
          "The div element covering the game couldn't be found, the authentication window cannot be displayed."
        );
        return;
      }

      const onAuthenticationContainerDismissed = () => {
        cleanUpAuthWindowAndCallbacks(runtimeScene);
        displayAuthenticationBanner(runtimeScene);
      };

      const _gameId = gdjs.projectData.properties.projectUuid;
      if (!_gameId) {
        handleAuthenticationError(
          runtimeScene,
          'The game ID is missing, the authentication window cannot be opened.'
        );
        return;
      }

      // If the banner is displayed, hide it, so that it can be shown again if the user closes the window.
      if (_authenticationBanner) _authenticationBanner.style.opacity = '0';

      const platform = getPlatform(runtimeScene);
      const {
        rootContainer,
        loaderContainer,
        iframeContainer,
      } = authComponents.computeAuthenticationContainer(
        onAuthenticationContainerDismissed
      );
      _authenticationRootContainer = rootContainer;
      _authenticationLoaderContainer = loaderContainer;
      _authenticationIframeContainer = iframeContainer;

      // Display the authentication window right away, to show a loader
      // while the call for game registration is happening.
      domElementContainer.appendChild(_authenticationRootContainer);

      // If the game is registered, open the authentication window.
      // Otherwise, open the window indicating that the game is not registered.
      checkIfGameIsRegistered(runtimeScene.getGame(), _gameId)
        .then((isGameRegistered) => {
          if (_authenticationLoaderContainer) {
            const electron = runtimeScene.getGame().getRenderer().getElectron();
            const wikiOpenAction = electron
              ? () =>
                  electron.shell.openExternal(
                    'https://wiki.gdevelop.io/gdevelop5/publishing/web'
                  )
              : null; // Only show a link if we're on electron.

            _authenticationTextContainer = authComponents.addAuthenticationTextsToLoadingContainer(
              _authenticationLoaderContainer,
              platform,
              isGameRegistered,
              wikiOpenAction
            );
          }
          if (isGameRegistered) {
            startAuthenticationWindowTimeout(runtimeScene);

            // Based on which platform the game is running, we open the authentication window
            // with a different window, with or without a websocket.
            switch (platform) {
              case 'electron':
                openAuthenticationWindowForElectron(runtimeScene, _gameId);
                break;
              case 'cordova':
                openAuthenticationWindowForCordova(runtimeScene, _gameId);
                break;
              case 'web':
              default:
                if (shouldAuthenticationUseIframe(runtimeScene)) {
                  openAuthenticationIframeForWeb(runtimeScene, _gameId);
                } else {
                  openAuthenticationWindowForWeb(runtimeScene, _gameId);
                }
                break;
            }
          }
        })
        .catch((error) => {
          handleAuthenticationError(
            runtimeScene,
            'Error while checking if the game is registered.'
          );
          logger.error(error);
        });
    };

    /**
     * Condition to check if the window is open, so that the game can be paused in the background.
     */
    export const isAuthenticationWindowOpen = function (): boolean {
      return !!_authenticationRootContainer;
    };

    /**
     * Remove the container displaying the authentication window and the callback.
     */
    export const removeAuthenticationContainer = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      removeAuthenticationCallbacks();
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        logger.info(
          "The div element covering the game couldn't be found, the authentication must be already closed."
        );
        return;
      }

      // Remove the authentication root container.
      if (_authenticationRootContainer) {
        domElementContainer.removeChild(_authenticationRootContainer);
      }

      _authenticationRootContainer = null;
      _authenticationLoaderContainer = null;
      _authenticationIframeContainer = null;
      _authenticationTextContainer = null;
    };

    /*
     * Remove the authentication callbacks from web or cordova.
     */
    const removeAuthenticationCallbacks = function () {
      // Remove the authentication callbacks.
      if (_authenticationMessageCallback) {
        window.removeEventListener(
          'message',
          _authenticationMessageCallback,
          true
        );
        _authenticationMessageCallback = null;
        // No need to detach the callback from the InAppBrowser, as it's destroyed when the window is closed.
        _cordovaAuthenticationMessageCallback = null;
      }
    };

    /**
     * Remove the banner displaying the authentication status.
     */
    export const removeAuthenticationBanner = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (!_authenticationBanner) {
        logger.info(
          "The authentication banner couldn't be found, the authentication banner must be already closed."
        );
        return;
      }
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        logger.info(
          "The div element covering the game couldn't be found, the authentication must be already closed."
        );
        return;
      }

      domElementContainer.removeChild(_authenticationBanner);
      _authenticationBanner = null;
    };

    /**
     * Focus on game canvas to allow user to interact with it.
     */
    const focusOnGame = function (runtimeScene: gdjs.RuntimeScene) {
      const gameCanvas = runtimeScene.getGame().getRenderer().getCanvas();
      if (gameCanvas) gameCanvas.focus();
    };
  }
}
