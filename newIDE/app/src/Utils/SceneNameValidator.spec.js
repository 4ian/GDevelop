// @flow
import { isValidSceneName } from './SceneNameValidator';

describe('isValidSceneName', () => {
  test.each(['mainScene', 'MainScene', 'main_scene', 'scene2', 'level_2'])(
    'accepts the identifier-style scene name %s',
    sceneName => {
      expect(isValidSceneName(sceneName)).toBe(true);
    }
  );

  test.each([
    '',
    'Main Scene',
    ' MainScene',
    'MainScene ',
    'Main\tScene',
    'main-scene',
    '_main_scene',
    'main_scene_',
    'main__scene',
    '2ndScene',
  ])('rejects the invalid scene name %s', sceneName => {
    expect(isValidSceneName(sceneName)).toBe(false);
  });
});
