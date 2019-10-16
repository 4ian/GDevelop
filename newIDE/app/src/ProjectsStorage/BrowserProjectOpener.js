import browserExampleFiles from './BrowserExampleFiles';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (browserExampleFiles[url])
      return Promise.resolve(browserExampleFiles[url]);

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
