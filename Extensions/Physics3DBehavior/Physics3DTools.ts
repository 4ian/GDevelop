namespace gdjs {
  export namespace physics3d {
    export const objectsCollide = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.areObjectsColliding,
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
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.hasCollisionStartedBetween,
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
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.hasCollisionStoppedBetween,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };
  }
}
