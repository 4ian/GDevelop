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
        score: gdjs.Variable,
        playerName: gdjs.Variable,
        responseVar: gdjs.Variable,
        errorVar: gdjs.Variable
      ) {
        errorVar.setString('');
        responseVar.setString('');

        if (
          (_lastPlayerName === playerName.getAsString() &&
            _lastScore === score.getAsNumber()) ||
          (!!_scoreLastSentAt && Date.now() - _scoreLastSentAt < 500)
        ) {
          errorVar.setString('Wait before sending a new score.');
        } else {
          const baseUrl = 'https://api.gdevelop-app.com/play';
          fetch(
            `${baseUrl}/game/${gdjs.projectData.properties.projectUuid}/leaderboard/${leaderboardId}/entry`,
            {
              body: JSON.stringify({
                playerName: playerName.getAsString(),
                score: score.getAsNumber(),
              }),
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          )
            .then((response) => {
              _scoreLastSentAt = Date.now();
              console.log(response.status);
              if (!response.ok) {
                errorVar.setString(response.status.toString());
                _lastErrorCode = response.status;
                return response.statusText;
              } else {
                _lastScore = score.getAsNumber();
                _lastPlayerName = playerName.getAsString();
                _lastErrorCode = response.status;
                return response.text();
              }
            })
            .then((data) => {
              console.log('two', data);
              responseVar.setString(data);
            })
            .catch((error) => {
              console.log('here', JSON.stringify(error));
              errorVar.setString('REQUEST_NOT_SENT');
              _lastErrorCode = 400;
            });
        }
      };

      export const lastEntrySaveFailed = function () {
        return _lastErrorCode && _lastErrorCode >= 400;
      };

      export const getLastSentEntryStatusCode = function () {
        console.log({ _lastErrorCode });
        return '' + _lastErrorCode;
      };
    }
  }
}
