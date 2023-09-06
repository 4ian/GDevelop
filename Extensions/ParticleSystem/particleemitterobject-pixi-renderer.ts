/*
GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
namespace gdjs {

  enum Behaviors {
    alpha,
    moveAcceleration,
    scale,
    color,
    rotation,
    blendMode,
    textureSingle,
    spawnShape,
  }
  export class ParticleEmitterObjectPixiRenderer {
    renderer: any;
    emitter: PIXI.particles.Emitter;
    started: boolean = false;
    _configuration: PIXI.particles.EmitterConfigV3;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      runtimeObject: gdjs.RuntimeObject,
      objectData: any
    ) {
      let texture = null;
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(0, 0, 0);
      graphics.beginFill(gdjs.rgbToHexNumber(255, 255, 255), 1);
      if (objectData.rendererType === 'Point') {
        graphics.drawCircle(0, 0, objectData.rendererParam1);
      } else if (objectData.rendererType === 'Line') {
        graphics.drawRect(
          0,
          0,
          objectData.rendererParam1,
          objectData.rendererParam2
        );

        // Draw an almost-invisible rectangle in the left hand to force PIXI to take a full texture with our line at the right hand
        graphics.beginFill(gdjs.rgbToHexNumber(255, 255, 255), 0.001);
        graphics.drawRect(
          0,
          0,
          objectData.rendererParam1,
          objectData.rendererParam2
        );
      } else if (objectData.textureParticleName) {
        const sprite = new PIXI.Sprite(
          (instanceContainer
            .getGame()
            .getImageManager() as gdjs.PixiImageManager).getPIXITexture(
            objectData.textureParticleName
          )
        );
        sprite.width = objectData.rendererParam1;
        sprite.height = objectData.rendererParam2;
        graphics.addChild(sprite);
      } else {
        graphics.drawRect(
          0,
          0,
          objectData.rendererParam1,
          objectData.rendererParam2
        );
      }
      graphics.endFill();

      // Render the texture from graphics using the PIXI Renderer.
      // TODO: could be optimized by generating the texture only once per object type,
      // instead of at each object creation.
      const pixiRenderer = instanceContainer
        .getGame()
        .getRenderer()
        .getPIXIRenderer();
      //@ts-expect-error Pixi has wrong type definitions for this method
      texture = pixiRenderer.generateTexture(graphics);

      this._configuration = {
        behaviors: [],
        ease: undefined,
        emit: undefined,
        lifetime: {
          min: objectData.particleLifeTimeMin,
          max: objectData.particleLifeTimeMax,
        },
        // A negative flow is "infinite flow" (all particles burst)
        frequency: objectData.flow < 0 ? 0.0001 : 1.0 / objectData.flow,
        spawnChance: 1,
        particlesPerWave: objectData.flow < 0 ? objectData.maxParticleNb : 1,
        maxParticles: objectData.maxParticleNb,
        // Lifetime can be computed from the tank (the number of particles available)
        // and the flow (number of particles emitted per seconds)
        emitterLifetime: ParticleEmitterObjectPixiRenderer.computeLifetime(
          objectData.flow,
          objectData.tank
        ),
        pos: { x: 0, y: 0 },
        addAtBack: false,
      };
      this._configuration.behaviors.length = 8;

      this._configuration.behaviors[Behaviors.alpha] = {
        type: "alpha",
        config: {
          alpha: {
            isStepped: false,
            list: [
              {time: 0, value: objectData.particleAlpha1 / 255.0},
              {time: 1, value: objectData.particleAlpha2 / 255.0}
            ]
          }
        }
      };

      this._configuration.behaviors[Behaviors.moveAcceleration] = {
        type: "moveAcceleration",
        config: {
          accel: { x: objectData.particleGravityX, y: objectData.particleGravityY },
          minStart: objectData.emitterForceMax,
          maxStart: objectData.emitterForceMax,
          rotate: true,
        }
      };

      let size1 = objectData.particleSize1 / 100;
      let size2 = objectData.particleSize2 / 100;
      const sizeRandom1 = objectData.particleSizeRandomness1 / 100;
      const sizeRandom2 = objectData.particleSizeRandomness2 / 100;
      this._configuration.behaviors[Behaviors.scale] = {
        type: "scale",
        config: {
          scale: {
            isStepped: false,
            list: [
              {time: 0, value: size1 * (1 + sizeRandom1) },
              {time: 1, value: size2 * (1 + sizeRandom2) }
            ]
          }
        }
      };

      this._configuration.behaviors[Behaviors.color] = {
        type: "color",
        config: {
          color: {
            isStepped: false,
            list: [
              {time: 0, value: gdjs.rgbToHex(objectData.particleRed1,
                objectData.particleGreen1,
                objectData.particleBlue1)},
              {time: 1, value: gdjs.rgbToHex(objectData.particleRed2,
                objectData.particleGreen2,
                objectData.particleBlue2)}
            ]
          }
        }
      };

      this._configuration.behaviors[Behaviors.rotation] = {
        type: "rotation",
        config: {
          accel: 0,
          // Angle of the spray cone
          minStart: -objectData.emitterAngleB / 2.0,
          maxStart: objectData.emitterAngleB / 2.0,
          // Rotation speed of the particles
          maxSpeed: objectData.particleAngle2,
          minSpeed: objectData.particleAngle1,
        }
      };

      this._configuration.behaviors[Behaviors.blendMode] = {
        type: "blendMode",
        config: {
          blendMode: objectData.additive ? 'ADD' : 'NORMAL',
        }
      };

      this._configuration.behaviors[Behaviors.textureSingle] = {
        type: "textureSingle",
        config: {
          texture: texture,
        }
      };

      this._configuration.behaviors[Behaviors.spawnShape] = {
        type: "spawnShape",
        config: {
          type: "torus",
          data: {
            affectRotation: false,
            innerRadius: 0,
            radius: objectData.zoneRadius,
            x: 0,
            y: 0,
          },
        }
      };

      this.renderer = new PIXI.Container();
      // The embedded particle emitter is supposed to be the last minor version
      // of the version 5 of the particle emitter object
      // See source https://github.com/pixijs/particle-emitter/blob/v5.0.8/src/Emitter.ts
      this.emitter = new PIXI.particles.Emitter(this.renderer, this._configuration);
      this.start();
      const layer = instanceContainer.getLayer(runtimeObject.getLayer());
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this.renderer, runtimeObject.getZOrder());
      }
    }

    getRendererObject() {
      return this.renderer;
    }

    update(delta: float): void {
      this.emitter.update(delta);
      if (!this.started && this.getParticleCount() > 0) {
        this.started = true;
      }
    }

    setPosition(x: number, y: number): void {
      this.emitter.spawnPos.x = x;
      this.emitter.spawnPos.y = y;
    }

    setAngle(angle1: float, angle2: float): void {
      const config = this._configuration.behaviors[Behaviors.rotation].config;
      config.minStart = angle1;
      config.maxStart = angle2;
    }

    setForce(min: float, max: float): void {
      const config = this._configuration.behaviors[Behaviors.moveAcceleration].config;
      // If max force is zero, PIXI seems to not be able to compute correctly
      // the angle of the emitter, resulting in it staying at 0° or 180°.
      // See https://github.com/4ian/GDevelop/issues/4312.
      config.max = max || 0.000001;
      config.min = min;
    }

    setZoneRadius(radius: float): void {
      const config = this._configuration.behaviors[Behaviors.spawnShape].config;
      config.data.radius = radius;
    }

    setLifeTime(min: float, max: float): void {
      this.emitter.minLifetime = min;
      this.emitter.maxLifetime = max;
    }

    setGravity(x: float, y: float): void {
      const config = this._configuration.behaviors[Behaviors.moveAcceleration].config;
      config.accel.x = x;
      config.accel.y = y;
    }

    setColor(
      r1: number,
      g1: number,
      b1: number,
      r2: number,
      g2: number,
      b2: number
    ): void {
      const config = this._configuration.behaviors[Behaviors.color].config;
      config.color.list[0].value = gdjs.rgbToHex(r1, g1, b1);
      config.color.list[1].value = gdjs.rgbToHex(r2, g2, b2);
    }

    setSize(size1: float, size2: float): void {
      const config = this._configuration.behaviors[Behaviors.scale].config;
      config.scale.list[0].value = size1 / 100.0;
      config.scale.list[1].value = size2 / 100.0;
    }

    setParticleRotationSpeed(min: float, max: float): void {
      const config = this._configuration.behaviors[Behaviors.rotation].config;
      config.minSpeed = min;
      config.maxSpeed = max;
    }

    setMaxParticlesCount(count: float): void {
      this.emitter.maxParticles = count;
    }

    setAdditiveRendering(enabled: boolean): void {
      const config = this._configuration.behaviors[Behaviors.blendMode].config;
      config.blendMode = enabled
        ? PIXI.BLEND_MODES.ADD
        : PIXI.BLEND_MODES.NORMAL;
    }

    setAlpha(alpha1: number, alpha2: number): void {
      const config = this._configuration.behaviors[Behaviors.alpha].config;
      config.alpha.list[0].value = alpha1;
      config.alpha.list[1].value = alpha2;
    }

    setFlow(flow: number, tank: number): void {
      this.emitter.frequency = flow < 0 ? 0.0001 : 1.0 / flow;
      this.emitter.emitterLifetime = ParticleEmitterObjectPixiRenderer.computeLifetime(
        flow,
        tank
      );
    }

    resetEmission(flow: number, tank: number): void {
      this.setFlow(flow, tank);
      const wasEmitting = this.emitter.emit;
      // The only way to recompute emitter lifetime is to start the emitter.
      this.start();
      if (!wasEmitting) this.stop();
    }

    isTextureNameValid(
      texture: string,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): boolean {
      const invalidPixiTexture = instanceContainer
        .getGame()
        .getImageManager()
        .getInvalidPIXITexture();
      const pixiTexture = instanceContainer
        .getGame()
        .getImageManager()
        .getPIXITexture(texture);
      return pixiTexture.valid && pixiTexture !== invalidPixiTexture;
    }

    setTextureName(
      texture: string,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      const invalidPixiTexture = instanceContainer
        .getGame()
        .getImageManager()
        .getInvalidPIXITexture();
      const pixiTexture = instanceContainer
        .getGame()
        .getImageManager()
        .getPIXITexture(texture);
      if (pixiTexture.valid && pixiTexture !== invalidPixiTexture) {
        const config = this._configuration.behaviors[0].config;
        config.texture = pixiTexture;
      }
    }

    getParticleCount(): integer {
      return this.emitter.particleCount;
    }

    stop(): void {
      this.emitter.emit = false;
    }

    start(): void {
      this.emitter.emit = true;
    }

    recreate(): void {
      const configuration = this._configuration;
      const emitter = this.emitter;
      configuration.lifetime.min = emitter.minLifetime;
      configuration.lifetime.max = emitter.maxLifetime;
      configuration.frequency = emitter.frequency;
      configuration.spawnChance = emitter.spawnChance;
      configuration.particlesPerWave = emitter.particlesPerWave;
      configuration.maxParticles = emitter.particlesPerWave;
      configuration.pos.x = emitter.spawnPos.x,
      configuration.pos.y = emitter.spawnPos.y,
      configuration.addAtBack = emitter.addAtBack;
      configuration.ease = emitter.customEase,

      this.emitter.init(this._configuration);
      this.emitter.cleanup();
    }

    destroy(): void {
      this.emitter.destroy();
    }

    hasStarted(): boolean {
      return this.started;
    }

    static computeLifetime(flow: number, tank: number): float {
      if (tank < 0) return -1;
      else if (flow < 0) return 0.001;
      else return (tank + 0.1) / flow;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
  export type ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
}
