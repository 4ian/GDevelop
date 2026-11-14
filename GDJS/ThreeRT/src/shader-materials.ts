// Materials whose look comes from GLSL injected by `onBeforeCompile` (three.js), which ThreeRT can't run. Their
// uniforms are read by calling `onBeforeCompile` with a stand-in shader, and known ones are given a ThreeRT material
// function (WGSL) doing the same, or hidden when they can't be drawn without their vertex shader:
// - the ground of the Terrain3D extension: its four texture layers blended by the painted weights (and tints);
// - the grass of Terrain3D (blades placed by the vertex shader): hidden.
import * as S from '@threert/scene';
import { warnOnce } from './three';

/** The uniforms of a material set by its `onBeforeCompile`, or null. */
const captureUniforms = (material: any): Record<string, { value: any }> | null => {
  if (!material || typeof material.onBeforeCompile !== 'function') return null;
  if (material.__threertUniforms !== undefined) return material.__threertUniforms;
  const includes = [
    'common', 'begin_vertex', 'defaultnormal_vertex', 'project_vertex', 'worldpos_vertex', 'map_fragment',
    'color_fragment', 'roughnessmap_fragment', 'metalnessmap_fragment', 'normal_fragment_begin',
    'normal_fragment_maps', 'clipping_planes_fragment', 'emissivemap_fragment', 'alphatest_fragment',
    'lights_fragment_begin', 'output_fragment', 'opaque_fragment', 'dithering_fragment',
  ]
    .map((name) => `#include <${name}>`)
    .join('\n');
  const shader = { uniforms: {} as Record<string, { value: any }>, vertexShader: 'void main() {\n' + includes + '\n}', fragmentShader: 'void main() {\n' + includes + '\n}', defines: {} };
  let uniforms: Record<string, { value: any }> | null = null;
  try {
    material.onBeforeCompile(shader, null);
    uniforms = Object.keys(shader.uniforms).length ? shader.uniforms : null;
  } catch (error) {
    uniforms = null;
  }
  material.__threertUniforms = uniforms;
  return uniforms;
};

const TERRAIN = new S.MaterialFunction('gdjs_terrain3d', {
  params: {
    // GDevelop scene coordinates (X and Y) of a world position: rows of the inverse of the layer scene's matrix.
    SceneX: [1, 0, 0, 0],
    SceneY: [0, 0, 1, 0],
    // The terrain's origin in the scene, and its inverse scale (scene to terrain coordinates).
    Origin: [0, 0, 1, 1],
    // Splat map UV scale and offset, texture size (scene units), scene units by metre.
    Splat: [0, 0, 256, 100],
    Color0: [1, 1, 1, 0],
    Color1: [1, 1, 1, 0],
    Color2: [1, 1, 1, 0],
    Color3: [1, 1, 1, 0],
  },
  textures: ['SplatMap', 'TintMap', 'Layer0', 'Layer1', 'Layer2', 'Layer3'],
  code: `
    let sceneXY = vec2<f32>(dot($SceneX.xyz, i.wp) + $SceneX.w, dot($SceneY.xyz, i.wp) + $SceneY.w);
    let localXY = (sceneXY - $Origin.xy) * $Origin.zw;
    let splatUv = localXY * $Splat.x + vec2<f32>($Splat.y, $Splat.y);
    let splatPerMetre = abs($Splat.x * $Origin.z) * $Splat.w;
    var w = msample(m, i, $SplatMap, splatUv, splatPerMetre);
    w = w * w;
    w = w / max(dot(w, vec4<f32>(1.0)), 0.00001);
    let uv = sceneXY / $Splat.z;
    let uvPerMetre = $Splat.w / $Splat.z;
    let t0 = msample_color(m, i, $Layer0, uv, uvPerMetre).rgb;
    let t1 = msample_color(m, i, $Layer1, uv, uvPerMetre).rgb;
    let t2 = msample_color(m, i, $Layer2, uv, uvPerMetre).rgb;
    let t3 = msample_color(m, i, $Layer3, uv, uvPerMetre).rgb;
    let tint = msample_color(m, i, $TintMap, splatUv, splatPerMetre).rgb;
    let color = w.x * $Color0.rgb * t0 + w.y * $Color1.rgb * t1 + w.z * $Color2.rgb * t2 + w.w * $Color3.rgb * t3;
    o.base = base.base * color * tint;`,
});

const rowOf = (matrix: S.Matrix4, row: number): [number, number, number, number] => {
  const e = matrix.elements;
  return [e[row], e[4 + row], e[8 + row], e[12 + row]];
};

const textureOrWhite = (texture: any, white: S.Texture) => (texture && texture instanceof S.Texture ? texture : white);

let whiteTexture: S.DataTexture | null = null;
const getWhiteTexture = () => (whiteTexture = whiteTexture || new S.DataTexture(1, 1, new Uint8Array([255, 255, 255, 255]), 'linear'));

/** The binding of the terrain function for a chunk of terrain `mesh` in `layerScene`, and its key (to redo it). */
const bindTerrain = (mesh: any, layerScene: any, uniforms: Record<string, { value: any }>) => {
  layerScene.updateWorldMatrix(true, false);
  mesh.updateWorldMatrix(true, false);
  const sceneInverse = new S.Matrix4().copy(layerScene.matrixWorld).invert();
  const meshInScene = new S.Matrix4().multiplyMatrices(sceneInverse, mesh.matrixWorld);
  const e = meshInScene.elements;
  const scaleX = Math.hypot(e[0], e[1], e[2]) || 1;
  const scaleY = Math.hypot(e[4], e[5], e[6]) || 1;
  // Scene units by metre: the length of a world metre in the scene.
  const sceneScale = new S.Vector3();
  sceneInverse.decompose(new S.Vector3(), new S.Quaternion(), sceneScale);
  const splat = uniforms.terrainSplatUvScaleAndOffset.value;
  const colors = uniforms.terrainLayerColors.value as any[];
  const white = getWhiteTexture();
  const layerTexture = (index: number) => textureOrWhite(uniforms['terrainLayerMap' + index] && uniforms['terrainLayerMap' + index].value, white);
  const params = {
    SceneX: rowOf(sceneInverse, 0),
    SceneY: rowOf(sceneInverse, 1),
    Origin: [e[12], e[13], 1 / scaleX, 1 / scaleY],
    Splat: [splat.x, splat.y, uniforms.terrainTextureSize ? uniforms.terrainTextureSize.value : 256, Math.abs(sceneScale.x)],
    Color0: [colors[0].r, colors[0].g, colors[0].b, 1],
    Color1: [colors[1].r, colors[1].g, colors[1].b, 1],
    Color2: [colors[2].r, colors[2].g, colors[2].b, 1],
    Color3: [colors[3].r, colors[3].g, colors[3].b, 1],
  };
  const textures = {
    SplatMap: textureOrWhite(uniforms.terrainSplatMap.value, white),
    TintMap: textureOrWhite(uniforms.terrainColorMap && uniforms.terrainColorMap.value, white),
    Layer0: layerTexture(0),
    Layer1: layerTexture(1),
    Layer2: layerTexture(2),
    Layer3: layerTexture(3),
  };
  const key = JSON.stringify(params) + Object.values(textures).map((t: any) => t.uuid).join(',');
  return { key, binding: () => TERRAIN.with(params as any, textures as any) };
};

/** Looks for materials with injected shaders under `layerScene`, and gives them what ThreeRT can draw. */
export const adaptShaderMaterials = (layerScene: any) => {
  const terrainMaterials = new Map<any, any>();
  layerScene.traverse((object: any) => {
    if (!object.isMesh && !object.isInstancedMesh) return;
    const material = object.material;
    const uniforms = captureUniforms(material);
    if (!uniforms) return;
    if (uniforms.terrainSplatMap && uniforms.terrainLayerColors) {
      if (!terrainMaterials.has(material)) terrainMaterials.set(material, { mesh: object, uniforms });
    } else if (uniforms.grassBaseColor) {
      if (object.visible) {
        warnOnce('The grass of Terrain3D is not drawn (its blades are placed by a vertex shader).');
        object.visible = false;
      }
    }
  });
  for (const [material, { mesh, uniforms }] of terrainMaterials) {
    try {
      const { key, binding } = bindTerrain(mesh, layerScene, uniforms);
      if (material.__threertShaderKey === key) continue;
      material.__threertShaderKey = key;
      material.shader = binding();
      material.needsUpdate = true;
    } catch (error) {
      warnOnce('Unable to draw a terrain: ' + error);
    }
  }
};
