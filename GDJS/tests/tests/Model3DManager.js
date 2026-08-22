describe('gdjs.Model3DManager', function() {
  describe('getDracoDecoderPathFromScriptPath', function() {
    it('resolves the decoder folder from a CDN ThreeAddons.js URL', function() {
      expect(
        gdjs.getDracoDecoderPathFromScriptPath(
          'https://resources.gdevelop-app.com/GDJS-5.6.280/Runtime/pixi-renderers/ThreeAddons.js'
        )
      ).to.be(
        'https://resources.gdevelop-app.com/GDJS-5.6.280/Runtime/pixi-renderers/draco/gltf/'
      );
    });

    it('resolves the decoder folder from a relative three.js path', function() {
      expect(
        gdjs.getDracoDecoderPathFromScriptPath('pixi-renderers/three.js')
      ).to.be('pixi-renderers/draco/gltf/');
    });

    it('ignores query strings on the script URL', function() {
      expect(
        gdjs.getDracoDecoderPathFromScriptPath(
          'https://example.com/Runtime/pixi-renderers/ThreeAddons.js?gdCacheBurst=12'
        )
      ).to.be('https://example.com/Runtime/pixi-renderers/draco/gltf/');
    });

    it('returns null for unrelated scripts', function() {
      expect(
        gdjs.getDracoDecoderPathFromScriptPath('runtimegame.js')
      ).to.be(null);
    });
  });

  describe('getDracoDecoderPath', function() {
    it('uses scriptFiles from the preview runtime options', function() {
      expect(
        gdjs.getDracoDecoderPath([
          { path: 'https://cdn.example/Runtime/gd.js' },
          {
            path:
              'https://cdn.example/Runtime/pixi-renderers/ThreeAddons.js?gdCacheBurst=1',
          },
        ])
      ).to.be('https://cdn.example/Runtime/pixi-renderers/draco/gltf/');
    });

    it('falls back to document scripts or the relative runtime folder', function() {
      const path = gdjs.getDracoDecoderPath([]);
      expect(path.indexOf('pixi-renderers/draco/gltf/') !== -1).to.be(true);
    });
  });
});
