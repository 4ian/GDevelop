// @ts-check
describe('gdjs.PixiImageManager', () => {
  it('gives the image of a resource once it is loaded', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: {
        resources: [
          {
            kind: 'image',
            name: 'Image',
            metadata: '',
            file: 'base/GDJS/tests/tests-utils/assets/64x64.jpg',
            userAdded: true,
          },
        ],
      },
    });
    const imageManager = runtimeGame.getImageManager();
    expect(imageManager.getImageSource('Image')).to.be(null);
    expect(imageManager.getImageSource('Unknown image')).to.be(null);

    await imageManager.loadResource('Image');

    const image = imageManager.getImageSource('Image');
    expect(image).to.be.an(HTMLImageElement);
    expect(image && image.width).to.be(64);
  });
});
