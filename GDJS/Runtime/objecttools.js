/**
 * @module gdjs.objectTools
 */
gdjs.objectTools = gdjs.objectTools || {};

/**
 * Do a test on two tables of objects so as to remove the objects for which the test is false.
 * If inverted == true, only the objects of the first table are filtered.
 */
gdjs.objectTools.TwoListsTest = function(func, objectsLists1, objectsLists2, inverted) {
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
        
            if ( sameObjectLists || (objects1[i].getUniqueId() != objects2[j].getUniqueId()) ) {                

                if ( func(objects1[i], objects2[j]) ) {
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
    
    return isTrue;
}

gdjs.objectTools.hitBoxesCollisionTest = function( objectsLists1, objectsLists2, inverted) {
    return gdjs.objectTools.TwoListsTest(gdjs.runtimeObject.collisionTest,
                                         objectsLists1, objectsLists2, inverted);
}

gdjs.objectTools.distanceTest = function( objectsLists1, objectsLists2, distance, inverted) {
    
    distance *= distance;
    
    var distanceTest = function(obj1, obj2) {
        var x = obj1.getX()+obj1.getCenterX()-(obj2.getX()+obj2.getCenterX());
        var y = obj1.getY()+obj1.getCenterY()-(obj2.getY()+obj2.getCenterY());
        
        return x*x+y*y <= distance;
    }

    return gdjs.objectTools.TwoListsTest(distanceTest, objectsLists1, objectsLists2, inverted);
}


gdjs.objectTools.movesTowardTest = function( objectsLists1, objectsLists2, tolerance, inverted) {
    
    var movesTowardTestInner = function(obj1, obj2) {
    
        if ( obj1.hasNoForces() ) return false;
        
        var objAngle = Math.atan2(obj2.getY()+obj2.getCenterY() - (obj1.getY()+obj1.getCenterY()),
                                  obj2.getX()+obj2.getCenterX() - (obj1.getX()+obj1.getCenterX()));
        objAngle *= 180/3.14159;
        
        console.log(Math.abs(objAngle-obj1.getAverageForce().getAngle()));
        return Math.abs(objAngle-obj1.getAverageForce().getAngle()) <= tolerance/2;
    }

    return gdjs.objectTools.TwoListsTest(movesTowardTestInner, objectsLists1, objectsLists2, inverted);
}

gdjs.objectTools.pickAllObjects = function(runtimeScene, objectsLists) {
    
    var entries = objectsLists.entries();
    for(var i = 0, len = entries.length;i<len;++i) {
        var allObjects = runtimeScene.getObjects(entries[i][0]);
        var objectsList = entries[i][1];
        objectsList.length = 0;
        objectsList.push.apply(objectsList, allObjects);
    }
    
    return true;
}

gdjs.objectTools.pickRandomObject = function(runtimeScene, objectsLists) {
    
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
gdjs.objectTools.doCreateObjectOnScene = function(runtimeScene, objectName, objectsLists, x, y, layer) {

    //Find the object to create
    var obj = null;
    $(runtimeScene.getInitialObjectsXml()).find("Objet").each( function() { 
        if ( $(this).attr("nom") === objectName && $(this).attr("type") === "Sprite" /*TODO*/ ) {
            obj = gdjs.spriteRuntimeObject(runtimeScene, $(this));
            return false;
        }
    });
    if ( obj == null ) {
        $(runtimeScene.getGame().getInitialObjectsXml()).find("Objet").each( function() { 
            if ( $(this).attr("nom") === objectName && $(this).attr("type") === "Sprite" /*TODO*/ ) {
                obj = gdjs.spriteRuntimeObject(runtimeScene, $(this));
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
 */
gdjs.objectTools.createObjectOnScene = function(runtimeScene, objectsLists, x, y, layer) {
    gdjs.objectTools.doCreateObjectOnScene(runtimeScene, objectsLists.keys()[0], objectsLists, x, y, layer);
}

/**
 * Allows events to create a new object on a scene.
 */
gdjs.objectTools.createObjectFromGroupOnScene = function(runtimeScene, objectsLists, objectName, x, y, layer) {
    gdjs.objectTools.doCreateObjectOnScene(runtimeScene, objectName, objectsLists, x, y, layer);
}

gdjs.objectTools.pickedObjectsCount = function(objectName, objectsLists) {
    if ( objectsLists.containsKey(objectName) ) {
        return objectsLists.get(objectName).length;
    }
}