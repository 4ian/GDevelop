import platformer from '../fixtures/platformer/platformer.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'internal://platformer') {
      return Promise.resolve(platformer);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
