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
        'FileSystem',
        _('File system'),
        _('Access the filesystem of the operating system.'),
        'Matthias Meike',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/filesystem')
      .setCategory('Advanced');
    extension
      .addInstructionOrExpressionGroupMetadata(_('File system'))
      .setIcon('JsPlatform/Extensions/filesystem_create_folder32.png');

    extension
      .addCondition(
        'PathExists',
        _('File or directory exists'),
        _('Check if the file or directory exists.'),
        _('The path _PARAM0_ exists'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_path_exists32.png',
        'JsPlatform/Extensions/filesystem_path_exists32.png'
      )
      .addParameter('string', _('Path to file or directory'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.pathExists');

    extension
      .addAction(
        'MakeDirectory',
        _('Create a directory'),
        _('Create a new directory at the specified path.'),
        _('Create directory _PARAM0_'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_create_folder32.png',
        'JsPlatform/Extensions/filesystem_create_folder32.png'
      )
      .addParameter('string', _('Directory'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.makeDirectory')
      .setAsyncFunctionName('gdjs.fileSystem.makeDirectoryAsync');

    extension
      .addAction(
        'SaveStringToFileSync',
        _('Save a text into a file'),
        _(
          'Save a text into a file. Only use this on small files to avoid any lag or freeze during the game execution.'
        ),
        _('Save _PARAM0_ into file _PARAM1_'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('string', _('String (text)'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveStringToFile');

    extension
      .addAction(
        'SaveStringToFileAsync',
        _('Save a text into a file (Async)'),
        _(
          "Save a text into a file asynchronously. Use this for large files to avoid any lag or freeze during game execution. The 'result' variable gets updated when the operation has finished."
        ),
        _('Save _PARAM0_ into file _PARAM1_'),
        _('Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('string', _('String (text)'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveStringToFileAsync')
      .setAsyncFunctionName('gdjs.fileSystem.saveStringToFileAsyncTask');

    extension
      .addAction(
        'SaveVariableToJSONFileSync',
        _('Save a scene variable into a JSON file'),
        _(
          'Save a scene variable (including, for structure, all the children) into a file in JSON format. Only use this on small files to avoid any lag or freeze during the game execution.'
        ),
        _('Save scene variable _PARAM0_ into file _PARAM1_ as JSON'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveVariableToJSONFile');

    extension
      .addAction(
        'SaveVariableToJSONFileAsync',
        _('Save a scene variable into a JSON file (Async)'),
        _(
          "Save the scene variable (including, for structures, all the children) into a file in JSON format, asynchronously. Use this for large files to avoid any lag or freeze during game execution. The 'result' variable gets updated when the operation has finished."
        ),
        _('Save scene variable _PARAM0_ into file _PARAM1_ as JSON'),
        _('Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveVariableToJSONFileAsync')
      .setAsyncFunctionName('gdjs.fileSystem.saveVariableToJSONFileAsyncTask');

    extension
      .addAction(
        'LoadStringFromFileAsync',
        _('Load a text from a file (Async)'),
        _(
          "Load a text from a file, asynchronously. Use this for large files to avoid any lag or freeze during game execution. The content of the file will be available in the scene variable after a small delay (usually a few milliseconds). The 'result' variable gets updated when the operation has finished."
        ),
        _('Load text from _PARAM1_ into scene variable _PARAM0_ (Async)'),
        _('Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_load_file32.png',
        'JsPlatform/Extensions/filesystem_load_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .addParameter(
        'yesorno',
        _('Normalize the file content (recommended)'),
        '',
        true
      )
      .setParameterLongDescription(
        _(
          'This replaces Windows new lines characters ("CRLF") by a single new line character.'
        )
      )
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadStringFromFileAsync')
      .setAsyncFunctionName('gdjs.fileSystem.loadStringFromFileAsyncTask');

    extension
      .addAction(
        'LoadStringFromFileSync',
        _('Load a text from a file'),
        _(
          'Load a text from a file. Only use this on small files to avoid any lag or freeze during the game execution.'
        ),
        _('Load text from _PARAM1_ into scene variable _PARAM0_'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_load_file32.png',
        'JsPlatform/Extensions/filesystem_load_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .addParameter(
        'yesorno',
        _('Normalize the file content (recommended)'),
        '',
        true
      )
      .setParameterLongDescription(
        _(
          'This replaces Windows new lines characters ("CRLF") by a single new line character.'
        )
      )
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadStringFromFile');

    extension
      .addAction(
        'LoadVariableFromJSONFileSync',
        _('Load a scene variable from a JSON file'),
        _(
          'Load a JSON formatted text from a file and convert it to a scene variable (potentially a structure variable with children). Only use this on small files to avoid any lag or freeze during the game execution.'
        ),
        _('Load JSON from _PARAM1_ into scene variable _PARAM0_'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .addParameter(
        'yesorno',
        _('Normalize the file content (recommended)'),
        '',
        true
      )
      .setParameterLongDescription(
        _(
          'This replaces Windows new lines characters ("CRLF") by a single new line character.'
        )
      )
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadVariableFromJSONFile');

    extension
      .addAction(
        'LoadVariableFromJSONFileAsync',
        _('Load a scene variable from a JSON file (Async)'),
        _(
          "Load a JSON formatted text from a file and convert it to a scene variable (potentially a structure variable with children), asynchronously. Use this for large files to avoid any lag or freeze during game execution. The content of the file will be available as a scene variable after a small delay (usually a few milliseconds). The 'result' variable gets updated when the operation has finished."
        ),
        _('Load JSON from _PARAM1_ into scene variable _PARAM0_'),
        _('Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file32.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .addParameter(
        'yesorno',
        _('Normalize the file content (recommended)'),
        '',
        true
      )
      .setParameterLongDescription(
        _(
          'This replaces Windows new lines characters ("CRLF") by a single new line character.'
        )
      )
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadVariableFromJSONFileAsync')
      .setAsyncFunctionName(
        'gdjs.fileSystem.loadVariableFromJSONFileAsyncTask'
      );

    extension
      .addAction(
        'DeleteFile',
        _('Delete a file'),
        _('Delete a file from the filesystem.'),
        _('Delete the file _PARAM0_'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_delete_file32.png',
        'JsPlatform/Extensions/filesystem_delete_file32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.deleteFile');

    extension
      .addAction(
        'DeleteFileAsync',
        _('Delete a file (Async)'),
        _(
          'Delete a file from the filesystem asynchronously. The option result variable will be updated once the file is deleted.'
        ),
        _('Delete the file _PARAM0_'),
        _('Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_delete_file32.png',
        'JsPlatform/Extensions/filesystem_delete_file32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occurred."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.deleteFileAsync')
      .setAsyncFunctionName('gdjs.fileSystem.deleteFileAsyncTask');

    extension
      .addStrExpression(
        'DesktopPath',
        _('Desktop folder'),
        _('Get the path to the desktop folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getDesktopPath');

    extension
      .addStrExpression(
        'DocumentsPath',
        _('Documents folder'),
        _('Get the path to the documents folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getDocumentsPath');

    extension
      .addStrExpression(
        'PicturesPath',
        _('Pictures folder'),
        _('Get the path to the pictures folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getPicturesPath');

    extension
      .addStrExpression(
        'ExecutablePath',
        _('Game executable file'),
        _('Get the path to this game executable file.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getExecutablePath');

    extension
      .addStrExpression(
        'ExecutableFolderPath',
        _('Game executable folder'),
        _('Get the path to this game executable folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getExecutableFolderPath');

    extension
      .addStrExpression(
        'UserdataPath',
        _('Userdata folder (for application settings)'),
        _('Get the path to userdata folder (for application settings).'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getUserdataPath');

    extension
      .addStrExpression(
        'UserHomePath',
        _("User's Home folder"),
        _('Get the path to the user home folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getUserHomePath');

    extension
      .addStrExpression(
        'TempPath',
        _('Temp folder'),
        _('Get the path to temp folder.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getTempPath');

    extension
      .addStrExpression(
        'PathDelimiter',
        _('Path delimiter'),
        _('Get the operating system path delimiter.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getPathDelimiter');

    extension
      .addStrExpression(
        'DirectoryName',
        _('Get directory name from a path'),
        _(
          'Returns the portion of the path that represents the directories, without the ending file name.'
        ),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addParameter('string', _('File or folder path'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getDirectoryName');

    extension
      .addStrExpression(
        'FileName',
        _('Get file name from a path'),
        _('Returns the name of the file with its extension, if any.'),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getFileName');

    extension
      .addStrExpression(
        'ExtensionName',
        _('Get the extension from a file path'),
        _(
          'Returns the extension of the file designated by the given path, including the extension period. For example: ".txt".'
        ),
        _('Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getExtensionName');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
