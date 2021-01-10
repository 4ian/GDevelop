/**
GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

namespace gdjs {
  export class ParticleEmitterObjectPixiRenderer {
    renderer: any;
    emitter: any;
    started: boolean = false;
    emitterLifetime: float = 0;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
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
          objectData.rendererParam1,
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
          (runtimeScene
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
      const pixiRenderer = runtimeScene
        .getGame()
        .getRenderer()
        .getPIXIRenderer();
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
        emitterLifetime:
          objectData.tank < 0
            ? -1
            : objectData.flow < 0
            ? 0.001
            : objectData.tank / objectData.flow,
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
      if (objectData.alphaParam === 'Mutable') {
        // @ts-ignore
        config.alpha = {
          list: [
            { time: 0, value: objectData.particleAlpha1 / 255.0 },
            { time: 1, value: objectData.particleAlpha2 / 255.0 },
          ],
          isStepped: false,
        };
      } else {
        // @ts-ignore
        config.alpha = {
          list: [{ time: 0, value: objectData.particleAlpha1 / 255.0 }],
          isStepped: false,
        };
      }
      if (objectData.sizeParam === 'Mutable') {
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
      } else {
        let size1 = objectData.particleSize1 / 100;
        let size2 = objectData.particleSize2 / 100;
        let mult = size2 !== 0 ? (1 + size1) / (1 + size2) : 1;
        if (size2 === 0 && size1 > size2) {
          mult = (1 + size2) / (1 + size1);
          size2 = size1;
        }
        // @ts-ignore
        config.scale = {
          list: [{ time: 0, value: size2 }],
          minimumScaleMultiplier: mult,
          isStepped: false,
        };
      }
      if (objectData.emissionEditionSimpleMode) {
        // @ts-ignore
        config.startRotation = {
          min: -objectData.emitterAngleB / 2.0,
          max: objectData.emitterAngleB / 2.0,
        };
      } else {
        // @ts-ignore
        config.startRotation = {
          min: objectData.emitterAngleA,
          max: objectData.emitterAngleB,
        };
      }
      const mediumLifetime =
        (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax) / 2.0;
      // @ts-ignore
      config.rotationSpeed = {
        min: objectData.particleAngle1 / mediumLifetime,
        max: objectData.particleAngle2 / mediumLifetime,
      };
      // @ts-ignore
      config.blendMode = objectData.additive ? 'ADD' : 'NORMAL';
      this.renderer = new PIXI.Container();
      // @ts-ignore
      this.emitter = new PIXI.particles.Emitter(this.renderer, texture, config);
      this.emitter.emit = true;
      const layer = runtimeScene.getLayer(runtimeObject.getLayer());
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this.renderer, runtimeObject.getZOrder());
      }
    }

    getRendererObject() {
      return this.renderer;
    }

    update(delta): void {
      this.emitter.update(delta);
      if (!this.started && this.getParticleCount() > 0) {
        this.started = true;
      }
    }

    setPosition(x, y): void {
      this.emitter.spawnPos.x = x;
      this.emitter.spawnPos.y = y;
    }

    setAngle(angle1, angle2): void {
      this.emitter.minStartRotation = angle1;
      this.emitter.maxStartRotation = angle2;
    }

    setForce(min, max): void {
      this.emitter.startSpeed.value = max;
      this.emitter.minimumSpeedMultiplier = max !== 0 ? min / max : 1;
    }

    setZoneRadius(radius): void {
      this.emitter.spawnCircle.radius = radius;
    }

    setLifeTime(min, max): void {
      this.emitter.minLifetime = min;
      this.emitter.maxLifetime = max;
    }

    setGravity(x, y): void {
      this.emitter.acceleration.x = x;
      this.emitter.acceleration.y = y;
    }

    setColor(r1, g1, b1, r2, g2, b2): void {
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

    setSize(size1, size2): void {
      this.emitter.startScale.value = size1 / 100.0;
      if (this.emitter.startScale.next) {
        this.emitter.startScale.next.value = size2 / 100.0;
      }
    }

    setAlpha(alpha1, alpha2): void {
      this.emitter.startAlpha.value = alpha1 / 255.0;
      if (this.emitter.startAlpha.next) {
        this.emitter.startAlpha.next.value = alpha2 / 255.0;
      }
    }

    setFlow(flow, tank): void {
      this.emitter.frequency = flow < 0 ? 0.0001 : 1.0 / flow;
      this.emitterLifetime =
        tank < 0
          ? -1
          : flow < 0
          ? 0.001
          : (tank - this.emitter.totalParticleCount) / flow;
    }

    isTextureNameValid(texture, runtimeScene): boolean {
      const invalidPixiTexture = runtimeScene
        .getGame()
        .getImageManager()
        .getInvalidPIXITexture();
      const pixiTexture = runtimeScene
        .getGame()
        .getImageManager()
        .getPIXITexture(texture);
      return pixiTexture.valid && pixiTexture !== invalidPixiTexture;
    }

    setTextureName(texture, runtimeScene): void {
      const invalidPixiTexture = runtimeScene
        .getGame()
        .getImageManager()
        .getInvalidPIXITexture();
      const pixiTexture = runtimeScene
        .getGame()
        .getImageManager()
        .getPIXITexture(texture);
      if (pixiTexture.valid && pixiTexture !== invalidPixiTexture) {
        this.emitter.particleImages[0] = pixiTexture;
      }
    }

    getTotalParticleCount(): integer {
      return this.emitter.totalParticleCount;
    }

    getParticleCount(): integer {
      return this.emitter.particleCount;
    }

    stop() {
      this.emitter.emit = false;
    }

    recreate() {
      this.emitter.cleanup();
    }

    destroy() {
      this.emitter.destroy();
    }

    hasStarted(): boolean {
      return this.started;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
  export type ParticleEmitterObjectRenderer = ParticleEmitterObjectPixiRenderer;
}
