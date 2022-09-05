// @flow
import gesture from 'pixi-simple-gesture';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import RenderedInstance from '../../ObjectsRendering/Renderers/RenderedInstance';
import getObjectByName from '../../Utils/GetObjectByName';
import ViewPosition from '../ViewPosition';

import * as PIXI from 'pixi.js-legacy';
import { shouldBeHandledByPinch } from '../PinchHandler';
import { makeDoubleClickable } from './PixiDoubleClickEvent';
import Rectangle from '../../Utils/Rectangle';
import { rotatePolygon, type Polygon } from '../../Utils/PolygonHelper';
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
  onInstanceRightClicked: ({|
    offsetX: number,
    offsetY: number,
    x: number,
    y: number,
  |}) => void;
  onInstanceDoubleClicked: gdInitialInstance => void;
  onOverInstance: gdInitialInstance => void;
  onOutInstance: gdInitialInstance => void;
  onMoveInstance: (gdInitialInstance, number, number) => void;
  onMoveInstanceEnd: void => void;
  onDownInstance: (gdInitialInstance, number, number) => void;
  /**Used for instances culling on rendering */
  viewTopLeft: [number, number];
  /** Used for instances culling on rendering */
  viewBottomRight: [number, number];

  renderedInstances: { [number]: RenderedInstance } = {};
  pixiContainer: PIXI.Container;

  /** Functor used to render an instance */
  instancesRenderer: gdInitialInstanceJSFunctor;

  wasUsed: boolean = false;

  _temporaryRectangle: Rectangle = new Rectangle();
  _temporaryRectanglePath: Polygon = [[0, 0], [0, 0], [0, 0], [0, 0]];

  constructor({
    project,
    layout,
    layer,
    viewPosition,
    instances,
    onInstanceClicked,
    onInstanceRightClicked,
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
    onInstanceRightClicked: ({|
      offsetX: number,
      offsetY: number,
      x: number,
      y: number,
    |}) => void,
    onInstanceDoubleClicked: gdInitialInstance => void,
    onOverInstance: gdInitialInstance => void,
    onOutInstance: gdInitialInstance => void,
    onMoveInstance: (gdInitialInstance, number, number) => void,
    onMoveInstanceEnd: void => void,
    onDownInstance: (gdInitialInstance, number, number) => void,
  }) {
    this.project = project;
    this.instances = instances;
    this.layout = layout;
    this.layer = layer; // /!\ Don't store any other reference.
    // `layer` can be changed at any moment (see InstancesRenderer).
    this.viewPosition = viewPosition;
    this.onInstanceClicked = onInstanceClicked;
    this.onInstanceRightClicked = onInstanceRightClicked;
    this.onInstanceDoubleClicked = onInstanceDoubleClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onMoveInstanceEnd = onMoveInstanceEnd;
    this.onDownInstance = onDownInstance;

    this.viewTopLeft = [0, 0]; // Used for instances culling on rendering
    this.viewBottomRight = [0, 0]; // Used for instances culling on rendering

    this.pixiContainer = new PIXI.Container();

    // Functor used to render an instance
    this.instancesRenderer = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - invoke is not writable
    this.instancesRenderer.invoke = instancePtr => {
      // $FlowFixMe - wrapPointer is not exposed
      const instance: gdInitialInstance = gd.wrapPointer(
        instancePtr,
        gd.InitialInstance
      );

      //Get the "RendereredInstance" object associated to the instance and tell it to update.
      var renderedInstance: ?RenderedInstance = this.getRendererOfInstance(
        instance
      );
      if (!renderedInstance) return;

      const pixiObject = renderedInstance.getPixiObject();
      if (pixiObject) pixiObject.zOrder = instance.getZOrder();

      // "Culling" improves rendering performance of large levels
      const isVisible = this._isInstanceVisible(instance);
      if (pixiObject) {
        pixiObject.visible = isVisible;
        pixiObject.interactive = !(instance.isLocked() && instance.isSealed());
      }
      if (isVisible) renderedInstance.update();

      renderedInstance.wasUsed = true;
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getUnrotatedInstanceLeft = (instance: gdInitialInstance) => {
    return (
      instance.getX() -
      (this.renderedInstances[instance.ptr]
        ? this.renderedInstances[instance.ptr].getOriginX()
        : 0)
    );
  };

  getUnrotatedInstanceTop = (instance: gdInitialInstance) => {
    return (
      instance.getY() -
      (this.renderedInstances[instance.ptr]
        ? this.renderedInstances[instance.ptr].getOriginY()
        : 0)
    );
  };

  getUnrotatedInstanceWidth = (instance: gdInitialInstance) => {
    if (instance.hasCustomSize()) return instance.getCustomWidth();

    return this.renderedInstances[instance.ptr]
      ? this.renderedInstances[instance.ptr].getDefaultWidth()
      : 0;
  };

  getUnrotatedInstanceHeight = (instance: gdInitialInstance) => {
    if (instance.hasCustomSize()) return instance.getCustomHeight();

    return this.renderedInstances[instance.ptr]
      ? this.renderedInstances[instance.ptr].getDefaultHeight()
      : 0;
  };

  getUnrotatedInstanceAABB(
    instance: gdInitialInstance,
    bounds: Rectangle
  ): Rectangle {
    const left = this.getUnrotatedInstanceLeft(instance);
    const top = this.getUnrotatedInstanceTop(instance);
    const right = left + this.getUnrotatedInstanceWidth(instance);
    const bottom = top + this.getUnrotatedInstanceHeight(instance);

    bounds.left = left;
    bounds.right = right;
    bounds.top = top;
    bounds.bottom = bottom;
    return bounds;
  }

  _getInstanceRotatedRectangle(instance: gdInitialInstance): Polygon {
    const left = this.getUnrotatedInstanceLeft(instance);
    const top = this.getUnrotatedInstanceTop(instance);
    const right = left + this.getUnrotatedInstanceWidth(instance);
    const bottom = top + this.getUnrotatedInstanceHeight(instance);

    const rectangle = this._temporaryRectanglePath;

    rectangle[0][0] = left;
    rectangle[0][1] = top;

    rectangle[1][0] = left;
    rectangle[1][1] = bottom;

    rectangle[2][0] = right;
    rectangle[2][1] = bottom;

    rectangle[3][0] = right;
    rectangle[3][1] = top;

    const centerX = (rectangle[0][0] + rectangle[2][0]) / 2;
    const centerY = (rectangle[0][1] + rectangle[2][1]) / 2;
    const angle = (instance.getAngle() * Math.PI) / 180;
    rotatePolygon(rectangle, centerX, centerY, angle);
    return rectangle;
  }

  getInstanceAABB(instance: gdInitialInstance, bounds: Rectangle): Rectangle {
    const angle = (instance.getAngle() * Math.PI) / 180;
    if (angle === 0) {
      return this.getUnrotatedInstanceAABB(instance, bounds);
    }

    const rotatedRectangle = this._getInstanceRotatedRectangle(instance);

    let left = Number.MAX_VALUE;
    let right = -Number.MAX_VALUE;
    let top = Number.MAX_VALUE;
    let bottom = -Number.MAX_VALUE;
    for (let i = 0, len = rotatedRectangle.length; i < len; ++i) {
      left = Math.min(left, rotatedRectangle[i][0]);
      right = Math.max(right, rotatedRectangle[i][0]);
      top = Math.min(top, rotatedRectangle[i][1]);
      bottom = Math.max(bottom, rotatedRectangle[i][1]);
    }
    bounds.left = left;
    bounds.right = right;
    bounds.top = top;
    bounds.bottom = bottom;
    return bounds;
  }

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
        associatedObject.getConfiguration(),
        this.pixiContainer
      );

      renderedInstance._pixiObject.interactive = true;
      gesture.panable(renderedInstance._pixiObject);
      makeDoubleClickable(renderedInstance._pixiObject);
      renderedInstance._pixiObject.on('click', event => {
        if (event.data.originalEvent.button === 0)
          this.onInstanceClicked(instance);
      });
      renderedInstance._pixiObject.on('doubleclick', () => {
        this.onInstanceDoubleClicked(instance);
      });
      renderedInstance._pixiObject.on('mouseover', () => {
        this.onOverInstance(instance);
      });
      renderedInstance._pixiObject.on(
        'mousedown',
        (event: PIXI.InteractionEvent) => {
          if (event.data.originalEvent.button === 0) {
            const viewPoint = event.data.global;
            const scenePoint = this.viewPosition.toSceneCoordinates(
              viewPoint.x,
              viewPoint.y
            );
            this.onDownInstance(instance, scenePoint[0], scenePoint[1]);
          }
        }
      );
      renderedInstance._pixiObject.on('rightclick', interactionEvent => {
        const {
          data: { global: viewPoint, originalEvent: event },
        } = interactionEvent;

        // First select the instance
        const scenePoint = this.viewPosition.toSceneCoordinates(
          viewPoint.x,
          viewPoint.y
        );
        this.onDownInstance(instance, scenePoint[0], scenePoint[1]);

        // Then call right click callback
        if (this.onInstanceRightClicked) {
          this.onInstanceRightClicked({
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            x: event.clientX,
            y: event.clientY,
          });
        }

        return false;
      });
      renderedInstance._pixiObject.on('touchstart', event => {
        if (shouldBeHandledByPinch(event.data && event.data.originalEvent)) {
          return null;
        }

        const viewPoint = event.data.global;
        const scenePoint = this.viewPosition.toSceneCoordinates(
          viewPoint.x,
          viewPoint.y
        );
        this.onDownInstance(instance, scenePoint[0], scenePoint[1]);
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
   * levels (though this could be improved with spatial partitioning).
   */
  _isInstanceVisible(instance: gdInitialInstance) {
    const aabb = this.getInstanceAABB(instance, this._temporaryRectangle);
    if (
      aabb.left + aabb.width() < this.viewTopLeft[0] ||
      aabb.top + aabb.height() < this.viewTopLeft[1] ||
      aabb.left > this.viewBottomRight[0] ||
      aabb.top > this.viewBottomRight[1]
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
      // $FlowFixMe - gd.castObject is not supporting typings.
      this.instancesRenderer,
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

    // Destroy the object iterating on instances
    this.instancesRenderer.delete();
  }
}
