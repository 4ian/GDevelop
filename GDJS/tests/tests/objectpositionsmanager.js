// @ts-check

describe('gdjs.ObjectPositionsManager', function() {
  const defaultWidth = 3;
  const defaultHeight = 3;
  const objectNameId1 = 1;
  const objectNameId2 = 2;
  const noop = () => {};

  /** @returns {ObjectWithCoordinatesInterface} */
  const makeFakeObjectWithCoordinates = ({
    id,
    nameId,
    x,
    y,
    width,
    height,
    setX,
    setY,
  }) => {
    return {
      id,
      getNameId: () => nameId,
      getX: () => x,
      getY: () => y,
      getDrawableX: () => x,
      getDrawableY: () => y,
      getCenterX: () => width / 2,
      getCenterY: () => height / 2,
      getHitBoxes: () => [
        gdjs.Polygon.createRectangle(width, height)
          .move(width / 2, height / 2) // Rectangle is by default centered, while here we consider x/y as being in the top left
          .move(x, y),
      ],
      getAABB: () => ({
        min: [x, y],
        max: [x + width, y + height],
      }),
      setX: setX,
      setY: setY,
    };
  };

  const makeObjectPositionsManager = () => {
    const objectPositionsManager = new gdjs.ObjectPositionsManager();

    const object0 = makeFakeObjectWithCoordinates({
      id: 0,
      nameId: objectNameId1,
      x: 10,
      y: 10,
      width: defaultWidth,
      height: defaultHeight,
      setX: noop,
      setY: noop,
    });
    objectPositionsManager.markObjectAsCreated(object0);
    const object1 = makeFakeObjectWithCoordinates({
      id: 1,
      nameId: objectNameId1,
      x: 20,
      y: 20,
      width: defaultWidth,
      height: defaultHeight,
      setX: noop,
      setY: noop,
    });
    objectPositionsManager.markObjectAsCreated(object1);
    const object2 = makeFakeObjectWithCoordinates({
      id: 2,
      nameId: objectNameId2,
      x: 6,
      y: 6,
      width: defaultWidth,
      height: defaultHeight,
      setX: noop,
      setY: noop,
    });
    objectPositionsManager.markObjectAsCreated(object2);
    const object3 = makeFakeObjectWithCoordinates({
      id: 3,
      nameId: objectNameId2,
      x: 8,
      y: 8,
      width: defaultWidth,
      height: defaultHeight,
      setX: noop,
      setY: noop,
    });
    objectPositionsManager.markObjectAsCreated(object3);

    return { objectPositionsManager, object0, object1, object2, object3 };
  };

  describe('Basics distance, point and collision tests', function() {
    it('can find nearby object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2])
      );
    });

    it('can find collisions between object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
        3,
      ]);

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([3])
      );
    });

    it('can find object positions containing any of the specified points', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
        2,
        3,
      ]);

      expect(
        objectPositionsManager.pointsTest(
          objectIdsSet,
          [
            [8, 8],
            [22, 22],
          ],
          true,
          false
        )
      ).to.be(true);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1, 2, 3])
      );
    });

    it('can find nearby object positions when using the same ids in both sets', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
        3,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
        3,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2, 3])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2, 3])
      );
    });

    it('can find collisions between object positions when using the same ids in both sets', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
        2,
        3,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
        2,
        3,
      ]);

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0, 2, 3])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0, 2, 3])
      );
    });

    it('can find object positions that are NOT nearby others', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        2,
        3,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          true
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2, 3])
      ); // Second list is *not* filtered when the test is inverted
    });

    it('can find object positions that are NOT in collision with others', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        2,
        3,
      ]);

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          true,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2, 3])
      ); // Second list is *not* filtered when the test is inverted
    });

    it('can find object positions that are NOT containing any of the specified points', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
        2,
        3,
      ]);

      expect(
        objectPositionsManager.pointsTest(
          objectIdsSet,
          [
            [8, 8],
            [22, 22],
          ],
          true,
          true
        )
      ).to.be(true);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
    });

    it('can find NO nearby object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          0,
          false
        )
      ).to.be(false);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
    });

    it('can find NO collisions between object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        2,
        3,
      ]);

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(false);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
    });

    it('can find NO object positions that are containing the specified points', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);

      expect(
        objectPositionsManager.pointsTest(
          objectIdsSet,
          [
            [8, 8],
            [22, 22],
          ],
          true,
          false
        )
      ).to.be(false);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
    });
  });

  describe('Raycast tests', function() {
    it('can find the closest intersection between ray and objects', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);

      const intersectionCoordinates = [0, 0];
      expect(
        objectPositionsManager.raycastTest(
          objectIdsSet,
          0,
          0,
          25,
          25,
          intersectionCoordinates,
          false
        )
      ).to.be(true);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(intersectionCoordinates).to.eql([10, 10]);
    });

    it('can find the farthest intersection between ray and objects', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);

      const intersectionCoordinates = [0, 0];
      expect(
        objectPositionsManager.raycastTest(
          objectIdsSet,
          0,
          0,
          30,
          30,
          intersectionCoordinates,
          true
        )
      ).to.be(true);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1])
      );
      expect(intersectionCoordinates).to.eql([20, 20]);
    });

    it('can find NO intersection between ray and objects', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const objectIdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);

      const intersectionCoordinates = [0, 0];
      expect(
        objectPositionsManager.raycastTest(
          objectIdsSet,
          0,
          8,
          30,
          8,
          intersectionCoordinates,
          false
        )
      ).to.be(false);
      expect(objectIdsSet).to.eql(
        gdjs.ObjectPositionsManager.makeNewObjectIdsSet()
      );
      expect(intersectionCoordinates).to.eql([0, 0]);
    });
  });

  describe('Tests after updates', function() {
    it('can find nearby object positions after object are moved', function() {
      let { objectPositionsManager, object1 } = makeObjectPositionsManager();

      // Check that only object2 is 5 pixels away from object0.
      let object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      let object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2])
      );

      // Move object1 closer to object0
      object1 = makeFakeObjectWithCoordinates({
        id: 1,
        nameId: objectNameId1,
        x: 12,
        y: 12,
        width: defaultWidth,
        height: defaultHeight,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsDirty(object1);

      // Check that now object1 and object2 are 5 pixels away from object0.
      object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0]);
      object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1, 2])
      );
    });

    it('can find nearby object positions after object are moved or removed', function() {
      let {
        objectPositionsManager,
        object1,
        object2,
      } = makeObjectPositionsManager();

      // Move object1 closer to object0
      object1 = makeFakeObjectWithCoordinates({
        id: 1,
        nameId: objectNameId1,
        x: 12,
        y: 12,
        width: defaultWidth,
        height: defaultHeight,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsDirty(object1);

      // Remove object2
      objectPositionsManager.markObjectAsRemoved(object2);

      // Check that now object1 only is 5 pixels away from object0.
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([1])
      );
    });

    it('can find nearby object positions after an object is removed and added again', function() {
      let {
        objectPositionsManager,
        object1,
        object2,
      } = makeObjectPositionsManager();

      // Remove object2 and immediately reuse its id to make another object close to object0.
      // Note how we changed its nameId from objectNameId2 to objectNameId1.
      objectPositionsManager.markObjectAsRemoved(object2);
      object2 = makeFakeObjectWithCoordinates({
        id: 2,
        nameId: objectNameId1,
        x: 8,
        y: 8,
        width: defaultWidth,
        height: defaultHeight,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsCreated(object2);

      // Check that object2 is still found near object0
      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        1,
        2,
      ]);

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([0])
      );
      expect(object2IdsSet).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([2])
      );
    });
  });

  describe('Separate object positions when colliding', function() {
    it('can separate some objects', function() {
      const objectPositionsManager = new gdjs.ObjectPositionsManager();

      let newObject0X = 0;
      let newObject0Y = 0;

      // Object that will be moved
      const object0 = makeFakeObjectWithCoordinates({
        id: 0,
        nameId: objectNameId1,
        x: 7,
        y: 7,
        width: 5,
        height: 5,
        setX: x => {
          newObject0X = x;
        },
        setY: y => {
          newObject0Y = y;
        },
      });
      objectPositionsManager.markObjectAsCreated(object0);

      // Object that is too far to be moved
      const object1 = makeFakeObjectWithCoordinates({
        id: 1,
        nameId: objectNameId2,
        x: 30,
        y: 30,
        width: defaultWidth,
        height: defaultHeight,
        setX: x => {
          expect().fail();
        },
        setY: y => {
          expect().fail();
        },
      });
      objectPositionsManager.markObjectAsCreated(object1);

      // An obstacle but too far from previous objects
      const object2 = makeFakeObjectWithCoordinates({
        id: 2,
        nameId: objectNameId1,
        x: 2,
        y: 2,
        width: defaultWidth,
        height: defaultHeight,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsCreated(object2);

      // An obstacle that is colliding with object0
      const object3 = makeFakeObjectWithCoordinates({
        id: 3,
        nameId: objectNameId2,
        x: 8,
        y: 8,
        width: 5,
        height: 5,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsCreated(object3);

      // An obstacle that is colliding with object0 but not
      // in the set of objects to consider.
      const object4 = makeFakeObjectWithCoordinates({
        id: 4,
        nameId: objectNameId2,
        x: 9,
        y: 9,
        width: defaultWidth,
        height: defaultHeight,
        setX: noop,
        setY: noop,
      });
      objectPositionsManager.markObjectAsCreated(object4);

      const object1IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        0,
        1,
      ]);
      const object2IdsSet = gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
        2,
        3,
      ]);

      objectPositionsManager.separateObjects(
        object1IdsSet,
        object2IdsSet,
        false
      );

      // Check that object0 (which height is 5) was pushed out of object3 (which Y position is 8,
      // so new Y position is 8 - 5 = 3).
      expect(newObject0X).to.be(7);
      expect(newObject0Y).to.be(3);
    });
  });

  describe('Set of ids helpers', function() {
    const runtimeScene = new gdjs.RuntimeScene(null);

    it('objectsListsToObjectIdsSet', function() {
      var object1 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object2 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object3 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectB',
        type: '',
        behaviors: [],
      });
      var object4 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectC',
        type: '',
        behaviors: [],
      });
      var objectsLists = new Hashtable();
      objectsLists.put('ObjectA', [object1, object2]);
      objectsLists.put('ObjectB', [object3]);
      objectsLists.put('ObjectC', [object4]);

      expect(
        gdjs.ObjectPositionsManager.objectsListsToObjectIdsSet(objectsLists)
      ).to.eql(
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
          object1.id,
          object2.id,
          object3.id,
          object4.id,
        ])
      );
    });

    it('keepOnlyObjectsFromObjectIdsSet', function() {
      var object1 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object2 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object3 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectB',
        type: '',
        behaviors: [],
      });
      var object4 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectC',
        type: '',
        behaviors: [],
      });
      var objectsLists = new Hashtable();
      objectsLists.put('ObjectA', [object1, object2]);
      objectsLists.put('ObjectB', [object3]);
      objectsLists.put('ObjectC', [object4]);

      gdjs.ObjectPositionsManager.keepOnlyObjectsFromObjectIdsSet(
        objectsLists,
        gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
          object1.id,
          object3.id,
        ])
      );

      expect(objectsLists.get('ObjectA')).to.eql([object1]);
      expect(objectsLists.get('ObjectB')).to.eql([object3]);
      expect(objectsLists.get('ObjectC')).to.eql([]);
    });

    it('keepOnlyObjectsFromGroupedObjectIdsSet', function() {
      var object1 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object2 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectA',
        type: '',
        behaviors: [],
      });
      var object3 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectB',
        type: '',
        behaviors: [],
      });
      var object4 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'ObjectC',
        type: '',
        behaviors: [],
      });
      var objectsLists = new Hashtable();
      objectsLists.put('ObjectA', [object1, object2]);
      objectsLists.put('ObjectB', [object3]);
      objectsLists.put('ObjectC', [object4]);

      gdjs.ObjectPositionsManager.keepOnlyObjectsFromGroupedObjectIdsSets(
        objectsLists,
        {
          SomeKey: gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet([
            object1.id,
          ]),
          'another key (could be any string)': gdjs.ObjectPositionsManager.idsArrayToObjectIdsSet(
            [object3.id]
          ),
        }
      );

      expect(objectsLists.get('ObjectA')).to.eql([object1]);
      expect(objectsLists.get('ObjectB')).to.eql([object3]);
      expect(objectsLists.get('ObjectC')).to.eql([]);
    });
  });
});
