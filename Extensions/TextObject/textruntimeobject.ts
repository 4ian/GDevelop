/*
 *  GDevelop JS Platform
 *  2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Base parameters for gdjs.TextRuntimeObject */
  export type TextObjectDataType = {
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
    color: {
      /** The Red level from 0 to 255 */
      r: number;
      /** The Green level from 0 to 255 */
      g: number;
      /** The Blue level from 0 to 255 */
      b: number;
    };
    /** The text of the object */
    string: string;
  };

  export type TextObjectData = ObjectData & TextObjectDataType;

  /**
   * Displays a text.
   *
   * @memberof gdjs
   * @class TextRuntimeObject
   * @extends RuntimeObject
   */
  export class TextRuntimeObject extends gdjs.RuntimeObject {
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
    _wrappingWidth: float = 1;
    _outlineThickness: number = 0;
    _outlineColor: integer[] = [255, 255, 255];
    _shadow: boolean = false;
    _shadowColor: integer[] = [0, 0, 0];
    _shadowDistance: number = 1;
    _shadowBlur: integer = 1;
    _shadowAngle: float = 0;
    _padding: integer = 5;
    _scaleX: number = 1;
    _scaleY: number = 1;
    _str: string;
    // @ts-ignore
    _renderer: gdjs.TextRuntimeObjectRenderer;
    hitBoxesDirty: any;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param textObjectData The initial properties of the object
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      textObjectData: TextObjectData
    ) {
      super(runtimeScene, textObjectData);
      this._characterSize = Math.max(1, textObjectData.characterSize);
      this._fontName = textObjectData.font;
      this._bold = textObjectData.bold;
      this._italic = textObjectData.italic;
      this._underlined = textObjectData.underlined;
      this._color = [
        textObjectData.color.r,
        textObjectData.color.g,
        textObjectData.color.b,
      ];
      this._str = textObjectData.string;
      this._renderer = new gdjs.TextRuntimeObjectRenderer(this, runtimeScene);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: TextObjectData,
      newObjectData: TextObjectData
    ): boolean {
      if (oldObjectData.characterSize !== newObjectData.characterSize) {
        this.setCharacterSize(newObjectData.characterSize);
      }
      if (oldObjectData.font !== newObjectData.font) {
        this.setFontName(newObjectData.font);
      }
      if (oldObjectData.bold !== newObjectData.bold) {
        this.setBold(newObjectData.bold);
      }
      if (oldObjectData.italic !== newObjectData.italic) {
        this.setItalic(newObjectData.italic);
      }
      if (
        oldObjectData.color.r !== newObjectData.color.r ||
        oldObjectData.color.g !== newObjectData.color.g ||
        oldObjectData.color.b !== newObjectData.color.b
      ) {
        this.setColor(
          '' +
            newObjectData.color.r +
            ';' +
            newObjectData.color.g +
            ';' +
            newObjectData.color.b
        );
      }
      if (oldObjectData.string !== newObjectData.string) {
        this.setString(newObjectData.string);
      }
      if (oldObjectData.underlined !== newObjectData.underlined) {
        return false;
      }
      return true;
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    update(): void {
      this._renderer.ensureUpToDate();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWrapping(true);
        this.setWrappingWidth(initialInstanceData.width);
      } else {
        this.setWrapping(false);
      }
    }

    /**
     * Update the rendered object position.
     */
    private _updateTextPosition() {
      this.hitBoxesDirty = true;
      this._renderer.updatePosition();
    }

    /**
     * Set object position on X axis.
     */
    setX(x): void {
      super.setX(x);
      this._updateTextPosition();
    }

    /**
     * Set object position on Y axis.
     */
    setY(y): void {
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
    setOpacity(opacity): void {
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
     */
    getString(): string {
      return this._str;
    }

    /**
     * Set the string displayed by the object.
     * @param str The new text
     */
    setString(str: string): void {
      if (str === this._str) {
        return;
      }
      this._str = str;
      this._renderer.updateString();
      this._updateTextPosition();
    }

    /**
     * Get the font size of the characters of the object.
     */
    getCharacterSize() {
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
    setBold(enable): void {
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
    setItalic(enable): void {
      this._italic = enable;
      this._renderer.updateStyle();
    }

    /**
     * Get width of the text.
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get height of the text.
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }

    /**
     * Get scale of the text.
     */
    getScale() {
      return (Math.abs(this._scaleX) + Math.abs(this._scaleY)) / 2.0;
    }

    /**
     * Get y-scale of the text.
     */
    getScaleX(): float {
      return this._renderer.getScaleX();
    }

    /**
     * Get x-scale of the text.
     */
    getScaleY(): float {
      return this._renderer.getScaleY();
    }

    /**
     * Set the text object scale.
     * @param newScale The new scale for the text object.
     */
    setScale(newScale: number): void {
      this._scaleX = newScale;
      this._scaleY = newScale;
      this._renderer.setScale(newScale);
    }

    /**
     * Set the text object x-scale.
     * @param newScale The new x-scale for the text object.
     */
    setScaleX(newScale: number): void {
      this._scaleX = newScale;
      this._renderer.setScaleX(newScale);
    }

    /**
     * Set the text object y-scale.
     * @param newScale The new y-scale for the text object.
     */
    setScaleY(newScale: number): void {
      this._scaleY = newScale;
      this._renderer.setScaleY(newScale);
    }

    /**
     * Change the text color.
     * @param color color as a "R;G;B" string, for example: "255;0;0"
     */
    setColor(str): void {
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
    getColor(str): string {
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
      this._wrapping = enable;
      this._renderer.updateStyle();
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
      this._wrappingWidth = width;
      this._renderer.updateStyle();
    }

    /**
     * Set the outline for the text object.
     * @param str color as a "R;G;B" string, for example: "255;0;0"
     * @param thickness thickness of the outline (0 = disabled)
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

    /**
     * Set the shadow for the text object.
     * @param str color as a "R;G;B" string, for example: "255;0;0"
     * @param distance distance between the shadow and the text, in pixels.
     * @param blur amout of shadow blur, in pixels.
     * @param angle shadow offset direction, in degrees.
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
     * Show the shadow of the text object.
     * @param enable true to show the shadow, false to hide it
     */
    showShadow(enable: boolean): void {
      this._shadow = enable;
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
