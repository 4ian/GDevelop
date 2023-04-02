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

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ThreeDShapeObjectData
    ) {
      super(instanceContainer, objectData);

      this._renderer = new gdjs.ThreeDShapeRuntimeObjectRenderer(
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

    }

    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      super.onDestroyFromScene(instanceContainer);
      this._renderer.onDestroy();
    }

  }
  gdjs.registerObject(
    '3D::ThreeDShapeObject',
    gdjs.ThreeDShapeRuntimeObject
  );
}
