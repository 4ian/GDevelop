/// <reference path="sha256.d.ts" />

namespace gdjs {
  const logger = new gdjs.Logger('Leaderboards');
  export namespace evtTools {
    export namespace leaderboards {
      const computeDigest = (payload: string): string => {
        const shaObj = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8' });
        shaObj.update(payload);
        return shaObj.getHash('B64');
      };

      // Score saving
      class ScoreSavingState {
        lastScoreSavingStartedAt: number | null;
        lastScoreSavingSucceededAt: number | null;
        currentlySavingScore: number | null;
        currentlySavingPlayerName: string | null;
        currentlySavingPlayerId: string | null;
        lastSavedScore: number | null;
        lastSavedPlayerName: string | null;
        lastSavedPlayerId: string | null;
        lastSaveError: string | null;
        isScoreSaving: boolean;
        hasScoreBeenSaved: boolean;
        hasScoreSavingErrored: boolean;

        constructor() {
          this.lastScoreSavingStartedAt = null;
          this.lastScoreSavingSucceededAt = null;
          this.currentlySavingScore = null;
          this.currentlySavingPlayerName = null;
          this.currentlySavingPlayerId = null;
          this.lastSavedScore = null;
          this.lastSavedPlayerName = null;
          this.lastSavedPlayerId = null;
          this.lastSaveError = null;
          this.isScoreSaving = false;
          this.hasScoreBeenSaved = false;
          this.hasScoreSavingErrored = false;
        }

        isSameAsLastScore({
          playerName,
          playerId,
          score,
        }: {
          playerName?: string;
          playerId?: string;
          score: number;
        }): boolean {
          return (
            ((!!playerName && this.lastSavedPlayerName === playerName) ||
              (!!playerId && this.lastSavedPlayerId === playerId)) &&
            this.lastSavedScore === score
          );
        }

        isAlreadySavingThisScore({
          playerName,
          playerId,
          score,
        }: {
          playerName?: string;
          playerId?: string;
          score: number;
        }): boolean {
          return (
            ((!!playerName && this.currentlySavingPlayerName === playerName) ||
              (!!playerId && this.currentlySavingPlayerId === playerId)) &&
            this.isScoreSaving &&
            this.currentlySavingScore === score
          );
        }

        isTooSoonToSaveAnotherScore(): boolean {
          return (
            !!this.lastScoreSavingStartedAt &&
            Date.now() - this.lastScoreSavingStartedAt < 500
          );
        }

        startSaving({
          playerName,
          playerId,
          score,
        }: {
          playerName?: string;
          playerId?: string;
          score: number;
        }): void {
          this.lastScoreSavingStartedAt = Date.now();
          this.isScoreSaving = true;
          this.hasScoreBeenSaved = false;
          this.hasScoreSavingErrored = false;
          this.currentlySavingScore = score;
          if (playerName) this.currentlySavingPlayerName = playerName;
          if (playerId) this.currentlySavingPlayerId = playerId;
        }

        closeSaving(): void {
          this.lastScoreSavingSucceededAt = Date.now();
          this.lastSavedScore = this.currentlySavingScore;
          this.lastSavedPlayerName = this.currentlySavingPlayerName;
          this.lastSavedPlayerId = this.currentlySavingPlayerId;
          this.isScoreSaving = false;
          this.hasScoreBeenSaved = true;
        }

        setError(errorCode: string): void {
          this.lastSaveError = errorCode;
          this.isScoreSaving = false;
          this.hasScoreBeenSaved = false;
          this.hasScoreSavingErrored = true;
        }
      }

      let _scoreSavingStateByLeaderboard: {
        [leaderboardId: string]: ScoreSavingState;
      } = {};

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
      _loaderContainer.style.position = 'relative';
      _loaderContainer.style.zIndex = '2';
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

      const getLastScoreSavingState = function ({
        hasSucceeded,
      }: {
        hasSucceeded: boolean;
      }): ScoreSavingState | null {
        const getDateField = (scoreSavingState: ScoreSavingState) =>
          hasSucceeded
            ? scoreSavingState.lastScoreSavingSucceededAt
            : scoreSavingState.lastScoreSavingStartedAt;
        const scoreSavingStates = Object.values(
          _scoreSavingStateByLeaderboard
        ).filter((scoreSavingState) => !!getDateField(scoreSavingState));
        if (scoreSavingStates.length === 0) return null;

        let lastScoreSavingState = scoreSavingStates[0];
        scoreSavingStates.forEach((scoreSavingState) => {
          const currentItemDate = getDateField(scoreSavingState);
          const lastItemDate = getDateField(lastScoreSavingState);
          if (
            currentItemDate &&
            lastItemDate &&
            currentItemDate > lastItemDate
          ) {
            lastScoreSavingState = scoreSavingState;
          }
        });
        return lastScoreSavingState;
      };

      const saveScore = function ({
        leaderboardId,
        playerName,
        authenticatedPlayerData,
        score,
        scoreSavingState,
        runtimeScene,
      }: {
        leaderboardId: string;
        playerName?: string | null;
        authenticatedPlayerData?: { playerId: string; playerToken: string };
        score: number;
        scoreSavingState: ScoreSavingState;
        runtimeScene: gdjs.RuntimeScene;
      }) {
        const rootApi = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment()
          ? 'https://api-dev.gdevelop.io'
          : 'https://api.gdevelop.io';
        const baseUrl = `${rootApi}/play`;
        const game = runtimeScene.getGame();
        const payloadObject = {
          score: score,
          sessionId: game.getSessionId(),
          clientPlayerId: game.getPlayerId(),
          location:
            typeof window !== 'undefined' && (window as any).location
              ? (window as any).location.href
              : '',
        };
        const headers = {
          'Content-Type': 'application/json',
        };
        let leaderboardEntryCreationUrl = `${baseUrl}/game/${gdjs.projectData.properties.projectUuid}/leaderboard/${leaderboardId}/entry`;
        if (authenticatedPlayerData) {
          headers[
            'Authorization'
          ] = `player-game-token ${authenticatedPlayerData.playerToken}`;
          leaderboardEntryCreationUrl += `?playerId=${authenticatedPlayerData.playerId}`;
        } else {
          // In case playerName is empty or undefined, the formatting will generate a random name.
          payloadObject['playerName'] = formatPlayerName(playerName);
        }
        const payload = JSON.stringify(payloadObject);
        headers['Digest'] = computeDigest(payload);

        fetch(leaderboardEntryCreationUrl, {
          body: payload,
          method: 'POST',
          headers: headers,
        }).then(
          (response) => {
            if (!response.ok) {
              const errorCode = response.status.toString();
              logger.error(
                'Server responded with an error:',
                errorCode,
                response.statusText
              );
              scoreSavingState.setError(errorCode);
              return;
            }

            scoreSavingState.closeSaving();

            return response.text().then(
              (text) => {},
              (error) => {
                logger.warn(
                  'An error occurred when reading response but score has been saved:',
                  error
                );
              }
            );
          },
          (error) => {
            logger.error('Error while submitting a leaderboard score:', error);
            const errorCode = 'REQUEST_NOT_SENT';
            scoreSavingState.setError(errorCode);
          }
        );
      };

      export const savePlayerScore = function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float,
        playerName: string
      ) {
        let scoreSavingState: ScoreSavingState;
        if (_scoreSavingStateByLeaderboard[leaderboardId]) {
          scoreSavingState = _scoreSavingStateByLeaderboard[leaderboardId];
          let shouldStartSaving = true;
          if (
            shouldStartSaving &&
            scoreSavingState.isAlreadySavingThisScore({ playerName, score })
          ) {
            logger.warn(
              'There is already a request to save with this player name and this score. Ignoring this one.'
            );
            shouldStartSaving = false;
          }

          if (
            shouldStartSaving &&
            scoreSavingState.isSameAsLastScore({ playerName, score })
          ) {
            logger.warn(
              'The player and score to be sent are the same as previous one. Ignoring this one.'
            );
            scoreSavingState.setError('SAME_AS_PREVIOUS');
            shouldStartSaving = false;
          }

          if (
            shouldStartSaving &&
            scoreSavingState.isTooSoonToSaveAnotherScore()
          ) {
            logger.warn(
              'Last entry was sent too little time ago. Ignoring this one.'
            );
            scoreSavingState.setError('TOO_FAST');
            shouldStartSaving = false;
            // Set the starting time to cancel all the following attempts that
            // are started too early after this one.
            scoreSavingState.lastScoreSavingStartedAt = Date.now();
          }
          if (!shouldStartSaving) {
            return;
          }
        } else {
          scoreSavingState = new ScoreSavingState();
          _scoreSavingStateByLeaderboard[leaderboardId] = scoreSavingState;
        }

        scoreSavingState.startSaving({ playerName, score });

        saveScore({
          leaderboardId,
          playerName,
          score,
          scoreSavingState,
          runtimeScene,
        });
      };

      export const saveConnectedPlayerScore = function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float
      ) {
        let scoreSavingState: ScoreSavingState;
        const playerId = gdjs.playerAuthentication.getUserId();
        const playerToken = gdjs.playerAuthentication.getUserToken();
        if (!playerId || !playerToken) {
          logger.warn(
            'Cannot save a score for a connected player if the player is not connected.'
          );
          return;
        }
        if (_scoreSavingStateByLeaderboard[leaderboardId]) {
          scoreSavingState = _scoreSavingStateByLeaderboard[leaderboardId];
          let shouldStartSaving = true;
          if (
            shouldStartSaving &&
            scoreSavingState.isAlreadySavingThisScore({ playerId, score })
          ) {
            logger.warn(
              'There is already a request to save with this player ID and this score. Ignoring this one.'
            );
            shouldStartSaving = false;
          }

          if (
            shouldStartSaving &&
            scoreSavingState.isSameAsLastScore({ playerId, score })
          ) {
            logger.warn(
              'The player and score to be sent are the same as previous one. Ignoring this one.'
            );
            scoreSavingState.setError('SAME_AS_PREVIOUS');
            shouldStartSaving = false;
          }

          if (
            shouldStartSaving &&
            scoreSavingState.isTooSoonToSaveAnotherScore()
          ) {
            logger.warn(
              'Last entry was sent too little time ago. Ignoring this one.'
            );
            scoreSavingState.setError('TOO_FAST');
            shouldStartSaving = false;
            // Set the starting time to cancel all the following attempts that
            // are started too early after this one.
            scoreSavingState.lastScoreSavingStartedAt = Date.now();
          }
          if (!shouldStartSaving) {
            return;
          }
        } else {
          scoreSavingState = new ScoreSavingState();
          _scoreSavingStateByLeaderboard[leaderboardId] = scoreSavingState;
        }

        scoreSavingState.startSaving({ playerId, score });

        saveScore({
          leaderboardId,
          authenticatedPlayerData: { playerId, playerToken },
          score,
          scoreSavingState,
          runtimeScene,
        });
      };

      export const isSaving = function (leaderboardId?: string): boolean {
        if (leaderboardId) {
          return _scoreSavingStateByLeaderboard[leaderboardId]
            ? _scoreSavingStateByLeaderboard[leaderboardId].isScoreSaving
            : false;
        }

        const lastScoreSavingState = getLastScoreSavingState({
          hasSucceeded: false,
        });
        return lastScoreSavingState
          ? lastScoreSavingState.isScoreSaving
          : false;
      };

      export const hasBeenSaved = function (leaderboardId?: string): boolean {
        if (leaderboardId) {
          return _scoreSavingStateByLeaderboard[leaderboardId]
            ? _scoreSavingStateByLeaderboard[leaderboardId].hasScoreBeenSaved
            : false;
        }

        const lastScoreSavingState = getLastScoreSavingState({
          hasSucceeded: true,
        });
        return lastScoreSavingState
          ? lastScoreSavingState.hasScoreBeenSaved
          : false;
      };

      export const hasSavingErrored = function (
        leaderboardId?: string
      ): boolean {
        if (leaderboardId) {
          return _scoreSavingStateByLeaderboard[leaderboardId]
            ? _scoreSavingStateByLeaderboard[leaderboardId]
                .hasScoreSavingErrored
            : false;
        }

        const lastScoreSavingState = getLastScoreSavingState({
          hasSucceeded: false,
        });
        return lastScoreSavingState
          ? lastScoreSavingState.hasScoreSavingErrored
          : false;
      };

      export const getLastSaveError = function (
        leaderboardId?: string
      ): string | null {
        if (leaderboardId) {
          return _scoreSavingStateByLeaderboard[leaderboardId]
            ? _scoreSavingStateByLeaderboard[leaderboardId].lastSaveError
            : 'NO_DATA_ERROR';
        }

        const lastScoreSavingState = getLastScoreSavingState({
          hasSucceeded: false,
        });
        return lastScoreSavingState
          ? lastScoreSavingState.lastSaveError
          : 'NO_DATA_ERROR';
      };

      export const formatPlayerName = function (
        rawName?: string | null
      ): string {
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
          .trim()
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
        // First ensure we're not trying to display multiple times the same leaderboard (in which case
        // we "de-duplicate" the request to display it).
        if (leaderboardId === _requestedLeaderboardId) {
          if (_leaderboardViewIframeLoading) {
            logger.warn(
              `Already loading the view for the requested loader (${leaderboardId}), ignoring.`
            );
            return;
          }
          if (_leaderboardViewIframeLoaded) {
            logger.warn(
              `Already loaded the view for the requested loader (${leaderboardId}), ignoring.`
            );
            return;
          }
        }

        // We are now assured we want to display a new (or different) leaderboard: start loading it.
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
        const isDev = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment();
        const targetUrl = `https://liluo.io/games/${gameId}/leaderboard/${leaderboardId}?inGameEmbedded=true${
          isDev ? '&dev=true' : ''
        }`;
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

              _leaderboardViewIframe = computeLeaderboardDisplayingIframe(
                targetUrl
              );
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
              "The iframe displaying the current leaderboard couldn't be found, the leaderboard view must be already closed."
            );
            return;
          }
          const domElementContainer = runtimeScene
            .getGame()
            .getRenderer()
            .getDomElementContainer();
          if (!domElementContainer) {
            logger.info(
              "The div element covering the game couldn't be found, the leaderboard view must be already closed."
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
          // Don't reset the loading flag (the view of another leaderboard might be loading)
          // or the error flag (we want to persist the error flag even after the view is closed),
          // but reset the flag indicating the view is loaded (if it was).
          _leaderboardViewIframeLoaded = false;

          const gameCanvas = runtimeScene.getGame().getRenderer().getCanvas();
          if (gameCanvas) gameCanvas.focus();
        }
      };
    }
  }
}
