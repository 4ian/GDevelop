// @flow
import {
  haveSamePoints,
  allAnimationSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
  deleteSpritesFromAnimation,
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

  it('can remove sprites using the sprites pointers', () => {
    const animation1 = new gd.Animation();
    animation1.setUseMultipleDirections(true);
    animation1.setDirectionsCount(2);
    const emptySprite = new gd.Sprite();
    animation1.getDirection(0).addSprite(emptySprite);
    animation1.getDirection(0).addSprite(emptySprite);
    animation1.getDirection(0).addSprite(emptySprite);
    animation1.getDirection(1).addSprite(emptySprite);
    animation1.getDirection(1).addSprite(emptySprite);

    const sprite1 = animation1.getDirection(0).getSprite(0);
    const sprite2 = animation1.getDirection(0).getSprite(1);
    const sprite3 = animation1.getDirection(0).getSprite(2);
    sprite1.setImageName('sprite1.png');
    sprite2.setImageName('sprite2.png');
    sprite3.setImageName('sprite3.png');
    deleteSpritesFromAnimation(animation1, {
      [sprite1.ptr]: true,
      [sprite3.ptr]: true,
    });

    expect(animation1.getDirection(0).getSpritesCount()).toBe(1);
    expect(
      animation1
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('sprite2.png');
    expect(animation1.getDirection(1).getSpritesCount()).toBe(2);
  });
});
