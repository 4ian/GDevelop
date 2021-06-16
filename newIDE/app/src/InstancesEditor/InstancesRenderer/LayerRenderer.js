// @flow
import gesture from 'pixi-simple-gesture';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import RenderedInstance from '../../ObjectsRendering/Renderers/RenderedInstance';
import getObjectByName from '../../Utils/GetObjectByName';
import ViewPosition from '../ViewPosition';

import * as PIXI from 'pixi.js-legacy';
import { shouldBeHandledByPinch } from '../PinchHandler';
import { makeDoubleClickable } from './PixiDoubleClickEvent';
const gd: libGDevelop = global.gd;

export default class LayerRenderer {
  project: gdProject;
  instances: gdInitialInstancesContainer;
  layout: gdLayout;
  /** `layer` can be changed at any moment (see InstancesRenderer).
   * /!\ Don't store any other reference.
   */
  layer: gdLayer;
  viewPosition: ViewPosition;
  onInstanceClicked: gdInitialInstance => void;
  onInstanceDoubleClicked: gdInitialInstance => void;
  onOverInstance: gdInitialInstance => void;
  onOutInstance: gdInitialInstance => void;
  onMoveInstance: (gdInitialInstance, number, number) => void;
  onMoveInstanceEnd: void => void;
  onDownInstance: gdInitialInstance => void;
  /**Used for instances culling on rendering */
  viewTopLeft: [number, number];
  /** Used for instances culling on rendering */
  viewBottomRight: [number, number];

  renderedInstances: { [number]: RenderedInstance };
  pixiContainer: PIXI.Container;

  /** Functor used to render an instance */
  instancesRenderer: gdInitialInstanceJSFunctor;

  wasUsed: boolean = false;

  constructor({
    project,
    layout,
    layer,
    viewPosition,
    instances,
    onInstanceClicked,
    onInstanceDoubleClicked,
    onOverInstance,
    onOutInstance,
    onMoveInstance,
    onMoveInstanceEnd,
    onDownInstance,
  }: {
    project: gdProject,
    instances: gdInitialInstancesContainer,
    layout: gdLayout,
    layer: gdLayer,
    viewPosition: ViewPosition,
    onInstanceClicked: gdInitialInstance => void,
    onInstanceDoubleClicked: gdInitialInstance => void,
    onOverInstance: gdInitialInstance => void,
    onOutInstance: gdInitialInstance => void,
    onMoveInstance: (gdInitialInstance, number, number) => void,
    onMoveInstanceEnd: void => void,
    onDownInstance: gdInitialInstance => void,
  }) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.layer = layer; // /!\ Don't store any other reference.
    // `layer` can be changed at any moment (see InstancesRenderer).
    this.viewPosition = viewPosition;
    this.onInstanceClicked = onInstanceClicked;
    this.onInstanceDoubleClicked = onInstanceDoubleClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onMoveInstanceEnd = onMoveInstanceEnd;
    this.onDownInstance = onDownInstance;

    this.viewTopLeft = [0, 0]; // Used for instances culling on rendering
    this.viewBottomRight = [0, 0]; // Used for instances culling on rendering

    this.renderedInstances = {};
    this.pixiContainer = new PIXI.Container();

    // Functor used to render an instance
    this.instancesRenderer = new gd.InitialInstanceJSFunctor();
    this.instancesRenderer.invoke = instancePtr => {
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);

      //Get the "RendereredInstance" object associated to the instance and tell it to update.
      var renderedInstance: ?RenderedInstance = this.getRendererOfInstance(
        instance
      );
      if (!renderedInstance) return;

      const pixiObject = renderedInstance.getPixiObject();
      if (pixiObject) pixiObject.zOrder = instance.getZOrder();
      if (pixiObject) pixiObject.interactive = !instance.isLocked();

      // "Culling" improves rendering performance of large levels
      const isVisible = this._isInstanceVisible(instance);
      if (pixiObject) pixiObject.visible = isVisible;
      if (isVisible) renderedInstance.update();

      renderedInstance.wasUsed = true;
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceLeft = (instance: gdInitialInstance) => {
    return (
      instance.getX() -
      (this.renderedInstances[instance.ptr]
        ? this.renderedInstances[instance.ptr].getOriginX()
        : 0)
    );
  };

  getInstanceTop = (instance: gdInitialInstance) => {
    return (
      instance.getY() -
      (this.renderedInstances[instance.ptr]
        ? this.renderedInstances[instance.ptr].getOriginY()
        : 0)
    );
  };

  getInstanceWidth = (instance: gdInitialInstance) => {
    if (instance.hasCustomSize()) return instance.getCustomWidth();

    return this.renderedInstances[instance.ptr]
      ? this.renderedInstances[instance.ptr].getDefaultWidth()
      : 0;
  };

  getInstanceHeight = (instance: gdInitialInstance) => {
    if (instance.hasCustomSize()) return instance.getCustomHeight();

    return this.renderedInstances[instance.ptr]
      ? this.renderedInstances[instance.ptr].getDefaultHeight()
      : 0;
  };

  getRendererOfInstance = (instance: gdInitialInstance) => {
    var renderedInstance = this.renderedInstances[instance.ptr];
    if (renderedInstance === undefined) {
      //No renderer associated yet, the instance must have been just created!...
      const associatedObjectName = instance.getObjectName();
      const associatedObject = getObjectByName(
        this.project,
        this.layout,
        associatedObjectName
      );
      if (!associatedObject) return null;

      //...so let's create a renderer.
      renderedInstance = this.renderedInstances[
        instance.ptr
      ] = ObjectsRenderingService.createNewInstanceRenderer(
        this.project,
        this.layout,
        instance,
        associatedObject,
        this.pixiContainer
      );

      renderedInstance._pixiObject.interactive = true;
      gesture.panable(renderedInstance._pixiObject);
      makeDoubleClickable(renderedInstance._pixiObject);
      renderedInstance._pixiObject.on('click', () => {
        this.onInstanceClicked(instance);
      });
      renderedInstance._pixiObject.on('doubleclick', () => {
        this.onInstanceDoubleClicked(instance);
      });
      renderedInstance._pixiObject.on('mouseover', () => {
        this.onOverInstance(instance);
      });
      renderedInstance._pixiObject.on('mousedown', () => {
        this.onDownInstance(instance);
      });
      renderedInstance._pixiObject.on('touchstart', event => {
        if (shouldBeHandledByPinch(event.data && event.data.originalEvent)) {
          return null;
        }

        this.onDownInstance(instance);
      });
      renderedInstance._pixiObject.on('mouseout', () => {
        this.onOutInstance(instance);
      });
      renderedInstance._pixiObject.on('panmove', event => {
        if (shouldBeHandledByPinch(event.data && event.data.originalEvent)) {
          return null;
        }

        this.onMoveInstance(instance, event.deltaX, event.deltaY);
      });
      renderedInstance._pixiObject.on('panend', event => {
        this.onMoveInstanceEnd();
      });
    }

    return renderedInstance;
  };

  /**
   * This returns true if an instance is visible according to the viewPosition.
   * The approach is a naive bounding box testing but save rendering time on large
   * levels.
   * @param {*} instance
   */
  _isInstanceVisible(instance: gdInitialInstance) {
    //TODO: Properly handle rotation
    const left = this.getInstanceLeft(instance);
    const top = this.getInstanceTop(instance);
    if (
      left + this.getInstanceWidth(instance) < this.viewTopLeft[0] ||
      top + this.getInstanceHeight(instance) < this.viewTopLeft[1] ||
      left > this.viewBottomRight[0] ||
      top > this.viewBottomRight[1]
    )
      return false;

    return true;
  }

  _computeViewBounds() {
    // Add a margin of 100 pixels around the view. Culling will hide PIXI objects,
    // and hidden objects won't respond to events. Hence, a margin allow the cursor to go
    // slightly out of the canvas when moving an instance, and still have the instance
    // to follow the cursor.
    const margin = 100;
    this.viewTopLeft = this.viewPosition.toSceneCoordinates(-margin, -margin);
    this.viewBottomRight = this.viewPosition.toSceneCoordinates(
      this.viewPosition.getWidth() + margin,
      this.viewPosition.getHeight() + margin
    );
  }

  render() {
    this._computeViewBounds();
    this.instances.iterateOverInstancesWithZOrdering(
      gd.castObject(this.instancesRenderer, gd.InitialInstanceFunctor),
      this.layer.getName()
    );
    this._updatePixiObjectsZOrder();
    this._updateVisibility();
    this._destroyUnusedInstanceRenderers();
  }

  _updatePixiObjectsZOrder() {
    this.pixiContainer.children.sort((a, b) => {
      a.zOrder = a.zOrder || 0;
      b.zOrder = b.zOrder || 0;
      return a.zOrder - b.zOrder;
    });
  }

  _updateVisibility() {
    this.pixiContainer.visible = this.layer.getVisibility();
  }

  /**
   * Delete instance renderers of the specified objects, which will then be recreated during
   * the next render.
   * @param {string} objectName The name of the object for which instance must be re-rendered.
   */
  resetInstanceRenderersFor(objectName: string) {
    for (let s in this.renderedInstances) {
      let i = Number(s);
      if (this.renderedInstances.hasOwnProperty(i)) {
        const renderedInstance = this.renderedInstances[i];
        if (renderedInstance.getInstance().getObjectName() === objectName) {
          renderedInstance.onRemovedFromScene();
          delete this.renderedInstances[i];
        }
      }
    }
  }

  /**
   * Remove rendered instances that are not associated to any instance anymore
   * (this can happen after an instance has been deleted).
   */
  _destroyUnusedInstanceRenderers() {
    for (let s in this.renderedInstances) {
      let i = Number(s);
      if (this.renderedInstances.hasOwnProperty(i)) {
        const renderedInstance = this.renderedInstances[i];
        if (!renderedInstance.wasUsed) {
          renderedInstance.onRemovedFromScene();
          delete this.renderedInstances[i];
        } else renderedInstance.wasUsed = false;
      }
    }
  }

  delete() {
    // Destroy all instances
    for (let s in this.renderedInstances) {
      let i = Number(s);
      if (this.renderedInstances.hasOwnProperty(i)) {
        const renderedInstance = this.renderedInstances[i];
        renderedInstance.onRemovedFromScene(); // TODO: pass argument to tell it's even worth removing from container?
        delete this.renderedInstances[i];
      }
    }

    // Destroy the container
    this.pixiContainer.destroy();

    // Destroy the object iterating on isntances
    this.instancesRenderer.delete();
  }
}
