namespace gdjs {
  const isSpine = (obj: any): obj is pixi_spine.Spine =>
    obj instanceof pixi_spine.Spine;

  // See https://github.com/pixijs/spine/issues/562
  // IPointAttachment is not declared and exported but its implementation does exist and it is used in runtime
  interface IPointAttachment extends pixi_spine.IVertexAttachment {
    computeWorldPosition(
      bone: pixi_spine.IBone,
      point: pixi_spine.Vector2
    ): pixi_spine.Vector2;
    computeWorldRotation(bone: pixi_spine.IBone): number;
  }

  interface IExtendedBone extends pixi_spine.IBone {
    scaleX: number;
    scaleY: number;
    rotation: number;
    parent: IExtendedBone | null;
  }

  const isPointAttachment = (
    attachment: pixi_spine.IAttachment
  ): attachment is IPointAttachment =>
    !!attachment && attachment.type === pixi_spine.AttachmentType.Point;

  /**
   * @category Renderers > Spine
   */
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
      const animation =
        this._rendererObject.spineData.findAnimation(sourceAnimationName);
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
      if (!isSpine(this._rendererObject)) {
        return true;
      }
      const track = this._rendererObject.state.tracks[0];
      if (!track) {
        return true;
      }
      return this._isAnimationComplete && !track.loop;
    }

    getPointAttachmentPosition(
      attachmentName: string,
      slotName?: string
    ): pixi_spine.Vector2 {
      if (!slotName) {
        slotName = attachmentName;
      }
      if (!isSpine(this._rendererObject)) {
        return new pixi_spine.Vector2(
          this._rendererObject.x,
          this._rendererObject.y
        );
      }

      const { slot, attachment } =
        SpineRuntimeObjectPixiRenderer.getSlotAndAttachmentFromRenderObject(
          attachmentName,
          slotName,
          this._rendererObject
        );

      return new PIXI.Matrix()
        .rotate(this._rendererObject.rotation)
        .scale(this._rendererObject.scale.x, this._rendererObject.scale.y)
        .translate(this._rendererObject.x, this._rendererObject.y)
        .apply(
          attachment.computeWorldPosition(slot.bone, new pixi_spine.Vector2())
        );
    }

    getPointAttachmentRotation(
      attachmentName: string,
      slotName?: string,
      isWorld?: number
    ): number {
      if (!slotName) {
        slotName = attachmentName;
      }
      if (!isSpine(this._rendererObject)) {
        return this._object.angle;
      }

      const { slot, attachment } =
        SpineRuntimeObjectPixiRenderer.getSlotAndAttachmentFromRenderObject(
          attachmentName,
          slotName,
          this._rendererObject
        );

      const bone = slot.bone as IExtendedBone;

      if (isWorld) {
        return (
          gdjs.toDegrees(this._rendererObject.rotation) +
          attachment.computeWorldRotation(slot.bone)
        );
      }

      return bone.rotation;
    }

    getPointAttachmentScale(
      attachmentName: string,
      slotName?: string,
      isWorld?: number
    ): pixi_spine.Vector2 {
      if (!slotName) {
        slotName = attachmentName;
      }
      if (!isSpine(this._rendererObject)) {
        return new pixi_spine.Vector2(
          this._rendererObject.scale.x,
          this._rendererObject.scale.y
        );
      }

      const { slot } =
        SpineRuntimeObjectPixiRenderer.getSlotAndAttachmentFromRenderObject(
          attachmentName,
          slotName,
          this._rendererObject
        );

      let scaleX = 1;
      let scaleY = 1;

      const bone = slot.bone as IExtendedBone;

      scaleX = bone.scaleX;
      scaleY = bone.scaleY;

      if (isWorld) {
        let parent = bone.parent;
        while (parent) {
          if (parent) {
            scaleX *= parent.scaleX;
            scaleY *= parent.scaleY;
          }
          parent = parent.parent;
        }

        scaleX = scaleX * this._rendererObject.scale.x;
        scaleY = scaleY * this._rendererObject.scale.y;
      }

      return new pixi_spine.Vector2(scaleX, scaleY);
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

    private static getSlotAndAttachmentFromRenderObject(
      attachmentName: string,
      slotName: string,
      renderObject: pixi_spine.Spine
    ): { slot: pixi_spine.ISlot; attachment: IPointAttachment } {

      const slot = renderObject.skeleton.findSlot(slotName);
      if (!slot) {
        throw new Error(
          `Unable to find ${slotName} slot name for ${attachmentName} point attachment.`
        );
      }
      const attachment = renderObject.skeleton.getAttachmentByName(
        slotName,
        attachmentName
      );
      if (!isPointAttachment(attachment)) {
        throw new Error(
          `Unable to find ${attachmentName} point attachment with ${slotName} slot name.`
        );
      }
      return { slot, attachment };
    }
  }
  /**
   * @category Renderers > Spine
   */
  export const SpineRuntimeObjectRenderer = SpineRuntimeObjectPixiRenderer;
}
