/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Initial properties for a Tiled Sprite object */
  export type TiledSpriteObjectDataType = {
    /** Default width of the object, if the instance has no custom width. */
    width: number;
    /** Default height of the object, if the instance has no custom height. */
    height: number;
    texture: string;
  };

  export type TiledSpriteObjectData = ObjectData & TiledSpriteObjectDataType;

  /**
   * The TiledSpriteRuntimeObject displays a tiled texture.
   */
  export class TiledSpriteRuntimeObject extends gdjs.RuntimeObject {
    _xOffset: float = 0;
    _yOffset: float = 0;
    opacity: float = 255;

    // Width and height can be stored because they do not depend on the
    // size of the texture being used (contrary to most objects).
    _width: float;
    _height: float;

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
        tiledSpriteObjectData.texture
      );
      this._width = 0;
      this._height = 0;
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
      return this._width;
    }

    /**
     * Get the height of the Tiled Sprite object.
     * @returns The height of the Tiled Sprite object
     */
    getHeight(): float {
      return this._height;
    }

    /**
     * Set the width of the Tiled Sprite object.
     * @param width The new width.
     */
    setWidth(width: float): void {
      if (this._width === width) return;

      this._width = width;
      this._renderer.setWidth(width);
      this.hitBoxesDirty = true;
    }

    /**
     * Set the height of the Tiled Sprite object.
     * @param height The new height.
     */
    setHeight(height: float): void {
      if (this._height === height) return;

      this._height = height;
      this._renderer.setHeight(height);
      this.hitBoxesDirty = true;
    }

    /**
     * Set the size of the Tiled Sprite object.
     * @param width The new width.
     * @param height The new height.
     */
    setSize(width: float, height: float): void {
      this.setWidth(width);
      this.setHeight(height);
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

    // Implement support for get/set scale:

    /**
     * Get scale of the tiled sprite object.
     */
    getScale(): float {
      return (this.getScaleX() + this.getScaleY()) / 2.0;
    }

    /**
     * Get x-scale of the tiled sprite object.
     */
    getScaleX(): float {
      return this._width / this._renderer.getTextureWidth();
    }

    /**
     * Get y-scale of the tiled sprite object.
     */
    getScaleY(): float {
      return this._height / this._renderer.getTextureHeight();
    }

    /**
     * Set the tiled sprite object scale.
     * @param newScale The new scale for the tiled sprite object.
     */
    setScale(newScale: float): void {
      this.setWidth(this._renderer.getTextureWidth() * newScale);
      this.setHeight(this._renderer.getTextureHeight() * newScale);
    }

    /**
     * Set the tiled sprite object x-scale.
     * @param newScale The new x-scale for the tiled sprite object.
     */
    setScaleX(newScale: float): void {
      this.setWidth(this._renderer.getTextureWidth() * newScale);
    }

    /**
     * Set the tiled sprite object y-scale.
     * @param newScale The new y-scale for the tiled sprite object.
     */
    setScaleY(newScale: float): void {
      this.setHeight(this._renderer.getTextureHeight() * newScale);
    }
  }
  gdjs.registerObject(
    'TiledSpriteObject::TiledSprite',
    gdjs.TiledSpriteRuntimeObject
  );
}
