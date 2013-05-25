
/**
 * A frame used by a spriteAnimation in a spriteRuntimeObject.
 *
 * <b>TODO</b> : Center and origin loading.
 *
 * @class spriteAnimationFrame
 * @constructor
 */
gdjs.spriteAnimationFrame = function(imageManager, frameXml)
{
    var that = {};
    
    that.image = frameXml ? $(frameXml).attr("image") : "";
    that.pixiTexture = imageManager.getPIXITexture(that.image);
    that.points = new Hashtable();
    that.center = { x:that.pixiTexture.width/2, y:that.pixiTexture.height/2 };
    that.origin = { x:0, y:0 };
    
    if ( frameXml ) {
        $(frameXml).find("Points").find("Point").each( function() {
            //console.log("point:"+$(this).attr("nom"));
            var point = {x:parseFloat($(this).attr("X")), y:parseFloat($(this).attr("X"))};
            that.points.put($(this).attr("nom"), point);
        });  
    }
    
    return that;
}

/**
 * Represents an animation of a spriteRuntimeObject.
 *
 * @class spriteAnimation
 * @constructor
 */
gdjs.spriteAnimation = function(imageManager, animationXml)
{
    var direction = function(imageManager, directionXml) {
        
        var that = {};
        
        that.timeBetweenFrames = directionXml ? parseFloat($(directionXml).attr("tempsEntre")) :
                                 1.0;
        that.loop = directionXml ? $(directionXml).attr("boucle") == "true" : false;
        that.frames = [];
    
        if ( directionXml != undefined ) {
            $(directionXml).find("Sprites").find("Sprite").each( function() {
                that.frames.push(gdjs.spriteAnimationFrame(imageManager, $(this)));
            });
        }
        
        return that;
    }

    var that = {};
    var my = {};
    
    that.directions = [];
    that.hasMultipleDirections = animationXml ? $(animationXml).attr("typeNormal") == "true" : false;
    
    if ( animationXml != undefined ) {
        $(animationXml).find("Direction").each( function() {
            var direc = direction(imageManager, $(this));
            that.directions.push(direc);
        });
    }
    
    return that;
}

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
    
    my.animations = [];
    my.currentAnimation = 0;
    my.currentDirection = 0;
    my.currentFrame = 0;
    my.frameElapsedTime = 0;
    my.scaleX = 1;
    my.scaleY = 1;
    my.blendMode = 0;
    that.opacity = 255;
    if ( objectXml ) {
        $(objectXml).find("Animations").find("Animation").each( function() {
            var anim = gdjs.spriteAnimation(runtimeScene.getGame().getImageManager(), $(this));
            my.animations.push(anim);
        });
    }
    
    //PIXI sprite creation
    my.animationFrame = null;
    my.spriteDirty = true; 
    my.textureDirty = true; 
    my.sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getInvalidPIXITexture());
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
    
    that.setAnimation = function(newAnimation) {
        if ( newAnimation < my.animations.length ) {
            my.currentAnimation = newAnimation;
            my.currentFrame = 0;
            my.frameElapsedTime = 0;
            my.spriteDirty = true; 
        }
    }
    
    that.getAnimation = function() {
        return my.currentAnimation;
    }
    
    that.setDirectionOrAngle = function(newValue) { 
        if ( my.currentAnimation >= my.animations.length ) {
            return;
        }
        
        var anim = my.animations[my.currentAnimation];
        if ( !anim.hasMultipleDirections ) {
            that.angle = newValue;
            my.spriteDirty = true;
        }
        else {
            if (newValue === my.currentDirection || 
                newValue >= anim.directions.length ||
                anim.directions[newValue].frames.length === 0)
                return;
                
            my.currentDirection = newValue;
            my.currentFrame = 0;
            my.frameElapsedTime = 0;
        
            my.spriteDirty = true;
        }
    }
    
    that.getDirectionOrAngle = function() {
        if ( my.currentAnimation >= my.animations.length ) {
            return 0;
        }
        
        if ( !my.animations[my.currentAnimation].hasMultipleDirections ) {
            return that.angle;
        }
        else {
            return my.currentDirection;
        }
    }
    
    that.setAnimationFrame = function(newFrame) {
        if ( my.currentAnimation >= my.animations.length ||
             my.currentDirection >= my.animations[my.currentAnimation].directions.length) {
            return;
        }
        var direction = my.animations[my.currentAnimation].directions[my.currentDirection];
        
        if ( newFrame < direction.frames.length ) {
            my.currentFrame = newFrame;
            my.textureDirty = true; 
        }
    }
    
    that.getAnimationFrame = function() {
        return my.currentFrame;
    }
    
    /**
     * Update the internal PIXI.Sprite position, angle...
     */
    my.updatePIXISprite = function() {
        
        my.sprite.anchor.x = my.animationFrame.center.x/my.sprite.texture.width;
        my.sprite.anchor.y = my.animationFrame.center.y/my.sprite.texture.height;
        my.sprite.position.x = that.x + (my.animationFrame.center.x - my.animationFrame.origin.x)*my.scaleX;
        my.sprite.position.y = that.y + (my.animationFrame.center.y - my.animationFrame.origin.y)*my.scaleY;
        my.sprite.rotation = gdjs.toRad(that.angle);
        my.sprite.visible = !that.hidden;
        my.sprite.blendMode = my.blendMode;
        my.sprite.alpha = that.opacity/255;
        my.sprite.scale.x = my.scaleX;
        my.sprite.scale.y = my.scaleY;
        
        my.spriteDirty = false;
    }
    
    /**
     * Update the internal texture of the PIXI sprite.
     */
    my.updatePIXITexture = function() {
        if ( my.currentAnimation >= my.animations.length ||
             my.currentDirection >= my.animations[my.currentAnimation].directions.length) {
            return;
        }
        var direction = my.animations[my.currentAnimation].directions[my.currentDirection];
        
        my.animationFrame = direction.frames[my.currentFrame];
        my.sprite.setTexture(my.animationFrame.pixiTexture);
        my.spriteDirty = true;
    }
    
    my.updatePIXITexture();
    
    /**
     * Update the current frame according to the elapsed time.
     * @method updateTime
     */
    that.updateTime = function(elapsedTime) {
        var oldFrame = my.currentFrame;
        my.frameElapsedTime += elapsedTime;
        
        if ( my.currentAnimation >= my.animations.length ||
             my.currentDirection >= my.animations[my.currentAnimation].directions.length) {
            return;
        }
        
        var direction = my.animations[my.currentAnimation].directions[my.currentDirection];
        
        if ( my.frameElapsedTime > direction.timeBetweenFrames ) {
            var count = Math.floor(my.frameElapsedTime / direction.timeBetweenFrames);
            my.currentFrame += count;
            my.frameElapsedTime = Math.max(my.frameElapsedTime-count*direction.timeBetweenFrames, 0);
        }
        
        if ( my.currentFrame >= direction.frames.length ) {
            my.currentFrame = direction.loop ? my.currentFrame % direction.frames.length : direction.frames.length-1;
        }
        
        if ( oldFrame != my.currentFrame || my.textureDirty ) my.updatePIXITexture();
        if ( my.spriteDirty ) my.updatePIXISprite();
    }
    
    that.getPointX = function(name) {
        if ( my.animationFrame.points.containsKey(name) ) {
            var point = my.animationFrame.points.get(name);
            
            return point.x*my.scaleX+that.getX(); //TODO
        }
        
        return that.getX();
    }
    
    that.getPointY = function(name) {
        if ( my.animationFrame.points.containsKey(name) ) {
            var point = my.animationFrame.points.get(name);
            
            return point.y*my.scaleY+that.getY(); //TODO
        }
        
        return that.getY();
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
        if ( my.currentAnimation >= my.animations.length ) {
            return;
        }
        
        if ( !my.animations[my.currentAnimation].hasMultipleDirections ) {
            that.angle = angle;
        }
        else {
            angle = angle % 360;
            if ( angle < 0 ) angle += 360;
            that.setDirectionOrAngle(Math.round(angle/45) % 8);
        }
        
        my.spriteDirty = true;
    }
    
    that.getAngle = function(angle) {
        if ( my.currentAnimation >= my.animations.length ) {
            return;
        }
        
        if ( !my.animations[my.currentAnimation].hasMultipleDirections )
            return that.angle;
        else
            return my.currentDirection*45;
    }
    
    that.setBlendMode = function(newMode) {
        my.blendMode = newMode;
        my.spriteDirty = true;
    }
    
    that.getBlendMode = function() {
        return my.blendMode;
    }
    
    that.setOpacity = function(opacity) {
        that.opacity = opacity;
        my.spriteDirty = true;
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
    
    that.setScaleX = function(newScale) {
        if ( newScale > 0 ) my.scaleX = newScale;
        my.spriteDirty = true;
    }
    
    that.setScaleY = function(newScale) {
        if ( newScale > 0 ) my.scaleY = newScale;
        my.spriteDirty = true;
    }
    
    that.getScaleY = function() {
        return my.scaleY;
    }
    
    that.getScaleX = function() {
        return my.scaleX;
    }
    
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
        runtimeScene.getLayer(that.layer).getPIXIContainer().removeChild(my.sprite);
    }
    
    return that;
}


    /*
    my.updatePIXISpriteTexture = function() {
        if ( my.currentAnimation >= my.animations.length ||
             my.currentDirection >= my.animations[my.currentAnimation].directions.length) {
            return;
        }
        
        var direction = my.animations[my.currentAnimation].directions[my.currentDirection];
        if ( my.currentFrame >= direction.frames.length ) {
            return;
        }
        var frame = direction.frames[my.currentFrame];
    
        my.sprite.texture = runtimeScene.getGame().getImageManager().getPIXITexture(frame.image);
    }*/