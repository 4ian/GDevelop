/*
 *  GDevelop JS Platform
 *  2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Base parameters for gdjs.TextRuntimeObject */
  export type TextObjectDataType = {
    content: {
      /** The size of the characters */
      characterSize: number;
      /** The font name */
      font: string;
      /** Is Bold? */
      bold: boolean;
      /** Is Italic? */
      italic: boolean;
      /** Is Underlined? */
      underlined: boolean;
      /** The text color in an RGB representation */
      color: string;
      /** The text of the object */
      text: string;
      textAlignment: string;

      isOutlineEnabled: boolean;
      outlineThickness: float;
      /** The outline color in an RGB representation */
      outlineColor: string;
      isShadowEnabled: boolean;
      /** The shadow color in an RGB representation */
      shadowColor: string;
      shadowOpacity: float;
      shadowDistance: float;
      shadowAngle: float;
      shadowBlurRadius: float;
    };
  };

  export type TextObjectData = ObjectData & TextObjectDataType;

  /**
   * Displays a text.
   */
  export class TextRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.TextContainer, gdjs.OpacityHandler {
    _characterSize: number;
    _fontName: string;
    _bold: boolean;
    _italic: boolean;
    _underlined: boolean;
    _color: integer[];
    _useGradient: boolean = false;
    _gradient: Array<Array<integer>> = [];
    _gradientType: string = '';
    opacity: float = 255;
    _textAlign: string = 'left';
    _wrapping: boolean = false;
    // A wrapping of 1 makes games crash on Firefox
    _wrappingWidth: float = 100;

    _isOutlineEnabled: boolean;
    _outlineThickness: float;
    _outlineColor: integer[];

    _shadow: boolean;
    _shadowColor: integer[];
    _shadowOpacity: float;
    _shadowDistance: float;
    _shadowAngle: float;
    _shadowBlur: float;

    _padding: integer = 5;
    _str: string;
    _renderer: gdjs.TextRuntimeObjectRenderer;

    // We can store the scale as nothing else can change it.
    _scaleX: number = 1;
    _scaleY: number = 1;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param textObjectData The initial properties of the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      textObjectData: TextObjectData
    ) {
      super(instanceContainer, textObjectData);
      const content = textObjectData.content;
      this._characterSize = Math.max(1, content.characterSize);
      this._fontName = content.font;
      this._bold = content.bold;
      this._italic = content.italic;
      this._underlined = content.underlined;
      this._color = gdjs.rgbOrHexToRGBColor(content.color);
      this._str = content.text;
      this._textAlign = content.textAlignment;

      this._isOutlineEnabled = content.isOutlineEnabled;
      this._outlineThickness = content.outlineThickness;
      this._outlineColor = gdjs.rgbOrHexToRGBColor(content.outlineColor);

      this._shadow = content.isShadowEnabled;
      this._shadowColor = gdjs.rgbOrHexToRGBColor(content.shadowColor);
      this._shadowOpacity = content.shadowOpacity;
      this._shadowDistance = content.shadowDistance;
      this._shadowBlur = content.shadowBlurRadius;
      this._shadowAngle = content.shadowAngle;

      this._renderer = new gdjs.TextRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: TextObjectData,
      newObjectData: TextObjectData
    ): boolean {
      const oldContent = oldObjectData.content;
      const newContent = newObjectData.content;
      if (oldContent.characterSize !== newContent.characterSize) {
        this.setCharacterSize(newContent.characterSize);
      }
      if (oldContent.font !== newContent.font) {
        this.setFontName(newContent.font);
      }
      if (oldContent.bold !== newContent.bold) {
        this.setBold(newContent.bold);
      }
      if (oldContent.italic !== newContent.italic) {
        this.setItalic(newContent.italic);
      }
      if (oldContent.color !== newContent.color) {
        this.setColor(newContent.color);
      }
      if (oldContent.text !== newContent.text) {
        this.setText(newContent.text);
      }
      if (oldContent.underlined !== newContent.underlined) {
        return false;
      }
      if (oldContent.textAlignment !== newContent.textAlignment) {
        this.setTextAlignment(newContent.textAlignment);
      }
      if (oldContent.isOutlineEnabled !== newContent.isOutlineEnabled) {
        this.setOutlineEnabled(newContent.isOutlineEnabled);
      }
      if (oldContent.outlineThickness !== newContent.outlineThickness) {
        this.setOutlineThickness(newContent.outlineThickness);
      }
      if (oldContent.outlineColor !== newContent.outlineColor) {
        this.setOutlineColor(newContent.outlineColor);
      }
      if (oldContent.isShadowEnabled !== newContent.isShadowEnabled) {
        this.showShadow(newContent.isShadowEnabled);
      }
      if (oldContent.shadowColor !== newContent.shadowColor) {
        this.setShadowColor(newContent.shadowColor);
      }
      if (oldContent.shadowOpacity !== newContent.shadowOpacity) {
        this.setShadowOpacity(newContent.shadowOpacity);
      }
      if (oldContent.shadowDistance !== newContent.shadowDistance) {
        this.setShadowDistance(newContent.shadowDistance);
      }
      if (oldContent.shadowAngle !== newContent.shadowAngle) {
        this.setShadowAngle(newContent.shadowAngle);
      }
      if (oldContent.shadowBlurRadius !== newContent.shadowBlurRadius) {
        this.setShadowBlurRadius(newContent.shadowBlurRadius);
      }
      return true;
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._renderer.ensureUpToDate();
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWrappingWidth(initialInstanceData.width);
        this.setWrapping(true);
      } else {
        this.setWrapping(false);
      }
    }

    /**
     * Update the rendered object position.
     */
    private _updateTextPosition() {
      this.invalidateHitboxes();
      this._renderer.updatePosition();
    }

    /**
     * Set object position on X axis.
     */
    setX(x: float): void {
      super.setX(x);
      this._updateTextPosition();
    }

    /**
     * Set object position on Y axis.
     */
    setY(y: float): void {
      super.setY(y);
      this._updateTextPosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Set object opacity.
     */
    setOpacity(opacity: float): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this.opacity = opacity;
      this._renderer.updateOpacity();
    }

    /**
     * Get object opacity.
     */
    getOpacity() {
      return this.opacity;
    }

    /**
     * Get the string displayed by the object.
     * @deprecated use `getText` instead
     */
    getString(): string {
      return this.getText();
    }

    /**
     * Set the string displayed by the object.
     * @param text The new text
     * @deprecated use `setText` instead
     */
    setString(text: string): void {
      this.setText(text);
    }

    /**
     * Get the string displayed by the object.
     */
    getText(): string {
      return this._str;
    }

    /**
     * Set the string displayed by the object.
     * @param text The new text
     */
    setText(text: string): void {
      if (text === this._str) {
        return;
      }
      this._str = text;
      this._renderer.updateString();
      this._updateTextPosition();
    }

    /**
     * Get the font size of the characters of the object.
     */
    getCharacterSize(): number {
      return this._characterSize;
    }

    /**
     * Set the font size for characters of the object.
     * @param newSize The new font size for the text.
     */
    setCharacterSize(newSize: number): void {
      if (newSize <= 1) {
        newSize = 1;
      }
      this._characterSize = newSize;
      this._renderer.updateStyle();
    }

    /**
     * Set the name of the resource to use for the font.
     * @param fontResourceName The name of the font resource.
     */
    setFontName(fontResourceName: string): void {
      this._fontName = fontResourceName;
      this._renderer.updateStyle();
    }

    /**
     * Return true if the text is bold.
     */
    isBold(): boolean {
      return this._bold;
    }

    /**
     * Set bold for the object text.
     * @param enable {boolean} true to have a bold text, false otherwise.
     */
    setBold(enable: boolean): void {
      this._bold = enable;
      this._renderer.updateStyle();
    }

    /**
     * Return true if the text is italic.
     */
    isItalic(): boolean {
      return this._italic;
    }

    /**
     * Set italic for the object text.
     * @param enable {boolean} true to have an italic text, false otherwise.
     */
    setItalic(enable: boolean): void {
      this._italic = enable;
      this._renderer.updateStyle();
    }

    /**
     * Get width of the text.
     */
    getWidth(): float {
      return this._wrapping ? this._wrappingWidth : this._renderer.getWidth();
    }

    /**
     * Get height of the text.
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }

    /**
     * Get the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
     * @deprecated Use `getScale` instead.
     */
    getScaleMean(): float {
      return (Math.abs(this._scaleX) + Math.abs(this._scaleY)) / 2.0;
    }

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     */
    getScale(): float {
      const scaleX = Math.abs(this._scaleX);
      const scaleY = Math.abs(this._scaleY);
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
    }

    /**
     * Get x-scale of the text.
     */
    getScaleX(): float {
      return this._scaleX;
    }

    /**
     * Get y-scale of the text.
     */
    getScaleY(): float {
      return this._scaleY;
    }

    /**
     * Set the text object scale.
     * @param newScale The new scale for the text object.
     */
    setScale(newScale: float): void {
      if (this._scaleX === newScale && this._scaleY === newScale) return;

      this._scaleX = newScale;
      this._scaleY = newScale;
      this._renderer.setScale(newScale);
      this.invalidateHitboxes();
    }

    /**
     * Set the text object x-scale.
     * @param newScale The new x-scale for the text object.
     */
    setScaleX(newScale: float): void {
      if (this._scaleX === newScale) return;

      this._scaleX = newScale;
      this._renderer.setScaleX(newScale);
      this.invalidateHitboxes();
    }

    /**
     * Set the text object y-scale.
     * @param newScale The new y-scale for the text object.
     */
    setScaleY(newScale: float): void {
      if (this._scaleY === newScale) return;

      this._scaleY = newScale;
      this._renderer.setScaleY(newScale);
      this.invalidateHitboxes();
    }

    /**
     * Change the text color.
     * @param color color as a "R;G;B" string, for example: "255;0;0"
     */
    setColor(str: string): void {
      const color = str.split(';');
      if (color.length < 3) {
        return;
      }
      this._color[0] = parseInt(color[0], 10);
      this._color[1] = parseInt(color[1], 10);
      this._color[2] = parseInt(color[2], 10);
      this._useGradient = false;
      this._renderer.updateStyle();
    }

    /**
     * Get the text color.
     * @return The color as a "R;G;B" string, for example: "255;0;0"
     */
    getColor(): string {
      return this._color[0] + ';' + this._color[1] + ';' + this._color[2];
    }

    /**
     * Set the text alignment for multiline text objects.
     * @param alignment The text alignment.
     */
    setTextAlignment(alignment: string): void {
      this._textAlign = alignment;
      this._renderer.updateStyle();
    }

    /**
     * Get the text alignment of text object.
     * @return The text alignment.
     */
    getTextAlignment(): string {
      return this._textAlign;
    }

    /**
     * Return true if word wrapping is enabled for the text.
     */
    isWrapping(): boolean {
      return this._wrapping;
    }

    /**
     * Set word wrapping for the object text.
     * @param enable true to enable word wrapping, false to disable it.
     */
    setWrapping(enable: boolean): void {
      if (this._wrapping === enable) return;

      this._wrapping = enable;
      this._renderer.updateStyle();
      this.invalidateHitboxes();
    }

    /**
     * Get the word wrapping width for the text object.
     */
    getWrappingWidth(): float {
      return this._wrappingWidth;
    }

    /**
     * Set the word wrapping width for the text object.
     * @param width The new width to set.
     */
    setWrappingWidth(width: float): void {
      if (width <= 1) {
        width = 1;
      }
      if (this._wrappingWidth === width) {
        return;
      }
      this._wrappingWidth = width;

      if (this._wrapping) {
        this._renderer.updateStyle();
        this.invalidateHitboxes();
      }
    }

    /**
     * Set the outline for the text object.
     * @param str color as a "R;G;B" string, for example: "255;0;0"
     * @param thickness thickness of the outline (0 = disabled)
     * @deprecated Prefer independent setters.
     */
    setOutline(str: string, thickness: number): void {
      const color = str.split(';');
      if (color.length < 3) {
        return;
      }
      this._outlineColor[0] = parseInt(color[0], 10);
      this._outlineColor[1] = parseInt(color[1], 10);
      this._outlineColor[2] = parseInt(color[2], 10);
      this._outlineThickness = thickness;
      this._renderer.updateStyle();
    }

    isOutlineEnabled(): boolean {
      return this._isOutlineEnabled;
    }

    setOutlineEnabled(enable: boolean): void {
      this._isOutlineEnabled = enable;
      this._renderer.updateStyle();
    }

    /**
     * Get the outline thickness of the text object.
     * @return the outline thickness
     */
    getOutlineThickness(): number {
      return this._outlineThickness;
    }

    /**
     * Set the outline thickness of the text object.
     * @param value the outline thickness
     */
    setOutlineThickness(value: float): void {
      this._outlineThickness = value;
      this._renderer.updateStyle();
    }

    /**
     * Set the shadow color of the text object.
     * @param color the shadow color as a "R;G;B" string, for example: "255;0;0"
     */
    setOutlineColor(color: string): void {
      this._outlineColor = gdjs.rgbOrHexToRGBColor(color);
      this._renderer.updateStyle();
    }

    /**
     * Set the shadow for the text object.
     * @param str color as a "R;G;B" string, for example: "255;0;0"
     * @param distance distance between the shadow and the text, in pixels.
     * @param blur amount of shadow blur, in pixels.
     * @param angle shadow offset direction, in degrees.
     * @deprecated Prefer independent setters.
     */
    setShadow(
      str: string,
      distance: number,
      blur: integer,
      angle: float
    ): void {
      const color = str.split(';');
      if (color.length < 3) {
        return;
      }
      this._shadowColor[0] = parseInt(color[0], 10);
      this._shadowColor[1] = parseInt(color[1], 10);
      this._shadowColor[2] = parseInt(color[2], 10);
      this._shadowDistance = distance;
      this._shadowBlur = blur;
      this._shadowAngle = angle;
      this._shadow = true;
      this._renderer.updateStyle();
    }

    isShadowEnabled(): boolean {
      return this._shadow;
    }

    /**
     * Show the shadow of the text object.
     * @param enable true to show the shadow, false to hide it
     */
    showShadow(enable: boolean): void {
      this._shadow = enable;
      this._renderer.updateStyle();
    }

    /**
     * Get the shadow opacity of the text object.
     * @return the opacity (0 - 255)
     */
    getShadowOpacity(): number {
      return this._shadowOpacity;
    }

    /**
     * Set the shadow opacity of the text object.
     * @param value the opacity (0 - 255)
     */
    setShadowOpacity(value: float): void {
      this._shadowOpacity = value;
      this._renderer.updateStyle();
    }

    /**
     * Get the shadow offset distance of the text object.
     * @return the shadow offset distance
     */
    getShadowDistance(): number {
      return this._shadowDistance;
    }

    /**
     * Set the shadow offset distance of the text object.
     * @param value the shadow offset distance
     */
    setShadowDistance(value: float): void {
      this._shadowDistance = value;
      this._renderer.updateStyle();
    }

    /**
     * Get the shadow offset angle of the text object.
     * @return the shadow offset angle in degrees
     */
    getShadowAngle(): number {
      return this._shadowAngle;
    }

    /**
     * Set the shadow offset angle of the text object.
     * @param value the shadow offset angle in degrees
     */
    setShadowAngle(value: float): void {
      this._shadowAngle = value;
      this._renderer.updateStyle();
    }

    /**
     * Get the shadow blur radius of the text object.
     * @return the shadow blur radius
     */
    getShadowBlurRadius(): number {
      return this._shadowBlur;
    }

    /**
     * Set the shadow blur radius of the text object.
     * @param value the shadow blur radius
     */
    setShadowBlurRadius(value: float): void {
      this._shadowBlur = value;
      this._renderer.updateStyle();
    }

    /**
     * Set the shadow color of the text object.
     * @param color the shadow color as a "R;G;B" string, for example: "255;0;0"
     */
    setShadowColor(color: string): void {
      this._shadowColor = gdjs.rgbOrHexToRGBColor(color);
      this._renderer.updateStyle();
    }

    /**
     * Set the gradient for the text object.
     * @param strFirstColor color as a "R;G;B" string, for example: "255;0;0"
     * @param strSecondColor color as a "R;G;B" string, for example: "255;0;0"
     * @param strThirdColor color as a "R;G;B" string, for example: "255;0;0"
     * @param strFourthColor color as a "R;G;B" string, for example: "255;0;0"
     * @param strGradientType gradient type
     */
    setGradient(
      strGradientType: string,
      strFirstColor: string,
      strSecondColor: string,
      strThirdColor: string,
      strFourthColor: string
    ): void {
      const colorFirst = strFirstColor.split(';');
      const colorSecond = strSecondColor.split(';');
      const colorThird = strThirdColor.split(';');
      const colorFourth = strFourthColor.split(';');
      this._gradient = [];
      if (colorFirst.length == 3) {
        this._gradient.push([
          parseInt(colorFirst[0], 10),
          parseInt(colorFirst[1], 10),
          parseInt(colorFirst[2], 10),
        ]);
      }
      if (colorSecond.length == 3) {
        this._gradient.push([
          parseInt(colorSecond[0], 10),
          parseInt(colorSecond[1], 10),
          parseInt(colorSecond[2], 10),
        ]);
      }
      if (colorThird.length == 3) {
        this._gradient.push([
          parseInt(colorThird[0], 10),
          parseInt(colorThird[1], 10),
          parseInt(colorThird[2], 10),
        ]);
      }
      if (colorFourth.length == 3) {
        this._gradient.push([
          parseInt(colorFourth[0], 10),
          parseInt(colorFourth[1], 10),
          parseInt(colorFourth[2], 10),
        ]);
      }
      this._gradientType = strGradientType;
      this._useGradient = this._gradient.length > 1 ? true : false;
      this._renderer.updateStyle();
    }

    /**
     * Get padding of the text object.
     * @return number of pixels around the text before it gets cropped
     */
    getPadding(): number {
      return this._padding;
    }

    /**
     * Set padding of the text object.
     * @param value number of pixels around the text before it gets cropped
     */
    setPadding(value: float): void {
      this._padding = value;
      this._renderer.updateStyle();
    }
  }
  gdjs.registerObject('TextObject::Text', gdjs.TextRuntimeObject);
}
