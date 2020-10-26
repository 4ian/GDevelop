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
 * @param  {Hashtable} objectsLists The lists of objects to trim
 * @param  {gdjs.RuntimeObject} runtimeObject The object to keep in the lists
 */
gdjs.evtTools.object.pickOnly = function(objectsLists, runtimeObject) {
    for (var listName in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(listName)) {
            var list = objectsLists.items[listName];

            if (list.indexOf(runtimeObject) === -1) {
                list.length = 0; //Be sure not to lose the reference to the original array
            } else {
                list.length = 0; //Be sure not to lose the reference to the original array
                list.push(runtimeObject);
            }
        }
    }
};

/**
 * A predicate to be passed to `gdjs.evtTools.object.twoListsTest`.
 * @callback gdjsTwoListsTestPredicate
 * @param {gdjs.RuntimeObject} object1 First object
 * @param {gdjs.RuntimeObject} object2 Second object
 * @param {*} extraArg An optional extra argument
 * @return {boolean} true if the pair satisfy the predicate (for example,there is a collision), meaning that the objects will be picked, false otherwise (no collision).
 */

/**
 * Do a test on two tables of objects so as to pick only the pair of objects for which the test is true.
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
 *
 * @param  {gdjsTwoListsTestPredicate} predicate The predicate function is called with the two objects to compare, and an optional argument `extraArg`
 * @param  {Hashtable} objectsLists1 e.g. Hashtable.newFrom({ A: objects1 });
 * @param  {Hashtable} objectsLists2 e.g. Hashtable.newFrom({ B: objects2 });
 * @param  {boolean} inverted If `inverted` == true, only the objects of the first table are filtered.
 * @param  {*} extraArg (optional) This argument should be used to avoid declaring the predicate as a closure that would be created and destroyed at each call to twoListsTest (potentially multiple time per frame).
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
 * @param  {Function} predicate The function applied to each object: must return true if the object fulfill the predicate.
 * @param  {Hashtable} objectsLists The lists of objects to trim
 * @param  {boolean} negatePredicate If set to true, the result of the predicate is negated.
 * @param  {*} extraArg Argument passed to the predicate (along with the object). Useful for avoiding relying on temporary closures.
 * @return {boolean} true if at least one object fulfill the predicate.
 */
gdjs.evtTools.object.pickObjectsIf = function(predicate, objectsLists, negatePredicate, extraArg) {
    var isTrue = false;
    var lists = gdjs.staticArray(gdjs.evtTools.object.pickObjectsIf);
    objectsLists.values(lists);

    // Pick only objects that are fulfilling the predicate.
    for(var i = 0, leni = lists.length;i<leni;++i) {
        var arr = lists[i];

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            var object = arr[k];
            if (negatePredicate ^ predicate(object, extraArg)) {
                isTrue = true;
                object.pick = true;
            } else {
                object.pick = false;
            }
        }
    }

    // Trim not picked objects from lists.
    for(var i = 0, leni = lists.length;i<leni;++i) {
        gdjs.evtTools.object.filterPickedObjectsList(lists[i]);
    }

    return isTrue;
};

/**
 * Filter in-place the specified array to remove objects for which
 * `pick` property is set to false.
 * @param {gdjs.RuntimeObject[]} arr
 */
gdjs.evtTools.object.filterPickedObjectsList = function (arr) {
    var finalSize = 0;

    for (var k = 0, lenk = arr.length; k < lenk; ++k) {
        var obj = arr[k];
        if (obj.pick) {
            arr[finalSize] = obj;
            finalSize++;
        }
    }

    arr.length = finalSize;
};

gdjs.evtTools.object.hitBoxesCollisionTest = function(objectsLists1, objectsLists2, inverted, runtimeScene, ignoreTouchingEdges) {
    return gdjs.evtTools.object.twoListsTest(gdjs.RuntimeObject.collisionTest,
        objectsLists1, objectsLists2, inverted, ignoreTouchingEdges);
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

    var objAngle = Math.atan2(obj2.getDrawableY()+obj2.getCenterY() - (obj1.getDrawableY()+obj1.getCenterY()),
                              obj2.getDrawableX()+obj2.getCenterX() - (obj1.getDrawableX()+obj1.getCenterX()));
    objAngle *= 180/3.14159;

    return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAverageForce().getAngle(), objAngle)) <= tolerance/2;
};

gdjs.evtTools.object.movesTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {
    return gdjs.evtTools.object.twoListsTest(gdjs.evtTools.object._movesToward,
        objectsLists1, objectsLists2, inverted, tolerance);
};

gdjs.evtTools.object._turnedToward = function(obj1, obj2, tolerance) {
    var objAngle = Math.atan2(obj2.getDrawableY()+obj2.getCenterY() - (obj1.getDrawableY()+obj1.getCenterY()),
                              obj2.getDrawableX()+obj2.getCenterX() - (obj1.getDrawableX()+obj1.getCenterX()));
    objAngle *= 180/3.14159;

    return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAngle(), objAngle)) <= tolerance/2;
};

gdjs.evtTools.object.turnedTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {
    return gdjs.evtTools.object.twoListsTest(gdjs.evtTools.object._turnedToward,
        objectsLists1, objectsLists2, inverted, tolerance);
};

gdjs.evtTools.object.pickAllObjects = function(objectsContext, objectsLists) {

    for (var name in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(name)) {
            var allObjects = objectsContext.getObjects(name);
            var objectsList = objectsLists.items[name];
            objectsList.length = 0;
            objectsList.push.apply(objectsList, allObjects);
        }
    }

    return true;
};

gdjs.evtTools.object.pickRandomObject = function(runtimeScene, objectsLists) {
    // Compute one many objects we have
    var objectsCount = 0;
    for (var listName in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(listName)) {
            var list = objectsLists.items[listName];
            objectsCount += list.length;
        }
    }

    if (objectsCount === 0)
        return false;

    // Pick one random object
    var index = Math.floor(Math.random()*objectsCount);
    if (index >= objectsCount) index = objectsCount-1; //Should never happen.

    // Find the object
    var startIndex = 0;
    var theChosenOne = null;
    for (var listName in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(listName)) {
            var list = objectsLists.items[listName];

            if (index - startIndex < list.length) {
                theChosenOne = list[index - startIndex];
                break;
            }

            startIndex += list.length;
        }
    }

    gdjs.evtTools.object.pickOnly(objectsLists, theChosenOne);
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
            var distance = object.getSqDistanceToPosition(x, y);
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
gdjs.evtTools.object.doCreateObjectOnScene = function(objectsContext, objectName, objectsLists, x, y, layer) {
    // objectsContext will either be the gdjs.RuntimeScene or, in an events function, the
    // eventsFunctionContext. We can't directly use runtimeScene because the object name could
    // be different than the real object name (this is the case in a function. The eventsFunctionContext
    // will take care of this in createObject).
    var obj = objectsContext.createObject(objectName);

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
gdjs.evtTools.object.createObjectOnScene = function(objectsContext, objectsLists, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(objectsContext, objectsLists.firstKey(), objectsLists, x, y, layer);
};

/**
 * Allows events to create a new object on a scene.
 * @private
 */
gdjs.evtTools.object.createObjectFromGroupOnScene = function(objectsContext, objectsLists, objectName, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(objectsContext, objectName, objectsLists, x, y, layer);
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
