namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Player Authentication');
  const authComponents = gdjs.playerAuthenticationComponents;
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
      gameId,
      connectionId,
    }: {
      gameId: string;
      connectionId?: string;
    }) =>
      `https://liluo.io/auth?gameId=${gameId}${
        connectionId ? `&connectionId=${connectionId}` : ''
      }`;

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
      const onDismissBanner = () => {
        removeAuthenticationBanner(runtimeScene);
      };
      const onOpenAuthenticationWindow = () => {
        openAuthenticationWindow(runtimeScene);
      };
      _authenticationBanner = authComponents.computeNotAuthenticatedBanner(
        onOpenAuthenticationWindow,
        onDismissBanner
      );
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
    const openAuthenticationWindowForElectron = (runtimeScene, gameId) => {
      _websocket = new WebSocket('wss://api-ws.gdevelop.io/play');
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
              console.log('Received player token');
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

              const targetUrl = getAuthWindowUrl({ gameId, connectionId });

              const electron = runtimeScene
                .getGame()
                .getRenderer()
                .getElectron();
              electron.shell.openExternal(targetUrl);
            }
          }
        }
      };
    };

    /**
     * Helper to handle authentication window on Cordova.
     * We open an InAppBrowser window, and listen to messages posted on this window.
     */
    const openAuthenticationWindowForCordova = (runtimeScene, gameId) => {
      const targetUrl = getAuthWindowUrl({ gameId });

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
    const openAuthenticationWindowForWeb = (runtimeScene, gameId) => {
      // If we're on a browser, open a new window.
      const targetUrl = getAuthWindowUrl({ gameId });

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
      _authenticationWindow = window.open(
        targetUrl,
        'authentication',
        windowFeatures
      );
    };

    /**
     * Action to display the authentication window to the user.
     */
    export const openAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      // If the banner is displayed, hide it, so that it can be shown again if the user closes the window.
      if (_authenticationBanner) _authenticationBanner.style.opacity = '0';
      const _gameId = gdjs.projectData.properties.projectUuid;

      startAuthenticationWindowTimeout(runtimeScene);

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
      const rootContainer = authComponents.computeAuthenticationContainer(
        onAuthenticationContainerDismissed
      );
      _authenticationRootContainer = rootContainer;
      domElementContainer.appendChild(_authenticationRootContainer);

      // Based on which platform the game is running, we open the authentication window
      // with a different window, with or without a websocket.
      const electron = runtimeScene.getGame().getRenderer().getElectron();
      if (electron) {
        openAuthenticationWindowForElectron(runtimeScene, _gameId);
      } else if (typeof cordova !== 'undefined') {
        openAuthenticationWindowForCordova(runtimeScene, _gameId);
      } else {
        openAuthenticationWindowForWeb(runtimeScene, _gameId);
      }
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
