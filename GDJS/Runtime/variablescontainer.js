
/**
 * The variablesContainer stores variables for a runtimeScene or a runtimeObject.
 * @class variablesContainer
 * @constructor
 * @param initialVariables Optional xml structure containing initial variables.
 */
gdjs.variablesContainer = function(initialVariablesXml)
{
    var that = {};
    var my = {};
    
    my.variables = new Hashtable();
    my.unknownVariable = gdjs.variable();
    
    if ( initialVariablesXml != undefined ) {
        $(initialVariablesXml).find("Variable").each( function() { 
            
            var variable = gdjs.variable();
            var initialValue = $(this).attr("Value")
            //Try to guess the type of the value, as GD has no way ( for now ) to specify
            //the type of a variable.
            if(Math.round(initialValue) == initialValue) {  //Number
                variable.setValue(parseFloat(initialValue));
            }
            else { //We have a string.
                variable.setValue(initialValue);
            }
            
            my.variables.put($(this).attr("Name"), variable);
        });
    }
    
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
