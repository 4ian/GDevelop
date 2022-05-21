import { mapVector, mapFor } from '../../../../Utils/MapFor';
import every from 'lodash/every';
const gd = global.gd;

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

/**
 * Return all the point names
 * @param {*} object
 */
export const getAllPointNames = (object) => {
  const allPointNames = new Set();
  for (
    let animationIndex = 0;
    animationIndex < object.getAnimationsCount();
    animationIndex++
  ) {
    const animation = object.getAnimation(animationIndex);
    for (
      let directionIndex = 0;
      directionIndex < animation.getDirectionsCount();
      directionIndex++
    ) {
      const direction = animation.getDirection(directionIndex);
      for (
        let spriteIndex = 0;
        spriteIndex < direction.getSpritesCount();
        spriteIndex++
      ) {
        const points = direction
          .getSprite(spriteIndex)
          .getAllNonDefaultPoints();
        for (let pointIndex = 0; pointIndex < points.size(); pointIndex++) {
          const point = points.at(pointIndex);
          allPointNames.add(point.getName());
        }
      }
    }
  }
  return [...allPointNames];
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
  mapVector(originalSprite.getAllNonDefaultPoints(), (originalPoint) => {
    destinationSprite.addPoint(originalPoint);
  });
};

export const copyAnimationsSpritePoints = (originalSprite, animation) => {
  mapFor(0, animation.getDirectionsCount(), (i) => {
    const direction = animation.getDirection(i);

    mapFor(0, direction.getSpritesCount(), (j) => {
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
    mapVector(sprite1.getAllNonDefaultPoints(), (sprite1Point) => {
      if (!sprite2.hasPoint(sprite1Point.getName())) return false;

      return isSamePoint(
        sprite1Point,
        sprite2.getPoint(sprite1Point.getName())
      );
    })
  );
};

export const allDirectionSpritesHaveSamePointsAs = (
  originalSprite,
  direction
) => {
  return every(
    mapFor(0, direction.getSpritesCount(), (j) => {
      const sprite = direction.getSprite(j);
      return haveSamePoints(sprite, originalSprite);
    })
  );
};

export const allSpritesHaveSamePointsAs = (originalSprite, animation) => {
  return every(
    mapFor(0, animation.getDirectionsCount(), (i) => {
      const direction = animation.getDirection(i);
      return allDirectionSpritesHaveSamePointsAs(originalSprite, direction);
    })
  );
};

export const copySpritePolygons = (originalSprite, destinationSprite) => {
  if (originalSprite.ptr === destinationSprite.ptr) return;

  destinationSprite.setCollisionMaskAutomatic(
    originalSprite.isCollisionMaskAutomatic()
  );

  destinationSprite.getCustomCollisionMask().clear();
  mapVector(originalSprite.getCustomCollisionMask(), (originalPolygon) => {
    destinationSprite.getCustomCollisionMask().push_back(originalPolygon);
  });
};

export const copyAnimationsSpriteCollisionMasks = (
  originalSprite,
  animation
) => {
  mapFor(0, animation.getDirectionsCount(), (i) => {
    const direction = animation.getDirection(i);

    mapFor(0, direction.getSpritesCount(), (j) => {
      const sprite = direction.getSprite(j);
      copySpritePolygons(originalSprite, sprite);
    });
  });
};

export const isSamePolygon = (polygon1, polygon2) => {
  const polygon1Vertices = polygon1.getVertices();
  const polygon2Vertices = polygon2.getVertices();

  if (polygon1Vertices.size() !== polygon2Vertices.size()) return false;

  return every(
    mapVector(polygon1Vertices, (point1, index) => {
      const point2 = polygon2Vertices.at(index);
      return (
        point1.get_x() === point2.get_x() && point1.get_y() === point2.get_y()
      );
    })
  );
};

export const haveSameCollisionMasks = (sprite1, sprite2) => {
  if (sprite1.isCollisionMaskAutomatic() !== sprite2.isCollisionMaskAutomatic())
    return false;

  if (sprite1.isCollisionMaskAutomatic() && sprite2.isCollisionMaskAutomatic())
    return true;

  const sprite1CollisionMask = sprite1.getCustomCollisionMask();
  const sprite2CollisionMask = sprite2.getCustomCollisionMask();

  if (sprite1CollisionMask.size() !== sprite2CollisionMask.size()) return false;

  return every(
    mapVector(sprite1CollisionMask, (sprite1Polygon, index) => {
      return isSamePolygon(sprite1Polygon, sprite2CollisionMask.at(index));
    })
  );
};

export const allDirectionSpritesHaveSameCollisionMasksAs = (
  originalSprite,
  direction
) => {
  return every(
    mapFor(0, direction.getSpritesCount(), (j) => {
      const sprite = direction.getSprite(j);
      return haveSameCollisionMasks(sprite, originalSprite);
    })
  );
};

export const allSpritesHaveSameCollisionMasksAs = (
  originalSprite,
  animation
) => {
  return every(
    mapFor(0, animation.getDirectionsCount(), (i) => {
      const direction = animation.getDirection(i);
      return allDirectionSpritesHaveSameCollisionMasksAs(
        originalSprite,
        direction
      );
    })
  );
};

export const deleteSpritesFromAnimation = (animation, spritePtrs) => {
  mapFor(0, animation.getDirectionsCount(), (i) => {
    const direction = animation.getDirection(i);

    const spritesToDelete = mapFor(0, direction.getSpritesCount(), (j) => {
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

export const duplicateSpritesInAnimation = (animation, spritePtrs) => {
  mapFor(0, animation.getDirectionsCount(), (i) => {
    const direction = animation.getDirection(i);

    const spritesToDuplicate = mapFor(0, direction.getSpritesCount(), (j) => {
      const sprite = direction.getSprite(j);

      return !!spritePtrs[sprite.ptr];
    });

    // Iterate from the end to the beginning to avoid invalidating indexes.
    for (
      let spriteIndex = direction.getSpritesCount() - 1;
      spriteIndex >= 0;
      spriteIndex--
    ) {
      if (spritesToDuplicate[spriteIndex]) {
        const spriteToDuplicate = direction.getSprite(spriteIndex);
        const newSprite = new gd.Sprite();
        newSprite.setImageName(spriteToDuplicate.getImageName());
        copySpritePoints(spriteToDuplicate, newSprite);
        copySpritePolygons(spriteToDuplicate, newSprite);

        direction.addSprite(newSprite);
        direction.moveSprite(direction.getSpritesCount() - 1, spriteIndex);
      }
    }
  });
};
