namespace gdjs {
  /**
GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
  export class ParticleEmitterObjectCocosRenderer {
    originalSize: any;
    renderer: any;
    totalParticles: number = 0;
    started: boolean = false;
    _convertYPosition: any;

    constructor(runtimeScene, runtimeObject, objectData) {
      const drawer = new cc.DrawNode();
      let renderTexture = null;
      this.originalSize = Math.max(
        objectData.rendererParam1,
        objectData.rendererParam2
      );
      if (objectData.rendererType === 'Point') {
        drawer.drawDot(
          cc.p(objectData.rendererParam1, objectData.rendererParam1),
          objectData.rendererParam1,
          cc.color(255, 255, 255, 255)
        );
        this.originalSize = 2 * objectData.rendererParam1;
        renderTexture = new cc.RenderTexture(
          this.originalSize,
          this.originalSize
        );
      } else {
        if (objectData.rendererType === 'Line') {
          this.originalSize = Math.max(
            2 * objectData.rendererParam1,
            objectData.rendererParam2
          );
          drawer.drawRect(
            cc.p(
              this.originalSize / 2.0,
              (this.originalSize - objectData.rendererParam2) / 2.0
            ),
            cc.p(
              this.originalSize / 2.0 + objectData.rendererParam1,
              (this.originalSize + objectData.rendererParam2) / 2.0
            ),
            cc.color(255, 255, 255, 255),
            0.01,
            cc.color(255, 255, 255, 0)
          );
          renderTexture = new cc.RenderTexture(
            this.originalSize,
            this.originalSize
          );
        } else {
          if (objectData.textureParticleName) {
            // Read the comment at ParticleEmitterObjectCocosRenderer.prototype.setTexture
            const imageManager = runtimeScene.getGame().getImageManager();
            const sprite = new cc.Sprite(
              imageManager.getTexture(objectData.textureParticleName)
            );
            this.originalSize = Math.max(sprite.width, sprite.height);
            sprite.setPosition(
              this.originalSize / 2.0,
              this.originalSize / 2.0
            );
            drawer.addChild(sprite);
            renderTexture = new cc.RenderTexture(
              this.originalSize,
              this.originalSize
            );
          } else {
            drawer.drawRect(
              cc.p(
                (this.originalSize - objectData.rendererParam1) / 2.0,
                (this.originalSize - objectData.rendererParam2) / 2.0
              ),
              cc.p(
                (this.originalSize + objectData.rendererParam1) / 2.0,
                (this.originalSize + objectData.rendererParam2) / 2.0
              ),
              cc.color(255, 255, 255, 255),
              0.01,
              cc.color(255, 255, 255, 255)
            );
            renderTexture = new cc.RenderTexture(
              this.originalSize,
              this.originalSize
            );
          }
        }
      }
      (renderTexture as any).begin();
      drawer.visit();
      (renderTexture as any).end();
      const texture = (renderTexture as any).getSprite().getTexture();
      const plist = {
        duration: -1,
        emitterType: 0,
        gravityx: objectData.particleGravityX,
        gravityy: -objectData.particleGravityY,
        particleLifespan:
          (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax) /
          2.0,
        particleLifespanVariance:
          Math.abs(
            objectData.particleLifeTimeMax - objectData.particleLifeTimeMin
          ) / 2.0,
        sourcePositionVariancex: objectData.zoneRadius,
        sourcePositionVariancey: objectData.zoneRadius,
        speed: (objectData.emitterForceMin + objectData.emitterForceMax) / 2.0,
        speedVariance:
          Math.abs(objectData.emitterForceMax - objectData.emitterForceMin) /
          2.0,
        tangentialAccelVariance: 0.0,
        tangentialAcceleration: 1,
        rotationIsDir: 'true',
        // We are forced to use a texture name / base64 string, it's a one-pixel base64 image
        textureImageData:
          'H4sIAAAAAAAAA+sM8HPn5ZLiYmBg4PX0cAkC0owgzMEEJCeUB98DUpwFHpHFDAzcwiDMyDBrjgRQkL3E09eV/RELu4CFwaX8heVAIdnMkIgS5/zc3NS8EgYQcC5KTSxJTVEozyzJUHD39A1I0UtlB4rzeLo4hnBcT/7x/789A+s/pn93zkQ+B2nwdPVzWeeU0AQAwMwOBZYAAAA=',
      };
      if (objectData.emissionEditionSimpleMode) {
        // @ts-ignore
        plist.angle = 0;
        // @ts-ignore
        plist.angleVariance = objectData.emitterAngleB / 2.0;
      } else {
        // @ts-ignore
        plist.angle =
          -(objectData.emitterAngleA + objectData.emitterAngleB) / 2.0;
        // @ts-ignore
        plist.angleVariance = Math.abs(plist.angle + objectData.emitterAngleB);
      }
      if (objectData.redParam === 'Mutable') {
        // @ts-ignore
        plist.startColorVarianceRed = plist.finishColorVarianceRed = 0.0;
        // @ts-ignore
        plist.startColorRed = objectData.particleRed1 / 255.0;
        // @ts-ignore
        plist.finishColorRed = objectData.particleRed2 / 255.0;
      } else {
        if (objectData.redParam === 'Random') {
          // @ts-ignore
          plist.startColorRed = plist.finishColorRed =
            (objectData.particleRed1 + objectData.particleRed2) / (2.0 * 255.0);
          // @ts-ignore
          plist.startColorVarianceRed = Math.abs(
            // @ts-ignore
            plist.startColorRed - objectData.particleRed2 / 255.0
          );
          // @ts-ignore
          plist.finishColorVarianceRed = plist.startColorVarianceRed;
        } else {
          // @ts-ignore
          plist.startColorVarianceRed = plist.finishColorVarianceRed = 0.0;
          // @ts-ignore
          plist.startColorRed = objectData.particleRed1 / 255.0;
          // @ts-ignore
          plist.finishColorRed = plist.startColorRed;
        }
      }
      if (objectData.greenParam === 'Mutable') {
        // @ts-ignore
        plist.startColorVarianceGreen = plist.finishColorVarianceGreen = 0.0;
        // @ts-ignore
        plist.startColorGreen = objectData.particleGreen1 / 255.0;
        // @ts-ignore
        plist.finishColorGreen = objectData.particleGreen2 / 255.0;
      } else {
        if (objectData.greenParam === 'Random') {
          // @ts-ignore
          plist.startColorGreen = plist.finishColorGreen =
            (objectData.particleGreen1 + objectData.particleGreen2) /
            (2.0 * 255.0);
          // @ts-ignore
          plist.startColorVarianceGreen = Math.abs(
            // @ts-ignore
            plist.startColorGreen - objectData.particleGreen2 / 255.0
          );
          // @ts-ignore
          plist.finishColorVarianceGreen = plist.startColorVarianceGreen;
        } else {
          // @ts-ignore
          plist.startColorVarianceGreen = plist.finishColorVarianceGreen = 0.0;
          // @ts-ignore
          plist.startColorGreen = objectData.particleGreen1 / 255.0;
          // @ts-ignore
          plist.finishColorGreen = plist.startColorGreen;
        }
      }
      if (objectData.blueParam === 'Mutable') {
        // @ts-ignore
        plist.startColorVarianceBlue = plist.finishColorVarianceBlue = 0.0;
        // @ts-ignore
        plist.startColorBlue = objectData.particleBlue1 / 255.0;
        // @ts-ignore
        plist.finishColorBlue = objectData.particleBlue2 / 255.0;
      } else {
        if (objectData.blueParam === 'Random') {
          // @ts-ignore
          plist.startColorBlue = plist.finishColorBlue =
            (objectData.particleBlue1 + objectData.particleBlue2) /
            (2.0 * 255.0);
          // @ts-ignore
          plist.startColorVarianceBlue = Math.abs(
            // @ts-ignore
            plist.startColorBlue - objectData.particleBlue2 / 255.0
          );
          // @ts-ignore
          plist.finishColorVarianceBlue = plist.startColorVarianceBlue;
        } else {
          // @ts-ignore
          plist.startColorVarianceBlue = plist.finishColorVarianceBlue = 0.0;
          // @ts-ignore
          plist.startColorBlue = objectData.particleBlue1 / 255.0;
          // @ts-ignore
          plist.finishColorBlue = plist.startColorBlue;
        }
      }
      if (objectData.alphaParam === 'Mutable') {
        let alphaInit =
          (objectData.particleAlpha1 + objectData.particleAlphaRandomness1) /
          255.0;
        let alphaEnd =
          (objectData.particleAlpha1 + objectData.particleAlphaRandomness2) /
          255.0;
        // @ts-ignore
        plist.startColorAlpha = (alphaInit + alphaEnd) / 2.0;
        // @ts-ignore
        plist.startColorVarianceAlpha = alphaEnd - plist.startColorAlpha;
        alphaInit =
          (objectData.particleAlpha2 + objectData.particleAlphaRandomness1) /
          255.0;
        alphaEnd =
          (objectData.particleAlpha2 + objectData.particleAlphaRandomness2) /
          255.0;
        // @ts-ignore
        plist.finishColorAlpha = (alphaInit + alphaEnd) / 2.0;
        // @ts-ignore
        plist.finishColorVarianceAlpha = alphaEnd - plist.finishColorAlpha;
      } else {
        const alphaMid =
          (objectData.particleAlphaRandomness1 +
            objectData.particleAlphaRandomness2) /
          (2.0 * 255.0);
        // @ts-ignore
        plist.startColorAlpha = plist.endColorAlpha = alphaMid;
        // @ts-ignore
        plist.startColorVarianceAlpha = Math.abs(
          alphaMid - objectData.particleAlphaRandomness1
        );
        // @ts-ignore
        plist.startColorVarianceAlpha = plist.finishColorVarianceAlpha;
      }
      if (objectData.sizeParam === 'Mutable') {
        const minSizeVariance =
          Math.min(
            objectData.particleSizeRandomness1,
            objectData.particleSizeRandomness2
          ) / 100.0;
        const maxSizeVariance =
          Math.max(
            objectData.particleSizeRandomness1,
            objectData.particleSizeRandomness2
          ) / 100.0;
        const midSizeVariance = (maxSizeVariance + minSizeVariance) / 2.0;
        // @ts-ignore
        plist.startParticleSizeVariance =
          (((this.originalSize * objectData.particleSize1) / 100.0) *
            (maxSizeVariance - minSizeVariance)) /
          2.0;
        // @ts-ignore
        plist.finishParticleSizeVariance =
          (((this.originalSize * objectData.particleSize2) / 100.0) *
            (maxSizeVariance - minSizeVariance)) /
          2.0;
        // @ts-ignore
        plist.startParticleSize =
          (this.originalSize * objectData.particleSize1) / 100.0 -
          // @ts-ignore
          plist.startParticleSizeVariance;
        // @ts-ignore
        plist.finishParticleSize =
          (this.originalSize * objectData.particleSize2) / 100.0 -
          // @ts-ignore
          plist.finishParticleSizeVariance;
      } else {
        const sizeMid =
          (objectData.particleSize1 + objectData.particleSize2) / (2.0 * 100.0);
        // @ts-ignore
        plist.startParticleSize = plist.finishParticleSize =
          this.originalSize * sizeMid;
        // @ts-ignore
        plist.startParticleSizeVariance =
          this.originalSize *
          Math.abs(sizeMid - objectData.particleSizeRandomness1 / 100.0);
        // @ts-ignore
        plist.finishParticleSizeVariance = plist.startParticleSizeVariance;
      }
      const mediumLifetime =
        (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax) / 2.0;
      // @ts-ignore
      plist.rotationStart = 0.0;
      // @ts-ignore
      plist.rotationStartVariance = 0.0;
      // @ts-ignore
      plist.rotationEnd =
        ((objectData.particleAngle1 + objectData.particleAngle2) / 2.0) *
        mediumLifetime;
      // @ts-ignore
      plist.rotationEndVariance =
        ((Math.max(objectData.particleAngle1, objectData.particleAngle2) -
          Math.min(objectData.particleAngle1, objectData.particleAngle2)) *
          mediumLifetime) /
        2.0;
      this.renderer = new cc.ParticleSystem(plist);
      this.renderer.setTexture(texture);
      this.renderer.setPosition(0, 0);
      this.renderer.init();
      this.renderer.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
      if (objectData.additive) {
        this.renderer.setBlendAdditive(true);
      }
      this.renderer.setTotalParticles(
        // Some particle systems don't work for max particles <= 150
        objectData.maxParticleNb
      );
      this.renderer.setEmissionRate(objectData.flow);
      this.renderer.setDuration(
        objectData.tank < 0
          ? -1
          : objectData.flow < 0
          ? 0.001
          : objectData.tank / objectData.flow
      );
      const that = this;
      this.renderer.addParticle = function () {
        cc.ParticleSystem.prototype.addParticle.call(that.renderer);
        ++that.totalParticles;
      };
      const renderer = runtimeScene
        .getLayer(runtimeObject.getLayer())
        .getRenderer();
      renderer.addRendererObject(this.renderer, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
    }

    getRendererObject() {
      return this.renderer;
    }

    update(delta): void {
      this.renderer.update(delta);
      if (!this.started && this.getParticleCount() > 0) {
        this.started = true;
      }
    }

    setPosition(x, y): void {
      this.renderer.setPosition(cc.p(x, this._convertYPosition(y)));
    }

    setAngle(angle1, angle2): void {
      this.renderer.setAngle(-(angle1 + angle2) / 2.0);
      this.renderer.setAngleVar(Math.abs(angle2 - angle1) / 2.0);
    }

    setForce(min, max): void {
      this.renderer.setSpeed((min + max) / 2.0);
      this.renderer.setSpeedVar(Math.abs(max - min) / 2.0);
    }

    setZoneRadius(radius): void {
      this.renderer.setPosVar(cc.p(radius, radius));
    }

    setLifeTime(min, max): void {
      this.renderer.setLife((min + max) / 2.0);
      this.renderer.setLifeVar(Math.abs(max - min) / 2.0);
    }

    setGravity(x, y): void {
      this.renderer.setGravity(cc.p(x, -y));
    }

    setColor(r1, g1, b1, r2, g2, b2): void {
      let a = this.renderer.getStartColor().a;
      this.renderer.setStartColor(cc.color(r1, g1, b1, a));
      a = this.renderer.getEndColor().a;
      this.renderer.setEndColor(cc.color(r2, g2, b2, a));
    }

    setAlpha(alpha1, alpha2): void {
      let color = this.renderer.getStartColor();
      color.a = alpha1;
      this.renderer.setStartColor(color);
      color = this.renderer.getEndColor();
      color.a = alpha2;
      this.renderer.setEndColor(color);
    }

    setSize(size1, size2): void {
      this.renderer.setStartSize((this.originalSize * size1) / 100.0);
      this.renderer.setEndSize((this.originalSize * size2) / 100.0);
    }

    setFlow(flow): void {
      this.renderer.setEmissionRate(flow);
    }

    isTextureNameValid(texture, runtimeScene): boolean {
      return runtimeScene.getGame().getImageManager().getTexture(texture)
        ._textureLoaded;
    }

    setTextureName(textureName, runtimeScene): void {
      let texture = runtimeScene
        .getGame()
        .getImageManager()
        .getTexture(textureName);
      if (texture._textureLoaded) {
        // Cocos particles are always square, so if the new texture is not squared we have to
        // render it over a squared renderTexture object, this way we keep the original
        // texture's aspect ratio
        if (texture.width === texture.height) {
          this.originalSize = texture.width;
          this.renderer.setTexture(texture);
        } else {
          const sprite = new cc.Sprite(texture);
          this.originalSize = Math.max(sprite.width, sprite.height);
          sprite.setPosition(this.originalSize / 2.0, this.originalSize / 2.0);
          const renderTexture = new cc.RenderTexture(
            this.originalSize,
            this.originalSize
          );
          renderTexture.begin();
          sprite.visit();
          renderTexture.end();
          this.renderer.setTexture(renderTexture.getSprite().getTexture());
        }
      }
    }

    getTotalParticleCount(): integer {
      return this.totalParticles;
    }

    getParticleCount(): integer {
      return this.renderer.getParticleCount();
    }

    stop() {
      this.renderer.stopSystem();
    }

    recreate() {
      this.renderer.resetSystem();
    }

    destroy() {
      this.renderer.destroyParticleSystem();
    }

    hasStarted(): boolean {
      return this.started;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const ParticleEmitterObjectRenderer = ParticleEmitterObjectCocosRenderer;
}
