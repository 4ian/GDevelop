/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to objects, for events generated code.
 * @namespace gdjs.evtTools
 * @class object
 * @static
 * @private
 */
gdjs.evtTools.object = gdjs.evtTools.object || {};


/**
 * \brief Keep only the specified object in the lists of picked objects.
 *
 * @method pickOnly
 * @param objectsLists The lists of objects to trim
 * @param runtimeObject {gdjs.RuntimeObject} The object to keep in the lists
 * @static
 */
gdjs.evtTools.object.pickOnly = function(objectsLists, runtimeObject) {
    var values = objectsLists.values();
    for(var i = 0, len = values.length;i<len;++i)
        values[i].length = 0; //Be sure not to lose the reference to the original array

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
 * @method TwoListsTest
 * @static
 */
gdjs.evtTools.object.twoListsTest = function(predicate, objectsLists1, objectsLists2, inverted) {

    var isTrue = false;
    var objects1Values = objectsLists1.values();
    var objects2Values = objectsLists2.values();

    for(var i = 0, leni = objects1Values.length;i<leni;++i) {
        var arr = objects1Values[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }
    for(var i = 0, leni = objects2Values.length;i<leni;++i) {
        var arr = objects2Values[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }

    //Launch the function for each object of the first list with each object
    //of the second list.
    for(var i = 0, leni = objects1Values.length;i<leni;++i) {
        var arr1 = objects1Values[i];

        for(var k = 0, lenk = arr1.length;k<lenk;++k) {
            var atLeastOneObject = false;

            for(var j = 0, lenj = objects2Values.length;j<lenj;++j) {
                var arr2 = objects2Values[j];

                for(var l = 0, lenl = arr2.length;l<lenl;++l) {
                    if (arr1[k].pick && arr2[l].pick) continue; //Avoid unnecessary costly call to predicate.

                    if (arr1[k].id !== arr2[l].id && predicate(arr1[k], arr2[l])) {
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
    for(var i = 0, leni = objects1Values.length;i<leni;++i) {
        var arr = objects1Values[i];
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
        for(var i = 0, leni = objects2Values.length;i<leni;++i) {
            var arr = objects2Values[i];
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
 * @brief Filter objects to keep only the one that fullfil the predicate
 *
 * Objects that do not fullfil the predicate are removed from objects lists.
 *
 * @param predicate The function applied to each object: must return true if the object fulfill the predicate.
 * @param objectsLists The lists of objects to trim
 * @param negatePredicate If set to true, the result of the predicate is negated.
 * @return true if at least one object fulfill the predicate.
 *
 * @method PickObjectsIf
 * @static
 */
gdjs.evtTools.object.pickObjectsIf = function(predicate, objectsLists, negatePredicate) {
    var isTrue = false;
    var objectsValues = objectsLists.values();

    //Create a boolean for each object
    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }

    //Pick only objects that are fulfilling the predicate
    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            if (negatePredicate ^ predicate(arr[k])) {
                isTrue = true;
                arr[k].pick = true; //Pick the objects
            }
        }
    }

    //Trim not picked objects from lists.
    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];
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

gdjs.evtTools.object.distanceTest = function(objectsLists1, objectsLists2, distance, inverted) {
    distance *= distance;

    var distanceTestInner = function(obj1, obj2) {
        return obj1.getSqDistanceToObject(obj2) <= distance;
    };

    return gdjs.evtTools.object.twoListsTest(distanceTestInner, objectsLists1,
        objectsLists2, inverted);
};


gdjs.evtTools.object.movesTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {

    var movesTowardTestInner = function(obj1, obj2) {

        if ( obj1.hasNoForces() ) return false;

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAverageForce().getAngle(), objAngle)) <= tolerance/2;
    };

    return gdjs.evtTools.object.twoListsTest(movesTowardTestInner, objectsLists1, objectsLists2, inverted);
};

gdjs.evtTools.object.turnedTowardTest = function(objectsLists1, objectsLists2, tolerance, inverted) {

    var turnedTowardTestInner = function(obj1, obj2) {

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAngle(), objAngle)) <= tolerance/2;
    };

    return gdjs.evtTools.object.twoListsTest(turnedTowardTestInner, objectsLists1, objectsLists2, inverted);
};

gdjs.evtTools.object.pickAllObjects = function(runtimeScene, objectsLists) {

    var entries = objectsLists.entries();
    for(var i = 0, len = entries.length;i<len;++i) {
        var allObjects = runtimeScene.getObjects(entries[i][0]);
        var objectsList = entries[i][1];
        objectsList.length = 0;
        objectsList.push.apply(objectsList, allObjects);
    }

    return true;
};

gdjs.evtTools.object.pickRandomObject = function(runtimeScene, objectsLists) {

    //Create a list with all the objects
    //and clear the lists of picked objects.
    var objects = [];
    var values = objectsLists.values();
    for(var i = 0, len = values.length;i<len;++i) {
        objects.push.apply(objects, values[i]);
        values[i].length = 0; //Be sure not to lose the reference to the original array
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
    var values = objectsLists.values();
    for(var i = 0, len = values.length;i<len;++i) {
        var list = values[i];

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
    gdjs.evtTools.object.doCreateObjectOnScene(runtimeScene, objectsLists.keys()[0], objectsLists, x, y, layer);
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
    var values = objectsLists.values();
    for(var i = 0, len = values.length;i<len;++i) {
        size += values[i].length;
    }

    return size;
};
