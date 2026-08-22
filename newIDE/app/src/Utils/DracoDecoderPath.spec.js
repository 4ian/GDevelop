// @flow
import { getEditorDracoDecoderPath } from './DracoDecoderPath';

describe('getEditorDracoDecoderPath', () => {
  const originalWindow = global.window;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete global.window;
    } else {
      global.window = originalWindow;
    }
  });

  it('uses the current origin on the web-app so a SPA URL does not break the decoder path', () => {
    global.window = {
      location: {
        protocol: 'https:',
        origin: 'https://editor.gdevelop.io',
        href: 'https://editor.gdevelop.io/project/abc',
      },
    };

    expect(getEditorDracoDecoderPath()).toBe(
      'https://editor.gdevelop.io/external/draco/gltf/'
    );
  });

  it('resolves a file URL relative to the current page on Electron', () => {
    global.window = {
      location: {
        protocol: 'file:',
        origin: 'file://',
        href: 'file:///Users/me/GDevelop/app.asar/www/index.html',
      },
    };

    expect(getEditorDracoDecoderPath()).toBe(
      'file:///Users/me/GDevelop/app.asar/www/external/draco/gltf/'
    );
  });

  it('falls back to a relative path when window is unavailable', () => {
    delete global.window;

    expect(getEditorDracoDecoderPath()).toBe('./external/draco/gltf/');
  });
});
