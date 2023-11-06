namespace gdjs {
  /**
   * The renderer for a gdjs.SpriteRuntimeObject using Pixi.js.
   */
  export class SpriteRuntimeObjectPixiRenderer {
    _object: gdjs.SpriteRuntimeObject;
    _spriteDirty: boolean = true;
    _textureDirty: boolean = true;
    _sprite: PIXI.Sprite;
    _cachedWidth: float = 0;
    _cachedHeight: float = 0;

    /**
     * @param runtimeObject The object
     * @param instanceContainer The scene
     */
    constructor(
      runtimeObject: gdjs.SpriteRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._sprite = new PIXI.Sprite(
        instanceContainer.getGame().getImageManager().getInvalidPIXITexture()
      );
      const layer = instanceContainer.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._sprite, runtimeObject.getZOrder());
      }
    }

    reinitialize(
      runtimeObject: gdjs.SpriteRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._spriteDirty = true;
      this._textureDirty = true;
      this._sprite.tint = 0xffffff;
      const layer = instanceContainer.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._sprite, runtimeObject.getZOrder());
      }
    }

    getRendererObject() {
      return this._sprite;
    }

    /**
     * Update the internal PIXI.Sprite position, angle...
     */
    _updatePIXISprite() {
      const spriteTextureFrame = this._sprite.texture.frame;
      const objectAnimationFrame = this._object._animationFrame;

      if (objectAnimationFrame !== null && !!spriteTextureFrame) {
        this._sprite.anchor.x =
          objectAnimationFrame.center.x / spriteTextureFrame.width;
        this._sprite.anchor.y =
          objectAnimationFrame.center.y / spriteTextureFrame.height;
        this._sprite.position.x =
          this._object.x +
          (objectAnimationFrame.center.x - objectAnimationFrame.origin.x) *
            Math.abs(this._object._scaleX);
        this._sprite.position.y =
          this._object.y +
          (objectAnimationFrame.center.y - objectAnimationFrame.origin.y) *
            Math.abs(this._object._scaleY);
        this._sprite.rotation = gdjs.toRad(this._object.angle);
        this._sprite.visible = !this._object.hidden;
        this._sprite.blendMode = this._object._blendMode;
        this._sprite.alpha = this._object.opacity / 255;
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
    }

    /**
     * Call this to make sure the sprite is ready to be rendered.
     */
    ensureUpToDate() {
      if (this._spriteDirty) {
        this._updatePIXISprite();
      }
    }

    /**
     * Update the internal texture of the PIXI sprite.
     */
    updateFrame(animationFrame): void {
      this._spriteDirty = true;
      this._sprite.texture = animationFrame.texture;
    }

    update(): void {
      this._spriteDirty = true;
    }

    updateX(): void {
      const animationFrame = this._object
        ._animationFrame as SpriteAnimationFrame;
      this._sprite.position.x =
        this._object.x +
        (animationFrame.center.x - animationFrame.origin.x) *
          Math.abs(this._object._scaleX);
    }

    updateY(): void {
      const animationFrame = this._object
        ._animationFrame as SpriteAnimationFrame;
      this._sprite.position.y =
        this._object.y +
        (animationFrame.center.y - animationFrame.origin.y) *
          Math.abs(this._object._scaleY);
    }

    updateAngle(): void {
      this._sprite.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._sprite.alpha = this._object.opacity / 255;
    }

    updateVisibility(): void {
      this._sprite.visible = !this._object.hidden;
    }

    setColor(rgbColor): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this._sprite.tint = gdjs.rgbToHexNumber(
        parseInt(colors[0], 10),
        parseInt(colors[1], 10),
        parseInt(colors[2], 10)
      );
    }

    getColor() {
      const rgb = new PIXI.Color(this._sprite.tint).toRgbArray();
      return (
        Math.floor(rgb[0] * 255) +
        ';' +
        Math.floor(rgb[1] * 255) +
        ';' +
        Math.floor(rgb[2] * 255)
      );
    }

    getWidth(): float {
      if (this._spriteDirty) {
        this._updatePIXISprite();
      }
      return this._cachedWidth;
    }

    getHeight(): float {
      if (this._spriteDirty) {
        this._updatePIXISprite();
      }
      return this._cachedHeight;
    }

    getUnscaledWidth(): float {
      const spriteTextureFrame = this._sprite.texture.frame;
      if (!spriteTextureFrame) {
        return 32;
      }
      return spriteTextureFrame.width;
    }

    getUnscaledHeight(): float {
      const spriteTextureFrame = this._sprite.texture.frame;
      if (!spriteTextureFrame) {
        return 32;
      }
      return spriteTextureFrame.height;
    }

    static getAnimationFrame(imageManager, imageName) {
      return imageManager.getPIXITexture(imageName);
    }

    static getAnimationFrameWidth(pixiTexture) {
      return pixiTexture.width;
    }

    static getAnimationFrameHeight(pixiTexture) {
      return pixiTexture.height;
    }
  }

  // Register the class to let the engine use it.
  export const SpriteRuntimeObjectRenderer = SpriteRuntimeObjectPixiRenderer;
  export type SpriteRuntimeObjectRenderer = SpriteRuntimeObjectPixiRenderer;
}
