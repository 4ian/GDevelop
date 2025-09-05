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
        _('Allows to save and load the full state of a game.'),
        'Neyl Mahfouf',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/save-state')
      .setCategory('Save & Load');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Save State'))
      .setIcon('res/actions/saveDown.svg');

    // TODO: Split save action and load action into 2 different instructions to avoid
    // having optional and empty parameters.
    extension
      .addAction(
        'SaveGameSnapshotToVariable',
        _('Save game to a variable'),
        _('Takes a snapshot of the game and save it to a variable.'),
        _('Save the game in variable _PARAM1_'),
        '',
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable to store the save to'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveVariableGameSnapshot');

    extension
      .addAction(
        'SaveGameSnapshotToStorage',
        _('Save game to device storage'),
        _('Takes a snapshot of the game and save it to device storage.'),
        _('Save the game to device storage under key _PARAM1_'),
        '',
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Storage key to save to'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveStorageGameSnapshot');

    extension
      .addAction(
        'LoadGameSnapshotFromVariable',
        _('Load game from variable'),
        _('Load game from a variable save snapshot.'),
        _('Load the game from variable _PARAM1_'),
        '',
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable to load the game from'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.loadGameFromVariableSnapshot');

    extension
      .addAction(
        'LoadGameSnapshotFromStorage',
        _('Load game from storage'),
        _('Load game from storage save snapshot.'),
        _('Load the game from device storage under key _PARAM1_.'),
        '',
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Storage key to load the game from'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.loadGameFromStorageSnapshot');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'SecondsSinceLastSave',
        _('Seconds since last save'),
        _('the number of seconds since the last save'),
        _('the number of seconds since the last save'),
        '',
        'res/actions/saveDown.svg'
      )
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('gdjs.saveState.getSecondsSinceLastSave')
      .setGetter('gdjs.saveState.getSecondsSinceLastSave');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
