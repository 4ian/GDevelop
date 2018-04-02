import platformer from '../fixtures/platformer/platformer.json';
import spaceShooter from '../fixtures/space-shooter/space-shooter.json';
import pathfinding from '../fixtures/pathfinding/pathfinding.json';
import physics from '../fixtures/physics/physics.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'internal://platformer') {
      return Promise.resolve(platformer);
    } else if (url === 'internal://space-shooter') {
      return Promise.resolve(spaceShooter);
    } else if (url === 'internal://pathfinding') {
      return Promise.resolve(pathfinding);
    } else if (url === 'internal://physics') {
      return Promise.resolve(physics);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
