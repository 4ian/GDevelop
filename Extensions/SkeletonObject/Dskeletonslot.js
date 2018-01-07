
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonSlot display images transformed by itself and bones.
 *
 * @namespace gdjs
 * @class SkeletonSlot
 * @extends gdjs.SkeletonTransform
 */
gdjs.SkeletonSlot = function(armature){
    gdjs.SkeletonTransform.call(this);
    this.name = "";
    this.armature = armature;
    this.type = gdjs.SkeletonSlot.SLOT_UNDEFINED;
    this.defaultZ = 0;
    this.defaultR = 255;
    this.defaultG = 255;
    this.defaultB = 255;
    this.defaultAlpha = 1.0;
    this.defaultVisible = true;
    this.z = this.defaultZ;
    this.r = this.defaultR;
    this.g = this.defaultG;
    this.b = this.defaultB;
    this.alpha = this.defaultAlpha;
    this.visible = this.defaultVisible;
    this.renderer = new gdjs.SkeletonSlotRenderer();
    this._updateRender = false;
    this.aabb = gdjs.Polygon.createRectangle(0, 0);

    // Polygon only
    this.polygons = [];

    // Mesh only
    this.defaultVertices = []; // original vertices location (relative to mesh slot)
    this.vertices = []; // same as defaultVertices, but modified on animations
    this.skinned = false; // is the mesh skinned?
    this.skinBones = []; // skinning bones
    this.skinBonesMatricesInverses = []; // bones inverse local matrices (relative to mesh slot)
    this.vertexBones = []; // list of bone indices (on this.skinBones) for each vertex
    this.vertexWeights = []; // list of weights for each vertex
    this.worldMatrixInverse = null; // precomputed mesh slot inverse world matrix

    // Armature only
    this.childArmature = null;
}
gdjs.SkeletonSlot.prototype = Object.create(gdjs.SkeletonTransform.prototype);

gdjs.SkeletonSlot.SLOT_UNDEFINED = 0;
gdjs.SkeletonSlot.SLOT_IMAGE = 1;
gdjs.SkeletonSlot.SLOT_MESH = 2;
gdjs.SkeletonSlot.SLOT_POLYGON = 3;
gdjs.SkeletonSlot.SLOT_ARMATURE = 4;

gdjs.SkeletonSlot.prototype.loadDragonBonesSlotData = function(slotData){
    this.name = slotData.name;
    
    this.defaultZ = slotData.hasOwnProperty("z") ? slotData.z : 0;
    this.defaultR = slotData.color.hasOwnProperty("rM") ? Math.ceil(slotData.color.rM * 255 / 100) : 255;
    this.defaultG = slotData.color.hasOwnProperty("gM") ? Math.ceil(slotData.color.gM * 255 / 100) : 255;
    this.defaultB = slotData.color.hasOwnProperty("bM") ? Math.ceil(slotData.color.bM * 255 / 100) : 255;
    this.defaultAlpha = slotData.color.hasOwnProperty("aM") ? slotData.color.aM / 100.0 : 1.0;
    this.defaultVisible = slotData.hasOwnProperty("displayIndex") ? (slotData.displayIndex + 1) / 2 : 1;
};

gdjs.SkeletonSlot.prototype.loadDragonBonesSkinData = function(skinDatas, index, skeletalData, bones, textures){
    var skinData = skinDatas.slot[index];
    
    var transformData = skinData.display[0].transform;
    this.x = transformData.hasOwnProperty("x") ? transformData.x : 0;
    this.y = transformData.hasOwnProperty("y") ? transformData.y : 0;
    this.rot = transformData.hasOwnProperty("skX") ? transformData.skX * Math.PI / 180.0 : 0;
    this.sx = transformData.hasOwnProperty("scX") ? transformData.scX : 1;
    this.sy = transformData.hasOwnProperty("scY") ? transformData.scY : 1;

    // If another slot is already using the same image path we have to search for it
    if(!skinData.display[0].hasOwnProperty("path")){
        for(var i=0; i<skinDatas.length; i++){
            if(skinDatas[i].display[0].name === skinData.display[0].name && skinDatas[i].display[0].path){
                skinData.display[0].path = skinDatas[i].display[0].path;
                break;
            }
        }
    }

    if(skinData.display[0].type === "image"){
        this.type = gdjs.SkeletonSlot.SLOT_IMAGE;

        this.renderer.loadAsSprite(textures[skinData.display[0].path]);

        this.aabb.vertices[0] = [-this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[1] = [ this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[2] = [ this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
        this.aabb.vertices[3] = [-this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
    }
    
    this.resetState();
};

gdjs.SkeletonSlot.prototype.resetState = function(){
    //~ this.setZ(this.defaultZ);
    //~ this.setColor(this.defaultR, this.defaultG, this.defaultB);
    //~ this.setAlpha(this.defaultAlpha);
    //~ this.setVisible(this.defaultVisible);
    if(this.type === gdjs.SkeletonSlot.SLOT_MESH){
        var verts = [];
        var updateList = [];
        for(var i=0; i<this.defaultVertices.length; i++){
            verts.push([0, 0]);
            updateList.push(i);
        }
        //~ this.setVertices(verts, updateList);
    }
};

gdjs.SkeletonSlot.prototype.update = function(){
    gdjs.SkeletonTransform.prototype.update.call(this);

    if(this._updateRender && (this.type === gdjs.SkeletonSlot.SLOT_IMAGE || this.type === gdjs.SkeletonSlot.SLOT_MESH)){
        this.renderer.setPos(this.worldMatrix.tx, this.worldMatrix.ty);
        var sx = Math.sqrt(this.worldMatrix.a * this.worldMatrix.a +
                           this.worldMatrix.c * this.worldMatrix.c );
        var sy = Math.sqrt(this.worldMatrix.b * this.worldMatrix.b +
                           this.worldMatrix.d * this.worldMatrix.d );
        sx *= Math.sign(this.worldMatrix.a);
        sy *= Math.sign(this.worldMatrix.d);
        this.renderer.setScale(sx, sy);
        this.renderer.setRotation(Math.atan2(-this.worldMatrix.b/sy, this.worldMatrix.a/sx));
        this._updateRender = false;
    }
}

gdjs.SkeletonSlot.prototype.updateTransform = function(){
    if(this._updateMatrix || this._updateWorldMatrix){
        this._updateRender = true;
    }
    gdjs.SkeletonTransform.prototype.updateTransform.call(this);
};
