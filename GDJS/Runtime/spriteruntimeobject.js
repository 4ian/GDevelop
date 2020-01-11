/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @typedef {Object} Point Represents a point in a frame
 * @property {number} x X position of the point
 * @property {number} y Y position of the point
 */

/**
 * @typedef {Object} CustomPointData Represents a custom point in a frame
 * @property {string} name Name of the point
 * @property {number} x X position of the point
 * @property {number} y Y position of the point
 */

/**
 * @typedef {Object} CenterPointData Represents the center point in a frame
 * @property {boolean} automatic Is the center automatically computed?
 * @property {number} x X position of the point
 * @property {number} y Y position of the point
 */

/**
 * @typedef {Object} FrameData Represents a {@link gdjs.SpriteAnimationFrame}
 * @property {string} [image] The resource name of the image used in this frame
 * @property {Array<customPointData>} [points] The points of the frame
 * @property {point} originPoint The origin point
 * @property {centerPointData} centerPoint The center of the frame
 * @property {boolean} hasCustomCollisionMask Is The collision mask custom?
 * @property {Array<Array<point>>} [customCollisionMask] The collision mask if it is custom
 */

/**
 * @typedef {Object} DirectionData Represents the data of a {@link gdjs.SpriteAnimationDirection}
 * @property {number} timeBetweenFrames Time between each frame, in seconds
 * @property {boolean} looping Is the animation looping?
 * @property {Array<gdjs.SpriteAnimationFrame>} sprites The list of frames
 */

/**
 * @typedef {Object} AnimationData Represents the data of a {@link gdjs.SpriteAnimation}
 * @property {string} [name] The name of the animation
 * @property {boolean} useMultipleDirections Does the animation use multiple {@link gdjs.SpriteAnimationDirection}?
 * @property {Array<DirectionData>} directions The list of {@link DirectionData} representing {@link gdjs.SpriteAnimationDirection} instances
 */

/**
 * @typedef {Object} SpriteObjectDataType
 * @property {boolean} updateIfNotVisible Update the object even if he is not visible?
 * @property {Array<AnimationData>} animations The list of {@link AnimationData} representing {@link gdjs.SpriteAnimation} instances
 * 
 * @typedef {ObjectData & SpriteObjectDataType} SpriteObjectData
 */

/**
 * A frame used by a SpriteAnimation in a {@link gdjs.SpriteRuntimeObject}.
 *
 * It contains the texture displayed as well as information like the points position
 * or the collision mask.
 *
 * @memberof gdjs
 * @class SpriteAnimationFrame
 * @param {gdjs.ImageManager} imageManager The game image manager
 * @param {FrameData} frameData The frame data used to initialize the frame
 */

gdjs.SpriteAnimationFrame = function(imageManager, frameData)
{
    /** @type {string} */
    this.image = frameData ? frameData.image : ""; //TODO: Rename in imageName, and do not store it in the object?
    /** @type {PIXI.Texture} */
    this.texture = gdjs.SpriteRuntimeObjectRenderer.getAnimationFrame(imageManager, this.image);

    if ( this.center === undefined ) {
        /** @type {Point} */
        this.center = { x:0, y:0 };
    };
    if ( this.origin === undefined ) {
        /** @type {Point} */
        this.origin = { x:0, y:0 }
    };
    /** @type {boolean} */
    this.hasCustomHitBoxes = false;
    if ( this.customHitBoxes === undefined ) {
        /** @type {Array<gdjs.Polygon>} */
        this.customHitBoxes = []
    };
    if ( this.points === undefined ){
        /** @type {Hashtable} */
        this.points = new Hashtable();
    } else this.points.clear();

    //Initialize points:
	for(var i = 0, len = frameData.points.length;i<len;++i) {
        /** @type {CustomPointData} */
		var ptData = frameData.points[i];

        /** @type {Point} */
        var point = {x:parseFloat(ptData.x), y:parseFloat(ptData.y)};
        this.points.put(ptData.name, point);
    }
    /** @type {Point} */
    var origin = frameData.originPoint;
    this.origin.x = parseFloat(origin.x);
    this.origin.y = parseFloat(origin.y);

    /** @type {CenterPointData} */
    var center = frameData.centerPoint;
    if ( center.automatic !== true ) {
        this.center.x = parseFloat(center.x);
        this.center.y = parseFloat(center.y);
    }
    else {
        this.center.x = gdjs.SpriteRuntimeObjectRenderer.getAnimationFrameWidth(this.texture)/2;
        this.center.y = gdjs.SpriteRuntimeObjectRenderer.getAnimationFrameHeight(this.texture)/2;
    }

    //Load the custom collision mask, if any:
    if ( frameData.hasCustomCollisionMask ) {
        this.hasCustomHitBoxes = true;
    	for(var i = 0, len = frameData.customCollisionMask.length;i<len;++i) {
            /** @type {Array<Point>} */
    		var polygonData = frameData.customCollisionMask[i];

            //Add a polygon, if necessary (Avoid recreating a polygon if it already exists).
            if ( i >= this.customHitBoxes.length ) this.customHitBoxes.push(new gdjs.Polygon());

        	for(var j = 0, len2 = polygonData.length;j<len2;++j) {
                /** @type {Point} */
        		var pointData = polygonData[j];

                //Add a point, if necessary (Avoid recreating a point if it already exists).
                if ( j >= this.customHitBoxes[i].vertices.length )
                    this.customHitBoxes[i].vertices.push([0,0]);

                this.customHitBoxes[i].vertices[j][0] = parseFloat(pointData.x, 10);
                this.customHitBoxes[i].vertices[j][1] = parseFloat(pointData.y, 10);
            }

            this.customHitBoxes[i].vertices.length = j;
        }

        this.customHitBoxes.length = i;
    }
    else {
        this.customHitBoxes.length = 0;
    }
};

/**
 * Get a point of the frame.<br>
 * If the point does not exist, the origin is returned.
 * @param {string} name The point's name
 * @return {Point} The requested point. If it doesn't exists returns the origin point.
 */
gdjs.SpriteAnimationFrame.prototype.getPoint = function(name) {
	if ( name == "Centre" || name == "Center") return this.center;
	else if ( name == "Origin" ) return this.origin;

	return this.points.containsKey(name) ? this.points.get(name) : this.origin;
};

/**
 * Represents a direction of an animation of a {@link gdjs.SpriteRuntimeObject}.
 *
 * @class SpriteAnimationDirection
 * @memberof gdjs
 * @param {gdjs.ImageManager} imageManager The game image manager
 * @param {DirectionData} directionData The direction data used to initialize the direction
 */
gdjs.SpriteAnimationDirection = function(imageManager, directionData)
{
    /** @type {number} */
    this.timeBetweenFrames = directionData ? parseFloat(directionData.timeBetweenFrames) :
        1.0;
    /** @type {boolean} */
    this.loop = !!directionData.looping;

    if ( this.frames === undefined ) {
        /** @type {Array<SpriteAnimationFrame>} */
        this.frames = [];
    }
    for(var i = 0, len = directionData.sprites.length;i<len;++i) {
        /** @type {frameData} */
        var frameData = directionData.sprites[i];

        if ( i < this.frames.length )
            gdjs.SpriteAnimationFrame.call(this.frames[i], imageManager, frameData);
        else
            this.frames.push(new gdjs.SpriteAnimationFrame(imageManager, frameData));
    }
    this.frames.length = i;
};

/**
 * Represents an animation of a {@link SpriteRuntimeObject}.
 *
 * @class SpriteAnimation
 * @memberof gdjs
 * @param {gdjs.ImageManager} imageManager The game image manager
 * @param {AnimationData} animData The animation data used to initialize the animation
 */
gdjs.SpriteAnimation = function(imageManager, animData)
{
    /** @type {boolean} */
    this.hasMultipleDirections = !!animData.useMultipleDirections;
    /** @type {string} */
    this.name = animData.name || '';

    /** @type {Array<gdjs.SpriteAnimationDirection>} */
    if ( this.directions === undefined ) this.directions = [];
    for(var i = 0, len = animData.directions.length;i<len;++i) {
        /** @type {DirectionData} */
        var directionData = animData.directions[i];

        if ( i < this.directions.length )
            gdjs.SpriteAnimationDirection.call(this.directions[i], imageManager, directionData);
        else
            this.directions.push(new gdjs.SpriteAnimationDirection(imageManager, directionData));
    }
    this.directions.length = i; //Make sure to delete already existing directions which are not used anymore.
};

/**
 * The SpriteRuntimeObject represents an object that can display images.
 *
 * @class SpriteRuntimeObject
 * @memberof gdjs
 * @extends gdjs.RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene The scene the object belongs to
 * @param {SpriteObjectData} spriteObjectData The object data used to initialize the object
 */
gdjs.SpriteRuntimeObject = function(runtimeScene, spriteObjectData) {
	gdjs.RuntimeObject.call(this, runtimeScene, spriteObjectData);

    /** @type {number} */
    this._currentAnimation = 0;
    /** @type {number} */
    this._currentDirection = 0;
    /** @type {number} */
    this._currentFrame = 0;
    /** @type {number} */
    this._frameElapsedTime = 0;
    /** @type {number} */
    this._animationSpeedScale = 1;
    /** @type {boolean} */
    this._animationPaused = false;
    /** @type {number} */
    this._scaleX = 1;
    /** @type {number} */
    this._scaleY = 1;
    /** @type {number} */
    this._blendMode = 0;
    /** @type {boolean} */
    this._flippedX = false;
    /** @type {boolean} */
    this._flippedY = false;
    /** @type {number} */
    this.opacity = 255;
    /** @type {boolean} */
    this._updateIfNotVisible = !!spriteObjectData.updateIfNotVisible;

    //Animations:
    
    if ( this._animations === undefined ) {
        /** @type {Array<gdjs.SpriteAnimation>} */
        this._animations = [];
    }
    for(var i = 0, len = spriteObjectData.animations.length;i<len;++i) {
        /** @type {AnimationData} */
        var animData = spriteObjectData.animations[i];

        if ( i < this._animations.length )
            gdjs.SpriteAnimation.call(this._animations[i], runtimeScene.getGame().getImageManager(), animData);
        else
            this._animations.push(new gdjs.SpriteAnimation(runtimeScene.getGame().getImageManager(), animData));
    }
    this._animations.length = i; //Make sure to delete already existing animations which are not used anymore.

    /**
     * Reference to the current SpriteAnimationFrame that is displayd.
     * Verify is `this._animationFrameDirty === true` before using it, and if so
     * call `this._updateAnimationFrame()`.
     * Can be null, so ensure that this case is handled properly.
     *
     * @type {gdjs.SpriteAnimationFrame}
     */
    this._animationFrame = null;

    if (this._renderer)
        gdjs.SpriteRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        /** @type {gdjs.SpriteRuntimeObjectRenderer} */
        this._renderer = new gdjs.SpriteRuntimeObjectRenderer(this, runtimeScene);

    this._updateAnimationFrame();

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.SpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.SpriteRuntimeObject.thisIsARuntimeObjectConstructor = "Sprite"; //Notify gdjs of the object existence.

//Others initialization and internal state management :

/**
 * Initialize the extra parameters that could be set for an instance.
 */
gdjs.SpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.numberProperties ) {
        for(var i = 0, len = initialInstanceData.numberProperties.length;i<len;++i) {
            var extraData = initialInstanceData.numberProperties[i];

            if ( extraData.name === "animation" )
                this.setAnimation(extraData.value);
        }
    }
    if ( initialInstanceData.customSize ) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

/**
 * Update the current frame of the object according to the elapsed time on the scene.
 */
gdjs.SpriteRuntimeObject.prototype.update = function(runtimeScene) {
    //Playing the animation of all objects including the ones outside the screen can be
    //costly when the scene is big with a lot of animated objects. By default, we skip
    //updating the object if it is not visible.
    if (!this._updateIfNotVisible && !this._renderer.getRendererObject().visible)
        return;

    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];
    var oldFrame = this._currentFrame;

    if (!direction.loop && this._currentFrame >= direction.frames.length) {
        //*Optimization*: Animation is finished, don't change the current frame
        //and compute nothing more.
    } else {
        var elapsedTime = this.getElapsedTime(runtimeScene) / 1000;
        this._frameElapsedTime += this._animationPaused ? 0 : elapsedTime * this._animationSpeedScale;

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
    }

    if ( oldFrame !== this._currentFrame || this._animationFrameDirty ) this._updateAnimationFrame();
    if ( oldFrame !== this._currentFrame ) this.hitBoxesDirty = true;

    this._renderer.ensureUpToDate();
};

/**
 * Update `this._animationFrame` according to the current animation/direction/frame values
 * (`this._currentAnimation`, `this._currentDirection`, `this._currentFrame`) and set
 * `this._animationFrameDirty` back to false.
 *
 * Trigger a call to the renderer to change the texture being shown (if the animation/direction/frame
 * is valid).
 * If invalid, `this._animationFrame` will be `null` after calling this function.
 */
gdjs.SpriteRuntimeObject.prototype._updateAnimationFrame = function() {
   this._animationFrameDirty = false;

   if ( this._currentAnimation < this._animations.length &&
        this._currentDirection < this._animations[this._currentAnimation].directions.length) {
       var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

       if ( this._currentFrame < direction.frames.length ) {
           this._animationFrame = direction.frames[this._currentFrame];
           if ( this._animationFrame !== null ) {
               this._renderer.updateFrame(this._animationFrame);
           }

           return;
       }
   }

   //Invalid animation/direction/frame:
   this._animationFrame = null;
};

gdjs.SpriteRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

/**
 * Update the hit boxes for the object.
 * Fallback to the default implementation (rotated bounding box) if there is no custom
 * hitboxes defined for the current animation frame.
 */
gdjs.SpriteRuntimeObject.prototype.updateHitBoxes = function() {
    if ( this._animationFrameDirty ) {
        this._updateAnimationFrame();
    }
    if ( this._animationFrame === null ) return; //Beware, `this._animationFrame` can still be null.

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

/**
 * Change the animation being played.
 * @param {number} newAnimation The index of the new animation to be played
 */
gdjs.SpriteRuntimeObject.prototype.setAnimation = function(newAnimation) {
    newAnimation = newAnimation | 0;
    if ( newAnimation < this._animations.length &&
        this._currentAnimation !== newAnimation &&
        newAnimation >= 0) {
        this._currentAnimation = newAnimation;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this._renderer.update(); //TODO: This may be unnecessary.
        this._animationFrameDirty = true;
        this.hitBoxesDirty = true;
    }
};

/**
 * Change the animation being played.
 * @param {string} newAnimationName The name of the new animation to be played
 */
gdjs.SpriteRuntimeObject.prototype.setAnimationName = function(newAnimationName) {
    if (!newAnimationName) return;

    for(var i = 0;i < this._animations.length;++i) {
        if (this._animations[i].name === newAnimationName) {
            return this.setAnimation(i);
        }
    }
};

/**
 * Get the index of the animation being played.
 * @return {number} The index of the new animation being played
 */
gdjs.SpriteRuntimeObject.prototype.getAnimation = function() {
    return this._currentAnimation;
};

/**
 * Get the name of the animation being played.
 * @return {string} The name of the new animation being played
 */
gdjs.SpriteRuntimeObject.prototype.getAnimationName = function() {
    if ( this._currentAnimation >= this._animations.length ) {
        return '';
    }

    return this._animations[this._currentAnimation].name;
};

gdjs.SpriteRuntimeObject.prototype.isCurrentAnimationName = function(name) {
    return this.getAnimationName() === name;
};

/**
 * Change the angle (or direction index) of the object
 * @return {number} The new angle (or direction index) to be applied
 */
gdjs.SpriteRuntimeObject.prototype.setDirectionOrAngle = function(newValue) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    var anim = this._animations[this._currentAnimation];
    if ( !anim.hasMultipleDirections ) {
        if ( this.angle === newValue ) return;

        this.angle = newValue;
        this.hitBoxesDirty = true;
        this._renderer.updateAngle();
    }
    else {
        newValue = newValue | 0;

        if (newValue === this._currentDirection
            || newValue >= anim.directions.length
            || anim.directions[newValue].frames.length === 0)
            return;

        this._currentDirection = newValue;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this.angle = 0;

        this._renderer.update(); //TODO: This may be unnecessary.
        this._animationFrameDirty = true;
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
 * @param {number} newFrame The index of the frame to be displayed
 */
gdjs.SpriteRuntimeObject.prototype.setAnimationFrame = function(newFrame) {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    if ( newFrame >= 0 && newFrame < direction.frames.length && newFrame !== this._currentFrame ) {
        this._currentFrame = newFrame;
        this._animationFrameDirty = true;
        this.hitBoxesDirty = true;
    }
};

/**
 * Get the index of the current frame displayed by the animation
 * @return {number} newFrame The index of the frame being displayed
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

/**
 * Get the position on X axis on the scene of the given point.
 * @param {string} name The point name
 * @return {number} the position on X axis on the scene of the given point.
 */
gdjs.SpriteRuntimeObject.prototype.getPointX = function(name) {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    if ( name.length === 0 || this._animationFrame === null ) return this.getX();

    var pt = this._animationFrame.getPoint(name);
    var pos = gdjs.staticArray(gdjs.SpriteRuntimeObject.prototype.getPointX);
    this._transformToGlobal(pt.x, pt.y, pos);

    return pos[0];
};

/**
 * Get the position on Y axis on the scene of the given point.
 * @param {string} name The point name
 * @return {number} the position on Y axis on the scene of the given point.
 */
gdjs.SpriteRuntimeObject.prototype.getPointY = function(name) {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    if ( name.length === 0 || this._animationFrame === null ) return this.getY();

    var pt = this._animationFrame.getPoint(name);
    var pos = gdjs.staticArray(gdjs.SpriteRuntimeObject.prototype.getPointY);
    this._transformToGlobal(pt.x, pt.y, pos);

    return pos[1];
};

/**
 * Return an array containing the coordinates of the point passed as parameter
 * in world coordinates (as opposed to the object local coordinates).
 *
 * Beware: this._animationFrame and this._sprite must *not* be null!
 *
 * All transformations (flipping, scale, rotation) are supported.
 *
 * @param {number} pointX The X position of the point, in object coordinates.
 * @param {number} pointY The Y position of the point, in object coordinates.
 * @param {Array} result Array that will be updated with the result (x and y position of the point
 * in global coordinates)
 * @private
 */
gdjs.SpriteRuntimeObject.prototype._transformToGlobal = function(x, y, result) {
    var cx = this._animationFrame.center.x;
    var cy = this._animationFrame.center.y;

    //Flipping
    if ( this._flippedX ) {
        x = x + (cx - x) * 2;
    }
    if ( this._flippedY ) {
        y = y + (cy - y) * 2;
    }

    //Scale
    var absScaleX = Math.abs(this._scaleX);
    var absScaleY = Math.abs(this._scaleY);
    x *= absScaleX;
    y *= absScaleY;
    cx *= absScaleX;
    cy *= absScaleY;

    //Rotation
    var oldX = x;
    var angleInRadians = this.angle/180*Math.PI;
    var cosValue = Math.cos(angleInRadians); // Only compute cos and sin once (10% faster than doing it twice)
    var sinValue = Math.sin(angleInRadians);
    var xToCenterXDelta = x-cx;
    var yToCenterYDelta = y-cy;
    x = cx + cosValue*(xToCenterXDelta) - sinValue*(yToCenterYDelta);
    y = cy + sinValue*(xToCenterXDelta) + cosValue*(yToCenterYDelta);

    result.length = 2;
    result[0] = x + (this.x - this._animationFrame.origin.x*absScaleX);
    result[1] = y + (this.y - this._animationFrame.origin.y*absScaleY);
};

/**
 * Get the X position, on the scene, of the origin of the texture of the object.
 * @return {number} the X position, on the scene, of the origin of the texture of the object.
 */
gdjs.SpriteRuntimeObject.prototype.getDrawableX = function() {
    if ( this._animationFrame === null ) return this.x;

    var absScaleX = Math.abs(this._scaleX);

    if (!this._flippedX) {
        return this.x - this._animationFrame.origin.x*absScaleX;
    } else {
        return this.x + (-this._animationFrame.origin.x
            - this._renderer.getUnscaledWidth() + 2*this._animationFrame.center.x)*absScaleX;
    }
};

/**
 * Get the Y position, on the scene, of the origin of the texture of the object.
 * @return {number} the Y position, on the scene, of the origin of the texture of the object.
 */
gdjs.SpriteRuntimeObject.prototype.getDrawableY = function() {
    if ( this._animationFrame === null ) return this.y;

    var absScaleY = Math.abs(this._scaleY);

    if (!this._flippedY) {
        return this.y - this._animationFrame.origin.y*absScaleY;
    } else {
        return this.y + (-this._animationFrame.origin.y
            - this._renderer.getUnscaledHeight() + 2*this._animationFrame.center.y)*absScaleY;
    }
};

/**
 * Get the X position of the center of the object, relative to top-left of the texture of the object (`getDrawableX`).
 * @return {number} X position of the center of the object, relative to `getDrawableX()`.
 */
gdjs.SpriteRuntimeObject.prototype.getCenterX = function() {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    if ( this._animationFrame === null ) return 0;

    if (!this._flippedX) {
        //Just need to multiply by the scale as it is the center.
        return this._animationFrame.center.x*Math.abs(this._scaleX);
    } else {
        return (this._renderer.getUnscaledWidth() - this._animationFrame.center.x)*Math.abs(this._scaleX);
    }
};

/**
 * Get the Y position of the center of the object, relative to top-left of the texture of the object (`getDrawableY`).
 * @return {number} Y position of the center of the object, relative to `getDrawableY()`.
 */
gdjs.SpriteRuntimeObject.prototype.getCenterY = function() {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    if ( this._animationFrame === null ) return 0;

    if (!this._flippedY) {
        //Just need to multiply by the scale as it is the center.
        return this._animationFrame.center.y*Math.abs(this._scaleY);
    } else {
        return (this._renderer.getUnscaledHeight() - this._animationFrame.center.y)*Math.abs(this._scaleY);
    }
};

/**
 * Set the X position of the (origin of the) object.
 * @param {number} x The new X position.
 */
gdjs.SpriteRuntimeObject.prototype.setX = function(x) {
    if ( x === this.x ) return;

    this.x = x;
    if (this._animationFrame !== null) {
        this.hitBoxesDirty = true;
        this._renderer.updateX();
    }
};

/**
 * Set the Y position of the (origin of the) object.
 * @param {number} y The new Y position.
 */
gdjs.SpriteRuntimeObject.prototype.setY = function(y) {
    if ( y === this.y ) return;

    this.y = y;
    if ( this._animationFrame !== null) {
        this.hitBoxesDirty = true;
        this._renderer.updateY();
    }
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle, in degrees.
 */
gdjs.SpriteRuntimeObject.prototype.setAngle = function(angle) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections ) {
        if (this.angle === angle) return;

        this.angle = angle;
        this._renderer.updateAngle();
        this.hitBoxesDirty = true;
    } else {
        angle = angle % 360;
        if ( angle < 0 ) angle += 360;
        this.setDirectionOrAngle(Math.round(angle/45) % 8);
    }
};

/**
 * Get the angle of the object.
 * @return {number} The angle, in degrees.
 */
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
    if (this._blendMode === newMode) return;

    this._blendMode = newMode;
    this._renderer.update();
};

gdjs.SpriteRuntimeObject.prototype.getBlendMode = function() {
    return this._blendMode;
};

/**
 * Change the transparency of the object.
 * @param {number} opacity The new opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.SpriteRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._renderer.updateOpacity();
};

/**
 * Get the transparency of the object.
 * @return {number} The opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.SpriteRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Hide (or show) the object
 * @param {boolean} enable true to hide the object, false to show it again.
 */
gdjs.SpriteRuntimeObject.prototype.hide = function(enable) {
    if ( enable === undefined ) enable = true;
    this.hidden = enable;

    this._renderer.updateVisibility();
};

/**
 * Change the tint of the sprite object.
 *
 * @param {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.SpriteRuntimeObject.prototype.setColor = function(rgbColor) {
    this._renderer.setColor(rgbColor);
};

/**
 * Get the tint of the sprite object.
 *
 * @returns {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.SpriteRuntimeObject.prototype.getColor = function() {
    return this._renderer.getColor();
};

gdjs.SpriteRuntimeObject.prototype.flipX = function(enable) {
    if ( enable !== this._flippedX ) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this.hitBoxesDirty = true;
        this._renderer.update();
    }
};

gdjs.SpriteRuntimeObject.prototype.flipY = function(enable) {
    if ( enable !== this._flippedY ) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.hitBoxesDirty = true;
        this._renderer.update();
    }
};

gdjs.SpriteRuntimeObject.prototype.isFlippedX = function() {
    return this._flippedX;
};

gdjs.SpriteRuntimeObject.prototype.isFlippedY = function() {
    return this._flippedY;
};

//Scale and size :

/**
 * Get the width of the object.
 *
 * @return {number} The width of the object, in pixels.
 */
gdjs.SpriteRuntimeObject.prototype.getWidth = function() {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    return this._renderer.getWidth();
};

/**
 * Get the height of the object.
 *
 * @return {number} The height of the object, in pixels.
 */
gdjs.SpriteRuntimeObject.prototype.getHeight = function() {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();
    return this._renderer.getHeight();
};

/**
 * Change the width of the object. This changes the scale on X axis of the object.
 *
 * @param {number} width The new width of the object, in pixels.
 */
gdjs.SpriteRuntimeObject.prototype.setWidth = function(newWidth) {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();

    var unscaledWidth = this._renderer.getUnscaledWidth();
    if (unscaledWidth !== 0) this.setScaleX(newWidth / unscaledWidth);
};

/**
 * Change the height of the object. This changes the scale on Y axis of the object.
 *
 * @param {number} height The new height of the object, in pixels.
 */
gdjs.SpriteRuntimeObject.prototype.setHeight = function(newHeight) {
    if ( this._animationFrameDirty ) this._updateAnimationFrame();

    var unscaledHeight = this._renderer.getUnscaledHeight();
    if (unscaledHeight !== 0) this.setScaleY(newHeight / unscaledHeight);
};

/**
 * Change the scale on X and Y axis of the object.
 *
 * @param {number} newScale The new scale (must be greater than 0).
 */
gdjs.SpriteRuntimeObject.prototype.setScale = function(newScale) {
    if ( newScale < 0 ) newScale = 0;
    if ( newScale === Math.abs(this._scaleX) && newScale === Math.abs(this._scaleY) ) return;

    this._scaleX = newScale * (this._flippedX ? -1 : 1);
    this._scaleY = newScale * (this._flippedY ? -1 : 1);
    this._renderer.update();
    this.hitBoxesDirty = true;
};

/**
 * Change the scale on X axis of the object (changing its width).
 *
 * @param {number} newScale The new scale (must be greater than 0).
 */
gdjs.SpriteRuntimeObject.prototype.setScaleX = function(newScale) {
    if ( newScale < 0 ) newScale = 0;
    if ( newScale === Math.abs(this._scaleX) ) return;

    this._scaleX = newScale * (this._flippedX ? -1 : 1);
    this._renderer.update();
    this.hitBoxesDirty = true;
};

/**
 * Change the scale on Y axis of the object (changing its width).
 *
 * @param {number} newScale The new scale (must be greater than 0).
 */
gdjs.SpriteRuntimeObject.prototype.setScaleY = function(newScale) {
    if ( newScale < 0 ) newScale = 0;
    if ( newScale === Math.abs(this._scaleY) ) return;

    this._scaleY = newScale * (this._flippedY ? -1 : 1);
    this._renderer.update();
    this.hitBoxesDirty = true;
};

/**
 * Get the scale of the object (or the average of the X and Y scale in case they are different).
 *
 * @return {number} the scale of the object (or the average of the X and Y scale in case they are different).
 */
gdjs.SpriteRuntimeObject.prototype.getScale = function() {
    return (Math.abs(this._scaleX)+Math.abs(this._scaleY))/2.0;
};

/**
 * Get the scale of the object on Y axis.
 *
 * @return {number} the scale of the object on Y axis
 */
gdjs.SpriteRuntimeObject.prototype.getScaleY = function() {
    return Math.abs(this._scaleY);
};

/**
 * Get the scale of the object on X axis.
 *
 * @return {number} the scale of the object on X axis
 */
gdjs.SpriteRuntimeObject.prototype.getScaleX = function() {
    return Math.abs(this._scaleX);
};

//Other :

/**
 * @param obj The target object
 * @param scene The scene containing the object
 * @deprecated
 */
gdjs.SpriteRuntimeObject.prototype.turnTowardObject = function(obj, scene) {
    if ( obj === null ) return;

    this.rotateTowardPosition(obj.getDrawableX()+obj.getCenterX(),
        obj.getDrawableY()+obj.getCenterY(), 0, scene);
};
