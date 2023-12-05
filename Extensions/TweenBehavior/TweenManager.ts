namespace gdjs {
  export namespace evtTools {
    export namespace tween {
      /**
       * A tween manager that is used for layout tweens or object tweens.
       * @ignore
       */
      export class TweenManager {
        /**
         * All the tweens of a layout or a behavior.
         */
        private _tweens = new Map<string, TweenInstance>();
        /**
         * Allow fast iteration on tween that are active.
         */
        private _activeTweens = new Array<TweenInstance>();

        constructor() {}

        /**
         * Make all active tween step toward the end.
         * @param timeDelta the duration from the previous step in seconds
         * @param layoutTimeDelta the duration from the previous step ignoring layer time scale in seconds
         */
        step(): void {
          let writeIndex = 0;
          for (
            let readIndex = 0;
            readIndex < this._activeTweens.length;
            readIndex++
          ) {
            const tween = this._activeTweens[readIndex];

            tween.step();
            if (!tween.hasFinished()) {
              this._activeTweens[writeIndex] = tween;
              writeIndex++;
            }
          }
          this._activeTweens.length = writeIndex;
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
          const tween = new SimpleTweenInstance(
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
          const tween = new MultiTweenInstance(
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

      export const rgbToHsl = (r: number, g: number, b: number): number[] => {
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
      };

      export const hslToRgb = (h: number, s: number, l: number): number[] => {
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
      };

      /**
       * Tween between 2 values according to an easing function.
       * @param fromValue Start value
       * @param toValue End value
       * @param easingValue Type of easing
       * @param weighting from 0 to 1
       */
      export const ease = (
        easingValue: string,
        fromValue: float,
        toValue: float,
        weighting: float
      ) => {
        // This local declaration is needed because otherwise the transpiled
        // code doesn't know it.
        const easingFunctions = gdjs.evtTools.tween.easingFunctions;

        const easingFunction = easingFunctions.hasOwnProperty(easingValue)
          ? easingFunctions[easingValue]
          : easingFunctions.linear;
        return fromValue + (toValue - fromValue) * easingFunction(weighting);
      };

      export type EasingFunction = (progress: float) => float;

      /*!
       * All equations are adapted from Thomas Fuchs'
       * [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js).
       *
       * Based on Easing Equations (c) 2003 [Robert
       * Penner](http://www.robertpenner.com/), all rights reserved. This work is
       * [subject to terms](http://www.robertpenner.com/easing_terms_of_use.html).
       */

      /*!
       *  TERMS OF USE - EASING EQUATIONS
       *  Open source under the BSD License.
       *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
       */

      /*! Shifty 3.0.3 - https://github.com/jeremyckahn/shifty */
      export const easingFunctions: Record<string, EasingFunction> = {
        linear: (pos: number) => pos,

        easeInQuad: (pos: number) => Math.pow(pos, 2),

        easeOutQuad: (pos: number) => -(Math.pow(pos - 1, 2) - 1),

        easeInOutQuad: (pos: number) =>
          (pos /= 0.5) < 1
            ? 0.5 * Math.pow(pos, 2)
            : -0.5 * ((pos -= 2) * pos - 2),

        easeInCubic: (pos: number) => Math.pow(pos, 3),

        easeOutCubic: (pos: number) => Math.pow(pos - 1, 3) + 1,

        easeInOutCubic: (pos: number) =>
          (pos /= 0.5) < 1
            ? 0.5 * Math.pow(pos, 3)
            : 0.5 * (Math.pow(pos - 2, 3) + 2),

        easeInQuart: (pos: number) => Math.pow(pos, 4),

        easeOutQuart: (pos: number) => -(Math.pow(pos - 1, 4) - 1),

        easeInOutQuart: (pos: number) =>
          (pos /= 0.5) < 1
            ? 0.5 * Math.pow(pos, 4)
            : -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2),

        easeInQuint: (pos: number) => Math.pow(pos, 5),

        easeOutQuint: (pos: number) => Math.pow(pos - 1, 5) + 1,

        easeInOutQuint: (pos: number) =>
          (pos /= 0.5) < 1
            ? 0.5 * Math.pow(pos, 5)
            : 0.5 * (Math.pow(pos - 2, 5) + 2),

        easeInSine: (pos: number) => -Math.cos(pos * (Math.PI / 2)) + 1,

        easeOutSine: (pos: number) => Math.sin(pos * (Math.PI / 2)),

        easeInOutSine: (pos: number) => -0.5 * (Math.cos(Math.PI * pos) - 1),

        easeInExpo: (pos: number) =>
          pos === 0 ? 0 : Math.pow(2, 10 * (pos - 1)),

        easeOutExpo: (pos: number) =>
          pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1,

        easeInOutExpo: (pos: number) => {
          if (pos === 0) {
            return 0;
          }

          if (pos === 1) {
            return 1;
          }

          if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow(2, 10 * (pos - 1));
          }

          return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },

        easeInCirc: (pos: number) => -(Math.sqrt(1 - pos * pos) - 1),

        easeOutCirc: (pos: number) => Math.sqrt(1 - Math.pow(pos - 1, 2)),

        easeInOutCirc: (pos: number) =>
          (pos /= 0.5) < 1
            ? -0.5 * (Math.sqrt(1 - pos * pos) - 1)
            : 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1),

        easeOutBounce: (pos: number) => {
          if (pos < 1 / 2.75) {
            return 7.5625 * pos * pos;
          } else if (pos < 2 / 2.75) {
            return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
          } else if (pos < 2.5 / 2.75) {
            return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
          } else {
            return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
          }
        },

        easeInBack: (pos: number) => {
          const s = 1.70158;
          return pos * pos * ((s + 1) * pos - s);
        },

        easeOutBack: (pos: number) => {
          const s = 1.70158;
          return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
        },

        easeInOutBack: (pos: number) => {
          let s = 1.70158;
          if ((pos /= 0.5) < 1) {
            return 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s));
          }
          return 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
        },

        elastic: (pos: number) =>
          -1 *
            Math.pow(4, -8 * pos) *
            Math.sin(((pos * 6 - 1) * (2 * Math.PI)) / 2) +
          1,

        swingFromTo: (pos: number) => {
          let s = 1.70158;
          return (pos /= 0.5) < 1
            ? 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s))
            : 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
        },

        swingFrom: (pos: number) => {
          const s = 1.70158;
          return pos * pos * ((s + 1) * pos - s);
        },

        swingTo: (pos: number) => {
          const s = 1.70158;
          return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
        },

        bounce: (pos: number) => {
          if (pos < 1 / 2.75) {
            return 7.5625 * pos * pos;
          } else if (pos < 2 / 2.75) {
            return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
          } else if (pos < 2.5 / 2.75) {
            return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
          } else {
            return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
          }
        },

        bouncePast: (pos: number) => {
          if (pos < 1 / 2.75) {
            return 7.5625 * pos * pos;
          } else if (pos < 2 / 2.75) {
            return 2 - (7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75);
          } else if (pos < 2.5 / 2.75) {
            return 2 - (7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375);
          } else {
            return 2 - (7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375);
          }
        },

        easeFromTo: (pos: number) =>
          (pos /= 0.5) < 1
            ? 0.5 * Math.pow(pos, 4)
            : -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2),

        easeFrom: (pos: number) => Math.pow(pos, 4),

        easeTo: (pos: number) => Math.pow(pos, 0.25),
      };
    }
  }
}
