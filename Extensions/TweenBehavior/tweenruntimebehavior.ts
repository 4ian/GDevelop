namespace gdjs {
  declare var shifty: any;
  namespace shifty {
    export type Tweenable = any;
  }

  /**
   * @memberof gdjs
   * @class TweenRuntimeBehavior
   */
  export class TweenRuntimeBehavior extends gdjs.RuntimeBehavior {
    /** @type Object.<string, TweenRuntimeBehavior.TweenInstance > */
    _tweens: { [key: string]: TweenRuntimeBehavior.TweenInstance } = {};
    _runtimeScene: gdjs.RuntimeScene;
    _isActive: boolean = true;

    /**
     * @param runtimeScene The runtime scene the behavior belongs to.
     * @param behaviorData The data to initialize the behavior
     * @param owner The runtime object the behavior belongs to.
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData: BehaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
      this._runtimeScene = runtimeScene;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    _addTween(identifier, instance, startTime, totalDuration) {
      this._tweens[identifier] = new TweenRuntimeBehavior.TweenInstance(
        instance,
        false,
        startTime,
        totalDuration
      );
    }

    _getTween(identifier) {
      return this._tweens[identifier];
    }

    _tweenExists(identifier) {
      return !!this._tweens[identifier];
    }

    _tweenIsPlaying(identifier) {
      return this._tweens[identifier].instance.isPlaying();
    }

    _pauseTween(identifier) {
      const tween = this._tweens[identifier];

      // Pause the tween, and remove it from the scene of living tweens
      // (the invariant is that scene only contains tweens being played).
      tween.instance.pause();

      // @ts-ignore - shiftyJsScene is added to runtime scene.
      const shiftyJsScene = this._runtimeScene.shiftyJsScene;
      if (shiftyJsScene) {
        shiftyJsScene.remove(tween.instance);
      }
    }

    _resumeTween(identifier) {
      const tween = this._tweens[identifier];

      // Resume the tween, and add it back to the scene of living tweens
      // (the invariant is that scene only contains tweens being played).
      tween.instance.resume();

      // @ts-ignore - shiftyJsScene is added to runtime scene.
      const shiftyJsScene = this._runtimeScene.shiftyJsScene;
      if (shiftyJsScene) {
        shiftyJsScene.add(tween.instance);
      }
    }

    _stopTween(identifier, jumpToDest) {
      return this._tweens[identifier].instance.stop(jumpToDest);
    }

    _setTweenFinished(identifier, hasFinished) {
      this._tweens[identifier].hasFinished = hasFinished;
    }

    _tweenHasFinished(identifier) {
      return this._tweens[identifier].hasFinished;
    }

    _removeObjectFromScene(identifier) {
      this._removeTween(identifier);
      return this.owner.deleteFromScene(this._runtimeScene);
    }

    _removeTween(identifier) {
      if (!this._tweens[identifier]) {
        return;
      }
      this._tweens[identifier].instance.stop();
      TweenRuntimeBehavior.removeFromScene(
        this._runtimeScene,
        this._tweens[identifier].instance
      );
      delete this._tweens[identifier];
    }

    _setupTweenEnding(identifier, destroyObjectWhenFinished) {
      const that = this;

      // Do nothing if the Promise is rejected. Rejection is used
      // by Shifty.js to signal that the tween was not finished.
      // We catch it to avoid an uncaught promise error, and to
      // ensure that the content of the "then" is always applied:
      if (destroyObjectWhenFinished) {
        this._tweens[identifier].instance
          .tween()
          .then(function () {
            that._removeObjectFromScene(identifier);
          })
          .catch(function () {});
      } else {
        this._tweens[identifier].instance
          .tween()
          .then(function () {
            if (that._tweens[identifier]) {
              that._tweens[identifier].hasFinished = true;
            }
          })
          .catch(function () {});
      }
    }

    // Do nothing if the Promise is rejected. Rejection is used
    // by Shifty.js to signal that the tween was not finished.
    // We catch it to avoid an uncaught promise error, and to
    // ensure that the content of the "then" is always applied:
    /**
     * Add an object variable tween.
     * @param identifier Unique id to idenfify the tween
     * @param variable The object variable to store the tweened value
     * @param fromValue Start value
     * @param toVaue End value
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween(
      identifier: string,
      variable: gdjs.Variable,
      fromValue: float,
      toValue,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { value: fromValue },
        to: { value: toValue },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          variable.setNumber(state.value);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object position tween.
     * @param identifier Unique id to idenfify the tween
     * @param toX The target X position
     * @param toY The target Y position
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionTween(
      identifier: string,
      toX: number,
      toY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { x: this.owner.getX(), y: this.owner.getY() },
        to: { x: toX, y: toY },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setX(state.x);
          that.owner.setY(state.y);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object X position tween.
     * @param identifier Unique id to idenfify the tween
     * @param toX The target X position
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionXTween(
      identifier: string,
      toX: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { x: this.owner.getX() },
        to: { x: toX },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setX(state.x);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object Y position tween.
     * @param identifier Unique id to idenfify the tween
     * @param toY The target Y position
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionYTween(
      identifier: string,
      toY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { y: this.owner.getY() },
        to: { y: toY },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setY(state.y);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object angle tween.
     * @param identifier Unique id to idenfify the tween
     * @param toAngle The target angle
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectAngleTween(
      identifier: string,
      toAngle: float,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { angle: this.owner.getAngle() },
        to: { angle: toAngle },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setAngle(state.angle);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object scale tween.
     * @param identifier Unique id to idenfify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore
      if (!this.owner.setScaleX || !this.owner.setScaleY) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      if (toScaleX < 0) {
        toScaleX = 0;
      }
      if (toScaleY < 0) {
        toScaleY = 0;
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: {
          // @ts-ignore - objects are duck typed
          scaleX: this.owner.getScaleX(),
          // @ts-ignore - objects are duck typed
          scaleY: this.owner.getScaleY(),
        },
        to: { scaleX: toScaleX, scaleY: toScaleY },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setScaleX(state.scaleX);
          // @ts-ignore - objects are duck typed
          that.owner.setScaleY(state.scaleY);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object X-scale tween.
     * @param identifier Unique id to idenfify the tween
     * @param toScaleX The target X-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore - objects are duck typed
      if (!this.owner.setScaleX) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        // @ts-ignore - objects are duck typed
        from: { scaleX: this.owner.getScaleX() },
        to: { scaleX: toScaleX },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setScaleX(state.scaleX);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object scale y tween.
     * @param identifier Unique id to idenfify the tween
     * @param toScaleY The target Y-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore - objects are duck typed
      if (!this.owner.setScaleY) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        // @ts-ignore - objects are duck typed
        from: { scaleY: this.owner.getScaleY() },
        to: { scaleY: toScaleY },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setScaleY(state.scaleY);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object opacity tween.
     * @param identifier Unique id to idenfify the tween
     * @param toOpacity The target opacity
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectOpacityTween(
      identifier: string,
      toOpacity: float,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore - objects are duck typed
      if (!this.owner.getOpacity || !this.owner.setOpacity) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        // @ts-ignore - objects are duck typed
        from: { opacity: this.owner.getOpacity() },
        to: { opacity: toOpacity },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setOpacity(state.opacity);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object color tween.
     * @param identifier Unique id to idenfify the tween
     * @param toColorStr The target color
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore - objects are duck typed
      if (!this.owner.getColor || !this.owner.setColor) {
        return;
      }
      if (
        !toColorStr.match(
          '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
        )
      ) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      // @ts-ignore - objects are duck typed
      const fromColor = this.owner.getColor().split(';');
      let toColor = toColorStr.split(';');
      if (toColor.length !== 3) {
        return;
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { red: fromColor[0], green: fromColor[1], blue: fromColor[2] },
        to: { red: toColor[0], green: toColor[1], blue: toColor[2] },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setColor(
            Math.floor(state.red) +
              ';' +
              Math.floor(state.green) +
              ';' +
              Math.floor(state.blue)
          );
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add a text object character size tween.
     * @param identifier Unique id to idenfify the tween
     * @param toSize The target character size
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addTextObjectCharacterSizeTween(
      identifier: string,
      toSize: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      // @ts-ignore - objects are duck typed
      if (!this.owner.setCharacterSize) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        // @ts-ignore - objects are duck typed
        from: { size: this.owner.getCharacterSize() },
        to: { size: toSize },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          // @ts-ignore - objects are duck typed
          that.owner.setCharacterSize(state.size);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object width tween.
     * @param identifier Unique id to idenfify the tween
     * @param toWidth The target width
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectWidthTween(
      identifier: string,
      toWidth: float,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { width: this.owner.getWidth() },
        to: { width: toWidth },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setWidth(state.width);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Add an object height tween.
     * @param identifier Unique id to idenfify the tween
     * @param toHeight The target height
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectHeightTween(
      identifier: string,
      toHeight: float,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      const that = this;
      if (!this._isActive) {
        return;
      }
      if (!!TweenRuntimeBehavior.easings[easingValue]) {
        return;
      }
      if (this._tweenExists(identifier)) {
        this.removeTween(identifier);
      }
      const newTweenable = TweenRuntimeBehavior.makeNewTweenable(
        this._runtimeScene
      );
      newTweenable.setConfig({
        from: { height: this.owner.getHeight() },
        to: { height: toHeight },
        duration: durationValue,
        easing: easingValue,
        step: function step(state) {
          that.owner.setHeight(state.height);
        },
      });
      this._addTween(
        identifier,
        newTweenable,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue
      );
      this._setupTweenEnding(identifier, destroyObjectWhenFinished);
    }

    /**
     * Tween is playing.
     * @param identifier Unique id to idenfify the tween
     */
    isPlaying(identifier: string): boolean {
      if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Tween exists.
     * @param identifier Unique id to idenfify the tween
     * @returns The tween exists
     */
    exists(identifier: string): boolean {
      return this._tweenExists(identifier);
    }

    /**
     * Tween has finished.
     * @param identifier Unique id to idenfify the tween
     */
    hasFinished(identifier: string): boolean {
      if (this._tweenExists(identifier)) {
        return this._tweenHasFinished(identifier);
      } else {
        return false;
      }
    }

    /**
     * Pause a tween.
     * @param identifier Unique id to idenfify the tween
     */
    pauseTween(identifier: string) {
      if (!this._isActive) {
        return;
      }
      if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
        this._pauseTween(identifier);
      }
    }

    /**
     * Stop a tween.
     * @param identifier Unique id to idenfify the tween
     * @param jumpToDest Move to destination
     */
    stopTween(identifier: string, jumpToDest: boolean) {
      if (!this._isActive) {
        return;
      }
      if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
        this._stopTween(identifier, jumpToDest);
      }
    }

    /**
     * Resume a tween.
     * @param identifier Unique id to idenfify the tween
     */
    resumeTween(identifier: string) {
      if (!this._isActive) {
        return;
      }
      if (this._tweenExists(identifier) && !this._tweenIsPlaying(identifier)) {
        this._resumeTween(identifier);
      }
    }

    /**
     * Remove a tween.
     * @param identifierFirst Unique id to idenfify the tween
     */
    removeTween(identifier) {
      this._removeTween(identifier);
    }

    /**
     * Get tween progress.
     * @param identifier Unique id to idenfify the tween
     * @returns Progress of playing tween animation (between 0.0 and 1.0)
     */
    getProgress(identifier: string): float {
      const tween = this._getTween(identifier);
      if (tween) {
        const currentTime = this._runtimeScene
          .getTimeManager()
          .getTimeFromStart();
        if (currentTime >= tween.startTime + tween.totalDuration) {
          return 1;
        }
        return (currentTime - tween.startTime) / tween.totalDuration;
      } else {
        return 0;
      }
    }

    onDeActivate() {
      if (!this._isActive) {
        return;
      }
      for (const key in this._tweens) {
        if (this._tweens.hasOwnProperty(key)) {
          const tween = this._tweens[key];
          if (tween.instance.isPlaying()) {
            tween.resumeOnActivate = true;
            this._pauseTween(key);
          }
        }
      }
      this._isActive = false;
    }

    onActivate() {
      if (this._isActive) {
        return;
      }
      for (const key in this._tweens) {
        if (this._tweens.hasOwnProperty(key)) {
          const tween = this._tweens[key];
          if (tween.resumeOnActivate) {
            tween.resumeOnActivate = false;
            this._resumeTween(key);
          }
        }
      }
      this._isActive = true;
    }

    /**
     * Static function to create a Tweenable associated to a scene.
     * Don't create manually shifty.Tweenable, otherwise they won't be
     * associated to a scene (and will play even when scene is paused).
     *
     * @returns The new tweenable
     */
    static makeNewTweenable(runtimeScene: gdjs.RuntimeScene): shifty.Tweenable {
      // @ts-ignore - shiftyJsScene is added to runtime scene.
      if (!runtimeScene.shiftyJsScene) {
        // @ts-ignore - shiftyJsScene is added to runtime scene.
        runtimeScene.shiftyJsScene = new shifty.Scene();
      }
      const tweenable = new shifty.Tweenable();
      // @ts-ignore - shiftyJsScene is added to runtime scene.
      runtimeScene.shiftyJsScene.add(tweenable);
      return tweenable;
    }

    /**
     * Static function to remove a Tweenable from a scene.
     *
     */
    static removeFromScene(
      runtimeScene: gdjs.RuntimeScene,
      tweenable: shifty.Tweenable
    ) {
      // @ts-ignore - shiftyJsScene is added to runtime scene.
      if (!runtimeScene.shiftyJsScene) {
        return;
      }
      // @ts-ignore - shiftyJsScene is added to runtime scene.
      runtimeScene.shiftyJsScene.remove(tweenable);
    }

    static easings = [
      'linear',
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic',
      'easeInQuart',
      'easeOutQuart',
      'easeInOutQuart',
      'easeInQuint',
      'easeOutQuint',
      'easeInOutQuint',
      'easeInSine',
      'easeOutSine',
      'easeInOutSine',
      'easeInExpo',
      'easeOutExpo',
      'easeInOutExpo',
      'easeInCirc',
      'easeOutCirc',
      'easeInOutCirc',
      'easeOutBounce',
      'easeInBack',
      'easeOutBack',
      'easeInOutBack',
      'elastic',
      'swingFromTo',
      'swingFrom',
      'swingTo',
      'bounce',
      'bouncePast',
      'easeFromTo',
      'easeFrom',
      'easeTo',
    ];

    static _tweensProcessed = false;
    static _currentTweenTime = 0;
  }
  gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);

  export namespace TweenRuntimeBehavior {
    /**
     * A tween being played in a behavior.
     */
    export class TweenInstance {
      instance: shifty.Tweenable;
      hasFinished: boolean;
      startTime: float;
      totalDuration: float;
      resumeOnActivate: boolean = false;

      /**
       * @param instance The Shifty tween that is played
       * @param hasFinished If the tween is finished already
       * @param startTime The time at which the tween starts
       * @param totalDuration The time of the whole tween
       */
      constructor(
        instance: shifty.Tweenable,
        hasFinished: boolean,
        startTime: float,
        totalDuration: float
      ) {
        this.instance = instance;
        this.hasFinished = hasFinished;
        this.startTime = startTime;
        this.totalDuration = totalDuration;
      }
    }
  }

  // Callbacks called to pause/resume Shifty scene when a gdjs.RuntimeScene
  // is paused/resumed

  /**
   * Stop and "destroy" all the tweens when a scene is unloaded.
   */
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    // @ts-ignore - shiftyJsScene is added to runtime scene.
    const shiftyJsScene = runtimeScene.shiftyJsScene;
    if (!shiftyJsScene) {
      return;
    }

    // Stop and explictly remove all tweenables to be sure to drop
    // all references to the tweenables of the scene.
    shiftyJsScene.stop(false);
    shiftyJsScene.tweenables.forEach(shiftyJsScene.remove.bind(shiftyJsScene));
  });

  /**
   * When a scene is paused, pause all the tweens of this scene.
   */
  gdjs.registerRuntimeScenePausedCallback(function (runtimeScene) {
    // @ts-ignore - shiftyJsScene is added to runtime scene.
    const shiftyJsScene = runtimeScene.shiftyJsScene;
    if (!shiftyJsScene) {
      return;
    }
    shiftyJsScene.pause();
  });

  /**
   * When a scene is paused, resume all the tweens of this scene.
   */
  gdjs.registerRuntimeSceneResumedCallback(function (runtimeScene) {
    // @ts-ignore - shiftyJsScene is added to runtime scene.
    const shiftyJsScene = runtimeScene.shiftyJsScene;
    if (!shiftyJsScene) {
      return;
    }

    // It is important to set immediately the current Shifty time back to the
    // time of the scene, as the call `resume` will process the tweens.
    // (If not done, tweens will be resumed with the time of the previous
    // scene, that could create weird result/make tweens act as if not paused).
    TweenRuntimeBehavior._currentTweenTime = runtimeScene
      .getTimeManager()
      .getTimeFromStart();

    // Note that per the invariant of shiftyJsScene, shiftyJsScene will only
    // contains tweenables that should be playing (so calling resume is safe).
    shiftyJsScene.resume();
  });

  // Handle Shifty.js updates (the time and the "tick" of tweens
  // is controlled by the behavior)
  gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
    TweenRuntimeBehavior._currentTweenTime = runtimeScene
      .getTimeManager()
      .getTimeFromStart();
    shifty.processTweens();
  });

  // Set up Shifty.js so that the processing ("tick"/updates) is handled
  // by the behavior, once per frame. See above.
  shifty.Tweenable.setScheduleFunction(function () {
    /* Do nothing, we'll call processTweens manually. */
  });

  // Set up Shifty.js so that the time is handled by the behavior.
  // It will be set to be the time of the current scene, and should be updated
  // before any tween processing (processTweens, resume).
  shifty.Tweenable.now = function () {
    return TweenRuntimeBehavior._currentTweenTime;
  };
}
