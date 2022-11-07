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
    extension.setExtensionInformation(
      'Choose',
      _('Choose'),
      _('Choose a random value given a list of strings.'),
      'Ulises Freitas',
      'MIT'
    );
    extension
      .addInstructionOrExpressionGroupMetadata(_('Choose'))
      .setIcon('res/choose32.png');

    // Register Properties
    // Register Cordova/NPM dependencies
    // Declare conditions, actions or expressions:
    extension
      .addExpression(
        'ChooseNumber',
        _('Choose numbers from the list'),
        _('Add a comma-separated list of numbers'),
        '',
        'res/choose16.png'
      )
      .addParameter('string', _('The string containing all options to choose randomly from, separated by commas'), 'Example: "1,2,3"', false)
      .getCodeExtraInformation()
	  .setIncludeFile(
        'Extensions/Choose/chooseextensiontools.js'
      )
      .setFunctionName('gdjs.evtTools.choose.randomNumber');

    extension
      .addStrExpression(
        'ChooseString',
        _('Choose strings from the list'),
        _('Add a comma-separated list of strings'),
        '',
        'res/choose16.png'
      )
	  .addParameter('string', _('The string containing all options to choose randomly from, separated by commas'), 'Example: "option1,option2,option3"', false)
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/Choose/chooseextensiontools.js'
      )
      .setFunctionName('gdjs.evtTools.choose.randomString');

    return extension;
  },
  
    /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
	) {},

};
