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
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        "DeviceSensors",
        t("Device sensors"),
        t("Allow the game to access the sensors of a mobile device."),
        "Matthias Meike",
        "Open source (MIT License)"
      )
      .setExtensionHelpPath("/all-features/device-sensors");

    extension
      .addCondition(
        "OrientationSensorActive",
        t("Sensor active"),
        t(
          "The condition is true if the device orientation sensor is currently active"
        ),
        t("Orientation sensor is active"),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_active24.png",
        "JsPlatform/Extensions/orientation_active32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.isActive");

    extension
      .addCondition(
        "OrientationAlpha",
        t("Compare the value of orientation alpha"),
        t("Compare the value of orientation alpha. (Range: 0 to 360°)"),
        t("Orientation alpha is _PARAM0__PARAM1_"),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_alpha24.png",
        "JsPlatform/Extensions/orientation_alpha32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationAlpha");

    extension
      .addCondition(
        "OrientationBeta",
        t("Compare the value of orientation beta"),
        t("Compare the value of orientation beta. (Range: -180 to 180°)"),
        t("Orientation beta is _PARAM0__PARAM1_"),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_beta24.png",
        "JsPlatform/Extensions/orientation_beta32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationBeta");

    extension
      .addCondition(
        "OrientationGamma",
        t("Compare the value of orientation gamma"),
        t("Compare the value of orientation gamma. (Range: -90 to 90°)"),
        t("Orientation gamma is _PARAM0__PARAM1_"),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_gamma24.png",
        "JsPlatform/Extensions/orientation_gamma32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationGamma");

    extension
      .addAction(
        "ActivateOrientationListener",
        t("Activate orientation sensor"),
        t("Activate the orientation sensor. (remember to turn it off again)"),
        t("Activate the orientation sensor."),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_active24.png",
        "JsPlatform/Extensions/orientation_active32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName(
        "gdjs.deviceSensors.orientation.activateOrientationSensor"
      );

    extension
      .addAction(
        "DeactivateOrientationListener",
        t("Deactivate orientation sensor"),
        t("Deactivate the orientation sensor."),
        t("Deactivate the orientation sensor."),
        t("Sensors/Orientation"),
        "JsPlatform/Extensions/orientation_inactive24.png",
        "JsPlatform/Extensions/orientation_inactive32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName(
        "gdjs.deviceSensors.orientation.deactivateOrientationSensor"
      );

    extension
      .addExpression(
        "OrientationAbsolute",
        t("Is Absolute"),
        t("Get if the devices orientation is absolute and not relative"),
        t("Sensors/Orientation")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationAbsolute");

    extension
      .addExpression(
        "OrientationAlpha",
        t("Alpha value"),
        t("Get the devices orientation Alpha (compass)"),
        t("Sensors/Orientation")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationAlpha");

    extension
      .addExpression(
        "OrientationBeta",
        t("Beta value"),
        t("Get the devices orientation Beta"),
        t("Sensors/Orientation")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationBeta");

    extension
      .addExpression(
        "OrientationGamma",
        t("Gamma value"),
        t("Get the devices orientation Gamma value"),
        t("Sensors/Orientation")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.orientation.getOrientationGamma");

    extension
      .addCondition(
        "MotionSensorActive",
        t("Sensor active"),
        t(
          "The condition is true if the device motion sensor is currently active"
        ),
        t("Motion sensor is active"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_active24.png",
        "JsPlatform/Extensions/motion_active32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.isActive");

    extension
      .addCondition(
        "RotationAlpha",
        t("Compare the value of rotation alpha"),
        t(
          "Compare the value of rotation alpha. (Note: few devices support this sensor)"
        ),
        t("Rotation alpha is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_rotation_alpha24.png",
        "JsPlatform/Extensions/motion_rotation_alpha32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationAlpha");

    extension
      .addCondition(
        "RotationBeta",
        t("Compare the value of rotation beta"),
        t(
          "Compare the value of rotation beta. (Note: few devices support this sensor)"
        ),
        t("Rotation beta is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_rotation_beta24.png",
        "JsPlatform/Extensions/motion_rotation_beta32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationBeta");

    extension
      .addCondition(
        "RotationGamma",
        t("Compare the value of rotation gamma"),
        t(
          "Compare the value of rotation gamma. (Note: few devices support this sensor)"
        ),
        t("Rotation gamma is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_rotation_gamma24.png",
        "JsPlatform/Extensions/motion_rotation_gamma32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationGamma");

    extension
      .addCondition(
        "AccelerationX",
        t("Compare the value of acceleration on X-axis"),
        t("Compare the value of acceleration on the X-axis (m/s²)."),
        t("Acceleration X is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_acceleration_x24.png",
        "JsPlatform/Extensions/motion_acceleration_x32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationX");

    extension
      .addCondition(
        "AccelerationY",
        t("Compare the value of acceleration on Y-axis"),
        t("Compare the value of acceleration on the Y-axis (m/s²)."),
        t("Acceleration Y is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_acceleration_y24.png",
        "JsPlatform/Extensions/motion_acceleration_y32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationY");

    extension
      .addCondition(
        "AccelerationZ",
        t("Compare the value of acceleration on Z-axis"),
        t("Compare the value of acceleration on the Z-axis (m/s²)."),
        t("Acceleration Z is _PARAM0__PARAM1_"),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_acceleration_z24.png",
        "JsPlatform/Extensions/motion_acceleration_z32.png"
      )
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value (m/s²)"))
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationZ");

    extension
      .addAction(
        "ActivateMotionListener",
        t("Activate motion sensor"),
        t("Activate the motion sensor. (remember to turn it off again)"),
        t("Activate the motion sensor."),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_active24.png",
        "JsPlatform/Extensions/motion_active32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.activateMotionSensor");

    extension
      .addAction(
        "DeactivateMotionListener",
        t("Deactivate motion sensor"),
        t("Deactivate the motion sensor."),
        t("Deactivate the motion sensor."),
        t("Sensors/Motion"),
        "JsPlatform/Extensions/motion_inactive24.png",
        "JsPlatform/Extensions/motion_inactive32.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.deactivateMotionSensor");

    extension
      .addExpression(
        "RotationAlpha",
        t("Alpha value"),
        t("Get the devices rotation Alpha"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationAlpha");

    extension
      .addExpression(
        "RotationBeta",
        t("Beta value"),
        t("Get the devices rotation Beta"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationBeta");

    extension
      .addExpression(
        "RotationGamma",
        t("Gamma value"),
        t("Get the devices rotation Gamma"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getRotationGamma");

    extension
      .addExpression(
        "AccelerationX",
        t("Acceleration X value"),
        t("Get the devices acceleration on the X-axis (m/s²)"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationX");

    extension
      .addExpression(
        "AccelerationY",
        t("Acceleration Y value"),
        t("Get the devices acceleration on the Y-axis (m/s²)"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationY");

    extension
      .addExpression(
        "AccelerationZ",
        t("Acceleration Z value"),
        t("Get the devices acceleration on the Z-axis (m/s²)"),
        t("Sensors/Motion")
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/DeviceSensors/devicesensortools.js")
      .setFunctionName("gdjs.deviceSensors.motion.getAccelerationZ");

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  }
};
