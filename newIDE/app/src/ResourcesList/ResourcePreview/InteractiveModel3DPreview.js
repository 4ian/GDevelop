// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import SearchBar from '../../UI/SearchBar';
import InfoBar from '../../UI/Messages/InfoBar';
import Play from '../../UI/CustomSvgIcons/Play';
import Pause from '../../UI/CustomSvgIcons/Pause';
import { copyTextToClipboard } from '../../Utils/Clipboard';
import CheckeredBackground from '../CheckeredBackground';
import {
  doesModelAnimationClipMatchSearch,
  getModelAnimationClipLabel,
} from './Model3DAnimationUtils';
import {
  getModelBoneCanonicalName,
  getModelBoneDisplayName,
} from './Model3DBoneUtils';
import { createBoneLabelElement } from './Model3DBoneLabelUtils';

const PREVIEW_HEMISPHERE_LIGHT_INTENSITY = 0.7;
const PREVIEW_DIRECTIONAL_LIGHT_INTENSITY = 0.4;
const MODEL_OPACITY_WHEN_SHOWING_BONES = 0.18;
const BONE_JOINT_MARKER_SIZE = 11;

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
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    padding: '6px 10px 2px',
  },
  animationPanelTitle: {
    flexShrink: 0,
  },
  animationPanelSearch: {
    flex: '0 1 344px',
    minWidth: 0,
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

type MaterialAppearance = {|
  material: any,
  transparent: boolean,
  opacity: number,
  depthWrite: boolean,
|};

type BonesVisualizationController = {|
  update: () => void,
  render: () => void,
  setSize: (width: number, height: number) => void,
  setBonesVisible: (isVisible: boolean) => void,
  setBoneNamesVisible: (isVisible: boolean) => void,
  dispose: () => void,
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

const getMaterials = (node: any): Array<any> => {
  if (!node.material) return [];
  return Array.isArray(node.material) ? node.material : [node.material];
};

const createBoneJointMarkerTexture = (): any => {
  const markerCanvas = document.createElement('canvas');
  markerCanvas.width = 64;
  markerCanvas.height = 64;
  const context = markerCanvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, markerCanvas.width, markerCanvas.height);
    context.beginPath();
    context.arc(32, 32, 24, 0, Math.PI * 2);
    context.fillStyle = 'rgba(15, 20, 28, 0.95)';
    context.fill();
    context.lineWidth = 10;
    context.strokeStyle = '#57daff';
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(markerCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createBonesVisualization = ({
  model,
  scene,
  camera,
  canvasHost,
  onCopyBoneName,
}: {|
  model: any,
  scene: any,
  camera: any,
  canvasHost: HTMLDivElement,
  onCopyBoneName: (boneName: string) => void,
|}): BonesVisualizationController | null => {
  const bones: Array<any> = [];
  model.traverse(child => {
    if (child.isBone) bones.push(child);
  });
  if (!bones.length) return null;

  const materialAppearances: Array<MaterialAppearance> = [];
  const recordedMaterials = new Set<any>();
  model.traverse(child => {
    getMaterials(child).forEach(material => {
      if (!material || recordedMaterials.has(material)) return;
      recordedMaterials.add(material);
      materialAppearances.push({
        material,
        transparent: material.transparent,
        opacity: material.opacity,
        depthWrite: material.depthWrite,
      });
    });
  });

  const skeletonHelper = new THREE.SkeletonHelper(model);
  skeletonHelper.visible = false;
  skeletonHelper.renderOrder = 1000;
  skeletonHelper.material.vertexColors = false;
  skeletonHelper.material.color.set(0x57daff);
  skeletonHelper.material.needsUpdate = true;
  scene.add(skeletonHelper);

  const boneJointMarkerTexture = createBoneJointMarkerTexture();
  const boneJointPositions = new THREE.BufferAttribute(
    new Float32Array(bones.length * 3),
    3
  );
  const boneJointGeometry = new THREE.BufferGeometry();
  boneJointGeometry.setAttribute('position', boneJointPositions);
  const boneJointMaterial = new THREE.PointsMaterial({
    map: boneJointMarkerTexture,
    size: BONE_JOINT_MARKER_SIZE,
    sizeAttenuation: false,
    transparent: true,
    alphaTest: 0.1,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const boneJoints = new THREE.Points(boneJointGeometry, boneJointMaterial);
  boneJoints.visible = false;
  boneJoints.renderOrder = 1001;
  boneJoints.matrix = model.matrixWorld;
  boneJoints.matrixAutoUpdate = false;
  scene.add(boneJoints);

  const inverseModelWorldMatrix = new THREE.Matrix4();
  const bonePosition = new THREE.Vector3();
  const updateBoneJointPositions = () => {
    model.updateMatrixWorld(true);
    inverseModelWorldMatrix.copy(model.matrixWorld).invert();
    bones.forEach((bone, boneIndex) => {
      bonePosition
        .setFromMatrixPosition(bone.matrixWorld)
        .applyMatrix4(inverseModelWorldMatrix);
      boneJointPositions.setXYZ(
        boneIndex,
        bonePosition.x,
        bonePosition.y,
        bonePosition.z
      );
    });
    boneJointPositions.needsUpdate = true;
  };
  updateBoneJointPositions();

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.zIndex = '2';
  labelRenderer.domElement.style.pointerEvents = 'none';
  canvasHost.appendChild(labelRenderer.domElement);

  const boneLabels = bones.map((bone, boneIndex) => {
    const label = new CSS2DObject(
      createBoneLabelElement({
        displayName: getModelBoneDisplayName(bone, boneIndex),
        canonicalName: getModelBoneCanonicalName(bone),
        onCopy: onCopyBoneName,
      })
    );
    label.visible = false;
    label.center.set(0, 1);
    bone.add(label);
    return label;
  });

  let areBonesVisible = false;
  let areBoneNamesVisible = false;
  const updateBoneNamesVisibility = () => {
    boneLabels.forEach(label => {
      label.visible = areBonesVisible && areBoneNamesVisible;
    });
  };

  const setBonesVisible = (isVisible: boolean) => {
    areBonesVisible = isVisible;
    skeletonHelper.visible = isVisible;
    boneJoints.visible = isVisible;
    updateBoneNamesVisibility();
    materialAppearances.forEach(appearance => {
      const { material } = appearance;
      material.transparent = isVisible ? true : appearance.transparent;
      material.opacity = isVisible
        ? Math.min(appearance.opacity, MODEL_OPACITY_WHEN_SHOWING_BONES)
        : appearance.opacity;
      material.depthWrite = isVisible ? false : appearance.depthWrite;
      material.needsUpdate = true;
    });
  };

  const setBoneNamesVisible = (isVisible: boolean) => {
    areBoneNamesVisible = isVisible;
    updateBoneNamesVisibility();
  };

  return {
    update: () => {
      if (areBonesVisible) updateBoneJointPositions();
    },
    render: () => labelRenderer.render(scene, camera),
    setSize: (width, height) => labelRenderer.setSize(width, height),
    setBonesVisible,
    setBoneNamesVisible,
    dispose: () => {
      setBoneNamesVisible(false);
      setBonesVisible(false);
      boneLabels.forEach((label, boneIndex) => {
        bones[boneIndex].remove(label);
      });
      scene.remove(skeletonHelper);
      skeletonHelper.dispose();
      scene.remove(boneJoints);
      boneJointGeometry.dispose();
      boneJointMaterial.dispose();
      boneJointMarkerTexture.dispose();
      if (labelRenderer.domElement.parentNode === canvasHost) {
        canvasHost.removeChild(labelRenderer.domElement);
      }
    },
  };
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
  const bonesVisualizationControllerRef = React.useRef<?BonesVisualizationController>(
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
  const [animationNameFilter, setAnimationNameFilter] = React.useState('');
  const [hasBones, setHasBones] = React.useState(false);
  const [isShowingBones, setIsShowingBones] = React.useState(false);
  const [isShowingBoneNames, setIsShowingBoneNames] = React.useState(false);
  const [boneNameCopyStatus, setBoneNameCopyStatus] = React.useState<
    'success' | 'error' | null
  >(null);

  const onCopyBoneName = React.useCallback((boneName: string) => {
    copyTextToClipboard(boneName).then(
      () => setBoneNameCopyStatus('success'),
      () => setBoneNameCopyStatus('error')
    );
  }, []);

  const filteredAnimationClips = animationClips
    .map((animationClip, animationIndex) => ({
      animationClip,
      animationIndex,
    }))
    .filter(({ animationClip, animationIndex }) =>
      doesModelAnimationClipMatchSearch(
        animationClip.name,
        animationIndex,
        animationNameFilter
      )
    );

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

  const toggleBones = React.useCallback(
    () => {
      if (!bonesVisualizationControllerRef.current) return;
      if (isShowingBones) setIsShowingBoneNames(false);
      setIsShowingBones(!isShowingBones);
    },
    [isShowingBones]
  );

  const toggleBoneNames = React.useCallback(
    () => {
      if (!bonesVisualizationControllerRef.current || !isShowingBones) return;
      setIsShowingBoneNames(!isShowingBoneNames);
    },
    [isShowingBoneNames, isShowingBones]
  );

  React.useEffect(
    () => {
      if (bonesVisualizationControllerRef.current) {
        bonesVisualizationControllerRef.current.setBonesVisible(isShowingBones);
      }
    },
    [isShowingBones]
  );

  React.useEffect(
    () => {
      if (bonesVisualizationControllerRef.current) {
        bonesVisualizationControllerRef.current.setBoneNamesVisible(
          isShowingBoneNames
        );
      }
    },
    [isShowingBoneNames]
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
      let bonesVisualizationController: ?BonesVisualizationController = null;

      setIsLoading(true);
      setError(null);
      setAnimationClips([]);
      setSelectedAnimationIndex(null);
      setIsAnimationPlaying(false);
      setAnimationNameFilter('');
      setHasBones(false);
      setIsShowingBones(false);
      setIsShowingBoneNames(false);
      animationPlaybackControllerRef.current = null;
      bonesVisualizationControllerRef.current = null;

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

      const light = new THREE.HemisphereLight(
        0xffffff,
        0x404040,
        PREVIEW_HEMISPHERE_LIGHT_INTENSITY
      );
      light.position.set(0, 1, 0);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        PREVIEW_DIRECTIONAL_LIGHT_INTENSITY
      );
      directionalLight.position.set(3, 4, 5);
      scene.add(directionalLight);

      const clock = new THREE.Clock();

      const resize = () => {
        if (isDisposed) return;
        const width = Math.max(canvasHost.clientWidth, 1);
        const height = Math.max(canvasHost.clientHeight, 1);
        renderer.setSize(width, height, false);
        if (bonesVisualizationController) {
          // The CSS labels share the same viewport as the WebGL canvas.
          bonesVisualizationController.setSize(width, height);
        }
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const render = () => {
        if (isDisposed) return;
        const deltaTime = clock.getDelta();
        if (animationMixer) animationMixer.update(deltaTime);
        controls.update();
        if (bonesVisualizationController) {
          bonesVisualizationController.update();
        }
        renderer.render(scene, camera);
        if (bonesVisualizationController) {
          bonesVisualizationController.render();
        }
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
          bonesVisualizationController = createBonesVisualization({
            model,
            scene,
            camera,
            canvasHost,
            onCopyBoneName,
          });
          bonesVisualizationControllerRef.current = bonesVisualizationController;
          setHasBones(!!bonesVisualizationController);
          resize();
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
        bonesVisualizationControllerRef.current = null;
        if (bonesVisualizationController) {
          bonesVisualizationController.dispose();
        }
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
    [modelUrl, onCopyBoneName]
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
      {(animationClips.length > 0 || hasBones) && (
        <div style={styles.animationPanel}>
          <div style={styles.animationPanelHeader}>
            {animationClips.length > 0 && (
              <React.Fragment>
                <div style={styles.animationPanelTitle}>
                  <Text size="body-small" noMargin>
                    <Trans>Animations</Trans> ({animationClips.length})
                  </Text>
                </div>
                <div style={styles.animationPanelSearch}>
                  <SearchBar
                    id="model-animation-name-filter"
                    value={animationNameFilter}
                    onChange={setAnimationNameFilter}
                    onChangeImmediately
                    onRequestSearch={() => {}}
                    placeholder={t`Filter animations by name`}
                  />
                </div>
              </React.Fragment>
            )}
            {hasBones && (
              <React.Fragment>
                <FlatButton
                  id="model-show-bones"
                  label={
                    isShowingBones ? (
                      <Trans>Hide bones</Trans>
                    ) : (
                      <Trans>Show bones</Trans>
                    )
                  }
                  primary={isShowingBones}
                  onClick={toggleBones}
                  style={{ flexShrink: 0 }}
                />
                <FlatButton
                  id="model-show-bone-names"
                  label={
                    isShowingBoneNames ? (
                      <Trans>Hide bone names</Trans>
                    ) : (
                      <Trans>Show bone names</Trans>
                    )
                  }
                  primary={isShowingBoneNames}
                  disabled={!isShowingBones}
                  onClick={toggleBoneNames}
                  style={{ flexShrink: 0 }}
                />
              </React.Fragment>
            )}
          </div>
          {animationClips.length > 0 && (
            <div style={styles.animationList}>
              {filteredAnimationClips.map(
                ({ animationClip, animationIndex }) => {
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
                }
              )}
            </div>
          )}
        </div>
      )}
      <InfoBar
        message={
          boneNameCopyStatus === 'error' ? (
            <Trans>Unable to copy the bone name.</Trans>
          ) : (
            <Trans>Bone name copied to clipboard!</Trans>
          )
        }
        visible={boneNameCopyStatus !== null}
        hide={() => setBoneNameCopyStatus(null)}
      />
    </div>
  );
};

export default InteractiveModel3DPreview;
