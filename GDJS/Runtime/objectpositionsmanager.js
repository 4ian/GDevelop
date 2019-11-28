// @ts-check

/***
 * @typedef {Object} ObjectPosition
 * @property {number} objectId
 * @property {string} objectNameId
 * @property {number} x
 * @property {number} y
 * @property {Object} hitboxes
 * @property {AABB} aabb
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
 * @property {() => Object} getHitBoxes
 * @property {() => AABB} getAABB
 */

/***
 * @class gdjs.ObjectPositionsManager
 */
gdjs.ObjectPositionsManager = function() {
  /** @type Object.<number, ObjectWithCoordinatesInterface> */
  this._dirtyCoordinatesObjects = {};

  /** @type Object.<number, ObjectWithCoordinatesInterface> */
  this._dirtyObjects = {};

  /** @type Object.<number, boolean> */
  this._removedObjectIdsSet = {};

  // TODO: use the default AABB format of RBush?
  this._positionsRBushes = {};

  /** @type Object.<number, ObjectPosition> */
  this._allObjectPositions = {};
};

gdjs.ObjectPositionsManager.prototype.getCounters = function() {
  return {
    positionsRBushesCount: Object.keys(this._positionsRBushes).length,
    allObjectPositionsCount: Object.keys(this._allObjectPositions).length,
  };
};

/**
 * @param {string} nameId
 */
gdjs.ObjectPositionsManager.prototype._getPositionsRBush = function(nameId) {
  var positionsRBush = this._positionsRBushes[nameId];
  if (positionsRBush) return positionsRBush;

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
 * @param {ObjectWithCoordinatesInterface} object
 */
gdjs.ObjectPositionsManager.prototype.markObjectAsRemoved = function(object) {
  this._removedObjectIdsSet[object.id] = true;
};

/**
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
      objectId: object.id,
      objectNameId: objectNameId,
      x: object.getX(),
      y: object.getY(),
      hitboxes: object.getHitBoxes(),
      aabb: object.getAABB(),
    };
    this._getPositionsRBush(objectNameId).insert(objectPosition);
    delete this._dirtyObjects[objectId];
  }

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

  var isTrue = false;
  /** @type {Object.<number, boolean>} */
  var pickedObject1IdsSet = {};
  /** @type {Object.<number, boolean>} */
  var pickedObject2IdsSet = {};

  // Get the set of all objectNameIds for the second list, to know in which
  // RBush we have to search them.
  var object2NameIdsSet = {};
  for (var object2Id in object2IdsSet) {
    var object2Position = this._allObjectPositions[object2Id];
    object2NameIdsSet[object2Position.objectNameId] = true;
  }

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

        // It's possible that we're testing collision between lists containing the same objects
        if (object2Position.objectId === object1Position.objectId) continue;

        if (object2IdsSet[object2Position.objectId]) {
          if (!inverted) {
            isTrue = true;

            pickedObject2IdsSet[object2Position.objectId] = true;
            pickedObject1IdsSet[object1Id] = true;
          }

          atLeastOneObject = true;
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
  this.keepOnlyIdsFromObjectIdsSet(object1IdsSet, pickedObject1IdsSet);
  if (!inverted) {
    this.keepOnlyIdsFromObjectIdsSet(object2IdsSet, pickedObject2IdsSet);
  }

  return isTrue;
};

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
 * @param {Object.<number, boolean>} object1IdsSet
 * @param {Object.<number, boolean>} object2IdsSet
 * @param {boolean} inverted
 * @param {boolean} ignoreTouchingEdges
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
  var object2NameIdsSet = {};
  for (var object2Id in object2IdsSet) {
    var object2Position = this._allObjectPositions[object2Id];
    object2NameIdsSet[object2Position.objectNameId] = true;
  }

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
  this.keepOnlyIdsFromObjectIdsSet(object1IdsSet, pickedObject1IdsSet);
  if (!inverted) {
    this.keepOnlyIdsFromObjectIdsSet(object2IdsSet, pickedObject2IdsSet);
  }

  return isTrue;
};

// Sets utilities:

/**
 * @param {Object.<number, boolean>} objectIdsSet
 * @param {Object.<number, boolean>} objectIdsSet2
 */
gdjs.ObjectPositionsManager.prototype.keepOnlyIdsFromObjectIdsSet = function(
  objectIdsSet,
  objectIdsSet2
) {
  for (var objectId in objectIdsSet) {
    if (!objectIdsSet2[objectId]) {
      delete objectIdsSet[objectId];
    }
  }
};
