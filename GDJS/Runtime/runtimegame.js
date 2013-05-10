
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
    my.pressedKeys = new Hashtable();
    my.mouseX = 0;
    my.mouseY = 0;
    
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
    
    /**
     * Get the XML structure representing all the initial objects of the game.
     */
    that.getInitialObjectsXml = function() {
        return $(my.xml).find("Objets");
    }
    
    /**
     * Should be called whenever a key is pressed
     */
    that.onKeyPressed = function(keyCode) {
        my.pressedKeys.put(keyCode, true);
    }
    
    /**
     * Should be called whenever a key is released
     */
    that.onKeyReleased = function(keyCode) {
        my.pressedKeys.put(keyCode, false);
    }
    
    /**
     * Return true if the key corresponding to keyCode is pressed.
     */
    that.isKeyPressed = function(keyCode) {
        return my.pressedKeys.containsKey(keyCode) && my.pressedKeys.get(keyCode);
    }
    
    /**
     * Return true if any key is pressed
     */
    that.anyKeyPressed = function(keyCode) {
        var allKeys = my.pressedKeys.entries();
        
        for(var i = 0, len = allKeys.length;i<len;++i) {
            if (allKeys[i][1]) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Should be called when the mouse moved
     */
    that.onMouseMove = function(x,y) {
        my.mouseX = x;
        my.mouseY = y;
    }
    
    /**
     * Get the mouse X position
     */
    that.getMouseX = function() {
        return my.mouseX;
    }
    
    /**
     * Get the mouse Y position
     */
    that.getMouseY = function() {
        return my.mouseY;
    }
    
    return that;
}