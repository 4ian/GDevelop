// @flow
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import Rectangle from '../Utils/Rectangle';
import { type InstancesEditorSettings } from './InstancesEditorSettings';
import RenderedInstance from '../ObjectsRendering/Renderers/RenderedInstance';

type Props = {|
  initialViewX: number,
  initialViewY: number,
  width: number,
  height: number,
  instancesEditorSettings: InstancesEditorSettings,
|};

export default class ViewPosition {
  viewX: number = 0;
  viewY: number = 0;
  _width: number;
  _height: number;
  instancesEditorSettings: InstancesEditorSettings;
  _pixiContainer = new PIXI.Container();

  constructor({
    initialViewX,
    initialViewY,
    width,
    height,
    instancesEditorSettings,
  }: Props) {
    this.viewX = initialViewX;
    this.viewY = initialViewY;
    this.instancesEditorSettings = instancesEditorSettings;
    this.resize(width, height);
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  containsPoint(x: number, y: number) {
    const canvasPoint = this.toCanvasCoordinates(x, y);
    return (
      0 <= canvasPoint[0] &&
      canvasPoint[0] <= this._width &&
      0 <= canvasPoint[1] &&
      canvasPoint[1] <= this._height
    );
  }

  /**
   * Convert a point from the canvas coordinates (for example, the mouse position) to the
   * "world" coordinates.
   */
  toSceneCoordinates = (x: number, y: number): [number, number] => {
    x -= this._width / 2;
    y -= this._height / 2;
    x /= Math.abs(this.instancesEditorSettings.zoomFactor);
    y /= Math.abs(this.instancesEditorSettings.zoomFactor);

    var viewRotation = 0;
    var tmp = x;
    x =
      Math.cos((viewRotation / 180) * Math.PI) * x -
      Math.sin((viewRotation / 180) * Math.PI) * y;
    y =
      Math.sin((viewRotation / 180) * Math.PI) * tmp +
      Math.cos((viewRotation / 180) * Math.PI) * y;

    return [x + this.viewX, y + this.viewY];
  };

  /**
   * Convert a length from canvas referential to scene referential.
   */
  toSceneScale = (a: number): number =>
    this.instancesEditorSettings.zoomFactor === 0
      ? a
      : a / Math.abs(this.instancesEditorSettings.zoomFactor);

  /**
   * Convert a point from the "world" coordinates (for example, an object position) to the
   * canvas coordinates.
   */
  toCanvasCoordinates = (x: number, y: number): [number, number] => {
    x -= this.viewX;
    y -= this.viewY;

    var viewRotation = -0;
    var tmp = x;
    x =
      Math.cos((viewRotation / 180) * Math.PI) * x -
      Math.sin((viewRotation / 180) * Math.PI) * y;
    y =
      Math.sin((viewRotation / 180) * Math.PI) * tmp +
      Math.cos((viewRotation / 180) * Math.PI) * y;

    x *= Math.abs(this.instancesEditorSettings.zoomFactor);
    y *= Math.abs(this.instancesEditorSettings.zoomFactor);

    return [x + this._width / 2, y + this._height / 2];
  };

  scrollBy(x: number, y: number) {
    this.viewX += x;
    this.viewY += y;
  }

  scrollTo(x: number, y: number) {
    this.viewX = x;
    this.viewY = y;
  }

  /**
   * Moves view to the rectangle center and returns the ideal zoom
   * factor to fit to the rectangle.
   */
  fitToRectangle(rectangle: Rectangle): number {
    this.viewX = rectangle.centerX();
    this.viewY = rectangle.centerY();
    const idealZoomOnX = this._width / rectangle.width();
    const idealZoomOnY = this._height / rectangle.height();

    return Math.min(idealZoomOnX, idealZoomOnY) * 0.95; // Add margin so that the object doesn't feel cut
  }

  getViewX() {
    return this.viewX;
  }

  getViewY() {
    return this.viewY;
  }

  applyTransformationToPixi(container: PIXI.Container) {
    container.position.x =
      -this.viewX * this.instancesEditorSettings.zoomFactor;
    container.position.y =
      -this.viewY * this.instancesEditorSettings.zoomFactor;
    container.position.x += this._width / 2;
    container.position.y += this._height / 2;
    container.scale.x = this.instancesEditorSettings.zoomFactor;
    container.scale.y = this.instancesEditorSettings.zoomFactor;
  }

  applyTransformationToThree(
    threeCamera: THREE.Camera,
    threePlaneMesh: THREE.Mesh
  ) {
    threeCamera.aspect = this._width / this._height;

    const zoomFactor = this.instancesEditorSettings.zoomFactor;

    threeCamera.position.x = this.viewX;
    threeCamera.position.y = -this.viewY; // Inverted because the scene is mirrored on Y axis.
    threeCamera.rotation.z = 0;

    // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
    // The Z position is computed by taking the half height of the displayed rendering,
    // and using the angle of the triangle defined by the field of view to compute the length
    // of the triangle defining the distance between the camera and the rendering plane.
    const cameraFovInRadians = RenderedInstance.toRad(threeCamera.fov);
    const cameraZPosition =
      (0.5 * this._height) / zoomFactor / Math.tan(0.5 * cameraFovInRadians);
    threeCamera.position.z = cameraZPosition;
    threeCamera.far = cameraZPosition + 2000;
    threeCamera.updateProjectionMatrix();

    // Adapt the plane size so that it covers the whole screen.
    threePlaneMesh.scale.x = this._width / zoomFactor;
    threePlaneMesh.scale.y = this._height / zoomFactor;
    // Adapt the plane position so that it's always displayed on the whole screen.
    threePlaneMesh.position.x = threeCamera.position.x;
    threePlaneMesh.position.y = -threeCamera.position.y; // Inverted because the scene is mirrored on Y axis.
    threePlaneMesh.rotation.z = 0;
  }
}
