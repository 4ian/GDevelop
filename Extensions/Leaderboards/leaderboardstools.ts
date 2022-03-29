namespace gdjs {
  const logger = new gdjs.Logger('Leaderboards');
  export namespace evtTools {
    export namespace leaderboards {
      let _scoreLastSentAt: number | null = null;
      let _lastScore: number;
      let _lastPlayerName: string;
      let _lastErrorCode: number;

      export const setPlayerScore = function (
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
          fetch(
            `${baseUrl}/game/${gdjs.projectData.properties.projectUuid}/leaderboard/${leaderboardId}/entry`,
            {
              body: JSON.stringify({
                playerName: formatPlayerName(playerName),
                score: score,
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
    }
  }
}
