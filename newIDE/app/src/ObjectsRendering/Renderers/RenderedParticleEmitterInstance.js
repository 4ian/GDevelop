import RenderedInstance from './RenderedInstance';
import * as PIXI from 'pixi.js-legacy';
import { rgbToHexNumber } from '../../Utils/ColorTransformer';
const gd /* TODO: add flow in this file */ = global.gd;

/**
 * Renderer for an ParticleEmitter object.
 *
 * @extends RenderedInstance
 * @class RenderedParticleEmitterInstance
 * @constructor
 */
function RenderedParticleEmitterInstance(
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

  this._pixiObject = new PIXI.Graphics();
  this._pixiContainer.addChild(this._pixiObject);
  this.updateGraphics();
}
RenderedParticleEmitterInstance.prototype = Object.create(
  RenderedInstance.prototype
);

/**
 * Return a URL for thumbnail of the specified object.
 */
RenderedParticleEmitterInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  return 'CppPlatform/Extensions/particleSystemicon.png';
};

RenderedParticleEmitterInstance.prototype.update = function() {
  this._pixiObject.position.x = this._instance.getX();
  this._pixiObject.position.y = this._instance.getY();
  this.updateGraphics();
};

/**
 * Render the preview of the particle emitter according to the setup of the object
 */
RenderedParticleEmitterInstance.prototype.updateGraphics = function() {
  const particleEmitterConfiguration = gd.asParticleEmitterConfiguration(
    this._associatedObject
  );

  this._pixiObject.clear();

  const emitterAngle = (this._instance.getAngle() / 180) * 3.14159;
  const sprayConeAngle = particleEmitterConfiguration.getConeSprayAngle();
  const line1Angle = emitterAngle - (sprayConeAngle / 2.0 / 180.0) * 3.14159;
  const line2Angle = emitterAngle + (sprayConeAngle / 2.0 / 180.0) * 3.14159;
  const length = 64;

  this._pixiObject.beginFill(0, 0);
  this._pixiObject.lineStyle(
    3,
    rgbToHexNumber(
      particleEmitterConfiguration.getParticleRed2(),
      particleEmitterConfiguration.getParticleGreen2(),
      particleEmitterConfiguration.getParticleBlue2()
    ),
    1
  );
  this._pixiObject.moveTo(0, 0);
  this._pixiObject.lineTo(
    Math.cos(line1Angle) * length,
    Math.sin(line1Angle) * length
  );
  this._pixiObject.moveTo(0, 0);
  this._pixiObject.lineTo(
    Math.cos(line2Angle) * length,
    Math.sin(line2Angle) * length
  );
  this._pixiObject.endFill();

  this._pixiObject.lineStyle(0, 0x000000, 1);
  this._pixiObject.beginFill(
    rgbToHexNumber(
      particleEmitterConfiguration.getParticleRed1(),
      particleEmitterConfiguration.getParticleGreen1(),
      particleEmitterConfiguration.getParticleBlue1()
    )
  );
  this._pixiObject.drawCircle(0, 0, 8);
  this._pixiObject.endFill();
};

RenderedParticleEmitterInstance.prototype.getDefaultWidth = function() {
  return 128;
};

RenderedParticleEmitterInstance.prototype.getDefaultHeight = function() {
  return 128;
};

RenderedParticleEmitterInstance.prototype.getOriginX = function() {
  return 64;
};

RenderedParticleEmitterInstance.prototype.getOriginY = function() {
  return 64;
};

export default RenderedParticleEmitterInstance;
