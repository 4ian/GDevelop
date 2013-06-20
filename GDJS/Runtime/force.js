/*
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * A force is used to move objects.
 *
 * @namespace gdjs
 * @class force
 * @constructor
 * @param x The initial x component
 * @param y The initial y component
 * @param isTemporary true if the force must be temporary
 */
gdjs.force = function(x,y, isTemporary)
{
    var that = {};
    var my = {};

    my.x = x || 0;
    my.y = y || 0;
    my.angle = Math.atan2(y,x)*180/3.14159;
    my.length = Math.sqrt(x*x+y*y);
    my.dirty = false;
    my.temporary = !!isTemporary;

    /**
     * Returns the X component of the force.
     * @method getX
     */
    that.getX = function() {
        return my.x;
    }

    /**
     * Returns the Y component of the force.
     * @method getY
     */
    that.getY = function() {
        return my.y;
    }

    /**
     * Set the x component of the force.
     * @method setX
     * @param x {Number} The new X component
     */
    that.setX = function(x) {
        my.x = x;
        my.dirty = true;
    }

    /**
     * Set the y component of the force.
     * @method setY
     * @param y {Number} The new Y component
     */
    that.setY = function(y) {
        my.y = y;
        my.dirty = true;
    }

    /**
     * Set the angle of the force.
     * @method setAngle
     * @param angle {Number} The new angle
     */
    that.setAngle = function(angle) {

        if ( my.dirty ) {
            my.length = Math.sqrt(x*x+y*y);
            my.dirty = false;
        }

        my.angle = angle;
        my.x = Math.cos(angle/180*3.14159)*my.length;
        my.y = Math.sin(angle/180*3.14159)*my.length;
    }

    /**
     * Set the length of the force.
     * @method setLength
     * @param len {Number} The length
     */
    that.setLength = function(len) {

        if ( my.dirty ) {
            my.angle = Math.atan2(my.y, my.x)*180/3.14159;
            my.dirty = false;
        }

        my.length = len;
        my.x = Math.cos(angle/180*3.14159)*my.length;
        my.y = Math.sin(angle/180*3.14159)*my.length;
    }

    /**
     * Get the angle of the force
     * @method getAngle
     */
    that.getAngle = function() {
        if ( my.dirty ) {
            my.angle = Math.atan2(y,x)*180/3.14159;
            my.length = Math.sqrt(x*x+y*y);

            my.dirty = false;
        }

        return my.angle;
    }


    /**
     * Get the length of the force
     * @method getLength
     */
    that.getLength = function() {
        if ( my.dirty ) {
            my.angle = Math.atan2(y,x)*180/3.14159;
            my.length = Math.sqrt(x*x+y*y);

            my.dirty = false;
        }

        return my.length;
    }

    /**
     * Return true if the force is temporary, false if it is permanent.
     * @method isTemporary
     */
    that.isTemporary = function() {
        return my.temporary;
    }

    /**
     * Set if the force is temporary or not.
     * @method setTemporary
     * @param enable {Boolean} true if the force must be temporary
     */
    that.setTemporary = function(enable) {
        my.temporary = !!enable;
    }

    return that;
}
