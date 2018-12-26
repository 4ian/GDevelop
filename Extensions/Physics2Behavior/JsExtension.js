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
    extension.setExtensionInformation(
      'Physics2',
      'Physics Engine 2.0',
      'Simulate physics',
      'Florian Rival, Franco Maciel',
      'MIT'
    );

    var physics2Behavior = new gd.BehaviorJsImplementation();
    physics2Behavior.updateProperty = function(
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'type') {
        behaviorContent.type = newValue;
        return true;
      }
      if (propertyName === 'bullet') {
        behaviorContent.bullet = newValue === '1';
        return true;
      }
      if (propertyName === 'fixedRotation') {
        behaviorContent.fixedRotation = newValue === '1';
        return true;
      }
      if (propertyName === 'canSleep') {
        behaviorContent.canSleep = newValue === '1';
        return true;
      }
      if (propertyName === 'shape') {
        behaviorContent.shape = newValue;
        return true;
      }
      if (propertyName === 'shapeDimensionA') {
        newValue = parseFloat(newValue);
        if (newValue < 0) newValue = 0;
        behaviorContent.shapeDimensionA = newValue;
        return true;
      }
      if (propertyName === 'shapeDimensionB') {
        newValue = parseFloat(newValue);
        if (newValue < 0) newValue = 0;
        behaviorContent.shapeDimensionB = newValue;
        return true;
      }
      if (propertyName === 'shapeOffsetX') {
        behaviorContent.shapeOffsetX = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'shapeOffsetY') {
        behaviorContent.shapeOffsetY = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'density') {
        newValue = parseFloat(newValue);
        if (newValue < 0) newValue = 0;
        behaviorContent.density = newValue;
        return true;
      }
      if (propertyName === 'friction') {
        newValue = parseFloat(newValue);
        if (newValue < 0) newValue = 0;
        behaviorContent.friction = newValue;
        return true;
      }
      if (propertyName === 'restitution') {
        newValue = parseFloat(newValue);
        if (newValue < 0) newValue = 0;
        behaviorContent.restitution = newValue;
        return true;
      }
      if (propertyName === 'linearDamping') {
        behaviorContent.linearDamping = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'angularDamping') {
        behaviorContent.angularDamping = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'gravityScale') {
        behaviorContent.gravityScale = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'layers') {
        // The given binary string is reverse, fix it
        newValue = newValue
          .split('')
          .reverse()
          .join('');
        // Convert it into a decimal
        newValue = parseInt(newValue, 2);
        // If it can't be converted, cancel the edit
        if (isNaN(newValue)) return false;
        // Layers minimum and maximum values
        if (newValue < 0) newValue = 0;
        if (newValue > 65535) newValue = 65535; // 65535 is the decimal form of 1111111111111111 (16 layer bits flagged)
        // Save the valid decimal
        behaviorContent.layers = newValue;
        return true;
      }
      if (propertyName === 'masks') {
        // Same than layers
        newValue = newValue
          .split('')
          .reverse()
          .join('');
        newValue = parseInt(newValue, 2);
        if (isNaN(newValue)) return false;
        if (newValue < 0) newValue = 0;
        if (newValue > 65535) newValue = 65535;
        behaviorContent.masks = newValue;
        return true;
      }

      return false;
    };
    physics2Behavior.getProperties = function(behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties.set(
        'type',
        new gd.PropertyDescriptor(behaviorContent.type)
          .setType('Choice')
          .setLabel('Type')
          .addExtraInfo('Static')
          .addExtraInfo('Dynamic')
          .addExtraInfo('Kinematic')
      );
      behaviorProperties.set(
        'bullet',
        new gd.PropertyDescriptor(behaviorContent.bullet ? 'true' : 'false')
          .setType('Boolean')
          .setLabel('Bullet')
      );
      behaviorProperties.set(
        'fixedRotation',
        new gd.PropertyDescriptor(
          behaviorContent.fixedRotation ? 'true' : 'false'
        )
          .setType('Boolean')
          .setLabel('Fixed Rotation')
      );
      behaviorProperties.set(
        'canSleep',
        new gd.PropertyDescriptor(behaviorContent.canSleep ? 'true' : 'false')
          .setType('Boolean')
          .setLabel('Can Sleep')
      );
      behaviorProperties.set(
        'shape',
        new gd.PropertyDescriptor(behaviorContent.shape)
          .setType('Choice')
          .setLabel('Shape')
          .addExtraInfo('Box')
          .addExtraInfo('Circle')
          // .addExtraInfo("Polygon") Needs an editor to be useful
          .addExtraInfo('Edge')
      );
      behaviorProperties.set(
        'shapeDimensionA',
        new gd.PropertyDescriptor(behaviorContent.shapeDimensionA.toString(10))
          .setType('Number')
          .setLabel('Shape Dimension A')
      );
      behaviorProperties.set(
        'shapeDimensionB',
        new gd.PropertyDescriptor(behaviorContent.shapeDimensionB.toString(10))
          .setType('Number')
          .setLabel('Shape Dimension B')
      );
      behaviorProperties.set(
        'shapeOffsetX',
        new gd.PropertyDescriptor(behaviorContent.shapeOffsetX.toString(10))
          .setType('Number')
          .setLabel('Shape Offset X')
      );
      behaviorProperties.set(
        'shapeOffsetY',
        new gd.PropertyDescriptor(behaviorContent.shapeOffsetY.toString(10))
          .setType('Number')
          .setLabel('Shape Offset Y')
      );
      behaviorProperties.set(
        'density',
        new gd.PropertyDescriptor(behaviorContent.density.toString(10))
          .setType('Number')
          .setLabel('Density')
      );
      behaviorProperties.set(
        'friction',
        new gd.PropertyDescriptor(behaviorContent.friction.toString(10))
          .setType('Number')
          .setLabel('Friction')
      );
      behaviorProperties.set(
        'restitution',
        new gd.PropertyDescriptor(behaviorContent.restitution.toString(10))
          .setType('Number')
          .setLabel('Restitution')
      );
      behaviorProperties.set(
        'linearDamping',
        new gd.PropertyDescriptor(behaviorContent.linearDamping.toString(10))
          .setType('Number')
          .setLabel('Linear Damping')
      );
      behaviorProperties.set(
        'angularDamping',
        new gd.PropertyDescriptor(behaviorContent.angularDamping.toString(10))
          .setType('Number')
          .setLabel('Angular Damping')
      );
      behaviorProperties.set(
        'gravityScale',
        new gd.PropertyDescriptor(behaviorContent.gravityScale.toString(10))
          .setType('Number')
          .setLabel('Gravity Scale')
      );

      // Waiting for a layers/masks editor
      /*
      // Transform the layers number into a binary string
      var layers = behaviorContent.layers.toString(2);
      // Reverse the string (so the first layer bit is shown at the left)
      layers = layers
        .split('')
        .reverse()
        .join('');
      // Add zeros until the total size is 16
      if (layers.length < 16) layers = layers + '0'.repeat(16 - layers.length);
      // Expose the converted string
      behaviorProperties.set(
        'layers',
        new gd.PropertyDescriptor(layers).setLabel('Layers')
      );
      // Same than layers
      var masks = behaviorContent.masks.toString(2);
      masks = masks
        .split('')
        .reverse()
        .join('');
      if (masks.length < 16) masks = masks + '0'.repeat(16 - masks.length);
      behaviorProperties.set(
        'masks',
        new gd.PropertyDescriptor(masks).setLabel('Masks')
      );
      */

      return behaviorProperties;
    };
    physics2Behavior.setRawJSONContent(
      JSON.stringify({
        type: 'Dynamic',
        bullet: false,
        fixedRotation: false,
        canSleep: true,
        shape: 'Box',
        shapeDimensionA: 0,
        shapeDimensionB: 0,
        shapeOffsetX: 0,
        shapeOffsetY: 0,
        density: 1.0,
        friction: 0.3,
        restitution: 0.1,
        linearDamping: 0.1,
        angularDamping: 0.1,
        gravityScale: 1,
        layers: 1,
        masks: 1,
      })
    );

    var sharedData = new gd.BehaviorSharedDataJsImplementation();
    sharedData.updateProperty = function(
      sharedContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'gravityX') {
        sharedContent.gravityX = parseInt(newValue, 10);
        return true;
      }
      if (propertyName === 'gravityY') {
        sharedContent.gravityY = parseInt(newValue, 10);
        return true;
      }
      if (propertyName === 'scaleX') {
        newValue = parseInt(newValue, 10);
        if (newValue <= 0) newValue = 1;
        sharedContent.scaleX = newValue;
        return true;
      }
      if (propertyName === 'scaleY') {
        newValue = parseInt(newValue, 10);
        if (newValue <= 0) newValue = 1;
        sharedContent.scaleY = newValue;
        return true;
      }

      return false;
    };
    sharedData.getProperties = function(sharedContent) {
      var sharedProperties = new gd.MapStringPropertyDescriptor();

      sharedProperties.set(
        'gravityX',
        new gd.PropertyDescriptor(sharedContent.gravityX.toString(10)).setType(
          'Number'
        )
      );
      sharedProperties.set(
        'gravityY',
        new gd.PropertyDescriptor(sharedContent.gravityY.toString(10)).setType(
          'Number'
        )
      );
      sharedProperties.set(
        'scaleX',
        new gd.PropertyDescriptor(sharedContent.scaleX.toString(10)).setType(
          'Number'
        )
      );
      sharedProperties.set(
        'scaleY',
        new gd.PropertyDescriptor(sharedContent.scaleY.toString(10)).setType(
          'Number'
        )
      );

      return sharedProperties;
    };
    sharedData.setRawJSONContent(
      JSON.stringify({
        gravityX: 0,
        gravityY: 9.8,
        scaleX: 100,
        scaleY: 100,
      })
    );

    var aut = extension
      // extension
      .addBehavior(
        'Physics2Behavior',
        t('Physics Engine 2.0 (beta)'),
        'Physics2Behavior',
        t('Simulate physics, the successor of the old physics behavior'),
        '',
        'res/physics32.png',
        'Physics2Behavior',
        physics2Behavior,
        sharedData
      )
      .setIncludeFile('Extensions/Physics2Behavior/physics2runtimebehavior.js')
      .addIncludeFile('Extensions/Physics2Behavior/box2d.js');

    // Global
    aut
      .addCondition(
        'GravityX',
        t('Gravity X'),
        t('Test the world gravity on X.'),
        t('Gravity on X is _PARAM2__PARAM3_'),
        t('Global'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getGravityX')
      .setManipulatedType('number');

    aut
      .addExpression(
        'GravityX',
        t('Gravity X'),
        t('Gravity X'),
        t('Global'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getGravityX');

    aut
      .addCondition(
        'GravityY',
        t('Gravity Y'),
        t('Test the world gravity on Y.'),
        t('Gravity on Y is _PARAM2__PARAM3_'),
        t('Global'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getGravityY')
      .setManipulatedType('number');

    aut
      .addExpression(
        'GravityY',
        t('Gravity Y'),
        t('Gravity Y'),
        t('Global'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getGravityY');

    aut
      .addAction(
        'Gravity',
        t('Gravity'),
        t('Modify the world gravity.'),
        t('Set the gravity to _PARAM2_;_PARAM3_'),
        t('Global'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Gravity X'))
      .addParameter('expression', t('Gravity Y'))
      .getCodeExtraInformation()
      .setFunctionName('setGravity');

    aut
      .addCondition(
        'TimeScale',
        t('Time scale'),
        t('Test the world time scale.'),
        t('Time scale is _PARAM2__PARAM3_'),
        t('Global'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getTimeScale')
      .setManipulatedType('number');

    // This action has to be owned by the extension to run only once per objects list, not per instance
    extension
      .addAction(
        'TimeScale',
        t('Time scale'),
        t('Modify the world time scale.'),
        t('Set the world time scale to _PARAM2_'),
        t('Global'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('objectList', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.setTimeScale');

    aut
      .addExpression(
        'TimeScale',
        t('Time scale'),
        t('Time scale'),
        t('Global'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getTimeScale');

    // Dynamics
    aut
      .addCondition(
        'IsDynamic',
        t('Is dynamic'),
        t('Test if an object is dynamic.'),
        t('_PARAM0_ is dynamic'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isDynamic');

    aut
      .addAction(
        'SetDynamic',
        t('Set as dynamic'),
        t(
          'Set an object as dynamic. Is affected by gravity, forces and velocities.'
        ),
        t('Set _PARAM0_ as dynamic'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setDynamic');

    aut
      .addCondition(
        'IsStatic',
        t('Is static'),
        t('Test if an object is static.'),
        t('_PARAM0_ is static'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isStatic');

    aut
      .addAction(
        'SetStatic',
        t('Set as static'),
        t(
          "Set an object as static. Is not affected by gravity, and can't be moved by forces or velocities at all."
        ),
        t('Set _PARAM0_ as static'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setStatic');

    aut
      .addCondition(
        'IsKinematic',
        t('Is kinematic'),
        t('Test if an object is kinematic.'),
        t('_PARAM0_ is kinematic'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isKinematic');

    aut
      .addAction(
        'SetKinematic',
        t('Set as kinematic'),
        t(
          'Set an object as kinematic. Is like a static body but can be moved through its velocity.'
        ),
        t('Set _PARAM0_ as kinematic'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('setKinematic');

    aut
      .addCondition(
        'IsBullet',
        t('Is treat as bullet'),
        t('Test if an object is being treat as a bullet.'),
        t('_PARAM0_ is bullet'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isBullet');

    aut
      .addAction(
        'SetBullet',
        t('Treat as bullet'),
        t(
          'Treat the object as a bullet. Better collision handling on high speeds at cost of some performance.'
        ),
        t('Treat _PARAM0_ as bullet: _PARAM2_'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', t('Treat as bullet?'), '', false)
      .setDefaultValue('false')
      .getCodeExtraInformation()
      .setFunctionName('setBullet');

    aut
      .addCondition(
        'HasFixedRotation',
        t('Has fixed rotation'),
        t('Test if an object has fixed rotation.'),
        t('_PARAM0_ has fixed rotation'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('hasFixedRotation');

    aut
      .addAction(
        'SetFixedRotation',
        t('Fixed rotation'),
        t(
          "Enable or disable an object fixed rotation. If enabled the object won't be able to rotate."
        ),
        t('Set _PARAM0_ fixed rotation: _PARAM2_'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', t('Fixed rotation?'), '', false)
      .setDefaultValue('false')
      .getCodeExtraInformation()
      .setFunctionName('setFixedRotation');

    aut
      .addCondition(
        'IsSleepingAllowed',
        t('Is sleeping allowed'),
        t('Test if an object can sleep.'),
        t('_PARAM0_ can sleep'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isSleepingAllowed');

    aut
      .addAction(
        'SetSleepingaAllowed',
        t('Sleeping allowed'),
        t(
          'Allow or not an object to sleep. If enabled the object will be able to sleep, improving performance for non-currently-moving objects.'
        ),
        t('Allow _PARAM0_ to sleep: _PARAM2_'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('yesorno', t('Can sleep?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('setSleepingAllowed');

    aut
      .addCondition(
        'IsSleeping',
        t('Is sleeping'),
        t('Test if an object is sleeping.'),
        t('_PARAM0_ is sleeping'),
        t('Dynamics'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('isSleeping');

    // Body settings
    aut
      .addAction(
        'ShapeScale',
        t('Shape scale'),
        t(
          'Modify an object shape scale. It affects custom shape dimensions and shape offset, if custom dimensions are not set the body will be scaled automatically to the object size.'
        ),
        t('Do to _PARAM2__PARAM3_ to the shape scale of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setShapeScale')
      .setManipulatedType('number')
      .setGetter('getShapeScale');

    aut
      .addCondition(
        'Density',
        t('Density'),
        t('Test an object density.'),
        t('_PARAM0_ density is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getDensity')
      .setManipulatedType('number');

    aut
      .addAction(
        'Density',
        t('Density'),
        t(
          "Modify an object density. The body's density and volume determine its mass."
        ),
        t('Do _PARAM2__PARAM3_ to the density of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (non-negative)'))
      .getCodeExtraInformation()
      .setFunctionName('setDensity')
      .setManipulatedType('number')
      .setGetter('getDensity');

    aut
      .addCondition(
        'Friction',
        t('Friction'),
        t('Test an object friction.'),
        t('_PARAM0_ friction is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getFriction')
      .setManipulatedType('number');

    aut
      .addAction(
        'Friction',
        t('Friction'),
        t(
          "Modify an object friction. How much energy is lost from the movement of one object over another. The combined friction from two bodies is calculated as 'sqrt(bodyA.friction * bodyB.friction)'."
        ),
        t('Do _PARAM2__PARAM3_ to the friction of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (non-negative)'))
      .getCodeExtraInformation()
      .setFunctionName('setFriction')
      .setManipulatedType('number')
      .setGetter('getFriction');

    aut
      .addCondition(
        'Restitution',
        t('Restitution'),
        t('Test an object restitution.'),
        t('_PARAM0_ restitution is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getRestitution')
      .setManipulatedType('number');

    aut
      .addAction(
        'Restitution',
        t('Restitution'),
        t(
          "Modify an object restitution. Energy conservation on collision. The combined restitution from two bodies is calculated as 'max(bodyA.restitution, bodyB.restitution)'."
        ),
        t('Do _PARAM2__PARAM3_ to the restitution of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (non-negative)'))
      .getCodeExtraInformation()
      .setFunctionName('setRestitution')
      .setManipulatedType('number')
      .setGetter('getRestitution');

    aut
      .addCondition(
        'LinearDamping',
        t('Linear damping'),
        t('Test an object linear damping.'),
        t('_PARAM0_ linear damping is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getLinearDamping')
      .setManipulatedType('number');

    aut
      .addAction(
        'LinearDamping',
        t('Linear damping'),
        t(
          'Modify an object linear damping. How much movement speed is lost across the time.'
        ),
        t('Do _PARAM2__PARAM3_ to the linear damping of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setLinearDamping')
      .setManipulatedType('number')
      .setGetter('getLinearDamping');

    aut
      .addCondition(
        'AngularDamping',
        t('Angular damping'),
        t('Test an object angular damping.'),
        t('_PARAM0_ angular damping is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getAngularDamping')
      .setManipulatedType('number');

    aut
      .addAction(
        'AngularDamping',
        t('Angular damping'),
        t(
          'Modify an object angular damping. How much angular speed is lost across the time.'
        ),
        t('Do _PARAM2__PARAM3_ to the angular damping of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setAngularDamping')
      .setManipulatedType('number')
      .setGetter('getAngularDamping');

    aut
      .addCondition(
        'GravityScale',
        t('Gravity scale'),
        t('Test an object gravity scale.'),
        t('_PARAM0_ gravity scale is _PARAM2__PARAM3_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getGravityScale')
      .setManipulatedType('number');

    aut
      .addAction(
        'GravityScale',
        t('Gravity scale'),
        t(
          'Modify an object gravity scale. The gravity applied to an object is the world gravity multiplied by the object gravity scale.'
        ),
        t('Do _PARAM2__PARAM3_ to the gravity scale of _PARAM0_'),
        t('Body settings'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setGravityScale')
      .setManipulatedType('number')
      .setGetter('getGravityScale');

    // Filtering
    aut
      .addCondition(
        'LayerEnabled',
        t('Layer enabled'),
        t('Test if an object has a specific layer enabled.'),
        t('_PARAM0_ has layer _PARAM2_ enabled'),
        t('Filtering'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Layer (1 - 16)'))
      .getCodeExtraInformation()
      .setFunctionName('layerEnabled');

    aut
      .addAction(
        'EnableLayer',
        t('Enable layer'),
        t(
          'Enable or disable a layer for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
        ),
        t('Enable layer _PARAM2_ for _PARAM0_: _PARAM3_'),
        t('Filtering'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Layer (1 - 16)'))
      .addParameter('yesorno', t('Enable?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('enableLayer');

    aut
      .addCondition(
        'MaskEnabled',
        t('Mask enabled'),
        t('Test if an object has a specific mask enabled.'),
        t('_PARAM0_ has mask _PARAM2_ enabled'),
        t('Filtering'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Mask (1 - 16)'))
      .getCodeExtraInformation()
      .setFunctionName('maskEnabled');

    aut
      .addAction(
        'EnableMask',
        t('Enable mask'),
        t(
          'Enable or disable a mask for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa.'
        ),
        t('Enable mask _PARAM2_ for _PARAM0_: _PARAM3_'),
        t('Filtering'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Mask (1 - 16)'))
      .addParameter('yesorno', t('Enable?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setFunctionName('enableMask');

    // Velocity
    aut
      .addCondition(
        'LinearVelocityX',
        t('Linear velocity X'),
        t('Test an object linear velocity on X.'),
        t('Linear velocity on X of _PARAM0_ is _PARAM2__PARAM3_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityX')
      .setManipulatedType('number');

    aut
      .addAction(
        'LinearVelocityX',
        t('Linear velocity X'),
        t('Modify an object linear velocity on X.'),
        t('Do _PARAM2__PARAM3_ to the linear velocity on X of _PARAM0_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (pixels/second)'))
      .getCodeExtraInformation()
      .setFunctionName('setLinearVelocityX')
      .setManipulatedType('number')
      .setGetter('getLinearVelocityX');

    aut
      .addCondition(
        'LinearVelocityY',
        t('Linear velocity Y'),
        t('Test an object linear velocity on Y.'),
        t('Linear velocity on Y of _PARAM0_ is _PARAM2__PARAM3_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityY')
      .setManipulatedType('number');

    aut
      .addAction(
        'LinearVelocityY',
        t('Linear velocity Y'),
        t('Modify an object linear velocity on Y.'),
        t('Do _PARAM2__PARAM3_ to the linear velocity on Y of _PARAM0_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (pixels/second)'))
      .getCodeExtraInformation()
      .setFunctionName('setLinearVelocityY')
      .setManipulatedType('number')
      .setGetter('getLinearVelocityY');

    aut
      .addCondition(
        'LinearVelocityLength',
        t('Linear velocity length'),
        t('Test an object linear velocity length.'),
        t('Linear velocity length of _PARAM0_ is _PARAM2__PARAM3_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getLinearVelocityLength')
      .setManipulatedType('number');

    aut
      .addCondition(
        'AngularVelocity',
        t('Angular velocity'),
        t('Test an object angular velocity.'),
        t('Angular velocity of _PARAM0_ is _PARAM2__PARAM3_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getAngularVelocity')
      .setManipulatedType('number');

    aut
      .addAction(
        'AngularVelocity',
        t('Angular velocity'),
        t('Modify an object angular velocity.'),
        t('Do _PARAM2__PARAM3_ to the angular velocity of _PARAM0_'),
        t('Velocity'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value (º/s)'))
      .getCodeExtraInformation()
      .setFunctionName('setAngularVelocity')
      .setManipulatedType('number')
      .setGetter('getAngularVelocity');

    // Forces and impulses
    aut
      .addAction(
        'ApplyForce',
        t('Apply force'),
        t(
          "Apply a force to the object. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t('Apply to _PARAM0_ a force of _PARAM2_;_PARAM3_'),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('X component (N)'))
      .addParameter('expression', t('Y component (N)'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyForce');

    aut
      .addAction(
        'ApplyPolarForce',
        t('Apply polar force'),
        t(
          "Apply a force to the object using polar coordinates. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t('Apply to _PARAM0_ a force of angle _PARAM2_ and length _PARAM3_'),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Angle'))
      .addParameter('expression', t('Length (N)'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyPolarForce');

    aut
      .addAction(
        'ApplyForceTowardPosition',
        t('Apply force toward position'),
        t(
          "Apply a force to the object to move it toward a position. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t(
          'Apply to _PARAM0_ a force of length _PARAM2_ towards _PARAM3_;_PARAM4_'
        ),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Length (N)'))
      .addParameter('expression', t('X position'))
      .addParameter('expression', t('Y position'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyForceTowardPosition');

    aut
      .addAction(
        'ApplyImpulse',
        t('Apply impulse'),
        t(
          "Apply an impulse to the object. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t('Apply to _PARAM0_ an impulse of _PARAM2_;_PARAM3_'),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('X component (N.m)'))
      .addParameter('expression', t('Y component (N.m)'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyImpulse');

    aut
      .addAction(
        'ApplyPolarImpulse',
        t('Apply polar impulse'),
        t(
          "Apply an impulse to the object using polar coordinates. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t(
          'Apply to _PARAM0_ an impulse of angle _PARAM2_ and length _PARAM3_ (applied at _PARAM4_;_PARAM5_)'
        ),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Angle'))
      .addParameter('expression', t('Length (N.m)'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyPolarImpulse');

    aut
      .addAction(
        'ApplyImpulseTowardPosition',
        t('Apply impulse toward position'),
        t(
          "Apply an impulse to the object to move it toward a position. You've to specify the applying point (you can get the body mass center through expressions)."
        ),
        t(
          'Apply to _PARAM0_ an impulse of length _PARAM2_ towards _PARAM3_;_PARAM4_ (applied at _PARAM5_;_PARAM6_)'
        ),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Length (N.m)'))
      .addParameter('expression', t('X position'))
      .addParameter('expression', t('Y position'))
      .addParameter('expression', t('Applying X position'))
      .addParameter('expression', t('Applying Y position'))
      .getCodeExtraInformation()
      .setFunctionName('applyImpulseTowardPosition');

    aut
      .addAction(
        'ApplyTorque',
        t('Apply torque'),
        t('Apply a torque to the object.'),
        t('Apply to _PARAM0_ a torque of _PARAM2_'),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Torque (N.m)'))
      .getCodeExtraInformation()
      .setFunctionName('applyTorque');

    aut
      .addAction(
        'ApplyAngularImpulse',
        t('Apply angular impulse'),
        t('Apply an angular impulse to the object.'),
        t('Apply to _PARAM0_ an angular impulse of _PARAM2_'),
        t('Forces & impulses'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Angular impulse (N.m.s'))
      .getCodeExtraInformation()
      .setFunctionName('applyAngularImpulse');

    aut
      .addExpression(
        'MassCenterX',
        t('Mass center X'),
        t('Mass center X'),
        t(''),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getMassCenterX');

    aut
      .addExpression(
        'MassCenterY',
        t('Mass center Y'),
        t('Mass center Y'),
        t(''),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .getCodeExtraInformation()
      .setFunctionName('getMassCenterY');

    // Joints
    aut
      .addCondition(
        'JointFirstObject',
        t('Joint first object'),
        t('Test if an object is the first object on a joint.'),
        t('_PARAM0_ is the first object for joint _PARAM2_'),
        t('Joints'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isJointFirstObject');

    aut
      .addCondition(
        'JointSecondObject',
        t('Joint second object'),
        t('Test if an object is the second object on a joint.'),
        t('_PARAM0_ is the second object for joint _PARAM2_'),
        t('Joints'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isJointSecondObject');

    aut
      .addExpression(
        'JointFirstAnchorX',
        t('Joint first anchor X'),
        t('Joint first anchor X'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointFirstAnchorX');

    aut
      .addExpression(
        'JointFirstAnchorY',
        t('Joint first anchor Y'),
        t('Joint first anchor Y'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointFirstAnchorY');

    aut
      .addExpression(
        'JointSecondAnchorX',
        t('Joint second anchor X'),
        t('Joint second anchor X'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointSecondAnchorX');

    aut
      .addExpression(
        'JointSecondAnchorY',
        t('Joint second anchor Y'),
        t('Joint second anchor Y'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointSecondAnchorY');

    aut
      .addCondition(
        'JointReactionForce',
        t('Joint reaction force'),
        t('Test a joint reaction force.'),
        t('Joint _PARAM2_ reaction force is _PARAM3__PARAM4_'),
        t('Joints'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionForce')
      .setManipulatedType('number');

    aut
      .addExpression(
        'JointReactionForce',
        t('Joint reaction force'),
        t('Joint reaction force'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionForce');

    aut
      .addCondition(
        'JointReactionTorque',
        t('Joint reaction torque'),
        t('Test a joint reaction torque.'),
        t('Joint _PARAM2_ reaction torque is _PARAM3__PARAM4_'),
        t('Joints'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionTorque')
      .setManipulatedType('number');

    aut
      .addExpression(
        'JointReactionTorque',
        t('Joint reaction torque'),
        t('Joint reaction torque'),
        t('Joints'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getJointReactionTorque');

    aut
      .addAction(
        'Remove joint',
        t('Remove joint'),
        t('Remove a joint from the scene.'),
        t('Remove joint _PARAM2_'),
        t('Joints'),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('removeJoint');

    // Distance joint
    aut
      .addAction(
        'AddDistanceJoint',
        t('Add distance joint'),
        t(
          'Add a distance joint between two objects. The length is converted to meters using the world scale on X. The frequency and damping ratio are related to the joint speed of oscillation and how fast it stops.'
        ),
        t('Add a distance joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter(
        'expression',
        t('Length (-1 to use current objects distance) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        t('Frequency (Hz) (non-negative) (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addDistanceJoint');

    aut
      .addAction(
        'DistanceJointLength',
        t('Distance joint length'),
        t('Modify a distance joint length.'),
        t('Do _PARAM3__PARAM4_ to the length for distance joint _PARAM2_'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointLength')
      .setManipulatedType('number')
      .setGetter('getDistanceJointLength');

    aut
      .addExpression(
        'DistanceJointLength',
        t('Distance joint length'),
        t('Distance joint length'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointLength');

    aut
      .addAction(
        'DistanceJointFrequency',
        t('Distance joint frequency'),
        t('Modify a distance joint frequency.'),
        t('Do _PARAM3__PARAM4_ to the frequency for distance joint _PARAM2_'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointFrequency')
      .setManipulatedType('number')
      .setGetter('getDistanceJointFrequency');

    aut
      .addExpression(
        'DistanceJointFrequency',
        t('Distance joint frequency'),
        t('Distance joint frequency'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointFrequency');

    aut
      .addAction(
        'DistanceJointDampingRatio',
        t('Distance joint damping ratio'),
        t('Modify a distance joint damping ratio.'),
        t(
          'Do _PARAM3__PARAM4_ to the damping ratio for distance joint _PARAM2_'
        ),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint24.png',
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setDistanceJointDampingRatio')
      .setManipulatedType('number')
      .setGetter('getDistanceJointDampingRatio');

    aut
      .addExpression(
        'DistanceJointDampingRatio',
        t('Distance joint damping ratio'),
        t('Distance joint damping ratio'),
        t('Joints/Distance'),
        'JsPlatform/Extensions/distance_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getDistanceJointDampingRatio');

    // Revolute joint
    aut
      .addAction(
        'AddRevoluteJoint',
        t('Add revolute joint'),
        t(
          'Add a revolute joint to an object at a fixed point. The object is attached as the second object in the joint, so you can use this for gear joints.'
        ),
        t('Add a revolute joint to _PARAM0_ at _PARAM2_;_PARAM3_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('X anchor'))
      .addParameter('expression', t('Y anchor'))
      .addParameter(
        'yesorno',
        t('Enable angle limits? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter('expression', t('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', t('Minimum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', t('Maximum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', t('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', t('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Motor maximum torque (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRevoluteJoint');

    aut
      .addAction(
        'AddRevoluteJointBetweenTwoBodies',
        t('Add revolute joint between two bodies'),
        t(
          'Add a revolute joint between two objects. The reference angle determines what is considered as the base angle at the initial state.'
        ),
        t('Add a revolute joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter(
        'yesorno',
        t('Enable angle limits? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter('expression', t('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', t('Minimum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('expression', t('Maximum angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', t('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', t('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Motor maximum torque (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRevoluteJointBetweenTwoBodies');

    aut
      .addExpression(
        'RevoluteJointReferenceAngle',
        t('Revolute joint reference angle'),
        t('Revolute joint reference angle'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointReferenceAngle');

    aut
      .addExpression(
        'RevoluteJointAngle',
        t('Revolute joint current angle'),
        t('Revolute joint current angle'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointAngle');

    aut
      .addExpression(
        'RevoluteJointSpeed',
        t('Revolute joint angular speed'),
        t('Revolute joint angular speed'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointSpeed');

    aut
      .addCondition(
        'RevoluteJointLimitsEnabled',
        t('Revolute joint limits enabled'),
        t('Test if a revolute joint limits are enabled.'),
        t('Limits for revolute joint _PARAM2_ are enabled'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isRevoluteJointLimitsEnabled');

    aut
      .addAction(
        'EnableRevoluteJointLimits',
        t('Enable revolute joint limits'),
        t('Enable or disable a revolute joint angle limits.'),
        t('Enable limits for revolute joint _PARAM2_: _PARAM3_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('yesorno', t('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableRevoluteJointLimits');

    aut
      .addAction(
        'RevoluteJointLimits',
        t('Revolute joint limits'),
        t('Modify a revolute joint angle limits.'),
        t('Set the limits to _PARAM3_;_PARAM4_ for revolute joint _PARAM2_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('expression', t('Minimum angle'))
      .addParameter('expression', t('Maximum angle'))
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointLimits');

    aut
      .addExpression(
        'RevoluteJointMinAngle',
        t('Revolute joint minimum angle'),
        t('Revolute joint minimum angle'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMinAngle');

    aut
      .addExpression(
        'RevoluteJointMaxAngle',
        t('Revolute joint maximum angle'),
        t('Revolute joint maximum angle'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMaxAngle');

    aut
      .addCondition(
        'RevoluteJointMotorEnabled',
        t('Revolute joint motor enabled'),
        t('Test if a revolute joint motor is enabled.'),
        t('Motor of revolute joint _PARAM2_ is enabled'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isRevoluteJointMotorEnabled');

    aut
      .addAction(
        'EnableRevoluteJointMotor',
        t('Enable revolute joint motor'),
        t('Enable or disable a revolute joint motor.'),
        t('Enable motor for revolute joint _PARAM2_: _PARAM3_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('yesorno', t('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableRevoluteJointMotor');

    aut
      .addAction(
        'RevoluteJointMotorSpeed',
        t('Revolute joint motor speed'),
        t('Modify a revolute joint motor speed.'),
        t('Do _PARAM3__PARAM4_ to the motor speed for revolute joint _PARAM2_'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointMotorSpeed')
      .setManipulatedType('number')
      .setGetter('getRevoluteJointMotorSpeed');

    aut
      .addExpression(
        'RevoluteJointMotorSpeed',
        t('Revolute joint motor speed'),
        t('Revolute joint motor speed'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMotorSpeed');

    aut
      .addAction(
        'RevoluteJointMaxMotorTorque',
        t('Revolute joint max motor torque'),
        t('Modify a revolute joint maximum motor torque.'),
        t(
          'Do _PARAM3__PARAM4_ to the maximum motor torque for revolute joint _PARAM2_'
        ),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint24.png',
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setRevoluteJointMaxMotorTorque')
      .setManipulatedType('number')
      .setGetter('getRevoluteJointMaxMotorTorque');

    aut
      .addExpression(
        'RevoluteJointMaxMotorTorque',
        t('Revolute joint max motor torque'),
        t('Revolute joint Maximum motor torque'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMaxMotorTorque');

    aut
      .addExpression(
        'RevoluteJointMotorTorque',
        t('Revolute joint motor torque'),
        t('Revolute joint motor torque'),
        t('Joints/Revolute'),
        'JsPlatform/Extensions/revolute_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRevoluteJointMotorTorque');

    // Prismatic joint
    aut
      .addAction(
        'AddPrismaticJoint',
        t('Add prismatic joint'),
        t(
          'Add a prismatic joint between two objects. The translation limits are converted to meters using the world scale on X.'
        ),
        t('Add a prismatic joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter('expression', t('Axis angle'))
      .addParameter('expression', t('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', t('Enable limits? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter(
        'expression',
        t('Minimum translation (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Maximum translation (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter('yesorno', t('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', t('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Motor maximum force (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addPrismaticJoint');

    aut
      .addExpression(
        'PrismaticJointAxisAngle',
        t('Prismatic joint axis angle'),
        t('Prismatic joint axis angle'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointAxisAngle');

    aut
      .addExpression(
        'PrismaticJointReferenceAngle',
        t('Prismatic joint reference angle'),
        t('Prismatic joint reference angle'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointReferenceAngle');

    aut
      .addExpression(
        'PrismaticJointTranslation',
        t('Prismatic joint current translation'),
        t('Prismatic joint current translation'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointTranslation');

    aut
      .addExpression(
        'PrismaticJointSpeed',
        t('Prismatic joint current speed'),
        t('Prismatic joint speed'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointSpeed');

    aut
      .addCondition(
        'PrismaticJointLimitsEnabled',
        t('Prismatic joint limits enabled'),
        t('Test if a prismatic joint limits are enabled.'),
        t('Limits for prismatic joint _PARAM2_ are enabled'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isPrismaticJointLimitsEnabled');

    aut
      .addAction(
        'EnablePrismaticJointLimits',
        t('Enable prismatic joint limits'),
        t('Enable or disable a prismatic joint limits.'),
        t('Enable limits for prismatic joint _PARAM2_: _PARAM3_'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('yesorno', t('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enablePrismaticJointLimits');

    aut
      .addAction(
        'PrismaticJointLimits',
        t('Prismatic joint limits'),
        t('Modify a prismatic joint limits.'),
        t('Set the limits to _PARAM3_;_PARAM4_ for prismatic joint _PARAM2_'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('expression', t('Minimum translation'))
      .addParameter('expression', t('Maximum translation'))
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointLimits');

    aut
      .addExpression(
        'PrismaticJointMinTranslation',
        t('Prismatic joint minimum translation'),
        t('Prismatic joint minimum translation'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMinTranslation');

    aut
      .addExpression(
        'PrismaticJointMaxTranslation',
        t('Prismatic joint maximum translation'),
        t('Prismatic joint maximum translation'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMaxTranslation');

    aut
      .addCondition(
        'PrismaticJointMotorEnabled',
        t('Prismatic joint motor enabled'),
        t('Test if a prismatic joint motor is enabled.'),
        t('Motor for prismatic joint _PARAM2_ is enabled'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isPrismaticJointMotorEnabled');

    aut
      .addAction(
        'EnablePrismaticJointMotor',
        t('Enable prismatic joint motor'),
        t('Enable or disable a prismatic joint motor.'),
        t('Enable motor for prismatic joint _PARAM2_: _PARAM3_'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('yesorno', t('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enablePrismaticJointMotor');

    aut
      .addAction(
        'PrismaticJointMotorSpeed',
        t('Prismatic joint motor speed'),
        t('Modify a prismatic joint motor speed.'),
        t(
          'Do _PARAM3__PARAM4_ to the motor force for prismatic joint _PARAM2_'
        ),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointMotorSpeed')
      .setManipulatedType('number')
      .setGetter('getPrismaticJointMotorSpeed');

    aut
      .addExpression(
        'PrismaticJointMotorSpeed',
        t('Prismatic joint motor speed'),
        t('Prismatic joint motor speed'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMotorSpeed');

    aut
      .addAction(
        'PrismaticJointMaxMotorForce',
        t('Prismatic joint max motor force'),
        t('Modify a prismatic joint maximum motor force.'),
        t(
          'Do _PARAM3__PARAM4_ to the maximum motor force for prismatic joint _PARAM2_'
        ),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint24.png',
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setPrismaticJointMaxMotorForce')
      .setManipulatedType('number')
      .setGetter('getPrismaticJointMaxMotorForce');

    aut
      .addExpression(
        'PrismaticJointMaxMotorForce',
        t('Prismatic joint max motor force'),
        t('Prismatic joint maximum motor force'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMaxMotorForce');

    aut
      .addExpression(
        'PrismaticJointMotorForce',
        t('Prismatic joint motor force'),
        t('Prismatic joint motor force'),
        t('Joints/Prismatic'),
        'JsPlatform/Extensions/prismatic_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPrismaticJointMotorForce');

    // Pulley joint
    aut
      .addAction(
        'AddPulleyJoint',
        t('Add pulley joint'),
        t(
          'Add a pulley joint between two objects. Lengths are converted to meters using the world scale on X.'
        ),
        t('Add a pulley joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint24.png',
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter('expression', t('Ground anchor X for first object'))
      .addParameter('expression', t('Ground anchor Y for first object'))
      .addParameter('expression', t('Ground anchor X for second object'))
      .addParameter('expression', t('Ground anchor Y for second object'))
      .addParameter(
        'expression',
        t('Length for first object (-1 to use anchor positions) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        t(
          'Length for second object (-1 to use anchor positions) (default: -1)'
        ),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        t('Ratio (non-negative) (default: 1'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addPulleyJoint');

    aut
      .addExpression(
        'PulleyJointFirstGroundAnchorX',
        t('Pulley joint first ground anchor X'),
        t('Pulley joint first ground anchor X'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstGroundAnchorX');

    aut
      .addExpression(
        'PulleyJointFirstGroundAnchorY',
        t('Pulley joint first ground anchor Y'),
        t('Pulley joint first ground anchor Y'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstGroundAnchorY');

    aut
      .addExpression(
        'PulleyJointSecondGroundAnchorX',
        t('Pulley joint second ground anchor X'),
        t('Pulley joint second ground anchor X'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondGroundAnchorX');

    aut
      .addExpression(
        'PulleyJointSecondGroundAnchorY',
        t('Pulley joint second ground anchor Y'),
        t('Pulley joint second ground anchor Y'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondGroundAnchorY');

    aut
      .addExpression(
        'PulleyJointFirstLength',
        t('Pulley joint first length'),
        t('Pulley joint first length'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointFirstLength');

    aut
      .addExpression(
        'PulleyJointSecondLength',
        t('Pulley joint second length'),
        t('Pulley joint second length'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointSecondLength');

    aut
      .addExpression(
        'PulleyJointRatio',
        t('Pulley joint ratio'),
        t('Pulley joint ratio'),
        t('Joints/Pulley'),
        'JsPlatform/Extensions/pulley_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getPulleyJointRatio');

    // Gear joint
    aut
      .addAction(
        'AddGearJoint',
        t('Add gear joint'),
        t(
          'Add a gear joint between two joints. Attention: Gear joints require the joints to be revolute or prismatic, and both of them to be attached to a static body as first object.'
        ),
        t('Add a gear joint between joints _PARAM2_ and _PARAM3_'),
        t('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint24.png',
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('First joint ID'))
      .addParameter('expression', t('Second joint ID'))
      .addParameter('expression', t('Ratio (non-zero) (default: 1)'), '', true)
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addGearJoint');

    aut
      .addExpression(
        'GearJointFirstJoint',
        t('Gear joint first joint'),
        t('Gear joint first joint'),
        t('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointFirstJoint');

    aut
      .addExpression(
        'GearJointSecondJoint',
        t('Gear joint second joint'),
        t('Gear joint second joint'),
        t('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointSecondJoint');

    aut
      .addAction(
        'GearJointRatio',
        t('Gear joint ratio'),
        t('Modify a Gear joint ratio.'),
        t('Do _PARAM3__PARAM4_ to the ratio for gear joint _PARAM2_'),
        t('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint24.png',
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setGearJointRatio')
      .setManipulatedType('number')
      .setGetter('getGearJointRatio');

    aut
      .addExpression(
        'GearJointRatio',
        t('Gear joint ratio'),
        t('Gear joint ratio'),
        t('Joints/Gear'),
        'JsPlatform/Extensions/gear_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getGearJointRatio');

    // Mouse joint
    aut
      .addAction(
        'AddMouseJoint',
        t('Add mouse joint'),
        t('Add a mouse joint between two joints.'),
        t('Add a mouse joint to _PARAM0_'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Target X'))
      .addParameter('expression', t('Target Y'))
      .addParameter(
        'expression',
        t('Maximum force (N) (non-negative) (default: 500)'),
        '',
        true
      )
      .setDefaultValue('500')
      .addParameter(
        'expression',
        t('Frequency (Hz) (positive) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        t('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addMouseJoint');

    aut
      .addAction(
        'MouseJointTarget',
        t('Mouse joint target'),
        t('Set a mouse joint target.'),
        t(
          'Do _PARAM3_;_PARAM4_ to the target position of mouse joint _PARAM2_'
        ),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('expression', t('Target X'))
      .addParameter('expression', t('Target Y'))
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointTarget');

    aut
      .addExpression(
        'MouseJointTargetX',
        t('Mouse joint target X'),
        t('Mouse joint target X'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointTargetX');

    aut
      .addExpression(
        'MouseJointTargetY',
        t('Mouse joint target Y'),
        t('Mouse joint target Y'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointTargetY');

    aut
      .addAction(
        'MouseJointMaxForce',
        t('Mouse joint max force'),
        t('Set a mouse joint maximum force.'),
        t('Do _PARAM3__PARAM4_ to the maximum force for mouse joint _PARAM2_'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointMaxForce')
      .setManipulatedType('number')
      .setGetter('getMouseJointMaxForce');

    aut
      .addExpression(
        'MouseJointMaxForce',
        t('Mouse joint max force'),
        t('Mouse joint maximum force'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointMaxForce');

    aut
      .addAction(
        'MouseJointFrequency',
        t('Mouse joint frequency'),
        t('Set a mouse joint frequency.'),
        t('Do _PARAM3__PARAM4_ to the frequency for mouse joint _PARAM2_'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointFrequency')
      .setManipulatedType('number')
      .setGetter('getMouseJointFrequency');

    aut
      .addExpression(
        'MouseJointFrequency',
        t('Mouse joint frequency'),
        t('Mouse joint frequency'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointFrequency');

    aut
      .addAction(
        'MouseJointDampingRatio',
        t('Mouse joint damping ratio'),
        t('Set a mouse joint damping ratio.'),
        t('Do _PARAM3__PARAM4_ to the damping ratio for mouse joint _PARAM2_'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint24.png',
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMouseJointDampingRatio')
      .setManipulatedType('number')
      .setGetter('getMouseJointDampingRatio');

    aut
      .addExpression(
        'MouseJointDampingRatio',
        t('Mouse joint damping ratio'),
        t('Mouse joint damping ratio'),
        t('Joints/Mouse'),
        'JsPlatform/Extensions/mouse_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMouseJointDampingRatio');

    // Wheel joint
    aut
      .addAction(
        'AddWheelJoint',
        t('Add wheel joint'),
        t(
          'Add a wheel joint between two objects. Higher frequencies means higher suspensions. Damping determines oscillations, critical damping of 1 means no oscillations.'
        ),
        t('Add a wheel joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter('expression', t('Axis angle'))
      .addParameter(
        'expression',
        t('Frequency (Hz) (non-negative) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        t('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter('yesorno', t('Enable motor? (default: no)'), '', true)
      .setDefaultValue('false')
      .addParameter('expression', t('Motor speed (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Motor maximum force (default: 0)'),
        '',
        true
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addWheelJoint');

    aut
      .addExpression(
        'WheelJointAxisAngle',
        t('Wheel joint axis angle'),
        t('Wheel joint axis angle'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointAxisAngle');

    aut
      .addExpression(
        'WheelJointTranslation',
        t('Wheel joint current translation'),
        t('Wheel joint current translation'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointTranslation');

    aut
      .addExpression(
        'WheelJointSpeed',
        t('Wheel joint current speed'),
        t('Wheel joint speed'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointSpeed');

    aut
      .addCondition(
        'WheelJointMotorEnabled',
        t('Wheel joint motor enabled'),
        t('Test if a wheel joint motor is enabled.'),
        t('Motor for wheel joint _PARAM2_ is enabled'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('isWheelJointMotorEnabled');

    aut
      .addAction(
        'EnableWheelJointMotor',
        t('Enable wheel joint motor'),
        t('Enable or disable a wheel joint motor.'),
        t('Enable motor for wheel joint _PARAM2_: _PARAM3_'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('yesorno', t('Enable?'))
      .getCodeExtraInformation()
      .setFunctionName('enableWheelJointMotor');

    aut
      .addAction(
        'WheelJointMotorSpeed',
        t('Wheel joint motor speed'),
        t('Modify a wheel joint motor speed.'),
        t('Do _PARAM3__PARAM4_ to the motor speed for wheel joint _PARAM2_'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointMotorSpeed')
      .setManipulatedType('number')
      .setGetter('getWheelJointMotorSpeed');

    aut
      .addExpression(
        'WheelJointMotorSpeed',
        t('Wheel joint motor speed'),
        t('Wheel joint motor speed'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMotorSpeed');

    aut
      .addAction(
        'WheelJointMaxMotorTorque',
        t('Wheel joint max motor torque'),
        t('Modify a wheel joint maximum motor torque.'),
        t(
          'Do _PARAM3__PARAM4_ to the maximum motor torque for wheel joint _PARAM2_'
        ),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointMaxMotorTorque')
      .setManipulatedType('number')
      .setGetter('getWheelJointMaxMotorTorque');

    aut
      .addExpression(
        'WheelJointMaxMotorTorque',
        t('Wheel joint max motor torque'),
        t('Wheel joint maximum motor torque'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMaxMotorTorque');

    aut
      .addExpression(
        'WheelJointMotorTorque',
        t('Wheel joint motor torque'),
        t('Wheel joint motor torque'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointMotorTorque');

    aut
      .addAction(
        'WheelJointFrequency',
        t('Wheel joint frequency'),
        t('Modify a wheel joint frequency.'),
        t('Do _PARAM3__PARAM4_ to the frequency for wheel joint _PARAM2_'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointFrequency')
      .setManipulatedType('number')
      .setGetter('getWheelJointFrequency');

    aut
      .addExpression(
        'WheelJointFrequency',
        t('Wheel joint frequency'),
        t('Wheel joint frequency'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointFrequency');

    aut
      .addAction(
        'WheelJointDampingRatio',
        t('Wheel joint damping ratio'),
        t('Modify a wheel joint damping ratio.'),
        t('Do _PARAM3__PARAM4_ to the damping ratio for wheel joint _PARAM2_'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint24.png',
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWheelJointDampingRatio')
      .setManipulatedType('number')
      .setGetter('getWheelJointDampingRatio');

    aut
      .addExpression(
        'WheelJointDampingRatio',
        t('Wheel joint damping ratio'),
        t('Wheel joint damping ratio'),
        t('Joints/Wheel'),
        'JsPlatform/Extensions/wheel_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWheelJointDampingRatio');

    // Weld joint
    aut
      .addAction(
        'AddWeldJoint',
        t('Add weld joint'),
        t('Add a weld joint between two objects.'),
        t('Add a weld joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter('expression', t('Reference angle (default: 0)'), '', true)
      .setDefaultValue('0')
      .addParameter(
        'expression',
        t('Frequency (Hz) (non-negative) (default: 10)'),
        '',
        true
      )
      .setDefaultValue('10')
      .addParameter(
        'expression',
        t('Damping ratio (non-negative) (default: 1)'),
        '',
        true
      )
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addWeldJoint');

    aut
      .addExpression(
        'WeldJointReferenceAngle',
        t('Weld joint reference angle'),
        t('Weld joint reference angle'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointReferenceAngle');

    aut
      .addAction(
        'WeldJointFrequency',
        t('Weld joint frequency'),
        t('Modify a weld joint frequency.'),
        t('Do _PARAM3__PARAM4_ to the frequency for weld joint _PARAM2_'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWeldJointFrequency')
      .setManipulatedType('number')
      .setGetter('getWeldJointFrequency');

    aut
      .addExpression(
        'WeldJointFrequency',
        t('Weld joint frequency'),
        t('Weld joint frequency'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointFrequency');

    aut
      .addAction(
        'WeldJointDampingRatio',
        t('Weld joint damping ratio'),
        t('Modify a weld joint damping ratio.'),
        t('Do _PARAM3__PARAM4_ to the damping ratio for weld joint _PARAM2_'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint24.png',
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setWeldJointDampingRatio')
      .setManipulatedType('number')
      .setGetter('getWeldJointDampingRatio');

    aut
      .addExpression(
        'WeldJointDampingRatio',
        t('Weld joint damping ratio'),
        t('Weld joint damping ratio'),
        t('Joints/Weld'),
        'JsPlatform/Extensions/weld_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getWeldJointDampingRatio');

    // Rope joint
    aut
      .addAction(
        'AddRopeJoint',
        t('Add rope joint'),
        t(
          'Add a rope joint between two objects. The maximum length is converted to meters using the world scale on X.'
        ),
        t('Add a rope joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint24.png',
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter(
        'expression',
        t('Maximum length (-1 to use current objects distance) (default: -1)'),
        '',
        true
      )
      .setDefaultValue('-1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addRopeJoint');

    aut
      .addAction(
        'RopeJointMaxLength',
        t('Rope joint max length'),
        t('Modify a rope joint maximum length.'),
        t('Do _PARAM3__PARAM4_ to the maximum length for rope joint _PARAM2_'),
        t('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint24.png',
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setRopeJointMaxLength')
      .setManipulatedType('number')
      .setGetter('getRopeJointMaxLength');

    aut
      .addExpression(
        'RopeJointMaxLength',
        t('Rope joint max length'),
        t('Rope joint maximum length'),
        t('Joints/Rope'),
        'JsPlatform/Extensions/rope_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getRopeJointMaxLength');

    // Friction joint
    aut
      .addAction(
        'AddFrictionJoint',
        t('Add friction joint'),
        t('Add a friction joint between two objects.'),
        t('Add a friction joint between _PARAM0_ and _PARAM4_'),
        t('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Anchor X on first body'))
      .addParameter('expression', t('Anchor Y on first body'))
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Anchor X on second body'))
      .addParameter('expression', t('Anchor Y on second body'))
      .addParameter('expression', t('Maximum force (non-negative)'))
      .addParameter('expression', t('Maximum torque (non-negative)'))
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addFrictionJoint');

    aut
      .addAction(
        'FrictionJointMaxForce',
        t('Friction joint max force'),
        t('Modify a friction joint maximum force.'),
        t(
          'Do _PARAM3__PARAM4_ to the maximum force for friction joint _PARAM2_'
        ),
        t('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setFrictionJointMaxForce')
      .setManipulatedType('number')
      .setGetter('getFrictionJointMaxForce');

    aut
      .addExpression(
        'FrictionJointMaxForce',
        t('Friction joint max force'),
        t('Friction joint maximum force'),
        t('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getFrictionJointMaxForce');

    aut
      .addAction(
        'FrictionJointMaxTorque',
        t('Friction joint max torque'),
        t('Modify a friction joint maximum torque.'),
        t(
          'Do _PARAM3__PARAM4_ to the maximum torque for friction joint _PARAM2_'
        ),
        t('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint24.png',
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setFrictionJointMaxTorque')
      .setManipulatedType('number')
      .setGetter('getFrictionJointMaxTorque');

    aut
      .addExpression(
        'FrictionJointMaxTorque',
        t('Friction joint max torque'),
        t('Friction joint maximum torque'),
        t('Joints/Friction'),
        'JsPlatform/Extensions/friction_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getFrictionJointMaxTorque');

    // Motor joint
    aut
      .addAction(
        'AddMotorJoint',
        t('Add motor joint'),
        t(
          'Add a motor joint between two objects. The position and angle offsets are relative to the first object.'
        ),
        t('Add a motor joint between _PARAM0_ and _PARAM2_'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('First object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('objectPtr', t('Second object'), '', false)
      .addParameter('expression', t('Offset X position'))
      .addParameter('expression', t('Offset Y position'))
      .addParameter('expression', t('Offset Angle'))
      .addParameter('expression', t('Maximum force (non-negative)'))
      .addParameter('expression', t('Maximum torque (non-negative)'))
      .addParameter('expression', t('Correction factor (default: 1)'), '', true)
      .setDefaultValue('1')
      .addParameter(
        'yesorno',
        t('Allow collision between connected bodies? (default: no)'),
        '',
        true
      )
      .setDefaultValue('false')
      .addParameter(
        'scenevar',
        t('Variable where to store the joint ID (default: none)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setFunctionName('addMotorJoint');

    aut
      .addAction(
        'MotorJointOffset',
        t('Motor joint offset'),
        t('Modify a motor joint offset.'),
        t('Set offset to _PARAM3_;_PARAM4_ for motor joint _PARAM2_'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('expression', t('Offset X'))
      .addParameter('expression', t('Offset Y'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointOffset');

    aut
      .addExpression(
        'MotorJointOffsetX',
        t('Motor joint offset X'),
        t('Motor joint offset X'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointOffsetX');

    aut
      .addExpression(
        'MotorJointOffsetY',
        t('Motor joint offset Y'),
        t('Motor joint offset Y'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointOffsetY');

    aut
      .addAction(
        'MotorJointAngularOffset',
        t('Motor joint angular offset'),
        t('Modify a motor joint angular offset.'),
        t('Do _PARAM3__PARAM4_ to the angular offset for motor joint _PARAM2_'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointAngularOffset')
      .setManipulatedType('number')
      .setGetter('getMotorJointAngularOffset');

    aut
      .addExpression(
        'MotorJointAngularOffset',
        t('Motor joint angular offset'),
        t('Motor joint angular offset'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointAngularOffset');

    aut
      .addAction(
        'MotorJointMaxForce',
        t('Motor joint max force'),
        t('Modify a motor joint maximum force.'),
        t('Do _PARAM3__PARAM4_ to the maximum force for motor joint _PARAM2_'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointMaxForce')
      .setManipulatedType('number')
      .setGetter('getMotorJointMaxForce');

    aut
      .addExpression(
        'MotorJointMaxForce',
        t('Motor joint max force'),
        t('Motor joint maximum force'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointMaxForce');

    aut
      .addAction(
        'MotorJointMaxTorque',
        t('Motor joint max torque'),
        t('Modify a motor joint maximum torque.'),
        t('Do _PARAM3__PARAM4_ to the maximum torque for motor joint _PARAM2_'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointMaxTorque')
      .setManipulatedType('number')
      .setGetter('getMotorJointMaxTorque');

    aut
      .addExpression(
        'MotorJointMaxTorque',
        t('Motor joint max torque'),
        t('Motor joint maximum torque'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointMaxTorque');

    aut
      .addAction(
        'MotorJointCorrectionFactor',
        t('Motor joint correction factor'),
        t('Modify a motor joint correction factor.'),
        t(
          'Do _PARAM3__PARAM4_ to the correction factor for motor joint _PARAM2_'
        ),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint24.png',
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .addParameter('operator', t("Modification's sign"))
      .addParameter('expression', t('Value'))
      .getCodeExtraInformation()
      .setFunctionName('setMotorJointCorrectionFactor')
      .setManipulatedType('number')
      .setGetter('getMotorJointCorrectionFactor');

    aut
      .addExpression(
        'MotorJointCorrectionFactor',
        t('Motor joint correction factor'),
        t('Motor joint correction factor'),
        t('Joints/Motor'),
        'JsPlatform/Extensions/motor_joint16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('expression', t('Joint ID'))
      .getCodeExtraInformation()
      .setFunctionName('getMotorJointCorrectionFactor');

    // Collision
    extension
      .addCondition(
        'Collision',
        t('Collision'),
        t('Test if two objects collide.'),
        t('_PARAM0_ is colliding with _PARAM2_'),
        t(''),
        'res/physics24.png',
        'res/physics16.png'
      )
      .addParameter('objectList', t('Object'), '', false)
      .addParameter('behavior', t('Behavior'), 'Physics2Behavior')
      .addParameter('objectList', t('Object'), '', false)
      .addCodeOnlyParameter('conditionInverted', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Physics2Behavior/physics2tools.js')
      .setFunctionName('gdjs.physics2.objectsCollide');

    return extension;
  },

  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
