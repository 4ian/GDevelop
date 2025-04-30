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
        'SaveState',
        _('Save State'),

        'This allows to save and load whole games.',
        'Neyl Mahfouf',
        'Gdevelop'
      )
      .setExtensionHelpPath('/all-features/save-state')
      .setCategory('Save & Load');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Save State'))
      .setIcon('JsPlatform/Extensions/snapshotsave.svg');

    // TODO: Split save action and load action into 2 different instructions to avoid
    // having optional and empty parameters.
    extension
      .addAction(
        'SaveGameSnapshot',
        _('Save game'),
        _('Takes a snapshot of the game and save it to a variable or device storage.'),
        _('Save the game to variable _PARAM1_ or to storage under key _PARAM2_.'),
        '',
        'res/actions/Save-single-action-down.svg',
        'res/actions/Save-single-action-down.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'variable',
        _('Variable to store the save to (optional)'),
        '',
        true
      )
      .addParameter('string', _('Storage key to save to (optional)'), '', true)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveGameSnapshot');

    extension
      .addAction(
        'LoadGameSnapshot',
        _('Load game'),
        _('Load game from snapshot save from a variable or storage.'),
        _(
          'Load the game from variable _PARAM1_ or from device storage under key _PARAM2_.'
        ),
        '',
        'res/actions/Save-single-action-up.svg',
        'res/actions/Save-single-action-up.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'variable',
        _('Variable to load game from (optional)'),
        '',
        true
      )
      .addParameter(
        'string',
        _('Storage key to load game from (optional)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.loadGameFromSnapshot');

    // TODO: Add condition and expression to get the last save creation datetime.

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
