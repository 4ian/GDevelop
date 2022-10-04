/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace layer {
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
