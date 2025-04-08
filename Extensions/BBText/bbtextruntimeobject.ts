namespace gdjs {
  /** Base parameters for {@link gdjs.BBTextRuntimeObject} */
  export type BBTextObjectDataType = {
    /** The base parameters of the BBText */
    content: {
      /** The opacity of the BBText */
      opacity: number;
      /** Deprecated - Is the text visible? */
      visible: boolean;
      /** Content of the text */
      text: string;
      /** The color of the text */
      color: string;
      /** The font of the text */
      fontFamily: string;
      /** The size of the text */
      fontSize: number;
      /** Activate word wrap if set to true */
      wordWrap: boolean;
      /** Alignment of the text: "left", "center" or "right" */
      align: 'left' | 'center' | 'right';
      verticalTextAlignment: 'top' | 'center' | 'bottom';
    };
  };
  export type BBTextObjectData = ObjectData & BBTextObjectDataType;

  export type BBTextObjectNetworkSyncDataType = {
    text: string;
    o: float;
    c: number[];
    ff: string;
    fs: number;
    wwrap: boolean;
    wwidth: float;
    align: string;
    vta: string;
    hidden: boolean;
  };

  export type BBTextObjectNetworkSyncData = ObjectNetworkSyncData &
    BBTextObjectNetworkSyncDataType;

  /**
   * Displays a rich text using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).
   */
  export class BBTextRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.OpacityHandler
  {
    _opacity: float;

    _text: string;

    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _color: integer[];
    _fontFamily: string;
    _fontSize: float;

    _wrapping: boolean = false;
    _wrappingWidth: float = 250;

    _textAlign: string;
    _verticalTextAlignment: string;

    _renderer: gdjs.BBTextRuntimeObjectRenderer;

    // While this should rather be exposed as a property for all objects, honor the "visible"
    // property that is specific to this object.
    hidden: boolean;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: BBTextObjectData
    ) {
      super(instanceContainer, objectData);
      // @ts-ignore - parseFloat should not be required, but GDevelop 5.0 beta 92 and below were storing it as a string.
      this._opacity = parseFloat(objectData.content.opacity);
      this._text = objectData.content.text;
      this._color = gdjs.rgbOrHexToRGBColor(objectData.content.color);
      this._fontFamily = objectData.content.fontFamily;
      // @ts-ignore - parseFloat should not be required, but GDevelop 5.0 beta 92 and below were storing it as a string.
      this._fontSize = parseFloat(objectData.content.fontSize);
      this._textAlign = objectData.content.align;
      this._verticalTextAlignment =
        objectData.content.verticalTextAlignment || 'top';
      this.hidden = !objectData.content.visible;

      this._renderer = new gdjs.BBTextRuntimeObjectRenderer(
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
      oldObjectData: BBTextObjectDataType,
      newObjectData: BBTextObjectDataType
    ): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (oldObjectData.content.visible !== newObjectData.content.visible) {
        this.hide(!newObjectData.content.visible);
      }
      if (oldObjectData.content.text !== newObjectData.content.text) {
        this.setBBText(newObjectData.content.text);
      }
      if (oldObjectData.content.color !== newObjectData.content.color) {
        this._color = gdjs.rgbOrHexToRGBColor(newObjectData.content.color);
        this._renderer.updateColor();
      }
      if (
        oldObjectData.content.fontFamily !== newObjectData.content.fontFamily
      ) {
        this.setFontFamily(newObjectData.content.fontFamily);
      }
      if (oldObjectData.content.fontSize !== newObjectData.content.fontSize) {
        this.setFontSize(newObjectData.content.fontSize);
      }
      if (oldObjectData.content.wordWrap !== newObjectData.content.wordWrap) {
        this.setWrapping(newObjectData.content.wordWrap);
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

    override getNetworkSyncData(): BBTextObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        text: this._text,
        o: this._opacity,
        c: this._color,
        ff: this._fontFamily,
        fs: this._fontSize,
        wwrap: this._wrapping,
        wwidth: this._wrappingWidth,
        align: this._textAlign,
        vta: this._verticalTextAlignment,
        hidden: this.hidden,
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: BBTextObjectNetworkSyncData,
      options?: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);
      if (this._text !== undefined) {
        this.setBBText(networkSyncData.text);
      }
      if (this._opacity !== undefined) {
        this.setOpacity(networkSyncData.o);
      }
      if (this._color !== undefined) {
        this._color = networkSyncData.c;
        this._renderer.updateColor();
      }
      if (this._fontFamily !== undefined) {
        this.setFontFamily(networkSyncData.ff);
      }
      if (this._fontSize !== undefined) {
        this.setFontSize(networkSyncData.fs);
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
      if (this.hidden !== undefined) {
        this.hide(networkSyncData.hidden);
      }
    }

    override extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ) {
      if (initialInstanceData.customSize) {
        this.setWrappingWidth(initialInstanceData.width);
        this.setWrapping(true);
      } else {
        this.setWrappingWidth(
          // This value is the default wrapping width of the runtime object.
          250
        );
      }
      if (initialInstanceData.opacity !== undefined) {
        this.setOpacity(initialInstanceData.opacity);
      }
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Set the markup text to display.
     */
    setBBText(text: string): void {
      this._text = text;
      this._renderer.updateText();
      this.invalidateHitboxes();
    }

    /**
     * Get the markup text displayed by the object.
     */
    getBBText() {
      return this._text;
    }

    setColor(rgbColorString: string): void {
      this._color = gdjs.rgbOrHexToRGBColor(rgbColorString);
      this._renderer.updateColor();
    }

    /**
     * Get the base color.
     * @return The color as a "R;G;B" string, for example: "255;0;0"
     */
    getColor(): string {
      return this._color[0] + ';' + this._color[1] + ';' + this._color[2];
    }

    setFontSize(fontSize: float): void {
      this._fontSize = fontSize;
      this._renderer.updateFontSize();
    }

    getFontSize() {
      return this._fontSize;
    }

    setFontFamily(fontFamily: string): void {
      this._fontFamily = fontFamily;
      this._renderer.updateFontFamily();
    }

    getFontFamily(): string {
      return this._fontFamily;
    }

    /**
     * @deprecated Use `setTextAlignment` instead
     */
    setAlignment(align: string): void {
      this.setTextAlignment(align);
    }

    setTextAlignment(align: string): void {
      this._textAlign = align;
      this._renderer.updateAlignment();
    }

    /**
     * @deprecated Use `getTextAlignment` instead
     */
    getAlignment(): string {
      return this.getTextAlignment();
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
    getOpacity() {
      return this._opacity;
    }

    /**
     * Set the width.
     * @param width The new width in pixels.
     */
    setWrappingWidth(width: float): void {
      if (this._wrappingWidth === width) return;

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
      if (this._wrapping === wordWrap) return;

      this._wrapping = wordWrap;
      this._renderer.updateWordWrap();
      this.invalidateHitboxes();
    }

    isWrapping() {
      return this._wrapping;
    }

    override getWidth(): float {
      return this._renderer.getWidth();
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
  // @ts-ignore
  gdjs.registerObject('BBText::BBText', gdjs.BBTextRuntimeObject);
}
