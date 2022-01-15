namespace gdjs {
  const logger = new gdjs.Logger('Text input object');

  /** Base parameters for {@link gdjs.TextInputRuntimeObject} */
  export type TextInputObjectDataType = {
    /** The base parameters of the TextInput */
    content: {
      placeholder: string;
      fontResourceName: string;
      initialValue: string;
    };
  };
  export type TextInputObjectData = ObjectData & TextInputObjectDataType;

  /**
   * Shows a text input on the screen the player can type text into.
   */
  export class TextInputRuntimeObject extends gdjs.RuntimeObject {
    private _value: string;
    private opacity: float = 255;
    private _width: float = 200;
    private _height: float = 30;
    private _fontResourceName: string;

    _renderer: TextInputRuntimeObjectRenderer;

    constructor(runtimeScene: gdjs.RuntimeScene, objectData: TextInputObjectData) {
      super(runtimeScene, objectData);

      this._value = objectData.content.initialValue;
      this._fontResourceName = objectData.content.fontResourceName;
      this._renderer = new gdjs.TextInputRuntimeObjectRenderer(this);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return {}; // TODO: this will break when changing layer. Instead, return null but still call updatePreRender?
    }

    updateFromObjectData(oldObjectData: TextInputObjectData, newObjectData: TextInputObjectData): boolean {
      // Compare previous and new data for the object and update it accordingly.
      // This is useful for "hot-reloading".
      if (
        oldObjectData.content.initialValue !==
        newObjectData.content.initialValue
      ) {
        if (this._value === oldObjectData.content.initialValue) {
          this._value = newObjectData.content.initialValue;
          this._renderer.updateValue();
        }
      }
      // TODO: placeholder support
      if (
        oldObjectData.content.fontResourceName !==
        newObjectData.content.fontResourceName
      ) {
        this.setFont(newObjectData.content.fontResourceName);
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
          this._value = property.value;
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
     * TODO
     */
    getValue() {
      return this._value;
    }

    /**
     * TODO
     */
    setValue(newValue: string) {
      if (newValue === this._value) return;

      this._value = newValue;
      this._renderer.updateValue();
    }

    getFont() {
      return this._fontResourceName;
    }

    setFont(resourceName: string) {
      this._fontResourceName = resourceName;
      this._renderer.updateFont();
    }
  }
  gdjs.registerObject(
    'TextInput::TextInputObject',
    gdjs.TextInputRuntimeObject
  );
}
