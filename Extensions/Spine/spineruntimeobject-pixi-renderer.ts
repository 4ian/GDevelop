namespace gdjs {
  const isSpine = (obj: any): obj is pixi_spine.Spine =>
    obj instanceof pixi_spine.Spine;

  export class SpineRuntimeObjectPixiRenderer {
    private _object: gdjs.SpineRuntimeObject;
    private _rendererObject: pixi_spine.Spine | PIXI.Container;
    private _isAnimationComplete = true;

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The container in which the object is
     */
    constructor(
      runtimeObject: gdjs.SpineRuntimeObject,
      private instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._rendererObject = this.constructRendererObject();

      this.updateTimeScale();
      this.updatePosition();
      this.updateAngle();
      this.updateOpacity();
      this.updateScale();

      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._rendererObject, runtimeObject.getZOrder());
    }

    getRendererObject(): pixi_spine.Spine | PIXI.Container {
      return this._rendererObject;
    }

    onDestroy(): void {
      this._rendererObject.destroy();
    }

    updateTimeScale(): void {
      if (!isSpine(this._rendererObject)) return;

      this._rendererObject.state.timeScale = this._object.getTimeScale();
    }

    updateScale(): void {
      this._rendererObject.scale.set(Math.max(this._object.getScale(), 0));
    }

    updatePosition(): void {
      this._rendererObject.position.x = this._object.x;
      this._rendererObject.position.y = this._object.y;
    }

    updateAngle(): void {
      this._rendererObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._rendererObject.alpha = this._object.getOpacity() / 255;
    }

    getWidth(): float {
      return this._rendererObject.width;
    }

    getHeight(): float {
      return this._rendererObject.height;
    }

    setWidth(width: float): void {
      this._rendererObject.width = width;
    }

    setHeight(height: float): void {
      this._rendererObject.height = height;
    }

    setSize(width: float, height: float): void {
      this._rendererObject.width = width;
      this._rendererObject.height = height;
    }

    setMixing(from: string, to: string, duration: number): void {
      if (!isSpine(this._rendererObject)) return;

      this._rendererObject.stateData.setMix(from, to, duration);
    }

    setAnimation(animation: string, loop: boolean): void {
      if (isSpine(this._rendererObject)) {
        const onCompleteListener: pixi_spine.IAnimationStateListener = {
          complete: () => {
            this._isAnimationComplete = true;
            (this._rendererObject as pixi_spine.Spine).state.removeListener(
              onCompleteListener
            );
          },
        };

        this._isAnimationComplete = false;
        this._rendererObject.state.addListener(onCompleteListener);
        this._rendererObject.state.setAnimation(0, animation, loop);
        this._rendererObject.update(0);
      }
    }

    isAnimationComplete(): boolean {
      return this._isAnimationComplete;
    }

    isUpdatable(): boolean {
      if (isSpine(this._rendererObject)) {
        return this._rendererObject.autoUpdate;
      }

      return true;
    }

    setIsUpdatable(isUpdatable: boolean): void {
      if (isSpine(this._rendererObject)) {
        this._rendererObject.autoUpdate = isUpdatable;
      }
    }

    private constructRendererObject(): pixi_spine.Spine | PIXI.Container {
      const game = this.instanceContainer.getGame();
      const spineManager = game.getSpineManager();

      if (
        !spineManager ||
        !spineManager.isSpineLoaded(this._object.spineResourceName)
      ) {
        return new PIXI.Container();
      }

      return new pixi_spine.Spine(
        spineManager.getSpine(this._object.spineResourceName)!
      );
    }
  }
  export const SpineRuntimeObjectRenderer = SpineRuntimeObjectPixiRenderer;
}
