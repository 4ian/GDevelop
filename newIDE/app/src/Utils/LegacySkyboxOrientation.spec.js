// @flow
import { markLegacySkyboxes } from './LegacySkyboxOrientation';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('markLegacySkyboxes', () => {
  it('marks the skyboxes without a top as legacy and keeps the others', () => {
    const { project, testLayout } = makeTestProject(gd);
    const effects = testLayout
      .getLayers()
      .getLayer('')
      .getEffects();
    effects.insertNewEffect('OldSky', 0).setEffectType('Scene3D::Skybox');
    const newSky = effects.insertNewEffect('NewSky', 1);
    newSky.setEffectType('Scene3D::Skybox');
    newSky.setStringParameter('top', 'Y-');
    effects
      .insertNewEffect('Light', 2)
      .setEffectType('Scene3D::HemisphereLight');

    markLegacySkyboxes(project);

    expect(effects.getEffect('OldSky').getStringParameter('top')).toBe(
      'Legacy'
    );
    expect(effects.getEffect('NewSky').getStringParameter('top')).toBe('Y-');
    expect(effects.getEffect('Light').hasStringParameter('top')).toBe(false);
  });
});
