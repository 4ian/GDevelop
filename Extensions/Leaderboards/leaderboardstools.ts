namespace gdjs {
  const logger = new gdjs.Logger('Leaderboards');
  export namespace evtTools {
    export namespace leaderboards {
      // Score saving
      let _scoreLastSavedAt: number | null = null;
      let _lastSavedScore: number;
      let _lastSavedPlayerName: string;
      let _lastSaveError: string;
      let _isScoreSaving: boolean = false;
      let _hasScoreBeenSaved: boolean = false;
      let _hasScoreSavingErrored: boolean = false;

      // Leaderboard display
      let _requestedLeaderboardId: string | null;
      let _leaderboardViewIframe: HTMLIFrameElement | null = null;
      let _leaderboardViewIframeErrored: boolean = false;
      let _leaderboardViewIframeLoading: boolean = false;
      let _leaderboardViewIframeLoaded: boolean = false;
      let _errorTimeoutId: NodeJS.Timeout | null = null;
      let _leaderboardViewClosingCallback:
        | ((event: MessageEvent) => void)
        | null = null;

      const _loaderContainer: HTMLDivElement = document.createElement('div');
      _loaderContainer.style.backgroundColor = '#000000';
      _loaderContainer.style.display = 'flex';
      _loaderContainer.style.height = '100%';
      _loaderContainer.style.width = '100%';
      _loaderContainer.style.justifyContent = 'center';
      _loaderContainer.style.alignItems = 'center';
      const _loader = document.createElement('img');
      _loader.setAttribute('width', '50px');
      _loader.setAttribute(
        'src',
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CjxjaXJjbGUgb3BhY2l0eT0nMC4yNScgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCI+PC9jaXJjbGU+CjxwYXRoIG9wYWNpdHk9JzAuNzUnIGZpbGw9IiNGRkZGRkYiIGQ9Ik00IDEyYTggOCAwIDAxOC04VjBDNS4zNzMgMCAwIDUuMzczIDAgMTJoNHptMiA1LjI5MUE3Ljk2MiA3Ljk2MiAwIDAxNCAxMkgwYzAgMy4wNDIgMS4xMzUgNS44MjQgMyA3LjkzOGwzLTIuNjQ3eiI+PC9wYXRoPgo8L3N2Zz4='
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

      export const savePlayerScore = function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float,
        playerName: string,
        responseVar: gdjs.Variable,
        errorVar: gdjs.Variable
      ) {
        _isScoreSaving = true;
        _hasScoreBeenSaved = false;
        _hasScoreSavingErrored = false;
        errorVar.setString('');
        responseVar.setString('');

        if (_lastSavedPlayerName === playerName && _lastSavedScore === score) {
          logger.warn(
            'The player and score to be sent are the same as previous one. Ignoring this one.'
          );
          _lastSaveError = 'SAME_AS_PREVIOUS';
          _isScoreSaving = false;
          _hasScoreSavingErrored = true;
          errorVar.setString(_lastSaveError);
          return;
        }

        if (!!_scoreLastSavedAt && Date.now() - _scoreLastSavedAt < 500) {
          _scoreLastSavedAt = Date.now();
          logger.warn(
            'Last entry was sent too little time ago. Ignoring this one.'
          );
          _lastSaveError = 'TOO_FAST';
          _isScoreSaving = false;
          _hasScoreSavingErrored = true;
          errorVar.setString(_lastSaveError);
          return;
        }

        const baseUrl = 'https://api.gdevelop-app.com/play';
        const game = runtimeScene.getGame();
        const formattedPlayerName = formatPlayerName(playerName);
        const sessionId = game.getSessionId();
        const playerId = game.getPlayerId();
        const location =
          typeof window !== 'undefined' && (window as any).location
            ? (window as any).location.href
            : '';
        fetch(
          `${baseUrl}/game/${gdjs.projectData.properties.projectUuid}/leaderboard/${leaderboardId}/entry`,
          {
            body: JSON.stringify({
              playerName: formattedPlayerName,
              score: score,
              sessionId: sessionId,
              clientPlayerId: playerId,
              location: location,
            }),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        ).then(
          (response) => {
            _scoreLastSavedAt = Date.now();

            if (!response.ok) {
              _lastSaveError = response.status.toString();
              logger.error(
                'Server responded with an error:',
                _lastSaveError,
                response.statusText
              );
              _isScoreSaving = false;
              _hasScoreSavingErrored = true;
              errorVar.setString(_lastSaveError);
              return;
            }

            _lastSavedScore = score;
            _lastSavedPlayerName = playerName;
            _isScoreSaving = false;
            _hasScoreBeenSaved = true;

            response.text().then(
              (text) => {
                responseVar.setString(text);
              },
              (error) => {
                logger.warn(
                  'An error occurred when reading response but score has been saved:',
                  error
                );
                responseVar.setString('CANNOT_READ_RESPONSE');
              }
            );
          },
          (error) => {
            logger.error('Error while submitting a leaderboard score:', error);
            _isScoreSaving = false;
            _hasScoreSavingErrored = true;
            errorVar.setString('REQUEST_NOT_SENT');
          }
        );
      };

      export const isSaving = function (): boolean {
        return _isScoreSaving;
      };
      export const hasBeenSaved = function (): boolean {
        return _hasScoreBeenSaved;
      };
      export const hasSavingErrored = function (): boolean {
        return _hasScoreSavingErrored;
      };

      export const getLastSaveError = function (): string {
        return _lastSaveError;
      };

      export const formatPlayerName = function (rawName: string): string {
        if (
          !rawName ||
          typeof rawName !== 'string' ||
          (typeof rawName === 'string' && rawName.length === 0)
        ) {
          return `Player${Math.round(
            (Math.random() * 9 + 1) * 10000 // Number between 10,000 and 99,999
          )}`;
        }
        return rawName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s/g, '_')
          .replace(/[^\w|-]/g, '')
          .slice(0, 30);
      };

      const checkLeaderboardAvailability = function (
        url: string
      ): Promise<boolean> {
        return fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(
          (response) => {
            if (!response.ok) {
              logger.error(
                `Error while fetching leaderboard view, server returned: ${response.status} ${response.statusText}`
              );
              return false;
            }
            return true;
          },
          (err) => {
            logger.error('Error while fetching leaderboard view:', err);
            return false;
          }
        );
      };

      const receiveMessageFromLeaderboardView = function (
        runtimeScene: gdjs.RuntimeScene,
        displayLoader: boolean,
        event: MessageEvent
      ) {
        switch (event.data) {
          case 'closeLeaderboardView':
            closeLeaderboardView(runtimeScene);
            break;
          case 'leaderboardViewLoaded':
            if (displayLoader) {
              if (_errorTimeoutId) clearTimeout(_errorTimeoutId);
              displayLoaderInLeaderboardView(false, runtimeScene, {
                callOnErrorIfDomElementContainerMissing: false,
              });
            }
            if (!_leaderboardViewIframe) {
              handleErrorDisplayingLeaderboard(
                runtimeScene,
                "The leaderboard view couldn't be found. Doing nothing."
              );
              return;
            }
            _leaderboardViewIframe.style.opacity = '1';
            _leaderboardViewIframeLoaded = true;
            _leaderboardViewIframeLoading = false;

            break;
        }
      };

      const handleErrorDisplayingLeaderboard = function (
        runtimeScene: gdjs.RuntimeScene,
        message: string
      ) {
        logger.error(message);
        _leaderboardViewIframeErrored = true;
        _leaderboardViewIframeLoading = false;
        closeLeaderboardView(runtimeScene);
      };

      const resetLeaderboardDisplayErrorTimeout = (
        runtimeScene: gdjs.RuntimeScene
      ) => {
        if (_errorTimeoutId) clearTimeout(_errorTimeoutId);
        _errorTimeoutId = setTimeout(() => {
          if (!_leaderboardViewIframeLoaded) {
            handleErrorDisplayingLeaderboard(
              runtimeScene,
              'Leaderboard page did not send message in time. Closing leaderboard view.'
            );
          }
        }, 5000);
      };

      const displayLoaderInLeaderboardView = function (
        yesOrNo: boolean,
        runtimeScene: gdjs.RuntimeScene,
        options: { callOnErrorIfDomElementContainerMissing: boolean }
      ): boolean {
        const domElementContainer = runtimeScene
          .getGame()
          .getRenderer()
          .getDomElementContainer();
        if (!domElementContainer) {
          if (options.callOnErrorIfDomElementContainerMissing) {
            handleErrorDisplayingLeaderboard(
              runtimeScene,
              "The div element covering the game couldn't be found, the leaderboard cannot be displayed."
            );
          }
          return false;
        }
        if (yesOrNo) {
          if (
            domElementContainer.children &&
            domElementContainer.children.length > 0
          ) {
            domElementContainer.insertBefore(
              _loaderContainer,
              domElementContainer.children[0]
            );
          } else {
            domElementContainer.appendChild(_loaderContainer);
          }
          if (_leaderboardViewIframe) {
            _leaderboardViewIframe.style.opacity = '0';
          }
        } else {
          try {
            domElementContainer.removeChild(_loaderContainer);
            if (_leaderboardViewIframe) {
              _leaderboardViewIframe.style.opacity = '1';
            }
          } catch {}
        }
        return true;
      };

      const computeLeaderboardDisplayingIframe = function (
        url: string
      ): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        iframe.src = url;
        iframe.id = 'leaderboard-view';
        iframe.style.position = 'absolute';
        // To trigger iframe loading and be able to listen to its events, use `opacity: 0` instead of `visibility: hidden` or `display: none`
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'all';
        iframe.style.backgroundColor = '#FFFFFF';
        iframe.style.top = '0px';
        iframe.style.height = '100%';
        iframe.style.left = '0px';
        iframe.style.width = '100%';
        iframe.style.border = 'none';

        return iframe;
      };

      export const displayLeaderboard = function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        displayLoader: boolean
      ) {
        _requestedLeaderboardId = leaderboardId;
        _leaderboardViewIframeErrored = false;
        _leaderboardViewIframeLoaded = false;
        _leaderboardViewIframeLoading = true;
        if (displayLoader) {
          displayLoaderInLeaderboardView(true, runtimeScene, {
            callOnErrorIfDomElementContainerMissing: true,
          });
        }
        const gameId = gdjs.projectData.properties.projectUuid;
        const targetUrl = `https://liluo.io/games/${gameId}/leaderboard/${leaderboardId}?inGameEmbedded=true`;
        checkLeaderboardAvailability(targetUrl).then(
          (isAvailable) => {
            if (leaderboardId !== _requestedLeaderboardId) {
              logger.warn(
                `Received a response for leaderboard ${leaderboardId} though the last leaderboard requested is ${_requestedLeaderboardId}, ignoring this response.`
              );
              return;
            }
            if (!isAvailable) {
              handleErrorDisplayingLeaderboard(
                runtimeScene,
                'Leaderboard data could not be fetched. Closing leaderboard view if there is one.'
              );
              return;
            }

            if (_leaderboardViewIframe) {
              resetLeaderboardDisplayErrorTimeout(runtimeScene);
              if (displayLoader) {
                displayLoaderInLeaderboardView(true, runtimeScene, {
                  callOnErrorIfDomElementContainerMissing: false,
                });
              }
              _leaderboardViewIframe.src = targetUrl;
            } else {
              const domElementContainer = runtimeScene
                .getGame()
                .getRenderer()
                .getDomElementContainer();
              if (!domElementContainer) {
                handleErrorDisplayingLeaderboard(
                  runtimeScene,
                  "The div element covering the game couldn't be found, the leaderboard cannot be displayed."
                );
                return;
              }

              resetLeaderboardDisplayErrorTimeout(runtimeScene);

              _leaderboardViewIframe =
                computeLeaderboardDisplayingIframe(targetUrl);
              if (typeof window !== 'undefined') {
                _leaderboardViewClosingCallback = (event: MessageEvent) => {
                  receiveMessageFromLeaderboardView(
                    runtimeScene,
                    displayLoader,
                    event
                  );
                };
                (window as any).addEventListener(
                  'message',
                  _leaderboardViewClosingCallback,
                  true
                );
              }
              domElementContainer.appendChild(_leaderboardViewIframe);
            }
          },
          (err) => {
            logger.error(err);
            handleErrorDisplayingLeaderboard(
              runtimeScene,
              'An error occurred when fetching leaderboard data. Closing leaderboard view if there is one.'
            );
            return;
          }
        );
      };

      export const isLeaderboardViewErrored = function (): boolean {
        return _leaderboardViewIframeErrored;
      };

      export const isLeaderboardViewLoaded = function (): boolean {
        return _leaderboardViewIframeLoaded;
      };

      export const isLeaderboardViewLoading = function (): boolean {
        return _leaderboardViewIframeLoading;
      };

      export const closeLeaderboardView = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        try {
          displayLoaderInLeaderboardView(false, runtimeScene, {
            callOnErrorIfDomElementContainerMissing: false,
          });

          if (!_leaderboardViewIframe) {
            logger.info(
              "The iframe displaying the current leaderboard couldn't be found, the leaderboard must be already closed."
            );
            return;
          }
          const domElementContainer = runtimeScene
            .getGame()
            .getRenderer()
            .getDomElementContainer();
          if (!domElementContainer) {
            logger.info(
              "The div element covering the game couldn't be found, the leaderboard must be already closed."
            );
            return;
          }

          if (typeof window !== 'undefined') {
            (window as any).removeEventListener(
              'message',
              _leaderboardViewClosingCallback,
              true
            );
            _leaderboardViewClosingCallback = null;
          }
          domElementContainer.removeChild(_leaderboardViewIframe);
          _leaderboardViewIframe = null;
        } finally {
          const gameCanvas = runtimeScene.getGame().getRenderer().getCanvas();
          if (gameCanvas) gameCanvas.focus();
        }
      };
    }
  }
}
