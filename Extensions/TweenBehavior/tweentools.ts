/// <reference path="shifty.d.ts" />
namespace gdjs {
  export namespace evtTools {
    export namespace tween {
      interface RuntimeScene {
        _tweens: Map<string, shifty.Tweenable>;
      }

      const easingFunctions: { [key: string]: shifty.easingFunction } = {
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
        const easingFunction = easingFunctions.hasOwnProperty(easingValue)
          ? easingFunctions[easingValue]
          : shifty.Tweenable.formulas.linear;
        return fromValue + (toValue - fromValue) * easingFunction(weighting);
      };

      const getTweensMap = (rs: RuntimeScene) =>
        rs._tweens || (rs._tweens = new Map());

      export const hasTween = (rs: RuntimeScene, id: string) =>
        getTweensMap(rs).has(id);

      export const isPlaying = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.isPlaying();
      };

      export const hasFinished = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.hasFinished;
      };

      export const tweenVariable = (
        rs: RuntimeScene,
        identifier: string,
        variable: Variable,
        from: number,
        to: number,
        duration: number,
        easing: shifty.easingFunction
      ) => {
        getTweensMap(rs).set(
          identifier,
          shifty.tween({
            from: { value: from },
            to: { value: to },
            easing,
            duration,
            render: ({ value }) => variable.setNumber(value),
          })
        );
      };
    }
  }
}
