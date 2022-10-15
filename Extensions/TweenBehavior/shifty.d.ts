// Shifty.js 2.16.0 type definitions by arthuro555
declare namespace shifty {
  // index.ts
  type easingFunction = (position: number) => number;
  type startFunction = (state: any, data?: any | undefined) => void;
  type finishFunction = (promisedData: shifty.promisedData) => void;
  /**
   * Gets called for every tick of the tween.  This function is not called on the
   * final tick of the animation.
   */
  type renderFunction = (
    state: any,
    data: any | undefined,
    timeElapsed: number
  ) => void;
  type scheduleFunction = (callback: Function, timeout: number) => void;
  type tweenConfig = {
    /**
     * Starting position.  If omitted, {@link * Tweenable#get} is used.
     */
    from?: any;
    /**
     * Ending position.  The keys of this Object should
     * match those of `to`.
     */
    to?: any;
    /**
     * How many milliseconds to animate for.
     */
    duration?: number;
    /**
     * How many milliseconds to wait before starting the
     * tween.
     */
    delay?: number;
    /**
     * Executes when the tween begins.
     */
    start?: shifty.startFunction;
    /**
     * Executes when the tween
     * completes. This will get overridden by {@link Tweenablethen } if that
     * is called, and it will not fire if {@link Tweenablecancel } is
     * called.
     */
    finish?: shifty.finishFunction;
    /**
     * Executes on every tick. Shifty
     * assumes a [retained mode](https://en.wikipedia.org/wiki/Retained_mode)
     * rendering environment, which in practice means that `render` only gets
     * called when the tween state changes. Importantly, this means that `render`
     * is _not_ called when a tween is not animating (for instance, when it is
     * paused or waiting to start via the `delay` option). This works naturally
     * with DOM environments, but you may need to account for this design in more
     * custom environments such as `<canvas>`.
     *
     * Legacy property name: `step`.
     */
    render?: shifty.renderFunction;
    /**
     * Easing curve name(s) or {@link shifty.easingFunction }(s) to apply
     * to the properties of the tween.  If this is an Object, the keys should
     * correspond to `to`/`from`.  You can learn more about this in the {@tutorial
     * easing-function-in-depth} tutorial.
     */
    easing?: any | string | shifty.easingFunction;
    /**
     * Data that is passed to {@link * shifty.startFunction}, {@link shifty.renderFunction }, and {@link * shifty.promisedData}. Legacy property name: `attachment`.
     */
    data?: any;
    /**
     * Promise constructor for when you want
     * to use Promise library or polyfill Promises in unsupported environments.
     */
    promise?: Function;
  };
  type promisedData = {
    /**
     * The current state of the tween.
     */
    state: any;
    /**
     * The `data` Object that the tween was configured with.
     */
    data: any;
    /**
     * The {@link Tweenable } instance to
     * which the tween belonged.
     */
    tweenable: Tweenable;
  };
  /**
   * Is called when a tween is created to determine if a filter is needed.
   * Filters are only added to a tween when it is created so that they are not
   * unnecessarily processed if they don't apply during an update tick.
   */
  type doesApplyFilter = (tweenable: Tweenable) => boolean;
  /**
   * Is called when a tween is created.  This should perform any setup needed by
   * subsequent per-tick calls to {@link shifty.beforeTween } and {@link * shifty.afterTween}.
   */
  type tweenCreatedFilter = (tweenable: Tweenable) => void;
  /**
   * Is called right before a tween is processed in a tick.
   */
  type beforeTweenFilter = (tweenable: Tweenable) => void;
  /**
   * Is called right after a tween is processed in a tick.
   */
  type afterTweenFilter = (tweenable: Tweenable) => void;
  /**
   * An Object that contains functions that are called at key points in a tween's
   * lifecycle.  Shifty can only process `Number`s internally, but filters can
   * expand support for any type of data.  This is the mechanism that powers
   * [string interpolation]{@tutorial string-interpolation}.
   */
  type filter = {
    /**
     * Is called when a tween is
     * created.
     */
    doesApply: shifty.doesApplyFilter;
    /**
     * Is called when a tween is
     * created.
     */
    tweenCreated: shifty.tweenCreatedFilter;
    /**
     * Is called right before a
     * tween starts.
     */
    beforeTween: shifty.beforeTweenFilter;
    /**
     * Is called right after a tween
     * ends.
     */
    afterTween: shifty.afterTweenFilter;
  };

  // bezier.ts
  export function setBezierFunction(
    name: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): shifty.easingFunction;
  export function unsetBezierFunction(name: string): boolean;

  // easing-function.ts
  export namespace Tweenable {
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
    /**
     * @member Tweenable.formulas
     * @description A static Object of {@link shifty.easingFunction}s that can by
     * used by Shifty. The default values are defined in
     * [`easing-functions.js`](easing-functions.js.html), but you can add your own
     * {@link shifty.easingFunction}s by defining them as keys to this Object.
     *
     * Shifty ships with an implementation of [Robert Penner's easing
     * equations](http://robertpenner.com/easing/), as adapted from
     * [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js)'s
     * implementation.
     * <p data-height="934" data-theme-id="0" data-slug-hash="wqObdO"
     * data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2"
     * data-pen-title="Shifty - Easing formula names" class="codepen">See the Pen <a
     * href="https://codepen.io/jeremyckahn/pen/wqObdO/">Shifty - Easing formula
     * names</a> by Jeremy Kahn (<a
     * href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a
     * href="https://codepen.io">CodePen</a>.</p>
     * <script async
     * src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
     * @type {Object.<shifty.easingFunction>}
     * @static
     */
    export namespace formulas {
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const linear: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInQuad: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutQuad: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutQuad: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInCubic: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutCubic: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutCubic: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInQuart: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutQuart: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutQuart: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInQuint: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutQuint: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutQuint: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInSine: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutSine: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutSine: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInExpo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutExpo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutExpo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInCirc: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutCirc: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutCirc: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutBounce: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInBack: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeOutBack: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeInOutBack: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const elastic: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const swingFromTo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const swingFrom: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const swingTo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const bounce: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const bouncePast: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeFromTo: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeFrom: shifty.easingFunction;
      /**
       * @memberof Tweenable.formulas
       * @type {shifty.easingFunction}
       * @param {number} pos
       * @returns {number}
       */
      export const easeTo: shifty.easingFunction;
    }
  }

  // interpolate.ts
  export function interpolate<T>(
    from: T,
    to: T,
    position: number,
    easing:
      | Record<string, string | shifty.easingFunction>
      | string
      | shifty.easingFunction,
    delay?: number
  ): T;

  // scene.ts
  export class Scene {
    /**
     * The {@link Scene} class provides a way to control groups of {@link
     * Tweenable}s. It is lightweight, minimalistic, and meant to provide
     * performant {@link Tweenable} batch control that users of Shifty
     * might otherwise have to implement themselves. It is **not** a robust
     * timeline solution, and it does **not** provide utilities for sophisticated
     * animation sequencing or orchestration. If that is what you need for your
     * project, consider using a more robust tool such as
     * [Rekapi](http://jeremyckahn.github.io/rekapi/doc/) (a timeline layer built
     * on top of Shifty).
     *
     * Please be aware that {@link Scene} does **not** perform any
     * automatic cleanup. If you want to remove a {@link Tweenable} from a
     * {@link Scene}, you must do so explicitly with either {@link
     * Scene#remove} or {@link Scene#empty}.
     *
     * <p class="codepen" data-height="677" data-theme-id="0" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="qvZKbe" style="height: 677px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Scene Demo">
     * <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/qvZKbe/">
     * Shifty Scene Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
     * on <a href="https://codepen.io">CodePen</a>.</span>
     * </p>
     * <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
     * @param {...Tweenable} tweenables
     * @see https://codepen.io/jeremyckahn/pen/qvZKbe
     * @constructs Scene
     * @memberof shifty
     */
    constructor(...tweenables: Tweenable[]);
    /**
     * A copy of the internal {@link Tweenable}s array.
     * @member Scene#tweenables
     * @type {Array.<Tweenable>}
     */
    get tweenables(): Tweenable[];
    /**
     * The {@link external:Promise}s for all {@link Tweenable}s in this
     * {@link Scene} that have been configured with {@link
     * Tweenable#setConfig}. Note that each call of {@link
     * Scene#play} or {@link Scene#pause} creates new {@link
     * external:Promise}s:
     *
     *     const scene = new Scene(new Tweenable());
     *     scene.play();
     *
     *     Promise.all(scene.promises).then(() =>
     *       // Plays the scene again upon completion, but a new promise is
     *       // created so this line only runs once.
     *       scene.play()
     *     );
     *
     * @member Scene#promises
     * @type {Array.<Promise<any>>}
     */
    get promises(): Promise<any>[];
    /**
     * Add a {@link Tweenable} to be controlled by this {@link
     * Scene}.
     * @method Scene#add
     * @param {Tweenable} tweenable
     * @return {Tweenable} The {@link Tweenable} that was added.
     */
    add(tweenable: Tweenable): Tweenable;
    /**
     * Remove a {@link Tweenable} that is controlled by this {@link
     * Scene}.
     * @method Scene#remove
     * @param {Tweenable} tweenable
     * @return {Tweenable} The {@link Tweenable} that was removed.
     */
    remove(tweenable: Tweenable): Tweenable;
    /**
     * [Remove]{@link Scene#remove} all {@link Tweenable}s in this {@link
     * Scene}.
     * @method Scene#empty
     * @return {Array.<Tweenable>} The {@link Tweenable}s that were
     * removed.
     */
    empty(): Array<Tweenable>;
    /**
     * Is `true` if any {@link Tweenable} in this {@link Scene} is
     * playing.
     * @method Scene#isPlaying
     * @return {boolean}
     */
    isPlaying(): boolean;
    /**
     * Play all {@link Tweenable}s from their beginning.
     * @method Scene#play
     * @return {Scene}
     */
    play(): Scene;
    /**
     * {@link Tweenable#pause} all {@link Tweenable}s in this
     * {@link Scene}.
     * @method Scene#pause
     * @return {Scene}
     */
    pause(): Scene;
    /**
     * {@link Tweenable#resume} all paused {@link Tweenable}s.
     * @method Scene#resume
     * @return {Scene}
     */
    resume(): Scene;
    /**
     * {@link Tweenable#stop} all {@link Tweenable}s in this {@link
     * Scene}.
     * @method Scene#stop
     * @param {boolean} [gotoEnd]
     * @return {Scene}
     */
    stop(gotoEnd?: boolean): Scene;
  }

  // token.ts
  /**
   * @memberof Tweenable.filters.token
   * @param {Tweenable} tweenable
   */
  export function tweenCreated(tweenable: Tweenable): void;
  /**
   * @memberof Tweenable.filters.token
   * @param {Tweenable} tweenable
   */
  export function beforeTween(tweenable: Tweenable): void;
  /**
   * @memberof Tweenable.filters.token
   * @param {Tweenable} tweenable
   */
  export function afterTween(tweenable: Tweenable): void;
  export function doesApply(tweenable: Tweenable): boolean;

  // tweenable.ts
  /**
   * @method shifty.tween
   * @param {shifty.tweenConfig} [config={}]
   * @description Standalone convenience method that functions identically to
   * {@link Tweenable#tween}.  You can use this to create tweens without
   * needing to set up a {@link Tweenable} instance.
   *
   * ```
   * import { tween } from 'shifty';
   *
   * tween({ from: { x: 0 }, to: { x: 10 } }).then(
   *   () => console.log('All done!')
   * );
   * ```
   *
   * @returns {Tweenable} A new {@link Tweenable} instance.
   */
  export function tween(config?: shifty.tweenConfig): Tweenable;
  export function resetList(): void;
  export function getListHead(): Tweenable;
  export function getListTail(): Tweenable;
  export function tweenProps(
    forPosition: number,
    currentState: any,
    originalState: any,
    targetState: any,
    duration: number,
    timestamp: number,
    easing: Record<string, string | Function>
  ): any;
  export function processTweens(): void;
  export function scheduleUpdate(): void;
  export function composeEasingObject(
    fromTweenParams: Record<string, string | Function>,
    easing?: any | string | Function,
    composedEasing?: any
  ): Record<string, string | Function> | Function;
  export class Tweenable {
    /**
     * @method Tweenable.now
     * @static
     * @returns {number} The current timestamp.
     */
    static now: () => number;
    /**
     * @param {Object} [initialState={}] The values that the initial tween should
     * start at if a `from` value is not provided to {@link
     * Tweenable#tween} or {@link Tweenable#setConfig}.
     * @param {shifty.tweenConfig} [config] Configuration object to be passed to
     * {@link Tweenable#setConfig}.
     * @constructs Tweenable
     * @memberof shifty
     */
    constructor(initialState?: any, config?: shifty.tweenConfig);
    /** @private */
    private _config;
    /** @private */
    private _data;
    /** @private */
    private _delay;
    /** @private */
    private _filters;
    /** @private */
    private _next;
    /** @private */
    private _previous;
    /** @private */
    private _timestamp;
    /** @private */
    private _hasEnded;
    /** @private */
    private _resolve;
    /** @private */
    private _reject;
    /** @private */
    private _currentState;
    /** @private */
    private _originalState;
    /** @private */
    private _targetState;
    /** @private */
    private _start;
    /** @private */
    private _render;
    /** @private */
    private _promiseCtor;
    /**
     * Applies a filter to Tweenable instance.
     * @param {string} filterName The name of the filter to apply.
     * @private
     */
    private _applyFilter;
    /**
     * Configure and start a tween. If this {@link Tweenable}'s instance
     * is already running, then it will stop playing the old tween and
     * immediately play the new one.
     * @method Tweenable#tween
     * @param {shifty.tweenConfig} [config] Gets passed to {@link
     * Tweenable#setConfig}.
     * @return {Tweenable}
     */
    tween(config?: shifty.tweenConfig): Tweenable;
    /** @private */
    private _pausedAtTime;
    /**
     * Configure a tween that will start at some point in the future. Aside from
     * `delay`, `from`, and `to`, each configuration option will automatically
     * default to the same option used in the preceding tween of this {@link
     * Tweenable} instance.
     * @method Tweenable#setConfig
     * @param {shifty.tweenConfig} [config={}]
     * @return {Tweenable}
     */
    setConfig(config?: shifty.tweenConfig): Tweenable;
    /** @private */
    private _isPlaying;
    /** @private */
    private _scheduleId;
    /** @private */
    private _duration;
    /** @private */
    private _easing;
    /**
     * Overrides any `finish` function passed via a {@link shifty.tweenConfig}.
     * @method Tweenable#then
     * @param {function} onFulfilled Receives {@link shifty.promisedData} as the
     * first parameter.
     * @param {function} onRejected Receives {@link shifty.promisedData} as the
     * first parameter.
     * @return {Promise<Object>}
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
     */
    then(onFulfilled: Function, onRejected?: Function): Promise<any>;
    /** @private */
    private _promise;
    /**
     * @method Tweenable#catch
     * @param {function} onRejected Receives {@link shifty.promisedData} as the
     * first parameter.
     * @return {Promise<Object>}
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
     */
    catch(onRejected: Function): Promise<any>;
    /**
     * @method Tweenable#get
     * @return {Object} The current state.
     */
    get(): any;
    /**
     * Set the current state.
     * @method Tweenable#set
     * @param {Object} state The state to set.
     */
    set(state: any): void;
    /**
     * Pause a tween. Paused tweens can be resumed from the point at which they
     * were paused. If a tween is not running, this is a no-op.
     * @method Tweenable#pause
     * @return {Tweenable}
     */
    pause(): Tweenable;
    /**
     * Resume a paused tween.
     * @method Tweenable#resume
     * @return {Tweenable}
     */
    resume(): Tweenable;
    /**
     * @private
     * @param {number} currentTime
     * @returns {Tweenable}
     */
    private _resume;
    /**
     * Move the state of the animation to a specific point in the tween's
     * timeline.  If the animation is not running, this will cause {@link
     * shifty.renderFunction} handlers to be called.
     * @method Tweenable#seek
     * @param {number} millisecond The millisecond of the animation to seek
     * to.  This must not be less than `0`.
     * @return {Tweenable}
     */
    seek(millisecond: number): Tweenable;
    /**
     * Stops a tween. If a tween is not running, this is a no-op. This method
     * does not cancel the tween {@link external:Promise}. For that, use {@link
     * Tweenable#cancel}.
     * @param {boolean} [gotoEnd] If `false`, the tween just stops at its current
     * state.  If `true`, the tweened object's values are instantly set to the
     * target values.
     * @method Tweenable#stop
     * @return {Tweenable}
     */
    stop(gotoEnd?: boolean): Tweenable;
    /**
     * {@link Tweenable#stop}s a tween and also `reject`s its {@link
     * external:Promise}. If a tween is not running, this is a no-op. Prevents
     * calling any provided `finish` function.
     * @param {boolean} [gotoEnd] Is propagated to {@link Tweenable#stop}.
     * @method Tweenable#cancel
     * @return {Tweenable}
     * @see https://github.com/jeremyckahn/shifty/issues/122
     */
    cancel(gotoEnd?: boolean): Tweenable;
    /**
     * Whether or not a tween is running.
     * @method Tweenable#isPlaying
     * @return {boolean}
     */
    isPlaying(): boolean;
    /**
     * Whether or not a tween has finished running.
     * @method Tweenable#hasEnded
     * @return {boolean}
     */
    hasEnded(): boolean;
    /**
     * @method Tweenable#setScheduleFunction
     * @param {shifty.scheduleFunction} scheduleFunction
     * @deprecated Will be removed in favor of {@link Tweenable.setScheduleFunction} in 3.0.
     */
    setScheduleFunction(scheduleFunction: shifty.scheduleFunction): void;
    /**
     * Get and optionally set the data that gets passed as `data` to {@link
     * shifty.promisedData}, {@link shifty.startFunction} and {@link
     * shifty.renderFunction}.
     * @param {Object} [data]
     * @method Tweenable#data
     * @return {Object} The internally stored `data`.
     */
    data(data?: any): any;
    /**
     * `delete` all "own" properties.  Call this when the {@link
     * Tweenable} instance is no longer needed to free memory.
     * @method Tweenable#dispose
     */
    dispose(): void;
  }
  export namespace Tweenable {
    /**
     * Set a custom schedule function.
     *
     * By default,
     * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
     * is used if available, otherwise
     * [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout)
     * is used.
     * @method Tweenable.setScheduleFunction
     * @param {shifty.scheduleFunction} fn The function to be
     * used to schedule the next frame to be rendered.
     * @return {shifty.scheduleFunction} The function that was set.
     */
    export function setScheduleFunction(fn: scheduleFunction): scheduleFunction;
    export const filters: Record<string, shifty.filter>;
  }
}
