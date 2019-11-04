/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

gdjs.SpriteRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;
    this._sprite = new cc.Sprite(runtimeScene.getGame().getImageManager().getInvalidTexture());
    this._currentBlendMode = undefined;

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;
}

gdjs.SpriteRuntimeObjectRenderer = gdjs.SpriteRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {
    return this._sprite;
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.ensureUpToDate = function() {
    if ( this._spriteDirty ) this._updateCocosSprite();
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateFrame = function(animationFrame) {
    this._spriteDirty = true;

    //TODO Perf: Avoid calling cc.SpriteFrame.createWithTexture each time updateFrame is called?
    var spriteFrame = cc.SpriteFrame.createWithTexture(animationFrame.texture,
        cc.rect(0, 0, animationFrame.texture.pixelsWidth, animationFrame.texture.pixelsHeight));
    this._cachedTextureWidth = animationFrame.texture.pixelsWidth;
    this._cachedTextureHeight = animationFrame.texture.pixelsHeight;
    this._sprite.setSpriteFrame(spriteFrame);
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype._updateCocosSprite = function() {
    if (this._object._animationFrame !== null) {
        this._sprite.setAnchorPoint(cc.p(
            this._object._flippedX ?
                (1 - this._object._animationFrame.center.x/this._cachedTextureWidth) :
                (this._object._animationFrame.center.x/this._cachedTextureWidth),
            this._object._flippedY ? //Cocos Y axis is inverted
                (this._object._animationFrame.center.y/this._cachedTextureHeight) :
                (1 - this._object._animationFrame.center.y/this._cachedTextureHeight)
        ));
        var xPos = this._object.x + (this._object._animationFrame.center.x - this._object._animationFrame.origin.x)*Math.abs(this._object._scaleX);
        var yPos = this._object.y + (this._object._animationFrame.center.y - this._object._animationFrame.origin.y)*Math.abs(this._object._scaleY);
        this._sprite.setPositionX(xPos);
        this._sprite.setPositionY(this._convertYPosition(yPos));
        this._sprite.setRotation(this._object.angle);
        this._sprite.setVisible(!this._object.hidden);
        this._sprite.setOpacity(this._object.opacity);
        this._sprite.setScale(this._object.getScaleX(), this._object.getScaleY());
        this._sprite.setFlippedX(this._object._flippedX);
        this._sprite.setFlippedY(this._object._flippedY);

        if (this._currentBlendMode !== this._object._blendMode) {
            this._currentBlendMode = this._object._blendMode;
            this._sprite.setBlendFunc(
                this._currentBlendMode === 0 ? cc.BlendFunc.ALPHA_PREMULTIPLIED :
                (this._currentBlendMode === 1 ? cc.BlendFunc.ADDITIVE :
                (this._currentBlendMode === 2 ? cc.BlendFunc.ALPHA_NON_PREMULTIPLIED :
                cc.BlendFunc.DISABLE)));
        }

        // Note that for width/height, there is this._sprite.width/height
        // but it could be not up-to-date with the scale.
        this._cachedWidth = this._cachedTextureWidth * Math.abs(this._object._scaleX);
        this._cachedHeight = this._cachedTextureHeight * Math.abs(this._object._scaleY);
    } else {
        this._sprite.setVisible(false);
        this._cachedWidth = 0;
        this._cachedHeight = 0;
    }

    this._spriteDirty = false;
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.update = function() {
    this._spriteDirty = true;
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateX = function() {
    var xPos = this._object.x + (this._object._animationFrame.center.x - this._object._animationFrame.origin.x)*Math.abs(this._object._scaleX);
    this._sprite.setPositionX(xPos);
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateY = function() {
    var yPos = this._object.y + (this._object._animationFrame.center.y - this._object._animationFrame.origin.y)*Math.abs(this._object._scaleY);
    this._sprite.setPositionY(this._convertYPosition(yPos));
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateAngle = function() {
    this._sprite.setRotation(this._object.getAngle());
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateOpacity = function() {
    this._sprite.setOpacity(this._object.opacity);
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.updateVisibility = function() {
    this._sprite.setVisible(!this._object.hidden);
}

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.setColor = function(rgbColor) {
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this._sprite.setColor(cc.color(
        parseInt(colors[0]), parseInt(colors[1]), parseInt(colors[2]))
    );
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getColor = function() {
    var color = this._sprite.getColor();
    return color.r + ';' + color.g + ';' + color.b;
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getWidth = function() {
    if ( this._spriteDirty ) this._updateCocosSprite();
    return this._cachedWidth || 0;
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getHeight = function() {
    if ( this._spriteDirty ) this._updateCocosSprite();
    return this._cachedHeight || 0;
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getUnscaledWidth = function() {
    return this._cachedTextureWidth || 0;
};

gdjs.SpriteRuntimeObjectCocosRenderer.prototype.getUnscaledHeight = function() {
    return this._cachedTextureHeight || 0;
};

gdjs.SpriteRuntimeObjectCocosRenderer.getAnimationFrame = function(imageManager, imageName) {
    return imageManager.getTexture(imageName);
};

gdjs.SpriteRuntimeObjectCocosRenderer.getAnimationFrameWidth = function(texture) {
    return texture.pixelsWidth;
};

gdjs.SpriteRuntimeObjectCocosRenderer.getAnimationFrameHeight = function(texture) {
    return texture.pixelsHeight;
};
