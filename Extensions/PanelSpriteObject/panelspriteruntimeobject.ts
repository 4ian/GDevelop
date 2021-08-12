/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  export type PanelSpriteObjectDataType = {
    /** The right margin */
    rightMargin: number;
    /** The left margin */
    leftMargin: number;
    /** The top margin */
    topMargin: number;
    /** The bottom margin */
    bottomMargin: number;
    /** Are the central part and borders tiled? */
    tiled: boolean;
    /** The object width */
    width: number;
    /** The object height */
    height: number;
    /** The name of the resource containing the texture to use */
    texture: string;
  };

  export type PanelSpriteObjectData = ObjectData & PanelSpriteObjectDataType;

  /**
   * The PanelSpriteRuntimeObject displays a tiled texture.
   */
  export class PanelSpriteRuntimeObject extends gdjs.RuntimeObject {
    _rBorder: integer;
    _lBorder: integer;
    _tBorder: integer;
    _bBorder: integer;
    _tiled: boolean;
    opacity: float = 255;

    // Width and height can be stored because they do not depend on the
    // size of the texture being used (contrary to most objects).
    _width: float;
    _height: float;

    _renderer: gdjs.PanelSpriteRuntimeObjectRenderer;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param panelSpriteObjectData The initial properties of the object
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      panelSpriteObjectData: PanelSpriteObjectData
    ) {
      super(runtimeScene, panelSpriteObjectData);
      this._rBorder = panelSpriteObjectData.rightMargin;
      this._lBorder = panelSpriteObjectData.leftMargin;
      this._tBorder = panelSpriteObjectData.topMargin;
      this._bBorder = panelSpriteObjectData.bottomMargin;
      this._tiled = panelSpriteObjectData.tiled;
      this._width = panelSpriteObjectData.width;
      this._height = panelSpriteObjectData.height;
      this._renderer = new gdjs.PanelSpriteRuntimeObjectRenderer(
        this,
        runtimeScene,
        panelSpriteObjectData.texture,
        panelSpriteObjectData.tiled
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: PanelSpriteObjectData,
      newObjectData: PanelSpriteObjectData
    ): boolean {
      if (oldObjectData.width !== newObjectData.width) {
        this.setWidth(newObjectData.width);
      }
      if (oldObjectData.height !== newObjectData.height) {
        this.setHeight(newObjectData.height);
      }
      let updateTexture = false;
      if (oldObjectData.rightMargin !== newObjectData.rightMargin) {
        this._rBorder = newObjectData.rightMargin;
        updateTexture = true;
      }
      if (oldObjectData.leftMargin !== newObjectData.leftMargin) {
        this._lBorder = newObjectData.leftMargin;
        updateTexture = true;
      }
      if (oldObjectData.topMargin !== newObjectData.topMargin) {
        this._tBorder = newObjectData.topMargin;
        updateTexture = true;
      }
      if (oldObjectData.bottomMargin !== newObjectData.bottomMargin) {
        this._bBorder = newObjectData.bottomMargin;
        updateTexture = true;
      }
      if (oldObjectData.texture !== newObjectData.texture) {
        updateTexture = true;
      }
      if (updateTexture) {
        this.setTexture(newObjectData.texture, this._runtimeScene);
      }
      if (oldObjectData.tiled !== newObjectData.tiled) {
        return false;
      }
      return true;
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    onDestroyFromScene(runtimeScene): void {
      super.onDestroyFromScene(runtimeScene);
      // @ts-ignore
      if (this._renderer.onDestroy) {
        // @ts-ignore
        this._renderer.onDestroy();
      }
    }

    update(runtimeScene: gdjs.RuntimeScene): void {
      super.update(runtimeScene);
      this._renderer.ensureUpToDate();
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
     * Set the x position of the panel sprite.
     * @param x The new x position in pixels.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set the y position of the panel sprite.
     * @param y The new y position in pixels.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the texture of the panel sprite.
     * @param textureName The name of the texture.
     * @param runtimeScene The scene the object lives in.
     */
    setTexture(textureName: string, runtimeScene: gdjs.RuntimeScene): void {
      this._renderer.setTexture(textureName, runtimeScene);
    }

    /**
     * Set the angle of the panel sprite.
     * @param angle The new angle in degrees.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Get the width of the panel sprite in pixels
     * @return The width in pixels
     */
    getWidth(): float {
      return this._width;
    }

    /**
     * Get the height of the panel sprite in pixels
     * @return The height in pixels
     */
    getHeight(): float {
      return this._height;
    }

    /**
     * Set the width of the panel sprite.
     * @param width The new width in pixels.
     */
    setWidth(width: float): void {
      if (this._width === width) return;

      this._width = width;
      this._renderer.updateWidth();
      this.hitBoxesDirty = true;
    }

    /**
     * Set the height of the panel sprite.
     * @param height The new height in pixels.
     */
    setHeight(height: float): void {
      if (this._height === height) return;

      this._height = height;
      this._renderer.updateHeight();
      this.hitBoxesDirty = true;
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
     * Change the tint of the panel sprite object.
     *
     * @param rgbColor The color, in RGB format ("128;200;255").
     */
    setColor(rgbColor: string): void {
      this._renderer.setColor(rgbColor);
    }

    /**
     * Get the tint of the panel sprite object.
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
    'PanelSpriteObject::PanelSprite',
    gdjs.PanelSpriteRuntimeObject
  );
}
