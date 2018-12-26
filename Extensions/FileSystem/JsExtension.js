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
  createExtension: function (t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "FileSystem",
      t("Filesystem"),
      t(
        "Access the filesystem of the operating system."
      ),
      "Matthias Meike",
      "Open source (MIT License)"
    ).setExtensionHelpPath("/all-features/filesystem");

    extension
      .addStrExpression(
        "SpecialFolderDesktop",
        t("Desktop folder"),
        t("Get the path to the desktop folder."),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderDesktop");

    extension
      .addStrExpression(
        "SpecialFolderDocuments",
        t("Documents folder"),
        t("Get the path to the documents folder."),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderDocuments");

      extension
      .addStrExpression(
        "SpecialFolderPictures",
        t("Pictures folder"),
        t("Get the path to the pictures folder."),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderPictures");

      extension
      .addStrExpression(
        "SpecialFolderExecutable",
        t("This games executable folder"),
        t("Get the path to this games executable folder."),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderExecutable");

      extension
      .addStrExpression(
        "SpecialFolderUserdata",
        t("Userdata folder (For application settings)"),
        t("Get the path to userdata folder. (For application settings)"),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderUserdata");

      extension
      .addStrExpression(
        "SpecialFolderTemp",
        t("Temp folder"),
        t("Get the path to temp folder."),
        t("Special folders/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.filesystem.getFolderTemp");

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) { return []; },
};
