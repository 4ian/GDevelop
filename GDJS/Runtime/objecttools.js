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
 * Do a test on two tables of objects so as to pick only the pair of objects for which the test is true.
 * If inverted == true, only the objects of the first table are filtered.
 *
 * Note that the func method is not called stricly for each pair: When considering a pair of objects, if
 * these objects have already been marked as picked, the func method won't be called again.
 *
 * Cost (Worst case, func being always false):
 *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
 *  + Cost(functor)*NbObjList1*NbObjList2
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *  + Cost(Removing NbObjList1+NbObjList2 objects from all the lists)
 *
 * Cost (Best case, func being always true):
 *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
 *  + Cost(functor)*(NbObjList1+NbObjList2)
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *
 * @method TwoListsTest
 */
gdjs.evtTools.object.TwoListsTest = function(func, objectsLists1, objectsLists2, inverted, extraParam) {

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
                    if (arr1[k].pick && arr2[l].pick) continue; //Avoid unnecessary costly call to func.

                    if (arr1[k].id !== arr2[l].id && func(arr1[k], arr2[l], extraParam)) {
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

    //Trim not picked objects from arrays.
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

gdjs.evtTools.object.hitBoxesCollisionTest = function( objectsLists1, objectsLists2, inverted, runtimeScene) {

    //if ( inverted ) ( See below why it is commented )
    return gdjs.evtTools.object.TwoListsTest(gdjs.RuntimeObject.collisionTest,
                                                 objectsLists1, objectsLists2, inverted);

    //Using HSHG ( code below ) is *less* efficient in games like SoldierJS
    //but more efficient when no collision is really involved ( For example, testing a collision
    //with lots of objects which are very far ).
    //For now, use of HSHG is deactivated ( TwoListsTest is always called above ) : The bottleneck
    //must come from the fact this.HSHG performs collision test on all instances, and not on the
    //picked one. ( getPotentialCollidingObjects method is using all the objects of the scene. )

    /*var objects1 = [];
    var objects2 = [];
    var objects1NameId = [];
    var objects2NameId = [];
    var objects1Values = objectsLists1.values();
    var objects2Values = objectsLists2.values();


    //Check if we're dealing with the same lists of objects
    var objects1Keys = objectsLists1.keys();
    var objects2Keys = objectsLists2.keys();
    var sameObjectLists = objects1Keys.length === objects2Keys.length;
    if ( sameObjectLists ) {
        for( var i = 0, len = objects1Keys.length;i<len;++i) {
            if ( objects1Keys[i] !== objects2Keys[i] ) {
                sameObjectLists = false;
                break;
            }
        }
    }

    //Prepare list of objects to iterate over.
    //And remove these objects from the original tables.
    for(var i = 0, len = objects1Values.length;i<len;++i) {
        if ( objects1Values[i].length !== 0 ) {
            objects1.push.apply(objects1, objects1Values[i]);
            objects1NameId.push(objects1Values[i][0].getNameId());
            objects1Values[i].length = 0; //Be sure not to lose the reference to the original array
        }
    }

    if (sameObjectLists) {
        objects2 = objects1.slice(0);
        objects2NameId = objects1NameId;
    }
    else
    {
        for(var i = 0, len = objects2Values.length;i<len;++i) {
            if ( objects2Values[i].length !== 0 ) {
                objects2.push.apply(objects2, objects2Values[i]);
                objects2NameId.push(objects2Values[i][0].getNameId());
                objects2Values[i].length = 0; //Be sure not to lose the reference to the original array
            }
        }
    }

    var isTrue = false;

    //Search all the pairs colliding.
    runtimeScene.updatePotentialCollidingObjects();
    var pairs = runtimeScene.getPotentialCollidingObjects(objects1NameId, objects2NameId);

    for(var i = 0, len = pairs.length;i<len;++i) {
        if ( objects1.indexOf(pairs[i][0]) !== -1 && objects2.indexOf(pairs[i][1]) !== -1 ) {

            var objList = objectsLists1.get(pairs[i][0].getName());
            if ( objList.indexOf(pairs[i][0]) == -1) objList.push(pairs[i][0]);

            objList = objectsLists2.get(pairs[i][1].getName());
            if ( objList.indexOf(pairs[i][1]) == -1) objList.push(pairs[i][1]);

            isTrue = true;
        }
        else if ( objects1.indexOf(pairs[i][1]) !== -1 && objects2.indexOf(pairs[i][0]) !== -1 ) {

            var objList = objectsLists1.get(pairs[i][1].getName());
            if ( objList.indexOf(pairs[i][1]) == -1) objList.push(pairs[i][1]);

            objList = objectsLists2.get(pairs[i][0].getName());
            if ( objList.indexOf(pairs[i][0]) == -1) objList.push(pairs[i][0]);

            isTrue = true;
        }
    }

    return isTrue;*/

}

gdjs.evtTools.object.distanceTest = function( objectsLists1, objectsLists2, distance, inverted) {

    distance *= distance;
    return gdjs.evtTools.object.TwoListsTest(gdjs.RuntimeObject.distanceTest, objectsLists1,
        objectsLists2, inverted, distance);
}


gdjs.evtTools.object.movesTowardTest = function( objectsLists1, objectsLists2, tolerance, inverted) {

    var movesTowardTestInner = function(obj1, obj2) {

        if ( obj1.hasNoForces() ) return false;

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAverageForce().getAngle(), objAngle)) <= tolerance/2;
    }

    return gdjs.evtTools.object.TwoListsTest(movesTowardTestInner, objectsLists1, objectsLists2, inverted);
}

gdjs.evtTools.object.turnedTowardTest = function( objectsLists1, objectsLists2, tolerance, inverted) {

    var turnedTowardTestInner = function(obj1, obj2) {

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        return Math.abs(gdjs.evtTools.common.angleDifference(obj1.getAngle(), objAngle)) <= tolerance/2;
    };

    return gdjs.evtTools.object.TwoListsTest(turnedTowardTestInner, objectsLists1, objectsLists2, inverted);
}

gdjs.evtTools.object.pickAllObjects = function(runtimeScene, objectsLists) {

    var entries = objectsLists.entries();
    for(var i = 0, len = entries.length;i<len;++i) {
        var allObjects = runtimeScene.getObjects(entries[i][0]);
        var objectsList = entries[i][1];
        objectsList.length = 0;
        objectsList.push.apply(objectsList, allObjects);
    }

    return true;
}

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
    if ( objects.length !== 0 ) {
        var id = Math.floor(Math.random()*objects.length);
        if (id >= objects.length) id = objects.length-1; //Should never happen.
        var theChosenOne = objects[id];

        objectsLists.get(theChosenOne.getName()).push(theChosenOne);
    }

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
