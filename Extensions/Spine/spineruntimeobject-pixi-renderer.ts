namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  import PIXI_SPINE = GlobalPIXIModule.PIXI_SPINE;

  type SpineCb<T = any> = (s: PIXI_SPINE.Spine) => T;

  /**
   * The PIXI.js renderer for the Bitmap Text runtime object.
   */
  export class SpineRuntimeObjectPixiRenderer {
    _object: gdjs.SpineRuntimeObject;
    _pixiObject: PIXI.Container;
    _spine?: PIXI_SPINE.Spine;
    _spinePromise!: Promise<PIXI_SPINE.Spine>;
    private _isUpdatable = true;
    private _isAnimationCompelete = true;

    get isAnimationCompelete() {
      return this._isAnimationCompelete;
    }

    get isUpdatable() {
      return this._isUpdatable;
    }

    set isUpdatable(isUpdatable: boolean) {
      this._isUpdatable = isUpdatable;
      this.applySpineAction(spine => spine.autoUpdate = this._isUpdatable);
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
      this.applySpineAction(spine => spine.state.timeScale = this._object.getTimeScale());
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
      this.applySpineAction(spine => {
        spine.width = width;
        this.updateBounds(spine);
      })
    }

    setHeight(height: float): void {
      this.applySpineAction(spine => {
        spine.height = height;
        this.updateBounds(spine);
      });
    }

    setSize(width: float, height: float): void {
      this.applySpineAction(spine => {
        spine.width = width;
        spine.height = height;
        this.updateBounds(spine);
      });
    }

    setAnimation(animation: string, loop: boolean) {
      this.applySpineAction(s => {
        this._isAnimationCompelete = false;
        s.state.addListener({ complete: () => this._isAnimationCompelete = true });
        s.state.setAnimation(0, animation, loop);
        this.updateBounds(s);
      });
    }

    private applySpineAction(action: SpineCb) {
      if (this._spine) {
        action(this._spine);
      } else {
        this._spinePromise.then(action);
      }
    }

    private constructSpine() {
      const game = this.instanceContainer.getGame();
      const spineJson = game.getJsonManager().getLoadedJson(this._object.jsonResourceName)!;
      const atlasText = game.getTextManager().get(this._object.atlasResourceName)!;
      const atlasImage = game.getImageManager().getPIXITexture(this._object.imageResourceName)!;

      this._spinePromise = this.getSpineSkeleton(spineJson, atlasText, atlasImage)
        .then(skeleton => {
          this._spine = new PIXI_SPINE.Spine(skeleton);
          this._pixiObject.addChild(this._spine);
          this.updateBounds(this._spine);

          return this._spine;
        });
    }

    private updateBounds(s: PIXI_SPINE.Spine) {
      const localBounds = s.getLocalBounds(undefined, true);
      s.position.set(-localBounds.x * s.scale.x, -localBounds.y * s.scale.y);
    }

    private getSpineSkeleton(spineJson: Object, atlasText: string, atlasImage: PIXI.Texture) {
      return new Promise<PIXI_SPINE.ISkeletonData>((resolve) => {
        new PIXI_SPINE.TextureAtlas(
          atlasText,
          (_, textureCb) => textureCb(atlasImage.baseTexture),
          (atlas) => {
            const resourceMoc = {};
            const spineParser = new PIXI_SPINE.SpineParser();
            spineParser.parseData(resourceMoc as any, spineParser.createJsonParser(), atlas, spineJson);
            
            resolve((resourceMoc as unknown as { spineData: PIXI_SPINE.ISkeletonData }).spineData);
          });
      });
    }
  }
  export const SpineRuntimeObjectRenderer = SpineRuntimeObjectPixiRenderer;
}
