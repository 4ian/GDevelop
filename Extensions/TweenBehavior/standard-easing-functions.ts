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

namespace gdjs {
  export namespace evtTools {
    export namespace tween {
      export type EasingFunction = (progress: float) => float;

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
