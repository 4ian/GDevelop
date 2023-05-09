// @flow
import LayerRenderer from './LayerRenderer';
import ViewPosition from '../ViewPosition';
import BackgroundColor from '../BackgroundColor';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import Rectangle from '../../Utils/Rectangle';

export type InstanceMeasurer = {|
  getInstanceAABB: (gdInitialInstance, Rectangle) => Rectangle,
  getUnrotatedInstanceAABB: (gdInitialInstance, Rectangle) => Rectangle,
|};

export default class InstancesRenderer {
  project: gdProject;
  instances: gdInitialInstancesContainer;
  layout: gdLayout;
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

  layersRenderers: { [string]: LayerRenderer };

  /**
   * This container contains all the layers.
   * Layers are rendered one by one.
   * But, as only the last rendered container is used for interactions,
   * all layers are included in the last render call with an opacity of 0.
   */
  pixiContainer: PIXI.Container;

  temporaryRectangle: Rectangle;
  instanceMeasurer: InstanceMeasurer;

  constructor({
    project,
    layout,
    instances,
    viewPosition,
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
    this.viewPosition = viewPosition;
    this.onInstanceClicked = onInstanceClicked;
    this.onInstanceRightClicked = onInstanceRightClicked;
    this.onInstanceDoubleClicked = onInstanceDoubleClicked;
    this.onOverInstance = onOverInstance;
    this.onOutInstance = onOutInstance;
    this.onMoveInstance = onMoveInstance;
    this.onMoveInstanceEnd = onMoveInstanceEnd;
    this.onDownInstance = onDownInstance;

    this.layersRenderers = {};

    // This container is only used for user interactions.
    // Its content is not actually displayed.
    this.pixiContainer = new PIXI.Container();
    this.pixiContainer.alpha = 0;

    this.temporaryRectangle = new Rectangle();
    //TODO extract this to a class to have type checking (maybe rethink it)
    this.instanceMeasurer = {
      getInstanceAABB: (instance, bounds) => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) {
          bounds.left = instance.getX();
          bounds.top = instance.getY();
          bounds.right = instance.getX();
          bounds.bottom = instance.getY();
          return bounds;
        }

        return layerRenderer.getInstanceAABB(instance, bounds);
      },
      getUnrotatedInstanceAABB: (instance, bounds) => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) {
          bounds.left = instance.getX();
          bounds.top = instance.getY();
          bounds.right = instance.getX();
          bounds.bottom = instance.getY();
          return bounds;
        }

        return layerRenderer.getUnrotatedInstanceAABB(instance, bounds);
      },
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceMeasurer() {
    return this.instanceMeasurer;
  }

  render(pixiRenderer: PIXI.Renderer, threeRenderer: THREE.WebGLRenderer | null, viewPosition: ViewPosition, backgroundColor: BackgroundColor) {
    /** Useful to render the background color. */
    let isFirstRender = true;

    /**
     * true if the last layer rendered 3D objects using Three.js, false otherwise.
     * Useful to avoid needlessly resetting the WebGL states between layers (which can be expensive).
     */
    let lastRenderWas3d = true;

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
          onInstanceRightClicked: this.onInstanceRightClicked,
          onInstanceDoubleClicked: this.onInstanceDoubleClicked,
          onOverInstance: this.onOverInstance,
          onOutInstance: this.onOutInstance,
          onMoveInstance: this.onMoveInstance,
          onMoveInstanceEnd: this.onMoveInstanceEnd,
          onDownInstance: this.onDownInstance,
          pixiRenderer: pixiRenderer,
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
      const layerContainer = layerRenderer.getPixiContainer();
      viewPosition.applyTransformationToPixi(layerContainer);

      const threeCamera = layerRenderer.getThreeCamera();
      const threePlaneMesh = layerRenderer.getThreePlaneMesh();
      if (threeCamera && threePlaneMesh) {
        viewPosition.applyTransformationToThree(threeCamera, threePlaneMesh);
      }

      if (!threeRenderer) {
        // Render a layer with 2D rendering (PixiJS) only.

        if (lastRenderWas3d) {
          // Ensure the state is clean for PixiJS to render.
          if (threeRenderer) {
            threeRenderer.resetState();
          }
          pixiRenderer.reset();
        }

        if (isFirstRender) {
          // Render the background color.
          backgroundColor.setBackgroundColorForPixi(pixiRenderer);
          pixiRenderer.backgroundAlpha = 1;
          pixiRenderer.clear();

          isFirstRender = false;
        }

        pixiRenderer.render(layerContainer, { clear: false });

        lastRenderWas3d = false;
      } else {
        // Render a layer with 3D rendering, and possibly some 2D rendering too.
        const threeScene = layerRenderer.getThreeScene();
        const threeCamera = layerRenderer.getThreeCamera();

        // Render the 3D objects of this layer.
        if (threeScene && threeCamera) {
          // TODO (3D) - optimization: do this at the beginning for all layers that are 2d+3d?
          // So the second pass is clearer (just rendering 2d or 3d layers without doing PixiJS renders in between).
          if (lastRenderWas3d) {
            // Ensure the state is clean for PixiJS to render.
            threeRenderer.resetState();
            pixiRenderer.reset();
          }
          // Do the rendering of the PixiJS objects of the layer on the render texture.
          // Then, update the texture of the plane showing the PixiJS rendering,
          // so that the 2D rendering made by PixiJS can be shown in the 3D world.
          layerRenderer.renderOnPixiRenderTexture(pixiRenderer);
          layerRenderer.updateThreePlaneTextureFromPixiRenderTexture(
            // The renderers are needed to find the internal WebGL texture.
            threeRenderer,
            pixiRenderer
          );
          lastRenderWas3d = false;

          if (!lastRenderWas3d) {
            // It's important to reset the internal WebGL state of PixiJS, then Three.js
            // to ensure the 3D rendering is made properly by Three.js
            pixiRenderer.reset();
            threeRenderer.resetState();
          }

          if (isFirstRender) {
            // Render the background color.
            backgroundColor.setBackgroundColorForThree(threeRenderer, threeScene);
            threeRenderer.resetState();
            threeRenderer.clear();

            isFirstRender = false;
          }

          // Clear the depth as each layer is independent and display on top of the previous one,
          // even 3D objects.
          threeRenderer.clearDepth();
          threeRenderer.render(threeScene, threeCamera);

          lastRenderWas3d = true;
        }
      }
    }
    this._updatePixiObjectsZOrder();
    this._cleanUnusedLayerRenderers();
  }

  _updatePixiObjectsZOrder() {
    this.pixiContainer.children.sort((a, b) => {
      a.zOrder = a.zOrder || 0;
      b.zOrder = b.zOrder || 0;
      return a.zOrder - b.zOrder;
    });
  }

  /**
   * Delete instance renderers of the specified objects, which will then be recreated during
   * the next render.
   * @param {string} objectName The name of the object for which instance must be re-rendered.
   */
  resetInstanceRenderersFor(objectName: string) {
    for (let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        const layerRenderer = this.layersRenderers[i];
        layerRenderer.resetInstanceRenderersFor(objectName);
      }
    }
  }

  /**
   * Clean up rendered layers that are not existing anymore
   */
  _cleanUnusedLayerRenderers() {
    for (let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        const layerRenderer = this.layersRenderers[i];
        if (!layerRenderer.wasUsed) {
          layerRenderer.delete();
          delete this.layersRenderers[i];
        } else layerRenderer.wasUsed = false;
      }
    }
  }

  delete() {
    // Destroy the layers first.
    for (let i in this.layersRenderers) {
      if (this.layersRenderers.hasOwnProperty(i)) {
        this.layersRenderers[i].delete();
      }
    }
  }
}
