/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace camera {
      export const setCameraX = function (
        runtimeScene: gdjs.RuntimeScene,
        x: float,
        layer: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        runtimeScene.getLayer(layer).setCameraX(x, cameraId);
      };

      export const setCameraY = function (
        runtimeScene: gdjs.RuntimeScene,
        y: float,
        layer: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        runtimeScene.getLayer(layer).setCameraY(y, cameraId);
      };

      export const getCameraX = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraX();
      };

      export const getCameraY = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraY();
      };

      export const getCameraWidth = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraWidth();
      };

      export const getCameraHeight = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraHeight();
      };

      export const getCameraBorderLeft = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraX(runtimeScene, layer, cameraId) -
          getCameraWidth(runtimeScene, layer, cameraId) / 2
        );
      };

      export const getCameraBorderRight = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraX(runtimeScene, layer, cameraId) +
          getCameraWidth(runtimeScene, layer, cameraId) / 2
        );
      };

      export const getCameraBorderTop = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraY(runtimeScene, layer, cameraId) -
          getCameraHeight(runtimeScene, layer, cameraId) / 2
        );
      };

      export const getCameraBorderBottom = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraY(runtimeScene, layer, cameraId) +
          getCameraHeight(runtimeScene, layer, cameraId) / 2
        );
      };

      export const showLayer = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene.getLayer(layer).show(true);
      };

      export const hideLayer = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene.getLayer(layer).show(false);
      };

      export const layerIsVisible = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ): boolean {
        return (
          runtimeScene.hasLayer(layer) &&
          runtimeScene.getLayer(layer).isVisible()
        );
      };

      export const setCameraRotation = function (
        runtimeScene: gdjs.RuntimeScene,
        rotation: float,
        layer: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene
          .getLayer(layer)
          .setCameraRotation(rotation, cameraId);
      };

      export const getCameraRotation = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraRotation(cameraId);
      };

      export const getCameraZoom = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        cameraId: integer
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getCameraZoom(cameraId);
      };

      export const setCameraZoom = function (
        runtimeScene: gdjs.RuntimeScene,
        newZoom: float,
        layer: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene.getLayer(layer).setCameraZoom(newZoom, cameraId);
      };

      export const centerCamera = function (
        runtimeScene: gdjs.RuntimeScene,
        object: gdjs.RuntimeObject | null,
        anticipateMove: boolean,
        layerName: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layerName) || object == null) {
          return;
        }
        let xOffset = 0;
        let yOffset = 0;
        if (anticipateMove && !object.hasNoForces()) {
          const objectAverageForce = object.getAverageForce();
          const elapsedTimeInSeconds =
            object.getElapsedTime(runtimeScene) / 1000;
          xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
          yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
        }
        const layer = runtimeScene.getLayer(layerName);
        layer.setCameraX(object.getCenterXInScene() + xOffset, cameraId);
        layer.setCameraY(object.getCenterYInScene() + yOffset, cameraId);
      };

      /**
       * @deprecated prefer using centerCamera and clampCamera.
       */
      export const centerCameraWithinLimits = function (
        runtimeScene: gdjs.RuntimeScene,
        object: gdjs.RuntimeObject | null,
        left: number,
        top: number,
        right: number,
        bottom: number,
        anticipateMove: boolean,
        layerName: string,
        cameraId: integer
      ) {
        centerCamera(runtimeScene, object, anticipateMove, layerName, cameraId);
        clampCamera(
          runtimeScene,
          left,
          top,
          right,
          bottom,
          layerName,
          cameraId
        );
      };

      export const clampCamera = function (
        runtimeScene: gdjs.RuntimeScene,
        left: float,
        top: float,
        right: float,
        bottom: float,
        layerName: string,
        cameraId: integer
      ) {
        if (!runtimeScene.hasLayer(layerName)) {
          return;
        }
        const layer = runtimeScene.getLayer(layerName);
        const cameraHalfWidth = layer.getCameraWidth(cameraId) / 2;
        const cameraHalfHeight = layer.getCameraHeight(cameraId) / 2;

        const centerLeftBound = left + cameraHalfWidth;
        const centerRightBound = right - cameraHalfWidth;
        const centerTopBound = top + cameraHalfHeight;
        const centerBottomBound = bottom - cameraHalfHeight;

        const cameraX =
          centerLeftBound < centerRightBound
            ? gdjs.evtTools.common.clamp(
                layer.getCameraX(cameraId),
                centerLeftBound,
                centerRightBound
              )
            : // Center on the bounds when they are too small to fit the viewport.
              (centerLeftBound + centerRightBound) / 2;
        const cameraY =
          centerTopBound < centerBottomBound
            ? gdjs.evtTools.common.clamp(
                layer.getCameraY(cameraId),
                centerTopBound,
                centerBottomBound
              )
            : // Center on the bounds when they are too small to fit the viewport.
              (centerTopBound + centerBottomBound) / 2;

        layer.setCameraX(cameraX, cameraId);
        layer.setCameraY(cameraY, cameraId);
      };

      /**
       * Update a layer effect parameter (with a number).
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The parameter to update
       * @param value The new value
       */
      export const setLayerEffectDoubleParameter = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        effect: string,
        parameter: string,
        value: float
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene
          .getLayer(layer)
          .setEffectDoubleParameter(effect, parameter, value);
      };

      /**
       * Update a layer effect parameter (with a string).
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The parameter to update
       * @param value The new value
       */
      export const setLayerEffectStringParameter = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        effect: string,
        parameter: string,
        value: string
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene
          .getLayer(layer)
          .setEffectStringParameter(effect, parameter, value);
      };

      /**
       * Enable or disable a layer effect parameter (boolean).
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The parameter to update
       * @param value The new value
       */
      export const setLayerEffectBooleanParameter = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        effect: string,
        parameter: string,
        value: boolean
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene
          .getLayer(layer)
          .setEffectBooleanParameter(effect, parameter, value);
      };

      /**
       * Enable, or disable, an effect of a layer.
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param enabled true to enable, false to disable.
       */
      export const enableLayerEffect = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        effect: string,
        enabled: boolean
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        runtimeScene.getLayer(layer).enableEffect(effect, enabled);
      };

      /**
       * Check if an effect is enabled.
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @return true if the effect is enabled, false otherwise.
       */
      export const layerEffectEnabled = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        effect: string
      ): boolean {
        if (!runtimeScene.hasLayer(layer)) {
          return true;
        }
        return runtimeScene.getLayer(layer).isEffectEnabled(effect);
      };

      export const setLayerTimeScale = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        timeScale: float
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene.getLayer(layer).setTimeScale(timeScale);
      };

      export const getLayerTimeScale = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 1;
        }
        return runtimeScene.getLayer(layer).getTimeScale();
      };

      export const setLayerDefaultZOrder = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string,
        defaultZOrder: integer
      ) {
        if (!runtimeScene.hasLayer(layer)) {
          return;
        }
        return runtimeScene.getLayer(layer).setDefaultZOrder(defaultZOrder);
      };

      export const getLayerDefaultZOrder = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getDefaultZOrder();
      };

      /**
       * @param runtimeScene The scene
       * @param layerName The lighting layer with the ambient color.
       * @param rgbColor The color, in RGB format ("128;200;255").
       */
      export const setLayerAmbientLightColor = function (
        runtimeScene: gdjs.RuntimeScene,
        layerName: string,
        rgbColor: string
      ) {
        if (
          !runtimeScene.hasLayer(layerName) ||
          !runtimeScene.getLayer(layerName).isLightingLayer()
        ) {
          return;
        }
        const colors = rgbColor.split(';');
        if (colors.length < 3) {
          return;
        }
        return runtimeScene
          .getLayer(layerName)
          .setClearColor(
            parseInt(colors[0], 10),
            parseInt(colors[1], 10),
            parseInt(colors[2], 10)
          );
      };

      /**
       * @param runtimeScene The scene
       * @param layer The name of the layer
       * @return the highest Z order of objects in the layer
       */
      export const getLayerHighestZOrder = function (
        runtimeScene: gdjs.RuntimeScene,
        layer: string
      ): number {
        if (!runtimeScene.hasLayer(layer)) {
          return 0;
        }
        return runtimeScene.getLayer(layer).getHighestZOrder();
      };
    }
  }
}
