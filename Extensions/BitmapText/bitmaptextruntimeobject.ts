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
      /** Wrapping with from custom size properties. */
      wrappingWidth: float;
      /** Alignment of the text. */
      align: 'left' | 'center' | 'right';
      verticalTextAlignment: 'top' | 'center' | 'bottom';
    };
  };
  export type BitmapTextObjectData = ObjectData & BitmapTextObjectDataType;

  export type BitmapTextObjectNetworkSyncDataType = {
    text: string;
    opa: float;
    tint: number[];
    bfrn: string;
    tarn: string;
    scale: number;
    wwrap: boolean;
    wwidth: float;
    align: string;
    vta: string;
  };

  export type BitmapTextObjectNetworkSyncData = ObjectNetworkSyncData &
    BitmapTextObjectNetworkSyncDataType;

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
  export class BitmapTextRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.TextContainer, gdjs.OpacityHandler, gdjs.Scalable
  {
    _opacity: float;
    _text: string;
    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _tint: integer[];
    _bitmapFontResourceName: string;
    _textureAtlasResourceName: string;
    _scaleX: number;
    _scaleY: number;
    _wrapping: boolean = false;
    _wrappingWidth: float;
    _textAlign: string;
    _verticalTextAlignment: string;

    _renderer: gdjs.BitmapTextRuntimeObjectPixiRenderer;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: BitmapTextObjectData
    ) {
      super(instanceContainer, objectData);

      this._opacity = objectData.content.opacity;
      this._text = objectData.content.text;
      this._tint = gdjs.rgbOrHexToRGBColor(objectData.content.tint);

      this._bitmapFontResourceName = objectData.content.bitmapFontResourceName; // fnt/xml files
      this._textureAtlasResourceName =
        objectData.content.textureAtlasResourceName; // texture file used with fnt/xml (bitmap font file)
      this._scaleX = objectData.content.scale;
      this._scaleY = objectData.content.scale;
      this._wrappingWidth = 0;
      this._textAlign = objectData.content.align;
      this._verticalTextAlignment =
        objectData.content.verticalTextAlignment || 'top';

      this._renderer = new gdjs.BitmapTextRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    override getRendererObject() {
      return this._renderer.getRendererObject();
    }

    // @ts-ignore
    override updateFromObjectData(
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
      if (oldObjectData.content.align !== newObjectData.content.align) {
        this.setTextAlignment(newObjectData.content.align);
      }
      if (
        oldObjectData.content.verticalTextAlignment !==
        newObjectData.content.verticalTextAlignment
      ) {
        this.setVerticalTextAlignment(
          newObjectData.content.verticalTextAlignment
        );
      }

      return true;
    }

    override getNetworkSyncData(): BitmapTextObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        text: this._text,
        opa: this._opacity,
        tint: this._tint,
        bfrn: this._bitmapFontResourceName,
        tarn: this._textureAtlasResourceName,
        scale: this.getScale(),
        wwrap: this._wrapping,
        wwidth: this._wrappingWidth,
        align: this._textAlign,
        vta: this._verticalTextAlignment,
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: BitmapTextObjectNetworkSyncData
    ): void {
      super.updateFromNetworkSyncData(networkSyncData);
      if (this._text !== undefined) {
        this.setText(networkSyncData.text);
      }
      if (this._opacity !== undefined) {
        this.setOpacity(networkSyncData.opa);
      }
      if (this._tint !== undefined) {
        this._tint = networkSyncData.tint;
        this._renderer.updateTint();
      }
      if (this._bitmapFontResourceName !== undefined) {
        this.setBitmapFontResourceName(networkSyncData.bfrn);
      }
      if (this._textureAtlasResourceName !== undefined) {
        this.setTextureAtlasResourceName(networkSyncData.tarn);
      }
      if (this._scaleX !== undefined) {
        this.setScale(networkSyncData.scale);
      }
      if (this._wrapping !== undefined) {
        this.setWrapping(networkSyncData.wwrap);
      }
      if (this._wrappingWidth !== undefined) {
        this.setWrappingWidth(networkSyncData.wwidth);
      }
      if (this._textAlign !== undefined) {
        this.setTextAlignment(networkSyncData.align);
      }
      if (this._verticalTextAlignment !== undefined) {
        this.setVerticalTextAlignment(networkSyncData.vta);
      }
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    override extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ) {
      if (initialInstanceData.customSize) {
        this.setWrappingWidth(initialInstanceData.width);
        this.setWrapping(true);
      }
      if (initialInstanceData.opacity !== undefined) {
        this.setOpacity(initialInstanceData.opacity);
      }
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    /**
     * Set the text to display.
     */
    setText(text: string): void {
      this._text = text;
      this._renderer.updateTextContent();
      this.invalidateHitboxes();
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

    getScale(): number {
      const scaleX = this.getScaleX();
      const scaleY = this.getScaleY();
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
    }

    getScaleX(): float {
      return this._scaleX;
    }

    getScaleY(): float {
      return this._scaleY;
    }

    setScale(scale: float): void {
      this.setScaleX(scale);
      this.setScaleY(scale);
    }

    setScaleX(scaleX: float): void {
      if (scaleX < 0) {
        scaleX = 0;
      }
      if (this._scaleX === scaleX) return;

      this._scaleX = scaleX;
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    setScaleY(scaleY: float): void {
      if (scaleY < 0) {
        scaleY = 0;
      }
      if (this._scaleY === scaleY) return;

      this._scaleY = scaleY;
      this._renderer.updateScale();
      this.invalidateHitboxes();
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

    setTextAlignment(align: string): void {
      this._textAlign = align;
      this._renderer.updateAlignment();
    }

    getTextAlignment(): string {
      return this._textAlign;
    }

    /**
     * Set the text alignment on Y axis for multiline text objects.
     * @param alignment The text alignment.
     */
    setVerticalTextAlignment(alignment: string): void {
      this._verticalTextAlignment = alignment;
      this._renderer.updatePosition();
    }

    /**
     * Get the text alignment on Y axis of text object.
     * @return The text alignment.
     */
    getVerticalTextAlignment(): string {
      return this._verticalTextAlignment;
    }

    override setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    override setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    override setAngle(angle: float): void {
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
      this.invalidateHitboxes();
    }

    /**
     * Get the wrapping width of the object.
     */
    getWrappingWidth(): float {
      return this._wrappingWidth;
    }

    setWrapping(wordWrap: boolean): void {
      this._wrapping = wordWrap;
      this._renderer.updateWrappingWidth();
      this.invalidateHitboxes();
    }

    isWrapping(): boolean {
      return this._wrapping;
    }

    override getWidth(): float {
      return this._wrapping ? this._wrappingWidth : this._renderer.getWidth();
    }

    override getHeight(): float {
      return this._renderer.getHeight();
    }

    override getDrawableY(): float {
      return (
        this.getY() -
        (this._verticalTextAlignment === 'center'
          ? this.getHeight() / 2
          : this._verticalTextAlignment === 'bottom'
            ? this.getHeight()
            : 0)
      );
    }
  }
  gdjs.registerObject(
    'BitmapText::BitmapTextObject',
    // @ts-ignore
    gdjs.BitmapTextRuntimeObject
  );
}
