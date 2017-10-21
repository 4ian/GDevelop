import RenderedInstance from './RenderedInstance';
import PIXI from 'pixi.js';

/**
 * Renderer for an AdMob object.
 *
 * @extends RenderedInstance
 * @class RenderedAdMobInstance
 * @constructor
 */
function RenderedAdMobInstance(
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

  //Setup the PIXI object:
  this._pixiObject = new PIXI.Container();
  this._pixiContainer.addChild(this._pixiObject);

  this._titleText = new PIXI.Text('Ad banner object');
  this._titleText.style = {
    fill: 'white',
    font: 'bold 18px Arial',
  };
  this._titleText.position.x =
    this.getDefaultWidth() / 2 - this._titleText.width / 2;

  this._text = new PIXI.Text(
    'displayed on Android at the top or bottom of the screen'
  );
  this._text.style = {
    fill: 'white',
    font: 'italic 14px Arial',
  };
  this._text.position.x = this.getDefaultWidth() / 2 - this._text.width / 2;
  this._text.position.y = 30;

  this._placeholder = new PIXI.Graphics();
  this._placeholder.beginFill(0x15b4f9);
  this._placeholder.lineStyle(1, 0x12286f, 1);
  this._placeholder.moveTo(0, 0);
  this._placeholder.lineTo(this.getDefaultWidth(), 0);
  this._placeholder.lineTo(this.getDefaultWidth(), this.getDefaultHeight());
  this._placeholder.lineTo(0, this.getDefaultHeight());
  this._placeholder.lineTo(0, 0);
  this._placeholder.endFill();

  this._pixiObject.addChild(this._placeholder);
  this._pixiObject.addChild(this._text);
  this._pixiObject.addChild(this._titleText);
}
RenderedAdMobInstance.prototype = Object.create(RenderedInstance.prototype);

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedAdMobInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  return 'JsPlatform/Extensions/admobicon24.png';
};

RenderedAdMobInstance.prototype.update = function() {
  this._pixiObject.position.x = this._instance.getX();
  this._pixiObject.position.y = this._instance.getY();
};

RenderedAdMobInstance.prototype.getDefaultWidth = function() {
  return 400;
};

RenderedAdMobInstance.prototype.getDefaultHeight = function() {
  return 64;
};

export default RenderedAdMobInstance;
