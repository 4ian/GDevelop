namespace gdjs {
  /**
   * Base class for 2D custom objects.
   */
  export class CustomRuntimeObject2D extends gdjs.CustomRuntimeObject {
    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      objectData: ObjectData & CustomObjectConfiguration
    ) {
      super(parent, objectData);
      this.getRenderer().reinitialize(this, parent);
    }

    protected _createRender(): gdjs.CustomObjectRenderer {
      const parent = this._runtimeScene;
      return new gdjs.CustomObjectRenderer(
        this,
        this._instanceContainer,
        parent
      );
    }

    protected _reinitializeRender(): void {
      this.getRenderer().reinitialize(this, this.getParent());
    }

    getRenderer(): gdjs.CustomObjectRenderer {
      return super.getRenderer() as gdjs.CustomObjectRenderer;
    }

    getRendererObject() {
      return this.getRenderer().getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: Object3DData,
      newObjectData: Object3DData
    ): boolean {
      return true;
    }
  }
}
