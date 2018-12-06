
gdjs.physics2 = gdjs.physics2 || {};

gdjs.physics2.objectsCollide = function(objectsLists1, behavior, objectsLists2, inverted){
    return gdjs.evtTools.object.twoListsTest(gdjs.Physics2RuntimeBehavior.collisionTest,
            objectsLists1, objectsLists2, inverted, behavior);
};
