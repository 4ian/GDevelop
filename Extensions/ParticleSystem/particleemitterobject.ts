/*
 * GDevelop - Particle System Extension
 * Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 * This project is released under the MIT License.
 */

namespace gdjs {
  export type ParticleEmitterObjectDataType = {
    /**
     * @deprecated Data not used
     */
    emitterAngleA: number;
    emitterForceMin: number;
    /**
     * Cone spray angle (degrees)
     */
    emitterAngleB: number;
    zoneRadius: number;
    emitterForceMax: number;
    particleLifeTimeMax: number;
    particleLifeTimeMin: number;
    particleGravityY: number;
    particleGravityX: number;
    particleColor2: string;
    particleColor1: string;
    particleSize2: number;
    particleSize1: number;
    /**
     * Particle max rotation speed (degrees/second)
     */
    particleAngle2: number;
    /**
     * Particle min rotation speed (degrees/second)
     */
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
    jumpForwardInTimeOnCreation: number;
  };

  export type ParticleEmitterObjectData = ObjectData &
    ParticleEmitterObjectDataType;

  export type ParticleEmitterObjectNetworkSyncDataType = {
    // Technically, all attributes can change at runtime, so we sync as many as possible.
    // TODO: ensure we only send props that change to optimize the sync.
    // dirty attributes are not synced, they are defined by the update method if the value has changed.
    // Particle Rotation Speed
    prms: number;
    prmx: number;
    // Max Particles Count
    mpc: number;
    // Additive Rendering
    addr: boolean;
    // Angle
    angb: number;
    // Force
    formin: number;
    formax: number;
    // Zone Radius
    zr: number;
    // Life Time
    ltmin: number;
    ltmax: number;
    // Gravity
    gravx: number;
    gravy: number;
    // Color
    color1: number;
    color2: number;
    // Size
    size1: number;
    size2: number;
    // Alpha
    alp1: number;
    alp2: number;
    // Flow
    flow: number;
    // Tank
    tank: number;
    // Texture
    text: string;
    // Pause
    paused: boolean;
  };

  export type ParticleEmitterObjectNetworkSyncData = ObjectNetworkSyncData &
    ParticleEmitterObjectNetworkSyncDataType;

  /**
   * Displays particles.
   */
  export class ParticleEmitterObject extends gdjs.RuntimeObject {
    /**
     * @deprecated Data not used
     */
    angleA: number;
    angleB: number;
    forceMin: number;
    forceMax: float;
    zoneRadius: number;
    lifeTimeMin: number;
    lifeTimeMax: float;
    gravityX: number;
    gravityY: number;
    color1: number;
    color2: number;
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
    particleRotationMinSpeed: number;
    particleRotationMaxSpeed: number;
    maxParticlesCount: number;
    additiveRendering: boolean;
    jumpForwardInTimeOnCreation: number;
    _jumpForwardInTimeCompleted: boolean = false;
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
    _particleRotationSpeedDirty: boolean = true;
    _maxParticlesCountDirty: boolean = true;
    _additiveRenderingDirty: boolean = true;
    // Don't mark texture as dirty if not using one.
    _textureDirty: boolean;
    /**
     * `true` only when the emission is paused by events.
     * It allows to tell the end of emission apart from it.
     */
    _isEmissionPaused: boolean = false;

    // @ts-ignore
    _renderer: gdjs.ParticleEmitterObjectRenderer;

    /**
     * @param instanceContainer the container the object belongs to
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
      this.color1 = gdjs.rgbOrHexStringToNumber(
        particleObjectData.particleColor1
      );
      this.color2 = gdjs.rgbOrHexStringToNumber(
        particleObjectData.particleColor2
      );
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
      this.particleRotationMinSpeed = particleObjectData.particleAngle1;
      this.particleRotationMaxSpeed = particleObjectData.particleAngle2;
      this.maxParticlesCount = particleObjectData.maxParticleNb;
      this.additiveRendering = particleObjectData.additive;
      this.jumpForwardInTimeOnCreation =
        particleObjectData.jumpForwardInTimeOnCreation;
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
      if (oldObjectData.particleAngle1 !== newObjectData.particleAngle1) {
        this.setParticleRotationMinSpeed(newObjectData.particleAngle1);
      }
      if (oldObjectData.particleAngle2 !== newObjectData.particleAngle2) {
        this.setParticleRotationMaxSpeed(newObjectData.particleAngle2);
      }
      if (oldObjectData.maxParticleNb !== newObjectData.maxParticleNb) {
        this.setMaxParticlesCount(newObjectData.maxParticleNb);
      }
      if (oldObjectData.additive !== newObjectData.additive) {
        this.setAdditiveRendering(newObjectData.additive);
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
      if (oldObjectData.particleColor1 !== newObjectData.particleColor1) {
        this.setParticleColor1(newObjectData.particleColor1);
      }
      if (oldObjectData.particleColor2 !== newObjectData.particleColor2) {
        this.setParticleColor2(newObjectData.particleColor2);
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
        const layer = this.getInstanceContainer().getLayer(this.layer);
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

    getNetworkSyncData(): ParticleEmitterObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        prms: this.particleRotationMinSpeed,
        prmx: this.particleRotationMaxSpeed,
        mpc: this.maxParticlesCount,
        addr: this.additiveRendering,
        angb: this.angleB,
        formin: this.forceMin,
        formax: this.forceMax,
        zr: this.zoneRadius,
        ltmin: this.lifeTimeMin,
        ltmax: this.lifeTimeMax,
        gravx: this.gravityX,
        gravy: this.gravityY,
        color1: this.color1,
        color2: this.color2,
        size1: this.size1,
        size2: this.size2,
        alp1: this.alpha1,
        alp2: this.alpha2,
        flow: this.flow,
        tank: this.tank,
        text: this.texture,
        paused: this._isEmissionPaused,
      };
    }

    updateFromNetworkSyncData(
      syncData: ParticleEmitterObjectNetworkSyncData
    ): void {
      super.updateFromNetworkSyncData(syncData);
      if (syncData.x !== undefined) {
        this.setX(syncData.x);
      }
      if (syncData.y !== undefined) {
        this.setY(syncData.y);
      }
      if (syncData.a !== undefined) {
        this.setAngle(syncData.a);
      }
      if (syncData.prms !== undefined) {
        this.setParticleRotationMinSpeed(syncData.prms);
      }
      if (syncData.prmx !== undefined) {
        this.setParticleRotationMaxSpeed(syncData.prmx);
      }
      if (syncData.mpc !== undefined) {
        this.setMaxParticlesCount(syncData.mpc);
      }
      if (syncData.addr !== undefined) {
        this.setAdditiveRendering(syncData.addr);
      }
      if (syncData.angb !== undefined) {
        this.setEmitterAngleB(syncData.angb);
      }
      if (syncData.formin !== undefined) {
        this.setEmitterForceMin(syncData.formin);
      }
      if (syncData.formax !== undefined) {
        this.setEmitterForceMax(syncData.formax);
      }
      if (syncData.zr !== undefined) {
        this.setZoneRadius(syncData.zr);
      }
      if (syncData.ltmin !== undefined) {
        this.setParticleLifeTimeMin(syncData.ltmin);
      }
      if (syncData.ltmax !== undefined) {
        this.setParticleLifeTimeMax(syncData.ltmax);
      }
      if (syncData.gravx !== undefined) {
        this.setParticleGravityX(syncData.gravx);
      }
      if (syncData.gravy !== undefined) {
        this.setParticleGravityY(syncData.gravy);
      }
      if (syncData.color1 !== undefined) {
        this.setParticleColor1AsNumber(syncData.color1);
      }
      if (syncData.color2 !== undefined) {
        this.setParticleColor2AsNumber(syncData.color2);
      }
      if (syncData.size1 !== undefined) {
        this.setParticleSize1(syncData.size1);
      }
      if (syncData.size2 !== undefined) {
        this.setParticleSize2(syncData.size2);
      }
      if (syncData.alp1 !== undefined) {
        this.setParticleAlpha1(syncData.alp1);
      }
      if (syncData.alp2 !== undefined) {
        this.setParticleAlpha2(syncData.alp2);
      }
      if (syncData.flow !== undefined) {
        this.setFlow(syncData.flow);
      }
      if (syncData.tank !== undefined) {
        this.setTank(syncData.tank);
      }
      if (syncData.text !== undefined) {
        this.setTexture(syncData.text, this.getRuntimeScene());
      }
      if (syncData.paused !== undefined) {
        if (syncData.paused) {
          this.stopEmission();
        } else {
          this.startEmission();
        }
      }
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._posDirty) {
        this._renderer.setPosition(this.getX(), this.getY());
      }
      if (this._particleRotationSpeedDirty) {
        this._renderer.setParticleRotationSpeed(
          this.particleRotationMinSpeed,
          this.particleRotationMaxSpeed
        );
      }
      if (this._maxParticlesCountDirty) {
        this._renderer.setMaxParticlesCount(this.maxParticlesCount);
      }
      if (this._additiveRenderingDirty) {
        this._renderer.setAdditiveRendering(this.additiveRendering);
      }
      if (this._angleDirty) {
        const angle = this.getAngle();
        this._renderer.setAngle(
          angle - this.angleB / 2.0,
          angle + this.angleB / 2.0
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
        this._renderer.setColor(this.color1, this.color2);
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
      this._additiveRenderingDirty = this._maxParticlesCountDirty = this._particleRotationSpeedDirty = false;
      this._renderer.update(this.getElapsedTime() / 1000.0);
      if (
        this.destroyWhenNoParticles &&
        this.getParticleCount() === 0 &&
        this._renderer.hasStarted() &&
        !this._isEmissionPaused &&
        this._renderer._mayHaveEndedEmission()
      ) {
        this.deleteFromScene(instanceContainer);
      }
      if (
        this.jumpForwardInTimeOnCreation > 0 &&
        this._jumpForwardInTimeCompleted === false
      ) {
        this._renderer.update(this.jumpForwardInTimeOnCreation);
        this._jumpForwardInTimeCompleted = true;
      }
    }

    onDestroyed(): void {
      this._renderer.destroy();
      super.onDestroyed();
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

    setParticleRotationMinSpeed(speed: number): void {
      if (this.particleRotationMinSpeed !== speed) {
        this._particleRotationSpeedDirty = true;
        this.particleRotationMinSpeed = speed;
      }
    }

    getParticleRotationMinSpeed(): number {
      return this.particleRotationMinSpeed;
    }

    setParticleRotationMaxSpeed(speed: number): void {
      if (this.particleRotationMaxSpeed !== speed) {
        this._particleRotationSpeedDirty = true;
        this.particleRotationMaxSpeed = speed;
      }
    }

    getParticleRotationMaxSpeed(): number {
      return this.particleRotationMaxSpeed;
    }

    setMaxParticlesCount(count: number): void {
      if (this.maxParticlesCount !== count) {
        this._maxParticlesCountDirty = true;
        this.maxParticlesCount = count;
      }
    }

    getMaxParticlesCount(): number {
      return this.maxParticlesCount;
    }

    setAdditiveRendering(enabled: boolean) {
      if (this.additiveRendering !== enabled) {
        this._additiveRenderingDirty = true;
        this.additiveRendering = enabled;
      }
    }

    getAdditiveRendering(): boolean {
      return this.additiveRendering;
    }

    /**
     * @deprecated Prefer using getAngle
     */
    getEmitterAngle(): float {
      return (this.angleA + this.angleB) / 2.0;
    }

    /**
     * @deprecated Prefer using setAngle
     */
    setEmitterAngle(angle: float): void {
      const oldAngle = this.getEmitterAngle();
      if (angle !== oldAngle) {
        this._angleDirty = true;
        this.angleA += angle - oldAngle;
        this.angleB += angle - oldAngle;
      }
    }

    /**
     * @deprecated This function returns data that is not used.
     */
    getEmitterAngleA(): float {
      return this.angleA;
    }

    /**
     * @deprecated This function sets data that is not used.
     */
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
      return this.getEmitterAngleB();
    }

    setConeSprayAngle(angle: float): void {
      this.setEmitterAngleB(angle);
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
      return gdjs.hexNumberToRGBArray(this.color1)[0];
    }

    setParticleRed1(red: number): void {
      if (red < 0) {
        red = 0;
      }
      if (red > 255) {
        red = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color1);
      this.setParticleColor1AsNumber(
        gdjs.rgbToHexNumber(red, existingColor[1], existingColor[2])
      );
    }

    getParticleRed2(): number {
      return gdjs.hexNumberToRGBArray(this.color2)[0];
    }

    setParticleRed2(red: number): void {
      if (red < 0) {
        red = 0;
      }
      if (red > 255) {
        red = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color2);
      this.setParticleColor2AsNumber(
        gdjs.rgbToHexNumber(red, existingColor[1], existingColor[2])
      );
    }

    getParticleGreen1(): number {
      return gdjs.hexNumberToRGBArray(this.color1)[1];
    }

    setParticleGreen1(green: number): void {
      if (green < 0) {
        green = 0;
      }
      if (green > 255) {
        green = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color1);
      this.setParticleColor1AsNumber(
        gdjs.rgbToHexNumber(existingColor[0], green, existingColor[2])
      );
    }

    getParticleGreen2(): number {
      return gdjs.hexNumberToRGBArray(this.color2)[1];
    }

    setParticleGreen2(green: number): void {
      if (green < 0) {
        green = 0;
      }
      if (green > 255) {
        green = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color2);
      this.setParticleColor2AsNumber(
        gdjs.rgbToHexNumber(existingColor[0], green, existingColor[2])
      );
    }

    getParticleBlue1(): number {
      return gdjs.hexNumberToRGBArray(this.color1)[2];
    }

    setParticleBlue1(blue: number): void {
      if (blue < 0) {
        blue = 0;
      }
      if (blue > 255) {
        blue = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color1);
      this.setParticleColor1AsNumber(
        gdjs.rgbToHexNumber(existingColor[0], existingColor[1], blue)
      );
    }

    getParticleBlue2(): number {
      return gdjs.hexNumberToRGBArray(this.color2)[2];
    }

    setParticleBlue2(blue: number): void {
      if (blue < 0) {
        blue = 0;
      }
      if (blue > 255) {
        blue = 255;
      }
      const existingColor = gdjs.hexNumberToRGBArray(this.color2);
      this.setParticleColor2AsNumber(
        gdjs.rgbToHexNumber(existingColor[0], existingColor[1], blue)
      );
    }

    setParticleColor1AsNumber(color: number): void {
      this.color1 = color;
      this._colorDirty = true;
    }

    setParticleColor1(rgbOrHexColor: string): void {
      this.setParticleColor1AsNumber(
        gdjs.rgbOrHexStringToNumber(rgbOrHexColor)
      );
    }

    setParticleColor2AsNumber(color: number): void {
      this.color2 = color;
      this._colorDirty = true;
    }

    setParticleColor2(rgbOrHexColor: string): void {
      this.setParticleColor2AsNumber(
        gdjs.rgbOrHexStringToNumber(rgbOrHexColor)
      );
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
      this._isEmissionPaused = false;
      this._renderer.start();
    }

    stopEmission(): void {
      this._isEmissionPaused = true;
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

    setTexture(
      texture: string,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      if (this.texture !== texture) {
        if (this._renderer.isTextureNameValid(texture, instanceContainer)) {
          this.texture = texture;
          this._textureDirty = true;
        }
      }
    }

    jumpEmitterForwardInTime(timeSkipped: number): void {
      this._renderer.update(timeSkipped);
    }
  }
  gdjs.registerObject(
    'ParticleSystem::ParticleEmitter',
    gdjs.ParticleEmitterObject
  );
}
