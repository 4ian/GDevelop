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
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "Screenshot",
      t("Screenshot"),
      t(
        "Save screenshots of a running game."
      ),
      "Matthias Meike",
      "Open source (MIT License)"
    ).setExtensionHelpPath("/all-features/screenshot");

    extension
      .addAction(
        "TakeScreenshot",
        t("Take screenshot"),
        t("Take a screenshot as png. (Desktop only)"),
        t("Take a screenshot and save at _PARAM0_"),
        t("Screenshot"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
        .addParameter("string", t("Save path"), "", false)
        .addCodeOnlyParameter('currentScene', '')
        .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/Screenshot/screenshottools.js"
      )
      .setFunctionName("gdjs.screenshot.takeScreenshot");

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) { return []; },
};
