/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * variable is an object storing a number or a string
 * @namespace gdjs
 * @class variable
 */
gdjs.variable = function()
{
    var that = {};
    var my = {};
    
    my.value = 0;
    my.str = "";
    my.numberDirty = false;
    my.stringDirty = true;
    
    /**
     * Get the value of the variable, considered as a number
     * @method getAsNumber
     * @return {Any} The number stored
     */
    that.getAsNumber = function() {
        if ( my.numberDirty ) {
            my.value = parseFloat(my.str);
            my.numberDirty = false;
        }
        
        return my.value;
    }
    
    /**
     * Change the value of the variable, considered as a number
     * @method setNumber
     * @param newValue {Any} The new value to be set
     */
    that.setNumber = function(newValue) {
        my.value = newValue;
        my.stringDirty = true;
        my.numberDirty = false;
    }
    
    /**
     * Get the value of the variable, considered as a string
     * @method getAsString
     * @return {Any} The number stored
     */
    that.getAsString = function() {
        if ( my.stringDirty ) {
            my.str = my.value.toString();
            my.stringDirty = false;
        }
        
        return my.str;
    }
    
    /**
     * Change the value of the variable, considered as a string
     * @method setString
     * @param newValue {Any} The new string to be set
     */
    that.setString = function(newValue) {
        my.str = newValue;
        my.numberDirty = true;
        my.stringDirty = false;
    }
    
    that.add = function(val) {
        that.setNumber(that.getAsNumber()+val);
    }
    that.sub = function(val) {
        that.setNumber(that.getAsNumber()-val);
    }
    that.mul = function(val) {
        that.setNumber(that.getAsNumber()*val);
    }
    that.div = function(val) {
        that.setNumber(that.getAsNumber()/val);
    }
    
    that.concatenate = function(str) {
        that.setString(that.getAsString()+str);
    }
    
    return that;
}
