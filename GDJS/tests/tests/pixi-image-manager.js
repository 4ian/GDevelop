describe('gdjs.PixiImageManager Three texture bridge', () => {
  const makeImageManager = (source) => {
    const resourceLoader = {
      _runtimeGame: {
        getRenderer: () => ({
          getPIXIRenderer: () => ({}),
        }),
      },
      getResource: (resourceName) => ({
        name: resourceName,
        file: resourceName,
        kind: 'image',
        smoothed: true,
      }),
    };
    const imageManager = new gdjs.PixiImageManager(resourceLoader);
    imageManager.getPIXITexture = () => ({
      baseTexture: {
        resource: { source },
      },
    });
    return imageManager;
  };

  it('accepts the canvas raster produced by Pixi for SVG resources', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const imageManager = makeImageManager(canvas);

    const texture = imageManager.getThreeTexture('block.svg');

    expect(texture.image).to.be(canvas);
    expect(texture.version).to.be.greaterThan(0);
    expect(imageManager.getThreeTextureDebugInfo().failedTextureCount).to.be(0);
  });

  it('records unsupported Three texture sources once with object context', () => {
    const imageManager = makeImageManager({ unsupported: true });

    for (let attempt = 0; attempt < 2; attempt++) {
      expect(() =>
        imageManager.getThreeTexture('block.invalid', {
          objectName: 'Block',
          faceIndex: 4,
        })
      ).to.throwException((error) => {
        expect(error.message).to.contain('THREE_TEXTURE_UNSUPPORTED_SOURCE');
      });
    }

    expect(imageManager.getThreeTextureDebugInfo()).to.eql({
      failedTextureCount: 1,
      returnedFailureCount: 1,
      failures: [
        {
          code: 'THREE_TEXTURE_UNSUPPORTED_SOURCE',
          resourceName: 'block.invalid',
          sourceType: 'Object',
          objectName: 'Block',
          faceIndex: 4,
          message:
            '[THREE_TEXTURE_UNSUPPORTED_SOURCE] Can\'t load texture for resource "block.invalid" because the loaded source type "Object" cannot be uploaded to Three.js.',
        },
      ],
      truncated: false,
      limit: 64,
    });
  });
});
