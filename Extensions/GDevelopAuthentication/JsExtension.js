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
        'GDevelop Authentication',
        _('Player Authentication (experimental)'),
        _('Allow your game to authenticate players.'),
        'Florian Rival',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/authentication')
      .setCategory('Authentication');
    extension
      .addInstructionOrExpressionGroupMetadata(
        _('Player Authentication (experimental)')
      )
      .setIcon('JsPlatform/Extensions/authentication.svg');

    extension
      .addDependency()
      .setName('InAppBrowser Cordova plugin')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-inappbrowser');

    extension
      .addAction(
        'DisplayAuthenticationBanner',
        _('Display authentication banner'),
        _('Display the authentication banner for the player.'),
        _('Display the authentication banner for the player'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setHelpPath('/all-features/authentication')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/GDevelopAuthentication/gdevelopauthenticationtools.js'
      )
      .setFunctionName(
        'gdjs.gdevelopAuthentication.displayAuthenticationBanner'
      );

      extension
      .addAction(
        'DisplayAuthenticationWindow',
        _('Display authentication window'),
        _('Display the authentication window for the player.'),
        _('Display the authentication window for the player'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setHelpPath('/all-features/authentication')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/GDevelopAuthentication/gdevelopauthenticationtools.js'
      )
      .setFunctionName(
        'gdjs.gdevelopAuthentication.displayAuthenticationWindow'
      );

    extension
      .addExpression(
        'Username',
        _('Username'),
        _('Get the username of the authenticated player.'),
        '',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/GDevelopAuthentication/gdevelopauthenticationtools.js'
      )
      .setFunctionName('gdjs.gdevelopAuthentication.getUsername');

    extension
      .addCondition(
        'IsPlayerAuthenticated',
        _('Player is authenticated'),
        _('Check if the player is authenticated.'),
        _('Player is authenticated'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/GDevelopAuthentication/gdevelopauthenticationtools.js'
      )
      .setFunctionName('gdjs.gdevelopAuthentication.isAuthenticated');

    extension
      .addCondition(
        'HasPlayerLoggedIn',
        _('Player has just logged in'),
        _('Check if the player has just logged in.'),
        _('Player has logged in'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/GDevelopAuthentication/gdevelopauthenticationtools.js'
      )
      .setFunctionName('gdjs.gdevelopAuthentication.hasLoggedIn');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
