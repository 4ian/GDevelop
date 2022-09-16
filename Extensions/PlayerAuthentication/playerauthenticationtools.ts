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
    let _authenticationIframe: HTMLIFrameElement | null = null; // For Electron.
    let _authenticationWindow: Window | null = null; // For Web.
    let _authenticationInAppWindow: Window | null = null; // For Cordova.
    let _authenticationRootContainer: HTMLDivElement | null = null;
    let _authenticationSubContainer: HTMLDivElement | null = null;
    let _authenticationLoader: HTMLDivElement | null = null;
    let _authenticationBanner: HTMLDivElement | null = null;
    let _authenticationTimeoutId: NodeJS.Timeout | null = null;
    let _authenticationMessageCallback: ((event: MessageEvent) => void) | null =
      null;
    let _cordovaAuthenticationMessageCallback:
      | ((event: MessageEvent) => void)
      | null = null;

    // Ensure that the condition "just logged in" is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      if (_justLoggedIn) {
        _justLoggedIn = false;
      }
    });

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

      const _gameId = gdjs.projectData.properties.projectUuid;
      window.localStorage.removeItem(`${_gameId}_authenticatedUser`);
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
      const _gameId = gdjs.projectData.properties.projectUuid;

      const authenticatedUserStorageItem = window.localStorage.getItem(
        `${_gameId}_authenticatedUser`
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
     * Reads the event sent by the authentication window and
     * display the appropriate banner.
     */
    const receiveMessageFromAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene,
      event: MessageEvent,
      { checkOrigin }: { checkOrigin: boolean }
    ) {
      const _gameId = gdjs.projectData.properties.projectUuid;
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
        case 'authenticationLoaded': {
          if (_authenticationIframe) {
            // Hide loader.
            if (_authenticationSubContainer && _authenticationLoader) {
              _authenticationSubContainer.removeChild(_authenticationLoader);
            }
            // Show iframe
            _authenticationIframe.style.opacity = '1';
          }
          break;
        }
        case 'authenticationResult': {
          if (!(event.data.body && event.data.body.token)) {
            throw new Error('Malformed message.');
          }
          const username = event.data.body.username;
          if (!username) {
            logger.warn('The authenticated player does not have a username');
          }
          _username = username;
          _userId = event.data.body.userId;
          _userToken = event.data.body.token;
          window.localStorage.setItem(
            `${_gameId}_authenticatedUser`,
            JSON.stringify({
              username: _username,
              userId: _userId,
              userToken: _userToken,
            })
          );

          _justLoggedIn = true;
          clearAuthenticationWindowTimeout();
          removeAuthenticationBanner(runtimeScene);
          removeAuthenticationContainer(runtimeScene);
          // If a new window was opened (web), close it.
          if (_authenticationWindow) {
            _authenticationWindow.close();
          }
          // If an in-app browser was used (cordova), close it.
          if (_authenticationInAppWindow) {
            _authenticationInAppWindow.close();
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
          authComponents.displayLoggedInNotification(
            domElementContainer,
            _username || 'Anonymous'
          );
          focusOnGame(runtimeScene);
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
      clearAuthenticationWindowTimeout();

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
      removeAuthenticationContainer(runtimeScene);
      removeAuthenticationBanner(runtimeScene);
      authComponents.displayErrorNotification(domElementContainer);
      focusOnGame(runtimeScene);
    };

    /**
     * If after 60s, no message has been received from the authentication window,
     * show a notification and remove the authentication container.
     */
    const startAuthenticationWindowTimeout = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      clearAuthenticationWindowTimeout();
      _authenticationTimeoutId = setTimeout(() => {
        logger.info(
          'Authentication window did not send message in time. Closing it.'
        );
        removeAuthenticationContainer(runtimeScene);
        displayAuthenticationBanner(runtimeScene);
        focusOnGame(runtimeScene);
      }, 180000); // Give a few minutes for the user to enter their credentials.
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
     * Action to display the authentication window to the user.
     */
    export const openAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      // If the banner is displayed, hide it, so that it can be shown again if the user closes the window.
      if (_authenticationBanner) _authenticationBanner.style.opacity = '0';

      const _gameId = gdjs.projectData.properties.projectUuid;
      const targetUrl = `https://liluo.io/auth?gameId=${_gameId}`;

      startAuthenticationWindowTimeout(runtimeScene);

      // Listen to messages posted by the authentication window, so that we can
      // know when the user is authenticated.
      _authenticationMessageCallback = (event: MessageEvent) => {
        receiveMessageFromAuthenticationWindow(runtimeScene, event, {
          checkOrigin: true,
        });
      };
      window.addEventListener('message', _authenticationMessageCallback, true);

      // Create the authentication container.
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
        removeAuthenticationContainer(runtimeScene);
        displayAuthenticationBanner(runtimeScene);
      };
      const { rootContainer, subContainer, loaderContainer } =
        authComponents.computeAuthenticationContainer(
          onAuthenticationContainerDismissed
        );
      _authenticationRootContainer = rootContainer;
      _authenticationSubContainer = subContainer;
      _authenticationLoader = loaderContainer;
      domElementContainer.appendChild(_authenticationRootContainer);

      // Based on which platform the game is running, we open the authentication window
      // Inside the container, or in a new tab.
      const electron = runtimeScene.getGame().getRenderer().getElectron();
      if (electron) {
        // If we're on Electron, use an iframe.
        _authenticationIframe =
          authComponents.computeAuthenticationIframe(targetUrl);
        if (!_authenticationSubContainer) {
          handleAuthenticationError(
            runtimeScene,
            "The sub container of the authentication window couldn't be found, the login iframe cannot be displayed."
          );
          return;
        }
        _authenticationSubContainer.appendChild(_authenticationIframe);
      } else if (typeof cordova !== 'undefined') {
        // If we're on Cordova, use the InAppBrowser.
        authComponents.insertExternalWindowLoaderText(_authenticationLoader);
        _authenticationInAppWindow = cordova.InAppBrowser.open(
          targetUrl,
          'authentication',
          'location=yes' // location=yes is important to show the URL bar to the user.
        );
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
      } else {
        // We're on a browser.
        authComponents.insertExternalWindowLoaderText(_authenticationLoader);
        const left = screen.width / 2 - 500 / 2;
        const top = screen.height / 2 - 600 / 2;
        const windowFeatures = `left=${left},top=${top},width=500,height=600`;
        _authenticationWindow = window.open(
          targetUrl,
          'authentication',
          windowFeatures
        );
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

      // Remove the authentication root container.
      if (_authenticationRootContainer) {
        domElementContainer.removeChild(_authenticationRootContainer);
      }
      _authenticationSubContainer = null;
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
