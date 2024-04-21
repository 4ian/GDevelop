namespace gdjs {
  const supportedInputTypes = [
    'text',
    'email',
    'password',
    'number',
    'telephone number',
    'url',
    'search',
    'text area',
  ] as const;

  type SupportedInputType = typeof supportedInputTypes[number];

  const parseInputType = (potentialInputType: string): SupportedInputType => {
    const lowercasedNewInputType = potentialInputType.toLowerCase();

    // @ts-ignore - we're actually checking that this value is correct.
    if (supportedInputTypes.includes(lowercasedNewInputType))
      return potentialInputType as SupportedInputType;

    return 'text';
  };

  /** Base parameters for {@link gdjs.TextInputRuntimeObject} */
  export interface TextInputObjectData extends ObjectData {
    /** The base parameters of the TextInput */
    content: {
      initialValue: string;
      placeholder: string;
      fontResourceName: string;
      fontSize: float;
      inputType: SupportedInputType;
      textColor: string;
      fillColor: string;
      fillOpacity: float;
      borderColor: string;
      borderOpacity: float;
      borderWidth: float;
      disabled: boolean;
      readOnly: boolean;
    };
  }

  const DEFAULT_WIDTH = 300;
  const DEFAULT_HEIGHT = 30;

  /**
   * Shows a text input on the screen the player can type text into.
   */
  export class TextInputRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.TextContainer, gdjs.Resizable, gdjs.OpacityHandler {
    private _string: string;
    private _placeholder: string;
    private opacity: float = 255;
    private _width: float = DEFAULT_WIDTH;
    private _height: float = DEFAULT_HEIGHT;
    private _fontResourceName: string;
    private _fontSize: float;
    private _inputType: SupportedInputType;
    private _textColor: [float, float, float];
    private _fillColor: [float, float, float];
    private _fillOpacity: float;
    private _borderColor: [float, float, float];
    private _borderOpacity: float;
    private _borderWidth: float;
    private _disabled: boolean;
    private _readOnly: boolean;

    _renderer: TextInputRuntimeObjectRenderer;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: TextInputObjectData
    ) {
      super(instanceContainer, objectData);

      this._string = objectData.content.initialValue;
      this._placeholder = objectData.content.placeholder;
      this._fontResourceName = objectData.content.fontResourceName;
      this._fontSize = objectData.content.fontSize || 20;
      this._inputType = parseInputType(objectData.content.inputType);
      this._textColor = gdjs.rgbOrHexToRGBColor(objectData.content.textColor);
      this._fillColor = gdjs.rgbOrHexToRGBColor(objectData.content.fillColor);
      this._fillOpacity = objectData.content.fillOpacity;
      this._borderColor = gdjs.rgbOrHexToRGBColor(
        objectData.content.borderColor
      );
      this._borderOpacity = objectData.content.borderOpacity;
      this._borderWidth = objectData.content.borderWidth;
      this._disabled = objectData.content.disabled;
      this._readOnly = objectData.content.readOnly;

      this._renderer = new gdjs.TextInputRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return null;
    }

    updateFromObjectData(
      oldObjectData: TextInputObjectData,
      newObjectData: TextInputObjectData
    ): boolean {
      if (
        oldObjectData.content.initialValue !==
        newObjectData.content.initialValue
      ) {
        if (this._string === oldObjectData.content.initialValue) {
          this.setString(newObjectData.content.initialValue);
        }
      }
      if (
        oldObjectData.content.placeholder !== newObjectData.content.placeholder
      ) {
        this.setPlaceholder(newObjectData.content.placeholder);
      }
      if (
        oldObjectData.content.fontResourceName !==
        newObjectData.content.fontResourceName
      ) {
        this.setFontResourceName(newObjectData.content.fontResourceName);
      }
      if (oldObjectData.content.fontSize !== newObjectData.content.fontSize) {
        this.setFontSize(newObjectData.content.fontSize);
      }
      if (oldObjectData.content.inputType !== newObjectData.content.inputType) {
        this.setInputType(newObjectData.content.inputType);
      }
      if (oldObjectData.content.textColor !== newObjectData.content.textColor) {
        this.setTextColor(newObjectData.content.textColor);
      }
      if (oldObjectData.content.fillColor !== newObjectData.content.fillColor) {
        this.setFillColor(newObjectData.content.fillColor);
      }
      if (
        oldObjectData.content.fillOpacity !== newObjectData.content.fillOpacity
      ) {
        this.setFillOpacity(newObjectData.content.fillOpacity);
      }
      if (
        oldObjectData.content.borderColor !== newObjectData.content.borderColor
      ) {
        this.setBorderColor(newObjectData.content.borderColor);
      }
      if (
        oldObjectData.content.borderOpacity !==
        newObjectData.content.borderOpacity
      ) {
        this.setBorderOpacity(newObjectData.content.borderOpacity);
      }
      if (
        oldObjectData.content.borderWidth !== newObjectData.content.borderWidth
      ) {
        this.setBorderWidth(newObjectData.content.borderWidth);
      }
      if (oldObjectData.content.disabled !== newObjectData.content.disabled) {
        this.setDisabled(newObjectData.content.disabled);
      }
      if (oldObjectData.content.readOnly !== newObjectData.content.readOnly) {
        this.setReadOnly(newObjectData.content.readOnly);
      }
      return true;
    }

    updatePreRender(instanceContainer: RuntimeInstanceContainer): void {
      this._renderer.updatePreRender();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      for (const property of initialInstanceData.stringProperties) {
        if (property.name === 'initialValue') {
          this.setString(property.value);
        } else if (property.name === 'placeholder') {
          this.setPlaceholder(property.value);
        }
      }
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    onScenePaused(runtimeScene: gdjs.RuntimeScene): void {
      this._renderer.onScenePaused();
    }

    onSceneResumed(runtimeScene: gdjs.RuntimeScene): void {
      this._renderer.onSceneResumed();
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    setOpacity(opacity: float): void {
      this.opacity = Math.max(0, Math.min(255, opacity));
      this._renderer.updateOpacity();
    }

    getOpacity(): float {
      return this.opacity;
    }

    setSize(width: number, height: number): void {
      this.setWidth(width);
      this.setHeight(height);
    }

    setWidth(width: float): void {
      this._width = width;
    }

    setHeight(height: float): void {
      this._height = height;
    }

    /**
     * Return the width of the object.
     * @return The width of the object
     */
    getWidth(): float {
      return this._width;
    }

    /**
     * Return the width of the object.
     * @return The height of the object
     */
    getHeight(): float {
      return this._height;
    }

    /**
     * Get the text entered in the text input.
     * @deprecated use `getText` instead
     */
    getString() {
      return this.getText();
    }

    /**
     * Replace the text inside the text input.
     * @deprecated use `setText` instead
     */
    setString(text: string) {
      this.setText(text);
    }

    getText() {
      return this._string;
    }

    setText(newString: string) {
      if (newString === this._string) return;

      this._string = newString;
      this._renderer.updateString();
    }

    /**
     * Called by the renderer when the value of the input shown on the screen
     * was changed (because the user typed something).
     * This does not propagate back the value to the renderer, which would
     * result in the cursor being sent back to the end of the text.
     *
     * Do not use this if you are not inside the renderer - use `setString` instead.
     */
    onRendererInputValueChanged(inputValue: string) {
      this._string = inputValue;
    }

    getFontResourceName() {
      return this._fontResourceName;
    }

    setFontResourceName(resourceName: string) {
      if (this._fontResourceName === resourceName) return;

      this._fontResourceName = resourceName;
      this._renderer.updateFont();
    }

    getFontSize() {
      return this._fontSize;
    }

    setFontSize(newSize: number) {
      this._fontSize = newSize;
    }

    /**
     * Get the placeholder shown when no text is entered
     */
    getPlaceholder() {
      return this._placeholder;
    }

    /**
     * Replace the text inside the text input.
     */
    setPlaceholder(newPlaceholder: string) {
      if (newPlaceholder === this._placeholder) return;

      this._placeholder = newPlaceholder;
      this._renderer.updatePlaceholder();
    }

    /**
     * Get the type of the input.
     */
    getInputType() {
      return this._inputType;
    }

    /**
     * Set the type of the input.
     */
    setInputType(newInputType: string) {
      const lowercasedNewInputType = newInputType.toLowerCase();
      if (lowercasedNewInputType === this._inputType) return;

      this._inputType = parseInputType(lowercasedNewInputType);
      this._renderer.updateInputType();
    }

    setTextColor(newColor: string) {
      this._textColor = gdjs.rgbOrHexToRGBColor(newColor);
      this._renderer.updateTextColor();
    }

    getTextColor(): string {
      return (
        this._textColor[0] + ';' + this._textColor[1] + ';' + this._textColor[2]
      );
    }

    _getRawTextColor(): [float, float, float] {
      return this._textColor;
    }

    setFillColor(newColor: string) {
      this._fillColor = gdjs.rgbOrHexToRGBColor(newColor);
      this._renderer.updateFillColorAndOpacity();
    }

    getFillColor(): string {
      return (
        this._fillColor[0] + ';' + this._fillColor[1] + ';' + this._fillColor[2]
      );
    }

    _getRawFillColor(): [float, float, float] {
      return this._fillColor;
    }

    setFillOpacity(newOpacity: float) {
      this._fillOpacity = Math.max(0, Math.min(255, newOpacity));
      this._renderer.updateFillColorAndOpacity();
    }

    getFillOpacity(): float {
      return this._fillOpacity;
    }

    setBorderColor(newColor: string) {
      this._borderColor = gdjs.rgbOrHexToRGBColor(newColor);
      this._renderer.updateBorderColorAndOpacity();
    }

    getBorderColor(): string {
      return (
        this._borderColor[0] +
        ';' +
        this._borderColor[1] +
        ';' +
        this._borderColor[2]
      );
    }

    _getRawBorderColor(): [float, float, float] {
      return this._borderColor;
    }

    setBorderOpacity(newOpacity: float) {
      this._borderOpacity = Math.max(0, Math.min(255, newOpacity));
      this._renderer.updateBorderColorAndOpacity();
    }

    getBorderOpacity(): float {
      return this._borderOpacity;
    }

    setBorderWidth(width: float) {
      this._borderWidth = Math.max(0, width);
      this._renderer.updateBorderWidth();
    }

    getBorderWidth(): float {
      return this._borderWidth;
    }

    setDisabled(value: boolean) {
      this._disabled = value;
      this._renderer.updateDisabled();
    }

    isDisabled(): boolean {
      return this._disabled;
    }

    setReadOnly(value: boolean) {
      this._readOnly = value;
      this._renderer.updateReadOnly();
    }

    isReadOnly(): boolean {
      return this._readOnly;
    }

    isFocused(): boolean {
      return this._renderer.isFocused();
    }

    focus(): void {
      this._renderer.focus();
    }
  }
  gdjs.registerObject(
    'TextInput::TextInputObject',
    gdjs.TextInputRuntimeObject
  );
}
