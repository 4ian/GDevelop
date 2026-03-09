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
        'Scene3D',
        _('3D'),
        _(
          'Support for 3D in GDevelop: this provides 3D objects and the common features for all 3D objects.'
        ),
        'Florian Rival',
        'MIT'
      )
      .setShortDescription(
        '3D objects (box, model), 3D camera, Z position/rotation/size. Base 3D capability for all objects.'
      )
      .setDimension('3D')
      .setCategory('General');
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D'))
      .setIcon('res/conditions/3d_box.svg');

    {
      const base3D = extension
        .addBehavior(
          'Base3DBehavior',
          _('3D capability'),
          'Object3D',
          _(
            'Common features for all 3D objects: position in 3D space (including the Z axis, in addition to X and Y), size (including depth, in addition to width and height), rotation (on X and Y axis, in addition to the Z axis), scale (including Z axis, in addition to X and Y), flipping (on Z axis, in addition to horizontal (Y)/vertical (X) flipping).'
          ),
          '',
          'res/conditions/3d_box.svg',
          'Base3DBehavior',
          new gd.Behavior(),
          new gd.BehaviorsSharedData()
        )
        .setHidden()
        .setIncludeFile('Extensions/3D/Base3DBehavior.js');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'Z',
          _('Z (elevation)'),
          _('the Z position (the "elevation")'),
          _('the Z position'),
          _('Position'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setZ')
        .setGetter('getZ');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'CenterZ',
          _('Center Z position'),
          _('the Z position of the center of rotation'),
          _('the Z position of the center'),
          _('Position ❯ Center'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setCenterZInScene')
        .setGetter('getCenterZInScene');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'Depth',
          _('Depth (size on Z axis)'),
          _('the depth (size on Z axis)'),
          _('the depth'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setDepth')
        .setGetter('getDepth');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleZ',
          _('Scale on Z axis'),
          _('the scale on Z axis of an object (default scale is 1)'),
          _('the scale on Z axis scale'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setScaleZ')
        .setGetter('getScaleZ');

      base3D
        .addScopedAction(
          'FlipZ',
          _('Flip the object on Z'),
          _('Flip the object on Z axis'),
          _('Flip on Z axis _PARAM0_: _PARAM2_'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setFunctionName('flipZ');

      base3D
        .addScopedCondition(
          'FlippedZ',
          _('Flipped on Z'),
          _('Check if the object is flipped on Z axis'),
          _('_PARAM0_ is flipped on Z axis'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .setFunctionName('isFlippedZ');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'RotationX',
          _('Rotation on X axis'),
          _('the rotation on X axis'),
          _('the rotation on X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setFunctionName('setRotationX')
        .setGetter('getRotationX');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'RotationY',
          _('Rotation on Y axis'),
          _('the rotation on Y axis'),
          _('the rotation on Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setFunctionName('setRotationY')
        .setGetter('getRotationY');

      base3D
        .addScopedAction(
          'TurnAroundX',
          _('Turn around X axis'),
          _(
            "Turn the object around X axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundX');

      base3D
        .addScopedAction(
          'TurnAroundY',
          _('Turn around Y axis'),
          _(
            "Turn the object around Y axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundY');

      base3D
        .addScopedAction(
          'TurnAroundZ',
          _('Turn around Z axis'),
          _(
            "Turn the object around Z axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around Z axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundZ');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();

      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (!behaviorContent.hasChild(propertyName)) {
          if (propertyName === 'enabled') {
            behaviorContent.addChild(propertyName).setBoolValue(true);
          } else if (
            propertyName === 'targetLayerName' ||
            propertyName === 'targetEffectName'
          ) {
            behaviorContent.addChild(propertyName).setStringValue('');
          } else {
            behaviorContent.addChild(propertyName).setDoubleValue(0);
          }
        }

        if (propertyName === 'enabled') {
          behaviorContent
            .getChild('enabled')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        if (
          propertyName === 'baseIntensity' ||
          propertyName === 'flickerSpeed' ||
          propertyName === 'flickerStrength' ||
          propertyName === 'failChance' ||
          propertyName === 'offDuration'
        ) {
          const value = parseFloat(newValue);
          if (value !== value) {
            return false;
          }
          behaviorContent
            .getChild(propertyName)
            .setDoubleValue(Math.max(0, value));
          return true;
        }

        if (
          propertyName === 'targetLayerName' ||
          propertyName === 'targetEffectName'
        ) {
          behaviorContent.getChild(propertyName).setStringValue(newValue);
          return true;
        }

        return false;
      };

      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        if (!behaviorContent.hasChild('enabled')) {
          behaviorContent.addChild('enabled').setBoolValue(true);
        }
        if (!behaviorContent.hasChild('baseIntensity')) {
          behaviorContent.addChild('baseIntensity').setDoubleValue(1.0);
        }
        if (!behaviorContent.hasChild('flickerSpeed')) {
          behaviorContent.addChild('flickerSpeed').setDoubleValue(10.0);
        }
        if (!behaviorContent.hasChild('flickerStrength')) {
          behaviorContent.addChild('flickerStrength').setDoubleValue(0.4);
        }
        if (!behaviorContent.hasChild('failChance')) {
          behaviorContent.addChild('failChance').setDoubleValue(0.02);
        }
        if (!behaviorContent.hasChild('offDuration')) {
          behaviorContent.addChild('offDuration').setDoubleValue(0.1);
        }
        if (!behaviorContent.hasChild('targetLayerName')) {
          behaviorContent.addChild('targetLayerName').setStringValue('');
        }
        if (!behaviorContent.hasChild('targetEffectName')) {
          behaviorContent.addChild('targetEffectName').setStringValue('');
        }

        behaviorProperties
          .getOrCreate('enabled')
          .setValue(
            behaviorContent.getChild('enabled').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Enabled'));
        behaviorProperties
          .getOrCreate('baseIntensity')
          .setValue(
            behaviorContent
              .getChild('baseIntensity')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Base intensity'));
        behaviorProperties
          .getOrCreate('flickerSpeed')
          .setValue(
            behaviorContent
              .getChild('flickerSpeed')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Flicker speed'));
        behaviorProperties
          .getOrCreate('flickerStrength')
          .setValue(
            behaviorContent
              .getChild('flickerStrength')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Flicker strength'));
        behaviorProperties
          .getOrCreate('failChance')
          .setValue(
            behaviorContent.getChild('failChance').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setLabel(_('Failure chance (per second)'));
        behaviorProperties
          .getOrCreate('offDuration')
          .setValue(
            behaviorContent
              .getChild('offDuration')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Off duration (seconds)'));
        behaviorProperties
          .getOrCreate('targetLayerName')
          .setValue(
            behaviorContent.getChild('targetLayerName').getStringValue()
          )
          .setType('String')
          .setLabel(_('Target layer name (optional)'))
          .setDescription(
            _(
              'Optional explicit layer containing the SpotLight/PointLight effect. Leave empty to use the object layer.'
            )
          )
          .setGroup(_('Advanced'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('targetEffectName')
          .setValue(
            behaviorContent.getChild('targetEffectName').getStringValue()
          )
          .setType('String')
          .setLabel(_('Target effect name (optional)'))
          .setDescription(
            _(
              'Optional explicit effect name. Recommended when multiple 3D light effects exist on the same layer.'
            )
          )
          .setGroup(_('Advanced'))
          .setAdvanced(true);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('enabled').setBoolValue(true);
        behaviorContent.addChild('baseIntensity').setDoubleValue(1.0);
        behaviorContent.addChild('flickerSpeed').setDoubleValue(10.0);
        behaviorContent.addChild('flickerStrength').setDoubleValue(0.4);
        behaviorContent.addChild('failChance').setDoubleValue(0.02);
        behaviorContent.addChild('offDuration').setDoubleValue(0.1);
        behaviorContent.addChild('targetLayerName').setStringValue('');
        behaviorContent.addChild('targetEffectName').setStringValue('');
      };

      const flickeringLight = extension
        .addBehavior(
          'FlickeringLight',
          _('Flickering 3D light'),
          'FlickeringLight',
          _(
            'Randomly flickers Scene3D Point Light and Spot Light effects by updating their intensity every frame.'
          ),
          '',
          'res/conditions/3d_box.svg',
          'FlickeringLight',
          // @ts-ignore
          behavior,
          new gd.BehaviorsSharedData()
        )
        .setIncludeFile('Extensions/3D/FlickeringLightBehavior.js');

      flickeringLight
        .addScopedAction(
          'SetEnabled',
          _('Enable/disable flickering'),
          _('Enable or disable the light flicker simulation.'),
          _('Set flickering of _PARAM0_ to _PARAM2_'),
          _('Flickering light'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setEnabled');

      flickeringLight
        .addScopedCondition(
          'IsEnabled',
          _('Flickering enabled'),
          _('Check if the flickering logic is enabled.'),
          _('Flickering is enabled for _PARAM0_'),
          _('Flickering light'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .setFunctionName('isEnabled');

      flickeringLight
        .addScopedAction(
          'SetTargetLayerName',
          _('Set target layer'),
          _('Set the layer where the SpotLight/PointLight effect is searched.'),
          _('Set flickering target layer of _PARAM0_ to _PARAM2_'),
          _('Flickering light'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .addParameter('layer', _('Layer'), '', true)
        .setFunctionName('setTargetLayerName');

      flickeringLight
        .addScopedAction(
          'SetTargetEffectName',
          _('Set target effect'),
          _('Set the exact SpotLight/PointLight effect name to control.'),
          _('Set flickering target effect of _PARAM0_ to _PARAM2_'),
          _('Flickering light'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .addParameter('layerEffectName', _('Light effect name'))
        .setFunctionName('setTargetEffectName');

      flickeringLight
        .addExpressionAndConditionAndAction(
          'number',
          'BaseIntensity',
          _('Base intensity'),
          _('the base light intensity'),
          _('the base intensity'),
          _('Flickering light'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Base intensity used when flicker offset is 0.')
          )
        )
        .setFunctionName('setBaseIntensity')
        .setGetter('getBaseIntensity');

      flickeringLight
        .addExpressionAndConditionAndAction(
          'number',
          'FlickerSpeed',
          _('Flicker speed'),
          _('the flickering speed'),
          _('the flicker speed'),
          _('Flickering light'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('How fast the flicker oscillates.')
          )
        )
        .setFunctionName('setFlickerSpeed')
        .setGetter('getFlickerSpeed');

      flickeringLight
        .addExpressionAndConditionAndAction(
          'number',
          'FlickerStrength',
          _('Flicker strength'),
          _('the flicker strength'),
          _('the flicker strength'),
          _('Flickering light'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('How much intensity can vary around the base value.')
          )
        )
        .setFunctionName('setFlickerStrength')
        .setGetter('getFlickerStrength');

      flickeringLight
        .addExpressionAndConditionAndAction(
          'number',
          'FailChance',
          _('Failure chance'),
          _('the failure chance per second'),
          _('the failure chance per second'),
          _('Flickering light'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Probability per second for a complete temporary blackout.')
          )
        )
        .setFunctionName('setFailChance')
        .setGetter('getFailChance');

      flickeringLight
        .addExpressionAndConditionAndAction(
          'number',
          'OffDuration',
          _('Off duration'),
          _('the off duration in seconds'),
          _('the off duration'),
          _('Flickering light'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'FlickeringLight')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('How long the light stays off when a failure occurs (seconds).')
          )
        )
        .setFunctionName('setOffDuration')
        .setGetter('getOffDuration');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();

      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (!behaviorContent.hasChild('enabled')) {
          behaviorContent.addChild('enabled').setBoolValue(true);
        }

        if (propertyName === 'enabled') {
          behaviorContent
            .getChild('enabled')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }

        return false;
      };

      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        if (!behaviorContent.hasChild('enabled')) {
          behaviorContent.addChild('enabled').setBoolValue(true);
        }

        behaviorProperties
          .getOrCreate('enabled')
          .setValue(
            behaviorContent.getChild('enabled').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Enabled'));

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('enabled').setBoolValue(true);
      };

      const ssrExclude = extension
        .addBehavior(
          'SSRExclude',
          _('SSR exclude'),
          'SSRExclude',
          _('Exclude this 3D object from Scene3D screen-space reflections.'),
          '',
          'res/conditions/3d_box.svg',
          'SSRExclude',
          // @ts-ignore
          behavior,
          new gd.BehaviorsSharedData()
        )
        .setIncludeFile('Extensions/3D/SSRExcludeBehavior.js');

      ssrExclude
        .addScopedAction(
          'SetEnabled',
          _('Enable/disable SSR exclusion'),
          _('Enable or disable exclusion of this object from SSR.'),
          _('Set SSR exclusion of _PARAM0_ to _PARAM2_'),
          _('SSR exclusion'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'SSRExclude')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setEnabled');

      ssrExclude
        .addScopedCondition(
          'IsEnabled',
          _('SSR exclusion enabled'),
          _('Check if SSR exclusion is enabled for this object.'),
          _('SSR exclusion is enabled for _PARAM0_'),
          _('SSR exclusion'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'SSRExclude')
        .setFunctionName('isEnabled');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();

      const ensurePBRMaterialDefaults = function (behaviorContent) {
        if (!behaviorContent.hasChild('metalness')) {
          behaviorContent.addChild('metalness').setDoubleValue(0.0);
        }
        if (!behaviorContent.hasChild('roughness')) {
          behaviorContent.addChild('roughness').setDoubleValue(0.5);
        }
        if (!behaviorContent.hasChild('envMapIntensity')) {
          behaviorContent.addChild('envMapIntensity').setDoubleValue(1.0);
        }
        if (!behaviorContent.hasChild('emissiveColor')) {
          behaviorContent.addChild('emissiveColor').setStringValue('0;0;0');
        }
        if (!behaviorContent.hasChild('emissiveIntensity')) {
          behaviorContent.addChild('emissiveIntensity').setDoubleValue(0.0);
        }
        if (!behaviorContent.hasChild('normalScale')) {
          behaviorContent.addChild('normalScale').setDoubleValue(1.0);
        }
        if (!behaviorContent.hasChild('normalMapAsset')) {
          behaviorContent.addChild('normalMapAsset').setStringValue('');
        }
        if (!behaviorContent.hasChild('aoMapAsset')) {
          behaviorContent.addChild('aoMapAsset').setStringValue('');
        }
        if (!behaviorContent.hasChild('aoMapIntensity')) {
          behaviorContent.addChild('aoMapIntensity').setDoubleValue(1.0);
        }
        if (!behaviorContent.hasChild('map')) {
          behaviorContent.addChild('map').setStringValue('');
        }
      };

      const clampValue = function (value, min, max) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return min;
        }
        return Math.max(min, Math.min(max, numericValue));
      };

      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        ensurePBRMaterialDefaults(behaviorContent);

        if (propertyName === 'metalness') {
          behaviorContent
            .getChild('metalness')
            .setDoubleValue(clampValue(newValue, 0, 1));
          return true;
        }
        if (propertyName === 'roughness') {
          behaviorContent
            .getChild('roughness')
            .setDoubleValue(clampValue(newValue, 0, 1));
          return true;
        }
        if (propertyName === 'envMapIntensity') {
          behaviorContent
            .getChild('envMapIntensity')
            .setDoubleValue(clampValue(newValue, 0, 4));
          return true;
        }
        if (propertyName === 'emissiveColor') {
          behaviorContent.getChild('emissiveColor').setStringValue(newValue);
          return true;
        }
        if (propertyName === 'emissiveIntensity') {
          behaviorContent
            .getChild('emissiveIntensity')
            .setDoubleValue(clampValue(newValue, 0, 4));
          return true;
        }
        if (propertyName === 'normalScale') {
          behaviorContent
            .getChild('normalScale')
            .setDoubleValue(clampValue(newValue, 0, 2));
          return true;
        }
        if (propertyName === 'normalMapAsset') {
          behaviorContent.getChild('normalMapAsset').setStringValue(newValue);
          return true;
        }
        if (propertyName === 'aoMapAsset') {
          behaviorContent.getChild('aoMapAsset').setStringValue(newValue);
          return true;
        }
        if (propertyName === 'aoMapIntensity') {
          behaviorContent
            .getChild('aoMapIntensity')
            .setDoubleValue(clampValue(newValue, 0, 1));
          return true;
        }
        if (propertyName === 'map') {
          behaviorContent.getChild('map').setStringValue(newValue);
          return true;
        }

        return false;
      };

      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();
        ensurePBRMaterialDefaults(behaviorContent);

        behaviorProperties
          .getOrCreate('metalness')
          .setValue(
            behaviorContent.getChild('metalness').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Metalness'));
        behaviorProperties
          .getOrCreate('roughness')
          .setValue(
            behaviorContent.getChild('roughness').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Roughness'));
        behaviorProperties
          .getOrCreate('envMapIntensity')
          .setValue(
            behaviorContent
              .getChild('envMapIntensity')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('Environment intensity'));
        behaviorProperties
          .getOrCreate('emissiveColor')
          .setValue(behaviorContent.getChild('emissiveColor').getStringValue())
          .setType('color')
          .setLabel(_('Emissive color'));
        behaviorProperties
          .getOrCreate('emissiveIntensity')
          .setValue(
            behaviorContent
              .getChild('emissiveIntensity')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('Emissive intensity'));
        behaviorProperties
          .getOrCreate('normalScale')
          .setValue(
            behaviorContent.getChild('normalScale').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Normal scale'));
        behaviorProperties
          .getOrCreate('normalMapAsset')
          .setValue(behaviorContent.getChild('normalMapAsset').getStringValue())
          .setType('resource')
          .addExtraInfo('image')
          .setLabel(_('Normal map'));
        behaviorProperties
          .getOrCreate('aoMapAsset')
          .setValue(behaviorContent.getChild('aoMapAsset').getStringValue())
          .setType('resource')
          .addExtraInfo('image')
          .setLabel(_('AO map'));
        behaviorProperties
          .getOrCreate('aoMapIntensity')
          .setValue(
            behaviorContent
              .getChild('aoMapIntensity')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('AO intensity'));
        behaviorProperties
          .getOrCreate('map')
          .setValue(behaviorContent.getChild('map').getStringValue())
          .setType('resource')
          .addExtraInfo('image')
          .setLabel(_('Albedo map'));

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('metalness').setDoubleValue(0.0);
        behaviorContent.addChild('roughness').setDoubleValue(0.5);
        behaviorContent.addChild('envMapIntensity').setDoubleValue(1.0);
        behaviorContent.addChild('emissiveColor').setStringValue('0;0;0');
        behaviorContent.addChild('emissiveIntensity').setDoubleValue(0.0);
        behaviorContent.addChild('normalScale').setDoubleValue(1.0);
        behaviorContent.addChild('normalMapAsset').setStringValue('');
        behaviorContent.addChild('aoMapAsset').setStringValue('');
        behaviorContent.addChild('aoMapIntensity').setDoubleValue(1.0);
        behaviorContent.addChild('map').setStringValue('');
      };

      const pbrMaterial = extension
        .addBehavior(
          'PBRMaterial',
          _('PBR material'),
          'PBRMaterial',
          _(
            'Control physically based material parameters for 3D meshes using MeshStandardMaterial and MeshPhysicalMaterial.'
          ),
          '',
          'res/conditions/3d_box.svg',
          'PBRMaterial',
          // @ts-ignore
          behavior,
          new gd.BehaviorsSharedData()
        )
        .setIncludeFile('Extensions/3D/PBRMaterialBehavior.js');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'Metalness',
          _('Metalness'),
          _('the metalness'),
          _('the metalness'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setMetalness')
        .setGetter('getMetalness');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'Roughness',
          _('Roughness'),
          _('the roughness'),
          _('the roughness'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setRoughness')
        .setGetter('getRoughness');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'EnvironmentIntensity',
          _('Environment intensity'),
          _('the environment map intensity'),
          _('the environment intensity'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setEnvMapIntensity')
        .setGetter('getEnvMapIntensity');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'EmissiveIntensity',
          _('Emissive intensity'),
          _('the emissive intensity'),
          _('the emissive intensity'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setEmissiveIntensity')
        .setGetter('getEmissiveIntensity');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'NormalScale',
          _('Normal scale'),
          _('the normal map scale'),
          _('the normal scale'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setNormalScale')
        .setGetter('getNormalScale');

      pbrMaterial
        .addExpressionAndConditionAndAction(
          'number',
          'AOMapIntensity',
          _('AO map intensity'),
          _('the AO map intensity'),
          _('the AO map intensity'),
          _('PBR material'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setAOMapIntensity')
        .setGetter('getAOMapIntensity');

      pbrMaterial
        .addScopedAction(
          'SetEmissiveColor',
          _('Set emissive color'),
          _('Set the emissive color used by PBR materials on this object.'),
          _('Set emissive color of _PARAM0_ to _PARAM2_'),
          _('PBR material'),
          'res/actions/color24.png',
          'res/actions/color.png'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .addParameter('color', _('Emissive color'))
        .setFunctionName('setEmissiveColor');

      pbrMaterial
        .addScopedAction(
          'SetNormalMapAsset',
          _('Set normal map'),
          _(
            'Set the normal map resource used by PBR materials on this object.'
          ),
          _('Set normal map of _PARAM0_ to _PARAM2_'),
          _('PBR material'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .addParameter('imageResource', _('Normal map'), '', true)
        .setFunctionName('setNormalMapAsset');

      pbrMaterial
        .addScopedAction(
          'SetAOMapAsset',
          _('Set AO map'),
          _('Set the AO map resource used by PBR materials on this object.'),
          _('Set AO map of _PARAM0_ to _PARAM2_'),
          _('PBR material'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .addParameter('imageResource', _('AO map'), '', true)
        .setFunctionName('setAOMapAsset');

      pbrMaterial
        .addScopedAction(
          'SetMap',
          _('Set albedo map'),
          _(
            'Set the albedo (base color) map resource used by PBR materials on this object.'
          ),
          _('Set albedo map of _PARAM0_ to _PARAM2_'),
          _('PBR material'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PBRMaterial')
        .addParameter('imageResource', _('Albedo map'), '', true)
        .setFunctionName('setMap');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();

      const ensureLODDefaults = function (behaviorContent) {
        if (!behaviorContent.hasChild('enabled')) {
          behaviorContent.addChild('enabled').setBoolValue(true);
        }
        if (!behaviorContent.hasChild('lod1Distance')) {
          behaviorContent.addChild('lod1Distance').setDoubleValue(900);
        }
        if (!behaviorContent.hasChild('lod2Distance')) {
          behaviorContent.addChild('lod2Distance').setDoubleValue(1800);
        }
        if (!behaviorContent.hasChild('cullDistance')) {
          behaviorContent.addChild('cullDistance').setDoubleValue(3200);
        }
        if (!behaviorContent.hasChild('hysteresis')) {
          behaviorContent.addChild('hysteresis').setDoubleValue(120);
        }
        if (!behaviorContent.hasChild('updateIntervalFrames')) {
          behaviorContent.addChild('updateIntervalFrames').setDoubleValue(2);
        }
        if (!behaviorContent.hasChild('lod1AnimationSpeed')) {
          behaviorContent.addChild('lod1AnimationSpeed').setDoubleValue(0.65);
        }
        if (!behaviorContent.hasChild('lod2AnimationSpeed')) {
          behaviorContent.addChild('lod2AnimationSpeed').setDoubleValue(0);
        }
        if (!behaviorContent.hasChild('lod1CastShadows')) {
          behaviorContent.addChild('lod1CastShadows').setBoolValue(true);
        }
        if (!behaviorContent.hasChild('lod2CastShadows')) {
          behaviorContent.addChild('lod2CastShadows').setBoolValue(false);
        }
        if (!behaviorContent.hasChild('lod1ReceiveShadows')) {
          behaviorContent.addChild('lod1ReceiveShadows').setBoolValue(true);
        }
        if (!behaviorContent.hasChild('lod2ReceiveShadows')) {
          behaviorContent.addChild('lod2ReceiveShadows').setBoolValue(false);
        }
        if (!behaviorContent.hasChild('lod1ModelResource')) {
          behaviorContent.addChild('lod1ModelResource').setStringValue('');
        }
        if (!behaviorContent.hasChild('lod2ModelResource')) {
          behaviorContent.addChild('lod2ModelResource').setStringValue('');
        }
        if (!behaviorContent.hasChild('forceLevel')) {
          behaviorContent.addChild('forceLevel').setDoubleValue(-1);
        }
        if (!behaviorContent.hasChild('modelSwitchCooldownMs')) {
          behaviorContent
            .addChild('modelSwitchCooldownMs')
            .setDoubleValue(250);
        }
        if (!behaviorContent.hasChild('useBoundingRadius')) {
          behaviorContent.addChild('useBoundingRadius').setBoolValue(true);
        }
        if (!behaviorContent.hasChild('distanceScale')) {
          behaviorContent.addChild('distanceScale').setDoubleValue(1);
        }
      };

      const clampNumber = function (value, min, max) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return min;
        }
        return Math.max(min, Math.min(max, numericValue));
      };

      const clampInteger = function (value, min, max) {
        return Math.round(clampNumber(value, min, max));
      };

      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        ensureLODDefaults(behaviorContent);

        if (propertyName === 'enabled') {
          behaviorContent
            .getChild('enabled')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'lod1Distance') {
          behaviorContent
            .getChild('lod1Distance')
            .setDoubleValue(clampNumber(newValue, 0, 10000000));
          return true;
        }
        if (propertyName === 'lod2Distance') {
          behaviorContent
            .getChild('lod2Distance')
            .setDoubleValue(clampNumber(newValue, 0, 10000000));
          return true;
        }
        if (propertyName === 'cullDistance') {
          behaviorContent
            .getChild('cullDistance')
            .setDoubleValue(clampNumber(newValue, 0, 10000000));
          return true;
        }
        if (propertyName === 'hysteresis') {
          behaviorContent
            .getChild('hysteresis')
            .setDoubleValue(clampNumber(newValue, 0, 100000));
          return true;
        }
        if (propertyName === 'updateIntervalFrames') {
          behaviorContent
            .getChild('updateIntervalFrames')
            .setDoubleValue(clampInteger(newValue, 1, 30));
          return true;
        }
        if (propertyName === 'lod1AnimationSpeed') {
          behaviorContent
            .getChild('lod1AnimationSpeed')
            .setDoubleValue(clampNumber(newValue, 0, 10));
          return true;
        }
        if (propertyName === 'lod2AnimationSpeed') {
          behaviorContent
            .getChild('lod2AnimationSpeed')
            .setDoubleValue(clampNumber(newValue, 0, 10));
          return true;
        }
        if (propertyName === 'lod1CastShadows') {
          behaviorContent
            .getChild('lod1CastShadows')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'lod2CastShadows') {
          behaviorContent
            .getChild('lod2CastShadows')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'lod1ReceiveShadows') {
          behaviorContent
            .getChild('lod1ReceiveShadows')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'lod2ReceiveShadows') {
          behaviorContent
            .getChild('lod2ReceiveShadows')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'lod1ModelResource') {
          behaviorContent.getChild('lod1ModelResource').setStringValue(newValue);
          return true;
        }
        if (propertyName === 'lod2ModelResource') {
          behaviorContent.getChild('lod2ModelResource').setStringValue(newValue);
          return true;
        }
        if (propertyName === 'forceLevel') {
          behaviorContent
            .getChild('forceLevel')
            .setDoubleValue(clampInteger(newValue, -1, 3));
          return true;
        }
        if (propertyName === 'modelSwitchCooldownMs') {
          behaviorContent
            .getChild('modelSwitchCooldownMs')
            .setDoubleValue(clampNumber(newValue, 0, 5000));
          return true;
        }
        if (propertyName === 'useBoundingRadius') {
          behaviorContent
            .getChild('useBoundingRadius')
            .setBoolValue(newValue === '1' || newValue === 'true');
          return true;
        }
        if (propertyName === 'distanceScale') {
          behaviorContent
            .getChild('distanceScale')
            .setDoubleValue(clampNumber(newValue, 0.1, 8));
          return true;
        }

        return false;
      };

      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();
        ensureLODDefaults(behaviorContent);

        behaviorProperties
          .getOrCreate('enabled')
          .setValue(
            behaviorContent.getChild('enabled').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Enabled'));
        behaviorProperties
          .getOrCreate('lod1Distance')
          .setValue(
            behaviorContent.getChild('lod1Distance').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('LOD1 distance'));
        behaviorProperties
          .getOrCreate('lod2Distance')
          .setValue(
            behaviorContent.getChild('lod2Distance').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('LOD2 distance'));
        behaviorProperties
          .getOrCreate('cullDistance')
          .setValue(
            behaviorContent.getChild('cullDistance').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Cull distance'));

        behaviorProperties
          .getOrCreate('hysteresis')
          .setValue(
            behaviorContent.getChild('hysteresis').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Hysteresis'))
          .setGroup(_('Advanced'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('updateIntervalFrames')
          .setValue(
            behaviorContent
              .getChild('updateIntervalFrames')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('Update every N frames'))
          .setGroup(_('Advanced'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod1AnimationSpeed')
          .setValue(
            behaviorContent
              .getChild('lod1AnimationSpeed')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('LOD1 animation speed'))
          .setGroup(_('Animation'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod2AnimationSpeed')
          .setValue(
            behaviorContent
              .getChild('lod2AnimationSpeed')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('LOD2 animation speed'))
          .setGroup(_('Animation'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod1CastShadows')
          .setValue(
            behaviorContent.getChild('lod1CastShadows').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('LOD1 cast shadows'))
          .setGroup(_('Shadows'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod2CastShadows')
          .setValue(
            behaviorContent.getChild('lod2CastShadows').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('LOD2 cast shadows'))
          .setGroup(_('Shadows'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod1ReceiveShadows')
          .setValue(
            behaviorContent.getChild('lod1ReceiveShadows').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('LOD1 receive shadows'))
          .setGroup(_('Shadows'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod2ReceiveShadows')
          .setValue(
            behaviorContent.getChild('lod2ReceiveShadows').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('LOD2 receive shadows'))
          .setGroup(_('Shadows'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod1ModelResource')
          .setValue(behaviorContent.getChild('lod1ModelResource').getStringValue())
          .setType('string')
          .setLabel(_('LOD1 model resource'))
          .setGroup(_('Model swap'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('lod2ModelResource')
          .setValue(behaviorContent.getChild('lod2ModelResource').getStringValue())
          .setType('string')
          .setLabel(_('LOD2 model resource'))
          .setGroup(_('Model swap'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('modelSwitchCooldownMs')
          .setValue(
            behaviorContent
              .getChild('modelSwitchCooldownMs')
              .getDoubleValue()
              .toString()
          )
          .setType('number')
          .setLabel(_('Model switch cooldown (ms)'))
          .setGroup(_('Model swap'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('useBoundingRadius')
          .setValue(
            behaviorContent.getChild('useBoundingRadius').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setType('Boolean')
          .setLabel(_('Use object radius'))
          .setGroup(_('Advanced'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('distanceScale')
          .setValue(
            behaviorContent.getChild('distanceScale').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Distance scale'))
          .setDescription(
            _(
              'Per-object LOD distance multiplier. Values > 1 keep higher detail farther away.'
            )
          )
          .setGroup(_('Advanced'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('forceLevel')
          .setValue(
            behaviorContent.getChild('forceLevel').getDoubleValue().toString()
          )
          .setType('number')
          .setLabel(_('Force level (-1 auto)'))
          .setGroup(_('Debug'))
          .setAdvanced(true);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('enabled').setBoolValue(true);
        behaviorContent.addChild('lod1Distance').setDoubleValue(900);
        behaviorContent.addChild('lod2Distance').setDoubleValue(1800);
        behaviorContent.addChild('cullDistance').setDoubleValue(3200);
        behaviorContent.addChild('hysteresis').setDoubleValue(120);
        behaviorContent.addChild('updateIntervalFrames').setDoubleValue(2);
        behaviorContent.addChild('lod1AnimationSpeed').setDoubleValue(0.65);
        behaviorContent.addChild('lod2AnimationSpeed').setDoubleValue(0);
        behaviorContent.addChild('lod1CastShadows').setBoolValue(true);
        behaviorContent.addChild('lod2CastShadows').setBoolValue(false);
        behaviorContent.addChild('lod1ReceiveShadows').setBoolValue(true);
        behaviorContent.addChild('lod2ReceiveShadows').setBoolValue(false);
        behaviorContent.addChild('lod1ModelResource').setStringValue('');
        behaviorContent.addChild('lod2ModelResource').setStringValue('');
        behaviorContent.addChild('forceLevel').setDoubleValue(-1);
        behaviorContent.addChild('modelSwitchCooldownMs').setDoubleValue(250);
        behaviorContent.addChild('useBoundingRadius').setBoolValue(true);
        behaviorContent.addChild('distanceScale').setDoubleValue(1);
      };

      const lod = extension
        .addBehavior(
          'LOD',
          _('3D LOD'),
          'LOD',
          _(
            'Distance-based Level of Detail for 3D objects: automatic quality tiers, culling, shadow reduction, optional model swapping, and animation cost reduction.'
          ),
          '',
          'res/conditions/3d_box.svg',
          'LOD',
          // @ts-ignore
          behavior,
          new gd.BehaviorsSharedData()
        )
        .setIncludeFile('Extensions/3D/LODBehavior.js');

      lod
        .addScopedAction(
          'SetEnabled',
          _('Enable/disable LOD'),
          _('Enable or disable the LOD system for this object.'),
          _('Set LOD of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setEnabled');

      lod
        .addScopedCondition(
          'IsEnabled',
          _('LOD enabled'),
          _('Check if LOD is enabled for this object.'),
          _('LOD is enabled for _PARAM0_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .setFunctionName('isEnabled');

      lod
        .addExpressionAndCondition(
          'number',
          'CurrentLevel',
          _('Current LOD level'),
          _('the current LOD level (0 near, 1 medium, 2 far, 3 culled)'),
          _('the current LOD level'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setFunctionName('getCurrentLevel');

      lod
        .addScopedCondition(
          'IsCulled',
          _('LOD is culled'),
          _('Check if this object is currently culled by LOD.'),
          _('LOD culls _PARAM0_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .setFunctionName('isCulled');

      lod
        .addExpressionAndCondition(
          'number',
          'DistanceToCamera',
          _('Distance to camera'),
          _('the last computed object-to-camera distance'),
          _('the distance to camera'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Distance in scene units from object center to active 3D camera.')
          )
        )
        .setFunctionName('getLastDistanceToCamera');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'LOD1Distance',
          _('LOD1 distance'),
          _('the distance where LOD1 starts'),
          _('the LOD1 distance'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Distance where the object enters LOD1.')
          )
        )
        .setFunctionName('setLod1Distance')
        .setGetter('getLod1Distance');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'LOD2Distance',
          _('LOD2 distance'),
          _('the distance where LOD2 starts'),
          _('the LOD2 distance'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Distance where the object enters LOD2.')
          )
        )
        .setFunctionName('setLod2Distance')
        .setGetter('getLod2Distance');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'CullDistance',
          _('Cull distance'),
          _('the distance where object rendering is culled'),
          _('the cull distance'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Distance where the object becomes invisible.')
          )
        )
        .setFunctionName('setCullDistance')
        .setGetter('getCullDistance');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'Hysteresis',
          _('Hysteresis'),
          _('the hysteresis distance used to stabilize level switching'),
          _('the hysteresis'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Distance margin preventing rapid LOD flickering.')
          )
        )
        .setFunctionName('setHysteresis')
        .setGetter('getHysteresis');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'UpdateIntervalFrames',
          _('Update interval (frames)'),
          _('the number of frames between LOD updates'),
          _('the update interval'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('How often LOD is recomputed (in frames).')
          )
        )
        .setFunctionName('setUpdateIntervalFrames')
        .setGetter('getUpdateIntervalFrames');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'DistanceScale',
          _('Distance scale'),
          _('the per-object LOD distance scale'),
          _('the LOD distance scale'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _(
              'Per-object LOD distance multiplier. Values > 1 keep higher detail farther away.'
            )
          )
        )
        .setFunctionName('setDistanceScale')
        .setGetter('getDistanceScale');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'LOD1AnimationSpeed',
          _('LOD1 animation speed'),
          _('the animation speed multiplier in LOD1'),
          _('the LOD1 animation speed'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setLod1AnimationSpeed')
        .setGetter('getLod1AnimationSpeed');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'LOD2AnimationSpeed',
          _('LOD2 animation speed'),
          _('the animation speed multiplier in LOD2'),
          _('the LOD2 animation speed'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setLod2AnimationSpeed')
        .setGetter('getLod2AnimationSpeed');

      lod
        .addScopedAction(
          'SetLod1CastShadows',
          _('Set LOD1 cast shadows'),
          _('Enable or disable shadow casting at LOD1.'),
          _('Set LOD1 cast shadows of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setLod1CastShadows');

      lod
        .addScopedAction(
          'SetLod2CastShadows',
          _('Set LOD2 cast shadows'),
          _('Enable or disable shadow casting at LOD2.'),
          _('Set LOD2 cast shadows of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setLod2CastShadows');

      lod
        .addScopedAction(
          'SetLod1ReceiveShadows',
          _('Set LOD1 receive shadows'),
          _('Enable or disable shadow receiving at LOD1.'),
          _('Set LOD1 receive shadows of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setLod1ReceiveShadows');

      lod
        .addScopedAction(
          'SetLod2ReceiveShadows',
          _('Set LOD2 receive shadows'),
          _('Enable or disable shadow receiving at LOD2.'),
          _('Set LOD2 receive shadows of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setLod2ReceiveShadows');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'ForceLevel',
          _('Force LOD level'),
          _('the forced LOD level (-1 means automatic)'),
          _('the forced LOD level'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('-1 = automatic, 0 = LOD0, 1 = LOD1, 2 = LOD2, 3 = culled')
          )
        )
        .setFunctionName('setForceLevel')
        .setGetter('getForceLevel');

      lod
        .addExpressionAndConditionAndAction(
          'number',
          'ModelSwitchCooldownMs',
          _('Model switch cooldown (ms)'),
          _('the cooldown between model resource switches'),
          _('the model switch cooldown'),
          _('3D LOD'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setModelSwitchCooldownMs')
        .setGetter('getModelSwitchCooldownMs');

      lod
        .addScopedAction(
          'SetLod1ModelResource',
          _('Set LOD1 model resource'),
          _('Set optional LOD1 model resource name for Model3D objects.'),
          _('Set LOD1 model resource of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('string', _('Model resource name'), '', false)
        .setFunctionName('setLod1ModelResource');

      lod
        .addScopedAction(
          'SetLod2ModelResource',
          _('Set LOD2 model resource'),
          _('Set optional LOD2 model resource name for Model3D objects.'),
          _('Set LOD2 model resource of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('string', _('Model resource name'), '', false)
        .setFunctionName('setLod2ModelResource');

      lod
        .addScopedAction(
          'SetUseBoundingRadius',
          _('Use object radius'),
          _(
            'Enable or disable radius-based distance correction for more stable LOD decisions on large objects.'
          ),
          _('Set object radius usage for LOD of _PARAM0_ to _PARAM2_'),
          _('3D LOD'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'LOD')
        .addParameter('yesorno', _('Enabled'))
        .setFunctionName('setUseBoundingRadius');
    }

    {
      const object = extension
        .addObject(
          'Model3DObject',
          _('3D Model'),
          _('An animated 3D model, useful for most elements of a 3D game.'),
          'JsPlatform/Extensions/3d_model.svg',
          new gd.Model3DObjectConfiguration()
        )
        .setCategory('General')
        // Effects are unsupported because the object is not rendered with PIXI.
        .addDefaultBehavior('ResizableCapability::ResizableBehavior')
        .addDefaultBehavior('ScalableCapability::ScalableBehavior')
        .addDefaultBehavior('FlippableCapability::FlippableBehavior')
        .addDefaultBehavior('AnimatableCapability::AnimatableBehavior')
        .addDefaultBehavior('Scene3D::Base3DBehavior')
        .addDefaultBehavior('Scene3D::LOD')
        .markAsRenderedIn3D()
        .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
        .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject3DRenderer.js');

      // Properties expressions/conditions/actions:

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Z',
          _('Z (elevation)'),
          _('the Z position (the "elevation")'),
          _('the Z position'),
          _('Position'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setZ')
        .setGetter('getZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Depth',
          _('Depth (size on Z axis)'),
          _('the depth (size on Z axis)'),
          _('the depth'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setDepth')
        .setGetter('getDepth');

      // Deprecated
      object
        .addScopedAction(
          'SetWidth',
          _('Width'),
          _('Change the width of an object.'),
          _('the width'),
          _('Size'),
          'res/actions/scaleWidth24_black.png',
          'res/actions/scaleWidth_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setWidth')
        .setGetter('getWidth');

      // Deprecated
      object
        .addScopedCondition(
          'Width',
          _('Width'),
          _('Compare the width of an object.'),
          _('the width'),
          _('Size'),
          'res/actions/scaleWidth24_black.png',
          'res/actions/scaleWidth_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardRelationalOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('getWidth');

      // Deprecated
      object
        .addScopedAction(
          'SetHeight',
          _('Height'),
          _('Change the height of an object.'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png',
          'res/actions/scaleHeight_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setHeight')
        .setGetter('getHeight');

      // Deprecated
      object
        .addScopedCondition(
          'Height',
          _('Height'),
          _('Compare the height of an object.'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png',
          'res/actions/scaleHeight_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardRelationalOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('getHeight');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Height',
          _('Height'),
          _('the height'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setHeight')
        .setGetter('getHeight');

      // Deprecated
      object
        .addScopedAction(
          'Scale',
          _('Scale'),
          _('Modify the scale of the specified object.'),
          _('the scale'),
          _('Size'),
          'res/actions/scale24_black.png',
          'res/actions/scale_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScale')
        .setGetter('getScale');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleX',
          _('Scale on X axis'),
          _("the width's scale of an object"),
          _("the width's scale"),
          _('Size'),
          'res/actions/scaleWidth24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScaleX')
        .setGetter('getScaleX');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleY',
          _('Scale on Y axis'),
          _("the height's scale of an object"),
          _("the height's scale"),
          _('Size'),
          'res/actions/scaleHeight24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScaleY')
        .setGetter('getScaleY');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleZ',
          _('Scale on Z axis'),
          _("the depth's scale of an object"),
          _("the depth's scale"),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('setScaleZ')
        .setGetter('getScaleZ');

      // Deprecated
      object
        .addScopedAction(
          'FlipX',
          _('Flip the object horizontally'),
          _('Flip the object horizontally'),
          _('Flip horizontally _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/actions/flipX24.png',
          'res/actions/flipX.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .setHidden()
        .markAsSimple()
        .setFunctionName('flipX');

      // Deprecated
      object
        .addScopedAction(
          'FlipY',
          _('Flip the object vertically'),
          _('Flip the object vertically'),
          _('Flip vertically _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/actions/flipY24.png',
          'res/actions/flipY.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .setHidden()
        .markAsSimple()
        .setFunctionName('flipY');

      // Deprecated
      object
        .addScopedAction(
          'FlipZ',
          _('Flip the object on Z'),
          _('Flip the object on Z axis'),
          _('Flip on Z axis _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setHidden()
        .setFunctionName('flipZ');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedX',
          _('Horizontally flipped'),
          _('Check if the object is horizontally flipped'),
          _('_PARAM0_ is horizontally flipped'),
          _('Effects'),
          'res/actions/flipX24.png',
          'res/actions/flipX.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedX');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedY',
          _('Vertically flipped'),
          _('Check if the object is vertically flipped'),
          _('_PARAM0_ is vertically flipped'),
          _('Effects'),
          'res/actions/flipY24.png',
          'res/actions/flipY.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedY');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedZ',
          _('Flipped on Z'),
          _('Check if the object is flipped on Z axis'),
          _('_PARAM0_ is flipped on Z axis'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'RotationX',
          _('Rotation on X axis'),
          _('the rotation on X axis'),
          _('the rotation on X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setHidden()
        .setFunctionName('setRotationX')
        .setGetter('getRotationX');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'RotationY',
          _('Rotation on Y axis'),
          _('the rotation on Y axis'),
          _('the rotation on Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setHidden()
        .setFunctionName('setRotationY')
        .setGetter('getRotationY');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundX',
          _('Turn around X axis'),
          _(
            "Turn the object around X axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundX');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundY',
          _('Turn around Y axis'),
          _(
            "Turn the object around Y axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundY');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundZ',
          _('Turn around Z axis'),
          _(
            "Turn the object around Z axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around Z axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Angle to add (in degrees)'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Animation',
          _('Animation (by number)'),
          _(
            'the number of the animation played by the object (the number from the animations list)'
          ),
          _('the number of the animation'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .markAsSimple()
        .setHidden()
        .setFunctionName('setAnimationIndex')
        .setGetter('getAnimationIndex');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'string',
          'AnimationName',
          _('Animation (by name)'),
          _('the animation played by the object'),
          _('the animation'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'objectAnimationName',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Animation name')
          )
        )
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('setAnimationName')
        .setGetter('getAnimationName');

      // Deprecated
      object
        .addAction(
          'PauseAnimation',
          _('Pause the animation'),
          _('Pause the animation of the object'),
          _('Pause the animation of _PARAM0_'),
          _('Animations and images'),
          'res/actions/animation24.png',
          'res/actions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('pauseAnimation');

      // Deprecated
      object
        .addAction(
          'ResumeAnimation',
          _('Resume the animation'),
          _('Resume the animation of the object'),
          _('Resume the animation of _PARAM0_'),
          _('Animations and images'),
          'res/actions/animation24.png',
          'res/actions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('resumeAnimation');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'AnimationSpeedScale',
          _('Animation speed scale'),
          _(
            'the animation speed scale (1 = the default speed, >1 = faster and <1 = slower)'
          ),
          _('the animation speed scale'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(_('Speed scale'))
        )
        .markAsSimple()
        .setHidden()
        .setFunctionName('setAnimationSpeedScale')
        .setGetter('getAnimationSpeedScale');

      // Deprecated
      object
        .addCondition(
          'IsAnimationPaused',
          _('Animation paused'),
          _('Check if the animation of an object is paused.'),
          _('The animation of _PARAM0_ is paused'),
          _('Animations and images'),
          'res/conditions/animation24.png',
          'res/conditions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('isAnimationPaused');

      // Deprecated
      object
        .addCondition(
          'HasAnimationEnded',
          _('Animation finished'),
          _(
            'Check if the animation being played by the Sprite object is finished.'
          ),
          _('The animation of _PARAM0_ is finished'),
          _('Animations and images'),
          'res/conditions/animation24.png',
          'res/conditions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('hasAnimationEnded');

      object
        .addScopedAction(
          'SetCrossfadeDuration',
          _('Set crossfade duration'),
          _('Set the crossfade duration when switching to a new animation.'),
          _('Set crossfade duration of _PARAM0_ to _PARAM1_ seconds'),
          _('Animations and images'),
          'res/conditions/animation24.png',
          'res/conditions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Crossfade duration (in seconds)'), '', false)
        .setFunctionName('setCrossfadeDuration');
    }

    const Cube3DObject = new gd.ObjectJsImplementation();
    Cube3DObject.updateProperty = function (propertyName, newValue) {
      const objectContent = this.content;
      if (
        propertyName === 'width' ||
        propertyName === 'height' ||
        propertyName === 'depth'
      ) {
        objectContent[propertyName] = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'facesOrientation') {
        const normalizedValue = newValue.toUpperCase();
        if (normalizedValue === 'Y' || normalizedValue === 'Z') {
          objectContent.facesOrientation = normalizedValue;
          return true;
        }
        return false;
      }
      if (propertyName === 'backFaceUpThroughWhichAxisRotation') {
        const normalizedValue = newValue.toUpperCase();
        if (normalizedValue === 'X' || normalizedValue === 'Y') {
          objectContent.backFaceUpThroughWhichAxisRotation = normalizedValue;
          return true;
        }
        return false;
      }
      if (propertyName === 'materialType') {
        const normalizedValue = newValue.toLowerCase();
        if (normalizedValue === 'basic') {
          objectContent.materialType = 'Basic';
          return true;
        }
        if (normalizedValue === 'standardwithoutmetalness') {
          objectContent.materialType = 'StandardWithoutMetalness';
          return true;
        }
        return false;
      }
      if (
        propertyName === 'frontFaceResourceName' ||
        propertyName === 'backFaceResourceName' ||
        propertyName === 'leftFaceResourceName' ||
        propertyName === 'rightFaceResourceName' ||
        propertyName === 'topFaceResourceName' ||
        propertyName === 'bottomFaceResourceName' ||
        propertyName === 'tint'
      ) {
        objectContent[propertyName] = newValue;
        return true;
      }
      if (
        propertyName === 'frontFaceVisible' ||
        propertyName === 'backFaceVisible' ||
        propertyName === 'leftFaceVisible' ||
        propertyName === 'rightFaceVisible' ||
        propertyName === 'topFaceVisible' ||
        propertyName === 'bottomFaceVisible' ||
        propertyName === 'frontFaceResourceRepeat' ||
        propertyName === 'backFaceResourceRepeat' ||
        propertyName === 'leftFaceResourceRepeat' ||
        propertyName === 'rightFaceResourceRepeat' ||
        propertyName === 'topFaceResourceRepeat' ||
        propertyName === 'bottomFaceResourceRepeat' ||
        propertyName === 'enableTextureTransparency' ||
        propertyName === 'isCastingShadow' ||
        propertyName === 'isReceivingShadow'
      ) {
        objectContent[propertyName] = newValue === '1';
        return true;
      }

      return false;
    };
    Cube3DObject.getProperties = function () {
      const objectProperties = new gd.MapStringPropertyDescriptor();
      const objectContent = this.content;

      objectProperties
        .getOrCreate('enableTextureTransparency')
        .setValue(objectContent.enableTextureTransparency ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Enable texture transparency'))
        .setDescription(
          _(
            'Enabling texture transparency has an impact on rendering performance.'
          )
        )
        .setGroup(_('Texture settings'));

      objectProperties
        .getOrCreate('facesOrientation')
        .setValue(objectContent.facesOrientation || 'Y')
        .setType('choice')
        .addChoice('Y', 'Y')
        .addChoice('Z', 'Z')
        .setLabel(_('Faces orientation'))
        .setDescription(
          _(
            'The top of each image can touch the **top face** (Y) or the **front face** (Z).'
          )
        )
        .setGroup(_('Face orientation'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('width')
        .setValue((objectContent.width || 0).toString())
        .setType('number')
        .setLabel(_('Width'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));

      objectProperties
        .getOrCreate('height')
        .setValue((objectContent.height || 0).toString())
        .setType('number')
        .setLabel(_('Height'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));

      objectProperties
        .getOrCreate('depth')
        .setValue((objectContent.depth || 0).toString())
        .setType('number')
        .setLabel(_('Depth'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));
      objectProperties
        .getOrCreate('tint')
        .setValue(objectContent.tint || '255;255;255')
        .setType('Color')
        .setLabel(_('Tint'))
        .setGroup(_('Texture'));

      objectProperties
        .getOrCreate('frontFaceResourceName')
        .setValue(objectContent.frontFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Front face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceName')
        .setValue(objectContent.backFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Back face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceUpThroughWhichAxisRotation')
        .setValue(objectContent.backFaceUpThroughWhichAxisRotation || 'X')
        .setType('choice')
        .addChoice('X', 'X')
        .addChoice('Y', 'Y')
        .setLabel(_('Back face orientation'))
        .setDescription(
          _(
            'The top of the image can touch the **top face** (Y) or the **bottom face** (X).'
          )
        )
        .setGroup(_('Face orientation'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('leftFaceResourceName')
        .setValue(objectContent.leftFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Left face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceName')
        .setValue(objectContent.rightFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Right face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceName')
        .setValue(objectContent.topFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Top face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceName')
        .setValue(objectContent.bottomFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bottom face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceResourceRepeat')
        .setValue(objectContent.frontFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceRepeat')
        .setValue(objectContent.backFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('leftFaceResourceRepeat')
        .setValue(objectContent.leftFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceRepeat')
        .setValue(objectContent.rightFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceRepeat')
        .setValue(objectContent.topFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceRepeat')
        .setValue(objectContent.bottomFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceVisible')
        .setValue(objectContent.frontFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Front face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('backFaceVisible')
        .setValue(objectContent.backFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Back face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('leftFaceVisible')
        .setValue(objectContent.leftFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Left face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('rightFaceVisible')
        .setValue(objectContent.rightFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Right face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('topFaceVisible')
        .setValue(objectContent.topFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Top face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('bottomFaceVisible')
        .setValue(objectContent.bottomFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Bottom face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('materialType')
        .setValue(objectContent.materialType || 'StandardWithoutMetalness')
        .setType('choice')
        .addChoice('Basic', _('Basic (no lighting, no shadows)'))
        .addChoice(
          'StandardWithoutMetalness',
          _('Standard (without metalness)')
        )
        .setLabel(_('Material type'))
        .setGroup(_('Lighting'));

      objectProperties
        .getOrCreate('isCastingShadow')
        .setValue(objectContent.isCastingShadow ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Shadow casting'))
        .setGroup(_('Lighting'));

      objectProperties
        .getOrCreate('isReceivingShadow')
        .setValue(objectContent.isReceivingShadow ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Shadow receiving'))
        .setGroup(_('Lighting'));

      return objectProperties;
    };
    Cube3DObject.content = {
      width: 100,
      height: 100,
      depth: 100,
      enableTextureTransparency: false,
      facesOrientation: 'Y',
      frontFaceResourceName: '',
      backFaceResourceName: '',
      backFaceUpThroughWhichAxisRotation: 'X',
      leftFaceResourceName: '',
      rightFaceResourceName: '',
      topFaceResourceName: '',
      bottomFaceResourceName: '',
      frontFaceVisible: true,
      backFaceVisible: true,
      leftFaceVisible: true,
      rightFaceVisible: true,
      topFaceVisible: true,
      bottomFaceVisible: true,
      frontFaceResourceRepeat: false,
      backFaceResourceRepeat: false,
      leftFaceResourceRepeat: false,
      rightFaceResourceRepeat: false,
      topFaceResourceRepeat: false,
      bottomFaceResourceRepeat: false,
      materialType: 'StandardWithoutMetalness',
      tint: '255;255;255',
      isCastingShadow: true,
      isReceivingShadow: true,
    };

    Cube3DObject.updateInitialInstanceProperty = function (
      instance,
      propertyName,
      newValue
    ) {
      return false;
    };

    Cube3DObject.getInitialInstanceProperties = function (instance) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'Cube3DObject',
        _('3D Box'),
        _('A box with images for each face'),
        'JsPlatform/Extensions/3d_box.svg',
        Cube3DObject
      )
      .setCategory('General')
      // Effects are unsupported because the object is not rendered with PIXI.
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior')
      .addDefaultBehavior('FlippableCapability::FlippableBehavior')
      .addDefaultBehavior('Scene3D::Base3DBehavior')
      .addDefaultBehavior('Scene3D::LOD')
      .markAsRenderedIn3D()
      .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
      .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObject.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObjectPixiRenderer.js');

    // Properties expressions/conditions/actions:

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Z',
        _('Z (elevation)'),
        _('the Z position (the "elevation")'),
        _('the Z position'),
        _('Position'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setHidden()
      .setFunctionName('setZ')
      .setGetter('getZ');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Depth',
        _('Depth (size on Z axis)'),
        _('the depth (size on Z axis)'),
        _('the depth'),
        _('Size'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setHidden()
      .setFunctionName('setDepth')
      .setGetter('getDepth');

    // Deprecated
    object
      .addScopedAction(
        'SetWidth',
        _('Width'),
        _('Change the width of an object.'),
        _('the width'),
        _('Size'),
        'res/actions/scaleWidth24_black.png',
        'res/actions/scaleWidth_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setWidth')
      .setGetter('getWidth');

    // Deprecated
    object
      .addScopedCondition(
        'Width',
        _('Width'),
        _('Compare the width of an object.'),
        _('the width'),
        _('Size'),
        'res/actions/scaleWidth24_black.png',
        'res/actions/scaleWidth_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('getWidth');

    // Deprecated
    object
      .addScopedAction(
        'SetHeight',
        _('Height'),
        _('Change the height of an object.'),
        _('the height'),
        _('Size'),
        'res/actions/scaleHeight24_black.png',
        'res/actions/scaleHeight_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setHeight')
      .setGetter('getHeight');

    // Deprecated
    object
      .addScopedCondition(
        'Height',
        _('Height'),
        _('Compare the height of an object.'),
        _('the height'),
        _('Size'),
        'res/actions/scaleHeight24_black.png',
        'res/actions/scaleHeight_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('getHeight');

    // Deprecated
    object
      .addScopedAction(
        'Scale',
        _('Scale'),
        _('Modify the scale of the specified object.'),
        _('the scale'),
        _('Size'),
        'res/actions/scale24_black.png',
        'res/actions/scale_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScale')
      .setGetter('getScale');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleX',
        _('Scale on X axis'),
        _("the width's scale of an object"),
        _("the width's scale"),
        _('Size'),
        'res/actions/scaleWidth24_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScaleX')
      .setGetter('getScaleX');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleY',
        _('Scale on Y axis'),
        _("the height's scale of an object"),
        _("the height's scale"),
        _('Size'),
        'res/actions/scaleHeight24_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScaleY')
      .setGetter('getScaleY');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleZ',
        _('Scale on Z axis'),
        _("the depth's scale of an object"),
        _("the depth's scale"),
        _('Size'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('setScaleZ')
      .setGetter('getScaleZ');

    // Deprecated
    object
      .addScopedAction(
        'FlipX',
        _('Flip the object horizontally'),
        _('Flip the object horizontally'),
        _('Flip horizontally _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/actions/flipX24.png',
        'res/actions/flipX.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipX');

    // Deprecated
    object
      .addScopedAction(
        'FlipY',
        _('Flip the object vertically'),
        _('Flip the object vertically'),
        _('Flip vertically _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/actions/flipY24.png',
        'res/actions/flipY.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipY');

    // Deprecated
    object
      .addScopedAction(
        'FlipZ',
        _('Flip the object on Z'),
        _('Flip the object on Z axis'),
        _('Flip on Z axis _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipZ');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedX',
        _('Horizontally flipped'),
        _('Check if the object is horizontally flipped'),
        _('_PARAM0_ is horizontally flipped'),
        _('Effects'),
        'res/actions/flipX24.png',
        'res/actions/flipX.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedX');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedY',
        _('Vertically flipped'),
        _('Check if the object is vertically flipped'),
        _('_PARAM0_ is vertically flipped'),
        _('Effects'),
        'res/actions/flipY24.png',
        'res/actions/flipY.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedY');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedZ',
        _('Flipped on Z'),
        _('Check if the object is flipped on Z axis'),
        _('_PARAM0_ is flipped on Z axis'),
        _('Effects'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedZ');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'RotationX',
        _('Rotation on X axis'),
        _('the rotation on X axis'),
        _('the rotation on X axis'),
        _('Angle'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .setFunctionName('setRotationX')
      .setHidden()
      .setGetter('getRotationX');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'RotationY',
        _('Rotation on Y axis'),
        _('the rotation on Y axis'),
        _('the rotation on Y axis'),
        _('Angle'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .setFunctionName('setRotationY')
      .setHidden()
      .setGetter('getRotationY');

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'FaceVisibility',
        _('Face visibility'),
        _('a face should be visible'),
        _('having its _PARAM1_ face visible'),
        _('Face'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter(
        'stringWithSelector',
        _('Face'),
        JSON.stringify(['front', 'back', 'left', 'right', 'top', 'bottom']),
        false
      )
      .useStandardParameters(
        'boolean',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Visible?'))
      )
      .setFunctionName('setFaceVisibility')
      .setGetter('isFaceVisible');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundX',
        _('Turn around X axis'),
        _(
          "Turn the object around X axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around X axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundX');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundY',
        _('Turn around Y axis'),
        _(
          "Turn the object around Y axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around Y axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundY');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundZ',
        _('Turn around Z axis'),
        _(
          "Turn the object around Z axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around Z axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundZ');

    object
      .addScopedAction(
        'SetFaceResource',
        _('Face image'),
        _('Change the image of the face.'),
        _('Change the image of _PARAM1_ face of _PARAM0_ to _PARAM2_'),
        _('Face'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter(
        'stringWithSelector',
        _('Face'),
        JSON.stringify(['front', 'back', 'left', 'right', 'top', 'bottom']),
        false
      )
      .addParameter('imageResource', _('Image'), '', false)
      .setFunctionName('setFaceResourceName');

    object
      .addScopedAction(
        'SetTint',
        _('Tint color'),
        _('Change the tint of the cube.'),
        _('Change the tint of _PARAM0_ to _PARAM1_'),
        _('Effects'),
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('3D Cube'), 'Cube3DObject', false)
      .addParameter('color', _('Tint'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setColor');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraZ',
        _('Camera Z position'),
        _('the camera position on Z axis'),
        _('the camera position on Z axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraZ')
      .setGetter('gdjs.scene3d.camera.getCameraZ')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationX',
        _('Camera X rotation'),
        _('the camera rotation on X axis'),
        _('the camera rotation on X axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraRotationX')
      .setGetter('gdjs.scene3d.camera.getCameraRotationX')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationY',
        _('Camera Y rotation'),
        _('the camera rotation on Y axis'),
        _('the camera rotation on Y axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraRotationY')
      .setGetter('gdjs.scene3d.camera.getCameraRotationY')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addAction(
        'TurnCameraTowardObject',
        _('Look at an object'),
        _(
          'Change the camera rotation to look at an object. The camera top always face the screen.'
        ),
        _('Change the camera rotation of _PARAM2_ to look at _PARAM1_'),
        _('Layers and cameras'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('objectPtr', _('Object'), '')
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Stand on Y instead of Z'), '', true)
      .setDefaultValue('false')
      .setFunctionName('gdjs.scene3d.camera.turnCameraTowardObject')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addAction(
        'TurnCameraTowardPosition',
        _('Look at a position'),
        _(
          'Change the camera rotation to look at a position. The camera top always face the screen.'
        ),
        _(
          'Change the camera rotation of _PARAM4_ to look at _PARAM1_; _PARAM2_; _PARAM3_'
        ),
        '',
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('number', _('X position'))
      .addParameter('number', _('Y position'))
      .addParameter('number', _('Z position'))
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Stand on Y instead of Z'), '', true)
      .setDefaultValue('false')
      .setFunctionName('gdjs.scene3d.camera.turnCameraTowardPosition')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraNearPlane',
        _('Camera near plane'),
        _('the camera near plane distance'),
        _('the camera near plane distance'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Distance (> 0)'))
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setNearPlane')
      .setGetter('gdjs.scene3d.camera.getNearPlane')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFarPlane',
        _('Camera far plane'),
        _('the camera far plane distance'),
        _('the camera far plane distance'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Distance (> 0)'))
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setFarPlane')
      .setGetter('gdjs.scene3d.camera.getFarPlane')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFov',
        _('Camera field of view (fov)'),
        _('the camera field of view'),
        _('the camera field of view'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Field of view in degrees (between 0° and 180°)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setFov')
      .setGetter('gdjs.scene3d.camera.getFov')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    {
      const effect = extension
        .addEffect('LinearFog')
        .setFullName(_('Fog (linear)'))
        .setDescription(_('Linear fog for 3D objects.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/LinearFog.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Fog color'))
        .setType('color');
      properties
        .getOrCreate('near')
        .setValue('200')
        .setLabel(_('Distance where the fog starts'))
        .setType('number');
      properties
        .getOrCreate('far')
        .setValue('2000')
        .setLabel(_('Distance where the fog is fully opaque'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('ExponentialFog')
        .setFullName(_('Fog (exponential)'))
        .setDescription(_('Exponential fog for 3D objects.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/ExponentialFog.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Fog color'))
        .setType('color');
      properties
        .getOrCreate('density')
        .setValue('0.0012')
        .setLabel(_('Density'))
        .setDescription(
          _(
            'Density of the fog. Usual values are between 0.0005 (far away) and 0.005 (very thick fog).'
          )
        )
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('AmbientLight')
        .setFullName(_('Ambient light'))
        .setDescription(
          _(
            'A light that illuminates all objects from every direction. Often used along with a Directional light (though a Hemisphere light can be used instead of an Ambient light).'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/AmbientLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.25')
        .setLabel(_('Intensity'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('LightingPipeline')
        .setFullName(_('Lighting pipeline'))
        .setDescription(
          _(
            'Global lighting orchestration for 3D scenes: blend realtime and baked lighting, enable probe-based fill light, and tune attenuation behavior for local lights.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/LightingPipeline.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('mode')
        .setValue('hybrid')
        .addChoice('realtime', _('Realtime only'))
        .addChoice('baked', _('Baked + probes'))
        .addChoice('hybrid', _('Hybrid (realtime + baked + probes)'))
        .setLabel(_('Lighting mode'))
        .setType('choice');
      properties
        .getOrCreate('realtimeWeight')
        .setValue('0.75')
        .setLabel(_('Realtime weight'))
        .setDescription(
          _(
            'Weight of realtime lighting contribution in hybrid mode (0 to 1).'
          )
        )
        .setType('number')
        .setAdvanced(true);
      properties
        .getOrCreate('bakedWeight')
        .setValue('1')
        .setLabel(_('Baked lightmap weight'))
        .setDescription(
          _(
            'Multiplier applied to baked lightmaps in baked/hybrid modes. Higher values make baked lighting more dominant.'
          )
        )
        .setType('number')
        .setAdvanced(true);
      properties
        .getOrCreate('probeEnabled')
        .setValue('true')
        .setLabel(_('Enable probes'))
        .setType('boolean')
        .setGroup(_('Probes'));
      properties
        .getOrCreate('probeIntensity')
        .setValue('0.35')
        .setLabel(_('Probe intensity'))
        .setDescription(
          _('Intensity of probe-based indirect fill lighting.')
        )
        .setType('number')
        .setGroup(_('Probes'));
      properties
        .getOrCreate('probeSmoothing')
        .setValue('2.5')
        .setLabel(_('Probe smoothing'))
        .setDescription(
          _(
            'How quickly probe lighting adapts to scene changes. Higher values react faster.'
          )
        )
        .setType('number')
        .setGroup(_('Probes'))
        .setAdvanced(true);
      properties
        .getOrCreate('probeUseSceneColors')
        .setValue('true')
        .setLabel(_('Probe colors from scene'))
        .setDescription(
          _(
            'If enabled, probe colors are sampled from scene background/hemisphere lighting. Disable to use custom probe colors.'
          )
        )
        .setType('boolean')
        .setGroup(_('Probes'))
        .setAdvanced(true);
      properties
        .getOrCreate('probeSkyColor')
        .setValue('191;215;255')
        .setLabel(_('Custom probe sky color'))
        .setType('color')
        .setGroup(_('Probes'))
        .setAdvanced(true);
      properties
        .getOrCreate('probeGroundColor')
        .setValue('109;115;86')
        .setLabel(_('Custom probe ground color'))
        .setType('color')
        .setGroup(_('Probes'))
        .setAdvanced(true);
      properties
        .getOrCreate('attenuationModel')
        .setValue('balanced')
        .addChoice('physical', _('Physical'))
        .addChoice('balanced', _('Balanced'))
        .addChoice('cinematic', _('Cinematic'))
        .addChoice('stylized', _('Stylized'))
        .setLabel(_('Attenuation model'))
        .setDescription(
          _(
            'Controls default falloff style used by point and spot lights.'
          )
        )
        .setType('choice')
        .setGroup(_('Attenuation'));
      properties
        .getOrCreate('attenuationDistanceScale')
        .setValue('1')
        .setLabel(_('Distance scale'))
        .setDescription(
          _(
            'Global distance multiplier for local-light attenuation (point/spot).'
          )
        )
        .setType('number')
        .setGroup(_('Attenuation'))
        .setAdvanced(true);
      properties
        .getOrCreate('attenuationDecayScale')
        .setValue('1')
        .setLabel(_('Decay scale'))
        .setDescription(
          _(
            'Global decay multiplier for local-light attenuation (point/spot).'
          )
        )
        .setType('number')
        .setGroup(_('Attenuation'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowQualityScale')
        .setValue('1')
        .setLabel(_('Shadow quality scale'))
        .setDescription(
          _(
            'Global multiplier for realtime shadow-map quality across Directional, Spot, and Point lights.'
          )
        )
        .setType('number')
        .setGroup(_('Performance'))
        .setAdvanced(true);
      properties
        .getOrCreate('lodDistanceScale')
        .setValue('1')
        .setLabel(_('LOD distance scale'))
        .setDescription(
          _(
            'Global multiplier for LOD distances. Values > 1 keep higher detail farther from camera.'
          )
        )
        .setType('number')
        .setGroup(_('Performance'))
        .setAdvanced(true);
      properties
        .getOrCreate('realtimeShadowsOnly')
        .setValue('true')
        .setLabel(_('Disable shadows in baked mode'))
        .setDescription(
          _(
            'When enabled, realtime shadow maps are turned off automatically if realtime lighting contribution becomes negligible.'
          )
        )
        .setType('boolean')
        .setGroup(_('Performance'))
        .setAdvanced(true);
      properties
        .getOrCreate('physicallyCorrectLights')
        .setValue('true')
        .setLabel(_('Physically correct light units'))
        .setDescription(
          _(
            'Enable physically-correct renderer light response for better consistency across PBR materials.'
          )
        )
        .setType('boolean')
        .setGroup(_('Performance'))
        .setAdvanced(true);
    }
    {
      const effect = extension
        .addEffect('DirectionalLight')
        .setFullName(_('Directional light'))
        .setDescription(
          _(
            "A very far light source like the sun. This is the light to use for casting shadows for 3D objects (other lights won't emit shadows). Often used along with a Hemisphere light."
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/DirectionalLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.5')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Z+')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Z+')
        .addExtraInfo('Y-')
        .setGroup(_('Orientation'));
      properties
        .getOrCreate('elevation')
        .setValue('45')
        .setLabel(_('Elevation'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setGroup(_('Orientation'))
        .setDescription(_('Maximal elevation is reached at 90°.'));
      properties
        .getOrCreate('rotation')
        .setValue('0')
        .setLabel(_('Rotation'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setGroup(_('Orientation'));
      properties
        .getOrCreate('isCastingShadow')
        .setValue('false')
        .setLabel(_('Shadow casting'))
        .setType('boolean')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowQuality')
        .setValue('medium')
        .addChoice('low', _('Low quality'))
        .addChoice('medium', _('Medium quality'))
        .addChoice('high', _('High quality'))
        .setLabel(_('Shadow quality'))
        .setType('choice')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowMapSize')
        .setValue('1024')
        .setLabel(_('Shadow map size (base)'))
        .setDescription(
          _(
            'Base map size used by cascaded shadows. Recommended values: 512, 1024, 2048, or 4096 (high-end GPUs).'
          )
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('minimumShadowBias')
        .setValue('0')
        .setLabel(_('Shadow bias'))
        .setDescription(
          _(
            'Use this to avoid "shadow acne" due to depth buffer precision. Choose a value small enough like 0.001 to avoid creating distance between shadows and objects but not too small to avoid shadow glitches on low/medium quality. This value is used for high quality, and multiplied by 1.25 for medium quality and 2 for low quality.'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowNormalBias')
        .setValue('0.02')
        .setLabel(_('Shadow normal bias'))
        .setDescription(
          _('Offset along normals to reduce acne on sloped/curved surfaces.')
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowRadius')
        .setValue('2')
        .setLabel(_('Shadow softness'))
        .setDescription(
          _(
            'Softness radius for filtered shadow edges (higher = softer, may blur details).'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowStabilization')
        .setValue('true')
        .setLabel(_('Shadow stabilization'))
        .setDescription(
          _(
            'Snap shadow tracking to a stable grid to reduce shimmering while the camera moves.'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowFollowCamera')
        .setValue('false')
        .setLabel(_('Shadows follow camera'))
        .setDescription(
          _(
            'If disabled, directional shadow cascades stay fixed in world space (no shadow movement with the player).'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowStabilizationStep')
        .setValue('0')
        .setLabel(_('Stabilization step'))
        .setDescription(
          _(
            'Pixel step used for shadow stabilization. 0 = automatic texel-based step.'
          )
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('frustumSize')
        .setValue('4000')
        .setLabel(_('Shadow frustum size'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('maxShadowDistance')
        .setValue('2000')
        .setLabel(_('Max shadow distance'))
        .setDescription(
          _('Maximum world distance covered by cascaded directional shadows.')
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('cascadeSplitLambda')
        .setValue('0.7')
        .setLabel(_('Cascade split lambda'))
        .setDescription(
          _(
            'Blend between logarithmic and uniform cascade split distribution (0 to 1).'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('cascadeCount')
        .setValue('3')
        .setLabel(_('Cascade count'))
        .setDescription(
          _(
            'Maximum number of cascades for directional shadows (1 to 3). Higher values improve detail but cost more.'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('adaptiveCascadeCount')
        .setValue('true')
        .setLabel(_('Adaptive cascade count'))
        .setDescription(
          _(
            'Automatically reduces active cascades when realtime lighting contribution is low to improve performance.'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowFollowLead')
        .setValue('0.45')
        .setLabel(_('Shadow follow lead'))
        .setDescription(
          _(
            'Predictive follow amount for the shadow anchor so shadows keep up with fast player movement.'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('distanceFromCamera')
        .setValue('1500')
        .setLabel(_("Distance from layer's camera"))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowAutoTuning')
        .setValue('true')
        .setLabel(_('Auto shadow tuning'))
        .setDescription(
          _(
            'Automatically adjusts directional shadow bias/normal-bias per cascade for cleaner and more stable results.'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
    }
    {
      const effect = extension
        .addEffect('RimLight')
        .setFullName(_('Rim light'))
        .setDescription(
          _(
            'Injects Fresnel-based rim lighting directly into 3D mesh materials via shader compilation. Rim direction is updated every frame from the active camera position.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/RimLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Rim color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.8')
        .setLabel(_('Intensity'))
        .setDescription(_('Strength of the rim contribution near silhouettes.'))
        .setType('number');
      properties
        .getOrCreate('outerWrap')
        .setValue('0.18')
        .setLabel(_('Outer wrap'))
        .setDescription(
          _(
            'Ambient wrap amount for the 45 to 90 degree rim zone away from silhouette.'
          )
        )
        .setType('number')
        .setAdvanced(true);
      properties
        .getOrCreate('power')
        .setValue('2.2')
        .setLabel(_('Rim power'))
        .setDescription(
          _(
            'Controls rim falloff near silhouette. Higher values make a tighter, sharper rim.'
          )
        )
        .setType('number')
        .setAdvanced(true);
      properties
        .getOrCreate('fresnel0')
        .setValue('0.04')
        .setLabel(_('Fresnel F0'))
        .setDescription(
          _(
            'Base reflectance used by Schlick Fresnel. Typical non-metal values are around 0.02 to 0.08.'
          )
        )
        .setType('number')
        .setAdvanced(true);
      properties
        .getOrCreate('debugForceMaxRim')
        .setValue('false')
        .setLabel(_('Debug: force max rim'))
        .setDescription(
          _(
            'For debugging shader injection: force full rim contribution on patched materials regardless of view angle.'
          )
        )
        .setType('boolean')
        .setGroup(_('Debug'))
        .setAdvanced(true);
    }
    {
      const effect = extension
        .addEffect('HemisphereLight')
        .setFullName(_('Hemisphere light'))
        .setDescription(
          _(
            'A light that illuminates objects from every direction with a gradient. Often used along with a Directional light.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/HemisphereLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('skyColor')
        .setValue('255;255;255')
        .setLabel(_('Sky color'))
        .setType('color');
      properties
        .getOrCreate('groundColor')
        .setValue('127;127;127')
        .setLabel(_('Ground color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.35')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Z+')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Z+')
        .addExtraInfo('Y-')
        .setGroup(_('Orientation'));
      properties
        .getOrCreate('elevation')
        .setValue('90')
        .setLabel(_('Elevation'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setGroup(_('Orientation'))
        .setDescription(_('Maximal elevation is reached at 90°.'));
      properties
        .getOrCreate('rotation')
        .setValue('0')
        .setLabel(_('Rotation'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setGroup(_('Orientation'));
    }
    {
      const effect = extension
        .addEffect('PointLight')
        .setFullName(_('Point light'))
        .setDescription(
          _(
            'A light that emits in all directions from a position, like a light bulb. Can cast shadows.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PointLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('1')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Z+')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Z+')
        .addExtraInfo('Y-')
        .setGroup(_('Position'));
      properties
        .getOrCreate('positionX')
        .setValue('0')
        .setLabel(_('X position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Position'));
      properties
        .getOrCreate('positionY')
        .setValue('0')
        .setLabel(_('Y position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Position'));
      properties
        .getOrCreate('positionZ')
        .setValue('500')
        .setLabel(_('Z position (height)'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Position'));
      properties
        .getOrCreate('attachedObject')
        .setValue('')
        .setLabel(_('Attached object name'))
        .setDescription(
          _(
            'Object name to follow. Leave empty to use the manual position values.'
          )
        )
        .setType('string')
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetX')
        .setValue('0')
        .setLabel(_('Attached offset X'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetY')
        .setValue('0')
        .setLabel(_('Attached offset Y'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetZ')
        .setValue('0')
        .setLabel(_('Attached offset Z'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('rotateOffsetsWithObjectAngle')
        .setValue('false')
        .setLabel(_('Rotate offsets with object angle'))
        .setDescription(
          _(
            'Rotate X/Y offsets using the attached object angle, useful for placing the light in a hand.'
          )
        )
        .setType('boolean')
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('distance')
        .setValue('0')
        .setLabel(_('Maximum distance'))
        .setDescription(
          _('Maximum range of the light. 0 means unlimited range.')
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attenuation'));
      properties
        .getOrCreate('decay')
        .setValue('2')
        .setLabel(_('Decay'))
        .setDescription(
          _(
            'How quickly the light dims with distance. 2 is physically correct. 0 means no decay.'
          )
        )
        .setType('number')
        .setGroup(_('Attenuation'));
      properties
        .getOrCreate('isCastingShadow')
        .setValue('false')
        .setLabel(_('Shadow casting'))
        .setType('boolean')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowQuality')
        .setValue('medium')
        .addChoice('low', _('Low quality'))
        .addChoice('medium', _('Medium quality'))
        .addChoice('high', _('High quality'))
        .setLabel(_('Shadow quality'))
        .setType('choice')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowBias')
        .setValue('0.001')
        .setLabel(_('Shadow bias'))
        .setDescription(
          _('Small offset to prevent shadow artifacts (acne). Default: 0.001.')
        )
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowNormalBias')
        .setValue('0.02')
        .setLabel(_('Shadow normal bias'))
        .setDescription(
          _(
            'Offset along object normals to prevent acne on curved surfaces. Default: 0.02.'
          )
        )
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowRadius')
        .setValue('1.5')
        .setLabel(_('Shadow softness'))
        .setDescription(_('Softness radius for point-light shadow filtering.'))
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowAutoTuning')
        .setValue('true')
        .setLabel(_('Auto shadow tuning'))
        .setDescription(
          _(
            'Automatically adjusts point-light shadow bias to reduce acne and peter-panning artifacts.'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowNear')
        .setValue('1')
        .setLabel(_('Shadow near'))
        .setDescription(_('Minimum distance for shadows to be cast.'))
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowFar')
        .setValue('10000')
        .setLabel(_('Shadow far'))
        .setDescription(_('Maximum distance for shadows to be cast.'))
        .setType('number')
        .setGroup(_('Shadows'));
    }
    {
      const effect = extension
        .addEffect('SpotLight')
        .setFullName(_('Spot light'))
        .setDescription(
          _(
            'A light that emits a cone-shaped beam from a position toward a target, like a flashlight or a stage spotlight. Can cast shadows.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/SpotLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('1')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Z+')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Z+')
        .addExtraInfo('Y-')
        .setGroup(_('Light position'));
      properties
        .getOrCreate('positionX')
        .setValue('0')
        .setLabel(_('X position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Light position'));
      properties
        .getOrCreate('positionY')
        .setValue('0')
        .setLabel(_('Y position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Light position'));
      properties
        .getOrCreate('positionZ')
        .setValue('500')
        .setLabel(_('Z position (height)'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Light position'));
      properties
        .getOrCreate('attachedObject')
        .setValue('')
        .setLabel(_('Attached object name'))
        .setDescription(
          _(
            'Object name to follow for the light position. Leave empty to use manual values.'
          )
        )
        .setType('string')
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetX')
        .setValue('0')
        .setLabel(_('Attached offset X'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetY')
        .setValue('0')
        .setLabel(_('Attached offset Y'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('attachedOffsetZ')
        .setValue('0')
        .setLabel(_('Attached offset Z'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('targetX')
        .setValue('0')
        .setLabel(_('Target X position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target position'));
      properties
        .getOrCreate('targetY')
        .setValue('0')
        .setLabel(_('Target Y position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target position'));
      properties
        .getOrCreate('targetZ')
        .setValue('0')
        .setLabel(_('Target Z position'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target position'));
      properties
        .getOrCreate('targetAttachedObject')
        .setValue('')
        .setLabel(_('Target attached object name'))
        .setDescription(
          _(
            'Object name to follow for the target position. Leave empty to use manual target values.'
          )
        )
        .setType('string')
        .setGroup(_('Target attachment'));
      properties
        .getOrCreate('targetAttachedOffsetX')
        .setValue('0')
        .setLabel(_('Target attached offset X'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target attachment'));
      properties
        .getOrCreate('targetAttachedOffsetY')
        .setValue('0')
        .setLabel(_('Target attached offset Y'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target attachment'));
      properties
        .getOrCreate('targetAttachedOffsetZ')
        .setValue('0')
        .setLabel(_('Target attached offset Z'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Target attachment'));
      properties
        .getOrCreate('rotateOffsetsWithObjectAngle')
        .setValue('false')
        .setLabel(_('Rotate offsets with object angle'))
        .setDescription(
          _(
            'Rotate X/Y offsets using the attached object angle, useful for flashlight-like behavior.'
          )
        )
        .setType('boolean')
        .setGroup(_('Attachment'));
      properties
        .getOrCreate('physicsBounceEnabled')
        .setValue('false')
        .setLabel(_('Physics bounce (Jolt)'))
        .setDescription(
          _(
            'Enable one-bounce reflected light using a raycast on Physics3D/Jolt bodies.'
          )
        )
        .setType('boolean')
        .setGroup(_('Physics bounce'));
      properties
        .getOrCreate('physicsBounceIntensityScale')
        .setValue('0.35')
        .setLabel(_('Bounce intensity scale'))
        .setDescription(
          _(
            'Intensity multiplier for the bounced light (0 disables bounced intensity).'
          )
        )
        .setType('number')
        .setGroup(_('Physics bounce'));
      properties
        .getOrCreate('physicsBounceDistance')
        .setValue('600')
        .setLabel(_('Bounce distance'))
        .setDescription(
          _('Maximum distance of the bounced light beam (in pixels).')
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Physics bounce'));
      properties
        .getOrCreate('physicsBounceOriginOffset')
        .setValue('2')
        .setLabel(_('Bounce origin offset'))
        .setDescription(
          _(
            'Small offset from the hit point along the surface normal to avoid self-intersection artifacts.'
          )
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Physics bounce'));
      properties
        .getOrCreate('physicsBounceCastShadow')
        .setValue('false')
        .setLabel(_('Bounce casts shadows'))
        .setDescription(
          _('Enable shadows for the bounced light (higher performance cost).')
        )
        .setType('boolean')
        .setGroup(_('Physics bounce'));
      properties
        .getOrCreate('angle')
        .setValue('45')
        .setLabel(_('Cone angle'))
        .setDescription(
          _(
            'Maximum angle of the light cone in degrees. A smaller value creates a narrower beam.'
          )
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setGroup(_('Cone'));
      properties
        .getOrCreate('penumbra')
        .setValue('0.1')
        .setLabel(_('Penumbra'))
        .setDescription(
          _(
            'Percentage of the cone that is attenuated due to penumbra. 0 means sharp edges, 1 means fully soft edges.'
          )
        )
        .setType('number')
        .setGroup(_('Cone'));
      properties
        .getOrCreate('distance')
        .setValue('0')
        .setLabel(_('Maximum distance'))
        .setDescription(
          _('Maximum range of the light. 0 means unlimited range.')
        )
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Attenuation'));
      properties
        .getOrCreate('decay')
        .setValue('2')
        .setLabel(_('Decay'))
        .setDescription(
          _(
            'How quickly the light dims with distance. 2 is physically correct. 0 means no decay.'
          )
        )
        .setType('number')
        .setGroup(_('Attenuation'));
      properties
        .getOrCreate('isCastingShadow')
        .setValue('false')
        .setLabel(_('Shadow casting'))
        .setType('boolean')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowQuality')
        .setValue('medium')
        .addChoice('low', _('Low quality'))
        .addChoice('medium', _('Medium quality'))
        .addChoice('high', _('High quality'))
        .setLabel(_('Shadow quality'))
        .setType('choice')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowBias')
        .setValue('0.001')
        .setLabel(_('Shadow bias'))
        .setDescription(
          _('Small offset to prevent shadow artifacts (acne). Default: 0.001.')
        )
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowNormalBias')
        .setValue('0.02')
        .setLabel(_('Shadow normal bias'))
        .setDescription(
          _('Offset along normals to reduce acne on curved surfaces.')
        )
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowRadius')
        .setValue('1.5')
        .setLabel(_('Shadow softness'))
        .setDescription(_('Softness radius for spot-light shadow filtering.'))
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowAutoTuning')
        .setValue('true')
        .setLabel(_('Auto shadow tuning'))
        .setDescription(
          _(
            'Automatically adjusts spot-light shadow bias and normal-bias for cleaner contact shadows.'
          )
        )
        .setType('boolean')
        .setGroup(_('Shadows'))
        .setAdvanced(true);
      properties
        .getOrCreate('shadowNear')
        .setValue('1')
        .setLabel(_('Shadow near'))
        .setDescription(_('Minimum distance for shadows to be cast.'))
        .setType('number')
        .setGroup(_('Shadows'));
      properties
        .getOrCreate('shadowFar')
        .setValue('10000')
        .setLabel(_('Shadow far'))
        .setDescription(_('Maximum distance for shadows to be cast.'))
        .setType('number')
        .setGroup(_('Shadows'));
    }
    {
      const effect = extension
        .addEffect('Skybox')
        .setFullName(_('Skybox'))
        .setDescription(
          _('Display a background on a cube surrounding the scene.')
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/Skybox.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('rightFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Right face (X+)'));
      properties
        .getOrCreate('leftFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Left face (X-)'));
      properties
        .getOrCreate('bottomFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bottom face (Y+)'));
      properties
        .getOrCreate('topFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Top face (Y-)'));
      properties
        .getOrCreate('frontFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Front face (Z+)'));
      properties
        .getOrCreate('backFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Back face (Z-)'));
      properties
        .getOrCreate('environmentIntensity')
        .setValue('1.0')
        .setLabel(_('Environment intensity'))
        .setType('number')
        .setDescription(
          _(
            'Intensity multiplier used when this skybox drives scene environment lighting.'
          )
        );
    }
    {
      const effect = extension
        .addEffect('HueAndSaturation')
        .setFullName(_('Hue and saturation'))
        .setDescription(_('Adjust hue and saturation.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/HueAndSaturationEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('hue')
        .setValue('0')
        .setLabel(_('Hue'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
        .setDescription(_('Between -180° and 180°'));
      properties
        .getOrCreate('saturation')
        .setValue('0')
        .setLabel(_('Saturation'))
        .setType('number')
        .setDescription(_('Between -1 and 1'));
    }
    {
      const effect = extension
        .addEffect('Exposure')
        .setFullName(_('Exposure'))
        .setDescription(_('Adjust exposure.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/ExposureEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('exposure')
        .setValue('1')
        .setLabel(_('Exposure'))
        .setType('number')
        .setDescription(_('Positive value'));
    }
    {
      const effect = extension
        .addEffect('ToneMapping')
        .setFullName(_('Tone mapping'))
        .setDescription(
          _(
            'Configure renderer tone mapping for a cinematic and physically based 3D look.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/ToneMappingEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('mode')
        .setValue('ACESFilmic')
        .addChoice('ACESFilmic', _('ACES Filmic'))
        .addChoice('Reinhard', _('Reinhard'))
        .addChoice('Cineon', _('Cineon'))
        .addChoice('Linear', _('Linear'))
        .setLabel(_('Mode'))
        .setType('choice')
        .setDescription(
          _(
            'ACESFilmic for cinematic look, Reinhard for softer highlights, Cineon for film look, Linear for no tone mapping.'
          )
        );
      properties
        .getOrCreate('exposure')
        .setValue('1.0')
        .setLabel(_('Exposure'))
        .setType('number')
        .setDescription(_('Brightness multiplier applied by tone mapping.'));
    }
    {
      const effect = extension
        .addEffect('PostProcessingStack')
        .setFullName(_('Post-processing stack'))
        .setDescription(
          _(
            'Master controller for 3D post-processing: captures scene/depth once, auto-orders effects, and applies shared quality.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/PostProcessingStackEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
      properties
        .getOrCreate('adaptiveQuality')
        .setValue('true')
        .setLabel(_('Adaptive quality'))
        .setType('boolean')
        .setDescription(
          _(
            'Automatically adjusts post-processing quality based on frame time to stabilize performance.'
          )
        );
      properties
        .getOrCreate('targetFps')
        .setValue('60')
        .setLabel(_('Adaptive target FPS'))
        .setType('number')
        .setDescription(
          _(
            'Performance target used by adaptive quality (recommended between 30 and 120).'
          )
        )
        .setAdvanced(true);
    }
    {
      const effect = extension
        .addEffect('Bloom')
        .setFullName(_('Bloom'))
        .setDescription(_('Apply a bloom effect.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/BloomEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('strength')
        .setValue('1')
        .setLabel(_('Strength'))
        .setType('number')
        .setDescription(_('Between 0 and 3'));
      properties
        .getOrCreate('radius')
        .setValue('0')
        .setLabel(_('Radius'))
        .setType('number')
        .setDescription(_('Between 0 and 1'));
      properties
        .getOrCreate('threshold')
        .setValue('0')
        .setLabel(_('Threshold'))
        .setType('number')
        .setDescription(_('Between 0 and 1'));
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
    }
    {
      const effect = extension
        .addEffect('ScreenSpaceReflections')
        .setFullName(_('Screen-space reflections'))
        .setDescription(
          _(
            'Render approximate screen-space reflections for visible surfaces in 3D.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/ScreenSpaceReflectionsEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('intensity')
        .setValue('0.75')
        .setLabel(_('Intensity'))
        .setType('number')
        .setDescription(_('Overall strength of reflected light.'));
      properties
        .getOrCreate('maxDistance')
        .setValue('420')
        .setLabel(_('Max distance'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(
          _('Maximum reflection tracing distance (balanced for performance).')
        );
      properties
        .getOrCreate('thickness')
        .setValue('4')
        .setLabel(_('Thickness'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(
          _('Depth tolerance to detect reflection hits reliably.')
        );
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
    }
    {
      const effect = extension
        .addEffect('ChromaticAberration')
        .setFullName(_('Chromatic aberration'))
        .setDescription(
          _(
            'Lens-like RGB channel separation that gets stronger toward screen edges.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/ChromaticAberrationEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('intensity')
        .setValue('0.005')
        .setLabel(_('Intensity'))
        .setType('number')
        .setDescription(
          _('How far red/blue channels split from the center direction.')
        );
      properties
        .getOrCreate('radialScale')
        .setValue('1.0')
        .setLabel(_('Radial scale'))
        .setType('number')
        .setDescription(
          _('How strongly the effect ramps from center to edges.')
        );
    }
    {
      const effect = extension
        .addEffect('ColorGrading')
        .setFullName(_('Color grading'))
        .setDescription(
          _(
            'Apply cinematic color grading in screen space: temperature, tint, saturation, contrast, and brightness.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/ColorGradingEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('temperature')
        .setValue('-0.3')
        .setLabel(_('Temperature'))
        .setType('number')
        .setDescription(
          _(
            'Negative = cool blue, positive = warm orange. Default tuned for cold horror mood.'
          )
        );
      properties
        .getOrCreate('tint')
        .setValue('-0.1')
        .setLabel(_('Tint'))
        .setType('number')
        .setDescription(_('Negative = greener, positive = magenta.'));
      properties
        .getOrCreate('saturation')
        .setValue('0.8')
        .setLabel(_('Saturation'))
        .setType('number')
        .setDescription(_('0 = grayscale, 1 = normal, >1 = oversaturated.'));
      properties
        .getOrCreate('contrast')
        .setValue('1.2')
        .setLabel(_('Contrast'))
        .setType('number')
        .setDescription(_('1 = neutral, >1 = stronger contrast.'));
      properties
        .getOrCreate('brightness')
        .setValue('0.95')
        .setLabel(_('Brightness'))
        .setType('number')
        .setDescription(_('1 = neutral, <1 darker, >1 brighter.'));
    }
    {
      const effect = extension
        .addEffect('SSAO')
        .setFullName(_('Ambient occlusion (SSAO)'))
        .setDescription(
          _(
            'Screen-space ambient occlusion that darkens corners, crevices and contact areas using depth.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/SSAOEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('radius')
        .setValue('60')
        .setLabel(_('Radius'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(_('Sampling radius in view space.'));
      properties
        .getOrCreate('intensity')
        .setValue('0.9')
        .setLabel(_('Intensity'))
        .setType('number')
        .setDescription(_('How strong occlusion darkening is.'));
      properties
        .getOrCreate('bias')
        .setValue('0.6')
        .setLabel(_('Bias'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(_('Prevents self-occlusion artifacts.'));
      properties
        .getOrCreate('samples')
        .setValue('4')
        .setLabel(_('Samples'))
        .setType('number')
        .setDescription(
          _('Quality/performance control (higher = better, slower).')
        );
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
    }
    {
      const effect = extension
        .addEffect('VolumetricFog')
        .setFullName(_('Volumetric fog'))
        .setDescription(
          _(
            'Simulate volumetric light scattering by ray-marching fog in screen space around scene lights.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/VolumetricFogEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('fogColor')
        .setValue('200;220;255')
        .setLabel(_('Fog color'))
        .setType('color');
      properties
        .getOrCreate('density')
        .setValue('0.012')
        .setLabel(_('Density'))
        .setType('number')
        .setDescription(_('Base fog density in the volume.'));
      properties
        .getOrCreate('lightScatter')
        .setValue('1')
        .setLabel(_('Light scatter'))
        .setType('number')
        .setDescription(_('How much fog glows near PointLight and SpotLight.'));
      properties
        .getOrCreate('maxDistance')
        .setValue('1200')
        .setLabel(_('Max distance'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(_('Maximum distance for volumetric ray marching.'));
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
    }
    {
      const effect = extension
        .addEffect('DepthOfField')
        .setFullName(_('Depth of field'))
        .setDescription(
          _(
            'Blur pixels based on distance from the focus plane using depth-aware gaussian blur.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/PostProcessingSharedResources.js')
        .addIncludeFile('Extensions/3D/DepthOfFieldEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('enabled')
        .setValue('true')
        .setLabel(_('Enabled'))
        .setType('boolean');
      properties
        .getOrCreate('focusDistance')
        .setValue('400')
        .setLabel(_('Focus distance'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(_('Distance from the camera that remains sharp.'));
      properties
        .getOrCreate('focusRange')
        .setValue('250')
        .setLabel(_('Focus range'))
        .setType('number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setDescription(
          _('How gradually blur increases around focus distance.')
        );
      properties
        .getOrCreate('maxBlur')
        .setValue('6')
        .setLabel(_('Max blur'))
        .setType('number')
        .setDescription(_('Maximum blur radius strength.'));
      properties
        .getOrCreate('samples')
        .setValue('4')
        .setLabel(_('Samples'))
        .setType('number')
        .setDescription(
          _('Blur taps around each pixel (higher = smoother, slower).')
        );
      properties
        .getOrCreate('qualityMode')
        .setValue('medium')
        .setLabel(_('Quality mode'))
        .setType('string')
        .setDescription(_('Use: low, medium, or high.'));
    }
    {
      const effect = extension
        .addEffect('BrightnessAndContrast')
        .setFullName(_('Brightness and contrast.'))
        .setDescription(_('Adjust brightness and contrast.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/BrightnessAndContrastEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('brightness')
        .setValue('0')
        .setLabel(_('Brightness'))
        .setType('number')
        .setDescription(_('Between -1 and 1'));
      properties
        .getOrCreate('contrast')
        .setValue('0')
        .setLabel(_('Contrast'))
        .setType('number')
        .setDescription(_('Between -1 and 1'));
    }
    // Don't forget to update the alert condition in Model3DEditor.js when
    // adding a new light.

    return extension;
  },
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instantiating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (objectsEditorService) {},
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const Rendered3DInstance = objectsRenderingService.Rendered3DInstance;
    const PIXI = objectsRenderingService.PIXI;
    const THREE = objectsRenderingService.THREE;
    const THREE_ADDONS = objectsRenderingService.THREE_ADDONS;

    const materialIndexToFaceIndex = {
      0: 3,
      1: 2,
      2: 5,
      3: 4,
      4: 0,
      5: 1,
    };

    const noRepeatTextureVertexIndexToUvMapping = {
      0: [0, 0],
      1: [1, 0],
      2: [0, 1],
      3: [1, 1],
    };

    const noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ = {
      0: [0, 1],
      1: [0, 0],
      2: [1, 1],
      3: [1, 0],
    };

    /**
     * @param {*} objectConfiguration
     * @returns {string | null}
     */
    const getFirstVisibleFaceResourceName = (objectConfiguration) => {
      const object = gd.castObject(
        objectConfiguration,
        gd.ObjectJsImplementation
      );

      const orderedFaces = [
        ['frontFaceVisible', 'frontFaceResourceName'],
        ['backFaceVisible', 'backFaceResourceName'],
        ['leftFaceVisible', 'leftFaceResourceName'],
        ['rightFaceVisible', 'rightFaceResourceName'],
        ['topFaceVisible', 'topFaceResourceName'],
        ['bottomFaceVisible', 'bottomFaceResourceName'],
      ];

      for (const [
        faceVisibleProperty,
        faceResourceNameProperty,
      ] of orderedFaces) {
        if (object.content[faceVisibleProperty]) {
          const textureResource = object.content[faceResourceNameProperty];
          if (textureResource) return textureResource;
        }
      }

      return null;
    };

    /** @type {THREE.MeshBasicMaterial | null} */
    let transparentMaterial = null;
    /**
     * @returns {THREE.MeshBasicMaterial}
     */
    const getTransparentMaterial = () => {
      if (transparentMaterial) {
        return transparentMaterial;
      }
      const newTransparentMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        // Set the alpha test to to ensure the faces behind are rendered
        // (no "back face culling" that would still be done if alphaTest is not set).
        alphaTest: 1,
      });
      transparentMaterial = newTransparentMaterial;
      return newTransparentMaterial;
    };

    class RenderedCube3DObject2DInstance extends RenderedInstance {
      /** @type {number} */
      _defaultWidth;
      /** @type {number} */
      _defaultHeight;
      /** @type {number} */
      _defaultDepth;
      /** @type {number} */
      _centerX = 0;
      /** @type {number} */
      _centerY = 0;
      /**
       * The name of the resource that is rendered.
       * If no face is visible, this will be null.
       * @type {string | null | undefined}
       */
      _renderedResourceName = undefined;
      _renderFallbackObject = false;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        this._defaultWidth = object.content.width;
        this._defaultHeight = object.content.height;
        this._defaultDepth = object.content.depth;

        this._pixiObject = new PIXI.Container();
        this._pixiFallbackObject = new PIXI.Graphics();
        this._pixiTexturedObject = new PIXI.Sprite(
          this._pixiResourcesLoader.getInvalidPIXITexture()
        );
        this._pixiObject.addChild(this._pixiTexturedObject);
        this._pixiObject.addChild(this._pixiFallbackObject);
        this._pixiContainer.addChild(this._pixiObject);
        this.updateTexture();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all sprites.
        this._pixiObject.destroy({ children: true });
      }

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        const textureResourceName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
            objectConfiguration
          );
        if (textureResourceName) {
          return resourcesLoader.getResourceFullUrl(
            project,
            textureResourceName,
            {}
          );
        }
        return 'JsPlatform/Extensions/3d_box.svg';
      }

      updateTextureIfNeeded() {
        const textureName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
            this._associatedObjectConfiguration
          );
        if (textureName === this._renderedResourceName) return;

        this.updateTexture();
      }

      updateTexture() {
        const textureName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
            this._associatedObjectConfiguration
          );

        if (!textureName) {
          this._renderFallbackObject = true;
          this._renderedResourceName = null;
        } else {
          const texture = this._pixiResourcesLoader.getPIXITexture(
            this._project,
            textureName
          );
          this._pixiTexturedObject.texture = texture;
          this._centerX = texture.frame.width / 2;
          this._centerY = texture.frame.height / 2;
          this._renderedResourceName = textureName;

          if (!texture.baseTexture.valid) {
            // Post pone texture update if texture is not loaded.
            texture.once('update', () => {
              if (this._wasDestroyed) return;

              this.updateTexture();
              this.updatePIXISprite();
            });
            return;
          }
        }
      }

      updatePIXISprite() {
        const width = this.getWidth();
        const height = this.getHeight();
        const objectTextureFrame = this._pixiTexturedObject.texture.frame;
        // In case the texture is not loaded yet, we don't want to crash.
        if (!objectTextureFrame) return;

        this._pixiTexturedObject.anchor.x =
          this._centerX / objectTextureFrame.width;
        this._pixiTexturedObject.anchor.y =
          this._centerY / objectTextureFrame.height;

        this._pixiTexturedObject.angle = this._instance.getAngle();
        const scaleX =
          (width / objectTextureFrame.width) *
          (this._instance.isFlippedX() ? -1 : 1);
        const scaleY =
          (height / objectTextureFrame.height) *
          (this._instance.isFlippedY() ? -1 : 1);
        this._pixiTexturedObject.scale.x = scaleX;
        this._pixiTexturedObject.scale.y = scaleY;

        this._pixiTexturedObject.position.x =
          this._instance.getX() +
          this._centerX * Math.abs(this._pixiTexturedObject.scale.x);
        this._pixiTexturedObject.position.y =
          this._instance.getY() +
          this._centerY * Math.abs(this._pixiTexturedObject.scale.y);
      }

      updateFallbackObject() {
        const width = this.getWidth();
        const height = this.getHeight();

        this._pixiFallbackObject.clear();
        this._pixiFallbackObject.beginFill(0x0033ff);
        this._pixiFallbackObject.lineStyle(1, 0xffd900, 1);
        this._pixiFallbackObject.moveTo(-width / 2, -height / 2);
        this._pixiFallbackObject.lineTo(width / 2, -height / 2);
        this._pixiFallbackObject.lineTo(width / 2, height / 2);
        this._pixiFallbackObject.lineTo(-width / 2, height / 2);
        this._pixiFallbackObject.endFill();

        this._pixiFallbackObject.position.x = this._instance.getX() + width / 2;
        this._pixiFallbackObject.position.y =
          this._instance.getY() + height / 2;
        this._pixiFallbackObject.angle = this._instance.getAngle();

        if (this._instance.isFlippedX()) this._pixiFallbackObject.scale.x = -1;
        if (this._instance.isFlippedY()) this._pixiFallbackObject.scale.y = -1;
      }

      update() {
        this.updateTextureIfNeeded();

        this._pixiFallbackObject.visible = this._renderFallbackObject;
        this._pixiTexturedObject.visible = !this._renderFallbackObject;

        if (this._renderFallbackObject) {
          this.updateFallbackObject();
        } else {
          this.updatePIXISprite();
        }
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }

      getCenterX() {
        if (this._renderFallbackObject) {
          return this.getWidth() / 2;
        } else {
          return this._centerX * this._pixiTexturedObject.scale.x;
        }
      }

      getCenterY() {
        if (this._renderFallbackObject) {
          return this.getHeight() / 2;
        } else {
          return this._centerY * this._pixiTexturedObject.scale.y;
        }
      }
    }

    class RenderedCube3DObject3DInstance extends Rendered3DInstance {
      _defaultWidth = 1;
      _defaultHeight = 1;
      _defaultDepth = 1;
      _faceResourceNames = new Array(6).fill(null);
      _faceVisibilities = new Array(6).fill(null);
      _shouldRepeatTextureOnFace = new Array(6).fill(null);
      _facesOrientation = 'Y';
      _backFaceUpThroughWhichAxisRotation = 'X';
      _shouldUseTransparentTexture = false;
      _tint = '';

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materials = [
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
        ];
        this._threeObject = new THREE.Mesh(geometry, materials);
        this._threeObject.rotation.order = 'ZYX';
        this._threeGroup.add(this._threeObject);

        this.updateThreeObject();
      }

      async _updateThreeObjectMaterials() {
        const getFaceMaterial = async (project, faceIndex) => {
          if (!this._faceVisibilities[faceIndex]) {
            return getTransparentMaterial();
          }

          return await this._pixiResourcesLoader.getThreeMaterial(
            project,
            this._faceResourceNames[faceIndex],
            {
              useTransparentTexture: this._shouldUseTransparentTexture,
            }
          );
        };

        const materials = await Promise.all([
          getFaceMaterial(this._project, materialIndexToFaceIndex[0]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[1]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[2]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[3]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[4]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[5]),
        ]);
        if (this._wasDestroyed) return;

        this._threeObject.material[0] = materials[0];
        this._threeObject.material[1] = materials[1];
        this._threeObject.material[2] = materials[2];
        this._threeObject.material[3] = materials[3];
        this._threeObject.material[4] = materials[4];
        this._threeObject.material[5] = materials[5];

        this._updateTextureUvMapping();
      }

      _updateTint() {
        const tints = [];
        const normalizedTint = objectsRenderingService
          .hexNumberToRGBArray(
            objectsRenderingService.rgbOrHexToHexNumber(this._tint)
          )
          .map((component) => component / 255);

        for (
          let i = 0;
          i < this._threeObject.geometry.attributes.position.count;
          i++
        ) {
          tints.push(...normalizedTint);
        }

        this._threeObject.geometry.setAttribute(
          'color',
          new THREE.BufferAttribute(new Float32Array(tints), 3)
        );
      }

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      updateThreeObject() {
        /** @type {gdjs.Cube3DObjectData} */
        //@ts-ignore This works because the properties are set to `content` in JavaScript.
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        this._defaultWidth = object.content.width;
        this._defaultHeight = object.content.height;
        this._defaultDepth = object.content.depth;

        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();

        this._threeObject.position.set(
          this._instance.getX() + width / 2,
          this._instance.getY() + height / 2,
          this._instance.getZ() + depth / 2
        );

        this._threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );

        let materialsDirty = false;
        let uvMappingDirty = false;
        let tintDirty = false;

        const shouldUseTransparentTexture =
          object.content.enableTextureTransparency || false;
        if (this._shouldUseTransparentTexture !== shouldUseTransparentTexture) {
          this._shouldUseTransparentTexture = shouldUseTransparentTexture;
          materialsDirty = true;
        }
        const tint = object.content.tint || '255;255;255';
        if (this._tint !== tint) {
          this._tint = tint;
          tintDirty = true;
        }

        const faceResourceNames = [
          object.content.frontFaceResourceName,
          object.content.backFaceResourceName,
          object.content.leftFaceResourceName,
          object.content.rightFaceResourceName,
          object.content.topFaceResourceName,
          object.content.bottomFaceResourceName,
        ];
        if (
          this._faceResourceNames[0] !== faceResourceNames[0] ||
          this._faceResourceNames[1] !== faceResourceNames[1] ||
          this._faceResourceNames[2] !== faceResourceNames[2] ||
          this._faceResourceNames[3] !== faceResourceNames[3] ||
          this._faceResourceNames[4] !== faceResourceNames[4] ||
          this._faceResourceNames[5] !== faceResourceNames[5]
        ) {
          this._faceResourceNames = faceResourceNames;
          materialsDirty = true;
        }

        const faceVisibilities = [
          object.content.frontFaceVisible,
          object.content.backFaceVisible,
          object.content.leftFaceVisible,
          object.content.rightFaceVisible,
          object.content.topFaceVisible,
          object.content.bottomFaceVisible,
        ];
        if (
          this._faceVisibilities[0] !== faceVisibilities[0] ||
          this._faceVisibilities[1] !== faceVisibilities[1] ||
          this._faceVisibilities[2] !== faceVisibilities[2] ||
          this._faceVisibilities[3] !== faceVisibilities[3] ||
          this._faceVisibilities[4] !== faceVisibilities[4] ||
          this._faceVisibilities[5] !== faceVisibilities[5]
        ) {
          this._faceVisibilities = faceVisibilities;
          materialsDirty = true;
          uvMappingDirty = true;
        }

        const shouldRepeatTextureOnFace = [
          object.content.frontFaceResourceRepeat || false,
          object.content.backFaceResourceRepeat || false,
          object.content.leftFaceResourceRepeat || false,
          object.content.rightFaceResourceRepeat || false,
          object.content.topFaceResourceRepeat || false,
          object.content.bottomFaceResourceRepeat || false,
        ];
        if (
          this._shouldRepeatTextureOnFace[0] !== shouldRepeatTextureOnFace[0] ||
          this._shouldRepeatTextureOnFace[1] !== shouldRepeatTextureOnFace[1] ||
          this._shouldRepeatTextureOnFace[2] !== shouldRepeatTextureOnFace[2] ||
          this._shouldRepeatTextureOnFace[3] !== shouldRepeatTextureOnFace[3] ||
          this._shouldRepeatTextureOnFace[4] !== shouldRepeatTextureOnFace[4] ||
          this._shouldRepeatTextureOnFace[5] !== shouldRepeatTextureOnFace[5]
        ) {
          this._shouldRepeatTextureOnFace = shouldRepeatTextureOnFace;
          uvMappingDirty = true;
        }

        const backFaceUpThroughWhichAxisRotation =
          object.content.backFaceUpThroughWhichAxisRotation || 'X';
        if (
          backFaceUpThroughWhichAxisRotation !==
          this._backFaceUpThroughWhichAxisRotation
        ) {
          this._backFaceUpThroughWhichAxisRotation =
            backFaceUpThroughWhichAxisRotation;
          uvMappingDirty = true;
        }

        const facesOrientation = object.content.facesOrientation || 'Y';
        if (facesOrientation !== this._facesOrientation) {
          this._facesOrientation = facesOrientation;
          uvMappingDirty = true;
        }

        const scaleX = width * (this._instance.isFlippedX() ? -1 : 1);
        const scaleY = height * (this._instance.isFlippedY() ? -1 : 1);
        const scaleZ = depth * (this._instance.isFlippedZ() ? -1 : 1);
        if (
          scaleX !== this._threeObject.scale.x ||
          scaleY !== this._threeObject.scale.y ||
          scaleZ !== this._threeObject.scale.z
        ) {
          this._threeObject.scale.set(scaleX, scaleY, scaleZ);
          uvMappingDirty = true;
        }

        if (materialsDirty) this._updateThreeObjectMaterials();
        if (uvMappingDirty) this._updateTextureUvMapping();
        if (tintDirty) this._updateTint();
      }

      /**
       * Updates the UV mapping of the geometry in order to repeat a material
       * over the different faces of the cube.
       * The mesh must be configured with a list of materials in order
       * for the method to work.
       */
      _updateTextureUvMapping() {
        /** @type {THREE.BufferAttribute} */
        // @ts-ignore - position is stored as a Float32BufferAttribute
        const pos = this._threeObject.geometry.getAttribute('position');
        /** @type {THREE.BufferAttribute} */
        // @ts-ignore - uv is stored as a Float32BufferAttribute
        const uvMapping = this._threeObject.geometry.getAttribute('uv');
        const startIndex = 0;
        const endIndex = 23;
        for (
          let vertexIndex = startIndex;
          vertexIndex <= endIndex;
          vertexIndex++
        ) {
          const materialIndex = Math.floor(
            vertexIndex /
              // Each face of the cube has 4 points
              4
          );
          const material = this._threeObject.material[materialIndex];
          if (!material || !material.map) {
            continue;
          }

          const shouldRepeatTexture =
            this._shouldRepeatTextureOnFace[
              materialIndexToFaceIndex[materialIndex]
            ];

          const shouldOrientateFacesTowardsY = this._facesOrientation === 'Y';

          let x = 0;
          let y = 0;
          switch (materialIndex) {
            case 0:
              // Right face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    -(
                      this._threeObject.scale.z / material.map.source.data.width
                    ) *
                    (pos.getZ(vertexIndex) - 0.5);
                  y =
                    -(
                      this._threeObject.scale.y /
                      material.map.source.data.height
                    ) *
                    (pos.getY(vertexIndex) + 0.5);
                } else {
                  x =
                    -(
                      this._threeObject.scale.y / material.map.source.data.width
                    ) *
                    (pos.getY(vertexIndex) - 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                if (shouldOrientateFacesTowardsY) {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                } else {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                      vertexIndex % 4
                    ];
                }
              }
              break;
            case 1:
              // Left face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    (this._threeObject.scale.z /
                      material.map.source.data.width) *
                    (pos.getZ(vertexIndex) + 0.5);
                  y =
                    -(
                      this._threeObject.scale.y /
                      material.map.source.data.height
                    ) *
                    (pos.getY(vertexIndex) + 0.5);
                } else {
                  x =
                    (this._threeObject.scale.y /
                      material.map.source.data.width) *
                    (pos.getY(vertexIndex) + 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                if (shouldOrientateFacesTowardsY) {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                } else {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                      vertexIndex % 4
                    ];
                  x = -x;
                  y = -y;
                }
              }
              break;
            case 2:
              // Bottom face
              if (shouldRepeatTexture) {
                x =
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) + 0.5);
                y =
                  (this._threeObject.scale.z /
                    material.map.source.data.height) *
                  (pos.getZ(vertexIndex) - 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              }
              break;
            case 3:
              // Top face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    (this._threeObject.scale.x /
                      material.map.source.data.width) *
                    (pos.getX(vertexIndex) + 0.5);
                  y =
                    -(
                      this._threeObject.scale.z /
                      material.map.source.data.height
                    ) *
                    (pos.getZ(vertexIndex) + 0.5);
                } else {
                  x =
                    -(
                      this._threeObject.scale.x / material.map.source.data.width
                    ) *
                    (pos.getX(vertexIndex) - 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                if (!shouldOrientateFacesTowardsY) {
                  x = -x;
                  y = -y;
                }
              }
              break;
            case 4:
              // Front face
              if (shouldRepeatTexture) {
                x =
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) + 0.5);
                y =
                  -(
                    this._threeObject.scale.y / material.map.source.data.height
                  ) *
                  (pos.getY(vertexIndex) + 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              }
              break;
            case 5:
              // Back face
              const shouldBackFaceBeUpThroughXAxisRotation =
                this._backFaceUpThroughWhichAxisRotation === 'X';

              if (shouldRepeatTexture) {
                x =
                  (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) +
                    (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) * 0.5);
                y =
                  (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                  (this._threeObject.scale.y /
                    material.map.source.data.height) *
                  (pos.getY(vertexIndex) +
                    (shouldBackFaceBeUpThroughXAxisRotation ? -1 : 1) * 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                if (shouldBackFaceBeUpThroughXAxisRotation) {
                  x = -x;
                  y = -y;
                }
              }
              break;
            default:
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
          }
          uvMapping.setXY(vertexIndex, x, y);
        }
        uvMapping.needsUpdate = true;
      }

      updatePixiObject() {
        const width = this.getWidth();
        const height = this.getHeight();

        this._pixiObject.clear();
        this._pixiObject.beginFill(0x999999, 0.2);
        this._pixiObject.lineStyle(1, 0xffd900, 0);
        this._pixiObject.moveTo(-width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, height / 2);
        this._pixiObject.lineTo(-width / 2, height / 2);
        this._pixiObject.endFill();

        this._pixiObject.position.x = this._instance.getX() + width / 2;
        this._pixiObject.position.y = this._instance.getY() + height / 2;
        this._pixiObject.angle = this._instance.getAngle();
      }

      update() {
        this.updatePixiObject();
        this.updateThreeObject();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'Scene3D::Cube3DObject',
      RenderedCube3DObject2DInstance
    );
    objectsRenderingService.registerInstance3DRenderer(
      'Scene3D::Cube3DObject',
      RenderedCube3DObject3DInstance
    );

    const epsilon = 1 / (1 << 16);

    class Model3DRendered2DInstance extends RenderedInstance {
      /** @type {number} */
      _defaultWidth;
      /** @type {number} */
      _defaultHeight;
      /** @type {number} */
      _defaultDepth;

      /** @type {[number, number, number] | null} */
      _originPoint;
      /** @type {[number, number, number] | null} */
      _centerPoint;

      /** @type {[number, number, number]} */
      _modelOriginPoint = [0, 0, 0];

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.Model3DObjectConfiguration
        );

        this._defaultWidth = object.getWidth();
        this._defaultHeight = object.getHeight();
        this._defaultDepth = object.getDepth();
        const rotationX = object.getRotationX();
        const rotationY = object.getRotationY();
        const rotationZ = object.getRotationZ();
        const keepAspectRatio = object.shouldKeepAspectRatio();
        const modelResourceName = object.getModelResourceName();

        this._originPoint = getPointForLocation(object.getOriginLocation());
        this._centerPoint = getPointForLocation(object.getCenterLocation());

        // This renderer shows a placeholder for the object:
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._pixiResourcesLoader
          .get3DModel(project, modelResourceName)
          .then((model3d) => {
            if (this._wasDestroyed) return;
            const clonedModel3D = THREE_ADDONS.SkeletonUtils.clone(
              model3d.scene
            );
            // This group hold the rotation defined by properties.
            const threeObject = new THREE.Group();
            threeObject.rotation.order = 'ZYX';
            threeObject.add(clonedModel3D);
            this._updateDefaultTransformation(
              threeObject,
              rotationX,
              rotationY,
              rotationZ,
              this._defaultWidth,
              this._defaultHeight,
              this._defaultDepth,
              keepAspectRatio
            );
          });
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy({ children: true });
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/3d_model.svg';
      }

      getOriginX() {
        const originPoint = this.getOriginPoint();
        return this.getWidth() * originPoint[0];
      }

      getOriginY() {
        const originPoint = this.getOriginPoint();
        return this.getHeight() * originPoint[1];
      }

      getCenterX() {
        const centerPoint = this.getCenterPoint();
        return this.getWidth() * centerPoint[0];
      }

      getCenterY() {
        const centerPoint = this.getCenterPoint();
        return this.getHeight() * centerPoint[1];
      }

      getOriginPoint() {
        return this._originPoint || this._modelOriginPoint;
      }

      getCenterPoint() {
        return this._centerPoint || this._modelOriginPoint;
      }

      _updateDefaultTransformation(
        threeObject,
        rotationX,
        rotationY,
        rotationZ,
        originalWidth,
        originalHeight,
        originalDepth,
        keepAspectRatio
      ) {
        // These formulas are also used in:
        // - gdjs.Model3DRuntimeObject3DRenderer._updateDefaultTransformation
        // - Model3DEditor.modelSize
        threeObject.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );
        threeObject.updateMatrixWorld(true);
        const boundingBox = new THREE.Box3().setFromObject(threeObject);
        const shouldKeepModelOrigin = !this._originPoint;
        if (shouldKeepModelOrigin) {
          // Keep the origin as part of the model.
          // For instance, a model can be 1 face of a cube and we want to keep the
          // inside as part of the object even if it's just void.
          // It also avoids to have the origin outside of the object box.
          boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
        }

        const modelWidth = boundingBox.max.x - boundingBox.min.x;
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        const modelDepth = boundingBox.max.z - boundingBox.min.z;
        this._modelOriginPoint[0] =
          modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth;
        this._modelOriginPoint[1] =
          modelHeight < epsilon ? 0 : -boundingBox.min.y / modelHeight;
        this._modelOriginPoint[2] =
          modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth;

        // The model is flipped on Y axis.
        this._modelOriginPoint[1] = 1 - this._modelOriginPoint[1];

        // Center the model.
        const centerPoint = this._centerPoint;
        if (centerPoint) {
          threeObject.position.set(
            -(boundingBox.min.x + modelWidth * centerPoint[0]),
            // The model is flipped on Y axis.
            -(boundingBox.min.y + modelHeight * (1 - centerPoint[1])),
            -(boundingBox.min.z + modelDepth * centerPoint[2])
          );
        }

        // Rotate the model.
        threeObject.scale.set(1, 1, 1);
        threeObject.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );

        // Stretch the model in a 1x1x1 cube.
        const scaleX = modelWidth < epsilon ? 1 : 1 / modelWidth;
        const scaleY = modelHeight < epsilon ? 1 : 1 / modelHeight;
        const scaleZ = modelDepth < epsilon ? 1 : 1 / modelDepth;

        const scaleMatrix = new THREE.Matrix4();
        // Flip on Y because the Y axis is on the opposite side of direct basis.
        // It avoids models to be like a mirror refection.
        scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
        threeObject.updateMatrix();
        threeObject.applyMatrix4(scaleMatrix);

        if (keepAspectRatio) {
          // Reduce the object dimensions to keep aspect ratio.
          const widthRatio =
            modelWidth < epsilon
              ? Number.POSITIVE_INFINITY
              : originalWidth / modelWidth;
          const heightRatio =
            modelHeight < epsilon
              ? Number.POSITIVE_INFINITY
              : originalHeight / modelHeight;
          const depthRatio =
            modelDepth < epsilon
              ? Number.POSITIVE_INFINITY
              : originalDepth / modelDepth;
          let scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);
          if (!Number.isFinite(scaleRatio)) {
            scaleRatio = 1;
          }

          this._defaultWidth = scaleRatio * modelWidth;
          this._defaultHeight = scaleRatio * modelHeight;
          this._defaultDepth = scaleRatio * modelDepth;
        }
      }

      update() {
        const width = this.getWidth();
        const height = this.getHeight();
        const centerPoint = this.getCenterPoint();
        const centerX = width * centerPoint[0];
        const centerY = height * centerPoint[1];

        const minX = 0 - centerX;
        const minY = 0 - centerY;
        const maxX = width - centerX;
        const maxY = height - centerY;
        this._pixiObject.clear();
        this._pixiObject.beginFill(0x0033ff);
        this._pixiObject.lineStyle(1, 0xffd900, 1);
        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.lineTo(minX, maxY);
        this._pixiObject.endFill();

        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.moveTo(maxX, minY);
        this._pixiObject.lineTo(minX, maxY);

        const originPoint = this.getOriginPoint();
        this._pixiObject.position.x =
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]);
        this._pixiObject.position.y =
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]);
        this._pixiObject.angle = this._instance.getAngle();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    /**
     * @param {[number, number, number] | null} point1
     * @param {[number, number, number] | null} point2
     * @returns {boolean}
     */
    const isSamePoint = (point1, point2) => {
      if (!!point1 !== !!point2) return false;
      // At this point || or && doesn't matter and the type checking prefer ||.
      if (!point1 || !point2) return true;
      return (
        point1[0] === point2[0] &&
        point1[1] === point2[1] &&
        point1[2] === point2[2]
      );
    };

    /**
     * @param {string} location
     * @returns {[number, number, number] | null}
     */
    const getPointForLocation = (location) => {
      switch (location) {
        case 'ModelOrigin':
          return null;
        case 'ObjectCenter':
          return [0.5, 0.5, 0.5];
        case 'BottomCenterZ':
          return [0.5, 0.5, 0];
        case 'BottomCenterY':
          return [0.5, 1, 0.5];
        case 'TopLeft':
          return [0, 0, 0];
        default:
          return null;
      }
    };

    class Model3DRendered3DInstance extends Rendered3DInstance {
      _defaultWidth = 1;
      _defaultHeight = 1;
      _defaultDepth = 1;
      _originalWidth = 1;
      _originalHeight = 1;
      _originalDepth = 1;
      _rotationX = 0;
      _rotationY = 0;
      _rotationZ = 0;
      _keepAspectRatio = false;
      /** @type {[number, number, number] | null} */
      _originPoint = null;
      /** @type {[number, number, number] | null} */
      _centerPoint = null;

      /** @type {[number, number, number]} */
      _modelOriginPoint = [0, 0, 0];

      /** @type {THREE.Object3D | null} */
      _clonedModel3D = null;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );

        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._threeObject = new THREE.Group();
        this._threeObject.rotation.order = 'ZYX';
        this._threeObject.castShadow = true;
        this._threeObject.receiveShadow = true;
        this._threeGroup.add(this._threeObject);
      }

      getOriginX() {
        const originPoint = this.getOriginPoint();
        return this.getWidth() * originPoint[0];
      }

      getOriginY() {
        const originPoint = this.getOriginPoint();
        return this.getHeight() * originPoint[1];
      }

      getOriginZ() {
        const originPoint = this.getOriginPoint();
        return this.getDepth() * originPoint[2];
      }

      getCenterX() {
        const centerPoint = this.getCenterPoint();
        return this.getWidth() * centerPoint[0];
      }

      getCenterY() {
        const centerPoint = this.getCenterPoint();
        return this.getHeight() * centerPoint[1];
      }

      getCenterZ() {
        const centerPoint = this.getCenterPoint();
        return this.getDepth() * centerPoint[2];
      }

      getOriginPoint() {
        return this._originPoint || this._modelOriginPoint;
      }

      getCenterPoint() {
        return this._centerPoint || this._modelOriginPoint;
      }

      _updateDefaultTransformation() {
        if (!this._clonedModel3D) {
          // Model is not ready - nothing to do.
          return;
        }

        if (this._threeModelGroup) {
          // Remove any previous container as we will recreate it just below
          this._threeObject.clear();
        }

        // This group hold the rotation defined by properties.
        // Always restart from a new group to avoid miscomputing bounding boxes/sizes.
        const threeModelGroup = new THREE.Group();
        this._threeModelGroup = threeModelGroup;
        threeModelGroup.rotation.order = 'ZYX';
        threeModelGroup.add(this._clonedModel3D);

        threeModelGroup.rotation.set(
          (this._rotationX * Math.PI) / 180,
          (this._rotationY * Math.PI) / 180,
          (this._rotationZ * Math.PI) / 180
        );
        threeModelGroup.updateMatrixWorld(true);
        const boundingBox = new THREE.Box3().setFromObject(threeModelGroup);

        const shouldKeepModelOrigin = !this._originPoint;
        if (shouldKeepModelOrigin) {
          // Keep the origin as part of the model.
          // For instance, a model can be 1 face of a cube and we want to keep the
          // inside as part of the object even if it's just void.
          // It also avoids to have the origin outside of the object box.
          boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
        }

        const modelWidth = boundingBox.max.x - boundingBox.min.x;
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        const modelDepth = boundingBox.max.z - boundingBox.min.z;
        this._modelOriginPoint[0] =
          modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth;
        this._modelOriginPoint[1] =
          modelHeight < epsilon ? 0 : -boundingBox.min.y / modelHeight;
        this._modelOriginPoint[2] =
          modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth;

        // The model is flipped on Y axis.
        this._modelOriginPoint[1] = 1 - this._modelOriginPoint[1];

        // Center the model.
        const centerPoint = this._centerPoint;
        if (centerPoint) {
          threeModelGroup.position.set(
            -(boundingBox.min.x + modelWidth * centerPoint[0]),
            // The model is flipped on Y axis.
            -(boundingBox.min.y + modelHeight * (1 - centerPoint[1])),
            -(boundingBox.min.z + modelDepth * centerPoint[2])
          );
        }

        // Rotate the model.
        threeModelGroup.scale.set(1, 1, 1);
        threeModelGroup.rotation.set(
          (this._rotationX * Math.PI) / 180,
          (this._rotationY * Math.PI) / 180,
          (this._rotationZ * Math.PI) / 180
        );

        // Stretch the model in a 1x1x1 cube.
        const scaleX = modelWidth < epsilon ? 1 : 1 / modelWidth;
        const scaleY = modelHeight < epsilon ? 1 : 1 / modelHeight;
        const scaleZ = modelDepth < epsilon ? 1 : 1 / modelDepth;

        const scaleMatrix = new THREE.Matrix4();
        // Flip on Y because the Y axis is on the opposite side of direct basis.
        // It avoids models to be like a mirror refection.
        scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
        threeModelGroup.updateMatrix();
        threeModelGroup.applyMatrix4(scaleMatrix);

        if (this._keepAspectRatio) {
          // Reduce the object dimensions to keep aspect ratio.
          const widthRatio =
            modelWidth < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalWidth / modelWidth;
          const heightRatio =
            modelHeight < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalHeight / modelHeight;
          const depthRatio =
            modelDepth < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalDepth / modelDepth;
          const minScaleRatio = Math.min(widthRatio, heightRatio, depthRatio);
          if (!Number.isFinite(minScaleRatio)) {
            this._defaultWidth = this._originalWidth;
            this._defaultHeight = this._originalHeight;
            this._defaultDepth = this._originalDepth;
          } else {
            if (widthRatio === minScaleRatio) {
              this._defaultWidth = this._originalWidth;
              this._defaultHeight = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelWidth,
                newReferenceValue: this._originalWidth,
                valueToApplyTo: modelHeight,
              });
              this._defaultDepth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelWidth,
                newReferenceValue: this._originalWidth,
                valueToApplyTo: modelDepth,
              });
            } else if (heightRatio === minScaleRatio) {
              this._defaultWidth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelHeight,
                newReferenceValue: this._originalHeight,
                valueToApplyTo: modelWidth,
              });

              this._defaultHeight = this._originalHeight;
              this._defaultDepth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelHeight,
                newReferenceValue: this._originalHeight,
                valueToApplyTo: modelDepth,
              });
            } else {
              this._defaultWidth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelDepth,
                newReferenceValue: this._originalDepth,
                valueToApplyTo: modelWidth,
              });
              this._defaultHeight = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelDepth,
                newReferenceValue: this._originalDepth,
                valueToApplyTo: modelHeight,
              });
              this._defaultDepth = this._originalDepth;
            }
          }
        } else {
          this._defaultWidth = this._originalWidth;
          this._defaultHeight = this._originalHeight;
          this._defaultDepth = this._originalDepth;
        }

        this._threeObject.add(threeModelGroup);
      }

      updateThreeObject() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.Model3DObjectConfiguration
        );

        let defaultTransformationDirty = false;

        const originalWidth = object.getWidth();
        const originalHeight = object.getHeight();
        const originalDepth = object.getDepth();
        if (
          this._originalWidth !== originalWidth ||
          this._originalHeight !== originalHeight ||
          this._originalDepth !== originalDepth
        ) {
          this._originalWidth = originalWidth;
          this._originalHeight = originalHeight;
          this._originalDepth = originalDepth;
          defaultTransformationDirty = true;
        }

        const rotationX = object.getRotationX();
        const rotationY = object.getRotationY();
        const rotationZ = object.getRotationZ();
        if (
          this._rotationX !== rotationX ||
          this._rotationY !== rotationY ||
          this._rotationZ !== rotationZ
        ) {
          this._rotationX = rotationX;
          this._rotationY = rotationY;
          this._rotationZ = rotationZ;
          defaultTransformationDirty = true;
        }

        const keepAspectRatio = object.shouldKeepAspectRatio();
        if (this._keepAspectRatio !== keepAspectRatio) {
          this._keepAspectRatio = keepAspectRatio;
          defaultTransformationDirty = true;
        }

        const originPoint = getPointForLocation(object.getOriginLocation());
        if (!isSamePoint(originPoint, this._originPoint)) {
          this._originPoint = originPoint;
          defaultTransformationDirty = true;
        }

        const centerPoint = getPointForLocation(object.getCenterLocation());
        if (!isSamePoint(centerPoint, this._centerPoint)) {
          this._centerPoint = centerPoint;
          defaultTransformationDirty = true;
        }

        if (defaultTransformationDirty) this._updateDefaultTransformation();

        const modelResourceName = object.getModelResourceName();
        if (this._modelResourceName !== modelResourceName) {
          this._modelResourceName = modelResourceName;

          this._pixiResourcesLoader
            .get3DModel(this._project, modelResourceName)
            .then((model3d) => {
              if (this._wasDestroyed) return;
              this._clonedModel3D = THREE_ADDONS.SkeletonUtils.clone(
                model3d.scene
              );

              this._updateDefaultTransformation();
            });
        }

        this._updateThreeObjectPosition();
      }

      _updateThreeObjectPosition() {
        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();

        const originPoint = this.getOriginPoint();
        const centerPoint = this.getCenterPoint();
        this._threeObject.position.set(
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]),
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]),
          this._instance.getZ() - depth * (originPoint[2] - centerPoint[2])
        );

        this._threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );

        const scaleX = width * (this._instance.isFlippedX() ? -1 : 1);
        const scaleY = height * (this._instance.isFlippedY() ? -1 : 1);
        const scaleZ = depth * (this._instance.isFlippedZ() ? -1 : 1);

        if (
          scaleX !== this._threeObject.scale.x ||
          scaleY !== this._threeObject.scale.y ||
          scaleZ !== this._threeObject.scale.z
        ) {
          this._threeObject.scale.set(scaleX, scaleY, scaleZ);
        }
      }

      updatePixiObject() {
        const width = this.getWidth();
        const height = this.getHeight();
        const centerPoint = this.getCenterPoint();
        const centerX = width * centerPoint[0];
        const centerY = height * centerPoint[1];

        const minX = 0 - centerX;
        const minY = 0 - centerY;
        const maxX = width - centerX;
        const maxY = height - centerY;
        this._pixiObject.clear();
        this._pixiObject.beginFill(0x999999, 0.2);
        this._pixiObject.lineStyle(1, 0xffd900, 0);
        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.lineTo(minX, maxY);
        this._pixiObject.endFill();

        const originPoint = this.getOriginPoint();
        this._pixiObject.position.x =
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]);
        this._pixiObject.position.y =
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]);
        this._pixiObject.angle = this._instance.getAngle();
      }

      update() {
        this.updatePixiObject();
        this.updateThreeObject();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'Scene3D::Model3DObject',
      Model3DRendered2DInstance
    );

    objectsRenderingService.registerInstance3DRenderer(
      'Scene3D::Model3DObject',
      Model3DRendered3DInstance
    );
  },
};
