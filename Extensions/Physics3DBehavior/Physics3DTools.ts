namespace gdjs {
  export namespace physics3d {
    export const areObjectsColliding = function (
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

    type BehaviorNamePair = { character: string; physics: string };

    const isOnPlatformAdapter = (
      characterObject: gdjs.RuntimeObject,
      physicsObject: gdjs.RuntimeObject,
      behaviorNamePair: BehaviorNamePair
    ): boolean => {
      const characterBehavior = characterObject.getBehavior(
        behaviorNamePair.character
      ) as gdjs.PhysicsCharacter3DRuntimeBehavior;
      const physicsBehavior = physicsObject.getBehavior(
        behaviorNamePair.physics
      ) as gdjs.Physics3DRuntimeBehavior;
      if (!characterBehavior || !physicsBehavior) {
        return false;
      }
      return characterBehavior.isOnFloorObject(physicsBehavior);
    };

    const behaviorNamePair: BehaviorNamePair = { character: '', physics: '' };

    export const isOnPlatform = (
      characterObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      characterBehaviorName: string,
      physicsObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      physicsBehaviorName: string,
      inverted: boolean
    ) => {
      behaviorNamePair.character = characterBehaviorName;
      behaviorNamePair.physics = physicsBehaviorName;
      return gdjs.evtTools.object.twoListsTest(
        isOnPlatformAdapter,
        characterObjectsLists,
        physicsObjectsLists,
        inverted,
        behaviorNamePair
      );
    };
  }
}
