namespace gdjs {
  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   * @category Renderers > Bitmap Text
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
      this._pixiObject = new PIXI.BitmapText(runtimeObject._text, {
        fontName: bitmapFont.font,
        fontSize: bitmapFont.size,
      });

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
      // Save the font name before destroying the PIXI object.
      const fontName = this._pixiObject.fontName;
      // Destroy the PIXI object first, while the font is still available in
      // PIXI.BitmapFont.available (PIXI.BitmapText.destroy accesses font
      // properties like distanceFieldType during cleanup).
      this._pixiObject.destroy();
      // Then mark the font as not used anymore (which may uninstall it if
      // no other object references it).
      this._object
        .getInstanceContainer()
        .getGame()
        .getBitmapFontManager()
        .releaseBitmapFont(fontName);
    }

    getFontSize() {
      return this._pixiObject.fontSize;
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

      const oldFontName = this._pixiObject.fontName;

      // Update the font on the PIXI object first, so that if releasing the
      // old font uninstalls it, the PIXI object already references the new one.
      this._pixiObject.fontName = bitmapFont.font;
      this._pixiObject.fontSize = bitmapFont.size;

      // Mark the old font as not used anymore.
      this._object
        .getInstanceContainer()
        .getGame()
        .getBitmapFontManager()
        .releaseBitmapFont(oldFontName);

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
      if (this._object._wrapping) {
        this._pixiObject.maxWidth =
          this._object._wrappingWidth / this._object._scaleX;
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
      // @ts-ignore - assume align is always a valid value.
      this._pixiObject.align = this._object._textAlign;
      this.updatePosition();
    }

    updatePosition(): void {
      const alignmentX =
        this._object._textAlign === 'right'
          ? 1
          : this._object._textAlign === 'center'
            ? 0.5
            : 0;
      const renderedWidth = this.getWidth();
      const objectWidth = this._object.isWrapping()
        ? this._object.getWrappingWidth()
        : renderedWidth;
      const textLeftOffset = this._object.isWrapping()
        ? (objectWidth - renderedWidth) * alignmentX
        : 0;
      const centerX = this._object._rotationCenter
        ? this._object._rotationCenter[0]
        : objectWidth / 2;

      this._pixiObject.position.x = this._object.getDrawableX() + centerX;
      this._pixiObject.anchor.x =
        renderedWidth !== 0 ? (centerX - textLeftOffset) / renderedWidth : 0;

      const alignmentY =
        this._object._verticalTextAlignment === 'bottom'
          ? 1
          : this._object._verticalTextAlignment === 'center'
            ? 0.5
            : 0;
      const renderedHeight = this.getHeight();
      const textTopOffset = renderedHeight * alignmentY;
      const centerY = this._object._rotationCenter
        ? this._object._rotationCenter[1]
        : renderedHeight / 2;

      this._pixiObject.position.y = this._object.y + centerY - textTopOffset;
      this._pixiObject.anchor.y =
        renderedHeight !== 0 ? centerY / renderedHeight : 0;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    getWidth(): float {
      return this._pixiObject.textWidth * this.getScale();
    }

    getHeight(): float {
      return this._pixiObject.textHeight * this.getScale();
    }
  }

  /**
   * @category Renderers > Bitmap Text
   */
  export const BitmapTextRuntimeObjectRenderer =
    BitmapTextRuntimeObjectPixiRenderer;
}
