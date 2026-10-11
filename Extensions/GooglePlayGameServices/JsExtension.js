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
        'GooglePlayGameServices',
        _('Google Play Games Services'),
        _(
          'Allow Devs to use Google Play Games Services API for android.'
        ),
        'planktonfun',
        'MIT'
      )
      .setCategory('Third-party');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Google Play Games Services'))
      .setIcon('https://developers.google.com/static/games/services/images/not-yet-friends.svg');

    extension
      .registerProperty('ApplicationId')
      .setLabel(_('Application ID'))
      .setDescription('The application ID string consists only of the digits (typically 12 or more) at the beginning of the client ID provided by the Google Play Console')
      .setType('string');

    extension
      .addDependency()
      .setName('Cordova Android Play Services Gradle')
      .setDependencyType('cordova')
      .setExportName('cordova-android-play-services-gradle-release')
      .setVersion('4.0.0');

    extension
      .addDependency()
      .setName('Cordova Play Games Services Plugin')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-play-games-services')
      .setVersion('1.1.2')
      .setExtraSetting(
        'APP_ID',
        new gd.PropertyDescriptor('ApplicationId').setType(
          'ExtensionProperty'
        )
      )
      .onlyIfOtherDependencyIsExported('Cordova Android Play Services Gradle');

    // Banner
    extension
      .addCondition(
        'GameServicesReadyAndroid',
        _('Google Play Games Services Android is ready'),
        _(
          'Checks if google play games services Android is ready.'
        ),
        _('Google Play Games Services Android is ready'),
        '',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/googlePlayGameServices/tools.js')
      .setFunctionName('gdjs.evtTools.googlePlayGameServices.gameServicesReady');

    extension
      .addAction(
        'GooglePlayServicesAndroidAPI',
        _('Calls Google Play Services Android API'),
        _('Calls Google Play Services Android API.'),
        _('Calls Google Play Services Android API method _PARAM0_ then save results to scene variable _PARAM1_'),
        '',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg'
      )
      .addParameter('string', _('Method'), '', false)
      .setParameterLongDescription(
        'Method'
      )
      .addParameter('string', _('ResultSceneVariable'), '', false)
      .setParameterLongDescription(
        'ResultSceneVariable'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/googlePlayGameServices/tools.js')
      .setFunctionName('gdjs.evtTools.googlePlayGameServices.gameServicesReady');

    extension
      .addAction(
        'GooglePlayServicesAndroidAPIwParameters',
        _('Calls Google Play Services Android API w/ Parameters'),
        _('Calls Google Play Services Android API w/ Parameters.'),
        _('Calls Google Play Services Android API method _PARAM0_ with parameter scene variable _PARAM1_ then save results to scene variable _PARAM2_'),
        '',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg',
        'https://developers.google.com/static/games/services/images/not-yet-friends.svg'
      )
      .addParameter('string', _('Method'), '', false)
      .setParameterLongDescription(
        'Method'
      )
      .addParameter('string', _('ParameterSceneVariable'), '', false)
      .setParameterLongDescription(
        'ParameterSceneVariable'
      )
      .addParameter('string', _('ResultSceneVariable'), '', false)
      .setParameterLongDescription(
        'ResultSceneVariable'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/googlePlayGameServices/tools.js')
      .setFunctionName('gdjs.evtTools.googlePlayGameServices.gameServicesReady');
    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
