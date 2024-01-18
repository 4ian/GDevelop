//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'FacebookInstantGames',
        _('Facebook Instant Games'),
        _(
          'Allow your game to send scores and interact with the Facebook Instant Games platform.'
        ),
        'Florian Rival',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/publishing/publishing-to-facebook-instant-games')
      .setCategory('Third-party');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Facebook Instant Games'))
      .setIcon('JsPlatform/Extensions/facebookicon32.png');

    extension
      .addAction(
        'SavePlayerData',
        _('Save player data'),
        _(
          'Save the content of the given scene variable in the player data, stored on Facebook Instant Games servers'
        ),
        _(
          'Save the content of _PARAM1_ in key _PARAM0_ of player data (store success message in _PARAM2_ or error in _PARAM3_)'
        ),
        _('Player data'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter('string', 'Data key name (e.g: "Lives")', '', false)
      .addParameter(
        'scenevar',
        'Scene variable with the content to save',
        '',
        false
      )
      .addParameter(
        'scenevar',
        _('Variable where to store the success message (optional)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.setPlayerData');

    extension
      .addAction(
        'LoadPlayerData',
        _('Load player data'),
        _('Load the player data with the given key in a variable'),
        _(
          'Load player data with key _PARAM0_ in _PARAM1_ (or error in _PARAM2_)'
        ),
        _('Player data'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter('string', _('Data key name (e.g: "Lives")'), '', false)
      .addParameter(
        'scenevar',
        _('Variable where to store loaded data'),
        '',
        false
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.loadPlayerData');

    extension
      .addAction(
        'SavePlayerScore',
        _('Save player score'),
        _(
          'Save the score, and optionally the content of the given variable in the player score, for the given metadata.'
        ),
        _(
          'In leaderboard _PARAM0_, save score _PARAM1_ for the player and extra data from _PARAM2_ (store success message in _PARAM3_ or error in _PARAM4_)'
        ),
        _('Leaderboards'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'string',
        'Leaderboard name (e.g: "PlayersBestTimes")',
        '',
        false
      )
      .addParameter('expression', 'Score to register for the player', '', false)
      .addParameter(
        'scenevar',
        _('Optional variable with metadata to save'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Variable where to store the success message (optional)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.setPlayerScore');

    extension
      .addAction(
        'LoadPlayerEntry',
        _('Load player entry'),
        _('Load the player entry in the given leaderboard'),
        _(
          'Load player entry from leaderboard _PARAM0_. Set rank in _PARAM1_, score in _PARAM2_ (extra data if any in _PARAM3_ and error in _PARAM4_)'
        ),
        _('Leaderboards'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'string',
        _('Leaderboard name (e.g: "PlayersBestTimes")'),
        '',
        false
      )
      .addParameter(
        'scenevar',
        _('Variable where to store the player rank (of -1 if not ranked)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Variable where to store the player score (of -1 if no score)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Variable where to store extra data (if any)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.getPlayerEntry');

    extension
      .addCondition(
        'AreAdsSupported',
        _('Check if ads are supported'),
        _(
          'Check if showing ads is supported on this device (only mobile phones can show ads)'
        ),
        _('Ads can be shown on this device'),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.areAdsSupported');

    extension
      .addCondition(
        'IsInterstitialAdReady',
        _('Is the interstitial ad ready'),
        _(
          'Check if the interstitial ad requested from Facebook is loaded and ready to be shown.'
        ),
        _('The interstitial ad is loaded and ready to be shown'),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.facebookInstantGames.isInterstitialAdReady'
      );

    extension
      .addAction(
        'LoadInterstitialAd',
        _('Load and prepare an interstitial ad'),
        _(
          'Request and load an interstitial ad from Facebook, so that it is ready to be shown.'
        ),
        _(
          'Request and load an interstitial ad from Facebook (ad placement id: _PARAM0_, error in _PARAM1_)'
        ),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'string',
        _(
          'The Ad Placement id (can be found while setting up the ad on Facebook)'
        ),
        '',
        false
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.loadInterstitialAd');

    extension
      .addAction(
        'ShowInterstitialAd',
        _('Show the loaded interstitial ad'),
        _(
          "Show the interstitial ad previously loaded in memory. This won't work if you did not load the interstitial before."
        ),
        _(
          'Show the interstitial ad previously loaded in memory (if any error, store it in _PARAM0_)'
        ),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.showInterstitialAd');

    extension
      .addCondition(
        'IsRewardedVideoReady',
        _('Is the rewarded video ready'),
        _(
          'Check if the rewarded video requested from Facebook is loaded and ready to be shown.'
        ),
        _('The rewarded video is loaded and ready to be shown'),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.facebookInstantGames.isRewardedVideoReady'
      );

    extension
      .addAction(
        'LoadRewardedVideo',
        _('Load and prepare a rewarded video'),
        _(
          'Request and load a rewarded video from Facebook, so that it is ready to be shown.'
        ),
        _(
          'Request and load a rewarded video from Facebook (ad placement id: _PARAM0_, error in _PARAM1_)'
        ),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'string',
        _(
          'The Ad Placement id (can be found while setting up the ad on Facebook)'
        ),
        '',
        false
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.loadRewardedVideo');

    extension
      .addAction(
        'ShowRewardedVideo',
        _('Show the loaded rewarded video'),
        _(
          "Show the rewarded video previously loaded in memory. This won't work if you did not load the video before."
        ),
        _(
          'Show the rewarded video previously loaded in memory (if any error, store it in _PARAM0_)'
        ),
        _('Ads'),
        'JsPlatform/Extensions/facebookicon32.png',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .addParameter(
        'scenevar',
        _(
          'Variable where to store the error message (optional, if an error occurs)'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.showRewardedVideo');

    extension
      .addStrExpression(
        'PlayerId',
        _('Player identifier'),
        _('Get the player unique identifier'),
        '',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.getPlayerId');

    extension
      .addStrExpression(
        'PlayerName',
        _('Player name'),
        _('Get the player name'),
        '',
        'JsPlatform/Extensions/facebookicon32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/FacebookInstantGames/facebookinstantgamestools.js'
      )
      .setFunctionName('gdjs.evtTools.facebookInstantGames.getPlayerName');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
