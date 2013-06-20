/**
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * variable is an object storing a number or a string
 * @namespace gdjs
 * @class variable
 */
gdjs.variable = function(value)
{
    var that = {};
    var my = {};
    
    my.value = value || 0;
    
    /**
     * Get the value of the variable
     * @method getValue
     * @return {Any} The value stored
     */
    that.getValue = function() {
        return my.value;
    }
    
    /**
     * Change the value of the variable
     * @method setValue
     * @param newValue {Any} The new value to be set
     */
    that.setValue = function(newValue) {
        my.value = newValue;
    }
    
    return that;
}
