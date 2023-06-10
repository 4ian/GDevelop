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
        _("Adds integrations for Steam's Steamworks game development SDK."),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setCategory('Third-party');

    extension
      .addInstructionOrExpressionGroupMetadata(_('Steamworks (Steam)'))
      .setIcon('res/actions/son24.png');

    extension
      .registerProperty('AppID')
      .setLabel(_('Steam App ID'))
      .setDescription(
        'Your Steam app ID, obtained from the Steamworks partner website.'
      )
      .setType('number')
      .setValue(480);

    extension
      .registerProperty('RequireSteam')
      .setDescription(_('Require Steam to launch the game'))
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
        _('Claim achievement'),
        _(
          "Marks a Steam achievement as obtained. Steam will pop-up a notification wit the achievement's data defined on the Steamworks partner website."
        ),
        _('Claim steam achievement _PARAM0_'),
        _('Achievements'),
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
        _('Unclaim achievement'),
        _("Removes a player's Steam achievement."),
        _('Unclaim Steam achievement _PARAM0_'),
        _('Achievements'),
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

    extension
      .addCondition(
        'HasAchievement',
        _('Has achievement'),
        _("Checks if a player owns one of this game's Steam achievement."),
        _('Player has previously claimed the Steam achievement _PARAM0_'),
        _('Achievements'),
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
      .setFunctionName('gdjs.steamworks.hasAchievement');

    extension
      .addStrExpression(
        'SteamID',
        _('Steam ID'),
        _(
          "The player's unique Steam ID number. Note that it is too big a number to load correctly as a float, and must be used as a string."
        ),
        _('Player'),
        'JsPlatform/Extensions/icon.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getSteamId');

    extension
      .addStrExpression(
        'Name',
        _('Name'),
        _("The player's registered name on Steam."),
        _('Player'),
        'JsPlatform/Extensions/icon.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getName');

    extension
      .addStrExpression(
        'CountryCode',
        _('Country code'),
        _("The player's country represented as its two-letter code."),
        _('Player'),
        'JsPlatform/Extensions/icon.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCountry');

    extension
      .addExpression(
        'Level',
        _('Steam Level'),
        _("Obtains the player's Steam level"),
        _('Player'),
        'JsPlatform/Extensions/icon.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLevel');

    extension
      .addAction(
        'SetRichPresence',
        _('Change the Steam rich presence'),
        _(
          "Changes an attribute of Steam's rich presence. Allows other player to see exactly what the player's currently doing in the game."
        ),
        _('Set steam rich presence attribute _PARAM0_ to _PARAM1_'),
        _('Rich presence'),
        'JsPlatform/Extensions/icon.png',
        'JsPlatform/Extensions/icon.png'
      )
      .addParameter(
        'stringWithSelector',
        'The attribute to change',
        JSON.stringify([
          'status',
          'connect',
          'steam_display',
          'steam_player_group',
          'steam_player_group_size',
        ]),
        /*parameterIsOptional=*/ false
      )
      .setParameterLongDescription(
        '[Click here](https://partner.steamgames.com/doc/api/ISteamFriends#SetRichPresence) to find out more about the different default rich-presence attributes.'
      )
      .addParameter(
        'string',
        'The new value for that attribute',
        '',
        /*parameterIsOptional=*/ false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.setRichPresence');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
