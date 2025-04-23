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
    extension
      .addAction(
        'SaveGame',
        _('Save the whole game'),
        _('Save the whole game to a scene variable or storage name.'),
        _('Save the game to _PARAM1_ (scene variable) or to storage _PARAM2_.'),
        '',
        'res/actions/Save-single-action-down.svg',
        'res/actions/Save-single-action-down.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'scenevar',
        _('Scene variable to store the save (optional)'),
        '',
        true
      )
      .addParameter('string', _('Storage name to save to (optional)'), '', true)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveGamSnapshot');

    extension
      .addAction(
        'LoadGame',
        _('Load game save.'),
        _('Load a game save from a scene variable or storage.'),
        _(
          'Load the game save from _PARAM1_ (scene variable) or storage _PARAM2_.'
        ),
        '',
        'res/actions/Save-single-action-up.svg',
        'res/actions/Save-single-action-up.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'scenevar',
        _('Scene variable to load from (optional)'),
        '',
        true
      )
      .addParameter(
        'string',
        _('Storage name to load from (optional)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.loadGameFromSnapshot');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
