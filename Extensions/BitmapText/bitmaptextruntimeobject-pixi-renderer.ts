namespace gdjs {
  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   */
  export class BitmapTextRuntimeObjectPixiRenderer {
    _object: gdjs.BitmapTextRuntimeObject;
    _pixiObject: PIXI.BitmapText;

    /**
     * @param runtimeObject The object to render
     * @param runtimeScene The gdjs.RuntimeScene in which the object is
     */
    constructor(
      runtimeObject: gdjs.BitmapTextRuntimeObject,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._object = runtimeObject;

      const bitmapFont = runtimeScene
        .getGame()
        .getBitmapFontManager()
        .getBitmapFontFromData(
          runtimeObject._bitmapFontResourceName,
          runtimeObject._textureAtlasResourceName
        );
      this._pixiObject = new PIXI.BitmapText(runtimeObject._text, {
        fontName: bitmapFont.font,
        fontSize: bitmapFont.size,
      });

      // Mark the font as used
      runtimeScene
        .getGame()
        .getBitmapFontManager()
        .setFontUsed(bitmapFont.font);

      // Set the object on the scene
      runtimeScene
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
      // Mark the font from the object not used anymore.
      this._object._runtimeScene
        .getGame()
        .getBitmapFontManager()
        .removeFontUsed(this._pixiObject.fontName);
    }

    getFontSize() {
      return this._pixiObject.fontSize;
    }

    updateFont(): void {
      // Get the new bitmap font to use
      const bitmapFont = this._object._runtimeScene
        .getGame()
        .getBitmapFontManager()
        .getBitmapFontFromData(
          this._object._bitmapFontResourceName,
          this._object._textureAtlasResourceName
        );

      // Mark the old font unused for the manager
      this._object._runtimeScene
        .getGame()
        .getBitmapFontManager()
        .removeFontUsed(this._pixiObject.fontName);

      // Update the font used for Pixi
      this._pixiObject.fontName = bitmapFont.font;
      this._pixiObject.fontSize = bitmapFont.size;

      // Mark the new font used for the manager
      this._object._runtimeScene
        .getGame()
        .getBitmapFontManager()
        .setFontUsed(this._pixiObject.fontName);
      this.updatePosition();
    }

    updateTint(): void {
      this._pixiObject.tint = gdjs.rgbToHexNumber(
        this._object._tint[0],
        this._object._tint[1],
        this._object._tint[2]
      );
      this._pixiObject.dirty = true;
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
      this._pixiObject.scale.set(Math.max(this._object._scale, 0));
      this.updatePosition();
    }

    getScale() {
      return Math.max(this._pixiObject.scale.x, this._pixiObject.scale.y);
    }

    updateWrappingWidth(): void {
      if (this._object._wordWrap) {
        this._pixiObject.maxWidth =
          this._object._wrappingWidth / this._object._scale;
        this._pixiObject.dirty = true;
      } else {
        this._pixiObject.maxWidth = 0;
        this._pixiObject.dirty = true;
      }
      this.updatePosition();
    }

    updateTextContent(): void {
      this._pixiObject.text = this._object._text;
      this.updatePosition();
    }

    updateAlignment(): void {
      this._pixiObject.align = this._object._align;
      this.updatePosition();
    }

    updatePosition(): void {
      this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._object.y + this._pixiObject.height / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    getWidth(): float {
      return this._pixiObject.textWidth;
    }

    getHeight(): float {
      return this._pixiObject.height;
    }
  }
  export const BitmapTextRuntimeObjectRenderer = BitmapTextRuntimeObjectPixiRenderer;
}
