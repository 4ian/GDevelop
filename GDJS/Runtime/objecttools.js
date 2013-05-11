/**
 * @module gdjs.objectTools
 */
gdjs.objectTools = gdjs.objectTools || {};

gdjs.objectTools.hitBoxesCollisionTest = function( firstObjName, secondObjName, objectsLists1, objectsLists2, inverted) {
    var objects1 = [];
    var objects2 = [];
    var objects1Values = objectsLists1.values();
    var objects2Values = objectsLists2.values();
    var sameObjectLists = firstObjName === secondObjName;
    
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
        
            if ( objects1[i].getUniqueId() != objects2[j].getUniqueId() ) {                
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
                    atLeastOneObject = true;
                    if ( !inverted ) {
                    
                        isTrue = true;
                        
                        if ( !objectsLists1.containsKey(objects1[i].getName()) )
                            objectsLists1.put(objects1[i].getName(), []);
                            
                        objectsLists1.get(objects1[i].getName()).push(objects1[i]);
                        
                        if ( !objectsLists2.containsKey(objects2[j].getName()) )
                            objectsLists2.put(objects2[j].getName(), []);
                            
                        objectsLists2.get(objects2[j].getName()).push(objects2[j]);
                    } 
                }
                
            }
            
        }
        if ( !atLeastOneObject && inverted ) { //The object is not overlapping any other object.
        
            isTrue = true;
            
            if ( !objectsLists1.containsKey(objects1[i].getName()) )
                objectsLists1.put(objects1[i].getName(), []);
                
            objectsLists1.get(objects1[i].getName()).push(objects1[i]);
        } 
    
    }
    
    return isTrue;
}
