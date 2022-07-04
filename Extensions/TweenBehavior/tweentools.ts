/// <reference path="shifty.d.ts" />
namespace gdjs {
  export interface RuntimeScene {
    _tweens: Map<string, shifty.Tweenable>;
  }
  export namespace evtTools {
    export namespace tween {
      const easingFunctions: Record<string, shifty.easingFunction> = {
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

      const getTweensMap = (runtimeScene: RuntimeScene) =>
        runtimeScene._tweens || (runtimeScene._tweens = new Map());
      const getShiftyScene = (runtimeScene: RuntimeScene) =>
        runtimeScene.shiftyJsScene ||
        (runtimeScene.shiftyJsScene = new shifty.Scene());

      export const sceneTweenExists = (
        runtimeScene: RuntimeScene,
        id: string
      ) => getTweensMap(runtimeScene).has(id);

      export const sceneTweenIsPlaying = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        return !!tween && tween.isPlaying();
      };

      export const sceneTweenHasFinished = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        return !!tween && tween.hasEnded();
      };

      export const resumeSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        if (!tween) return;
        tween.resume();
        getShiftyScene(runtimeScene).add(tween);
      };

      export const pauseSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        if (!tween) return;
        tween.pause();
        getShiftyScene(runtimeScene).remove(tween);
      };

      export const stopSceneTween = (
        runtimeScene: RuntimeScene,
        id: string,
        shouldGoToEnd: boolean
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        if (!tween) return;
        tween.stop(shouldGoToEnd);
        getShiftyScene(runtimeScene).remove(tween);
      };

      export const removeSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        const tweenMap = getTweensMap(runtimeScene);
        const tween = tweenMap.get(id);
        if (!tween) return;
        tweenMap.delete(id);
        getShiftyScene(runtimeScene).remove(tween);
        tween.stop().dispose();
      };

      export const tweenVariableNumber = (
        runtimeScene: RuntimeScene,
        identifier: string,
        variable: Variable,
        from: number,
        to: number,
        duration: number,
        easing: shifty.easingFunction
      ) => {
        const tween = shifty.tween({
          from: { value: from },
          to: { value: to },
          easing,
          duration,
          render: ({ value }) => variable.setNumber(value),
        });

        getTweensMap(runtimeScene).set(identifier, tween);
        getShiftyScene(runtimeScene).add(tween);
      };

      export const tweenCamera = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toX: number,
        toY: number,
        layerName: string,
        duration: number,
        easing: shifty.easingFunction
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const tween = shifty.tween({
          from: { x: layer.getCameraX(), y: layer.getCameraY() },
          to: { x: toX, y: toY },
          easing,
          duration,
          render: ({ x, y }) => {
            layer.setCameraX(x);
            layer.setCameraY(y);
          },
        });

        getTweensMap(runtimeScene).set(identifier, tween);
        getShiftyScene(runtimeScene).add(tween);
      };
    }
  }
}
