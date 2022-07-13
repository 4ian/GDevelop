/// <reference path="shifty.d.ts" />
namespace gdjs {
  interface IScaleable extends RuntimeObject {
    setScaleX(x: number): void;
    setScaleY(y: number): void;
    getScaleX(): number;
    getScaleY(): number;
  }

  interface IOpaque extends RuntimeObject {
    setOpacity(opacity: number): void;
    getOpacity(): number;
  }

  interface IColorable extends RuntimeObject {
    setColor(color: string): void;
    getColor(): string;
  }

  interface ICharacterScaleable extends RuntimeObject {
    setCharacterSize(characterSize: number): void;
    getCharacterSize(): number;
  }

  function isScaleable(o: RuntimeObject): o is IScaleable {
    //@ts-ignore We are checking if the methods are present.
    return o.setScaleX && o.setScaleY && o.getScaleX && o.getScaleY;
  }

  function isOpaque(o: RuntimeObject): o is IOpaque {
    //@ts-ignore We are checking if the methods are present.
    return o.setOpacity && o.getOpacity;
  }

  function isColorable(o: RuntimeObject): o is IColorable {
    //@ts-ignore We are checking if the methods are present.
    return o.setColor && o.getColor;
  }

  function isCharacterScaleable(o: RuntimeObject): o is ICharacterScaleable {
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

  export class TweenRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _tweens: Record<string, TweenRuntimeBehavior.TweenInstance> = {};
    private _runtimeScene: gdjs.RuntimeScene;
    private _isActive: boolean = true;

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

    updateFromBehaviorData(
      oldBehaviorData: BehaviorData,
      newBehaviorData: BehaviorData
    ): boolean {
      // Nothing to update.
      return true;
    }

    onDestroy() {
      const shiftyJsScene = this._runtimeScene.shiftyJsScene;
      if (!shiftyJsScene) return;

      // Stop and delete all tweens of the behavior - otherwise they could:
      // - continue to point to the behavior, and so to the object (memory leak),
      // - affect the object in case it's recycled (wrong/hard to debug behavior).
      for (const identifier in this._tweens) {
        this._tweens[identifier].instance.stop();
        shiftyJsScene.remove(this._tweens[identifier].instance);
      }
    }

    private _addTween(
      identifier: string,
      easingValue: string,
      tweenConfig: shifty.tweenConfig,
      startTime: number,
      totalDuration: number,
      destroyObjectWhenFinished: boolean
    ): void {
      if (!this._isActive || !!TweenRuntimeBehavior.easings[easingValue])
        return;

      // Remove any prior tween
      if (this._tweenExists(identifier)) this.removeTween(identifier);

      // Initialize the tween instance
      const tweenable = new shifty.Tweenable();
      this._tweens[identifier] = new TweenRuntimeBehavior.TweenInstance(
        tweenable,
        false,
        startTime,
        totalDuration
      );

      // Attach it to the scene as it will become active and active tweens should be on the scene.
      if (!this._runtimeScene.shiftyJsScene)
        this._runtimeScene.shiftyJsScene = new shifty.Scene();
      this._runtimeScene.shiftyJsScene.add(tweenable);

      // Start the tween and set the needed callbacks
      tweenable
        .tween(tweenConfig)
        .then(() => {
          if (this._tweens[identifier])
            this._tweens[identifier].hasFinished = true;

          if (destroyObjectWhenFinished)
            this.owner.deleteFromScene(this._runtimeScene);
        })
        .catch((e) => {});
    }

    private _tweenExists(identifier: string): boolean {
      return !!this._tweens[identifier];
    }

    private _tweenIsPlaying(identifier: string): boolean {
      return (
        this._tweens[identifier] &&
        this._tweens[identifier].instance.isPlaying()
      );
    }

    private _pauseTween(identifier: string): void {
      const tween = this._tweens[identifier];

      // Pause the tween, and remove it from the scene of living tweens
      // (the invariant is that scene only contains tweens being played).
      tween.instance.pause();

      const shiftyJsScene = this._runtimeScene.shiftyJsScene;
      if (shiftyJsScene) {
        shiftyJsScene.remove(tween.instance);
      }
    }

    private _resumeTween(identifier: string): void {
      const tween = this._tweens[identifier];

      // Resume the tween, and add it back to the scene of living tweens
      // (the invariant is that scene only contains tweens being played).
      tween.instance.resume();

      const shiftyJsScene = this._runtimeScene.shiftyJsScene;
      if (shiftyJsScene) {
        shiftyJsScene.add(tween.instance);
      }
    }

    private _stopTween(identifier: string, jumpToDest: boolean): void {
      this._tweens[identifier].instance.stop(jumpToDest);
    }

    private _tweenHasFinished(identifier: string): boolean {
      return this._tweens[identifier].hasFinished;
    }

    /**
     * Add an object variable tween.
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param fromValue Start value
     * @param toValue End value
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween(
      identifier: string,
      variable: gdjs.Variable,
      fromValue: float,
      toValue: float,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addTween(
        identifier,
        easingValue,
        {
          from: { value: fromValue },
          to: { value: toValue },
          duration: durationValue,
          easing: easingValue,
          render: (state) => variable.setNumber(state.value),
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object position tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { x: this.owner.getX(), y: this.owner.getY() },
          to: { x: toX, y: toY },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            this.owner.setX(state.x);
            this.owner.setY(state.y);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object X position tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { x: this.owner.getX() },
          to: { x: toX },
          duration: durationValue,
          easing: easingValue,
          render: (state) => this.owner.setX(state.x),
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object Y position tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { y: this.owner.getY() },
          to: { y: toY },
          duration: durationValue,
          easing: easingValue,
          render: (state) => this.owner.setY(state.y),
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object angle tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { angle: this.owner.getAngle() },
          to: { angle: toAngle },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            this.owner.setAngle(state.angle);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object scale tween.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      // Cast to IScaleable
      if (!isScaleable(this.owner)) return;
      const owner = this.owner;

      if (toScaleX < 0) toScaleX = 0;
      if (toScaleY < 0) toScaleY = 0;

      const renderFunction = scaleFromCenterOfObject
        ? (state) => {
            const oldX = owner.getCenterXInScene();
            const oldY = owner.getCenterYInScene();
            owner.setScaleX(state.scaleX);
            owner.setScaleY(state.scaleY);
            owner.setCenterPositionInScene(oldX, oldY);
          }
        : (state) => {
            owner.setScaleX(state.scaleX);
            owner.setScaleY(state.scaleY);
          };

      this._addTween(
        identifier,
        easingValue,
        {
          from: {
            scaleX: owner.getScaleX(),
            scaleY: owner.getScaleY(),
          },
          to: { scaleX: toScaleX, scaleY: toScaleY },
          duration: durationValue,
          easing: easingValue,
          render: renderFunction,
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object X-scale tween.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      // Cast to IScaleable
      if (!isScaleable(this.owner)) return;
      const owner = this.owner;

      const stepFunction = scaleFromCenterOfObject
        ? (state) => {
            const oldX = owner.getCenterXInScene();
            owner.setScaleX(state.scaleX);
            owner.setCenterXInScene(oldX);
          }
        : (state) => owner.setScaleX(state.scaleX);

      this._addTween(
        identifier,
        easingValue,
        {
          from: { scaleX: owner.getScaleX() },
          to: { scaleX: toScaleX },
          duration: durationValue,
          easing: easingValue,
          render: stepFunction,
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object scale y tween.
     * @param identifier Unique id to identify the tween
     * @param toScaleY The target Y-scale
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      // Cast to IScaleable
      if (!isScaleable(this.owner)) return;
      const owner = this.owner;

      const stepFunction = scaleFromCenterOfObject
        ? (state) => {
            const oldY = owner.getCenterYInScene();
            owner.setScaleY(state.scaleY);
            owner.setCenterYInScene(oldY);
          }
        : (state) => owner.setScaleY(state.scaleY);

      this._addTween(
        identifier,
        easingValue,
        {
          from: { scaleY: owner.getScaleY() },
          to: { scaleY: toScaleY },
          duration: durationValue,
          easing: easingValue,
          render: stepFunction,
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object opacity tween.
     * @param identifier Unique id to identify the tween
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
      if (!isOpaque(this.owner)) return;
      const owner = this.owner;

      this._addTween(
        identifier,
        easingValue,
        {
          from: { opacity: owner.getOpacity() },
          to: { opacity: toOpacity },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            owner.setOpacity(state.opacity);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object color tween.
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target color
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param useHSLColorTransition Tween using HSL color mappings, rather than direct RGB line
     */
    addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean
    ) {
      if (
        !isColorable(this.owner) ||
        !toColorStr.match(
          '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
        )
      )
        return;
      const owner = this.owner;

      const rgbFromColor: string[] = this.owner.getColor().split(';');
      const rgbToColor: string[] = toColorStr.split(';');
      if (rgbToColor.length !== 3) return;

      let config: shifty.tweenConfig;
      if (useHSLColorTransition) {
        const hslFromColor = rgbToHsl(
          parseFloat(rgbFromColor[0]),
          parseFloat(rgbFromColor[1]),
          parseFloat(rgbFromColor[2])
        );
        const hslToColor = rgbToHsl(
          parseFloat(rgbToColor[0]),
          parseFloat(rgbToColor[1]),
          parseFloat(rgbToColor[2])
        );

        config = {
          from: {
            hue: hslFromColor[0],
            saturation: hslFromColor[1],
            lightness: hslFromColor[2],
          },
          to: {
            hue: hslToColor[0],
            saturation: hslToColor[1],
            lightness: hslToColor[2],
          },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            const rgbFromHslColor = hslToRgb(
              state.hue,
              state.saturation,
              state.lightness
            );
            owner.setColor(
              Math.floor(rgbFromHslColor[0]) +
                ';' +
                Math.floor(rgbFromHslColor[1]) +
                ';' +
                Math.floor(rgbFromHslColor[2])
            );
          },
        };
      } else {
        config = {
          from: {
            red: rgbFromColor[0],
            green: rgbFromColor[1],
            blue: rgbFromColor[2],
          },
          to: { red: rgbToColor[0], green: rgbToColor[1], blue: rgbToColor[2] },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            owner.setColor(
              Math.floor(state.red) +
                ';' +
                Math.floor(state.green) +
                ';' +
                Math.floor(state.blue)
            );
          },
        };
      }

      this._addTween(
        identifier,
        easingValue,
        config,
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object color HSL tween, with the "to" color given using HSL (H: any number, S and L: 0-100).
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue, include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toHue The target lightness, or the same as the from color's lightness if blank
     * @param easingValue Type of easing
     * @param durationValue Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorHSLTween(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easingValue: string,
      durationValue: float,
      destroyObjectWhenFinished: boolean
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

      this._addTween(
        identifier,
        easingValue,
        {
          from: {
            hue: hslFromColor[0],
            saturation: hslFromColor[1],
            lightness: hslFromColor[2],
          },
          to: {
            hue: toH,
            saturation: toS,
            lightness: toL,
          },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            const rgbFromHslColor = hslToRgb(
              state.hue,
              state.saturation,
              state.lightness
            );

            owner.setColor(
              Math.floor(rgbFromHslColor[0]) +
                ';' +
                Math.floor(rgbFromHslColor[1]) +
                ';' +
                Math.floor(rgbFromHslColor[2])
            );
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add a text object character size tween.
     * @param identifier Unique id to identify the tween
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
      if (!isCharacterScaleable(this.owner)) return;
      const owner = this.owner;

      this._addTween(
        identifier,
        easingValue,
        {
          from: { size: owner.getCharacterSize() },
          to: { size: toSize },
          duration: durationValue,
          easing: easingValue,
          render: function step(state) {
            owner.setCharacterSize(state.size);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object width tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { width: this.owner.getWidth() },
          to: { width: toWidth },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            this.owner.setWidth(state.width);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Add an object height tween.
     * @param identifier Unique id to identify the tween
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
      this._addTween(
        identifier,
        easingValue,
        {
          from: { height: this.owner.getHeight() },
          to: { height: toHeight },
          duration: durationValue,
          easing: easingValue,
          render: (state) => {
            this.owner.setHeight(state.height);
          },
        },
        this._runtimeScene.getTimeManager().getTimeFromStart(),
        durationValue,
        destroyObjectWhenFinished
      );
    }

    /**
     * Tween is playing.
     * @param identifier Unique id to identify the tween
     */
    isPlaying(identifier: string): boolean {
      return this._tweenExists(identifier) && this._tweenIsPlaying(identifier);
    }

    /**
     * Tween exists.
     * @param identifier Unique id to identify the tween
     * @returns The tween exists
     */
    exists(identifier: string): boolean {
      return this._tweenExists(identifier);
    }

    /**
     * Tween has finished.
     * @param identifier Unique id to identify the tween
     */
    hasFinished(identifier: string): boolean {
      return (
        this._tweenExists(identifier) && this._tweenHasFinished(identifier)
      );
    }

    /**
     * Pause a tween.
     * @param identifier Unique id to identify the tween
     */
    pauseTween(identifier: string) {
      if (
        this._isActive &&
        this._tweenExists(identifier) &&
        this._tweenIsPlaying(identifier)
      )
        this._pauseTween(identifier);
    }

    /**
     * Stop a tween.
     * @param identifier Unique id to identify the tween
     * @param jumpToDest Move to destination
     */
    stopTween(identifier: string, jumpToDest: boolean) {
      if (
        this._isActive &&
        this._tweenExists(identifier) &&
        this._tweenIsPlaying(identifier)
      )
        this._stopTween(identifier, jumpToDest);
    }

    /**
     * Resume a tween.
     * @param identifier Unique id to identify the tween
     */
    resumeTween(identifier: string) {
      if (
        this._isActive &&
        this._tweenExists(identifier) &&
        !this._tweenIsPlaying(identifier)
      )
        this._resumeTween(identifier);
    }

    /**
     * Remove a tween.
     * @param identifier Unique id to identify the tween
     */
    removeTween(identifier: string) {
      if (!this._tweenExists(identifier)) return;

      this._tweens[identifier].instance.stop();
      if (this._runtimeScene.shiftyJsScene)
        this._runtimeScene.shiftyJsScene.remove(
          this._tweens[identifier].instance
        );
      delete this._tweens[identifier];
    }

    /**
     * Get tween progress.
     * @param identifier Unique id to identify the tween
     * @returns Progress of playing tween animation (between 0.0 and 1.0)
     */
    getProgress(identifier: string): float {
      const tween = this._tweens[identifier];
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

    static _currentTweenTime = 0;
  }
  gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);

  export namespace TweenRuntimeBehavior {
    /**
     * A tween being played in a behavior.
     * @ignore
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
}
