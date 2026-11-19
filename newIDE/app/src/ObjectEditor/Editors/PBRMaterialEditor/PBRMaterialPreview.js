// @flow
import * as React from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import PixiResourcesLoader from '../../../ObjectsRendering/PixiResourcesLoader';
import { type PBRMaterialSettings, type PBRUvTransform } from './pbrConfig';

type Props = {|
  project: gdProject,
  settings: PBRMaterialSettings,
  height?: number,
|};

// Three.js does not expose Flow declarations in this project.
type ThreeTexture = any;
type ThreeMaterial = any;
type ThreeMesh = any;

const isColorTextureSlot = (slotName: string) =>
  slotName === 'baseColor' || slotName === 'emissive';

const textureSlots = [
  'baseColor',
  'metallicRoughness',
  'metallic',
  'roughness',
  'normal',
  'ao',
  'emissive',
  'height',
  'opacity',
];

/**
 * Return a clone of the texture with the UV transform applied (or the texture
 * itself when the transform is the identity).
 */
const applyUvTransform = (
  texture: ?ThreeTexture,
  transform: ?PBRUvTransform
): ?ThreeTexture => {
  if (!texture || !transform) return texture;
  const repeatX = transform.repeatX === undefined ? 1 : transform.repeatX;
  const repeatY = transform.repeatY === undefined ? 1 : transform.repeatY;
  const offsetX = transform.offsetX === undefined ? 0 : transform.offsetX;
  const offsetY = transform.offsetY === undefined ? 0 : transform.offsetY;
  const rotation = transform.rotation === undefined ? 0 : transform.rotation;
  if (
    repeatX === 1 &&
    repeatY === 1 &&
    offsetX === 0 &&
    offsetY === 0 &&
    rotation === 0
  ) {
    return texture;
  }
  const clone = texture.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.wrapT = THREE.RepeatWrapping;
  clone.center.set(0.5, 0.5);
  clone.repeat.set(repeatX, repeatY);
  clone.offset.set(offsetX, offsetY);
  clone.rotation = (rotation * Math.PI) / 180;
  clone.needsUpdate = true;
  return clone;
};

/**
 * Merge the global UV transform of the settings with the one of a slot.
 */
const getSlotUvTransform = (
  settings: PBRMaterialSettings,
  slotName: string
): ?PBRUvTransform => {
  const globalTransform = settings.uvTransform;
  const slotTransform =
    settings.slotUvTransforms && settings.slotUvTransforms[slotName];
  if (!globalTransform) return slotTransform;
  if (!slotTransform) return globalTransform;
  return {
    repeatX:
      slotTransform.repeatX === undefined
        ? globalTransform.repeatX
        : slotTransform.repeatX,
    repeatY:
      slotTransform.repeatY === undefined
        ? globalTransform.repeatY
        : slotTransform.repeatY,
    offsetX:
      slotTransform.offsetX === undefined
        ? globalTransform.offsetX
        : slotTransform.offsetX,
    offsetY:
      slotTransform.offsetY === undefined
        ? globalTransform.offsetY
        : slotTransform.offsetY,
    rotation:
      slotTransform.rotation === undefined
        ? globalTransform.rotation
        : slotTransform.rotation,
  };
};

/**
 * Build the Three.js material shown by the preview, from PBR settings.
 */
const createMaterial = async (
  project: gdProject,
  settings: PBRMaterialSettings
): Promise<ThreeMaterial> => {
  // Neutral values do not need the (slower) physical material, like in the
  // game engine (`settingsNeedPhysicalMaterial`).
  const needsPhysical =
    (settings.transmission !== undefined && settings.transmission > 0) ||
    (settings.clearcoat !== undefined && settings.clearcoat > 0) ||
    (settings.ior !== undefined && settings.ior !== 1.5);
  const material = needsPhysical
    ? new THREE.MeshPhysicalMaterial()
    : new THREE.MeshStandardMaterial();
  material.metalness = settings.metallic !== undefined ? settings.metallic : 0;
  material.roughness =
    settings.roughness !== undefined ? settings.roughness : 0.5;
  if (settings.baseColor) {
    const components = settings.baseColor
      .split(';')
      .map(component => +component);
    material.color.setRGB(
      components[0] / 255,
      components[1] / 255,
      components[2] / 255,
      THREE.SRGBColorSpace
    );
  }
  if (settings.emissiveColor) {
    const components = settings.emissiveColor
      .split(';')
      .map(component => +component);
    material.emissive.setRGB(
      components[0] / 255,
      components[1] / 255,
      components[2] / 255,
      THREE.SRGBColorSpace
    );
  }
  if (settings.emissiveIntensity !== undefined) {
    material.emissiveIntensity = settings.emissiveIntensity;
  }
  if (settings.opacity !== undefined) {
    const opacity = settings.opacity;
    material.opacity = opacity;
    material.transparent = opacity < 1;
  }
  if (
    settings.normalScale !== undefined ||
    settings.normalFlipY !== undefined
  ) {
    // The strength is always positive: `normalFlipY` only inverts the green
    // channel of the normal map (DirectX / Unreal convention).
    const strength = Math.abs(
      settings.normalScale !== undefined
        ? settings.normalScale
        : material.normalScale.x
    );
    const flip = settings.normalFlipY === true;
    material.normalScale.set(strength, flip ? -strength : strength);
  }
  if (settings.aoIntensity !== undefined) {
    material.aoMapIntensity = settings.aoIntensity;
  }
  if (settings.envMapIntensity !== undefined) {
    material.envMapIntensity = settings.envMapIntensity;
  }
  if (settings.displacementScale !== undefined) {
    material.displacementScale = settings.displacementScale;
  }
  if (settings.displacementBias !== undefined) {
    material.displacementBias = settings.displacementBias;
  }
  if (settings.alphaCutoff !== undefined && settings.alphaCutoff > 0) {
    material.alphaTest = settings.alphaCutoff;
    material.transparent = true;
  }
  if (needsPhysical) {
    const physicalMaterial: any = material;
    if (settings.ior !== undefined) physicalMaterial.ior = settings.ior;
    if (settings.transmission !== undefined) {
      const transmission = settings.transmission;
      physicalMaterial.transmission = transmission;
      if (transmission > 0) material.transparent = true;
    }
    if (settings.clearcoat !== undefined)
      physicalMaterial.clearcoat = settings.clearcoat;
    if (settings.clearcoatRoughness !== undefined)
      physicalMaterial.clearcoatRoughness = settings.clearcoatRoughness;
  }
  if (settings.doubleSided) {
    material.side = THREE.DoubleSide;
  }

  const textures = settings.textures || {};
  await Promise.all(
    textureSlots.map(async slotName => {
      const resourceName = textures[slotName];
      if (resourceName === undefined) return;
      const loadedTexture = resourceName
        ? await getPBRThreeTexture(
            project,
            resourceName,
            isColorTextureSlot(slotName)
          )
        : null;
      const texture = applyUvTransform(
        loadedTexture,
        getSlotUvTransform(settings, slotName)
      );
      switch (slotName) {
        case 'baseColor':
          material.map = texture;
          break;
        case 'metallicRoughness':
          material.metalnessMap = texture;
          material.roughnessMap = texture;
          break;
        case 'metallic':
          material.metalnessMap = texture;
          break;
        case 'roughness':
          material.roughnessMap = texture;
          break;
        case 'normal':
          material.normalMap = texture;
          break;
        case 'ao':
          material.aoMap = texture;
          break;
        case 'emissive':
          material.emissiveMap = texture;
          break;
        case 'height':
          material.displacementMap = texture;
          break;
        case 'opacity':
          material.alphaMap = texture;
          if (texture) material.transparent = true;
          break;
        default:
          break;
      }
    })
  );
  return material;
};

const getPBRThreeTexture = async (
  project: gdProject,
  resourceName: string,
  isColorData: boolean
): Promise<ThreeTexture> => {
  const texture = await PixiResourcesLoader.getThreeTexture(
    project,
    resourceName
  );
  if (isColorData) return texture;
  const linearTexture = texture.clone();
  linearTexture.colorSpace = THREE.NoColorSpace;
  linearTexture.needsUpdate = true;
  return linearTexture;
};

/**
 * A live preview of a PBR material, rendered with Three.js on a small canvas.
 */
const PBRMaterialPreview = ({
  project,
  settings,
  height = 220,
}: Props): React.Node => {
  const canvasRef = React.useRef<?HTMLCanvasElement>(null);
  const meshesRef = React.useRef<Array<ThreeMesh>>([]);
  const materialRef = React.useRef<?ThreeMaterial>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.6, 4.2);
    camera.lookAt(0, 0, 0);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const geometries = [
      { geometry: new THREE.SphereGeometry(0.85, 64, 32), x: -1.15 },
      { geometry: new THREE.BoxGeometry(1.3, 1.3, 1.3), x: 1.15 },
    ];
    // A placeholder material is used until the PBR material is built
    // (Three.js cannot render a mesh whose material is null).
    const placeholderMaterial = new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 0.5,
    });
    const meshes = geometries.map(({ geometry, x }) => {
      const mesh = new THREE.Mesh(geometry, placeholderMaterial);
      mesh.position.x = x;
      scene.add(mesh);
      return mesh;
    });
    meshesRef.current = meshes;

    let animationFrameId = 0;
    const render = () => {
      for (const mesh of meshes) {
        mesh.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    const resizeObserver = new ResizeObserver(() => {
      const width = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      if (width === 0 || clientHeight === 0) return;
      renderer.setSize(width, clientHeight, false);
      camera.aspect = width / clientHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(canvas);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      for (const { geometry } of geometries) {
        geometry.dispose();
      }
      placeholderMaterial.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  React.useEffect(
    () => {
      let cancelled = false;
      createMaterial(project, settings).then(material => {
        if (cancelled) {
          material.dispose();
          return;
        }
        const previousMaterial = materialRef.current;
        materialRef.current = material;
        for (const mesh of meshesRef.current) {
          if (mesh.material) mesh.material = material;
        }
        if (previousMaterial) previousMaterial.dispose();
      });
      return () => {
        cancelled = true;
      };
    },
    [project, settings]
  );

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height,
        borderRadius: 4,
        background:
          'linear-gradient(135deg, rgba(0,0,0,0.25), rgba(0,0,0,0.05))',
      }}
    />
  );
};

export default PBRMaterialPreview;
