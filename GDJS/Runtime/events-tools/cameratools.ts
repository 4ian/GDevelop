/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace camera {
      export const setCameraX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        x: float,
        layer: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        instanceContainer.getLayer(layer).setCameraX(x, cameraId);
      };

      export const setCameraY = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        y: float,
        layer: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        instanceContainer.getLayer(layer).setCameraY(y, cameraId);
      };

      export const getCameraX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraX();
      };

      export const getCameraY = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraY();
      };

      export const getCameraWidth = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraWidth();
      };

      export const getCameraHeight = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraHeight();
      };

      export const getCameraBorderLeft = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraX(instanceContainer, layer, cameraId) -
          getCameraWidth(instanceContainer, layer, cameraId) / 2
        );
      };

      export const getCameraBorderRight = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraX(instanceContainer, layer, cameraId) +
          getCameraWidth(instanceContainer, layer, cameraId) / 2
        );
      };

      export const getCameraBorderTop = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraY(instanceContainer, layer, cameraId) -
          getCameraHeight(instanceContainer, layer, cameraId) / 2
        );
      };

      export const getCameraBorderBottom = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return (
          getCameraY(instanceContainer, layer, cameraId) +
          getCameraHeight(instanceContainer, layer, cameraId) / 2
        );
      };

      export const showLayer = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer.getLayer(layer).show(true);
      };

      export const hideLayer = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer.getLayer(layer).show(false);
      };

      export const layerIsVisible = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string
      ): boolean {
        return (
          instanceContainer.hasLayer(layer) &&
          instanceContainer.getLayer(layer).isVisible()
        );
      };

      export const setCameraRotation = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        rotation: float,
        layer: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setCameraRotation(rotation, cameraId);
      };

      export const getCameraRotation = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraRotation(cameraId);
      };

      export const getCameraZoom = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        cameraId: integer
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getCameraZoom(cameraId);
      };

      export const setCameraZoom = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        newZoom: float,
        layer: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setCameraZoom(newZoom, cameraId);
      };

      export const centerCamera = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        object: gdjs.RuntimeObject | null,
        anticipateMove: boolean,
        layerName: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layerName) || object == null) {
          return;
        }
        let xOffset = 0;
        let yOffset = 0;
        if (anticipateMove && !object.hasNoForces()) {
          const objectAverageForce = object.getAverageForce();
          const elapsedTimeInSeconds =
            object.getElapsedTime(instanceContainer) / 1000;
          xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
          yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
        }
        const layer = instanceContainer.getLayer(layerName);
        layer.setCameraX(object.getCenterXInScene() + xOffset, cameraId);
        layer.setCameraY(object.getCenterYInScene() + yOffset, cameraId);
      };

      /**
       * @deprecated prefer using centerCamera and clampCamera.
       */
      export const centerCameraWithinLimits = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        object: gdjs.RuntimeObject | null,
        left: number,
        top: number,
        right: number,
        bottom: number,
        anticipateMove: boolean,
        layerName: string,
        cameraId: integer
      ) {
        centerCamera(
          instanceContainer,
          object,
          anticipateMove,
          layerName,
          cameraId
        );
        clampCamera(
          instanceContainer,
          left,
          top,
          right,
          bottom,
          layerName,
          cameraId
        );
      };

      export const clampCamera = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        left: float,
        top: float,
        right: float,
        bottom: float,
        layerName: string,
        cameraId: integer
      ) {
        if (!instanceContainer.hasLayer(layerName)) {
          return;
        }
        const layer = instanceContainer.getLayer(layerName);
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
       * Update a layer effect property (with a number).
       * @param instanceContainer the container owning the layer
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The property to update
       * @param value The new value
       */
      export const setLayerEffectDoubleParameter = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        effect: string,
        parameter: string,
        value: float
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setEffectDoubleParameter(effect, parameter, value);
      };

      /**
       * Update a layer effect property (with a string).
       * @param instanceContainer the container owning the layer
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The property to update
       * @param value The new value
       */
      export const setLayerEffectStringParameter = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        effect: string,
        parameter: string,
        value: string
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setEffectStringParameter(effect, parameter, value);
      };

      /**
       * Enable or disable a layer effect property (boolean).
       * @param instanceContainer the container owning the layer
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param parameter The property to update
       * @param value The new value
       */
      export const setLayerEffectBooleanParameter = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        effect: string,
        parameter: string,
        value: boolean
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setEffectBooleanParameter(effect, parameter, value);
      };

      /**
       * Enable, or disable, an effect of a layer.
       * @param instanceContainer the container owning the layer
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @param enabled true to enable, false to disable.
       */
      export const enableLayerEffect = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        effect: string,
        enabled: boolean
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        instanceContainer.getLayer(layer).enableEffect(effect, enabled);
      };

      /**
       * Check if an effect is enabled.
       * @param instanceContainer the container owning the layer
       * @param layer The name of the layer
       * @param effect The name of the effect
       * @return true if the effect is enabled, false otherwise.
       */
      export const layerEffectEnabled = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        effect: string
      ): boolean {
        if (!instanceContainer.hasLayer(layer)) {
          return true;
        }
        return instanceContainer.getLayer(layer).isEffectEnabled(effect);
      };

      export const setLayerTimeScale = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        timeScale: float
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer.getLayer(layer).setTimeScale(timeScale);
      };

      export const getLayerTimeScale = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 1;
        }
        return instanceContainer.getLayer(layer).getTimeScale();
      };

      export const setLayerDefaultZOrder = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        defaultZOrder: integer
      ) {
        if (!instanceContainer.hasLayer(layer)) {
          return;
        }
        return instanceContainer
          .getLayer(layer)
          .setDefaultZOrder(defaultZOrder);
      };

      export const getLayerDefaultZOrder = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string
      ): number {
        if (!instanceContainer.hasLayer(layer)) {
          return 0;
        }
        return instanceContainer.getLayer(layer).getDefaultZOrder();
      };

      /**
       * @param instanceContainer the container owning the layer
       * @param layerName The lighting layer with the ambient color.
       * @param rgbColor The color, in RGB format ("128;200;255").
       */
      export const setLayerAmbientLightColor = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layerName: string,
        rgbColor: string
      ) {
        if (
          !instanceContainer.hasLayer(layerName) ||
          !instanceContainer.getLayer(layerName).isLightingLayer()
        ) {
          return;
        }
        const colors = rgbColor.split(';');
        if (colors.length < 3) {
          return;
        }
        return instanceContainer
          .getLayer(layerName)
          .setClearColor(
            parseInt(colors[0], 10),
            parseInt(colors[1], 10),
            parseInt(colors[2], 10)
          );
      };
    }
  }
}
