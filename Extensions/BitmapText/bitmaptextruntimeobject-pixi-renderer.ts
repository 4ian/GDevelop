namespace gdjs {
  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   */
  export class BitmapTextRuntimeObjectPixiRenderer {
    _object: gdjs.BitmapTextRuntimeObject;
    _pixiObject: PIXI.Container;
    _text: PIXI.BitmapText;

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
      this._pixiObject = new PIXI.Container();
      this._text = new PIXI.BitmapText(runtimeObject._text, {
        fontName: bitmapFont.font,
        fontSize: bitmapFont.size,
      });
      this._pixiObject.addChild(this._text);

      // Set the object on the scene
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

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
        .releaseBitmapFont(this._text.fontName);

      this._pixiObject.destroy();
    }

    getFontSize() {
      return this._text.fontSize;
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
        .releaseBitmapFont(this._text.fontName);

      // Update the font used by the object:
      this._text.fontName = bitmapFont.font;
      this._text.fontSize = bitmapFont.size;
      this.updatePosition();
    }

    updateTint(): void {
      this._text.tint = gdjs.rgbToHexNumber(
        this._object._tint[0],
        this._object._tint[1],
        this._object._tint[2]
      );
      this._text.dirty = true;
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
      this._text.scale.set(
        Math.max(this._object._scaleX, 0),
        Math.max(this._object._scaleY, 0)
      );
      this.updatePosition();
    }

    getScale() {
      return Math.max(this._text.scale.x, this._text.scale.y);
    }

    updateWrappingWidth(): void {
      if (this._object._wrapping) {
        this._text.maxWidth =
          this._object._wrappingWidth / this._object._scaleX;
        this._text.dirty = true;
      } else {
        this._text.maxWidth = 0;
        this._text.dirty = true;
      }
      this.updatePosition();
    }

    updateTextContent(): void {
      this._text.text = this._object._text;
      this.updatePosition();
    }

    updateAlignment(): void {
      // @ts-ignore - assume align is always a valid value.
      this._text.align = this._object._textAlign;
      this.updatePosition();
    }

    updatePosition(): void {
      if (this._object.isWrapping()) {
        const alignmentX =
          this._object._textAlign === 'right'
            ? 1
            : this._object._textAlign === 'center'
              ? 0.5
              : 0;
        const width = this._object.getWrappingWidth();
        this._pixiObject.position.x = this._object.x + width / 2;
        this._text.position.x = width * (alignmentX - 0.5);
        this._text.anchor.x = alignmentX;
      } else {
        this._text.anchor.x = 0.5;
        const renderedWidth = this._text.width;
        this._pixiObject.position.x =
          this._object.x + renderedWidth / 2;
        this._text.position.x = 0;
      }
      const alignmentY =
        this._object._verticalTextAlignment === 'bottom'
          ? 1
          : this._object._verticalTextAlignment === 'center'
            ? 0.5
            : 0;
      this._text.anchor.y = 0.5;
      this._pixiObject.position.y =
        this._object.y + this._text.height * (0.5 - alignmentY);
      this._text.position.y = 0;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._text.alpha = this._object._opacity / 255;
    }

    getWidth(): float {
      return this._text.textWidth * this.getScale();
    }

    getHeight(): float {
      return this._text.textHeight * this.getScale();
    }
  }
  export const BitmapTextRuntimeObjectRenderer =
    BitmapTextRuntimeObjectPixiRenderer;
}
