namespace gdjs {
  export interface PixiImageManager {
    _pixiAnimationFrameTextureManager: PixiAnimationFrameTextureManager;
  }
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
      const imageManager = instanceContainer.getGame().getImageManager();
      this._sprite = new PIXI.Sprite(imageManager.getInvalidPIXITexture());
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
      const animationFrame = this._object._animator.getCurrentFrame();
      if (animationFrame !== null) {
        this._sprite.anchor.x =
          animationFrame.center.x / this._sprite.texture.frame.width;
        this._sprite.anchor.y =
          animationFrame.center.y / this._sprite.texture.frame.height;
        this._sprite.position.x =
          this._object.x +
          (animationFrame.center.x - animationFrame.origin.x) *
            Math.abs(this._object._scaleX);
        this._sprite.position.y =
          this._object.y +
          (animationFrame.center.y - animationFrame.origin.y) *
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
    updateFrame(animationFrame: gdjs.SpriteAnimationFrame<PIXI.Texture>): void {
      this._spriteDirty = true;
      this._sprite.texture = animationFrame.texture;
    }

    update(): void {
      this._spriteDirty = true;
    }

    updateX(): void {
      const animationFrame = this._object._animator.getCurrentFrame() as SpriteAnimationFrame<
        PIXI.Texture
      >;
      this._sprite.position.x =
        this._object.x +
        (animationFrame.center.x - animationFrame.origin.x) *
          Math.abs(this._object._scaleX);
    }

    updateY(): void {
      const animationFrame = this._object._animator.getCurrentFrame() as SpriteAnimationFrame<
        PIXI.Texture
      >;
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
      return this._sprite.texture.frame.width;
    }

    getUnscaledHeight(): float {
      return this._sprite.texture.frame.height;
    }

    static getAnimationFrameTextureManager(
      imageManager: gdjs.PixiImageManager
    ): PixiAnimationFrameTextureManager {
      if (!imageManager._pixiAnimationFrameTextureManager) {
        imageManager._pixiAnimationFrameTextureManager = new PixiAnimationFrameTextureManager(
          imageManager
        );
      }
      return imageManager._pixiAnimationFrameTextureManager;
    }
  }

  class PixiAnimationFrameTextureManager
    implements gdjs.AnimationFrameTextureManager<PIXI.Texture> {
    private _imageManager: gdjs.PixiImageManager;

    constructor(imageManager: gdjs.PixiImageManager) {
      this._imageManager = imageManager;
    }

    getAnimationFrameTexture(imageName: string) {
      return this._imageManager.getPIXITexture(imageName);
    }

    getAnimationFrameWidth(pixiTexture: PIXI.Texture) {
      return pixiTexture.width;
    }

    getAnimationFrameHeight(pixiTexture: PIXI.Texture) {
      return pixiTexture.height;
    }
  }

  // Register the class to let the engine use it.
  export const SpriteRuntimeObjectRenderer = SpriteRuntimeObjectPixiRenderer;
  export type SpriteRuntimeObjectRenderer = SpriteRuntimeObjectPixiRenderer;
}
