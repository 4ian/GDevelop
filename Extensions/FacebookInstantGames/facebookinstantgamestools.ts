namespace gdjs {
  const logger = new gdjs.Logger('Facebook instant games');
  export namespace evtTools {
    export namespace facebookInstantGames {
      export let _preloadedInterstitial: any = null;
      export let _preloadedInterstitialLoading = false;
      export let _preloadedInterstitialLoaded = false;
      export let _preloadedRewardedVideo: any = null;
      export let _preloadedRewardedVideoLoading = false;
      export let _preloadedRewardedVideoLoaded = false;

      export const areAdsSupported = function () {
        if (typeof FBInstant === 'undefined') {
          return false;
        }
        const supportedAPIs = FBInstant.getSupportedAPIs();
        return (
          supportedAPIs.indexOf('getInterstitialAdAsync') !== -1 &&
          supportedAPIs.indexOf('getRewardedVideoAsync') !== -1
        );
      };

      export const getPlayerId = function () {
        if (typeof FBInstant === 'undefined') {
          return '';
        }
        return FBInstant.player.getID() || '';
      };

      export const getPlayerName = function () {
        if (typeof FBInstant === 'undefined') {
          return '';
        }
        return FBInstant.player.getName() || '';
      };

      export const loadPlayerData = function (
        key,
        successVariable,
        errorVariable
      ) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        errorVariable.setString('');
        successVariable.setString('');
        FBInstant.player
          .getDataAsync([key])
          .then(function (data) {
            successVariable.fromJSON(data[key]);
          })
          .catch(function (error) {
            errorVariable.setString(error.message || 'Unknown error');
          });
      };

      export const setPlayerData = function (
        key,
        variable,
        successVariable,
        errorVariable
      ) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        errorVariable.setString('');
        successVariable.setString('');
        const data = {};
        data[key] = JSON.stringify(variable.toJSObject());
        FBInstant.player
          .setDataAsync(data)
          .then(function () {
            successVariable.setString('Player data saved');
          })
          .catch(function (error) {
            errorVariable.setString(error.message || 'Unknown error');
          });
      };

      export const setPlayerScore = function (
        leaderboardName,
        score,
        extraDataVariable,
        successVariable,
        errorVariable
      ) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        errorVariable.setString('');
        successVariable.setString('');
        const data = JSON.stringify(extraDataVariable.toJSObject());
        FBInstant.getLeaderboardAsync(leaderboardName)
          .then(function (leaderboard) {
            return leaderboard.setScoreAsync(score, data);
          })
          .then(function () {
            successVariable.setString('Player score saved');
          })
          .catch(function (error) {
            errorVariable.setString(error.message || 'Unknown error');
          });
      };

      export const getPlayerEntry = function (
        leaderboardName,
        rankVariable,
        scoreVariable,
        extraDataVariable,
        errorVariable
      ) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        errorVariable.setString('');
        extraDataVariable.setString('');
        FBInstant.getLeaderboardAsync(leaderboardName)
          .then(function (leaderboard) {
            return leaderboard.getPlayerEntryAsync();
          })
          .then(function (entry) {
            rankVariable.setNumber(
              entry.getRank() === null ? -1 : entry.getRank()
            );
            scoreVariable.setNumber(
              entry.getScore() === null ? -1 : entry.getScore()
            );
            extraDataVariable.fromJSON(entry.getExtraData());
          })
          .catch(function (error) {
            errorVariable.setString(error.message || 'Unknown error');
          });
      };

      export const loadInterstitialAd = function (
        adPlacementId,
        errorVariable
      ) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        if (
          gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading ||
          gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded
        ) {
          return;
        }
        gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = true;
        FBInstant.getInterstitialAdAsync(adPlacementId)
          .then(function (interstitial) {
            gdjs.evtTools.facebookInstantGames._preloadedInterstitial = interstitial;
            return interstitial.loadAsync();
          })
          .then(function () {
            gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = false;
            gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = true;
            logger.info('Facebook Instant Games interstitial preloaded.');
          })
          .catch(function (err) {
            gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = false;
            gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = false;
            logger.error('Interstitial failed to preload: ' + err.message);
            errorVariable.setString(err.message || 'Unknown error');
          });
      };

      export const showInterstitialAd = function (errorVariable) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        if (!gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded) {
          return;
        }
        gdjs.evtTools.facebookInstantGames._preloadedInterstitial
          .showAsync()
          .then(function () {
            logger.info('Facebook Instant Games interstitial shown.');
          })
          .catch(function (err) {
            logger.error('Interstitial failed to show: ' + err.message);
            errorVariable.setString(err.message || 'Unknown error');
          })
          .then(function () {
            gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = false;
          });
      };

      export const isInterstitialAdReady = function () {
        return gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded;
      };

      export const loadRewardedVideo = function (adPlacementId, errorVariable) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        if (
          gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading ||
          gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded
        ) {
          return;
        }
        gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = true;
        FBInstant.getRewardedVideoAsync(adPlacementId)
          .then(function (rewardedVideo) {
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideo = rewardedVideo;
            return rewardedVideo.loadAsync();
          })
          .then(function () {
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = false;
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = true;
            logger.info('Facebook Instant Games rewarded video preloaded.');
          })
          .catch(function (err) {
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = false;
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = false;
            logger.error('Rewarded video failed to preload: ' + err.message);
            errorVariable.setString(err.message || 'Unknown error');
          });
      };

      export const showRewardedVideo = function (errorVariable) {
        if (typeof FBInstant === 'undefined') {
          return;
        }
        if (!gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded) {
          return;
        }
        gdjs.evtTools.facebookInstantGames._preloadedRewardedVideo
          .showAsync()
          .then(function () {
            logger.info('Facebook Instant Games rewarded video shown.');
          })
          .catch(function (err) {
            logger.error('Rewarded video failed to show: ' + err.message);
            errorVariable.setString(err.message || 'Unknown error');
          })
          .then(function () {
            gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = false;
          });
      };

      export const isRewardedVideoReady = function () {
        return gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded;
      };
      if (typeof FBInstant === 'undefined' && typeof window !== 'undefined') {
        logger.log('Creating a mocked version of Facebook Instant Games.');

        /**
         * A mocked Leaderboard, part of the mock of FBInstant.
         * @ignore
         */
        class MockedLeaderboard {
          _playerScore: any = null;
          _playerRank: any = null;
          _playerExtraData: any = null;

          setScoreAsync(score, extraData): Promise<void> {
            const that = this;
            return new Promise(function (resolve) {
              that._playerScore = score;
              that._playerRank = 1;
              that._playerExtraData = extraData;
              resolve();
            });
          }

          getPlayerEntryAsync() {
            const that = this;
            return new Promise(function (resolve) {
              resolve({
                getScore: function () {
                  return that._playerScore;
                },
                getRank: function () {
                  return that._playerRank;
                },
                getExtraData: function () {
                  return that._playerExtraData;
                },
              });
            });
          }
        }

        /**
         * A mocked RewardedVideo, part of the mock of FBInstant.
         * @ignore
         */
        class MockedRewardedVideo {
          _isLoaded: boolean = false;

          loadAsync() {
            this._isLoaded = true;
            return Promise.resolve();
          }

          showAsync(): Promise<void> {
            if (this._isLoaded) {
              logger.info(
                'In a real Instant Game, a video reward should have been shown to the user.'
              );
              return Promise.resolve();
            }
            return Promise.reject(new Error('Rewarded video is not loaded.'));
          }
        }

        /**
         * A mocked MockedInterstitial, part of the mock of FBInstant.
         * @ignore
         */
        class MockedInterstitial {
          _isLoaded: boolean = false;

          loadAsync() {
            this._isLoaded = true;
            return Promise.resolve();
          }

          showAsync(): Promise<void> {
            if (this._isLoaded) {
              logger.info(
                'In a real Instant Game, an interstitial should have been shown to the user.'
              );
              return Promise.resolve();
            }
            return Promise.reject(new Error('Interstitial is not loaded.'));
          }
        }
        const supportedAPIs: Array<string> = [];
        const FBInstantMock = {
          _mockedPlayerData: {},
          _mockedLeaderboards: {},
          player: {
            getName: function () {
              return 'Fake player name';
            },
            getID: function () {
              return '12345678';
            },
            getDataAsync: function (key) {
              return new Promise(function (resolve) {
                resolve(FBInstantMock._mockedPlayerData);
              });
            },
            setDataAsync: function (data) {
              return new Promise<void>(function (resolve) {
                FBInstantMock._mockedPlayerData = data;
                resolve();
              });
            },
          },
          getLeaderboardAsync: function (leaderboardName) {
            return new Promise(function (resolve) {
              FBInstantMock._mockedLeaderboards[leaderboardName] =
                FBInstantMock._mockedLeaderboards[leaderboardName] ||
                new MockedLeaderboard();
              resolve(FBInstantMock._mockedLeaderboards[leaderboardName]);
            });
          },
          getInterstitialAdAsync: function () {
            return Promise.resolve(new MockedInterstitial());
          },
          getRewardedVideoAsync: function () {
            return Promise.resolve(new MockedRewardedVideo());
          },
          getSupportedAPIs: function () {
            return supportedAPIs;
          },
        };

        // Retrieve the name of the supported APIs in our mock.
        for (const property in FBInstantMock) {
          if (typeof FBInstantMock[property] == 'object') {
            for (const subProperty in FBInstantMock[property]) {
              if (typeof FBInstantMock[property][subProperty] == 'function') {
                supportedAPIs.push(property + '.' + subProperty);
              }
            }
          } else {
            if (typeof FBInstantMock[property] == 'function') {
              supportedAPIs.push(property);
            }
          }
        }
        // @ts-expect-error
        window.FBInstant = FBInstantMock;
      }
    }
  }
}
