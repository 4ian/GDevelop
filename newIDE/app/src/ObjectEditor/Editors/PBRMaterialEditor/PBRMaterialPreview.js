// @flow
import * as React from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import PixiResourcesLoader from '../../../ObjectsRendering/PixiResourcesLoader';
import { type PBRMaterialSettings } from './pbrConfig';

type Props = {|
  project: gdProject,
  settings: PBRMaterialSettings,
  height?: number,
|};

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
 * Build the Three.js material shown by the preview, from PBR settings.
 */
const createMaterial = async (
  project: gdProject,
  settings: PBRMaterialSettings
): Promise<THREE.Material> => {
  const needsPhysical =
    settings.transmission !== undefined ||
    settings.ior !== undefined ||
    settings.clearcoat !== undefined;
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
    material.opacity = settings.opacity;
    material.transparent = settings.opacity < 1;
  }
  if (settings.normalScale !== undefined) {
    material.normalScale.setScalar(settings.normalScale);
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
      physicalMaterial.transmission = settings.transmission;
      if (settings.transmission > 0) material.transparent = true;
    }
    if (settings.clearcoat !== undefined)
      physicalMaterial.clearcoat = settings.clearcoat;
  }
  if (settings.doubleSided) {
    material.side = THREE.DoubleSide;
  }

  const textures = settings.textures || {};
  await Promise.all(
    textureSlots.map(async slotName => {
      const resourceName = textures[slotName];
      if (resourceName === undefined) return;
      const texture = resourceName
        ? await getPBRThreeTexture(
            project,
            resourceName,
            isColorTextureSlot(slotName)
          )
        : null;
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
): Promise<THREE.Texture> => {
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
const PBRMaterialPreview = ({ project, settings, height = 220 }: Props) => {
  const canvasRef = React.useRef<?HTMLCanvasElement>(null);
  const meshesRef = React.useRef<Array<THREE.Mesh>>([]);
  const materialRef = React.useRef<?THREE.Material>(null);

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
