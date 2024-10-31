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
      return false;
    };
    sharedData.getProperties = function (sharedContent) {
      const sharedProperties = new gd.MapStringPropertyDescriptor();

      return sharedProperties;
    };
    sharedData.initializeContent = function (behaviorContent) {};

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
