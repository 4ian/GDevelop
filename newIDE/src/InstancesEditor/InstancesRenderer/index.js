import LayerRenderer from './LayerRenderer';
const PIXI = global.PIXI;

export default class InstancesRenderer {
  constructor({project, layout, instances, onInstanceClicked, onOverInstance, onOutInstance, onMoveInstance, onDownInstance}) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.onInstanceClicked = onInstanceClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onDownInstance = onDownInstance;

    this.layersRenderers = {};

    this.pixiContainer = new PIXI.Container();
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceWidth = (instance) => {
    if (instance.hasCustomSize())
      return instance.getCustomWidth();

    const layerName = instance.getLayer();
    const layerRenderer = this.layersRenderers[layerName];
    if (!layerRenderer) return 0;

    return layerRenderer.getInstanceWidth(instance);
  }

  getInstanceHeight = (instance) => {
    if (instance.hasCustomSize())
      return instance.getCustomHeight();

    const layerName = instance.getLayer();
    const layerRenderer = this.layersRenderers[layerName];
    if (!layerRenderer) return 0;

    return layerRenderer.getInstanceHeight(instance);
  }

  render() {
    for (let i = 0; i < this.layout.getLayersCount(); i++) {
      const layer = this.layout.getLayerAt(i);
      const layerName = layer.getName();

      let layerRenderer = this.layersRenderers[layerName];
      if (!layerRenderer) {
        this.layersRenderers[layerName] = layerRenderer =
          new LayerRenderer({
            project: this.project,
            layout: this.layout,
            instances: this.instances,
            layer: layer,
            onInstanceClicked: this.onInstanceClicked,
            onOverInstance: this.onOverInstance,
            onOutInstance: this.onOutInstance,
            onMoveInstance: this.onMoveInstance,
            onDownInstance: this.onDownInstance,
          });
        this.pixiContainer.addChild(layerRenderer.getPixiContainer());
      }

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
    for(let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        const layerRenderer = this.layersRenderers[i];
        if (!layerRenderer.wasUsed) {
          this.pixiContainer.removeChild(layerRenderer.getPixiContainer());
          layerRenderer.delete();
          delete this.layersRenderers[i];
        }
        else
          layerRenderer.wasUsed = false;
      }
    }
  }

  delete() {
    for(let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        this.layersRenderers[i].delete();
      }
    }
  }
}
