// @noflow
import fs from 'fs';
import path from 'path';
import { getModelAnimationClipLabel } from './Model3DAnimationUtils';

describe('InteractiveModel3DPreview', () => {
  it('keeps GLB animation names and labels unnamed clips', () => {
    expect(getModelAnimationClipLabel('Walk', 0)).toBe('Walk');
    expect(getModelAnimationClipLabel('', 0)).toBe('Animation 1');
    expect(getModelAnimationClipLabel('', 3)).toBe('Animation 4');
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
    expect(source).toContain('animationClips.map');
    expect(source).toContain('isPlaying ? <Pause /> : <Play />');
  });
});
