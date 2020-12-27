namespace gdjs {
  /**
   * The renderer for a gdjs.SpriteRuntimeObject using Pixi.js.
   * @class SpriteRuntimeObjectPixiRenderer
   * @memberof gdjs
   */
  export class SpriteRuntimeObjectPixiRenderer {
    _object: gdjs.SpriteRuntimeObject;
    _spriteDirty: boolean = true;
    _textureDirty: boolean = true;
    _sprite: any;
    _cachedWidth: float = 0;
    _cachedHeight: float = 0;

    /**
     * @param runtimeObject The object
     * @param runtimeScene The scene
     */
    constructor(
      runtimeObject: gdjs.SpriteRuntimeObject,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._object = runtimeObject;
      if (this._sprite === undefined) {
        this._sprite = new PIXI.Sprite(
          runtimeScene.getGame().getImageManager().getInvalidPIXITexture()
        );
      }
      const layer = runtimeScene.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._sprite, runtimeObject.getZOrder());
      }
    }

    reinitialize(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._spriteDirty = true;
      this._textureDirty = true;
      const layer = runtimeScene.getLayer('');
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
      if (this._object._animationFrame !== null) {
        this._sprite.anchor.x =
          this._object._animationFrame.center.x /
          this._sprite.texture.frame.width;
        this._sprite.anchor.y =
          this._object._animationFrame.center.y /
          this._sprite.texture.frame.height;
        this._sprite.position.x =
          this._object.x +
          (this._object._animationFrame.center.x -
            this._object._animationFrame.origin.x) *
            Math.abs(this._object._scaleX);
        this._sprite.position.y =
          this._object.y +
          (this._object._animationFrame.center.y -
            this._object._animationFrame.origin.y) *
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
      this._sprite.tint =
        '0x' +
        gdjs.rgbToHex(
          parseInt(colors[0], 10),
          parseInt(colors[1], 10),
          parseInt(colors[2], 10)
        );
    }

    getColor() {
      const rgb = PIXI.utils.hex2rgb(this._sprite.tint);
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
      return this._sprite.texture.frame.width;
    }

    getUnscaledHeight(): float {
      return this._sprite.texture.frame.height;
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
