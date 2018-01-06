
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

gdjs.SkeletonRuntimeObjectPixiRenderer.prototype.loadDragonBones = function(runtimeScene, textureDataName, textureName){
    var textureData = this.getData(textureDataName);
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);
    
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

gdjs.SkeletonArmaturePixiRenderer.prototype.loadSceneData = function(runtimeScene){
    // var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);
    // runtimeScene.getLayer("").getRenderer().addRendererObject(this._tiledSprite, runtimeObject.getZOrder());
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
