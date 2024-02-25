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
        'Screenshot',
        _('Screenshot'),
        'Allows to save screenshots of a running game.',
        'Matthias Meike',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/screenshot')
      .setCategory('Advanced');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Screenshot'))
      .setIcon('JsPlatform/Extensions/take_screenshot32.png');

    extension
      .addAction(
        'TakeScreenshot',
        _('Take screenshot'),
        _(
          'Take a screenshot of the game, and save it to a png file (supported only when running on Windows/Linux/macOS).'
        ),
        _('Take a screenshot and save at _PARAM1_'),
        '',
        'JsPlatform/Extensions/take_screenshot32.png',
        'JsPlatform/Extensions/take_screenshot32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Save path'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Screenshot/screenshottools.js')
      .setFunctionName('gdjs.screenshot.takeScreenshot');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
