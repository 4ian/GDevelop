namespace gdjs {
  /**
   * The PIXI.js renderer for the DummyRuntimeObject.
   * @ignore
   */
  export class DummyRuntimeObjectPixiRenderer {
    _object: gdjs.DummyRuntimeObject;
    _text: any;

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The gdjs.RuntimeScene in which the object is
     */
    constructor(
      runtimeObject: gdjs.DummyRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;

      // Keep a reference to the object to read from it later.

      // Here we're going to create a dummy text as an example.
      if (this._text === undefined) {
        this._text = new PIXI.Text(runtimeObject.getText(), { align: 'left' });
      }

      // You can also create a PIXI sprite or other PIXI object
      // this._imageManager = instanceContainer.getGame().getImageManager();
      // if ( this._sprite === undefined )
      //     this._sprite = new PIXI.Sprite(this._imageManager.getInvalidPIXITexture());
      this._text.anchor.x = 0.5;
      this._text.anchor.y = 0.5;
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._text, runtimeObject.getZOrder());
      this.updatePosition();
    }

    getRendererObject() {
      // Mandatory, return the internal PIXI object used for your object:
      return this._text;
    }

    ensureUpToDate() {
      this.updatePosition();
    }

    updateText(): void {
      this._text.text = this._object.getText();
    }

    updatePosition(): void {
      this._text.position.x = this._object.x + this._text.width / 2;
      this._text.position.y = this._object.y + this._text.height / 2;
    }

    updateAngle(): void {
      this._text.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._text.alpha = this._object.opacity / 255;
    }

    getWidth(): float {
      return this._text.width;
    }

    getHeight(): float {
      return this._text.height;
    }
  }

  // Register the class to let the engine use it.
  export const DummyRuntimeObjectRenderer = DummyRuntimeObjectPixiRenderer;
  export type DummyRuntimeObjectRenderer = DummyRuntimeObjectPixiRenderer;
}
