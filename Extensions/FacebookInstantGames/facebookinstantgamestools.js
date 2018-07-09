/**
 * @memberof gdjs.evtTools
 * @class facebookInstantGames
 * @static
 * @private
 */
gdjs.evtTools.facebookInstantGames = {};

gdjs.evtTools.facebookInstantGames.getPlayerId = function() {
  if (typeof FBInstant === "undefined") return "";

  return FBInstant.player.getID() || "";
};

gdjs.evtTools.facebookInstantGames.getPlayerName = function() {
  if (typeof FBInstant === "undefined") return "";

  return FBInstant.player.getName() || "";
};

gdjs.evtTools.facebookInstantGames.loadPlayerData = function(
  key,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  FBInstant.player
    .getDataAsync([key])
    .then(function(data) {
      gdjs.evtTools.network.jsonToVariableStructure(data[key], successVariable);
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.setPlayerData = function(
  key,
  variable,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  var data = {};
  data[key] = gdjs.evtTools.network.variableStructureToJSON(variable);

  FBInstant.player
    .setDataAsync(data)
    .then(function() {
      successVariable.setString("Player data saved");
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.setPlayerScore = function(
  leaderboardName,
  score,
  extraDataVariable,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  var data = gdjs.evtTools.network.variableStructureToJSON(extraDataVariable);

  FBInstant.getLeaderboardAsync(leaderboardName)
    .then(function(leaderboard) {
      return leaderboard.setScoreAsync(score, data);
    })
    .then(function() {
      successVariable.setString("Player score saved");
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.getPlayerEntry = function(
  leaderboardName,
  rankVariable,
  scoreVariable,
  extraDataVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  extraDataVariable.setString("");

  FBInstant.getLeaderboardAsync(leaderboardName)
    .then(function(leaderboard) {
      return leaderboard.getPlayerEntryAsync();
    })
    .then(function(entry) {
      rankVariable.setNumber(entry.getRank() === null ? -1 : entry.getRank());
      scoreVariable.setNumber(entry.getScore() === null ? -1 : entry.getScore());
      gdjs.evtTools.network.jsonToVariableStructure(
        entry.getExtraData(),
        extraDataVariable
      );
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

if (typeof FBInstant === "undefined" && typeof window !== "undefined") {
  console.log("Creating a mocked version of Facebook Instant Games");

  function MockedLeaderboard() {
    this._playerScore = null;
    this._playerRank = null;
    this._playerExtraData = null;
  }
  MockedLeaderboard.prototype.setScoreAsync = function(score, extraData) {
    var that = this;
    return new Promise(function(resolve) {
      that._playerScore = score;
      that._playerRank = 1;
      that._playerExtraData = extraData;
      resolve();
    });
  };
  MockedLeaderboard.prototype.getPlayerEntryAsync = function() {
    var that = this;
    return new Promise(function(resolve) {
      resolve({
        getScore: function() {
          return that._playerScore;
        },
        getRank: function() {
          return that._playerRank;
        },
        getExtraData: function() {
          return that._playerExtraData;
        }
      });
    });
  };

  var FBInstantMock = {
    _mockedPlayerData: {},
    _mockedLeaderboards: {},
    player: {
      getName: function() {
        return "Fake player name";
      },
      getID: function() {
        return "12345678";
      },
      getDataAsync: function(key) {
        return new Promise(function(resolve) {
          resolve(FBInstantMock._mockedPlayerData);
        });
      },
      setDataAsync: function(data) {
        return new Promise(function(resolve) {
          FBInstantMock._mockedPlayerData = data;
          resolve();
        });
      }
    },
    getLeaderboardAsync: function(leaderboardName) {
      return new Promise(function(resolve) {
        FBInstantMock._mockedLeaderboards[leaderboardName] =
          FBInstantMock._mockedLeaderboards[leaderboardName] ||
          new MockedLeaderboard();
        resolve(FBInstantMock._mockedLeaderboards[leaderboardName]);
      });
    }
  };

  window.FBInstant = FBInstantMock;
}
