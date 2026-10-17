// @ts-check
describe('gdjs.TileMapRuntimeObject', function () {
  const createScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: {
        resources: [
          {
            file: 'base/GDJS/tests/tests-utils/simple-tiled-map/SmallTiledMap.json',
            kind: 'json',
            metadata: '',
            name: 'SmallTiledMap.json',
            userAdded: true,
          },
          {
            file: 'base/GDJS/tests/tests-utils/simple-tiled-map/MiniTiledSet.json',
            kind: 'json',
            metadata: '',
            name: 'MiniTiledSet.json',
            userAdded: true,
          },
          {
            file: 'base/GDJS/tests/tests-utils/simple-tiled-map/MiniTiledSet.png',
            kind: 'image',
            metadata: '',
            name: 'MiniTiledSet.png',
            userAdded: true,
          },
        ],
      },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: {
        layers: [
          {
            name: '',
            visibility: true,
            effects: [],
            cameras: [],

            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
          },
        ],
        variables: [],
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        renderer3DWorldScale: 100,
        behaviorsSharedData: [],
        objects: [],
        objectsGroups: [],
        instances: [],
        usedResources: [],
        uiSettings: {
          grid: false,
          gridType: 'rectangular',
          gridWidth: 10,
          gridHeight: 10,
          gridDepth: 10,
          gridOffsetX: 0,
          gridOffsetY: 0,
          gridOffsetZ: 0,
          gridColor: 0,
          gridAlpha: 1,
          snap: false,
        },
      },
      usedExtensionsWithVariablesData: [],
    });
    return runtimeScene;
  };

  const addTileMap = (runtimeScene) => {
    const tileMap = new gdjs.TileMapRuntimeObject(runtimeScene, {
      name: 'tilemap',
      type: 'TileMap::TileMap',
      behaviors: [],
      effects: [],
      variables: [],
      content: {
        tilemapJsonFile: 'SmallTiledMap.json',
        tilesetJsonFile: 'MiniTiledSet.json',
        tilemapAtlasImage: 'MiniTiledSet.png',
        displayMode: 'visible',
        layerIndex: 0,
        levelIndex: 0,
        animationSpeedScale: 1,
        animationFps: 4,
        collisionMaskTag: 'obstacle',
        isCollisionMaskEnabled: true,
      },
    });
    runtimeScene.addObject(tileMap);
    return tileMap;
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  describe('Renderer', function () {
    let runtimeScene;
    /**
     * @type {gdjs.TileMapRuntimeObject}
     */
    let tileMap;
    beforeEach(async function () {
      runtimeScene = createScene();
      await runtimeScene
        .getGame()
        .getImageManager()
        .loadResource('MiniTiledSet.png');
      tileMap = addTileMap(runtimeScene);
      // TODO find a clean way to wait for the json to be read.
      for (
        let index = 0;
        index < 100 && tileMap.getRendererObject().children.length === 0;
        index++
      ) {
        await delay(50);
      }
      if (tileMap.getRendererObject().children.length === 0) {
        throw new Error('Timeout reading the tile map JSON file.');
      }
    });

    it('destroys the tile map layers when it is deleted', function () {
      const pixiObject = tileMap.getRendererObject();
      const pixiTilemaps = [...pixiObject.children];
      expect(pixiTilemaps.length).to.be.greaterThan(0);
      for (const pixiTilemap of pixiTilemaps) {
        expect(pixiTilemap.destroyed).to.be(false);
      }

      tileMap.deleteFromScene();
      runtimeScene.renderAndStep(1000 / 60);

      expect(pixiObject.destroyed).to.be(true);
      for (const pixiTilemap of pixiTilemaps) {
        expect(pixiTilemap.destroyed).to.be(true);
      }
    });
  });
});
