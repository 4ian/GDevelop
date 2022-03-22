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
        _("Save the player's score to a giver leaderboard."),
        _(
          'Send to leaderboard _PARAM0_ the score _PARAM1_ with player name: _PARAM2_.'
        ),
        '',
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .addParameter(
        'string',
        'Leaderboard name (e.g: "PlayersBestTimes")',
        '',
        false
      )
      .addParameter('expression', 'Score to register for the player', '', false)
      .addParameter('string', 'Name to register for the player', '', false)
      .addParameter(
        'scenevar',
        _('Variable where to store the saved score'),
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
        _('Check if the last sent entry failed to save'),
        _('Last entry failed to be saved in leaderboard'),
        _(''),
        'JsPlatform/Extensions/leaderboard.svg',
        'JsPlatform/Extensions/leaderboard.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Leaderboards/leaderboardstools.js')
      .setFunctionName('gdjs.evtTools.leaderboards.lastEntrySaveFailed');

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

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
