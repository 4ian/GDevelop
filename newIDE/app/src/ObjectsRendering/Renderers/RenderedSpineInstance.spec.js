// @flow
import * as PIXI from 'pixi.js-legacy';
// $FlowFixMe[cannot-resolve-module]
const JsExtension = require('../../../../../Extensions/Spine/JsExtension.js');

const gd: any = global.gd;

describe('RenderedSpineInstance', () => {
  let registeredRenderer: any = null;
  const objectsRenderingService = {
    PIXI,
    RenderedInstance: class MockRenderedInstance {
      _project: any;
      _instance: any;
      _associatedObjectConfiguration: any;
      _pixiContainer: any;
      _pixiResourcesLoader: any;
      _wasDestroyed: boolean;

      constructor(
        project: any,
        instance: any,
        associatedObjectConfiguration: any,
        pixiContainer: any,
        pixiResourcesLoader: any
      ) {
        this._project = project;
        this._instance = instance;
        this._associatedObjectConfiguration = associatedObjectConfiguration;
        this._pixiContainer = pixiContainer;
        this._pixiResourcesLoader = pixiResourcesLoader;
        this._wasDestroyed = false;
      }
      getWidth(): number {
        return 256;
      }
      getHeight(): number {
        return 256;
      }
      onRemovedFromScene() {
        this._wasDestroyed = true;
      }
      update() {}
      static toRad(deg: number): number {
        return (deg / 180) * Math.PI;
      }
    },
    gd,
    registerInstanceRenderer: (type: string, renderer: any) => {
      registeredRenderer = renderer;
    },
  };

  beforeAll(() => {
    JsExtension.registerInstanceRenderers(objectsRenderingService);
  });

  const createMockInstance = () => ({
    getX: () => 0,
    getY: () => 0,
    getAngle: () => 0,
    getOpacity: () => 255,
    isFlippedX: () => false,
    isFlippedY: () => false,
    getRawDoubleProperty: (name: string) => 0,
  });

  it('initializes with a visible placeholder and does not prematurely load spine in constructor', () => {
    let createSpineCalls = [];
    const mockPixiResourcesLoader = {
      getInvalidPIXITexture: () => PIXI.Texture.EMPTY,
      createSpine: async (proj: any, resourceName: string) => {
        createSpineCalls.push(resourceName);
        return null;
      },
    };

    let currentResource = '';
    const mockConfig = {
      getSpineResourceName: () => currentResource,
      getSkinName: () => 'default',
      getScale: () => 1,
      hasNoAnimations: () => true,
    };
    gd.castObject = () => mockConfig;
    gd.asSpineConfiguration = () => mockConfig;

    const pixiContainer = new PIXI.Container();
    // $FlowFixMe[not-a-function]
    const renderer = new registeredRenderer(
      {},
      createMockInstance(),
      {},
      pixiContainer,
      mockPixiResourcesLoader
    );

    expect(createSpineCalls).toEqual([]);
    expect(renderer._placeholder.alpha).toBe(1);

    renderer.update();
    expect(createSpineCalls).toEqual([]);
    expect(renderer._placeholder.alpha).toBe(1);
  });

  it('shows placeholder (alpha = 1) when loading fails or resolves to null', async () => {
    let createSpineCalls = [];
    const mockPixiResourcesLoader = {
      getInvalidPIXITexture: () => PIXI.Texture.EMPTY,
      createSpine: async (proj: any, resourceName: string) => {
        createSpineCalls.push(resourceName);
        return null;
      },
    };

    let currentResource = 'invalid-card.json';
    const mockConfig = {
      getSpineResourceName: () => currentResource,
      getSkinName: () => 'default',
      getScale: () => 1,
      hasNoAnimations: () => true,
    };
    gd.castObject = () => mockConfig;
    gd.asSpineConfiguration = () => mockConfig;

    const pixiContainer = new PIXI.Container();
    // $FlowFixMe[not-a-function]
    const renderer = new registeredRenderer(
      {},
      createMockInstance(),
      {},
      pixiContainer,
      mockPixiResourcesLoader
    );

    renderer.update();
    expect(createSpineCalls).toEqual(['invalid-card.json']);

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(renderer._placeholder.alpha).toBe(1);
    expect(renderer._spine).toBeNull();
  });

  it('catches loader rejection and keeps placeholder visible (alpha = 1)', async () => {
    const mockPixiResourcesLoader = {
      getInvalidPIXITexture: () => PIXI.Texture.EMPTY,
      createSpine: async (proj: any, resourceName: string) => {
        throw new Error('Network error loading Spine');
      },
    };

    let currentResource = 'broken.json';
    const mockConfig = {
      getSpineResourceName: () => currentResource,
      getSkinName: () => 'default',
      getScale: () => 1,
      hasNoAnimations: () => true,
    };
    gd.castObject = () => mockConfig;
    gd.asSpineConfiguration = () => mockConfig;

    const pixiContainer = new PIXI.Container();
    // $FlowFixMe[not-a-function]
    const renderer = new registeredRenderer(
      {},
      createMockInstance(),
      {},
      pixiContainer,
      mockPixiResourcesLoader
    );

    renderer.update();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(renderer._placeholder.alpha).toBe(1);
    expect(renderer._spine).toBeNull();
  });

  it('hides placeholder (alpha = 0) when spine loads successfully', async () => {
    let spineDestroyCalled = false;
    const mockPixiResourcesLoader = {
      getInvalidPIXITexture: () => PIXI.Texture.EMPTY,
      createSpine: async (proj: any, resourceName: string) => {
        const container = new PIXI.Container();
        // $FlowFixMe[prop-missing]
        container.skeleton = {
          setSkinByName: () => {},
          setSlotsToSetupPose: () => {},
        };
        const origDestroy = container.destroy.bind(container);
        container.destroy = (opts: any) => {
          spineDestroyCalled = true;
          origDestroy(opts);
        };
        return container;
      },
    };

    let currentResource = 'card.json';
    const mockConfig = {
      getSpineResourceName: () => currentResource,
      getSkinName: () => 'default',
      getScale: () => 1,
      hasNoAnimations: () => true,
    };
    gd.castObject = () => mockConfig;
    gd.asSpineConfiguration = () => mockConfig;

    const pixiContainer = new PIXI.Container();
    // $FlowFixMe[not-a-function]
    const renderer = new registeredRenderer(
      {},
      createMockInstance(),
      {},
      pixiContainer,
      mockPixiResourcesLoader
    );

    renderer.update();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(renderer._placeholder.alpha).toBe(0);
    expect(renderer._spine).not.toBeNull();
    expect(renderer._pixiObject.children).toContain(renderer._spine);

    // When changing back to empty, spine is removed and destroyed, placeholder is restored to alpha = 1
    currentResource = '';
    renderer.update();
    expect(renderer._placeholder.alpha).toBe(1);
    expect(renderer._spine).toBeNull();
    expect(spineDestroyCalled).toBe(true);
  });
});
