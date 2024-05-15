type GDNamespace = typeof import('../GDevelop.js/types');

// This is necessary for typescript to interpret the identifier PIXI as a namespace
// in this file and merge it with the other namespace declarations.
declare namespace PIXI {}

/**
 * Expose functions to load PIXI textures or fonts, given the names of
 * resources and a gd.Project.
 */
declare class PixiResourcesLoader {
  burstCache();

  async reloadResource(project: gd.Project, resourceName: string);

  /**
   * Reload the given resources.
   */
  async reloadResources(
    project: gd.Project,
    resourceNames: Array<string>
  ): Promise<void>;

  /**
   * Return the PIXI texture represented by the given resource.
   * If not loaded, it will load it.
   */
  getPIXITexture(project: gd.Project, resourceName: string): PIXI.Texture;

  /**
   * Return the three.js texture associated to the specified resource name.
   * Returns a placeholder texture if not found.
   * @param project The project
   * @param resourceName The name of the resource
   * @returns The requested texture, or a placeholder if not found.
   */
  getThreeTexture(project: gd.Project, resourceName: string): THREE.Texture;

  /**
   * Return the three.js material associated to the specified resource name.
   * @param project The project
   * @param resourceName The name of the resource
   * @param options Set if the material should be transparent or not.
   * @returns The requested material.
   */
  getThreeMaterial(
    project: gd.Project,
    resourceName: string,
    { useTransparentTexture }: { useTransparentTexture: boolean }
  ): THREE.Material;

  /**
   * Return the three.js material associated to the specified resource name.
   * @param project The project
   * @param resourceName The name of the resource
   * @param options
   * @returns The requested material.
   */
  get3DModel(
    project: gd.Project,
    resourceName: string
  ): Promise<THREE.THREE_ADDONS.GLTF>;

  /**
   * Return the Pixi spine data for the specified resource name.
   * @param project The project
   * @param spineName The name of the spine json resource
   * @returns The requested spine skeleton.
   */
  async getSpineData(
    project: gd.Project,
    spineName: string
  ): Promise<SpineDataOrLoadingError>;

  /**
   * Return the PIXI video texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  getPIXIVideoTexture(project: gd.Project, resourceName: string): PIXI.Texture;

  /**
   * Load the given font from its url/filename.
   * @returns a Promise that resolves with the font-family to be used
   * to render a text with the font.
   */
  loadFontFamily(project: gd.Project, resourceName: string): Promise<string>;

  /**
   * Get the font family name for the given font resource.
   * The font won't be loaded.
   * @returns The font-family to be used to render a text with the font.
   */
  getFontFamily(project: gd.Project, resourceName: string): string;

  /**
   * Get the data from a bitmap font file (fnt/xml) resource in the IDE.
   */
  getBitmapFontData(project: gd.Project, resourceName: string): Promise<any>;

  getInvalidPIXITexture();

  getResourceJsonData(project: gd.Project, resourceName: string);
}

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
  _pixiResourcesLoader: PixiResourcesLoader;
  _pixiObject: PIXI.DisplayObject;
  wasUsed: boolean;

  constructor(
    project: gd.Project,
    layout: gd.Layout,
    instance: gd.InitialInstance,
    associatedObjectConfiguration: gd.ObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: PixiResourcesLoader
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
  _project: gd.Project;
  _layout: gd.Layout;
  _instance: gd.InitialInstance;
  _associatedObjectConfiguration: gd.ObjectConfiguration;
  _pixiContainer: PIXI.Container;
  _threeGroup: THREE.Group;
  _pixiResourcesLoader: PixiResourcesLoader;
  _pixiObject: PIXI.DisplayObject;
  _threeObject: THREE.Object3D | null;
  wasUsed: boolean;

  constructor(
    project: gd.Project,
    layout: gd.Layout,
    instance: gd.InitialInstance,
    associatedObjectConfiguration: gd.ObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: PixiResourcesLoader
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
