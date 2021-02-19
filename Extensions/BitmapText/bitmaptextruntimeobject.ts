namespace gdjs {
  /** Base parameters for {@link gdjs.BitmapTextRuntimeObject} */
  export type BitmapTextObjectDataType = {
    /** The base parameters of the Bitmap Text */
    content: {
      /** The opacity of the Bitmap Text */
      opacity: float;
      /** Content of the text */
      text: string;
      /** The tint of the text */
      tint: Array<number>;
      /** The bitmap font file for the text */
      bitmapFontFile: string;
      /** The atlas image file for the text */
      bitmapAtlasFile: string;
      /** The scale of the text */
      scale: float;
      /** Activate word wrap if set to true */
      wordWrap: boolean;
      /** Wrapping with from custom size properties */
      wrappingWidth: float;
      /** Alignment of the text: "left", "center" or "right" */
      align: 'left' | 'center' | 'right';
    };
  };
  export type BitmapTextObjectData = ObjectData & BitmapTextObjectDataType;

  /**
   * Displays a bitmap text without losing in quality on edges
   * The object use files generated in a external editor like bmFont.
   */
  export class BitmapTextRuntimeObject extends gdjs.RuntimeObject {
    _opacity: float;
    _text: string;
    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _tint: integer[];
    _fontFamily: string;
    _bitmapFontFile: string;
    _bitmapAtlasFile: string;
    _scale: number;
    _wordWrap: boolean;
    _wrappingWidth: float;
    _align: string;

    _renderer: gdjs.BitmapTextRuntimeObjectRenderer;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(runtimeScene: gdjs.RuntimeScene, objectData: BBTextObjectData) {
      super(runtimeScene, objectData);

      this._opacity = objectData.content.opacity;
      this._text = objectData.content.text;
      this._tint = gdjs.hexToRGBColor(objectData.content.tint);
      this._bitmapFontFile = objectData.content.bitmapFontFile; // fnt/xml files
      this._bitmapAtlasFile = objectData.content.bitmapAtlasFile; // texture file used with fnt/xml (bitmap font file)
      this._scale = objectData.content.scale;
      this._wordWrap = objectData.content.wordWrap;
      this._wrappingWidth = 0;
      this._align = objectData.content.align;

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
        this._tint = gdjs.hexToRGBColor(newObjectData.content.tint);
        this._renderer.updateTint();
      }
      if (
        oldObjectData.content.bitmapFontFile !==
        newObjectData.content.bitmapFontFile
      ) {
        this._setBitmapFontFile(newObjectData.content.bitmapFontFile);
      }
      if (
        oldObjectData.content.bitmapAtlasFile !==
        newObjectData.content.bitmapAtlasFile
      ) {
        this._setBitmapAtlasFile(newObjectData.content.bitmapAtlasFile);
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
      } else {
        this.setWrappingWidth(
          // This value is the default wrapping width of the runtime object.
          250
        );
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
    }

    /**
     * Get the text displayed by the object.
     */
    getText(): string {
      return this._text;
    }

    setTint(rgbColorString: string): void {
      const splitValue = rgbColorString.split(';');
      if (splitValue.length !== 3) return;

      this._tint[0] = parseInt(splitValue[0], 10);
      this._tint[1] = parseInt(splitValue[1], 10);
      this._tint[2] = parseInt(splitValue[2], 10);
      this._renderer.updateTint();
    }

    getTint(): string {
      return this._tint[0] + ';' + this._tint[1] + ';' + this._tint[2];
    }

    setScale(scale: float): void {
      this._scale = scale;
      this._renderer.updateScale();
    }

    getScale(): float {
      return this._scale;
    }

    getFontSize(): float {
      return this._renderer.getFontSize();
    }

    _setBitmapFontFile(bitmapFontResourceName: string): void {
      this._bitmapFontFile = bitmapFontResourceName;
      this._renderer.updateFont();
    }

    _setBitmapAtlasFile(bitmapAtlasResourceName: string): void {
      this._bitmapAtlasFile = bitmapAtlasResourceName;
      this._renderer.updateFont();
    }

    setBitmapFontAndAtlasFile(
      bitmapFontResourceName: string,
      bitmapAtlasResourceName: string
    ): void {
      this._bitmapFontFile = bitmapFontResourceName;
      this._bitmapAtlasFile = bitmapAtlasResourceName;
      this._renderer.updateFont();
    }

    getFontName(): string {
      return this._renderer.getRendererObject().fontName;
    }

    getTexture(): string {
      return this._bitmapAtlasResourceName;
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
     * Set the width.
     * @param width The new width in pixels.
     */
    setWrappingWidth(width: float): void {
      this._wrappingWidth = width;
      this._renderer.updateWrappingWidth();
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
  // @ts-ignore
  gdjs.registerObject(
    'BitmapText::BitmapTextObject',
    gdjs.BitmapTextRuntimeObject
  );
}
