
gdjs.physik = gdjs.physik || {};

gdjs.physik.objectsCollide = function(objectsLists1, behavior, objectsLists2, inverted){
    return gdjs.evtTools.object.twoListsTest(gdjs.PhysikRuntimeBehavior.collisionTest,
            objectsLists1, objectsLists2, inverted, behavior);
};