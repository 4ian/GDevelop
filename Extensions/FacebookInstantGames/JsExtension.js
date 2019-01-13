/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        "FacebookInstantGames",
        t("Facebook Instant Games"),
        t(
          "Allow your game to send scores and interact with Facebook Instant Games"
        ),
        "Florian Rival",
        "Open source (MIT License)"
      )
      .setExtensionHelpPath("/publishing/publishing-to-facebook-instant-games");

    extension
      .addAction(
        "SavePlayerData",
        t("Save player data"),
        t(
          "Save the content of the given variable in the player data, stored on Facebook Instant Games servers"
        ),
        t(
          "Save the content of _PARAM0_ in key _PARAM1_ of player data (store success message in _PARAM2_ or error in _PARAM3_)"
        ),
        t("Facebook Instant Games/Player data"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter("string", 'Data key name (e.g: "Lives")', "", false)
      .addParameter("scenevar", "Variable with the content to save", "", false)
      .addParameter(
        "scenevar",
        t("Variable where to store the success message (optional)"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.setPlayerData");

    extension
      .addAction(
        "LoadPlayerData",
        t("Load player data"),
        t("Load the player data with the given key in a variable"),
        t(
          "Load player data with key _PARAM0_ in _PARAM1_ (or error in _PARAM2_)"
        ),
        t("Facebook Instant Games/Player data"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter("string", t('Data key name (e.g: "Lives")'), "", false)
      .addParameter(
        "scenevar",
        t("Variable where to store loaded data"),
        "",
        false
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.loadPlayerData");

    extension
      .addAction(
        "SavePlayerScore",
        t("Save player score"),
        t(
          "Save the score, and optionally the content of the given variable in the player score, for the given metadata."
        ),
        t(
          "In leaderboard _PARAM0_, save score _PARAM1_ for the player and extra data from _PARAM2_ (store success message in _PARAM3_ or error in _PARAM4_)"
        ),
        t("Facebook Instant Games/Leaderboards"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "string",
        'Leaderboard name (e.g: "PlayersBestTimes")',
        "",
        false
      )
      .addParameter("expression", "Score to register for the player", "", false)
      .addParameter(
        "scenevar",
        t("Optional variable with metadata to save"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to store the success message (optional)"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.setPlayerScore");

    extension
      .addAction(
        "LoadPlayerEntry",
        t("Load player entry"),
        t("Load the player entry in the given leaderboard"),
        t(
          "Load player entry from leaderboard _PARAM0_. Set rank in _PARAM1_, score in _PARAM2_ (extra data if any in _PARAM3_ and error in _PARAM4_)"
        ),
        t("Facebook Instant Games/Leaderboards"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "string",
        t('Leaderboard name (e.g: "PlayersBestTimes")'),
        "",
        false
      )
      .addParameter(
        "scenevar",
        t("Variable where to store the player rank (of -1 if not ranked)"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to store the player score (of -1 if no score)"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to store extra data (if any)"),
        "",
        true
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerEntry");

    extension
      .addCondition(
        "AreAdsSupported",
        t("Check if ads are supported"),
        t("Check if showind ads is supported on this device (only mobile phones can show ads)"),
        t("Ads can be shown on this device"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.areAdsSupported");

    extension
      .addCondition(
        "IsInterstitialAdReady",
        t("Is the interstitial ad ready"),
        t("Check if the interstitial ad requested from Facebook is loaded and ready to be shown."),
        t("The interstitial ad is loaded and ready to be shown"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.isInterstitialAdReady");

    extension
      .addAction(
        "LoadInterstitialAd",
        t("Load and prepare an interstitial ad"),
        t("Request and load an interstitial ad from Facebook, so that it is ready to be shown."),
        t("Request and load an interstitial ad from Facebook (ad placement id: _PARAM0_, error in _PARAM1_)"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "string",
        t("The Ad Placement id (can be found while setting up the ad on Facebook)"),
        "",
        false
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.loadInterstitialAd");

    extension
      .addAction(
        "ShowInterstitialAd",
        t("Show the loaded interstitial ad"),
        t("Show the interstitial ad previously loaded in memory. This won't work if you did not load the interstitial before."),
        t("Show the interstitial ad previously loaded in memory (if any error, store it in _PARAM0_)"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.showInterstitialAd");

    extension
      .addCondition(
        "IsRewardedVideoReady",
        t("Is the rewarded video ready"),
        t("Check if the rewarded video requested from Facebook is loaded and ready to be shown."),
        t("The rewarded video is loaded and ready to be shown"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.isRewardedVideoReady");

    extension
      .addAction(
        "LoadRewardedVideo",
        t("Load and prepare a rewarded video"),
        t("Request and load a rewarded video from Facebook, so that it is ready to be shown."),
        t("Request and load a rewarded video from Facebook (ad placement id: _PARAM0_, error in _PARAM1_)"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "string",
        t("The Ad Placement id (can be found while setting up the ad on Facebook)"),
        "",
        false
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.loadRewardedVideo");

    extension
      .addAction(
        "ShowRewardedVideo",
        t("Show the loaded rewarded video"),
        t("Show the rewarded video previously loaded in memory. This won't work if you did not load the video before."),
        t("Show the rewarded video previously loaded in memory (if any error, store it in _PARAM0_)"),
        t("Facebook Instant Games/Ads"),
        "JsPlatform/Extensions/facebookicon24.png",
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .addParameter(
        "scenevar",
        t("Variable where to error message (optional, if an error occurs)"),
        "",
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.showRewardedVideo");

    extension
      .addStrExpression(
        "PlayerId",
        t("Player identifier"),
        t("Get the player unique identifier"),
        t("Facebook Instant Games"),
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerId");

    extension
      .addStrExpression(
        "PlayerName",
        t("Player name"),
        t("Get the player name"),
        t("Facebook Instant Games"),
        "JsPlatform/Extensions/facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerName");

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  }
};
