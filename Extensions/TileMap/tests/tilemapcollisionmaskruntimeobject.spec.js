// @ts-check
describe('gdjs.TileMapCollisionMaskRuntimeObject', function () {
  const createScene = (framePerSecond = 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
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
            file: 'base/tests-utils/simple-tiled-map/FlippingTiledMap.json',
            kind: 'json',
            metadata: '',
            name: 'FlippingTiledMap.json',
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
      usedResources: [],
    });
    setFramesPerSecond(runtimeScene, framePerSecond);
    return runtimeScene;
  };
  const setFramesPerSecond = (runtimeScene, framePerSecond) => {
    runtimeScene._timeManager.getElapsedTime = function () {
      return 1000 / framePerSecond;
    };
  };

  const addTileMapCollisionMask = (runtimeScene, tileMapJsonFile) => {
    const tileMap = new gdjs.TileMapCollisionMaskRuntimeObject(runtimeScene, {
      name: 'tilemap',
      type: 'TileMap::CollisionMask',
      behaviors: [],
      effects: [],
      content: {
        tilemapJsonFile: tileMapJsonFile,
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

  describe('Basic cases', function () {
    let runtimeScene;
    /**
     * @type {gdjs.TileMapCollisionMaskRuntimeObject}
     */
    let tileMap;
    beforeEach(async function () {
      runtimeScene = createScene();
      tileMap = addTileMapCollisionMask(runtimeScene, 'SmallTiledMap.json');
      // TODO find a clean way to wait for the json to be read.
      for (
        let index = 0;
        index < 30 && tileMap._collisionTileMap.getDimensionX() === 0;
        index++
      ) {
        await delay(100);
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

      // The point is in the top black triangle that has an hitbox.
      expect(tileMap.insideObject(120, 202)).to.be(true);
      expect(tileMap.isCollidingWithPoint(120, 202)).to.be(true);

      // The point is in the left white triangle that has an hitbox.
      expect(tileMap.insideObject(118, 204)).to.be(true);
      expect(tileMap.isCollidingWithPoint(118, 204)).to.be(false);
    });

    it('can detect collisions with an object', function () {
      tileMap.setPosition(100, 200);

      const object = addObject(runtimeScene);

      object.setPosition(96, 196);
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        true
      );

      object.setPosition(90, 190);
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        false
      );

      object.setPosition(115, 207);
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        true
      );

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

    it('can detect collisions with an object on vertically flipped tiles', function () {
      tileMap.setPosition(100, 200);

      const object = addObject(runtimeScene);

      // The object is over the black triangle.
      object.setPosition(118, 214);
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        true
      );

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
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        true
      );

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
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        true
      );

      object.setPosition(164, 232);
      expect(gdjs.RuntimeObject.collisionTest(object, tileMap, true)).to.be(
        false
      );
    });
  });

  describe('Flipping cases', function () {
    let runtimeScene;
    /**
     * @type {gdjs.TileMapCollisionMaskRuntimeObject}
     */
    let tileMap;
    beforeEach(async function () {
      runtimeScene = createScene();
      tileMap = addTileMapCollisionMask(runtimeScene, 'FlippingTiledMap.json');
      // TODO find a clean way to wait for the json to be read.
      for (
        let index = 0;
        index < 100 && tileMap._collisionTileMap.getDimensionX() === 0;
        index++
      ) {
        await delay(50);
      }
      if (tileMap._collisionTileMap.getDimensionX() === 0) {
        throw new Error('Timeout reading the tile map JSON file.');
      }
    });

    // 4 rotations

    it('can detect a point inside (vertical: false, horizontal: false, diagonal: false)', function () {
      tileMap.setPosition(100, 200);

      const x = 100;
      const y = 200;
      expect(tileMap.isCollidingWithPoint(x + 3, y + 1)).to.be(true);
    });

    it('can detect a point inside (vertical: false, horizontal: true, diagonal: true)', function () {
      tileMap.setPosition(100, 200);

      const x = 108;
      const y = 200;
      expect(tileMap.isCollidingWithPoint(x + 7, y + 3)).to.be(true);
    });

    it('can detect a point inside (vertical: true, horizontal: true, diagonal: false)', function () {
      tileMap.setPosition(100, 200);

      const x = 108;
      const y = 208;
      expect(tileMap.isCollidingWithPoint(x + 5, y + 7)).to.be(true);
    });

    it('can detect a point inside (vertical: true, horizontal: false, diagonal: true)', function () {
      tileMap.setPosition(100, 200);

      const x = 100;
      const y = 208;
      expect(tileMap.isCollidingWithPoint(x + 1, y + 5)).to.be(true);
    });

    // 4 rotations but diagonal is negated

    it('can detect a point inside (vertical: false, horizontal: false, diagonal: true)', function () {
      tileMap.setPosition(100, 200);

      const x = 116;
      const y = 200;
      expect(tileMap.isCollidingWithPoint(x + 1, y + 3)).to.be(true);
    });

    it('can detect a point inside (vertical: false, horizontal: true, diagonal: false)', function () {
      tileMap.setPosition(100, 200);

      const x = 124;
      const y = 200;
      expect(tileMap.isCollidingWithPoint(x + 5, y + 1)).to.be(true);
    });

    it('can detect a point inside (vertical: true, horizontal: true, diagonal: true)', function () {
      tileMap.setPosition(100, 200);

      const x = 124;
      const y = 208;
      expect(tileMap.isCollidingWithPoint(x + 7, y + 5)).to.be(true);
    });

    it('can detect a point inside (vertical: true, horizontal: false, diagonal: false)', function () {
      tileMap.setPosition(100, 200);

      const x = 116;
      const y = 208;
      expect(tileMap.isCollidingWithPoint(x + 3, y + 7)).to.be(true);
    });
  });
});
