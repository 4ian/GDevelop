/**
 * Tests for gdjs.SpriteRuntimeObject using a "real" PIXI RuntimeGame with assets.
 */
describe('gdjs.SpriteRuntimeObject (using a PIXI RuntimeGame with assets)', function() {
  const textureWidth = 64;
  const textureHeight = 64;
  const centerPointX = 64;
  const centerPointY = 31;
  const originPointX = 32;
  const originPointY = 16;

  /**
   * Create a SpriteRuntimeObject using a 64x64 image with custom origin,
   * center and a custom collision mask.
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const makeSpriteRuntimeObjectWithCustomHitBox = runtimeScene =>
    new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: 'Sprite',
      updateIfNotVisible: false,
      variables: [],
      behaviors: [],
      animations: [
        {
          name: 'NewObject2',
          useMultipleDirections: false,
          directions: [
            {
              looping: false,
              timeBetweenFrames: 1,
              sprites: [
                {
                  hasCustomCollisionMask: true,
                  image: 'base/tests-utils/assets/64x64.jpg',
                  points: [],
                  originPoint: {
                    name: 'origine',
                    x: originPointX,
                    y: originPointY,
                  },
                  centerPoint: {
                    automatic: false,
                    name: 'centre',
                    x: centerPointX,
                    y: centerPointY,
                  },
                  customCollisionMask: [
                    [
                      {
                        x: 12.5,
                        y: 1,
                      },
                      {
                        x: 41.5,
                        y: 2,
                      },
                      {
                        x: 55.5,
                        y: 31,
                      },
                      {
                        x: 24.5,
                        y: 30,
                      },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

  it('returns the size of the object from the texture', function() {
    return gdjs.getPixiRuntimeGameWithAssets().then(runtimeGame => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

      const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

      expect(object.getWidth()).to.be(64);
      expect(object.getHeight()).to.be(64);
    });
  });

  it('returns the object drawable X/Y', function() {
    return gdjs.getPixiRuntimeGameWithAssets().then(runtimeGame => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

      const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

      // Texture is shown on screen at -32;-16 because of the custom origin
      expect(object.getDrawableX()).to.be(-32);
      expect(object.getDrawableY()).to.be(-16);

      // Flipping is done relative to the center, so texture is shown on screen at 32;-16
      // after vertical flip, as the center X position is 64 (on the very right of the texture):
      object.flipX(true);
      object.flipY(false);
      expect(object.getDrawableX()).to.be(32);
      expect(object.getDrawableY()).to.be(-16);

      // Flipping is done relative to the center, so texture is shown on screen at 32;-18
      // after vertical flip, as the center Y position is 31 (so new Y position is 2 pixels away from -16)
      object.flipX(false);
      object.flipY(true);
      expect(object.getDrawableX()).to.be(-32);
      expect(object.getDrawableY()).to.be(-18);

      // Sanity check when flipping on both axes:
      object.flipX(true);
      object.flipY(true);
      expect(object.getDrawableX()).to.be(32);
      expect(object.getDrawableY()).to.be(-18);
    });
  });

  it('returns the object center X/Y', function() {
    return gdjs.getPixiRuntimeGameWithAssets().then(runtimeGame => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

      // Create an object with a custom hitbox
      const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

      // getDrawableX/Y is checked in another test:
      expect(object.getDrawableX()).to.be(-32);
      expect(object.getDrawableY()).to.be(-16);

      // Check that the center X and Y is returned relative to getDrawableX/Y:
      expect(object.getCenterX()).to.be(64);
      expect(object.getCenterY()).to.be(31);

      // Sanity test that center position in the scene coordinates is right.
      // It's a common pattern in the game engine:
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);

      // Check that the center X and Y is always returned relative to the object texture origin.
      object.flipX(true);
      object.flipY(false);
      expect(object.getCenterX()).to.be(0); // Center is at the very right of the texture, so after flipping is on the very left.
      expect(object.getCenterY()).to.be(31);

      // As the center is the center for rotation and flipping, its position in the scene coordinates never changes:
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);

      // Check that the center X and Y is always returned relative to the object texture origin.
      object.flipX(false);
      object.flipY(true);
      expect(object.getCenterX()).to.be(64);
      expect(object.getCenterY()).to.be(33); // Center point was 1 pixel above the texture center, so is now 1 pixel below

      // As the center is the center for rotation and flipping, its position in the scene coordinates never changes:
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);

      // Check that the center X and Y is always returned relative to the object texture origin.
      object.flipX(true);
      object.flipY(true);
      expect(object.getCenterX()).to.be(0); // Center is at the very right of the texture, so after flipping is on the very left.
      expect(object.getCenterY()).to.be(33); // Center point was 1 pixel above the texture center, so is now 1 pixel below

      // As the center is the center for rotation and flipping, its position in the scene coordinates never changes:
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);

      // As the center is the center for rotation and flipping, its position in the scene coordinates never changes:
      object.setAngle(12.92);
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);

      object.setAngle(-12345.67);
      expect(object.getDrawableX() + object.getCenterX()).to.be(32);
      expect(object.getDrawableY() + object.getCenterY()).to.be(15);
    });
  });

  it('properly computes hitboxes and point positions', function() {
    return gdjs.getPixiRuntimeGameWithAssets().then(runtimeGame => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

      // Create an object with a custom hitbox
      const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

      // Check the hitboxes without any rotation (only the non default origin
      // which is at 32;16 is to be used).
      expect(object.getHitBoxes()[0].vertices[0]).to.eql([12.5 - originPointX, 1 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[1]).to.eql([41.5 - originPointX, 2 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[2]).to.eql([55.5 - originPointX, 31 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[3]).to.eql([24.5 - originPointX, 30 - originPointY]);

      // Hitbox with rotation
      object.setAngle(90);
      expect(object.getHitBoxes()[0].vertices[0][0]).to.be.within(
        61.9999,
        62.0001
      );
      expect(object.getHitBoxes()[0].vertices[0][1]).to.be.within(
        -36.5001,
        -36.49999
      );
      expect(object.getHitBoxes()[0].vertices[2][0]).to.be.within(
        31.999,
        32.0001
      );
      expect(object.getHitBoxes()[0].vertices[2][1]).to.be.within(
        6.4999,
        6.5001
      );

      // Hitbox with flipping (X axis)
      //
      // On the X axis, points are like this (P = the first vertex of the hitboxes, O = origin, C = center):
      // -20       -10       0         10        20        30        40        50        60        70        80        90
      // |---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
      //                                 P (12.5)            O (32)                          C (64)
      //
      // Object X position is 0, so the origin is at 0 in the scene coordinates:
      // -20       -10       0         10        20        30        40        50        60        70        80        90
      // |---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
      // P (-19.5)           O (0)                           C (32)
      //
      // Object is flipped on X axis, relative to the center, so points are like this now in the scene coordinates:
      // -20       -10       0         10        20        30        40        50        60        70        80        90
      // |---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
      //                                                     C (32)                          O (64)             P (83.5)
      //
      object.setAngle(0);
      object.flipX(true);
      expect(centerPointX - 12.5 + centerPointX - originPointX).to.be(83.5); // Sanity check of the first expected position
      expect(object.getHitBoxes()[0].vertices[0]).to.eql([centerPointX - 12.5 + centerPointX - originPointX, 1 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[1]).to.eql([centerPointX - 41.5 + centerPointX - originPointX, 2 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[2]).to.eql([centerPointX - 55.5 + centerPointX - originPointX, 31 - originPointY]);
      expect(object.getHitBoxes()[0].vertices[3]).to.eql([centerPointX - 24.5 + centerPointX - originPointX, 30 - originPointY]);

      // Hitbox with flipping (X and Y axis)
      //
      // Same calculations as before for the point Y positions.
      object.setAngle(0);
      object.flipX(true);
      object.flipY(true);
      expect(centerPointY - 1 + centerPointY - originPointY).to.be(45); // Sanity check of the first expected position
      expect(object.getHitBoxes()[0].vertices[0]).to.eql([centerPointX - 12.5 + centerPointX - originPointX, centerPointY - 1 + centerPointY - originPointY]);
      expect(object.getHitBoxes()[0].vertices[1]).to.eql([centerPointX - 41.5 + centerPointX - originPointX, centerPointY - 2 + centerPointY - originPointY]);
      expect(object.getHitBoxes()[0].vertices[2]).to.eql([centerPointX - 55.5 + centerPointX - originPointX, centerPointY - 31 + centerPointY - originPointY]);
      expect(object.getHitBoxes()[0].vertices[3]).to.eql([centerPointX - 24.5 + centerPointX - originPointX, centerPointY - 30 + centerPointY - originPointY]);

      // Hitbox with flipping (X and Y axis) and rotation
      object.setAngle(-90);
      object.flipX(true);
      object.flipY(true);
      expect(object.getHitBoxes()[0].vertices[0]).to.eql([62, -36.5]);
      expect(object.getHitBoxes()[0].vertices[1][0]).to.be(
        61
      );
      expect(object.getHitBoxes()[0].vertices[1][1]).to.be.within(
        -7.5,
        -7.49
      );
      expect(object.getHitBoxes()[0].vertices[2]).to.eql([32, 6.5]);
      expect(object.getHitBoxes()[0].vertices[3]).to.eql([33, -24.5]);
    });
  });
});
