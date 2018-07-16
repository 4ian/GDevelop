
gdjs.SpriteRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;
    this._spriteDirty = true;
    this._textureDirty = true;
    if ( this._sprite === undefined )
        this._sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getInvalidPIXITexture());

    var layer = runtimeScene.getLayer("");
    if (layer) layer.getRenderer().addRendererObject(this._sprite, runtimeObject.getZOrder());
}

gdjs.SpriteRuntimeObjectRenderer = gdjs.SpriteRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._sprite;
};

/**
 * Update the internal PIXI.Sprite position, angle...
 */
gdjs.SpriteRuntimeObjectPixiRenderer.prototype._updatePIXISprite = function() {
    if (this._object._animationFrame !== null) {
        this._sprite.anchor.x = this._object._animationFrame.center.x/this._sprite.texture.frame.width;
        this._sprite.anchor.y = this._object._animationFrame.center.y/this._sprite.texture.frame.height;
        this._sprite.position.x = this._object.x + (this._object._animationFrame.center.x - this._object._animationFrame.origin.x)*Math.abs(this._object._scaleX);
        this._sprite.position.y = this._object.y + (this._object._animationFrame.center.y - this._object._animationFrame.origin.y)*Math.abs(this._object._scaleY);
        if ( this._object._flippedX ) this._sprite.position.x += (this._sprite.texture.frame.width/2-this._object._animationFrame.center.x)*Math.abs(this._object._scaleX)*2;
        if ( this._object._flippedY ) this._sprite.position.y += (this._sprite.texture.frame.height/2-this._object._animationFrame.center.y)*Math.abs(this._object._scaleY)*2;
        this._sprite.rotation = gdjs.toRad(this._object.angle);
        this._sprite.visible = !this._object.hidden;
        this._sprite.blendMode = this._object._blendMode;
        this._sprite.alpha = this._sprite.visible ? this._object.opacity/255 : 0; //TODO: Workaround not working property in PIXI.js
        this._sprite.scale.x = this._object._scaleX;
        this._sprite.scale.y = this._object._scaleY;
        this._cachedWidth = Math.abs(this._sprite.width);
        this._cachedHeight = Math.abs(this._sprite.height);
    } else {
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        this._cachedWidth = 0;
        this._cachedHeight = 0;
    }

    this._spriteDirty = false;
};

/**
 * Call this to make sure the sprite is ready to be rendered.
 */
gdjs.SpriteRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
};

/**
 * Update the internal texture of the PIXI sprite.
 */
gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateFrame = function(animationFrame) {
    this._spriteDirty = true;
    this._sprite.texture = animationFrame.texture;
};

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.update = function() {
    this._spriteDirty = true;
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateX = function() {
    this._sprite.position.x = this._object.x + (this._object._animationFrame.center.x - this._object._animationFrame.origin.x)*Math.abs(this._object._scaleX);
    if ( this._flippedX )
        this._sprite.position.x += (this._sprite.texture.frame.width/2-this._object._animationFrame.center.x)*Math.abs(this._object._scaleX)*2;
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateY = function() {
    this._sprite.position.y = this._object.y + (this._object._animationFrame.center.y - this._object._animationFrame.origin.y)*Math.abs(this._object._scaleY);
    if ( this._flippedY )
        this._sprite.position.y += (this._sprite.texture.frame.height/2-this._object._animationFrame.center.y)*Math.abs(this._object._scaleY)*2;
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._sprite.rotation = gdjs.toRad(this._object.angle);
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this._object.opacity/255 : 0;
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.updateVisibility = function() {
    this._sprite.visible = !this._object.hidden;

    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this._object.opacity/255 : 0;
}

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.setColor = function(rgbColor) {
   var colors = rgbColor.split(";");
   if ( colors.length < 3 ) return;

   this._sprite.tint = "0x" + gdjs.rgbToHex(parseInt(colors[0], 10), parseInt(colors[1], 10), parseInt(colors[2], 10));
};

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.getWidth = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedWidth;
};

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.getHeight = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedHeight;
};

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.getUnscaledWidth = function() {
    return this._sprite.texture.frame.width;
};

gdjs.SpriteRuntimeObjectPixiRenderer.prototype.getUnscaledHeight = function() {
    return this._sprite.texture.frame.height;
};

gdjs.SpriteRuntimeObjectPixiRenderer.getAnimationFrame = function(imageManager, imageName) {
    return imageManager.getPIXITexture(imageName);
};

gdjs.SpriteRuntimeObjectPixiRenderer.getAnimationFrameWidth = function(pixiTexture) {
    return pixiTexture.width;
};

gdjs.SpriteRuntimeObjectPixiRenderer.getAnimationFrameHeight = function(pixiTexture) {
    return pixiTexture.height;
};
