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
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'FileSystem',
        _('Filesystem'),
        _('Access the filesystem of the operating system.'),
        'Matthias Meike',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/filesystem');

    extension
      .addCondition(
        'PathExists',
        _('File or directory exists'),
        _('Check if the file or directory exists.'),
        _('The path _PARAM0_ exists'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_path_exists24.png',
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
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_create_folder24.png',
        'JsPlatform/Extensions/filesystem_create_folder32.png'
      )
      .addParameter('string', _('Directory'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.makeDirectory');

    extension
      .addAction(
        'SaveStringToFileSync',
        _('Save a text into a file'),
        _(
          'Save a text into a file. Only use this on small files to avoid any lag or freeze during the the game execution.'
        ),
        _('Save _PARAM0_ into file _PARAM1_'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('string', _('String (text)'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
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
        _('Filesystem/Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('string', _('String (text)'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveStringToFileAsync');

    extension
      .addAction(
        'SaveVariableToJSONFileSync',
        _('Save a scene variable into a JSON file'),
        _(
          'Save a scene variable (including, for structure, all the children) into a file in JSON format. Only use this on small files to avoid any lag or freeze during the the game execution.'
        ),
        _('Save scene variable _PARAM0_ into file PARAM1 as JSON'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
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
        _('Save scene variable _PARAM0_ into file PARAM1 as JSON'),
        _('Filesystem/Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Save path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.saveVariableToJSONFileAsync');

    extension
      .addAction(
        'LoadStringFromFileAsync',
        _('Load a text from a file (Async)'),
        _(
          "Load a text from a file, asynchronously. Use this for large files to avoid any lag or freeze during game execution. The content of the file will be available in the scene variable after a small delay (usually a few milliseconds). The 'result' variable gets updated when the operation has finished."
        ),
        _('Load text from _PARAM1_ into scene variable _PARAM0_ (Async)'),
        _('Filesystem/Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_load_file24.png',
        'JsPlatform/Extensions/filesystem_load_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadStringFromFileAsync');

    extension
      .addAction(
        'LoadStringFromFileSync',
        _('Load a text from a file'),
        _(
          'Load a text from a file. Only use this on small files to avoid any lag or freeze during the the game execution.'
        ),
        _('Load text from _PARAM1_ into scene variable _PARAM0_'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_load_file24.png',
        'JsPlatform/Extensions/filesystem_load_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadStringFromFile');

    extension
      .addAction(
        'LoadVariableFromJSONFileSync',
        _('Load a scene variable from a JSON file'),
        _(
          'Load a JSON formatted text from a file and convert it to a scene variable (potentially a structure variable with children). Only use this on small files to avoid any lag or freeze during the the game execution.'
        ),
        _('Load JSON from _PARAM1_ into scene variable _PARAM0_'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
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
        _('Filesystem/Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_save_file24.png',
        'JsPlatform/Extensions/filesystem_save_file32.png'
      )
      .addParameter('scenevar', _('Scene variable'), '', false)
      .addParameter('string', _('Load path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.loadVariableFromJSONFileAsync');

    extension
      .addAction(
        'DeleteFile',
        _('Delete a file'),
        _('Delete a file from the filesystem.'),
        _('Delete the file _PARAM0_'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_delete_file24.png',
        'JsPlatform/Extensions/filesystem_delete_file32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
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
        _('Delete a file from the filesystem asyncrounouse.'),
        _('Delete the file _PARAM0_'),
        _('Filesystem/Windows, Linux, MacOS/Asynchronous'),
        'JsPlatform/Extensions/filesystem_delete_file24.png',
        'JsPlatform/Extensions/filesystem_delete_file32.png'
      )
      .addParameter('string', _('File path'), '', false)
      .addParameter(
        'scenevar',
        _(
          "(Optional) Variable to store the result. 'ok': task was successful, 'error': an error occured."
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.deleteFileAsync');

    extension
      .addStrExpression(
        'DesktopPath',
        _('Desktop folder'),
        _('Get the path to the desktop folder.'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
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
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
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
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getPicturesPath');

    extension
      .addStrExpression(
        'ExecutablePath',
        _('This games executable folder'),
        _('Get the path to this games executable folder.'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getExecutablePath');

    extension
      .addStrExpression(
        'UserdataPath',
        _('Userdata folder (For application settings)'),
        _('Get the path to userdata folder. (For application settings)'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getUserdataPath');

    extension
      .addStrExpression(
        'TempPath',
        _('Temp folder'),
        _('Get the path to temp folder.'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
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
        _('Get the operating system agnostic path delimiter.'),
        _('Filesystem/Windows, Linux, MacOS'),
        'JsPlatform/Extensions/filesystem_folder24.png',
        'JsPlatform/Extensions/filesystem_folder32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/FileSystem/filesystemtools.js')
      .setFunctionName('gdjs.fileSystem.getPathDelimiter');

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
