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
      if (isSpine(this._rendererObject)) {
        this._rendererObject.autoUpdate = false;
      }

      this.updatePosition();
      this.updateAngle();
      this.updateOpacity();
      this.updateScale();

      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._rendererObject, runtimeObject.getZOrder());
    }

    updateAnimation(timeDelta: float) {
      if (!isSpine(this._rendererObject)) {
        return;
      }
      this._rendererObject.update(timeDelta);
    }

    getRendererObject(): pixi_spine.Spine | PIXI.Container {
      return this._rendererObject;
    }

    getOriginOffset(): PIXI.Point {
      if (!isSpine(this._rendererObject)) return new PIXI.Point(0, 0);

      const localBounds = this._rendererObject.getLocalBounds(undefined, true);

      return new PIXI.Point(
        localBounds.x * this._rendererObject.scale.x,
        localBounds.y * this._rendererObject.scale.y
      );
    }

    onDestroy(): void {
      this._rendererObject.destroy();
    }

    updateScale(): void {
      const scaleX = Math.max(
        this._object._originalScale * this._object.getScaleX(),
        0
      );
      const scaleY = Math.max(
        this._object._originalScale * this._object.getScaleY(),
        0
      );
      this._rendererObject.scale.x = this._object.isFlippedX()
        ? -scaleX
        : scaleX;
      this._rendererObject.scale.y = this._object.isFlippedY()
        ? -scaleY
        : scaleY;
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

    getUnscaledWidth(): float {
      return Math.abs(
        (this._rendererObject.width * this._object._originalScale) /
          this._rendererObject.scale.x
      );
    }

    getUnscaledHeight(): float {
      return Math.abs(
        (this._rendererObject.height * this._object._originalScale) /
          this._rendererObject.scale.y
      );
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

    getAnimationDuration(sourceAnimationName: string) {
      if (!isSpine(this._rendererObject)) {
        return 0;
      }
      const animation = this._rendererObject.spineData.findAnimation(
        sourceAnimationName
      );
      return animation ? animation.duration : 0;
    }

    getAnimationElapsedTime(): number {
      if (!isSpine(this._rendererObject)) {
        return 0;
      }
      const tracks = this._rendererObject.state.tracks;
      if (tracks.length === 0) {
        return 0;
      }
      // This should be fine because only 1 track is used.
      const track = tracks[0];
      // @ts-ignore TrackEntry.getAnimationTime is not exposed.
      return track.getAnimationTime();
    }

    setAnimationElapsedTime(time: number): void {
      if (!isSpine(this._rendererObject)) {
        return;
      }
      const tracks = this._rendererObject.state.tracks;
      if (tracks.length === 0) {
        return;
      }
      const track = tracks[0];
      track.trackTime = time;
    }

    isAnimationComplete(): boolean {
      return this._isAnimationComplete;
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
