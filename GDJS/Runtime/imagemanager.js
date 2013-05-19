
/**
 * The imageManager stores textures that can be used by the objects
 *
 * @class imageManager
 * @param runtimeGame The runtimeGame to be imageManager belongs to.
 */
gdjs.imageManager = function(runtimeGame)
{
    var that = {};
    var my = {};
    
    my.game = runtimeGame;
    my.invalidTexture = PIXI.Texture.fromImage("bunny.png"); //TODO
    my.loadedTextures = new Hashtable();
    
    that.getPIXITexture = function(name) {
        if ( my.loadedTextures.containsKey(name) ) {
            return my.loadedTextures.get(name);
        }
        if ( name == "" ) {
            return my.invalidTexture;
        }
        
        var resources = $(my.game.getXml()).find("Resources").find("Resources");
        if ( resources ) {
            var texture = null;
            resources.find("Resource").each( function() { 
                if ( $(this).attr("name") === name &&
                     $(this).attr("kind") === "image" ) {
                    
                    texture = PIXI.Texture.fromImage($(this).attr("file"));
                    return false;
                }
            });
            
            if ( texture != null ) {
                console.log("Loaded texture \""+name+"\".");
                my.loadedTextures.put(name, texture);
                return texture;
            }
        }
        
        console.warn("Unable to find texture \""+name+"\".");
        return my.invalidTexture;
    }

    that.getInvalidPIXITexture = function() {
        return my.invalidTexture;
    }
    
    return that;
}