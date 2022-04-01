// @flow
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

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Leaderboards',
        _('Leaderboards'),
        _('Allow your game to send scores to your leaderboards.'),
        'Florian Rival',
        'Open source (MIT License)'
      )
      .setCategory('Leaderboards');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Leaderboards'))
      .setIcon('JsPlatform/Extensions/leaderboard.svg');

    extension
      .addAction(
        'SavePlayerScore',
        _('Save player score'),
        _("Save the player's score to the given leaderboard."),
        _(
          'Send to leaderboard _PARAM1_ the score _PARAM2_ with player name: _PARAM3_.'
        ),
        '',
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
      .addParameter(
        'scenevar',
        _('Variable where to store the saved score (optional)'),
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
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.setPlayerScore');

    extension
      .addCondition(
        'LastSentEntrySaveFailed',
        _('Last entry failed to save'),
        _('Check if the last sent entry failed to save in the leaderboard.'),
        _('Last entry failed to be saved in the leaderboard'),
        _(''),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.hasLastEntrySaveFailed');

    extension
      .addCondition(
        'IsLeaderboardViewErrored',
        _('Leaderboard display has errored'),
        _('Check if the display of the leaderboard errored.'),
        _('Leaderboard display has errored'),
        _(''),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
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
        _(''),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isLeaderboardViewLoaded');

    extension
      .addCondition(
        'IsLeaderboardViewLoading',
        _('Leaderboard display is loading'),
        _('Check if the display of the leaderboard is loading.'),
        _('Leaderboard display is loading'),
        _(''),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.isLeaderboardViewLoading');

    extension
      .addStrExpression(
        'LastSentEntryStatusCode',
        _('Status code of last sent entry'),
        _('Get the status code of the last sent leaderboard entry.'),
        _(''),
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.getLastSentEntryStatusCode');

    extension
      .addStrExpression(
        'FormatPlayerName',
        _('Format player name'),
        _('Formats a name so that it can be submitted to a leaderboard.'),
        _(''),
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
        _('Display leaderboard _PARAM1_ (display loader _PARAM2_)'),
        '',
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
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.displayLeaderboard');

    extension
      .addAction(
        'CloseLeaderboardView',
        _('Close current leaderboard'),
        _('Close the leaderboard currently displayed on top of the game.'),
        _('Close current leaderboard displayed on top of the game'),
        '',
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.closeLeaderboardView');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
