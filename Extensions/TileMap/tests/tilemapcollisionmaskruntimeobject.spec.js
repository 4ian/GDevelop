// @ts-check
describe.only('gdjs.TileMapCollisionMaskRuntimeObject', function () {
  const epsilon = 1 / (2 << 16);

  const createScene = (framePerSecond = 60) => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-ignore - missing properties.
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: {
        resources: [
          {
            file: 'base/tests-utils/simple-tiled-map/SmallTiledMap.json',
            kind: 'json',
            metadata: '',
            name: 'SmallTiledMap.json',
            userAdded: true,
            alwaysLoaded: true,
          },
          {
            file: 'base/tests-utils/simple-tiled-map/MiniTiledSet.json',
            kind: 'json',
            metadata: '',
            name: 'MiniTiledSet.json',
            userAdded: true,
            alwaysLoaded: true,
          },
        ],
      },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
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
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    });
    setFramePerSecond(runtimeScene, framePerSecond);
    return runtimeScene;
  };
  const setFramePerSecond = (runtimeScene, framePerSecond) => {
    runtimeScene._timeManager.getElapsedTime = function () {
      return 1000 / framePerSecond;
    };
  };

  const addTileMapCollisionMask = (runtimeScene) => {
    const tileMap = new gdjs.TileMapCollisionMaskRuntimeObject(runtimeScene, {
      name: 'tilemap',
      type: 'TileMap::CollisionMask',
      behaviors: [],
      effects: [],
      content: {
        tilemapJsonFile: 'SmallTiledMap.json',
        tilesetJsonFile: 'MiniTiledSet.json',
        layerIndex: 0,
        typeFilter: 'obstacle',
        debugMode: false,
        fillColor: '#ffffff',
        outlineColor: '#ffffff',
        fillOpacity: 1,
        outlineOpacity: 1,
        outlineSize: 1,
      },
    });
    // tileMap.getWidth = function () {
    //   return 90;
    // };
    // tileMap.getHeight = function () {
    //   return 90;
    // };
    runtimeScene.addObject(tileMap);
    return tileMap;
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  let runtimeScene;
  let tileMap;
  beforeEach(async function () {
    runtimeScene = createScene();
    tileMap = addTileMapCollisionMask(runtimeScene);
    // TODO find a clean way to wait that the json is read.
    await delay(10);
  });

  it('can find a point inside the collision mask', function () {
    tileMap.setPosition(100, 200);
    runtimeScene.renderAndStep(1000 / 60);

    expect(tileMap.insideObject(104, 204)).to.be(true);
  });
});
