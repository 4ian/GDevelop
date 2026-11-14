// Changes to the GDJS runtime so that it runs in ThreeRT. They are applied once the runtime and the game code are
// loaded (`installGDJSPatches`), without changing GDJS files:
// - the game renderer has no canvas, no WebGL: the PixiJS renderer is a stand-in, the game loop is run by ThreeRT's
//   frame script (`index.ts`), and the rendering of a scene is `ThreeRTView.renderScene`;
// - the loading screen draws nothing;
// - 3D models are not parsed: a model is a ThreeRT `GLTFModel` of the file, with bounds and animations from the
//   manifest;
// - Jolt (3D physics) is its JavaScript build (no WebAssembly in QuickJS).
import * as S from '@threert/scene';
import { AnimationClip, GLTFScene } from './three';
import { getFileInfo } from './manifest';
import { ThreeRTView } from './view';
import { gameViewport } from './browser';

declare const gdjs: any;
declare const PIXI: any;
const g = globalThis as any;

export type GameLoop = (elapsedTimeMs: number) => boolean;

export const threertState: {
  view: ThreeRTView | null;
  gameLoop: GameLoop | null;
  pointerLocked: boolean;
} = { view: null, gameLoop: null, pointerLocked: false };

/** A WebGLRenderer that renders nothing, with what GDJS reads from it. */
const createThreeRendererStub = () => {
  const renderer: any = new (S as any).WebGLRenderer();
  Object.assign(renderer, {
    xr: { enabled: false, isPresenting: false, addEventListener() {}, removeEventListener() {}, getSession: () => null },
    info: { autoReset: true, reset() {}, render: { calls: 0, triangles: 0, frame: 0 }, memory: { geometries: 0, textures: 0 } },
    capabilities: { isWebGL2: true, maxSamples: 4, maxTextureSize: 4096, getMaxAnisotropy: () => 1, precision: 'highp' },
    autoClear: true,
    sortObjects: true,
    localClippingEnabled: false,
    resetState() {},
    clear() {},
    clearDepth() {},
    setRenderTarget() {},
    getRenderTarget: () => null,
    setViewport() {},
    setScissor() {},
    setScissorTest() {},
    getContext: () => ({ getParameter: () => 4, getExtension: () => null, getContextAttributes: () => null, MAX_SAMPLES: 0x8d57 }),
    getDrawingBufferSize: (target: any) => target.set(gameViewport.width, gameViewport.height),
    getClearColor: (target: any) => target,
    getClearAlpha: () => 1,
    setClearAlpha() {},
    initTexture() {},
    copyFramebufferToTexture() {},
    readRenderTargetPixels() {},
  });
  return renderer;
};

/** The PixiJS renderer, as far as GDJS uses it outside of rendering. */
const createPixiRendererStub = () => {
  const canvas = g.document.createElement('canvas');
  const renderer: any = {
    type: 1,
    width: gameViewport.width,
    height: gameViewport.height,
    resolution: 1,
    view: canvas,
    screen: { x: 0, y: 0, width: gameViewport.width, height: gameViewport.height },
    background: { color: 0, alpha: 1, backgroundColor: 0 },
    plugins: { interaction: null, accessibility: null },
    events: { destroy() {}, setTargetElement() {}, domElement: canvas },
    textureGC: { mode: 0, run() {} },
    gl: null,
    render() {},
    reset() {},
    clear() {},
    resize(width: number, height: number) {
      renderer.width = renderer.screen.width = width;
      renderer.height = renderer.screen.height = height;
    },
    generateTexture: () => PIXI.Texture.WHITE,
    extract: { canvas: () => canvas, pixels: () => new Uint8Array(4), base64: () => Promise.resolve('') },
    destroy() {},
    on() {},
    off() {},
  };
  return renderer;
};

const patchGameRenderer = () => {
  const Base = gdjs.RuntimeGamePixiRenderer;
  class RuntimeGameThreeRTRenderer extends Base {
    _threertThreeRenderer = createThreeRendererStub();
    createStandardCanvas() {
      const canvas = g.document.createElement('canvas');
      canvas.width = gameViewport.width;
      canvas.height = gameViewport.height;
      this._gameCanvas = canvas;
      this._pixiRenderer = createPixiRendererStub();
      this._threeRenderer = this._threertThreeRenderer;
      this._domElementsContainer = g.document.createElement('div');
      this._canvasWidth = gameViewport.width;
      this._canvasHeight = gameViewport.height;
    }
    initializeRenderers() {}
    initializeCanvas() {}
    updateRendererSize() {}
    bindStandardEvents() {}
    setWindowSize() {}
    centerWindow() {}
    setFullScreen() {}
    isFullScreen() {
      return true;
    }
    requestPointerLock() {
      return true;
    }
    exitPointerLock() {}
    isPointerLocked() {
      return threertState.pointerLocked;
    }
    convertPageToGameCoords(pageX: number, pageY: number) {
      return [
        (pageX * this._game.getGameResolutionWidth()) / gameViewport.width,
        (pageY * this._game.getGameResolutionHeight()) / gameViewport.height,
      ];
    }
    getCanvasToDomElementContainerHeightScale() {
      return 1;
    }
    startGameLoop(fn: GameLoop) {
      threertState.gameLoop = fn;
    }
    stopGameLoop() {
      threertState.gameLoop = null;
    }
    getThreeRenderer() {
      return this._threertThreeRenderer;
    }
    openURL(url: string) {
      console.info('Open URL: ' + url);
    }
    stopGame() {
      threertState.gameLoop = null;
    }
    isWebGLSupported() {
      return true;
    }
    getElectron() {
      return null;
    }
  }
  gdjs.RuntimeGameThreeRTRenderer = RuntimeGameThreeRTRenderer;
  gdjs.RuntimeGameRenderer = RuntimeGameThreeRTRenderer;
};

const patchSceneRenderer = () => {
  gdjs.RuntimeScenePixiRenderer.prototype.render = function () {
    if (threertState.view) threertState.view.renderScene(this._runtimeScene);
  };
};

/** No session metrics (sent to GDevelop's servers by web games): ThreeRT games have no network of their own. */
const patchSessionMetrics = () => {
  if (gdjs.RuntimeGame && gdjs.RuntimeGame.prototype._setupSessionMetrics) {
    gdjs.RuntimeGame.prototype._setupSessionMetrics = function () {};
  }
};

const patchLoadingScreen = () => {
  class LoadingScreenThreeRTRenderer {
    setPercent() {}
    renderIfNeeded() {
      return false;
    }
    unload() {
      return Promise.resolve();
    }
  }
  gdjs.LoadingScreenRenderer = LoadingScreenThreeRTRenderer;
};

const decodeBase64 = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

/**
 * The meshes of a model, from the manifest, as meshes of @threert/scene marked `__threertModelPart`: code reading
 * the meshes of models (Terrain3D's scattered models) gets them; clones of the model (Model3D objects) leave them out.
 */
const createModelMeshes = (model: NonNullable<ReturnType<typeof getFileInfo>>['model']): S.Mesh[] => {
  if (!model || !model.meshes) return [];
  const materials = (model.materials || []).map((m) => {
    const color = new S.Color().setRGB(m.color[0], m.color[1], m.color[2]);
    const material = new S.MeshStandardMaterial({
      name: m.name,
      color,
      roughness: m.roughness,
      metalness: m.metalness,
      opacity: m.color[3],
      transparent: m.transparent,
      alphaTest: m.alphaTest,
      side: m.doubleSided ? S.DoubleSide : S.FrontSide,
    });
    if (m.emissive && (m.emissive[0] || m.emissive[1] || m.emissive[2])) material.emissive = new S.Color().setRGB(m.emissive[0], m.emissive[1], m.emissive[2]);
    if (m.map) material.map = new (g.THREE.Texture)(m.map);
    return material;
  });
  const defaultMaterial = new S.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const meshes: S.Mesh[] = [];
  for (const part of model.meshes) {
    const geometry = new S.BufferGeometry();
    geometry.setAttribute('position', new S.BufferAttribute(new Float32Array(decodeBase64(part.position)), 3));
    if (part.normal) geometry.setAttribute('normal', new S.BufferAttribute(new Float32Array(decodeBase64(part.normal)), 3));
    if (part.uv) {
      // glTF's texture coordinates start at the top of images, three.js's (and these textures') at the bottom.
      const uv = new Float32Array(decodeBase64(part.uv));
      for (let i = 1; i < uv.length; i += 2) uv[i] = 1 - uv[i];
      geometry.setAttribute('uv', new S.BufferAttribute(uv, 2));
    }
    if (part.index) geometry.setIndex(new S.BufferAttribute(new Uint32Array(decodeBase64(part.index)), 1));
    if (!part.normal) geometry.computeVertexNormals();
    const mesh: any = new S.Mesh(geometry, materials[part.material] || defaultMaterial);
    mesh.name = part.name;
    mesh.__threertModelPart = true;
    const matrix = new S.Matrix4();
    matrix.elements = part.matrix.slice();
    matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    meshes.push(mesh);
  }
  return meshes;
};

const patchModel3DManager = () => {
  const Manager = gdjs.Model3DManager;
  if (!Manager) return;
  Manager.prototype.loadResource = async function (resourceName: string) {
    const resource = this._resourceLoader.getResource(resourceName);
    if (!resource || this._loadedThreeModels.get(resource)) return;
    const info = getFileInfo(resource.file);
    if (!info || !info.assetPath || !info.model) {
      console.error('[GDJS ThreeRT] Unknown 3D model: ' + resource.file);
      return;
    }
    const scene = new GLTFScene();
    const model: any = new S.GLTFModel(info.assetPath);
    model.__threertBounds = { min: info.model.min, max: info.model.max };
    scene.add(model);
    // The meshes of the file, for code reading them (they are not drawn: the GLTFModel is).
    for (const mesh of createModelMeshes(info.model)) scene.add(mesh);
    const animations = info.model.animations.map((animation) => new AnimationClip(animation.name, animation.duration));
    this._loadedThreeModels.set(resource, {
      scene,
      scenes: [scene],
      animations,
      cameras: [],
      asset: {},
      userData: {},
      parser: null,
    });
  };
  Manager.prototype.processResource = async function () {};

  // Model3D objects draw the GLTFModel of their model, not the meshes given for code reading them.
  const Renderer = gdjs.Model3DRuntimeObjectRenderer;
  if (Renderer && Renderer.prototype._updateModel) {
    const updateModel = Renderer.prototype._updateModel;
    Renderer.prototype._updateModel = function (...args: any[]) {
      updateModel.apply(this, args);
      const parts: any[] = [];
      if (this._threeObject) this._threeObject.traverse((object: any) => object.__threertModelPart && parts.push(object));
      for (const part of parts) part.removeFromParent();
    };
  }
};

const patchImageManager = () => {
  const Manager = gdjs.PixiImageManager;
  if (!Manager) return;
  // PixiJS draws these with its renderer: here, any texture of the right size will do.
  const whiteTexture = () => PIXI.Texture.WHITE;
  Manager.prototype.getOrCreateDiskTexture = whiteTexture;
  Manager.prototype.getOrCreateRectangleTexture = whiteTexture;
  Manager.prototype.getOrCreateScaledTexture = function (imageResourceName: string) {
    return this.getPIXITexture(imageResourceName);
  };
};

const patchPixi = () => {
  if (typeof PIXI === 'undefined') return;
  // Text is measured without drawing it (see the canvas stub in browser.ts).
  if (PIXI.TextMetrics) {
    PIXI.TextMetrics.measureFont = (font: string) => {
      const match = /(\d+(\.\d+)?)px/.exec(font);
      const fontSize = match ? parseFloat(match[1]) : 16;
      return { ascent: fontSize * 0.8, descent: fontSize * 0.2, fontSize };
    };
  }
};

/** Jolt is loaded from its JavaScript build, embedded in the bundle (`globalThis.__GDJS_THREERT_JOLT__`). */
export const getJoltModule = () => {
  const factory = g.__GDJS_THREERT_JOLT__;
  if (!factory) return Promise.reject(new Error('Jolt (JavaScript build) is not in the bundle.'));
  return Promise.resolve({ default: factory });
};

const installFontFaceObserver = () => {
  g.FontFaceObserver = class {
    family: string;
    constructor(family: string) {
      this.family = family;
    }
    load() {
      return Promise.resolve(this);
    }
  };
};

/** Before the GDJS scripts: what they need at load time. */
export const installPreGDJS = () => {
  installFontFaceObserver();
};

/** After the GDJS scripts and the game code. */
export const installGDJSPatches = () => {
  patchPixi();
  patchGameRenderer();
  patchSceneRenderer();
  patchLoadingScreen();
  patchSessionMetrics();
  patchModel3DManager();
  patchImageManager();
};
