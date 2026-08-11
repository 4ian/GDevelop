// @flow
import { getBrowserWindowFocusInfo } from './ElectronMainMenu';

describe('ElectronMainMenu', () => {
  describe('getBrowserWindowFocusInfo', () => {
    it('returns the primitive focus information for a BrowserWindow proxy', () => {
      expect(
        getBrowserWindowFocusInfo({
          id: 12,
          title: 'GDevelop - My game',
          isDestroyed: () => false,
        })
      ).toEqual({
        id: 12,
        isMainWindow: true,
      });
    });

    it('ignores destroyed BrowserWindow proxies', () => {
      expect(
        getBrowserWindowFocusInfo({
          id: 13,
          title: 'Debugger',
          isDestroyed: () => true,
        })
      ).toBe(null);
    });

    it('ignores BrowserWindow proxies that throw when read through remote', () => {
      const destroyedBrowserWindow = {};
      Object.defineProperty(destroyedBrowserWindow, 'id', {
        get() {
          throw new TypeError('Object has been destroyed');
        },
      });

      expect(getBrowserWindowFocusInfo(destroyedBrowserWindow)).toBe(null);
    });
  });
});
