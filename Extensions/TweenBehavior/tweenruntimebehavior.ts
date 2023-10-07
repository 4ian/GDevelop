/*
GDevelop - Tween Behavior Extension
Copyright (c) 2010-2023 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  interface IColorable extends gdjs.RuntimeObject {
    setColor(color: string): void;
    getColor(): string;
  }

  interface ICharacterScalable extends gdjs.RuntimeObject {
    setCharacterSize(characterSize: number): void;
    getCharacterSize(): number;
  }

  function isScalable(
    o: gdjs.RuntimeObject
  ): o is gdjs.RuntimeObject & gdjs.Scalable {
    //@ts-ignore We are checking if the methods are present.
    return o.setScaleX && o.setScaleY && o.getScaleX && o.getScaleY;
  }

  function isOpaque(
    o: gdjs.RuntimeObject
  ): o is gdjs.RuntimeObject & gdjs.OpacityHandler {
    //@ts-ignore We are checking if the methods are present.
    return o.setOpacity && o.getOpacity;
  }

  function isColorable(o: gdjs.RuntimeObject): o is IColorable {
    //@ts-ignore We are checking if the methods are present.
    return o.setColor && o.getColor;
  }

  function isCharacterScalable(o: gdjs.RuntimeObject): o is ICharacterScalable {
    //@ts-ignore We are checking if the methods are present.
    return o.setCharacterSize && o.getCharacterSize;
  }

  function rgbToHsl(r: number, g: number, b: number): number[] {
    r /= 255;
    g /= 255;
    b /= 255;
    let v = Math.max(r, g, b),
      c = v - Math.min(r, g, b),
      f = 1 - Math.abs(v + v - c - 1);
    let h =
      c &&
      (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return [
      Math.round(60 * (h < 0 ? h + 6 : h)),
      Math.round((f ? c / f : 0) * 100),
      Math.round(((v + v - c) / 2) * 100),
    ];
  }

  function hslToRgb(h: number, s: number, l: number): number[] {
    h = h %= 360;
    if (h < 0) {
      h += 360;
    }
    s = s / 100;
    l = l / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n = 0, k = (n + h / 30) % 12) =>
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [
      Math.round(f(0) * 255),
      Math.round(f(8) * 255),
      Math.round(f(4) * 255),
    ];
  }

  const linearInterpolation = gdjs.evtTools.common.lerp;
  const exponentialInterpolation =
    gdjs.evtTools.common.exponentialInterpolation;

  export class TweenRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _tweens = new gdjs.TweenRuntimeBehavior.TweenManager();
    private _isActive: boolean = true;

    /**
     * @param instanceContainer The instance container the behavior belongs to.
     * @param behaviorData The data to initialize the behavior
     * @param owner The runtime object the behavior belongs to.
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: BehaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
    }

    updateFromBehaviorData(
      oldBehaviorData: BehaviorData,
      newBehaviorData: BehaviorData
    ): boolean {
      // Nothing to update.
      return true;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._tweens.step();
    }

    private _deleteFromScene() {
      this.owner.deleteFromScene(this.owner.getInstanceContainer());
    }

    /**
     * Add an object variable tween.
     * @deprecated Use addValueTween instead.
     * This function is misleading since one could think that the tween starts
     * right at the moment this function is called whereas the value of the variable
     * will change at the next frame only. Moreover, the variable will not start from
     * the start value exactly since time will have passed at the moment the next
     * frame is rendered.
     * See https://github.com/4ian/GDevelop/issues/4270
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param fromValue Start value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween(
      identifier: string,
      variable: gdjs.Variable,
      fromValue: float,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        linearInterpolation,
        fromValue,
        toValue,
        (value: float) => variable.setNumber(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object variable.
     * @deprecated Use addValueTween instead.
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween2(
      identifier: string,
      variable: gdjs.Variable,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      if (variable.getType() !== 'number') {
        return;
      }
      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        linearInterpolation,
        variable.getValue() as number,
        toValue,
        (value: float) => variable.setNumber(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Add an object value tween.
     * @param identifier Unique id to identify the tween
     * @param fromValue Start value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param useExponentialInterpolation Set it to true to use a exponential
     * It's useful for values that are factors like a scale or a zoom.
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addValueTween(
      identifier: string,
      fromValue: float,
      toValue: float,
      easing: string,
      duration: float,
      useExponentialInterpolation: boolean,
      destroyObjectWhenFinished: boolean
    ) {
      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        useExponentialInterpolation
          ? exponentialInterpolation
          : linearInterpolation,
        fromValue,
        toValue,
        (value: float) => {},
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object position.
     * @deprecated Use addObjectPositionTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionTween(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionTween(
        identifier,
        toX,
        toY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object position.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionTween2(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionTween(
        identifier,
        toX,
        toY,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionTween(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        [this.owner.getX(), this.owner.getY()],
        [toX, toY],
        ([x, y]) => this.owner.setPosition(x, y),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object X position.
     * @deprecated Use addObjectPositionXTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionXTween(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionXTween(
        identifier,
        toX,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object X position.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionXTween2(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionXTween(
        identifier,
        toX,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionXTween(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getX(),
        toX,
        (value: float) => this.owner.setX(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Y position.
     * @deprecated Use addObjectPositionYTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionYTween(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionYTween(
        identifier,
        toY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object Y position.
     * @param identifier Unique id to identify the tween
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionYTween2(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionYTween(
        identifier,
        toY,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionYTween(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getY(),
        toY,
        (value: float) => this.owner.setY(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Z position.
     * @deprecated Use the 3D Tween extension instead.
     * @param identifier Unique id to identify the tween
     * @param toZ The target Z position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionZTween(
      identifier: string,
      toZ: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const { owner } = this;
      if (!(owner instanceof gdjs.RuntimeObject3D)) return;

      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        linearInterpolation,
        owner.getZ(),
        toZ,
        (value: float) => owner.setZ(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object angle.
     * @deprecated Use addObjectAngleTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectAngleTween(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectAngleTween(
        identifier,
        toAngle,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object angle.
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectAngleTween2(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectAngleTween(
        identifier,
        toAngle,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectAngleTween(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getAngle(),
        toAngle,
        (value: float) => this.owner.setAngle(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object scale.
     * @deprecated Use addObjectScaleTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleTween(
        identifier,
        toScaleX,
        toScaleY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object scale.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween2(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleTween(
        identifier,
        toScaleX,
        toScaleY,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource,
      interpolation: gdjs.TweenRuntimeBehavior.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      if (toScaleX < 0) toScaleX = 0;
      if (toScaleY < 0) toScaleY = 0;

      const setValue = scaleFromCenterOfObject
        ? ([scaleX, scaleY]: float[]) => {
            const oldX = owner.getCenterXInScene();
            const oldY = owner.getCenterYInScene();
            owner.setScaleX(scaleX);
            owner.setScaleY(scaleY);
            owner.setCenterPositionInScene(oldX, oldY);
          }
        : ([scaleX, scaleY]: float[]) => {
            owner.setScaleX(scaleX);
            owner.setScaleY(scaleY);
          };

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        [owner.getScaleX(), owner.getScaleY()],
        [toScaleX, toScaleY],
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object X-scale.
     * @deprecated Use addObjectScaleXTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleXTween(
        identifier,
        toScaleX,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object X-scale.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleXTween2(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleXTween(
        identifier,
        toScaleX,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource,
      interpolation: gdjs.TweenRuntimeBehavior.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      const setValue = scaleFromCenterOfObject
        ? (scaleX: float) => {
            const oldX = owner.getCenterXInScene();
            owner.setScaleX(scaleX);
            owner.setCenterXInScene(oldX);
          }
        : (scaleX: float) => owner.setScaleX(scaleX);

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getScaleX(),
        toScaleX,
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Y-scale.
     * @deprecated Use addObjectScaleYTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleYTween(
        identifier,
        toScaleY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object Y-scale.
     * @param identifier Unique id to identify the tween
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleYTween2(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleYTween(
        identifier,
        toScaleY,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource,
      interpolation: gdjs.TweenRuntimeBehavior.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      const setValue = scaleFromCenterOfObject
        ? (scaleY: float) => {
            const oldY = owner.getCenterYInScene();
            owner.setScaleY(scaleY);
            owner.setCenterYInScene(oldY);
          }
        : (scaleY: float) => owner.setScaleY(scaleY);

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getScaleY(),
        toScaleY,
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object opacity.
     * @deprecated Use addObjectOpacityTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toOpacity The target opacity
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectOpacityTween(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectOpacityTween(
        identifier,
        toOpacity,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object opacity.
     * @param identifier Unique id to identify the tween
     * @param toOpacity The target opacity
     * @param easing Easing function identifier
     * @param duration Duration in second
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectOpacityTween2(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectOpacityTween(
        identifier,
        toOpacity,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectOpacityTween(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      const owner = this.owner;
      if (!isOpaque(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        owner.getOpacity(),
        toOpacity,
        (value: float) => owner.setOpacity(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object color.
     * @deprecated Use addObjectColorTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param useHSLColorTransition Tween using HSL color mappings, rather than direct RGB line
     */
    addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean
    ) {
      this._addObjectColorTween(
        identifier,
        toColorStr,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        useHSLColorTransition,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object color.
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param useHSLColorTransition Tween using HSL color mappings, rather than direct RGB line
     */
    addObjectColorTween2(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean = true
    ) {
      this._addObjectColorTween(
        identifier,
        toColorStr,
        easing,
        duration,
        destroyObjectWhenFinished,
        useHSLColorTransition,
        this.owner
      );
    }

    private _addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      const owner = this.owner;
      if (!isColorable(owner)) {
        return;
      }

      const rgbFromColor: float[] = gdjs.rgbOrHexToRGBColor(owner.getColor());
      const rgbToColor: float[] = gdjs.rgbOrHexToRGBColor(toColorStr);

      let initialValue;
      let targetedValue;
      let setValue;
      if (useHSLColorTransition) {
        initialValue = rgbToHsl(
          rgbFromColor[0],
          rgbFromColor[1],
          rgbFromColor[2]
        );
        targetedValue = rgbToHsl(rgbToColor[0], rgbToColor[1], rgbToColor[2]);
        setValue = ([hue, saturation, lightness]) => {
          const rgbFromHslColor = hslToRgb(hue, saturation, lightness);
          owner.setColor(
            Math.floor(rgbFromHslColor[0]) +
              ';' +
              Math.floor(rgbFromHslColor[1]) +
              ';' +
              Math.floor(rgbFromHslColor[2])
          );
        };
      } else {
        initialValue = rgbFromColor;
        targetedValue = rgbToColor;
        setValue = ([red, green, blue]) => {
          owner.setColor(
            Math.floor(red) + ';' + Math.floor(green) + ';' + Math.floor(blue)
          );
        };
      }

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        initialValue,
        targetedValue,
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object HSL color, with the "to" color given using HSL (H: any number, S and L: 0-100).
     * @deprecated Use addObjectColorHSLTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue, include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toLightness The target lightness, or the same as the from color's lightness if blank
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorHSLTween(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectColorHSLTween(
        identifier,
        toHue,
        animateHue,
        toSaturation,
        toLightness,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object HSL color, with the "to" color given using HSL (H: any number, S and L: 0-100).
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue, include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toLightness The target lightness, or the same as the from color's lightness if blank
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorHSLTween2(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectColorHSLTween(
        identifier,
        toHue,
        animateHue,
        toSaturation,
        toLightness,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectColorHSLTween(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      if (!isColorable(this.owner)) return;
      const owner = this.owner;

      const rgbFromColor: string[] = owner.getColor().split(';');
      if (rgbFromColor.length < 3) return;
      const hslFromColor = rgbToHsl(
        parseFloat(rgbFromColor[0]),
        parseFloat(rgbFromColor[1]),
        parseFloat(rgbFromColor[2])
      );

      const toH = animateHue ? toHue : hslFromColor[0];
      const toS =
        -1 === toSaturation
          ? hslFromColor[1]
          : Math.min(Math.max(toSaturation, 0), 100);
      const toL =
        -1 === toLightness
          ? hslFromColor[2]
          : Math.min(Math.max(toLightness, 0), 100);

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,

        hslFromColor,
        [toH, toS, toL],
        ([hue, saturation, lightness]) => {
          const rgbFromHslColor = hslToRgb(hue, saturation, lightness);

          owner.setColor(
            Math.floor(rgbFromHslColor[0]) +
              ';' +
              Math.floor(rgbFromHslColor[1]) +
              ';' +
              Math.floor(rgbFromHslColor[2])
          );
        },

        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a text object character size.
     * @deprecated Use addTextObjectCharacterSizeTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toSize The target character size
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addTextObjectCharacterSizeTween(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addTextObjectCharacterSizeTween(
        identifier,
        toSize,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween a text object character size.
     * @param identifier Unique id to identify the tween
     * @param toSize The target character size
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addTextObjectCharacterSizeTween2(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addTextObjectCharacterSizeTween(
        identifier,
        toSize,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addTextObjectCharacterSizeTween(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource,
      interpolation: gdjs.TweenRuntimeBehavior.Interpolation
    ) {
      const owner = this.owner;
      if (!isCharacterScalable(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getCharacterSize(),
        toSize,
        (value: float) => owner.setCharacterSize(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object width.
     * @deprecated Use addObjectWidthTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toWidth The target width
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectWidthTween(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectWidthTween(
        identifier,
        toWidth,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object width.
     * @param identifier Unique id to identify the tween
     * @param toWidth The target width
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectWidthTween2(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectWidthTween(
        identifier,
        toWidth,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectWidthTween(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getWidth(),
        toWidth,
        (value: float) => this.owner.setWidth(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object height.
     * @deprecated Use addObjectHeightTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toHeight The target height
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectHeightTween(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectHeightTween(
        identifier,
        toHeight,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object height.
     * @param identifier Unique id to identify the tween
     * @param toHeight The target height
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectHeightTween2(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectHeightTween(
        identifier,
        toHeight,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectHeightTween(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.TweenRuntimeBehavior.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getHeight(),
        toHeight,
        (value: float) => this.owner.setHeight(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object depth.
     * @deprecated Use the 3D Tween extension instead.
     * @param identifier Unique id to identify the tween
     * @param toDepth The target depth
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectDepthTween(
      identifier: string,
      toDepth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const { owner } = this;
      if (!(owner instanceof gdjs.RuntimeObject3D)) return;

      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        linearInterpolation,
        owner.getDepth(),
        toDepth,
        (value: float) => owner.setDepth(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween is playing.
     * @param identifier Unique id to identify the tween
     */
    isPlaying(identifier: string): boolean {
      return this._tweens.isPlaying(identifier);
    }

    /**
     * Tween exists.
     * @param identifier Unique id to identify the tween
     * @returns The tween exists
     */
    exists(identifier: string): boolean {
      return this._tweens.exists(identifier);
    }

    /**
     * Tween has finished.
     * @param identifier Unique id to identify the tween
     */
    hasFinished(identifier: string): boolean {
      return this._tweens.hasFinished(identifier);
    }

    /**
     * Pause a tween.
     * @param identifier Unique id to identify the tween
     */
    pauseTween(identifier: string) {
      if (this._isActive) {
        this._tweens.pauseTween(identifier);
      }
    }

    /**
     * Stop a tween.
     * @param identifier Unique id to identify the tween
     * @param jumpToDest Move to destination
     */
    stopTween(identifier: string, jumpToDest: boolean) {
      if (this._isActive) {
        this._tweens.stopTween(identifier, jumpToDest);
      }
    }

    /**
     * Resume a tween.
     * @param identifier Unique id to identify the tween
     */
    resumeTween(identifier: string) {
      if (this._isActive) {
        this._tweens.resumeTween(identifier);
      }
    }

    /**
     * Remove a tween.
     * @param identifier Unique id to identify the tween
     */
    removeTween(identifier: string) {
      this._tweens.removeTween(identifier);
    }

    /**
     * Get tween progress.
     * @param identifier Unique id to identify the tween
     * @returns Progress of playing tween animation (between 0.0 and 1.0)
     */
    getProgress(identifier: string): float {
      return this._tweens.getProgress(identifier);
    }

    /**
     * Get tween value.
     *
     * It returns 0 for tweens with several values.
     *
     * @param identifier Unique id to identify the tween
     * @returns Value of playing tween animation
     */
    getValue(identifier: string): float {
      return this._tweens.getValue(identifier);
    }

    onDeActivate() {
      this._isActive = false;
    }

    onActivate() {
      this._isActive = true;
    }
  }
  gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);

  export namespace TweenRuntimeBehavior {
    const easingFunctions: Record<string, gdjs.evtTools.tween.EasingFunction> =
      gdjs.evtTools.tween.easingFunctions;

    /**
     * A tween manager that is used for layout tweens or object tweens.
     * @ignore
     */
    export class TweenManager {
      /**
       * All the tweens of a layout or a behavior.
       */
      private _tweens = new Map<string, TweenRuntimeBehavior.TweenInstance>();
      /**
       * Allow fast iteration on tween that are active.
       */
      private _activeTweens = new Array<TweenRuntimeBehavior.TweenInstance>();

      constructor() {}

      /**
       * Make all active tween step toward the end.
       * @param timeDelta the duration from the previous step in seconds
       * @param layoutTimeDelta the duration from the previous step ignoring layer time scale in seconds
       */
      step(): void {
        for (const tween of this._activeTweens) {
          tween.step();
        }
      }

      /**
       * Add a tween on one value.
       */
      addSimpleTween(
        identifier: string,
        timeSource: TimeSource,
        totalDuration: number,
        easingIdentifier: string,
        interpolate: Interpolation,
        initialValue: float,
        targetedValue: float,
        setValue: (value: float) => void,
        onFinish?: (() => void) | null
      ): void {
        const easing = easingFunctions[easingIdentifier];
        if (!easing) return;

        // Remove any prior tween
        this.removeTween(identifier);

        // Initialize the tween instance
        const tween = new TweenRuntimeBehavior.SimpleTweenInstance(
          timeSource,
          totalDuration,
          easing,
          interpolate,
          initialValue,
          targetedValue,
          setValue,
          onFinish
        );
        this._tweens.set(identifier, tween);
        this._addActiveTween(tween);
      }

      /**
       * Add a tween on several values.
       */
      addMultiTween(
        identifier: string,
        timeSource: TimeSource,
        totalDuration: number,
        easingIdentifier: string,
        interpolate: Interpolation,
        initialValue: Array<float>,
        targetedValue: Array<float>,
        setValue: (value: Array<float>) => void,
        onFinish?: (() => void) | null
      ): void {
        const easing = easingFunctions[easingIdentifier];
        if (!easing) return;

        // Remove any prior tween
        this.removeTween(identifier);

        // Initialize the tween instance
        const tween = new TweenRuntimeBehavior.MultiTweenInstance(
          timeSource,
          totalDuration,
          easing,
          interpolate,
          initialValue,
          targetedValue,
          setValue,
          onFinish
        );
        this._tweens.set(identifier, tween);
        this._addActiveTween(tween);
      }

      /**
       * Tween exists.
       * @param identifier Unique id to identify the tween
       * @returns The tween exists
       */
      exists(identifier: string): boolean {
        return this._tweens.has(identifier);
      }

      /**
       * Tween is playing.
       * @param identifier Unique id to identify the tween
       */
      isPlaying(identifier: string): boolean {
        const tween = this._tweens.get(identifier);
        return !!tween && tween.isPlaying();
      }

      /**
       * Tween has finished.
       * @param identifier Unique id to identify the tween
       */
      hasFinished(identifier: string): boolean {
        const tween = this._tweens.get(identifier);
        return !!tween && tween.hasFinished();
      }

      /**
       * Pause a tween.
       * @param identifier Unique id to identify the tween
       */
      pauseTween(identifier: string) {
        const tween = this._tweens.get(identifier);
        if (!tween || !tween.isPlaying() || tween.hasFinished()) {
          return;
        }
        this._removeActiveTween(tween);
        tween.pause();
      }

      /**
       * Resume a tween.
       * @param identifier Unique id to identify the tween
       */
      resumeTween(identifier: string) {
        const tween = this._tweens.get(identifier);
        if (!tween || tween.isPlaying() || tween.hasFinished()) {
          return;
        }
        this._addActiveTween(tween);
        tween.resume();
      }

      /**
       * Stop a tween.
       * @param identifier Unique id to identify the tween
       * @param jumpToDest Move to destination
       */
      stopTween(identifier: string, jumpToDest: boolean) {
        const tween = this._tweens.get(identifier);
        if (!tween || tween.hasFinished()) {
          return;
        }
        if (tween.isPlaying()) {
          this._removeActiveTween(tween);
        }
        tween.stop(jumpToDest);
      }

      /**
       * Remove a tween.
       * @param identifier Unique id to identify the tween
       */
      removeTween(identifier: string) {
        const tween = this._tweens.get(identifier);
        if (!tween) {
          return;
        }
        if (tween.isPlaying()) {
          this._removeActiveTween(tween);
        }
        this._tweens.delete(identifier);
      }

      _addActiveTween(tween: TweenInstance): void {
        this._activeTweens.push(tween);
      }

      _removeActiveTween(tween: TweenInstance): void {
        const index = this._activeTweens.findIndex(
          (activeTween) => activeTween === tween
        );
        this._activeTweens.splice(index, 1);
      }

      /**
       * Get tween progress.
       * @param identifier Unique id to identify the tween
       * @returns Progress of playing tween animation (between 0.0 and 1.0)
       */
      getProgress(identifier: string): float {
        const tween = this._tweens.get(identifier);
        if (!tween) {
          return 0;
        }
        return tween.getProgress();
      }

      /**
       * Get tween value.
       *
       * It returns 0 for tweens with several values.
       *
       * @param identifier Unique id to identify the tween
       * @returns Value of playing tween animation
       */
      getValue(identifier: string): float {
        const tween = this._tweens.get(identifier);
        if (!tween) {
          return 0;
        }
        return tween.getValue();
      }
    }

    export interface TimeSource {
      getElapsedTime(): float;
    }

    /**
     * An interpolation function.
     * @ignore
     */
    export type Interpolation = (
      from: float,
      to: float,
      progress: float
    ) => float;

    const noEffect = () => {};

    /**
     * A tween.
     * @ignore
     */
    export interface TweenInstance {
      /**
       * Step toward the end.
       * @param timeDelta the duration from the previous step in seconds
       * @param layoutTimeDelta the duration from the previous step ignoring layer time scale in seconds
       */
      step(): void;
      isPlaying(): boolean;
      hasFinished(): boolean;
      stop(jumpToDest: boolean): void;
      resume(): void;
      pause(): void;
      getProgress(): float;
      getValue(): float;
    }

    /**
     * A tween.
     * @ignore
     */
    export abstract class AbstractTweenInstance implements TweenInstance {
      protected elapsedTime: float;
      protected totalDuration: float;
      protected easing: (progress: float) => float;
      protected interpolate: Interpolation;
      protected onFinish: () => void;
      protected timeSource: TimeSource;
      protected isPaused = false;

      constructor(
        timeSource: TimeSource,
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        onFinish?: (() => void) | null
      ) {
        this.timeSource = timeSource;
        this.totalDuration = totalDuration;
        this.easing = easing;
        this.interpolate = interpolate;
        this.elapsedTime = 0;
        this.onFinish = onFinish || noEffect;
      }

      step(): void {
        if (!this.isPlaying()) {
          return;
        }
        this.elapsedTime = Math.min(
          this.elapsedTime + this.timeSource.getElapsedTime() / 1000,
          this.totalDuration
        );
        this._updateValue();
      }

      protected abstract _updateValue(): void;
      abstract getValue(): float;

      isPlaying(): boolean {
        return !this.isPaused && !this.hasFinished();
      }

      hasFinished(): boolean {
        return this.elapsedTime === this.totalDuration;
      }

      stop(jumpToDest: boolean): void {
        this.elapsedTime = this.totalDuration;
        if (jumpToDest) {
          this._updateValue();
        }
      }

      resume(): void {
        this.isPaused = false;
      }

      pause(): void {
        this.isPaused = true;
      }

      getProgress(): float {
        return this.elapsedTime / this.totalDuration;
      }
    }

    /**
     * A tween with only one value.
     * @ignore
     */
    export class SimpleTweenInstance extends AbstractTweenInstance {
      initialValue: float;
      targetedValue: float;
      setValue: (value: float) => void;
      currentValue: float;

      constructor(
        timeSource: TimeSource,
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        initialValue: float,
        targetedValue: float,
        setValue: (value: float) => void,
        onFinish?: (() => void) | null
      ) {
        super(timeSource, totalDuration, easing, interpolate, onFinish);
        this.initialValue = initialValue;
        this.currentValue = initialValue;
        this.targetedValue = targetedValue;
        this.setValue = setValue;
      }

      protected _updateValue() {
        const easedProgress = this.easing(this.getProgress());
        const value = this.interpolate(
          this.initialValue,
          this.targetedValue,
          easedProgress
        );
        this.currentValue = value;
        this.setValue(value);
        if (this.hasFinished()) {
          this.onFinish();
        }
      }

      getValue(): float {
        return this.currentValue;
      }
    }

    /**
     * A tween with multiple values.
     * @ignore
     */
    export class MultiTweenInstance extends AbstractTweenInstance {
      initialValue: Array<float>;
      targetedValue: Array<float>;
      setValue: (value: Array<float>) => void;

      currentValues = new Array<float>();

      constructor(
        timeSource: TimeSource,
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        initialValue: Array<float>,
        targetedValue: Array<float>,
        setValue: (value: Array<float>) => void,
        onFinish?: (() => void) | null
      ) {
        super(timeSource, totalDuration, easing, interpolate, onFinish);
        this.initialValue = initialValue;
        this.targetedValue = targetedValue;
        this.setValue = setValue;
      }

      protected _updateValue() {
        const easedProgress = this.easing(this.getProgress());
        const length = this.initialValue.length;
        this.currentValues.length = length;
        for (let index = 0; index < length; index++) {
          this.currentValues[index] = this.interpolate(
            this.initialValue[index],
            this.targetedValue[index],
            easedProgress
          );
        }
        this.setValue(this.currentValues);
        if (this.hasFinished()) {
          this.onFinish();
        }
      }

      getValue(): float {
        return 0;
      }
    }
  }
}
