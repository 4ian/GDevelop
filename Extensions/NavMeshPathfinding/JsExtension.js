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
        _('Pathfinding behavior'),
        'Pathfinding allows to compute an efficient path for objects, avoiding obstacles on the way.',
        '',
        'Open source (MIT License)'
      )
      .setShortDescription(
        'A* pathfinding: compute paths avoiding obstacles. Configurable speed, grid, diagonals.'
      )
      .setDimension('3D')
      .setCategory('Movement')
      .setTags('pathfinding, obstacle, collision')
      .setExtensionHelpPath('/behaviors/pathfinding');
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
          .setGroup(_('Collision'))
          .setType('Number')
          .setMeasurementUnit(gd.MeasurementUnit.getPixel())
          .setAdvanced(true);

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

        return sharedProperties;
      };
      sharedData.initializeContent = function (sharedContent) {
        sharedContent.addChild('cellSize').setDoubleValue(10);
        sharedContent.addChild('cellDepth').setDoubleValue(10);
        sharedContent.addChild('slopeMaxAngle').setDoubleValue(50);
        sharedContent.addChild('stairHeightMax').setDoubleValue(20);
        sharedContent.addChild('walkableRadius').setDoubleValue(-1);
      };

      const aut = extension
        .addBehavior(
          'NavMeshCharacterBehavior',
          _('3D pathfinding'),
          'NavMeshCharacter',
          _(
            'Move objects to a target while avoiding all objects that are  flagged as obstacles.'
          ),
          '',
          'CppPlatform/Extensions/AStaricon.png',
          'PathfindingBehavior',
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
          'CppPlatform/Extensions/AStaricon24.png',
          'CppPlatform/Extensions/AStaricon16.png'
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
          'CppPlatform/Extensions/AStaricon24.png',
          'CppPlatform/Extensions/AStaricon16.png'
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
          'CppPlatform/Extensions/AStaricon24.png',
          'CppPlatform/Extensions/AStaricon16.png'
        )
        .addParameter('object', _('Object'))
        .addParameter('behavior', _('Behavior'), 'NavMeshCharacterBehavior')
        .setFunctionName('destinationReached');
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
          else if (normalizedValue === 'capsule') shapeValue = 'Capsule';
          else if (normalizedValue === 'sphere') shapeValue = 'Sphere';
          else if (normalizedValue === 'cylinder') shapeValue = 'Cylinder';
          else if (normalizedValue === 'mesh') shapeValue = 'Mesh';
          else return false;

          behaviorContent.getOrCreateChild('shape').setStringValue(shapeValue);
          if (shapeValue === 'Mesh') {
            behaviorContent
              .getOrCreateChild('bodyType')
              .setStringValue('Static');
          }
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
          .setLabel(_("Simplified 3D model (leave empty to use object's one)"));

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

      const aut = extension
        .addBehavior(
          'NavMeshObstacleBehavior',
          _('Obstacle for 3D pathfinding'),
          'NavMeshObstacle',
          _('Flag objects as being obstacles for 3D pathfinding.'),
          '',
          'CppPlatform/Extensions/pathfindingobstacleicon.png',
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
        _('Enable debugging view of pathfinding: _PARAM1_'),
        '',
        'res/actions/planicon24.png',
        'res/actions/planicon.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('yesorno', _('Enable debug draw'), '', true)
      .getCodeExtraInformation()
      .addIncludeFile(
        'Extensions/NavMeshPathfinding/NavMeshObstacleRuntimeBehavior.js'
      )
      .addIncludeFile('Extensions/NavMeshPathfinding/recast-navigation.wasm.js')
      .addIncludeFile(
        'Extensions/NavMeshPathfinding/recast-navigation.wasm.wasm'
      )
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
