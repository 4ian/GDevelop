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
        'DeviceSensors',
        _('Device sensors'),
        _('Allow the game to access the sensors of a mobile device.'),
        'Matthias Meike',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/device-sensors')
      .setCategory('Input');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Device sensors'))
      .setIcon('JsPlatform/Extensions/orientation_active32.png');

    extension
      .addCondition(
        'OrientationSensorActive',
        _('Sensor active'),
        _(
          'The condition is true if the device orientation sensor is currently active'
        ),
        _('Orientation sensor is active'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_active32.png',
        'JsPlatform/Extensions/orientation_active32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.isActive');

    extension
      .addCondition(
        'OrientationAlpha',
        _('Compare the value of orientation alpha'),
        _('Compare the value of orientation alpha. (Range: 0 to 360°)'),
        _('the orientation alpha'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_alpha32.png',
        'JsPlatform/Extensions/orientation_alpha32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationAlpha');

    extension
      .addCondition(
        'OrientationBeta',
        _('Compare the value of orientation beta'),
        _('Compare the value of orientation beta. (Range: -180 to 180°)'),
        _('the orientation beta'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_beta32.png',
        'JsPlatform/Extensions/orientation_beta32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationBeta');

    extension
      .addCondition(
        'OrientationGamma',
        _('Compare the value of orientation gamma'),
        _('Compare the value of orientation gamma. (Range: -90 to 90°)'),
        _('the orientation gamma'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_gamma32.png',
        'JsPlatform/Extensions/orientation_gamma32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationGamma');

    extension
      .addAction(
        'ActivateOrientationListener',
        _('Activate orientation sensor'),
        _('Activate the orientation sensor. (remember to turn it off again)'),
        _('Activate the orientation sensor.'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_active32.png',
        'JsPlatform/Extensions/orientation_active32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName(
        'gdjs.deviceSensors.orientation.activateOrientationSensor'
      );

    extension
      .addAction(
        'DeactivateOrientationListener',
        _('Deactivate orientation sensor'),
        _('Deactivate the orientation sensor.'),
        _('Deactivate the orientation sensor.'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_inactive32.png',
        'JsPlatform/Extensions/orientation_inactive32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName(
        'gdjs.deviceSensors.orientation.deactivateOrientationSensor'
      );

    extension
      .addExpression(
        'OrientationAbsolute',
        _('Is Absolute'),
        _('Get if the devices orientation is absolute and not relative'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_absolute16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationAbsolute');

    extension
      .addExpression(
        'OrientationAlpha',
        _('Alpha value'),
        _('Get the devices orientation Alpha (compass)'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_alpha16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationAlpha');

    extension
      .addExpression(
        'OrientationBeta',
        _('Beta value'),
        _('Get the devices orientation Beta'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_beta16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationBeta');

    extension
      .addExpression(
        'OrientationGamma',
        _('Gamma value'),
        _('Get the devices orientation Gamma value'),
        _('Orientation'),
        'JsPlatform/Extensions/orientation_gamma16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.orientation.getOrientationGamma');

    extension
      .addCondition(
        'MotionSensorActive',
        _('Sensor active'),
        _(
          'The condition is true if the device motion sensor is currently active'
        ),
        _('Motion sensor is active'),
        _('Motion'),
        'JsPlatform/Extensions/motion_active32.png',
        'JsPlatform/Extensions/motion_active32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.isActive');

    extension
      .addCondition(
        'RotationAlpha',
        _('Compare the value of rotation alpha'),
        _(
          'Compare the value of rotation alpha. (Note: few devices support this sensor)'
        ),
        _('the rotation alpha'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_alpha32.png',
        'JsPlatform/Extensions/motion_rotation_alpha32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationAlpha');

    extension
      .addCondition(
        'RotationBeta',
        _('Compare the value of rotation beta'),
        _(
          'Compare the value of rotation beta. (Note: few devices support this sensor)'
        ),
        _('the rotation beta'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_beta32.png',
        'JsPlatform/Extensions/motion_rotation_beta32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationBeta');

    extension
      .addCondition(
        'RotationGamma',
        _('Compare the value of rotation gamma'),
        _(
          'Compare the value of rotation gamma. (Note: few devices support this sensor)'
        ),
        _('the rotation gamma'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_gamma32.png',
        'JsPlatform/Extensions/motion_rotation_gamma32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationGamma');

    extension
      .addCondition(
        'AccelerationX',
        _('Compare the value of acceleration on X-axis'),
        _('Compare the value of acceleration on the X-axis (m/s²).'),
        _('the acceleration X'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_x32.png',
        'JsPlatform/Extensions/motion_acceleration_x32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationX');

    extension
      .addCondition(
        'AccelerationY',
        _('Compare the value of acceleration on Y-axis'),
        _('Compare the value of acceleration on the Y-axis (m/s²).'),
        _('the acceleration Y'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_y32.png',
        'JsPlatform/Extensions/motion_acceleration_y32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationY');

    extension
      .addCondition(
        'AccelerationZ',
        _('Compare the value of acceleration on Z-axis'),
        _('Compare the value of acceleration on the Z-axis (m/s²).'),
        _('the acceleration Z'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_z32.png',
        'JsPlatform/Extensions/motion_acceleration_z32.png'
      )
      .addParameter('relationalOperator', _('Sign of the test'), 'number')
      .addParameter('expression', _('Value (m/s²)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationZ');

    extension
      .addAction(
        'ActivateMotionListener',
        _('Activate motion sensor'),
        _('Activate the motion sensor. (remember to turn it off again)'),
        _('Activate the motion sensor.'),
        _('Motion'),
        'JsPlatform/Extensions/motion_active32.png',
        'JsPlatform/Extensions/motion_active32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.activateMotionSensor');

    extension
      .addAction(
        'DeactivateMotionListener',
        _('Deactivate motion sensor'),
        _('Deactivate the motion sensor.'),
        _('Deactivate the motion sensor.'),
        _('Motion'),
        'JsPlatform/Extensions/motion_inactive32.png',
        'JsPlatform/Extensions/motion_inactive32.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.deactivateMotionSensor');

    extension
      .addExpression(
        'RotationAlpha',
        _('Alpha value'),
        _('Get the devices rotation Alpha'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_alpha16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationAlpha');

    extension
      .addExpression(
        'RotationBeta',
        _('Beta value'),
        _('Get the devices rotation Beta'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_beta16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationBeta');

    extension
      .addExpression(
        'RotationGamma',
        _('Gamma value'),
        _('Get the devices rotation Gamma'),
        _('Motion'),
        'JsPlatform/Extensions/motion_rotation_gamma16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getRotationGamma');

    extension
      .addExpression(
        'AccelerationX',
        _('Acceleration X value'),
        _('Get the devices acceleration on the X-axis (m/s²)'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_x16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationX');

    extension
      .addExpression(
        'AccelerationY',
        _('Acceleration Y value'),
        _('Get the devices acceleration on the Y-axis (m/s²)'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_y16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationY');

    extension
      .addExpression(
        'AccelerationZ',
        _('Acceleration Z value'),
        _('Get the devices acceleration on the Z-axis (m/s²)'),
        _('Motion'),
        'JsPlatform/Extensions/motion_acceleration_z16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DeviceSensors/devicesensortools.js')
      .setFunctionName('gdjs.deviceSensors.motion.getAccelerationZ');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
