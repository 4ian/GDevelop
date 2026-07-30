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
        return false;
      };
      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();
        return sharedProperties;
      };
      sharedData.initializeContent = function (behaviorContent) {};

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

      aut.addAction("MoveTo",
                    _("Move to a position"),
                    _("Move the object to a position"),
                    _("Move _PARAM0_ to _PARAM2_ ; _PARAM3_ ; _PARAM4_"),
                    _("Movement on the path"),
                    "CppPlatform/Extensions/AStaricon24.png",
                    "CppPlatform/Extensions/AStaricon16.png")
          .addParameter("object", _("Object"))
          .addParameter("behavior", _("Behavior"), "NavMeshCharacterBehavior")
          .addParameter("expression", _("Destination X position"))
          .addParameter("expression", _("Destination Y position"))
          .addParameter("expression", _("Destination Z position"))
          .setFunctionName("moveTo");
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
      sharedData.initializeContent = function (behaviorContent) {};

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

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
