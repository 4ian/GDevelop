import { getBuildExtensionlessFilename } from './Build';

describe('Build service', () => {
  describe('getBuildExtensionlessFilename', () => {
    test('it formats correctly a simple name', () => {
      expect(
        getBuildExtensionlessFilename({
          gameName: 'Super game',
          gameVersion: '1.0.0',
        })
      ).toEqual('Super game-1_0_0');
    });
    test('it formats correctly a name with parenthesis', () => {
      expect(
        getBuildExtensionlessFilename({
          gameName: 'Super game (bis)',
          gameVersion: '1.0.0',
        })
      ).toEqual('Super game (bis)-1_0_0');
    });
    test('it formats correctly a name with / and \\', () => {
      expect(
        getBuildExtensionlessFilename({
          gameName: 'Super/game\\yo',
          gameVersion: '1.0.0',
        })
      ).toEqual('Super_game_yo-1_0_0');
    });
    test('it formats correctly classic special characters', () => {
      expect(
        getBuildExtensionlessFilename({
          gameName: 'Super #"game\'[ahah]@12.2$*',
          gameVersion: '1.0.0',
        })
      ).toEqual('Super __game__ahah__12_2__-1_0_0');
    });
  });
});
