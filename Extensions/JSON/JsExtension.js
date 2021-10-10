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
        'JSON',
        _('JSON'),
        _('A set of JSON loading actions'),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setExtensionHelpPath('/all-features/json');

    extension
      .addAction(
        'LoadJSONResource',
        _('Load JSON resource'),
        _('Loads a JSON resource into a scene variable.'),
        _('Load JSON resource _PARAM1_ in variable _PARAM2_'),
        _('JSON'),
        'JsPlatform/Extensions/filesystem_load_file24.png',
        'JsPlatform/Extensions/filesystem_load_file16.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('jsonResource', _('The JSON resource to load'), '', false)
      .addParameter(
        'scenevar',
        'The variable to load the resource into',
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/JSON/jsontools.js')
      .setFunctionName('gdjs.evtTools.json.loadJSONResource');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
