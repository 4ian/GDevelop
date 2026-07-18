// @noflow
import fs from 'fs';
import path from 'path';
import {
  doesModelAnimationClipMatchSearch,
  getModelAnimationClipLabel,
} from './Model3DAnimationUtils';

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
});
