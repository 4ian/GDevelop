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
        _('3D Physics Engine'),
        "The physics engine simulates realistic object physics, with gravity, forces, joints, etc. It's perfect for games that need to have realistic behaving objects and a gameplay centered around it.",
        'Florian Rival',
        'MIT'
      )
      .setExtensionHelpPath('/behaviors/physics3d')
      .setCategory('Movement')
      .setTags('physics, gravity, obstacle, collision');
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D Physics Engine'))
      .setIcon('res/physics32.png');

    const behavior = new gd.BehaviorJsImplementation();
    behavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
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

      return false;
    };
    behavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

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
        .addExtraInfo('Sphere')
        .addExtraInfo('Box')
        .addExtraInfo('Capsule')
        .addExtraInfo('Cylinder');
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
      behaviorProperties
        .getOrCreate('shapeOffsetX')
        .setValue(
          behaviorContent.getChild('shapeOffsetX').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setLabel('Shape Offset X')
        .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
        .setHidden(true); // Hidden as required to be changed in the full editor.
      behaviorProperties
        .getOrCreate('shapeOffsetY')
        .setValue(
          behaviorContent.getChild('shapeOffsetY').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setLabel('Shape Offset Y')
        .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
        .setHidden(true); // Hidden as required to be changed in the full editor.
      behaviorProperties
        .getOrCreate('shapeOffsetZ')
        .setValue(
          behaviorContent.getChild('shapeOffsetZ').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setLabel('Shape Offset Z')
        .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
        .setHidden(true); // Hidden as required to be changed in the full editor.
      behaviorProperties
        .getOrCreate('polygonOrigin')
        .setValue(
          behaviorContent.hasChild('polygonOrigin')
            ? behaviorContent.getChild('polygonOrigin').getStringValue()
            : 'Center'
        )
        .setType('Choice')
        .setLabel('Polygon Origin')
        .addExtraInfo('Center')
        .addExtraInfo('Origin')
        .addExtraInfo('TopLeft')
        .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
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
        );
      behaviorProperties
        .getOrCreate('restitution')
        .setValue(
          behaviorContent.getChild('restitution').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel(_('Restitution'))
        .setDescription(
          _(
            'The "bounciness" of the object. The higher the value, the more other objects will bounce against it.'
          )
        );
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
          behaviorContent.getChild('gravityScale').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel('Gravity Scale')
        .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
        .setGroup(_('Gravity'))
        .setAdvanced(true);

      return behaviorProperties;
    };

    behavior.initializeContent = function (behaviorContent) {
      behaviorContent.addChild('bodyType').setStringValue('Dynamic');
      behaviorContent.addChild('bullet').setBoolValue(false);
      behaviorContent.addChild('fixedRotation').setBoolValue(false);
      behaviorContent.addChild('shape').setStringValue('Sphere');
      behaviorContent.addChild('shapeDimensionA').setDoubleValue(0);
      behaviorContent.addChild('shapeDimensionB').setDoubleValue(0);
      behaviorContent.addChild('shapeDimensionC').setDoubleValue(0);
      behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
      behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
      behaviorContent.addChild('shapeOffsetZ').setDoubleValue(0);
      behaviorContent.addChild('density').setDoubleValue(1.0);
      behaviorContent.addChild('friction').setDoubleValue(0.3);
      behaviorContent.addChild('restitution').setDoubleValue(0.1);
      behaviorContent.addChild('linearDamping').setDoubleValue(0.1);
      behaviorContent.addChild('angularDamping').setDoubleValue(0.1);
      behaviorContent.addChild('gravityScale').setDoubleValue(1);
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
      // extension
      .addBehavior(
        'Physics3DBehavior',
        _('3D Physics Engine'),
        'Physics3D',
        _(
          'Simulate realistic object physics with gravity, forces, joints, etc.'
        ),
        '',
        'res/physics32.png',
        'Physics3DBehavior',
        //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
        behavior,
        sharedData
      )
      .addIncludeFile(
        'Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js'
      )
      //.addIncludeFile('Extensions/Physics3DBehavior/jolt-physics.multithread.wasm-compat.js')
      .setOpenFullEditorLabel(_('Edit shape and advanced settings'));

    // Forces and impulses
    aut
      .addAction(
        'ApplyForce',
        _('Apply force'),
        _(
          'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
        ),
        _('Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
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
      .addAction(
        'ApplyForceAtCenter',
        _('Apply force (at center)'),
        _(
          'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
        ),
        _('Apply a force of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
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
        'ApplyImpulse',
        _('Apply impulse'),
        _(
          'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
        ),
        _('Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ to _PARAM0_ at _PARAM5_ ; _PARAM6_ ; _PARAM7_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
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
          _('Apply an impulse of _PARAM2_ ; _PARAM3_ ; _PARAM4_ at the center of _PARAM0_'),
          _('Forces & impulses'),
          'res/physics32.png',
          'res/physics32.png'
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

    // Collision
    extension
      .addCondition(
        'Collision',
        _('Collision'),
        _('Check if two objects collide.'),
        _('_PARAM0_ is colliding with _PARAM2_'),
        '',
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js')
      .setFunctionName('gdjs.physics3d.objectsCollide');

    extension
      .addCondition(
        'CollisionStarted',
        _('Collision started'),
        _('Check if two objects just started colliding during this frame.'),
        _('_PARAM0_ started colliding with _PARAM2_'),
        _('Collision'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js')
      .setFunctionName('gdjs.physics3d.haveObjectsStartedColliding');

    extension
      .addCondition(
        'CollisionStopped',
        _('Collision stopped'),
        _('Check if two objects just stopped colliding at this frame.'),
        _('_PARAM0_ stopped colliding with _PARAM2_'),
        _('Collision'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics3DBehavior')
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DTools.js')
      .addIncludeFile('Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js')
      .setFunctionName('gdjs.physics3d.haveObjectsStoppedColliding');

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
