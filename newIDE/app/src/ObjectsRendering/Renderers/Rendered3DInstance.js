// @flow
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import PixiResourcesLoader from '../PixiResourcesLoader';

/**
 * Rendered3DInstance is the base class used for creating 3D renderers of instances,
 * which display on the scene editor, using Three.js, the instance of an object (see InstancesEditor).
 * It can also display 2D artifacts on Pixi 2D plane (3D object shadow projected on the plane for instance).
 */
export default class Rendered3DInstance {
  _project: gdProject;
  _layout: gdLayout;
  _instance: gdInitialInstance;
  _associatedObjectConfiguration: gdObjectConfiguration;
  _pixiContainer: PIXI.Container;
  _threeGroup: THREE.Group;
  _pixiResourcesLoader: Class<PixiResourcesLoader>;
  _pixiObject: PIXI.DisplayObject;
  _threeObject: THREE.Object3D | null;
  wasUsed: boolean;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    this._pixiObject = null;
    this._threeObject = null;
    this._instance = instance;
    this._associatedObjectConfiguration = associatedObjectConfiguration;
    this._pixiContainer = pixiContainer;
    this._threeGroup = threeGroup;
    this._project = project;
    this._layout = layout;
    this._pixiResourcesLoader = pixiResourcesLoader;
    this.wasUsed = true; //Used by InstancesRenderer to track rendered instance that are not used anymore.
  }

  /**
   * Convert an angle from degrees to radians.
   */
  static toRad(angleInDegrees: number): number {
    return (angleInDegrees / 180) * Math.PI;
  }

  /**
   * Applies ratio to value without intermediary value to avoid precision issues.
   */
  static applyRatio({
    oldReferenceValue,
    newReferenceValue,
    valueToApplyTo,
  }: {|
    oldReferenceValue: number,
    newReferenceValue: number,
    valueToApplyTo: number,
  |}): number {
    return (newReferenceValue / oldReferenceValue) * valueToApplyTo;
  }

  /**
   * Called when the scene editor is rendered.
   */
  update() {
    //Nothing to do.
  }

  getPixiObject() {
    return this._pixiObject;
  }

  getThreeObject() {
    return this._threeObject;
  }

  getInstance() {
    return this._instance;
  }

  /**
   * Called to notify the instance renderer that its associated instance was removed from
   * the scene. The PIXI object should probably be removed from the container: This is what
   * the default implementation of the method does.
   */
  onRemovedFromScene() {
    if (this._pixiObject !== null)
      this._pixiContainer.removeChild(this._pixiObject);
    if (this._threeObject !== null) this._threeGroup.remove(this._threeObject);
  }

  getOriginX() {
    return 0;
  }

  getOriginY() {
    return 0;
  }

  getOriginZ() {
    return 0;
  }

  getCenterX() {
    return this.getWidth() / 2;
  }

  getCenterY() {
    return this.getHeight() / 2;
  }

  getCenterZ() {
    return this.getDepth() / 2;
  }

  getCustomWidth(): number {
    return this._instance.getCustomWidth();
  }

  getCustomHeight(): number {
    return this._instance.getCustomHeight();
  }

  getCustomDepth(): number {
    return this._instance.getCustomDepth();
  }

  getWidth(): number {
    return this._instance.hasCustomSize()
      ? this.getCustomWidth()
      : this.getDefaultWidth();
  }

  getHeight(): number {
    return this._instance.hasCustomSize()
      ? this.getCustomHeight()
      : this.getDefaultHeight();
  }

  getDepth(): number {
    // For compatibility, a custom depth can be used, without necessarily a custom width/height.
    return this._instance.hasCustomDepth()
      ? this.getCustomDepth()
      : this.getDefaultDepth();
  }

  /**
   * Return the width of the instance when the instance doesn't have a custom size.
   */
  getDefaultWidth() {
    return 32;
  }

  /**
   * Return the height of the instance when the instance doesn't have a custom size.
   */
  getDefaultHeight() {
    return 32;
  }

  /**
   * Return the depth of the instance when the instance doesn't have a custom size.
   */
  getDefaultDepth() {
    return 32;
  }
}
