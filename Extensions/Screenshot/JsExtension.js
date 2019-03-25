/**
 * This is a declaration of an extension for GDevelop 5.
 * 
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 * 
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it. 
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 * 
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
  createExtension: function (_, gd) {
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
  runExtensionSanityTests: function (gd, extension) { return []; },
};
