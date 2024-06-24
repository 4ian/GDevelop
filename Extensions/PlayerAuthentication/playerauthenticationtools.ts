namespace gdjs {
  declare var cordova: any;
  declare var SafariViewController: any;

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
    let _authenticationInAppWindow: any | null = null; // For Cordova.
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
    let _websocket: WebSocket | null = null;

    type AuthenticationWindowStatus = 'logged' | 'errored' | 'dismissed';

    // Ensure that the condition "just logged in" is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      _justLoggedIn = false;
    });

    // If the extension is used, register an eventlistener to know if the user is
    // logged in while playing the game on GDevelop games platform.
    // Then send a message to the parent iframe to say that the player auth is ready.
    gdjs.registerFirstRuntimeSceneLoadedCallback(
      (runtimeScene: RuntimeScene) => {
        if (getPlayerAuthPlatform(runtimeScene) !== 'web') {
          // Automatic authentication is only valid when the game is hosted on GDevelop games platform.
          return;
        }
        removeAuthenticationCallbacks(); // Remove any callback that could have been registered before.
        _authenticationMessageCallback = (event: MessageEvent) => {
          receiveAuthenticationMessage({
            runtimeScene,
            event,
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
      }&allowLoginProviders=true`;
    };

    /**
     * Get the platform running the game, which changes how the authentication
     * window is opened.
     */
    const getPlayerAuthPlatform = (
      runtimeScene: RuntimeScene
    ): 'electron' | 'cordova' | 'cordova-websocket' | 'web-iframe' | 'web' => {
      const runtimeGame = runtimeScene.getGame();
      const electron = runtimeGame.getRenderer().getElectron();
      if (electron) {
        // This can be a:
        // - Preview in GDevelop desktop app.
        // - Desktop game running on Electron.
        return 'electron';
      }

      // This can be a:
      // - Preview in GDevelop mobile app (iOS only)
      if (shouldAuthenticationUseIframe(runtimeScene)) return 'web-iframe';

      if (typeof cordova !== 'undefined') {
        if (cordova.platformId === 'ios') {
          // The game is an iOS app.
          return 'cordova-websocket';
        }

        // The game is an Android app.
        return 'cordova-websocket';
      }

      // This can be a:
      // - Preview in GDevelop web-app
      // - Preview in Gdevelop mobile app (Android only)
      // - Web game (gd.games or any website/server) accessed via a desktop browser...
      // - Or a web game accessed via a mobile browser (Android/iOS).
      return 'web';
    };

    /**
     * Check if, in some exceptional cases, we allow authentication
     * to be done through a iframe.
     * This is usually discouraged as the user can't verify that the authentication
     * window is a genuine one. It's only to be used in trusted contexts (e.g:
     * preview in the GDevelop mobile app).
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
      cleanUpAuthWindowAndTimeouts(runtimeScene);
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
     * Removes all the UI and timeouts.
     */
    const cleanUpAuthWindowAndTimeouts = (runtimeScene: RuntimeScene) => {
      removeAuthenticationContainer(runtimeScene);
      clearAuthenticationWindowTimeout();

      // If there is a websocket communication (electron, cordova iOS), close it.
      if (_websocket) {
        logger.info('Closing authentication websocket connection.');
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

    export const login = ({
      runtimeScene,
      userId,
      username,
      userToken,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      userId: string;
      username: string | null;
      userToken: string;
    }) => {
      saveAuthKeyToStorage({ userId, username, userToken });
      cleanUpAuthWindowAndTimeouts(runtimeScene);
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
    };

    /**
     * Reads the event sent by the authentication window and
     * display the appropriate banner.
     */
    const receiveAuthenticationMessage = function ({
      runtimeScene,
      event,
      checkOrigin,
      onDone,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      event: MessageEvent;
      checkOrigin: boolean;
      onDone?: (status: 'logged' | 'errored' | 'dismissed') => void;
    }) {
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

          login({
            runtimeScene,
            userId: event.data.body.userId,
            username: event.data.body.username,
            userToken: event.data.body.token,
          });
          focusOnGame(runtimeScene);
          if (onDone) onDone('logged');
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
      cleanUpAuthWindowAndTimeouts(runtimeScene);

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
      const time = 15 * 60 * 1000; // 15 minutes, in case the user needs time to authenticate.
      _authenticationTimeoutId = setTimeout(() => {
        logger.info(
          'Authentication window did not send message in time. Closing it.'
        );
        cleanUpAuthWindowAndTimeouts(runtimeScene);
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

    const setupWebsocketForAuthenticationWindow = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string,
      onOpenAuthenticationWindow: (options: {
        connectionId: string;
        resolve: (AuthenticationWindowStatus) => void;
      }) => void
    ) =>
      new Promise<AuthenticationWindowStatus>((resolve) => {
        let hasFinishedAlready = false;
        const wsPlayApi = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment()
          ? `wss://api-ws-dev.gdevelop.io/play?gameId=${gameId}&connectionType=login`
          : `wss://api-ws.gdevelop.io/play?gameId=${gameId}&connectionType=login`;
        _websocket = new WebSocket(wsPlayApi);
        _websocket.onopen = () => {
          logger.info('Opened authentication websocket connection.');
          // When socket is open, ask for the connectionId, so that we can open the authentication window.
          if (_websocket) {
            _websocket.send(JSON.stringify({ action: 'getConnectionId' }));
          }
        };
        _websocket.onerror = () => {
          logger.info('Error in authentication websocket connection.');
          if (!hasFinishedAlready) {
            hasFinishedAlready = true;
            resolve('errored');
          }
          handleAuthenticationError(
            runtimeScene,
            'Error while connecting to the authentication server.'
          );
        };
        _websocket.onclose = () => {
          logger.info('Closing authentication websocket connection.');
          if (!hasFinishedAlready) {
            hasFinishedAlready = true;
            resolve('dismissed');
          }
        };
        _websocket.onmessage = (event) => {
          if (event.data) {
            const messageContent = JSON.parse(event.data);
            switch (messageContent.type) {
              case 'authenticationResult': {
                const messageData = messageContent.data;

                login({
                  runtimeScene,
                  userId: messageData.userId,
                  username: messageData.username,
                  userToken: messageData.token,
                });
                focusOnGame(runtimeScene);

                hasFinishedAlready = true;
                resolve('logged');
                break;
              }
              case 'connectionId': {
                const messageData = messageContent.data;
                const connectionId = messageData.connectionId;
                if (!connectionId) {
                  logger.error('No WebSocket connectionId received');
                  hasFinishedAlready = true;
                  resolve('errored');
                  return;
                }

                logger.info('WebSocket connectionId received.');
                onOpenAuthenticationWindow({ connectionId, resolve });
                break;
              }
            }
          }
        };
      });

    /**
     * Helper to handle authentication window on Electron.
     * We open a new window, and create a websocket to know when the user is logged in.
     */
    const openAuthenticationWindowForElectron = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) =>
      setupWebsocketForAuthenticationWindow(
        runtimeScene,
        gameId,
        ({ connectionId }) => {
          const targetUrl = getAuthWindowUrl({
            runtimeGame: runtimeScene.getGame(),
            gameId,
            connectionId,
          });

          const electron = runtimeScene.getGame().getRenderer().getElectron();
          const openWindow = () => electron.shell.openExternal(targetUrl);

          openWindow();

          // Add the link to the window in case a popup blocker is preventing the window from opening.
          if (_authenticationTextContainer) {
            authComponents.addAuthenticationUrlToTextsContainer(
              openWindow,
              _authenticationTextContainer
            );
          }
        }
      );

    /**
     * Helper to handle authentication window on Cordova on iOS.
     * We open an InAppBrowser window, and listen to the websocket to know when the user is logged in.
     */
    const openAuthenticationWindowForCordovaWithWebSocket = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) =>
      setupWebsocketForAuthenticationWindow(
        runtimeScene,
        gameId,
        ({ connectionId, resolve }) => {
          const targetUrl = getAuthWindowUrl({
            runtimeGame: runtimeScene.getGame(),
            gameId,
            connectionId,
          });

          SafariViewController.isAvailable(function (available: boolean) {
            if (available) {
              SafariViewController.show(
                {
                  url: targetUrl,
                  hidden: false,
                  animated: true,
                  transition: 'slide',
                  enterReaderModeIfAvailable: false,
                  barColor: '#000000',
                  tintColor: '#ffffff',
                  controlTintColor: '#ffffff',
                },
                function (result: any) {
                  // Other events are `opened` and `loaded`.
                  if (result.event === 'closed') {
                    resolve('dismissed');
                  }
                },
                function (error: any) {
                  logger.log('Error opening webview: ' + JSON.stringify(error));
                  resolve('errored');
                }
              );
            } else {
              logger.error('Plugin SafariViewController is not available');
              resolve('errored');
            }
          });
        }
      );

    /**
     * Helper to handle authentication window on Cordova.
     * We open an InAppBrowser window, and listen to messages posted on this window.
     */
    const openAuthenticationWindowForCordova = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) =>
      new Promise<AuthenticationWindowStatus>((resolve) => {
        const targetUrl = getAuthWindowUrl({
          runtimeGame: runtimeScene.getGame(),
          gameId,
        });

        _authenticationInAppWindow = cordova.InAppBrowser.open(
          targetUrl,
          'authentication',
          'location=yes,toolbarcolor=#000000,hidenavigationbuttons=yes,closebuttoncolor=#FFFFFF' // location=yes is important to show the URL bar to the user.
        );
        if (!_authenticationInAppWindow) {
          resolve('errored');
          return;
        }

        // Listen to messages posted on the authentication window, so that we can
        // know when the user is authenticated.
        let isDoneAlready = false;
        _authenticationInAppWindow.addEventListener(
          'message',
          (event: MessageEvent) => {
            receiveAuthenticationMessage({
              runtimeScene,
              event,
              checkOrigin: false, // For Cordova we don't check the origin, as the message is read from the InAppBrowser directly.
              onDone: (status) => {
                if (isDoneAlready) return;
                isDoneAlready = true;
                resolve(status);
              },
            });
          },
          true
        );
        _authenticationInAppWindow.addEventListener(
          'exit',
          () => {
            if (isDoneAlready) return;
            isDoneAlready = true;
            resolve('dismissed');
          },
          true
        );
      });

    /**
     * Helper to handle authentication window on web.
     * We open a new window, and listen to messages posted back to the game window.
     */
    const openAuthenticationWindowForWeb = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) =>
      new Promise<AuthenticationWindowStatus>((resolve) => {
        // If we're on a browser, open a new window.
        const targetUrl = getAuthWindowUrl({
          runtimeGame: runtimeScene.getGame(),
          gameId,
        });

        // Listen to messages posted by the authentication window, so that we can
        // know when the user is authenticated.
        let isDoneAlready = false;
        _authenticationMessageCallback = (event: MessageEvent) => {
          receiveAuthenticationMessage({
            runtimeScene,
            event,
            checkOrigin: true,
            onDone: (status) => {
              if (isDoneAlready) return;
              isDoneAlready = true;
              resolve(status);
            },
          });
        };
        window.addEventListener(
          'message',
          _authenticationMessageCallback,
          true
        );

        const left = screen.width / 2 - 500 / 2;
        const top = screen.height / 2 - 600 / 2;
        const windowFeatures = `left=${left},top=${top},width=500,height=600`;
        const openWindow = () => {
          _authenticationWindow = window.open(
            targetUrl,
            'authentication',
            windowFeatures
          );
        };

        openWindow();

        // Add the link to the window in case a popup blocker is preventing the window from opening.
        if (_authenticationTextContainer) {
          authComponents.addAuthenticationUrlToTextsContainer(
            openWindow,
            _authenticationTextContainer
          );
        }
      });

    /**
     * Helper to handle authentication iframe on web.
     * We open an iframe, and listen to messages posted back to the game window.
     */
    const openAuthenticationIframeForWeb = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) =>
      new Promise<AuthenticationWindowStatus>((resolve) => {
        if (
          !_authenticationIframeContainer ||
          !_authenticationLoaderContainer ||
          !_authenticationTextContainer
        ) {
          logger.error(
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
          receiveAuthenticationMessage({
            runtimeScene,
            event,
            checkOrigin: true,
            onDone: resolve,
          });
        };
        window.addEventListener(
          'message',
          _authenticationMessageCallback,
          true
        );

        authComponents.displayIframeInsideAuthenticationContainer(
          _authenticationIframeContainer,
          _authenticationLoaderContainer,
          _authenticationTextContainer,
          targetUrl
        );
      });

    /**
     * Action to display the authentication window to the user.
     */
    export const openAuthenticationWindow = (
      runtimeScene: gdjs.RuntimeScene
    ): gdjs.PromiseTask<{ status: 'logged' | 'errored' | 'dismissed' }> =>
      new gdjs.PromiseTask(
        new Promise((resolve) => {
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
            resolve({ status: 'errored' });
            return;
          }

          const _gameId = gdjs.projectData.properties.projectUuid;
          if (!_gameId) {
            handleAuthenticationError(
              runtimeScene,
              'The game ID is missing, the authentication window cannot be opened.'
            );
            resolve({ status: 'errored' });
            return;
          }

          let isDismissedAlready = false;
          const onAuthenticationContainerDismissed = () => {
            cleanUpAuthWindowAndTimeouts(runtimeScene);
            displayAuthenticationBanner(runtimeScene);

            isDismissedAlready = true;
            resolve({ status: 'dismissed' });
          };

          // If the banner is displayed, hide it, so that it can be shown again if the user closes the window.
          if (_authenticationBanner) _authenticationBanner.style.opacity = '0';

          const playerAuthPlatform = getPlayerAuthPlatform(runtimeScene);
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
          (async () => {
            const isGameRegistered = await checkIfGameIsRegistered(
              runtimeScene.getGame(),
              _gameId
            );

            if (_authenticationLoaderContainer) {
              const electron = runtimeScene
                .getGame()
                .getRenderer()
                .getElectron();
              const wikiOpenAction = electron
                ? () =>
                    electron.shell.openExternal(
                      'https://wiki.gdevelop.io/gdevelop5/publishing/web'
                    )
                : null; // Only show a link if we're on electron.

              _authenticationTextContainer = authComponents.addAuthenticationTextsToLoadingContainer(
                _authenticationLoaderContainer,
                playerAuthPlatform,
                isGameRegistered,
                wikiOpenAction
              );
            }
            if (!isGameRegistered) return;

            startAuthenticationWindowTimeout(runtimeScene);

            // Based on which platform the game is running, we open the authentication window
            // with a different window, with or without a websocket.
            let status: AuthenticationWindowStatus;
            switch (playerAuthPlatform) {
              case 'electron':
                // This can be a:
                // - Preview in GDevelop desktop app.
                // - Desktop game running on Electron.
                status = await openAuthenticationWindowForElectron(
                  runtimeScene,
                  _gameId
                );
                break;
              case 'cordova':
                // The game is an Android app.
                status = await openAuthenticationWindowForCordova(
                  runtimeScene,
                  _gameId
                );
                break;
              case 'cordova-websocket':
                // The game is an iOS app.
                status = await openAuthenticationWindowForCordovaWithWebSocket(
                  runtimeScene,
                  _gameId
                );
                break;
              case 'web-iframe':
                // This can be a:
                // - Preview in GDevelop mobile app (iOS only)
                status = await openAuthenticationIframeForWeb(
                  runtimeScene,
                  _gameId
                );
                break;
              case 'web':
              default:
                // This can be a:
                // - Preview in GDevelop web-app
                // - Preview in Gdevelop mobile app (Android only)
                // - Web game (gd.games or any website/server) accessed via a desktop browser...
                // - Or a web game accessed via a mobile browser (Android/iOS).
                status = await openAuthenticationWindowForWeb(
                  runtimeScene,
                  _gameId
                );
                break;
            }

            if (isDismissedAlready) return;
            if (status === 'dismissed') {
              onAuthenticationContainerDismissed();
            } else if (
              status === 'logged' &&
              typeof SafariViewController !== 'undefined'
            ) {
              try {
                SafariViewController.hide();
              } catch (error) {
                logger.info(
                  'Could not hide login window. Waiting for user to do it.'
                );
              }
            }

            resolve({ status });
          })();
        })
      );

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
