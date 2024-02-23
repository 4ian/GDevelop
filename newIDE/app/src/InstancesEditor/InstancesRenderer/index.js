// @flow
import LayerRenderer from './LayerRenderer';
import ViewPosition from '../ViewPosition';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import { rgbToHexNumber } from '../../Utils/ColorTransformer';
import Rectangle from '../../Utils/Rectangle';

export type InstanceMeasurer = {|
  getInstanceAABB: (gdInitialInstance, Rectangle) => Rectangle,
  getUnrotatedInstanceAABB: (gdInitialInstance, Rectangle) => Rectangle,
  getUnrotatedInstanceSize: gdInitialInstance => [number, number, number],
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
  _showObjectInstancesIn3D: boolean;
  onInstanceDoubleClicked: gdInitialInstance => void;
  onOverInstance: gdInitialInstance => void;
  onOutInstance: gdInitialInstance => void;
  onMoveInstance: (gdInitialInstance, number, number) => void;
  onMoveInstanceEnd: void => void;
  onDownInstance: (gdInitialInstance, number, number) => void;
  onUpInstance: (gdInitialInstance, number, number) => void;

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
    onUpInstance,
    showObjectInstancesIn3D,
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
    onUpInstance: (gdInitialInstance, number, number) => void,
    showObjectInstancesIn3D: boolean,
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
    this.onUpInstance = onUpInstance;

    this._showObjectInstancesIn3D = showObjectInstancesIn3D;
    this.layersRenderers = {};

    // This container is only used for user interactions.
    // Its content is not actually displayed.
    // TODO (3D) Check that it doesn't make the rendering slower.
    // TODO (3D) Should this container be used for the 2d editor
    //           instead of rendering layer one by one?
    // TODO (3D) Should this container be used instead of THREE
    //           when the scene is zoomed out?
    this.pixiContainer = new PIXI.Container();
    this.pixiContainer.alpha = 0;

    this.temporaryRectangle = new Rectangle();
    // TODO extract this to a class to have type checking (maybe rethink it)
    this.instanceMeasurer = {
      getInstanceAABB: (instance, bounds) => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) {
          bounds.left = instance.getX();
          bounds.top = instance.getY();
          bounds.right = instance.getX();
          bounds.bottom = instance.getY();
          bounds.zMin = 0;
          bounds.zMax = 0;

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
          bounds.zMin = 0;
          bounds.zMax = 0;

          return bounds;
        }

        return layerRenderer.getUnrotatedInstanceAABB(instance, bounds);
      },
      getUnrotatedInstanceSize: instance => {
        const layerName = instance.getLayer();
        const layerRenderer = this.layersRenderers[layerName];
        if (!layerRenderer) {
          return [0, 0, 0];
        }

        return layerRenderer.getUnrotatedInstanceSize(instance);
      },
    };
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  getInstanceMeasurer() {
    return this.instanceMeasurer;
  }

  render(
    pixiRenderer: PIXI.Renderer,
    threeRenderer: THREE.WebGLRenderer | null,
    viewPosition: ViewPosition,
    uiPixiContainer: PIXI.Container
  ) {
    /** Useful to render the background color. */
    let isFirstRender = true;

    // Even if no rendering at all has been made already, setting up the Three.js/PixiJS renderers
    // might have changed some WebGL states already. Reset the state for the very first frame.
    // And, out of caution, keep doing it for every frame.
    if (threeRenderer) threeRenderer.resetState();

    const backgroundColor = rgbToHexNumber(
      this.layout.getBackgroundColorRed(),
      this.layout.getBackgroundColorGreen(),
      this.layout.getBackgroundColorBlue()
    );

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
          onUpInstance: this.onUpInstance,
          pixiRenderer: pixiRenderer,
          showObjectInstancesIn3D: this._showObjectInstancesIn3D,
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
        threeCamera.fov = layer.getCamera3DFieldOfView();
      }

      if (!threeRenderer) {
        // Render a layer with 2D rendering (PixiJS) only.

        if (isFirstRender) {
          // Ensure the state is clean for PixiJS to render.
          pixiRenderer.reset();

          // Render the background color.
          pixiRenderer.backgroundColor = backgroundColor;
          pixiRenderer.backgroundAlpha = 1;
          pixiRenderer.clear();

          isFirstRender = false;
        }

        pixiRenderer.render(layerContainer, { clear: false });
      } else {
        // Render a layer with 3D rendering, and possibly some 2D rendering too.
        const threeScene = layerRenderer.getThreeScene();
        const threeCamera = layerRenderer.getThreeCamera();

        // Render the 3D objects of this layer.
        if (threeScene && threeCamera) {
          // It's important to reset the internal WebGL state of Three.js then PixiJS
          // to ensure the Three rendering does not impact the Pixi rendering.
          threeRenderer.resetState();
          pixiRenderer.reset();

          // Do the rendering of the PixiJS objects of the layer on the render texture.
          // Then, update the texture of the plane showing the PixiJS rendering,
          // so that the 2D rendering made by PixiJS can be shown in the 3D world.
          layerRenderer.renderOnPixiRenderTexture(pixiRenderer);
          layerRenderer.updateThreePlaneTextureFromPixiRenderTexture(
            // The renderers are needed to find the internal WebGL texture.
            threeRenderer,
            pixiRenderer
          );

          // It's important to reset the internal WebGL state of PixiJS, then Three.js
          // to ensure the 3D rendering is made properly by Three.js
          pixiRenderer.reset();
          threeRenderer.resetState();

          if (isFirstRender) {
            // Render the background color.
            threeRenderer.setClearColor(backgroundColor);
            threeRenderer.resetState(); // Probably not needed, but keep it out of caution.
            threeRenderer.clear();
            threeScene.background = new THREE.Color(backgroundColor);

            isFirstRender = false;
          } else {
            // It's important to set the background to null, as maybe the first rendered
            // layer has changed and so the Three.js scene background must be reset.
            threeScene.background = null;
          }

          // Clear the depth as each layer is independent and display on top of the previous one,
          // even 3D objects.
          threeRenderer.clearDepth();
          threeRenderer.render(threeScene, threeCamera);
        }
      }
    }
    this._updatePixiObjectsZOrder();
    this._cleanUnusedLayerRenderers();

    if (threeRenderer) {
      // Ensure the state is clean for PixiJS to render.
      threeRenderer.resetState();
      pixiRenderer.reset();
    }

    pixiRenderer.render(uiPixiContainer);

    if (threeRenderer) {
      // It's important to reset the internal WebGL state of PixiJS, then Three.js
      // to ensure the 3D rendering is made properly by Three.js
      pixiRenderer.reset();
      threeRenderer.resetState();
    }
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
    this.pixiContainer.destroy();
  }
}
