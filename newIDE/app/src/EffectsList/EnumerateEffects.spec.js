// @flow
import { enumerateEffectsMetadata } from './EnumerateEffects';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { makeTestProject } from '../fixtures/TestProject';
const gd: libGDevelop = global.gd;

describe('EnumerateEffects', () => {
  it('can enumerate effects for layers', () => {
    makeTestExtensions(gd);
    const { project } = makeTestProject(gd);
    const enumeratedEffectsMetadata = enumerateEffectsMetadata(project);

    expect(enumeratedEffectsMetadata).toContainEqual(
      expect.objectContaining({
        type: 'FakeSepia',
        fullName: 'Fake Sepia Effect',
        isMarkedAsNotWorkingForObjects: false,
      })
    );
    expect(enumeratedEffectsMetadata).toContainEqual(
      expect.objectContaining({
        type: 'FakeSepiaThatWouldWorkOnlyForLayers',
        fullName: 'Fake Sepia Effect only for layers',
        isMarkedAsNotWorkingForObjects: true,
      })
    );
    expect(enumeratedEffectsMetadata).toContainEqual(
      expect.objectContaining({
        type: 'FakeNight',
        fullName: 'Fake Night Effect',
        isMarkedAsNotWorkingForObjects: false,
      })
    );
  });
});
