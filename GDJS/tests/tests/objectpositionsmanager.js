// @ts-check

describe('gdjs.ObjectPositionsManager', function() {
  const defaultWidth = 3;
  const defaultHeight = 3;
  const objectNameId1 = 1;
  const objectNameId2 = 2;

  /** @returns {ObjectWithCoordinatesInterface} */
  const makeFakeObjectWithCoordinates = (
    id,
    nameId,
    x,
    y,
    width = defaultWidth,
    height = defaultHeight
  ) => {
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
      getAABB: () => ({ min: [x, y], max: [x + width, y + height] }),
      setX: () => {},
      setY: () => {},
    };
  };

  const makeObjectPositionsManager = () => {
    const objectPositionsManager = new gdjs.ObjectPositionsManager();

    const object0 = makeFakeObjectWithCoordinates(0, objectNameId1, 10, 10);
    objectPositionsManager.markObjectAsCreated(object0);
    const object1 = makeFakeObjectWithCoordinates(1, objectNameId1, 20, 20);
    objectPositionsManager.markObjectAsCreated(object1);
    const object2 = makeFakeObjectWithCoordinates(2, objectNameId2, 6, 6);
    objectPositionsManager.markObjectAsCreated(object2);
    const object3 = makeFakeObjectWithCoordinates(3, objectNameId2, 8, 8);
    objectPositionsManager.markObjectAsCreated(object3);

    return { objectPositionsManager, object0, object1, object2, object3 };
  };

  describe('Basics distance and collision tests', function() {
    it('can find nearby object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true };
      const object2IdsSet = { 1: true, 2: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 2: true });
    });

    it('can find collisions between object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true };
      const object2IdsSet = { 1: true, 2: true, 3: true };

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 3: true });
    });

    it('can find nearby object positions when using the same ids in both sets', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 1: true, 2: true, 3: true };
      const object2IdsSet = { 1: true, 2: true, 3: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 2: true, 3: true });
      expect(object2IdsSet).to.eql({ 2: true, 3: true });
    });

    it('can find collisions between object positions when using the same ids in both sets', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true, 1: true, 2: true, 3: true };
      const object2IdsSet = { 0: true, 1: true, 2: true, 3: true };

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true, 2: true, 3: true });
      expect(object2IdsSet).to.eql({ 0: true, 2: true, 3: true });
    });

    it('can find object positions that are NOT nearby others', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true, 1: true };
      const object2IdsSet = { 2: true, 3: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          true
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 1: true });
      expect(object2IdsSet).to.eql({ 2: true, 3: true }); // Second list is *not* filtered when the test is inverted
    });

    it('can find object positions that are NOT in collision with others', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true, 1: true };
      const object2IdsSet = { 2: true, 3: true };

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          true,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 1: true });
      expect(object2IdsSet).to.eql({ 2: true, 3: true }); // Second list is *not* filtered when the test is inverted
    });

    it('can find NO nearby object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 0: true };
      const object2IdsSet = { 1: true, 2: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          0,
          false
        )
      ).to.be(false);
      expect(object1IdsSet).to.eql({});
      expect(object2IdsSet).to.eql({});
    });

    it('can find NO collisions between object positions', function() {
      const { objectPositionsManager } = makeObjectPositionsManager();
      const object1IdsSet = { 1: true };
      const object2IdsSet = { 2: true, 3: true };

      expect(
        objectPositionsManager.collisionTest(
          object1IdsSet,
          object2IdsSet,
          false,
          false
        )
      ).to.be(false);
      expect(object1IdsSet).to.eql({});
      expect(object2IdsSet).to.eql({});
    });
  });

  describe('Tests after updates', function() {
    it('can find nearby object positions after object are moved', function() {
      let { objectPositionsManager, object1 } = makeObjectPositionsManager();

      // Check that only object2 is 5 pixels away from object0.
      let object1IdsSet = { 0: true };
      let object2IdsSet = { 1: true, 2: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 2: true });

      // Move object1 closer to object0
      object1 = makeFakeObjectWithCoordinates(1, objectNameId1, 12, 12);
      objectPositionsManager.markObjectAsDirty(object1);

      // Check that now object1 and object2 are 5 pixels away from object0.
      object1IdsSet = { 0: true };
      object2IdsSet = { 1: true, 2: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          6,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 1: true, 2: true });
    });

    it('can find nearby object positions after object are moved or removed', function() {
      let {
        objectPositionsManager,
        object1,
        object2,
      } = makeObjectPositionsManager();

      // Move object1 closer to object0
      object1 = makeFakeObjectWithCoordinates(1, objectNameId1, 12, 12);
      objectPositionsManager.markObjectAsDirty(object1);

      // Remove object2
      objectPositionsManager.markObjectAsRemoved(object2);

      // Check that now object1 only is 5 pixels away from object0.
      const object1IdsSet = { 0: true };
      const object2IdsSet = { 1: true };

      // It's not legal to pass object2 id in the set (reducing the usefulness of the test),
      // because all ids are supposed to be managed by the ObjectPositionsManager.

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 1: true });
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
      object2 = makeFakeObjectWithCoordinates(2, objectNameId1, 8, 8);
      objectPositionsManager.markObjectAsCreated(object2);

      // Check that object2 is still found near object0
      const object1IdsSet = { 0: true };
      const object2IdsSet = { 1: true, 2: true };

      expect(
        objectPositionsManager.distanceTest(
          object1IdsSet,
          object2IdsSet,
          5,
          false
        )
      ).to.be(true);
      expect(object1IdsSet).to.eql({ 0: true });
      expect(object2IdsSet).to.eql({ 2: true });
    });
  });
});
