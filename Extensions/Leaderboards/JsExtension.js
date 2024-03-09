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
        'Leaderboards',
        _('Leaderboards'),
        _('Allow your game to send scores to your leaderboards.'),
        'Florian Rival',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/leaderboards')
      .setCategory('Players')
      .addInstructionOrExpressionGroupMetadata(_('Leaderboards'))
      .setIcon('JsPlatform/Extensions/leaderboard.svg');

    extension
      .addAction(
        'SavePlayerScore',
        _('Save player score'),
        _("Save the player's score to the given leaderboard."),
        _(
          'Send to leaderboard _PARAM1_ the score _PARAM2_ with player name: _PARAM3_'
        ),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('leaderboardId', _('Leaderboard'), '', false)
      .addParameter(
        'expression',
        _('Score to register for the player'),
        '',
        false
      )
      .addParameter('string', _('Name to register for the player'), '', false)
      .setParameterLongDescription(
        _(
          'Let this empty to let the leaderboard auto-generate a player name (e.g: "Player23464"). You can configure this in the leaderboard administration.'
        )
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/sha256.js')
      .addIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.savePlayerScore')
      .setAsyncFunctionName('gdjs.evtTools.leaderboards.savePlayerScore');

    extension
      .addAction(
        'SaveConnectedPlayerScore',
        _('Save connected player score'),
        _("Save the connected player's score to the given leaderboard."),
        _(
          'Send to leaderboard _PARAM1_ the score _PARAM2_ for the connected player'
        ),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('leaderboardId', _('Leaderboard'), '', false)
      .addParameter(
        'expression',
        _('Score to register for the player'),
        '',
        false
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/sha256.js')
      .addIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.saveConnectedPlayerScore')
      .setAsyncFunctionName(
        'gdjs.evtTools.leaderboards.saveConnectedPlayerScore'
      );

    extension
      .addCondition(
        'HasLastSaveErrored',
        _('Last score save has errored'),
        _('Check if the last attempt to save a score has errored.'),
        _('Last score save in leaderboard _PARAM0_ has errored'),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter('leaderboardId', _('Leaderboard'), '', true)
      .setParameterLongDescription(
        _(
          'If no leaderboard is specified, will return the value related to the last leaderboard save action.'
        )
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.hasSavingErrored');

    extension
      .addCondition(
        'HasLastSaveSucceeded',
        _('Last score save has succeeded'),
        _('Check if the last attempt to save a score has succeeded.'),
        _('Last score save in leaderboard _PARAM0_ has succeeded'),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter('leaderboardId', _('Leaderboard'), '', true)
      .setParameterLongDescription(
        _(
          'If no leaderboard is specified, will return the value related to the last leaderboard save action that successfully ended.'
        )
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.hasBeenSaved');

    extension
      .addCondition(
        'IsSaving',
        _('Score is saving'),
        _('Check if a score is currently being saved in leaderboard.'),
        _('Score is saving in leaderboard _PARAM0_'),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter('leaderboardId', _('Leaderboard'), '', true)
      .setParameterLongDescription(
        _(
          'If no leaderboard is specified, will return the value related to the last leaderboard save action.'
        )
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isSaving');

    extension
      .addCondition(
        'HasPlayerJustClosedLeaderboardView',
        _('Closed by player'),
        _('Check if the player has just closed the leaderboard view.'),
        _('Player has just closed the leaderboard view'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName(
        'gdjs.evtTools.leaderboards.hasPlayerJustClosedLeaderboardView'
      );

    extension
      .addStrExpression(
        'LastSaveError',
        _('Error of last save attempt'),
        _('Get the error of the last save attempt.'),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter('leaderboardId', _('Leaderboard'), '', true)
      .setParameterLongDescription(
        _(
          'If no leaderboard is specified, will return the value related to the last leaderboard save action.'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.getLastSaveError');

    extension
      .addCondition(
        'IsLeaderboardViewErrored',
        _('Leaderboard display has errored'),
        _('Check if the display of the leaderboard errored.'),
        _('Leaderboard display has errored'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isLeaderboardViewErrored');

    extension
      .addCondition(
        'IsLeaderboardViewLoaded',
        _('Leaderboard display has loaded'),
        _(
          'Check if the display of the leaderboard has finished loading and been displayed on screen.'
        ),
        _('Leaderboard display has loaded and is displayed on screen'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isLeaderboardViewLoaded');

    extension
      .addCondition(
        'IsLeaderboardViewLoading',
        _('Leaderboard display is loading'),
        _('Check if the display of the leaderboard is loading.'),
        _('Leaderboard display is loading'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isLeaderboardViewLoading');

    extension
      .addStrExpression(
        'FormatPlayerName',
        _('Format player name'),
        _('Formats a name so that it can be submitted to a leaderboard.'),
        _('Save score'),
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter('string', _('Raw player name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.formatPlayerName');

    extension
      .addAction(
        'DisplayLeaderboard',
        _('Display leaderboard'),
        _(
          'Display the specified leaderboard on top of the game. If a leaderboard was already displayed on top of the game, the new leaderboard will replace it.'
        ),
        _('Display leaderboard _PARAM1_ (display a loader: _PARAM2_)'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('leaderboardId', _('Leaderboard'), '', false)
      .addParameter(
        'yesorno',
        _('Display loader while leaderboard is loading'),
        '',
        false
      )
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.displayLeaderboard');

    extension
      .addAction(
        'CloseLeaderboardView',
        _('Close current leaderboard'),
        _('Close the leaderboard currently displayed on top of the game.'),
        _('Close current leaderboard displayed on top of the game'),
        _('Display leaderboard'),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setHelpPath('/all-features/leaderboards')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.closeLeaderboardView');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
