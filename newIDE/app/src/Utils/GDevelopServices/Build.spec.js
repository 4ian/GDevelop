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
    test('it formats correctly a name with / and \\', () => {
      expect(
        getBuildExtensionlessFilename({
          gameName: 'Super/game\\yo',
          gameVersion: '1.0.0',
        })
      ).toEqual('Super_game_yo-1_0_0');
    });
  });
});
