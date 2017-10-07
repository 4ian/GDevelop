import platformer from '../fixtures/platformer/platformer.json';
import spaceShooter from '../fixtures/space-shooter/space-shooter.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'internal://platformer') {
      return Promise.resolve(platformer);
    } else if (url === 'internal://space-shooter') {
      return Promise.resolve(spaceShooter);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
