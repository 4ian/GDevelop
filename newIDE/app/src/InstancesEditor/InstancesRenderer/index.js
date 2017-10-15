import LayerRenderer from './LayerRenderer';
import PIXI from 'pixi.js';

export default class InstancesRenderer {
  constructor({
    project,
    layout,
    instances,
    viewPosition,
    onInstanceClicked,
    onOverInstance,
    onOutInstance,
    onMoveInstance,
    onMoveInstanceEnd,
    onDownInstance,
  }) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.viewPosition = viewPosition;
    this.onInstanceClicked = onInstanceClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onMoveInstanceEnd = onMoveInstanceEnd;
    this.onDownInstance = onDownInstance;

    this.layersRenderers = {};

    this.pixiContainer = new PIXI.Container();
    this.instanceMeasurer = {
      getInstanceLeft: instance => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) return instance.getX();

        return layerRenderer.getInstanceLeft(instance);
      },
      getInstanceTop: instance => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) return instance.getY();

        return layerRenderer.getInstanceTop(instance);
      },
      getInstanceWidth: instance => {
        if (instance.hasCustomSize()) return instance.getCustomWidth();

        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) return 0;

        return layerRenderer.getInstanceWidth(instance);
      },

      getInstanceHeight: instance => {
        if (instance.hasCustomSize()) return instance.getCustomHeight();

        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) return 0;

        return layerRenderer.getInstanceHeight(instance);
      },
      getInstanceRect: instance => {
        return {
          x: this.instanceMeasurer.getInstanceLeft(instance),
          y: this.instanceMeasurer.getInstanceTop(instance),
          width: this.instanceMeasurer.getInstanceWidth(instance),
          height: this.instanceMeasurer.getInstanceHeight(instance),
        };
      },
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceMeasurer() {
    return this.instanceMeasurer;
  }

  render() {
    for (let i = 0; i < this.layout.getLayersCount(); i++) {
      const layer = this.layout.getLayerAt(i);
      const layerName = layer.getName();

      let layerRenderer = this.layersRenderers[layerName];
      if (!layerRenderer) {
        this.layersRenderers[layerName] = layerRenderer = new LayerRenderer({
          project: this.project,
          layout: this.layout,
          instances: this.instances,
          viewPosition: this.viewPosition,
          layer: layer,
          onInstanceClicked: this.onInstanceClicked,
          onOverInstance: this.onOverInstance,
          onOutInstance: this.onOutInstance,
          onMoveInstance: this.onMoveInstance,
          onMoveInstanceEnd: this.onMoveInstanceEnd,
          onDownInstance: this.onDownInstance,
        });
        this.pixiContainer.addChild(layerRenderer.getPixiContainer());
      }

      // /!\ Objects representing layers can be deleted at any moment and replaced
      // by new one, for example when two layers are swapped.
      // We update the layer object of the renderer so that the renderer always has
      // a valid layer object that can be used.
      layerRenderer.layer = layer;
      layerRenderer.wasUsed = true;
      layerRenderer.getPixiContainer().zOrder = i;
      layerRenderer.render();
    }

    this._updatePixiObjectsZOrder();
    this._cleanRenderers();
  }

  _updatePixiObjectsZOrder() {
    this.pixiContainer.children.sort((a, b) => {
      a.zOrder = a.zOrder || 0;
      b.zOrder = b.zOrder || 0;
      return a.zOrder - b.zOrder;
    });
  }

  /**
   * Clean up rendered layers that are not existing anymore
   */
  _cleanRenderers() {
    for (let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        const layerRenderer = this.layersRenderers[i];
        if (!layerRenderer.wasUsed) {
          this.pixiContainer.removeChild(layerRenderer.getPixiContainer());
          layerRenderer.delete();
          delete this.layersRenderers[i];
        } else layerRenderer.wasUsed = false;
      }
    }
  }

  delete() {
    for (let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        this.layersRenderers[i].delete();
      }
    }
  }
}
