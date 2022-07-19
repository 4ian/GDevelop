// @ts-check
describe('gdjs.TileMapCollisionMaskRuntimeObject', function () {
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
    setFramesPerSecond(runtimeScene, framePerSecond);
    return runtimeScene;
  };
  const setFramesPerSecond = (runtimeScene, framePerSecond) => {
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
        collisionMaskTag: 'obstacle',
        debugMode: false,
        fillColor: '#ffffff',
        outlineColor: '#ffffff',
        fillOpacity: 1,
        outlineOpacity: 1,
        outlineSize: 1,
      },
    });
    runtimeScene.addObject(tileMap);
    return tileMap;
  };

  const addObject = (runtimeScene) => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      behaviors: [],
      effects: [],
      variables: [],
    });
    object.setCustomWidthAndHeight(8, 8);
    runtimeScene.addObject(object);
    return object;
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  let runtimeScene;
  /**
   * @type {gdjs.TileMapCollisionMaskRuntimeObject}
   */
  let tileMap;
  beforeEach(async function () {
    runtimeScene = createScene();
    tileMap = addTileMapCollisionMask(runtimeScene);
    // TODO find a clean way to wait for the json to be read.
    for (
      let index = 0;
      index < 200 && tileMap._collisionTileMap.getDimensionX() === 0;
      index++
    ) {
      await delay(5);
    }
    if (tileMap._collisionTileMap.getDimensionX() === 0) {
      throw new Error('Timeout reading the tile map JSON file.');
    }
  });

  it('can be measured', function () {
    tileMap.setPosition(100, 200);

    expect(tileMap.getWidth()).to.be(32);
    expect(tileMap.getHeight()).to.be(16);
    expect(tileMap.getCenterX()).to.be(16);
    expect(tileMap.getCenterY()).to.be(8);
  });

  /**
   * insideObject usually use the AABB of the object.
   * But, in case of a tile map, it makes more sense to look each tile individually.
   * It returns true when there is an hitbox in the tile.
   */
  it('can detect a point inside the collision mask', function () {
    tileMap.setPosition(100, 200);

    // The point is in the black square with an hitbox.
    expect(tileMap.insideObject(104, 204)).to.be(true);
    expect(tileMap.isCollidingWithPoint(104, 204)).to.be(true);

    // The point is in wite square without any hitbox.
    expect(tileMap.insideObject(112, 212)).to.be(false);
    expect(tileMap.isCollidingWithPoint(112, 212)).to.be(false);

    // The point is in black triangle part of the square that has an hitbox.
    expect(tileMap.insideObject(102, 210)).to.be(true);
    expect(tileMap.isCollidingWithPoint(102, 210)).to.be(true);

    // The point is in white triangle part of the square that has no hitbox.
    expect(tileMap.insideObject(106, 214)).to.be(true);
    expect(tileMap.isCollidingWithPoint(106, 214)).to.be(false);
  });

  it('can detect collisions with an object', function () {
    tileMap.setPosition(100, 200);

    const object = addObject(runtimeScene);

    object.setPosition(96, 196);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(true);

    object.setPosition(90, 190);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );

    object.setPosition(115, 207);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(true);

    object.setPosition(116, 208);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );
  });

  it('can check collisions with an object on empty tiles without any issue', function () {
    tileMap.setPosition(100, 200);

    const object = addObject(runtimeScene);

    object.setPosition(116, 208);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );
  });

  it('can detect collisions with an object on flipped tiles', function () {
    tileMap.setPosition(100, 200);

    const object = addObject(runtimeScene);

    // The object is over the black triangle.
    object.setPosition(118, 214);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(true);

    // The object is over the red triangle without touching a black polygon.
    object.setPosition(130, 204);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );
  });

  it("can detect collisions with an object when it's rotated", function () {
    tileMap.setPosition(100, 200);
    tileMap.setAngle(90);

    const object = addObject(runtimeScene);

    object.setPosition(123, 185);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(true);

    object.setPosition(124, 184);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );
  });

  it('can detect collisions with an object when it has a custom size', function () {
    tileMap.setPosition(100, 200);
    tileMap.setWidth(2 * tileMap.getWidth());
    tileMap.setHeight(2 * tileMap.getHeight());

    const object = addObject(runtimeScene);

    object.setPosition(163, 231);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(true);

    object.setPosition(164, 232);
    expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
      false
    );
  });
});
