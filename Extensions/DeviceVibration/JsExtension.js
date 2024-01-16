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
        'DeviceVibration',
        _('Device vibration'),

        'This allows to trigger vibrations on mobile devices.',
        'Matthias Meike',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/device-vibration')
      .setCategory('User interface');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Device vibration'))
      .setIcon('JsPlatform/Extensions/vibration_start32.png');

    extension
      .addDependency()
      .setName('Vibration Cordova Extension')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-vibration')
      .setVersion('3.1.1');

    extension
      .addAction(
        'StartVibration',
        _('Vibrate'),
        _('Vibrate (Duration in ms).'),
        _('Start vibration for _PARAM0_ ms'),
        '',
        'JsPlatform/Extensions/vibration_start32.png',
        'JsPlatform/Extensions/vibration_start32.png'
      )
      .addParameter('expression', _('Duration'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceVibration/devicevibrationtools.js')
      .setFunctionName('gdjs.deviceVibration.startVibration');

    extension
      .addAction(
        'StartVibrationPattern',
        _('Vibrate by pattern'),
        _(
          'Vibrate (Duration in ms). You can add multiple comma-separated values where every second value determines the period of silence between two vibrations. This is a string value so use quotes.'
        ),
        _('Start vibration for _PARAM0_ ms'),
        '',
        'JsPlatform/Extensions/vibration_pattern_start32.png',
        'JsPlatform/Extensions/vibration_pattern_start32.png'
      )
      .addParameter(
        'string',
        _('Intervals (for example "500,100,200"'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceVibration/devicevibrationtools.js')
      .setFunctionName('gdjs.deviceVibration.startVibrationPattern');

    extension
      .addAction(
        'StopVibration',
        _('Stop vibration'),
        _('Stop the vibration'),
        _('Stop vibration'),
        '',
        'JsPlatform/Extensions/vibration_stop32.png',
        'JsPlatform/Extensions/vibration_stop32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceVibration/devicevibrationtools.js')
      .setFunctionName('gdjs.deviceVibration.stopVibration');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
