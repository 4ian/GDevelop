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

    protected _createRender(): gdjs.CustomRuntimeObject2DRenderer {
      const parent = this._runtimeScene;
      return new gdjs.CustomRuntimeObject2DRenderer(
        this,
        this._instanceContainer,
        parent
      );
    }

    protected _reinitializeRenderer(): void {
      this.getRenderer().reinitialize(this, this.getParent());
    }

    getRenderer(): gdjs.CustomRuntimeObject2DRenderer {
      return super.getRenderer() as gdjs.CustomRuntimeObject2DRenderer;
    }

    getRendererObject() {
      return this.getRenderer().getRendererObject();
    }
  }
}
