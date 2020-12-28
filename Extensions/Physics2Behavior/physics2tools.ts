namespace gdjs {
  gdjs.physics2 = gdjs.physics2 || {};
  gdjs.physics2.objectsCollide = function (
    objectsLists1,
    behavior,
    objectsLists2,
    inverted
  ) {
    return gdjs.evtTools.object.twoListsTest(
      gdjs.Physics2RuntimeBehavior.collisionTest,
      objectsLists1,
      objectsLists2,
      inverted,
      behavior
    );
  };
  gdjs.physics2.setTimeScale = function (objectsLists, behavior, timeScale) {
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
