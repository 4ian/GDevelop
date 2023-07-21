namespace gdjs {
  /** Base parameters for {@link gdjs.SpineRuntimeObject} */
  export type SpineObjectDataType = {
    /** The base parameters of the Bitmap Text */
    content: {
      /** The opacity of the text. */
      opacity: float;
      /** The scale of the spine. */
      scale: float;
      jsonResourceName: string;
      atlasResourceName: string;
      imageResourceName: string;
    };
  };
  export type SpineObjectData = ObjectData & SpineObjectDataType;

  /**
   * Displays a text using a "Bitmap Font", generated in a external editor like bmFont.
   * This is more efficient/faster to render than a traditional text (which needs
   * to have its whole texture re-rendered anytime it changes).
   *
   * Bitmap Font can be created with softwares like:
   * * BMFont (Windows, free): http://www.angelcode.com/products/bmfont/|http://www.angelcode.com/products/bmfont/
   * * Glyph Designer (OS X, commercial): http://www.71squared.com/en/glyphdesigner|http://www.71squared.com/en/glyphdesigner
   * * Littera (Web-based, free): http://kvazars.com/littera/|http://kvazars.com/littera/
   */
  export class SpineRuntimeObject extends gdjs.RuntimeObject {
    _opacity: float;
    _scale: number;

    _renderer: gdjs.SpineRuntimeObjectPixiRenderer;

    jsonResourceName: string;
    atlasResourceName: string;
    imageResourceName: string;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: SpineObjectData
    ) {
      super(instanceContainer, objectData);

      this._opacity = objectData.content.opacity;
      this._scale = objectData.content.scale;
      this.jsonResourceName = objectData.content.jsonResourceName;
      this.atlasResourceName = objectData.content.atlasResourceName;
      this.imageResourceName = objectData.content.imageResourceName;

      this._renderer = new gdjs.SpineRuntimeObjectRenderer(
        this,
        instanceContainer
      );


      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    // @ts-ignore
    updateFromObjectData(
      oldObjectData: SpineObjectDataType,
      newObjectData: SpineObjectDataType
    ): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (oldObjectData.content.scale !== newObjectData.content.scale) {
        this.setScale(newObjectData.content.scale);
      }

      return true;
    }

    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      super.onDestroyFromScene(instanceContainer);
      this._renderer.onDestroy();
    }

    setScale(scale: float): void {
      this._scale = scale;
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    getScale(): float {
      return this._scale;
    }

    getFontSize(): float {
      return this._renderer.getFontSize();
    }

    /**
     * Set object position on X axis.
     * @param x The new position X of the object.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set object position on Y axis.
     * @param y The new position Y of the object.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Set object opacity.
     * @param opacity The new opacity of the object (0-255).
     */
    setOpacity(opacity: float): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this._opacity = opacity;
      this._renderer.updateOpacity();
    }

    /**
     * Get object opacity.
     */
    getOpacity(): float {
      return this._opacity;
    }

    /**
     * Get the width of the object.
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the object.
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }
  }
  gdjs.registerObject(
    'Spine::SpineObject',
    // @ts-ignore
    gdjs.SpineRuntimeObject
  );
}
