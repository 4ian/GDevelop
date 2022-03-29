namespace gdjs {
  const logger = new gdjs.Logger('Leaderboards');
  export namespace evtTools {
    export namespace leaderboards {
      let _scoreLastSentAt: number | null = null;
      let _lastScore: number;
      let _lastPlayerName: string;
      let _lastErrorCode: number;
      let _leaderboardViewIframe: HTMLIFrameElement | null = null;

      export const setPlayerScore = function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string,
        score: float,
        playerName: string,
        responseVar: gdjs.Variable,
        errorVar: gdjs.Variable
      ) {
        errorVar.setString('');
        responseVar.setString('');

        if (
          (_lastPlayerName === playerName && _lastScore === score) ||
          (!!_scoreLastSentAt && Date.now() - _scoreLastSentAt < 500)
        ) {
          errorVar.setString('Wait before sending a new score.');
        } else {
          const baseUrl = 'https://api.gdevelop-app.com/play';
          const game = runtimeScene.getGame();
          fetch(
            `${baseUrl}/game/${gdjs.projectData.properties.projectUuid}/leaderboard/${leaderboardId}/entry`,
            {
              body: JSON.stringify({
                playerName: formatPlayerName(playerName),
                score: score,
                sessionId: game.getSessionId(),
                clientPlayerId: game.getPlayerId(),
                location:
                  typeof window !== 'undefined' && (window as any).location
                    ? (window as any).location.href
                    : '',
              }),
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          )
            .then((response) => {
              _scoreLastSentAt = Date.now();
              if (!response.ok) {
                errorVar.setString(response.status.toString());
                _lastErrorCode = response.status;
                return response.statusText;
              } else {
                _lastScore = score;
                _lastPlayerName = playerName;
                _lastErrorCode = response.status;
                return response.text();
              }
            })
            .then((data) => {
              responseVar.setString(data);
            })
            .catch((error) => {
              console.warn(
                `Error while submitting a leaderboard score: ${error}`
              );
              errorVar.setString('REQUEST_NOT_SENT');
              _lastErrorCode = 400;
            });
        }
      };

      export const hasLastEntrySaveFailed = function () {
        return _lastErrorCode && _lastErrorCode >= 400;
      };

      export const getLastSentEntryStatusCode = function () {
        return '' + _lastErrorCode;
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
          .replace(/\s/, '_')
          .replace(/[^\w|-]/g, '')
          .slice(0, 30);
      };

      const checkLeaderboardAvailability = async function (
        url: string
      ): Promise<boolean> {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            logger.error(
              `Error while fetching leaderboard view, server returned: ${response.status} ${response.statusText}`
            );
            return false;
          }
          return true;
        } catch (err) {
          logger.error(`Error while fetching leaderboard view: ${err}`);
          return false;
        }
      };

      export const displayLeaderboard = async function (
        runtimeScene: gdjs.RuntimeScene,
        leaderboardId: string
      ) {
        const gameId = gdjs.projectData.properties.projectUuid;
        const targetUrl = `https://liluo.io/games/${gameId}/leaderboard/${leaderboardId}`;
        if (!(await checkLeaderboardAvailability(targetUrl))) {
          logger.error('Leaderboard data could not be fetched, doing nothing');
          return;
        }

        if (_leaderboardViewIframe) {
          _leaderboardViewIframe.src = targetUrl;
        } else {
          const domElementContainer = runtimeScene
            .getGame()
            .getRenderer()
            .getDomElementContainer();
          if (!domElementContainer) {
            logger.error(
              "Div covering game couldn't be found, leaderboard cannot be displayed."
            );
            return;
          }
          const iframe = document.createElement('iframe');

          iframe.src = targetUrl;
          iframe.id = 'leaderboard-view';
          iframe.style.position = 'absolute';
          iframe.style.pointerEvents = 'all';
          iframe.style.top = '0px';
          iframe.style.height = '100%';
          iframe.style.left = '0px';
          iframe.style.width = '100%';
          iframe.style.border = 'none';
          _leaderboardViewIframe = iframe;
          domElementContainer.appendChild(iframe);
        }
      };

      export const closeLeaderboardView = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        if (!_leaderboardViewIframe) {
          logger.info(
            "Couldn't find the current leaderboard view. Doing nothing."
          );
          return;
        }
        const domElementContainer = runtimeScene
          .getGame()
          .getRenderer()
          .getDomElementContainer();
        if (!domElementContainer) {
          logger.info(
            "Element containing leaderboard view couldn't be found. Doing nothing."
          );
          return;
        }

        domElementContainer.removeChild(_leaderboardViewIframe);
        _leaderboardViewIframe = null;
      };
    }
  }
}
