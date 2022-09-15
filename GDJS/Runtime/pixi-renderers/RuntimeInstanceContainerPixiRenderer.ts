/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * A render for instance container.
   *
   * @see gdjs.RuntimeInstanceContainer
   */
  export interface RuntimeInstanceContainerPixiRenderer {
    /**
     * Change the position of a layer.
     *
     * @param layer The layer to reorder
     * @param index The new position in the list of layers
     *
     * @see gdjs.RuntimeInstanceContainer.setLayerIndex
     */
    setLayerIndex(layer: gdjs.Layer, index: integer): void;

    getRendererObject(): PIXI.Container;
  }

  // Register the class to let the engine use it.
  export type RuntimeInstanceContainerRenderer = gdjs.RuntimeInstanceContainerPixiRenderer;
}
