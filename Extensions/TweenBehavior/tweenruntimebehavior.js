/**
 * @memberof gdjs
 * @class tween
 * @static
 * @private
 */

gdjs.TweenRuntimeBehavior = function (runtimeScene, behaviorData, owner) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);
};

gdjs.TweenRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);

gdjs.TweenRuntimeBehavior.thisIsARuntimeBehaviorConstructor =
  "Tween::TweenBehavior";

gdjs.TweenRuntimeBehavior._tweenList = {};

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

gdjs.TweenRuntimeBehavior._addObjectVariableTween = (owner, identifier, instance, variable, currentValue) => {
  gdjs.TweenRuntimeBehavior._tweenList[owner][identifier] = new gdjs.TweenRuntimeBehavior.ObjectVariableTweenInstance(instance, false, 0, variable, currentValue);
};

gdjs.TweenRuntimeBehavior._addObjectPositionTween = (owner, identifier, instance, x, y) => {
  gdjs.TweenRuntimeBehavior._tweenList[owner] = { identifier };
  gdjs.TweenRuntimeBehavior._tweenList[owner][identifier] = new gdjs.TweenRuntimeBehavior.ObjectPositionTweenInstance(instance, false, 0, x, y);
};

gdjs.TweenRuntimeBehavior._getTween = (owner, identifier) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier];
};

gdjs.TweenRuntimeBehavior._tweenExists = (owner, identifier) => {
  if (owner in gdjs.TweenRuntimeBehavior._tweenList) {
    if (identifier in gdjs.TweenRuntimeBehavior._tweenList[owner]) {
      return true
    }
  }
  return false;
};

gdjs.TweenRuntimeBehavior._tweenIsPlaying = (owner, identifier) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.isPlaying();
};

gdjs.TweenRuntimeBehavior._pauseTween = (owner, identifier) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.pause();
};

gdjs.TweenRuntimeBehavior._resumeTween = (owner, identifier) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.resume();
};

gdjs.TweenRuntimeBehavior._stopTween = (owner, identifier, JumpToDest) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.stop(JumpToDest);
};

gdjs.TweenRuntimeBehavior._setTweenFinished = (owner, identifier, hasFinished) => {
  gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].hasFinished = hasFinished;
};

gdjs.TweenRuntimeBehavior._tweenHasFinished = (owner, identifier) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].hasFinished;
};

gdjs.TweenRuntimeBehavior._setRemoveObjectFromScene = (owner, identifier, removeObjectFromScene) => {
  return gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].removeObjectFromScene = removeObjectFromScene;
};

gdjs.TweenRuntimeBehavior._removeTween = (owner, identifier) => {
  gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.dispose();
  delete gdjs.TweenRuntimeBehavior._tweenList[owner][identifier];
};

/**
 * Add an object variable tween.
 * @param {object} owner The runtime object
 * @param {behavior} tweenBehavior The tween behavior
 * @param {string} identifier Unique id to idenfify the tween
 * @param {objectvar} variable The object variable to store the tweened value
 * @param {number} fromValue Start value
 * @param {number} toVaue End value
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.addObjectVariableTween = function (
  owner,
  tweenBehavior,
  identifier,
  variable,
  fromValue,
  toValue,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {

  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier)) {
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
      gdjs.TweenRuntimeBehavior._getTween(owner, identifier).progress = state.progress;
      gdjs.TweenRuntimeBehavior._getTween(owner, identifier).currentValue = state.value;
      console.log(state);
    }
  });

  gdjs.TweenRuntimeBehavior._addObjectVariableTween(owner, identifier, newTweenable, variable, fromValue);

  if (destroyObjectWhenFinished) {
    gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.tween().then(() => {

      gdjs.TweenRuntimeBehavior._removeTween(owner, identifier);
      gdjs.TweenRuntimeBehavior._setRemoveObjectFromScene(owner, identifier, true);

    });
  } else {
    gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.tween().then(() => {
      gdjs.TweenRuntimeBehavior._setTweenFinished(owner, identifier, true);
    });
  }
};

/**
 * Add an object position tween.
 * @param {object} owner The runtime object
 * @param {behavior} tweenBehavior The tween behavior
 * @param {string} identifier Unique id to idenfify the tween
 * @param {number} toX The object variable to store the tweened value
 * @param {number} toY Start value
 * @param {string} easingValue Type of easing
 * @param {number} durationValue Duration in milliseconds
 * @param {boolean} destroyObjectWhenFinished Destroy this object when the tween ends
 */
gdjs.TweenRuntimeBehavior.addObjectPositionTween = function (
  owner,
  tweenBehavior,
  identifier,
  toX,
  toY,
  easingValue,
  durationValue,
  destroyObjectWhenFinished
) {

  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier)) {
    gdjs.TweenRuntimeBehavior.removeTween(owner, tweenBehavior, identifier);
  }

  let newTweenable = new shifty.Tweenable();
  newTweenable.setConfig({
    from: { x: owner.getX(), y: owner.getY(), progress: 0.0 },
    to: { x: toX, y: toY, progress: 1.0 },
    duration: durationValue,
    easing: easingValue,
    step: state => {

      gdjs.TweenRuntimeBehavior._getTween(owner, identifier).progress = state.progress;
      gdjs.TweenRuntimeBehavior._getTween(owner, identifier).x = state.x;
      gdjs.TweenRuntimeBehavior._getTween(owner, identifier).y = state.y;
      owner.setX(state.x);
      owner.setY(state.y);
      console.log(state);
    }
  });

  gdjs.TweenRuntimeBehavior._addObjectPositionTween(owner, identifier, newTweenable, owner.getX(), owner.getY());

  if (destroyObjectWhenFinished) {
    gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.tween().then(() => {
      gdjs.TweenRuntimeBehavior._removeTween(owner, identifier);
      gdjs.TweenRuntimeBehavior._setRemoveObjectFromScene(owner, identifier, true);
    });
  } else {
    gdjs.TweenRuntimeBehavior._tweenList[owner][identifier].instance.tween().then(() => {
      gdjs.TweenRuntimeBehavior._setTweenFinished(owner, identifier, true);
    });
  }
};

/**
 * Tween is playing.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.isPlaying = function (owner, behavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier) && this._tweenIsPlaying(owner, identifier)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Tween has finished.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.hasFinished = function (owner, tweenBehavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier)) {
    return gdjs.TweenRuntimeBehavior._tweenHasFinished(owner, identifier);
  } else {
    return false;
  }
};

/**
 * Pause a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.pauseTween = function (owner, behavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier) && gdjs.TweenRuntimeBehavior._tweenIsPlaying(owner, identifier)) {
    gdjs.TweenRuntimeBehavior._pauseTween(owner, identifier);
  }
};

/**
 * Stop a tween.
 * @param {string} identifier Unique id to idenfify the tween
 * @param {boolean} JumpToDest Move to destination
 */
gdjs.TweenRuntimeBehavior.stopTween = function (owner, behavior,
  identifier,
  JumpToDest
) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier) && gdjs.TweenRuntimeBehavior._tweenIsPlaying(owner, identifier)) {
    gdjs.TweenRuntimeBehavior._stopTween(owner, identifier, JumpToDest);
  }
};

/**
 * Resume a tween.
 * @param {string} identifier Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.resumeTween = function (owner, behavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier) && !gdjs.TweenRuntimeBehavior._tweenIsPlaying(owner, identifier)) {
    gdjs.TweenRuntimeBehavior._resumeTween(owner, identifier);
  }
};

/**
 * Remove a tween.
 * @param {string} identifierFirst Unique id to idenfify the tween
 */
gdjs.TweenRuntimeBehavior.removeTween = function (owner, behavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier)) {
    gdjs.TweenRuntimeBehavior._removeTween(owner, identifier);
  }
};

/**
 * Get tween progress.
 * @param {string} identifier Unique id to idenfify the tween
 * @returns {boolean} Progress of playing tween animation (between 0.0 and 1.0)
 */
gdjs.TweenRuntimeBehavior.getProgress = function (owner, behavior, identifier) {
  if (gdjs.TweenRuntimeBehavior._tweenExists(owner, identifier)) {
    return gdjs.TweenRuntimeBehavior._getTween(owner, identifier).progress;
  } else {
    return 0.0;
  }
};

gdjs.TweenRuntimeBehavior.prototype.doStepPreEvents = function (runtimeScene) {

};

gdjs.TweenRuntimeBehavior.prototype.onDeActivate = function () {

};
