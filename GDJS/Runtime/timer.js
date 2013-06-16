/**
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Represents a timer which must be updated manually.
 *
 * @class timer
 * @constructor
 */
gdjs.timer = function(name)
{
    var that = {};
    var my = {};
    
    my.name = name;
    my.time = 0;
    my.paused = false;
    
    /**
     * Get the name of the timer
     * @method getName
     * @return {String} The name of the timer
     */
    that.getName = function() {
        return my.name;
    }
    
    /**
     * Get the time elapsed
     * @method getTime
     * @return {String} The time of the timer
     */
    that.getTime = function() {
        return my.time;
    }
    
    /**
     * Notify the timer that some time elapsed.
     * @method updateTime
     */
    that.updateTime = function(time) {
        if ( !my.paused ) my.time += time;
    }
    
    /**
     * Change the time.
     * @method setTime
     */
    that.setTime = function(time) {
        my.time = time;
    }
    
    /**
     * Set time to zero.
     * @method reset
     */
    that.reset = function(time) {
        that.setTime(0);
    }
    
    /**
     * Set if the timer is paused.
     * @method setPaused
     */
    that.setPaused = function(enable) {
        my.paused = enable;
    }
    
    /**
     * Check if the timer is paused.
     * @method isPaused
     */
    that.isPaused = function() {
        return my.paused;
    }
    
    return that;
}