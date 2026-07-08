// @flow
import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import CheckeredBackground from '../CheckeredBackground';

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  canvasHost: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    pointerEvents: 'none',
  },
  errorBox: {
    maxWidth: 520,
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
  },
};

type Props = {|
  modelUrl: string,
|};

const removeMetalness = material => {
  if (material && material.metalness) {
    material.metalness = 0;
  }
};

const removeMetalnessFromMesh = node => {
  if (!node.material) return;

  if (Array.isArray(node.material)) {
    node.material.forEach(removeMetalness);
    return;
  }

  removeMetalness(node.material);
};

const disposeObject = object => {
  object.traverse(child => {
    if (child.geometry) child.geometry.dispose();

    const disposeMaterial = material => {
      if (!material) return;
      Object.keys(material).forEach(key => {
        const value = material[key];
        if (value && value.isTexture) value.dispose();
      });
      material.dispose();
    };

    if (Array.isArray(child.material)) {
      child.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(child.material);
    }
  });
};

const frameModel = ({
  model,
  camera,
  controls,
}: {|
  model: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: any,
|}) => {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const distance =
    (maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) *
    1.7;

  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.position.set(distance, distance * 0.7, distance);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = Math.max(distance / 20, 0.01);
  controls.maxDistance = distance * 20;
  controls.update();
};

const InteractiveModel3DPreview = ({ modelUrl }: Props): React.Node => {
  const canvasHostRef = React.useRef<?HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<?string>(null);

  React.useEffect(
    () => {
      const canvasHost = canvasHostRef.current;
      if (!canvasHost || !modelUrl) return;

      let isDisposed = false;
      let animationFrameId = null;
      let resizeObserver = null;
      let model = null;

      setIsLoading(true);
      setError(null);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.useLegacyLights = true;
      renderer.setPixelRatio(
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      canvasHost.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.screenSpacePanning = true;

      const light = new THREE.HemisphereLight(0xffffff, 0x404040, 2.2);
      light.position.set(0, 1, 0);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
      directionalLight.position.set(3, 4, 5);
      scene.add(directionalLight);

      const resize = () => {
        if (isDisposed) return;
        const width = Math.max(canvasHost.clientWidth, 1);
        const height = Math.max(canvasHost.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const render = () => {
        if (isDisposed) return;
        controls.update();
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(render);
      };

      resize();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvasHost);
      } else if (typeof window !== 'undefined') {
        window.addEventListener('resize', resize);
      }
      render();

      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        gltf => {
          if (isDisposed) return;
          model = gltf.scene;
          model.traverse(removeMetalnessFromMesh);
          scene.add(model);
          frameModel({ model, camera, controls });
          setIsLoading(false);
        },
        undefined,
        loadError => {
          if (isDisposed) return;
          setError(loadError.message || 'Unable to load this 3D model.');
          setIsLoading(false);
        }
      );

      return () => {
        isDisposed = true;
        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        } else if (typeof window !== 'undefined') {
          window.removeEventListener('resize', resize);
        }
        controls.dispose();
        if (model) {
          scene.remove(model);
          disposeObject(model);
        }
        renderer.dispose();
        if (renderer.domElement.parentNode === canvasHost) {
          canvasHost.removeChild(renderer.domElement);
        }
      };
    },
    [modelUrl]
  );

  return (
    <div style={styles.container}>
      <CheckeredBackground />
      <div ref={canvasHostRef} style={styles.canvasHost} />
      {isLoading && (
        <div style={styles.overlay}>
          <PlaceholderLoader />
        </div>
      )}
      {!!error && (
        <div style={styles.overlay}>
          <div style={styles.errorBox}>
            <Text noMargin>{error}</Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveModel3DPreview;
