
/**
 * variable is an object storing a number or a string
 * @class variable
 */
gdjs.variable = function()
{
    var that = {};
    var my = {};
    
    my.value = 0;
    
    that.getValue = function() {
        return my.value;
    }
    
    that.setValue = function(newValue) {
        my.value = newValue;
    }
    
    return that;
}