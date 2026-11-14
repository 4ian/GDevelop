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
import { raycastGeometry } from './raycast-bvh';

declare const gdjs: any;
declare const PIXI: any;
const g = globalThis as any;

export type GameLoop = (elapsedTimeMs: number) => boolean;

/** Raycasts reuse the world matrices computed in the same epoch (a game step: see index.ts). */
export const raycastState = { epoch: 0 };

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

/** The meshes of each model file (by the path of its GLTFModel), for rays to hit models (`patchRaycaster`). */
const modelMeshesByUri = new Map<string, S.Mesh[]>();

/**
 * three.js's raycaster as GDJS extensions use it (Raycaster3D...): intersections with their `normal`, and rays
 * hitting GLTFModels (their triangles are not in the scene code, but in the manifest).
 */
const patchRaycaster = () => {
  const Raycaster: any = S.Raycaster;
  if (typeof Raycaster.prototype.mesh !== 'function') return;
  // Triangles tested through a BVH (raycast-bvh.ts) for meshes of more than a few dozen of them.
  const testMesh = Raycaster.prototype.mesh;
  Raycaster.prototype.mesh = function (object: any, geometry: any, materials: any[], world: any, out: any[]) {
    if (!raycastGeometry(this, object, geometry, materials, world, out)) testMesh.call(this, object, geometry, materials, world, out);
  };

  // A `raycast` method may change a geometry and put it back (Terrain3D draws a lower level of detail than it
  // raycasts): ThreeRT is not told (it would update the geometry for nothing).
  const Geometry: any = S.BufferGeometry.prototype;
  const changed = Geometry.changed;
  let geometryChangesSuspended = 0;
  Geometry.changed = function () {
    if (!geometryChangesSuspended) changed.call(this);
  };
  // three.js's setIndex keeps the array it is given: so does this one for 32 bits indices (no copy), and other
  // arrays are converted once (a geometry keeps the same index object for the same array: see raycast-bvh.ts).
  const setIndex = Geometry.setIndex;
  const convertedIndices = new WeakMap<object, Uint32Array>();
  Geometry.setIndex = function (index: any) {
    let array = index && index.isBufferAttribute ? index.array : index;
    if (array && !(array instanceof Uint32Array) && typeof array === 'object' && typeof array.length === 'number') {
      let converted = convertedIndices.get(array);
      if (!converted || converted.length !== array.length) {
        converted = Uint32Array.from(array);
        convertedIndices.set(array, converted);
      }
      array = converted;
    }
    if (array instanceof Uint32Array) {
      if (this.index === array) return this;
      this.index = array;
      this.changed();
      return this;
    }
    return setIndex.call(this, index);
  };
  const tmpMatrix = new S.Matrix4();
  const tmpInverse = new S.Matrix4();
  const tmpCenter = new S.Vector3();

  /** Instances of an instanced mesh whose bounding sphere the ray meets (in the mesh's space), then their triangles. */
  const visitInstancedMesh = (raycaster: any, object: any, out: any[]) => {
    const geometry = object.geometry;
    if (!geometry || geometry instanceof S.ProceduralGeometry) return;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    const sphere = geometry.boundingSphere;
    if (!sphere) return;
    const localRay = raycaster.ray.clone().applyMatrix4(tmpInverse.copy(object.matrixWorld).invert());
    const origin = localRay.origin;
    const direction = localRay.direction.normalize();
    const array = object.instanceMatrix.array;
    for (let i = 0; i < object.count; i++) {
      const o = i * 16;
      // The sphere of the instance: its centre through the instance matrix, its radius by its largest scale.
      const cx = array[o] * sphere.center.x + array[o + 4] * sphere.center.y + array[o + 8] * sphere.center.z + array[o + 12];
      const cy = array[o + 1] * sphere.center.x + array[o + 5] * sphere.center.y + array[o + 9] * sphere.center.z + array[o + 13];
      const cz = array[o + 2] * sphere.center.x + array[o + 6] * sphere.center.y + array[o + 10] * sphere.center.z + array[o + 14];
      const scale = Math.sqrt(
        Math.max(
          array[o] * array[o] + array[o + 1] * array[o + 1] + array[o + 2] * array[o + 2],
          array[o + 4] * array[o + 4] + array[o + 5] * array[o + 5] + array[o + 6] * array[o + 6],
          array[o + 8] * array[o + 8] + array[o + 9] * array[o + 9] + array[o + 10] * array[o + 10]
        )
      );
      const radius = sphere.radius * scale;
      const dx = cx - origin.x, dy = cy - origin.y, dz = cz - origin.z;
      const along = dx * direction.x + dy * direction.y + dz * direction.z;
      if (along < -radius) continue;
      const distanceSquared = dx * dx + dy * dy + dz * dz - along * along;
      if (distanceSquared > radius * radius) continue;
      object.getMatrixAt(i, tmpMatrix);
      const hits: any[] = [];
      raycaster.mesh(object, geometry, object.materials, new S.Matrix4().multiplyMatrices(object.matrixWorld, tmpMatrix), hits);
      for (const hit of hits) out.push({ ...hit, instanceId: i });
    }
  };

  /** A glTF model: the triangles of its file (from the manifest), if the ray meets its bounds. */
  const visitModel = (raycaster: any, object: any, out: any[]) => {
    const meshes = modelMeshesByUri.get(object.uri);
    const bounds = object.__threertBounds;
    if (!meshes || !bounds) return;
    const localRay = raycaster.ray.clone().applyMatrix4(tmpInverse.copy(object.matrixWorld).invert());
    const box = new S.Box3(new S.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]), new S.Vector3(bounds.max[0], bounds.max[1], bounds.max[2]));
    if (localRay.intersectBox(box) === null) return;
    for (const mesh of meshes) {
      mesh.updateMatrix();
      raycaster.mesh(object, mesh.geometry, mesh.materials, new S.Matrix4().multiplyMatrices(object.matrixWorld, mesh.matrix), out);
    }
  };

  /**
   * World matrices are updated once by game step for raycasts (`raycastEpoch`): an object raycast against hundreds
   * of times in a step (a group of obstacles) does not update its ancestors each time. three.js itself raycasts with
   * the matrices of the last rendering.
   */
  const updatedInEpoch = new WeakMap<object, number>();
  const updateWorldMatrixForRaycasts = (object: any) => {
    if (updatedInEpoch.get(object) === raycastState.epoch) return;
    const parent = object.parent;
    if (parent) updateWorldMatrixForRaycasts(parent);
    if (object.matrixAutoUpdate) object.updateMatrix();
    if (parent) object.matrixWorld.multiplyMatrices(parent.matrixWorld, object.matrix);
    else object.matrixWorld.copy(object.matrix);
    updatedInEpoch.set(object, raycastState.epoch);
  };

  /** Whether the ray meets the sphere `center` (local), `radius` (local) of an object placed by `matrixWorld`. */
  const center = new S.Vector3();
  const rayMeetsSphere = (raycaster: any, matrixWorld: any, localCenter: any, localRadius: number) => {
    center.copy(localCenter).applyMatrix4(matrixWorld);
    const e = matrixWorld.elements;
    const scale = Math.sqrt(Math.max(e[0] * e[0] + e[1] * e[1] + e[2] * e[2], e[4] * e[4] + e[5] * e[5] + e[6] * e[6], e[8] * e[8] + e[9] * e[9] + e[10] * e[10]));
    const radius = localRadius * scale;
    const origin = raycaster.ray.origin, direction = raycaster.ray.direction;
    const dx = center.x - origin.x, dy = center.y - origin.y, dz = center.z - origin.z;
    const along = dx * direction.x + dy * direction.y + dz * direction.z;
    if (along < -radius || along - radius > raycaster.far) return false;
    return dx * dx + dy * dy + dz * dz - along * along <= radius * radius;
  };

  const sphereCenter = new S.Vector3();
  /**
   * three.js's traversal of a raycast, on @threert/scene's triangle tests: world matrices updated once by step,
   * objects culled by their bounding sphere, `raycast` methods of objects (Terrain3D's ground answers from its
   * heights) asked.
   */
  const visit = function (this: any, object: any, recursive: boolean, out: any[]) {
    updateWorldMatrixForRaycasts(object);
    if (Object.prototype.hasOwnProperty.call(object, 'raycast') && typeof object.raycast === 'function') {
      geometryChangesSuspended++;
      try {
        object.raycast(this, out);
      } finally {
        geometryChangesSuspended--;
      }
    } else if (object instanceof S.InstancedMesh) {
      visitInstancedMesh(this, object, out);
    } else if (object instanceof S.Mesh) {
      const geometry: any = object.geometry;
      if (!geometry.boundingSphere) geometry.computeBoundingSphere();
      const sphere = geometry.boundingSphere;
      if (!sphere || rayMeetsSphere(this, object.matrixWorld, sphere.center, sphere.radius)) {
        this.mesh(object, object.geometry, object.materials, object.matrixWorld, out);
      }
    } else if (object instanceof S.GLTFModel) {
      const bounds = (object as any).__threertBounds;
      if (bounds) {
        sphereCenter.set((bounds.min[0] + bounds.max[0]) / 2, (bounds.min[1] + bounds.max[1]) / 2, (bounds.min[2] + bounds.max[2]) / 2);
        const radius = Math.hypot(bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]) / 2;
        if (rayMeetsSphere(this, object.matrixWorld, sphereCenter, radius)) visitModel(this, object, out);
      }
    } else if (object instanceof S.ProceduralMesh) {
      this.boxes(object, object.geometry.boxes, object.matrixWorld, out);
    }
    if (recursive) for (const child of object.children) visit.call(this, child, true, out);
  };
  Raycaster.prototype.visit = function (object: any, recursive: boolean, out: any[]) {
    visit.call(this, object, recursive, out);
  };
  // three.js's Mesh.raycast, called by `raycast` methods of objects.
  (S.Mesh.prototype as any).raycast = function (raycaster: any, intersects: any[]) {
    if (typeof raycaster.mesh === 'function') raycaster.mesh(this, this.geometry, this.materials, this.matrixWorld, intersects);
  };
  for (const name of ['intersectObject', 'intersectObjects']) {
    const intersect = Raycaster.prototype[name];
    Raycaster.prototype[name] = function (...args: any[]) {
      const intersections = intersect.apply(this, args);
      for (const intersection of intersections) {
        if (!intersection.normal && intersection.face) intersection.normal = intersection.face.normal.clone();
      }
      return intersections;
    };
  }
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
    const meshes = createModelMeshes(info.model);
    modelMeshesByUri.set(info.assetPath, meshes.map((mesh) => mesh.clone()));
    for (const mesh of meshes) scene.add(mesh);
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
  patchRaycaster();
  patchImageManager();
};
