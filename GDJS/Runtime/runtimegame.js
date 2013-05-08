
/**
 * The runtimeGame object represents a game being played.
 *
 * @class runtimeGame 
 */
gdjs.runtimeGame = function(xml)
{
    var that = {};
    var my = {};
    
    my.variables = gdjs.variablesContainer();
    my.xml = xml;
    
    /**
     * Get the variables of the runtimeGame.
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Get the XML object associated to the game
     */
    that.getXml = function() {
        return my.xml;
    }
    
    return that;
}