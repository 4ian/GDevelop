// @ts-check

/**
 * Represents the coordinates, AABB and hitboxes of an object.
 *
 * @typedef {Object} ObjectPosition
 * @property {ObjectWithCoordinatesInterface} object
 * @property {number} objectId
 * @property {string} objectNameId
 * @property {number} x
 * @property {number} y
 * @property {number} centerX
 * @property {number} centerY
 * @property {gdjs.Polygon[]} hitboxes
 * @property {AABB} aabb
 */

/**
 * Represents the updates to do to coordinates, AABB and hitboxes of an object.
 *
 * @typedef {Object} ObjectPositionCoordinatesUpdate
 * @property {number} objectId
 * @property {number} x
 * @property {number} y
 */

/**
 * The interface for an object with coordinates that can be
 * used in a gdjs.ObjectPositionsManager.
 *
 * This interface is there for easing testing. In practice,
 * we use gdjs.RuntimeObject (which satisfies this interface)
 * in the game engine.
 *
 * @typedef ObjectWithCoordinatesInterface
 * @property {number} id
 * @property {() => string} getNameId
 * @property {() => number} getX
 * @property {() => number} getY
 * @property {() => number} getDrawableX
 * @property {() => number} getDrawableY
 * @property {() => number} getCenterX
 * @property {() => number} getCenterY
 * @property {() => gdjs.Polygon[]} getHitBoxes
 * @property {() => AABB} getAABB
 * @property {(number) => void} setX
 * @property {(number) => void} setY
 */

/**
 * Store the coordinates, AABB and hitboxes of objects of a scene, and
 * allow to query objects near a position/near another object, detect
 * collisions and separate colliding objects.
 *
 * Internally, object positions are stored into a spatial data structure.
 * This allow for fast queries/collision handling of objects.
 *
 * @class gdjs.ObjectPositionsManager
 */
gdjs.ObjectPositionsManager = function() {
  /** @type Object.<number, ObjectWithCoordinatesInterface> */
  this._dirtyCoordinatesObjects = {};

  /** @type Object.<number, ObjectWithCoordinatesInterface> */
  this._dirtyObjects = {};

  /** @type Object.<number, boolean> */
  this._removedObjectIdsSet = {};

  this._positionsRBushes = {};

  /** @type Object.<number, ObjectPosition> */
  this._allObjectPositions = {};
};

/**
 * Tool function to move an ObjectPosition, and update the associated object coordinates.
 *
 * @param {ObjectPosition} objectPosition
 * @param {number} deltaX The delta to apply on X axis
 * @param {number} deltaY The delta to apply on Y axis
 */
gdjs.ObjectPositionsManager._moveObjectPosition = function(
  objectPosition,
  deltaX,
  deltaY
) {
  objectPosition.x += deltaX;
  objectPosition.y += deltaY;
  objectPosition.centerX += deltaX;
  objectPosition.centerY += deltaY;
  objectPosition.aabb.min[0] += deltaX;
  objectPosition.aabb.min[1] += deltaY;
  objectPosition.aabb.max[0] += deltaX;
  objectPosition.aabb.max[1] += deltaY;
  for (var i = 0; i < objectPosition.hitboxes.length; i++) {
    objectPosition.hitboxes[i].move(deltaX, deltaY);
  }

  // Update the object represented by this position. Note that this will potentially
  // mark the object as being "dirty" (see `markObjectAsDirty`), which is sub-optimal
  // but ok.
  objectPosition.object.setX(objectPosition.x);
  objectPosition.object.setY(objectPosition.y);
};

gdjs.ObjectPositionsManager.prototype.getCounters = function() {
  return {
    positionsRBushesCount: Object.keys(this._positionsRBushes).length,
    allObjectPositionsCount: Object.keys(this._allObjectPositions).length,
  };
};

/**
 * Get the spatial data structure handling objects with the given name identifier.
 * @param {string} nameId The name identifier of the objects.
 */
gdjs.ObjectPositionsManager.prototype._getPositionsRBush = function(nameId) {
  var positionsRBush = this._positionsRBushes[nameId];
  if (positionsRBush) return positionsRBush;

  // TODO: use the default AABB format of RBush?
  // @ts-ignore - TODO: types for rbush
  return (this._positionsRBushes[nameId] = rbush(9, [
    '.aabb.min[0]',
    '.aabb.min[1]',
    '.aabb.max[0]',
    '.aabb.max[1]',
  ]));
};

// Object tracking methods:

/**
 * Mark an object as created, so that the ObjectPositionsManager know that
 * the associated coordinates/AABB/hitboxes must be updated.
 * @param {ObjectWithCoordinatesInterface} object
 */
gdjs.ObjectPositionsManager.prototype.markObjectAsCreated = function(object) {
  // If the object was waiting in the "removed set", to be deleted from the spatial data structure,
  // remove it from the "removed set".
  delete this._removedObjectIdsSet[object.id];
  this._dirtyObjects[object.id] = object;
};

/**
 * Mark an object as removed. It should be removed from the spatial data structure and its
 * position/AABB/hitboxes removed from memory.
 * @param {ObjectWithCoordinatesInterface} object
 */
gdjs.ObjectPositionsManager.prototype.markObjectAsRemoved = function(object) {
  this._removedObjectIdsSet[object.id] = true;
};

/**
 * Mark an object as dirty, after it has moved, AABB or hitboxes were changed.
 * @param {ObjectWithCoordinatesInterface} object
 */
gdjs.ObjectPositionsManager.prototype.markObjectAsDirty = function(object) {
  this._dirtyObjects[object.id] = object;
};

/**
 * Update the ObjectPositionsManager with the latest changes on objects.
 * This will query the objects for their coordinates, AABB and hitboxes
 * if they have been marked as dirty - and update them in the spatial data structure.
 * This will also remove objects marked as removed (unless an object with the same id
 * has been recreated, in which case the spatial data structure will update it).
 */
gdjs.ObjectPositionsManager.prototype.update = function() {
  for (var objectId in this._dirtyObjects) {
    var object = this._dirtyObjects[objectId];

    var objectPosition = this._allObjectPositions[objectId];
    if (objectPosition) {
      this._getPositionsRBush(objectPosition.objectNameId).remove(
        objectPosition
      );
    }

    // Update the position in the spatial data structure.
    // Note that it's possible for the objectNameId to have changed
    // (in case of object deletion and creation of another one with a same id)
    var objectNameId = object.getNameId();

    objectPosition = this._allObjectPositions[objectId] = {
      object: object,
      objectId: object.id,
      objectNameId: objectNameId,
      x: object.getX(),
      y: object.getY(),
      centerX: object.getDrawableX() + object.getCenterX(),
      centerY: object.getDrawableY() + object.getCenterY(),
      hitboxes: object.getHitBoxes(),
      aabb: object.getAABB(),
    };
    this._getPositionsRBush(objectNameId).insert(objectPosition);
    delete this._dirtyObjects[objectId];
  }

  // Handle removed objects *after* handling dirty objects.
  // This is because an object can be mark for deletion, then moved
  // before the end of the frame.
  for (var objectId in this._removedObjectIdsSet) {
    var objectPosition = this._allObjectPositions[objectId];
    if (objectPosition) {
      this._getPositionsRBush(objectPosition.objectNameId).remove(
        objectPosition
      );
    }

    delete this._allObjectPositions[objectId];
    delete this._removedObjectIdsSet[objectId];
  }
};

// Query methods:

/**
 * Returns a set containing all the name identifiers corresponding to the object
 * passed (as a set of object ids).
 * @param {Object.<number, boolean>} objectIdsSet The set of object identifiers
 * @returns {Object.<number, boolean>} The set of name identifiers
 */
gdjs.ObjectPositionsManager.prototype._getAllObjectNameIds = function(
  objectIdsSet
) {
  /** @type Object.<number, boolean> */
  var objectNameIdsSet = {};
  for (var objectId in objectIdsSet) {
    var objectPosition = this._allObjectPositions[objectId];
    objectNameIdsSet[objectPosition.objectNameId] = true;
  }

  return objectNameIdsSet;
};

/**
 * Tool function to get squared distance between the centers of two ObjectPositions
 *
 * @param {ObjectPosition} objectPosition1
 * @param {ObjectPosition} objectPosition2
 */
gdjs.ObjectPositionsManager._getObjectPositionsSquaredDistance = function(
  objectPosition1,
  objectPosition2
) {
  return (
    (objectPosition2.centerX - objectPosition1.centerX) *
      (objectPosition2.centerX - objectPosition1.centerX) +
    (objectPosition2.centerY - objectPosition1.centerY) *
      (objectPosition2.centerY - objectPosition1.centerY)
  );
};

/**
 * @param {Object.<number, boolean>} object1IdsSet
 * @param {Object.<number, boolean>} object2IdsSet
 * @param {number} distance
 * @param {boolean} inverted
 */
gdjs.ObjectPositionsManager.prototype.distanceTest = function(
  object1IdsSet,
  object2IdsSet,
  distance,
  inverted
) {
  this.update();

  var squaredDistance = distance * distance;
  var isTrue = false;
  /** @type {Object.<number, boolean>} */
  var pickedObject1IdsSet = {};
  /** @type {Object.<number, boolean>} */
  var pickedObject2IdsSet = {};

  // Get the set of all objectNameIds for the second list, to know in which
  // RBush we have to search them.
  var object2NameIdsSet = this._getAllObjectNameIds(object2IdsSet);

  for (var object1Id in object1IdsSet) {
    var atLeastOneObject = false;

    var object1Position = this._allObjectPositions[object1Id];

    var searchArea = {
      minX: object1Position.aabb.min[0] - distance,
      minY: object1Position.aabb.min[1] - distance,
      maxX: object1Position.aabb.max[0] + distance,
      maxY: object1Position.aabb.max[1] + distance,
    };

    for (var object2NameId in object2NameIdsSet) {
      /** @type ObjectPosition[] */
      var nearbyObjectPositions = this._getPositionsRBush(object2NameId).search(
        searchArea
      );

      for (var j = 0; j < nearbyObjectPositions.length; ++j) {
        var object2Position = nearbyObjectPositions[j];

        // It's possible that we're testing distance between lists containing the same objects
        if (object2Position.objectId === object1Position.objectId) continue;

        if (object2IdsSet[object2Position.objectId]) {
          if (
            gdjs.ObjectPositionsManager._getObjectPositionsSquaredDistance(
              object1Position,
              object2Position
            ) < squaredDistance
          ) {
            if (!inverted) {
              isTrue = true;

              pickedObject2IdsSet[object2Position.objectId] = true;
              pickedObject1IdsSet[object1Id] = true;
            }

            atLeastOneObject = true;
          }
        }
      }
    }

    if (!atLeastOneObject && inverted) {
      // This is the case when, for example, the object is *not* overlapping *any* other object.
      isTrue = true;
      pickedObject1IdsSet[object1Id] = true;
      // In case of inverted === true, objects from the second list are not picked.
    }
  }

  // Trim sets
  gdjs.ObjectPositionsManager._keepOnlyIdsFromObjectIdsSet(
    object1IdsSet,
    pickedObject1IdsSet
  );
  if (!inverted) {
    gdjs.ObjectPositionsManager._keepOnlyIdsFromObjectIdsSet(
      object2IdsSet,
      pickedObject2IdsSet
    );
  }

  return isTrue;
};

/**
 * Test if there is a collision between any of the two hitboxes (any polygon from the first
 * touching any polygon of the second).
 *
 * @param {gdjs.Polygon[]} hitBoxes1
 * @param {gdjs.Polygon[]} hitBoxes2
 * @param {boolean} ignoreTouchingEdges If true, polygons are not considered in collision if only their edges are touching.
 */
gdjs.ObjectPositionsManager.prototype._checkHitboxesCollision = function(
  hitBoxes1,
  hitBoxes2,
  ignoreTouchingEdges
) {
  for (var k = 0, lenBoxes1 = hitBoxes1.length; k < lenBoxes1; ++k) {
    for (var l = 0, lenBoxes2 = hitBoxes2.length; l < lenBoxes2; ++l) {
      if (
        gdjs.Polygon.collisionTest(
          hitBoxes1[k],
          hitBoxes2[l],
          ignoreTouchingEdges
        ).collision
      ) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check collisions between the specified set of objects, filtering both sets to only
 * keep the object ids that are actually in collision with a member of the other set.
 *
 * If `inverted` is true, only the first set is filtered with the object ids that are NOT
 * in collision with any object of the second set.
 *
 * @param {Object.<number, boolean>} object1IdsSet
 * @param {Object.<number, boolean>} object2IdsSet
 * @param {boolean} inverted
 * @param {boolean} ignoreTouchingEdges If true, polygons are not considered in collision if only their edges are touching.
 */
gdjs.ObjectPositionsManager.prototype.collisionTest = function(
  object1IdsSet,
  object2IdsSet,
  inverted,
  ignoreTouchingEdges
) {
  this.update();

  var isTrue = false;
  /** @type {Object.<number, boolean>} */
  var pickedObject1IdsSet = {};
  /** @type {Object.<number, boolean>} */
  var pickedObject2IdsSet = {};

  // Get the set of all objectNameIds for the second list, to know in which
  // RBush we have to search them.
  var object2NameIdsSet = this._getAllObjectNameIds(object2IdsSet);

  for (var object1Id in object1IdsSet) {
    var atLeastOneObject = false;

    var object1Position = this._allObjectPositions[object1Id];

    var searchArea = {
      minX: object1Position.aabb.min[0],
      minY: object1Position.aabb.min[1],
      maxX: object1Position.aabb.max[0],
      maxY: object1Position.aabb.max[1],
    };

    for (var object2NameId in object2NameIdsSet) {
      /** @type ObjectPosition[] */
      var nearbyObjectPositions = this._getPositionsRBush(object2NameId).search(
        searchArea
      );

      for (var j = 0; j < nearbyObjectPositions.length; ++j) {
        var object2Position = nearbyObjectPositions[j];

        // It's possible that we're testing collision between lists containing the same objects
        if (object2Position.objectId === object1Position.objectId) continue;

        if (object2IdsSet[object2Position.objectId]) {
          var hitBoxes1 = object1Position.hitboxes;
          var hitBoxes2 = object2Position.hitboxes;

          if (
            this._checkHitboxesCollision(
              hitBoxes1,
              hitBoxes2,
              ignoreTouchingEdges
            )
          ) {
            if (!inverted) {
              isTrue = true;

              pickedObject2IdsSet[object2Position.objectId] = true;
              pickedObject1IdsSet[object1Id] = true;
            }

            atLeastOneObject = true;
          }
        }
      }
    }

    if (!atLeastOneObject && inverted) {
      // This is the case when, for example, the object is *not* overlapping *any* other object.
      isTrue = true;
      pickedObject1IdsSet[object1Id] = true;
      // In case of inverted === true, objects from the second list are not picked.
    }
  }

  // Trim sets
  gdjs.ObjectPositionsManager._keepOnlyIdsFromObjectIdsSet(
    object1IdsSet,
    pickedObject1IdsSet
  );
  if (!inverted) {
    gdjs.ObjectPositionsManager._keepOnlyIdsFromObjectIdsSet(
      object2IdsSet,
      pickedObject2IdsSet
    );
  }

  return isTrue;
};

/**
 * Test if there are collisions between any of the two hitboxes (any polygon from the first
 * touching any polygon of the second), and if so update the `moveCoordinates` array with
 * the delta that should be applied to hitboxes to be separated.
 *
 * @param {gdjs.Polygon[]} hitBoxes
 * @param {gdjs.Polygon[]} otherHitBoxes
 * @param {boolean} ignoreTouchingEdges If true, polygons are not considered in collision if only their edges are touching.
 */
gdjs.ObjectPositionsManager.prototype._separateHitboxes = function(
  hitBoxes,
  otherHitBoxes,
  ignoreTouchingEdges,
  moveCoordinates
) {
  var moved = false;

  for (var k = 0, lenk = hitBoxes.length; k < lenk; ++k) {
    for (var l = 0, lenl = otherHitBoxes.length; l < lenl; ++l) {
      var result = gdjs.Polygon.collisionTest(
        hitBoxes[k],
        otherHitBoxes[l],
        ignoreTouchingEdges
      );
      if (result.collision) {
        moveCoordinates[0] += result.move_axis[0];
        moveCoordinates[1] += result.move_axis[1];
        moved = true;
      }
    }
  }

  return moved;
};

/**
 * Separate the specified sets of objects.
 *
 * @param {Object.<number, boolean>} object1IdsSet
 * @param {Object.<number, boolean>} object2IdsSet
 * @param {boolean} ignoreTouchingEdges If true, polygons are not considered in collision if only their edges are touching.
 */
gdjs.ObjectPositionsManager.prototype.separateObjects = function(
  object1IdsSet,
  object2IdsSet,
  ignoreTouchingEdges
) {
  this.update();

  var isTrue = false;

  // Get the set of all objectNameIds for the second list, to know in which
  // RBush we have to search them.
  var object2NameIdsSet = this._getAllObjectNameIds(object2IdsSet);

  /** @type ObjectPositionCoordinatesUpdate[] */
  var objectPositionUpdates = [];

  for (var object1Id in object1IdsSet) {
    var moved = false;
    var moveCoordinates = [0, 0];

    var object1Position = this._allObjectPositions[object1Id];

    var searchArea = {
      minX: object1Position.aabb.min[0],
      minY: object1Position.aabb.min[1],
      maxX: object1Position.aabb.max[0],
      maxY: object1Position.aabb.max[1],
    };

    for (var object2NameId in object2NameIdsSet) {
      /** @type ObjectPosition[] */
      var nearbyObjectPositions = this._getPositionsRBush(object2NameId).search(
        searchArea
      );

      for (var j = 0; j < nearbyObjectPositions.length; ++j) {
        var object2Position = nearbyObjectPositions[j];

        // It's possible that we're testing collision between lists containing the same objects
        if (object2Position.objectId === object1Position.objectId) continue;

        if (object2IdsSet[object2Position.objectId]) {
          moved =
            this._separateHitboxes(
              object1Position.hitboxes,
              object2Position.hitboxes,
              ignoreTouchingEdges,
              moveCoordinates
            ) || moved;
        }
      }
    }

    if (moved) {
      objectPositionUpdates.push({
        objectId: object1Position.objectId,
        x: moveCoordinates[0],
        y: moveCoordinates[1],
      });
    }
  }

  // Apply all new positions at once after all collisions are handled.
  for (var i = 0; i < objectPositionUpdates.length; i++) {
    var objectPositionUpdate = objectPositionUpdates[i];
    var object1Position = this._allObjectPositions[
      objectPositionUpdate.objectId
    ];
    gdjs.ObjectPositionsManager._moveObjectPosition(
      object1Position,
      objectPositionUpdate.x,
      objectPositionUpdate.y
    );
  }
};

// Sets utilities:

/**
 * Delete any element of the first set that is not in the second one.
 *
 * @param {Object.<number, boolean>} objectIdsSet
 * @param {Object.<number, boolean>} objectIdsSet2
 */
gdjs.ObjectPositionsManager._keepOnlyIdsFromObjectIdsSet = function(
  objectIdsSet,
  objectIdsSet2
) {
  for (var objectId in objectIdsSet) {
    if (!objectIdsSet2[objectId]) {
      delete objectIdsSet[objectId];
    }
  }
};

/**
 * Generate a set of object ids from the lists of objects passed. Useful
 * as gdjs.ObjectPositionsManager only deals with ids for genericity.
 *
 * @param {Hashtable} objectsLists The lists of objects
 * @returns {Object.<number, boolean>} A set containing the object ids
 */
gdjs.ObjectPositionsManager.objectsListsToObjectIdsSet = function(
  objectsLists
) {
  /** @type Object.<number, boolean> */
  var objectIdsSet = {};

  for (var key in objectsLists.items) {
    var list = objectsLists.items[key];
    for (var i = 0; i < list.length; ++i) {
      objectIdsSet[list[i].id] = true;
    }
  }

  return objectIdsSet;
};

/**
 * Remove from the lists of objects any object that is not in the set of object ids.
 * Useful as gdjs.ObjectPositionsManager only deals with ids for genericity, but events
 * are using lists of objects.
 *
 * @param {Hashtable} objectsLists The lists of objects
 * @param {Object.<number, boolean>} objectIdsSet A set containing the object ids to keep
 */
gdjs.ObjectPositionsManager.keepOnlyObjectsFromObjectIdsSet = function(
  objectsLists,
  objectIdsSet
) {
  for (var key in objectsLists.items) {
    var list = objectsLists.items[key];
    var finalSize = 0;

    for (var i = 0; i < list.length; ++i) {
      var obj = list[i];
      if (objectIdsSet[obj.id]) {
        list[finalSize] = obj;
        finalSize++;
      }
    }

    list.length = finalSize;
  }
};
