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
      const pixiRenderer = instanceContainer
        .getGame()
        .getRenderer()
        .getPIXIRenderer();
      const imageManager = instanceContainer
        .getGame()
        .getImageManager() as gdjs.PixiImageManager;
      let particleTexture: PIXI.Texture = PIXI.Texture.WHITE;
      if (pixiRenderer) {
        if (objectData.rendererType === 'Point') {
          particleTexture = imageManager.getOrCreateDiskTexture(
            objectData.rendererParam1,
            pixiRenderer
          );
        } else if (objectData.rendererType === 'Line') {
          particleTexture = imageManager.getOrCreateRectangleTexture(
            objectData.rendererParam1,
            objectData.rendererParam2,
            pixiRenderer
          );
        } else if (objectData.textureParticleName) {
          particleTexture = imageManager.getOrCreateScaledTexture(
            objectData.textureParticleName,
            objectData.rendererParam1,
            objectData.rendererParam2,
            pixiRenderer
          );
        } else {
          particleTexture = imageManager.getOrCreateRectangleTexture(
            objectData.rendererParam1,
            objectData.rendererParam2,
            pixiRenderer
          );
        }
      }

      const configuration = {
        ease: undefined,
        emit: undefined,
        lifetime: {
          min: objectData.particleLifeTimeMin,
          max: objectData.particleLifeTimeMax,
        },
        // A negative flow is "infinite flow" (all particles burst)
        frequency:
          objectData.flow < 0
            ? ParticleEmitterObjectPixiRenderer.frequencyMinimumValue
            : 1.0 / objectData.flow,
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
              minStart: objectData.emitterForceMin,
              maxStart: objectData.emitterForceMax,
              // See _updateRotateFlagFromSpeed
              rotate:
                objectData.particleAngle1 === 0 &&
                objectData.particleAngle2 === 0 &&
                (objectData.particleGravityX !== 0 ||
                  objectData.particleGravityY !== 0 ||
                  objectData.emitterForceMin < 0 ||
                  objectData.emitterForceMax < 0),
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
              texture: particleTexture,
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
      const wasEmitting = this.emitter.emit;
      this.emitter.update(delta);
      if (!this.started && wasEmitting) {
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
      this._updateRotateFlagFromSpeed();
    }

    /**
     * When rotate from `moveAcceleration` is `true` the rotation is set
     * according to the speed direction. This is overriding the particle
     * rotation calculated by from `rotation`.
     */
    private _updateRotateFlagFromSpeed() {
      const rotation: any = this.emitter.getBehavior('rotation');
      const moveAcceleration: any = this.emitter.getBehavior(
        'moveAcceleration'
      );
      moveAcceleration.rotate =
        rotation.minSpeed === 0 &&
        rotation.maxSpeed === 0 &&
        // This part is to avoid to do `atan` every frame when the object
        // direction doesn't change.
        (moveAcceleration.accel.x !== 0 ||
          moveAcceleration.accel.y !== 0 ||
          // Negative speeds need a 180° rotation.
          moveAcceleration.minStart < 0 ||
          moveAcceleration.maxStart < 0);
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
      this._updateRotateFlagFromSpeed();
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
      this.emitter.frequency =
        flow < 0
          ? ParticleEmitterObjectPixiRenderer.frequencyMinimumValue
          : 1.0 / flow;
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

    /**
     * @returns `true` at the end of emission or at the start if it's paused.
     * Returns false if there is no limit.
     */
    _mayHaveEndedEmission(): boolean {
      return (
        // No end can be reached if there is no flow.
        this.emitter.frequency >
          ParticleEmitterObjectPixiRenderer.frequencyMinimumValue &&
        // No end can be reached when there is no limit.
        this.emitter.emitterLifetime >= 0 &&
        // Pixi stops the emission at the end.
        !this.emitter.emit &&
        // Pixi reset `_emitterLife` to `emitterLifetime` at the end of emission
        // so there is no way to know if it is the end or the start.
        // @ts-ignore Use a private attribute.
        this.emitter._emitterLife === this.emitter.emitterLifetime
      );
    }

    static computeLifetime(flow: number, tank: number): float {
      if (tank < 0) return -1;
      else if (flow < 0) return 0.001;
      else return (tank + 0.1) / flow;
    }

    private static readonly frequencyMinimumValue = 0.0001;
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
  export type ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
}
