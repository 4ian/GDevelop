// @noflow
import fs from 'fs';
import path from 'path';
import {
  doesModelAnimationClipMatchSearch,
  getModelAnimationClipLabel,
} from './Model3DAnimationUtils';
import { getModelBoneDisplayName } from './Model3DBoneUtils';
import {
  getModelPreviewCameraZoom,
  MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM,
} from './Model3DFullscreenUtils';

describe('InteractiveModel3DPreview', () => {
  it('uses balanced lighting that preserves model colors and highlights', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'InteractiveModel3DPreview.js'),
      'utf8'
    );

    expect(source).toContain('const PREVIEW_HEMISPHERE_LIGHT_INTENSITY = 0.7;');
    expect(source).toContain(
      'const PREVIEW_DIRECTIONAL_LIGHT_INTENSITY = 0.4;'
    );
  });

  it('keeps GLB animation names and labels unnamed clips', () => {
    expect(getModelAnimationClipLabel('Walk', 0)).toBe('Walk');
    expect(getModelAnimationClipLabel('', 0)).toBe('Animation 1');
    expect(getModelAnimationClipLabel('', 3)).toBe('Animation 4');
  });

  it('filters animation clips by their displayed name', () => {
    expect(doesModelAnimationClipMatchSearch('Idle_A', 0, 'idle')).toBe(true);
    expect(doesModelAnimationClipMatchSearch('Jump', 1, 'IDLE')).toBe(false);
    expect(doesModelAnimationClipMatchSearch('Course', 2, '  coursé ')).toBe(
      true
    );
    expect(doesModelAnimationClipMatchSearch('', 3, 'animation 4')).toBe(true);
    expect(doesModelAnimationClipMatchSearch('Walk', 0, '')).toBe(true);
  });

  it('lists GLB animation clips and lets them be played or paused', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'InteractiveModel3DPreview.js'),
      'utf8'
    );

    expect(source).toContain('new THREE.AnimationMixer(model)');
    expect(source).toContain('gltf.animations.map');
    expect(source).toContain('animationMixer.update(deltaTime)');
    expect(source).toContain('controller.mixer.stopAllAction()');
    expect(source).toContain('action.setLoop(THREE.LoopRepeat, Infinity)');
    expect(source).toContain('action.paused = true');
    expect(source).toContain('action.paused = false');
    expect(source).toContain('<Trans>Animations</Trans>');
    expect(source).toContain('placeholder={t`Filter animations by name`}');
    expect(source).toContain('filteredAnimationClips.map');
    expect(source).toContain('isPlaying ? <Pause /> : <Play />');
  });

  it('can show the model preview full screen with closer framing', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'InteractiveModel3DPreview.js'),
      'utf8'
    );

    expect(getModelPreviewCameraZoom(false)).toBe(1);
    expect(getModelPreviewCameraZoom(true)).toBe(
      MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM
    );
    expect(MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM).toBeGreaterThan(1);
    expect(source).toContain("addEventListener('fullscreenchange'");
    expect(source).toContain('previewContainer.requestFullscreen()');
    expect(source).toContain('document.exitFullscreen()');
    expect(source).toContain('camera.zoom = getModelPreviewCameraZoom(');
    expect(source).toContain('id="model-toggle-fullscreen"');
    expect(source).toContain('<Trans>Full screen</Trans>');
    expect(source).toContain('<Trans>Exit full screen</Trans>');
  });

  it('can reveal the model skeleton and bone names', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'InteractiveModel3DPreview.js'),
      'utf8'
    );

    expect(source).toContain('new THREE.SkeletonHelper(model)');
    expect(source).toContain('new THREE.Points(');
    expect(source).toContain('context.arc(32, 32, 24, 0, Math.PI * 2)');
    expect(source).toContain('boneJointPositions.setXYZ(');
    expect(source).toContain("addEventListener('pointermove', onPointerMove)");
    expect(source).toContain('findHoveredBoneJointIndex({');
    expect(source).toContain('displayName: boneDisplayNames[hoveredBoneIndex]');
    expect(source).toContain('showBoneJointTooltip({');
    expect(source).toContain(
      "canvasHost.addEventListener('click', onBoneJointClick)"
    );
    expect(source).toContain('onCopyBoneName(canonicalName)');
    expect(source).toContain("? 'copy'");
    expect(source).toContain('new CSS2DObject(');
    expect(source).toContain('getModelBoneDisplayName(bone, boneIndex)');
    expect(source).toContain('getModelBoneCanonicalName(bone)');
    expect(source).toContain('copyTooltip: i18n._(t`Click to copy bone name`)');
    expect(source).toContain('copyTextToClipboard(boneName)');
    expect(source).toContain('<Trans>Bone name copied to clipboard!</Trans>');
    expect(source).toContain('MODEL_OPACITY_WHEN_SHOWING_BONES = 0.18');
    expect(source).toContain('captureModelMaterialAppearances(model)');
    expect(source).toContain('setModelMaterialsBonesVisibility({');
    expect(source).toContain('id="model-show-bones"');
    expect(source).toContain('id="model-show-bone-names"');
    expect(source).toContain('<Trans>Show bones</Trans>');
    expect(source).toContain('<Trans>Hide bones</Trans>');
    expect(source).toContain('<Trans>Show bone names</Trans>');
    expect(source).toContain('<Trans>Hide bone names</Trans>');
    expect(source).toContain('bonesVisualizationController.dispose()');
  });

  it('keeps periods from the original GLB bone name', () => {
    expect(
      getModelBoneDisplayName(
        {
          name: 'handslotl',
          userData: { name: 'handslot.l' },
        },
        0
      )
    ).toBe('handslot.l');
    expect(getModelBoneDisplayName({ name: 'spine', userData: {} }, 1)).toBe(
      'spine'
    );
    expect(getModelBoneDisplayName({ name: '', userData: {} }, 2)).toBe(
      'Bone 3'
    );
  });
});
