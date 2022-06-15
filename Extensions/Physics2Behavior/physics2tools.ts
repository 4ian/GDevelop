namespace gdjs {
  export namespace physics2 {
    export const objectsCollide = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics2RuntimeBehavior.areObjectsColliding,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const haveObjectsStartedColliding = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics2RuntimeBehavior.hasCollisionStartedBetween,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const haveObjectsStoppedColliding = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics2RuntimeBehavior.hasCollisionStoppedBetween,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const setTimeScale = function (objectsLists, behavior, timeScale) {
      const lists = gdjs.staticArray(gdjs.physics2.setTimeScale);
      objectsLists.values(lists);
      for (let i = 0, len = lists.length; i < len; i++) {
        const list = lists[i];
        for (let j = 0, lenj = list.length; j < lenj; j++) {
          gdjs.Physics2RuntimeBehavior.setTimeScaleFromObject(
            list[j],
            behavior,
            timeScale
          );
          return;
        }
      }
    };
  }
}
