namespace gdjs {
  class TextRuntimeObjectCocosRenderer {
    _object: any;
    _fontManager: any;
    _text: any;
    _convertYPosition: any;

    constructor(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._fontManager = runtimeScene.getGame().getFontManager();
      this._text = new cc.LabelTTF(' ', 'Arial', 38);
      this._text.disableStroke();
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._text, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
      this.updateString();
      this.updateStyle();
      this.updatePosition();
    }

    getRendererObject() {
      return this._text;
    }

    ensureUpToDate() {}

    updateStyle(): void {
      this._text.setFontSize(this._object._characterSize);
      this._text.setFontFillColor(
        cc.color(
          this._object._color[0],
          this._object._color[1],
          this._object._color[2]
        )
      );
      this._text._setBoundingWidth(
        this._object._wrapping ? this._object._wrappingWidth : 0
      );
      const fontName = !this._object._fontName
        ? 'Arial'
        : gdjs.CocosTools.isHTML5()
        ? this._fontManager.getFontFamily(this._object._fontName)
        : 'res/' + this._fontManager.getFontFile(this._object._fontName);
      this._text.setFontName(fontName);
    }

    updatePosition(): void {
      this._text.setPositionX(this._object.x + this._text.width / 2);
      this._text.setPositionY(
        this._convertYPosition(this._object.y + this._text.height / 2)
      );
    }

    updateAngle(): void {
      this._text.setRotation(this._object.getAngle());
    }

    updateOpacity(): void {
      this._text.setOpacity(this._object.opacity);
    }

    updateString(): void {
      this._text.setString(this._object._str);
    }

    getWidth(): float {
      return this._text.width;
    }

    getHeight(): float {
      return this._text.height;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  gdjs.TextRuntimeObjectRenderer = TextRuntimeObjectCocosRenderer;
}
