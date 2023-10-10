/*
GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
namespace gdjs {
  const setBoundsValues = (list: any, startValue: float, endValue: float) => {
    const first = list.first;
    first.value = startValue;
    first.next = first.next || {
      time: 1,
      value: 0,
    };
    first.next.value = endValue;
  };

  export class ParticleEmitterObjectPixiRenderer {
    renderer: PIXI.Container;
    emitter: PIXI.particles.Emitter;
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

      const configuration = {
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
        behaviors: [
          {
            type: 'alpha',
            config: {
              alpha: {
                isStepped: false,
                list: [
                  { time: 0, value: objectData.particleAlpha1 / 255.0 },
                  { time: 1, value: objectData.particleAlpha2 / 255.0 },
                ],
              },
            },
          },
          {
            type: 'moveAcceleration',
            config: {
              accel: {
                x: objectData.particleGravityX,
                y: objectData.particleGravityY,
              },
              minStart: objectData.emitterForceMax,
              maxStart: objectData.emitterForceMax,
              rotate: false,
            },
          },
          {
            type: 'scale',
            config: {
              scale: {
                isStepped: false,
                list: [
                  {
                    time: 0,
                    value:
                      (objectData.particleSize1 / 100) *
                      (1 + objectData.particleSizeRandomness1 / 100),
                  },
                  {
                    time: 1,
                    value:
                      (objectData.particleSize2 / 100) *
                      (1 + objectData.particleSizeRandomness2 / 100),
                  },
                ],
              },
            },
          },
          {
            type: 'color',
            config: {
              color: {
                isStepped: false,
                list: [
                  {
                    time: 0,
                    value: gdjs.rgbToHex(
                      objectData.particleRed1,
                      objectData.particleGreen1,
                      objectData.particleBlue1
                    ),
                  },
                  {
                    time: 1,
                    value: gdjs.rgbToHex(
                      objectData.particleRed2,
                      objectData.particleGreen2,
                      objectData.particleBlue2
                    ),
                  },
                ],
              },
            },
          },
          {
            type: 'rotation',
            config: {
              accel: 0,
              // Angle of the spray cone
              minStart: -objectData.emitterAngleB / 2.0,
              maxStart: objectData.emitterAngleB / 2.0,
              // Rotation speed of the particles
              maxSpeed: objectData.particleAngle2,
              minSpeed: objectData.particleAngle1,
            },
          },
          {
            type: 'blendMode',
            config: {
              blendMode: objectData.additive ? 'ADD' : 'NORMAL',
            },
          },
          {
            type: 'textureSingle',
            config: {
              texture: texture,
            },
          },
          {
            type: 'spawnShape',
            config: {
              type: 'torus',
              data: {
                affectRotation: false,
                innerRadius: 0,
                radius: objectData.zoneRadius,
                x: 0,
                y: 0,
              },
            },
          },
        ],
      };

      this.renderer = new PIXI.Container();
      // The embedded particle emitter is supposed to be the last minor version
      // of the version 5 of the particle emitter object
      // See source https://github.com/pixijs/particle-emitter/blob/v5.0.8/src/Emitter.ts
      this.emitter = new PIXI.particles.Emitter(this.renderer, configuration);
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
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('rotation');
      behavior.minStart = gdjs.toRad(angle1);
      behavior.maxStart = gdjs.toRad(angle2);
    }

    setForce(min: float, max: float): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('moveAcceleration');
      // If max force is zero, PIXI seems to not be able to compute correctly
      // the angle of the emitter, resulting in it staying at 0° or 180°.
      // See https://github.com/4ian/GDevelop/issues/4312.
      behavior.maxStart = max || 0.000001;
      behavior.minStart = min;
    }

    setZoneRadius(radius: float): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('spawnShape');
      behavior.shape.radius = radius;
    }

    setLifeTime(min: float, max: float): void {
      this.emitter.minLifetime = min;
      this.emitter.maxLifetime = max;
    }

    setGravity(x: float, y: float): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('moveAcceleration');
      behavior.accel.x = x;
      behavior.accel.y = y;
    }

    setColor(
      r1: number,
      g1: number,
      b1: number,
      r2: number,
      g2: number,
      b2: number
    ): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('color');
      const first = behavior.list.first;

      const startColor = first.value;
      startColor.r = r1;
      startColor.g = g1;
      startColor.b = b1;

      first.next = first.next || {
        time: 1,
        value: {},
      };
      const endColor = first.next.value;
      endColor.r = r2;
      endColor.g = g2;
      endColor.b = b2;
    }

    setSize(size1: float, size2: float): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('scale');
      setBoundsValues(behavior.list, size1 / 100.0, size2 / 100.0);
    }

    setParticleRotationSpeed(min: float, max: float): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('rotation');
      behavior.minSpeed = gdjs.toRad(min);
      behavior.maxSpeed = gdjs.toRad(max);
    }

    setMaxParticlesCount(count: float): void {
      this.emitter.maxParticles = count;
    }

    setAdditiveRendering(enabled: boolean): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('blendMode');
      behavior.blendMode = enabled ? 'ADD' : 'NORMAL';
    }

    setAlpha(alpha1: number, alpha2: number): void {
      // Access private members of the behavior to apply changes right away.
      const behavior: any = this.emitter.getBehavior('alpha');
      setBoundsValues(behavior.list, alpha1 / 255.0, alpha2 / 255.0);
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
        // Access private members of the behavior to apply changes right away.
        const behavior: any = this.emitter.getBehavior('textureSingle');
        behavior.texture = pixiTexture;
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
