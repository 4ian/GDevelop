/*
GDevelop - AdvancedTween behavior
*/

gdjs.__AdvancedTween = gdjs.__AdvancedTween || {};

gdjs.__AdvancedTween.TimelineAnimation = class TimelineAnimation {
  constructor() {
    this._name = '';
    this._duration = 0;
    this._loop = false;
    this._tracks = {};
    this._initialValues = {};
  }

  setData(jsonData) {
    this._name = jsonData.name || '';
    this._duration = jsonData.duration;
    this._loop = jsonData.loop || false;
    this._tracks = {};

    for (const [prop, track] of Object.entries(jsonData.tracks || {})) {
      this._tracks[prop] = (track.keyframes || [])
        .slice()
        .sort((a, b) => a.time - b.time);
    }
  }

  get duration() {
    return this._duration;
  }

  get loop() {
    return this._loop;
  }

  clearData() {
    this._name = '';
    this._duration = 0;
    this._loop = false;
    this._tracks = {};
  }

  setInitialValues(values) {
    this._initialValues = { ...values };
  }

  getInitialValues() {
    return { ...this._initialValues };
  }

  clearInitialValues() {
    this._initialValues = {};
  }

  getAbsoluteValuesAt(time) {
    const result = {};
    for (const prop of gdjs.__AdvancedTween.TimelineAnimation.ALL_PROPERTIES) {
      const timelineValue = this._evaluateProperty(prop, time);
      const initialValue = this._initialValues[prop];

      if (timelineValue === null) {
        result[prop] = initialValue !== undefined ? initialValue : null;
      } else if (
        gdjs.__AdvancedTween.TimelineAnimation.ADDITIVE_PROPERTIES.has(prop)
      ) {
        result[prop] = (initialValue !== undefined ? initialValue : 0) + timelineValue;
      } else if (
        gdjs.__AdvancedTween.TimelineAnimation.MULTIPLICATIVE_PROPERTIES.has(
          prop
        )
      ) {
        result[prop] = (initialValue !== undefined ? initialValue : 1) * timelineValue;
      } else {
        result[prop] = timelineValue;
      }
    }
    return result;
  }

  _evaluateProperty(prop, time) {
    const keyframes = this._tracks[prop];
    if (!keyframes || keyframes.length === 0) return null;
    if (keyframes.length === 1) return keyframes[0].value;

    let evalTime = time;
    if (this._loop && this._duration > 0) {
      evalTime = ((time % this._duration) + this._duration) % this._duration;
    }

    if (evalTime <= keyframes[0].time) return keyframes[0].value;
    if (evalTime >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }

    const segIndex = this._findSegmentIndex(keyframes, evalTime);
    const kfA = keyframes[segIndex];
    const kfB = keyframes[segIndex + 1];
    const easing = kfA.easing || { type: 'linear' };
    const easingType = gdjs.__AdvancedTween.TimelineAnimation.STEP_ONLY_PROPERTIES.has(
      prop
    )
      ? 'step'
      : easing.type;

    if (easingType === 'step') return kfA.value;

    const segDuration = kfB.time - kfA.time;
    const localT = segDuration === 0 ? 1 : (evalTime - kfA.time) / segDuration;
    const progress =
      easingType === 'cubicBezier' && easing.controlPoints
        ? gdjs.__AdvancedTween.TimelineAnimation._sampleCubicBezier(
            easing.controlPoints[0],
            easing.controlPoints[1],
            easing.controlPoints[2],
            easing.controlPoints[3],
            localT
          )
        : localT;

    return kfA.value + (kfB.value - kfA.value) * progress;
  }

  _findSegmentIndex(keyframes, time) {
    let lo = 0;
    let hi = keyframes.length - 2;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (keyframes[mid + 1].time <= time) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  static _sampleCubicBezier(x1, y1, x2, y2, t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const s = gdjs.__AdvancedTween.TimelineAnimation._solveCubicBezierX(
      x1,
      x2,
      t
    );
    return gdjs.__AdvancedTween.TimelineAnimation._cubicBezierCalc(y1, y2, s);
  }

  static _cubicBezierCalc(p1, p2, s) {
    const s2 = s * s;
    const s3 = s2 * s;
    const inv = 1 - s;
    const inv2 = inv * inv;
    return 3 * inv2 * s * p1 + 3 * inv * s2 * p2 + s3;
  }

  static _solveCubicBezierX(x1, x2, targetX) {
    const epsilon = 1e-7;
    const bx = s =>
      gdjs.__AdvancedTween.TimelineAnimation._cubicBezierCalc(x1, x2, s);
    const dx = s => {
      const inv = 1 - s;
      return (
        3 * x1 * inv * (1 - 3 * s) +
        3 * x2 * s * (2 - 3 * s) +
        3 * s * s
      );
    };

    let s = targetX;
    for (let i = 0; i < 16; i++) {
      const xValue = bx(s) - targetX;
      if (Math.abs(xValue) < epsilon) return s;
      const d = dx(s);
      if (Math.abs(d) < 1e-12) break;
      s -= xValue / d;
      if (s < 0 || s > 1) break;
    }

    let lo = 0;
    let hi = 1;
    s = targetX;
    for (let i = 0; i < 64; i++) {
      const xValue = bx(s);
      if (Math.abs(xValue - targetX) < epsilon) return s;
      if (xValue < targetX) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return s;
  }
};

gdjs.__AdvancedTween.TimelineAnimation.STEP_ONLY_PROPERTIES = new Set([
  'hidden',
  'flipX',
  'flipY',
  'animationName',
]);
gdjs.__AdvancedTween.TimelineAnimation.ALL_PROPERTIES = [
  'x',
  'y',
  'zIndex',
  'angle',
  'hidden',
  'opacity',
  'scaleX',
  'scaleY',
  'flipX',
  'flipY',
  'animationName',
];
gdjs.__AdvancedTween.TimelineAnimation.ADDITIVE_PROPERTIES = new Set([
  'x',
  'y',
  'zIndex',
  'angle',
]);
gdjs.__AdvancedTween.TimelineAnimation.MULTIPLICATIVE_PROPERTIES = new Set([
  'scaleX',
  'scaleY',
]);

gdjs.AdvancedTweenRuntimeBehavior = class AdvancedTweenRuntimeBehavior extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._timeline = new gdjs.__AdvancedTween.TimelineAnimation();
    this._initialJson = behaviorData.InitialJson || '';
    this._noInitialValue =
      behaviorData.NoInitialValue !== undefined ? behaviorData.NoInitialValue : true;
    this._deleteWhenFinished = !!behaviorData.Delete;
    this._timerNeedsReset = true;
    this._pendingCurrentTime = null;

    if (this._initialJson) {
      this.setData(this._initialJson);
    }
  }

  onCreated() {
    this._timeline.clearData();
    this._noInitialValue = true;
    this._timerNeedsReset = true;
    this._pendingCurrentTime = null;
    if (this._initialJson) {
      this.setData(this._initialJson);
    }
  }

  applyBehaviorOverriding(behaviorData) {
    if (behaviorData.InitialJson !== undefined) {
      this._initialJson = behaviorData.InitialJson;
      if (this._initialJson) this.setData(this._initialJson);
    }
    if (behaviorData.NoInitialValue !== undefined) {
      this._noInitialValue = behaviorData.NoInitialValue;
    }
    if (behaviorData.Delete !== undefined) {
      this._deleteWhenFinished = behaviorData.Delete;
    }
    return true;
  }

  doStepPreEvents(instanceContainer) {
    this._ensureTimerReady();
    if (this._noInitialValue) {
      this.setInitialValues();
    }
    this.animate();
  }

  doStepPostEvents(instanceContainer) {
    this._ensureTimerReady();
    if (this._noInitialValue) {
      this.setInitialValues();
      this.animate();
    }
  }

  onDestroy() {
    this._timeline.clearData();
  }

  setJson(jsonResourceName, deleteWhenFinished) {
    this.setDelete(deleteWhenFinished);
    this.setData(jsonResourceName);
    this.setInitialValues();
    this.animate();
  }

  setData(jsonResourceName) {
    this._initialJson = jsonResourceName || '';
    if (this._initialJson) {
      const loadedJson = this.owner
        .getRuntimeScene()
        .getGame()
        .getJsonManager()
        .getLoadedJson(this._initialJson);
      if (loadedJson && loadedJson.version && loadedJson.name && loadedJson.duration) {
        this._timeline.setData(loadedJson);
      }
    } else {
      this._timeline.clearData();
    }
    this._timerNeedsReset = true;
    this._ensureTimerReady();
  }

  _ensureTimerReady() {
    if (!this.owner._timers) return false;

    if (this._timerNeedsReset) {
      this.owner.resetTimer('__AdvancedTweenTimer');
      this._timerNeedsReset = false;
    } else if (!this.owner._timers.containsKey('__AdvancedTweenTimer')) {
      this.owner.resetTimer('__AdvancedTweenTimer');
    }

    if (this._pendingCurrentTime !== null) {
      this.owner._timers
        .get('__AdvancedTweenTimer')
        .setTime(this._pendingCurrentTime * 1000);
      this._pendingCurrentTime = null;
    }

    return true;
  }

  setInitialValues() {
    const owner = this.owner;
    const scaleX = owner.getScaleX
      ? owner.getScaleX()
      : owner.getWidth() / owner.getOriginalWidth();
    const scaleY = owner.getScaleY
      ? owner.getScaleY()
      : owner.getHeight() / owner.getOriginalHeight();

    this._timeline.setInitialValues({
      x: owner.getCenterXInScene(),
      y: owner.getCenterYInScene(),
      angle: owner.getAngle(),
      scaleX,
      scaleY,
      width: owner.getWidth(),
      height: owner.getHeight(),
      zIndex: owner.getZOrder(),
    });
    this._noInitialValue = false;
  }

  animate() {
    if (!this._ensureTimerReady()) return;

    const owner = this.owner;
    const values = this._timeline.getAbsoluteValuesAt(
      owner.getTimerElapsedTimeInSeconds('__AdvancedTweenTimer')
    );
    const initial = this._timeline.getInitialValues();

    if (values.x !== null) owner.setCenterXInScene(values.x);
    if (values.y !== null) owner.setCenterYInScene(values.y);
    if (values.angle !== null) owner.setAngle(values.angle);
    if (owner.setOpacity && values.opacity !== null) owner.setOpacity(values.opacity);

    if (values.scaleX !== null) {
      if (owner.getScaleX) owner.setScaleX(values.scaleX);
      else owner.setWidth(initial.width * values.scaleX);
    }
    if (values.scaleY !== null) {
      if (owner.getScaleY) owner.setScaleY(values.scaleY);
      else owner.setHeight(initial.height * values.scaleY);
    }
    if (values.zIndex !== null) owner.setZOrder(Math.round(values.zIndex));
    if (values.hidden !== null) owner.hide(values.hidden);
    if (owner.flipX && values.flipX !== null) owner.flipX(values.flipX);
    if (owner.flipY && values.flipY !== null) owner.flipY(values.flipY);
    if (owner.setAnimationName && values.animationName !== null) {
      owner.setAnimationName(values.animationName);
    }

    if (
      this._deleteWhenFinished &&
      this._timeline.duration > 0 &&
      owner.getTimerElapsedTimeInSeconds('__AdvancedTweenTimer') >
        this._timeline.duration
    ) {
      owner.deleteFromScene();
    }
  }

  getDuration() {
    return this._timeline.duration || 0;
  }

  getCurrentTime() {
    const duration = this.getDuration();
    if (duration <= 0) return 0;
    if (!this._ensureTimerReady()) return 0;
    return ownerModulo(
      this.owner.getTimerElapsedTimeInSeconds('__AdvancedTweenTimer'),
      duration
    );
  }

  setCurrentTime(value) {
    this._pendingCurrentTime = value;
    this._timerNeedsReset = true;
    this._ensureTimerReady();
  }

  play() {
    this._timerNeedsReset = true;
    this._ensureTimerReady();
  }

  pause() {
    if (!this._ensureTimerReady()) return;
    this.owner.pauseTimer('__AdvancedTweenTimer');
  }

  resume() {
    if (!this._ensureTimerReady()) return;
    this.owner.unpauseTimer('__AdvancedTweenTimer');
  }

  noInitialValue() {
    return this._noInitialValue;
  }

  setNoInitialValue(value) {
    this._noInitialValue = value;
  }

  getInitialJson() {
    return this._initialJson;
  }

  setInitialJson(value) {
    this._initialJson = value || '';
  }

  deleteWhenFinished() {
    return this._deleteWhenFinished;
  }

  setDelete(value) {
    this._deleteWhenFinished = !!value;
  }
};

function ownerModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

gdjs.registerBehavior(
  'AdvancedTween::AdvancedTween',
  gdjs.AdvancedTweenRuntimeBehavior
);
