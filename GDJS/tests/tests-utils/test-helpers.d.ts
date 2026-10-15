// Types of the helpers that the test files add to the `gdjs` namespace
// (see `tests/Extensions/` and `tests-utils/`).
// TypeScript 7 does not create declarations from assignments like
// `gdjs.TestRuntimeObject = class ...` done in JavaScript files,
// so they are declared here.

declare namespace gdjs {
  type TestProjectDataSettings = {
    layouts?: LayoutData[];
    resources?: ResourcesData;
    propertiesOverrides?: Partial<ProjectPropertiesData>;
  };

  /** See `tests-utils/init.pixiruntimegame.js`. */
  var createProjectData: (settings?: TestProjectDataSettings) => ProjectData;

  /** See `tests-utils/init.pixiruntimegame.js`. */
  var getPixiRuntimeGame: (settings?: TestProjectDataSettings) => RuntimeGame;

  /** See `tests-utils/init.pixiruntimegamewithassets.js`. */
  var getPixiRuntimeGameWithAssets: {
    (
      props?: {
        customObjectInstances?: Array<InstanceData>;
      } | null
    ): Promise<RuntimeGame>;
    _pixiRuntimeGameWithAssetsPromise?: Promise<RuntimeGame> | null;
  };

  /** See `tests/Extensions/TestRuntimeScene.js`. */
  interface TestRuntimeScene extends RuntimeScene {
    renderAndStepWithEventsFunction(
      elapsedTime: float,
      eventsFunction: () => void
    ): void;
    registerEmptyObjectWithName(name: string): void;
    createObject(name: string): RuntimeObject;
  }
  var TestRuntimeScene: {
    new (runtimeGame: RuntimeGame): TestRuntimeScene;
  };

  /** See `tests/Extensions/testruntimeobject.js`. */
  interface TestRuntimeObject extends RuntimeObject {
    _customWidth: float;
    _customHeight: float;
    _customCenterX: float | null;
    _customCenterY: float | null;
    setCustomWidthAndHeight(customWidth: float, customHeight: float): void;
    setCustomCenter(customCenterX: float, customCenterY: float): void;
  }
  var TestRuntimeObject: {
    new (
      runtimeScene: RuntimeInstanceContainer,
      objectData: ObjectData & any
    ): TestRuntimeObject;
  };

  /** See `tests/Extensions/testspriteruntimeobject.js`. */
  interface TestSpriteRuntimeObject extends SpriteRuntimeObject {
    _customWidth: float;
    _customHeight: float;
    _unscaledWidth: float;
    _unscaledHeight: float;
    _customCenterX: float | null;
    _customCenterY: float | null;
    setCustomWidthAndHeight(customWidth: float, customHeight: float): void;
    setUnscaledWidthAndHeight(
      unscaledWidth: float,
      unscaledHeight: float
    ): void;
    setCustomCenter(customCenterX: float, customCenterY: float): void;
  }
  var TestSpriteRuntimeObject: {
    new (
      runtimeScene: RuntimeInstanceContainer,
      objectData: ObjectData & any
    ): TestSpriteRuntimeObject;
  };

  /** See `tests/Extensions/testruntimeobjectwithfakerenderer.js`. */
  var TestRuntimeObjectWithFakeRenderer: {
    new (
      runtimeScene: RuntimeInstanceContainer,
      objectData: ObjectData
    ): RuntimeObject;
  };

  /** See `tests/Extensions/testruntimebehavior.js`. */
  var TestRuntimeBehavior: {
    new (
      runtimeScene: RuntimeInstanceContainer,
      behaviorData: BehaviorData,
      owner: RuntimeObject
    ): RuntimeBehavior;
  };

  /** See `tests/Extensions/MockedResourceLoader.js`. */
  interface MockedResourceManager extends ResourceManager {
    isResourceDownloadPending(resourceName: string): boolean;
    markPendingResourcesAsLoaded(resourceName: string): void;
    isResourceLoaded(resourceName: string): boolean;
    isResourceDisposed(resourceName: string): boolean;
  }
  var MockedResourceManager: {
    new (): MockedResourceManager;
  };
}
