namespace gdjs {
  class TextRuntimeObjectPixiRenderer {
    _object: gdjs.TextRuntimeObject;
    _fontManager: any;
    _text: PIXI.Text;
    _justCreated: boolean = true;

    constructor(
      runtimeObject: gdjs.TextRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._fontManager = instanceContainer.getGame().getFontManager();
      this._text = new PIXI.Text(' ', { align: 'left' });
      this._text.anchor.x = 0.5;
      this._text.anchor.y = 0.5;
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._text, runtimeObject.getZOrder());
      this._text.text =
        runtimeObject._str.length === 0 ? ' ' : runtimeObject._str;

      //Work around a PIXI.js bug. See updateTime method.
      this.updateStyle();
      this.updatePosition();
    }

    getRendererObject() {
      return this._text;
    }

    ensureUpToDate() {
      if (this._justCreated) {
        //Work around a PIXI.js bug:
        this._text.updateText(false);

        //Width seems not to be correct when text is not rendered yet.
        this.updatePosition();
        this._justCreated = false;
      }
    }

    updateStyle(): void {
      const fontName =
        '"' + this._fontManager.getFontFamily(this._object._fontName) + '"';
      const style = this._text.style;
      style.fontStyle = this._object._italic ? 'italic' : 'normal';
      style.fontWeight = this._object._bold ? 'bold' : 'normal';
      style.fontSize = this._object._characterSize;
      style.fontFamily = fontName;
      if (this._object._useGradient) {
        style.fill = this._getGradientHex();
      } else {
        style.fill = this._getColorHex();
      }
      if (this._object._gradientType === 'LINEAR_VERTICAL') {
        style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_VERTICAL;
      } else {
        style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL;
      }
      // @ts-ignore
      style.align = this._object._textAlign;
      style.wordWrap = this._object._wrapping;
      style.wordWrapWidth = this._object._wrappingWidth;
      style.breakWords = true;
      style.stroke = gdjs.rgbToHexNumber(
        this._object._outlineColor[0],
        this._object._outlineColor[1],
        this._object._outlineColor[2]
      );
      style.strokeThickness = this._object._isOutlineEnabled
        ? this._object._outlineThickness
        : 0;
      style.dropShadow = this._object._shadow;
      style.dropShadowColor = gdjs.rgbToHexNumber(
        this._object._shadowColor[0],
        this._object._shadowColor[1],
        this._object._shadowColor[2]
      );
      style.dropShadowAlpha = this._object._shadowOpacity / 255;
      style.dropShadowBlur = this._object._shadowBlur;
      style.dropShadowAngle = gdjs.toRad(this._object._shadowAngle);
      style.dropShadowDistance = this._object._shadowDistance;
      const extraPaddingForShadow = style.dropShadow
        ? style.dropShadowDistance + style.dropShadowBlur
        : 0;
      style.padding = Math.ceil(this._object._padding + extraPaddingForShadow);

      // Prevent spikey outlines by adding a miter limit
      style.miterLimit = 3;
      this.updatePosition();

      // Manually ask the PIXI object to re-render as we changed a style property
      // see http://www.html5gamedevs.com/topic/16924-change-text-style-post-render/
      // @ts-ignore
      this._text.dirty = true;
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

        // A vector from the custom size center to the renderer center.
        const centerToCenterX = (width - this._text.width) * (alignmentX - 0.5);

        this._text.position.x = this._object.x + width / 2;
        this._text.anchor.x = 0.5 - centerToCenterX / this._text.width;
      } else {
        this._text.position.x = this._object.x + this._text.width / 2;
        this._text.anchor.x = 0.5;
      }
      this._text.position.y = this._object.y + this._text.height / 2;
    }

    updateAngle(): void {
      this._text.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._text.alpha = this._object.opacity / 255;
    }

    updateString(): void {
      this._text.text =
        this._object._str.length === 0 ? ' ' : this._object._str;

      //Work around a PIXI.js bug.
      this._text.updateText(false);
    }

    getWidth(): float {
      return this._text.width;
    }

    getHeight(): float {
      return this._text.height;
    }

    _getColorHex() {
      return gdjs.rgbToHexNumber(
        this._object._color[0],
        this._object._color[1],
        this._object._color[2]
      );
    }

    _getGradientHex() {
      const gradient: Array<string> = [];
      for (
        let colorIndex = 0;
        colorIndex < this._object._gradient.length;
        colorIndex++
      ) {
        gradient.push(
          '#' +
            gdjs.rgbToHex(
              this._object._gradient[colorIndex][0],
              this._object._gradient[colorIndex][1],
              this._object._gradient[colorIndex][2]
            )
        );
      }
      return gradient;
    }

    /**
     * Get x-scale of the text.
     */
    getScaleX(): float {
      return this._text.scale.x;
    }

    /**
     * Get y-scale of the text.
     */
    getScaleY(): float {
      return this._text.scale.y;
    }

    /**
     * Set the text object scale.
     * @param newScale The new scale for the text object.
     */
    setScale(newScale: float): void {
      this._text.scale.x = newScale;
      this._text.scale.y = newScale;
    }

    /**
     * Set the text object x-scale.
     * @param newScale The new x-scale for the text object.
     */
    setScaleX(newScale: float): void {
      this._text.scale.x = newScale;
    }

    /**
     * Set the text object y-scale.
     * @param newScale The new y-scale for the text object.
     */
    setScaleY(newScale: float): void {
      this._text.scale.y = newScale;
    }

    destroy() {
      this._text.destroy(true);
    }
  }

  // Register the class to let the engine use it.
  export const TextRuntimeObjectRenderer = TextRuntimeObjectPixiRenderer;
  export type TextRuntimeObjectRenderer = TextRuntimeObjectPixiRenderer;
}
