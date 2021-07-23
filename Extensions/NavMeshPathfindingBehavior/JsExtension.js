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
  extension /*: PlatformExtension */
) {
  const pathfindingBehavior = new gd.BehaviorJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.updateProperty = function (
    behaviorContent,
    propertyName,
    newValue
  ) {
    if (propertyName === 'Acceleration') {
      behaviorContent.setDoubleAttribute('acceleration', newValue);
      return true;
    }
    if (propertyName === 'Max. speed') {
      behaviorContent.setDoubleAttribute('maxSpeed', newValue);
      return true;
    }
    if (propertyName === 'Rotate speed') {
      behaviorContent.setDoubleAttribute('angularMaxSpeed', newValue);
      return true;
    }
    if (propertyName === 'Rotate object') {
      behaviorContent.setBoolAttribute('rotateObject', newValue === '1');
      return true;
    }
    if (propertyName === 'Angle offset') {
      behaviorContent.setDoubleAttribute('angleOffset', newValue);
      return true;
    }

    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.getProperties = function (behaviorContent) {
    const behaviorProperties = new gd.MapStringPropertyDescriptor();

    behaviorProperties
      .getOrCreate('Acceleration')
      .setValue(behaviorContent.getDoubleAttribute('acceleration').toString());

    behaviorProperties
      .getOrCreate('Max. speed')
      .setValue(behaviorContent.getDoubleAttribute('maxSpeed').toString());

    behaviorProperties
      .getOrCreate('Rotate speed')
      .setValue(
        behaviorContent.getDoubleAttribute('angularMaxSpeed').toString()
      );

    behaviorProperties
      .getOrCreate('Rotate object')
      .setValue(
        behaviorContent.getBoolAttribute('rotateObject') ? 'true' : 'false'
      )
      .setType('Boolean');

    behaviorProperties
      .getOrCreate('Angle offset')
      .setValue(behaviorContent.getDoubleAttribute('angleOffset').toString());

    return behaviorProperties;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating a behavior
  pathfindingBehavior.initializeContent = function (behaviorContent) {
    behaviorContent.setDoubleAttribute('acceleration', 400);
    behaviorContent.setDoubleAttribute('maxSpeed', 200);
    behaviorContent.setDoubleAttribute('angularMaxSpeed', 180);
    behaviorContent.setBoolAttribute('rotateObject', true);
    behaviorContent.setDoubleAttribute('angleOffset', 0);
  };
  const pathfindingBehaviorDeclaration = extension
    .addBehavior(
      'NavMeshPathfindingBehavior',
      _('NavMesh Pathfinding'),
      'NavMeshPathfindingBehavior',
      _(
        'With this behavior, the object will move while avoiding all objects' +
          'that are flagged as obstacles.'
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
      _('Draw navigation mesh'),
      _('Draw navigation mesh used for _PARAM0_ on _PARAM2_'),
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
    //TODO tried Drawer, PrimitiveDrawing::Drawer, ShapePainterObject
    .addParameter('objectPtr', _('Shape painter'), '', false)
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('drawNavMesh');

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
    .setFunctionName('pathFound');

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
      _('Speed'),
      _('the speed of the object on the path'),
      _('the speed on the path'),
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
    .useStandardParameters('number');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'Acceleration',
      _('Acceleration'),
      _('the acceleration when moving the object'),
      _('the acceleration on the path'),
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
    .useStandardParameters('number');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'MaxSpeed',
      _('Maximum speed'),
      _('the maximum speed when moving the object'),
      _('the max. speed on the path'),
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
    .useStandardParameters('number');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'AngularMaxSpeed',
      _('Angular maximum speed'),
      _('the maximum angular speed when moving the object'),
      _('the max. angular speed on the path'),
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
    .useStandardParameters('number');

  pathfindingBehaviorDeclaration
    .addExpressionAndConditionAndAction(
      'number',
      'AngleOffset',
      _('Rotation offset'),
      _('the rotation offset applied when moving the object'),
      _('the rotation offset on the path'),
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
    .useStandardParameters('number');

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
    .useStandardParameters('number');

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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      'LastNodeX',
      _('Last waypoint X position'),
      _('Last waypoint X position'),
      _('Movement on the path'),
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
    .setFunctionName('getLastNodeX');

  pathfindingBehaviorDeclaration
    .addExpression(
      'LastNodeY',
      _('Last waypoint Y position'),
      _('Last waypoint Y position'),
      _('Movement on the path'),
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
    .setFunctionName('getLastNodeY');

  pathfindingBehaviorDeclaration
    .addExpression(
      'DestinationX',
      _('Destination X position'),
      _('Destination X position'),
      _('Movement on the path'),
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
      _('Movement on the path'),
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
      _('Movement on the path'),
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
  extension /*: PlatformExtension */
) {
  //TODO Add some kind of layer to select the obstacles for an object?
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
      _('Obstacle for NavMesh pathfinding'),
      'NavMeshPathfindingObstacleBehavior',
      _('Flag the object as being an obstacle for pathfinding.'),
      '',
      'CppPlatform/Extensions/pathfindingobstacleicon.png',
      'NavMeshPathfindingObstacleBehavior',
      pathfindingObstacleBehavior,
      new gd.BehaviorsSharedData()
    )
    .setIncludeFile(
      'Extensions/NavMeshPathfindingBehavior/navmeshpathfindingobstacleruntimebehavior.js'
    );
};

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'NavMeshPathfinding',
      _('NavMesh Pathfinding behavior'),
      _(
        'Pathfinding allows to compute an efficient path for objects, avoiding obstacles on the way.'
      ),
      'D8H',
      'MIT'
    );

    extension
      .registerProperty('Viewpoint')
      .setLabel(_('Viewpoint'))
      .setDescription(_('Viewpoint of the game.'))
      .setType('Choice')
      .addExtraInfo(_('Top-Down'))
      .addExtraInfo(_('Isometry 2:1 (26.565°)'))
      .addExtraInfo(_('True Isometry (30°)'));

    extension
      .registerProperty('CellSize')
      .setLabel(_('Cell size'))
      .setDescription(_('Cell size for obstacle collision mask rasterization.'))
      .setType('number');

    extension
      .registerProperty('AreaLeftBound')
      .setLabel(_('Area left bound'))
      .setDescription(_('The left bound of the area where object can go.'))
      .setType('number');

    extension
      .registerProperty('AreaTopBound')
      .setLabel(_('Area top bound'))
      .setDescription(_('The top bound of the area where object can go.'))
      .setType('number');

    extension
      .registerProperty('AreaRightBound')
      .setLabel(_('Area right bound'))
      .setDescription(_('The right bound of the area where object can go.'))
      .setType('number');

    extension
      .registerProperty('AreaBottomBound')
      .setLabel(_('Area bottom bound'))
      .setDescription(_('The bottom bound of the area where object can go.'))
      .setType('number');

    extension
      .addAction(
        'InvalidateNavMesh',
        _('Invalidate the navigation mesh'),
        _('Invalidate the navigation mesh'),
        _('Invalidate the navigation mesh'),
        '',
        'CppPlatform/Extensions/AStaricon24.png',
        'CppPlatform/Extensions/AStaricon16.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setFunctionName(
        'gdjs.NavMeshPathfindingObstaclesManager.invalidateNavMesh'
      );

    declarePathfindingBehavior(_, gd, extension);
    declareObstacleBehavior(_, gd, extension);

    return extension;
  },

  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
