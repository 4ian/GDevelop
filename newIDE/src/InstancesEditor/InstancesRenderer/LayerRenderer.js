import gesture from 'pixi-simple-gesture';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
const gd = global.gd;
const PIXI = global.PIXI;

export default class LayerRenderer {
  constructor({project, layout, layer, instances, onInstanceClicked, onOverInstance, onOutInstance, onMoveInstance, onDownInstance}) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.layer = layer;
    this.onInstanceClicked = onInstanceClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onDownInstance = onDownInstance;

    this.renderedInstances = {};
    this.pixiContainer = new PIXI.Container();

    // Functor used to render an instance
    this.instancesRenderer = new gd.InitialInstanceJSFunctor();
    this.instancesRenderer.invoke = (instance) => {
      instance = gd.wrapPointer(instance, gd.InitialInstance);

      //Get the "RendereredInstance" object associated to the instance and tell it to update.
      var renderedInstance = this.getRendererOfInstance(instance);
      if (!renderedInstance) return;

      const pixiObject = renderedInstance.getPixiObject();
      if (pixiObject) pixiObject.zOrder = instance.getZOrder();
      if (pixiObject) pixiObject.interactive = !instance.isLocked();
      renderedInstance.update();
      renderedInstance.wasUsed = true;
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceLeft = (instance) => {
    return instance.getX() - this.renderedInstances[instance.ptr].getOriginX();
  }

  getInstanceTop = (instance) => {
    return instance.getY() - this.renderedInstances[instance.ptr].getOriginY();
  }

  getInstanceWidth = (instance) => {
    return instance.hasCustomSize() ?
      instance.getCustomWidth() :
      this.renderedInstances[instance.ptr].getDefaultWidth();
  }

  getInstanceHeight = (instance) => {
    return instance.hasCustomSize() ?
      instance.getCustomHeight() :
      this.renderedInstances[instance.ptr].getDefaultHeight();
  }

  getRendererOfInstance = (instance) => {
    var renderedInstance = this.renderedInstances[instance.ptr];
    if ( renderedInstance === undefined ) {
      //No renderer associated yet, the instance must have been just created!...
      var associatedObjectName = instance.getObjectName();
      var associatedObject = null;
      if (this.layout.hasObjectNamed(associatedObjectName))
          associatedObject = this.layout.getObject(associatedObjectName);
      else if (this.project.hasObjectNamed(associatedObjectName))
          associatedObject = this.project.getObject(associatedObjectName);
      else return;

      //...so let's create a renderer.
      renderedInstance = this.renderedInstances[instance.ptr] =
          ObjectsRenderingService.createNewInstanceRenderer(this.project, this.layout, instance,
            associatedObject, this.pixiContainer);

      renderedInstance._pixiObject.interactive = true;
      gesture.panable(renderedInstance._pixiObject);
      renderedInstance._pixiObject.on('click', () => {
        this.onInstanceClicked(instance);
      });
      renderedInstance._pixiObject.on('mouseover', () => {
        this.onOverInstance(instance);
      });
      renderedInstance._pixiObject.on('mousedown', () => {
        this.onDownInstance(instance);
      });
      renderedInstance._pixiObject.on('mouseout', () => {
        this.onOutInstance(instance);
      });
      renderedInstance._pixiObject.on('panmove', (event) => {
        this.onMoveInstance(instance, event.deltaX, event.deltaY);
      });
    }

    return renderedInstance;
  }

  render() {
    this.instances.iterateOverInstancesWithZOrdering(this.instancesRenderer,
      this.layer.getName());
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
   * Clean up rendered instances that are not associated to any instance anymore
   * (this can happen after an instance has been deleted).
   */
  _cleanRenderers() {
    for(let i in this.renderedInstances) {
      if (this.renderedInstances.hasOwnProperty(i)) {
          const renderedInstance = this.renderedInstances[i];
          if (!renderedInstance.wasUsed) {
            renderedInstance.instanceRemovedFromScene();
            delete this.renderedInstances[i];
          }
          else
            renderedInstance.wasUsed = false;
      }
    }
  }

  delete() {
    this.instancesRenderer.delete();
  }
}
