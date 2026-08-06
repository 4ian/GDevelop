// @flow

import { shouldHardReloadForExternallyChangedResource } from './ResourcesWatcher';

describe('ResourcesWatcher', () => {
  test('hard reloads externally changed 3D model resources', () => {
    expect(
      shouldHardReloadForExternallyChangedResource(
        'D:\\project\\assets\\models\\character.glb'
      )
    ).toBe(true);
    expect(
      shouldHardReloadForExternallyChangedResource(
        'file:///project/assets/models/character.GLTF?cache=1'
      )
    ).toBe(true);
  });

  test('keeps lightweight resources on the normal hot reload path', () => {
    expect(
      shouldHardReloadForExternallyChangedResource(
        'D:\\project\\assets\\sprite.png'
      )
    ).toBe(false);
    expect(
      shouldHardReloadForExternallyChangedResource(
        'D:\\project\\scenes\\Game\\objects\\Player.settings'
      )
    ).toBe(false);
  });
});
