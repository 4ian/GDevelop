// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';
import { rgbToHexNumber } from '../../Utils/ColorTransformer';
const gd: libGDevelop = global.gd;

/**
 * Renderer for an ParticleEmitter object.
 */
export default class RenderedParticleEmitterInstance extends RenderedInstance {
  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      layout,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    );

    this._pixiObject = new PIXI.Graphics();
    this._pixiContainer.addChild(this._pixiObject);
    this.updateGraphics();
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    objectConfiguration: gdObjectConfiguration
  ) {
    return 'CppPlatform/Extensions/particleSystemicon.png';
  }

  update() {
    this._pixiObject.position.x = this._instance.getX();
    this._pixiObject.position.y = this._instance.getY();
    this.updateGraphics();
  }

  /**
   * Render the preview of the particle emitter according to the setup of the object
   */
  updateGraphics() {
    const particleEmitterConfiguration = gd.asParticleEmitterConfiguration(
      this._associatedObjectConfiguration
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
  }

  getDefaultWidth() {
    return 128;
  }

  getDefaultHeight() {
    return 128;
  }

  getOriginX() {
    return 64;
  }

  getOriginY() {
    return 64;
  }
}
