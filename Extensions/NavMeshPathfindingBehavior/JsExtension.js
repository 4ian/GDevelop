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

    // Register Cordova/NPM dependencies
    extension
      .addDependency()
      .setName('NavMesh')
       .setDependencyType('npm')
       .setExportName('navmesh')
       .setVersion('2.3.0');

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
      if (propertyName === 'Acceleration') {
        behaviorContent.setStringAttribute('acceleration', newValue);
        return true;
      }
      if (propertyName === 'Max. speed') {
        behaviorContent.setStringAttribute('maxSpeed', newValue);
        return true;
      }
      if (propertyName === 'Rotate speed') {
        behaviorContent.setStringAttribute('angularMaxSpeed', newValue);
        return true;
      }
      if (propertyName === 'Rotate object') {
        behaviorContent.setBoolAttribute('rotateObject', newValue === '1');
        return true;
      }
      if (propertyName === 'Angle offset') {
        behaviorContent.setStringAttribute('angleOffset', newValue);
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    pathfindingBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('Acceleration')
        .setValue(behaviorContent.getStringAttribute('acceleration'));

      behaviorProperties
        .getOrCreate('Max. speed')
        .setValue(behaviorContent.getStringAttribute('maxSpeed'));

      behaviorProperties
        .getOrCreate('Rotate speed')
        .setValue(behaviorContent.getStringAttribute('angularMaxSpeed'));

      behaviorProperties
        .getOrCreate('Rotate object')
        .setValue(
          behaviorContent.getBoolAttribute('rotateObject') ? 'true' : 'false'
        )
        .setType('Boolean');

      behaviorProperties
        .getOrCreate('Angle offset')
        .setValue(behaviorContent.getStringAttribute('angleOffset'));

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
      .setIncludeFile('Extensions/NavMeshPathfindingBehavior/navmeshpathfindingruntimebehavior.js')
      .addIncludeFile('Extensions/NavMeshPathfindingBehavior/A_navmeshall.js')
      .addIncludeFile('Extensions/NavMeshPathfindingBehavior/A_navmeshgenerator.js');

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
    .addExpression("NodeCount",
                      _("Waypoint count"),
                      _("Get the number of waypoints on the path"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'NavMeshPathfindingBehavior',
        false
      )
      .getCodeExtraInformation()
        .setFunctionName("getNodeCount");


        pathfindingBehaviorDeclaration.addExpression("GetNodeX",
        _("Get a waypoint X position"),
        _("Get next waypoint X position"),
        _("Movement on the path"),
        "CppPlatform/Extensions/AStaricon16.png")
        .addParameter('object', _('Object'), '', false)
        .addParameter(
          'behavior',
          _('Behavior'),
          'NavMeshPathfindingBehavior',
          false
        )
.addParameter("expression", _("Node index (start at 0!)"), '', false)
.getCodeExtraInformation()
.setFunctionName("getNodeX");

pathfindingBehaviorDeclaration.addExpression("GetNodeY",
        _("Get a waypoint Y position"),
        _("Get next waypoint Y position"),
        _("Movement on the path"),
        "CppPlatform/Extensions/AStaricon16.png")
        .addParameter('object', _('Object'), '', false)
        .addParameter(
          'behavior',
          _('Behavior'),
          'NavMeshPathfindingBehavior',
          false
        )
.addParameter("expression", _("Node index (start at 0!)"), '', false)
.getCodeExtraInformation()
.setFunctionName("getNodeY");


    pathfindingBehaviorDeclaration
    .addExpression("NextNodeX",
                      _("Get next waypoint X position"),
                      _("Get next waypoint X position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'NavMeshPathfindingBehavior',
        false
      )
      .getCodeExtraInformation()
        .setFunctionName("getNextNodeX");

    pathfindingBehaviorDeclaration
    .addExpression("NextNodeY",
                      _("Get next waypoint Y position"),
                      _("Get next waypoint Y position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'NavMeshPathfindingBehavior',
        false
      )
      .getCodeExtraInformation()
        .setFunctionName("getNextNodeY");


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
