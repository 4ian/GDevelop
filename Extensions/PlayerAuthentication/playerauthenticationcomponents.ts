namespace gdjs {
  const logger = new gdjs.Logger('Player Authentication');
  export namespace playerAuthenticationComponents {
    const getPlayerLoginMessages = ({
      platform,
      isGameRegistered,
    }: {
      platform: 'cordova' | 'electron' | 'web';
      isGameRegistered: boolean;
    }) =>
      isGameRegistered
        ? {
            title: 'Logging in...',
            text1:
              platform === 'cordova'
                ? "One moment, we're opening a window for you to log in."
                : "One moment, we're opening a new page with your web browser for you to log in.",
            text2:
              'If the window did not open, please check your pop-up blocker and click the button below to try again.',
          }
        : {
            title: 'Publish your game!',
            text1:
              "GDevelop's player accounts are only available for published games.",
            text2:
              'Click the button below to learn how to publish your game then try again.',
          };

    /**
     * Creates a DOM element that will contain the loader or a message if the game is not registered.
     */
    export const computeAuthenticationContainer = function (
      onCloseAuthenticationContainer: () => void
    ): {
      rootContainer: HTMLDivElement;
      loaderContainer: HTMLDivElement;
      iframeContainer: HTMLDivElement;
    } {
      const rootContainer = document.createElement('div');
      rootContainer.id = 'authentication-root-container';
      rootContainer.style.position = 'relative';
      rootContainer.style.backgroundColor = 'rgba(14, 6, 45, 0.5)';
      rootContainer.style.opacity = '1';
      rootContainer.style.width = '100%';
      rootContainer.style.height = '100%';
      rootContainer.style.zIndex = '2';
      rootContainer.style.pointerEvents = 'all';

      const frameContainer = document.createElement('div');
      frameContainer.id = 'authentication-frame-container';
      frameContainer.style.backgroundColor = '#FFFFFF';
      frameContainer.style.position = 'absolute';
      frameContainer.style.top = '16px';
      frameContainer.style.bottom = '16px';
      frameContainer.style.left = '16px';
      frameContainer.style.right = '16px';
      frameContainer.style.borderRadius = '8px';
      frameContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      frameContainer.style.padding = '16px';

      const _closeContainer: HTMLDivElement = document.createElement('div');
      _closeContainer.style.cursor = 'pointer';
      _closeContainer.style.display = 'flex';
      _closeContainer.style.justifyContent = 'right';
      _closeContainer.style.alignItems = 'center';
      _closeContainer.style.zIndex = '3';
      addTouchAndClickEventListeners(
        _closeContainer,
        onCloseAuthenticationContainer
      );

      const _close = document.createElement('img');
      _close.setAttribute('width', '15px');
      _close.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODUzNTUgMC4xNDY0NDdDOC4wNDg4MiAwLjM0MTcwOSA4LjA0ODgyIDAuNjU4MjkxIDcuODUzNTUgMC44NTM1NTNMMC44NTM1NTMgNy44NTM1NUMwLjY1ODI5MSA4LjA0ODgyIDAuMzQxNzA5IDguMDQ4ODIgMC4xNDY0NDcgNy44NTM1NUMtMC4wNDg4MTU1IDcuNjU4MjkgLTAuMDQ4ODE1NSA3LjM0MTcxIDAuMTQ2NDQ3IDcuMTQ2NDVMNy4xNDY0NSAwLjE0NjQ0N0M3LjM0MTcxIC0wLjA0ODgxNTUgNy42NTgyOSAtMC4wNDg4MTU1IDcuODUzNTUgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMC4xNDY0NDcgMC4xNDY0NDdDMC4zNDE3MDkgLTAuMDQ4ODE1NSAwLjY1ODI5MSAtMC4wNDg4MTU1IDAuODUzNTUzIDAuMTQ2NDQ3TDcuODUzNTUgNy4xNDY0NUM4LjA0ODgyIDcuMzQxNzEgOC4wNDg4MiA3LjY1ODI5IDcuODUzNTUgNy44NTM1NUM3LjY1ODI5IDguMDQ4ODIgNy4zNDE3MSA4LjA0ODgyIDcuMTQ2NDUgNy44NTM1NUwwLjE0NjQ0NyAwLjg1MzU1M0MtMC4wNDg4MTU1IDAuNjU4MjkxIC0wLjA0ODgxNTUgMC4zNDE3MDkgMC4xNDY0NDcgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+Cjwvc3ZnPgo='
      );
      _closeContainer.appendChild(_close);

      const loaderContainer: HTMLDivElement = document.createElement('div');
      loaderContainer.id = 'authentication-container-loader';
      loaderContainer.style.display = 'flex';
      loaderContainer.style.flexDirection = 'column';
      loaderContainer.style.height = '100%';
      loaderContainer.style.width = '100%';
      loaderContainer.style.justifyContent = 'center';
      loaderContainer.style.alignItems = 'center';

      const _loader = document.createElement('img');
      _loader.setAttribute('width', '28px');
      _loader.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iYW5pbWF0ZS1zcGluIC1tbC0xIG1yLTMgaC01IHctNSB0ZXh0LXdoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CjxjaXJjbGUgb3BhY2l0eT0nMC4yNScgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI0Ij48L2NpcmNsZT4KPHBhdGggb3BhY2l0eT0nMC43NScgZmlsbD0iY3VycmVudENvbG9yIiBkPSJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3oiPjwvcGF0aD4KPC9zdmc+'
      );
      _loader.style.marginTop = '50px';
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

      loaderContainer.appendChild(_loader);

      const iframeContainer: HTMLDivElement = document.createElement('div');
      iframeContainer.style.display = 'flex';
      iframeContainer.style.flexDirection = 'column';
      iframeContainer.style.height = '100%';
      iframeContainer.style.width = '100%';
      iframeContainer.style.justifyContent = 'stretch';
      iframeContainer.style.alignItems = 'stretch';
      iframeContainer.style.display = 'none';

      frameContainer.appendChild(_closeContainer);
      frameContainer.appendChild(loaderContainer);
      frameContainer.appendChild(iframeContainer);
      rootContainer.appendChild(frameContainer);

      return { rootContainer, loaderContainer, iframeContainer };
    };

    export const displayIframeInsideAuthenticationContainer = (
      iframeContainer: HTMLDivElement,
      loaderContainer: HTMLDivElement,
      textContainer: HTMLDivElement,
      url: string
    ) => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute(
        'sandbox',
        'allow-forms allow-modals allow-orientation-lock allow-popups allow-same-origin allow-scripts'
      );
      iframe.addEventListener('load', () => {
        iframeContainer.style.display = 'flex';
        loaderContainer.style.display = 'none';
      });
      iframe.addEventListener('loaderror', () => {
        addAuthenticationUrlToTextsContainer(() => {
          // Try again.
          iframeContainer.removeChild(iframe);
          iframeContainer.style.display = 'none';
          loaderContainer.style.display = 'flex';
          displayIframeInsideAuthenticationContainer(
            iframeContainer,
            loaderContainer,
            textContainer,
            url
          );
        }, textContainer);
      });
      iframe.src = url;
      iframe.style.flex = '1';
      iframe.style.border = '0';

      iframeContainer.appendChild(iframe);
    };

    /**
     * Helper to add the texts to the authentication container
     * based on the platform or if the game is registered.
     */
    export const addAuthenticationTextsToLoadingContainer = (
      loaderContainer: HTMLDivElement,
      platform,
      isGameRegistered,
      wikiOpenAction
    ) => {
      const textContainer: HTMLDivElement = document.createElement('div');
      textContainer.id = 'authentication-container-texts';
      textContainer.style.display = 'flex';
      textContainer.style.flexDirection = 'column';
      textContainer.style.width = '100%';
      textContainer.style.justifyContent = 'center';
      textContainer.style.alignItems = 'center';
      textContainer.style.position = 'relative';
      textContainer.style.zIndex = '3';
      textContainer.style.fontSize = '11pt';
      textContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

      const messages = getPlayerLoginMessages({
        platform,
        isGameRegistered,
      });
      const title = document.createElement('h1');
      title.innerText = messages.title;
      title.style.fontSize = '20pt';
      title.style.fontWeight = 'bold';
      const text1 = document.createElement('p');
      text1.innerText = messages.text1;
      const text2 = document.createElement('p');
      text2.innerText = messages.text2;
      textContainer.appendChild(title);
      textContainer.appendChild(text1);
      textContainer.appendChild(text2);

      if (!isGameRegistered) {
        // Remove the loader and add the wiki link.
        loaderContainer.innerHTML = '';

        if (wikiOpenAction) {
          const link = document.createElement('a');
          addTouchAndClickEventListeners(link, wikiOpenAction);
          link.innerText = 'How to publish my game';
          link.style.color = '#0078d4';
          link.style.textDecoration = 'none';
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';

          textContainer.appendChild(link);
        }
      }

      loaderContainer.prepend(textContainer);

      return textContainer;
    };

    /**
     * Helper to add the authentication link in case the window hasn't opened properly.
     * Useful for Electron & Web platforms.
     */
    export const addAuthenticationUrlToTextsContainer = (
      onClick: () => void,
      textContainer: HTMLDivElement
    ) => {
      const link = document.createElement('a');
      addTouchAndClickEventListeners(link, onClick);
      link.innerText = 'Try again';
      link.style.color = '#0078d4';
      link.style.textDecoration = 'none';
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';

      textContainer.appendChild(link);
    };

    /**
     * Creates a DOM element to display a dismissable banner.
     */
    export const computeDismissableBanner = function (
      onDismissBanner: () => void
    ): HTMLDivElement {
      const divContainer = document.createElement('div');

      divContainer.id = 'authenticated-banner';
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
      addTouchAndClickEventListeners(_closeContainer, onDismissBanner);

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
     * Creates a DOM element representing a banner for the user to know which account
     * they're using and also to allow switching to another account.
     */
    export const computeAuthenticatedBanner = function (
      onOpenAuthenticationWindow: () => void,
      onDismissBanner: () => void,
      username: string | null
    ): HTMLDivElement {
      const divContainer = computeDismissableBanner(onDismissBanner);

      const playerUsername = username || 'Anonymous';

      const _textContainer: HTMLDivElement = document.createElement('div');
      const loggedText = document.createElement('p');
      loggedText.id = 'loggedText';
      loggedText.innerHTML = `<img style="margin-right:4px" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgOSA5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC4xNjY2NyAwQzEuODY2NjcgMCAwIDEuODY2NjcgMCA0LjE2NjY3QzAgNi40NjY2NyAxLjg2NjY3IDguMzMzMzMgNC4xNjY2NyA4LjMzMzMzQzYuNDY2NjcgOC4zMzMzMyA4LjMzMzMzIDYuNDY2NjcgOC4zMzMzMyA0LjE2NjY3QzguMzMzMzMgMS44NjY2NyA2LjQ2NjY3IDAgNC4xNjY2NyAwWk0zLjMzMzMzIDYuMjVMMS4yNSA0LjE2NjY3TDEuODM3NSAzLjU3OTE3TDMuMzMzMzMgNS4wNzA4M0w2LjQ5NTgzIDEuOTA4MzNMNy4wODMzMyAyLjVMMy4zMzMzMyA2LjI1WiIgZmlsbD0iIzAwQ0M4MyIvPgo8L3N2Zz4K" />
                                Logged as ${playerUsername}`;
      loggedText.style.margin = '0px';

      const changeAccountText = document.createElement('p');
      changeAccountText.id = 'changeAccountText';
      changeAccountText.innerText = `Click here to switch to another account.`;
      changeAccountText.style.margin = '0px';
      changeAccountText.style.marginTop = '4px';
      changeAccountText.style.textDecoration = 'underline';
      changeAccountText.style.cursor = 'pointer';
      addTouchAndClickEventListeners(
        changeAccountText,
        onOpenAuthenticationWindow
      );

      _textContainer.appendChild(loggedText);
      _textContainer.appendChild(changeAccountText);
      divContainer.appendChild(_textContainer);

      return divContainer;
    };

    /**
     * Creates a DOM element representing a banner for the user to know
     * they are not connected and to allow logging in.
     */
    export const computeNotAuthenticatedBanner = function (
      onOpenAuthenticationWindow: () => void,
      onDismissBanner: () => void
    ): HTMLDivElement {
      const divContainer = computeDismissableBanner(onDismissBanner);

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
      addTouchAndClickEventListeners(
        changeAccountText,
        onOpenAuthenticationWindow
      );

      _textContainer.appendChild(loggedText);
      _textContainer.appendChild(changeAccountText);
      divContainer.appendChild(_textContainer);

      return divContainer;
    };

    /**
     * Create, display, and hide the logged in confirmation.
     */
    export const displayLoggedInNotification = function (
      domContainer: HTMLDivElement,
      username: string
    ) {
      showNotification(
        domContainer,
        'authenticated-notification',
        `<img style="margin-right:4px" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgOSA5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC4xNjY2NyAwQzEuODY2NjcgMCAwIDEuODY2NjcgMCA0LjE2NjY3QzAgNi40NjY2NyAxLjg2NjY3IDguMzMzMzMgNC4xNjY2NyA4LjMzMzMzQzYuNDY2NjcgOC4zMzMzMyA4LjMzMzMzIDYuNDY2NjcgOC4zMzMzMyA0LjE2NjY3QzguMzMzMzMgMS44NjY2NyA2LjQ2NjY3IDAgNC4xNjY2NyAwWk0zLjMzMzMzIDYuMjVMMS4yNSA0LjE2NjY3TDEuODM3NSAzLjU3OTE3TDMuMzMzMzMgNS4wNzA4M0w2LjQ5NTgzIDEuOTA4MzNMNy4wODMzMyAyLjVMMy4zMzMzMyA2LjI1WiIgZmlsbD0iIzAwQ0M4MyIvPgo8L3N2Zz4K" />
              Logged as ${username}`,
        'success'
      );
    };

    /**
     * Create, display, and hide the logged in confirmation.
     */
    export const displayLoggedOutNotification = function (
      domContainer: HTMLDivElement
    ) {
      showNotification(
        domContainer,
        'authenticated-notification',
        `<img style="margin-right:4px" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgOSA5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC4xNjY2NyAwQzEuODY2NjcgMCAwIDEuODY2NjcgMCA0LjE2NjY3QzAgNi40NjY2NyAxLjg2NjY3IDguMzMzMzMgNC4xNjY2NyA4LjMzMzMzQzYuNDY2NjcgOC4zMzMzMyA4LjMzMzMzIDYuNDY2NjcgOC4zMzMzMyA0LjE2NjY3QzguMzMzMzMgMS44NjY2NyA2LjQ2NjY3IDAgNC4xNjY2NyAwWk0zLjMzMzMzIDYuMjVMMS4yNSA0LjE2NjY3TDEuODM3NSAzLjU3OTE3TDMuMzMzMzMgNS4wNzA4M0w2LjQ5NTgzIDEuOTA4MzNMNy4wODMzMyAyLjVMMy4zMzMzMyA2LjI1WiIgZmlsbD0iIzAwQ0M4MyIvPgo8L3N2Zz4K" />
              Logged out`,
        'success'
      );
    };

    /**
     * Create, display, and hide an error notification.
     */
    export const displayErrorNotification = function (
      domContainer: HTMLDivElement
    ) {
      showNotification(
        domContainer,
        'error-notification',
        'An error occurred while authenticating, please try again.',
        'error'
      );
    };

    /**
     * Helper to show a notification to the user, that disappears automatically.
     */
    export const showNotification = function (
      domContainer: HTMLDivElement,
      id: string,
      content: string,
      type: 'success' | 'error'
    ) {
      const divContainer = document.createElement('div');

      divContainer.id = id;
      divContainer.style.position = 'absolute';
      divContainer.style.pointerEvents = 'all';
      divContainer.style.backgroundColor =
        type === 'success' ? '#0E062D' : 'red';
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
      loggedText.innerHTML = content;
      loggedText.style.margin = '0px';

      divContainer.appendChild(loggedText);

      domContainer.appendChild(divContainer);
      const animationTime = 700;
      const notificationTime = 5000;
      setTimeout(() => {
        try {
          divContainer.animate(
            [
              { transform: 'translateY(0px)', opacity: 1 },
              { transform: 'translateY(-30px)', opacity: 0 },
            ],
            {
              duration: animationTime,
              easing: 'ease-in',
            }
          );
        } catch {
          logger.warn('Animation not supported, div will be fixed.');
        }
      }, notificationTime);
      // Use timeout because onanimationend listener does not work.
      setTimeout(() => {
        divContainer.remove();
      }, notificationTime + animationTime);
    };

    /**
     * Helper to add event listeners on a pressable/clickable element
     * to work on both desktop and mobile.
     */
    const addTouchAndClickEventListeners = function (
      element: HTMLElement,
      action: () => void
    ) {
      // Touch start event listener for mobile.
      element.addEventListener('touchstart', (event) => {
        action();
      });
      // Click event listener for desktop.
      element.addEventListener('click', (event) => {
        action();
      });
    };
  }
}
