/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {gdjs.RuntimeObject} runtimeObject
 * @param {any} objectData
 */
gdjs.ParticleEmitterObjectPixiRenderer = function(runtimeScene, runtimeObject, objectData){
    var texture = null;
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0, 0, 0);
    graphics.beginFill(gdjs.rgbToHexNumber(255,255,255), 1);
    if(objectData.rendererType === "Point")
        graphics.drawCircle(0, 0, objectData.rendererParam1);
    else if(objectData.rendererType === "Line"){
        graphics.drawRect(objectData.rendererParam1, 0, objectData.rendererParam1, objectData.rendererParam2);
        // Draw an almost-invisible rectangle in the left hand to force PIXI to take a full texture with our line at the right hand
        graphics.beginFill(gdjs.rgbToHexNumber(255,255,255), 0.001);
        graphics.drawRect(0, 0, objectData.rendererParam1, objectData.rendererParam2);
    }
    else{
        if(objectData.textureParticleName){
            var sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getPIXITexture(objectData.textureParticleName));
            sprite.width = objectData.rendererParam1;
            sprite.height = objectData.rendererParam2;
            graphics.addChild(sprite);
        }
        else{
            graphics.drawRect(0, 0, objectData.rendererParam1, objectData.rendererParam2);
        }
    }
    graphics.endFill();

    // Render the texture from graphics using the PIXI Renderer.
    // TODO: could be optimized by generating the texture only once per object type,
    // instead of at each object creation.
    var pixiRenderer = runtimeScene.getGame().getRenderer().getPIXIRenderer();
    texture = pixiRenderer.generateTexture(graphics);

    var config = {
        color: {
            list: [
                {
                    value: gdjs.rgbToHexNumber(objectData.particleRed1,
                                               objectData.particleGreen1,
                                               objectData.particleBlue1).toString(16),
                    time: 0
                },
                {
                    value: gdjs.rgbToHexNumber(objectData.particleRed2,
                                               objectData.particleGreen2,
                                               objectData.particleBlue2).toString(16),
                    time: 1
                }
            ],
            isStepped: false
        },
        acceleration: {
            x: objectData.particleGravityX,
            y: objectData.particleGravityY
        },
        lifetime: {
            min: objectData.particleLifeTimeMin,
            max: objectData.particleLifeTimeMax
        },
        // A negative flow is "infinite flow" (all particles burst)
        frequency: objectData.flow < 0 ? 0.0001 : 1.0/objectData.flow,
        spawnChance: 1,
        particlesPerWave: objectData.flow < 0 ? objectData.maxParticleNb : 1,
        maxParticles: objectData.maxParticleNb,

        // Lifetime can be computed from the tank (the number of particles available)
        // and the flow (number of particles emitted per seconds)
        emitterLifetime:
            objectData.tank < 0 ? -1 :
            (objectData.flow < 0 ? 0.001 : objectData.tank / objectData.flow),
        pos: {
            x: 0,
            y: 0
        },
        addAtBack: false,
        spawnType: "circle",
        spawnCircle: {
            x: 0,
            y: 0,
            r: objectData.zoneRadius
        }
    };

    config.speed = { list: [{time: 0, value: objectData.emitterForceMax}],
                     minimumSpeedMultiplier: objectData.emitterForceMax !== 0 ?
                                                 objectData.emitterForceMin / objectData.emitterForceMax : 1,
                     isStepped: false };

    if(objectData.alphaParam === "Mutable"){
        config.alpha = { list: [{time: 0, value: objectData.particleAlpha1/255.0},
                                {time: 1, value: objectData.particleAlpha2/255.0}],
                         isStepped: false };
    }
    else{
        config.alpha = { list: [{time: 0, value: objectData.particleAlpha1/255.0}],
                         isStepped: false };
    }

    if(objectData.sizeParam === "Mutable"){
        var size1 = objectData.particleSize1/100;
        var size2 = objectData.particleSize2/100;
        var sizeRandom1 = objectData.particleSizeRandomness1/100;
        var sizeRandom2 = objectData.particleSizeRandomness2/100;
        var m = sizeRandom2 !== 0 ? (1 + sizeRandom1)/(1 + sizeRandom2) : 1;
        config.scale = { list: [{time: 0, value: size1*(1 + sizeRandom1)},
                                {time: 1, value: size2*(1 + sizeRandom2)}],
                         minimumScaleMultiplier: m,
                         isStepped: false };
    }
    else{
        var size1 = objectData.particleSize1/100;
        var size2 = objectData.particleSize2/100;
        var mult = size2 !== 0 ? (1 + size1)/(1 + size2) : 1;
        if(size2 === 0 && size1 > size2){
            mult = (1 + size2)/(1 + size1);
            size2 = size1;
        }
        config.scale = { list: [{time: 0, value: size2}],
                         minimumScaleMultiplier: mult,
                         isStepped: false };
    }


    if(objectData.emissionEditionSimpleMode){
        config.startRotation = { min:-objectData.emitterAngleB/2.0,
                                 max: objectData.emitterAngleB/2.0 };
    }
    else{
        config.startRotation = { min: objectData.emitterAngleA,
                                 max: objectData.emitterAngleB };
    }

    var mediumLifetime = (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax)/2.0;
    config.rotationSpeed = { min: objectData.particleAngle1/mediumLifetime,
                             max: objectData.particleAngle2/mediumLifetime };

    config.blendMode = objectData.additive ? "ADD" : "NORMAL";

    this.renderer = new PIXI.Container();
    this.emitter = new PIXI.particles.Emitter(this.renderer, texture, config);
    this.emitter.emit = true;
    this.started = false;

    var layer = runtimeScene.getLayer(runtimeObject.getLayer());
    if (layer) layer.getRenderer().addRendererObject(this.renderer, runtimeObject.getZOrder());
};
gdjs.ParticleEmitterObjectRenderer = gdjs.ParticleEmitterObjectPixiRenderer;

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.update = function(delta){
    this.emitter.update(delta);
    if(!this.started && this.getParticleCount() > 0){
        this.started = true;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setPosition = function(x, y){
    this.emitter.spawnPos.x = x;
    this.emitter.spawnPos.y = y;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setAngle = function(angle1, angle2){
    this.emitter.minStartRotation = angle1;
    this.emitter.maxStartRotation = angle2;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setForce = function(min, max){
    this.emitter.startSpeed.value = max;
    this.emitter.minimumSpeedMultiplier = max !== 0 ? min/max : 1;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setZoneRadius = function(radius){
    this.emitter.spawnCircle.radius = radius;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setLifeTime = function(min, max){
    this.emitter.minLifetime = min;
    this.emitter.maxLifetime = max;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setGravity = function(x, y){
    this.emitter.acceleration.x = x;
    this.emitter.acceleration.y = y;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setColor = function(r1, g1, b1, r2, g2, b2){
    this.emitter.startColor.value.r = r1;
    this.emitter.startColor.value.g = g1;
    this.emitter.startColor.value.b = b1;
    this.emitter.startColor.next = this.emitter.startColor.next || {
        time : 1,
        value : {}
    };
    this.emitter.startColor.next.value.r = r2;
    this.emitter.startColor.next.value.g = g2;
    this.emitter.startColor.next.value.b = b2;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setSize = function(size1, size2){
    this.emitter.startScale.value = size1/100.0;
    if(this.emitter.startScale.next){
        this.emitter.startScale.next.value = size2/100.0;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setAlpha = function(alpha1, alpha2){
    this.emitter.startAlpha.value = alpha1/255.0;
    if(this.emitter.startAlpha.next){
        this.emitter.startAlpha.next.value = alpha2/255.0;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setFlow = function(flow, tank){
    this.emitter.frequency = flow < 0 ? 0.0001 : 1.0/flow;
    this.emitterLifetime = tank < 0 ? -1 :
            (flow < 0 ? 0.001 : (tank - this.emitter.totalParticleCount) / flow);
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.isTextureNameValid = function(texture, runtimeScene){
    var invalidPixiTexture = runtimeScene.getGame().getImageManager().getInvalidPIXITexture();
    var pixiTexture = runtimeScene.getGame().getImageManager().getPIXITexture(texture);

    return pixiTexture.valid && pixiTexture !== invalidPixiTexture;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setTextureName = function(texture, runtimeScene){
    var invalidPixiTexture = runtimeScene.getGame().getImageManager().getInvalidPIXITexture();
    var pixiTexture = runtimeScene.getGame().getImageManager().getPIXITexture(texture);

    if(pixiTexture.valid && pixiTexture !== invalidPixiTexture){
        this.emitter.particleImages[0] = pixiTexture;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getTotalParticleCount = function(){
    return this.emitter.totalParticleCount;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getParticleCount = function(){
    return this.emitter.particleCount;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.stop = function(){
    this.emitter.emit = false;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.recreate = function(){
    this.emitter.cleanup();
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.destroy = function(){
    this.emitter.destroy();
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.hasStarted = function(){
    return this.started;
};
