// @flow
import { getFileUrlFromPath } from './index';

describe('ResourcesLoader', () => {
  it('escapes hash characters in local file URLs', () => {
    expect(getFileUrlFromPath('/Users/me/Game Jam #1/sprite #1.png')).toBe(
      'file:///Users/me/Game%20Jam%20%231/sprite%20%231.png'
    );
  });

  it('escapes question marks before cache-busting parameters are appended', () => {
    expect(getFileUrlFromPath('/tmp/project/image?draft.png')).toBe(
      'file:///tmp/project/image%3Fdraft.png'
    );
  });
});
