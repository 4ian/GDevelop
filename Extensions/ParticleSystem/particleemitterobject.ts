/*
 * GDevelop - Particle System Extension
 * Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 * This project is released under the MIT License.
 */

namespace gdjs {
  export type ParticleEmitterObjectDataType = {
    emitterAngleA: number;
    emitterForceMin: number;
    emitterAngleB: number;
    zoneRadius: number;
    emitterForceMax: number;
    particleLifeTimeMax: number;
    particleLifeTimeMin: number;
    particleGravityY: number;
    particleGravityX: number;
    particleRed2: number;
    particleRed1: number;
    particleGreen2: number;
    particleGreen1: number;
    particleBlue2: number;
    particleBlue1: number;
    particleSize2: number;
    particleSize1: number;
    particleAngle2: number;
    particleAngle1: number;
    particleAlpha1: number;
    rendererType: string;
    particleAlpha2: number;
    rendererParam2: number;
    rendererParam1: number;
    particleSizeRandomness1: number;
    particleSizeRandomness2: number;
    maxParticleNb: number;
    additive: boolean;
    /** Resource name for image in particle */
    textureParticleName: string;
    tank: number;
    flow: number;
    /** Destroy the object when there is no particles? */
    destroyWhenNoParticles: boolean;
  };

  export type ParticleEmitterObjectData = ObjectData &
    ParticleEmitterObjectDataType;

  /**
   * Displays particles.
   */
  export class ParticleEmitterObject extends gdjs.RuntimeObject {
    angleA: number;
    angleB: number;
    forceMin: number;
    forceMax: float;
    zoneRadius: number;
    lifeTimeMin: number;
    lifeTimeMax: float;
    gravityX: number;
    gravityY: number;
    colorR1: number;
    colorR2: number;
    colorG1: number;
    colorG2: number;
    colorB1: number;
    colorB2: number;
    size1: number;
    size2: number;
    alpha1: number;
    alpha2: number;
    rendererType: string;
    rendererParam1: number;
    rendererParam2: number;
    texture: string;
    flow: number;
    tank: number;
    destroyWhenNoParticles: boolean;
    _posDirty: boolean = true;
    _angleDirty: boolean = true;
    _forceDirty: boolean = true;
    _zoneRadiusDirty: boolean = true;
    _lifeTimeDirty: boolean = true;
    _gravityDirty: boolean = true;
    _colorDirty: boolean = true;
    _sizeDirty: boolean = true;
    _alphaDirty: boolean = true;
    _flowDirty: boolean = true;
    _tankDirty: boolean = true;
    // Don't mark texture as dirty if not using one.
    _textureDirty: boolean;

    // @ts-ignore
    _renderer: gdjs.ParticleEmitterObjectRenderer;

    /**
     * @param the object belongs to
     * @param particleObjectData The initial properties of the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      particleObjectData: ParticleEmitterObjectData
    ) {
      super(instanceContainer, particleObjectData);
      this._renderer = new gdjs.ParticleEmitterObjectRenderer(
        instanceContainer,
        this,
        particleObjectData
      );
      this.angleA = particleObjectData.emitterAngleA;
      this.angleB = particleObjectData.emitterAngleB;
      this.forceMin = particleObjectData.emitterForceMin;
      this.forceMax = particleObjectData.emitterForceMax;
      this.zoneRadius = particleObjectData.zoneRadius;
      this.lifeTimeMin = particleObjectData.particleLifeTimeMin;
      this.lifeTimeMax = particleObjectData.particleLifeTimeMax;
      this.gravityX = particleObjectData.particleGravityX;
      this.gravityY = particleObjectData.particleGravityY;
      this.colorR1 = particleObjectData.particleRed1;
      this.colorR2 = particleObjectData.particleRed2;
      this.colorG1 = particleObjectData.particleGreen1;
      this.colorG2 = particleObjectData.particleGreen2;
      this.colorB1 = particleObjectData.particleBlue1;
      this.colorB2 = particleObjectData.particleBlue2;
      this.size1 = particleObjectData.particleSize1;
      this.size2 = particleObjectData.particleSize2;
      this.alpha1 = particleObjectData.particleAlpha1;
      this.alpha2 = particleObjectData.particleAlpha2;
      this.rendererType = particleObjectData.rendererType;
      this.rendererParam1 = particleObjectData.rendererParam1;
      this.rendererParam2 = particleObjectData.rendererParam2;
      this.texture = particleObjectData.textureParticleName;
      this.flow = particleObjectData.flow;
      this.tank = particleObjectData.tank;
      this.destroyWhenNoParticles = particleObjectData.destroyWhenNoParticles;
      this._textureDirty = this.texture !== '';

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    setX(x: number): void {
      if (this.x !== x) {
        this._posDirty = true;
      }
      super.setX(x);
    }

    setY(y: number): void {
      if (this.y !== y) {
        this._posDirty = true;
      }
      super.setY(y);
    }

    setAngle(angle): void {
      if (this.angle !== angle) {
        this._angleDirty = true;
      }
      super.setAngle(angle);
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: ParticleEmitterObjectData,
      newObjectData: ParticleEmitterObjectData
    ): boolean {
      if (oldObjectData.emitterAngleA !== newObjectData.emitterAngleA) {
        this.setEmitterAngleA(newObjectData.emitterAngleA);
      }
      if (oldObjectData.emitterAngleB !== newObjectData.emitterAngleB) {
        this.setEmitterAngleB(newObjectData.emitterAngleB);
      }
      if (oldObjectData.emitterForceMin !== newObjectData.emitterForceMin) {
        this.setEmitterForceMin(newObjectData.emitterForceMin);
      }
      if (oldObjectData.emitterForceMax !== newObjectData.emitterForceMax) {
        this.setEmitterForceMax(newObjectData.emitterForceMax);
      }
      if (oldObjectData.zoneRadius !== newObjectData.zoneRadius) {
        this.setZoneRadius(newObjectData.zoneRadius);
      }
      if (
        oldObjectData.particleLifeTimeMin !== newObjectData.particleLifeTimeMin
      ) {
        this.setParticleLifeTimeMin(newObjectData.particleLifeTimeMin);
      }
      if (
        oldObjectData.particleLifeTimeMax !== newObjectData.particleLifeTimeMax
      ) {
        this.setParticleLifeTimeMax(newObjectData.particleLifeTimeMax);
      }
      if (oldObjectData.particleGravityX !== newObjectData.particleGravityX) {
        this.setParticleGravityX(newObjectData.particleGravityX);
      }
      if (oldObjectData.particleGravityY !== newObjectData.particleGravityY) {
        this.setParticleGravityY(newObjectData.particleGravityY);
      }
      if (oldObjectData.particleRed1 !== newObjectData.particleRed1) {
        this.setParticleRed1(newObjectData.particleRed1);
      }
      if (oldObjectData.particleRed2 !== newObjectData.particleRed2) {
        this.setParticleRed2(newObjectData.particleRed2);
      }
      if (oldObjectData.particleGreen1 !== newObjectData.particleGreen1) {
        this.setParticleGreen1(newObjectData.particleGreen1);
      }
      if (oldObjectData.particleGreen2 !== newObjectData.particleGreen2) {
        this.setParticleGreen2(newObjectData.particleGreen2);
      }
      if (oldObjectData.particleBlue1 !== newObjectData.particleBlue1) {
        this.setParticleBlue1(newObjectData.particleBlue1);
      }
      if (oldObjectData.particleBlue2 !== newObjectData.particleBlue2) {
        this.setParticleBlue2(newObjectData.particleBlue2);
      }
      if (oldObjectData.particleSize1 !== newObjectData.particleSize1) {
        this.setParticleSize1(newObjectData.particleSize1);
      }
      if (oldObjectData.particleSize2 !== newObjectData.particleSize2) {
        this.setParticleSize2(newObjectData.particleSize2);
      }
      if (oldObjectData.particleAlpha1 !== newObjectData.particleAlpha1) {
        this.setParticleAlpha1(newObjectData.particleAlpha1);
      }
      if (oldObjectData.particleAlpha2 !== newObjectData.particleAlpha2) {
        this.setParticleAlpha2(newObjectData.particleAlpha2);
      }
      if (
        oldObjectData.textureParticleName !== newObjectData.textureParticleName
      ) {
        this.setTexture(
          newObjectData.textureParticleName,
          this.getRuntimeScene()
        );
      }
      if (oldObjectData.flow !== newObjectData.flow) {
        this.setFlow(newObjectData.flow);
      }
      if (oldObjectData.tank !== newObjectData.tank) {
        this.setTank(newObjectData.tank);
      }
      if (
        oldObjectData.destroyWhenNoParticles !==
        newObjectData.destroyWhenNoParticles
      ) {
        this.destroyWhenNoParticles = newObjectData.destroyWhenNoParticles;
      }
      if (
        oldObjectData.particleSizeRandomness1 !==
          newObjectData.particleSizeRandomness1 ||
        oldObjectData.particleSizeRandomness2 !==
          newObjectData.particleSizeRandomness2 ||
        oldObjectData.particleAngle1 !== newObjectData.particleAngle1 ||
        oldObjectData.particleAngle2 !== newObjectData.particleAngle2 ||
        oldObjectData.maxParticleNb !== newObjectData.maxParticleNb ||
        oldObjectData.additive !== newObjectData.additive ||
        oldObjectData.rendererType !== newObjectData.rendererType ||
        oldObjectData.rendererParam1 !== newObjectData.rendererParam1 ||
        oldObjectData.rendererParam2 !== newObjectData.rendererParam2
      ) {
        // Destroy the renderer, ensure it's removed from the layer.
        const layer = this._runtimeScene.getLayer(this.layer);
        layer
          .getRenderer()
          .removeRendererObject(this._renderer.getRendererObject());
        this._renderer.destroy();

        // and recreate the renderer, which will add itself to the layer.
        this._renderer = new gdjs.ParticleEmitterObjectRenderer(
          this.getInstanceContainer(),
          this,
          newObjectData
        );

        // Consider every state dirty as the renderer was just re-created, so it needs
        // to be repositioned, angle updated, etc...
        this._posDirty = this._angleDirty = this._forceDirty = this._zoneRadiusDirty = true;
        this._lifeTimeDirty = this._gravityDirty = this._colorDirty = this._sizeDirty = true;
        this._alphaDirty = this._flowDirty = this._tankDirty = this._textureDirty = true;
      }
      return true;
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._posDirty) {
        this._renderer.setPosition(this.getX(), this.getY());
      }
      if (this._angleDirty) {
        const angle = this.getAngle();
        this._renderer.setAngle(
          this.angle - this.angleB / 2.0,
          this.angle + this.angleB / 2.0
        );
      }
      if (this._forceDirty) {
        this._renderer.setForce(this.forceMin, this.forceMax);
      }
      if (this._zoneRadiusDirty) {
        this._renderer.setZoneRadius(this.zoneRadius);
      }
      if (this._lifeTimeDirty) {
        this._renderer.setLifeTime(this.lifeTimeMin, this.lifeTimeMax);
      }
      if (this._gravityDirty) {
        this._renderer.setGravity(this.gravityX, this.gravityY);
      }
      if (this._colorDirty) {
        this._renderer.setColor(
          this.colorR1,
          this.colorG1,
          this.colorB1,
          this.colorR2,
          this.colorG2,
          this.colorB2
        );
      }
      if (this._sizeDirty) {
        this._renderer.setSize(this.size1, this.size2);
      }
      if (this._alphaDirty) {
        this._renderer.setAlpha(this.alpha1, this.alpha2);
      }
      if (this._flowDirty || this._tankDirty) {
        this._renderer.resetEmission(this.flow, this.tank);
      }
      if (this._textureDirty) {
        this._renderer.setTextureName(this.texture, instanceContainer);
      }
      this._posDirty = this._angleDirty = this._forceDirty = this._zoneRadiusDirty = false;
      this._lifeTimeDirty = this._gravityDirty = this._colorDirty = this._sizeDirty = false;
      this._alphaDirty = this._flowDirty = this._textureDirty = this._tankDirty = false;
      this._renderer.update(this.getElapsedTime(instanceContainer) / 1000.0);
      if (
        this._renderer.hasStarted() &&
        this.getParticleCount() === 0 &&
        this.destroyWhenNoParticles
      ) {
        this.deleteFromScene(instanceContainer);
      }
    }

    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._renderer.destroy();
      super.onDestroyFromScene(instanceContainer);
    }

    getEmitterForceMin(): number {
      return this.forceMin;
    }

    setEmitterForceMin(force: float): void {
      if (force < 0) {
        force = 0;
      }
      if (this.forceMin !== force) {
        this._forceDirty = true;
        this.forceMin = force;
      }
    }

    getEmitterForceMax(): number {
      return this.forceMax;
    }

    setEmitterForceMax(force: float): void {
      if (force < 0) {
        force = 0;
      }
      if (this.forceMax !== force) {
        this._forceDirty = true;
        this.forceMax = force;
      }
    }

    getEmitterAngle(): float {
      return (this.angleA + this.angleB) / 2.0;
    }

    setEmitterAngle(angle: float): void {
      const oldAngle = this.getEmitterAngle();
      if (angle !== oldAngle) {
        this._angleDirty = true;
        this.angleA += angle - oldAngle;
        this.angleB += angle - oldAngle;
      }
    }

    getEmitterAngleA(): float {
      return this.angleA;
    }

    setEmitterAngleA(angle: float): void {
      if (this.angleA !== angle) {
        this._angleDirty = true;
        this.angleA = angle;
      }
    }

    getEmitterAngleB(): float {
      return this.angleB;
    }

    setEmitterAngleB(angle: float): void {
      if (this.angleB !== angle) {
        this._angleDirty = true;
        this.angleB = angle;
      }
    }

    getConeSprayAngle(): float {
      return Math.abs(this.angleB - this.angleA);
    }

    setConeSprayAngle(angle: float): void {
      const oldCone = this.getConeSprayAngle();
      if (oldCone !== angle) {
        this._angleDirty = true;
        const midAngle = this.getEmitterAngle();
        this.angleA = midAngle - angle / 2.0;
        this.angleB = midAngle + angle / 2.0;
      }
    }

    getZoneRadius(): float {
      return this.zoneRadius;
    }

    setZoneRadius(radius: float): void {
      if (radius < 0) {
        radius = 0;
      }
      if (this.zoneRadius !== radius && radius > 0) {
        this._zoneRadiusDirty = true;
        this.zoneRadius = radius;
      }
    }

    getParticleLifeTimeMin(): float {
      return this.lifeTimeMin;
    }

    setParticleLifeTimeMin(lifeTime: float): void {
      if (lifeTime < 0) {
        lifeTime = 0;
      }
      if (this.lifeTimeMin !== lifeTime) {
        this._lifeTimeDirty = true;
        this.lifeTimeMin = lifeTime;
      }
    }

    getParticleLifeTimeMax(): float {
      return this.lifeTimeMax;
    }

    setParticleLifeTimeMax(lifeTime: float): void {
      if (lifeTime < 0) {
        lifeTime = 0;
      }
      if (this.lifeTimeMax !== lifeTime) {
        this._lifeTimeDirty = true;
        this.lifeTimeMax = lifeTime;
      }
    }

    getParticleGravityX(): float {
      return this.gravityX;
    }

    setParticleGravityX(x: float): void {
      if (this.gravityX !== x) {
        this._gravityDirty = true;
        this.gravityX = x;
      }
    }

    getParticleGravityY(): float {
      return this.gravityY;
    }

    setParticleGravityY(y: float): void {
      if (this.gravityY !== y) {
        this._gravityDirty = true;
        this.gravityY = y;
      }
    }

    getParticleGravityAngle(): float {
      return (Math.atan2(this.gravityY, this.gravityX) * 180.0) / Math.PI;
    }

    setParticleGravityAngle(angle: float): void {
      const oldAngle = this.getParticleGravityAngle();
      if (oldAngle !== angle) {
        this._gravityDirty = true;
        const length = this.getParticleGravityLength();
        this.gravityX = length * Math.cos((angle * Math.PI) / 180.0);
        this.gravityY = length * Math.sin((angle * Math.PI) / 180.0);
      }
    }

    getParticleGravityLength(): float {
      return Math.sqrt(
        this.gravityX * this.gravityX + this.gravityY * this.gravityY
      );
    }

    setParticleGravityLength(length: float): void {
      if (length < 0) {
        length = 0;
      }
      const oldLength = this.getParticleGravityLength();
      if (oldLength !== length) {
        this._gravityDirty = true;
        this.gravityX *= length / oldLength;
        this.gravityY *= length / oldLength;
      }
    }

    getParticleRed1(): number {
      return this.colorR1;
    }

    setParticleRed1(red: number): void {
      if (red < 0) {
        red = 0;
      }
      if (red > 255) {
        red = 255;
      }
      if (this.colorR1 !== red) {
        this._colorDirty = true;
        this.colorR1 = red;
      }
    }

    getParticleRed2(): number {
      return this.colorR2;
    }

    setParticleRed2(red: number): void {
      if (red < 0) {
        red = 0;
      }
      if (red > 255) {
        red = 255;
      }
      if (this.colorR2 !== red) {
        this._colorDirty = true;
        this.colorR2 = red;
      }
    }

    getParticleGreen1(): number {
      return this.colorG1;
    }

    setParticleGreen1(green: number): void {
      if (green < 0) {
        green = 0;
      }
      if (green > 255) {
        green = 255;
      }
      if (this.colorG1 !== green) {
        this._colorDirty = true;
        this.colorG1 = green;
      }
    }

    getParticleGreen2(): number {
      return this.colorG2;
    }

    setParticleGreen2(green: number): void {
      if (green < 0) {
        green = 0;
      }
      if (green > 255) {
        green = 255;
      }
      if (this.colorG2 !== green) {
        this._colorDirty = true;
        this.colorG2 = green;
      }
    }

    getParticleBlue1(): number {
      return this.colorB1;
    }

    setParticleBlue1(blue: number): void {
      if (blue < 0) {
        blue = 0;
      }
      if (blue > 255) {
        blue = 255;
      }
      if (this.colorB1 !== blue) {
        this._colorDirty = true;
        this.colorB1 = blue;
      }
    }

    getParticleBlue2(): number {
      return this.colorB2;
    }

    setParticleBlue2(blue: number): void {
      if (blue < 0) {
        blue = 0;
      }
      if (blue > 255) {
        blue = 255;
      }
      if (this.colorB2 !== blue) {
        this._colorDirty = true;
        this.colorB2 = blue;
      }
    }

    setParticleColor1(rgbColor: string): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this.setParticleRed1(parseInt(colors[0], 10));
      this.setParticleGreen1(parseInt(colors[1], 10));
      this.setParticleBlue1(parseInt(colors[2], 10));
    }

    setParticleColor2(rgbColor: string): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this.setParticleRed2(parseInt(colors[0], 10));
      this.setParticleGreen2(parseInt(colors[1], 10));
      this.setParticleBlue2(parseInt(colors[2], 10));
    }

    getParticleSize1(): float {
      return this.size1;
    }

    setParticleSize1(size: float): void {
      if (size < 0) {
        size = 0;
      }
      if (this.size1 !== size) {
        this._sizeDirty = true;
        this.size1 = size;
      }
    }

    getParticleSize2(): float {
      return this.size2;
    }

    setParticleSize2(size: float): void {
      if (this.size2 !== size) {
        this._sizeDirty = true;
        this.size2 = size;
      }
    }

    getParticleAlpha1(): number {
      return this.alpha1;
    }

    setParticleAlpha1(alpha: number): void {
      if (this.alpha1 !== alpha) {
        this._alphaDirty = true;
        this.alpha1 = alpha;
      }
    }

    getParticleAlpha2(): number {
      return this.alpha2;
    }

    setParticleAlpha2(alpha: number): void {
      if (this.alpha2 !== alpha) {
        this._alphaDirty = true;
        this.alpha2 = alpha;
      }
    }

    startEmission(): void {
      this._renderer.start();
    }

    stopEmission(): void {
      this._renderer.stop();
    }

    isEmitting(): boolean {
      return this._renderer.emitter.emit;
    }

    noMoreParticles(): boolean {
      return !this.isEmitting();
    }

    recreateParticleSystem(): void {
      this._renderer.recreate();
    }

    getFlow(): number {
      return this.flow;
    }

    setFlow(flow: number): void {
      if (this.flow !== flow) {
        this.flow = flow;
        this._flowDirty = true;
      }
    }

    getParticleCount(): number {
      return this._renderer.getParticleCount();
    }

    getTank(): number {
      return this.tank;
    }

    setTank(tank: number): void {
      this.tank = tank;
      this._tankDirty = true;
    }

    getTexture(): string {
      return this.texture;
    }

    setTexture(texture: string, runtimeScene: gdjs.RuntimeScene): void {
      if (this.texture !== texture) {
        if (this._renderer.isTextureNameValid(texture, runtimeScene)) {
          this.texture = texture;
          this._textureDirty = true;
        }
      }
    }
  }
  gdjs.registerObject(
    'ParticleSystem::ParticleEmitter',
    gdjs.ParticleEmitterObject
  );
}
