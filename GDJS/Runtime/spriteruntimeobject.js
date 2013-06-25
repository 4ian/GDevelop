/*
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * A frame used by a spriteAnimation in a spriteRuntimeObject.
 *
 * @namespace gdjs
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
            var point = {x:parseFloat($(this).attr("X")), y:parseFloat($(this).attr("Y"))};
            that.points.put($(this).attr("nom"), point);
        });
        var origin = $(frameXml).find("PointOrigine");
        that.origin.x = parseFloat(origin.attr("X"));
        that.origin.y = parseFloat(origin.attr("Y"));

        var center = $(frameXml).find("PointCentre");
        if ( center.attr("automatic") != "true" ) {
            that.center.x = parseFloat(center.attr("X"));
            that.center.y = parseFloat(center.attr("Y"));
        }
    }

    /**
     * Get a point of the frame.<br>
     * If the point does not exist, the origin is returned.
     *
     * @method getPoint
     * @return The requested point.
     */
    that.getPoint = function(name) {
        if ( name == "Centre" ) return that.center;
        else if ( name == "Origin" ) return that.origin;

        return that.points.containsKey(name) ? that.points.get(name) : that.origin;
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
	//Internal object representing a direction of an animation.
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
 * <b>TODO:</b> custom collisions masks.
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
	my.animationPaused = false;
    my.scaleX = 1;
    my.scaleY = 1;
    my.blendMode = 0;
    my.flippedX = false;
    my.flippedY = false;
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
    runtimeScene.getLayer("").addChildToPIXIContainer(my.sprite, that.zOrder);

    //Others intialisation and internal state management :

    /**
     *
     */
    that.extraInitializationFromInitialInstance = function(initialInstanceXml) {
        if ( $(initialInstanceXml).attr("personalizedSize") === "true" ) {
            that.setWidth(parseFloat($(initialInstanceXml).attr("width")));
            that.setHeight(parseFloat($(initialInstanceXml).attr("height")));
        }
    }

    /**
     * Update the internal PIXI.Sprite position, angle...
     */
    my.updatePIXISprite = function() {

        my.sprite.anchor.x = my.animationFrame.center.x/my.sprite.texture.frame.width;
        my.sprite.anchor.y = my.animationFrame.center.y/my.sprite.texture.frame.height;
        my.sprite.position.x = that.x + (my.animationFrame.center.x - my.animationFrame.origin.x)*Math.abs(my.scaleX);
        my.sprite.position.y = that.y + (my.animationFrame.center.y - my.animationFrame.origin.y)*Math.abs(my.scaleY);
        if ( my.flippedX ) my.sprite.position.x += (my.sprite.texture.frame.width/2-my.animationFrame.center.x)*Math.abs(my.scaleX)*2;
        if ( my.flippedY ) my.sprite.position.y += (my.sprite.texture.frame.height/2-my.animationFrame.center.y)*Math.abs(my.scaleY)*2;
        my.sprite.rotation = gdjs.toRad(that.angle);
        my.sprite.visible = !that.hidden;
        my.sprite.blendMode = my.blendMode;
        my.sprite.alpha = my.sprite.visible ? that.opacity/255 : 0; //TODO: Workaround not working property in PIXI.js
        my.sprite.scale.x = my.scaleX;
        my.sprite.scale.y = my.scaleY;
        my.cachedWidth = my.sprite.width;
        my.cachedHeight = my.sprite.height;

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
		if ( my.animationPaused ) return;

        var oldFrame = my.currentFrame;
        my.frameElapsedTime = my.frameElapsedTime+elapsedTime;

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

    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
        runtimeScene.getLayer(that.layer).removePIXIContainerChild(my.sprite);
    }

    //Animations :

    that.setAnimation = function(newAnimation) {
        if ( newAnimation < my.animations.length 
             && my.currentAnimation !== newAnimation) {
            my.currentAnimation = newAnimation;
            my.currentFrame = 0;
            my.frameElapsedTime = 0;
            my.spriteDirty = true;
            my.textureDirty = true;
            that.hitBoxesDirty = true;
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
            my.sprite.rotation = gdjs.toRad(that.angle);
            that.hitBoxesDirty = true;
        }
        else {
            if (newValue === my.currentDirection
                || newValue >= anim.directions.length
                || anim.directions[newValue].frames.length === 0
                || my.currentDirection === newValue )
                return;

            my.currentDirection = newValue;
            my.currentFrame = 0;
            my.frameElapsedTime = 0;
            that.angle = 0;

            my.spriteDirty = true;
            my.textureDirty = true;
            that.hitBoxesDirty = true;
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

	/**
	 * Return true if animation has ended.
	 */
    that.hasAnimationEnded = function() {
        if ( my.currentAnimation >= my.animations.length ||
             my.currentDirection >= my.animations[my.currentAnimation].directions.length) {
            return;
        }
		if ( my.animations[my.currentAnimation].loop ) return false;
        var direction = my.animations[my.currentAnimation].directions[my.currentDirection];

        return my.currentFrame == direction.frames.length-1;
    }

	that.animationPaused = function() {
		return my.animationPaused;
	}

	that.pauseAnimation = function() {
		my.animationPaused = true;
	}

	that.playAnimation = function() {
		my.animationPaused = false;
	}

    //Position :

    that.getPointX = function(name) {
        if ( name.length === 0 ) return that.getX();

        var pt = my.animationFrame.getPoint(name);
        var cPt = my.animationFrame.center;
        var x = pt.x;
        var y = pt.y;
        var cx = cPt.x;
        var cy = cPt.y;

        if ( my.flippedX ) {
            x = my.sprite.texture.frame.width - x;
            cx = my.sprite.texture.frame.width - cx;
        }
        if ( my.flippedY ) {
            y = my.sprite.texture.frame.height - y;
            cy = my.sprite.texture.frame.height - cy;
        }

        x *= Math.abs(my.scaleX);
        y *= Math.abs(my.scaleY);
        cx *= Math.abs(my.scaleX);
        cy *= Math.abs(my.scaleY);

        x = cx + Math.cos(that.angle/180*3.14159)*(x-cx) - Math.sin(that.angle/180*3.14159)*(y-cy);

        return x + that.getDrawableX();
    }

    that.getPointY = function(name) {
        if ( name.length === 0 ) return that.getY();

        var pt = my.animationFrame.getPoint(name);
        var cPt = my.animationFrame.center;
        var x = pt.x;
        var y = pt.y;
        var cx = cPt.x;
        var cy = cPt.y;

        if ( my.flippedX ) {
            x = my.sprite.texture.frame.width - x;
            cx = my.sprite.texture.frame.width - cx;
        }
        if ( my.flippedY ) {
            y = my.sprite.texture.frame.height - y;
            cy = my.sprite.texture.frame.height - cy;
        }

        x *= Math.abs(my.scaleX);
        y *= Math.abs(my.scaleY);
        cx *= Math.abs(my.scaleX);
        cy *= Math.abs(my.scaleY);

        y = cy + Math.sin(that.angle/180*3.14159)*(x-cx) + Math.cos(that.angle/180*3.14159)*(y-cy);

        return y + that.getDrawableY();
    }

    that.getDrawableX = function() {
        return that.x - my.animationFrame.origin.x*Math.abs(my.scaleX);
    }

    that.getDrawableY = function() {
        return that.y - my.animationFrame.origin.y*Math.abs(my.scaleY);
    }
    
    that.getCenterX = function() {
        //Just need to multiply by the scale as it is the center
        return my.animationFrame.center.x*Math.abs(my.scaleX);
    }
    
    that.getCenterY = function() {
        //Just need to multiply by the scale as it is the center
        return my.animationFrame.center.y*Math.abs(my.scaleY);
    }

    that.setX = function(x) {
        that.x = x;
        that.hitBoxesDirty = true;
        my.sprite.position.x = x;
    }

    that.setY = function(y) {
        that.y = y;
        that.hitBoxesDirty = true;
        my.sprite.position.y = y;
    }

    that.setAngle = function(angle) {
        if ( my.currentAnimation >= my.animations.length ) {
            return;
        }

        if ( !my.animations[my.currentAnimation].hasMultipleDirections ) {
            that.angle = angle;
            my.sprite.rotation = gdjs.toRad(that.angle);
            that.hitBoxesDirty = true;
        }
        else {
            angle = angle % 360;
            if ( angle < 0 ) angle += 360;
            that.setDirectionOrAngle(Math.round(angle/45) % 8);
        }
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

    //Visibility and display :

    that.setBlendMode = function(newMode) {
        my.blendMode = newMode;
        my.spriteDirty = true;
    }

    that.getBlendMode = function() {
        return my.blendMode;
    }

    that.setOpacity = function(opacity) {
        if ( opacity < 0 ) opacity = 0;
        if ( opacity > 255 ) opacity = 255;

        that.opacity = opacity;
        //TODO: Workaround a not working property in PIXI.js:
        my.sprite.alpha = my.sprite.visible ? that.opacity/255 : 0; 
    }

    that.getOpacity = function() {
        return that.opacity;
    }

    that.hide = function(enable) {
        if ( enable == undefined ) enable = true;
        that.hidden = enable;
        my.sprite.visible = !enable;
        //TODO: Workaround a not working property in PIXI.js:
        my.sprite.alpha = my.sprite.visible ? that.opacity/255 : 0; 
    }

    that.setLayer = function(name) {
        //We need to move the object from the pixi container of the layer
        runtimeScene.getLayer(that.layer).removePIXIContainerChild(my.sprite);
        that.layer = name;
        runtimeScene.getLayer(that.layer).addChildToPIXIContainer(my.sprite, that.zOrder);
    }

    that.flipX = function(enable) {
        if ( enable != my.flippedX ) {
            my.scaleX *= -1;
            my.spriteDirty = true;
            my.flippedX = enable;
        }
    }

    that.flipY = function(enable) {
        if ( enable != my.flippedY ) {
            my.scaleY *= -1;
            my.spriteDirty = true;
            my.flippedY = enable;
        }
    }

    //Scale and size :

    that.getWidth = function() {
        if ( my.spriteDirty ) my.updatePIXISprite();
        return my.cachedWidth;
    }

    that.getHeight = function() {
        if ( my.spriteDirty ) my.updatePIXISprite();
        return my.cachedHeight;
    }

    that.setWidth = function(newWidth) {
        if ( my.spriteDirty ) my.updatePIXISprite();
        var newScaleX = newWidth/my.sprite.texture.frame.width;
        that.setScaleX(!my.isFlippedX ? newScaleX : -newScaleX);
    }

    that.setHeight = function(newHeight) {
        if ( my.spriteDirty ) my.updatePIXISprite();
        var newScaleY = newHeight/my.sprite.texture.frame.height;
        that.setScaleY(!my.isFlippedY ? newScaleY : -newScaleY);
    }

    that.setScaleX = function(newScale) {
        if ( newScale > 0 ) my.scaleX = newScale;
        if ( my.isFlippedX ) my.scaleX *= -1;
        my.spriteDirty = true;
        that.hitBoxesDirty = true;
    }

    that.setScaleY = function(newScale) {
        if ( newScale > 0 ) my.scaleY = newScale;
        if ( my.isFlippedY ) my.scaleX *= -1;
        my.spriteDirty = true;
        that.hitBoxesDirty = true;
    }

    that.getScaleY = function() {
        return my.scaleY;
    }

    that.getScaleX = function() {
        return my.scaleX;
    }

    //Other :

    /**
     * Set the Z order of the object.
     *
     * @method setZOrder
     * @param z {Number} The new Z order position of the object
     */
    that.setZOrder = function(z) {
        if ( z != that.zOrder ) {
            runtimeScene.getLayer(that.layer).changePIXIContainerChildZOrder(my.sprite, z);
            that.zOrder = z;
        }
    }

    /**
     * Change the object angle so that it is facing the specified position.

     * @method turnTowardPosition
     * @param x {Number} The target x position
     * @param y {Number} The target y position
     */
    that.turnTowardPosition = function(x,y) {
        var angle = Math.atan2(y - (that.getDrawableY()+that.getCenterY()),
                               x - (that.getDrawableX()+that.getCenterX()));

        that.setAngle(angle*180/3.14159);
    }

    /**
     * Change the object angle so that it is facing another object

     * @method turnTowardObject
     * @param obj The target object
     */
    that.turnTowardObject = function(obj) {
        if ( obj == null ) return;

        that.turnTowardPosition(obj.getDrawableX()+obj.getCenterX(),
                                obj.getDrawableY()+obj.getCenterY());
    }


    /**
     * Return true if the cursor is on the object.<br>
     * TODO : Support layer's camera rotation.
     *
     * @method cursorOnObject
     * @return true if the cursor is on the object.
     */
    that.cursorOnObject = function() {
        var layer = runtimeScene.getLayer(that.layer);

        if ( runtimeScene.getGame().getMouseX()+layer.getCameraX() >= that.getX()
            && runtimeScene.getGame().getMouseX()+layer.getCameraX() <= that.getX()+that.getWidth()
            && runtimeScene.getGame().getMouseY()+layer.getCameraY() >= that.getY()
            && runtimeScene.getGame().getMouseY()+layer.getCameraY() <= that.getY()+that.getHeight())
            return true;

        return false;
    }

    return that;
}

//Notify gdjs that the spriteRuntimeObject exists.
gdjs.spriteRuntimeObject.thisIsARuntimeObjectConstructor = "Sprite";
