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
  runExtensionSanityTests: function(gd, extension) { return []; },
};
