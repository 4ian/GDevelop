// The scene ThreeRT traces, made of the 3D layers of the running GDJS scene.
//
// GDJS renders each layer with its own THREE.Scene (here a `LayerScene` group) and camera. ThreeRT traces one scene
// from one camera: the 3D layers' scenes are put in it, the first 3D layer (the base layer, usually) gives the
// camera, and the other 3D layers (a first person weapon...) are moved so that they are seen from their own camera.
//
// GDevelop's 3D world has Z up (and the layer scenes are mirrored on Y); ThreeRT's has Y up (for the sky, the sun,
// the fog): the layer scenes are in a group turned by -90° around X.
import * as S from '@threert/scene';
import { LayerScene, CubeTexture } from './three';
import { getManifest } from './manifest';
import { adaptShaderMaterials } from './shader-materials';

declare const gdjs: any;

/**
 * The scale of the 3D layers other than the first one around the camera (their objects are usually a few metres from
 * their camera: a weapon in the hands of the player, which must not go through walls).
 */
const SECONDARY_LAYER_SCALE = 0.04;

/** The average colour (sRGB 0-1) of the image of a cube texture face, from the manifest. */
const averageColorOfImage = (image: any): [number, number, number] | null => {
  const file = image && image.__threertFile;
  const info = file ? getManifest().files[file] : null;
  if (!info || !info.averageColor) return null;
  return [info.averageColor[0] / 255, info.averageColor[1] / 255, info.averageColor[2] / 255];
};

const mix = (colors: Array<[number, number, number] | null>): [number, number, number] | null => {
  const known = colors.filter((c): c is [number, number, number] => !!c);
  if (!known.length) return null;
  const sum = [0, 0, 0];
  for (const c of known) for (let i = 0; i < 3; i++) sum[i] += c[i];
  return [sum[0] / known.length, sum[1] / known.length, sum[2] / known.length];
};

export class ThreeRTView {
  readonly scene = new S.Scene();
  readonly camera = new S.PerspectiveCamera(45, 16 / 9, 0.1, 10000);
  /** Turns GDevelop's Z up into ThreeRT's Y up. */
  readonly world = new S.Group();
  /** The layer scenes in the world, with the anchors keeping secondary layers in front of their camera. */
  private _shownLayerScenes = new Map<any, S.Group>();
  private _skyCubeTexture: any = null;
  private _sky: S.SkyGradient | null = null;
  private _hasRenderedOnce = false;
  private _renderCount = 0;
  private _tmpMatrix = new S.Matrix4();
  private _tmpMatrix2 = new S.Matrix4();
  private _tmpPosition = new S.Vector3();
  private _tmpQuaternion = new S.Quaternion();
  private _tmpScale = new S.Vector3();

  constructor() {
    this.world.name = 'GDevelop';
    this.world.rotation.set(-Math.PI / 2, 0, 0);
    this.scene.add(this.world);
    this.camera.position.set(0, 2, 5);
    this.scene.add(this.camera);
    // Until the game shows its scene: a neutral sky.
    this.scene.environment = new S.SkyColor(0x606060, 1);
  }

  get hasRenderedOnce() {
    return this._hasRenderedOnce;
  }

  /** The world matrix of a layer camera in the traced scene (`out`). */
  private _cameraWorldMatrix(threeCamera: any, out: S.Matrix4) {
    threeCamera.updateMatrixWorld(true);
    this.world.updateWorldMatrix(false, false);
    return out.multiplyMatrices(this.world.matrixWorld, threeCamera.matrixWorld);
  }

  /** Shows the 3D layers of `runtimeScene` (called instead of GDJS's rendering of the scene). */
  renderScene(runtimeScene: any) {
    const layers: any[] = runtimeScene._orderedLayers || [];
    const shownLayers: Array<{ layer: any; threeScene: any; threeCamera: any }> = [];
    for (const layer of layers) {
      if (!layer.isVisible()) continue;
      const layerRenderer = layer.getRenderer();
      const threeScene = layerRenderer.getThreeScene && layerRenderer.getThreeScene();
      const threeCamera = layerRenderer.getThreeCamera && layerRenderer.getThreeCamera();
      if (!threeScene || !threeCamera) continue;
      if (layerRenderer.has3DObjects && !layerRenderer.has3DObjects()) continue;
      shownLayers.push({ layer, threeScene, threeCamera });
    }

    // Keep in the world only the scenes of the layers shown.
    const keptScenes = new Set(shownLayers.map((l) => l.threeScene));
    for (const [threeScene, anchor] of this._shownLayerScenes) {
      if (!keptScenes.has(threeScene)) {
        this.world.remove(anchor);
        this._shownLayerScenes.delete(threeScene);
      }
    }
    if (!shownLayers.length) return;

    const main = shownLayers[0];
    const mainCameraMatrix = this._cameraWorldMatrix(main.threeCamera, new S.Matrix4());
    for (const shownLayer of shownLayers) {
      let anchor = this._shownLayerScenes.get(shownLayer.threeScene);
      if (!anchor) {
        anchor = new S.Group();
        anchor.name = 'Layer ' + (shownLayer.layer.getName() || '(base)');
        anchor.add(shownLayer.threeScene);
        this.world.add(anchor);
        this._shownLayerScenes.set(shownLayer.threeScene, anchor);
      }
      if (shownLayer !== main) {
        // Seen from the main camera as from its own, scaled down around the camera (the same picture, but in front
        // of what the main layer has there: a first person weapon is drawn over the scene in GDevelop):
        // anchor = world⁻¹ · mainCamera · scale · layerCamera⁻¹.
        shownLayer.threeCamera.updateMatrixWorld(true);
        const layerCameraInverse = this._tmpMatrix.copy(shownLayer.threeCamera.matrixWorld).invert();
        this.world.updateWorldMatrix(false, false);
        const worldInverse = this._tmpMatrix2.copy(this.world.matrixWorld).invert();
        const scale = new S.Matrix4().makeScale(SECONDARY_LAYER_SCALE, SECONDARY_LAYER_SCALE, SECONDARY_LAYER_SCALE);
        const anchorMatrix = new S.Matrix4().multiplyMatrices(worldInverse, mainCameraMatrix).multiply(scale).multiply(layerCameraInverse);
        anchorMatrix.decompose(this._tmpPosition, this._tmpQuaternion, this._tmpScale);
        anchor.position.copy(this._tmpPosition);
        anchor.quaternion.copy(this._tmpQuaternion);
        anchor.scale.copy(this._tmpScale);
        // Its lights lit it alone in GDevelop: here the main layer's light it.
        shownLayer.threeScene.traverse((object: any) => {
          if ((object.isLight || object.isAmbientLight || object.isHemisphereLight) && object.visible) object.visible = false;
        });
      }
    }

    // The camera.
    mainCameraMatrix.decompose(this._tmpPosition, this._tmpQuaternion, this._tmpScale);
    this.camera.position.copy(this._tmpPosition);
    this.camera.quaternion.copy(this._tmpQuaternion);
    const threeCamera = main.threeCamera;
    if (threeCamera.isPerspectiveCamera) {
      if (this.camera.fov !== threeCamera.fov) this.camera.fov = threeCamera.fov;
    }
    // GDevelop's near plane is often 1 cm in a world of metres (100 scene units by metre): ThreeRT's near clip.
    const near = Math.max(0.01, threeCamera.near);
    if (this.camera.near !== near) this.camera.near = near;
    if (this.camera.far !== threeCamera.far) this.camera.far = threeCamera.far;

    this._updateEnvironment(main.threeScene, runtimeScene);
    if ((getManifest() as any).profile && this._renderCount % 120 === 1) this._logLayers(shownLayers);
    // Materials with injected shaders (terrains...), looked for now and then (new objects get them).
    if (this._renderCount++ % 30 === 0) {
      for (const shownLayer of shownLayers) adaptShaderMaterials(shownLayer.threeScene);
    }
    this._hasRenderedOnce = true;
  }

  /** With `--profile`: the 3D layers shown and where their cameras and objects are. */
  private _logLayers(shownLayers: Array<{ layer: any; threeScene: any; threeCamera: any }>) {
    const describe = (v: any) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
    const lines = [`camera ${describe(this.camera.position)} fov ${this.camera.fov.toFixed(1)}`];
    for (const { layer, threeScene, threeCamera } of shownLayers) {
      let count = 0;
      threeScene.traverse(() => count++);
      const first = threeScene.children[0] && threeScene.children[0].children[0];
      const firstPosition = first ? describe(first.getWorldPosition(new S.Vector3())) : '-';
      lines.push(`layer "${layer.getName()}": ${count} objects, layer camera ${describe(threeCamera.position)}, first object at ${firstPosition} (world)`);
    }
    // What the centre of the picture shows.
    const raycaster = new S.Raycaster();
    const direction = new S.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    raycaster.set(this.camera.position.clone(), direction);
    const hits = raycaster.intersectObject(this.world, true).slice(0, 3);
    for (const hit of hits) {
      const object: any = hit.object;
      const material: any = object.material;
      let path = '';
      for (let o = object; o && o !== this.world; o = o.parent) path = (o.name || o.type) + '/' + path;
      lines.push(
        `centre hit at ${hit.distance.toFixed(2)} m: ${path} (${object.type}, visible ${object.visible}, material ${material ? material.type + ' opacity ' + material.opacity + ' map ' + (material.map ? material.map.uri : '-') : '-'})`
      );
    }
    console.info('[GDJS ThreeRT] ' + lines.join('\n  '));
  }

  private _updateEnvironment(layerScene: LayerScene, runtimeScene: any) {
    const background = layerScene.background;
    if (background && (background as any).isCubeTexture) {
      if (this._skyCubeTexture !== background) {
        this._skyCubeTexture = background;
        const images = (background as CubeTexture).images || [];
        const top = averageColorOfImage(images[2]) || [0.45, 0.6, 0.85];
        const bottom = averageColorOfImage(images[3]) || [0.3, 0.3, 0.3];
        const horizon = mix([images[0], images[1], images[4], images[5]].map(averageColorOfImage)) || [0.7, 0.75, 0.8];
        const toColor = (c: [number, number, number]) => new S.Color().setRGB(S.srgbToLinear(c[0]), S.srgbToLinear(c[1]), S.srgbToLinear(c[2]));
        this._sky = new S.SkyGradient({ zenith: toColor(top), horizon: toColor(horizon), ground: toColor(bottom), intensity: 1 });
      }
      if (this.scene.environment !== this._sky) this.scene.environment = this._sky;
      if (this.scene.background !== null) this.scene.background = null;
    } else {
      // A plain background colour: the scene's clear colour (GDevelop's background colour of the scene).
      const color = background && (background as any).isColor ? background : null;
      const backgroundColor = color || this._getSceneBackgroundColor(runtimeScene);
      if (this.scene.environment && this.scene.environment !== this._sky && !(this.scene.environment instanceof S.SkyColor)) {
        // (kept)
      } else if (this.scene.environment !== null) {
        this.scene.environment = null;
      }
      if (!this.scene.background || !(this.scene.background as any).equals(backgroundColor)) {
        this.scene.background = backgroundColor;
      }
    }
    if (this.scene.fog !== layerScene.fog) this.scene.fog = layerScene.fog;
  }

  private _sceneBackgroundColor = new S.Color();
  private _getSceneBackgroundColor(runtimeScene: any) {
    const rgb: number[] = runtimeScene.getBackgroundColor ? runtimeScene.getBackgroundColor() : [0, 0, 0];
    return this._sceneBackgroundColor.clone().setRGB(S.srgbToLinear(rgb[0] / 255), S.srgbToLinear(rgb[1] / 255), S.srgbToLinear(rgb[2] / 255));
  }
}
