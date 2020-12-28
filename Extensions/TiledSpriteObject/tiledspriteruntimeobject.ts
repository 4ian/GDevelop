/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Initial properties for a Tiled Sprite object */
  export type TiledSpriteObjectDataType = {
    /** The width of the object */
    width: number;
    /** The height of the object */
    height: number;
  };

  export type TiledSpriteObjectData = ObjectData & TiledSpriteObjectDataType;

  /**
   * The TiledSpriteRuntimeObject displays a tiled texture.
   *
   * @class TiledSpriteRuntimeObject
   * @extends RuntimeObject
   * @memberof gdjs
   */
  export class TiledSpriteRuntimeObject extends gdjs.RuntimeObject {
    _xOffset: float = 0;
    _yOffset: float = 0;
    opacity: float = 255;
    _renderer: gdjs.TiledSpriteRuntimeObjectRenderer;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param tiledSpriteObjectData The initial properties of the object
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      tiledSpriteObjectData: TiledSpriteObjectData
    ) {
      super(runtimeScene, tiledSpriteObjectData);
      this._renderer = new gdjs.TiledSpriteRuntimeObjectRenderer(
        this,
        runtimeScene,
        (tiledSpriteObjectData as any).texture
      );
      this.setWidth(tiledSpriteObjectData.width);
      this.setHeight(tiledSpriteObjectData.height);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(oldObjectData, newObjectData): boolean {
      if (oldObjectData.texture !== newObjectData.texture) {
        this.setTexture(newObjectData.texture, this._runtimeScene);
      }
      if (oldObjectData.width !== newObjectData.width) {
        this.setWidth(newObjectData.width);
      }
      if (oldObjectData.height !== newObjectData.height) {
        this.setHeight(newObjectData.height);
      }
      return true;
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    onDestroyFromScene(runtimeScene): void {
      super.onDestroyFromScene(runtimeScene);
      if ((this._renderer as any).onDestroy) {
        (this._renderer as any).onDestroy();
      }
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    /**
     * Set the X position of the Tiled Sprite object.
     * @param x The new X position.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set the Y position of the Tiled Sprite object.
     * @param y The new Y position.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Assign a new texture to the Tiled Sprite object.
     * @param textureName The name of the image texture ressource.
     * @param runtimeScene The scene in which the texture is used.
     */
    setTexture(textureName: string, runtimeScene: gdjs.RuntimeScene): void {
      this._renderer.setTexture(textureName, runtimeScene);
    }

    /**
     * Set the angle of the Tiled Sprite object.
     * @param angle The new angle.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Get the width of the Tiled Sprite object.
     * @returns The width of the Tiled Sprite object
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the Tiled Sprite object.
     * @returns The height of the Tiled Sprite object
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }

    /**
     * Set the width of the Tiled Sprite object.
     * @param width The new width.
     */
    setWidth(width: float): void {
      this._renderer.setWidth(width);
    }

    /**
     * Set the height of the Tiled Sprite object.
     * @param height The new height.
     */
    setHeight(height: float): void {
      this._renderer.setHeight(height);
    }

    /**
     * Set the offset on the X-axis when displaying the image of the Tiled Sprite object.
     * @param xOffset The new offset on the X-axis.
     */
    setXOffset(xOffset: number): void {
      this._xOffset = xOffset;
      this._renderer.updateXOffset();
    }

    /**
     * Set the offset on the Y-axis when displaying the image of the Tiled Sprite object.
     * @param yOffset The new offset on the Y-axis.
     */
    setYOffset(yOffset: number): void {
      this._yOffset = yOffset;
      this._renderer.updateYOffset();
    }

    /**
     * Get the offset on the X-axis of the Tiled Sprite object.
     * @returns The offset on the X-axis
     */
    getXOffset(): number {
      return this._xOffset;
    }

    /**
     * Get the offset on the Y-axis of the Tiled Sprite object.
     * @returns The offset on the Y-axis
     */
    getYOffset(): number {
      return this._yOffset;
    }

    /**
     * Change the transparency of the object.
     * @param opacity The new opacity, between 0 (transparent) and 255 (opaque).
     */
    setOpacity(opacity: float): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this.opacity = opacity;
      this._renderer.updateOpacity();
    }

    /**
     * Get the transparency of the object.
     * @return The opacity, between 0 (transparent) and 255 (opaque).
     */
    getOpacity(): number {
      return this.opacity;
    }

    /**
     * Change the tint of the tiled sprite object.
     *
     * @param rgbColor The color, in RGB format ("128;200;255").
     */
    setColor(rgbColor: string): void {
      this._renderer.setColor(rgbColor);
    }

    /**
     * Get the tint of the tiled sprite object.
     *
     * @returns The color, in RGB format ("128;200;255").
     */
    getColor(): string {
      return this._renderer.getColor();
    }
  }
  gdjs.registerObject(
    'TiledSpriteObject::TiledSprite',
    gdjs.TiledSpriteRuntimeObject
  );
}
