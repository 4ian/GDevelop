
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
            variable.setValue($(this).attr("Value"));
            my.variables.put($(this).attr("Name"), variable);
            console.log("Init var"+$(this).attr("Name")+" to "+$(this).attr("Value"));
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
