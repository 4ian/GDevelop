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
      return false;
    };
    behavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      return behaviorProperties;
    };

    behavior.initializeContent = function (behaviorContent) {};

    const sharedData = new gd.BehaviorSharedDataJsImplementation();
    sharedData.updateProperty = function (
      sharedContent,
      propertyName,
      newValue
    ) {
      console.log("updateProperty: " + propertyName);
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

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    const dummyBehavior = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .get();
    const sharedData = extension
      .getBehaviorMetadata('Physics3D::Physics3DBehavior')
      .getSharedDataInstance();
    return [];
  },
};
