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
        'Steamworks',
        _('Steamworks (Steam)'),
        _("Adds integrations for steam's steamworks game development SDK."),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setCategory('Third-party');

    extension
      .addInstructionOrExpressionGroupMetadata(_('Steamworks (steam)'))
      .setIcon('res/actions/son24.png');

    extension
      .registerProperty('AppID')
      .setLabel(_('Steam App ID'))
      .setDescription(
        'Your steam app ID, obtained from the steamworks partner website.'
      )
      .setType('number')
      .setValue(480);

    extension
      .registerProperty('RequireSteam')
      .setDescription(_('Require steam to launch the game'))
      .setType('boolean')
      .setValue(false);

    extension
      .addDependency()
      .setName('Steamworks')
      .setDependencyType('npm')
      .setExportName('steamworks.js')
      .setVersion('0.2.0');

    extension
      .addAction(
        'ClaimAchievement',
        _('Achievements/Claim achievement'),
        _(
          "Marks a steam achievement as obtained. Steam will pop-up a notification wit the achievement's data defined on the steamworks partner website."
        ),
        _('Claim steam achievement _PARAM0_'),
        '',
        'res/actions/son24.png',
        'res/actions/son.png'
      )
      .addParameter(
        'identifier',
        _('Achievement ID'),
        'steamAchievement',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.claimAchievement');

    extension
      .addAction(
        'UnclaimAchievement',
        _('Achievements/Unclaim achievement'),
        _("Removes a player's steam achievement."),
        _('Unclaim steam achievement _PARAM0_'),
        '',
        'res/actions/son24.png',
        'res/actions/son.png'
      )
      .addParameter(
        'identifier',
        _('Achievement ID'),
        'steamAchievement',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.unclaimAchievement');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
