namespace gdjs {
  export namespace platform {
    export const isOnPlatform = function (
      objectsLists1,
      behavior,
      objectsLists2,
      inverted
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.PlatformRuntimeBehavior.isOnPlatformTest,
        objectsLists1,
        objectsLists2,
        inverted,
        behavior
      );
    };
  }
}
