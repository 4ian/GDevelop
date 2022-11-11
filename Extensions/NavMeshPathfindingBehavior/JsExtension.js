// @flow
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

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

const declarePathfindingBehavior = function (
  _ /*: (string) => string */,
  gd /*: libGDevelop */,
  extension /*: gdPlatformExtension */
) {
  const pathfindingBehavior = new gd.BehaviorJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.updateProperty = function (
    behaviorContent,
    propertyName,
    newValue
  ) {
    if (propertyName === 'acceleration') {
      behaviorContent.setDoubleAttribute('acceleration', newValue);
      return true;
    }
    if (propertyName === 'maxSpeed') {
      behaviorContent.setDoubleAttribute('maxSpeed', newValue);
      return true;
    }
    if (propertyName === 'angularMaxSpeed') {
      behaviorContent.setDoubleAttribute('angularMaxSpeed', newValue);
      return true;
    }
    if (propertyName === 'rotateObject') {
      behaviorContent.setBoolAttribute('rotateObject', newValue === '1');
      return true;
    }
    if (propertyName === 'angleOffset') {
      behaviorContent.setDoubleAttribute('angleOffset', newValue);
      return true;
    }
    if (propertyName === 'collisionShape') {
      behaviorContent.setStringAttribute('collisionShape', newValue);
      return true;
    }
    if (propertyName === 'extraBorder') {
      behaviorContent.setDoubleAttribute('extraBorder', newValue);
      return true;
    }

    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.getProperties = function (behaviorContent) {
    const behaviorProperties = new gd.MapStringPropertyDescriptor();

    behaviorProperties
      .getOrCreate('acceleration')
      .setValue(behaviorContent.getDoubleAttribute('acceleration').toString())
      .setLabel(_('Acceleration'));

    behaviorProperties
      .getOrCreate('maxSpeed')
      .setValue(behaviorContent.getDoubleAttribute('maxSpeed').toString())
      .setLabel(_('Max. speed'));

    behaviorProperties
      .getOrCreate('angularMaxSpeed')
      .setValue(
        behaviorContent.getDoubleAttribute('angularMaxSpeed').toString()
      )
      .setLabel(_('Rotate speed'))
      .setGroup(_("Rotation"));

    behaviorProperties
      .getOrCreate('rotateObject')
      .setValue(
        behaviorContent.getBoolAttribute('rotateObject') ? 'true' : 'false'
      )
      .setLabel(_('Rotate object'))
      .setType('Boolean')
      .setGroup(_("Rotation"));

    behaviorProperties
      .getOrCreate('angleOffset')
      .setValue(behaviorContent.getDoubleAttribute('angleOffset').toString())
      .setLabel(_('Angle offset'))
      .setGroup(_("Rotation"));

    behaviorProperties
      .getOrCreate('collisionShape')
      .setValue(behaviorContent.getStringAttribute('collisionShape').toString())
      .setType('Choice')
      .setLabel(_('Collision shape'))
      .addExtraInfo('Bounding disk')
      .addExtraInfo('Dot at center')
      .setGroup(_("Collision"));

    behaviorProperties
      .getOrCreate('extraBorder')
      .setValue(behaviorContent.getDoubleAttribute('extraBorder').toString())
      .setLabel(_('Extra border size'))
      .setGroup(_("Collision"));

    return behaviorProperties;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.initializeContent = function (behaviorContent) {
    behaviorContent.setDoubleAttribute('acceleration', 400);
    behaviorContent.setDoubleAttribute('maxSpeed', 200);
    behaviorContent.setDoubleAttribute('angularMaxSpeed', 180);
    behaviorContent.setBoolAttribute('rotateObject', true);
    behaviorContent.setDoubleAttribute('angleOffset', 0);
    behaviorContent.setStringAttribute('collisionShape', 'Bounding disk');
    behaviorContent.setDoubleAttribute('extraBorder', 0);
  };
  const pathfindingBehaviorDeclaration = extension
    .addBehavior(
      'NavMeshPathfindingBehavior',
      _('Pathfinding (polygonal mesh based, experimental)'),
      'NavMeshPathfindingBehavior',
      _(
        'Move the object to a target in straight lines while ' +
        'avoiding all objects that are flagged as obstacles.'
      ),
      '',
      'CppPlatform/Extensions/AStaricon.png',
      'NavMeshPathfindingBehavior',
      pathfindingBehavior,
      new gd.BehaviorsSharedData()
    )
    .setIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/navmeshpathfindingruntimebehavior.js'
    )
    .addIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/navmeshpathfindingobstacleruntimebehavior.js'
    )
    .addIncludeFile('Extensions/NavMeshPathfindingBehavior/A_navmeshall.js')
    .addIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/A_navmeshgenerator.js'
    );

  pathfindingBehaviorDeclaration
    .addScopedAction(
      'SetDestination',
      _('Move to a position'),
      _('Move the object to a position'),
      _('Move _PARAM0_ to _PARAM3_;_PARAM4_'),
      'Movement on the path (NavMesh)',
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addCodeOnlyParameter('currentScene', '')
    .addParameter('expression', _('Destination X position'))
    .addParameter('expression', _('Destination Y position'))
    .getCodeExtraInformation()
    .setFunctionName('moveTo');

  pathfindingBehaviorDeclaration
    .addScopedAction(
      'DrawNavMesh',
      _('Draw navigation mesh'),
      _('This activates the display of the navigation mesh on the debugging view.' +
      ' The debugging view needs to be enabled with another action or nothing will be displayed.'),
      _('Enable the drawing of the navigation mesh: _PARAM2_ used for _PARAM0_ on the debugging view with the color: _PARAM3_'),
      'Debug (NavMesh)',
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addParameter('yesorno', _('Show navigation mesh'), '', true)
    .setDefaultValue('yes')
    .addParameter('color', _('Color'))
    .addParameter('opacity', _('Opacity'))
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setVisualDebugEnabled');

  pathfindingBehaviorDeclaration
    .addScopedCondition(
      'IsMoving',
      _('Is moving'),
      _('Check if the object is moving on a path.'),
      _('_PARAM0_ is moving on a path'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('isMoving');

  pathfindingBehaviorDeclaration
    .addScopedCondition(
      'PathFound',
      _('Path found'),
      _('Check if a path has been found.'),
      _('A path has been found for _PARAM0_'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('pathFound');

  pathfindingBehaviorDeclaration
    .addScopedCondition(
      'DestinationReached',
      _('Destination reached'),
      _('Check if the destination was reached.'),
      _('_PARAM0_ reached its destination'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('destinationReached');

  pathfindingBehaviorDeclaration
    .addScopedCondition(
      'MovementAngleIsAround',
      _('Angle of movement on its path'),
      _('Compare the angle of movement of an object on its path.'),
      _(
        'Angle of movement of _PARAM0_ is _PARAM2_ (tolerance: _PARAM3_ degrees)'
      ),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addParameter('expression', _('Angle, in degrees'))
    .addParameter('expression', _('Tolerance, in degrees'))
    .getCodeExtraInformation()
    .setFunctionName('movementAngleIsAround');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'Speed',
      _('Speed on the path'),
      _('the speed of the object on the path'),
      _('the speed on the path'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setSpeed')
    .setGetter('getSpeed');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'Acceleration',
      _('Acceleration'),
      _('the acceleration when moving the object'),
      _('the acceleration on the path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setAcceleration')
    .setGetter('getAcceleration');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'MaxSpeed',
      _('Maximum speed'),
      _('the maximum speed when moving the object'),
      _('the max. speed on the path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setMaxSpeed')
    .setGetter('getMaxSpeed');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'AngularMaxSpeed',
      _('Angular maximum speed'),
      _('the maximum angular speed when moving the object'),
      _('the max. angular speed on the path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setAngularMaxSpeed')
    .setGetter('getAngularMaxSpeed');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'AngleOffset',
      _('Rotation offset'),
      _('the rotation offset applied when moving the object'),
      _('the rotation offset on the path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setAngleOffset')
    .setGetter('getAngleOffset');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'ExtraBorder',
      _('Extra border'),
      _(
        'the size of the extra border applied to the object when planning a path'
      ),
      _('the size of the extra border on the path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .useStandardParameters('number')
    .setFunctionName('setExtraBorder')
    .setGetter('getExtraBorder');

  pathfindingBehaviorDeclaration
    .addScopedAction(
      'RotateObject',
      _('Rotate the object'),
      _('Enable or disable rotation of the object on the path'),
      _('Enable rotation of _PARAM0_ on the path: _PARAM2_'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addParameter('yesorno', _('Rotate object?'))
    .getCodeExtraInformation()
    .setFunctionName('setRotateObject');

  pathfindingBehaviorDeclaration
    .addScopedCondition(
      'ObjectRotated',
      _('Object rotated'),
      _('Check if the object is rotated when traveling on its path.'),
      _('_PARAM0_ is rotated when traveling on its path'),
      _('Pathfinding configuration (NavMesh)'),
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('isObjectRotated');

  pathfindingBehaviorDeclaration
    .addExpression(
      'NodeCount',
      _('Waypoint count'),
      _('Get the number of waypoints on the path'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getNodeCount');

  pathfindingBehaviorDeclaration
    .addExpression(
      'GetNodeX',
      _('Get a waypoint X position'),
      _('Get next waypoint X position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addParameter('expression', _('Node index (start at 0!)'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('getNodeX');

  pathfindingBehaviorDeclaration
    .addExpression(
      'GetNodeY',
      _('Get a waypoint Y position'),
      _('Get next waypoint Y position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .addParameter('expression', _('Node index (start at 0!)'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('getNodeY');

  pathfindingBehaviorDeclaration
    .addExpression(
      'NextNodeIndex',
      _('Index of the next waypoint'),
      _('Get the index of the next waypoint to reach'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getNextNodeIndex');

  pathfindingBehaviorDeclaration
    .addExpression(
      'NextNodeX',
      _('Get next waypoint X position'),
      _('Get next waypoint X position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getNextNodeX');

  pathfindingBehaviorDeclaration
    .addExpression(
      'NextNodeY',
      _('Get next waypoint Y position'),
      _('Get next waypoint Y position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getNextNodeY');

  pathfindingBehaviorDeclaration
    .addExpression(
      'PreviousNodeX',
      _('Previous waypoint X position'),
      _('Previous waypoint X position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getPreviousNodeX');

  pathfindingBehaviorDeclaration
    .addExpression(
      'PreviousNodeY',
      _('Previous waypoint Y position'),
      _('Previous waypoint Y position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getPreviousNodeY');

  pathfindingBehaviorDeclaration
    .addExpression(
      'DestinationX',
      _('Destination X position'),
      _('Destination X position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getDestinationX');

  pathfindingBehaviorDeclaration
    .addExpression(
      'DestinationY',
      _('Destination Y position'),
      _('Destination Y position'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getDestinationY');

  pathfindingBehaviorDeclaration
    .addExpression(
      'MovementAngle',
      _('Angle of movement on its path'),
      _('Angle of movement on its path'),
      _('Movement on the path (NavMesh)'),
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addParameter('object', _('Object'), '', false)
    .addParameter(
      'behavior',
      _('Behavior'),
      'NavMeshPathfindingBehavior',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('getMovementAngle');
};

const declareObstacleBehavior = function (
  _ /*: (string) => string */,
  gd /*: libGDevelop */,
  extension /*: gdPlatformExtension */,
  sharedData /*: gdBehaviorSharedDataJsImplementation */
) {
  const pathfindingObstacleBehavior = new gd.BehaviorJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingObstacleBehavior.updateProperty = function (
    behaviorContent,
    propertyName,
    newValue
  ) {
    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingObstacleBehavior.getProperties = function (behaviorContent) {
    const behaviorProperties = new gd.MapStringPropertyDescriptor();
    return behaviorProperties;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingObstacleBehavior.initializeContent = function (behaviorContent) {};

  extension
    .addBehavior(
      'NavMeshPathfindingObstacleBehavior',
      _('Obstacle for pathfinding (polygonal mesh based, experimental)'),
      'NavMeshPathfindingObstacleBehavior',
      _('Flag the object as being an obstacle for pathfinding.'),
      '',
      'CppPlatform/Extensions/pathfindingobstacleicon.png',
      'NavMeshPathfindingObstacleBehavior',
      pathfindingObstacleBehavior,
      sharedData
    )
    .setIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/navmeshpathfindingobstacleruntimebehavior.js'
    )
    .addIncludeFile('Extensions/NavMeshPathfindingBehavior/A_navmeshall.js')
    .addIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/A_navmeshgenerator.js'
    );
};

const declareSharedData = function (
  _ /*: (string) => string */,
  gd /*: libGDevelop */,
) {
  const sharedData = new gd.BehaviorSharedDataJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  sharedData.updateProperty = function (sharedContent, propertyName, newValue) {
    if (propertyName === 'viewpoint') {
      sharedContent.setStringAttribute('viewpoint', newValue);
      return true;
    }
    if (propertyName === 'cellSize') {
      newValue = parseFloat(newValue);
      if (newValue !== newValue || newValue <= 0) return false;
      sharedContent.setDoubleAttribute('cellSize', newValue);
      return true;
    }
    if (propertyName === 'areaLeftBound') {
      newValue = parseFloat(newValue);
      if (newValue !== newValue) return false;
      sharedContent.setDoubleAttribute('areaLeftBound', newValue);
      return true;
    }
    if (propertyName === 'areaTopBound') {
      newValue = parseFloat(newValue);
      if (newValue !== newValue) return false;
      sharedContent.setDoubleAttribute('areaTopBound', newValue);
      return true;
    }
    if (propertyName === 'areaRightBound') {
      newValue = parseFloat(newValue);
      if (newValue !== newValue) return false;
      sharedContent.setDoubleAttribute('areaRightBound', newValue);
      return true;
    }
    if (propertyName === 'areaBottomBound') {
      newValue = parseFloat(newValue);
      if (newValue !== newValue) return false;
      sharedContent.setDoubleAttribute('areaBottomBound', newValue);
      return true;
    }

    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  sharedData.getProperties = function (sharedContent) {
    var sharedProperties = new gd.MapStringPropertyDescriptor();

    sharedProperties
      .getOrCreate('viewpoint')
      .setValue(sharedContent.getStringAttribute('viewpoint'))
      .setType('Choice')
      .setLabel(_('Viewpoint'))
      .addExtraInfo('Top-Down')
      .addExtraInfo('Isometry 2:1 (26.565°)')
      .addExtraInfo('True Isometry (30°)')
      .setGroup(_("Path finding (polygonal mesh based)"));

    sharedProperties
      .getOrCreate('cellSize')
      .setValue(sharedContent.getDoubleAttribute('cellSize').toString(10))
      .setType('Number')
      .setLabel(_('Cell size'))
      .setDescription(
        _('Cell size for obstacle collision mask rasterization.')
      )
      .setGroup(_("Path finding (polygonal mesh based)"));

    sharedProperties
      .getOrCreate('areaLeftBound')
      .setValue(sharedContent.getDoubleAttribute('areaLeftBound').toString(10))
      .setType('Number')
      .setLabel(_('Area left bound'))
      .setDescription(
        _(
          'The left bound of the area where objects can go (default to the game resolution).'
        )
      )
      .setGroup(_("Path finding (polygonal mesh based)"));

    sharedProperties
      .getOrCreate('areaTopBound')
      .setValue(sharedContent.getDoubleAttribute('areaTopBound').toString(10))
      .setType('Number')
      .setLabel(_('Area top bound'))
      .setDescription(
        _(
          'The top bound of the area where objects can go (default to the game resolution).'
        )
      )
      .setGroup(_("Path finding (polygonal mesh based)"));

    sharedProperties
      .getOrCreate('areaRightBound')
      .setValue(sharedContent.getDoubleAttribute('areaRightBound').toString(10))
      .setType('Number')
      .setLabel(_('Area right bound'))
      .setDescription(
        _(
          'The right bound of the area where objects can go (default to the game resolution).'
        )
      )
      .setGroup(_("Path finding (polygonal mesh based)"));

    sharedProperties
      .getOrCreate('areaBottomBound')
      .setValue(
        sharedContent.getDoubleAttribute('areaBottomBound').toString(10)
      )
      .setType('Number')
      .setLabel(_('Area bottom bound'))
      .setDescription(
        _(
          'The bottom bound of the area where objects can go (default to the game resolution).'
        )
      )
      .setGroup(_("Path finding (polygonal mesh based)"));

    return sharedProperties;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  sharedData.initializeContent = function (behaviorContent) {
    behaviorContent.setStringAttribute('viewpoint', 'Top-Down');
    behaviorContent.setDoubleAttribute('cellSize', 10);
    behaviorContent.setDoubleAttribute('areaLeftBound', 0);
    behaviorContent.setDoubleAttribute('areaTopBound', 0);
    behaviorContent.setDoubleAttribute('areaRightBound', 0);
    behaviorContent.setDoubleAttribute('areaBottomBound', 0);
  };

  return sharedData;
}

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'NavMeshPathfinding',
      _('Pathfinding (polygonal mesh based, experimental)'),
      _(
        'Pathfinding allows to compute an efficient path for objects, avoiding obstacles on the way.'
      ),
      'D8H',
      'MIT'
    );

    extension
    .addAction(
      'SetNavMeshesUpdateEnabled',
      _('Enable or disable navigation meshes updates'),
      _('Enable or disable navigation meshes updates.'),
      _(
        'Enable navigation meshes update: _PARAM1_'
      ),
      '',
      'CppPlatform/Extensions/AStaricon24.png',
      'CppPlatform/Extensions/AStaricon16.png'
    )
    .addCodeOnlyParameter('currentScene', '')
    .addParameter('yesorno', _('Enable updates?'))
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.setNavMeshesUpdateEnabled');

    extension
      .addCondition(
        'NavMeshesUpdateIsEnabled',
        _('Navigation meshes updates are enabled'),
        _('Check if navigation meshes updates are enabled.'),
        _('Navigation meshes updates are enabled'),
        _(''),
        'CppPlatform/Extensions/AStaricon24.png',
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .markAsAdvanced()
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.navMeshesUpdateIsEnabled');

    extension
      .addAction(
        'SetAreaBounds',
        _('Area bounds'),
        _('Change the bounds of the area where objects can go.'),
        _(
          'Change the NavMesh area to left: _PARAM1_, top: _PARAM2_, right: _PARAM3_, bottom: _PARAM4_'
        ),
        '',
        'CppPlatform/Extensions/AStaricon24.png',
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('expression', _('Area left bound'))
      .addParameter('expression', _('Area top bound'))
      .addParameter('expression', _('Area right bound'))
      .addParameter('expression', _('Area bottom bound'))
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.setAreaBounds');

      extension
        .addAction(
          'SetCellSize',
          _('Cell size'),
          _('Change the cell size for obstacle collision mask rasterization.'),
          _(
            'Change the obstacle rasterization cell size: _PARAM1_'
          ),
          '',
          'CppPlatform/Extensions/AStaricon24.png',
          'CppPlatform/Extensions/AStaricon16.png'
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('expression', _('Cell size'))
        .getCodeExtraInformation()
        .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.setCellSize');

    extension
      .addExpression(
        'AreaLeftBound',
        _('Area left bound'),
        _('Get the left bound of the area where objects can go.'),
        _('Pathfinding configuration (NavMesh)'),
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.getAreaLeftBound');

    extension
      .addExpression(
        'AreaTopBound',
        _('Area top bound'),
        _('Get the top bound of the area where objects can go.'),
        _('Pathfinding configuration (NavMesh)'),
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.getAreaLeftBound');

    extension
      .addExpression(
        'AreaRightBound',
        _('Area right bound'),
        _('Get the right bound of the area where objects can go.'),
        _('Pathfinding configuration (NavMesh)'),
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.getAreaLeftBound');

    extension
      .addExpression(
        'AreaBottomBound',
        _('Area bottom bound'),
        _('Get the bottom bound of the area where objects can go.'),
        _('Pathfinding configuration (NavMesh)'),
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.getAreaLeftBound');
    
    extension
      .addExpression(
        'CellSize',
        _('Cell size'),
        _('Get the cell size for obstacle collision mask rasterization.'),
        _('Pathfinding configuration (NavMesh)'),
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.NavMeshPathfindingObstaclesManager.getCellSize');

    declarePathfindingBehavior(_, gd, extension);
    const sharedData = declareSharedData(_, gd);
    declareObstacleBehavior(_, gd, extension, sharedData);

    return extension;
  },

  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    const pathfindingBehavior = extension
      .getBehaviorMetadata('NavMeshPathfinding::NavMeshPathfindingBehavior')
      .get();
    return [
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'acceleration',
        '1000'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'maxSpeed',
        '1000'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'angularMaxSpeed',
        '1000'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'rotateObject',
        'false'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'angleOffset',
        '45'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'collisionShape',
        'Dot at center'
      ),
      gd.ProjectHelper.sanityCheckBehaviorProperty(
        pathfindingBehavior,
        'extraBorder',
        '100'
      ),
    ];
  },
};