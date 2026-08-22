// @flow
import { getEditorDracoDecoderPath } from './DracoDecoderPath';

describe('DracoDecoderPath', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  const mockLocation = (href: string, protocol: string, origin: string) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href,
        protocol,
        origin,
      },
    });
  };

  test('uses an origin-absolute path on http(s) so SPA routes do not break', () => {
    mockLocation(
      'https://editor.gdevelop.io/games/my-game',
      'https:',
      'https://editor.gdevelop.io'
    );

    expect(getEditorDracoDecoderPath()).toBe(
      'https://editor.gdevelop.io/external/draco/gltf/'
    );
  });

  test('resolves next to index.html on file:// (Electron)', () => {
    mockLocation(
      'file:///Users/me/GDevelop/app/index.html',
      'file:',
      'file://'
    );

    expect(getEditorDracoDecoderPath()).toBe(
      'file:///Users/me/GDevelop/app/external/draco/gltf/'
    );
  });
});
