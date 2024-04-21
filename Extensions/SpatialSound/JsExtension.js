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
        'SpatialSound',
        _('Spatial sound'),
        _(
          'Allow positioning sounds in a 3D space. The stereo system of the device is used to simulate the position of the sound and to give the impression that the sound is located somewhere around the player.'
        ),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setCategory('Audio');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Spatial sound'))
      .setIcon('res/actions/son24.png');

    extension
      .addAction(
        'SetSoundPosition',
        _('Set position of sound'),
        _(
          "Sets the spatial position of a sound. When a sound is at a distance of 1 to the listener, it's heard at 100% volume. Then, it follows an *inverse distance model*. At a distance of 2, it's heard at 50%, and at a distance of 4 it's heard at 25%."
        ),
        _(
          'Set position of sound on channel _PARAM1_ to position _PARAM2_, _PARAM3_, _PARAM4_'
        ),
        '',
        'res/actions/son24.png',
        'res/actions/son.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('expression', _('Channel'), '', false)
      .addParameter('expression', _('X position'), '', false)
      .addParameter('expression', _('Y position'), '', false)
      .addParameter('expression', _('Z position'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SpatialSound/howler.spatial.min.js')
      .addIncludeFile('Extensions/SpatialSound/spatialsoundtools.js')
      .setFunctionName('gdjs.evtTools.spatialSound.setSoundPosition');

    extension
      .addAction(
        'SetListenerPosition',
        _('Listener position'),
        _('Change the spatial position of the listener/player.'),
        _('Change the listener position to _PARAM0_, _PARAM1_, _PARAM2_'),
        '',
        'res/actions/son24.png',
        'res/actions/son.png'
      )
      .addParameter('expression', _('X position'), '', false)
      .addParameter('expression', _('Y position'), '', false)
      .addParameter('expression', _('Z position'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SpatialSound/howler.spatial.min.js')
      .setFunctionName('Howler.pos');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
