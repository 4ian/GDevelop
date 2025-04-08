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
        'Physics3D',
        _('3D physics engine'),
        "The 3D physics engine simulates realistic object physics, with gravity, forces, collisions, joints, etc. It's perfect for almost all 3D games.",
        'Florian Rival',
        'MIT'
      )
      .setExtensionHelpPath('/behaviors/physics3d')
      .setCategory('Movement')
      .setTags('physics, gravity, obstacle, collision');
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D physics engine'))
      .setIcon('JsPlatform/Extensions/physics3d.svg');
    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'object3D') {
          behaviorContent.getChild('object3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'bodyType') {
          behaviorContent.getChild('bodyType').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'bullet') {
          behaviorContent.getChild('bullet').setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'fixedRotation') {
          behaviorContent
            .getChild('fixedRotation')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'shape') {
          behaviorContent.getChild('shape').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'shapeOrientation') {
          behaviorContent.getChild('shapeOrientation').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'shapeDimensionA') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionA')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeDimensionB') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionB')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeDimensionC') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeDimensionC')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shapeOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('shapeOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'massCenterOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('massCenterOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'density') {
          behaviorContent
            .getChild('density')
            .setDoubleValue(parseFloat(newValue));
          return true;
        }

        if (propertyName === 'friction') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent.getChild('friction').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'restitution') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('restitution')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'linearDamping') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('linearDamping')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'angularDamping') {
          const newValueAsNumber = Math.max(0, parseFloat(newValue));
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('angularDamping')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityScale') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gravityScale')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'layers') {
          behaviorContent
            .getChild('layers')
            .setIntValue(parseInt(newValue, 10));
          return true;
        }

        if (propertyName === 'masks') {
          behaviorContent.getChild('masks').setIntValue(parseInt(newValue, 10));
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('object3D')
          .setValue(behaviorContent.getChild('Object3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D capability')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Scene3D::Base3DBehavior');

        behaviorProperties
          .getOrCreate('bodyType')
          .setValue(behaviorContent.getChild('bodyType').getStringValue())
          .setType('Choice')
          .setLabel('Type')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Static')
          .addExtraInfo('Dynamic')
          .addExtraInfo('Kinematic')
          .setDescription(
            _(
              "A static object won't move (perfect for obstacles). Dynamic objects can move. Kinematic will move according to forces applied to it only (useful for characters or specific mechanisms)."
            )
          );
        behaviorProperties
          .getOrCreate('bullet')
          .setValue(
            behaviorContent.getChild('bullet').getBoolValue() ? 'true' : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Considered as a bullet'))
          .setDescription(
            _(
              'Useful for fast moving objects which requires a more accurate collision detection.'
            )
          )
          .setGroup(_('Physics body advanced settings'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('fixedRotation')
          .setValue(
            behaviorContent.getChild('fixedRotation').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel('Fixed Rotation')
          .setDescription(
            _(
              "If enabled, the object won't rotate and will stay at the same angle. Useful for characters for example."
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('shape')
          .setValue(behaviorContent.getChild('shape').getStringValue())
          .setType('Choice')
          .setLabel('Shape')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Box')
          .addExtraInfo('Capsule')
          .addExtraInfo('Cylinder')
          .addExtraInfo('Sphere');
        behaviorProperties
          .getOrCreate('shapeOrientation')
          .setValue(
            behaviorContent.getChild('shapeOrientation').getStringValue()
          )
          .setType('Choice')
          .setLabel('Shape orientation')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Z')
          .addExtraInfo('Y')
          .addExtraInfo('X');
        behaviorProperties
          .getOrCreate('shapeDimensionA')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionA')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension A')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('shapeDimensionB')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionB')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension B')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('shapeDimensionC')
          .setValue(
            behaviorContent
              .getChild('shapeDimensionC')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape Dimension C')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetX')) {
          behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetX')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset X')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetY')) {
          behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetY')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset Y')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('shapeOffsetZ')) {
          behaviorContent.addChild('shapeOffsetZ').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('shapeOffsetZ')
          .setValue(
            behaviorContent
              .getChild('shapeOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Shape offset Z')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetX')) {
          behaviorContent.addChild('massCenterOffsetX').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetX')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset X')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetY')) {
          behaviorContent.addChild('massCenterOffsetY').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetY')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset Y')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        if (!behaviorContent.hasChild('massCenterOffsetZ')) {
          behaviorContent.addChild('massCenterOffsetZ').setDoubleValue(0);
        }
        behaviorProperties
          .getOrCreate('massCenterOffsetZ')
          .setValue(
            behaviorContent
              .getChild('massCenterOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setLabel('Center of mass offset Z')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setAdvanced(true)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('density')
          .setValue(
            behaviorContent.getChild('density').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setLabel(_('Density'))
          .setDescription(
            _(
              'Define the weight of the object, according to its size. The bigger the density, the heavier the object.'
            )
          );
        behaviorProperties
          .getOrCreate('friction')
          .setValue(
            behaviorContent.getChild('friction').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setLabel(_('Friction'))
          .setDescription(
            _(
              'The friction applied when touching other objects. The higher the value, the more friction.'
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('restitution')
          .setValue(
            behaviorContent
              .getChild('restitution')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Restitution'))
          .setDescription(
            _(
              'The "bounciness" of the object. The higher the value, the more other objects will bounce against it.'
            )
          )
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('linearDamping')
          .setValue(
            behaviorContent
              .getChild('linearDamping')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Linear Damping'))
          .setGroup(_('Movement'));

        behaviorProperties
          .getOrCreate('angularDamping')
          .setValue(
            behaviorContent
              .getChild('angularDamping')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel(_('Angular Damping'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Movement'));
        behaviorProperties
          .getOrCreate('gravityScale')
          .setValue(
            behaviorContent
              .getChild('gravityScale')
              .getDoubleValue()
              .toString(10)
          )
          .setType('Number')
          .setLabel('Gravity Scale')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Gravity'))
          .setAdvanced(true);
        behaviorProperties
          .getOrCreate('layers')
          .setValue(
            behaviorContent.getChild('layers').getIntValue().toString(10)
          )
          .setType('Number')
          .setLabel('Layers')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.
        behaviorProperties
          .getOrCreate('masks')
          .setValue(
            behaviorContent.getChild('masks').getIntValue().toString(10)
          )
          .setType('Number')
          .setLabel('Masks')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setHidden(true); // Hidden as required to be changed in the full editor.

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('object3D').setStringValue('');
        behaviorContent.addChild('bodyType').setStringValue('Dynamic');
        behaviorContent.addChild('bullet').setBoolValue(false);
        behaviorContent.addChild('fixedRotation').setBoolValue(false);
        behaviorContent.addChild('shape').setStringValue('Box');
        behaviorContent.addChild('shapeOrientation').setStringValue('Z');
        behaviorContent.addChild('shapeDimensionA').setDoubleValue(0);
        behaviorContent.addChild('shapeDimensionB').setDoubleValue(0);
        behaviorContent.addChild('shapeDimensionC').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
        behaviorContent.addChild('shapeOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetX').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetY').setDoubleValue(0);
        behaviorContent.addChild('massCenterOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('density').setDoubleValue(1.0);
        behaviorContent.addChild('friction').setDoubleValue(0.3);
        behaviorContent.addChild('restitution').setDoubleValue(0.1);
        behaviorContent.addChild('linearDamping').setDoubleValue(0.1);
        behaviorContent.addChild('angularDamping').setDoubleValue(0.1);
        behaviorContent.addChild('gravityScale').setDoubleValue(1);
        behaviorContent.addChild('layers').setIntValue((1 << 4) | (1 << 0));
        behaviorContent.addChild('masks').setIntValue((1 << 4) | (1 << 0));
      };

      const sharedData = new gd.BehaviorSharedDataJsImplementation();
      sharedData.updateProperty = function (
        sharedContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'gravityX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityX').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityY').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravityZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent.getChild('gravityZ').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'worldScale') {
          const newValueAsNumber = parseInt(newValue, 10);
          if (newValueAsNumber !== newValueAsNumber) return false;
          if (!sharedContent.hasChild('worldScale')) {
            sharedContent.addChild('worldScale');
          }
          sharedContent.getChild('worldScale').setDoubleValue(newValueAsNumber);
          return true;
        }
        return false;
      };
      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();

        sharedProperties
          .getOrCreate('gravityX')
          .setValue(
            sharedContent.getChild('gravityX').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());
        sharedProperties
          .getOrCreate('gravityY')
          .setValue(
            sharedContent.getChild('gravityY').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());
        sharedProperties
          .getOrCreate('gravityZ')
          .setValue(
            sharedContent.getChild('gravityZ').getDoubleValue().toString(10)
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getNewton());

        sharedProperties
          .getOrCreate('worldScale')
          .setValue(
            sharedContent.getChild('worldScale').getDoubleValue().toString(10)
          )
          .setType('Number');

        return sharedProperties;
      };
      sharedData.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('gravityX').setDoubleValue(0);
        behaviorContent.addChild('gravityY').setDoubleValue(0);
        behaviorContent.addChild('gravityZ').setDoubleValue(-9.8);
        behaviorContent.addChild('worldScale').setDoubleValue(100);
      };

      const aut = extension
        .addBehavior(
          'Physics3DBehavior',
          _('3D physics engine'),
          'Physics3D',
          _(
            'Simulate realistic 3D physics for this object including gravity, forces, collisions, etc.'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg',
          'Physics3DBehavior',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          sharedData
        )
        .addIncludeFile(
          'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
        )
        .addRequiredFile('Extensions/Physics3DBehavior/jolt-physics.wasm.js')
        .addRequiredFile('Extensions/Physics3DBehavior/jolt-physics.wasm.wasm')
        .setOpenFullEditorLabel(_('Edit shape and advanced settings'));

      // Global
      aut
        .addExpression(
          'WorldScale',
          _('World scale'),
          _('Return the world scale.'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getWorldScale');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityX',
          _('World gravity on X axis'),
          _('the world gravity on X axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on X axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityX')
        .setGetter('getGravityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityY',
          _('World gravity on Y axis'),
          _('the world gravity on Y axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on Y axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityY')
        .setGetter('getGravityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityZ',
          _('World gravity on Z axis'),
          _('the world gravity on Z axis') +
            ' ' +
            _(
              'While an object is needed, this will apply to all objects using the behavior.'
            ),
          _('the world gravity on Z axis'),
          _('Global'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in Newton)')
          )
        )
        .setFunctionName('setGravityZ')
        .setGetter('getGravityZ');

      aut
        .addScopedCondition(
          'IsDynamic',
          _('Is dynamic'),
          _('Check if an object is dynamic.'),
          _('_PARAM0_ is dynamic'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isDynamic');

      aut
        .addScopedCondition(
          'IsStatic',
          _('Is static'),
          _('Check if an object is static.'),
          _('_PARAM0_ is static'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isStatic');

      aut
        .addScopedCondition(
          'IsKinematic',
          _('Is kinematic'),
          _('Check if an object is kinematic.'),
          _('_PARAM0_ is kinematic'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isKinematic');

      aut
        .addScopedCondition(
          'IsBullet',
          _('Is treated as a bullet'),
          _('Check if the object is being treated as a bullet.'),
          _('_PARAM0_ is treated as a bullet'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('isBullet');

      aut
        .addScopedAction(
          'SetBullet',
          _('Treat as bullet'),
          _(
            'Treat the object as a bullet. Better collision handling on high speeds at cost of some performance.'
          ),
          _('Treat _PARAM0_ as bullet: _PARAM2_'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('yesorno', _('Treat as bullet?'), '', false)
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setBullet');

      aut
        .addScopedCondition(
          'HasFixedRotation',
          _('Has fixed rotation'),
          _('Check if an object has fixed rotation.'),
          _('_PARAM0_ has fixed rotation'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('hasFixedRotation');

      aut
        .addScopedAction(
          'SetFixedRotation',
          _('Fixed rotation'),
          _(
            "Enable or disable an object fixed rotation. If enabled the object won't be able to rotate."
          ),
          _('Set _PARAM0_ fixed rotation: _PARAM2_'),
          _('Dynamics'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('yesorno', _('Fixed rotation?'), '', false)
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setFixedRotation');

      // Body settings
      aut
        .addScopedAction(
          'ShapeScale',
          _('Shape scale'),
          _(
            'Modify an object shape scale. It affects custom shape dimensions, if custom dimensions are not set the body will be scaled automatically to the object size.'
          ),
          _('the shape scale'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('setShapeScale')
        .setGetter('getShapeScale');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Density',
          _('Density'),
          _(
            "the object density. The body's density and volume determine its mass."
          ),
          _('the density'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setDensity')
        .setGetter('getDensity');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Friction',
          _('Friction'),
          _(
            "the object friction. How much energy is lost from the movement of one object over another. The combined friction from two bodies is calculated as 'sqrt(bodyA.friction * bodyB.friction)'."
          ),
          _('the friction'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setFriction')
        .setGetter('getFriction');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Restitution',
          _('Restitution'),
          _(
            "the object restitution. Energy conservation on collision. The combined restitution from two bodies is calculated as 'max(bodyA.restitution, bodyB.restitution)'."
          ),
          _('the restitution'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setRestitution')
        .setGetter('getRestitution');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearDamping',
          _('Linear damping'),
          _(
            'the object linear damping. How much movement speed is lost across the time.'
          ),
          _('the linear damping'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setLinearDamping')
        .setGetter('getLinearDamping');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularDamping',
          _('Angular damping'),
          _(
            'the object angular damping. How much angular speed is lost across the time.'
          ),
          _('the angular damping'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setAngularDamping')
        .setGetter('getAngularDamping');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'GravityScale',
          _('Gravity scale'),
          _(
            'the object gravity scale. The gravity applied to an object is the world gravity multiplied by the object gravity scale.'
          ),
          _('the gravity scale'),
          _('Body settings'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setFunctionName('setGravityScale')
        .setGetter('getGravityScale');

      // Filtering
      aut
        .addScopedCondition(
          'LayerEnabled',
          _('Layer enabled'),
          _('Check if an object has a specific layer enabled.'),
          _('_PARAM0_ has layer _PARAM2_ enabled'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Layer (1 - 8)'))
        .getCodeExtraInformation()
        .setFunctionName('layerEnabled');

      aut
        .addScopedAction(
          'EnableLayer',
          _('Enable layer'),
          _(
            'Enable or disable a layer for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
          ),
          _('Enable layer _PARAM2_ for _PARAM0_: _PARAM3_'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Layer (1 - 8)'))
        .addParameter('yesorno', _('Enable?'), '', false)
        .setDefaultValue('true')
        .getCodeExtraInformation()
        .setFunctionName('enableLayer');

      aut
        .addScopedCondition(
          'MaskEnabled',
          _('Mask enabled'),
          _('Check if an object has a specific mask enabled.'),
          _('_PARAM0_ has mask _PARAM2_ enabled'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Mask (1 - 8)'))
        .getCodeExtraInformation()
        .setFunctionName('maskEnabled');

      aut
        .addScopedAction(
          'EnableMask',
          _('Enable mask'),
          _(
            'Enable or disable a mask for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
          ),
          _('Enable mask _PARAM2_ for _PARAM0_: _PARAM3_'),
          _('Filtering'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Mask (1 - 8)'))
        .addParameter('yesorno', _('Enable?'), '', false)
        .setDefaultValue('true')
        .getCodeExtraInformation()
        .setFunctionName('enableMask');

      // Velocity
      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityX',
          _('Linear velocity X'),
          _('the object linear velocity on X'),
          _('the linear velocity on X'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityX')
        .setGetter('getLinearVelocityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityY',
          _('Linear velocity Y'),
          _('the object linear velocity on Y'),
          _('the linear velocity on Y'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityY')
        .setGetter('getLinearVelocityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'LinearVelocityZ',
          _('Linear velocity Z'),
          _('the object linear velocity on Z'),
          _('the linear velocity on Z'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setLinearVelocityZ')
        .setGetter('getLinearVelocityZ');

      aut
        .addExpressionAndCondition(
          'number',
          'LinearVelocityLength',
          _('Linear velocity'),
          _('the object linear velocity length'),
          _('the linear velocity length'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .setFunctionName('getLinearVelocityLength');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityX',
          _('Angular velocity X'),
          _('the object angular velocity around X'),
          _('the angular velocity around X'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityX')
        .setGetter('getAngularVelocityX');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityY',
          _('Angular velocity Y'),
          _('the object angular velocity around Y'),
          _('the angular velocity around Y'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityY')
        .setGetter('getAngularVelocityY');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularVelocityZ',
          _('Angular velocity Z'),
          _('the object angular velocity around Z'),
          _('the angular velocity around Z'),
          _('Velocity'),
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularVelocityZ')
        .setGetter('getAngularVelocityZ');

      // Forces and impulses
      aut
        .addScopedAction(
          'ApplyForce',
          _('Apply force (at a point)'),
          _(
            'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N)'))
        .addParameter('expression', _('Y component (N)'))
        .addParameter('expression', _('Z component (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .addParameter('expression', _('Application point on X axis'))
        .addParameter('expression', _('Application point on Y axis'))
        .addParameter('expression', _('Application point on Z axis'))
        .setParameterLongDescription(
          _(
            'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyForce');

      aut
        .addScopedAction(
          'ApplyForceAtCenter',
          _('Apply force (at center)'),
          _(
            'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N)'))
        .addParameter('expression', _('Y component (N)'))
        .addParameter('expression', _('Z component (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyForceAtCenter');

      aut
        .addScopedAction(
          'ApplyForceTowardPosition',
          _('Apply force toward position'),
          _(
            'Apply a force to the object over time to move it toward a position. It "accelerates" an object and must be used every frame during a time period.'
          ),
          _(
            'Apply to _PARAM0_ a force of length _PARAM2_ towards _PARAM3_ ; _PARAM4_ ; _PARAM5_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Length (N)'))
        .setParameterLongDescription(
          _('A force is like an acceleration but depends on the mass.')
        )
        .addParameter('expression', _('X position'))
        .addParameter('expression', _('Y position'))
        .addParameter('expression', _('Z position'))
        .getCodeExtraInformation()
        .setFunctionName('applyForceTowardPosition');

      aut
        .addScopedAction(
          'ApplyImpulse',
          _('Apply impulse (at a point)'),
          _(
            'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Y component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Z component (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .addParameter('expression', _('Application point on X axis'))
        .addParameter('expression', _('Application point on Y axis'))
        .addParameter('expression', _('Application point on Z axis'))
        .setParameterLongDescription(
          _(
            'Use `MassCenterX`, `MassCenterY` and `MassCenterZ` expressions to avoid any rotation.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyImpulse');

      aut
        .addScopedAction(
          'ApplyImpulseAtCenter',
          _('Apply impulse (at center)'),
          _(
            'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('X component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Y component (N·s or kg·m·s⁻¹)'))
        .addParameter('expression', _('Z component (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyImpulseAtCenter');

      aut
        .addScopedAction(
          'ApplyImpulseTowardPosition',
          _('Apply impulse toward position'),
          _(
            'Apply an impulse to the object to move it toward a position. It instantly changes the speed, to give an initial speed for instance.'
          ),
          _(
            'Apply to _PARAM0_ an impulse of length _PARAM2_ towards _PARAM3_ ; _PARAM4_ ; _PARAM5_'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Length (N·s or kg·m·s⁻¹)'))
        .setParameterLongDescription(
          _('An impulse is like a speed addition but depends on the mass.')
        )
        .addParameter('expression', _('X position'))
        .addParameter('expression', _('Y position'))
        .addParameter('expression', _('Z position'))
        .getCodeExtraInformation()
        .setFunctionName('applyImpulseTowardPosition');

      aut
        .addScopedAction(
          'ApplyTorque',
          _('Apply torque (rotational force)'),
          _(
            'Apply a torque (also called "rotational force") to the object. It "accelerates" an object rotation and must be used every frame during a time period.'
          ),
          _('Apply a torque of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ an'),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Torque around X (N·m)'))
        .addParameter('expression', _('Torque around Y (N·m)'))
        .addParameter('expression', _('Torque around Z (N·m)'))
        .setParameterLongDescription(
          _('A torque is like a rotation acceleration but depends on the mass.')
        )
        .getCodeExtraInformation()
        .setFunctionName('applyTorque');

      aut
        .addScopedAction(
          'ApplyAngularImpulse',
          _('Apply angular impulse (rotational impulse)'),
          _(
            'Apply an angular impulse (also called a "rotational impulse") to the object. It instantly changes the rotation speed, to give an initial speed for instance.'
          ),
          _(
            'Apply angular impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ an'
          ),
          _('Forces & impulses'),
          'JsPlatform/Extensions/physics3d.svg',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .addParameter('expression', _('Angular impulse around X (N·m·s)'))
        .addParameter('expression', _('Angular impulse around Y (N·m·s)'))
        .addParameter('expression', _('Angular impulse around Z (N·m·s)'))
        .setParameterLongDescription(
          _(
            'An impulse is like a rotation speed addition but depends on the mass.'
          )
        )
        .getCodeExtraInformation()
        .setFunctionName('applyAngularImpulse');

      aut
        .addExpression(
          'Mass',
          _('Mass'),
          _('Return the mass of the object (in kilograms)'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMass');

      aut
        .addExpression(
          'InertiaAroundX',
          _('Inertia around X'),
          _(
            'Return the inertia around X axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundX');

      aut
        .addExpression(
          'InertiaAroundY',
          _('Inertia around Y'),
          _(
            'Return the inertia around Y axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundY');

      aut
        .addExpression(
          'InertiaAroundZ',
          _('Inertia around Z'),
          _(
            'Return the inertia around Z axis of the object (in kilograms · meters²) when for its default rotation is (0°; 0°; 0°)'
          ),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getInertiaAroundZ');

      aut
        .addExpression(
          'MassCenterX',
          _('Mass center X'),
          _('Mass center X'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMassCenterX');

      aut
        .addExpression(
          'MassCenterY',
          _('Mass center Y'),
          _('Mass center Y'),
          '',
          'JsPlatform/Extensions/physics3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
        .getCodeExtraInformation()
        .setFunctionName('getMassCenterY');
    }
    // Collision
    extension
      .addCondition(
        'Collision',
        _('Collision'),
        _('Check if two objects collide.'),
        _('_PARAM0_ is colliding with _PARAM2_'),
        '',
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.areObjectsColliding');

    extension
      .addCondition(
        'CollisionStarted',
        _('Collision started'),
        _('Check if two objects just started colliding during this frame.'),
        _('_PARAM0_ started colliding with _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.haveObjectsStartedColliding');

    extension
      .addCondition(
        'CollisionStopped',
        _('Collision stopped'),
        _('Check if two objects just stopped colliding at this frame.'),
        _('_PARAM0_ stopped colliding with _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics3d.svg',
        'JsPlatform/Extensions/physics3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.physics3d.haveObjectsStoppedColliding');

    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'physics3D') {
          behaviorContent.getChild('physics3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'jumpHeight') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('jumpHeight')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'jumpSustainTime') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('jumpSustainTime')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gravity') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent.getChild('gravity').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'fallingSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('fallingSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardAcceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardAcceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardDeceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardDeceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'forwardSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('forwardSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysAcceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysAcceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysDeceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysDeceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'sidewaysSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('sidewaysSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'slopeMaxAngle') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('slopeMaxAngle')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'stairHeightMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('stairHeightMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'shouldBindObjectAndForwardAngle') {
          behaviorContent
            .getChild('shouldBindObjectAndForwardAngle')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'canBePushed') {
          behaviorContent
            .getChild('canBePushed')
            .setBoolValue(newValue === '1');
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('physics3D')
          .setValue(behaviorContent.getChild('physics3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D physics')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Physics3D::Physics3DBehavior');

        behaviorProperties
          .getOrCreate('jumpHeight')
          .setLabel(_('Jump height'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent.getChild('jumpHeight').getDoubleValue().toString(10)
          );

        behaviorProperties
          .getOrCreate('jumpSustainTime')
          .setLabel(_('Jump sustain time'))
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getSecond())
          .setValue(
            behaviorContent
              .getChild('jumpSustainTime')
              .getDoubleValue()
              .toString(10)
          )
          .setDescription(
            _(
              'Maximum time (in seconds) during which the jump strength is sustained if the jump key is held - allowing variable height jumps.'
            )
          );

        behaviorProperties
          .getOrCreate('gravity')
          .setLabel(_('Gravity'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent.getChild('gravity').getDoubleValue().toString(10)
          );

        behaviorProperties
          .getOrCreate('fallingSpeedMax')
          .setLabel(_('Max. falling speed'))
          .setGroup(_('Jump'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('fallingSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardAcceleration')
          .setLabel(_('Forward acceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('forwardAcceleration')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardDeceleration')
          .setLabel(_('Forward deceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('forwardDeceleration')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('forwardSpeedMax')
          .setLabel(_('Max. forward speed'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('forwardSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('sidewaysAcceleration')
          .setLabel(_('Sideways acceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('sidewaysAcceleration')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('sidewaysDeceleration')
          .setLabel(_('Sideways deceleration'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration())
          .setValue(
            behaviorContent
              .getChild('sidewaysDeceleration')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('sidewaysSpeedMax')
          .setLabel(_('Max. sideways speed'))
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed())
          .setValue(
            behaviorContent
              .getChild('sidewaysSpeedMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true);

        behaviorProperties
          .getOrCreate('slopeMaxAngle')
          .setLabel('Slope max. angle')
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('slopeMaxAngle')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        if (!behaviorContent.hasChild('stairHeightMax')) {
          behaviorContent.addChild('stairHeightMax').setDoubleValue(20);
        }
        behaviorProperties
          .getOrCreate('stairHeightMax')
          .setLabel('Max. stair height')
          .setGroup(_('Walk'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('stairHeightMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('shouldBindObjectAndForwardAngle')
          .setLabel('Keep object angle and forward direction the same')
          .setGroup(_('Walk'))
          .setType('Boolean')
          .setValue(
            behaviorContent
              .getChild('shouldBindObjectAndForwardAngle')
              .getBoolValue()
              ? 'true'
              : 'false'
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        if (!behaviorContent.hasChild('canBePushed')) {
          behaviorContent.addChild('canBePushed').setBoolValue(true);
        }
        behaviorProperties
          .getOrCreate('canBePushed')
          .setLabel('Can be pushed by other characters')
          .setGroup(_('Walk'))
          .setType('Boolean')
          .setValue(
            behaviorContent.getChild('canBePushed').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('physics3D').setStringValue('');
        behaviorContent.addChild('jumpHeight').setDoubleValue(200);
        behaviorContent.addChild('jumpSustainTime').setDoubleValue(0.2);
        behaviorContent.addChild('gravity').setDoubleValue(1000);
        behaviorContent.addChild('fallingSpeedMax').setDoubleValue(700);
        behaviorContent.addChild('forwardAcceleration').setDoubleValue(1200);
        behaviorContent.addChild('forwardDeceleration').setDoubleValue(1200);
        behaviorContent.addChild('forwardSpeedMax').setDoubleValue(600);
        behaviorContent.addChild('sidewaysAcceleration').setDoubleValue(800);
        behaviorContent.addChild('sidewaysDeceleration').setDoubleValue(800);
        behaviorContent.addChild('sidewaysSpeedMax').setDoubleValue(400);
        behaviorContent.addChild('slopeMaxAngle').setDoubleValue(50);
        behaviorContent.addChild('stairHeightMax').setDoubleValue(20);
        behaviorContent
          .addChild('shouldBindObjectAndForwardAngle')
          .setBoolValue(true);
        behaviorContent.addChild('canBePushed').setBoolValue(true);
      };

      const aut = extension
        .addBehavior(
          'PhysicsCharacter3D',
          _('3D physics character'),
          'PhysicsCharacter3D',
          _('Jump and run on platforms.'),
          '',
          'JsPlatform/Extensions/physics_character3d.svg',
          'PhysicsCharacter3D',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          new gd.BehaviorsSharedData()
        )
        .addIncludeFile(
          'Extensions/Physics3DBehavior/PhysicsCharacter3DRuntimeBehavior.js'
        );

      aut
        .addScopedAction(
          'SimulateForwardKey',
          _('Simulate move forward key press'),
          _('Simulate a press of the move forward key.'),
          _('Simulate pressing Forward key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateForwardKey');

      aut
        .addScopedAction(
          'SimulateBackwardKey',
          _('Simulate move backward key press'),
          _('Simulate a press of the move backward key.'),
          _('Simulate pressing Backward key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateBackwardKey');

      aut
        .addScopedAction(
          'SimulateRightKey',
          _('Simulate move right key press'),
          _('Simulate a press of the move right key.'),
          _('Simulate pressing Right key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateRightKey');

      aut
        .addScopedAction(
          'SimulateLeftKey',
          _('Simulate move left key press'),
          _('Simulate a press of the move left key.'),
          _('Simulate pressing Left key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateLeftKey');

      aut
        .addScopedAction(
          'SimulateJumpKey',
          _('Simulate jump key press'),
          _('Simulate a press of the jump key.'),
          _('Simulate pressing Jump key for _PARAM0_'),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('simulateJumpKey');

      aut
        .addScopedAction(
          'SimulateStick',
          _('Simulate stick control'),
          _('Simulate a stick control.'),
          _(
            'Simulate a stick control for _PARAM0_ with a _PARAM2_ angle and a _PARAM3_ force'
          ),
          _('Character controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter('expression', _('Stick angle (in degrees)'))
        .addParameter('expression', _('Stick force (between 0 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateStick');

      aut
        .addScopedAction(
          'SetCanJump',
          _('Allow jumping again'),
          _(
            "When this action is executed, the object is able to jump again, even if it is in the air: this can be useful to allow a double jump for example. This is not a permanent effect: you must call again this action every time you want to allow the object to jump (apart if it's on the floor)."
          ),
          _('Allow _PARAM0_ to jump again'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('setCanJump');

      aut
        .addScopedAction(
          'SetCanNotAirJump',
          _('Forbid jumping again in the air'),
          _(
            'This revokes the effect of "Allow jumping again". The object is made unable to jump while in mid air. This has no effect if the object is not in the air.'
          ),
          _('Forbid _PARAM0_ to air jump'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('setCanNotAirJump');

      aut
        .addScopedAction(
          'AbortJump',
          _('Abort jump'),
          _(
            "Abort the current jump and stop the object vertically. This action doesn't have any effect when the character is not jumping."
          ),
          _('Abort the current jump of _PARAM0_'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('abortJump');

      aut
        .addScopedCondition(
          'CanJump',
          _('Can jump'),
          _('Check if the object can jump.'),
          _('_PARAM0_ can jump'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('canJump');

      aut
        .addScopedCondition(
          'IsMovingEvenALittle',
          _('Is moving'),
          _(
            'Check if the object is moving (whether it is on the floor or in the air).'
          ),
          _('_PARAM0_ is moving'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isMovingEvenALittle');

      aut
        .addScopedCondition(
          'IsOnFloor',
          _('Is on floor'),
          _('Check if the object is on a platform.'),
          _('_PARAM0_ is on floor'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isOnFloor');

      aut
        .addScopedCondition(
          'IsJumping',
          _('Is jumping'),
          _('Check if the object is jumping.'),
          _('_PARAM0_ is jumping'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .markAsSimple()
        .setFunctionName('isJumping');

      aut
        .addScopedCondition(
          'IsFalling',
          _('Is falling'),
          _(
            'Check if the object is falling.\nNote that the object can be flagged as jumping and falling at the same time: at the end of a jump, the fall speed becomes higher than the jump speed.'
          ),
          _('_PARAM0_ is falling'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('isFalling');

      aut
        .addScopedCondition(
          'ShouldBindObjectAndForwardAngle',
          _('Should bind object and forward angle'),
          _(
            'Check if the object angle and forward angle should be kept the same.'
          ),
          _('Keep _PARAM0_ angle and forward angle the same'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .getCodeExtraInformation()
        .setFunctionName('shouldBindObjectAndForwardAngle');

      aut
        .addScopedAction(
          'SetShouldBindObjectAndForwardAngle',
          _('Should bind object and forward angle'),
          _(
            'Enable or disable keeping the object angle and forward angle the same.'
          ),
          _('Should bind _PARAM0_ angle and forward angle: _PARAM2_'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter(
          'yesorno',
          _('Keep object angle and forward direction the same'),
          '',
          false
        )
        .setDefaultValue('false')
        .getCodeExtraInformation()
        .setFunctionName('setShouldBindObjectAndForwardAngle');

      aut
        .addScopedCondition(
          'IsForwardAngleAround',
          _('Forward angle'),
          _('Compare the angle used by the character to go forward.'),
          _('Forward angle of _PARAM0_ is _PARAM2_ ± _PARAM3_°'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .addParameter('expression', _('Angle (in degrees)'))
        .addParameter('expression', _('Tolerance (in degrees)'))
        .setFunctionName('isForwardAngleAround');

      aut
        .addScopedAction(
          'SetForwardAngle',
          _('Forward angle'),
          _('Change the angle used by the character to go forward.'),
          _('the forward angle'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setFunctionName('setForwardAngle')
        .setGetter('getForwardAngle');

      aut
        .addExpression(
          'ForwardAngle',
          _('Forward angle of the character'),
          _('Return the angle used by the character to go forward.'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .setFunctionName('getForwardAngle');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentForwardSpeed',
          _('Current forward speed'),
          _(
            'the current forward speed of the object. The object moves backward with negative values and forward with positive ones'
          ),
          _('the current forward speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setCurrentForwardSpeed')
        .setGetter('getCurrentForwardSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardAcceleration',
          _('Forward acceleration'),
          _('the forward acceleration of an object'),
          _('the forward acceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Acceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setForwardAcceleration')
        .setGetter('getForwardAcceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardDeceleration',
          _('Forward deceleration'),
          _('the forward deceleration of an object'),
          _('the forward deceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Deceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setForwardDeceleration')
        .setGetter('getForwardDeceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'ForwardSpeedMax',
          _('Forward max speed'),
          _('the forward max speed of the object'),
          _('the forward max speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setForwardSpeedMax')
        .setGetter('getForwardSpeedMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentSidewaysSpeed',
          _('Current sideways speed'),
          _(
            'the current sideways speed of the object. The object moves to the left with negative values and to the right with positive ones'
          ),
          _('the current sideways speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setCurrentSidewaysSpeed')
        .setGetter('getCurrentSidewaysSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysAcceleration',
          _('Sideways acceleration'),
          _('the sideways acceleration of an object'),
          _('the sideways acceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Acceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setSidewaysAcceleration')
        .setGetter('getSidewaysAcceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysDeceleration',
          _('Sideways deceleration'),
          _('the sideways deceleration of an object'),
          _('the sideways deceleration'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Deceleration (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setSidewaysDeceleration')
        .setGetter('getSidewaysDeceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'SidewaysSpeedMax',
          _('Sideways max speed'),
          _('the sideways max speed of the object'),
          _('the sideways max speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setSidewaysSpeedMax')
        .setGetter('getSidewaysSpeedMax');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentFallSpeed',
          _('Current falling speed'),
          _(
            'Compare the current falling speed of the object. Its value is always positive.'
          ),
          _('the current falling speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setCurrentFallSpeed')
        .setGetter('getCurrentFallSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'CurrentJumpSpeed',
          _('Current jump speed'),
          _(
            'Compare the current jump speed of the object. Its value is always positive.'
          ),
          _('the current jump speed'),
          _('Character state'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed to compare to (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setCurrentJumpSpeed')
        .setGetter('getCurrentJumpSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'JumpSpeed',
          _('Jump speed'),
          _('the jump speed of an object. Its value is always positive'),
          _('the jump speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setJumpSpeed')
        .setGetter('getJumpSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'JumpSustainTime',
          _('Jump sustain time'),
          _(
            'the jump sustain time of an object. This is the time during which keeping the jump button held allow the initial jump speed to be maintained.'
          ),
          _('the jump sustain time'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Duration (in seconds)')
          )
        )
        .setFunctionName('setJumpSustainTime')
        .setGetter('getJumpSustainTime');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Gravity',
          _('Gravity'),
          _('the gravity applied on an object'),
          _('the gravity'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Gravity (in pixels per second per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setGravity')
        .setGetter('getGravity');

      aut
        .addExpressionAndCondition(
          'number',
          'FallingSpeedMax',
          _('Maximum falling speed'),
          _('the maximum falling speed of an object'),
          _('the maximum falling speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max speed (in pixels per second)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('getMaxFallingSpeed');

      aut
        .addScopedAction(
          'FallingSpeedMax',
          _('Maximum falling speed'),
          _('Change the maximum falling speed of an object.'),
          _('the maximum falling speed'),
          _('Character configuration'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max speed (in pixels per second)')
          )
        )
        .addParameter(
          'yesorno',
          _('If jumping, try to preserve the current speed in the air')
        )
        .markAsAdvanced()
        .setFunctionName('setMaxFallingSpeed')
        .setGetter('getMaxFallingSpeed');
    }

    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'physics3D') {
          behaviorContent.getChild('physics3D').setStringValue(newValue);
          return true;
        }

        if (propertyName === 'steerAngleMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('steerAngleMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'beginningSteerSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('beginningSteerSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'endSteerSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('endSteerSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'mass') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent.getChild('mass').setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'engineTorqueMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('engineTorqueMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'engineSpeedMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('engineSpeedMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'reverseGearRatio1') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('reverseGearRatio1')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio1') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio1')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio2') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio2')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio2') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio2')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio3') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio3')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio4') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio4')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio5') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio5')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'gearRatio6') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('gearRatio6')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelRadius') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelRadius')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelWidth') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelWidth')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'backWheelOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('backWheelOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'frontWheelOffsetX') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('frontWheelOffsetX')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelOffsetY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelOffsetY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'wheelOffsetZ') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('wheelOffsetZ')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'hasBackWheelDrive') {
          behaviorContent
            .getChild('hasBackWheelDrive')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'hasFrontWheelDrive') {
          behaviorContent
            .getChild('hasFrontWheelDrive')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'pitchRollAngleMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getChild('pitchRollAngleMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('physics3D')
          .setValue(behaviorContent.getChild('physics3D').getStringValue())
          .setType('Behavior')
          .setLabel('3D physics')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addExtraInfo('Physics3D::Physics3DBehavior');

        behaviorProperties
          .getOrCreate('steerAngleMax')
          .setLabel('Max steer angle')
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('steerAngleMax')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('beginningSteerSpeed')
          .setLabel('Beginning steer speed')
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getAngularSpeed())
          .setValue(
            behaviorContent
              .getChild('beginningSteerSpeed')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('endSteerSpeed')
          .setLabel('End steer speed')
          .setGroup(_('Steering'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getAngularSpeed())
          .setValue(
            behaviorContent
              .getChild('endSteerSpeed')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('mass')
          .setLabel('Mass')
          .setGroup('')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('mass').getDoubleValue().toString(10)
          );

        behaviorProperties
          .getOrCreate('engineTorqueMax')
          .setLabel('Max engine torque')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('engineTorqueMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('engineSpeedMax')
          .setLabel('Max engine speed')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('engineSpeedMax')
              .getDoubleValue()
              .toString(10)
          );

        behaviorProperties
          .getOrCreate('reverseGearRatio1')
          .setLabel('Reverse gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('reverseGearRatio1')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio1')
          .setLabel('1st gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio1').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio2')
          .setLabel('2nd gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio2').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio3')
          .setLabel('3rd gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio3').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio4')
          .setLabel('4th gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio4').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio5')
          .setLabel('5th gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio5').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('gearRatio6')
          .setLabel('6th gear ratio')
          .setGroup('Speed')
          .setType('Number')
          .setValue(
            behaviorContent.getChild('gearRatio6').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelRadius')
          .setLabel('Wheel radius')
          .setGroup('Wheels')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('wheelRadius')
              .getDoubleValue()
              .toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelWidth')
          .setLabel('Wheel width')
          .setGroup('Wheels')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent.getChild('wheelWidth').getDoubleValue().toString(10)
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('backWheelOffsetX')
          .setLabel('Back wheel offset X')
          .setGroup('Wheels')
          .setType('Number')
          .setValue(
            behaviorContent
              .getChild('backWheelOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('frontWheelOffsetX')
          .setLabel('Front wheel offset X')
          .setGroup('Wheels')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('frontWheelOffsetX')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelOffsetY')
          .setLabel('Wheel offset Y')
          .setGroup('Wheels')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('wheelOffsetY')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('wheelOffsetZ')
          .setLabel('Wheel offset Z')
          .setGroup('Wheels')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            behaviorContent
              .getChild('wheelOffsetZ')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('hasBackWheelDrive')
          .setValue(
            behaviorContent.getChild('hasBackWheelDrive').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Back wheel drive'))
          .setGroup(_('Wheels'))
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('hasFrontWheelDrive')
          .setValue(
            behaviorContent.getChild('hasFrontWheelDrive').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .setType('Boolean')
          .setLabel(_('Front wheel drive'))
          .setGroup(_('Wheels'))
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        behaviorProperties
          .getOrCreate('pitchRollAngleMax')
          .setLabel('Pitch and roll max angle')
          .setGroup('')
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            behaviorContent
              .getChild('pitchRollAngleMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('physics3D').setStringValue('');
        behaviorContent.addChild('steerAngleMax').setDoubleValue(70);
        behaviorContent.addChild('beginningSteerSpeed').setDoubleValue(70);
        behaviorContent.addChild('endSteerSpeed').setDoubleValue(35);
        behaviorContent.addChild('mass').setDoubleValue(1500);
        behaviorContent.addChild('engineTorqueMax').setDoubleValue(4500);
        behaviorContent.addChild('engineSpeedMax').setDoubleValue(6000);
        behaviorContent.addChild('reverseGearRatio1').setDoubleValue(-2.9);
        behaviorContent.addChild('gearRatio1').setDoubleValue(2.66);
        behaviorContent.addChild('gearRatio2').setDoubleValue(1.78);
        behaviorContent.addChild('gearRatio3').setDoubleValue(1.3);
        behaviorContent.addChild('gearRatio4').setDoubleValue(1);
        behaviorContent.addChild('gearRatio5').setDoubleValue(0.74);
        behaviorContent.addChild('gearRatio6').setDoubleValue(0);
        behaviorContent.addChild('backWheelOffsetX').setDoubleValue(0);
        behaviorContent.addChild('frontWheelOffsetX').setDoubleValue(0);
        behaviorContent.addChild('wheelOffsetY').setDoubleValue(0);
        behaviorContent.addChild('wheelOffsetZ').setDoubleValue(0);
        behaviorContent.addChild('wheelRadius').setDoubleValue(10);
        behaviorContent.addChild('wheelWidth').setDoubleValue(5);
        behaviorContent.addChild('hasBackWheelDrive').setBoolValue(false);
        behaviorContent.addChild('hasFrontWheelDrive').setBoolValue(true);
        behaviorContent.addChild('pitchRollAngleMax').setDoubleValue(90);
      };
      const aut = extension
        .addBehavior(
          'PhysicsVehicle3D',
          _('3D physics car'),
          'PhysicsVehicle3D',
          _('Simulate a realistic car.'),
          '',
          'JsPlatform/Extensions/physics_character3d.svg',
          'PhysicsVehicle3D',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          new gd.BehaviorsSharedData()
        )
        .addIncludeFile(
          'Extensions/Physics3DBehavior/PhysicsVehicle3DRuntimeBehavior.js'
        );

      aut
        .addScopedAction(
          'SimulateForwardKey',
          _('Simulate move forward key press'),
          _('Simulate a press of the move forward key.'),
          _('Simulate pressing Forward key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .setFunctionName('simulateForwardKey');

      aut
        .addScopedAction(
          'SimulateBackwardKey',
          _('Simulate move backward key press'),
          _('Simulate a press of the move backward key.'),
          _('Simulate pressing Backward key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .setFunctionName('simulateBackwardKey');

      aut
        .addScopedAction(
          'SimulateRightKey',
          _('Simulate move right key press'),
          _('Simulate a press of the move right key.'),
          _('Simulate pressing Right key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .setFunctionName('simulateRightKey');

      aut
        .addScopedAction(
          'SimulateLeftKey',
          _('Simulate move left key press'),
          _('Simulate a press of the move left key.'),
          _('Simulate pressing Left key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .setFunctionName('simulateLeftKey');

      aut
        .addScopedAction(
          'SimulateHandBreakKey',
          _('Simulate hand break key press'),
          _('Simulate a press of the hand break key.'),
          _('Simulate pressing hand break key for _PARAM0_'),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .setFunctionName('simulateHandBreakKey');

      aut
        .addScopedAction(
          'SimulateAcceleratorStick',
          _('Simulate accelerator stick control'),
          _('Simulate an accelerator stick control.'),
          _(
            'Simulate an accelerator stick control for _PARAM0_ with a _PARAM2_ force'
          ),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .addParameter('expression', _('Stick force (between -1 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateAcceleratorStick');

      aut
        .addScopedAction(
          'SimulateSteeringStick',
          _('Simulate steering stick control'),
          _('Simulate a steering stick control.'),
          _(
            'Simulate a steering stick control for _PARAM0_ with a _PARAM2_ force'
          ),
          _('Car controls'),
          'JsPlatform/Extensions/physics_character3d.svg',
          'JsPlatform/Extensions/physics_character3d.svg'
        )
        .addParameter('object', _('Object'), '', false)
        .addParameter('behavior', _('Behavior'), 'PhysicsVehicle3D')
        .addParameter('expression', _('Stick force (between -1 and 1)'))
        .markAsAdvanced()
        .setFunctionName('simulateSteeringStick');
    }

    extension
      .addCondition(
        'IsObjectOnGivenFloor',
        _('Character is on given platform'),
        _('Check if a 3D physics character is on a given platform.'),
        _('_PARAM0_ is on platform _PARAM2_'),
        _('Collision'),
        'JsPlatform/Extensions/physics_character3d.svg',
        'JsPlatform/Extensions/physics_character3d.svg'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'PhysicsCharacter3D')
      .addParameter('objectList', _('Platforms'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .setFunctionName('gdjs.physics3d.isOnPlatform')
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    const dummyBehavior = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .get();
    const sharedData = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .getSharedDataInstance();
    return [
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        dummyBehavior,
        'density',
        '123'
      ),
      gd.ProjectHelper.sanityCheckBehaviorsSharedDataProperty(
        sharedData,
        'gravityY',
        '456'
      ),
    ];
  },
};
