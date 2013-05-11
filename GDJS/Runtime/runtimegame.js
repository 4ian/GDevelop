
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
     * @method getVariables
     * @return a variablesContainer object.
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Get the XML object associated to the game
     * @method getXml
     * @return The XML structure associated to the game, which can be parsed with jQuery.
     */
    that.getXml = function() {
        return my.xml;
    }
    
    /**
     * Get the XML structure representing all the initial objects of the game.
     * @method getInitialObjectsXml
     * @return The XML structure associated to the initial objects, which can be parsed with jQuery.
     */
    that.getInitialObjectsXml = function() {
        return $(my.xml).find("Objets");
    }
    
    /**
     * Should be called whenever a key is pressed
     * @method onKeyPressed
     * @param keyCode {Number} The key code associated to the key press.
     */
    that.onKeyPressed = function(keyCode) {
        my.pressedKeys.put(keyCode, true);
    }
    
    /**
     * Should be called whenever a key is released
     * @method onKeyReleased
     * @param keyCode {Number} The key code associated to the key release.
     */
    that.onKeyReleased = function(keyCode) {
        my.pressedKeys.put(keyCode, false);
    }
    
    /**
     * Return true if the key corresponding to keyCode is pressed.
     * @method isKeyPressed
     * @param keyCode {Number} The key code to be tested.
     */
    that.isKeyPressed = function(keyCode) {
        return my.pressedKeys.containsKey(keyCode) && my.pressedKeys.get(keyCode);
    }
    
    /**
     * Return true if any key is pressed
     * @method anyKeyPressed
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
     * Should be called when the mouse is moved.<br>
     * Please note that the coordinates must be expressed relative to the view position.
     *
     * @method onMouseMove
     * @param x {Number} The mouse new X position
     * @param y {Number} The mouse new Y position
     */
    that.onMouseMove = function(x,y) {
        my.mouseX = x;
        my.mouseY = y;
    }
    
    /**
     * Get the mouse X position
     *
     * @method getMouseX
     * @return the mouse X position, relative to the game view.
     */
    that.getMouseX = function() {
        return my.mouseX;
    }
    
    /**
     * Get the mouse Y position
     *
     * @method getMouseY
     * @return the mouse Y position, relative to the game view.
     */
    that.getMouseY = function() {
        return my.mouseY;
    }
    
    return that;
}