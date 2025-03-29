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
      .setExtensionHelpPath('/all-features/device-vibration')
      .setCategory('User interface');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Save State'))
      .setIcon('JsPlatform/Extensions/vibration_start32.png');

    extension
      .addAction(
        'SyncAll',
        _('Save the whole game'),
        _('Save the wole game.'),
        _('Syncall'),
        'res/conditions/animation24.png',
        'res/conditions/animation.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/savestatetools.js')
      .setFunctionName('gdjs.saveState.saveWholeGame');

    extension
      .addAction(
        'LoadAll',
        _('Load the whole game'),
        _('Load the wole game.'),
        _('Loadall'),
        'res/conditions/animation24.png',
        'res/conditions/animation.png'
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
