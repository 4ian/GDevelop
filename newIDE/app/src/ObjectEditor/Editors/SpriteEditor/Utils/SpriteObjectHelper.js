import { mapVector, mapFor } from '../../../../Utils/MapFor';
import every from 'lodash/every';

/**
 * Return the specified animation, direction and sprite for a SpriteObject.
 * Returns null for these elements if the specified choice is not valid.
 * @param {*} object
 * @param {*} animationIndex
 * @param {*} directionIndex
 * @param {*} spriteIndex
 */
export const getCurrentElements = (
  object,
  animationIndex,
  directionIndex,
  spriteIndex
) => {
  const hasValidAnimation = animationIndex < object.getAnimationsCount();
  const animation = hasValidAnimation
    ? object.getAnimation(animationIndex)
    : null;
  const hasValidDirection =
    !!animation && directionIndex < animation.getDirectionsCount();
  const direction = hasValidDirection
    ? animation.getDirection(directionIndex)
    : null;
  const hasValidSprite =
    !!direction && spriteIndex < direction.getSpritesCount();
  const sprite = hasValidSprite ? direction.getSprite(spriteIndex) : null;

  return {
    hasValidAnimation,
    animation,
    hasValidDirection,
    direction,
    hasValidSprite,
    sprite,
  };
};

export const copyPoint = (originalPoint, destinationPoint) => {
  destinationPoint.setX(originalPoint.getX());
  destinationPoint.setY(originalPoint.getY());
  destinationPoint.setName(originalPoint.getName());
};

export const copySpritePoints = (originalSprite, destinationSprite) => {
  if (originalSprite.ptr === destinationSprite.ptr) return;

  copyPoint(originalSprite.getCenter(), destinationSprite.getCenter());
  copyPoint(originalSprite.getOrigin(), destinationSprite.getOrigin());
  destinationSprite.setDefaultCenterPoint(
    originalSprite.isDefaultCenterPoint()
  );

  destinationSprite.getAllNonDefaultPoints().clear();
  mapVector(originalSprite.getAllNonDefaultPoints(), originalPoint => {
    destinationSprite.addPoint(originalPoint);
  });
};

export const copyAnimationsSpritePoints = (originalSprite, animation) => {
  mapFor(0, animation.getDirectionsCount(), i => {
    const direction = animation.getDirection(i);

    mapFor(0, direction.getSpritesCount(), j => {
      const sprite = direction.getSprite(j);
      copySpritePoints(originalSprite, sprite);
    });
  });
};

export const isSamePoint = (point1, point2) => {
  return (
    point1.getX() === point2.getX() &&
    point1.getY() === point2.getY() &&
    point1.getName() === point2.getName()
  );
};

export const haveSamePoints = (sprite1, sprite2) => {
  if (!isSamePoint(sprite1.getCenter(), sprite2.getCenter())) return false;
  if (!isSamePoint(sprite1.getOrigin(), sprite2.getOrigin())) return false;
  if (sprite1.isDefaultCenterPoint() !== sprite2.isDefaultCenterPoint())
    return false;

  if (
    sprite1.getAllNonDefaultPoints().size() !==
    sprite2.getAllNonDefaultPoints().size()
  )
    return false;

  return every(
    mapVector(sprite1.getAllNonDefaultPoints(), sprite1Point => {
      if (!sprite2.hasPoint(sprite1Point.getName())) return false;

      return isSamePoint(
        sprite1Point,
        sprite2.getPoint(sprite1Point.getName())
      );
    })
  );
};

export const allSpritesHaveSamePointsAs = (originalSprite, animation) => {
  return every(
    mapFor(0, animation.getDirectionsCount(), i => {
      const direction = animation.getDirection(i);

      return every(
        mapFor(0, direction.getSpritesCount(), j => {
          const sprite = direction.getSprite(j);

          return haveSamePoints(sprite, originalSprite);
        })
      );
    })
  );
};

export const deleteSpritesFromAnimation = (animation, spritePtrs) => {
  mapFor(0, animation.getDirectionsCount(), i => {
    const direction = animation.getDirection(i);

    const spritesToDelete = mapFor(0, direction.getSpritesCount(), j => {
      const sprite = direction.getSprite(j);

      return !!spritePtrs[sprite.ptr];
    });

    // Iterate from the end to the beginning to avoid invalidating indexes.
    for (
      let spriteIndex = direction.getSpritesCount() - 1;
      spriteIndex >= 0;
      spriteIndex--
    ) {
      if (spritesToDelete[spriteIndex]) direction.removeSprite(spriteIndex);
    }
  });
};
