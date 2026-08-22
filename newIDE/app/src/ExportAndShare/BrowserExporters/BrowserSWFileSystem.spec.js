// @flow
import { shouldCopyRemoteFileForPreview } from './BrowserSWFileSystem';

describe('BrowserSWFileSystem', () => {
  describe('shouldCopyRemoteFileForPreview', () => {
    test('copies Draco decoder libraries into the preview origin', () => {
      expect(
        shouldCopyRemoteFileForPreview(
          'https://resources.gdevelop-app.com/GDJS-5.x/Runtime/pixi-renderers/draco/gltf/draco_wasm_wrapper.js',
          'https://editor.gdevelop.io/browser_sw_preview/1/preview/pixi-renderers/draco/gltf/draco_wasm_wrapper.js'
        )
      ).toBe(true);
      expect(
        shouldCopyRemoteFileForPreview(
          'https://resources.gdevelop-app.com/GDJS-5.x/Runtime/pixi-renderers/draco/gltf/draco_decoder.wasm',
          'https://editor.gdevelop.io/browser_sw_preview/1/preview/pixi-renderers/draco/gltf/draco_decoder.wasm'
        )
      ).toBe(true);
    });

    test('does not copy regular runtime scripts that stay on the CDN', () => {
      expect(
        shouldCopyRemoteFileForPreview(
          'https://resources.gdevelop-app.com/GDJS-5.x/Runtime/pixi-renderers/ThreeAddons.js',
          'https://editor.gdevelop.io/browser_sw_preview/1/preview/pixi-renderers/ThreeAddons.js'
        )
      ).toBe(false);
      expect(
        shouldCopyRemoteFileForPreview(
          'https://resources.gdevelop-app.com/GDJS-5.x/Runtime/pixi-renderers/pixi.js',
          'https://editor.gdevelop.io/browser_sw_preview/1/preview/pixi-renderers/pixi.js'
        )
      ).toBe(false);
    });
  });
});
