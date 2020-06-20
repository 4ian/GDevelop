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
  createExtension: function(_/*: (string) => string */, gd/*: libGDevelop */) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "Screenshot",
      _("Screenshot"),
      _(
        "Save screenshots of a running game."
      ),
      "Matthias Meike",
      "Open source (MIT License)"
    ).setExtensionHelpPath("/all-features/screenshot");

    extension
      .addAction(
        "TakeScreenshot",
        _("Take screenshot"),
        _("Take a screenshot of the game, and save it to a png file (supported only when running on Windows/Linux/macOS)."),
        _("Take a screenshot and save at _PARAM1_"),
        _("Screenshot"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter("string", _("Save path"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/Screenshot/screenshottools.js"
      )
      .setFunctionName("gdjs.screenshot.takeScreenshot");

    return extension;
  },
  runExtensionSanityTests: function(gd /*: libGDevelop */, extension /*: gdPlatformExtension*/) { return []; },
};
