/*
GDevelop - Tween Behavior Extension
Copyright (c) 2010-2023 Florian Rival (Florian.Rival@gmail.com)
 */
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

  const linearInterpolation = gdjs.evtTools.common.lerp;
  const exponentialInterpolation =
    gdjs.evtTools.common.exponentialInterpolation;

  // TODO EBO Rewrite this behavior to use standard method to step.
  // This could also fix layer time scale that seems to be ignored.
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
      const timeDelta = this.owner.getElapsedTime() / 1000;
      this._tweens.step(timeDelta);
    }

    private _deleteFromScene() {
      this.owner.deleteFromScene(this.owner.getInstanceContainer());
    }

    /**
     * Add an object variable tween.
     * @deprecated Use addVariableTween2 instead.
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
     * Tween an object position.
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
      this._tweens.addMultiTween(
        identifier,
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
      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      // Cast to IScaleable
      const owner = this.owner;
      if (!isScaleable(owner)) return;

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
        duration / 1000,
        easing,
        exponentialInterpolation,

        [owner.getScaleX(), owner.getScaleY()],
        [toScaleX, toScaleY],
        setValue,

        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object X-scale.
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
      // Cast to IScaleable
      const owner = this.owner;
      if (!isScaleable(owner)) return;

      const setValue = scaleFromCenterOfObject
        ? (scaleX: float) => {
            const oldX = owner.getCenterXInScene();
            owner.setScaleX(scaleX);
            owner.setCenterXInScene(oldX);
          }
        : (scaleX: float) => owner.setScaleX(scaleX);

      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
        easing,
        exponentialInterpolation,
        owner.getScaleX(),
        toScaleX,
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Y-scale.
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
      // Cast to IScaleable
      const owner = this.owner;
      if (!isScaleable(owner)) return;

      const setValue = scaleFromCenterOfObject
        ? (scaleY: float) => {
            const oldY = owner.getCenterYInScene();
            owner.setScaleY(scaleY);
            owner.setCenterYInScene(oldY);
          }
        : (scaleY: float) => owner.setScaleY(scaleY);

      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
        easing,
        exponentialInterpolation,
        owner.getScaleY(),
        toScaleY,
        setValue,
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object opacity.
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
      const owner = this.owner;
      if (!isOpaque(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      if (
        !isColorable(this.owner) ||
        !toColorStr.match(
          '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);){2}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
        )
      )
        return;
      const owner = this.owner;

      // TODO Check if there is an helper method for this.
      const rgbFromColor: float[] = this.owner
        .getColor()
        .split(';')
        .map(parseFloat);
      const rgbToColor: float[] = toColorStr.split(';').map(parseFloat);
      if (rgbToColor.length !== 3) return;

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
        duration / 1000,
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
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue, include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toHue The target lightness, or the same as the from color's lightness if blank
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
        duration / 1000,
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
      const owner = this.owner;
      if (!isCharacterScaleable(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
        easing,
        linearInterpolation,
        owner.getCharacterSize(),
        toSize,
        (value: float) => owner.setCharacterSize(value),
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object width.
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
      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      this._tweens.addSimpleTween(
        identifier,
        duration / 1000,
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
      return this._tweens[identifier].getProgress();
    }

    onDeActivate() {
      if (!this._isActive) {
        return;
      }
      for (const key in this._tweens) {
        if (this._tweens.hasOwnProperty(key)) {
          const tween = this._tweens[key];
          if (tween.isPlaying()) {
            tween.resumeOnActivate = true;
            this.pauseTween(key);
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
            this.resumeTween(key);
          }
        }
      }
      this._isActive = true;
    }
  }
  gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);

  export namespace TweenRuntimeBehavior {
    export const easingFunctions: Record<string, shifty.easingFunction> = {
      linear: shifty.Tweenable.formulas.linear,
      easeInQuad: shifty.Tweenable.formulas.easeInQuad,
      easeOutQuad: shifty.Tweenable.formulas.easeOutQuad,
      easeInOutQuad: shifty.Tweenable.formulas.easeInOutQuad,
      easeInCubic: shifty.Tweenable.formulas.easeInCubic,
      easeOutCubic: shifty.Tweenable.formulas.easeOutCubic,
      easeInOutCubic: shifty.Tweenable.formulas.easeInOutCubic,
      easeInQuart: shifty.Tweenable.formulas.easeInQuart,
      easeOutQuart: shifty.Tweenable.formulas.easeOutQuart,
      easeInOutQuart: shifty.Tweenable.formulas.easeInOutQuart,
      easeInQuint: shifty.Tweenable.formulas.easeInQuint,
      easeOutQuint: shifty.Tweenable.formulas.easeOutQuint,
      easeInOutQuint: shifty.Tweenable.formulas.easeInOutQuint,
      easeInSine: shifty.Tweenable.formulas.easeInSine,
      easeOutSine: shifty.Tweenable.formulas.easeOutSine,
      easeInOutSine: shifty.Tweenable.formulas.easeInOutSine,
      easeInExpo: shifty.Tweenable.formulas.easeInExpo,
      easeOutExpo: shifty.Tweenable.formulas.easeOutExpo,
      easeInOutExpo: shifty.Tweenable.formulas.easeInOutExpo,
      easeInCirc: shifty.Tweenable.formulas.easeInCirc,
      easeOutCirc: shifty.Tweenable.formulas.easeOutCirc,
      easeInOutCirc: shifty.Tweenable.formulas.easeInOutCirc,
      easeOutBounce: shifty.Tweenable.formulas.easeOutBounce,
      easeInBack: shifty.Tweenable.formulas.easeInBack,
      easeOutBack: shifty.Tweenable.formulas.easeOutBack,
      easeInOutBack: shifty.Tweenable.formulas.easeInOutBack,
      elastic: shifty.Tweenable.formulas.elastic,
      swingFromTo: shifty.Tweenable.formulas.swingFromTo,
      swingFrom: shifty.Tweenable.formulas.swingFrom,
      swingTo: shifty.Tweenable.formulas.swingTo,
      bounce: shifty.Tweenable.formulas.bounce,
      bouncePast: shifty.Tweenable.formulas.bouncePast,
      easeFromTo: shifty.Tweenable.formulas.easeFromTo,
      easeFrom: shifty.Tweenable.formulas.easeFrom,
      easeTo: shifty.Tweenable.formulas.easeTo,
    };

    export class TweenManager {
      private _tweens = new Map<string, TweenRuntimeBehavior.TweenInstance>();
      private _activeTweens = new Array<TweenRuntimeBehavior.TweenInstance>();

      /**
       * @param instanceContainer The instance container the behavior belongs to.
       */
      constructor() {}

      updateFromBehaviorData(
        oldBehaviorData: BehaviorData,
        newBehaviorData: BehaviorData
      ): boolean {
        // Nothing to update.
        return true;
      }

      step(timeDelta: float): void {
        for (const tween of this._activeTweens) {
          tween.step(timeDelta);
        }
      }

      addSimpleTween(
        identifier: string,
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

      addMultiTween(
        identifier: string,
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
        return this._tweens[identifier].getProgress();
      }
    }

    export type Interpolation = (
      from: float,
      to: float,
      progress: float
    ) => float;

    const noEffect = () => {};

    /**
     * A tween being played in a behavior.
     * @ignore
     */
    export interface TweenInstance {
      step(timeDelta: float): void;
      isPlaying(): boolean;
      hasFinished(): boolean;
      stop(jumpToDest: boolean): void;
      resume(): void;
      pause(): void;
      getProgress(): float;
    }

    /**
     * A tween being played in a behavior.
     * @ignore
     */
    export abstract class AbstractTweenInstance implements TweenInstance {
      protected elapsedTime: float;
      protected totalDuration: float;
      protected easing: (progress: float) => float;
      protected onFinish: () => void;
      protected isPaused = false;
      // TODO
      protected isStopped = false;
      // TODO
      protected resumeOnActivate: boolean = false;
      protected interpolate: Interpolation;

      constructor(
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        onFinish?: (() => void) | null
      ) {
        this.totalDuration = totalDuration;
        this.easing = easing;
        this.interpolate = interpolate;
        this.elapsedTime = 0;
        this.onFinish = onFinish || noEffect;
      }

      abstract step(timeDelta: number): void;

      isPlaying(): boolean {
        return !this.isPaused && !this.hasFinished();
      }

      hasFinished(): boolean {
        return this.elapsedTime === this.totalDuration;
      }

      stop(jumpToDest: boolean): void {
        if (jumpToDest) {
          this.elapsedTime = this.totalDuration;
        }
        // TODO check what it should do.
        this.isStopped = true;
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
     * A tween being played in a behavior.
     * @ignore
     */
    export class SimpleTweenInstance extends AbstractTweenInstance {
      initialValue: float;
      targetedValue: float;
      setValue: (value: float) => void;

      constructor(
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        initialValue: float,
        targetedValue: float,
        setValue: (value: float) => void,
        onFinish?: (() => void) | null
      ) {
        super(totalDuration, easing, interpolate, onFinish);
        this.initialValue = initialValue;
        this.targetedValue = targetedValue;
        this.setValue = setValue;
      }

      step(timeDelta: number) {
        if (!this.isPlaying()) {
          return;
        }
        this.elapsedTime = Math.min(
          this.elapsedTime + timeDelta,
          this.totalDuration
        );
        const easedProgress = this.easing(this.getProgress());
        const value = this.interpolate(
          this.initialValue,
          this.targetedValue,
          easedProgress
        );
        this.setValue(value);
        if (this.hasFinished()) {
          this.onFinish();
        }
      }
    }

    /**
     * A tween being played in a behavior.
     * @ignore
     */
    export class MultiTweenInstance extends AbstractTweenInstance {
      initialValue: Array<float>;
      targetedValue: Array<float>;
      setValue: (value: Array<float>) => void;

      currentValues = new Array<float>();

      constructor(
        totalDuration: float,
        easing: (progress: float) => float,
        interpolate: Interpolation,
        initialValue: Array<float>,
        targetedValue: Array<float>,
        setValue: (value: Array<float>) => void,
        onFinish?: (() => void) | null
      ) {
        super(totalDuration, easing, interpolate, onFinish);
        this.initialValue = initialValue;
        this.targetedValue = targetedValue;
        this.setValue = setValue;
      }

      step(timeDelta: number) {
        if (!this.isPlaying()) {
          return;
        }
        this.elapsedTime = Math.min(
          this.elapsedTime + timeDelta,
          this.totalDuration
        );
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
      }
    }
  }
}
