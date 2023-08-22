namespace gdjs {
  import PIXI_SPINE = GlobalPIXIModule.PIXI_SPINE;

  export class SpineRuntimeObjectPixiRenderer {
    _object: gdjs.SpineRuntimeObject;
    _spine!: PIXI_SPINE.Spine;
    private _isAnimationCompelete = true;

    get isAnimationCompelete() {
      return this._isAnimationCompelete;
    }

    get isUpdatable() {
      return this._spine.autoUpdate;
    }

    set isUpdatable(isUpdatable: boolean) {
      this._spine.autoUpdate = isUpdatable
    }

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The container in which the object is
     */
    constructor(
      runtimeObject: gdjs.SpineRuntimeObject,
      private instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;

      this.constructSpine();
      this.updateTimeScale();
      this.updatePosition();
      this.updateAngle();
      this.updateOpacity();
      this.updateScale();

      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._spine, runtimeObject.getZOrder());
    }

    getRendererObject() {
      return this._spine;
    }

    onDestroy() {
      this._spine.destroy();
    }

    updateTimeScale() {
      this._spine.state.timeScale = this._object.getTimeScale();
    }

    updateScale(): void {
      this._spine.scale.set(Math.max(this._object.getScale(), 0));
      this.updateBounds();
    }

    updatePosition(): void {
      this.updateBounds();
    }

    updateAngle(): void {
      this._spine.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._spine.alpha = this._object.getOpacity() / 255;
    }

    getWidth(): float {
      return this._spine.width;
    }

    getHeight(): float {
      return this._spine.height;
    }

    setWidth(width: float): void {
      this._spine.width = width;
      this.updateBounds();
    }

    setHeight(height: float): void {
      this._spine.height = height;
      this.updateBounds();
    }

    setSize(width: float, height: float): void {
      this._spine.width = width;
      this._spine.height = height;
      this.updateBounds();
    }

    setAnimation(animation: string, loop: boolean) {
      this._isAnimationCompelete = false;
      this._spine.state.addListener({ complete: () => this._isAnimationCompelete = true });
      this._spine.state.setAnimation(0, animation, loop);
      this._spine.update(0);
      this.updateBounds();
    }

    private constructSpine() {
      const game = this.instanceContainer.getGame();
      const spineJson = game.getJsonManager().getLoadedJson(this._object.jsonResourceName)!;
      const atlas = game.getAtlasManager().getAtlasTexture(this._object.atlasResourceName)!;

      const resourceMoc = {};
      const spineParser = new PIXI_SPINE.SpineParser();
      spineParser.parseData(resourceMoc as any, spineParser.createJsonParser(), atlas, spineJson);
      this._spine = new PIXI_SPINE.Spine((resourceMoc as unknown as { spineData: PIXI_SPINE.ISkeletonData }).spineData);
    }

    private updateBounds() {
      this._spine.position.x = this._object.x;
      this._spine.position.y = this._object.y;
      
      const localBounds = this._spine.getLocalBounds(undefined, true);

      this._spine.position.x -= localBounds.x * this._spine.scale.x;
      this._spine.position.y -= localBounds.y * this._spine.scale.y;
    }
  }
  export const SpineRuntimeObjectRenderer = SpineRuntimeObjectPixiRenderer;
}
