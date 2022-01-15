namespace gdjs {
  const logger = new gdjs.Logger('Text input object');

  const supportedInputTypes = [
    'text',
    'email',
    'password',
    'number',
    'telephone number',
    'url',
    'search',
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
  export type TextInputObjectDataType = {
    /** The base parameters of the TextInput */
    content: {
      initialValue: string;
      placeholder: string;
      fontResourceName: string;
      fontSize: float;
      inputType: SupportedInputType;
    };
  };
  export type TextInputObjectData = ObjectData & TextInputObjectDataType;

  const defaultWidth = 300;
  const defaultHeight = 30;

  /**
   * Shows a text input on the screen the player can type text into.
   */
  export class TextInputRuntimeObject extends gdjs.RuntimeObject {
    private _value: string;
    private _placeholder: string;
    private opacity: float = 255;
    private _width: float = defaultWidth;
    private _height: float = defaultHeight;
    private _fontResourceName: string;
    private _fontSize: float;
    private _inputType: SupportedInputType;

    _renderer: TextInputRuntimeObjectRenderer;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      objectData: TextInputObjectData
    ) {
      super(runtimeScene, objectData);

      this._value = objectData.content.initialValue;
      this._placeholder = objectData.content.placeholder;
      this._fontResourceName = objectData.content.fontResourceName;
      this._fontSize = objectData.content.fontSize || 20;
      this._inputType = parseInputType(objectData.content.inputType);

      this._renderer = new gdjs.TextInputRuntimeObjectRenderer(this);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return {}; // TODO: this will break when changing layer. Instead, return null but still call updatePreRender?
    }

    updateFromObjectData(
      oldObjectData: TextInputObjectData,
      newObjectData: TextInputObjectData
    ): boolean {
      if (
        oldObjectData.content.initialValue !==
        newObjectData.content.initialValue
      ) {
        if (this._value === oldObjectData.content.initialValue) {
          this.setValue(newObjectData.content.initialValue);
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
      return true;
    }

    updatePreRender(runtimeScene: RuntimeScene): void {
      this._renderer.updatePreRender();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      for (const property of initialInstanceData.stringProperties) {
        if (property.name === 'initialValue') {
          this.setValue(property.value);
        } else if (property.name === 'placeholder') {
          this.setPlaceholder(property.value);
        }
      }
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    setZOrder(z: number): void {
      // TODO: find how to handle these Z order
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
     * Set the width of the object, if applicable.
     * @param width The new width in pixels.
     */
    setWidth(width: float): void {
      this._width = width;
    }

    /**
     * Set the height of the object, if applicable.
     * @param height The new height in pixels.
     */
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
     */
    getValue() {
      return this._value;
    }

    /**
     * Replace the text inside the text input.
     */
    setValue(newValue: string) {
      if (newValue === this._value) return;

      this._value = newValue;
      this._renderer.updateValue();
    }

    /**
     * Called by the renderer when the value of the input shown on the screen
     * was changed (because the user typed something).
     * This does not propagate back the value to the renderer, which would
     * result in the cursor being sent back to the end of the text.
     *
     * Do not use this if you are not inside the renderer - use `setValue` instead.
     */
    onRendererInputValueChanged(newValue: string) {
      this._value = newValue;
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
  }
  gdjs.registerObject(
    'TextInput::TextInputObject',
    gdjs.TextInputRuntimeObject
  );
}
