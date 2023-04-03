namespace gdjs {
  /** Base parameters for {@link gdjs.ThreeDShapeRuntimeObject} */
  export interface ThreeDShapeObjectData extends ObjectData {
    /** The base parameters of the ThreeDShape */
    content: {

    };
  }

  /**
   * Shows a text input on the screen the player can type text into.
   */
  export class ThreeDShapeRuntimeObject extends gdjs.RuntimeObject {
    _renderer: ThreeDShapeRuntimeObjectRenderer;
    z: number = 0;

    // Width and height can be stored because they do not depend on the
    // size of the texture being used (contrary to most objects).
    private _width: float;
    private _height: float;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ThreeDShapeObjectData
    ) {
      super(instanceContainer, objectData);

      this._renderer = new gdjs.ThreeDShapeRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._width = 100;
      this._height = 100;

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return null;
    }

    updateFromObjectData(
      oldObjectData: ThreeDShapeObjectData,
      newObjectData: ThreeDShapeObjectData
    ): boolean {
      return true;
    }

    updatePreRender(instanceContainer: RuntimeInstanceContainer): void {
      this._renderer.updatePreRender();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      super.onDestroyFromScene(instanceContainer);
      this._renderer.onDestroy();
    }

    getWidth(): float {
      return this._width;
    }

    getHeight(): float {
      return this._height;
    }

    setWidth(width: float): void {
      if (this._width === width) return;

      this._width = width;
      this._renderer.updateSize();
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this._height === height) return;

      this._height = height;
      this._renderer.updateSize();
      this.invalidateHitboxes();
    }

  }
  gdjs.registerObject(
    '3D::ThreeDShapeObject',
    gdjs.ThreeDShapeRuntimeObject
  );
}
