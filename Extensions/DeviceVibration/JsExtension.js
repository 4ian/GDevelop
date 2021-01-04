// @flow
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

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function(_/*: (string) => string */, gd/*: libGDevelop */) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "DeviceVibration",
      _("Device vibration"),
      _(
        "Use the vibration of mobile devices."
      ),
      "Matthias Meike",
      "Open source (MIT License)"
    ).setExtensionHelpPath("/all-features/device-vibration");

    extension
      .addDependency()
      .setName('Vibration Cordova Extension')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-vibration')
      .setVersion('3.1.1');

    extension
      .addAction(
        "StartVibration",
        _("Vibrate"),
        _("Vibrate (Duration in ms)."),
        _("Start vibration for _PARAM0_ ms"),
        _("Vibration"),
        "JsPlatform/Extensions/vibration_start24.png",
        "JsPlatform/Extensions/vibration_start32.png"
      )
        .addParameter("expression", _("Duration"), "", false)
        .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/DeviceVibration/devicevibrationtools.js"
      )
      .setFunctionName("gdjs.deviceVibration.startVibration");

      extension
      .addAction(
        "StartVibrationPattern",
        _("Vibrate by pattern"),
        _("Vibrate (Duration in ms). You can add multiple comma-separated values where every second value determines the period of silence between two vibrations. This is a string value so use quotes."),
        _("Start vibration for _PARAM0_ ms"),
        _("Vibration"),
        "JsPlatform/Extensions/vibration_pattern_start24.png",
        "JsPlatform/Extensions/vibration_pattern_start32.png"
      )
        .addParameter("string", _("Intervals (for example \"500,100,200\""), "", false)
        .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/DeviceVibration/devicevibrationtools.js"
      )
      .setFunctionName("gdjs.deviceVibration.startVibrationPattern");

      extension
      .addAction(
        "StopVibration",
        _("Stop vibration"),
        _("Stop the vibration"),
        _("Stop vibration"),
        _("Vibration"),
        "JsPlatform/Extensions/vibration_stop24.png",
        "JsPlatform/Extensions/vibration_stop32.png"
      )
        .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/DeviceVibration/devicevibrationtools.js"
      )
      .setFunctionName("gdjs.deviceVibration.stopVibration");

    return extension;
  },
  runExtensionSanityTests: function(gd /*: libGDevelop */, extension /*: gdPlatformExtension*/) { return []; },
};
