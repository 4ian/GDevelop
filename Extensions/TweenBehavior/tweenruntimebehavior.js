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
  this._runtimeScene = runtimeScene;
};

gdjs.TweenRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);

gdjs.TweenRuntimeBehavior.thisIsARuntimeBehaviorConstructor =
  "Tween::TweenBehavior";

gdjs.TweenRuntimeBehavior.TweenInstance = function (
  instance,
  hasFinished,
  progress
) {
  this.instance = instance;
  this.hasFinished = hasFinished;
  this.progress = progress;
};

gdjs.TweenRuntimeBehavior.prototype._addTween = function (identifier, instance) {
  this._tweens[identifier] = new gdjs.TweenRuntimeBehavior.TweenInstance(
    instance,
    false,
    0
  );
};

gdjs.TweenRuntimeBehavior.prototype._getTween = function (identifier) {
  return this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._tweenExists = function (identifier) {
  return !!this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._tweenIsPlaying = function (identifier) {
  return this._tweens[identifier].instance.isPlaying();
};

gdjs.TweenRuntimeBehavior.prototype._pauseTween = function (identifier) {
  return this._tweens[identifier].instance.pause();
};

gdjs.TweenRuntimeBehavior.prototype._resumeTween = function (identifier) {
  return this._tweens[identifier].instance.resume();
};

gdjs.TweenRuntimeBehavior.prototype._stopTween = function (
  identifier,
  jumpToDest
) {
  return this._tweens[identifier].instance.stop(jumpToDest);
};

gdjs.TweenRuntimeBehavior.prototype._setTweenFinished = function (
  identifier,
  hasFinished
) {
  this._tweens[identifier].hasFinished = hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._tweenHasFinished = function (identifier) {
  return this._tweens[identifier].hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._removeObjectFromScene = function (
  identifier
) {
  if (this._tweenExists(identifier)) {
    this._removeTween(identifier);
  }
  return this.owner.deleteFromScene(this._runtimeScene);
};

gdjs.TweenRuntimeBehavior.prototype._removeTween = function (identifier) {
  this._tweens[identifier].instance.stop();
  delete this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._setupTweenEnding = function (
  identifier,
  destroyObjectWhenFinished
) {
  if (destroyObjectWhenFinished) {
    this._tweens[identifier].instance.tween().then(() => {
      this._removeObjectFromScene(identifier);
    });
  } else {
    this._tweens[identifier].instance.tween().then(() => {
      this._setTweenFinished(identifier, true);
    });
  }
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
gdjs.TweenRuntimeBehavior.prototype.addVariableTween = function (
  identifier,
  variable,
  fromValue,
  toValue,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();

  newTweenable.setConfig({
    from: { value: fromValue, progress: 0.0 },
    to: { value: toValue, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      variable.setNumber(state.value);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object position tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toX The target X position
 * @param {number} toY The target Y position
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
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { x: this.owner.getX(), y: this.owner.getY(), progress: 0.0 },
    to: { x: toX, y: toY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setX(state.x);
      this.owner.setY(state.y);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object X position tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toX The target X position
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionXTween = function (
  identifier,
  toX,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { x: this.owner.getX(), progress: 0.0 },
    to: { x: toX, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setX(state.x);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object Y position tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toY The target Y position
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionYTween = function (
  identifier,
  toY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { y: this.owner.getY(), progress: 0.0 },
    to: { y: toY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setY(state.y);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object angle tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toAngle The target angle
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectAngleTween = function (
  identifier,
  toAngle,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { angle: this.owner.getAngle(), progress: 0.0 },
    to: { angle: toAngle, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setAngle(state.angle);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object scale tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toScaleX The target X-scale
 * @param {number} toScaleY The target Y-scale
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleTween = function (
  identifier,
  toScaleX,
  toScaleY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setScaleX || !this.owner.setScaleY) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  if (toScaleX < 0) toScaleX = 0;
  if (toScaleY < 0) toScaleY = 0;

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: {
      scaleX: this.owner.getScaleX(),
      scaleY: this.owner.getScaleY(),
      progress: 0.0
    },
    to: { scaleX: toScaleX, scaleY: toScaleY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setScaleX(state.scaleX);
      this.owner.setScaleY(state.scaleY);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object X-scale tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toScaleX The target X-scale
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleXTween = function (
  identifier,
  toScaleX,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setScaleX) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { scaleX: this.owner.getScaleX(), progress: 0.0 },
    to: { scaleX: toScaleX, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setScaleX(state.scaleX);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object scale y tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toScaleY The target Y-scale
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleYTween = function (
  identifier,
  toScaleY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setScaleY) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { scaleY: this.owner.getScaleY(), progress: 0.0 },
    to: { scaleY: toScaleY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setScaleY(state.scaleY);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object opacity tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toOpacity The target opacity
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectOpacityTween = function (
  identifier,
  toOpacity,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.getOpacity || !this.owner.setOpacity) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { opacity: this.owner.getOpacity(), progress: 0.0 },
    to: { opacity: toOpacity, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setOpacity(state.opacity);
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object color tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {string} toColor The target height
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectColorTween = function (
  identifier,
  toColor,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {

  if (!this.owner.getColor || !this.owner.setColor) return;
  if (
    !toColor.match(
      "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\;){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    )
  )
    return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var fromColor = this.owner.getColor().split(";");
  var toColor = toColor.split(";");
  if (toColor.length !== 3) return;

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: {
      red: fromColor[0],
      green: fromColor[1],
      blue: fromColor[2],
      progress: 0.0
    },
    to: {
      red: toColor[0],
      green: toColor[1],
      blue: toColor[2],
      progress: 1.0
    },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      var tween = this._getTween(identifier);
      tween.progress = state.progress;
      this.owner.setColor(Math.floor(state.red) + ";" + Math.floor(state.green) + ";" + Math.floor(state.blue));
      console.log(state);
    }
  });

  this._addTween(identifier, newTweenable);

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
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
 * Tween exists.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} The tween exists
 */
gdjs.TweenRuntimeBehavior.prototype.exists = function (identifier) {
  return this._tweenExists(identifier);
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
 * @param {boolean} jumpToDest Move to destination
 */
gdjs.TweenRuntimeBehavior.prototype.stopTween = function (
  identifier,
  jumpToDest
) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._stopTween(identifier, jumpToDest);
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

gdjs.TweenRuntimeBehavior.prototype.doStepPreEvents = function (runtimeScene) { };

gdjs.TweenRuntimeBehavior.prototype.onDeActivate = function () { };
