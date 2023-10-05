/*
GDevelop - Tween Behavior Extension
Copyright (c) 2010-2023 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  export interface RuntimeScene {
    _tweens: gdjs.TweenRuntimeBehavior.TweenManager;
  }
  export namespace evtTools {
    export namespace tween {
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
          : easingFunctions.linear;
        return fromValue + (toValue - fromValue) * easingFunction(weighting);
      };

      export const getTweensMap = (runtimeScene: RuntimeScene) =>
        runtimeScene._tweens ||
        (runtimeScene._tweens = new gdjs.TweenRuntimeBehavior.TweenManager());

      gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
        const timeDelta = runtimeScene.getElapsedTime() / 1000;
        gdjs.evtTools.tween.getTweensMap(runtimeScene).step(timeDelta);
      });

      export const sceneTweenExists = (
        runtimeScene: RuntimeScene,
        id: string
      ) => getTweensMap(runtimeScene).exists(id);

      export const sceneTweenIsPlaying = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        return getTweensMap(runtimeScene).isPlaying(id);
      };

      export const sceneTweenHasFinished = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        return getTweensMap(runtimeScene).hasFinished(id);
      };

      export const resumeSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        getTweensMap(runtimeScene).resumeTween(id);
      };

      export const pauseSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        getTweensMap(runtimeScene).pauseTween(id);
      };

      export const stopSceneTween = (
        runtimeScene: RuntimeScene,
        id: string,
        shouldGoToEnd: boolean
      ) => {
        getTweensMap(runtimeScene).stopTween(id, shouldGoToEnd);
      };

      export const removeSceneTween = (
        runtimeScene: RuntimeScene,
        id: string
      ) => {
        getTweensMap(runtimeScene).removeTween(id);
      };

      const linearInterpolation = gdjs.evtTools.common.lerp;
      const exponentialInterpolation =
        gdjs.evtTools.common.exponentialInterpolation;

      /**
       * @deprecated Use tweenVariableNumber2 instead.
       * This function is misleading since one could think that the tween starts
       * right at the moment this function is called whereas the value of the variable
       * will change at the next frame only. Moreover, the variable will not start from
       * the start value exactly since time will have passed at the moment the next
       * frame is rendered.
       * See https://github.com/4ian/GDevelop/issues/4270
       */
      export const tweenVariableNumber = (
        runtimeScene: RuntimeScene,
        identifier: string,
        variable: Variable,
        from: number,
        to: number,
        duration: number,
        easing: string
      ) => {
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          duration / 1000,
          easing,
          linearInterpolation,
          from,
          to,
          (value: float) => variable.setNumber(value)
        );
      };

      export const tweenVariableNumber2 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        variable: Variable,
        toValue: number,
        duration: number,
        easing: string
      ) => {
        if (variable.getType() !== 'number') {
          return;
        }
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          duration / 1000,
          easing,
          linearInterpolation,
          variable.getValue() as number,
          toValue,
          (value: float) => variable.setNumber(value)
        );
      };

      /**
       * @deprecated Use tweenCamera2 instead.
       */
      export const tweenCamera = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toX: number,
        toY: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        tweenCamera2(
          runtimeScene,
          identifier,
          toX,
          toY,
          layerName,
          duration / 1000,
          easing
        );
      };

      /**
       * Tween a layer camera position.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param toX The targeted position on X axis
       * @param toY The targeted position on Y axis
       * @param layerName The name of the layer to move
       * @param duration Duration in seconds
       * @param easing Easing function identifier
       */
      export const tweenCamera2 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toX: number,
        toY: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addMultiTween(
          identifier,
          duration,
          easing,
          linearInterpolation,
          [layer.getCameraX(), layer.getCameraY()],
          [toX, toY],
          ([x, y]) => {
            layer.setCameraX(x);
            layer.setCameraY(y);
          }
        );
      };

      /**
       * @deprecated Use tweenCameraZoom2 instead.
       */
      export const tweenCameraZoom = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toZoom: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          duration / 1000,
          easing,
          linearInterpolation,
          layer.getCameraZoom(),
          toZoom,
          (value: float) => layer.setCameraZoom(value)
        );
      };

      /**
       * Tween a layer camera zoom factor.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param toZoom The targeted zoom factor
       * @param layerName The name of the layer to zoom
       * @param duration Duration in seconds
       * @param easing Easing function identifier
       */
      export const tweenCameraZoom2 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toZoom: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          duration,
          easing,
          exponentialInterpolation,
          layer.getCameraZoom(),
          toZoom,
          (value: float) => layer.setCameraZoom(value)
        );
      };

      export const tweenCameraRotation = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toRotation: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        tweenCameraRotation2(
          runtimeScene,
          identifier,
          toRotation,
          layerName,
          duration / 1000,
          easing
        );
      };

      /**
       * Tween a layer camera rotation angle.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param toRotation The targeted angle in degrees
       * @param layerName The name of the layer to rotate
       * @param duration Duration in seconds
       * @param easing Easing function identifier
       */
      export const tweenCameraRotation2 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toRotation: number,
        layerName: string,
        duration: number,
        easing: string
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          duration,
          easing,
          linearInterpolation,
          layer.getCameraRotation(),
          toRotation,
          (value: float) => layer.setCameraRotation(value)
        );
      };
    }
  }
}
