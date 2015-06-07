/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A frame used by a SpriteAnimation in a SpriteRuntimeObject.
 *
 * It contains the texture displayed as well as information like the points position
 * or the collision mask.
 *
 * @namespace gdjs
 * @class SpriteAnimationFrame
 * @constructor
 */
gdjs.SpriteAnimationFrame = function(imageManager, frameData)
{
    this.image = frameData ? frameData.image : "";
    this.pixiTexture = imageManager.getPIXITexture(this.image);

    if ( this.center === undefined ) this.center = { x:0, y:0 };
    if ( this.origin === undefined ) this.origin = { x:0, y:0 };
    this.hasCustomHitBoxes = false;
    if ( this.customHitBoxes === undefined ) this.customHitBoxes = [];
    if ( this.points === undefined ) this.points = new Hashtable();
    else this.points.clear();

    //Initialize points:
    var that = this;
    gdjs.iterateOverArray(frameData.points, function(ptData) {
        var point = {x:parseFloat(ptData.x), y:parseFloat(ptData.y)};
        that.points.put(ptData.name, point);
    });
    var origin = frameData.originPoint;
    this.origin.x = parseFloat(origin.x);
    this.origin.y = parseFloat(origin.y);

    var center = frameData.centerPoint;
    if ( center.automatic !== true ) {
        this.center.x = parseFloat(center.x);
        this.center.y = parseFloat(center.y);
    }
    else  {
        this.center.x = this.pixiTexture.width/2;
        this.center.y = this.pixiTexture.height/2;
    }

    //Load the custom collision mask, if any:
    if ( frameData.hasCustomCollisionMask ) {
        this.hasCustomHitBoxes = true;
        var polygonIndex = 0;
        gdjs.iterateOverArray(frameData.customCollisionMask, function(polygonData) {

            //Add a polygon, if necessary (Avoid recreating a polygon if it already exists).
            if ( polygonIndex >= that.customHitBoxes.length ) that.customHitBoxes.push(new gdjs.Polygon());

            var vertIndex = 0;
            gdjs.iterateOverArray(polygonData, function(pointData) {

                //Add a point, if necessary (Avoid recreating a point if it already exists).
                if ( vertIndex >= that.customHitBoxes[polygonIndex].vertices.length )
                    that.customHitBoxes[polygonIndex].vertices.push([0,0]);

                that.customHitBoxes[polygonIndex].vertices[vertIndex][0] = parseFloat(pointData.x, 10);
                that.customHitBoxes[polygonIndex].vertices[vertIndex][1] = parseFloat(pointData.y, 10);

                vertIndex++;
            });

            that.customHitBoxes[polygonIndex].vertices.length = vertIndex;
            polygonIndex++;
        });

        this.customHitBoxes.length = polygonIndex;
    }
    else {
        this.customHitBoxes.length = 0;
    }
};

/**
 * Get a point of the frame.<br>
 * If the point does not exist, the origin is returned.
 *
 * @method getPoint
 * @return The requested point.
 */
gdjs.SpriteAnimationFrame.prototype.getPoint = function(name) {
	if ( name == "Centre" ) return this.center;
	else if ( name == "Origin" ) return this.origin;

	return this.points.containsKey(name) ? this.points.get(name) : this.origin;
};

/**
 * Represents an animation of a SpriteRuntimeObject.
 *
 * @class SpriteAnimation
 * @namespace gdjs
 * @constructor
 */
gdjs.SpriteAnimation = function(imageManager, animData)
{
	//Constructor of internal object representing a direction of an animation.
    var Direction = function(imageManager, directionData) {
        this.timeBetweenFrames = directionData ? parseFloat(directionData.timeBetweenFrames) :
                                 1.0;
        this.loop = !!directionData.looping;

        var that = this;
        var i = 0;
        if ( this.frames === undefined ) this.frames = [];
        gdjs.iterateOverArray(directionData.sprites, function(frameData) {
            if ( i < that.frames.length )
                gdjs.SpriteAnimationFrame.call(that.frames[i], imageManager, frameData);
            else
                that.frames.push(new gdjs.SpriteAnimationFrame(imageManager, frameData));

            i++;
        });
        this.frames.length = i;
    };

    this.hasMultipleDirections = animData.useMultipleDirections;

    var that = this;
    var i = 0;
    if ( this.directions === undefined ) this.directions = [];
    gdjs.iterateOverArray(animData.directions, function(directionData) {
        if ( i < that.directions.length )
            Direction.call(that.directions[i], imageManager, directionData);
        else
            that.directions.push(new Direction(imageManager, directionData));

        i++;
    });
    this.directions.length = i; //Make sure to delete already existing directions which are not used anymore.
};

/**
 * The SpriteRuntimeObject represents an object that can display images.
 *
 * @class SpriteRuntimeObject
 * @namespace gdjs
 * @extends gdjs.RuntimeObject
 */
gdjs.SpriteRuntimeObject = function(runtimeScene, objectData)
{
	gdjs.RuntimeObject.call( this, runtimeScene, objectData );

    this._currentAnimation = 0;
    this._currentDirection = 0;
    this._currentFrame = 0;
    this._frameElapsedTime = 0;
    this._animationSpeedScale = 1;
	this._animationPaused = false;
    this._scaleX = 1;
    this._scaleY = 1;
    this._blendMode = 0;
    this._flippedX = false;
    this._flippedY = false;
    this._runtimeScene = runtimeScene;
    this.opacity = 255;

    //Animations:
    var that = this;
    var i = 0;
    if ( this._animations === undefined ) this._animations = [];
    gdjs.iterateOverArray(objectData.animations, function(animData) {
        if ( i < that._animations.length )
            gdjs.SpriteAnimation.call(that._animations[i], runtimeScene.getGame().getImageManager(), animData);
        else
            that._animations.push(new gdjs.SpriteAnimation(runtimeScene.getGame().getImageManager(), animData));

        i++;
    });
    this._animations.length = i; //Make sure to delete already existing animations which are not used anymore.

    //PIXI sprite related members:
    this._animationFrame = null; //Reference to the current SpriteAnimationFrame that is displayd. Can be null, so ensure that this case is handled properly.
    this._spriteDirty = true;
    this._textureDirty = true;
    this._spriteInContainer = true;
    if ( this._sprite === undefined )
        this._sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getInvalidPIXITexture());

    var layer = runtimeScene.getLayer("");
    if (layer) layer.addChildToPIXIContainer(this._sprite, this.zOrder);

	this._updatePIXITexture();
	this._updatePIXISprite();
};

gdjs.SpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.SpriteRuntimeObject.thisIsARuntimeObjectConstructor = "Sprite"; //Notify gdjs of the object existence.

//Others initialization and internal state management :

/**
 * Initialize the extra parameters that could be set for an instance.
 */
gdjs.SpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.numberProperties ) {
        var that = this;
        gdjs.iterateOverArray(initialInstanceData.numberProperties, function(extraData) {
            if ( extraData.name === "animation" )
                that.setAnimation(extraData.value);
        });
    }
    if ( initialInstanceData.customSize ) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

/**
 * Update the internal PIXI.Sprite position, angle...
 */
gdjs.SpriteRuntimeObject.prototype._updatePIXISprite = function() {

    if (this._animationFrame !== null) {
        this._sprite.anchor.x = this._animationFrame.center.x/this._sprite.texture.frame.width;
        this._sprite.anchor.y = this._animationFrame.center.y/this._sprite.texture.frame.height;
        this._sprite.position.x = this.x + (this._animationFrame.center.x - this._animationFrame.origin.x)*Math.abs(this._scaleX);
        this._sprite.position.y = this.y + (this._animationFrame.center.y - this._animationFrame.origin.y)*Math.abs(this._scaleY);
        if ( this._flippedX ) this._sprite.position.x += (this._sprite.texture.frame.width/2-this._animationFrame.center.x)*Math.abs(this._scaleX)*2;
        if ( this._flippedY ) this._sprite.position.y += (this._sprite.texture.frame.height/2-this._animationFrame.center.y)*Math.abs(this._scaleY)*2;
        this._sprite.rotation = gdjs.toRad(this.angle);
        this._sprite.visible = !this.hidden;
        this._sprite.blendMode = this._blendMode;
        this._sprite.alpha = this._sprite.visible ? this.opacity/255 : 0; //TODO: Workaround not working property in PIXI.js
        this._sprite.scale.x = this._scaleX;
        this._sprite.scale.y = this._scaleY;
        this._cachedWidth = Math.abs(this._sprite.width);
        this._cachedHeight = Math.abs(this._sprite.height);
    }
    else {
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        this._cachedWidth = 0;
        this._cachedHeight = 0;
    }


    this._spriteDirty = false;
};

/**
 * Update the internal texture of the PIXI sprite.
 */
gdjs.SpriteRuntimeObject.prototype._updatePIXITexture = function() {
    this._textureDirty = false;
    this._spriteDirty = true;

    if ( this._currentAnimation < this._animations.length &&
         this._currentDirection < this._animations[this._currentAnimation].directions.length) {
        var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

        if ( this._currentFrame < direction.frames.length ) {
            this._animationFrame = direction.frames[this._currentFrame];
            if ( this._animationFrame !== null )
                this._sprite.texture = this._animationFrame.pixiTexture;

            return;
        }
    }

    //Invalid animation/direction/frame:
    this._animationFrame = null;
};

/**
 * Update the current frame according to the elapsed time.
 * @method updateTime
 */
gdjs.SpriteRuntimeObject.prototype.updateTime = function(elapsedTime) {
    var oldFrame = this._currentFrame;
    this._frameElapsedTime += this._animationPaused ? 0 : elapsedTime * this._animationSpeedScale;

    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }

    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    if ( this._frameElapsedTime > direction.timeBetweenFrames ) {
        var count = Math.floor(this._frameElapsedTime / direction.timeBetweenFrames);
        this._currentFrame += count;
        this._frameElapsedTime = this._frameElapsedTime-count*direction.timeBetweenFrames;
        if ( this._frameElapsedTime < 0 ) this._frameElapsedTime = 0;
    }

    if ( this._currentFrame >= direction.frames.length ) {
        this._currentFrame = direction.loop ? this._currentFrame % direction.frames.length : direction.frames.length-1;
    }
    if ( this._currentFrame < 0 ) this._currentFrame = 0; //May happen if there is no frame.

    if ( oldFrame != this._currentFrame || this._textureDirty ) this._updatePIXITexture();
    if ( oldFrame != this._currentFrame ) this.hitBoxesDirty = true;
    if ( this._spriteDirty ) this._updatePIXISprite();
};

gdjs.SpriteRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._sprite);
};

/**
 * Update the hit boxes for the object: <br>
 * Fallback to the default implementation (rotated bounding box) if there is no custom
 * hitboxes defined for the current animation frame.
 *
 * @method updateHitBoxes
 */
gdjs.SpriteRuntimeObject.prototype.updateHitBoxes = function() {
    if ( this._textureDirty ) this._updatePIXITexture(); //Beware, _animationFrame could be invalid if this._textureDirty === true.
    if ( this._animationFrame === null ) return;

    if ( !this._animationFrame.hasCustomHitBoxes )
        return gdjs.RuntimeObject.prototype.updateHitBoxes.call(this);

    //console.log("Update for "+this.name); //Uncomment to track updates
    //(and in particular be sure that unnecessary update are avoided).

    //Update the current hitboxes with the frame custom hit boxes
    //and apply transformations.
    for (var i = 0;i<this._animationFrame.customHitBoxes.length;++i) {
        if ( i >= this.hitBoxes.length )
            this.hitBoxes.push(new gdjs.Polygon());

        for (var j = 0;j<this._animationFrame.customHitBoxes[i].vertices.length;++j) {
            if ( j >= this.hitBoxes[i].vertices.length )
                this.hitBoxes[i].vertices.push([0,0]);

            this._transformToGlobal(this._animationFrame.customHitBoxes[i].vertices[j][0],
                this._animationFrame.customHitBoxes[i].vertices[j][1],
                this.hitBoxes[i].vertices[j]);
        }
        this.hitBoxes[i].vertices.length = this._animationFrame.customHitBoxes[i].vertices.length;
    }
    this.hitBoxes.length = this._animationFrame.customHitBoxes.length;

    //Rotate and scale and flipping have already been applied to the point by _transformToGlobal.
};

//Animations :

gdjs.SpriteRuntimeObject.prototype.setAnimation = function(newAnimation) {
    newAnimation = newAnimation | 0;
    if ( newAnimation < this._animations.length &&
        this._currentAnimation !== newAnimation &&
        newAnimation >= 0) {
        this._currentAnimation = newAnimation;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this._spriteDirty = true;
        this._textureDirty = true;
        this.hitBoxesDirty = true;
    }
};

gdjs.SpriteRuntimeObject.prototype.getAnimation = function() {
    return this._currentAnimation;
};

gdjs.SpriteRuntimeObject.prototype.setDirectionOrAngle = function(newValue) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    var anim = this._animations[this._currentAnimation];
    if ( !anim.hasMultipleDirections ) {
        if ( this.angle === newValue ) return;

        this.angle = newValue;
        this._sprite.rotation = gdjs.toRad(this.angle);
        this.hitBoxesDirty = true;
    }
    else {
        newValue = newValue | 0;

        if (newValue === this._currentDirection
            || newValue >= anim.directions.length
            || anim.directions[newValue].frames.length === 0
            || this._currentDirection === newValue )
            return;

        this._currentDirection = newValue;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this.angle = 0;

        this._spriteDirty = true;
        this._textureDirty = true;
        this.hitBoxesDirty = true;
    }
};

gdjs.SpriteRuntimeObject.prototype.getDirectionOrAngle = function() {
    if ( this._currentAnimation >= this._animations.length ) {
        return 0;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections ) {
        return this.angle;
    }
    else {
        return this._currentDirection;
    }
};

/**
 * Change the current frame displayed by the animation
 */
gdjs.SpriteRuntimeObject.prototype.setAnimationFrame = function(newFrame) {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    if ( newFrame >= 0 && newFrame < direction.frames.length && newFrame != this._currentFrame ) {
        this._currentFrame = newFrame;
        this._textureDirty = true;
        this.hitBoxesDirty = true;
    }
};

/**
 * Get the index of the current frame displayed by the animation
 */
gdjs.SpriteRuntimeObject.prototype.getAnimationFrame = function() {
    return this._currentFrame;
};

/**
 * Return true if animation has ended.
 */
gdjs.SpriteRuntimeObject.prototype.hasAnimationEnded = function() {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return true;
    }
    if ( this._animations[this._currentAnimation].loop ) return false;
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    return this._currentFrame == direction.frames.length-1;
};

gdjs.SpriteRuntimeObject.prototype.animationPaused = function() {
    return this._animationPaused;
};

gdjs.SpriteRuntimeObject.prototype.pauseAnimation = function() {
    this._animationPaused = true;
};

gdjs.SpriteRuntimeObject.prototype.playAnimation = function() {
    this._animationPaused = false;
};

gdjs.SpriteRuntimeObject.prototype.getAnimationSpeedScale = function() {
    return this._animationSpeedScale;
};

gdjs.SpriteRuntimeObject.prototype.setAnimationSpeedScale = function(ratio) {
    this._animationSpeedScale = ratio
};

//Position :

gdjs.SpriteRuntimeObject.prototype.getPointX = function(name) {
    if ( name.length === 0 || this._animationFrame === null ) return this.getX();

    var pt = this._animationFrame.getPoint(name);
    return this._transformToGlobal(pt.x, pt.y)[0];
};

gdjs.SpriteRuntimeObject.prototype.getPointY = function(name) {
    if ( name.length === 0 || this._animationFrame === null ) return this.getY();

    var pt = this._animationFrame.getPoint(name);
    return this._transformToGlobal(pt.x, pt.y)[1];
};

/**
 * Return an array containing the coordinates of the point passed as parameter
 * in world coordinates (as opposed to the object local coordinates).
 *
 * Beware: this._animationFrame and this._sprite must *not* be null!
 *
 * All transformations (flipping, scale, rotation) are supported.
 *
 * @param pointX The X position of the point, in object coordinates.
 * @param pointY The Y position of the point, in object coordinates.
 * @param result Optional array that will be updated with the result (x and y position of the point
 * in global coordinates)
 * @return An array containing the x and y position of the point in global coordinates. If result parameter is
 * defined, nothing is returned by the method.
 * @method _transformToGlobal
 * @private
 */
gdjs.SpriteRuntimeObject.prototype._transformToGlobal = function(x, y, result) {
    var cx = this._animationFrame.center.x;
    var cy = this._animationFrame.center.y;

    //Flipping
    if ( this._flippedX ) {
        x = this._sprite.texture.frame.width - x;
        cx = this._sprite.texture.frame.width - cx;
    }
    if ( this._flippedY ) {
        y = this._sprite.texture.frame.height - y;
        cy = this._sprite.texture.frame.height - cy;
    }

    //Scale
    x *= Math.abs(this._scaleX);
    y *= Math.abs(this._scaleY);
    cx *= Math.abs(this._scaleX);
    cy *= Math.abs(this._scaleY);

    //Rotation
    var oldX = x;
    x = cx + Math.cos(this.angle/180*3.14159)*(x-cx) - Math.sin(this.angle/180*3.14159)*(y-cy);
    y = cy + Math.sin(this.angle/180*3.14159)*(oldX-cx) + Math.cos(this.angle/180*3.14159)*(y-cy);

    if (result !== undefined) {
        result.length = 2;
        result[0] = x + this.getDrawableX();
        result[1] = y + this.getDrawableY();
    }
    else
        return [x + this.getDrawableX(), y + this.getDrawableY()];
};

gdjs.SpriteRuntimeObject.prototype.getDrawableX = function() {
    if ( this._animationFrame === null ) return this.x;

    return this.x - this._animationFrame.origin.x*Math.abs(this._scaleX);
};

gdjs.SpriteRuntimeObject.prototype.getDrawableY = function() {
    if ( this._animationFrame === null ) return this.y;

    return this.y - this._animationFrame.origin.y*Math.abs(this._scaleY);
};

gdjs.SpriteRuntimeObject.prototype.getCenterX = function() {
    if ( this._animationFrame === null ) return 0;

    //Just need to multiply by the scale as it is the center
    return this._animationFrame.center.x*Math.abs(this._scaleX);
};

gdjs.SpriteRuntimeObject.prototype.getCenterY = function() {
    if ( this._animationFrame === null ) return 0;

    //Just need to multiply by the scale as it is the center
    return this._animationFrame.center.y*Math.abs(this._scaleY);
};

gdjs.SpriteRuntimeObject.prototype.setX = function(x) {
    if ( x === this.x ) return;

    this.x = x;
    if (this._animationFrame !== null) {
        this.hitBoxesDirty = true;
        this._sprite.position.x = this.x + (this._animationFrame.center.x - this._animationFrame.origin.x)*Math.abs(this._scaleX);
        if ( this._flippedX )
            this._sprite.position.x += (this._sprite.texture.frame.width/2-this._animationFrame.center.x)*Math.abs(this._scaleX)*2;
    }
};

gdjs.SpriteRuntimeObject.prototype.setY = function(y) {
    if ( y === this.y ) return;

    this.y = y;
    if ( this._animationFrame !== null) {
        this.hitBoxesDirty = true;
        this._sprite.position.y = this.y + (this._animationFrame.center.y - this._animationFrame.origin.y)*Math.abs(this._scaleY);
        if ( this._flippedY )
            this._sprite.position.y += (this._sprite.texture.frame.height/2-this._animationFrame.center.y)*Math.abs(this._scaleY)*2;
    }
};

gdjs.SpriteRuntimeObject.prototype.setAngle = function(angle) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections ) {
        if (this.angle === angle) return;

        this.angle = angle;
        this._sprite.rotation = gdjs.toRad(this.angle);
        this.hitBoxesDirty = true;
    }
    else {
        angle = angle % 360;
        if ( angle < 0 ) angle += 360;
        this.setDirectionOrAngle(Math.round(angle/45) % 8);
    }
};

gdjs.SpriteRuntimeObject.prototype.getAngle = function(angle) {
    if ( this._currentAnimation >= this._animations.length ) {
        return 0;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections )
        return this.angle;
    else
        return this._currentDirection * 45;
};

//Visibility and display :

gdjs.SpriteRuntimeObject.prototype.setBlendMode = function(newMode) {
    this._blendMode = newMode;
    this._spriteDirty = true;
};

gdjs.SpriteRuntimeObject.prototype.getBlendMode = function() {
    return this._blendMode;
};

gdjs.SpriteRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this.opacity/255 : 0;
};

gdjs.SpriteRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

gdjs.SpriteRuntimeObject.prototype.hide = function(enable) {
    if ( enable === undefined ) enable = true;
    this.hidden = enable;
    this._sprite.visible = !enable;
    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this.opacity / 255 : 0;
};

gdjs.SpriteRuntimeObject.prototype.setLayer = function(name) {
    //We need to move the object from the pixi container of the layer
    //TODO: Pass the runtimeScene as parameter ?
    this._runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._sprite);
    this.layer = name;
    this._runtimeScene.getLayer(this.layer).addChildToPIXIContainer(this._sprite, this.zOrder);
};

/**
 * Change the tint of the sprite object.
 *
 * \param {String} The color, in RGB format ("128;200;255").
 */
gdjs.SpriteRuntimeObject.prototype.setColor = function(rgbColor) {
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this._sprite.tint = "0x" + gdjs.rgbToHex(parseInt(colors[0]), parseInt(colors[1]), parseInt(colors[2]));
};

gdjs.SpriteRuntimeObject.prototype.flipX = function(enable) {
    if ( enable !== this._flippedX ) {
        this._scaleX *= -1;
        this._spriteDirty = true;
        this._flippedX = enable;
    }
};

gdjs.SpriteRuntimeObject.prototype.flipY = function(enable) {
    if ( enable !== this._flippedY ) {
        this._scaleY *= -1;
        this._spriteDirty = true;
        this._flippedY = enable;
    }
};

gdjs.SpriteRuntimeObject.prototype.isFlippedX = function() {
    return this._flippedX;
};

gdjs.SpriteRuntimeObject.prototype.isFlippedY = function() {
    return this._flippedY;
};

//Scale and size :

gdjs.SpriteRuntimeObject.prototype.getWidth = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedWidth;
};

gdjs.SpriteRuntimeObject.prototype.getHeight = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedHeight;
};

gdjs.SpriteRuntimeObject.prototype.setWidth = function(newWidth) {
    if ( this._textureDirty ) this._updatePIXITexture();
    if ( this._spriteDirty ) this._updatePIXISprite();
    var newScaleX = newWidth/this._sprite.texture.frame.width;
    this.setScaleX(newScaleX);
};

gdjs.SpriteRuntimeObject.prototype.setHeight = function(newHeight) {
    if ( this._textureDirty ) this._updatePIXITexture();
    if ( this._spriteDirty ) this._updatePIXISprite();
    var newScaleY = newHeight/this._sprite.texture.frame.height;
    this.setScaleY(newScaleY);
};

gdjs.SpriteRuntimeObject.prototype.setScale = function(newScale) {
    if ( newScale === Math.abs(this._scaleX) && newScale === Math.abs(this._scaleY) ) return;
    if ( newScale < 0 ) newScale = 0;

    this._scaleX = newScale * (this._flippedX ? -1 : 1);
    this._scaleY = newScale * (this._flippedY ? -1 : 1);
    this._spriteDirty = true;
    this.hitBoxesDirty = true;
};

gdjs.SpriteRuntimeObject.prototype.setScaleX = function(newScale) {
    if ( newScale === Math.abs(this._scaleX) ) return;
    if ( newScale < 0 ) newScale = 0;

    this._scaleX = newScale * (this._flippedX ? -1 : 1);
    this._spriteDirty = true;
    this.hitBoxesDirty = true;
};

gdjs.SpriteRuntimeObject.prototype.setScaleY = function(newScale) {
    if ( newScale === Math.abs(this._scaleY) ) return;
    if ( newScale < 0 ) newScale = 0;

    this._scaleY = newScale * (this._flippedY ? -1 : 1);
    this._spriteDirty = true;
    this.hitBoxesDirty = true;
};

gdjs.SpriteRuntimeObject.prototype.getScale = function() {
    return (Math.abs(this._scaleX)+Math.abs(this._scaleY))/2.0;
};

gdjs.SpriteRuntimeObject.prototype.getScaleY = function() {
    return Math.abs(this._scaleY);
};

gdjs.SpriteRuntimeObject.prototype.getScaleX = function() {
    return Math.abs(this._scaleX);
};

//Other :

/**
 * Set the Z order of the object.
 *
 * @method setZOrder
 * @param z {Number} The new Z order position of the object
 */
gdjs.SpriteRuntimeObject.prototype.setZOrder = function(z) {
    if ( z !== this.zOrder ) {
        //TODO: Pass the runtimeScene as parameter ?
        this._runtimeScene.getLayer(this.layer).changePIXIContainerChildZOrder(this._sprite, z);
        this.zOrder = z;
    }
};

/**
 * @method turnTowardObject
 * @param obj The target object
 * @param scene The scene containing the object
 * @deprecated
 */
gdjs.SpriteRuntimeObject.prototype.turnTowardObject = function(obj, scene) {
    if ( obj === null ) return;

    this.rotateTowardPosition(obj.getDrawableX()+obj.getCenterX(),
        obj.getDrawableY()+obj.getCenterY(), 0, scene);
};
