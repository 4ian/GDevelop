
/**
 * A force is used to move objects
 *
 * @class force 
 */
gdjs.force = function(x,y, isTemporary)
{
    var that = {};
    var my = {};
    
    my.x = x || 0;
    my.y = y || 0;
    my.angle = Math.atan2(y,x);
    my.length = Math.sqrt(x*x+y*y);
    my.dirty = false;
    my.temporary = !!isTemporary;
    
    that.getX = function() {
        return my.x;
    }
    
    that.getY = function() {
        return my.y;
    }

    that.setX = function(x) {
        my.x = x;
        my.dirty = true;
    }
    
    that.setY = function(y) {
        my.y = y;
        my.dirty = true;
    }
    
    that.setAngle = function(angle) {
    
        if ( my.dirty ) {
            my.length = Math.sqrt(x*x+y*y);
            my.dirty = false;
        }
        
        my.angle = angle;
        my.x = Math.cos(angle/180*3.14159)*my.length;
        my.y = Math.sin(angle/180*3.14159)*my.length;
    }
    
    that.setLength = function(len) {
    
        if ( my.dirty ) {
            my.angle = Math.atan2(y,x);
            my.dirty = false;
        }
        
        my.length = len;
        my.x = Math.cos(angle/180*3.14159)*my.length;
        my.y = Math.sin(angle/180*3.14159)*my.length;
    }
    
    that.getAngle = function() {
        if ( my.dirty ) {
            my.angle = Math.atan2(y,x)*180/3.14159;
            my.length = Math.sqrt(x*x+y*y);
            
            my.dirty = false;
        }
    
        return my.angle;
    }
    
    that.getLength = function() {
        if ( my.dirty ) {
            my.angle = Math.atan2(y,x)*180/3.14159;
            my.length = Math.sqrt(x*x+y*y);
            
            my.dirty = false;
        }
    
        return my.length;
    }
    
    that.isTemporary = function() {
        return my.temporary;
    }
    
    that.setTemporary = function(enable) {
        my.temporary = !!enable;
    }

    return that;
}