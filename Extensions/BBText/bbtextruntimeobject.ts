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
    };
  };
  export type BBTextObjectData = ObjectData & BBTextObjectDataType;

  /**
   * Displays a rich text using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).
   */
  export class BBTextRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.OpacityHandler {
    _opacity: float;

    _text: string;

    /** color in format [r, g, b], where each component is in the range [0, 255] */
    _color: integer[];
    _fontFamily: string;
    _fontSize: number;

    _wordWrap: boolean;
    _wrappingWidth: float = 250;

    // This value is the default wrapping width of the runtime object.
    _align: string;
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
      this._wordWrap = objectData.content.wordWrap;
      this._align = objectData.content.align;
      this._renderer = new gdjs.BBTextRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this.hidden = !objectData.content.visible;

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    // @ts-ignore
    updateFromObjectData(
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

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Set the markup text to display.
     */
    setBBText(text): void {
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

    setColor(rgbColorString): void {
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

    setFontSize(fontSize): void {
      this._fontSize = fontSize;
      this._renderer.updateFontSize();
    }

    getFontSize() {
      return this._fontSize;
    }

    setFontFamily(fontFamily): void {
      this._fontFamily = fontFamily;
      this._renderer.updateFontFamily();
    }

    getFontFamily() {
      return this._fontFamily;
    }

    setAlignment(align): void {
      this._align = align;
      this._renderer.updateAlignment();
    }

    getAlignment() {
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

    setWordWrap(wordWrap: boolean): void {
      if (this._wordWrap === wordWrap) return;

      this._wordWrap = wordWrap;
      this._renderer.updateWordWrap();
      this.invalidateHitboxes();
    }

    getWordWrap() {
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
  gdjs.registerObject('BBText::BBText', gdjs.BBTextRuntimeObject);
}
