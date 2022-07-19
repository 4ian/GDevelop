import RenderedInstance from './RenderedInstance';
import * as PIXI from '../../PIXI';

/**
 * Objects with an unknown type are rendered with a placeholder rectangle.
 *
 * @extends RenderedInstance
 * @class RenderedUnknownInstance
 * @constructor
 */
function RenderedUnknownInstance(
  project,
  layout,
  instance,
  associatedObject,
  pixiContainer,
  pixiResourcesLoader
) {
  RenderedInstance.call(
    this,
    project,
    layout,
    instance,
    associatedObject,
    pixiContainer,
    pixiResourcesLoader
  );

  //This renderer show a placeholder for the object:
  this._pixiObject = new PIXI.Graphics();
  this._pixiContainer.addChild(this._pixiObject);

  var width = instance.hasCustomSize() ? instance.getCustomWidth() : 32;
  var height = instance.hasCustomSize() ? instance.getCustomHeight() : 32;

  this._pixiObject.beginFill(0x0033ff);
  this._pixiObject.lineStyle(1, 0xffd900, 1);
  this._pixiObject.moveTo(0, 0);
  this._pixiObject.lineTo(width, 0);
  this._pixiObject.lineTo(width, height);
  this._pixiObject.lineTo(0, height);
  this._pixiObject.endFill();
}
RenderedUnknownInstance.prototype = Object.create(RenderedInstance.prototype);
RenderedUnknownInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  return 'res/unknown32.png';
};

RenderedUnknownInstance.prototype.update = function() {
  this._pixiObject.position.x = this._instance.getX();
  this._pixiObject.position.y = this._instance.getY();
  this._pixiObject.rotation = (this._instance.getAngle() * Math.PI) / 180.0;
};

export default RenderedUnknownInstance;
