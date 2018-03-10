
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



gdjs.sk.ArmaturePixiRenderer = function()
{
    this.container = new PIXI.Container();
    this.slotsRenderers = new PIXI.Container();
    this.container.addChild(this.slotsRenderers);
    this.debugRenderers = new PIXI.Container();
    this.container.addChild(this.debugRenderers);
};
gdjs.sk.ArmatureRenderer = gdjs.sk.ArmaturePixiRenderer;

gdjs.sk.ArmaturePixiRenderer.prototype.putInScene = function(runtimeObject, runtimeScene){
    runtimeScene.getLayer("").getRenderer().addRendererObject(this.container, runtimeObject.getZOrder());
};

gdjs.sk.ArmaturePixiRenderer.prototype.getRendererObject = function(){
    return this.container;
};

gdjs.sk.ArmaturePixiRenderer.prototype.addRenderer = function(renderer){
    // this.container.addChild(renderer.getRendererObject());
    this.slotsRenderers.addChild(renderer.getRendererObject());
};

gdjs.sk.ArmaturePixiRenderer.prototype.sortRenderers = function(){
    // this.container.children.sort(function(a, b){ return a.z - b.z; });
    this.slotsRenderers.children.sort(function(a, b){ return a.z - b.z; });
};

gdjs.sk.ArmaturePixiRenderer.prototype.addDebugRenderer = function(renderer){
    // this.container.addChild(renderer.getRendererObject());
    this.debugRenderers.addChild(renderer.getRendererObject());
};



gdjs.sk.SlotPixiRenderer = function()
{
    this.renderer = null;
};
gdjs.sk.SlotRenderer = gdjs.sk.SlotPixiRenderer;

gdjs.sk.SlotPixiRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.sk.SlotPixiRenderer.prototype.loadAsSprite = function(texture){
    this.renderer = new PIXI.Sprite(texture);
    this.renderer.pivot = new PIXI.Point(this.renderer.width/2.0, this.renderer.height/2.0);
    this.renderer.z = 0;
    // console.log(this.renderer);
};

gdjs.sk.SlotPixiRenderer.prototype.loadAsMesh = function(texture, vertices, uvs, triangles){
	this.renderer = new PIXI.mesh.Mesh(texture,
									   new Float32Array(vertices),
									   new Float32Array(uvs),
									   new Uint16Array(triangles),
									   PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES);

	this.renderer.uploadUvTransform = true;
	this.renderer.z = 0;

	// TODO
	// this.render.cacheAsBitmap = true;
	// meshes won't fully work with current PIXI version
};

gdjs.sk.SlotPixiRenderer.prototype.getWidth = function(){
    return this.renderer.width;
};

gdjs.sk.SlotPixiRenderer.prototype.getHeight = function(){
    return this.renderer.height;
};

gdjs.sk.SlotPixiRenderer.prototype.setPos = function(x, y){
    this.renderer.x = x;
    this.renderer.y = y;
};

gdjs.sk.SlotPixiRenderer.prototype.setRotation = function(angle){
    this.renderer.rotation = angle;
};

gdjs.sk.SlotPixiRenderer.prototype.setScale = function(sx, sy){
    this.renderer.scale.x = sx;
    this.renderer.scale.y = sy;
};

gdjs.sk.SlotPixiRenderer.prototype.skewSupported = function(){
    return true;
};

gdjs.sk.SlotPixiRenderer.prototype.setSkew = function(skewX, skewY){
    this.renderer.skew.x = skewX;
    this.renderer.skew.y = skewY;
};


gdjs.sk.SlotPixiRenderer.prototype.setZ = function(z){
    this.renderer.z = z;
};

gdjs.sk.SlotPixiRenderer.prototype.setColor = function(color){
	this.renderer.tint = (color[0] << 16) + (color[1] << 8) + color[2];
};

gdjs.sk.SlotPixiRenderer.prototype.setAlpha = function(alpha){
	this.renderer.alpha = alpha;
};

gdjs.sk.SlotPixiRenderer.prototype.setVisible = function(visible){
	this.renderer.visible = visible;
};

// Mesh only
gdjs.sk.SlotPixiRenderer.prototype.setVertices = function(vertices, updateList){
	for(var i=0; i<updateList.length; i++){
		this.renderer.vertices[2*updateList[i]]     = vertices[i][0];
		this.renderer.vertices[2*updateList[i] + 1] = vertices[i][1];
	}
};


gdjs.sk.DebugPixiRenderer = function()
{
    this.renderer = new PIXI.Graphics();
};
gdjs.sk.DebugRenderer = gdjs.sk.DebugPixiRenderer;

gdjs.sk.DebugPixiRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.sk.DebugPixiRenderer.prototype.loadVertices = function(verts, color, fill){
    color = color[2] | (color[1] << 8) | (color[0] << 16);
    if(fill){
        this.renderer.beginFill(color, 0.1);
    }
    this.renderer.lineStyle(2, color, 0.8);
    for(var i=0; i<verts.length; i++){
        this.renderer.drawPolygon(verts.reduce(function(a, b){ return a.concat(b); }));
    }
    if(fill){
        this.renderer.endFill();
    }
};

gdjs.sk.DebugPixiRenderer.prototype.setTransform = function(transform){
    this.renderer.x = transform.x;
    this.renderer.y = transform.y;
    this.renderer.scale.x = transform.sx;
    this.renderer.scale.y = transform.sy;
    this.renderer.skew.x = transform.skx;
    this.renderer.skew.y = transform.sky;
};

gdjs.sk.DebugPixiRenderer.prototype.skewSupported = function(){
    return true;
};
