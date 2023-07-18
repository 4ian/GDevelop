/// <reference path="sha256.d.ts" />

// TODO EBO Replace runtimeScene to instanceContainer.
namespace gdjs {
  const logger = new gdjs.Logger('Leaderboards');
  export namespace evtTools {
    export namespace leaderboards {
      let _hasPlayerJustClosedLeaderboardView = false;

      gdjs.registerRuntimeScenePostEventsCallback(() => {
        // Set it back to false for the next frame.
        _hasPlayerJustClosedLeaderboardView = false;
      });

      /**
       * Returns true if the player has just closed the leaderboard view.
       */
      export const hasPlayerJustClosedLeaderboardView = () =>
        _hasPlayerJustClosedLeaderboardView;

      const computeDigest = (payload: string): string => {
        const shaObj = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8' });
        shaObj.update(payload);
        return shaObj.getHash('B64');
      };

      /**
       * Hold the state of the save of a score for a leaderboard.
       */
      class ScoreSavingState {
        lastScoreSavingStartedAt: number | null = null;
        lastScoreSavingSucceededAt: number | null = null;

        /** The promise that will be resolved when the score saving is done (successfully or not). */
        lastSavingPromise: Promise<void> | null = null;

        // Score that is being saved:
        private _currentlySavingScore: number | null = null;
        private _currentlySavingPlayerName: string | null = null;
        private _currentlySavingPlayerId: string | null = null;

        // Last score saved with success:
        private _lastSavedScore: number | null = null;
        private _lastSavedPlayerName: string | null = null;
        private _lastSavedPlayerId: string | null = null;

        /** The id of the entry in the leaderboard, for the last score saved with success. */
        lastSavedLeaderboardEntryId: string | null = null;

        /** Last error that happened when saving the score (useful if `hasScoreSavingErrored` is true). */
        lastSaveError: string | null = null;

        /** `true` if the last save has finished and succeeded. */
        hasScoreBeenSaved: boolean = false;

        /** `true` if the last save has finished and failed (check `lastSaveError` then). */
        hasScoreSavingErrored: boolean = false;

        isSaving(): boolean {
          return (
            !!this.lastSavingPromise &&
            !this.hasScoreBeenSaved &&
            !this.hasScoreSavingErrored
          );
        }

        private _isSameAsLastScore({
          playerName,
          playerId,
          score,
        }: {
          playerName?: string;
          playerId?: string;
          score: number;
        }): boolean {
          return (
            ((!!playerName && this._lastSavedPlayerName === playerName) ||
              (!!playerId && this._lastSavedPlayerId === playerId)) &&
            this._lastSavedScore === score
          );
        }

        private _isAlreadySavingThisScore({
          playerName,
          playerId,
          score,
        }: {
          playerName?: string;
          playerId?: string;
          score: number;
        }): boolean {
          if (!this.isSaving()) return false;

          return (
            ((!!playerName && this._currentlySavingPlayerName === playerName) ||
              (!!playerId && this._currentlySavingPlayerId === playerId)) &&
            this._currentlySavingScore === score
          );
        }

        private _isTooSoonToSaveAnotherScore(): boolean {
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
        }): {
          closeSaving: (leaderboardEntryId: string | null) => void;
          closeSavingWithError(errorCode: string);
        } {
          if (this._isAlreadySavingThisScore({ playerName, playerId, score })) {
            logger.warn(
              'There is already a request to save with this player name and this score. Ignoring this one.'
            );
            throw new Error('Ignoring this saving request.');
          }

          if (this._isSameAsLastScore({ playerName, playerId, score })) {
            logger.warn(
              'The player and score to be sent are the same as previous one. Ignoring this one.'
            );
            this._setError('SAME_AS_PREVIOUS');
            throw new Error('Ignoring this saving request.');
          }

          if (this._isTooSoonToSaveAnotherScore()) {
            logger.warn(
              'Last entry was sent too little time ago. Ignoring this one.'
            );
            this._setError('TOO_FAST');

            // Set the starting time to cancel all the following attempts that
            // are started too early after this one.
            this.lastScoreSavingStartedAt = Date.now();

            throw new Error('Ignoring this saving request.');
          }

          let resolveSavingPromise: () => void;
          const savingPromise = new Promise<void>((resolve) => {
            resolveSavingPromise = resolve;
          });

          this.lastScoreSavingStartedAt = Date.now();
          this.lastSavingPromise = savingPromise;
          this.hasScoreBeenSaved = false;
          this.hasScoreSavingErrored = false;
          this._currentlySavingScore = score;
          if (playerName) this._currentlySavingPlayerName = playerName;
          if (playerId) this._currentlySavingPlayerId = playerId;

          return {
            closeSaving: (leaderboardEntryId) => {
              if (savingPromise !== this.lastSavingPromise) {
                logger.info(
                  'Score saving result received, but another save was launched in the meantime - ignoring the result of this one.'
                );

                // Still finish the promise that can be waited upon:
                resolveSavingPromise();
                return;
              }

              this.lastScoreSavingSucceededAt = Date.now();
              this._lastSavedScore = this._currentlySavingScore;
              this._lastSavedPlayerName = this._currentlySavingPlayerName;
              this._lastSavedPlayerId = this._currentlySavingPlayerId;
              this.lastSavedLeaderboardEntryId = leaderboardEntryId;
              this.hasScoreBeenSaved = true;

              resolveSavingPromise();
            },
            closeSavingWithError: (errorCode) => {
              if (savingPromise !== this.lastSavingPromise) {
                logger.info(
                  'Score saving result received, but another save was launched in the meantime - ignoring the result of this one.'
                );

                // Still finish the promise that can be waited upon:
                resolveSavingPromise();
                return;
              }

              this._setError(errorCode);
              resolveSavingPromise();
            },
          };
        }

        private _setError(errorCode: string): void {
          this.lastSaveError = errorCode;
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

      /** Get the saving state of the leaderboard who had the last update (successful or started). */
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

      const saveScore = async function ({
        leaderboardId,
        playerName,
        authenticatedPlayerData,
        score,
        runtimeScene,
      }: {
        leaderboardId: string;
        playerName?: string | null;
        authenticatedPlayerData?: { playerId: string; playerToken: string };
        score: number;
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
          // In case playerName is empty, the backend will generate a random name.
          payloadObject['playerName'] = formatPlayerName(playerName);
        }
        const payload = JSON.stringify(payloadObject);
        headers['Digest'] = computeDigest(payload);

        try {
          const response = await fetch(leaderboardEntryCreationUrl, {
            body: payload,
            method: 'POST',
            headers: headers,
          });

          if (!response.ok) {
            const errorCode = response.status.toString();
            logger.error(
              'Server responded with an error:',
              errorCode,
              response.statusText
            );

            throw errorCode;
          }

          let leaderboardEntryId: string | null = null;
          try {
            const leaderboardEntry = await response.json();
            leaderboardEntryId = leaderboardEntry.id;
          } catch (error) {
            logger.warn(
              'An error occurred when reading response but score has been saved:',
              error
            );
          }

          return leaderboardEntryId;
        } catch (error) {
          logger.error('Error while submitting a leaderboard score:', error);
          const errorCode = 'REQUEST_NOT_SENT';

          throw errorCode;
        }
      };

      export const savePlayerScore = (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float,
        playerName: string
      ) =>
        new gdjs.PromiseTask(
          (async () => {
            const scoreSavingState = (_scoreSavingStateByLeaderboard[
              leaderboardId
            ] =
              _scoreSavingStateByLeaderboard[leaderboardId] ||
              new ScoreSavingState());

            try {
              const {
                closeSaving,
                closeSavingWithError,
              } = scoreSavingState.startSaving({ playerName, score });

              try {
                const leaderboardEntryId = await saveScore({
                  leaderboardId,
                  playerName,
                  score,
                  runtimeScene,
                });
                closeSaving(leaderboardEntryId);
              } catch (errorCode) {
                closeSavingWithError(errorCode);
              }
            } catch {
              // Do nothing: saving was rejected for a reason already logged.
            }
          })()
        );

      export const saveConnectedPlayerScore = (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float
      ) =>
        new gdjs.PromiseTask(
          (async () => {
            const playerId = gdjs.playerAuthentication.getUserId();
            const playerToken = gdjs.playerAuthentication.getUserToken();
            if (!playerId || !playerToken) {
              logger.warn(
                'Cannot save a score for a connected player if the player is not connected.'
              );
              return;
            }

            const scoreSavingState = (_scoreSavingStateByLeaderboard[
              leaderboardId
            ] =
              _scoreSavingStateByLeaderboard[leaderboardId] ||
              new ScoreSavingState());

            try {
              const {
                closeSaving,
                closeSavingWithError,
              } = scoreSavingState.startSaving({ playerId, score });

              try {
                const leaderboardEntryId = await saveScore({
                  leaderboardId,
                  authenticatedPlayerData: { playerId, playerToken },
                  score,
                  runtimeScene,
                });
                closeSaving(leaderboardEntryId);
              } catch (errorCode) {
                closeSavingWithError(errorCode);
              }
            } catch {
              // Do nothing: saving was rejected for a reason already logged.
            }
          })()
        );

      export const isSaving = function (leaderboardId?: string): boolean {
        if (leaderboardId) {
          return _scoreSavingStateByLeaderboard[leaderboardId]
            ? _scoreSavingStateByLeaderboard[leaderboardId].isSaving()
            : false;
        }

        const lastScoreSavingState = getLastScoreSavingState({
          hasSucceeded: false,
        });
        return lastScoreSavingState ? lastScoreSavingState.isSaving() : false;
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
          return '';
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
            _hasPlayerJustClosedLeaderboardView = true;
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

      export const displayLeaderboard = async function (
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

        // If a save is being done for this leaderboard, wait for it to end so that the `lastSavedLeaderboardEntryId`
        // can be saved and then used to show the player score.
        const scoreSavingState = _scoreSavingStateByLeaderboard[leaderboardId];
        if (scoreSavingState && scoreSavingState.lastSavingPromise) {
          await scoreSavingState.lastSavingPromise;
        }

        const lastSavedLeaderboardEntryId = scoreSavingState
          ? scoreSavingState.lastSavedLeaderboardEntryId
          : null;

        const gameId = gdjs.projectData.properties.projectUuid;
        const isDev = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment();

        const searchParams = new URLSearchParams();
        searchParams.set('inGameEmbedded', 'true');
        if (isDev) searchParams.set('dev', 'true');
        if (lastSavedLeaderboardEntryId)
          searchParams.set(
            'playerLeaderboardEntryId',
            lastSavedLeaderboardEntryId
          );

        const targetUrl = `https://gd.games/games/${gameId}/leaderboard/${leaderboardId}?${searchParams}`;

        try {
          const isAvailable = await checkLeaderboardAvailability(targetUrl);

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
        } catch (err) {
          logger.error(err);
          handleErrorDisplayingLeaderboard(
            runtimeScene,
            'An error occurred when fetching leaderboard data. Closing leaderboard view if there is one.'
          );
        }
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
