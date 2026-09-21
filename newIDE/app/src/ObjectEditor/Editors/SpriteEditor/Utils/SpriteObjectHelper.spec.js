// @flow
import {
  haveSamePoints,
  allAnimationSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
  deleteSpritesByIndexes,
  duplicateSpritesByIndexes,
  getSpriteIndexAfterMove,
  haveSameCollisionMasks,
  allObjectSpritesHaveSamePointsAs,
} from './SpriteObjectHelper';
const gd = global.gd;

describe('SpriteObjectHelper', () => {
  describe('Points related methods', () => {
    it('can tell if two sprite have the exact same points', () => {
      const sprite1 = new gd.Sprite();
      const sprite2 = new gd.Sprite();

      expect(haveSamePoints(sprite1, sprite2)).toBe(true);
      expect(haveSamePoints(sprite2, sprite1)).toBe(true);
      sprite1.getOrigin().setX(40);
      expect(haveSamePoints(sprite1, sprite2)).toBe(false);
      expect(haveSamePoints(sprite2, sprite1)).toBe(false);
      sprite2.getOrigin().setX(40);
      expect(haveSamePoints(sprite1, sprite2)).toBe(true);
      expect(haveSamePoints(sprite2, sprite1)).toBe(true);

      sprite1.setDefaultCenterPoint(false);
      expect(haveSamePoints(sprite1, sprite2)).toBe(false);
      expect(haveSamePoints(sprite2, sprite1)).toBe(false);
      sprite2.setDefaultCenterPoint(false);
      expect(haveSamePoints(sprite1, sprite2)).toBe(true);
      expect(haveSamePoints(sprite2, sprite1)).toBe(true);

      const customPoint1 = new gd.Point('CustomPoint');
      sprite1.addPoint(customPoint1);
      customPoint1.delete();
      expect(haveSamePoints(sprite1, sprite2)).toBe(false);
      expect(haveSamePoints(sprite2, sprite1)).toBe(false);
      const customPoint2 = new gd.Point('CustomPoint');
      sprite2.addPoint(customPoint2);
      customPoint2.delete();
      expect(haveSamePoints(sprite1, sprite2)).toBe(true);
      expect(haveSamePoints(sprite2, sprite1)).toBe(true);

      sprite1.getPoint('CustomPoint').setY(10);
      expect(haveSamePoints(sprite1, sprite2)).toBe(false);
      expect(haveSamePoints(sprite2, sprite1)).toBe(false);
      sprite2.getPoint('CustomPoint').setY(10);
      expect(haveSamePoints(sprite1, sprite2)).toBe(true);
      expect(haveSamePoints(sprite2, sprite1)).toBe(true);
    });

    it('can tell if all sprites of animations have the exact same points', () => {
      const spriteObject = new gd.SpriteObject();

      const originalSprite = new gd.Sprite();

      const animation1 = new gd.Animation();
      animation1.setDirectionsCount(1);
      const sprite1 = new gd.Sprite();
      const sprite2 = new gd.Sprite();

      animation1.getDirection(0).addSprite(sprite1);
      animation1.getDirection(0).addSprite(sprite2);

      const animation2 = new gd.Animation();
      animation2.setDirectionsCount(1);
      const sprite3 = new gd.Sprite();

      animation2.getDirection(0).addSprite(sprite3);

      const animations = spriteObject.getAnimations();
      animations.addAnimation(animation1);
      animations.addAnimation(animation2);

      expect(
        allAnimationSpritesHaveSamePointsAs(originalSprite, animation1)
      ).toBe(true);
      expect(
        allAnimationSpritesHaveSamePointsAs(originalSprite, animation2)
      ).toBe(true);
      expect(allObjectSpritesHaveSamePointsAs(originalSprite, animations)).toBe(
        true
      );

      // Add new animation with sprites with new points.
      const animation3 = new gd.Animation();
      const sprite4 = new gd.Sprite();
      const sprite5 = new gd.Sprite();
      sprite5.setDefaultCenterPoint(false);
      sprite5.getCenter().setY(5);
      animation3.setDirectionsCount(1);
      animation3.getDirection(0).addSprite(sprite4);
      animation3.getDirection(0).addSprite(sprite5);
      animations.addAnimation(animation3);

      expect(
        allAnimationSpritesHaveSamePointsAs(originalSprite, animation1)
      ).toBe(true);
      expect(
        allAnimationSpritesHaveSamePointsAs(originalSprite, animation2)
      ).toBe(true);
      expect(
        allAnimationSpritesHaveSamePointsAs(originalSprite, animation3)
      ).toBe(false);
      expect(allObjectSpritesHaveSamePointsAs(originalSprite, animations)).toBe(
        false
      );
    });

    it('can copy points of a sprite in all sprites of an animation', () => {
      const animation1 = new gd.Animation();
      animation1.setDirectionsCount(1);
      const emptySprite = new gd.Sprite();
      const spriteWithCustomPoints = new gd.Sprite();

      const point = new gd.Point('CustomPoint');
      spriteWithCustomPoints.addPoint(point);
      point.delete();
      spriteWithCustomPoints.setDefaultCenterPoint(false);
      spriteWithCustomPoints.getCenter().setY(5);
      spriteWithCustomPoints.getPoint('CustomPoint').setX(1);
      spriteWithCustomPoints.getPoint('CustomPoint').setY(2);

      animation1.getDirection(0).addSprite(emptySprite);
      animation1.getDirection(0).addSprite(spriteWithCustomPoints);
      animation1.getDirection(0).addSprite(emptySprite);

      const animation2 = new gd.Animation();
      animation2.getDirection(0).addSprite(emptySprite);
      copyAnimationsSpritePoints(spriteWithCustomPoints, animation2);
      expect(
        allAnimationSpritesHaveSamePointsAs(spriteWithCustomPoints, animation2)
      ).toBe(true);

      copyAnimationsSpritePoints(
        animation1.getDirection(0).getSprite(1),
        animation1
      );
      expect(
        haveSamePoints(
          animation1.getDirection(0).getSprite(0),
          spriteWithCustomPoints
        )
      ).toBe(true);
      expect(
        haveSamePoints(
          animation1.getDirection(0).getSprite(1),
          spriteWithCustomPoints
        )
      ).toBe(true);
      expect(
        haveSamePoints(
          animation1.getDirection(0).getSprite(2),
          spriteWithCustomPoints
        )
      ).toBe(true);
    });
  });

  describe('Collision masks related methods', () => {
    it('can tell if two sprite have the exact same collision masks', () => {
      // $FlowFixMe[missing-local-annot]
      const addVertice = (polygon, x, y) => {
        const vertice = new gd.Vector2f();
        vertice.x = x;
        vertice.y = y;

        polygon.getVertices().push_back(vertice);
        vertice.delete();
      };

      // Empty sprites have the same collision masks.
      const sprite1 = new gd.Sprite();
      const sprite2 = new gd.Sprite();
      expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(true);
      expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(true);

      // A sprite with a full image collision mask is different from a sprite without.
      sprite1.setFullImageCollisionMask(true);
      expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(false);
      expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(false);
      sprite1.setFullImageCollisionMask(false);

      {
        // Adding a polygon to a sprite makes it different from a sprite without.
        const polygon1 = new gd.Polygon2d();
        addVertice(polygon1, 0, 0);
        addVertice(polygon1, 0, 10);
        addVertice(polygon1, 10, 0);
        sprite1.getCustomCollisionMask().push_back(polygon1);
        polygon1.delete();
        expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(false);
        expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(false);
      }

      {
        // Adding the same polygon to the other sprite makes them the same.
        const polygon2 = new gd.Polygon2d();
        addVertice(polygon2, 0, 0);
        addVertice(polygon2, 0, 10);
        addVertice(polygon2, 10, 0);
        sprite2.getCustomCollisionMask().push_back(polygon2);
        polygon2.delete();
        expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(true);
        expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(true);

        // Moving a vertice of the polygon makes them different again.
        sprite2
          .getCustomCollisionMask()
          .at(0)
          .getVertices()
          .at(1)
          .set_x(-20);
        expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(false);
        expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(false);

        // Moving the same vertice of the other polygon makes them the same again.
        sprite1
          .getCustomCollisionMask()
          .at(0)
          .getVertices()
          .at(1)
          .set_x(-20);
        expect(haveSameCollisionMasks(sprite1, sprite2)).toBe(true);
        expect(haveSameCollisionMasks(sprite2, sprite1)).toBe(true);
      }
    });
  });

  const makeDirectionWithSprites = (imageNames: Array<string>) => {
    const direction = new gd.Direction();
    imageNames.forEach(imageName => {
      const sprite = new gd.Sprite();
      sprite.setImageName(imageName);
      direction.addSprite(sprite);
      sprite.delete();
    });
    return direction;
  };

  const getDirectionImageNames = (direction: gdDirection): Array<string> => {
    const imageNames = [];
    for (let i = 0; i < direction.getSpritesCount(); i++) {
      imageNames.push(direction.getSprite(i).getImageName());
    }
    return imageNames;
  };

  it('can remove sprites by their indexes', () => {
    const direction = makeDirectionWithSprites([
      'sprite1.png',
      'sprite2.png',
      'sprite3.png',
    ]);

    // Pass indexes unsorted on purpose: the helper must delete them
    // from the highest to the lowest.
    deleteSpritesByIndexes(direction, [0, 2]);

    expect(getDirectionImageNames(direction)).toEqual(['sprite2.png']);
    direction.delete();
  });

  it('can duplicate sprites by their indexes', () => {
    const direction = makeDirectionWithSprites([
      'sprite1.png',
      'sprite2.png',
      'sprite3.png',
    ]);

    duplicateSpritesByIndexes(direction, [0, 2]);

    expect(getDirectionImageNames(direction)).toEqual([
      'sprite1.png',
      'sprite1.png',
      'sprite2.png',
      'sprite3.png',
      'sprite3.png',
    ]);
    direction.delete();
  });

  describe('getSpriteIndexAfterMove', () => {
    it('gives the new index of each item after a forward move', () => {
      // Items: A B C D E. Move B (1) to position 3: A C D B E.
      expect(getSpriteIndexAfterMove(0, 1, 3)).toBe(0); // A
      expect(getSpriteIndexAfterMove(1, 1, 3)).toBe(3); // B (the moved item)
      expect(getSpriteIndexAfterMove(2, 1, 3)).toBe(1); // C
      expect(getSpriteIndexAfterMove(3, 1, 3)).toBe(2); // D
      expect(getSpriteIndexAfterMove(4, 1, 3)).toBe(4); // E
    });

    it('gives the new index of each item after a backward move', () => {
      // Items: A B C D E. Move D (3) to position 1: A D B C E.
      expect(getSpriteIndexAfterMove(0, 3, 1)).toBe(0); // A
      expect(getSpriteIndexAfterMove(1, 3, 1)).toBe(2); // B
      expect(getSpriteIndexAfterMove(2, 3, 1)).toBe(3); // C
      expect(getSpriteIndexAfterMove(3, 3, 1)).toBe(1); // D (the moved item)
      expect(getSpriteIndexAfterMove(4, 3, 1)).toBe(4); // E
    });
  });
});
