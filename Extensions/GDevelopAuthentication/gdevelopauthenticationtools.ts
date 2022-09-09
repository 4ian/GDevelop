namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Authentication');
  export namespace gdevelopAuthentication {
    // Authentication information.
    let _username: string | null = null;
    let _userId: string | null = null;
    let _userToken: string | null = null;
    let _justLoggedIn = false;

    let _error: any = null;
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
    let _authenticationMessageCallback:
      | ((event: MessageEvent) => void)
      | null = null;
    let _cordovaAuthenticationMessageCallback:
      | ((event: MessageEvent) => void)
      | null = null;

    /**
     * Returns true if a user token is present in the local storage.
     */
    export const isAuthenticated = () => {
      if (!_checkedLocalStorage) {
        fetchAuthenticatedUserFromLocalStorage();
      }
      return _userToken !== null;
    };

    /**
     * Returns true if the user just logged in.
     * Useful to update username or trigger messages in the game.
     */
    export const hasLoggedIn = () => {
      if (_justLoggedIn) {
        _justLoggedIn = false;
        return true;
      }
      return false;
    };

    /**
     * Returns the username from the local storage.
     */
    export const getUsername = () => {
      if (!_checkedLocalStorage) {
        fetchAuthenticatedUserFromLocalStorage();
      }
      return _username || '';
    };

    /**
     * Remove the user information from the local storage.
     */
    export const logout = (runtimeScene: RuntimeScene) => {
      if (!_checkedLocalStorage) {
        fetchAuthenticatedUserFromLocalStorage();
      }
      _username = null;
      _userToken = null;

      const _gameId = gdjs.projectData.properties.projectUuid;
      (window as any).localStorage.removeItem(`${_gameId}_authenticatedUser`);
      _authenticationBanner = computeNotAuthenticatedBanner(runtimeScene);
    };

    /**
     * Retrieves the user information from the local storage, and store
     * them in the extension variables.
     * Returns if the fetched user is different than the current one used
     * in the variables. (useful when the user changes)
     */
    const fetchAuthenticatedUserFromLocalStorage = (): boolean => {
      const _gameId = gdjs.projectData.properties.projectUuid;

      const authenticatedUserStorageItem = window.localStorage.getItem(
        `${_gameId}_authenticatedUser`
      );
      if (!authenticatedUserStorageItem) {
        _checkedLocalStorage = true;
        return _userId === null;
      }
      const authenticatedUser = JSON.parse(authenticatedUserStorageItem);
      const hasUserChanged = authenticatedUser.userId !== _userId;

      _username = authenticatedUser.username;
      _userId = authenticatedUser.userId;
      _userToken = authenticatedUser.userToken;
      _checkedLocalStorage = true;

      return hasUserChanged;
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
          window.localStorage.setItem(
            `${_gameId}_authenticatedUser`,
            JSON.stringify({
              username: _username,
              userId: _userId,
              userToken: _userToken,
            })
          );
          _username = username;
          _userId = event.data.body.userId;
          _userToken = event.data.body.token;

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
          displayLoggedInNotification(runtimeScene, event.data.body.username);
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
      _error = message;
      clearAuthenticationWindowTimeout();
      removeAuthenticationContainer(runtimeScene);
      removeAuthenticationBanner(runtimeScene);
      displayErrorNotification(runtimeScene);
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
      }, 60000);
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
     * Create the Iframe that will contain the authentication form. (electron)
     */
    const computeAuthenticationIframe = function (
      url: string
    ): HTMLIFrameElement {
      const iframe = document.createElement('iframe');

      iframe.id = 'authentication-iframe';
      iframe.src = url;
      // We create the iframe with opacity 0 to let it load and send us messages.
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'all';
      iframe.style.backgroundColor = '#FFFFFF';
      iframe.style.height = '100%';
      iframe.style.width = '100%';
      iframe.style.border = 'none';

      return iframe;
    };

    /**
     * Creates a DOM element that will contain the loader or the authentication iframe.
     */
    const computeAuthenticationContainer = function (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement {
      const closeAuthenticationContainer = () => {
        removeAuthenticationContainer(runtimeScene);
        displayAuthenticationBanner(runtimeScene);
      };

      const rootContainer = document.createElement('div');
      rootContainer.id = 'authentication-root-container';
      rootContainer.style.position = 'relative';
      rootContainer.style.backgroundColor = 'rgba(14, 6, 45, 0.5)';
      rootContainer.style.opacity = '1';
      rootContainer.style.width = '100%';
      rootContainer.style.height = '100%';
      rootContainer.style.zIndex = '2';
      rootContainer.style.pointerEvents = 'all';
      _authenticationRootContainer = rootContainer;

      const subContainer = document.createElement('div');
      subContainer.id = 'authentication-sub-container';
      subContainer.style.backgroundColor = '#FFFFFF';
      subContainer.style.position = 'absolute';
      subContainer.style.top = '16px';
      subContainer.style.bottom = '16px';
      subContainer.style.left = '16px';
      subContainer.style.right = '16px';
      subContainer.style.borderRadius = '8px';
      subContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      subContainer.style.padding = '16px';
      _authenticationSubContainer = subContainer;

      const _closeContainer: HTMLDivElement = document.createElement('div');
      _closeContainer.style.cursor = 'pointer';
      _closeContainer.style.display = 'flex';
      _closeContainer.style.justifyContent = 'right';
      _closeContainer.style.alignItems = 'center';
      _closeContainer.style.zIndex = '3';
      _closeContainer.addEventListener('click', closeAuthenticationContainer);
      _closeContainer.addEventListener(
        'touchstart',
        closeAuthenticationContainer
      );

      const _close = document.createElement('img');
      _close.setAttribute('width', '15px');
      _close.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODUzNTUgMC4xNDY0NDdDOC4wNDg4MiAwLjM0MTcwOSA4LjA0ODgyIDAuNjU4MjkxIDcuODUzNTUgMC44NTM1NTNMMC44NTM1NTMgNy44NTM1NUMwLjY1ODI5MSA4LjA0ODgyIDAuMzQxNzA5IDguMDQ4ODIgMC4xNDY0NDcgNy44NTM1NUMtMC4wNDg4MTU1IDcuNjU4MjkgLTAuMDQ4ODE1NSA3LjM0MTcxIDAuMTQ2NDQ3IDcuMTQ2NDVMNy4xNDY0NSAwLjE0NjQ0N0M3LjM0MTcxIC0wLjA0ODgxNTUgNy42NTgyOSAtMC4wNDg4MTU1IDcuODUzNTUgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMC4xNDY0NDcgMC4xNDY0NDdDMC4zNDE3MDkgLTAuMDQ4ODE1NSAwLjY1ODI5MSAtMC4wNDg4MTU1IDAuODUzNTUzIDAuMTQ2NDQ3TDcuODUzNTUgNy4xNDY0NUM4LjA0ODgyIDcuMzQxNzEgOC4wNDg4MiA3LjY1ODI5IDcuODUzNTUgNy44NTM1NUM3LjY1ODI5IDguMDQ4ODIgNy4zNDE3MSA4LjA0ODgyIDcuMTQ2NDUgNy44NTM1NUwwLjE0NjQ0NyAwLjg1MzU1M0MtMC4wNDg4MTU1IDAuNjU4MjkxIC0wLjA0ODgxNTUgMC4zNDE3MDkgMC4xNDY0NDcgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+Cjwvc3ZnPgo='
      );
      _closeContainer.appendChild(_close);

      const _loaderContainer: HTMLDivElement = document.createElement('div');
      _loaderContainer.id = 'authentication-container-loader';
      _loaderContainer.style.display = 'flex';
      _loaderContainer.style.flexDirection = 'column';
      _loaderContainer.style.height = '100%';
      _loaderContainer.style.width = '100%';
      _loaderContainer.style.justifyContent = 'center';
      _loaderContainer.style.alignItems = 'center';
      _loaderContainer.style.position = 'relative';
      _loaderContainer.style.zIndex = '3';
      _loaderContainer.style.fontSize = '11pt';
      _loaderContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
      const _loader = document.createElement('img');
      _loader.setAttribute('width', '28px');
      _loader.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iYW5pbWF0ZS1zcGluIC1tbC0xIG1yLTMgaC01IHctNSB0ZXh0LXdoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CjxjaXJjbGUgb3BhY2l0eT0nMC4yNScgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI0Ij48L2NpcmNsZT4KPHBhdGggb3BhY2l0eT0nMC43NScgZmlsbD0iY3VycmVudENvbG9yIiBkPSJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3oiPjwvcGF0aD4KPC9zdmc+'
      );
      try {
        _loader.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(359deg)' }],
          {
            duration: 3000,
            iterations: Infinity,
          }
        );
      } catch {
        logger.warn('Animation not supported, loader will be fixed.');
      }
      _loaderContainer.appendChild(_loader);
      _authenticationLoader = _loaderContainer;

      subContainer.appendChild(_closeContainer);
      subContainer.appendChild(_loaderContainer);
      rootContainer.appendChild(subContainer);

      return rootContainer;
    };

    /**
     * When a popup is opened, add this text for the user to understand we're waiting.
     */
    const insertExternalWindowLoaderText = () => {
      if (_authenticationLoader) {
        const title = document.createElement('h1');
        title.innerText = 'Logging in...';
        title.style.fontSize = '20pt';
        title.style.fontWeight = 'bold';
        const text1 = document.createElement('p');
        text1.innerText = "We're opening another page for you to log in. ";
        const text2 = document.createElement('p');
        text2.innerText = "It's alright, we'll wait until you're done.";
        text2.style.marginBottom = '50px';
        _authenticationLoader.prepend(text2);
        _authenticationLoader.prepend(text1);
        _authenticationLoader.prepend(title);
      }
    };

    /**
     * Creates a DOM element to display a dismissable banner.
     */
    const computeDismissableBanner = function (
      runtimeScene: RuntimeScene
    ): HTMLDivElement {
      const divContainer = document.createElement('div');

      const dismissBanner = () => {
        removeAuthenticationBanner(runtimeScene);
      };

      divContainer.id = 'authenticated-notification';
      divContainer.style.position = 'absolute';
      divContainer.style.pointerEvents = 'all';
      divContainer.style.backgroundColor = '#0E062D';
      divContainer.style.top = '0px';
      divContainer.style.height = '48px';
      divContainer.style.left = '0px';
      divContainer.style.width = '100%';
      divContainer.style.padding = '6px 16px';
      // Use zIndex 1 to make sure it is below the authentication iframe or webview.
      divContainer.style.zIndex = '1';
      divContainer.style.display = 'flex';
      divContainer.style.flexDirection = 'row-reverse';
      divContainer.style.justifyContent = 'space-between';
      divContainer.style.alignItems = 'center';
      divContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      divContainer.style.fontSize = '11pt';
      divContainer.style.color = '#FFFFFF';
      divContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

      const _closeContainer: HTMLDivElement = document.createElement('div');
      _closeContainer.style.cursor = 'pointer';
      _closeContainer.style.display = 'flex';
      _closeContainer.style.justifyContent = 'center';
      _closeContainer.style.alignItems = 'center';
      _closeContainer.style.zIndex = '3';
      _closeContainer.style.marginRight = '32px';
      _closeContainer.style.height = '100%';
      _closeContainer.addEventListener('click', dismissBanner);
      _closeContainer.addEventListener('touchstart', dismissBanner);

      const _close = document.createElement('img');
      _close.setAttribute('width', '30px');
      _close.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjc1IDguMDEyNUwyMS45ODc1IDYuMjVMMTUgMTMuMjM3NUw4LjAxMjUgNi4yNUw2LjI1IDguMDEyNUwxMy4yMzc1IDE1TDYuMjUgMjEuOTg3NUw4LjAxMjUgMjMuNzVMMTUgMTYuNzYyNUwyMS45ODc1IDIzLjc1TDIzLjc1IDIxLjk4NzVMMTYuNzYyNSAxNUwyMy43NSA4LjAxMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
      );

      _closeContainer.appendChild(_close);
      divContainer.appendChild(_closeContainer);

      return divContainer;
    };

    /**
     * Create, display, and hide the logged in confirmation.
     */
    const displayLoggedInNotification = function (
      runtimeScene: RuntimeScene,
      username: string
    ) {
      const divContainer = document.createElement('div');

      divContainer.id = 'authenticated-notification';
      divContainer.style.position = 'absolute';
      divContainer.style.pointerEvents = 'all';
      divContainer.style.backgroundColor = '#0E062D';
      divContainer.style.top = '12px';
      divContainer.style.right = '16px';
      divContainer.style.padding = '6px 32px 6px 6px';
      // Use zIndex 1 to make sure it is below the authentication iframe or webview.
      divContainer.style.zIndex = '1';
      divContainer.style.display = 'flex';
      divContainer.style.flexDirection = 'row-reverse';
      divContainer.style.justifyContent = 'space-between';
      divContainer.style.alignItems = 'center';
      divContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      divContainer.style.borderRadius = '4px';
      divContainer.style.fontSize = '11pt';
      divContainer.style.color = '#FFFFFF';
      divContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
      try {
        divContainer.animate(
          [
            { transform: 'translateY(-30px)', opacity: 0 },
            { transform: 'translateY(0px)', opacity: 1 },
          ],
          {
            duration: 700,
            easing: 'ease-out',
          }
        );
      } catch {
        logger.warn('Animation not supported, div will be fixed.');
      }
      const loggedText = document.createElement('p');
      loggedText.id = 'loggedText';
      loggedText.innerHTML = `<img style="margin-right:4px" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgOSA5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC4xNjY2NyAwQzEuODY2NjcgMCAwIDEuODY2NjcgMCA0LjE2NjY3QzAgNi40NjY2NyAxLjg2NjY3IDguMzMzMzMgNC4xNjY2NyA4LjMzMzMzQzYuNDY2NjcgOC4zMzMzMyA4LjMzMzMzIDYuNDY2NjcgOC4zMzMzMyA0LjE2NjY3QzguMzMzMzMgMS44NjY2NyA2LjQ2NjY3IDAgNC4xNjY2NyAwWk0zLjMzMzMzIDYuMjVMMS4yNSA0LjE2NjY3TDEuODM3NSAzLjU3OTE3TDMuMzMzMzMgNS4wNzA4M0w2LjQ5NTgzIDEuOTA4MzNMNy4wODMzMyAyLjVMMy4zMzMzMyA2LjI1WiIgZmlsbD0iIzAwQ0M4MyIvPgo8L3N2Zz4K" />
                                  Logged as ${username}`;
      loggedText.style.margin = '0px';

      divContainer.appendChild(loggedText);

      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (domElementContainer) {
        domElementContainer.appendChild(divContainer);
        setTimeout(() => {
          try {
            divContainer.animate(
              [
                { transform: 'translateY(0px)', opacity: 1 },
                { transform: 'translateY(-30px)', opacity: 0 },
              ],
              {
                duration: 700,
                easing: 'ease-in',
              }
            );
          } catch {
            logger.warn('Animation not supported, div will be fixed.');
          }
        }, 2000);
        // Use timeout because onanimationend listener does not work.
        setTimeout(
          () => {
            divContainer.remove();
          },
          // Wait 2000 ms + 700 ms for the animation to finish.
          2700
        );
      }
    };

    /**
     * Create, display, and hide an error notification.
     */
    const displayErrorNotification = function (runtimeScene: RuntimeScene) {
      const divContainer = document.createElement('div');

      divContainer.id = 'authenticated-notification';
      divContainer.style.position = 'absolute';
      divContainer.style.pointerEvents = 'all';
      divContainer.style.backgroundColor = 'red';
      divContainer.style.top = '12px';
      divContainer.style.right = '16px';
      divContainer.style.padding = '6px 32px 6px 6px';
      // Use zIndex 1 to make sure it is below the authentication iframe or webview.
      divContainer.style.zIndex = '1';
      divContainer.style.display = 'flex';
      divContainer.style.flexDirection = 'row-reverse';
      divContainer.style.justifyContent = 'space-between';
      divContainer.style.alignItems = 'center';
      divContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      divContainer.style.borderRadius = '4px';
      divContainer.style.fontSize = '11pt';
      divContainer.style.color = '#FFFFFF';
      divContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
      try {
        divContainer.animate(
          [
            { transform: 'translateY(-30px)', opacity: 0 },
            { transform: 'translateY(0px)', opacity: 1 },
          ],
          {
            duration: 700,
            easing: 'ease-out',
          }
        );
      } catch {
        logger.warn('Animation not supported, div will be fixed.');
      }
      const loggedText = document.createElement('p');
      loggedText.id = 'loggedText';
      loggedText.innerHTML = 'An error occured...';
      loggedText.style.margin = '0px';

      divContainer.appendChild(loggedText);

      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (domElementContainer) {
        domElementContainer.appendChild(divContainer);
        setTimeout(() => {
          try {
            divContainer.animate(
              [
                { transform: 'translateY(0px)', opacity: 1 },
                { transform: 'translateY(-30px)', opacity: 0 },
              ],
              {
                duration: 700,
                easing: 'ease-in',
              }
            );
          } catch {
            logger.warn('Animation not supported, div will be fixed.');
          }
        }, 2000);
        // Use timeout because onanimationend listener does not work.
        setTimeout(
          () => {
            divContainer.remove();
          },
          // Wait 2000 ms + 700 ms for the animation to finish.
          2700
        );
      }
    };

    /**
     * Creates a DOM element reprensenting a banner for the user to know which account
     * they're using and also to allow switching to another account.
     */
    const computeAuthenticatedBanner = function (
      runtimeScene: gdjs.RuntimeScene,
      username: string
    ): HTMLDivElement {
      const divContainer = computeDismissableBanner(runtimeScene);

      const onClickDisplayAuthenticationWindow = () => {
        displayAuthenticationWindow(runtimeScene);
        removeAuthenticationBanner(runtimeScene);
      };

      const _textContainer: HTMLDivElement = document.createElement('div');
      const loggedText = document.createElement('p');
      loggedText.id = 'loggedText';
      loggedText.innerHTML = `<img style="margin-right:4px" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgOSA5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC4xNjY2NyAwQzEuODY2NjcgMCAwIDEuODY2NjcgMCA0LjE2NjY3QzAgNi40NjY2NyAxLjg2NjY3IDguMzMzMzMgNC4xNjY2NyA4LjMzMzMzQzYuNDY2NjcgOC4zMzMzMyA4LjMzMzMzIDYuNDY2NjcgOC4zMzMzMyA0LjE2NjY3QzguMzMzMzMgMS44NjY2NyA2LjQ2NjY3IDAgNC4xNjY2NyAwWk0zLjMzMzMzIDYuMjVMMS4yNSA0LjE2NjY3TDEuODM3NSAzLjU3OTE3TDMuMzMzMzMgNS4wNzA4M0w2LjQ5NTgzIDEuOTA4MzNMNy4wODMzMyAyLjVMMy4zMzMzMyA2LjI1WiIgZmlsbD0iIzAwQ0M4MyIvPgo8L3N2Zz4K" />
                                Logged as ${username}`;
      loggedText.style.margin = '0px';

      const changeAccountText = document.createElement('p');
      changeAccountText.id = 'changeAccountText';
      changeAccountText.innerText = `Click here to switch to another account.`;
      changeAccountText.style.margin = '0px';
      changeAccountText.style.marginTop = '4px';
      changeAccountText.style.textDecoration = 'underline';
      changeAccountText.style.cursor = 'pointer';
      changeAccountText.addEventListener(
        'click',
        onClickDisplayAuthenticationWindow
      );
      changeAccountText.addEventListener(
        'touchstart',
        onClickDisplayAuthenticationWindow
      );

      _textContainer.appendChild(loggedText);
      _textContainer.appendChild(changeAccountText);
      divContainer.appendChild(_textContainer);

      return divContainer;
    };

    /**
     * Creates a DOM element reprensenting a banner for the user to know
     * they are not connected and to allow logging in.
     */
    const computeNotAuthenticatedBanner = function (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement {
      const divContainer = computeDismissableBanner(runtimeScene);

      const onClickDisplayAuthenticationWindow = () => {
        displayAuthenticationWindow(runtimeScene);
        if (_authenticationBanner) _authenticationBanner.style.opacity = '0';
      };

      const _textContainer: HTMLDivElement = document.createElement('div');
      const loggedText = document.createElement('p');
      loggedText.id = 'loggedText';
      loggedText.innerHTML = `You are not authenticated.`;
      loggedText.style.margin = '0px';

      const changeAccountText = document.createElement('p');
      changeAccountText.id = 'changeAccountText';
      changeAccountText.innerText = `Click here to log in.`;
      changeAccountText.style.margin = '0px';
      changeAccountText.style.marginTop = '4px';
      changeAccountText.style.textDecoration = 'underline';
      changeAccountText.style.cursor = 'pointer';
      changeAccountText.addEventListener(
        'click',
        onClickDisplayAuthenticationWindow
      );
      changeAccountText.addEventListener(
        'touchstart',
        onClickDisplayAuthenticationWindow
      );

      _textContainer.appendChild(loggedText);
      _textContainer.appendChild(changeAccountText);
      divContainer.appendChild(_textContainer);

      return divContainer;
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
        fetchAuthenticatedUserFromLocalStorage();
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
      if (_userToken && _username !== null) {
        // If the user is already authenticated, we display the corresponding banner.
        _authenticationBanner = computeAuthenticatedBanner(
          runtimeScene,
          _username
        );
        domElementContainer.appendChild(_authenticationBanner);
        return;
      } else {
        // If the user is not authenticated, we display the corresponding banner.
        _authenticationBanner = computeNotAuthenticatedBanner(runtimeScene);
        domElementContainer.appendChild(_authenticationBanner);
      }
    };

    /**
     * Action to display the authentication window to the user.
     */
    export const displayAuthenticationWindow = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      const _gameId = gdjs.projectData.properties.projectUuid;
      const targetUrl = `https://liluo.io/oauth?gameId=${_gameId}&dev=true`;

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
      const authenticationContainer = computeAuthenticationContainer(
        runtimeScene
      );
      domElementContainer.appendChild(authenticationContainer);

      // Based on which platform the game is running, we open the authentication window
      // Inside the container, or in a new tab.
      const electron = runtimeScene.getGame().getRenderer().getElectron();
      if (electron) {
        // If we're on Electron, use an iframe.
        logger.info("We're on Electron");
        _authenticationIframe = computeAuthenticationIframe(targetUrl);
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
        logger.info("We're on Cordova");
        insertExternalWindowLoaderText();
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
        logger.info("We're on a browser");
        insertExternalWindowLoaderText();
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
