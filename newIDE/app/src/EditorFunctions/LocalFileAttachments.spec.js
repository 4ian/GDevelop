// @flow
import { getPathInProjectFolder } from './LocalFileAttachments';

// $FlowFixMe[cannot-resolve-module]
const path = require('path');

describe('LocalFileAttachments', () => {
  describe('getPathInProjectFolder', () => {
    it('gives the path of a file of the project folder, as resources store it', () => {
      expect(
        getPathInProjectFolder({
          filePath: '/games/race/assets/models/Track.glb',
          projectFilePath: '/games/race/game.json',
          pathModule: path.posix,
        })
      ).toBe('assets/models/Track.glb');
      expect(
        getPathInProjectFolder({
          filePath: 'C:\\games\\race\\assets\\Track.glb',
          projectFilePath: 'C:\\games\\race\\game.json',
          pathModule: path.win32,
        })
      ).toBe('assets/Track.glb');
    });

    it('gives nothing for a file outside of the project folder', () => {
      expect(
        getPathInProjectFolder({
          filePath: '/games/other/Track.glb',
          projectFilePath: '/games/race/game.json',
          pathModule: path.posix,
        })
      ).toBe(null);
      expect(
        getPathInProjectFolder({
          filePath: 'D:\\models\\Track.glb',
          projectFilePath: 'C:\\games\\race\\game.json',
          pathModule: path.win32,
        })
      ).toBe(null);
    });
  });
});
