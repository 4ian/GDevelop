// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import Play from '../../UI/CustomSvgIcons/Play';
import Pause from '../../UI/CustomSvgIcons/Pause';
import CheckeredBackground from '../CheckeredBackground';
import { getModelAnimationClipLabel } from './Model3DAnimationUtils';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  previewStage: {
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
  animationPanel: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    maxHeight: 142,
    minWidth: 0,
    borderTop: '1px solid rgba(128, 128, 128, 0.28)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    zIndex: 3,
  },
  animationPanelHeader: {
    flexShrink: 0,
    padding: '6px 10px 2px',
  },
  animationList: {
    display: 'flex',
    flexWrap: 'wrap',
    minWidth: 0,
    overflow: 'auto',
    padding: '0 6px 6px',
  },
};

type Props = {|
  modelUrl: string,
|};

type ModelAnimationClipInfo = {|
  name: string,
  duration: number,
|};

type AnimationPlaybackController = {|
  // Three.js does not expose Flow types in this version of the IDE.
  mixer: any,
  actions: Array<any>,
|};

const removeMetalness = (material: any) => {
  if (material && material.metalness) {
    material.metalness = 0;
  }
};

const removeMetalnessFromMesh = (node: any) => {
  if (!node.material) return;

  if (Array.isArray(node.material)) {
    node.material.forEach(removeMetalness);
    return;
  }

  removeMetalness(node.material);
};

const disposeObject = (object: any) => {
  object.traverse(child => {
    if (child.geometry) child.geometry.dispose();

    const disposeMaterial = (material: any) => {
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
  model: any,
  camera: any,
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
  const animationPlaybackControllerRef = React.useRef<?AnimationPlaybackController>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<?string>(null);
  const [animationClips, setAnimationClips] = React.useState<
    Array<ModelAnimationClipInfo>
  >([]);
  const [
    selectedAnimationIndex,
    setSelectedAnimationIndex,
  ] = React.useState<?number>(null);
  const [isAnimationPlaying, setIsAnimationPlaying] = React.useState(false);

  const toggleAnimation = React.useCallback(
    (animationIndex: number) => {
      const controller = animationPlaybackControllerRef.current;
      if (!controller) return;

      const action = controller.actions[animationIndex];
      if (!action) return;

      if (selectedAnimationIndex === animationIndex) {
        if (isAnimationPlaying) {
          action.paused = true;
          setIsAnimationPlaying(false);
        } else {
          action.paused = false;
          action.play();
          setIsAnimationPlaying(true);
        }
        return;
      }

      controller.mixer.stopAllAction();
      action.reset();
      action.paused = false;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      setSelectedAnimationIndex(animationIndex);
      setIsAnimationPlaying(true);
    },
    [isAnimationPlaying, selectedAnimationIndex]
  );

  React.useEffect(
    () => {
      const canvasHost = canvasHostRef.current;
      if (!canvasHost || !modelUrl) return;

      let isDisposed = false;
      let animationFrameId = null;
      let resizeObserver = null;
      let model = null;
      let animationMixer: any = null;

      setIsLoading(true);
      setError(null);
      setAnimationClips([]);
      setSelectedAnimationIndex(null);
      setIsAnimationPlaying(false);
      animationPlaybackControllerRef.current = null;

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

      const clock = new THREE.Clock();

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
        const deltaTime = clock.getDelta();
        if (animationMixer) animationMixer.update(deltaTime);
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
          animationMixer = new THREE.AnimationMixer(model);
          const actions = gltf.animations.map(animationClip =>
            animationMixer.clipAction(animationClip)
          );
          animationPlaybackControllerRef.current = {
            mixer: animationMixer,
            actions,
          };
          setAnimationClips(
            gltf.animations.map(animationClip => ({
              name: animationClip.name,
              duration: animationClip.duration,
            }))
          );
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
        animationPlaybackControllerRef.current = null;
        if (animationMixer) {
          animationMixer.stopAllAction();
          if (model) animationMixer.uncacheRoot(model);
        }
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
      <div style={styles.previewStage}>
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
      {animationClips.length > 0 && (
        <div style={styles.animationPanel}>
          <div style={styles.animationPanelHeader}>
            <Text size="body-small" noMargin>
              <Trans>Animations</Trans> ({animationClips.length})
            </Text>
          </div>
          <div style={styles.animationList}>
            {animationClips.map((animationClip, animationIndex) => {
              const isSelected = selectedAnimationIndex === animationIndex;
              const isPlaying = isSelected && isAnimationPlaying;
              const animationLabel = getModelAnimationClipLabel(
                animationClip.name,
                animationIndex
              );
              return (
                <FlatButton
                  key={`${animationClip.name}:${animationIndex}`}
                  id={`model-animation-${animationIndex}`}
                  label={<span translate="no">{animationLabel}</span>}
                  leftIcon={isPlaying ? <Pause /> : <Play />}
                  primary={isSelected}
                  onClick={() => toggleAnimation(animationIndex)}
                  style={{ margin: 2 }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveModel3DPreview;
