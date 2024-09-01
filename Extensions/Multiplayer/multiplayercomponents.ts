namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');
  export namespace multiplayerComponents {
    const lobbiesRootContainerId = 'lobbies-root-container';
    const lobbiesFrameContainerId = 'lobbies-frame-container';
    const lobbiesCloseContainerId = 'lobbies-close-container';
    const lobbiesLoaderContainerId = 'lobbies-loader-container';
    const lobbiesTextsContainerId = 'lobbies-texts-container';
    const lobbiesIframeContainerId = 'lobbies-iframe-container';
    const lobbiesIframeId = 'lobbies-iframe';

    let canLobbyBeClosed = true;

    const notificationContainerIds: string[] = [];

    export const getDomElementContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      // Find the DOM element container.
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        logger.error('No DOM element container found.');
        return null;
      }
      return domElementContainer;
    };

    export const getLobbiesRootContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }
      // Find the root container with its ID.
      const lobbiesRootContainer = domElementContainer.querySelector(
        `#${lobbiesRootContainerId}`
      ) as HTMLDivElement | null;
      return lobbiesRootContainer;
    };

    export const getLobbiesLoaderContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }

      // Find the loader container with its ID.
      const lobbiesLoaderContainer = domElementContainer.querySelector(
        `#${lobbiesLoaderContainerId}`
      ) as HTMLDivElement | null;
      return lobbiesLoaderContainer;
    };

    export const getLobbiesIframeContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }

      // Find the iframe container with its ID.
      const lobbiesIframeContainer = domElementContainer.querySelector(
        `#${lobbiesIframeContainerId}`
      ) as HTMLDivElement | null;
      return lobbiesIframeContainer;
    };

    export const getLobbiesCloseContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }

      // Find the close container with its ID.
      const lobbiesCloseContainer = domElementContainer.querySelector(
        `#${lobbiesCloseContainerId}`
      ) as HTMLDivElement | null;
      return lobbiesCloseContainer;
    };

    export const getLobbiesTextsContainer = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLDivElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }

      // Find the text container with its ID.
      const lobbiesTextContainer = domElementContainer.querySelector(
        `#${lobbiesTextsContainerId}`
      ) as HTMLDivElement | null;
      return lobbiesTextContainer;
    };

    export const getLobbiesIframe = (
      runtimeScene: gdjs.RuntimeScene
    ): HTMLIFrameElement | null => {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return null;
      }

      // Find the iframe with its ID.
      const lobbiesIframe = domElementContainer.querySelector(
        `#${lobbiesIframeId}`
      ) as HTMLIFrameElement | null;
      return lobbiesIframe;
    };

    /**
     * Creates a DOM element that will contain the loader or a message if the game is not registered,
     * and adds it to the dom container.
     */
    export const displayLobbies = function (
      runtimeScene: gdjs.RuntimeScene,
      onCloseLobbiesContainer: () => void
    ) {
      const domElementContainer = getDomElementContainer(runtimeScene);
      if (!domElementContainer) {
        return;
      }

      const rootContainer = document.createElement('div');
      rootContainer.id = lobbiesRootContainerId;
      rootContainer.style.position = 'relative';
      rootContainer.style.backgroundColor = 'rgba(14, 6, 45, 0.5)';
      rootContainer.style.opacity = '1';
      rootContainer.style.width = '100%';
      rootContainer.style.height = '100%';
      rootContainer.style.zIndex = '2';
      rootContainer.style.pointerEvents = 'all';

      const frameContainer = document.createElement('div');
      frameContainer.id = lobbiesFrameContainerId;
      frameContainer.style.backgroundColor = '#FFFFFF';
      frameContainer.style.position = 'absolute';
      frameContainer.style.top = '16px';
      frameContainer.style.bottom = '16px';
      frameContainer.style.left = '16px';
      frameContainer.style.right = '16px';
      frameContainer.style.borderRadius = '8px';
      frameContainer.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
      frameContainer.style.overflow = 'hidden';

      const _closeContainer: HTMLDivElement = document.createElement('div');
      _closeContainer.id = lobbiesCloseContainerId;
      _closeContainer.style.cursor = 'pointer';
      _closeContainer.style.display = 'flex';
      _closeContainer.style.justifyContent = 'right';
      _closeContainer.style.alignItems = 'center';
      _closeContainer.style.zIndex = '3';
      _closeContainer.style.position = 'absolute';
      _closeContainer.style.top = '32px';
      _closeContainer.style.right = '32px';
      addTouchAndClickEventListeners(_closeContainer, onCloseLobbiesContainer);

      const _close = document.createElement('img');
      _close.setAttribute('width', '15px');
      _close.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuODUzNTUgMC4xNDY0NDdDOC4wNDg4MiAwLjM0MTcwOSA4LjA0ODgyIDAuNjU4MjkxIDcuODUzNTUgMC44NTM1NTNMMC44NTM1NTMgNy44NTM1NUMwLjY1ODI5MSA4LjA0ODgyIDAuMzQxNzA5IDguMDQ4ODIgMC4xNDY0NDcgNy44NTM1NUMtMC4wNDg4MTU1IDcuNjU4MjkgLTAuMDQ4ODE1NSA3LjM0MTcxIDAuMTQ2NDQ3IDcuMTQ2NDVMNy4xNDY0NSAwLjE0NjQ0N0M3LjM0MTcxIC0wLjA0ODgxNTUgNy42NTgyOSAtMC4wNDg4MTU1IDcuODUzNTUgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMC4xNDY0NDcgMC4xNDY0NDdDMC4zNDE3MDkgLTAuMDQ4ODE1NSAwLjY1ODI5MSAtMC4wNDg4MTU1IDAuODUzNTUzIDAuMTQ2NDQ3TDcuODUzNTUgNy4xNDY0NUM4LjA0ODgyIDcuMzQxNzEgOC4wNDg4MiA3LjY1ODI5IDcuODUzNTUgNy44NTM1NUM3LjY1ODI5IDguMDQ4ODIgNy4zNDE3MSA4LjA0ODgyIDcuMTQ2NDUgNy44NTM1NUwwLjE0NjQ0NyAwLjg1MzU1M0MtMC4wNDg4MTU1IDAuNjU4MjkxIC0wLjA0ODgxNTUgMC4zNDE3MDkgMC4xNDY0NDcgMC4xNDY0NDdaIiBmaWxsPSIjMUQxRDI2Ii8+Cjwvc3ZnPgo='
      );
      _closeContainer.appendChild(_close);

      if (!canLobbyBeClosed) {
        _closeContainer.style.visibility = 'hidden';
      }

      const loaderContainer: HTMLDivElement = document.createElement('div');
      loaderContainer.id = lobbiesLoaderContainerId;
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
      iframeContainer.id = lobbiesIframeContainerId;
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

      // Display the lobbies window right away, to show a loader
      // while the call for game registration is happening.
      domElementContainer.appendChild(rootContainer);
    };

    export const displayIframeInsideLobbiesContainer = (
      runtimeScene: gdjs.RuntimeScene,
      url: string
    ) => {
      const iframeContainer = getLobbiesIframeContainer(runtimeScene);
      const loaderContainer = getLobbiesLoaderContainer(runtimeScene);
      const textsContainer = getLobbiesTextsContainer(runtimeScene);

      if (!iframeContainer || !loaderContainer || !textsContainer) {
        logger.error('Lobbies containers not found.');
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.id = lobbiesIframeId;

      iframe.setAttribute(
        'sandbox',
        'allow-forms allow-modals allow-orientation-lock allow-popups allow-same-origin allow-scripts'
      );
      iframe.addEventListener('load', () => {
        iframeContainer.style.display = 'flex';
        loaderContainer.style.display = 'none';
      });
      iframe.addEventListener('loaderror', () => {
        addReloadUrlToTextsContainer(() => {
          // Try again.
          iframeContainer.removeChild(iframe);
          iframeContainer.style.display = 'none';
          loaderContainer.style.display = 'flex';
          displayIframeInsideLobbiesContainer(runtimeScene, url);
        }, textsContainer);
      });
      iframe.src = url;
      iframe.style.flex = '1';
      iframe.style.border = '0';

      iframeContainer.appendChild(iframe);
    };

    /**
     * Helper to add the texts to the container
     * especially if the game is not registered.
     */
    export const addTextsToLoadingContainer = (
      runtimeScene: gdjs.RuntimeScene,
      isGameRegistered: boolean,
      wikiOpenAction: () => void
    ) => {
      const loaderContainer = getLobbiesLoaderContainer(runtimeScene);
      if (!loaderContainer) {
        logger.error('Loader container not found.');
        return;
      }

      const textsContainer: HTMLDivElement = document.createElement('div');
      textsContainer.id = lobbiesTextsContainerId;
      textsContainer.style.display = 'flex';
      textsContainer.style.flexDirection = 'column';
      textsContainer.style.width = '100%';
      textsContainer.style.justifyContent = 'center';
      textsContainer.style.alignItems = 'center';
      textsContainer.style.position = 'relative';
      textsContainer.style.zIndex = '3';
      textsContainer.style.fontSize = '11pt';
      textsContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

      if (!isGameRegistered) {
        const title = document.createElement('h1');
        title.innerText = 'Publish your game!';
        title.style.fontSize = '20pt';
        title.style.fontWeight = 'bold';
        const text1 = document.createElement('p');
        text1.innerText =
          "GDevelop's lobbies are only available for published games.";
        const text2 = document.createElement('p');
        text2.innerText =
          'Click the button below to learn how to publish your game then try again.';
        textsContainer.appendChild(title);
        textsContainer.appendChild(text1);
        textsContainer.appendChild(text2);

        // Remove the loader and add the wiki link.
        loaderContainer.innerHTML = '';

        const link = document.createElement('a');
        addTouchAndClickEventListeners(link, wikiOpenAction);
        link.innerText = 'How to publish my game';
        link.style.color = '#0078d4';
        link.style.textDecoration = 'none';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';

        textsContainer.appendChild(link);
      }

      loaderContainer.prepend(textsContainer);
    };

    /**
     * Helper to add a reload link in case the window hasn't opened properly.
     */
    export const addReloadUrlToTextsContainer = (
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
     * Hides the lobbies container.
     */
    export const removeLobbiesContainer = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      const rootContainer = getLobbiesRootContainer(runtimeScene);
      if (!rootContainer) {
        return;
      }

      rootContainer.remove();
    };

    export const changeLobbiesWindowCloseActionVisibility = function (
      runtimeScene: gdjs.RuntimeScene,
      canClose: boolean
    ) {
      canLobbyBeClosed = canClose;

      const closeContainer = getLobbiesCloseContainer(runtimeScene);
      if (!closeContainer) {
        return;
      }

      closeContainer.style.visibility = canClose ? 'inherit' : 'hidden';
    };

    export const hideLobbiesCloseButtonTemporarily = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (!canLobbyBeClosed) return;

      const closeContainer = getLobbiesCloseContainer(runtimeScene);
      if (!closeContainer) {
        return;
      }

      closeContainer.style.visibility = 'hidden';

      // There is a risk a player leaves the lobby before the end of the countdown,
      // so we show the close container again after 5 seconds in case this happens,
      // to allow the player to leave the lobby.
      setTimeout(() => {
        closeContainer.style.visibility = 'inherit';
      }, 10000);
    };

    /**
     * Create, display, and hide an error notification.
     */
    export const displayErrorNotification = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      showNotification({
        runtimeScene,
        content:
          'An error occurred while displaying the game lobbies, please try again.',
        type: 'error',
      });
    };

    /**
     * Create, display, and hide a notification when a player leaves the game.
     */
    export const displayPlayerLeftNotification = function (
      runtimeScene: gdjs.RuntimeScene,
      playerName: string
    ) {
      showNotification({
        runtimeScene,
        content: `${playerName} left.`,
        type: 'warning',
      });
    };

    /**
     * Create, display, and hide a notification when a player joins the game.
     */
    export const displayPlayerJoinedNotification = function (
      runtimeScene: gdjs.RuntimeScene,
      playerName: string
    ) {
      showNotification({
        runtimeScene,
        content: `${playerName} joined.`,
        type: 'success',
      });
    };

    /**
     * Create, display, and hide a notification when an error happens on connection.
     */
    export const displayConnectionErrorNotification = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      showNotification({
        runtimeScene,
        content: 'Could not connect to other players.',
        type: 'error',
      });
    };

    /**
     * Create, display, and hide a notification when a player leaves the game.
     */
    export const displayHostMigrationNotification = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      showNotification({
        runtimeScene,
        content: `Migrating host...`,
        type: 'warning',
        id: 'migrating-host',
        persist: true,
      });
    };

    export const showHostMigrationFinishedNotification = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      removeNotificationAndShiftOthers('migrating-host');
      showNotification({
        runtimeScene,
        content: `Host migrated!`,
        type: 'success',
      });
    };

    export const showHostMigrationFailedNotification = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      removeNotificationAndShiftOthers('migrating-host');
      showNotification({
        runtimeScene,
        content: `Host migration failed.`,
        type: 'error',
      });
    };

    const removeNotificationAndShiftOthers = function (
      notificationContainerId: string
    ) {
      const notification = document.getElementById(notificationContainerId);
      if (!notification) {
        logger.warn(
          `Notification ${notificationContainerId} not found. skipping`
        );
        return;
      }
      const index = notificationContainerIds.indexOf(notificationContainerId);
      if (index !== -1) {
        notificationContainerIds.splice(index, 1);
      }
      notification.remove();

      // Shift the notifications that are below the one that was removed up.
      for (let i = index; i < notificationContainerIds.length; i++) {
        const notification = document.getElementById(
          notificationContainerIds[i]
        );
        if (!notification) {
          logger.error('Notification not found.');
          continue;
        }
        notification.style.top = `${12 + i * 32}px`;
      }
    };

    /**
     * Helper to show a notification to the user, that disappears automatically.
     */
    export const showNotification = function ({
      runtimeScene,
      content,
      type,
      id,
      persist,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      content: string;
      type: 'success' | 'warning' | 'error';
      id?: string;
      persist?: boolean;
    }) {
      // When we show a notification, we add it below the other ones.
      // We also remove the oldest one if there are too many > 5.
      if (notificationContainerIds.length > 5) {
        const oldestNotificationId = notificationContainerIds.shift();
        if (!oldestNotificationId) {
          logger.error('No oldest notification ID found.');
          return;
        }

        removeNotificationAndShiftOthers(oldestNotificationId);
      }

      // We generate a random ID for the notification, so they can stack.
      const notificationId =
        id || `notification-${Math.random().toString(36).substring(7)}`;

      const domContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domContainer) {
        logger.error('No DOM element container found.');
        return;
      }
      const divContainer = document.createElement('div');

      divContainer.id = notificationId;
      divContainer.style.position = 'absolute';
      divContainer.style.pointerEvents = 'all';
      divContainer.style.backgroundColor =
        type === 'success'
          ? '#0E062D'
          : type === 'warning'
          ? '#FFA500'
          : '#FF0000';
      // Space the notifications vertically, based on how many there are.
      divContainer.style.top = `${12 + notificationContainerIds.length * 32}px`;
      divContainer.style.right = '16px';
      divContainer.style.padding = '6px 32px 6px 6px';
      // Use zIndex 1 to make sure it is below the iframe.
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
      notificationContainerIds.push(notificationId);

      if (persist) {
        return;
      }

      const animationTime = 700;
      const notificationTime = 3000;
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
        removeNotificationAndShiftOthers(notificationId);
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
