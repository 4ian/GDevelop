gdjs.physics2 = gdjs.physics2 || {};

gdjs.physics2.objectsCollide = function(
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

gdjs.physics2.setTimeScale = function(objectsLists, behavior, timeScale) {
  var lists = gdjs.staticArray(gdjs.physics2.setTimeScale);
  objectsLists.values(lists);
  for (var i = 0, len = lists.length; i < len; i++) {
    var list = lists[i];
    for (var j = 0, lenj = list.length; j < lenj; j++) {
      gdjs.Physics2RuntimeBehavior.setTimeScaleFromObject(
        list[j],
        behavior,
        timeScale
      );
      return;
    }
  }
};
