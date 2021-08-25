namespace gdjs {
  /** Base parameters for {@link gdjs.BitmapTextRuntimeObject} */
  export type BitmapTextObjectDataType = {
    /** The base parameters of the Bitmap Text */
    content: {
      /** The opacity of the text. */
      opacity: float;
      /** Content of the text. */
      text: string;
      /** The tint of the text. */
      tint: string;
      /** The name of the resource containing the bitmap font for the text. */
      bitmapFontResourceName: string;
      /** The name of the resource containing the atlas image file for the text. */
      textureAtlasResourceName: string;
      /** The scale of the text. */
      scale: float;
      /** Activate word wrap if set to true. */
      wordWrap: boolean;
      /** Wrapping with from custom size properties. */
      wrappingWidth: float;
      /** Alignment of the text. */
      align: 'left' | 'center' | 'right';
    };
  };
  export type BitmapTextObjectData = ObjectData & BitmapTextObjectDataType;

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
  export class BitmapTextRuntimeObject extends gdjs.RuntimeObject {
    _opacity: float;
    _text: string;
    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _tint: integer[];
    _bitmapFontResourceName: string;
    _textureAtlasResourceName: string;
    _scale: number;
    _wordWrap: boolean;
    _wrappingWidth: float;
    _align: string;

    _renderer: gdjs.BitmapTextRuntimeObjectPixiRenderer;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      objectData: BitmapTextObjectData
    ) {
      super(runtimeScene, objectData);

      this._opacity = objectData.content.opacity;
      this._text = objectData.content.text;
      this._tint = gdjs.rgbOrHexToRGBColor(objectData.content.tint);

      this._bitmapFontResourceName = objectData.content.bitmapFontResourceName; // fnt/xml files
      this._textureAtlasResourceName =
        objectData.content.textureAtlasResourceName; // texture file used with fnt/xml (bitmap font file)
      this._scale = objectData.content.scale;
      this._wordWrap = objectData.content.wordWrap;
      this._wrappingWidth = 0;
      this._align = objectData.content.align;

      this._renderer = new gdjs.BitmapTextRuntimeObjectRenderer(
        this,
        runtimeScene
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    // @ts-ignore
    updateFromObjectData(
      oldObjectData: BitmapTextObjectDataType,
      newObjectData: BitmapTextObjectDataType
    ): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (oldObjectData.content.text !== newObjectData.content.text) {
        this.setText(newObjectData.content.text);
      }
      if (oldObjectData.content.tint !== newObjectData.content.tint) {
        this._tint = gdjs.rgbOrHexToRGBColor(newObjectData.content.tint);
        this._renderer.updateTint();
      }
      if (
        oldObjectData.content.bitmapFontResourceName !==
        newObjectData.content.bitmapFontResourceName
      ) {
        this.setBitmapFontResourceName(
          newObjectData.content.bitmapFontResourceName
        );
      }
      if (
        oldObjectData.content.textureAtlasResourceName !==
        newObjectData.content.textureAtlasResourceName
      ) {
        this.setTextureAtlasResourceName(
          newObjectData.content.textureAtlasResourceName
        );
      }
      if (oldObjectData.content.scale !== newObjectData.content.scale) {
        this.setScale(newObjectData.content.scale);
      }
      if (oldObjectData.content.wordWrap !== newObjectData.content.wordWrap) {
        this.setWordWrap(newObjectData.content.wordWrap);
      }
      if (oldObjectData.content.align !== newObjectData.content.align) {
        this.setAlignment(newObjectData.content.align);
      }

      return true;
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWrappingWidth(initialInstanceData.width);
      }
    }

    onDestroyFromScene(runtimeScene: gdjs.RuntimeScene): void {
      super.onDestroyFromScene(runtimeScene);
      this._renderer.onDestroy();
    }

    /**
     * Set the text to display.
     */
    setText(text: string): void {
      this._text = text;
      this._renderer.updateTextContent();
      this.hitBoxesDirty = true;
    }

    /**
     * Get the text displayed by the object.
     */
    getText(): string {
      return this._text;
    }

    setTint(rgbColorString: string): void {
      this._tint = gdjs.rgbOrHexToRGBColor(rgbColorString);
      this._renderer.updateTint();
    }

    getTint(): string {
      return this._tint[0] + ';' + this._tint[1] + ';' + this._tint[2];
    }

    setScale(scale: float): void {
      this._scale = scale;
      this._renderer.updateScale();
      this.hitBoxesDirty = true;
    }

    getScale(): float {
      return this._scale;
    }

    getFontSize(): float {
      return this._renderer.getFontSize();
    }

    setBitmapFontAndTextureAtlasResourceName(
      bitmapFontResourceName: string,
      textureAtlasResourceName: string
    ): void {
      if (bitmapFontResourceName) {
        this.setBitmapFontResourceName(bitmapFontResourceName);
        this._renderer.updateFont();
      }
      if (textureAtlasResourceName) {
        this.setTextureAtlasResourceName(textureAtlasResourceName);
        this._renderer.updateFont();
      }
    }

    setBitmapFontResourceName(bitmapFontResourceName: string): void {
      this._bitmapFontResourceName = bitmapFontResourceName;
    }

    getBitmapFontResourceName(): string {
      return this._bitmapFontResourceName;
    }

    setTextureAtlasResourceName(textureAtlasResourceName: string): void {
      this._textureAtlasResourceName = textureAtlasResourceName;
    }

    getTextureAtlasResourceName(): string {
      return this._textureAtlasResourceName;
    }

    setAlignment(align: string): void {
      this._align = align;
      this._renderer.updateAlignment();
    }

    getAlignment(): string {
      return this._align;
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
     * Set the wrapping width.
     * @param width The new width in pixels.
     */
    setWrappingWidth(width: float): void {
      this._wrappingWidth = width;
      this._renderer.updateWrappingWidth();
      this.hitBoxesDirty = true;
    }

    /**
     * Get the wrapping width of the object.
     */
    getWrappingWidth(): float {
      return this._wrappingWidth;
    }

    setWordWrap(wordWrap: boolean): void {
      this._wordWrap = wordWrap;
      this._renderer.updateWrappingWidth();
      this.hitBoxesDirty = true;
    }

    getWordWrap(): boolean {
      return this._wordWrap;
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
    'BitmapText::BitmapTextObject',
    // @ts-ignore
    gdjs.BitmapTextRuntimeObject
  );
}
