/**
 * @memberof gdjs
 * @class tween
 * @static
 * @private
 */

gdjs.TweenRuntimeBehavior = function(runtimeScene, behaviorData, owner) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

  /** @type Object.<string, gdjs.TweenRuntimeBehavior.TweenInstance > */
  this._tweens = {};
};

gdjs.TweenRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);

gdjs.TweenRuntimeBehavior.thisIsARuntimeBehaviorConstructor =
  "Tween::TweenBehavior";

gdjs.TweenRuntimeBehavior.TweenInstance = function(
  instance,
  hasFinished,
  progress,
  currentValue
) {
  this.instance = instance;
  this.hasFinished = hasFinished;
  this.progress = progress;
  this.currentValue = currentValue;
};

gdjs.TweenRuntimeBehavior.VariableTweenInstance = function(
  instance,
  hasFinished,
  progress,
  variable,
  currentValue
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.variable = variable;
  this.currentValue = currentValue;
};

gdjs.TweenRuntimeBehavior.ObjectPositionTweenInstance = function(
  instance,
  hasFinished,
  progress,
  x,
  y
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.x = x;
  this.y = y;
};

gdjs.TweenRuntimeBehavior.ObjectPositionXTweenInstance = function(
  instance,
  hasFinished,
  progress,
  x
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.x = x;
};

gdjs.TweenRuntimeBehavior.ObjectPositionYTweenInstance = function(
  instance,
  hasFinished,
  progress,
  y
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.y = y;
};

gdjs.TweenRuntimeBehavior.ObjectSizeTweenInstance = function(
  instance,
  hasFinished,
  progress,
  width,
  height
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.width = width;
  this.height = height;
};

gdjs.TweenRuntimeBehavior.ObjectWidthTweenInstance = function(
  instance,
  hasFinished,
  progress,
  width
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.width = width;
};

gdjs.TweenRuntimeBehavior.ObjectHeightTweenInstance = function(
  instance,
  hasFinished,
  progress,
  height
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.height = height;
};

gdjs.TweenRuntimeBehavior.ObjectAngleTweenInstance = function(
  instance,
  hasFinished,
  progress,
  angle
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.angle = angle;
};

gdjs.TweenRuntimeBehavior.ObjectOpacityTweenInstance = function(
  instance,
  hasFinished,
  progress,
  opacity
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.opacity = opacity;
};

gdjs.TweenRuntimeBehavior.ObjectColorTweenInstance = function(
  instance,
  hasFinished,
  progress,
  color
) {
  gdjs.TweenRuntimeBehavior.TweenInstance.call(
    this,
    instance,
    hasFinished,
    progress
  );

  this.color = color;
};

gdjs.TweenRuntimeBehavior.prototype._addVariableTween = function(
  identifier,
  instance,
  variable,
  currentValue
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.VariableTweenInstance(
    instance,
    false,
    0,
    variable,
    currentValue
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectPositionTween = function(
  identifier,
  instance,
  x,
  y
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectPositionTweenInstance(
    instance,
    false,
    0,
    x,
    y
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectPositionXTween = function(
  identifier,
  instance,
  x
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectPositionXTweenInstance(
    instance,
    false,
    0,
    x
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectPositionYTween = function(
  identifier,
  instance,
  y
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectPositionYTweenInstance(
    instance,
    false,
    0,
    y
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectSizeTween = function(
  identifier,
  instance,
  width,
  height
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectSizeTweenInstance(
    instance,
    false,
    0,
    width,
    height
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectWidthTween = function(
  identifier,
  instance,
  width
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectWidthTweenInstance(
    instance,
    false,
    0,
    width
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectHeightTween = function(
  identifier,
  instance,
  height
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectHeightTweenInstance(
    instance,
    false,
    0,
    height
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectAngleTween = function(
  identifier,
  instance,
  angle
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectAngleTweenInstance(
    instance,
    false,
    0,
    angle
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectOpacityTween = function(
  identifier,
  instance,
  opacity
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectOpacityTweenInstance(
    instance,
    false,
    0,
    opacity
  );
};

gdjs.TweenRuntimeBehavior.prototype._addObjectColorTween = function(
  identifier,
  instance,
  clolor
) {
  this._tweens[
    identifier
  ] = new gdjs.TweenRuntimeBehavior.ObjectColorTweenInstance(
    instance,
    false,
    0,
    clolor
  );
};

gdjs.TweenRuntimeBehavior.prototype._getTween = function(identifier) {
  return this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._tweenExists = function(identifier) {
  return !!this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._tweenIsPlaying = function(identifier) {
  return this._tweens[identifier].instance.isPlaying();
};

gdjs.TweenRuntimeBehavior.prototype._pauseTween = function(identifier) {
  return this._tweens[identifier].instance.pause();
};

gdjs.TweenRuntimeBehavior.prototype._resumeTween = function(identifier) {
  return this._tweens[identifier].instance.resume();
};

gdjs.TweenRuntimeBehavior.prototype._stopTween = function(
  identifier,
  JumpToDest
) {
  return this._tweens[identifier].instance.stop(JumpToDest);
};

gdjs.TweenRuntimeBehavior.prototype._setTweenFinished = function(
  identifier,
  hasFinished
) {
  this._tweens[identifier].hasFinished = hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._tweenHasFinished = function(identifier) {
  return this._tweens[identifier].hasFinished;
};

gdjs.TweenRuntimeBehavior.prototype._removeObjectFromScene = function(
  identifier
) {
  if (this._tweenExists(identifier)) {
    this._removeTween(identifier);
  }
  return this.owner.deleteFromScene(this.runtimeScene);
};

gdjs.TweenRuntimeBehavior.prototype._removeTween = function(identifier) {
  this._tweens[identifier].instance.dispose();
  delete this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._setupTweenEnding = function(
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
gdjs.TweenRuntimeBehavior.prototype.addVariableTween = function(
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
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).currentValue = state.value;

      variable.setNumber(state.value);
      console.log(state);
    }
  });

  this._addVariableTween(identifier, newTweenable, variable, fromValue);

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
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionTween = function(
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
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).x = state.x;
      this._getTween(identifier).y = state.y;
      this.owner.setX(state.x);
      this.owner.setY(state.y);
      console.log(state);
    }
  });

  this._addObjectPositionTween(
    identifier,
    newTweenable,
    this.owner.getX(),
    this.owner.getY()
  );

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
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionXTween = function(
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
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).x = state.x;
      this.owner.setX(state.x);
      console.log(state);
    }
  });

  this._addObjectPositionXTween(identifier, newTweenable, this.owner.getX());

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
gdjs.TweenRuntimeBehavior.prototype.addObjectPositionYTween = function(
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
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).y = state.y;
      this.owner.setY(state.y);
      console.log(state);
    }
  });

  this._addObjectPositionYTween(identifier, newTweenable, this.owner.getY());

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
gdjs.TweenRuntimeBehavior.prototype.addObjectAngleTween = function(
  identifier,
  toAngle,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  if (toAngle < 0) toAngle = 0;
  if (toAngle > 360) toAngle = 360;

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { angle: this.owner.getAngle(), progress: 0.0 },
    to: { angle: toAngle, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).angle = state.angle;
      this.owner.setAngle(state.angle);
      console.log(state);
    }
  });

  this._addObjectAngleTween(identifier, newTweenable, this.owner.getAngle());

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object size tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toWidth The target width
 * @param {number} toHeight The target height
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectSizeTween = function(
  identifier,
  toWidth,
  toHeight,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setWidth || !this.owner.setHeight) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  if (toWidth < 0) toWidth = 0;
  if (toHeight < 0) toHeight = 0;

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: {
      width: this.owner.getWidth(),
      height: this.owner.getHeight(),
      progress: 0.0
    },
    to: { width: toWidth, height: toHeight, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).width = state.width;
      this._getTween(identifier).height = state.height;
      this.owner.setWidth(state.width);
      this.owner.setHeight(state.height);
      console.log(state);
    }
  });

  this._addObjectSizeTween(
    identifier,
    newTweenable,
    this.owner.getWidth(),
    this.owner.getHeight()
  );

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object width tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toWidth The target width
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectWidthTween = function(
  identifier,
  toWidth,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setWidth) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { width: this.owner.getWidth(), progress: 0.0 },
    to: { width: toWidth, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).width = state.width;
      this.owner.setWidth(state.width);
      console.log(state);
    }
  });

  this._addObjectWidthTween(identifier, newTweenable, this.owner.getWidth());

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object height tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toHeight The target height
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectHeightTween = function(
  identifier,
  toHeight,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  if (!this.owner.setHeight) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { height: this.owner.getHeight(), progress: 0.0 },
    to: { height: toHeight, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).height = state.height;
      this.owner.setHeight(state.height);
      console.log(state);
    }
  });

  this._addObjectHeightTween(identifier, newTweenable, this.owner.getHeight());

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Add an object opacity tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toOpacity The target height
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectOpacityTween = function(
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
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).opacity = state.opacity;
      this.owner.setOpacity(state.opacity);
      console.log(state);
    }
  });

  this._addObjectOpacityTween(
    identifier,
    newTweenable,
    this.owner.getOpacity()
  );

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
gdjs.TweenRuntimeBehavior.prototype.addObjectColorTween = function(
  identifier,
  toColor,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  // TODO: Add a getColor function to the sprite object

  if (!this.owner.getColor || !this.owner.setColor) return;
  if (!toColor.match("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\,){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$")) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { color: this.owner.getColor(), progress: 0.0 },
    to: { color: toColor, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {
      this._getTween(identifier).progress = state.progress;
      this._getTween(identifier).color = state.color;
      this.owner.setColor(state.color);
      console.log(state);
    }
  });

  this._addObjectColorTween(identifier, newTweenable, this.owner.getColor());

  this._setupTweenEnding(identifier, destroyObjectWhenFinished);
};

/**
 * Tween is playing.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.isPlaying = function(identifier) {
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
gdjs.TweenRuntimeBehavior.prototype.hasFinished = function(identifier) {
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
gdjs.TweenRuntimeBehavior.prototype.pauseTween = function(identifier) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._pauseTween(identifier);
  }
};

/**
 * Stop a tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {boolean} JumpToDest Move to destination
 */
gdjs.TweenRuntimeBehavior.prototype.stopTween = function(
  identifier,
  JumpToDest
) {
  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._stopTween(identifier, JumpToDest);
  }
};

/**
 * Resume a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.resumeTween = function(identifier) {
  if (this._tweenExists(identifier) && !this._tweenIsPlaying(identifier)) {
    this._resumeTween(identifier);
  }
};

/**
 * Remove a tween.
 * @param {string} identifierFirst Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.removeTween = function(identifier) {
  if (this._tweenExists(identifier)) {
    this._removeTween(identifier);
  }
};

/**
 * Get tween progress.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} Progress of playing tween animation (between 0.0 and 1.0)
 */
gdjs.TweenRuntimeBehavior.prototype.getProgress = function(identifier) {
  if (this._tweenExists(identifier)) {
    return this._getTween(identifier).progress;
  } else {
    return 0.0;
  }
};

gdjs.TweenRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {};

gdjs.TweenRuntimeBehavior.prototype.onDeActivate = function() {};
