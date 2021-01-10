namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/
  gdjs.sk.slotObjectCollision = function (
    objectsLists1,
    slotPath,
    objectsLists2,
    inverted
  ) {
    return gdjs.evtTools.object.twoListsTest(
      gdjs.SkeletonRuntimeObject.slotObjectCollisionTest,
      objectsLists1,
      objectsLists2,
      inverted,
      slotPath
    );
  };
  gdjs.sk.slotSlotCollision = function (
    objectsLists1,
    slotPath1,
    objectsLists2,
    slotPath2,
    inverted
  ) {
    return gdjs.evtTools.object.twoListsTest(
      gdjs.SkeletonRuntimeObject.slotSlotCollisionTest,
      objectsLists1,
      objectsLists2,
      inverted,
      [slotPath1, slotPath2]
    );
  };
  gdjs.sk.raycastSlot = function (
    objectsLists,
    slotPath,
    x,
    y,
    angle,
    dist,
    varX,
    varY,
    inverted
  ) {
    let matchObject = null;
    let testSqDist = inverted ? 0 : dist * dist;
    let resultX = 0;
    let resultY = 0;
    const lists = gdjs.staticArray(gdjs.sk.raycastSlot);
    objectsLists.values(lists);
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      for (let j = 0; j < list.length; j++) {
        const object = list[j];
        const result = object.raycastSlot(
          slotPath,
          x,
          y,
          angle,
          dist,
          !inverted
        );
        if (result.collision) {
          if (!inverted && result.closeSqDist <= testSqDist) {
            testSqDist = result.closeSqDist;
            matchObject = object;
            resultX = result.closeX;
            resultY = result.closeY;
          } else {
            if (inverted && result.farSqDist >= testSqDist) {
              testSqDist = result.farSqDist;
              matchObject = object;
              resultX = result.farX;
              resultY = result.farY;
            }
          }
        }
      }
    }
    if (!matchObject) {
      return false;
    }
    gdjs.evtTools.object.pickOnly(objectsLists, matchObject);
    varX.setNumber(resultX);
    varY.setNumber(resultY);
    return true;
  };
}
