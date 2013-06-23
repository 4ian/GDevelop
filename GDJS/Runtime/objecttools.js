/*
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Tools related to objects, for events generated code.
 * @namespace gdjs.evtTools
 * @class object
 * @static
 */
gdjs.evtTools.object = gdjs.evtTools.object || {};

gdjs.pick = function() {
}

/**
 * Do a test on two tables of objects so as to remove the objects for which the test is false.
 * If inverted == true, only the objects of the first table are filtered.
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
    
    for(var i = 0, leni = objects1Values.length;i<leni;++i) {
        var arr1 = objects1Values[i];
        
        for(var k = 0, lenk = arr1.length;k<lenk;++k) {
            var atLeastOneObject = false;
        
            for(var j = 0, lenj = objects2Values.length;j<lenj;++j) {
                var arr2 = objects2Values[j];
                
                for(var l = 0, lenl = arr2.length;l<lenl;++l) {
                    
                    if ( func(arr1[k], arr2[l], extraParam) ) {
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
            
            if ( !atLeastOneObject && inverted ) { //The object is not overlapping any other object.
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
    
    return isTrue;
    
    /*
    var objects1 = [];
    var objects2 = [];
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
        objects1.push.apply(objects1, objects1Values[i]);
        objects1Values[i].length = 0; //Be sure not to lose the reference to the original array
    }

    if (sameObjectLists)
        objects2 = objects1.slice(0);
    else
    {
        for(var i = 0, len = objects2Values.length;i<len;++i) {
            objects2.push.apply(objects2, objects2Values[i]);
            objects2Values[i].length = 0; //Be sure not to lose the reference to the original array
        }
    }

    //Iterate over the lists to do the test for each pair of objects.
    var isTrue = false;
    for(var i = 0, len1 = objects1.length;i<len1;++i) {

        var atLeastOneObject = false;
        for(var j = (!sameObjectLists ? 0 : i+1), len2 = objects2.length;j<len2;++j) {

            if ( sameObjectLists || (objects1[i].id != objects2[j].id) ) {

                if ( func(objects1[i], objects2[j], extraParam) ) {
                    if ( !inverted ) {
                        isTrue = true;

                        //Pick the objects
                        var objList = objectsLists1.get(objects1[i].getName());
                        if ( objList.indexOf(objects1[i]) == -1) objList.push(objects1[i]);

                        objList = objectsLists2.get(objects2[j].getName());
                        if ( objList.indexOf(objects2[j]) == -1) objList.push(objects2[j]);
                    }

                    atLeastOneObject = true;
                }

            }

        }
        if ( !atLeastOneObject && inverted ) { //The object is not overlapping any other object.
            isTrue = true;

            //We are sure that objects1[i] is not already in the list.
            //(As we are iterating over objects1 and only objects1 are added )
            objectsLists1.get(objects1[i].getName()).push(objects1[i]);
        }

    }

    return isTrue;*/
}

gdjs.evtTools.object.hitBoxesCollisionTest = function( objectsLists1, objectsLists2, inverted, runtimeScene) {

    if ( inverted )
        return gdjs.evtTools.object.TwoListsTest(gdjs.runtimeObject.collisionTest,
                                                     objectsLists1, objectsLists2, inverted);

    var objects1NameId = [];
    var objects2NameId = [];
    var objects1Values = objectsLists1.values();
    var objects2Values = objectsLists2.values();
    
    for(var i = 0, leni = objects1Values.length;i<leni;++i) {
        var arr = objects1Values[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
        
        if ( objects1Values[i].length !== 0 ) {
            objects1NameId.push(objects1Values[i][0].getNameId());
        }
    }
    
    for(var i = 0, leni = objects2Values.length;i<leni;++i) {
        var arr = objects2Values[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
        
        if ( objects2Values[i].length !== 0 ) {
            objects2NameId.push(objects2Values[i][0].getNameId());
        }
    }

    var isTrue = false;

    //Search all the pairs colliding.
    runtimeScene.setCollidingObjectsAsPicked(objects1NameId, objects2NameId);

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
        
        if ( finalSize !== 0 ) isTrue = true;
    }
    
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
        
        if ( finalSize !== 0 ) isTrue = true;
    }
    
    return isTrue;

}

gdjs.evtTools.object.distanceTest = function( objectsLists1, objectsLists2, distance, inverted) {

    distance *= distance;
    return gdjs.evtTools.object.TwoListsTest(gdjs.runtimeObject.distanceTest, objectsLists1,
        objectsLists2, inverted, distance);
}


gdjs.evtTools.object.movesTowardTest = function( objectsLists1, objectsLists2, tolerance, inverted) {

    var movesTowardTestInner = function(obj1, obj2) {

        if ( obj1.hasNoForces() ) return false;

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        console.log(Math.abs(objAngle-obj1.getAverageForce().getAngle()));
        return Math.abs(objAngle-obj1.getAverageForce().getAngle()) <= tolerance/2;
    }

    return gdjs.evtTools.object.TwoListsTest(movesTowardTestInner, objectsLists1, objectsLists2, inverted);
}

gdjs.evtTools.object.turnedTowardTest = function( objectsLists1, objectsLists2, tolerance, inverted) {

    var turnedTowardTestInner = function(obj1, obj2) {

        if ( obj1.hasNoForces() ) return false;

        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;

        console.log(Math.abs(objAngle-obj1.getAverageForce().getAngle()));
        return Math.abs(objAngle-obj1.getAngle()) <= tolerance/2;
    }

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
        var id = Math.round(Math.random()*(objects.length-1));
        var theChosenOne = objects[id];

        objectsLists.get(theChosenOne.getName()).push(theChosenOne);
    }

    return true;
}
/**
 * Do the work of creating a new object
 * @private
 */
gdjs.evtTools.object.doCreateObjectOnScene = function(runtimeScene, objectName, objectsLists, x, y, layer) {

    //Find the object to create
    var obj = null;
    $(runtimeScene.getInitialObjectsXml()).find("Objet").each( function() {
        if ( $(this).attr("nom") === objectName ) {
            obj = gdjs.getObjectConstructor($(this).attr("type"))(runtimeScene, $(this));
            return false;
        }
    });
    if ( obj == null ) {
        $(runtimeScene.getGame().getInitialObjectsXml()).find("Objet").each( function() {
            if ( $(this).attr("nom") === objectName ) {
                obj = gdjs.getObjectConstructor($(this).attr("type"))(runtimeScene, $(this));
                return false;
            }
        });
    }

    //Add it to the scene
    if ( obj != null ) {
        obj.setPosition(x,y);
        obj.setLayer(layer);
        runtimeScene.addObject(obj);

        //Let the new object be picked by next actions/conditions.
        if ( objectsLists.containsKey(objectName) ) {
            objectsLists.get(objectName).push(obj);
        }
    }
}

/**
 * Allows events to create a new object on a scene.
 * @private
 */
gdjs.evtTools.object.createObjectOnScene = function(runtimeScene, objectsLists, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(runtimeScene, objectsLists.keys()[0], objectsLists, x, y, layer);
}

/**
 * Allows events to create a new object on a scene.
 * @private
 */
gdjs.evtTools.object.createObjectFromGroupOnScene = function(runtimeScene, objectsLists, objectName, x, y, layer) {
    gdjs.evtTools.object.doCreateObjectOnScene(runtimeScene, objectName, objectsLists, x, y, layer);
}

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
}
