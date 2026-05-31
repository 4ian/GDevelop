// @flow
import { getLocalFileUrl } from './index';

describe('ResourcesLoader', () => {
  it('encodes hash characters in local file paths', () => {
    const localFileUrl = getLocalFileUrl(
      'E:/Realisations/GDevelop_branding/Press/itch.io/Game Jam/Weekend Jam #1/Parts/hero.png'
    );

    expect(localFileUrl).toBe(
      'file:///E:/Realisations/GDevelop_branding/Press/itch.io/Game%20Jam/Weekend%20Jam%20%231/Parts/hero.png'
    );
    expect(new URL(localFileUrl).hash).toBe('');
  });

  it('keeps cache-busting parameters outside of the local file path', () => {
    const cachedLocalFileUrl =
      getLocalFileUrl('C:/Project/Sprites/hero#idle.png') + '?cache=123';
    const parsedUrl = new URL(cachedLocalFileUrl);

    expect(parsedUrl.pathname).toBe('/C:/Project/Sprites/hero%23idle.png');
    expect(parsedUrl.search).toBe('?cache=123');
    expect(parsedUrl.hash).toBe('');
  });
});
