import gesture from 'pixi-simple-gesture';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
const gd = global.gd;
const PIXI = global.PIXI;

export default class SceneRenderer {
  constructor({project, layout, instances, onInstanceClicked, onOverInstance, onOutInstance, onMoveInstance, onDownInstance}) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.onInstanceClicked = onInstanceClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onDownInstance = onDownInstance;

    this.renderedInstances = {};

    this.pixiSceneContainer = new PIXI.Container();
    this.pixiInstancesContainer = new PIXI.Container();
    this.pixiSceneContainer.addChild(this.pixiInstancesContainer);
    this.pixiGUIContainer = new PIXI.Container();
    this.pixiSceneContainer.addChild(this.pixiGUIContainer);

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
    return this.pixiSceneContainer;
  }


  getInstanceWidth = (instance) => {
      return instance.hasCustomSize() ?
          instance.getCustomWidth() : this.renderedInstances[instance.ptr].getDefaultWidth();
  }

  getInstanceHeight = (instance) => {
      return instance.hasCustomSize() ?
          instance.getCustomHeight() : this.renderedInstances[instance.ptr].getDefaultHeight();
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
                associatedObject, this.pixiInstancesContainer);

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

  updatePixiObjectsZOrder() {
    this.pixiInstancesContainer.children.sort((a, b) => {
        a.zOrder = a.zOrder || 0;
        b.zOrder = b.zOrder || 0;
        return a.zOrder - b.zOrder;
    });
  }

  render() {
    for (let i = 0; i < this.layout.getLayersCount(); i++) {
        var layerName = this.layout.getLayerAt(i).getName();
        this.instances.iterateOverInstancesWithZOrdering(this.instancesRenderer,
            layerName);
    }
    this.updatePixiObjectsZOrder();

    //Clean up rendered instances that are no more associated to any instance
    //(this can happen after an instance having been deleted).
    for(let i in this.renderedInstances) {
        if (this.renderedInstances.hasOwnProperty(i)) {
            var renderedInstance = this.renderedInstances[i];
            if (!renderedInstance.wasUsed) {
                renderedInstance.instanceRemovedFromScene();
                delete this.renderedInstances[i];
            }
            else
                renderedInstance.wasUsed = false;
        }
    }
  }
}
