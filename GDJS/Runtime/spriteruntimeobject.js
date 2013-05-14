
/**
 * The spriteRuntimeObject represents an object that can display images.
 *
 * <b>TODO:</b> Animation support, custom collisions masks.
 *
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
    my.sprite = new PIXI.Sprite(my.texture);
    
    my.sprite.anchor.x = 0.5;
    my.sprite.anchor.y = 0.5;   
    that.opacity = 255;
    
    runtimeScene.getLayer("").getPIXIContainer().addChild(my.sprite);
    
    /**
     * Called when the object is removed from a scene.
     *
     * @method removeFromScene
     * @param runtimeScene The scene that used to own the object.
     */
    that.removeFromScene = function(runtimeScene) {
        runtimeScene.getPIXIStage().removeChild(my.sprite);
    }
    
    that.setX = function(x) {
        that.x = x;
        my.sprite.position.x = x;
    }
    
    that.setY = function(y) {
        that.y = y;
        my.sprite.position.y = y;
    }
    
    that.setAngle = function(angle) {
        that.angle = angle;
        my.sprite.rotation = gdjs.toRad(angle);
    }
    
    that.getAngle = function(angle) {
        return that.angle;
    }
    
    that.setBlendMode = function(newMode) {
        that.blendMode = newMode;
        my.sprite.blendMode = newMode;
    }
    
    that.getBlendMode = function() {
        return that.blendMode;
    }
    
    that.setOpacity = function(opacity) {
        that.opacity = opacity;
        my.sprite.alpha = opacity/255;
    }
    
    that.getOpacity = function() {
        return that.opacity;
    }
    
    that.hide = function(enable) {
        my.hidden = enable;
        my.sprite.visible = !enable;
    }
    
    that.getWidth = function() {
        return my.sprite.width;
    }
    
    that.getHeight = function() {
        return my.sprite.height;
    }
    
    that.setLayer = function(name) {
        //We need to move the object from the pixi container of the layer
        runtimeScene.getLayer(that.layer).getPIXIContainer().removeChild(my.sprite);
        that.layer = name;
        runtimeScene.getLayer(that.layer).getPIXIContainer().addChild(my.sprite);
    }
    
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
        runtimeScene.getLayer(that.layer).getPIXIContainer().removeChild(my.sprite);
    }
    
    return that;
}