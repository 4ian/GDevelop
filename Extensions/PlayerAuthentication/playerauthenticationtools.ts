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
    let _authenticationTextContainer: HTMLDivElement | null = null;
    let _authenticationBanner: HTMLDivElement | null = null;
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
    }) =>
      `https://liluo.io/auth?gameId=${gameId}${
        connectionId ? `&connectionId=${connectionId}` : ''
      }${
        runtimeGame.isUsingGDevelopDevelopmentEnvironment() ? '&dev=true' : ''
      }`;

    /**
     * Helper returning the platform.
     */
    const getPlatform = (
      runtimeScene: RuntimeScene
    ): 'electron' | 'cordova' | 'web' => {
      const electron = runtimeScene.getGame().getRenderer().getElectron();
      if (electron) {
        return 'electron';
      }
      if (typeof cordova !== 'undefined') return 'cordova';
      return 'web';
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
      return _userId || null;
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

    /**
     * When the websocket receives the authentication result, close all the
     * authentication windows, display the notification and focus on the game.
     */
    const handleLoggedInEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      userId: string,
      username: string | null,
      userToken: string
    ) {
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
      window.localStorage.setItem(
        getLocalStorageKey(gameId),
        JSON.stringify({
          username: _username,
          userId: _userId,
          userToken: _userToken,
        })
      );
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
    const receiveMessageFromAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene,
      event: MessageEvent,
      { checkOrigin }: { checkOrigin: boolean }
    ) {
      const allowedOrigin = 'https://liluo.io';

      // Check origin of message.
      if (checkOrigin && event.origin !== allowedOrigin) {
        throw new Error(`Unexpected origin: ${event.origin}`);
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
     * Clear the authentication window timeout.
     * Useful when:
     * - the authentication succeeded
     * - the authentication window is closed
     */
    const clearAuthenticationWindowTimeout = () => {
      if (_authenticationTimeoutId) clearTimeout(_authenticationTimeoutId);
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
      const onDismissBanner = () => {
        removeAuthenticationBanner(runtimeScene);
      };
      const onOpenAuthenticationWindow = () => {
        openAuthenticationWindow(runtimeScene);
      };
      // We display the corresponding banner depending on the authentication status.
      _authenticationBanner = _userToken
        ? authComponents.computeAuthenticatedBanner(
            onOpenAuthenticationWindow,
            onDismissBanner,
            _username
          )
        : authComponents.computeNotAuthenticatedBanner(
            onOpenAuthenticationWindow,
            onDismissBanner
          );
      domElementContainer.appendChild(_authenticationBanner);
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
              const messagegeData = messageContent.data;
              const connectionId = messagegeData.connectionId;
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
          receiveMessageFromAuthenticationWindow(runtimeScene, event, {
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
        receiveMessageFromAuthenticationWindow(runtimeScene, event, {
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
      } = authComponents.computeAuthenticationContainer(
        onAuthenticationContainerDismissed
      );
      _authenticationRootContainer = rootContainer;
      _authenticationLoaderContainer = loaderContainer;

      // Display the authentication window right away, to show a loader
      // while the call for game registration is happening.
      domElementContainer.appendChild(_authenticationRootContainer);

      // If the game is registered, open the authentication window.
      // Otherwise, open the window indicating that the game is not registered.
      checkIfGameIsRegistered(runtimeScene.getGame(), _gameId)
        .then((isGameRegistered) => {
          if (_authenticationLoaderContainer) {
            _authenticationTextContainer = authComponents.addAuthenticationTextsToLoadingContainer(
              _authenticationLoaderContainer,
              platform,
              isGameRegistered
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
                openAuthenticationWindowForWeb(runtimeScene, _gameId);
                break;
            }
          }
        })
        .catch((error) => {
          handleAuthenticationError(
            runtimeScene,
            'Error while checking if the game is registered.'
          );
          console.error(error);
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

      _authenticationRootContainer = null;
      _authenticationLoaderContainer = null;
      _authenticationTextContainer = null;
    };

    /**
     * Remove the banner displaying the authentication status.
     */
    const removeAuthenticationBanner = function (
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
