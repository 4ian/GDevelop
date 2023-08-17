namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  import PIXI_SPINE = GlobalPIXIModule.PIXI_SPINE;

  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   */
  export class SpineRuntimeObjectPixiRenderer {
    _object: gdjs.SpineRuntimeObject;
    _pixiObject: PIXI.Container;
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
      this._pixiObject = new PIXI.Container();
      this.constructSpine();

      // Set the object on the scene
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

      this.updateTimeScale();
      this.updatePosition();
      this.updateAngle();
      this.updateOpacity();
      this.updateScale();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    onDestroy() {
      this._pixiObject.destroy();
    }

    updateTimeScale() {
      this._spine.state.timeScale = this._object.getTimeScale();
    }

    updateScale(): void {
      this._pixiObject.scale.set(Math.max(this._object.getScale(), 0));
    }

    getScale() {
      // is it ok ? see it as a pattern
      return Math.max(this._pixiObject.scale.x, this._pixiObject.scale.y);
    }

    updatePosition(): void {
      this._pixiObject.position.x = this._object.x;
      this._pixiObject.position.y = this._object.y;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object.getOpacity() / 255;
    }

    getWidth(): float {
      return this._pixiObject.width;
    }

    getHeight(): float {
      return this._pixiObject.height;
    }

    setWidth(width: float): void {
      this._spine.width = width;
      this.updateBounds(this._spine);
    }

    setHeight(height: float): void {
      this._spine.height = height;
      this.updateBounds(this._spine);
    }

    setSize(width: float, height: float): void {
      this._spine.width = width;
      this._spine.height = height;
      this.updateBounds(this._spine);
    }

    setAnimation(animation: string, loop: boolean) {
      this._isAnimationCompelete = false;
      this._spine.state.addListener({ complete: () => this._isAnimationCompelete = true });
      this._spine.state.setAnimation(0, animation, loop);
      this._spine.update(0);
      this.updateBounds(this._spine);
    }

    private constructSpine() {
      const game = this.instanceContainer.getGame();
      const spineJson = game.getJsonManager().getLoadedJson(this._object.jsonResourceName)!;
      const atlas = game.getTextManager().getAtlasTexture(this._object.atlasResourceName)!;

      const resourceMoc = {};
      const spineParser = new PIXI_SPINE.SpineParser();
      spineParser.parseData(resourceMoc as any, spineParser.createJsonParser(), atlas, spineJson);
      this._spine = new PIXI_SPINE.Spine((resourceMoc as unknown as { spineData: PIXI_SPINE.ISkeletonData }).spineData);
      this._pixiObject.addChild(this._spine);
      this.updateBounds(this._spine);
    }

    private updateBounds(s: PIXI_SPINE.Spine) {
      const localBounds = s.getLocalBounds(undefined, true);
      s.position.set(-localBounds.x * s.scale.x, -localBounds.y * s.scale.y);
    }
  }
  export const SpineRuntimeObjectRenderer = SpineRuntimeObjectPixiRenderer;
}
