(function() {
  if (typeof gdjs === 'undefined') return;

  const DEFAULT_RUNTIME_SCRIPT_PATH =
    'Extensions/Spine43Object/spine-pixi-v7.js';

  const toNumber = (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const toBoolean = value => value === true || value === 'true' || value === 1;

  const getAdapter = () =>
    typeof window !== 'undefined' ? window.GDSpine43Adapter : null;

  const normalizeTrack = trackIndex =>
    Math.max(0, Math.floor(toNumber(trackIndex, 0)));

  gdjs.Spine43RuntimeObject = class Spine43RuntimeObject extends gdjs.RuntimeObject {
    constructor(instanceContainer, objectData, instanceData) {
      super(instanceContainer, objectData, instanceData);

      const content = objectData.content || {};
      this._content = content;
      this._runtimeScriptPath =
        content.runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH;
      this._skeletonResource = content.skeletonResource || '';
      this._atlasResource = content.atlasResource || '';
      this._binaryData = !!content.binaryData;
      this._importScale = Math.max(0.0001, toNumber(content.importScale, 1));
      this._skinName = content.skinName || '';
      this._animationName = content.animationName || '';
      this._loop = content.loop !== false;
      this._mixDuration = Math.max(0, toNumber(content.mixDuration, 0));
      this._timeScale = toNumber(content.timeScale, 1);
      this._inspectorOverrides = content.inspectorOverrides || {};
      this._opacity = Math.max(
        0,
        Math.min(255, toNumber(content.opacity, 255))
      );
      this._visible = content.visible !== false;

      this._pixiObject =
        typeof PIXI !== 'undefined' ? new PIXI.Container() : { visible: true };
      this._rendererObjectAddedToLayer = false;
      this._handle = null;
      this._loading = false;
      this._ready = false;
      this._lastError = '';
      this._lastSceneBlocking = null;
      this._lastCollisionObjectName = '';
      this._lastCollisionStrength = 0;

      this._syncTransform();
      this._syncVisibility();
      this._attachRendererObjectToLayer();
      this.reload();

      this.onCreated();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    _attachRendererObjectToLayer() {
      if (
        this._rendererObjectAddedToLayer ||
        !this._pixiObject ||
        !this._pixiObject.position ||
        !this._runtimeScene ||
        !this._runtimeScene.getLayer
      ) {
        return;
      }

      try {
        this._runtimeScene
          .getLayer(this.layer || '')
          .getRenderer()
          .addRendererObject(this._pixiObject, this.getZOrder());
        this._rendererObjectAddedToLayer = true;
      } catch (error) {
        this._lastError =
          error && error.message ? error.message : String(error || '');
        console.error('Unable to attach Spine 4.3 object renderer:', error);
      }
    }

    updateFromObjectData(oldObjectData, newObjectData) {
      const oldContent = oldObjectData.content || {};
      const newContent = newObjectData.content || {};
      const needsReload =
        oldContent.runtimeScriptPath !== newContent.runtimeScriptPath ||
        oldContent.skeletonResource !== newContent.skeletonResource ||
        oldContent.atlasResource !== newContent.atlasResource ||
        oldContent.binaryData !== newContent.binaryData ||
        oldContent.importScale !== newContent.importScale;

      this._content = newContent;
      this._runtimeScriptPath =
        newContent.runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH;
      this._skeletonResource = newContent.skeletonResource || '';
      this._atlasResource = newContent.atlasResource || '';
      this._binaryData = !!newContent.binaryData;
      this._importScale = Math.max(0.0001, toNumber(newContent.importScale, 1));
      this._loop = newContent.loop !== false;
      this.setOpacity(toNumber(newContent.opacity, this._opacity));
      this.setVisible(newContent.visible !== false);
      this.setTimeScale(toNumber(newContent.timeScale, this._timeScale));
      this.setMixDuration(toNumber(newContent.mixDuration, this._mixDuration));
      this._inspectorOverrides = newContent.inspectorOverrides || {};

      if (needsReload) {
        this.reload();
        return true;
      }

      if (oldContent.skinName !== newContent.skinName) {
        this.setSkin(newContent.skinName || '');
      }
      if (oldContent.animationName !== newContent.animationName) {
        this.playAnimation(newContent.animationName || '', this._loop);
      }
      this.applyInspectorOverrides();
      return true;
    }

    extraInitializationFromInitialInstance(initialInstanceData) {
      const animationOverride =
        initialInstanceData &&
        initialInstanceData.stringProperties &&
        initialInstanceData.stringProperties.find(
          property => property.name === 'animationName'
        );
      if (animationOverride && animationOverride.value) {
        this._animationName = animationOverride.value;
      }
      this._syncTransform();
      this._syncVisibility();
    }

    onDestroyed() {
      super.onDestroyed();
      this._destroyHandle();
      if (this._pixiObject && this._pixiObject.destroy) {
        this._pixiObject.destroy({ children: true, texture: false });
      }
    }

    onDeletedFromScene() {
      super.onDeletedFromScene();
      this._rendererObjectAddedToLayer = false;
    }

    update(instanceContainer) {
      if (!this._ready || !this._handle) return;
      const adapter = getAdapter();
      if (!adapter) return;
      const delta = Math.max(
        0,
        (this.getElapsedTime() / 1000) * this._timeScale
      );
      if (this._pixiObject && this._pixiObject.updateTransform) {
        this._pixiObject.updateTransform();
      }
      adapter.updateInstance(this._handle, delta);
    }

    _destroyHandle() {
      const adapter = getAdapter();
      if (this._handle && adapter) {
        adapter.destroyInstance(this._handle);
      }
      this._handle = null;
      this._ready = false;
    }

    _syncTransform() {
      if (!this._pixiObject || !this._pixiObject.position) return;
      this._pixiObject.position.set(this.getX(), this.getY());
      this._pixiObject.rotation = (this.getAngle() * Math.PI) / 180;
    }

    _syncVisibility() {
      if (!this._pixiObject) return;
      this._pixiObject.visible = !!this._visible;
      this._pixiObject.alpha = this._opacity / 255;
    }

    _attachHandle(handle) {
      this._handle = handle;
      this._ready = true;
      this._loading = false;
      this._lastError = '';
      if (this._pixiObject.addChild && handle.container) {
        this._pixiObject.addChild(handle.container);
      }
      if (handle.container && handle.container.resetPhysicsTransform) {
        if (this._pixiObject.updateTransform)
          this._pixiObject.updateTransform();
        handle.container.resetPhysicsTransform();
      }
      this.applyInspectorOverrides();
      this._syncTransform();
      this._syncVisibility();
      this.invalidateHitboxes();
    }

    reload() {
      this._destroyHandle();
      this._loading = true;
      this._lastError = '';

      const adapter = getAdapter();
      if (!adapter) {
        this._loading = false;
        this._lastError = 'GDSpine43Adapter is not loaded.';
        return;
      }
      if (!this._skeletonResource || !this._atlasResource) {
        this._loading = false;
        this._lastError = 'Skeleton or atlas resource is empty.';
        return;
      }

      adapter
        .createInstance({
          runtimeScriptPath:
            this._runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH,
          skeletonFile: this._skeletonResource,
          atlasFile: this._atlasResource,
          binaryData: this._binaryData,
          importScale: this._importScale,
          skinName: this._skinName,
          animationName: this._animationName,
          loop: this._loop,
          mixDuration: this._mixDuration,
          inspectorOverrides: this._inspectorOverrides,
        })
        .then(handle => this._attachHandle(handle))
        .catch(error => {
          this._loading = false;
          this._ready = false;
          this._lastError =
            error && error.message ? error.message : String(error);
          console.error('Unable to load Spine 4.3 object:', error);
        });
    }

    setX(x) {
      super.setX(x);
      this._syncTransform();
    }

    setY(y) {
      super.setY(y);
      this._syncTransform();
    }

    setAngle(angle) {
      super.setAngle(angle);
      this._syncTransform();
    }

    setOpacity(opacity) {
      this._opacity = Math.max(0, Math.min(255, toNumber(opacity, 255)));
      this._syncVisibility();
    }

    getOpacity() {
      return this._opacity;
    }

    getWidth() {
      const adapter = getAdapter();
      if (adapter && this._handle && adapter.getSceneAttachmentBounds) {
        const bounds = adapter.getSceneAttachmentBounds(this._handle);
        if (
          bounds &&
          Number.isFinite(bounds.right) &&
          Number.isFinite(bounds.left)
        ) {
          return Math.abs(bounds.right - bounds.left);
        }
      }
      if (
        !this._handle ||
        !this._handle.container ||
        !this._handle.container.getLocalBounds
      )
        return 0;
      const bounds = this._handle.container.getLocalBounds();
      return bounds && Number.isFinite(bounds.width)
        ? Math.abs(bounds.width)
        : 0;
    }

    getHeight() {
      const adapter = getAdapter();
      if (adapter && this._handle && adapter.getSceneAttachmentBounds) {
        const bounds = adapter.getSceneAttachmentBounds(this._handle);
        if (
          bounds &&
          Number.isFinite(bounds.bottom) &&
          Number.isFinite(bounds.top)
        ) {
          return Math.abs(bounds.bottom - bounds.top);
        }
      }
      if (
        !this._handle ||
        !this._handle.container ||
        !this._handle.container.getLocalBounds
      )
        return 0;
      const bounds = this._handle.container.getLocalBounds();
      return bounds && Number.isFinite(bounds.height)
        ? Math.abs(bounds.height)
        : 0;
    }

    getDrawableX() {
      const adapter = getAdapter();
      if (adapter && this._handle && adapter.getSceneAttachmentBounds) {
        const bounds = adapter.getSceneAttachmentBounds(this._handle);
        if (bounds && Number.isFinite(bounds.left))
          return this.getX() + bounds.left;
      }
      if (
        !this._handle ||
        !this._handle.container ||
        !this._handle.container.getLocalBounds
      ) {
        return this.getX();
      }
      const bounds = this._handle.container.getLocalBounds();
      return this.getX() + (bounds && Number.isFinite(bounds.x) ? bounds.x : 0);
    }

    getDrawableY() {
      const adapter = getAdapter();
      if (adapter && this._handle && adapter.getSceneAttachmentBounds) {
        const bounds = adapter.getSceneAttachmentBounds(this._handle);
        if (bounds && Number.isFinite(bounds.top))
          return this.getY() + bounds.top;
      }
      if (
        !this._handle ||
        !this._handle.container ||
        !this._handle.container.getLocalBounds
      ) {
        return this.getY();
      }
      const bounds = this._handle.container.getLocalBounds();
      return this.getY() + (bounds && Number.isFinite(bounds.y) ? bounds.y : 0);
    }

    setVisible(visible) {
      this._visible = !!visible;
      const adapter = getAdapter();
      if (this._handle && adapter)
        adapter.setVisible(this._handle, this._visible);
      this._syncVisibility();
    }

    isVisible() {
      return this._visible;
    }

    isReady() {
      return this._ready;
    }

    isLoading() {
      return this._loading;
    }

    hasError() {
      return !!this._lastError;
    }

    getLastError() {
      return this._lastError || '';
    }

    setTimeScale(value) {
      this._timeScale = toNumber(value, 1);
    }

    getTimeScale() {
      return this._timeScale;
    }

    setMixDuration(value) {
      this._mixDuration = Math.max(0, toNumber(value, 0));
      const adapter = getAdapter();
      if (adapter && this._handle)
        adapter.setMix(this._handle, this._mixDuration);
    }

    applyInspectorOverrides() {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setInspectorOverrides &&
        adapter.setInspectorOverrides(
          this._handle,
          this._inspectorOverrides || {}
        )
      );
    }

    playAnimation(animationName, loop) {
      this._animationName = String(animationName || '');
      this._loop = !!loop;
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setAnimation(this._handle, this._animationName, this._loop)
      );
    }

    setAnimationOnTrack(trackIndex, animationName, loop) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setAnimationOnTrack(
          this._handle,
          normalizeTrack(trackIndex),
          String(animationName || ''),
          !!loop
        )
      );
    }

    addAnimation(trackIndex, animationName, loop, delay) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.addAnimation(
          this._handle,
          normalizeTrack(trackIndex),
          String(animationName || ''),
          !!loop,
          toNumber(delay, 0)
        )
      );
    }

    clearTrack(trackIndex) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.clearTrack(this._handle, normalizeTrack(trackIndex))
      );
    }

    clearTracks() {
      const adapter = getAdapter();
      return !!(adapter && this._handle && adapter.clearTracks(this._handle));
    }

    setSkin(skinName) {
      this._skinName = String(skinName || '');
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setSkin(this._handle, this._skinName)
      );
    }

    currentAnimationIs(animationName) {
      const adapter = getAdapter();
      if (!adapter || !this._handle) return false;
      return (
        adapter.getCurrentAnimation(this._handle) ===
        String(animationName || '')
      );
    }

    getCurrentAnimation() {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getCurrentAnimation(this._handle) || ''
        : '';
    }

    boneExists(boneName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.boneExists(this._handle, boneName)
      );
    }

    slotExists(slotName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.slotExists(this._handle, slotName)
      );
    }

    setBonePosition(boneName, x, y) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setBonePosition(this._handle, boneName, x, y)
      );
    }

    offsetBonePosition(boneName, x, y) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.offsetBonePosition(this._handle, boneName, x, y)
      );
    }

    setBoneRotation(boneName, rotation) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setBoneRotation(this._handle, boneName, rotation)
      );
    }

    offsetBoneRotation(boneName, rotation) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.offsetBoneRotation(this._handle, boneName, rotation)
      );
    }

    setBoneScale(boneName, scaleX, scaleY) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setBoneScale(this._handle, boneName, scaleX, scaleY)
      );
    }

    offsetBoneScale(boneName, scaleX, scaleY) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.offsetBoneScale(this._handle, boneName, scaleX, scaleY)
      );
    }

    resetBone(boneName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.resetBone(this._handle, boneName)
      );
    }

    resetAllBones() {
      const adapter = getAdapter();
      return !!(adapter && this._handle && adapter.resetAllBones(this._handle));
    }

    getBoneX(boneName) {
      return this._getBoneValue(boneName, 'x');
    }

    getBoneY(boneName) {
      return this._getBoneValue(boneName, 'y');
    }

    getBoneRotation(boneName) {
      return this._getBoneValue(boneName, 'rotation');
    }

    getBoneScaleX(boneName) {
      return this._getBoneValue(boneName, 'scaleX');
    }

    getBoneScaleY(boneName) {
      return this._getBoneValue(boneName, 'scaleY');
    }

    _getBoneValue(boneName, field) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneValue(this._handle, boneName, field) || 0
        : 0;
    }

    getBoneSceneX(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneSceneX(this._handle, boneName) || 0
        : 0;
    }

    getBoneSceneY(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneSceneY(this._handle, boneName) || 0
        : 0;
    }

    getBoneSceneRotation(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneSceneRotation(this._handle, boneName) || 0
        : 0;
    }

    getBoneLength(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneLength(this._handle, boneName) || 0
        : 0;
    }

    getBoneChildCount(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneChildCount(this._handle, boneName) || 0
        : 0;
    }

    getBoneParentName(boneName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneParentName(this._handle, boneName) || ''
        : '';
    }

    setBoneScenePosition(boneName, sceneX, sceneY) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setBoneScenePosition(this._handle, boneName, sceneX, sceneY)
      );
    }

    setBoneSceneRotationToward(boneName, sceneX, sceneY, offsetAngle) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setBoneSceneRotationToward(
          this._handle,
          boneName,
          sceneX,
          sceneY,
          offsetAngle
        )
      );
    }

    isBoneNearPosition(boneName, sceneX, sceneY, radius) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.isBoneNearPosition(
          this._handle,
          boneName,
          sceneX,
          sceneY,
          radius
        )
      );
    }

    setAttachment(slotName, attachmentName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setAttachment(this._handle, slotName, attachmentName)
      );
    }

    clearAttachments() {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.clearAttachments(this._handle)
      );
    }

    getCurrentAttachmentName(slotName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getCurrentAttachmentName(this._handle, slotName) || ''
        : '';
    }

    setSlotColor(slotName, red, green, blue, alpha) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setSlotColor(this._handle, slotName, red, green, blue, alpha)
      );
    }

    setAnimationProgress(trackIndex, progress) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setAnimationProgress(
          this._handle,
          normalizeTrack(trackIndex),
          progress
        )
      );
    }

    getAnimationDuration(animationName) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getAnimationDuration(this._handle, animationName) || 0
        : 0;
    }

    getAnimationFrame(trackIndex) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getAnimationFrame(this._handle, normalizeTrack(trackIndex)) ||
            0
        : 0;
    }

    hasAnimation(animationName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.hasAnimation(this._handle, animationName)
      );
    }

    hasSkin(skinName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.hasSkin(this._handle, skinName)
      );
    }

    isPlayingOnTrack(trackIndex) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.isPlayingOnTrack(this._handle, normalizeTrack(trackIndex))
      );
    }

    isTrackAnimationComplete(trackIndex) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.isAnimationComplete(this._handle, normalizeTrack(trackIndex))
      );
    }

    eventFired(eventName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.hasEventFired(this._handle, eventName)
      );
    }

    animationCompleted(animationName) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.hasAnimationCompleted(this._handle, animationName)
      );
    }

    getEventString() {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getEventString(this._handle) || ''
        : '';
    }

    getEventInt() {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getEventInt(this._handle) || 0
        : 0;
    }

    getEventFloat() {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getEventFloat(this._handle) || 0
        : 0;
    }

    setIkConstraintMix(name, mix) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setIkConstraintMix(this._handle, name, mix)
      );
    }

    setTransformConstraintMix(name, mix) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setTransformConstraintMix(this._handle, name, mix)
      );
    }

    configureBoneAutoReset(boneNames, channel, enabled, delay, duration) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.configureBoneAutoReset(
          this._handle,
          boneNames,
          channel,
          !!enabled,
          delay,
          duration
        )
      );
    }

    isBoneAutoResetActive(boneName, channel) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.isBoneAutoResetActive(this._handle, boneName, channel)
      );
    }

    getBoneAutoResetProgress(boneName, channel) {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getBoneAutoResetProgress(this._handle, boneName, channel) || 0
        : 0;
    }

    setDebugVisible(visible) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setDebugVisible(this._handle, !!visible)
      );
    }

    setDebugExtrasVisible(visible) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.setDebugExtrasVisible(this._handle, !!visible)
      );
    }

    drawBoneEllipse(boneName, radiusX, radiusY, color) {
      const adapter = getAdapter();
      return !!(
        adapter &&
        this._handle &&
        adapter.drawBoneEllipse(this._handle, boneName, radiusX, radiusY, color)
      );
    }

    resolveSceneBlocking(currentX, currentY, previousX, previousY) {
      const adapter = getAdapter();
      if (!adapter || !this._handle || !adapter.resolveSceneMeshBlocking) {
        this._lastSceneBlocking = null;
        return false;
      }
      const result = adapter.resolveSceneMeshBlocking(this._handle, {
        currentX,
        currentY,
        previousX,
        previousY,
      });
      this._lastSceneBlocking = result || null;
      return !!(result && result.changed);
    }

    isSceneBlocked() {
      return !!(this._lastSceneBlocking && this._lastSceneBlocking.changed);
    }

    isWallSlideActive() {
      return !!(
        this._lastSceneBlocking && this._lastSceneBlocking.wallSlideCandidate
      );
    }

    canWallJump() {
      return !!(
        this._lastSceneBlocking && this._lastSceneBlocking.wallSlideCandidate
      );
    }

    canLedgeGrab() {
      return !!(
        this._lastSceneBlocking && this._lastSceneBlocking.ledgeGrabCandidate
      );
    }

    isOnStableSlope() {
      return !!(
        this._lastSceneBlocking && this._lastSceneBlocking.stableGrounded
      );
    }

    getSceneBlockedWallName() {
      return this._lastSceneBlocking && this._lastSceneBlocking.wallName
        ? String(this._lastSceneBlocking.wallName)
        : '';
    }

    getSceneBlockNormalX() {
      return this._lastSceneBlocking && this._lastSceneBlocking.normalX
        ? Number(this._lastSceneBlocking.normalX) || 0
        : 0;
    }

    getSceneBlockNormalY() {
      return this._lastSceneBlocking && this._lastSceneBlocking.normalY
        ? Number(this._lastSceneBlocking.normalY) || 0
        : 0;
    }

    getCurrentSlopeAngle() {
      return this._lastSceneBlocking && this._lastSceneBlocking.slopeAngle
        ? Number(this._lastSceneBlocking.slopeAngle) || 0
        : 0;
    }

    getCurrentSlopeSpeedScale() {
      return this._lastSceneBlocking && this._lastSceneBlocking.slopeSpeedScale
        ? Number(this._lastSceneBlocking.slopeSpeedScale) || 0
        : 1;
    }

    getLastWallContactNormalX() {
      return this._lastSceneBlocking &&
        this._lastSceneBlocking.lastWallContactNormalX
        ? Number(this._lastSceneBlocking.lastWallContactNormalX) || 0
        : 0;
    }

    getLastCollisionObjectName() {
      return this._lastCollisionObjectName || '';
    }

    getLastCollisionStrength() {
      return this._lastCollisionStrength || 0;
    }

    getDebugInfo() {
      const adapter = getAdapter();
      return adapter && this._handle
        ? adapter.getDebugInfo(this._handle) || ''
        : this._lastError || '';
    }
  };

  gdjs.registerObject(
    'Spine43Object::Spine43Object',
    gdjs.Spine43RuntimeObject
  );
})();
