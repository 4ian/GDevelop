namespace gdjs {
  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   */
  export class BitmapTextRuntimeObjectPixiRenderer {
    _object: gdjs.BitmapTextRuntimeObject;
    _pixiObject: PIXI.BitmapText;

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The container in which the object is
     */
    constructor(
      runtimeObject: gdjs.BitmapTextRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;

      // Obtain the bitmap font to use in the object.
      const bitmapFont = instanceContainer
        .getGame()
        .getBitmapFontManager()
        .obtainBitmapFont(
          runtimeObject._bitmapFontResourceName,
          runtimeObject._textureAtlasResourceName
        );
      if (bitmapFont) {
        this._pixiObject = new PIXI.BitmapText({
          text: runtimeObject._text,
          style: {
            fontFamily: bitmapFont.fontFamily,
            fontSize: bitmapFont.fontMetrics.fontSize,
          },
        });
      } else {
        const defaultBitmapFontName = instanceContainer
          .getGame()
          .getBitmapFontManager()
          .getDefaultBitmapFont();
        this._pixiObject = new PIXI.BitmapText({
          text: runtimeObject._text,
          style: {
            fontFamily: defaultBitmapFontName,
            fontSize: 20,
          },
        });
      }

      // Set the object on the scene
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

      // Set the anchor in the center, so that the object rotates around
      // its center.
      // @ts-ignore
      this._pixiObject.anchor.x = 0.5;
      // @ts-ignore
      this._pixiObject.anchor.y = 0.5;

      this.updateAlignment();
      this.updateTextContent();
      this.updateAngle();
      this.updateOpacity();
      this.updateScale();
      this.updateWrappingWidth();
      this.updateTint();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    onDestroy() {
      // Mark the font from the object as not used anymore.
      this._object
        .getInstanceContainer()
        .getGame()
        .getBitmapFontManager()
        .releaseBitmapFont(
          Array.isArray(this._pixiObject.style.fontFamily)
            ? this._pixiObject.style.fontFamily[0]
            : this._pixiObject.style.fontFamily
        );

      this._pixiObject.destroy();
    }

    getFontSize() {
      return this._pixiObject.style.fontSize;
    }

    updateFont(): void {
      // Get the new bitmap font to use
      const bitmapFont = this._object
        .getInstanceContainer()
        .getGame()
        .getBitmapFontManager()
        .obtainBitmapFont(
          this._object._bitmapFontResourceName,
          this._object._textureAtlasResourceName
        );

      // Mark the old font as not used anymore
      this._object
        .getInstanceContainer()
        .getGame()
        .getBitmapFontManager()
        .releaseBitmapFont(
          Array.isArray(this._pixiObject.style.fontFamily)
            ? this._pixiObject.style.fontFamily[0]
            : this._pixiObject.style.fontFamily
        );

      // Update the font used by the object:
      if (bitmapFont) {
        this._pixiObject.style.fontFamily = bitmapFont.fontFamily;
        this._pixiObject.style.fontSize = bitmapFont.fontMetrics.fontSize;
        this.updatePosition();
      }
    }

    updateTint(): void {
      this._pixiObject.tint = gdjs.rgbToHexNumber(
        this._object._tint[0],
        this._object._tint[1],
        this._object._tint[2]
      );
    }

    /**
     * Get the tint of the bitmap object as a "R;G;B" string.
     * @returns the tint of bitmap object in "R;G;B" format.
     */
    getTint(): string {
      return (
        this._object._tint[0] +
        ';' +
        this._object._tint[1] +
        ';' +
        this._object._tint[2]
      );
    }

    updateScale(): void {
      this._pixiObject.scale.set(
        Math.max(this._object._scaleX, 0),
        Math.max(this._object._scaleY, 0)
      );
      this.updatePosition();
    }

    getScale() {
      return Math.max(this._pixiObject.scale.x, this._pixiObject.scale.y);
    }

    updateWrappingWidth(): void {
      if (this._object._wordWrap) {
        this._pixiObject.style.wordWrap = true;
        this._pixiObject.style.wordWrapWidth =
          this._object._wrappingWidth / this._object._scaleX;
      } else {
        this._pixiObject.style.wordWrap = false;
        this._pixiObject.style.wordWrapWidth = 0;
      }
      this.updatePosition();
    }

    updateTextContent(): void {
      this._pixiObject.text = this._object._text;
      this.updatePosition();
    }

    updateAlignment(): void {
      // @ts-ignore - assume align is always a valid value.
      this._pixiObject.align = this._object._align;
      this.updatePosition();
    }

    updatePosition(): void {
      this._pixiObject.position.x = this._object.x + this.getWidth() / 2;
      this._pixiObject.position.y = this._object.y + this.getHeight() / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    getWidth(): float {
      return this._pixiObject.width * this.getScale();
    }

    getHeight(): float {
      return this._pixiObject.height * this.getScale();
    }
  }
  export const BitmapTextRuntimeObjectRenderer =
    BitmapTextRuntimeObjectPixiRenderer;
}
