// @ts-check
describe('gdjs.SpineAtlasManager', () => {
  const assetsPath = '/base/GDJS/tests/games/capabilities/assets/';

  it('can instantiate a Spine object when resource URLs change at each call', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: {
        resources: [
          {
            kind: 'image',
            name: 'spineboy.png',
            metadata: '',
            file: assetsPath + 'spineboy.png',
            userAdded: true,
          },
          {
            kind: 'atlas',
            name: 'spineboy.atlas',
            metadata: JSON.stringify({
              embeddedResourcesMapping: { 'spineboy.png': 'spineboy.png' },
            }),
            file: assetsPath + 'spineboy.atlas',
            userAdded: true,
          },
          {
            kind: 'spine',
            name: 'spineboy.json',
            metadata: JSON.stringify({
              embeddedResourcesMapping: { 'spineboy.atlas': 'spineboy.atlas' },
            }),
            file: assetsPath + 'spineboy.json',
            userAdded: true,
          },
        ],
      },
    });
    // The in-game editor adds a different cache burst parameter to the URLs
    // at each call.
    runtimeGame.isInGameEdition = () => true;

    const spineManager = runtimeGame.getSpineManager();
    if (!spineManager) throw new Error('No Spine manager.');
    await spineManager.loadResource('spineboy.json');

    const aliases = spineManager.getSpineAliases('spineboy.json');
    if (!aliases) throw new Error('The Spine resource was not loaded.');
    const spineObject = spine.Spine.from({
      skeleton: aliases.skeletonAlias,
      atlas: aliases.atlasAlias,
      autoUpdate: false,
    });
    expect(spineObject.skeleton.data.bones.length).to.be.greaterThan(0);

    spineObject.destroy();
    runtimeGame.getResourceLoader().unloadAllResources();
  });
});
