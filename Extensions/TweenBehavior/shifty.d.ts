// Shifty.js 2.16.0 type definitions by arthuro555
declare namespace shifty {
  // index.js

  type easingFunction = (position: number) => number;
  type startFunction = (state: any, data?: any) => any;
  type finishFunction = (promisedData: shifty.promisedData) => any;
  /**
   * Gets called for every tick of the tween.  This function is not called on the
   * final tick of the animation.
   */
  type renderFunction = (
    state: any,
    data: any | undefined,
    timeElapsed: number
  ) => any;
  type scheduleFunction = (callback: Function, timeout: number) => any;
  interface tweenConfig {
    /**
     * Starting position.  If omitted, {@link * shifty.Tweenable#get} is used.
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
     * completes. This will get overridden by {@link shifty.Tweenablethen } if that
     * is called, and it will not fire if {@link shifty.Tweenablecancel } is
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
    easing?: Record<string, easingFunction> | string | easingFunction;
    /**
     * Data that is passed to {@link * shifty.startFunction}, {@link shifty.renderFunction }, and {@link * shifty.promisedData}. Legacy property name: `attachment`.
     */
    data?: any;
    /**
     * Promise constructor for when you want
     * to use Promise library or polyfill Promises in unsupported environments.
     */
    promise?: Function;
  }
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
     * The {@link shifty.Tweenable } instance to
     * which the tween belonged.
     */
    tweenable: Tweenable;
  };
  /**
   * Is called when a tween is created to determine if a filter is needed.
   * Filters are only added to a tween when it is created so that they are not
   * unnecessarily processed if they don't apply during an update tick.
   */
  type doesApplyFilter = (tweenable: any) => boolean;
  /**
   * Is called when a tween is created.  This should perform any setup needed by
   * subsequent per-tick calls to {@link shifty.beforeTween } and {@link * shifty.afterTween}.
   */
  type tweenCreatedFilter = (tweenable: any) => any;
  /**
   * Is called right before a tween is processed in a tick.
   */
  type beforeTweenFilter = (tweenable: any) => any;
  /**
   * Is called right after a tween is processed in a tick.
   */
  type afterTweenFilter = (tweenable: any) => any;
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

  // bezier.js

  export function setBezierFunction(
    name: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): any;
  export function unsetBezierFunction(name: string): boolean;

  // interpolate.js

  export function interpolate<T extends Object>(
    from: T,
    to: T,
    position: number,
    easing: Record<string, easingFunction> | string | easingFunction,
    delay?: number
  ): T;

  // scene.js

  export class Scene {
    /**
     * The {@link shifty.Scene} class provides a way to control groups of {@link
     * shifty.Tweenable}s. It is lightweight, minimalistic, and meant to provide
     * performant {@link shifty.Tweenable} batch control that users of Shifty
     * might otherwise have to implement themselves. It is **not** a robust
     * timeline solution, and it does **not** provide utilities for sophisticated
     * animation sequencing or orchestration. If that is what you need for your
     * project, consider using a more robust tool such as
     * [Rekapi](http://jeremyckahn.github.io/rekapi/doc/) (a timeline layer built
     * on top of Shifty).
     *
     * Please be aware that {@link shifty.Scene} does **not** perform any
     * automatic cleanup. If you want to remove a {@link shifty.Tweenable} from a
     * {@link shifty.Scene}, you must do so explicitly with either {@link
     * shifty.Scene#remove} or {@link shifty.Scene#empty}.
     *
     * <p class="codepen" data-height="677" data-theme-id="0" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="qvZKbe" style="height: 677px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Scene Demo">
     * <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/qvZKbe/">
     * Shifty Scene Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
     * on <a href="https://codepen.io">CodePen</a>.</span>
     * </p>
     * <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
     * @param {...shifty.Tweenable} tweenables
     * @see https://codepen.io/jeremyckahn/pen/qvZKbe
     * @constructs shifty.Scene
     */
    constructor(...tweenables: Tweenable[]);

    /**
     * A copy of the internal {@link shifty.Tweenable}s array.
     * @member shifty.Scene#tweenables
     * @type {Array.<shifty.Tweenable>}
     * @readonly
     */
    get tweenables(): Tweenable[];

    /**
     * The {@link external:Promise}s for all {@link shifty.Tweenable}s in this
     * {@link shifty.Scene} that have been configured with {@link
     * shifty.Tweenable#setConfig}. Note that each call of {@link
     * shifty.Scene#play} or {@link shifty.Scene#pause} creates new {@link
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
     * @member shifty.Scene#promises
     * @type {Array.<external:Promise>}
     * @readonly
     */
    get promises(): Promise<Object>[];

    /**
     * Add a {@link shifty.Tweenable} to be controlled by this {@link
     * shifty.Scene}.
     * @method shifty.Scene#add
     * @param {shifty.Tweenable} tweenable
     * @return {shifty.Tweenable} The {@link shifty.Tweenable} that was added.
     */
    add(tweenable: Tweenable): Tweenable;

    /**
     * Remove a {@link shifty.Tweenable} that is controlled by this {@link
     * shifty.Scene}.
     * @method shifty.Scene#remove
     * @param {shifty.Tweenable} tweenable
     * @return {shifty.Tweenable} The {@link shifty.Tweenable} that was removed.
     */
    remove(tweenable: Tweenable): Tweenable;

    /**
     * [Remove]{@link shifty.Scene#remove} all {@link shifty.Tweenable}s in this {@link
     * shifty.Scene}.
     * @method shifty.Scene#empty
     * @return {Array.<shifty.Tweenable>} The {@link shifty.Tweenable}s that were
     * removed.
     */
    empty(): Array<Tweenable>;

    /**
     * Is `true` if any {@link shifty.Tweenable} in this {@link shifty.Scene} is
     * playing.
     * @method shifty.Scene#isPlaying
     * @return {boolean}
     */
    isPlaying(): boolean;

    /**
     * Play all {@link shifty.Tweenable}s from their beginning.
     * @method shifty.Scene#play
     * @return {shifty.Scene}
     */
    play(): Scene;

    /**
     * {@link shifty.Tweenable#pause} all {@link shifty.Tweenable}s in this
     * {@link shifty.Scene}.
     * @method shifty.Scene#pause
     * @return {shifty.Scene}
     */
    pause(): Scene;

    /**
     * {@link shifty.Tweenable#resume} all paused {@link shifty.Tweenable}s.
     * @method shifty.Scene#resume
     * @return {shifty.Scene}
     */
    resume(): Scene;

    /**
     * {@link shifty.Tweenable#stop} all {@link shifty.Tweenable}s in this {@link
     * shifty.Scene}.
     * @method shifty.Scene#stop
     * @param {boolean} [gotoEnd]
     * @return {shifty.Scene}
     */
    stop(gotoEnd?: boolean): Scene;
  }

  // tweenable.js

  /**
   * @method shifty.tween
   * @param {shifty.tweenConfig} [config={}]
   * @description Standalone convenience method that functions identically to
   * {@link shifty.Tweenable#tween}.  You can use this to create tweens without
   * needing to set up a {@link shifty.Tweenable} instance.
   *
   * ```
   * import { tween } from 'shifty';
   *
   * tween({ from: { x: 0 }, to: { x: 10 } }).then(
   *   () => console.log('All done!')
   * );
   * ```
   *
   * @returns {shifty.Tweenable} A new {@link shifty.Tweenable} instance.
   */
  export function tween(config?: tweenConfig): Tweenable;
  export function tweenProps(
    forPosition: number,
    currentState: any,
    originalState: any,
    targetState: any,
    duration: number,
    timestamp: number,
    easing: Record<any, string | Function>
  ): Object;
  export function processTweens(): void;
  export function scheduleUpdate(): void;
  export function composeEasingObject(
    fromTweenParams: any,
    easing?: any | string | Function,
    composedEasing?: any
  ): any | Function;
  export class Tweenable {
    /**
     * @method shifty.Tweenable.now
     * @static
     * @returns {number} The current timestamp.
     */
    static now: () => number;
    /**
     * @param {Object} [initialState={}] The values that the initial tween should
     * start at if a `from` value is not provided to {@link
     * shifty.Tweenable#tween} or {@link shifty.Tweenable#setConfig}.
     * @param {shifty.tweenConfig} [config] Configuration object to be passed to
     * {@link shifty.Tweenable#setConfig}.
     * @constructs shifty.Tweenable
     */
    constructor(initialState?: Object, config?: tweenConfig);
    private _config: tweenConfig;
    private _data: Object;
    private _delay: number;
    private _filters: filter[];
    private _next: any;
    private _previous: any;
    private _timestamp: number;
    private _resolve: any;
    private _reject: (reason?: any) => void;
    private _currentState: any;
    private _originalState: Object;
    private _targetState: Object;
    private _start: () => void;
    private _render: () => void;
    private _promiseCtor: PromiseConstructor;
    /**
     * Applies a filter to Tweenable instance.
     * @param {string} filterName The name of the filter to apply.
     * @private
     */
    private _applyFilter;
    private _isPlaying: boolean;
    private _pausedAtTime: number;
    private _duration: any;
    private _scheduleId: any;
    private _easing: any;

    /**
     * Configure and start a tween. If this {@link shifty.Tweenable}'s instance
     * is already running, then it will stop playing the old tween and
     * immediately play the new one.
     * @method shifty.Tweenable#tween
     * @param {shifty.tweenConfig} [config] Gets passed to {@link
     * shifty.Tweenable#setConfig}.
     * @return {shifty.Tweenable}
     */
    tween(config?: tweenConfig): this;

    /**
     * Configure a tween that will start at some point in the future. Aside from
     * `delay`, `from`, and `to`, each configuration option will automatically
     * default to the same option used in the preceding tween of this {@link
     * shifty.Tweenable} instance.
     * @method shifty.Tweenable#setConfig
     * @param {shifty.tweenConfig} [config={}]
     * @return {shifty.Tweenable}
     */
    setConfig(config?: tweenConfig): this;

    /**
     * Overrides any `finish` function passed via a {@link shifty.tweenConfig}.
     * @method shifty.Tweenable#then
     * @param {function} onFulfilled Receives {@link shifty.promisedData} as the
     * first parameter.
     * @param {function} onRejected Receives {@link shifty.promisedData} as the
     * first parameter.
     * @return {external:Promise}
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
     */
    then(onFulfilled: Function, onRejected?: Function): Promise<any>;

    private _promise: Promise<any>;

    /**
     * @method shifty.Tweenable#catch
     * @param {function} onRejected Receives {@link shifty.promisedData} as the
     * first parameter.
     * @return {external:Promise}
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
     */
    catch(onRejected: Function): Promise<any>;

    /**
     * @method shifty.Tweenable#get
     * @return {Object} The current state.
     */
    get(): Object;

    /**
     * Set the current state.
     * @method shifty.Tweenable#set
     * @param {Object} state The state to set.
     */
    set(state: Object): void;

    /**
     * Pause a tween. Paused tweens can be resumed from the point at which they
     * were paused. If a tween is not running, this is a no-op.
     * @method shifty.Tweenable#pause
     * @return {shifty.Tweenable}
     */
    pause(): this;

    /**
     * Resume a paused tween.
     * @method shifty.Tweenable#resume
     * @return {shifty.Tweenable}
     */
    resume(): this;

    private _resume(currentTime?: number): any;

    /**
     * Move the state of the animation to a specific point in the tween's
     * timeline.  If the animation is not running, this will cause {@link
     * shifty.renderFunction} handlers to be called.
     * @method shifty.Tweenable#seek
     * @param {millisecond} millisecond The millisecond of the animation to seek
     * to.  This must not be less than `0`.
     * @return {shifty.Tweenable}
     */
    seek(millisecond: number): this;

    /**
     * Stops a tween. If a tween is not running, this is a no-op. This method
     * does not cancel the tween {@link external:Promise}. For that, use {@link
     * shifty.Tweenable#cancel}.
     * @param {boolean} [gotoEnd] If `false`, the tween just stops at its current
     * state.  If `true`, the tweened object's values are instantly set to the
     * target values.
     * @method shifty.Tweenable#stop
     * @return {shifty.Tweenable}
     */
    stop(gotoEnd?: boolean): this;

    /**
     * {@link shifty.Tweenable#stop}s a tween and also `reject`s its {@link
     * external:Promise}. If a tween is not running, this is a no-op. Prevents
     * calling any provided `finish` function.
     * @param {boolean} [gotoEnd] Is propagated to {@link shifty.Tweenable#stop}.
     * @method shifty.Tweenable#cancel
     * @return {shifty.Tweenable}
     * @see https://github.com/jeremyckahn/shifty/issues/122
     */
    cancel(gotoEnd?: boolean): this;

    /**
     * Whether or not a tween is running.
     * @method shifty.Tweenable#isPlaying
     * @return {boolean}
     */
    isPlaying(): boolean;

    /**
     * @method shifty.Tweenable#setScheduleFunction
     * @param {shifty.scheduleFunction} scheduleFunction
     * @deprecated Will be removed in favor of {@link shifty.Tweenable.setScheduleFunction} in 3.0.
     */
    setScheduleFunction(scheduleFunction: scheduleFunction): void;

    /**
     * Get and optionally set the data that gets passed as `data` to {@link
     * shifty.promisedData}, {@link shifty.startFunction} and {@link
     * shifty.renderFunction}.
     * @param {Object} [data]
     * @method shifty.Tweenable#data
     * @return {Object} The internally stored `data`.
     */
    data(data?: any): any;

    /**
     * `delete` all "own" properties.  Call this when the {@link
     * shifty.Tweenable} instance is no longer needed to free memory.
     * @method shifty.Tweenable#dispose
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
     * @method shifty.Tweenable.setScheduleFunction
     * @param {shifty.scheduleFunction} fn The function to be
     * used to schedule the next frame to be rendered.
     * @return {shifty.scheduleFunction} The function that was set.
     */
    export function setScheduleFunction(fn: scheduleFunction): scheduleFunction;
    export const filters: any;

    // easing-functions.js
    export namespace formulas {
      export function linear(pos: number): number;
      export function easeInQuad(pos: any): number;
      export function easeOutQuad(pos: any): number;
      export function easeInOutQuad(pos: any): number;
      export function easeInCubic(pos: any): number;
      export function easeOutCubic(pos: any): number;
      export function easeInOutCubic(pos: any): number;
      export function easeInQuart(pos: any): number;
      export function easeOutQuart(pos: any): number;
      export function easeInOutQuart(pos: any): number;
      export function easeInQuint(pos: any): number;
      export function easeOutQuint(pos: any): number;
      export function easeInOutQuint(pos: any): number;
      export function easeInSine(pos: any): number;
      export function easeOutSine(pos: any): number;
      export function easeInOutSine(pos: any): number;
      export function easeInExpo(pos: any): number;
      export function easeOutExpo(pos: any): number;
      export function easeInOutExpo(pos: any): number;
      export function easeInCirc(pos: any): number;
      export function easeOutCirc(pos: any): number;
      export function easeInOutCirc(pos: any): number;
      export function easeOutBounce(pos: any): number;
      export function easeInBack(pos: any): number;
      export function easeOutBack(pos: any): number;
      export function easeInOutBack(pos: any): number;
      export function elastic(pos: any): number;
      export function swingFromTo(pos: any): number;
      export function swingFrom(pos: any): number;
      export function swingTo(pos: any): number;
      export function bounce(pos: any): number;
      export function bouncePast(pos: any): number;
      export function easeFromTo(pos: any): number;
      export function easeFrom(pos: any): number;
      export function easeTo(pos: any): number;
    }
  }

  // token.js

  export function tweenCreated(tweenable: any): void;
  export function beforeTween(tweenable: any): void;
  export function afterTween(tweenable: any): void;
  export function doesApply(tweenable: any): boolean;
}
