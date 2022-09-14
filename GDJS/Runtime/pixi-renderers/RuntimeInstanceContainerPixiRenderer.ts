/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface RuntimeInstanceContainerPixiRenderer {
    setLayerIndex(layer: gdjs.Layer, index: float): void;
    getRendererObject();
  }
}
