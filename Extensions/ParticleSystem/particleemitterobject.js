/**
 * GDevelop - Particle System Extension
 * Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 * This project is released under the MIT License.
*/

/**
 * @typedef {Object} ParticleEmitterObjectDataType
 * @property {boolean} emissionEditionSimpleMode
 * @property {number} emitterAngleA
 * @property {number} emitterAngleB
 * @property {number} emitterForceMin
 * @property {number} emitterForceMax
 * @property {number} zoneRadius
 * @property {number} particleLifeTimeMin
 * @property {number} particleLifeTimeMax
 * @property {number} particleGravityX
 * @property {number} particleGravityY
 * @property {number} particleRed1
 * @property {number} particleRed2
 * @property {number} particleGreen1
 * @property {number} particleGreen2
 * @property {number} particleBlue1
 * @property {number} particleBlue2
 * @property {number} particleSize1
 * @property {number} particleSize2
 * @property {number} sizeParam
 * @property {number} particleAlpha1
 * @property {number} particleAlpha2
 * @property {string} rendererType
 * @property {number} rendererParam1
 * @property {number} rendererParam1
 * @property {string} textureParticleName Resource name for image in particle
 * @property {number} flow
 * @property {number} tank
 * @property {boolean} destroyWhenNoParticles Destroy the object when there is no particles?
 * 
 * @typedef {ObjectData & ParticleEmitterObjectDataType} ParticleEmitterObjectData
 */

/**
 * Displays particles.
 *
 * @memberof gdjs
 * @class ParticleEmitterObject
 * @extends RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene  The {@link gdjs.RuntimeScene} the object belongs to
 * @param {ParticleEmitterObjectData} particleObjectData The initial properties of the object
 */
gdjs.ParticleEmitterObject = function(runtimeScene, particleObjectData){
    gdjs.RuntimeObject.call(this, runtimeScene, particleObjectData);

    /** @type {gdjs.ParticleEmitterObjectRenderer} */
    this._renderer = new gdjs.ParticleEmitterObjectRenderer(runtimeScene, this, particleObjectData);

    /** @type {boolean} */
    this.singleAngle = particleObjectData.emissionEditionSimpleMode;

    /** @type {number} */
    this.angleA = particleObjectData.emitterAngleA;

    /** @type {number} */
    this.angleB = particleObjectData.emitterAngleB;

    /** @type {number} */
    this.forceMin = particleObjectData.emitterForceMin;

    /** @type {number} */
    this.forceMax = particleObjectData.emitterForceMax;

    /** @type {number} */
    this.zoneRadius = particleObjectData.zoneRadius;

    /** @type {number} */
    this.lifeTimeMin = particleObjectData.particleLifeTimeMin;

    /** @type {number} */
    this.lifeTimeMax = particleObjectData.particleLifeTimeMax;

    /** @type {number} */
    this.gravityX = particleObjectData.particleGravityX;

    /** @type {number} */
    this.gravityY = particleObjectData.particleGravityY;

    /** @type {number} */
    this.colorR1 = particleObjectData.particleRed1;

    /** @type {number} */
    this.colorR2 = particleObjectData.particleRed2;

    /** @type {number} */
    this.colorG1 = particleObjectData.particleGreen1;

    /** @type {number} */
    this.colorG2 = particleObjectData.particleGreen2;

    /** @type {number} */
    this.colorB1 = particleObjectData.particleBlue1;

    /** @type {number} */
    this.colorB2 = particleObjectData.particleBlue2;

    /** @type {number} */
    this.size1 = particleObjectData.particleSize1;

    /** @type {number} */
    this.size2 = particleObjectData.particleSize2;

    /** @type {number} */
    this.sizeParam = particleObjectData.sizeParam;

    /** @type {number} */
    this.alpha1 = particleObjectData.particleAlpha1;

    /** @type {number} */
    this.alpha2 = particleObjectData.particleAlpha2;

    /** @type {string} */
    this.rendererType = particleObjectData.rendererType;

    /** @type {number} */
    this.rendererParam1 = particleObjectData.rendererParam1;
    
    /** @type {number} */
    this.rendererParam2 = particleObjectData.rendererParam2;

    /** @type {string} */
    this.texture = particleObjectData.textureParticleName;

    /** @type {number} */
    this.flow = particleObjectData.flow;

    /** @type {number} */
    this.tank = particleObjectData.tank;

    /** @type {boolean} */
    this.destroyWhenNoParticles = particleObjectData.destroyWhenNoParticles;

    /** @type {boolean} */
    this._posDirty = true;
    /** @type {boolean} */
    this._angleDirty = true;
    /** @type {boolean} */
    this._forceDirty = true;
    /** @type {boolean} */
    this._zoneRadiusDirty = true;
    /** @type {boolean} */
    this._lifeTimeDirty = true;
    /** @type {boolean} */
    this._gravityDirty = true;
    /** @type {boolean} */
    this._colorDirty = true;
    /** @type {boolean} */
    this._sizeDirty = true;
    /** @type {boolean} */
    this._alphaDirty = true;
    /** @type {boolean} */
    this._textureDirty = this.texture !== ''; // Don't mark texture as dirty if not using one.
    /** @type {boolean} */
    this._flowDirty = true;

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};
gdjs.ParticleEmitterObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject("ParticleSystem::ParticleEmitter", gdjs.ParticleEmitterObject);

gdjs.ParticleEmitterObject.prototype.setX = function(x){
    if(this.x !== x) this._posDirty = true;
    gdjs.RuntimeObject.prototype.setX.call(this, x);
};

gdjs.ParticleEmitterObject.prototype.setY = function(y){
    if(this.y !== y) this._posDirty = true;
    gdjs.RuntimeObject.prototype.setY.call(this, y);
};

gdjs.ParticleEmitterObject.prototype.setAngle = function(angle){
    if(this.angle !== angle) this._angleDirty = true;
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
};

gdjs.ParticleEmitterObject.prototype.getRendererObject = function(){
    return this._renderer.getRendererObject();
};

gdjs.ParticleEmitterObject.prototype.update = function(runtimeScene){
    if(this._posDirty){
        this._renderer.setPosition(this.getX(), this.getY());
    }
    if(this._angleDirty){
        var angle = this.getAngle();
        if(this.singleAngle) this._renderer.setAngle(this.angle - this.angleB/2.0, this.angle + this.angleB/2.0);
        else this._renderer.setAngle(this.angle + this.angleA, this.angle + this.angleB);
    }
    if(this._forceDirty){
        this._renderer.setForce(this.forceMin, this.forceMax);
    }
    if(this._zoneRadiusDirty){
        this._renderer.setZoneRadius(this.zoneRadius);
    }
    if(this._lifeTimeDirty){
        this._renderer.setLifeTime(this.lifeTimeMin, this.lifeTimeMax);
    }
    if(this._gravityDirty){
        this._renderer.setGravity(this.gravityX, this.gravityY);
    }
    if(this._colorDirty){
        this._renderer.setColor(this.colorR1, this.colorG1, this.colorB1,
                               this.colorR2, this.colorG2, this.colorB2);
    }
    if(this._sizeDirty && this.sizeParam === "Mutable"){
        this._renderer.setSize(this.size1, this.size2);
    }
    if(this._alphaDirty){
        this._renderer.setAlpha(this.alpha1, this.alpha2);
    }
    if(this._flowDirty){
        this._renderer.setFlow(this.flow, this.tank);
    }
    if(this._textureDirty){
        this._renderer.setTextureName(this.texture, runtimeScene);
    }

    this._posDirty = this._angleDirty = this._forceDirty = this._zoneRadiusDirty = false;
    this._lifeTimeDirty = this._gravityDirty = this._colorDirty = this._sizeDirty = false;
    this._alphaDirty = this._flowDirty = this._textureDirty = false;

    this._renderer.update(this.getElapsedTime(runtimeScene)/1000.0);

    if(this.tank > 0 && this._renderer.getTotalParticleCount() > this.tank){
        this._renderer.stop();
    }

    if(this._renderer.hasStarted() && this._renderer.getParticleCount() === 0 && this.destroyWhenNoParticles){
        this.deleteFromScene(runtimeScene);
    }
};

gdjs.ParticleEmitterObject.prototype.onDestroyFromScene = function(runtimeScene){
    this._renderer.destroy();
    gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);
};

gdjs.ParticleEmitterObject.prototype.getEmitterForceMin = function(){
    return this.forceMin;
};

gdjs.ParticleEmitterObject.prototype.setEmitterForceMin = function(force){
    if(force < 0) force = 0;

    if(this.forceMin !== force){
        this._forceDirty = true;
        this.forceMin = force;
    }
};

gdjs.ParticleEmitterObject.prototype.getEmitterForceMax = function(){
    return this.forceMax;
};

gdjs.ParticleEmitterObject.prototype.setEmitterForceMax = function(force){
    if(force < 0) force = 0;

    if(this.forceMax !== force){
        this._forceDirty = true;
        this.forceMax = force;
    }
};

gdjs.ParticleEmitterObject.prototype.getEmitterAngle = function(){
    return (this.angleA + this.angleB)/2.0;
};

gdjs.ParticleEmitterObject.prototype.setEmitterAngle = function(angle){
    var oldAngle = this.getEmitterAngle();
    if(angle !== oldAngle){
        this._angleDirty = true;
        this.angleA += angle - oldAngle;
        this.angleB += angle - oldAngle;
    }
};

gdjs.ParticleEmitterObject.prototype.getEmitterAngleA = function(){
    return this.angleA;
};

gdjs.ParticleEmitterObject.prototype.setEmitterAngleA = function(angle){
    if(this.angleA !== angle){
        this._angleDirty = true;
        this.angleA = angle;
    }
};

gdjs.ParticleEmitterObject.prototype.getEmitterAngleB = function(){
    return this.angleB;
};

gdjs.ParticleEmitterObject.prototype.setEmitterAngleB = function(angle){
    if(this.angleB !== angle){
        this._angleDirty = true;
        this.angleB = angle;
    }
};

gdjs.ParticleEmitterObject.prototype.getConeSprayAngle = function(){
    return Math.abs(this.angleB - this.angleA);
};

gdjs.ParticleEmitterObject.prototype.setConeSprayAngle = function(angle){
    var oldCone = this.getConeSprayAngle();
    if(oldCone !== angle){
        this._angleDirty = true;
        var midAngle = this.getEmitterAngle();
        this.angleA = midAngle - angle/2.0;
        this.angleB = midAngle + angle/2.0;
    }
};

gdjs.ParticleEmitterObject.prototype.getZoneRadius = function(){
    return this.zoneRadius;
};

gdjs.ParticleEmitterObject.prototype.setZoneRadius = function(radius){
    if(radius < 0) radius = 0;

    if(this.zoneRadius !== radius && radius > 0){
        this._zoneRadiusDirty = true;
        this.zoneRadius = radius;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleLifeTimeMin = function(){
    return this.lifeTimeMin;
};

gdjs.ParticleEmitterObject.prototype.setParticleLifeTimeMin = function(lifeTime){
    if(lifeTime < 0) lifeTime = 0;

    if(this.lifeTimeMin !== lifeTime){
        this._lifeTimeDirty = true;
        this.lifeTimeMin = lifeTime;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleLifeTimeMax = function(){
    return this.lifeTimeMax;
};

gdjs.ParticleEmitterObject.prototype.setParticleLifeTimeMax = function(lifeTime){
    if(lifeTime < 0) lifeTime = 0;

    if(this.lifeTimeMax !== lifeTime){
        this._lifeTimeDirty = true;
        this.lifeTimeMax = lifeTime;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGravityX = function(){
    return this.gravityX;
};

gdjs.ParticleEmitterObject.prototype.setParticleGravityX = function(x){
    if(this.gravityX !== x){
        this._gravityDirty = true;
        this.gravityX = x;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGravityY = function(){
    return this.gravityY;
};

gdjs.ParticleEmitterObject.prototype.setParticleGravityY = function(y){
    if(this.gravityY !== y){
        this._gravityDirty = true;
        this.gravityY = y;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGravityAngle = function(){
    return Math.atan2(this.gravityY, this.gravityX)*180.0/Math.PI;
};

gdjs.ParticleEmitterObject.prototype.setParticleGravityAngle = function(angle){
    var oldAngle = this.getParticleGravityAngle();
    if(oldAngle !== angle){
        this._gravityDirty = true;
        var length = this.getParticleGravityLength();
        this.gravityX = length*Math.cos(angle*Math.PI/180.0);
        this.gravityY = length*Math.sin(angle*Math.PI/180.0);
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGravityLength = function(){
    return Math.sqrt(this.gravityX*this.gravityX + this.gravityY*this.gravityY);
};

gdjs.ParticleEmitterObject.prototype.setParticleGravityLength = function(length){
    if(length < 0) length = 0;

    var oldLength = this.getParticleGravityLength();
    if(oldLength !== length){
        this._gravityDirty = true;
        this.gravityX *= length/oldLength;
        this.gravityY *= length/oldLength;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleRed1 = function(){
    return this.colorR1;
};

gdjs.ParticleEmitterObject.prototype.setParticleRed1 = function(red){
    if(red < 0) red = 0;
    if(red > 255) red = 255;

    if(this.colorR1 !== red){
        this._colorDirty = true;
        this.colorR1 = red;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleRed2 = function(){
    return this.colorR2;
};

gdjs.ParticleEmitterObject.prototype.setParticleRed2 = function(red){
    if(red < 0) red = 0;
    if(red > 255) red = 255;

    if(this.colorR2 !== red){
        this._colorDirty = true;
        this.colorR2 = red;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGreen1 = function(){
    return this.colorG1;
};

gdjs.ParticleEmitterObject.prototype.setParticleGreen1 = function(green){
    if(green < 0) green = 0;
    if(green > 255) green = 255;

    if(this.colorG1 !== green){
        this._colorDirty = true;
        this.colorG1 = green;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleGreen2 = function(){
    return this.colorG2;
};

gdjs.ParticleEmitterObject.prototype.setParticleGreen2 = function(green){
    if(green < 0) green = 0;
    if(green > 255) green = 255;

    if(this.colorG2 !== green){
        this._colorDirty = true;
        this.colorG2 = green;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleBlue1 = function(){
    return this.colorB1;
};

gdjs.ParticleEmitterObject.prototype.setParticleBlue1 = function(blue){
    if(blue < 0) blue = 0;
    if(blue > 255) blue = 255;

    if(this.colorB1 !== blue){
        this._colorDirty = true;
        this.colorB1 = blue;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleBlue2 = function(){
    return this.colorB2;
};

gdjs.ParticleEmitterObject.prototype.setParticleBlue2 = function(blue){
    if(blue < 0) blue = 0;
    if(blue > 255) blue = 255;

    if(this.colorB2 !== blue){
        this._colorDirty = true;
        this.colorB2 = blue;
    }
};

gdjs.ParticleEmitterObject.prototype.setParticleColor1 = function(rgbColor){
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this.setParticleRed1(parseInt(colors[0], 10));
    this.setParticleGreen1(parseInt(colors[1], 10));
    this.setParticleBlue1(parseInt(colors[2], 10));
};

gdjs.ParticleEmitterObject.prototype.setParticleColor2 = function(rgbColor){
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this.setParticleRed2(parseInt(colors[0], 10));
    this.setParticleGreen2(parseInt(colors[1], 10));
    this.setParticleBlue2(parseInt(colors[2], 10));
};

gdjs.ParticleEmitterObject.prototype.getParticleSize1 = function(){
    return this.size1;
};

gdjs.ParticleEmitterObject.prototype.setParticleSize1 = function(size){
    if(size < 0) size = 0;

    if(this.size1 !== size){
        this._sizeDirty = true;
        this.size1 = size;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleSize2 = function(){
    return this.size2;
};

gdjs.ParticleEmitterObject.prototype.setParticleSize2 = function(size){
    if(this.size2 !== size){
        this._sizeDirty = true;
        this.size2 = size;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleAlpha1 = function(){
    return this.alpha1;
};

gdjs.ParticleEmitterObject.prototype.setParticleAlpha1 = function(alpha){
    if(this.alpha1 !== alpha){
        this._alphaDirty = true;
        this.alpha1 = alpha;
    }
};

gdjs.ParticleEmitterObject.prototype.getParticleAlpha2 = function(){
    return this.alpha2;
};

gdjs.ParticleEmitterObject.prototype.setParticleAlpha2 = function(alpha){
    if(this.alpha2 !== alpha){
        this._alphaDirty = true;
        this.alpha2 = alpha;
    }
};

gdjs.ParticleEmitterObject.prototype.noMoreParticles = function(){
    this._renderer.stop();
};

gdjs.ParticleEmitterObject.prototype.recreateParticleSystem = function(){
    this._renderer.recreate();
};

gdjs.ParticleEmitterObject.prototype.getFlow = function(){
    return this.flow;
};

gdjs.ParticleEmitterObject.prototype.setFlow = function(flow){
    if(this.flow !== flow){
        this.flow = flow;
        this._flowDirty = true;
    }
};

gdjs.ParticleEmitterObject.prototype.getTank = function(){
    return this.tank;
};

gdjs.ParticleEmitterObject.prototype.setTank = function(tank){
    this.tank = tank;
};

gdjs.ParticleEmitterObject.prototype.getTexture = function(){
    return this.texture;
};

gdjs.ParticleEmitterObject.prototype.setTexture = function(texture, runtimeScene){
    if(this.texture !== texture){
        if(this._renderer.isTextureNameValid(texture, runtimeScene)){
            this.texture = texture;
            this._textureDirty = true;
        }
    }
};
