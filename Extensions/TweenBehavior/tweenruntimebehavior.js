/**
 * @memberof gdjs
 * @class TweenRuntimeBehavior
 * @param {gdjs.RuntimeScene} runtimeScene The runtime scene the behavior belongs to.
 * @param {Object} behaviorData The data to initialize the behavior
 * @param {gdjs.RuntimeObject} owner The runtime object the behavior belongs to.
 */
gdjs.TweenRuntimeBehavior = function(runtimeScene, behaviorData, owner) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

  /** @type Object.<string, gdjs.TweenRuntimeBehavior.TweenInstance > */
  this._tweens = {};
  this._runtimeScene = runtimeScene;
  this._isActive = true;
};

gdjs.TweenRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);

gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);

gdjs.TweenRuntimeBehavior.easings = [
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

gdjs.TweenRuntimeBehavior.prototype.updateFromBehaviorData = function(oldBehaviorData, newBehaviorData) {
  // Nothing to update.
  return true;
}

/**
 * A tween being played in a behavior.
 * @param {shifty.Tweenable} instance The Shifty tween that is played
 * @param {boolean} hasFinished
 * @param {number} startTime The time at which the tween starts
 * @param {number} totalDuration The time of the whole tween
 */
gdjs.TweenRuntimeBehavior.TweenInstance = function(
  instance,
  hasFinished,
  startTime,
  totalDuration
) {
  this.instance = instance;
  this.hasFinished = hasFinished;
  this.startTime = startTime;
  this.totalDuration = totalDuration;
  this.resumeOnActivate = false;
};

gdjs.TweenRuntimeBehavior.prototype._addTween = function(
  identifier,
  instance,
  startTime,
  totalDuration
) {
  this._tweens[identifier] = new gdjs.TweenRuntimeBehavior.TweenInstance(
    instance,
    false,
    startTime,
    totalDuration
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
  var tween = this._tweens[identifier];

  // Pause the tween, and remove it from the scene of living tweens
  // (the invariant is that scene only contains tweens being played).
  tween.instance.pause();
  if (this._runtimeScene.shiftyJsScene) {
    this._runtimeScene.shiftyJsScene.remove(tween.instance);
  }
};

gdjs.TweenRuntimeBehavior.prototype._resumeTween = function(identifier) {
  var tween = this._tweens[identifier];

  // Resume the tween, and add it back to the scene of living tweens
  // (the invariant is that scene only contains tweens being played).
  tween.instance.resume().catch(function() {
    // Do nothing if the Promise is rejected. Rejection is used
    // by Shifty.js to signal that the tween was not finished.
    // We catch it to avoid an uncaught promise error, and to
    // ensure that the content of the "then" is always applied:
  });
  if (this._runtimeScene.shiftyJsScene) {
    this._runtimeScene.shiftyJsScene.add(tween.instance);
  }
};

gdjs.TweenRuntimeBehavior.prototype._stopTween = function(
  identifier,
  jumpToDest
) {
  return this._tweens[identifier].instance.stop(jumpToDest);
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
  this._removeTween(identifier);
  return this.owner.deleteFromScene(this._runtimeScene);
};

gdjs.TweenRuntimeBehavior.prototype._removeTween = function(identifier) {
  if (!this._tweens[identifier]) return;

  this._tweens[identifier].instance.stop();
  gdjs.TweenRuntimeBehavior.removeFromScene(
    this._runtimeScene,
    this._tweens[identifier].instance
  );
  delete this._tweens[identifier];
};

gdjs.TweenRuntimeBehavior.prototype._setupTweenEnding = function(
  identifier,
  destroyObjectWhenFinished
) {
  var that = this;
  if (destroyObjectWhenFinished) {
    this._tweens[identifier].instance
      .tween()
      .catch(function() {
        // Do nothing if the Promise is rejected. Rejection is used
        // by Shifty.js to signal that the tween was not finished.
        // We catch it to avoid an uncaught promise error, and to
        // ensure that the content of the "then" is always applied:
      })
      .then(function() {
        that._removeObjectFromScene(identifier);
      })
      .catch(function() {
        // Do nothing if the Promise is rejected. Rejection is used
        // by Shifty.js to signal that the tween was not finished.
        // We catch it to avoid an uncaught promise error, and to
        // ensure that the content of the "then" is always applied:
      });
  } else {
    this._tweens[identifier].instance
      .tween()
      .catch(function() {
        // Do nothing if the Promise is rejected. Rejection is used
        // by Shifty.js to signal that the tween was not finished.
        // We catch it to avoid an uncaught promise error, and to
        // ensure that the content of the "then" is always applied:
      })
      .then(function() {
        if (that._tweens[identifier]) {
          that._tweens[identifier].hasFinished = true;
        }
      })
      .catch(function() {
        // Do nothing if the Promise is rejected. Rejection is used
        // by Shifty.js to signal that the tween was not finished.
        // We catch it to avoid an uncaught promise error, and to
        // ensure that the content of the "then" is always applied:
      });
  }
};

/**
 * Add an object variable tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {gdjs.Variable} variable The object variable to store the tweened value
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
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );

  newTweenable.setConfig({
    from: {
      value: fromValue,
    },
    to: {
      value: toValue,
    },
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      x: this.owner.getX(),
      y: this.owner.getY(),
    },
    to: {
      x: toX,
      y: toY,
    },
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      x: this.owner.getX(),
    },
    to: {
      x: toX,
    },
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      y: this.owner.getY(),
    },
    to: {
      y: toY,
    },
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      angle: this.owner.getAngle(),
    },
    to: {
      angle: toAngle,
    },
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
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleTween = function(
  identifier,
  toScaleX,
  toScaleY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.setScaleX || !this.owner.setScaleY) return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  if (toScaleX < 0) toScaleX = 0;
  if (toScaleY < 0) toScaleY = 0;

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      scaleX: this.owner.getScaleX(),
      scaleY: this.owner.getScaleY(),
    },
    to: {
      scaleX: toScaleX,
      scaleY: toScaleY,
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
      that.owner.setScaleX(state.scaleX);
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
};

/**
 * Add an object X-scale tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toScaleX The target X-scale
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleXTween = function(
  identifier,
  toScaleX,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.setScaleX) return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      scaleX: this.owner.getScaleX(),
    },
    to: {
      scaleX: toScaleX,
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
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
};

/**
 * Add an object scale y tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toScaleY The target Y-scale
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addObjectScaleYTween = function(
  identifier,
  toScaleY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.setScaleY) return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      scaleY: this.owner.getScaleY(),
    },
    to: {
      scaleY: toScaleY,
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
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
};

/**
 * Add an object opacity tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toOpacity The target opacity
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
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.getOpacity || !this.owner.setOpacity) return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      opacity: this.owner.getOpacity(),
    },
    to: {
      opacity: toOpacity,
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
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
};

/**
 * Add an object color tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {string} toColor The target color
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
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.getColor || !this.owner.setColor) return;
  if (
    !toColor.match(
      '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
    )
  )
    return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var fromColor = this.owner.getColor().split(';');
  var toColor = toColor.split(';');
  if (toColor.length !== 3) return;

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      red: fromColor[0],
      green: fromColor[1],
      blue: fromColor[2],
    },
    to: {
      red: toColor[0],
      green: toColor[1],
      blue: toColor[2],
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
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
};

/**
 * Add a text object character size tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toSize The target character size
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.prototype.addTextObjectCharacterSizeTween = function(
  identifier,
  toSize,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {
  var that = this;
  if (!this._isActive) return;
  if (!this.owner.setCharacterSize) return;

  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      size: this.owner.getCharacterSize(),
    },
    to: {
      size: toSize,
    },
    duration: durationValue,
    easing: easingValue,
    step: function step(state) {
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      width: this.owner.getWidth(),
    },
    to: {
      width: toWidth,
    },
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
  var that = this;
  if (!this._isActive) return;
  if (!!gdjs.TweenRuntimeBehavior.easings[easingValue]) return;

  if (this._tweenExists(identifier)) {
    this.removeTween(identifier);
  }

  var newTweenable = gdjs.TweenRuntimeBehavior.makeNewTweenable(
    this._runtimeScene
  );
  newTweenable.setConfig({
    from: {
      height: this.owner.getHeight(),
    },
    to: {
      height: toHeight,
    },
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
 * Tween exists.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} The tween exists
 */
gdjs.TweenRuntimeBehavior.prototype.exists = function(identifier) {
  return this._tweenExists(identifier);
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
  if (!this._isActive) return;

  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._pauseTween(identifier);
  }
};

/**
 * Stop a tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {boolean} jumpToDest Move to destination
 */
gdjs.TweenRuntimeBehavior.prototype.stopTween = function(
  identifier,
  jumpToDest
) {
  if (!this._isActive) return;

  if (this._tweenExists(identifier) && this._tweenIsPlaying(identifier)) {
    this._stopTween(identifier, jumpToDest);
  }
};

/**
 * Resume a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.resumeTween = function(identifier) {
  if (!this._isActive) return;

  if (this._tweenExists(identifier) && !this._tweenIsPlaying(identifier)) {
    this._resumeTween(identifier);
  }
};

/**
 * Remove a tween.
 * @param {string} identifierFirst Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.prototype.removeTween = function(identifier) {
  this._removeTween(identifier);
};

/**
 * Get tween progress.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} Progress of playing tween animation (between 0.0 and 1.0)
 */
gdjs.TweenRuntimeBehavior.prototype.getProgress = function(identifier) {
  var tween = this._getTween(identifier);
  if (tween) {
    var currentTime = this._runtimeScene.getTimeManager().getTimeFromStart();
    if (currentTime >= tween.startTime + tween.totalDuration) return 1;

    return (currentTime - tween.startTime) / tween.totalDuration;
  } else {
    return 0;
  }
};

gdjs.TweenRuntimeBehavior.prototype.onDeActivate = function() {
  if (!this._isActive) return;

  for (var key in this._tweens) {
    if (this._tweens.hasOwnProperty(key)) {
      var tween = this._tweens[key];

      if (tween.instance.isPlaying()) {
        tween.resumeOnActivate = true;
        this._pauseTween(key);
      }
    }
  }
  this._isActive = false;
};

gdjs.TweenRuntimeBehavior.prototype.onActivate = function() {
  if (this._isActive) return;

  for (var key in this._tweens) {
    if (this._tweens.hasOwnProperty(key)) {
      var tween = this._tweens[key];

      if (tween.resumeOnActivate) {
        tween.resumeOnActivate = false;
        this._resumeTween(key);
      }
    }
  }
  this._isActive = true;
};

/**
 * Static function to create a Tweenable associated to a scene.
 * Don't create manually shifty.Tweenable, otherwise they won't be
 * associated to a scene (and will play even when scene is paused).
 *
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {shifty.Tweenable} The new tweenable
 */
gdjs.TweenRuntimeBehavior.makeNewTweenable = function(runtimeScene) {
  if (!runtimeScene.shiftyJsScene) {
    runtimeScene.shiftyJsScene = new shifty.Scene();
  }

  var tweenable = new shifty.Tweenable();
  runtimeScene.shiftyJsScene.add(tweenable);
  return tweenable;
};

/**
 * Static function to remove a Tweenable from a scene.
 *
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {shifty.Tweenable} tweenable
 */
gdjs.TweenRuntimeBehavior.removeFromScene = function(runtimeScene, tweenable) {
  if (!runtimeScene.shiftyJsScene) return;

  runtimeScene.shiftyJsScene.remove(tweenable);
};

// Callbacks called to pause/resume Shifty scene when a gdjs.RuntimeScene
// is paused/resumed

/**
 * Stop and "destroy" all the tweens when a scene is unloaded.
 * @private
 */
gdjs.registerRuntimeSceneUnloadedCallback(function(runtimeScene) {
  if (!runtimeScene.shiftyJsScene) return;

  // Stop and explictly remove all tweenables to be sure to drop
  // all references to the tweenables of the scene.
  runtimeScene.shiftyJsScene.stop(false);
  runtimeScene.shiftyJsScene.tweenables.forEach(
    runtimeScene.shiftyJsScene.remove.bind(runtimeScene.shiftyJsScene)
  );
});

/**
 * When a scene is paused, pause all the tweens of this scene.
 * @private
 */
gdjs.registerRuntimeScenePausedCallback(function(runtimeScene) {
  if (!runtimeScene.shiftyJsScene) return;

  runtimeScene.shiftyJsScene.pause();
});

/**
 * When a scene is paused, resume all the tweens of this scene.
 * @private
 */
gdjs.registerRuntimeSceneResumedCallback(function(runtimeScene) {
  if (!runtimeScene.shiftyJsScene) return;

  // It is important to set immediately the current Shifty time back to the
  // time of the scene, as the call `resume` will process the tweens.
  // (If not done, tweens will be resumed with the time of the previous
  // scene, that could create weird result/make tweens act as if not paused).
  gdjs.TweenRuntimeBehavior._currentTweenTime = runtimeScene
    .getTimeManager()
    .getTimeFromStart();
  runtimeScene.shiftyJsScene.resume();

  // Note that per the invariant of shiftyJsScene, shiftyJsScene will only
  // contains tweenables that should be playing (so calling resume is safe).
});

// Handle Shifty.js updates (the time and the "tick" of tweens
// is controlled by the behavior)
gdjs.TweenRuntimeBehavior._tweensProcessed = false;
gdjs.TweenRuntimeBehavior._currentTweenTime = 0;

gdjs.registerRuntimeScenePreEventsCallback(function(runtimeScene) {
  gdjs.TweenRuntimeBehavior._currentTweenTime = runtimeScene
    .getTimeManager()
    .getTimeFromStart();
  shifty.processTweens();
});

// Set up Shifty.js so that the processing ("tick"/updates) is handled
// by the behavior, once per frame. See above.
shifty.Tweenable.setScheduleFunction(function() {
  /* Do nothing, we'll call processTweens manually. */
});

// Set up Shifty.js so that the time is handled by the behavior.
// It will be set to be the time of the current scene, and should be updated
// before any tween processing (processTweens, resume).
shifty.Tweenable.now = function() {
  return gdjs.TweenRuntimeBehavior._currentTweenTime;
};
