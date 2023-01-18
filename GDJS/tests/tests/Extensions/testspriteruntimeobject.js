/**
 * A test object doing nothing, with a customizable width/height and a customizable
 * center point.
 *
 * It's only used for testing: if you want
 * an example to start a new object, take a look at gdjs.DummyRuntimeObject
 * in the Extensions folder.
 */
 gdjs.TestSpriteRuntimeObject = class TestSpriteRuntimeObject extends gdjs.SpriteRuntimeObject {
  /** @type {float}  */
  _customWidth = 0;
  /** @type {float}  */
  _customHeight = 0;
  /** @type {float}  */
  _unscaledWidth = 0;
  /** @type {float}  */
  _unscaledHeight = 0;
  /** @type {?float}  */
  _customCenterX = null;
  /** @type {?float}  */
  _customCenterY = null;

  constructor(runtimeScene, objectData) {
    // *ALWAYS* call the base gdjs.RuntimeObject constructor.
    super(runtimeScene, objectData);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
  }

  setCustomWidthAndHeight(customWidth, customHeight) {
    this._customWidth = customWidth;
    this._customHeight = customHeight;
    super._scaleX = this._customWidth / this._unscaledWidth;
    super._scaleY = this._customHeight / this._unscaledHeight;
    this.invalidateHitboxes();
  }

  setUnscaledWidthAndHeight(unscaledWidth, unscaledHeight) {
    this._unscaledWidth = unscaledWidth;
    this._unscaledHeight = unscaledHeight;
    super._scaleX = this._customWidth / this._unscaledWidth;
    super._scaleY = this._customHeight / this._unscaledHeight;
    this.invalidateHitboxes();
  }

  setCustomCenter(customCenterX, customCenterY) {
    this._customCenterX = customCenterX;
    this._customCenterY = customCenterY;
    this.invalidateHitboxes();
  }

  getRendererObject() {
    return null;
  }

  getWidth() {
    return this._customWidth;
  }

  getHeight() {
    return this._customHeight;
  }

  getCenterX() {
    if (this._customCenterX === null) return super.getCenterX();
    return this._customCenterX;
  }

  getCenterY() {
    if (this._customCenterY === null) return super.getCenterY();
    return this._customCenterY;
  }
};

gdjs.registerObject('TestSpriteObject::TestSpriteObject', gdjs.TestSpriteRuntimeObject);
