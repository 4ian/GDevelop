/**
 * @module gdjs.objectTools
 */
gdjs.objectTools = gdjs.objectTools || {};

gdjs.objectTools.hitBoxesCollisionTest = function( objectsLists1, objectsLists2, inverted) {
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
    
    var isTrue = false;
    
    for(var i = 0, len1 = objects1.length;i<len1;++i) {
    
        var atLeastOneObject = false;
        for(var j = (!sameObjectLists ? 0 : i+1), len2 = objects2.length;j<len2;++j) {
        
            if ( sameObjectLists || (objects1[i].getUniqueId() != objects2[j].getUniqueId()) ) {                
                var collision = false;
                
                var hitBoxes1 = objects1[i].getHitBoxes();
                var hitBoxes2 = objects2[j].getHitBoxes();
                for(var k = 0, lenBoxes1 = hitBoxes1.length;k<lenBoxes1;++k) {
                    for(var l = 0, lenBoxes2 = hitBoxes2.length;l<lenBoxes2;++l) {
                        if ( gdjs.polygon.collisionTest(hitBoxes1[k], hitBoxes2[l]).collision ){
                            collision = true;
                            break;
                        }
                    }
                    if ( collision ) 
                        break;
                }
                
                if ( collision ) {
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
