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
      .addCondition(
        "PathExists",
        t("File or directory exists"),
        t(
          "Check if the file or directory exists."
        ),
        t("The path _PARAM0_ exists"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_path_exists24.png",
        "JsPlatform/Extensions/filesystem_path_exists32.png"
      )
      .addParameter("string", t("Path to file or directory"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.pathExists");

    extension
      .addAction(
        "MakeDirectory",
        t("Create a directory"),
        t("Create a new directory at the specified path."),
        t("Create directory _PARAM0_"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_create_folder24.png",
        "JsPlatform/Extensions/filesystem_create_folder32.png"
      )
      .addParameter("string", t("Directory"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.makeDirectory");

    extension
      .addAction(
        "SaveStringToFile",
        t("Save a text into a file"),
        t("Save a text into a file."),
        t("Save _PARAM0_ into file _PARAM1_"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_save_file24.png",
        "JsPlatform/Extensions/filesystem_save_file32.png"
      )
      .addParameter("string", t("String (text)"), "", false)
      .addParameter("string", t("Save path"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.saveStringToFile");

    extension
      .addAction(
        "LoadStringFromFileAsync",
        t("Load a text from a file (Async)"),
        t("Load a text from a file asynchronously. Use this for large files to not delay game execution. (The content of the file will not be available immediately)"),
        t("Load text from _PARAM1_ into scene variable _PARAM0_ (Async)"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_load_file24.png",
        "JsPlatform/Extensions/filesystem_load_file32.png"
      )
      .addParameter("scenevar", t("Scene variable"), "", false)
      .addParameter("string", t("Load path"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.loadStringFromFileAsync");

    extension
      .addAction(
        "LoadStringFromFileSync",
        t("Load a text from a file"),
        t("Load a text from a file. Only use this on small files to not delay the game execution."),
        t("Load text from _PARAM1_ into scene variable _PARAM0_"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_load_file24.png",
        "JsPlatform/Extensions/filesystem_load_file32.png"
      )
      .addParameter("scenevar", t("Scene variable"), "", false)
      .addParameter("string", t("Load path"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.loadStringFromFileSync");

    extension
      .addAction(
        "DeleteFile",
        t("Delete a file"),
        t("Delete a file from the filesystem."),
        t("Delete the file _PARAM0_"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_delete_file24.png",
        "JsPlatform/Extensions/filesystem_delete_file32.png"
      )
      .addParameter("string", t("File path"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.deleteFile");

    extension
      .addStrExpression(
        "DesktopPath",
        t("Desktop folder"),
        t("Get the path to the desktop folder."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getDesktopPath");

    extension
      .addStrExpression(
        "DocumentsPath",
        t("Documents folder"),
        t("Get the path to the documents folder."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getDocumentsPath");

    extension
      .addStrExpression(
        "PicturesPath",
        t("Pictures folder"),
        t("Get the path to the pictures folder."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getPicturesPath");

    extension
      .addStrExpression(
        "ExecutablePath",
        t("This games executable folder"),
        t("Get the path to this games executable folder."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getExecutablePath");

    extension
      .addStrExpression(
        "UserdataPath",
        t("Userdata folder (For application settings)"),
        t("Get the path to userdata folder. (For application settings)"),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getUserdataPath");

    extension
      .addStrExpression(
        "TempPath",
        t("Temp folder"),
        t("Get the path to temp folder."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getTempPath");

    extension
      .addStrExpression(
        "PathDelimiter",
        t("Path delimiter"),
        t("Get the operating system agnostic path delimiter."),
        t("Filesystem/Windows, Linux, MacOS"),
        "JsPlatform/Extensions/filesystem_folder24.png",
        "JsPlatform/Extensions/filesystem_folder32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FileSystem/filesystemtools.js"
      )
      .setFunctionName("gdjs.fileSystem.getPathDelimiter");

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) { return []; },
};
