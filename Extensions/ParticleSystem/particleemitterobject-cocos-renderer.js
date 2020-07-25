/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/


gdjs.ParticleEmitterObjectCocosRenderer = function(runtimeScene, runtimeObject, objectData){
    var drawer = new cc.DrawNode();
    var renderTexture = null;
    this.originalSize = Math.max(objectData.rendererParam1, objectData.rendererParam2);
    if(objectData.rendererType === "Point"){
        drawer.drawDot(cc.p(objectData.rendererParam1, objectData.rendererParam1),
                       objectData.rendererParam1, cc.color(255,255,255,255));
        this.originalSize = 2 * objectData.rendererParam1;
        renderTexture = new cc.RenderTexture(this.originalSize, this.originalSize);
    }
    else if(objectData.rendererType === "Line"){
        this.originalSize = Math.max(2*objectData.rendererParam1, objectData.rendererParam2);
        drawer.drawRect(cc.p(this.originalSize/2.0,
                            (this.originalSize - objectData.rendererParam2)/2.0),
                        cc.p(this.originalSize/2.0 + objectData.rendererParam1,
                            (this.originalSize + objectData.rendererParam2)/2.0),
                        cc.color(255,255,255,255), 0.01 , cc.color(255,255,255,0));
        renderTexture = new cc.RenderTexture(this.originalSize, this.originalSize);
    }
    else{
        if(objectData.textureParticleName){
            // Read the comment at gdjs.ParticleEmitterObjectCocosRenderer.prototype.setTexture
            var imageManager = runtimeScene.getGame().getImageManager();
            var sprite = new cc.Sprite(imageManager.getTexture(objectData.textureParticleName));
            this.originalSize = Math.max(sprite.width, sprite.height);
            sprite.setPosition(this.originalSize/2.0,  this.originalSize/2.0);
            drawer.addChild(sprite);
            renderTexture = new cc.RenderTexture(this.originalSize,  this.originalSize);
        }
        else{
            drawer.drawRect(cc.p((this.originalSize - objectData.rendererParam1)/2.0,
                                 (this.originalSize - objectData.rendererParam2)/2.0),
                            cc.p((this.originalSize + objectData.rendererParam1)/2.0,
                                 (this.originalSize + objectData.rendererParam2)/2.0),
                            cc.color(255,255,255,255), 0.01 , cc.color(255,255,255,255));
            renderTexture = new cc.RenderTexture(this.originalSize, this.originalSize);
        }
    }
    renderTexture.begin();
    drawer.visit();
    renderTexture.end();
    var texture = renderTexture.getSprite().getTexture();

    var plist = {
        duration: -1,
        emitterType: 0,

        gravityx: objectData.particleGravityX,
        gravityy:-objectData.particleGravityY,

        particleLifespan: (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax)/2.0,
        particleLifespanVariance: Math.abs(objectData.particleLifeTimeMax - objectData.particleLifeTimeMin)/2.0,

        sourcePositionVariancex: objectData.zoneRadius,
        sourcePositionVariancey: objectData.zoneRadius,

        speed: (objectData.emitterForceMin + objectData.emitterForceMax)/2.0,
        speedVariance: Math.abs(objectData.emitterForceMax - objectData.emitterForceMin)/2.0,

        tangentialAccelVariance: 0.0,
        tangentialAcceleration: 1,

        rotationIsDir: "true",

        // We are forced to use a texture name / base64 string, it's a one-pixel base64 image
        textureImageData: "H4sIAAAAAAAAA+sM8HPn5ZLiYmBg4PX0cAkC0owgzMEEJCeUB98DUpwFHpHFDAzcwiDMyDBrjgRQkL3E09eV/RELu4CFwaX8heVAIdnMkIgS5/zc3NS8EgYQcC5KTSxJTVEozyzJUHD39A1I0UtlB4rzeLo4hnBcT/7x/789A+s/pn93zkQ+B2nwdPVzWeeU0AQAwMwOBZYAAAA="
    };

    if(objectData.emissionEditionSimpleMode){
        plist.angle = 0;
        plist.angleVariance = objectData.emitterAngleB/2.0;
    }
    else{
        plist.angle = -(objectData.emitterAngleA + objectData.emitterAngleB)/2.0;
        plist.angleVariance = Math.abs(plist.angle + objectData.emitterAngleB);
    }

    if(objectData.redParam === "Mutable"){
        plist.startColorVarianceRed = plist.finishColorVarianceRed = 0.0;
        plist.startColorRed = objectData.particleRed1/255.0;
        plist.finishColorRed = objectData.particleRed2/255.0;
    }
    else if(objectData.redParam === "Random"){
        plist.startColorRed = plist.finishColorRed = (objectData.particleRed1 + objectData.particleRed2)/(2.0*255.0);
        plist.startColorVarianceRed = Math.abs(plist.startColorRed - objectData.particleRed2/255.0);
        plist.finishColorVarianceRed = plist.startColorVarianceRed;
    }
    else{
        plist.startColorVarianceRed = plist.finishColorVarianceRed = 0.0;
        plist.startColorRed = objectData.particleRed1/255.0;
        plist.finishColorRed = plist.startColorRed;
    }

    if(objectData.greenParam === "Mutable"){
        plist.startColorVarianceGreen = plist.finishColorVarianceGreen = 0.0;
        plist.startColorGreen = objectData.particleGreen1/255.0;
        plist.finishColorGreen = objectData.particleGreen2/255.0;
    }
    else if(objectData.greenParam === "Random"){
        plist.startColorGreen = plist.finishColorGreen = (objectData.particleGreen1 + objectData.particleGreen2)/(2.0*255.0);
        plist.startColorVarianceGreen = Math.abs(plist.startColorGreen - objectData.particleGreen2/255.0);
        plist.finishColorVarianceGreen = plist.startColorVarianceGreen;
    }
    else{
        plist.startColorVarianceGreen = plist.finishColorVarianceGreen = 0.0;
        plist.startColorGreen = objectData.particleGreen1/255.0;
        plist.finishColorGreen = plist.startColorGreen;
    }

    if(objectData.blueParam === "Mutable"){
        plist.startColorVarianceBlue = plist.finishColorVarianceBlue = 0.0;
        plist.startColorBlue = objectData.particleBlue1/255.0;
        plist.finishColorBlue = objectData.particleBlue2/255.0;
    }
    else if(objectData.blueParam === "Random"){
        plist.startColorBlue = plist.finishColorBlue = (objectData.particleBlue1 + objectData.particleBlue2)/(2.0*255.0);
        plist.startColorVarianceBlue = Math.abs(plist.startColorBlue - objectData.particleBlue2/255.0);
        plist.finishColorVarianceBlue = plist.startColorVarianceBlue;
    }
    else{
        plist.startColorVarianceBlue = plist.finishColorVarianceBlue = 0.0;
        plist.startColorBlue = objectData.particleBlue1/255.0;
        plist.finishColorBlue = plist.startColorBlue;
    }

    if(objectData.alphaParam === "Mutable"){
        var alphaInit = (objectData.particleAlpha1 + objectData.particleAlphaRandomness1)/255.0;
        var alphaEnd = (objectData.particleAlpha1 + objectData.particleAlphaRandomness2)/255.0;
        plist.startColorAlpha = (alphaInit + alphaEnd)/2.0;
        plist.startColorVarianceAlpha = alphaEnd - plist.startColorAlpha;
        alphaInit = (objectData.particleAlpha2 + objectData.particleAlphaRandomness1)/255.0;
        alphaEnd = (objectData.particleAlpha2 + objectData.particleAlphaRandomness2)/255.0;
        plist.finishColorAlpha = (alphaInit + alphaEnd)/2.0;
        plist.finishColorVarianceAlpha = alphaEnd - plist.finishColorAlpha;
    }
    else{
        var alphaMid = (objectData.particleAlphaRandomness1 + objectData.particleAlphaRandomness2)/(2.0*255.0);
        plist.startColorAlpha = plist.endColorAlpha = alphaMid;
        plist.startColorVarianceAlpha = Math.abs(alphaMid - objectData.particleAlphaRandomness1);
        plist.startColorVarianceAlpha = plist.finishColorVarianceAlpha;
    }

    if(objectData.sizeParam === "Mutable"){
        var minSizeVariance = Math.min(objectData.particleSizeRandomness1, objectData.particleSizeRandomness2)/100.0;
        var maxSizeVariance = Math.max(objectData.particleSizeRandomness1, objectData.particleSizeRandomness2)/100.0;
        var midSizeVariance = (maxSizeVariance + minSizeVariance)/2.0;
        plist.startParticleSizeVariance = this.originalSize*objectData.particleSize1/100.0*(maxSizeVariance - minSizeVariance)/2.0;
        plist.finishParticleSizeVariance = this.originalSize*objectData.particleSize2/100.0*(maxSizeVariance - minSizeVariance)/2.0;
        plist.startParticleSize = this.originalSize*objectData.particleSize1/100.0 - plist.startParticleSizeVariance;
        plist.finishParticleSize = this.originalSize*objectData.particleSize2/100.0 - plist.finishParticleSizeVariance;
    }
    else{
        var sizeMid = (objectData.particleSize1 + objectData.particleSize2)/(2.0*100.0);
        plist.startParticleSize = plist.finishParticleSize = this.originalSize*sizeMid;
        plist.startParticleSizeVariance = this.originalSize*Math.abs(sizeMid - objectData.particleSizeRandomness1/100.0);
        plist.finishParticleSizeVariance = plist.startParticleSizeVariance;
    }

    var mediumLifetime = (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax)/2.0;
    plist.rotationStart = 0.0;
    plist.rotationStartVariance = 0.0;
    plist.rotationEnd = (objectData.particleAngle1 + objectData.particleAngle2)/2.0 * mediumLifetime;
    plist.rotationEndVariance = (Math.max(objectData.particleAngle1, objectData.particleAngle2) -
                                 Math.min(objectData.particleAngle1, objectData.particleAngle2)) *
                                mediumLifetime / 2.0;

    this.renderer = new cc.ParticleSystem(plist);
    this.renderer.setTexture(texture);
    this.renderer.setPosition(0, 0);
    this.renderer.init();

    this.renderer.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
    if(objectData.additive) this.renderer.setBlendAdditive(true);

    this.renderer.setTotalParticles(objectData.maxParticleNb); // Some particle systems don't work for max particles <= 150
    this.renderer.setEmissionRate(objectData.flow);
    this.renderer.setDuration(objectData.tank < 0 ? -1 :
        (objectData.flow < 0 ? 0.001 : objectData.tank / objectData.flow));

    this.totalParticles = 0;
    var that = this;
    this.renderer.addParticle = function(){
        cc.ParticleSystem.prototype.addParticle.call(that.renderer);
        ++that.totalParticles;
    };

    this.started = false;

    var renderer = runtimeScene.getLayer(runtimeObject.getLayer()).getRenderer();
    renderer.addRendererObject(this.renderer, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;
};
gdjs.ParticleEmitterObjectRenderer = gdjs.ParticleEmitterObjectCocosRenderer;

gdjs.ParticleEmitterObjectCocosRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.update = function(delta){
    this.renderer.update(delta);
    if(!this.started && this.getParticleCount() > 0){
        this.started = true;
    }
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setPosition = function(x, y){
    this.renderer.setPosition(cc.p(x, this._convertYPosition(y)));
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setAngle = function(angle1, angle2){
    this.renderer.setAngle(-(angle1 + angle2)/2.0);
    this.renderer.setAngleVar(Math.abs(angle2 - angle1)/2.0);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setForce = function(min, max){
    this.renderer.setSpeed((min + max)/2.0);
    this.renderer.setSpeedVar(Math.abs(max - min)/2.0);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setZoneRadius = function(radius){
    this.renderer.setPosVar(cc.p(radius, radius));
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setLifeTime = function(min, max){
    this.renderer.setLife((min + max)/2.0);
    this.renderer.setLifeVar(Math.abs(max - min)/2.0);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setGravity = function(x, y){
    this.renderer.setGravity(cc.p(x, -y));
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setColor = function(r1, g1, b1, r2, g2, b2){
    var a = this.renderer.getStartColor().a;
    this.renderer.setStartColor(cc.color(r1, g1, b1, a));
    a = this.renderer.getEndColor().a;
    this.renderer.setEndColor(cc.color(r2, g2, b2, a));
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setAlpha = function(alpha1, alpha2){
    var color = this.renderer.getStartColor();
    color.a = alpha1;
    this.renderer.setStartColor(color);
    color = this.renderer.getEndColor();
    color.a = alpha2;
    this.renderer.setEndColor(color);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setSize = function(size1, size2){
    this.renderer.setStartSize(this.originalSize*size1/100.0);
    this.renderer.setEndSize(this.originalSize*size2/100.0);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setFlow = function(flow){
    this.renderer.setEmissionRate(flow);
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.isTextureNameValid = function(texture, runtimeScene){
    return runtimeScene.getGame().getImageManager().getTexture(texture)._textureLoaded;
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.setTextureName = function(texture, runtimeScene){
    var texture = runtimeScene.getGame().getImageManager().getTexture(texture);
    if(texture._textureLoaded){
        if(texture.width === texture.height){
            this.originalSize = texture.width;
            this.renderer.setTexture(texture);
        }
        // Cocos particles are always square, so if the new texture is not squared we have to
        // render it over a squared renderTexture object, this way we keep the original
        // texture's aspect ratio
        else{
            var sprite = new cc.Sprite(texture);
            this.originalSize = Math.max(sprite.width, sprite.height);
            sprite.setPosition(this.originalSize/2.0,  this.originalSize/2.0);
            var renderTexture = new cc.RenderTexture(this.originalSize,  this.originalSize);
            renderTexture.begin();
            sprite.visit();
            renderTexture.end();
            this.renderer.setTexture(renderTexture.getSprite().getTexture());
        }
    }
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.getTotalParticleCount = function(){
    return this.totalParticles;
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.getParticleCount = function(){
    return this.renderer.getParticleCount();
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.stop = function(){
    this.renderer.stopSystem();
};
gdjs.ParticleEmitterObjectCocosRenderer.prototype.recreate = function(){
    this.renderer.resetSystem();
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.destroy = function(){
    this.renderer.destroyParticleSystem();
};

gdjs.ParticleEmitterObjectCocosRenderer.prototype.hasStarted = function(){
    return this.started;
};
