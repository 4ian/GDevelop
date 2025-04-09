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
        _('Save the whole game'),
        _('Save the game.'),
        '',
        'res/actions/save.svg',
        'res/actions/save.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveWholeGame');

    extension
      .addAction(
        'LoadGame',
        _('Load game save.'),
        _('Load a game save.'),
        _('Load a game save'),
        '',
        'res/actions/save.svg',
        'res/actions/save.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.loadWholeGame');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
