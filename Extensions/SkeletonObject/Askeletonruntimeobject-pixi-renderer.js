
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

gdjs.SkeletonRuntimeObjectPixiRenderer = function()
{
    this.textures = {};
};
gdjs.SkeletonRuntimeObjectRenderer = gdjs.SkeletonRuntimeObjectPixiRenderer;

gdjs.SkeletonRuntimeObjectPixiRenderer.prototype.getData = function(dataName){
    return PIXI.loader.resources[dataName].data;
};

gdjs.SkeletonRuntimeObjectPixiRenderer.prototype.loadDragonBones = function(runtimeScene, objectData){
    var textureData = this.getData(objectData.textureDataFilename);
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(objectData.textureName);
    
    for(var i=0; i<textureData.SubTexture.length; i++){
        var subTex = textureData.SubTexture[i];
        var frame = new PIXI.Rectangle(subTex.x, subTex.y, subTex.width, subTex.height);
        if(subTex.hasOwnProperty("frameWidth")){
            frame.width = subTex.frameWidth;
        }
        if (subTex.hasOwnProperty("frameHeight")){
            frame.height = subTex.frameHeight;
        }
        this.textures[subTex.name] = new PIXI.Texture(texture.baseTexture, frame=frame);
    }
};



gdjs.SkeletonArmaturePixiRenderer = function()
{
    this.container = new PIXI.Container();
};
gdjs.SkeletonArmatureRenderer = gdjs.SkeletonArmaturePixiRenderer;

gdjs.SkeletonArmaturePixiRenderer.prototype.putInScene = function(runtimeObject, runtimeScene){
    runtimeScene.getLayer("").getRenderer().addRendererObject(this.container, runtimeObject.getZOrder());
};

gdjs.SkeletonArmaturePixiRenderer.prototype.getRendererObject = function(){
    return this.container;
};

gdjs.SkeletonArmaturePixiRenderer.prototype.addRenderer = function(renderer){
    this.container.addChild(renderer.getRendererObject());
};

gdjs.SkeletonArmaturePixiRenderer.prototype.sortRenderers = function(){
    this.container.children.sort(function(a, b){ return a.z - b.z; });
};



gdjs.SkeletonSlotPixiRenderer = function()
{
    this.renderObject = null;
};
gdjs.SkeletonSlotRenderer = gdjs.SkeletonSlotPixiRenderer;

gdjs.SkeletonSlotPixiRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.SkeletonSlotPixiRenderer.prototype.loadAsSprite = function(texture){
    this.renderer = new PIXI.Sprite(texture);
    this.renderer.pivot = new PIXI.Point(this.renderer.width/2.0, this.renderer.height/2.0);
    this.renderer.z = 0;
};

gdjs.SkeletonSlotPixiRenderer.prototype.getWidth = function(){
    return this.renderer.width;
};

gdjs.SkeletonSlotPixiRenderer.prototype.getHeight = function(){
    return this.renderer.height;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setPos = function(x, y){
    this.renderer.x = x;
    this.renderer.y = y;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setRotation = function(angle){
    this.renderer.rotation = angle;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setScale = function(sx, sy){
    this.renderer.scale.x = sx;
    this.renderer.scale.y = sy;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setZ = function(z){
    this.renderer.z = z;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setColor = function(color){
    this.renderer.tint = (color[0] << 16) + (color[1] << 8) + color[2];
};

gdjs.SkeletonSlotPixiRenderer.prototype.setAlpha = function(alpha){
    this.renderer.alpha = alpha;
};

gdjs.SkeletonSlotPixiRenderer.prototype.setVisible = function(visible){
    this.renderer.visible = visible;
};
