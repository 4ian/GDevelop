// `THREE` for GDJS on ThreeRT: the classes of @threert/scene (a three.js-style scene API, traced by ThreeRT), completed
// with what GDJS and its extensions use from three.js.
//
// - The math classes of @threert/scene get the methods they lack from the real three.js (the one GDJS ships, loaded
//   just before this file: `realThree`), which only touch `x`, `y`, `elements`...: they work on both.
// - Classes @threert/scene has no equivalent for are taken from the real three.js when they are pure data (Vector4,
//   Matrix3, Plane, Frustum...), or are stand-ins that draw nothing (lines, points, sprites, render targets).
// - A layer's `THREE.Scene` is a group (`LayerScene`): the scene ThreeRT traces is made of the scenes of the layers
//   (see `render.ts`).
import * as S from '@threert/scene';
import { getFileInfo } from './manifest';

const g = globalThis as any;
const warnedOnce = new Set<string>();
export const warnOnce = (message: string) => {
  if (warnedOnce.has(message)) return;
  warnedOnce.add(message);
  console.warn('[GDJS ThreeRT] ' + message);
};

/** Copies the methods (and accessors) of `source`'s prototype that `target`'s prototype chain has not. */
const graft = (target: any, source: any, skip: string[] = []) => {
  if (!target || !source) return;
  for (const name of Object.getOwnPropertyNames(source.prototype)) {
    if (name === 'constructor' || skip.includes(name) || name in target.prototype) continue;
    const descriptor = Object.getOwnPropertyDescriptor(source.prototype, name);
    if (descriptor) Object.defineProperty(target.prototype, name, descriptor);
  }
};

const toThreeRTColorSpace = (colorSpace: string): 'srgb' | 'linear' =>
  colorSpace === 'srgb' || colorSpace === S.SRGBColorSpace ? 'srgb' : 'linear';

/** A Vector2 stored as the [x, y] array @threert/scene reads (`texture.repeat`, `texture.offset`). */
class ArrayVector2 extends Array<number> {
  constructor(x = 0, y = 0) {
    super();
    this.push(x, y);
  }
  get x() {
    return this[0];
  }
  set x(v: number) {
    this[0] = v;
  }
  get y() {
    return this[1];
  }
  set y(v: number) {
    this[1] = v;
  }
  set(x: number, y: number) {
    this[0] = x;
    this[1] = y;
    return this;
  }
  copy(v: { x: number; y: number }) {
    return this.set(v.x, v.y);
  }
  setScalar(s: number) {
    return this.set(s, s);
  }
  clone() {
    return new ArrayVector2(this[0], this[1]);
  }
  static get [Symbol.species]() {
    return Array;
  }
}

/** The file of an "image" (`browser.ts` ImageStub, a canvas...) as a path for the engine, or null. */
const getAssetPathOfImage = (image: any): string | null => {
  if (!image) return null;
  const file = image.__threertFile || image.src;
  if (!file) return null;
  const info = getFileInfo(file);
  return info && info.assetPath ? info.assetPath : null;
};

let textureId = 0;

/** A 1x1 white PNG, for textures without a file. */
let whitePixelPNG: Uint8Array | null = null;
const getWhitePixelPNG = () => {
  if (!whitePixelPNG) {
    const binary = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    whitePixelPNG = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) whitePixelPNG[i] = binary.charCodeAt(i);
  }
  return whitePixelPNG;
};

/** three.js's Texture properties on @threert/scene's textures (made from an image instead of a path). */
const textureMixin = <T extends new (...args: any[]) => S.Texture>(Base: T) => {
  class ThreeTexture extends Base {
    readonly isTexture = true;
    id = ++textureId;
    name = '';
    image: any = null;
    wrapS = S.RepeatWrapping;
    wrapT = S.RepeatWrapping;
    magFilter = 1006;
    minFilter = 1008;
    anisotropy = 1;
    format = 1023;
    type = 1009;
    generateMipmaps = true;
    flipY = true;
    premultiplyAlpha = false;
    matrixAutoUpdate = true;
    center = new ArrayVector2(0, 0);
    rotation = 0;
    version = 0;
    userData: Record<string, any> = {};
    mapping = 300;
    channel = 0;
    source: any = null;
    onUpdate: Function | null = null;
    _threeColorSpace = 'srgb';
    constructor(...args: any[]) {
      super(...args);
      // @threert/scene's own fields would hide the accessors below.
      const colorSpace = (this as any).colorSpace;
      delete (this as any).colorSpace;
      delete (this as any).wrap;
      this._threeColorSpace = colorSpace === 'linear' ? 'srgb-linear' : 'srgb';
      this.repeat = new ArrayVector2(1, 1) as any;
      this.offset = new ArrayVector2(0, 0) as any;
    }
    updateMatrix() {}
    addUpdateRange() {}
    clearUpdateRanges() {}
    dispose() {}
    copy(source: any): this {
      this.uri = source.uri;
      this.data = source.data;
      this.image = source.image;
      this._threeColorSpace = source._threeColorSpace;
      (this.repeat as any).copy(source.repeat);
      (this.offset as any).copy(source.offset);
      this.wrapS = source.wrapS;
      this.wrapT = source.wrapT;
      return this;
    }
  }
  // @threert/scene reads `colorSpace` as "srgb" | "linear", three.js writes "srgb" | "srgb-linear" | "".
  Object.defineProperty(ThreeTexture.prototype, 'colorSpace', {
    get(this: ThreeTexture) {
      return toThreeRTColorSpace(this._threeColorSpace);
    },
    set(this: ThreeTexture, value: string) {
      this._threeColorSpace = value;
    },
    configurable: true,
  });
  // @threert/scene reads `wrap`; three.js writes wrapS / wrapT.
  Object.defineProperty(ThreeTexture.prototype, 'wrap', {
    get(this: ThreeTexture) {
      return this.wrapS === S.ClampToEdgeWrapping ? 'clamp' : 'repeat';
    },
    set(this: ThreeTexture, value: string) {
      this.wrapS = this.wrapT = value === 'clamp' ? S.ClampToEdgeWrapping : S.RepeatWrapping;
    },
    configurable: true,
  });
  return ThreeTexture;
};

/** three.js's Texture: `new THREE.Texture(image)`, the image being one of the game (see `browser.ts`). */
export class Texture extends textureMixin(S.Texture) {
  constructor(image?: any, ..._rest: any[]) {
    const assetPath = typeof image === 'string' ? image : getAssetPathOfImage(image);
    super(assetPath || 'generated:white', 'srgb');
    this.image = typeof image === 'string' ? null : image || null;
    this.source = { data: this.image || { width: 1, height: 1 }, needsUpdate: false };
    if (!assetPath) this.data = getWhitePixelPNG();
  }
  clone(): this {
    return new (this.constructor as any)(this.image).copy(this);
  }
}

/**
 * three.js's DataTexture (data, width, height, format): RGBA8 pixels are given to ThreeRT as they are. Other
 * formats are kept as data (for shaders ThreeRT does not run) and drawn white.
 */
export class DataTexture extends textureMixin(S.DataTexture) {
  readonly isDataTexture = true;
  constructor(data?: any, width = 1, height = 1, format?: number) {
    const isRGBA8 =
      (data instanceof Uint8Array || data instanceof Uint8ClampedArray) &&
      data.length === width * height * 4 &&
      (format === undefined || format === 1023);
    super(width, height, isRGBA8 ? new Uint8Array(data.buffer, data.byteOffset, data.length) : new Uint8Array(width * height * 4).fill(255), 'linear');
    this.image = { data, width, height };
    this.source = { data: this.image, needsUpdate: false };
    this._threeColorSpace = '';
  }
  clone(): this {
    return new (this.constructor as any)(this.image.data, this.image.width, this.image.height).copy(this);
  }
}

/** A cube texture (skyboxes): ThreeRT has no cube maps, the layer scene turns it into a sky (`render.ts`). */
export class CubeTexture extends Texture {
  readonly isCubeTexture = true;
  images: any[];
  constructor(images: any[] = []) {
    super(null);
    this.images = images;
    this.image = images;
  }
}

/** Material stand-ins for what ThreeRT does not draw (lines, points, sprites, custom shaders). */
class MaterialStub {
  readonly isMaterial = true;
  uuid = 'stubmat' + ++textureId;
  name = '';
  color = new S.Color(0xffffff);
  opacity = 1;
  transparent = false;
  visible = true;
  side = 0;
  needsUpdate = false;
  userData: Record<string, any> = {};
  uniforms: Record<string, any> = {};
  defines: Record<string, any> = {};
  map: any = null;
  depthTest = true;
  depthWrite = true;
  blending = 1;
  constructor(parameters: Record<string, any> = {}) {
    for (const key of Object.keys(parameters)) {
      if (key === 'color') this.color = new S.Color(parameters[key]);
      else (this as any)[key] = parameters[key];
    }
  }
  setValues(parameters: Record<string, any>) {
    Object.assign(this, parameters);
  }
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
  copy(source: any) {
    Object.assign(this, source);
    return this;
  }
  dispose() {}
  onBeforeCompile() {}
  customProgramCacheKey() {
    return '';
  }
}

/** An Object3D drawn by three.js but not by ThreeRT (lines, points, sprites, helpers): kept in the graph, hidden. */
const makeHiddenObjectClass = (type: string) =>
  class extends S.Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any) {
      super();
      this.type = type;
      this.geometry = geometry || new S.BufferGeometry();
      this.material = material || new MaterialStub();
      this.visible = false;
      (this as any)['is' + type] = true;
    }
    computeLineDistances() {
      return this;
    }
    // Keep it hidden: GDJS shows debug lines with `visible`.
    get visible() {
      return false;
    }
    set visible(_value: boolean) {}
  };

class Layers {
  mask = 1;
  set(channel: number) {
    this.mask = ((1 << channel) | 0) >>> 0;
  }
  enable(channel: number) {
    this.mask |= (1 << channel) | 0;
  }
  enableAll() {
    this.mask = 0xffffffff | 0;
  }
  toggle(channel: number) {
    this.mask ^= (1 << channel) | 0;
  }
  disable(channel: number) {
    this.mask &= ~((1 << channel) | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(layers: Layers) {
    return (this.mask & layers.mask) !== 0;
  }
  isEnabled(channel: number) {
    return (this.mask & ((1 << channel) | 0)) !== 0;
  }
}

/** What GDJS's layer renderers render instead of a scene: kept as a group in the scene ThreeRT traces. */
export class LayerScene extends S.Group {
  readonly isLayerScene = true;
  background: any = null;
  environment: any = null;
  fog: any = null;
  overrideMaterial: any = null;
  backgroundBlurriness = 0;
  backgroundIntensity = 1;
  environmentIntensity = 1;
  backgroundRotation = new S.Euler();
  environmentRotation = new S.Euler();
  constructor() {
    super();
    this.type = 'Scene';
  }
}

/** The projection matrices three.js code reads from cameras (unproject, frustums...). */
const cameraMixin = (Base: any) =>
  class extends Base {
    readonly isCamera = true;
    projectionMatrix = new S.Matrix4();
    projectionMatrixInverse = new S.Matrix4();
    matrixWorldInverse = new S.Matrix4();
    zoom = 1;
    view: any = null;
    layers = new Layers();
    updateMatrixWorld(force?: boolean) {
      super.updateMatrixWorld(force);
      (this.matrixWorldInverse as any).copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(updateParents: boolean, updateChildren: boolean) {
      super.updateWorldMatrix(updateParents, updateChildren);
      (this.matrixWorldInverse as any).copy(this.matrixWorld).invert();
    }
    getWorldDirection(target = new S.Vector3()) {
      this.updateWorldMatrix(true, false);
      const e = this.matrixWorld.elements;
      return target.set(-e[8], -e[9], -e[10]).normalize();
    }
  };

export class PerspectiveCamera extends cameraMixin(S.PerspectiveCamera) {
  readonly isPerspectiveCamera = true;
  focus = 10;
  filmGauge = 35;
  filmOffset = 0;
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super(fov, aspect, near, far);
    this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const near = this.near;
    let top = (near * Math.tan((Math.PI / 180) * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;
    (this.projectionMatrix as any).makePerspective(left, left + width, top, top - height, near, this.far);
    (this.projectionMatrixInverse as any).copy(this.projectionMatrix).invert();
  }
  setFocalLength(focalLength: number) {
    const vExtentSlope = (0.5 * this.getFilmHeight()) / focalLength;
    this.fov = (180 / Math.PI) * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
}

export class OrthographicCamera extends cameraMixin(S.Object3D) {
  readonly isOrthographicCamera = true;
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2000) {
    super();
    this.type = 'OrthographicCamera';
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }
  get looksDownNegativeZ() {
    return true;
  }
  updateProjectionMatrix() {
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;
    (this.projectionMatrix as any).makeOrthographic(cx - dx, cx + dx, cy + dy, cy - dy, this.near, this.far);
    (this.projectionMatrixInverse as any).copy(this.projectionMatrix).invert();
  }
}

/**
 * The animations of a glTF model: GDJS plays them with an AnimationMixer; ThreeRT poses a GLTFModel by
 * `animation = { clip, time, loop }`. The mixer advances the time of its action and poses the models of its root.
 */
export class AnimationClip {
  name: string;
  duration: number;
  tracks: any[] = [];
  constructor(name = '', duration = -1, tracks: any[] = []) {
    this.name = name;
    this.duration = duration;
    this.tracks = tracks;
  }
  static findByName(clips: AnimationClip[], name: string) {
    return (clips || []).find((clip) => clip.name === name) || null;
  }
}

export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;

class AnimationAction {
  mixer: AnimationMixer;
  clip: AnimationClip;
  time = 0;
  timeScale = 1;
  weight = 1;
  paused = false;
  enabled = true;
  loop = LoopRepeat;
  repetitions = Infinity;
  clampWhenFinished = false;
  private _running = false;
  private _finished = false;
  constructor(mixer: AnimationMixer, clip: AnimationClip) {
    this.mixer = mixer;
    this.clip = clip;
  }
  play() {
    this._running = true;
    this.mixer._setActiveAction(this);
    return this;
  }
  stop() {
    this._running = false;
    return this;
  }
  reset() {
    this.time = 0;
    this._finished = false;
    this.paused = false;
    this.enabled = true;
    return this;
  }
  isRunning() {
    return this._running && this.enabled && !this.paused && !this._finished && this.timeScale !== 0;
  }
  isScheduled() {
    return this._running;
  }
  setLoop(mode: number, repetitions: number) {
    this.loop = mode;
    this.repetitions = repetitions;
    return this;
  }
  setEffectiveTimeScale(timeScale: number) {
    this.timeScale = timeScale;
    return this;
  }
  getEffectiveTimeScale() {
    return this.timeScale;
  }
  setEffectiveWeight(weight: number) {
    this.weight = weight;
    return this;
  }
  getEffectiveWeight() {
    return this.weight;
  }
  fadeIn() {
    return this;
  }
  fadeOut() {
    return this;
  }
  crossFadeFrom() {
    return this;
  }
  crossFadeTo() {
    return this;
  }
  stopFading() {
    return this;
  }
  getClip() {
    return this.clip;
  }
  getMixer() {
    return this.mixer;
  }
  getRoot() {
    return this.mixer.getRoot();
  }
  _advance(delta: number) {
    if (!this._running || this.paused || !this.enabled || this._finished) return;
    const duration = this.clip.duration > 0 ? this.clip.duration : 0;
    this.time += delta * this.timeScale;
    if (duration > 0 && this.loop === LoopOnce && (this.time >= duration || this.time < 0)) {
      this.time = Math.min(Math.max(this.time, 0), duration);
      this._finished = true;
    }
  }
}

export class AnimationMixer {
  private _root: S.Object3D;
  private _actions = new Map<AnimationClip, AnimationAction>();
  private _activeAction: AnimationAction | null = null;
  time = 0;
  timeScale = 1;
  constructor(root: S.Object3D) {
    this._root = root;
  }
  clipAction(clip: AnimationClip) {
    let action = this._actions.get(clip);
    if (!action) {
      action = new AnimationAction(this, clip);
      this._actions.set(clip, action);
    }
    return action;
  }
  existingAction(clip: AnimationClip) {
    return this._actions.get(clip) || null;
  }
  _setActiveAction(action: AnimationAction) {
    if (this._activeAction && this._activeAction !== action) this._activeAction.stop();
    this._activeAction = action;
  }
  stopAllAction() {
    for (const action of this._actions.values()) action.stop();
    return this;
  }
  getRoot() {
    return this._root;
  }
  uncacheRoot() {}
  uncacheClip() {}
  uncacheAction() {}
  update(delta: number) {
    this.time += delta * this.timeScale;
    const action = this._activeAction;
    if (!action) return this;
    action._advance(delta * this.timeScale);
    const duration = action.clip.duration;
    const loop = action.loop !== LoopOnce;
    // A non looping clip is held on its last pose: sampled just before its end.
    const time = loop || duration <= 0 ? action.time : Math.min(action.time, duration - 1e-4);
    const pose = { clip: action.clip.name, time: Math.max(0, time), loop };
    this._root.traverse((object: any) => {
      if (object instanceof S.GLTFModel) {
        const current = object.animation;
        if (!current || current.clip !== pose.clip || current.time !== pose.time || current.loop !== pose.loop) object.animation = pose;
      }
    });
    return this;
  }
  setTime(time: number) {
    if (this._activeAction) this._activeAction.time = time;
    return this.update(0);
  }
}

/** A glTF scene: a group holding the model, with its bounds known from the manifest (it has no geometry here). */
export class GLTFScene extends S.Group {
  constructor() {
    super();
  }
}

/** Box3.setFromObject that knows the bounds of glTF models (from the manifest) and of geometries. */
const expandBoxByObject = (box: any, object: any, precise: boolean) => {
  object.updateWorldMatrix(false, false);
  const corners = (min: number[], max: number[], matrix: any) => {
    const point = new S.Vector3();
    for (let c = 0; c < 8; c++) {
      point.set(c & 1 ? max[0] : min[0], c & 2 ? max[1] : min[1], c & 4 ? max[2] : min[2]);
      point.applyMatrix4(matrix);
      box.expandByPoint(point);
    }
  };
  if (object instanceof S.GLTFModel) {
    const bounds = (object as any).__threertBounds;
    if (bounds) corners(bounds.min, bounds.max, object.matrixWorld);
  } else if (object.isInstancedMesh) {
    const geometry = object.geometry;
    if (geometry) {
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const bb = geometry.boundingBox;
      if (bb && !bb.isEmpty()) {
        const instanceMatrix = new S.Matrix4();
        const world = new S.Matrix4();
        for (let i = 0; i < object.count; i++) {
          object.getMatrixAt(i, instanceMatrix);
          world.multiplyMatrices(object.matrixWorld, instanceMatrix);
          corners([bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z], world);
        }
      }
    }
  } else if (object.geometry && object.isMesh) {
    const geometry = object.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    if (bb && !bb.isEmpty()) corners([bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z], object.matrixWorld);
  }
  for (const child of object.children) expandBoxByObject(box, child, precise);
};

/** A property created on first access for each instance (not shared through the prototype). */
const lazyInstanceProperty = (prototype: any, name: string, create: () => any) => {
  if (name in prototype) return;
  Object.defineProperty(prototype, name, {
    get() {
      const value = create();
      Object.defineProperty(this, name, { value, writable: true, configurable: true, enumerable: true });
      return value;
    },
    set(value) {
      Object.defineProperty(this, name, { value, writable: true, configurable: true, enumerable: true });
    },
    configurable: true,
  });
};

/** Builds `THREE` from @threert/scene and the real three.js (`realThree`, for the classes and methods it lacks). */
export const createThreeShim = (realThree: any) => {
  const R = realThree || {};

  // Math: methods that @threert/scene lacks, from three.js.
  graft(S.Vector2, R.Vector2);
  graft(S.Vector3, R.Vector3);
  graft(S.Quaternion, R.Quaternion);
  graft(S.Matrix4, R.Matrix4);
  graft(S.Color, R.Color);
  graft(S.Box3, R.Box3, ['setFromObject', 'expandByObject']);
  graft(S.Sphere, R.Sphere);
  graft(S.Ray, R.Ray);
  graft(S.Euler, R.Euler, ['setFromQuaternion']);
  graft(S.BufferAttribute, R.BufferAttribute);
  graft(S.BufferGeometry, R.BufferGeometry, ['setFromPoints']);
  for (const [Target, flag] of [
    [S.Vector2, 'isVector2'],
    [S.Vector3, 'isVector3'],
    [S.Quaternion, 'isQuaternion'],
    [S.Matrix4, 'isMatrix4'],
    [S.Color, 'isColor'],
    [S.Box3, 'isBox3'],
    [S.Euler, 'isEuler'],
    [S.BufferGeometry, 'isBufferGeometry'],
    [S.BufferAttribute, 'isBufferAttribute'],
    [S.Object3D, 'isObject3D'],
  ] as Array<[any, string]>) {
    if (!(flag in Target.prototype)) Object.defineProperty(Target.prototype, flag, { value: true });
  }

  // Colours: three.js's `setRGB(r, g, b, colorSpace)` and CSS styles @threert/scene does not parse.
  const C = S.Color.prototype as any;
  const setRGB = C.setRGB;
  C.setRGB = function (r: number, g: number, b: number, colorSpace?: string) {
    if (colorSpace === 'srgb') return setRGB.call(this, S.srgbToLinear(r), S.srgbToLinear(g), S.srgbToLinear(b));
    return setRGB.call(this, r, g, b);
  };
  const setStyle = C.setStyle;
  C.setStyle = function (style: string, colorSpace?: string) {
    try {
      return setStyle.call(this, style);
    } catch (error) {
      return R.Color.prototype.setStyle.call(this, style, colorSpace || 'srgb');
    }
  };

  // three.js's Euler keeps its order in `_order` (read by its methods grafted above).
  Object.defineProperty(S.Euler.prototype, '_order', {
    get() {
      return this.order;
    },
    set(value) {
      this.order = value;
    },
    configurable: true,
  });

  // Euler <-> quaternion in every rotation order (@threert/scene converts back to XYZ only, but GDJS uses ZYX).
  const rotationMatrix = new S.Matrix4();
  (S.Euler.prototype as any).setFromQuaternion = function (q: any, orderOrNotify?: any, update?: boolean) {
    const order = typeof orderOrNotify === 'string' ? orderOrNotify : this.order;
    const notify = typeof orderOrNotify === 'boolean' ? orderOrNotify : update !== false;
    rotationMatrix.makeRotationFromQuaternion(q);
    R.Euler.prototype.setFromRotationMatrix.call(this, rotationMatrix, order, false);
    this.order = order;
    if (notify) this._onChange();
    return this;
  };
  (S.Euler.prototype as any).setFromRotationMatrix = function (m: any, order?: string, update?: boolean) {
    const newOrder = order || this.order;
    R.Euler.prototype.setFromRotationMatrix.call(this, m, newOrder, false);
    this.order = newOrder;
    if (update !== false) this._onChange();
    return this;
  };
  (S.Euler.prototype as any).copy = function (e: any) {
    return this.set(e.x, e.y, e.z, e.order);
  };
  (S.Euler.prototype as any).clone = function () {
    return new S.Euler(this.x, this.y, this.z, this.order);
  };
  (S.Euler.prototype as any).reorder = function (newOrder: string) {
    const q = new S.Quaternion().setFromEuler(this, false);
    return this.setFromQuaternion(q, newOrder);
  };

  // Object3D: what three.js code uses beyond @threert/scene.
  const O = S.Object3D.prototype as any;
  O.applyMatrix4 = function (matrix: any) {
    if (this.matrixAutoUpdate) this.updateMatrix();
    this.matrix.premultiply(matrix);
    const position = new S.Vector3(), quaternion = new S.Quaternion(), scale = new S.Vector3();
    this.matrix.decompose(position, quaternion, scale);
    this.position.copy(position);
    this.quaternion.copy(quaternion);
    this.scale.copy(scale);
    return this;
  };
  lazyInstanceProperty(O, 'layers', () => new Layers());
  lazyInstanceProperty(O, 'animations', () => []);
  for (const [name, value] of [
    ['frustumCulled', true],
    ['renderOrder', 0],
    ['matrixWorldNeedsUpdate', false],
    ['matrixWorldAutoUpdate', true],
  ] as Array<[string, any]>) {
    if (!(name in O)) O[name] = value;
  }
  O.onBeforeRender = O.onBeforeRender || function () {};
  O.onAfterRender = O.onAfterRender || function () {};
  O.onBeforeShadow = O.onBeforeShadow || function () {};
  O.raycast = O.raycast || function () {};
  O.updateMatrixWorld = function (force?: boolean) {
    this.updateWorldMatrix(false, true);
  };
  if (!O.getWorldScale) {
    O.getWorldScale = function (target = new S.Vector3()) {
      this.updateWorldMatrix(true, false);
      this.matrixWorld.decompose(new S.Vector3(), new S.Quaternion(), target);
      return target;
    };
  }

  // Materials: three.js properties @threert/scene ignores.
  const M = S.MeshStandardMaterial.prototype as any;
  for (const [name, value] of [
    ['visible', true],
    ['depthTest', true],
    ['depthWrite', true],
    ['blending', 1],
    ['toneMapped', true],
    ['fog', true],
    ['polygonOffset', false],
    ['polygonOffsetFactor', 0],
    ['polygonOffsetUnits', 0],
    ['envMapIntensity', 1],
    ['lightMapIntensity', 1],
    ['aoMapIntensity', 1],
    ['shadowSide', null],
    ['clipping', false],
    ['clippingPlanes', null],
    ['version', 0],
    ['alphaToCoverage', false],
    ['premultipliedAlpha', false],
    ['dithering', false],
    ['colorWrite', true],
    ['stencilWrite', false],
  ] as Array<[string, any]>) {
    if (!(name in M)) M[name] = value;
  }
  lazyInstanceProperty(M, 'defines', () => ({}));
  lazyInstanceProperty(M, 'uniforms', () => ({}));
  M.onBeforeCompile = M.onBeforeCompile || function () {};
  M.customProgramCacheKey =
    M.customProgramCacheKey ||
    function () {
      return '';
    };
  Object.defineProperty(M, 'isMaterial', { value: true, configurable: true });

  // Geometry: what three.js code uses beyond @threert/scene.
  const G = S.BufferGeometry.prototype as any;
  if (!G.setDrawRange)
    G.setDrawRange = function (start: number, count: number) {
      this.drawRange = { start, count };
    };
  if (!('drawRange' in G)) G.drawRange = { start: 0, count: Infinity };
  if (!G.computeTangents) G.computeTangents = function () {};
  if (!G.groups) {
    // (groups are an instance field in @threert/scene)
  }

  /** The bounds of a glTF model, read by GDJS to fit it in its object (Box3.setFromObject). */
  (S.Box3.prototype as any).setFromObject = function (object: any, precise = false) {
    this.makeEmpty();
    return this.expandByObject(object, precise);
  };
  (S.Box3.prototype as any).expandByObject = function (object: any, precise = false) {
    expandBoxByObject(this, object, precise);
    return this;
  };

  (S.Object3D as any).DEFAULT_UP = new S.Vector3(0, 1, 0);
  (S.Object3D as any).DEFAULT_MATRIX_AUTO_UPDATE = true;
  (S.Object3D as any).DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

  /** Lights whose shadow camera is a camera (GDJS places and turns it), though ThreeRT needs no shadow map. */
  const withShadowCamera = (Light: any, Camera: any) =>
    class extends Light {
      constructor(...args: any[]) {
        super(...args);
        const camera = new Camera();
        Object.assign(this.shadow, { camera, map: null, mapSize: new S.Vector2(512, 512), autoUpdate: true, needsUpdate: false, intensity: 1 });
      }
    };
  const DirectionalLight = withShadowCamera(S.DirectionalLight, OrthographicCamera);
  const SpotLight = withShadowCamera(S.SpotLight, PerspectiveCamera);
  const PointLight = withShadowCamera(S.PointLight, PerspectiveCamera);

  class Material extends S.MeshStandardMaterial {}
  class ShaderMaterial extends S.MeshBasicMaterial {
    readonly isShaderMaterial = true;
    uniforms: Record<string, any> = {};
    defines: Record<string, any> = {};
    vertexShader = '';
    fragmentShader = '';
    constructor(parameters: Record<string, any> = {}) {
      super({});
      const { uniforms, defines, vertexShader, fragmentShader, ...rest } = parameters;
      if (uniforms) this.uniforms = uniforms;
      if (defines) this.defines = defines;
      if (vertexShader) this.vertexShader = vertexShader;
      if (fragmentShader) this.fragmentShader = fragmentShader;
      this.setValues(rest);
    }
  }
  class InstancedBufferGeometry extends S.BufferGeometry {
    readonly isInstancedBufferGeometry = true;
    instanceCount = Infinity;
  }

  const extras: Record<string, any> = {
    DirectionalLight,
    SpotLight,
    PointLight,
    Texture,
    DataTexture,
    CubeTexture,
    CanvasTexture: Texture,
    VideoTexture: Texture,
    CompressedTexture: Texture,
    DepthTexture: Texture,
    Data3DTexture: DataTexture,
    DataArrayTexture: DataTexture,
    Scene: LayerScene,
    PerspectiveCamera,
    OrthographicCamera,
    Camera: PerspectiveCamera,
    Material,
    ShaderMaterial,
    RawShaderMaterial: ShaderMaterial,
    MeshDistanceMaterial: S.MeshDepthMaterial,
    LineBasicMaterial: MaterialStub,
    LineDashedMaterial: MaterialStub,
    PointsMaterial: MaterialStub,
    SpriteMaterial: MaterialStub,
    ShadowMaterial: MaterialStub,
    Line: makeHiddenObjectClass('Line'),
    LineSegments: makeHiddenObjectClass('LineSegments'),
    LineLoop: makeHiddenObjectClass('LineLoop'),
    Points: makeHiddenObjectClass('Points'),
    Sprite: makeHiddenObjectClass('Sprite'),
    CameraHelper: makeHiddenObjectClass('CameraHelper'),
    AxesHelper: makeHiddenObjectClass('AxesHelper'),
    BoxHelper: makeHiddenObjectClass('BoxHelper'),
    GridHelper: makeHiddenObjectClass('GridHelper'),
    DirectionalLightHelper: makeHiddenObjectClass('DirectionalLightHelper'),
    LightProbe: makeHiddenObjectClass('LightProbe'),
    EdgesGeometry: S.BufferGeometry,
    WireframeGeometry: S.BufferGeometry,
    InstancedBufferGeometry,
    SkinnedMesh: S.Mesh,
    Bone: S.Object3D,
    LOD: S.Group,
    Layers,
    AnimationClip,
    AnimationMixer,
    LoopOnce,
    LoopRepeat,
    LoopPingPong,
    WebGLRenderTarget: class {
      width: number;
      height: number;
      texture = new Texture(null);
      depthTexture: any = null;
      samples = 0;
      constructor(width = 1, height = 1) {
        this.width = width;
        this.height = height;
      }
      setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
      dispose() {}
      clone() {
        return this;
      }
    },
    Source: class {
      data: any;
      constructor(data: any) {
        this.data = data;
      }
    },
    Clock: R.Clock,
  };
  // Pure data classes taken as they are from three.js.
  for (const name of [
    'Vector4', 'Matrix3', 'Plane', 'Triangle', 'Line3', 'Frustum', 'Spherical', 'Cylindrical', 'Uniform',
    'UniformsLib', 'UniformsUtils', 'ShaderChunk', 'ShaderLib', 'Interpolant', 'LinearInterpolant',
    'QuaternionKeyframeTrack', 'VectorKeyframeTrack', 'NumberKeyframeTrack', 'KeyframeTrack', 'Curve',
    'CatmullRomCurve3', 'CubicBezierCurve3', 'LineCurve3', 'QuadraticBezierCurve3', 'Shape', 'Path', 'ShapePath',
    'ShapeUtils', 'Float16BufferAttribute', 'Int8BufferAttribute', 'Int16BufferAttribute', 'Int32BufferAttribute',
    'Uint8BufferAttribute', 'Uint8ClampedBufferAttribute', 'InterleavedBuffer', 'InterleavedBufferAttribute',
    'EventDispatcher', 'Loader', 'LoadingManager', 'FileLoader', 'ObjectLoader', 'ImageLoader', 'TextureLoader',
    'DefaultLoadingManager', 'Cache', 'Spline', 'SphericalHarmonics3', 'Box2', 'ImageUtils',
  ]) {
    if (R[name] && !(name in S)) extras[name] = R[name];
  }

  const base: Record<string, any> = {};
  // Constants (blending, filters, formats...) from three.js, then everything @threert/scene has.
  for (const name of Object.keys(R)) {
    if (typeof R[name] === 'number' || typeof R[name] === 'string') base[name] = R[name];
  }
  if (R.MathUtils) base.MathUtils = Object.assign({}, R.MathUtils, (S as any).MathUtils);
  Object.assign(base, S, extras);
  base.REVISION = R.REVISION || '0';

  // Anything else: a stand-in class drawing nothing (said once in the log).
  return new Proxy(base, {
    get(target, key: string | symbol) {
      if (typeof key !== 'string' || key in target) return (target as any)[key];
      if (key === 'then' || key === 'default' || key === '__esModule' || key === 'toJSON') return undefined;
      warnOnce(`THREE.${key} is not available in ThreeRT: a stand-in that draws nothing is used.`);
      const Stub = makeHiddenObjectClass(key);
      target[key] = Stub;
      return Stub;
    },
  });
};

/** THREE_ADDONS: what GDJS uses of three.js's add-ons. Post-processing does nothing (ThreeRT has its own). */
export const createThreeAddonsShim = () => {
  class PassStub {
    enabled = true;
    needsSwap = true;
    clear = false;
    renderToScreen = false;
    material: any = { blending: 1 };
    uniforms: Record<string, any> = {};
    constructor(..._args: any[]) {}
    setSize() {}
    render() {}
    dispose() {}
  }
  class EffectComposer {
    renderer: any;
    renderTarget1: any;
    renderTarget2: any;
    passes: any[] = [];
    readBuffer: any;
    writeBuffer: any;
    renderToScreen = true;
    constructor(renderer: any, renderTarget?: any) {
      this.renderer = renderer;
      this.renderTarget1 = renderTarget || { width: 1, height: 1, texture: null, setSize() {}, dispose() {} };
      this.renderTarget2 = this.renderTarget1;
      this.readBuffer = this.renderTarget1;
      this.writeBuffer = this.renderTarget2;
    }
    addPass(pass: any) {
      this.passes.push(pass);
    }
    insertPass(pass: any, index: number) {
      this.passes.splice(index, 0, pass);
    }
    removePass(pass: any) {
      this.passes = this.passes.filter((p) => p !== pass);
    }
    isLastEnabledPass() {
      return false;
    }
    setSize() {}
    setPixelRatio() {}
    render() {}
    reset() {}
    swapBuffers() {}
    dispose() {}
  }
  const addons: Record<string, any> = {
    EffectComposer,
    RenderPass: PassStub,
    OutputPass: PassStub,
    ShaderPass: PassStub,
    SMAAPass: PassStub,
    SceneDepthRenderPass: PassStub,
    UnrealBloomPass: PassStub,
    Pass: PassStub,
    FullScreenQuad: PassStub,
    SkeletonUtils: { clone: (object: any) => object.clone() },
    // Models are not parsed: Model3DManager is replaced (`gdjs-patches.ts`).
    GLTFLoader: class {
      register() {
        return this;
      }
      setDRACOLoader() {
        return this;
      }
      setMeshoptDecoder() {
        return this;
      }
      parse(_data: any, _path: string, onLoad: Function) {
        onLoad({ scene: new GLTFScene(), animations: [], scenes: [], cameras: [], asset: {}, userData: {}, parser: null });
      }
      parseAsync(data: any, path: string) {
        return new Promise((resolve) => this.parse(data, path, resolve));
      }
    },
    DRACOLoader: class {
      setDecoderPath() {
        return this;
      }
      setDecoderConfig() {
        return this;
      }
      preload() {
        return this;
      }
      dispose() {}
    },
  };
  return new Proxy(addons, {
    get(target, key: string | symbol) {
      if (typeof key !== 'string' || key in target) return (target as any)[key];
      if (key === 'then') return undefined;
      warnOnce(`THREE_ADDONS.${key} is not available in ThreeRT: a stand-in doing nothing is used.`);
      target[key] = PassStub;
      return PassStub;
    },
  });
};

export const installThree = () => {
  const realThree = g.THREE;
  g.__GDJS_THREERT_REAL_THREE__ = realThree;
  g.THREE = createThreeShim(realThree);
  g.THREE_ADDONS = createThreeAddonsShim();
};
