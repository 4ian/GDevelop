namespace gdjs {
  export namespace evtTools {
    export namespace platform {
      export const isOnPlatform = function (
        objectsLists1: ObjectsLists,
        behaviorName: string,
        objectsLists2: ObjectsLists,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.twoListsTest(
          gdjs.PlatformRuntimeBehavior.isOnPlatformTest,
          objectsLists1,
          objectsLists2,
          inverted,
          behaviorName
        );
      };
    }
  }
}
