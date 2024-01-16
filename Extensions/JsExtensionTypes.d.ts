declare type GDNamespace = typeof import('../GDevelop.js/types');

declare type ObjectsRenderingService = {
  gd: GDNamespace;
  PIXI: typeof import('../newIDE/app/node_modules/pixi.js');
  THREE: typeof import('../newIDE/app/node_modules/three');
  THREE_ADDONS: { SkeletonUtils: any };
  RenderedInstance: any;
  Rendered3DInstance: any;
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
