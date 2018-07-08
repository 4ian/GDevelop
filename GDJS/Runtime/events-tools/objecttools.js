/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to objects, for events generated code.
 * @memberof gdjs.evtTools
 * @namespace object
 */
gdjs.evtTools.object = gdjs.evtTools.object || {};


/**
 * Keep only the specified object in the lists of picked objects.
 *
 * @param objectsLists The lists of objects to trim
 * @param runtimeObject {gdjs.RuntimeObject} The object to keep in the lists
 */
gdjs.evtTools.object.pickOnly = function(objectsLists, runtimeObject) {
    var lists = gdjs.staticArray(gdjs.evtTools.object.pickOnly);
    objectsLists.values(lists);

    for(var i = 0, len = lists.length;i<len;++i)
        lists[i].length = 0; //Be sure not to lose the reference to the original array

    objectsLists.get(runtimeObject.getName()).push(runtimeObject);
};

/**
 * Do a test on two tables of objects so as to pick only the pair of objects for which the test is true.
 * If inverted == true, only the objects of the first table are filtered.
 *
 * Note that the predicate method is not called stricly for each pair: When considering a pair of objects, if
 * these objects have already been marked as picked, the predicate method won't be called again.
 *
 * Cost (Worst case, predicate being always false):
 *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
 *  + Cost(predicate)*NbObjList1*NbObjList2
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *  + Cost(Removing NbObjList1+NbObjList2 objects from all the lists)
 *
 * Cost (Best case, predicate being always true):
 *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
 *  + Cost(predicate)*(NbObjList1+NbObjList2)
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *
 * Note: predicate is called with the two objects to compare, and an optional argument `extraArg`.
 * This should be used to avoid declaring the predicate as a closure that would be created and destroyed
 * at each call to twoListsTest (potentially multiple time per frame).
 */
gdjs.evtTools.object.twoListsTest = function(predicate, objectsLists1, objectsLists2, inverted, extraArg) {

    var isTrue = false;
    var objects1Lists = gdjs.staticArray(gdjs.evtTools.object.twoListsTest);
    objectsLists1.values(objects1Lists);
    var objects2Lists = gdjs.staticArray2(gdjs.evtTools.object.twoListsTest);
    objectsLists2.values(objects2Lists);

    for(var i = 0, leni = objects1Lists.length;i<leni;++i) {
        var arr = objects1Lists[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }
    for(var i = 0, leni = objects2Lists.length;i<leni;++i) {
        var arr = objects2Lists[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }

    //Launch the function for each object of the first list with each object
    //of the second list.
    for(var i = 0, leni = objects1Lists.length;i<leni;++i) {
        var arr1 = objects1Lists[i];

        for(var k = 0, lenk = arr1.length;k<lenk;++k) {
            var atLeastOneObject = false;

            for(var j = 0, lenj = objects2Lists.length;j<lenj;++j) {
                var arr2 = objects2Lists[j];

                for(var l = 0, lenl = arr2.length;l<lenl;++l) {
                    if (arr1[k].pick && arr2[l].pick) continue; //Avoid unnecessary costly call to predicate.

                    if (arr1[k].id !== arr2[l].id && predicate(arr1[k], arr2[l], extraArg)) {
                        if ( !inverted ) {
                            isTrue = true;

                            //Pick the objects
                            arr1[k].pick = true;
                            arr2[l].pick = true;
                        }

                        atLeastOneObject = true;
                    }
                }
            }

            if ( !atLeastOneObject && inverted ) {
                //For example, the object is not overlapping any other object.
                isTrue = true;
                arr1[k].pick = true;
            }
        }
    }

    //Trim not picked objects from lists.
    for(var i = 0, leni = objects1Lists.length;i<leni;++i) {
        var arr = objects1Lists[i];
        var finalSize = 0;

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            var obj = arr[k];
            if ( arr[k].pick ) {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.length = finalSize;
    }

    if ( !inverted ) {
        for(var i = 0, leni = objects2Lists.length;i<leni;++i) {
            var arr = objects2Lists[i];
            var finalSize = 0;

            for(var k = 0, lenk = arr.length;k<lenk;++k) {
                var obj = arr[k];
                if ( arr[k].pick ) {
                    arr[finalSize] = obj;
                    finalSize++;
                }
            }
            arr.length = finalSize;
        }
    }

    return isTrue;
}

/**
 * Filter objects to keep only the one that fullfil the predicate
 *
 * Objects that do not fullfil the predicate are removed from objects lists.
 *
 * @param predicate The function applied to each object: must return true if the object fulfill the predicate.
 * @param objectsLists The lists of objects to trim
 * @param negatePredicate If set to true, the result of the predicate is negated.
 * @param extraArg Argument passed to the predicate (along with the object). Useful for avoiding relying on temporary closures.
 * @return true if at least one object fulfill the predicate.
 */
gdjs.evtTools.object.pickObjectsIf = function(predicate, objectsLists, negatePredicate, extraArg) {
    var isTrue = false;
    var lists = gdjs.staticArray(gdjs.evtTools.object.pickObjectsIf);
    objectsLists.values(lists);

    //Create a boolean for each object
    for(var i = 0, leni = lists.length;i<leni;++i) {
        var arr = lists[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }

    //Pick only objects that are fulfilling the predicate
    for(var i = 0, leni = lists.length;i<leni;++i) {
        var arr = lists[i];

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            if (negatePredicate ^ predicate(arr[k], extraArg)) {
                isTrue = true;
                arr[k].pick = true; //Pick the objects
            }
        }
    }

    //Trim not picked objects from lists.
    for(var i = 0, leni = lists.length;i<leni;++i) {
        var arr = lists[i];
        var finalSize = 0;

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            var obj = arr[k];
            if ( arr[k].pick ) {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.length = finalSize;
    }

    return isTrue;
};

gdjs.evtTools.object.hitBoxesCollisionTest = function(objectsLists1, objectsLists2, inverted, runtimeScene) {
    return gdjs.evtTools.object.twoListsTest(gdjs.RuntimeObject.collisionTest,
        objectsLists1, objectsLists2, inverted);
};

gdjs.evtTools.object._distanceBetweenObjects = function(obj1, obj2, distance) {
    return obj1.getSqDistanceToObject(obj2) <= distance;
};

gdjs.evtTools.object.distanceTest = function(objectsLists1, objectsLists2, distance, inverted) {
    return gdjs.evtTools.object.twoListsTest(gdjs.evtTools.object._distanceBetweenObjects,
        objectsLists1, objectsLists2, inverted, distance*distance);
};

gdjs.evtTools.object._movesToward = function(obj1, obj2, tolerance) {
    if ( obj1.hasNoForces() ) return false;

    var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                              obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
    objAngle *= 180/3.14159;

    return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAverageForce().getAngle(), objAngle)) <= tolerance/2;
};

gdjs.evtTools.object.movesTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {
    return gdjs.evtTools.object.twoListsTest(gdjs.evtTools.object._movesToward,
        objectsLists1, objectsLists2, inverted, tolerance);
};

gdjs.evtTools.object._turnedToward = function(obj1, obj2, tolerance) {
    var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                              obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
    objAngle *= 180/3.14159;

    return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAngle(), objAngle)) <= tolerance/2;
};

gdjs.evtTools.object.turnedTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {
    return gdjs.evtTools.object.twoListsTest(gdjs.evtTools.object._turnedToward,
        objectsLists1, objectsLists2, inverted, tolerance);
};

gdjs.evtTools.object.pickAllObjects = function(runtimeScene, objectsLists) {

    for (var name in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(name)) {
            var allObjects = runtimeScene.getObjects(name);
            var objectsList = objectsLists.items[name];
            objectsList.length = 0;
            objectsList.push.apply(objectsList, allObjects);
        }
    }

    return true;
};

gdjs.evtTools.object.pickRandomObject = function(runtimeScene, objectsLists) {

    //Create a list with all the objects
    //and clear the lists of picked objects.
    var objects = gdjs.staticArray(gdjs.evtTools.object.pickRandomObject);
    objects.length = 0;

    var lists = gdjs.staticArray2(gdjs.evtTools.object.pickRandomObject);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        objects.push.apply(objects, lists[i]);
        lists[i].length = 0; //Be sure not to lose the reference to the original array
    }

    //Pick only one object
    if ( objects.length === 0 )
        return false;

    var id = Math.floor(Math.random()*objects.length);
    if (id >= objects.length) id = objects.length-1; //Should never happen.
    var theChosenOne = objects[id];

    objectsLists.get(theChosenOne.getName()).push(theChosenOne);

    return true;
};

gdjs.evtTools.object.pickNearestObject = function(objectsLists, x, y, inverted) {
    var bestObject = null;
    var best = 0;
    var first = true;
    var lists = gdjs.staticArray(gdjs.evtTools.object.pickNearestObject);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        var list = lists[i];

        for(var j = 0;j < list.length;++j) {
            var object = list[j];
            var distance = object.getSqDistanceTo(x, y);
            if( first || (distance < best ^ inverted)) {
                best = distance;
                bestObject = object;
            }

            first = false;
        }
    }

    if (!bestObject)
        return false;

    gdjs.evtTools.object.pickOnly(objectsLists, bestObject);
    return true;
};

gdjs.evtTools.object.raycastObject = function(objectsLists, x, y, angle, dist, varX, varY, inverted) {
    return gdjs.evtTools.object.raycastObjectToPosition(
                objectsLists,
                x, y,
                x + dist*Math.cos(angle*Math.PI/180.0),
                y + dist*Math.sin(angle*Math.PI/180.0),
                varX, varY, inverted);
};

gdjs.evtTools.object.raycastObjectToPosition = function(objectsLists, x, y, endX, endY, varX, varY, inverted) {
    var matchObject = null;
    var testSqDist = inverted ? 0 : (endX - x)*(endX - x) + (endY - y)*(endY - y);
    var resultX = 0;
    var resultY = 0;

    var lists = gdjs.staticArray(gdjs.evtTools.object.raycastObjectToPosition);
    objectsLists.values(lists);
    for (var i = 0; i < lists.length; i++) {
        var list = lists[i];

        for (var j = 0; j < list.length; j++) {
            var object = list[j];
            var result = object.raycastTest(x, y, endX, endY, !inverted);
            
            if( result.collision ) {
                if ( !inverted && (result.closeSqDist <= testSqDist) ) {
                    testSqDist = result.closeSqDist;
                    matchObject = object;
                    resultX = result.closeX;
                    resultY = result.closeY;
                }
                else if ( inverted && (result.farSqDist >= testSqDist) ) {
                    testSqDist = result.farSqDist;
                    matchObject = object;
                    resultX = result.farX;
                    resultY = result.farY;
                }
            }
        }
    }

    if ( !matchObject )
        return false;

    gdjs.evtTools.object.pickOnly(objectsLists, matchObject);
    varX.setNumber(resultX);
    varY.setNumber(resultY);
    return true;
};

/**
 * Do the work of creating a new object
 * @private
 */
gdjs.evtTools.object.doCreateObjectOnScene = function(runtimeScene, objectName, objectsLists, x, y, layer) {

    //Let's ask the RuntimeScene to create the object
    var obj = runtimeScene.createObject(objectName);

    if ( obj !== null ) {
        //Do some extra setup
        obj.setPosition(x,y);
        obj.setLayer(layer);

        //Let the new object be picked by next actions/conditions.
        if ( objectsLists.containsKey(objectName) ) {
            objectsLists.get(objectName).push(obj);
        }
    }
};

/**
 * Allows events to create a new object on a scene.
 * @private
 */
gdjs.evtTools.object.createObjectOnScene = function(runtimeScene, objectsLists, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(runtimeScene, objectsLists.firstKey(), objectsLists, x, y, layer);
};

/**
 * Allows events to create a new object on a scene.
 * @private
 */
gdjs.evtTools.object.createObjectFromGroupOnScene = function(runtimeScene, objectsLists, objectName, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(runtimeScene, objectName, objectsLists, x, y, layer);
};

/**
 * Allows events to get the number of objects picked.
 * @private
 */
gdjs.evtTools.object.pickedObjectsCount = function(objectsLists) {
    var size = 0;
    var lists = gdjs.staticArray(gdjs.evtTools.object.pickedObjectsCount);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        size += lists[i].length;
    }

    return size;
};
