namespace gdjs {
  const isSpine = (obj: any): obj is spine.Spine =>
    typeof spine !== 'undefined' && obj instanceof spine.Spine;

  const isPointAttachment = (
    attachment: spine.Attachment | null
  ): attachment is spine.PointAttachment =>
    typeof spine !== 'undefined' &&
    !!attachment &&
    attachment instanceof spine.PointAttachment;

  /**
   * @category Renderers > Spine
   */
  export class SpineRuntimeObjectPixiRenderer {
    private _object: gdjs.SpineRuntimeObject;
    private _rendererObject: spine.Spine | PIXI.Container;
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

    getRendererObject(): spine.Spine | PIXI.Container {
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

      this._rendererObject.state.data.setMix(from, to, duration);
    }

    setAnimation(animation: string, loop: boolean): void {
      if (!isSpine(this._rendererObject)) return;

      const onCompleteListener: spine.AnimationStateListener = {
        complete: () => {
          this._isAnimationComplete = true;
          (this._rendererObject as spine.Spine).state.removeListener(
            onCompleteListener
          );
        },
      };

      this._isAnimationComplete = false;
      this._rendererObject.state.addListener(onCompleteListener);
      this._rendererObject.state.setAnimation(0, animation, loop);
      this._rendererObject.update(0);
    }

    getAnimationDuration(sourceAnimationName: string): number {
      if (!isSpine(this._rendererObject)) {
        return 0;
      }
      const animation =
        this._rendererObject.skeleton.data.findAnimation(sourceAnimationName);
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
      // Only one track is used.
      const track = tracks[0];
      if (!track) {
        return 0;
      }
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
      if (!track) return;
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
    ): spine.Vector2 {
      if (!slotName) {
        slotName = attachmentName;
      }
      if (!isSpine(this._rendererObject)) {
        return new spine.Vector2(
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

      const worldPoint = attachment.computeWorldPosition(
        slot.bone,
        new spine.Vector2()
      );
      const transformed = new PIXI.Matrix()
        .rotate(this._rendererObject.rotation)
        .scale(this._rendererObject.scale.x, this._rendererObject.scale.y)
        .translate(this._rendererObject.x, this._rendererObject.y)
        .apply({ x: worldPoint.x, y: worldPoint.y });

      return new spine.Vector2(transformed.x, transformed.y);
    }

    getPointAttachmentRotation(
      attachmentName: string,
      slotName?: string,
      isWorld?: boolean
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

      // Rotation of the point attachment within the skeleton, in degrees.
      // `computeWorldRotation` accounts for both the attachment's own rotation
      // (the angle set on the point in the Spine editor) and the full bone chain
      // it is attached to.
      // Note: the previous code returned only `slot.bone.rotation` for the local
      // case, which ignored the attachment's own rotation entirely - so a point's
      // configured angle had no effect on the "local rotation" expression.
      const localRotation = attachment.computeWorldRotation(slot.bone);

      if (isWorld) {
        // Add the object's own rotation to express the angle in scene space, so
        // that: world rotation = local rotation + object angle.
        return gdjs.toDegrees(this._rendererObject.rotation) + localRotation;
      }

      return localRotation;
    }

    getPointAttachmentScale(
      attachmentName: string,
      slotName?: string,
      isWorld?: boolean
    ): spine.Vector2 {
      if (!slotName) {
        slotName = attachmentName;
      }
      if (!isSpine(this._rendererObject)) {
        return new spine.Vector2(
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

      let scaleX = slot.bone.scaleX;
      let scaleY = slot.bone.scaleY;

      if (isWorld) {
        let parent = slot.bone.parent;
        while (parent) {
          scaleX *= parent.scaleX;
          scaleY *= parent.scaleY;
          parent = parent.parent;
        }

        scaleX *= this._rendererObject.scale.x;
        scaleY *= this._rendererObject.scale.y;
      }

      return new spine.Vector2(scaleX, scaleY);
    }

    setSkin(skinName: string): void {
      if (!isSpine(this._rendererObject)) return;

      const skeleton = this._rendererObject.skeleton;

      const skin = skeleton.data.findSkin(skinName);
      if (!skin) {
        console.warn(
          `[Spine] Skin "${skinName}" not found. Available skins: ${this.getAvailableSkins().join(', ')}`
        );
        return;
      }
      skeleton.setSkinByName(skinName);
      skeleton.setSlotsToSetupPose();
      this._rendererObject.update(0);
    }

    getSkin(): string {
      if (!isSpine(this._rendererObject)) return '';
      return this._rendererObject.skeleton.skin
        ? this._rendererObject.skeleton.skin.name
        : '';
    }

    getAvailableSkins(): string[] {
      if (!isSpine(this._rendererObject)) return [];
      return this._rendererObject.skeleton.data.skins.map((s) => s.name);
    }

    private constructRendererObject(): spine.Spine | PIXI.Container {
      const game = this.instanceContainer.getGame();
      const spineManager = game.getSpineManager();

      if (
        !spineManager ||
        !spineManager.isSpineLoaded(this._object.spineResourceName)
      ) {
        return new PIXI.Container();
      }

      const aliases = spineManager.getSpineAliases(
        this._object.spineResourceName
      );
      if (!aliases) {
        return new PIXI.Container();
      }

      try {
        const spineObject = spine.Spine.from({
          skeleton: aliases.skeletonAlias,
          atlas: aliases.atlasAlias,
          autoUpdate: false,
        });

        const version = spineObject.skeleton.data.version;
        if (version && !version.startsWith('4.2')) {
          console.warn(
            `[Spine] Resource '${this._object.spineResourceName}' was exported with Spine ${version}. ` +
              `The runtime requires Spine 4.2. Animations may not work correctly.`
          );
        }

        return spineObject;
      } catch (error) {
        console.error(
          `Unable to instantiate Spine container for resource '${this._object.spineResourceName}':`,
          error
        );
        return new PIXI.Container();
      }
    }

    private static getSlotAndAttachmentFromRenderObject(
      attachmentName: string,
      slotName: string,
      renderObject: spine.Spine
    ): { slot: spine.Slot; attachment: spine.PointAttachment } {
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
