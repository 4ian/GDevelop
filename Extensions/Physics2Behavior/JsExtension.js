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
        'Physics2',
        _('Physics Engine 2.0'),
        "The physics engine simulates realistic object physics, with gravity, forces, joints, etc. It's perfect for games that need to have realistic behaving objects and a gameplay centered around it.",
        'Florian Rival, Franco Maciel',
        'MIT'
      )
      .setExtensionHelpPath('/behaviors/physics2')
      .setCategory('Movement')
      .setTags('physics, gravity, obstacle, collision');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Physics Engine 2.0'))
      .setIcon('res/physics32.png');

    var physics2Behavior = new gd.BehaviorJsImplementation();
    physics2Behavior.updateProperty = function (
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

      if (propertyName === 'canSleep') {
        behaviorContent.getChild('canSleep').setBoolValue(newValue === '1');
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

      if (propertyName === 'polygonOrigin') {
        behaviorContent.addChild('polygonOrigin').setStringValue(newValue);
        return true;
      }

      if (propertyName === 'vertices') {
        behaviorContent.addChild('vertices');
        behaviorContent.setChild('vertices', gd.Serializer.fromJSON(newValue));
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
        const newValueAsNumber = parseFloat(newValue);
        if (newValueAsNumber !== newValueAsNumber) return false;
        behaviorContent
          .getChild('linearDamping')
          .setDoubleValue(newValueAsNumber);
        return true;
      }

      if (propertyName === 'angularDamping') {
        const newValueAsNumber = parseFloat(newValue);
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
        behaviorContent.getChild('layers').setIntValue(parseInt(newValue, 10));
        return true;
      }

      if (propertyName === 'masks') {
        behaviorContent.getChild('masks').setIntValue(parseInt(newValue, 10));
        return true;
      }

      return false;
    };
    physics2Behavior.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('bodyType')
        .setValue(behaviorContent.getChild('bodyType').getStringValue())
        .setType('Choice')
        .setLabel('Type')
        .addExtraInfo('Static')
        .addExtraInfo('Dynamic')
        .addExtraInfo('Kinematic');
      behaviorProperties
        .getOrCreate('bullet')
        .setValue(
          behaviorContent.getChild('bullet').getBoolValue() ? 'true' : 'false'
        )
        .setType('Boolean')
        .setLabel('Bullet');
      behaviorProperties
        .getOrCreate('fixedRotation')
        .setValue(
          behaviorContent.getChild('fixedRotation').getBoolValue()
            ? 'true'
            : 'false'
        )
        .setType('Boolean')
        .setLabel('Fixed Rotation');
      behaviorProperties
        .getOrCreate('canSleep')
        .setValue(
          behaviorContent.getChild('canSleep').getBoolValue() ? 'true' : 'false'
        )
        .setType('Boolean')
        .setLabel('Can Sleep');
      behaviorProperties
        .getOrCreate('shape')
        .setValue(behaviorContent.getChild('shape').getStringValue())
        .setType('Choice')
        .setLabel('Shape')
        .addExtraInfo('Box')
        .addExtraInfo('Circle')
        .addExtraInfo('Edge')
        .addExtraInfo('Polygon');
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
        .setLabel('Shape Dimension A');
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
        .setLabel('Shape Dimension B');
      behaviorProperties
        .getOrCreate('shapeOffsetX')
        .setValue(
          behaviorContent.getChild('shapeOffsetX').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setLabel('Shape Offset X');
      behaviorProperties
        .getOrCreate('shapeOffsetY')
        .setValue(
          behaviorContent.getChild('shapeOffsetY').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setLabel('Shape Offset Y');
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
        .addExtraInfo('TopLeft');
      behaviorProperties
        .getOrCreate('vertices')
        .setValue(
          behaviorContent.hasChild('vertices')
            ? gd.Serializer.toJSON(behaviorContent.getChild('vertices'))
            : '[]'
        )
        .setLabel('Vertices');
      behaviorProperties
        .getOrCreate('density')
        .setValue(
          behaviorContent.getChild('density').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel('Density');
      behaviorProperties
        .getOrCreate('friction')
        .setValue(
          behaviorContent.getChild('friction').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel('Friction');
      behaviorProperties
        .getOrCreate('restitution')
        .setValue(
          behaviorContent.getChild('restitution').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel('Restitution');
      behaviorProperties
        .getOrCreate('linearDamping')
        .setValue(
          behaviorContent
            .getChild('linearDamping')
            .getDoubleValue()
            .toString(10)
        )
        .setType('Number')
        .setLabel('Linear Damping');
      behaviorProperties
        .getOrCreate('angularDamping')
        .setValue(
          behaviorContent
            .getChild('angularDamping')
            .getDoubleValue()
            .toString(10)
        )
        .setType('Number')
        .setLabel('Angular Damping');
      behaviorProperties
        .getOrCreate('gravityScale')
        .setValue(
          behaviorContent.getChild('gravityScale').getDoubleValue().toString(10)
        )
        .setType('Number')
        .setLabel('Gravity Scale');
      behaviorProperties
        .getOrCreate('layers')
        .setValue(behaviorContent.getChild('layers').getIntValue().toString(10))
        .setType('Number')
        .setLabel('Layers');
      behaviorProperties
        .getOrCreate('masks')
        .setValue(behaviorContent.getChild('masks').getIntValue().toString(10))
        .setType('Number')
        .setLabel('Masks');

      return behaviorProperties;
    };

    physics2Behavior.initializeContent = function (behaviorContent) {
      behaviorContent.addChild('bodyType').setStringValue('Dynamic');
      behaviorContent.addChild('bullet').setBoolValue(false);
      behaviorContent.addChild('fixedRotation').setBoolValue(false);
      behaviorContent.addChild('canSleep').setBoolValue(true);
      behaviorContent.addChild('shape').setStringValue('Box');
      behaviorContent.addChild('shapeDimensionA').setDoubleValue(0);
      behaviorContent.addChild('shapeDimensionB').setDoubleValue(0);
      behaviorContent.addChild('shapeOffsetX').setDoubleValue(0);
      behaviorContent.addChild('shapeOffsetY').setDoubleValue(0);
      behaviorContent.addChild('polygonOrigin').setStringValue('Center');
      behaviorContent.addChild('vertices').considerAsArray();
      behaviorContent.addChild('density').setDoubleValue(1.0);
      behaviorContent.addChild('friction').setDoubleValue(0.3);
      behaviorContent.addChild('restitution').setDoubleValue(0.1);
      behaviorContent.addChild('linearDamping').setDoubleValue(0.1);
      behaviorContent.addChild('angularDamping').setDoubleValue(0.1);
      behaviorContent.addChild('gravityScale').setDoubleValue(1);
      behaviorContent.addChild('layers').setIntValue(1);
      behaviorContent.addChild('masks').setIntValue(1);
    };

    var sharedData = new gd.BehaviorSharedDataJsImplementation();
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

      if (propertyName === 'scaleX') {
        const newValueAsNumber = parseInt(newValue, 10);
        if (newValueAsNumber !== newValueAsNumber) return false;
        sharedContent.getChild('scaleX').setDoubleValue(newValueAsNumber);
        return true;
      }

      if (propertyName === 'scaleY') {
        const newValueAsNumber = parseInt(newValue, 10);
        if (newValueAsNumber !== newValueAsNumber) return false;
        sharedContent.getChild('scaleY').setDoubleValue(newValueAsNumber);
        return true;
      }

      return false;
    };
    sharedData.getProperties = function (sharedContent) {
      var sharedProperties = new gd.MapStringPropertyDescriptor();

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
        .getOrCreate('scaleX')
        .setValue(
          sharedContent.getChild('scaleX').getDoubleValue().toString(10)
        )
        .setType('Number');
      sharedProperties
        .getOrCreate('scaleY')
        .setValue(
          sharedContent.getChild('scaleY').getDoubleValue().toString(10)
        )
        .setType('Number');

      return sharedProperties;
    };
    sharedData.initializeContent = function (behaviorContent) {
      behaviorContent.addChild('gravityX').setDoubleValue(0);
      behaviorContent.addChild('gravityY').setDoubleValue(9.8);
      behaviorContent.addChild('scaleX').setDoubleValue(100);
      behaviorContent.addChild('scaleY').setDoubleValue(100);
    };

    var aut = extension
      // extension
      .addBehavior(
        'Physics2Behavior',
        _('Physics Engine 2.0'),
        'Physics2',
        _(
          'Simulate realistic object physics with gravity, forces, joints, etc.'
        ),
        '',
        'res/physics32.png',
        'Physics2Behavior',
        //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
        physics2Behavior,
        sharedData
      )
      .setIncludeFile('Extensions/Physics2Behavior/physics2runtimebehavior.js')
      .addIncludeFile('Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.js')
      .addRequiredFile(
        'Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.wasm'
      );

    // Global
    aut
      .addCondition(
        'GravityX',
        _('World gravity on X axis'),
        _('Compare the world gravity on X axis.'),
        _('the world gravity on X axis'),
        _('Global'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Gravity to compare to (in pixels per second per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getGravityX');

    aut
      .addExpression(
        'GravityX',
        _('World gravity on X axis'),
        _('World gravity on X axis'),
        _('Global'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getGravityX');

    aut
      .addCondition(
        'GravityY',
        _('World gravity on Y axis'),
        _('Compare the world gravity on Y axis.'),
        _('the world gravity on Y axis'),
        _('Global'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Gravity to compare to (in pixels per second per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getGravityY');

    aut
      .addExpression(
        'GravityY',
        _('World gravity on Y axis'),
        _('World gravity on Y axis'),
        _('Global'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getGravityY');

    aut
      .addAction(
        'Gravity',
        _('World gravity'),
        _('Modify the world gravity.') +
          ' ' +
          _(
            'While an object is needed, this will apply to all objects using the behavior.'
          ),
        _('Set the world gravity of _PARAM0_ to _PARAM2_;_PARAM3_'),
        _('Global'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Gravity X'))
      .addParameter('expression', _('Gravity Y'))
      .getCodeExtraInformation()
      .setFunctionName('setGravity');

    aut
      .addCondition(
        'TimeScale',
        _('World time scale'),
        _('Compare the world time scale.'),
        _('the world time scale'),
        _('Global'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Time scale to compare to (1 by default)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getTimeScale');

    // This action has to be owned by the extension to run only once per objects list, not per instance
    extension
      .addAction(
        'TimeScale',
        _('World time scale'),
        _('Modify the world time scale.') +
          ' ' +
          _(
            'While an object is needed, this will apply to all objects using the behavior.'
          ),
        _('Set the world time scale of _PARAM0_ to _PARAM2_'),
        _('Global'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('objectList', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Time scale (1 by default)'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.setTimeScale');

    aut
      .addExpression(
        'TimeScale',
        _('World time scale'),
        _('World time scale'),
        _('Global'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getTimeScale');

    // Dynamics
    aut
      .addCondition(
        'IsDynamic',
        _('Is dynamic'),
        _('Test if an object is dynamic.'),
        _('_PARAM0_ is dynamic'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isDynamic');

    aut
      .addAction(
        'SetDynamic',
        _('Set as dynamic'),
        _(
          'Set an object as dynamic. Is affected by gravity, forces and velocities.'
        ),
        _('Set _PARAM0_ as dynamic'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setDynamic');

    aut
      .addCondition(
        'IsStatic',
        _('Is static'),
        _('Test if an object is static.'),
        _('_PARAM0_ is static'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isStatic');

    aut
      .addAction(
        'SetStatic',
        _('Set as static'),
        _(
          "Set an object as static. Is not affected by gravity, and can't be moved by forces or velocities at all."
        ),
        _('Set _PARAM0_ as static'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setStatic');

    aut
      .addCondition(
        'IsKinematic',
        _('Is kinematic'),
        _('Test if an object is kinematic.'),
        _('_PARAM0_ is kinematic'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isKinematic');

    aut
      .addAction(
        'SetKinematic',
        _('Set as kinematic'),
        _(
          'Set an object as kinematic. Is like a static body but can be moved through its velocity.'
        ),
        _('Set _PARAM0_ as kinematic'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setKinematic');

    aut
      .addCondition(
        'IsBullet',
        _('Is treat as bullet'),
        _('Test if an object is being treat as a bullet.'),
        _('_PARAM0_ is bullet'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isBullet');

    aut
      .addAction(
        'SetBullet',
        _('Treat as bullet'),
        _(
          'Treat the object as a bullet. Better collision handling on high speeds at cost of some performance.'
        ),
        _('Treat _PARAM0_ as bullet: _PARAM2_'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', _('Treat as bullet?'), '', false)
      .setDefaultValue('false')
      .getCodeExtraInformation()
      .setFunctionName('setBullet');

    aut
      .addCondition(
        'HasFixedRotation',
        _('Has fixed rotation'),
        _('Test if an object has fixed rotation.'),
        _('_PARAM0_ has fixed rotation'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('hasFixedRotation');

    aut
      .addAction(
        'SetFixedRotation',
        _('Fixed rotation'),
        _(
          "Enable or disable an object fixed rotation. If enabled the object won't be able to rotate."
        ),
        _('Set _PARAM0_ fixed rotation: _PARAM2_'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', _('Fixed rotation?'), '', false)
      .setDefaultValue('false')
      .getCodeExtraInformation()
      .setFunctionName('setFixedRotation');

    aut
      .addCondition(
        'IsSleepingAllowed',
        _('Is sleeping allowed'),
        _('Test if an object can sleep.'),
        _('_PARAM0_ can sleep'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isSleepingAllowed');

    aut
      .addAction(
        'SetSleepingAllowed',
        _('Sleeping allowed'),
        _(
          'Allow or not an object to sleep. If enabled the object will be able to sleep, improving performance for non-currently-moving objects.'
        ),
        _('Allow _PARAM0_ to sleep: _PARAM2_'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', _('Can sleep?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('setSleepingAllowed');

    // Deprecated action (fixed typo):
    aut
      .addDuplicatedAction('SetSleepingaAllowed', 'SetSleepingAllowed')
      .setHidden();

    aut
      .addCondition(
        'IsSleeping',
        _('Is sleeping'),
        _('Test if an object is sleeping.'),
        _('_PARAM0_ is sleeping'),
        _('Dynamics'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isSleeping');

    // Body settings
    aut
      .addAction(
        'ShapeScale',
        _('Shape scale'),
        _(
          'Modify an object shape scale. It affects custom shape dimensions and shape offset, if custom dimensions are not set the body will be scaled automatically to the object size.'
        ),
        _('the shape scale'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
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
      .addCondition(
        'Density',
        _('Density'),
        _('Test an object density.'),
        _('the _PARAM0_ density'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getDensity');

    aut
      .addAction(
        'Density',
        _('Density'),
        _(
          "Modify an object density. The body's density and volume determine its mass."
        ),
        _('the density'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setDensity')
      .setGetter('getDensity');

    aut
      .addExpression(
        'Density',
        _('Density of the object'),
        _('Get the density of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getDensity');

    aut
      .addCondition(
        'Friction',
        _('Friction'),
        _('Test an object friction.'),
        _('the _PARAM0_ friction'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getFriction');

    aut
      .addAction(
        'Friction',
        _('Friction'),
        _(
          "Modify an object friction. How much energy is lost from the movement of one object over another. The combined friction from two bodies is calculated as 'sqrt(bodyA.friction * bodyB.friction)'."
        ),
        _('the friction'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setFriction')
      .setGetter('getFriction');

    aut
      .addExpression(
        'Friction',
        _('Friction of the object'),
        _('Get the friction of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getFriction');

    aut
      .addCondition(
        'Restitution',
        _('Restitution'),
        _('Test an object restitution.'),
        _('the _PARAM0_ restitution'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getRestitution');

    aut
      .addAction(
        'Restitution',
        _('Restitution'),
        _(
          "Modify an object restitution. Energy conservation on collision. The combined restitution from two bodies is calculated as 'max(bodyA.restitution, bodyB.restitution)'."
        ),
        _('the restitution'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setRestitution')
      .setGetter('getRestitution');

    aut
      .addExpression(
        'Restitution',
        _('Restitution of the object'),
        _('Get the restitution of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getRestitution');

    aut
      .addCondition(
        'LinearDamping',
        _('Linear damping'),
        _('Test an object linear damping.'),
        _('the _PARAM0_ linear damping'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getLinearDamping');

    aut
      .addAction(
        'LinearDamping',
        _('Linear damping'),
        _(
          'Modify an object linear damping. How much movement speed is lost across the time.'
        ),
        _('the linear damping'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setLinearDamping')
      .setGetter('getLinearDamping');

    aut
      .addExpression(
        'LinearDamping',
        _('Linear damping of the object'),
        _('Get the linear damping of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getLinearDamping');

    aut
      .addCondition(
        'AngularDamping',
        _('Angular damping'),
        _('Test an object angular damping.'),
        _('the _PARAM0_ angular damping'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getAngularDamping');

    aut
      .addAction(
        'AngularDamping',
        _('Angular damping'),
        _(
          'Modify an object angular damping. How much angular speed is lost across the time.'
        ),
        _('the angular damping'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setAngularDamping')
      .setGetter('getAngularDamping');

    aut
      .addExpression(
        'AngularDamping',
        _('Angular damping of the object'),
        _('Get the angular damping of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getAngularDamping');

    aut
      .addCondition(
        'GravityScale',
        _('Gravity scale'),
        _('Test an object gravity scale.'),
        _('the _PARAM0_ gravity scale'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale to compare to (1 by default)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getGravityScale');

    aut
      .addAction(
        'GravityScale',
        _('Gravity scale'),
        _(
          'Modify an object gravity scale. The gravity applied to an object is the world gravity multiplied by the object gravity scale.'
        ),
        _('the gravity scale'),
        _('Body settings'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('setGravityScale')
      .setGetter('getGravityScale');

    aut
      .addExpression(
        'GravityScale',
        _('Gravity scale of the object'),
        _('Get the gravity scale of an object.'),
        _('Body settings'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getGravityScale');

    // Filtering
    aut
      .addCondition(
        'LayerEnabled',
        _('Layer enabled'),
        _('Test if an object has a specific layer enabled.'),
        _('_PARAM0_ has layer _PARAM2_ enabled'),
        _('Filtering'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Layer (1 - 16)'))
      .getCodeExtraInformation()
      .setFunctionName('layerEnabled');

    aut
      .addAction(
        'EnableLayer',
        _('Enable layer'),
        _(
          'Enable or disable a layer for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
        ),
        _('Enable layer _PARAM2_ for _PARAM0_: _PARAM3_'),
        _('Filtering'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Layer (1 - 16)'))
      .addParameter('yesorno', _('Enable?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('enableLayer');

    aut
      .addCondition(
        'MaskEnabled',
        _('Mask enabled'),
        _('Test if an object has a specific mask enabled.'),
        _('_PARAM0_ has mask _PARAM2_ enabled'),
        _('Filtering'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Mask (1 - 16)'))
      .getCodeExtraInformation()
      .setFunctionName('maskEnabled');

    aut
      .addAction(
        'EnableMask',
        _('Enable mask'),
        _(
          'Enable or disable a mask for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
        ),
        _('Enable mask _PARAM2_ for _PARAM0_: _PARAM3_'),
        _('Filtering'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Mask (1 - 16)'))
      .addParameter('yesorno', _('Enable?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('enableMask');

    // Velocity
    aut
      .addCondition(
        'LinearVelocityX',
        _('Linear velocity X'),
        _('Test an object linear velocity on X.'),
        _('the linear velocity on X'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Speed to compare to (in pixels per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityX');

    aut
      .addAction(
        'LinearVelocityX',
        _('Linear velocity X'),
        _('Modify an object linear velocity on X.'),
        _('the linear velocity on X'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Speed (in pixels per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('setLinearVelocityX')
      .setGetter('getLinearVelocityX');

    aut
      .addExpression(
        'LinearVelocityX',
        _('Linear velocity on X axis'),
        _('Get the linear velocity of an object on X axis.'),
        _('Velocity'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityX');

    aut
      .addCondition(
        'LinearVelocityY',
        _('Linear velocity Y'),
        _('Test an object linear velocity on Y.'),
        _('the linear velocity on Y'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Speed to compare to (in pixels per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityY');

    aut
      .addAction(
        'LinearVelocityY',
        _('Linear velocity Y'),
        _('Modify an object linear velocity on Y.'),
        _('the linear velocity on Y'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Speed (in pixels per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('setLinearVelocityY')
      .setGetter('getLinearVelocityY');

    aut
      .addExpression(
        'LinearVelocityY',
        _('Linear velocity on Y axis'),
        _('Get the linear velocity of an object on Y axis.'),
        _('Velocity'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityY');

    aut
      .addCondition(
        'LinearVelocityLength',
        _('Linear velocity'),
        _('Test an object linear velocity length.'),
        _('the linear velocity length'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Speed to compare to (in pixels per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityLength');

    aut
      .addExpression(
        'LinearVelocity',
        _('Linear velocity'),
        _('Get the linear velocity of an object.'),
        _('Velocity'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityLength');

    aut
      .addCondition(
        'LinearVelocityAngle',
        _('Linear velocity angle'),
        _('Test an object linear velocity angle.'),
        _('the linear velocity angle'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle to compare to (in degrees)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityAngle');

    aut
      .addAction(
        'LinearVelocityAngle',
        _('Linear velocity towards an angle'),
        _('Set the linear velocity towards an angle.'),
        _(
          'Set the linear velocity of _PARAM0_ towards angle: _PARAM2_ degrees, speed: _PARAM3_ pixels per second'
        ),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Angle'))
      .addParameter('expression', _('Speed (in pixels per second)'))
      .getCodeExtraInformation()
      .setFunctionName('setLinearVelocityAngle')
      .setGetter('getLinearVelocityAngle');

    aut
      .addExpression(
        'LinearVelocityAngle',
        _('Linear velocity angle'),
        _('Get the linear velocity angle of an object.'),
        _('Velocity'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityAngle');

    aut
      .addCondition(
        'AngularVelocity',
        _('Angular velocity'),
        _('Test an object angular velocity.'),
        _('the angular velocity'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angular speed to compare to (in degrees per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('getAngularVelocity');

    aut
      .addAction(
        'AngularVelocity',
        _('Angular velocity'),
        _('Modify an object angular velocity.'),
        _('the angular velocity'),
        _('Velocity'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angular speed (in degrees per second)')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('setAngularVelocity')
      .setGetter('getAngularVelocity');

    aut
      .addExpression(
        'AngularVelocity',
        _('Angular velocity'),
        _('Get the angular velocity of an object.'),
        _('Velocity'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getAngularVelocity');

    // Forces and impulses
    aut
      .addAction(
        'ApplyForce',
        _('Apply force'),
        _(
          'Apply a force to the object over time. It "accelerates" an object and must be used every frame during a time period.'
        ),
        _('Apply to _PARAM0_ a force of _PARAM2_;_PARAM3_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('X component (N)'))
      .addParameter('expression', _('Y component (N)'))
      .setParameterLongDescription(
        _('A force is like an acceleration but depends on the mass.')
      )
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyForce');

    aut
      .addAction(
        'ApplyPolarForce',
        _('Apply force (angle)'),
        _(
          'Apply a force to the object over time using polar coordinates. It "accelerates" an object and must be used every frame during a time period.'
        ),
        _('Apply to _PARAM0_ a force of angle _PARAM2_ and length _PARAM3_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Angle'))
      .addParameter('expression', _('Length (N)'))
      .setParameterLongDescription(
        _('A force is like an acceleration but depends on the mass.')
      )
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyPolarForce');

    aut
      .addAction(
        'ApplyForceTowardPosition',
        _('Apply force toward position'),
        _(
          'Apply a force to the object over time to move it toward a position. It "accelerates" an object and must be used every frame during a time period.'
        ),
        _(
          'Apply to _PARAM0_ a force of length _PARAM2_ towards _PARAM3_;_PARAM4_'
        ),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Length (N)'))
      .setParameterLongDescription(
        _('A force is like an acceleration but depends on the mass.')
      )
      .addParameter('expression', _('X position'))
      .addParameter('expression', _('Y position'))
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyForceTowardPosition');

    aut
      .addAction(
        'ApplyImpulse',
        _('Apply impulse'),
        _(
          'Apply an impulse to the object. It instantly changes the speed, to give an initial speed for instance.'
        ),
        _('Apply to _PARAM0_ an impulse of _PARAM2_;_PARAM3_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('X component (N·s or kg·m·s⁻¹)'))
      .addParameter('expression', _('Y component (N·s or kg·m·s⁻¹)'))
      .setParameterLongDescription(
        _('An impulse is like a speed addition but depends on the mass.')
      )
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyImpulse');

    aut
      .addAction(
        'ApplyPolarImpulse',
        _('Apply impulse (angle)'),
        _(
          'Apply an impulse to the object using polar coordinates. It instantly changes the speed, to give an initial speed for instance.'
        ),
        _(
          'Apply to _PARAM0_ an impulse of angle _PARAM2_ and length _PARAM3_ (applied at _PARAM4_;_PARAM5_)'
        ),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Angle'))
      .addParameter('expression', _('Length (N·s or kg·m·s⁻¹)'))
      .setParameterLongDescription(
        _('An impulse is like a speed addition but depends on the mass.')
      )
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyPolarImpulse');

    aut
      .addAction(
        'ApplyImpulseTowardPosition',
        _('Apply impulse toward position'),
        _(
          'Apply an impulse to the object to move it toward a position. It instantly changes the speed, to give an initial speed for instance.'
        ),
        _(
          'Apply to _PARAM0_ an impulse of length _PARAM2_ towards _PARAM3_;_PARAM4_ (applied at _PARAM5_;_PARAM6_)'
        ),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Length (N·s or kg·m·s⁻¹)'))
      .setParameterLongDescription(
        _('An impulse is like a speed addition but depends on the mass.')
      )
      .addParameter('expression', _('X position'))
      .addParameter('expression', _('Y position'))
      .addParameter('expression', _('Application point on X axis'))
      .addParameter('expression', _('Application point on Y axis'))
      .setParameterLongDescription(
        _(
          'Use `MassCenterX` and `MassCenterY` expressions to avoid any rotation.'
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('applyImpulseTowardPosition');

    aut
      .addAction(
        'ApplyTorque',
        _('Apply torque (rotational force)'),
        _(
          'Apply a torque (also called "rotational force") to the object. It "accelerates" an object rotation and must be used every frame during a time period.'
        ),
        _('Apply to _PARAM0_ a torque of _PARAM2_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Torque (N·m)'))
      .setParameterLongDescription(
        _('A torque is like a rotation acceleration but depends on the mass.')
      )
      .getCodeExtraInformation()
      .setFunctionName('applyTorque');

    aut
      .addAction(
        'ApplyAngularImpulse',
        _('Apply angular impulse (rotational impulse)'),
        _(
          'Apply an angular impulse (also called a "rotational impulse") to the object. It instantly changes the rotation speed, to give an initial speed for instance.'
        ),
        _('Apply to _PARAM0_ an angular impulse of _PARAM2_'),
        _('Forces & impulses'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Angular impulse (N·m·s'))
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
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getMass');

    aut
      .addExpression(
        'Inertia',
        _('Inertia'),
        _(
          'Return the rotational inertia of the object (in kilograms * meters * meters)'
        ),
        '',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getInertia');

    aut
      .addExpression(
        'MassCenterX',
        _('Mass center X'),
        _('Mass center X'),
        '',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getMassCenterX');

    aut
      .addExpression(
        'MassCenterY',
        _('Mass center Y'),
        _('Mass center Y'),
        '',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getMassCenterY');

    // Joints
    aut
      .addCondition(
        'JointFirstObject',
        _('Joint first object'),
        _('Test if an object is the first object on a joint.'),
        _('_PARAM0_ is the first object for joint _PARAM2_'),
        _('Joints'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isJointFirstObject');

    aut
      .addCondition(
        'JointSecondObject',
        _('Joint second object'),
        _('Test if an object is the second object on a joint.'),
        _('_PARAM0_ is the second object for joint _PARAM2_'),
        _('Joints'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isJointSecondObject');

    aut
      .addExpression(
        'JointFirstAnchorX',
        _('Joint first anchor X'),
        _('Joint first anchor X'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointFirstAnchorX');

    aut
      .addExpression(
        'JointFirstAnchorY',
        _('Joint first anchor Y'),
        _('Joint first anchor Y'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointFirstAnchorY');

    aut
      .addExpression(
        'JointSecondAnchorX',
        _('Joint second anchor X'),
        _('Joint second anchor X'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointSecondAnchorX');

    aut
      .addExpression(
        'JointSecondAnchorY',
        _('Joint second anchor Y'),
        _('Joint second anchor Y'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointSecondAnchorY');

    aut
      .addCondition(
        'JointReactionForce',
        _('Joint reaction force'),
        _('Test a joint reaction force.'),
        _('the joint _PARAM2_ reaction force'),
        _('Joints'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionForce');

    aut
      .addExpression(
        'JointReactionForce',
        _('Joint reaction force'),
        _('Joint reaction force'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionForce');

    aut
      .addCondition(
        'JointReactionTorque',
        _('Joint reaction torque'),
        _('Test a joint reaction torque.'),
        _('the joint _PARAM2_ reaction torque'),
        _('Joints'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionTorque');

    aut
      .addExpression(
        'JointReactionTorque',
        _('Joint reaction torque'),
        _('Joint reaction torque'),
        _('Joints'),
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionTorque');

    aut
      .addAction(
        'Remove joint',
        _('Remove joint'),
        _('Remove a joint from the scene.'),
        _('Remove joint _PARAM2_'),
        _('Joints'),
        'res/physics32.png',
        'res/physics32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('removeJoint');

    // Distance joint
    aut
      .addAction(
        'AddDistanceJoint',
        _('Add distance joint'),
        _(
          'Add a distance joint between two objects. The length is converted to meters using the world scale on X. The frequency and damping ratio are related to the joint speed of oscillation and how fast it stops.'
        ),
        _('Add a distance joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter(
        'expression',
        _('Length (-1 to use current objects distance) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        _('Frequency (Hz) (non-negative) (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addDistanceJoint');

    aut
      .addAction(
        'DistanceJointLength',
        _('Distance joint length'),
        _('Modify a distance joint length.'),
        _('the length for distance joint _PARAM2_'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointLength')
      .setGetter('getDistanceJointLength');

    aut
      .addExpression(
        'DistanceJointLength',
        _('Distance joint length'),
        _('Distance joint length'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointLength');

    aut
      .addAction(
        'DistanceJointFrequency',
        _('Distance joint frequency'),
        _('Modify a distance joint frequency.'),
        _('the frequency for distance joint _PARAM2_'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointFrequency')
      .setGetter('getDistanceJointFrequency');

    aut
      .addExpression(
        'DistanceJointFrequency',
        _('Distance joint frequency'),
        _('Distance joint frequency'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointFrequency');

    aut
      .addAction(
        'DistanceJointDampingRatio',
        _('Distance joint damping ratio'),
        _('Modify a distance joint damping ratio.'),
        _('the damping ratio for distance joint _PARAM2_'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointDampingRatio')
      .setGetter('getDistanceJointDampingRatio');

    aut
      .addExpression(
        'DistanceJointDampingRatio',
        _('Distance joint damping ratio'),
        _('Distance joint damping ratio'),
        _('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointDampingRatio');

    // Revolute joint
    aut
      .addAction(
        'AddRevoluteJoint',
        _('Add revolute joint'),
        _(
          'Add a revolute joint to an object at a fixed point. The object is attached as the second object in the joint, so you can use this for gear joints.'
        ),
        _('Add a revolute joint to _PARAM0_ at _PARAM2_;_PARAM3_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('X anchor'))
      .addParameter('expression', _('Y anchor'))
      .addParameter(
        'yesorno',
        _('Enable angle limits? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter('expression', _('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', _('Minimum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', _('Maximum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', _('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Motor maximum torque (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRevoluteJoint');

    aut
      .addAction(
        'AddRevoluteJointBetweenTwoBodies',
        _('Add revolute joint between two bodies'),
        _(
          'Add a revolute joint between two objects. The reference angle determines what is considered as the base angle at the initial state.'
        ),
        _('Add a revolute joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter(
        'yesorno',
        _('Enable angle limits? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter('expression', _('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', _('Minimum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', _('Maximum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', _('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Motor maximum torque (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRevoluteJointBetweenTwoBodies');

    aut
      .addExpression(
        'RevoluteJointReferenceAngle',
        _('Revolute joint reference angle'),
        _('Revolute joint reference angle'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointReferenceAngle');

    aut
      .addExpression(
        'RevoluteJointAngle',
        _('Revolute joint current angle'),
        _('Revolute joint current angle'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointAngle');

    aut
      .addExpression(
        'RevoluteJointSpeed',
        _('Revolute joint angular speed'),
        _('Revolute joint angular speed'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointSpeed');

    aut
      .addCondition(
        'RevoluteJointLimitsEnabled',
        _('Revolute joint limits enabled'),
        _('Test if a revolute joint limits are enabled.'),
        _('Limits for revolute joint _PARAM2_ are enabled'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isRevoluteJointLimitsEnabled');

    aut
      .addAction(
        'EnableRevoluteJointLimits',
        _('Enable revolute joint limits'),
        _('Enable or disable a revolute joint angle limits.'),
        _('Enable limits for revolute joint _PARAM2_: _PARAM3_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('yesorno', _('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableRevoluteJointLimits');

    aut
      .addAction(
        'RevoluteJointLimits',
        _('Revolute joint limits'),
        _('Modify a revolute joint angle limits.'),
        _('Set the limits to _PARAM3_;_PARAM4_ for revolute joint _PARAM2_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('expression', _('Minimum angle'))
      .addParameter('expression', _('Maximum angle'))
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointLimits');

    aut
      .addExpression(
        'RevoluteJointMinAngle',
        _('Revolute joint minimum angle'),
        _('Revolute joint minimum angle'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMinAngle');

    aut
      .addExpression(
        'RevoluteJointMaxAngle',
        _('Revolute joint maximum angle'),
        _('Revolute joint maximum angle'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMaxAngle');

    aut
      .addCondition(
        'RevoluteJointMotorEnabled',
        _('Revolute joint motor enabled'),
        _('Test if a revolute joint motor is enabled.'),
        _('Motor of revolute joint _PARAM2_ is enabled'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isRevoluteJointMotorEnabled');

    aut
      .addAction(
        'EnableRevoluteJointMotor',
        _('Enable revolute joint motor'),
        _('Enable or disable a revolute joint motor.'),
        _('Enable motor for revolute joint _PARAM2_: _PARAM3_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('yesorno', _('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableRevoluteJointMotor');

    aut
      .addAction(
        'RevoluteJointMotorSpeed',
        _('Revolute joint motor speed'),
        _('Modify a revolute joint motor speed.'),
        _('the motor speed for revolute joint _PARAM2_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointMotorSpeed')
      .setGetter('getRevoluteJointMotorSpeed');

    aut
      .addExpression(
        'RevoluteJointMotorSpeed',
        _('Revolute joint motor speed'),
        _('Revolute joint motor speed'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMotorSpeed');

    aut
      .addAction(
        'RevoluteJointMaxMotorTorque',
        _('Revolute joint max motor torque'),
        _('Modify a revolute joint maximum motor torque.'),
        _('the maximum motor torque for revolute joint _PARAM2_'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointMaxMotorTorque')
      .setGetter('getRevoluteJointMaxMotorTorque');

    aut
      .addExpression(
        'RevoluteJointMaxMotorTorque',
        _('Revolute joint max motor torque'),
        _('Revolute joint maximum motor torque'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMaxMotorTorque');

    aut
      .addExpression(
        'RevoluteJointMotorTorque',
        _('Revolute joint motor torque'),
        _('Revolute joint motor torque'),
        _('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMotorTorque');

    // Prismatic joint
    aut
      .addAction(
        'AddPrismaticJoint',
        _('Add prismatic joint'),
        _(
          'Add a prismatic joint between two objects. The translation limits are converted to meters using the world scale on X.'
        ),
        _('Add a prismatic joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter('expression', _('Axis angle'))
      .addParameter('expression', _('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Enable limits? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter(
        'expression',
        _('Minimum translation (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Maximum translation (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter('yesorno', _('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', _('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Motor maximum force (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addPrismaticJoint');

    aut
      .addExpression(
        'PrismaticJointAxisAngle',
        _('Prismatic joint axis angle'),
        _('Prismatic joint axis angle'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointAxisAngle');

    aut
      .addExpression(
        'PrismaticJointReferenceAngle',
        _('Prismatic joint reference angle'),
        _('Prismatic joint reference angle'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointReferenceAngle');

    aut
      .addExpression(
        'PrismaticJointTranslation',
        _('Prismatic joint current translation'),
        _('Prismatic joint current translation'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointTranslation');

    aut
      .addExpression(
        'PrismaticJointSpeed',
        _('Prismatic joint current speed'),
        _('Prismatic joint speed'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointSpeed');

    aut
      .addCondition(
        'PrismaticJointLimitsEnabled',
        _('Prismatic joint limits enabled'),
        _('Test if a prismatic joint limits are enabled.'),
        _('Limits for prismatic joint _PARAM2_ are enabled'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isPrismaticJointLimitsEnabled');

    aut
      .addAction(
        'EnablePrismaticJointLimits',
        _('Enable prismatic joint limits'),
        _('Enable or disable a prismatic joint limits.'),
        _('Enable limits for prismatic joint _PARAM2_: _PARAM3_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('yesorno', _('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enablePrismaticJointLimits');

    aut
      .addAction(
        'PrismaticJointLimits',
        _('Prismatic joint limits'),
        _('Modify a prismatic joint limits.'),
        _('Set the limits to _PARAM3_;_PARAM4_ for prismatic joint _PARAM2_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('expression', _('Minimum translation'))
      .addParameter('expression', _('Maximum translation'))
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointLimits');

    aut
      .addExpression(
        'PrismaticJointMinTranslation',
        _('Prismatic joint minimum translation'),
        _('Prismatic joint minimum translation'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMinTranslation');

    aut
      .addExpression(
        'PrismaticJointMaxTranslation',
        _('Prismatic joint maximum translation'),
        _('Prismatic joint maximum translation'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMaxTranslation');

    aut
      .addCondition(
        'PrismaticJointMotorEnabled',
        _('Prismatic joint motor enabled'),
        _('Test if a prismatic joint motor is enabled.'),
        _('Motor for prismatic joint _PARAM2_ is enabled'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isPrismaticJointMotorEnabled');

    aut
      .addAction(
        'EnablePrismaticJointMotor',
        _('Enable prismatic joint motor'),
        _('Enable or disable a prismatic joint motor.'),
        _('Enable motor for prismatic joint _PARAM2_: _PARAM3_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('yesorno', _('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enablePrismaticJointMotor');

    aut
      .addAction(
        'PrismaticJointMotorSpeed',
        _('Prismatic joint motor speed'),
        _('Modify a prismatic joint motor speed.'),
        _('the motor force for prismatic joint _PARAM2_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointMotorSpeed')
      .setGetter('getPrismaticJointMotorSpeed');

    aut
      .addExpression(
        'PrismaticJointMotorSpeed',
        _('Prismatic joint motor speed'),
        _('Prismatic joint motor speed'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMotorSpeed');

    aut
      .addAction(
        'PrismaticJointMaxMotorForce',
        _('Prismatic joint max motor force'),
        _('Modify a prismatic joint maximum motor force.'),
        _('the maximum motor force for prismatic joint _PARAM2_'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointMaxMotorForce')
      .setGetter('getPrismaticJointMaxMotorForce');

    aut
      .addExpression(
        'PrismaticJointMaxMotorForce',
        _('Prismatic joint max motor force'),
        _('Prismatic joint maximum motor force'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMaxMotorForce');

    aut
      .addExpression(
        'PrismaticJointMotorForce',
        _('Prismatic joint motor force'),
        _('Prismatic joint motor force'),
        _('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMotorForce');

    // Pulley joint
    aut
      .addAction(
        'AddPulleyJoint',
        _('Add pulley joint'),
        _(
          'Add a pulley joint between two objects. Lengths are converted to meters using the world scale on X.'
        ),
        _('Add a pulley joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint24.png',
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter('expression', _('Ground anchor X for first object'))
      .addParameter('expression', _('Ground anchor Y for first object'))
      .addParameter('expression', _('Ground anchor X for second object'))
      .addParameter('expression', _('Ground anchor Y for second object'))
      .addParameter(
        'expression',
        _('Length for first object (-1 to use anchor positions) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        _(
          'Length for second object (-1 to use anchor positions) (default: -1)'
        ),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        _('Ratio (non-negative) (default: 1'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addPulleyJoint');

    aut
      .addExpression(
        'PulleyJointFirstGroundAnchorX',
        _('Pulley joint first ground anchor X'),
        _('Pulley joint first ground anchor X'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstGroundAnchorX');

    aut
      .addExpression(
        'PulleyJointFirstGroundAnchorY',
        _('Pulley joint first ground anchor Y'),
        _('Pulley joint first ground anchor Y'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstGroundAnchorY');

    aut
      .addExpression(
        'PulleyJointSecondGroundAnchorX',
        _('Pulley joint second ground anchor X'),
        _('Pulley joint second ground anchor X'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondGroundAnchorX');

    aut
      .addExpression(
        'PulleyJointSecondGroundAnchorY',
        _('Pulley joint second ground anchor Y'),
        _('Pulley joint second ground anchor Y'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondGroundAnchorY');

    aut
      .addExpression(
        'PulleyJointFirstLength',
        _('Pulley joint first length'),
        _('Pulley joint first length'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstLength');

    aut
      .addExpression(
        'PulleyJointSecondLength',
        _('Pulley joint second length'),
        _('Pulley joint second length'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondLength');

    aut
      .addExpression(
        'PulleyJointRatio',
        _('Pulley joint ratio'),
        _('Pulley joint ratio'),
        _('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointRatio');

    // Gear joint
    aut
      .addAction(
        'AddGearJoint',
        _('Add gear joint'),
        _(
          'Add a gear joint between two joints. Attention: Gear joints require the joints to be revolute or prismatic, and both of them to be attached to a static body as first object.'
        ),
        _('Add a gear joint between joints _PARAM2_ and _PARAM3_'),
        _('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint24.png',
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('First joint ID'))
      .addParameter('expression', _('Second joint ID'))
      .addParameter('expression', _('Ratio (non-zero) (default: 1)'), '', true)
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addGearJoint');

    aut
      .addExpression(
        'GearJointFirstJoint',
        _('Gear joint first joint'),
        _('Gear joint first joint'),
        _('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointFirstJoint');

    aut
      .addExpression(
        'GearJointSecondJoint',
        _('Gear joint second joint'),
        _('Gear joint second joint'),
        _('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointSecondJoint');

    aut
      .addAction(
        'GearJointRatio',
        _('Gear joint ratio'),
        _('Modify a Gear joint ratio.'),
        _('the ratio for gear joint _PARAM2_'),
        _('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint24.png',
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setGearJointRatio')
      .setGetter('getGearJointRatio');

    aut
      .addExpression(
        'GearJointRatio',
        _('Gear joint ratio'),
        _('Gear joint ratio'),
        _('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointRatio');

    // Mouse joint
    aut
      .addAction(
        'AddMouseJoint',
        _('Add mouse joint'),
        _(
          'Add a mouse joint to an object (makes the object move towards a specific point).'
        ),
        _('Add a mouse joint to _PARAM0_'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Target X'))
      .addParameter('expression', _('Target Y'))
      .addParameter(
        'expression',
        _('Maximum force (N) (non-negative) (default: 500)'),
        '',
        true
      )
      .setDefaultValue('500')
      .addParameter(
        'expression',
        _('Frequency (Hz) (positive) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        _('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addMouseJoint');

    aut
      .addAction(
        'MouseJointTarget',
        _('Mouse joint target'),
        _('Set a mouse joint target.'),
        _(
          'Set the target position of mouse joint _PARAM2_ of _PARAM0_ to _PARAM3_;_PARAM4_'
        ),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('expression', _('Target X'))
      .addParameter('expression', _('Target Y'))
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointTarget');

    aut
      .addExpression(
        'MouseJointTargetX',
        _('Mouse joint target X'),
        _('Mouse joint target X'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointTargetX');

    aut
      .addExpression(
        'MouseJointTargetY',
        _('Mouse joint target Y'),
        _('Mouse joint target Y'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointTargetY');

    aut
      .addAction(
        'MouseJointMaxForce',
        _('Mouse joint max force'),
        _('Set a mouse joint maximum force.'),
        _('the maximum force for mouse joint _PARAM2_'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointMaxForce')
      .setGetter('getMouseJointMaxForce');

    aut
      .addExpression(
        'MouseJointMaxForce',
        _('Mouse joint max force'),
        _('Mouse joint maximum force'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointMaxForce');

    aut
      .addAction(
        'MouseJointFrequency',
        _('Mouse joint frequency'),
        _('Set a mouse joint frequency.'),
        _('the frequency for mouse joint _PARAM2_'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointFrequency')
      .setGetter('getMouseJointFrequency');

    aut
      .addExpression(
        'MouseJointFrequency',
        _('Mouse joint frequency'),
        _('Mouse joint frequency'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointFrequency');

    aut
      .addAction(
        'MouseJointDampingRatio',
        _('Mouse joint damping ratio'),
        _('Set a mouse joint damping ratio.'),
        _('the damping ratio for mouse joint _PARAM2_'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointDampingRatio')
      .setGetter('getMouseJointDampingRatio');

    aut
      .addExpression(
        'MouseJointDampingRatio',
        _('Mouse joint damping ratio'),
        _('Mouse joint damping ratio'),
        _('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointDampingRatio');

    // Wheel joint
    aut
      .addAction(
        'AddWheelJoint',
        _('Add wheel joint'),
        _(
          'Add a wheel joint between two objects. Higher frequencies means higher suspensions. Damping determines oscillations, critical damping of 1 means no oscillations.'
        ),
        _('Add a wheel joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter('expression', _('Axis angle'))
      .addParameter(
        'expression',
        _('Frequency (Hz) (non-negative) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        _('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter('yesorno', _('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', _('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Motor maximum torque (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addWheelJoint');

    aut
      .addExpression(
        'WheelJointAxisAngle',
        _('Wheel joint axis angle'),
        _('Wheel joint axis angle'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointAxisAngle');

    aut
      .addExpression(
        'WheelJointTranslation',
        _('Wheel joint current translation'),
        _('Wheel joint current translation'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointTranslation');

    aut
      .addExpression(
        'WheelJointSpeed',
        _('Wheel joint current speed'),
        _('Wheel joint speed'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointSpeed');

    aut
      .addCondition(
        'WheelJointMotorEnabled',
        _('Wheel joint motor enabled'),
        _('Test if a wheel joint motor is enabled.'),
        _('Motor for wheel joint _PARAM2_ is enabled'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isWheelJointMotorEnabled');

    aut
      .addAction(
        'EnableWheelJointMotor',
        _('Enable wheel joint motor'),
        _('Enable or disable a wheel joint motor.'),
        _('Enable motor for wheel joint _PARAM2_: _PARAM3_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('yesorno', _('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableWheelJointMotor');

    aut
      .addAction(
        'WheelJointMotorSpeed',
        _('Wheel joint motor speed'),
        _('Modify a wheel joint motor speed.'),
        _('the motor speed for wheel joint _PARAM2_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointMotorSpeed')
      .setGetter('getWheelJointMotorSpeed');

    aut
      .addExpression(
        'WheelJointMotorSpeed',
        _('Wheel joint motor speed'),
        _('Wheel joint motor speed'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMotorSpeed');

    aut
      .addAction(
        'WheelJointMaxMotorTorque',
        _('Wheel joint max motor torque'),
        _('Modify a wheel joint maximum motor torque.'),
        _('the maximum motor torque for wheel joint _PARAM2_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointMaxMotorTorque')
      .setGetter('getWheelJointMaxMotorTorque');

    aut
      .addExpression(
        'WheelJointMaxMotorTorque',
        _('Wheel joint max motor torque'),
        _('Wheel joint maximum motor torque'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMaxMotorTorque');

    aut
      .addExpression(
        'WheelJointMotorTorque',
        _('Wheel joint motor torque'),
        _('Wheel joint motor torque'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMotorTorque');

    aut
      .addAction(
        'WheelJointFrequency',
        _('Wheel joint frequency'),
        _('Modify a wheel joint frequency.'),
        _('the frequency for wheel joint _PARAM2_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointFrequency')
      .setGetter('getWheelJointFrequency');

    aut
      .addExpression(
        'WheelJointFrequency',
        _('Wheel joint frequency'),
        _('Wheel joint frequency'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointFrequency');

    aut
      .addAction(
        'WheelJointDampingRatio',
        _('Wheel joint damping ratio'),
        _('Modify a wheel joint damping ratio.'),
        _('the damping ratio for wheel joint _PARAM2_'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointDampingRatio')
      .setGetter('getWheelJointDampingRatio');

    aut
      .addExpression(
        'WheelJointDampingRatio',
        _('Wheel joint damping ratio'),
        _('Wheel joint damping ratio'),
        _('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointDampingRatio');

    // Weld joint
    aut
      .addAction(
        'AddWeldJoint',
        _('Add weld joint'),
        _('Add a weld joint between two objects.'),
        _('Add a weld joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter('expression', _('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        _('Frequency (Hz) (non-negative) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        _('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addWeldJoint');

    aut
      .addExpression(
        'WeldJointReferenceAngle',
        _('Weld joint reference angle'),
        _('Weld joint reference angle'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointReferenceAngle');

    aut
      .addAction(
        'WeldJointFrequency',
        _('Weld joint frequency'),
        _('Modify a weld joint frequency.'),
        _('the frequency for weld joint _PARAM2_'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWeldJointFrequency')
      .setGetter('getWeldJointFrequency');

    aut
      .addExpression(
        'WeldJointFrequency',
        _('Weld joint frequency'),
        _('Weld joint frequency'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointFrequency');

    aut
      .addAction(
        'WeldJointDampingRatio',
        _('Weld joint damping ratio'),
        _('Modify a weld joint damping ratio.'),
        _('the damping ratio for weld joint _PARAM2_'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setWeldJointDampingRatio')
      .setGetter('getWeldJointDampingRatio');

    aut
      .addExpression(
        'WeldJointDampingRatio',
        _('Weld joint damping ratio'),
        _('Weld joint damping ratio'),
        _('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointDampingRatio');

    // Rope joint
    aut
      .addAction(
        'AddRopeJoint',
        _('Add rope joint'),
        _(
          'Add a rope joint between two objects. The maximum length is converted to meters using the world scale on X.'
        ),
        _('Add a rope joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint24.png',
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter(
        'expression',
        _('Maximum length (-1 to use current objects distance) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRopeJoint');

    aut
      .addAction(
        'RopeJointMaxLength',
        _('Rope joint max length'),
        _('Modify a rope joint maximum length.'),
        _('the maximum length for rope joint _PARAM2_'),
        _('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint24.png',
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setRopeJointMaxLength')
      .setGetter('getRopeJointMaxLength');

    aut
      .addExpression(
        'RopeJointMaxLength',
        _('Rope joint max length'),
        _('Rope joint maximum length'),
        _('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRopeJointMaxLength');

    // Friction joint
    aut
      .addAction(
        'AddFrictionJoint',
        _('Add friction joint'),
        _('Add a friction joint between two objects.'),
        _('Add a friction joint between _PARAM0_ and _PARAM4_'),
        _('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Anchor X on first body'))
      .addParameter('expression', _('Anchor Y on first body'))
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Anchor X on second body'))
      .addParameter('expression', _('Anchor Y on second body'))
      .addParameter('expression', _('Maximum force (non-negative)'))
      .addParameter('expression', _('Maximum torque (non-negative)'))
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addFrictionJoint');

    aut
      .addAction(
        'FrictionJointMaxForce',
        _('Friction joint max force'),
        _('Modify a friction joint maximum force.'),
        _('the maximum force for friction joint _PARAM2_'),
        _('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setFrictionJointMaxForce')
      .setGetter('getFrictionJointMaxForce');

    aut
      .addExpression(
        'FrictionJointMaxForce',
        _('Friction joint max force'),
        _('Friction joint maximum force'),
        _('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getFrictionJointMaxForce');

    aut
      .addAction(
        'FrictionJointMaxTorque',
        _('Friction joint max torque'),
        _('Modify a friction joint maximum torque.'),
        _('the maximum torque for friction joint _PARAM2_'),
        _('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setFrictionJointMaxTorque')
      .setGetter('getFrictionJointMaxTorque');

    aut
      .addExpression(
        'FrictionJointMaxTorque',
        _('Friction joint max torque'),
        _('Friction joint maximum torque'),
        _('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getFrictionJointMaxTorque');

    // Motor joint
    aut
      .addAction(
        'AddMotorJoint',
        _('Add motor joint'),
        _(
          'Add a motor joint between two objects. The position and angle offsets are relative to the first object.'
        ),
        _('Add a motor joint between _PARAM0_ and _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('First object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('objectPtr', _('Second object'), '', false)
      .addParameter('expression', _('Offset X position'))
      .addParameter('expression', _('Offset Y position'))
      .addParameter('expression', _('Offset Angle'))
      .addParameter('expression', _('Maximum force (non-negative)'))
      .addParameter('expression', _('Maximum torque (non-negative)'))
      .addParameter('expression', _('Correction factor (default: 1)'), '', true)
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        _('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        _('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addMotorJoint');

    aut
      .addAction(
        'MotorJointOffset',
        _('Motor joint offset'),
        _('Modify a motor joint offset.'),
        _('Set offset to _PARAM3_;_PARAM4_ for motor joint _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .addParameter('expression', _('Offset X'))
      .addParameter('expression', _('Offset Y'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointOffset');

    aut
      .addExpression(
        'MotorJointOffsetX',
        _('Motor joint offset X'),
        _('Motor joint offset X'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointOffsetX');

    aut
      .addExpression(
        'MotorJointOffsetY',
        _('Motor joint offset Y'),
        _('Motor joint offset Y'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointOffsetY');

    aut
      .addAction(
        'MotorJointAngularOffset',
        _('Motor joint angular offset'),
        _('Modify a motor joint angular offset.'),
        _('the angular offset for motor joint _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointAngularOffset')
      .setGetter('getMotorJointAngularOffset');

    aut
      .addExpression(
        'MotorJointAngularOffset',
        _('Motor joint angular offset'),
        _('Motor joint angular offset'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointAngularOffset');

    aut
      .addAction(
        'MotorJointMaxForce',
        _('Motor joint max force'),
        _('Modify a motor joint maximum force.'),
        _('the maximum force for motor joint _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointMaxForce')
      .setGetter('getMotorJointMaxForce');

    aut
      .addExpression(
        'MotorJointMaxForce',
        _('Motor joint max force'),
        _('Motor joint maximum force'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointMaxForce');

    aut
      .addAction(
        'MotorJointMaxTorque',
        _('Motor joint max torque'),
        _('Modify a motor joint maximum torque.'),
        _('the maximum torque for motor joint _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointMaxTorque')
      .setGetter('getMotorJointMaxTorque');

    aut
      .addExpression(
        'MotorJointMaxTorque',
        _('Motor joint max torque'),
        _('Motor joint maximum torque'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointMaxTorque');

    aut
      .addAction(
        'MotorJointCorrectionFactor',
        _('Motor joint correction factor'),
        _('Modify a motor joint correction factor.'),
        _('the correction factor for motor joint _PARAM2_'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointCorrectionFactor')
      .setGetter('getMotorJointCorrectionFactor');

    aut
      .addExpression(
        'MotorJointCorrectionFactor',
        _('Motor joint correction factor'),
        _('Motor joint correction factor'),
        _('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('expression', _('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointCorrectionFactor');

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
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('objectList', _('Object'), '', false)
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.objectsCollide');

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
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('objectList', _('Object'), '', false)
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.haveObjectsStartedColliding');

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
      .addParameter('behavior', _('Behavior'), 'Physics2Behavior')
      .addParameter('objectList', _('Object'), '', false)
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.haveObjectsStoppedColliding');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    const dummyBehavior = extension
      .getBehaviorMetadata('Physics2::Physics2Behavior')
      .get();
    const sharedData = extension
      .getBehaviorMetadata('Physics2::Physics2Behavior')
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
