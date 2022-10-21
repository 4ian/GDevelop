/*
GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  export class ParticleEmitterObjectPixiRenderer {
    renderer: any;
    emitter: any;
    started: boolean = false;

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
      const config = {
        color: {
          list: [
            {
              value: gdjs
                .rgbToHexNumber(
                  objectData.particleRed1,
                  objectData.particleGreen1,
                  objectData.particleBlue1
                )
                .toString(16),
              time: 0,
            },
            {
              value: gdjs
                .rgbToHexNumber(
                  objectData.particleRed2,
                  objectData.particleGreen2,
                  objectData.particleBlue2
                )
                .toString(16),
              time: 1,
            },
          ],
          isStepped: false,
        },
        acceleration: {
          x: objectData.particleGravityX,
          y: objectData.particleGravityY,
        },
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
        spawnType: 'circle',
        spawnCircle: { x: 0, y: 0, r: objectData.zoneRadius },
      };
      // @ts-ignore
      config.speed = {
        list: [{ time: 0, value: objectData.emitterForceMax }],
        minimumSpeedMultiplier:
          objectData.emitterForceMax !== 0
            ? objectData.emitterForceMin / objectData.emitterForceMax
            : 1,
        isStepped: false,
      };
      // @ts-ignore
      config.alpha = {
        list: [
          { time: 0, value: objectData.particleAlpha1 / 255.0 },
          { time: 1, value: objectData.particleAlpha2 / 255.0 },
        ],
        isStepped: false,
      };
      let size1 = objectData.particleSize1 / 100;
      let size2 = objectData.particleSize2 / 100;
      const sizeRandom1 = objectData.particleSizeRandomness1 / 100;
      const sizeRandom2 = objectData.particleSizeRandomness2 / 100;
      const m = sizeRandom2 !== 0 ? (1 + sizeRandom1) / (1 + sizeRandom2) : 1;
      // @ts-ignore
      config.scale = {
        list: [
          { time: 0, value: size1 * (1 + sizeRandom1) },
          { time: 1, value: size2 * (1 + sizeRandom2) },
        ],
        minimumScaleMultiplier: m,
        isStepped: false,
      };
      // Angle of the spray cone
      // @ts-ignore
      config.startRotation = {
        min: -objectData.emitterAngleB / 2.0,
        max: objectData.emitterAngleB / 2.0,
      };
      // Rotation speed of the particles
      // @ts-ignore
      config.rotationSpeed = {
        min: objectData.particleAngle1,
        max: objectData.particleAngle2,
      };
      // @ts-ignore
      config.blendMode = objectData.additive ? 'ADD' : 'NORMAL';
      this.renderer = new PIXI.Container();
      // @ts-ignore
      this.emitter = new PIXI.particles.Emitter(this.renderer, texture, config);
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
      this.emitter.minStartRotation = angle1;
      this.emitter.maxStartRotation = angle2;
    }

    setForce(min: float, max: float): void {
      // If max force is zero, PIXI seems to not be able to compute correctly
      // the angle of the emitter, resulting in it staying at 0° or 180°.
      // See https://github.com/4ian/GDevelop/issues/4312.
      const _max = max || 0.000001;
      this.emitter.startSpeed.value = _max;
      this.emitter.minimumSpeedMultiplier = min / _max;
    }

    setZoneRadius(radius: float): void {
      this.emitter.spawnCircle.radius = radius;
    }

    setLifeTime(min: float, max: float): void {
      this.emitter.minLifetime = min;
      this.emitter.maxLifetime = max;
    }

    setGravity(x: float, y: float): void {
      this.emitter.acceleration.x = x;
      this.emitter.acceleration.y = y;
    }

    setColor(
      r1: number,
      g1: number,
      b1: number,
      r2: number,
      g2: number,
      b2: number
    ): void {
      this.emitter.startColor.value.r = r1;
      this.emitter.startColor.value.g = g1;
      this.emitter.startColor.value.b = b1;
      this.emitter.startColor.next = this.emitter.startColor.next || {
        time: 1,
        value: {},
      };
      this.emitter.startColor.next.value.r = r2;
      this.emitter.startColor.next.value.g = g2;
      this.emitter.startColor.next.value.b = b2;
    }

    setSize(size1: float, size2: float): void {
      this.emitter.startScale.value = size1 / 100.0;
      if (this.emitter.startScale.next) {
        this.emitter.startScale.next.value = size2 / 100.0;
      }
    }

    setParticleRotationSpeed(min: float, max: float): void {
      this.emitter.minRotationSpeed = min;
      this.emitter.maxRotationSpeed = max;
    }

    setMaxParticlesCount(count: float): void {
      this.emitter.maxParticles = count;
    }

    setAdditiveRendering(enabled: boolean): void {
      this.emitter.particleBlendMode = enabled
        ? PIXI.BLEND_MODES.ADD
        : PIXI.BLEND_MODES.NORMAL;
    }

    setAlpha(alpha1: number, alpha2: number): void {
      this.emitter.startAlpha.value = alpha1 / 255.0;
      if (this.emitter.startAlpha.next) {
        this.emitter.startAlpha.next.value = alpha2 / 255.0;
      }
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
        this.emitter.particleImages[0] = pixiTexture;
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
