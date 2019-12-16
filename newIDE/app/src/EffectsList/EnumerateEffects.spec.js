// @flow
import { enumerateEffectsMetadata } from './EnumerateEffects';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { makeTestProject } from '../fixtures/TestProject';
const gd = global.gd;

describe('EnumerateEffects', () => {
  makeTestExtensions(gd);
  const { project } = makeTestProject(gd);

  it('can enumerate effects', () => {
    const enumeratedEffectsMetadata = enumerateEffectsMetadata(project);

    expect(enumeratedEffectsMetadata).toContainEqual(
      expect.objectContaining({
        type: 'FakeSepia',
        fullName: 'Fake Sepia Effect',
      })
    );
    expect(enumeratedEffectsMetadata).toContainEqual(
      expect.objectContaining({
        type: 'FakeNight',
        fullName: 'Fake Night Effect',
      })
    );
  });
});
