import platformer from '../fixtures/platformer/platformer.json';
import spaceShooter from '../fixtures/space-shooter/space-shooter.json';
import pathfinding from '../fixtures/pathfinding/pathfinding.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'internal://platformer') {
      return Promise.resolve(platformer);
    } else if (url === 'internal://space-shooter') {
      return Promise.resolve(spaceShooter);
    } else if (url === 'internal://pathfinding') {
      return Promise.resolve(pathfinding);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
