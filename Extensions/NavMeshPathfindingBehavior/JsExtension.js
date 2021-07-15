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

    // Declare a behavior.
    // Create a new gd.BehaviorJsImplementation object and implement the methods
    // that are called to get and set the properties of the behavior.
    // Everything that is stored inside the behavior is in "behaviorContent" and is automatically
    // saved/loaded to JSON.
    const pathfindingBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    pathfindingBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      console.log("updateProperty: " + propertyName);
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
      if (propertyName === 'Cell size') {
        behaviorContent.setDoubleAttribute('cellSize', newValue);
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    pathfindingBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('Acceleration')
        .setValue(
          behaviorContent.getDoubleAttribute('acceleration').toString()
        );

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

        //TODO make it an extension property
      behaviorProperties
        .getOrCreate('Cell size')
        .setValue(behaviorContent.getDoubleAttribute('cellSize').toString());

      return behaviorProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    pathfindingBehavior.initializeContent = function (behaviorContent) {
      behaviorContent.setDoubleAttribute('acceleration', 400);
      behaviorContent.setDoubleAttribute('maxSpeed', 200);
      behaviorContent.setDoubleAttribute('angularMaxSpeed', 180);
      behaviorContent.setBoolAttribute('rotateObject', true);
      behaviorContent.setDoubleAttribute('angleOffset', 0);
      behaviorContent.setDoubleAttribute('cellSize', 20);
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

    // Declare a behavior.
    // Create a new gd.BehaviorJsImplementation object and implement the methods
    // that are called to get and set the properties of the behavior.
    // Everything that is stored inside the behavior is in "behaviorContent" and is automatically
    // saved/loaded to JSON.
    const pathfindingObstacleBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    pathfindingBehavior.updateProperty = function (
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
    pathfindingObstacleBehavior.initializeContent = function (
      behaviorContent
    ) {};
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

    pathfindingBehaviorDeclaration
      .addAction(
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
      .addAction(
        'DrawCells',
        _('Draw cells'),
        _('Draw cells'),
        _('Draw cells on _PARAM2_'),
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
      .addParameter('objectPtr', _('Shape painter'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('drawCells');

    pathfindingBehaviorDeclaration
      .addCondition(
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
      .addCondition(
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
      .addCondition(
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
      .addExpressionAndConditionAndAction(
        'number',
        'CellSize',
        _('Cell size'),
        _('Size of the cells used to build the navigation mesh'),
        _('Size of the cells used to build the navigation mesh'),
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
