/*
GDevelop - Tween Behavior Extension
Copyright (c) 2010-2023 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  declare type SceneTweenType =
    | 'layoutValue'
    | 'layerValue'
    | 'variable'
    | 'cameraZoom'
    | 'cameraRotation'
    | 'cameraPosition'
    | 'colorEffectProperty'
    | 'numberEffectProperty';
  declare type ObjectTweenType =
    | 'variable'
    | 'position'
    | 'positionX'
    | 'positionY'
    | 'positionZ'
    | 'width'
    | 'height'
    | 'depth'
    | 'angle'
    | 'rotationX'
    | 'rotationY'
    | 'scale'
    | 'scaleXY'
    | 'scaleX'
    | 'scaleY'
    | 'opacity'
    | 'characterSize'
    | 'numberEffectProperty'
    | 'colorEffectProperty'
    | 'objectColor'
    | 'objectColorHSL'
    | 'objectValue';

  export interface RuntimeScene {
    _tweens: gdjs.evtTools.tween.TweenManager;
  }
  export namespace evtTools {
    export namespace tween {
      const logger = new gdjs.Logger('Tween');

      const getTweenVariableSetter = (variable: gdjs.Variable) => {
        return (value: float) => variable.setNumber(value);
      };
      const tweenLayoutValueSetter = (value: float) => {};
      const tweenLayerValueSetter = (value: float) => {};
      const getTweenLayerCameraPositionSetter = (layer: gdjs.RuntimeLayer) => {
        return ([x, y]: Array<float>) => {
          layer.setCameraX(x);
          layer.setCameraY(y);
        };
      };
      const getTweenLayerCameraRotationSetter = (layer: gdjs.RuntimeLayer) => {
        return (value: float) => layer.setCameraRotation(value);
      };
      const getTweenLayerCameraZoomSetter = (layer: gdjs.RuntimeLayer) => {
        return (value: float) => layer.setCameraZoom(value);
      };
      const getTweenNumberEffectPropertySetter = (
        effect: PixiFiltersTools.Filter,
        propertyName: string
      ) => {
        return (value: float) => {
          if (effect) {
            effect.updateDoubleParameter(propertyName, value);
          }
        };
      };
      const getTweenColorEffectPropertySetter = (
        effect: PixiFiltersTools.Filter,
        propertyName: string
      ) => {
        return ([hue, saturation, lightness]: Array<float>) => {
          if (effect) {
            const rgbFromHslColor = gdjs.evtTools.tween.hslToRgb(
              hue,
              saturation,
              lightness
            );
            effect.updateColorParameter(
              propertyName,
              gdjs.rgbToHexNumber(
                rgbFromHslColor[0],
                rgbFromHslColor[1],
                rgbFromHslColor[2]
              )
            );
          }
        };
      };

      // Factory to get the tween setter based on type and options
      export const tweenSetterFactory =
        (runtimeScene: RuntimeScene) =>
        (tweenInformation: TweenInformationNetworkSyncData) => {
          const type = tweenInformation.type;
          const layerName = tweenInformation.layerName;
          const variablePath = tweenInformation.variablePath;
          const effectName = tweenInformation.effectName;
          const propertyName = tweenInformation.propertyName;

          if (type === 'variable' && variablePath) {
            const variable = runtimeScene
              .getVariables()
              .getVariableFromPath(variablePath);
            if (!variable) {
              return () => {};
            }
            return getTweenVariableSetter(variable);
          }
          if (type === 'cameraZoom' && layerName !== undefined) {
            const layer = runtimeScene.getLayer(layerName);
            return getTweenLayerCameraZoomSetter(layer);
          }
          if (type === 'cameraRotation' && layerName !== undefined) {
            const layer = runtimeScene.getLayer(layerName);
            return getTweenLayerCameraRotationSetter(layer);
          }
          if (type === 'cameraPosition' && layerName !== undefined) {
            const layer = runtimeScene.getLayer(layerName);
            return getTweenLayerCameraPositionSetter(layer);
          }
          if (
            type === 'colorEffectProperty' &&
            layerName !== undefined &&
            effectName &&
            propertyName
          ) {
            const layer = runtimeScene.getLayer(layerName);
            const effect = layer.getRendererEffects()[effectName];
            if (!effect) {
              logger.error(
                `The layer "${layerName}" doesn't have any effect called "${effectName}"`
              );
            }

            return getTweenColorEffectPropertySetter(effect, propertyName);
          }
          if (
            type === 'numberEffectProperty' &&
            layerName !== undefined &&
            effectName &&
            propertyName
          ) {
            const layer = runtimeScene.getLayer(layerName);
            const effect = layer.getRendererEffects()[effectName];
            if (!effect) {
              logger.error(
                `The layer "${layerName}" doesn't have any effect called "${effectName}"`
              );
            }
            return getTweenNumberEffectPropertySetter(effect, propertyName);
          }
          if (type === 'layoutValue') {
            return tweenLayoutValueSetter;
          }
          if (type === 'layerValue') {
            return tweenLayerValueSetter;
          }
          return () => {};
        };

      export const getTweensMap = (runtimeScene: RuntimeScene) =>
        runtimeScene._tweens ||
        (runtimeScene._tweens = new gdjs.evtTools.tween.TweenManager());

      // Layout tweens from event-based objects won't step, but it's fine
      // because they don't have cameras anyway.
      gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
        gdjs.evtTools.tween.getTweensMap(runtimeScene).step();
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

      /**
       * Get tween progress.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @returns Progress of playing tween animation (between 0.0 and 1.0)
       */
      export const getProgress = (
        runtimeScene: RuntimeScene,
        identifier: string
      ): float => {
        return getTweensMap(runtimeScene).getProgress(identifier);
      };

      /**
       * Get tween value.
       *
       * It returns 0 for tweens with several values.
       *
       * @param identifier Unique id to identify the tween
       * @returns Value of playing tween animation
       */
      export const getValue = (
        runtimeScene: RuntimeScene,
        identifier: string
      ): float => {
        return getTweensMap(runtimeScene).getValue(identifier);
      };

      const linearInterpolation = gdjs.evtTools.common.lerp;
      const exponentialInterpolation =
        gdjs.evtTools.common.exponentialInterpolation;

      /**
       * Add a layout value tween.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param fromValue Start value
       * @param toValue End value
       * @param easing Easing function identifier
       * @param duration Duration in seconds
       * @param useExponentialInterpolation Set it to true to use a exponential
       * It's useful for values that are factors like a scale or a zoom.
       */
      export const addLayoutValueTween = (
        runtimeScene: RuntimeScene,
        identifier: string,
        fromValue: float,
        toValue: float,
        easing: string,
        duration: float,
        useExponentialInterpolation: boolean
      ): void => {
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          runtimeScene,
          duration,
          easing,
          useExponentialInterpolation
            ? exponentialInterpolation
            : linearInterpolation,
          fromValue,
          toValue,
          tweenLayoutValueSetter,
          {
            type: 'layoutValue',
          }
        );
      };

      /**
       * Add a layer value tween. The layer time scale is taken into account.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param fromValue Start value
       * @param toValue End value
       * @param easing Easing function identifier
       * @param duration Duration in seconds
       * @param useExponentialInterpolation Set it to true to use a exponential
       * It's useful for values that are factors like a scale or a zoom.
       * @param layerName The name of layer
       */
      export const addLayerValueTween = (
        runtimeScene: RuntimeScene,
        identifier: string,
        fromValue: float,
        toValue: float,
        easing: string,
        duration: float,
        useExponentialInterpolation: boolean,
        layerName: string
      ): void => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          layer,
          duration,
          easing,
          useExponentialInterpolation
            ? exponentialInterpolation
            : linearInterpolation,
          fromValue,
          toValue,
          tweenLayerValueSetter,
          {
            type: 'layerValue',
            layerName,
          }
        );
      };

      /**
       * @deprecated Use tweenVariableNumber3 instead.
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
          runtimeScene,
          duration / 1000,
          easing,
          linearInterpolation,
          from,
          to,
          getTweenVariableSetter(variable),
          {
            type: 'variable',
            variable,
          }
        );
      };

      /**
       * @deprecated Use tweenVariableNumber3 instead.
       */
      export const tweenVariableNumber2 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        variable: Variable,
        toValue: number,
        duration: number,
        easing: string
      ) => {
        tweenVariableNumber3(
          runtimeScene,
          identifier,
          variable,
          toValue,
          easing,
          duration / 1000
        );
      };

      /**
       * Tween a scene variable.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param variable The scene variable which is set to the tweened value
       * @param toValue End value
       * @param easing Easing function identifier
       * @param duration Duration in seconds
       */
      export const tweenVariableNumber3 = (
        runtimeScene: RuntimeScene,
        identifier: string,
        variable: Variable,
        toValue: number,
        easing: string,
        duration: number
      ) => {
        if (variable.getType() !== 'number') {
          return;
        }
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          runtimeScene,
          duration,
          easing,
          linearInterpolation,
          variable.getValue() as number,
          toValue,
          getTweenVariableSetter(variable),
          {
            type: 'variable',
            variable,
          }
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
        _tweenCamera(
          runtimeScene,
          identifier,
          toX,
          toY,
          layerName,
          duration / 1000,
          easing,
          runtimeScene
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
        easing: string,
        duration: number
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        _tweenCamera(
          runtimeScene,
          identifier,
          toX,
          toY,
          layerName,
          duration,
          easing,
          layer
        );
      };

      const _tweenCamera = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toX: number,
        toY: number,
        layerName: string,
        duration: number,
        easing: string,
        timeSource: gdjs.evtTools.tween.TimeSource
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addMultiTween(
          identifier,
          timeSource,
          duration,
          easing,
          linearInterpolation,
          [layer.getCameraX(), layer.getCameraY()],
          [toX, toY],
          getTweenLayerCameraPositionSetter(layer),
          {
            type: 'cameraPosition',
            layerName,
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
        _tweenCameraZoom(
          runtimeScene,
          identifier,
          toZoom,
          layerName,
          duration / 1000,
          easing,
          runtimeScene,
          linearInterpolation
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
        easing: string,
        duration: number
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        _tweenCameraZoom(
          runtimeScene,
          identifier,
          toZoom,
          layerName,
          duration,
          easing,
          layer,
          exponentialInterpolation
        );
      };

      const _tweenCameraZoom = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toZoom: number,
        layerName: string,
        duration: number,
        easing: string,
        timeSource: gdjs.evtTools.tween.TimeSource,
        interpolation: gdjs.evtTools.tween.Interpolation
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          timeSource,
          duration,
          easing,
          interpolation,
          layer.getCameraZoom(),
          toZoom,
          getTweenLayerCameraZoomSetter(layer),
          {
            type: 'cameraZoom',
            layerName,
          }
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
        _tweenCameraRotation(
          runtimeScene,
          identifier,
          toRotation,
          layerName,
          duration / 1000,
          easing,
          runtimeScene
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
        easing: string,
        duration: number
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        _tweenCameraRotation(
          runtimeScene,
          identifier,
          toRotation,
          layerName,
          duration,
          easing,
          layer
        );
      };

      const _tweenCameraRotation = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toRotation: number,
        layerName: string,
        duration: number,
        easing: string,
        timeSource: gdjs.evtTools.tween.TimeSource
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          timeSource,
          duration,
          easing,
          linearInterpolation,
          layer.getCameraRotation(),
          toRotation,
          getTweenLayerCameraRotationSetter(layer),
          {
            type: 'cameraRotation',
            layerName,
          }
        );
      };

      /**
       * Tween a numeric object effect property.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param toValue The targeted value
       * @param layerName Layer name
       * @param effectName Effect name
       * @param propertyName Property name
       * @param easing Easing function identifier
       * @param duration Duration in seconds
       */
      export const tweenNumberEffectPropertyTween = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toValue: float,
        layerName: string,
        effectName: string,
        propertyName: string,
        easing: string,
        duration: float
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const effect = layer.getRendererEffects()[effectName];
        if (!effect) {
          logger.error(
            `The layer "${layer.getName()}" doesn't have any effect called "${effectName}"`
          );
        }
        getTweensMap(runtimeScene).addSimpleTween(
          identifier,
          layer,
          duration,
          easing,
          linearInterpolation,
          effect ? effect.getDoubleParameter(propertyName) : 0,
          toValue,
          getTweenNumberEffectPropertySetter(effect, propertyName),
          {
            type: 'numberEffectProperty',
            layerName,
            effectName,
            propertyName,
          }
        );
      };

      /**
       * Tween a color object effect property.
       * @param runtimeScene The scene
       * @param identifier Unique id to identify the tween
       * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
       * @param layerName Layer name
       * @param effectName Effect name
       * @param propertyName Property name
       * @param easing Easing function identifier
       * @param duration Duration in seconds
       */
      export const tweenColorEffectPropertyTween = (
        runtimeScene: RuntimeScene,
        identifier: string,
        toColorStr: string,
        layerName: string,
        effectName: string,
        propertyName: string,
        easing: string,
        duration: float
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const effect = layer.getRendererEffects()[effectName];
        if (!effect) {
          logger.error(
            `The layer "${layer.getName()}" doesn't have any effect called "${effectName}"`
          );
        }
        const rgbFromColor = gdjs.hexNumberToRGB(
          effect ? effect.getColorParameter(propertyName) : 0
        );
        const rgbToColor: float[] = gdjs.rgbOrHexToRGBColor(toColorStr);

        getTweensMap(runtimeScene).addMultiTween(
          identifier,
          layer,
          duration,
          easing,
          linearInterpolation,
          gdjs.evtTools.tween.rgbToHsl(
            rgbFromColor.r,
            rgbFromColor.g,
            rgbFromColor.b
          ),
          gdjs.evtTools.tween.rgbToHsl(
            rgbToColor[0],
            rgbToColor[1],
            rgbToColor[2]
          ),
          getTweenColorEffectPropertySetter(effect, propertyName),
          {
            type: 'colorEffectProperty',
            layerName,
            effectName,
            propertyName,
          }
        );
      };
    }
  }
}
