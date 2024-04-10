type GDNamespace = typeof import('../GDevelop.js/types');

// This is necessary for typescript to interpret the identifier PIXI as a namespace
// in this file and merge it with the other namespace declarations.
declare namespace PIXI {}

/**
 * RenderedInstance is the base class used for creating 2D renderers of instances,
 * which display on the scene editor, using Pixi.js, the instance of an object (see InstancesEditor).
 */
class RenderedInstance {
  _project: gd.Project;
  _layout: gd.Layout;
  _instance: gd.InitialInstance;
  _associatedObjectConfiguration: gd.ObjectConfiguration;
  _pixiContainer: PIXI.Container;
  _pixiResourcesLoader: Class<PixiResourcesLoader>;
  _pixiObject: PIXI.DisplayObject;
  wasUsed: boolean;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  );

  /**
   * Convert an angle from degrees to radians.
   */
  static toRad(angleInDegrees: number): number;

  /**
   * Called when the scene editor is rendered.
   */
  update(): void;

  getPixiObject(): PIXI.DisplayObject | null;

  getInstance(): gd.InitialInstance;

  /**
   * Called to notify the instance renderer that its associated instance was removed from
   * the scene. The PIXI object should probably be removed from the container: This is what
   * the default implementation of the method does.
   */
  onRemovedFromScene(): void;

  getOriginX(): number;

  getOriginY(): number;

  getCenterX(): number;

  getCenterY(): number;

  getCustomWidth(): number;

  getCustomHeight(): number;

  getWidth(): number;

  getHeight(): number;

  getDepth(): number;

  /**
   * Return the width of the instance when the instance doesn't have a custom size.
   */
  getDefaultWidth(): number;

  /**
   * Return the height of the instance when the instance doesn't have a custom size.
   */
  getDefaultHeight(): number;

  getDefaultDepth(): number;
}

/**
 * Rendered3DInstance is the base class used for creating 3D renderers of instances,
 * which display on the scene editor, using Three.js, the instance of an object (see InstancesEditor).
 * It can also display 2D artifacts on Pixi 2D plane (3D object shadow projected on the plane for instance).
 */
class Rendered3DInstance {
  _project: gdProject;
  _layout: gdLayout;
  _instance: gdInitialInstance;
  _associatedObjectConfiguration: gdObjectConfiguration;
  _pixiContainer: PIXI.Container;
  _threeGroup: THREE.Group;
  _pixiResourcesLoader: Class<PixiResourcesLoader>;
  _pixiObject: PIXI.DisplayObject;
  _threeObject: THREE.Object3D | null;
  wasUsed: boolean;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  );

  /**
   * Convert an angle from degrees to radians.
   */
  static toRad(angleInDegrees: number): number;

  /**
   * Applies ratio to value without intermediary value to avoid precision issues.
   */
  static applyRatio({
    oldReferenceValue,
    newReferenceValue,
    valueToApplyTo,
  }: {
    oldReferenceValue: number;
    newReferenceValue: number;
    valueToApplyTo: number;
  }): number;

  /**
   * Called when the scene editor is rendered.
   */
  update(): void;

  getPixiObject(): PIXI.DisplayObject;

  getThreeObject(): THREE.Object3D;

  getInstance(): gd.InitialInstance;

  /**
   * Called to notify the instance renderer that its associated instance was removed from
   * the scene. The PIXI object should probably be removed from the container: This is what
   * the default implementation of the method does.
   */
  onRemovedFromScene(): void;

  getOriginX(): number;

  getOriginY(): number;

  getCenterX(): number;

  getCenterY(): number;

  getWidth(): number;

  getHeight(): number;

  getDepth(): number;

  /**
   * Return the width of the instance when the instance doesn't have a custom size.
   */
  getDefaultWidth(): number;

  /**
   * Return the height of the instance when the instance doesn't have a custom size.
   */
  getDefaultHeight(): number;

  /**
   * Return the depth of the instance when the instance doesn't have a custom size.
   */
  getDefaultDepth(): number;
}

declare type ObjectsRenderingService = {
  gd: GDNamespace;
  PIXI: PIXI;
  THREE: typeof import('../newIDE/app/node_modules/three');
  THREE_ADDONS: { SkeletonUtils: any };
  RenderedInstance: typeof RenderedInstance;
  Rendered3DInstance: typeof Rendered3DInstance;
  registerInstanceRenderer: (objectType: string, renderer: any) => void;
  registerInstance3DRenderer: (objectType: string, renderer: any) => void;
  requireModule: (dirname: string, moduleName: string) => any;
  getThumbnail: (
    project: gd.Project,
    objectConfiguration: gd.ObjectConfiguration
  ) => string;
  rgbOrHexToHexNumber: (value: string) => number;
  registerClearCache: (clearCache: (_: any) => void) => void;
};

declare type ObjectsEditorService = {
  registerEditorConfiguration: (
    objectType: string,
    editorConfiguration: any
  ) => void;
  getDefaultObjectJsImplementationPropertiesEditor: ({
    helpPagePath: string,
  }) => any;
};

declare type ExtensionModule = {
  createExtension: (
    _: (string) => string,
    gd: GDNamespace
  ) => gd.PlatformExtension;
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instantiating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: (
    gd: GDNamespace,
    extension: gd.PlatformExtension
  ) => string[];
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations?: (
    objectsEditorService: ObjectsEditorService
  ) => void;
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers?: (
    objectsRenderingService: ObjectsRenderingService
  ) => void;
};
