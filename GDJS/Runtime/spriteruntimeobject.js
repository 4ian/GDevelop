
/**
 * The spriteRuntimeObject represents an object that can display images.
 * @class spriteRuntimeObject
 * @extends runtimeObject
 */
gdjs.spriteRuntimeObject = function(runtimeScene, objectXml)
{
    var that = gdjs.runtimeObject(runtimeScene, objectXml);
    var my = {};
    
    var image = $(objectXml).find("Animations").find("Animation").find("Direction").find("Sprites").find("Sprite").attr("image");
    console.log("Loading from"+image);
    image = image ||"bunny.png"
    
    my.texture = PIXI.Texture.fromImage(image);
    my.bunny = new PIXI.Sprite(my.texture);
    
    my.bunny.anchor.x = 0.5;
    my.bunny.anchor.y = 0.5;   
    that.opacity = 255;
    
    runtimeScene.getPIXIStage().addChild(my.bunny);
    
    /**
     * Called when the object is removed from a scene.
     *
     * @method removeFromScene
     * @param runtimeScene The scene that used to own the object.
     */
    that.removeFromScene = function(runtimeScene) {
        runtimeScene.getPIXIStage().removeChild(my.bunny);
    }
    
    that.setX = function(x) {
        that.x = x;
        my.bunny.position.x = x;
    }
    
    that.setY = function(y) {
        that.y = y;
        my.bunny.position.y = y;
    }
    
    that.setAngle = function(angle) {
        that.angle = angle;
        my.bunny.rotation = gdjs.toRad(angle);
    }
    
    that.getAngle = function(angle) {
        return that.angle;
    }
    
    that.setBlendMode = function(newMode) {
        that.blendMode = newMode;
        my.bunny.blendMode = newMode;
    }
    
    that.getBlendMode = function() {
        return that.blendMode;
    }
    
    that.setOpacity = function(opacity) {
        that.opacity = opacity;
        my.bunny.alpha = opacity/255;
    }
    
    that.getOpacity = function() {
        return that.opacity;
    }
    
    that.hide = function(enable) {
        my.hidden = enable;
        my.bunny.visible = !enable;
    }
    
    that.getWidth = function() {
        return my.bunny.width;
    }
    
    that.getHeight = function() {
        return my.bunny.height;
    }
    
    
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
        runtimeScene.getPIXIStage().removeChild(my.bunny);
    }
    
    return that;
}