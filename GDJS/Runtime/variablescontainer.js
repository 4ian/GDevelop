
/**
 * The variablesContainer stores variables for a runtimeScene or a runtimeObject.
 * @class variablesContainer
 */
gdjs.variablesContainer = function()
{
    var that = {};
    var my = {};
    
    my.variables = new Hashtable();
    my.unknownVariable = gdjs.variable();
    
    that.add = function(name, variable) {
        my.variables.put(name, variable);
    }
    
    that.remove = function(name) {
        my.variables.remove(name);
    }
    
    that.get = function(name) {
        if ( !my.variables.containsKey(name) ) {
            my.variables.put(name, gdjs.variable());
        }
        
        return my.variables.get(name);
    }
    
    that.has = function(name) {
        return my.variables.containsKey(name);
    }

    return that;
}