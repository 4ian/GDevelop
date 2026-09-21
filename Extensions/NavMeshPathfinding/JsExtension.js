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
        'NavMeshPathfinding',
        _('Navmesh pathfinding'),
        'Pathfinding allows to compute an efficient path for objects, including crowds, following walkable floors and avoiding obstacles on the way.',
        '',
        'Open source (MIT License)'
      )
      .setShortDescription(
        'Navmesh based pathfinding: compute path avoiding obstacles and handle crowds.'
      )
      .setDimension('2D/3D')
      .setCategory('Movement')
      .setTags('pathfinding, obstacle, collision')
      .setExtensionHelpPath('/behaviors/nav-mesh-pathfinding');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Navmesh pathfinding'))
      .setIcon('JsPlatform/Extensions/nav-mesh-character.svg');
    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'acceleration') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('acceleration')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'maxSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('maxSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'angularMaxSpeed') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('angularMaxSpeed')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'rotateObject') {
          behaviorContent
            .getOrCreateChild('rotateObject')
            .setBoolValue(newValue === '1');
          return true;
        }

        if (propertyName === 'angleOffset') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('angleOffset')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'radius') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('radius')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        if (propertyName === 'avoidanceSightRange') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          behaviorContent
            .getOrCreateChild('avoidanceSightRange')
            .setDoubleValue(newValueAsNumber);
          return true;
        }

        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('acceleration')
          .setValue(behaviorContent.getChild('acceleration').getStringValue())
          .setLabel(_('Acceleration'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelAcceleration());

        behaviorProperties
          .getOrCreate('maxSpeed')
          .setValue(behaviorContent.getChild('maxSpeed').getStringValue())
          .setLabel(_('Max. speed'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixelSpeed());

        behaviorProperties
          .getOrCreate('angularMaxSpeed')
          .setValue(
            behaviorContent.getChild('angularMaxSpeed').getStringValue()
          )
          .setLabel(_('Rotation speed'))
          .setGroup(_('Rotation'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getAngularSpeed());

        behaviorProperties
          .getOrCreate('rotateObject')
          .setValue(
            behaviorContent.getChild('rotateObject').getBoolValue()
              ? 'true'
              : 'false'
          )
          .setLabel(_('Rotate object'))
          .setGroup(_('Rotation'))
          .setType('Boolean');

        behaviorProperties
          .getOrCreate('angleOffset')
          .setValue(behaviorContent.getChild('angleOffset').getStringValue())
          .setLabel(_('Angle offset'))
          .setGroup(_('Rotation'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle());

        behaviorProperties
          .getOrCreate('radius')
          .setValue(behaviorContent.getChild('radius').getStringValue())
          .setLabel(_('Radius'))
          .setDescription(
            _(
              'Use the circle inside the object width and height when left to 0.'
            )
          )
          .setGroup(_('Collision'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel());

        behaviorProperties
          .getOrCreate('avoidanceSightRange')
          .setValue(
            behaviorContent.getChild('avoidanceSightRange').getStringValue()
          )
          .setLabel(_('Avoidance sight range'))
          .setGroup(_('Collision'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel());

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('acceleration').setDoubleValue(400);
        behaviorContent.addChild('maxSpeed').setDoubleValue(200);
        behaviorContent.addChild('angularMaxSpeed').setDoubleValue(180);
        behaviorContent.addChild('rotateObject').setBoolValue(true);
        behaviorContent.addChild('angleOffset').setDoubleValue(0);
        behaviorContent.addChild('radius').setDoubleValue(0);
        behaviorContent.addChild('avoidanceSightRange').setDoubleValue(120);
      };

      const sharedData = new gd.BehaviorSharedDataJsImplementation();
      sharedData.updateProperty = function (
        sharedContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'cellSize') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('cellSize')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'cellDepth') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('cellDepth')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'slopeMaxAngle') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('slopeMaxAngle')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'stairHeightMax') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('stairHeightMax')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'walkableRadius') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('walkableRadius')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'walkableDepth') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('walkableDepth')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        if (propertyName === 'speedScaleY') {
          const newValueAsNumber = parseFloat(newValue);
          if (newValueAsNumber !== newValueAsNumber) return false;
          sharedContent
            .getOrCreateChild('speedScaleY')
            .setDoubleValue(newValueAsNumber);
          return true;
        }
        return false;
      };
      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();

        sharedProperties
          .getOrCreate('cellSize')
          .setLabel(_('Cell size'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            sharedContent.getChild('cellSize').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('cellDepth')
          .setLabel(_('Cell depth'))
          .setGroup(_('3D only'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            sharedContent.getChild('cellDepth').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('slopeMaxAngle')
          .setLabel(_('Slope max. angle'))
          .setGroup(_('3D only'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setValue(
            sharedContent
              .getChild('slopeMaxAngle')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('stairHeightMax')
          .setLabel(_('Max. stair height'))
          .setGroup(_('3D only'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            sharedContent
              .getChild('stairHeightMax')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('walkableRadius')
          .setLabel(_('Walkable radius'))
          .setDescription(
            _(
              'The biggest character radius is automatically used when left negative.'
            )
          )
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            sharedContent
              .getChild('walkableRadius')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('walkableDepth')
          .setLabel(_('Walkable depth'))
          .setDescription(
            _(
              'Minimum floor to ceiling height that will still allow the floor area to be considered walkable.'
            )
          )
          .setGroup(_('3D only'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setValue(
            sharedContent
              .getChild('walkableDepth')
              .getDoubleValue()
              .toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        sharedProperties
          .getOrCreate('speedScaleY')
          .setLabel(_('Y speed scale'))
          .setDescription(
            _(
              'Allow a depth effect for 2D games. Usually set to 0.5 for isometry.'
            )
          )
          .setGroup(_('2D only'))
          .setType('Number')
          .setValue(
            sharedContent.getChild('speedScaleY').getDoubleValue().toString(10)
          )
          .setAdvanced(true)
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden);

        return sharedProperties;
      };
      sharedData.initializeContent = function (sharedContent) {
        sharedContent.addChild('cellSize').setDoubleValue(10);
        sharedContent.addChild('cellDepth').setDoubleValue(10);
        sharedContent.addChild('slopeMaxAngle').setDoubleValue(50);
        sharedContent.addChild('stairHeightMax').setDoubleValue(20);
        sharedContent.addChild('walkableRadius').setDoubleValue(-1);
        sharedContent.addChild('walkableDepth').setDoubleValue(150);
        sharedContent.addChild('speedScaleY').setDoubleValue(1);
      };

      const aut = extension
        .addBehavior(
          'NavMeshCharacterBehavior',
          _('Pathfinding character (navmesh based)'),
          'NavMeshCharacter',
          _(
            'Move objects to a target by following walkable floors and avoiding obstacles. Uses a flexible 2D/3D "navmesh"-based pathfinding.'
          ),
          '',
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'NavMeshCharacterBehavior',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          sharedData
        )
        .markAsIrrelevantForChildObjects()
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/NavMeshCharacterRuntimeBehavior.js'
        )
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/NavMeshObstacleRuntimeBehavior.js'
        )
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/recast-navigation.wasm.js'
        )
        .addRequiredFile(
          'Extensions/NavMeshPathfinding/recast-navigation.wasm.wasm'
        )
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/recast-navigation-generators.js'
        );

      aut
        .addAction(
          'MoveTo',
          _('Move to a position'),
          _('Move the object to a position'),
          _('Move _PARAM0_ to _PARAM2_ ; _PARAM3_ ; _PARAM4_'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('expression', _('Destination X position'))
        .addParameter('expression', _('Destination Y position'))
        .addParameter('expression', _('Destination Z position'))
        .setFunctionName('moveTo');

      aut
        .addCondition(
          'PathFound',
          _('Path found'),
          _('Check if a path has been found.'),
          _('A path has been found for _PARAM0_'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('pathFound');

      aut
        .addCondition(
          'DestinationReached',
          _('Destination reached'),
          _('Check if the destination was reached.'),
          _('_PARAM0_ reached its destination'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('destinationReached');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Acceleration',
          _('Acceleration'),
          _('the acceleration when moving the object'),
          _('the acceleration on the path'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setAcceleration')
        .setGetter('getAcceleration');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'MaxSpeed',
          _('Maximum speed'),
          _('the maximum speed when moving the object'),
          _('the max. speed on the path'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max speed (in pixels per second)')
          )
        )
        .setFunctionName('setMaxSpeed')
        .setGetter('getMaxSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'Speed',
          _('Speed'),
          _('Change the speed of the object on the path'),
          _('the speed on the path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Speed (in pixels per second)')
          )
        )
        .setFunctionName('setSpeed')
        .setGetter('getSpeed');

      aut
        .addScopedCondition(
          'MovementAngleIsAround',
          _('Angle of movement on its path'),
          _('Compare the angle of movement of an object on its path.'),
          _('Angle of movement of _PARAM0_ is _PARAM2_ ± _PARAM3_°'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('expression', _('Angle, in degrees'))
        .addParameter('expression', _('Tolerance, in degrees'));

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngularMaxSpeed',
          _('Angular maximum speed'),
          _('the maximum angular speed when moving the object'),
          _('the max. angular speed on the path'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Max angular speed (in degrees per second)')
          )
        )
        .setFunctionName('setAngularMaxSpeed')
        .setGetter('getAngularMaxSpeed');

      aut
        .addExpressionAndConditionAndAction(
          'number',
          'AngleOffset',
          _('Rotation offset'),
          _('the rotation offset applied when moving the object'),
          _('the rotation offset on the path'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Angle (in degrees)')
          )
        )
        .setFunctionName('setAngleOffset')
        .setGetter('getAngleOffset');

      aut
        .addScopedAction(
          'RotateObject',
          _('Rotate the object'),
          _('Enable or disable rotation of the object on the path'),
          _('Enable rotation of _PARAM0_ on the path: _PARAM2_'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('yesorno', _('Rotate object?'))
        .setFunctionName('setRotateObject');

      aut
        .addScopedCondition(
          'ObjectRotated',
          _('Object rotated'),
          _('Check if the object is rotated when traveling on its path.'),
          _('_PARAM0_ is rotated when traveling on its path'),
          _('Pathfinding configuration'),
          'JsPlatform/Extensions/nav-mesh-character.svg',
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('isObjectRotated');

      aut
        .addExpression(
          'GetNodeX',
          _('Get a waypoint X position'),
          _('Get a waypoint X position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('expression', _('Node index (start at 0!)'))
        .setFunctionName('getNodeX');

      aut
        .addExpression(
          'GetNodeY',
          _('Get a waypoint Y position'),
          _('Get a waypoint Y position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('expression', _('Node index (start at 0!)'))
        .setFunctionName('getNodeY');

      aut
        .addExpression(
          'GetNodeZ',
          _('Get a waypoint Z position'),
          _('Get a waypoint Z position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .addParameter('expression', _('Node index (start at 0!)'))
        .setFunctionName('getNodeZ');

      aut
        .addExpression(
          'NextNodeIndex',
          _('Index of the next waypoint'),
          _('Get the index of the next waypoint to reach'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getNextNodeIndex');

      aut
        .addExpression(
          'NodeCount',
          _('Waypoint count'),
          _('Get the number of waypoints on the path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getNodeCount');

      aut
        .addExpression(
          'NextNodeX',
          _('Get next waypoint X position'),
          _('Get next waypoint X position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getNextNodeX');

      aut
        .addExpression(
          'NextNodeY',
          _('Get next waypoint Y position'),
          _('Get next waypoint Y position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getNextNodeY');

      aut
        .addExpression(
          'NextNodeZ',
          _('Get next waypoint Z position'),
          _('Get next waypoint Z position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getNextNodeZ');

      aut
        .addExpression(
          'PreviousNodeX',
          _('Previous waypoint X position'),
          _('Previous waypoint X position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getPreviousNodeX');

      aut
        .addExpression(
          'PreviousNodeY',
          _('Previous waypoint Y position'),
          _('Previous waypoint Y position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getPreviousNodeY');

      aut
        .addExpression(
          'PreviousNodeZ',
          _('Previous waypoint Z position'),
          _('Previous waypoint Z position'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getPreviousNodeZ');

      aut
        .addExpression(
          'DestinationX',
          _('Destination X position'),
          _('Destination X position of the path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getDestinationX');

      aut
        .addExpression(
          'DestinationY',
          _('Destination Y position'),
          _('Destination Y position of the path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getDestinationY');

      aut
        .addExpression(
          'DestinationZ',
          _('Destination Z position'),
          _('Destination Z position of the path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getDestinationZ');

      aut
        .addExpression(
          'MovementAngle',
          _('Angle of movement on its path'),
          _('Angle of movement on its path'),
          _('Movement on the path'),
          'JsPlatform/Extensions/nav-mesh-character.svg'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('getMovementAngle');
    }
    {
      const behavior = new gd.BehaviorJsImplementation();
      behavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'shape') {
          const normalizedValue = newValue.toLowerCase();
          let shapeValue = '';
          if (normalizedValue === 'box') shapeValue = 'Box';
          else if (normalizedValue === 'mesh') shapeValue = 'Mesh';
          else return false;

          behaviorContent.getOrCreateChild('shape').setStringValue(shapeValue);
          return true;
        }

        if (propertyName === 'meshShapeResourceName') {
          behaviorContent
            .getOrCreateChild('meshShapeResourceName')
            .setStringValue(newValue);
          return true;
        }
        return false;
      };
      behavior.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('shape')
          .setValue(behaviorContent.getChild('shape').getStringValue())
          .setType('Choice')
          .setLabel('Shape')
          .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
          .addChoice('Box', _('Box'))
          .addChoice('Mesh', _('Mesh'));
        behaviorProperties
          .getOrCreate('meshShapeResourceName')
          .setValue(
            behaviorContent.getChild('meshShapeResourceName').getStringValue()
          )
          .setType('resource')
          .addExtraInfo('model3D')
          .setLabel(_('Simplified 3D model'))
          .setDescription(_("Leave empty to use object's one"));

        return behaviorProperties;
      };

      behavior.initializeContent = function (behaviorContent) {
        behaviorContent.addChild('shape').setStringValue('Box');
        behaviorContent.addChild('meshShapeResourceName').setStringValue('');
      };

      const sharedData = new gd.BehaviorSharedDataJsImplementation();
      sharedData.updateProperty = function (
        sharedContent,
        propertyName,
        newValue
      ) {
        return false;
      };
      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();
        return sharedProperties;
      };
      sharedData.initializeContent = function (sharedContent) {};

      extension
        .addBehavior(
          'NavMeshObstacleBehavior',
          _('Floor/obstacle for pathfinding (navmesh based)'),
          'NavMeshObstacle',
          _(
            'Flag objects as being walkable floors and/or obstacles for navmesh pathfinding.'
          ),
          '',
          'JsPlatform/Extensions/nav-mesh-obstacle.svg',
          'NavMeshObstacle',
          //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
          behavior,
          sharedData
        )
        .markAsIrrelevantForChildObjects()
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/NavMeshObstacleRuntimeBehavior.js'
        )
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/recast-navigation.wasm.js'
        )
        .addRequiredFile(
          'Extensions/NavMeshPathfinding/recast-navigation.wasm.wasm'
        )
        .addIncludeFile(
          'Extensions/NavMeshPathfinding/recast-navigation-generators.js'
        );
    }

    extension
      .addAction(
        'EnableDebugDraw',
        _('Draw pathfinding walkable area'),
        _('This activates the display of the walkable area (in blue).'),
        _('Enable debugging view of navmesh pathfinding: _PARAM1_'),
        '',
        'res/actions/planicon24.png',
        'res/actions/planicon.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('yesorno', _('Enable debug draw'), '', false)
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .addIncludeFile(
        'Extensions/NavMeshPathfinding/NavMeshObstacleRuntimeBehavior.js'
      )
      .addIncludeFile('Extensions/NavMeshPathfinding/recast-navigation.wasm.js')
      .addIncludeFile(
        'Extensions/NavMeshPathfinding/recast-navigation-generators.js'
      )
      .addIncludeFile(
        'Extensions/NavMeshPathfinding/NavMeshDebugPixiRenderer.js'
      )
      .setFunctionName('gdjs.NavMeshObstaclesManager.enableDebugDraw');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
