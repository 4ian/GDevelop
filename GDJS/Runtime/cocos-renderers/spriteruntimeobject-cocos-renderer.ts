/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class SpriteRuntimeObjectCocosRenderer {
    _object: any;
    _sprite: any;
    _currentBlendMode: any = undefined;
    _convertYPosition: any;
    _spriteDirty: any;
    _cachedTextureWidth: float = 0;
    _cachedTextureHeight: float = 0;

    // Note that for width/height, there is this._sprite.width/height
    // but it could be not up-to-date with the scale.
    _cachedWidth: float = 0;
    _cachedHeight: float = 0;

    constructor(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._sprite = new cc.Sprite(
        runtimeScene.getGame().getImageManager().getInvalidTexture()
      );
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
    }

    // Same as the constructor - we don't really support reinitialization.
    reinitialize(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._sprite = new cc.Sprite(
        runtimeScene.getGame().getImageManager().getInvalidTexture()
      );
      this._currentBlendMode = undefined;
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
    }

    getRendererObject() {
      return this._sprite;
    }

    ensureUpToDate() {
      if (this._spriteDirty) {
        this._updateCocosSprite();
      }
    }

    updateFrame(animationFrame): void {
      this._spriteDirty = true;

      //TODO Perf: Avoid calling cc.SpriteFrame.createWithTexture each time updateFrame is called?
      const spriteFrame = cc.SpriteFrame.createWithTexture(
        animationFrame.texture,
        cc.rect(
          0,
          0,
          animationFrame.texture.pixelsWidth,
          animationFrame.texture.pixelsHeight
        )
      );
      this._cachedTextureWidth = animationFrame.texture.pixelsWidth;
      this._cachedTextureHeight = animationFrame.texture.pixelsHeight;
      this._sprite.setSpriteFrame(spriteFrame);
    }

    _updateCocosSprite() {
      if (this._object._animationFrame !== null) {
        this._sprite.setAnchorPoint(
          cc.p(
            this._object._flippedX
              ? 1 -
                  this._object._animationFrame.center.x /
                    this._cachedTextureWidth
              : this._object._animationFrame.center.x /
                  this._cachedTextureWidth,
            //Cocos Y axis is inverted
            this._object._flippedY
              ? this._object._animationFrame.center.y /
                  this._cachedTextureHeight
              : 1 -
                  this._object._animationFrame.center.y /
                    this._cachedTextureHeight
          )
        );
        const xPos =
          this._object.x +
          (this._object._animationFrame.center.x -
            this._object._animationFrame.origin.x) *
            Math.abs(this._object._scaleX);
        const yPos =
          this._object.y +
          (this._object._animationFrame.center.y -
            this._object._animationFrame.origin.y) *
            Math.abs(this._object._scaleY);
        this._sprite.setPositionX(xPos);
        this._sprite.setPositionY(this._convertYPosition(yPos));
        this._sprite.setRotation(this._object.angle);
        this._sprite.setVisible(!this._object.hidden);
        this._sprite.setOpacity(this._object.opacity);
        this._sprite.setScale(
          this._object.getScaleX(),
          this._object.getScaleY()
        );
        this._sprite.setFlippedX(this._object._flippedX);
        this._sprite.setFlippedY(this._object._flippedY);
        if (this._currentBlendMode !== this._object._blendMode) {
          this._currentBlendMode = this._object._blendMode;
          this._sprite.setBlendFunc(
            this._currentBlendMode === 0
              ? cc.BlendFunc.ALPHA_PREMULTIPLIED
              : this._currentBlendMode === 1
              ? cc.BlendFunc.ADDITIVE
              : this._currentBlendMode === 2
              ? cc.BlendFunc.ALPHA_NON_PREMULTIPLIED
              : cc.BlendFunc.DISABLE
          );
        }
        this._cachedWidth =
          this._cachedTextureWidth * Math.abs(this._object._scaleX);
        this._cachedHeight =
          this._cachedTextureHeight * Math.abs(this._object._scaleY);
      } else {
        this._sprite.setVisible(false);
        this._cachedWidth = 0;
        this._cachedHeight = 0;
      }
      this._spriteDirty = false;
    }

    update(): void {
      this._spriteDirty = true;
    }

    updateX(): void {
      const xPos =
        this._object.x +
        (this._object._animationFrame.center.x -
          this._object._animationFrame.origin.x) *
          Math.abs(this._object._scaleX);
      this._sprite.setPositionX(xPos);
    }

    updateY(): void {
      const yPos =
        this._object.y +
        (this._object._animationFrame.center.y -
          this._object._animationFrame.origin.y) *
          Math.abs(this._object._scaleY);
      this._sprite.setPositionY(this._convertYPosition(yPos));
    }

    updateAngle(): void {
      this._sprite.setRotation(this._object.getAngle());
    }

    updateOpacity(): void {
      this._sprite.setOpacity(this._object.opacity);
    }

    updateVisibility(): void {
      this._sprite.setVisible(!this._object.hidden);
    }

    setColor(rgbColor): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this._sprite.setColor(
        cc.color(parseInt(colors[0]), parseInt(colors[1]), parseInt(colors[2]))
      );
    }

    getColor() {
      const color = this._sprite.getColor();
      return color.r + ';' + color.g + ';' + color.b;
    }

    getWidth(): float {
      if (this._spriteDirty) {
        this._updateCocosSprite();
      }
      return this._cachedWidth || 0;
    }

    getHeight(): float {
      if (this._spriteDirty) {
        this._updateCocosSprite();
      }
      return this._cachedHeight || 0;
    }

    getUnscaledWidth(): float {
      return this._cachedTextureWidth || 0;
    }

    getUnscaledHeight(): float {
      return this._cachedTextureHeight || 0;
    }

    static getAnimationFrame(imageManager, imageName) {
      return imageManager.getTexture(imageName);
    }

    static getAnimationFrameWidth(texture) {
      return texture.pixelsWidth;
    }

    static getAnimationFrameHeight(texture) {
      return texture.pixelsHeight;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const SpriteRuntimeObjectRenderer = SpriteRuntimeObjectCocosRenderer;
}
