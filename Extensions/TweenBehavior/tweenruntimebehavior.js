/**
 * @memberof gdjs
 * @class tween
 * @static
 * @private
 */

gdjs.TweenRuntimeBehavior = function (runtimeScene, behaviorData, owner) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

  /** @type Object.<string, gdjs.TweenRuntimeBehavior.TweenInstance > */
  this._tweens = {};
};

gdjs.TweenRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);

gdjs.TweenRuntimeBehavior.thisIsARuntimeBehaviorConstructor =
  "Tween::TweenBehavior";

gdjs.TweenRuntimeBehavior.TweenInstance = function (instance, hasFinished, progress, currentValue) {
  this.instance = instance;
  this.hasFinished = hasFinished;
  this.progress = progress;
  this.currentValue = currentValue;
  this.removeObjectFromScene = false;
};

gdjs.TweenRuntimeBehavior.ObjectVariableTweenInstance = function (instance, hasFinished, progress, variable, currentValue) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(this, instance, hasFinished, progress);

  this.variable = variable;
  this.currentValue = currentValue;
}

gdjs.TweenRuntimeBehavior.ObjectPositionTweenInstance = function (instance, hasFinished, progress, x, y) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(this, instance, hasFinished, progress);

  this.x = x;
  this.y = y;
}

gdjs.TweenRuntimeBehavior.prototype._addObjectVariableTween = (identifier, instance, variable, currentValue) => {
  this._tweens[identifier] = new gdjs.TweenRuntimeBehavior.ObjectVariableTweenInstance(instance, false, 0, variable, currentValue);
};

gdjs.TweenRuntimeBehavior.prototype._addObjectPositionTween = (identifier, instance, x, y) => {
  this._tweens[identifier] = new gdjs.TweenRuntimeBehavior.ObjectPositionTweenInstance(instance, false, 0, x, y);
};

gdjs.TweenRuntimeBehavior.prototype._getTween = (identifier) => {
  return this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._tweenExists = (identifier) => {
  if (identifier in this._tweens) {
    return true
  }
  return false;
};

gdjs.TweenRuntimeBehavior.prototype._tweenIsPlaying = (identifier) => {
  return this._tweens[identifier].instance.isPlaying();
};

gdjs.TweenRuntimeBehavior.prototype._pauseTween = (identifier) => {
  return this._tweens[identifier].instance.pause();
};

gdjs.TweenRuntimeBehavior.prototype._resumeTween = (identifier) => {
  return this._tweens[identifier].instance.resume();
};

gdjs.TweenRuntimeBehavior.prototype._stopTween = (identifier, JumpToDest) => {
  return this._tweens[identifier].instance.stop(JumpToDest);
};

gdjs.TweenRuntimeBehavior.prototype._setTweenFinished = (identifier, hasFinished) => {
  this._tweens[identifier].hasFinished = hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._tweenHasFinished = (identifier) => {
  return this._tweens[identifier].hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._setRemoveObjectFromScene = (identifier, removeObjectFromScene) => {
  return this._tweens[identifier].removeObjectFromScene = removeObjectFromScene;
};

gdjs.TweenRuntimeBehavior.prototype._removeTween = (identifier) => {
  this._tweens[identifier].instance.dispose();
  delete this._tweens[identifier];
};

/**
 * Add an object variable tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {objectvar} variable The object variable to store the tweened value
 * @param {number} fromValue Start value
 * @param {number} toVaue End value
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectVariableTween = function (
  identifier,
  variable,
  fromValue,
  toValue,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {

  if (this._tweenExists(identifier)) {
    return;
  }

  let newTweenable = new shifty.Tweenable();

  newTweenable.setConfig({
    from: { value: fromValue, progress: 0.0 },
    to: { value: toValue, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      //variable.setNumber(state.value);
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).currentValue = state.value;
      console.log(state);
    }
  });

  this._addObjectVariableTween(identifier, newTweenable, variable, fromValue);

  if (destroyObjectWhenFinished) {
    this._tweens[identifier].instance.tween().then(() => {

      this._removeTween(identifier);
      this._setRemoveObjectFromScene(identifier, true);

    });
  } else {
    this._tweens[identifier].instance.tween().then(() => {
      this._setTweenFinished(identifier, true);
    });
  }
};

/**
 * Add an object position tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toX The object variable to store the tweened value
 * @param {number} toY Start value
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionTween = function (
  identifier,
  toX,
  toY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {

  if (this._tweenExists(identifier)) {
    this.removeTween(tweenBehavior, identifier);
  }

  let newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { x: this.owner.getX(), y: this.owner.getY(), progress: 0.0 },
    to: { x: toX, y: toY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {

      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).x = state.x;
      this._getTween(identifier).y = state.y;
      this.owner.setX(state.x);
      this.owner.setY(state.y);
      console.log(state);
    }
  });

  this._addObjectPositionTween(identifier, newTweenable, this.owner.getX(), this.owner.getY());

  if (destroyObjectWhenFinished) {
    this._tweens[identifier].instance.tween().then(() => {
      this._removeTween(identifier);
      this._setRemoveObjectFromScene(identifier, true);
    });
  } else {
    this._tweens[identifier].instance.tween().then(() => {
      this._setTweenFinished(identifier, true);
    });
  }
};

/**
 * Tween is playing.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.isPlaying = function (identifier) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Tween has finished.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.hasFinished = function (identifier) {
  if (this._tweenExists(identifier)) {
    return this._tweenHasFinished(identifier);
  } else {
    return false;
  }
};

/**
 * Pause a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.pauseTween = function (identifier) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._pauseTween(identifier);
  }
};

/**
 * Stop a tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {boolean} JumpToDest Move to destination
 */
gdjs.TweenRuntimeBehavior.prototype.stopTween = function (identifier, JumpToDest) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._stopTween(identifier, JumpToDest);
  }
};

/**
 * Resume a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.resumeTween = function (identifier) {
  if (this._tweenExists(identifier) && !this._tweenIsPlaying(identifier)) {
    this._resumeTween(identifier);
  }
};

/**
 * Remove a tween.
 * @param {string} identifierFirst Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.removeTween = function (identifier) {
  if (this._tweenExists(identifier)) {
    this._removeTween(identifier);
  }
};

/**
 * Get tween progress.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} Progress of playing tween animation (between 0.0 and 1.0)
 */
gdjs.TweenRuntimeBehavior.prototype.getProgress = function (identifier) {
  if (this._tweenExists(identifier)) {
    return this._getTween(identifier).progress;
  } else {
    return 0.0;
  }
};

gdjs.TweenRuntimeBehavior.prototype.doStepPreEvents = function (runtimeScene) {

};

gdjs.TweenRuntimeBehavior.prototype.onDeActivate = function () {

};
