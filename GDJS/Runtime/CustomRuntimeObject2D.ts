namespace gdjs {
  /**
   * Base class for 2D custom objects.
   * @group Objects
   * @category Custom object
   */
  export class CustomRuntimeObject2D extends gdjs.CustomRuntimeObject {
    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      objectData: ObjectData & CustomObjectConfiguration
    ) {
      super(parent, objectData);
    }

    protected override _createRender(): gdjs.CustomRuntimeObject2DRenderer {
      const parent = this._runtimeScene;
      return new gdjs.CustomRuntimeObject2DRenderer(
        this,
        this._instanceContainer,
        parent
      );
    }

    protected override _reinitializeRenderer(): void {
      this.getRenderer().reinitialize(this, this.getParent());
    }

    override getRenderer(): gdjs.CustomRuntimeObject2DRenderer {
      return super.getRenderer() as gdjs.CustomRuntimeObject2DRenderer;
    }

    override getRendererObject() {
      return this.getRenderer().getRendererObject();
    }
  }
}
