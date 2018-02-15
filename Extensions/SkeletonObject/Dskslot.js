
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The Slot display images transformed by itself and bones.
 *
 * @namespace gdjs.sk
 * @class Slot
 * @extends gdjs.sk.Transform
 */
gdjs.sk.Slot = function(armature){
    gdjs.sk.Transform.call(this);
    this.name = "";
    this.armature = armature;
    this.type = gdjs.sk.SLOT_UNDEFINED;
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
    this.renderer = new gdjs.sk.SlotRenderer();
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
gdjs.sk.Slot.prototype = Object.create(gdjs.sk.Transform.prototype);

gdjs.sk.Slot.prototype.loadDragonBonesSlotData = function(slotData){
    this.name = slotData.name;
    
    this.defaultZ = slotData.hasOwnProperty("z") ? slotData.z : 0;
    this.defaultR = slotData.color.hasOwnProperty("rM") ? Math.ceil(slotData.color.rM * 255 / 100) : 255;
    this.defaultG = slotData.color.hasOwnProperty("gM") ? Math.ceil(slotData.color.gM * 255 / 100) : 255;
    this.defaultB = slotData.color.hasOwnProperty("bM") ? Math.ceil(slotData.color.bM * 255 / 100) : 255;
    this.defaultAlpha = slotData.color.hasOwnProperty("aM") ? slotData.color.aM / 100.0 : 1.0;
    this.defaultVisible = slotData.hasOwnProperty("displayIndex") ? (slotData.displayIndex + 1) / 2 : 1;
};

gdjs.sk.Slot.prototype.loadDragonBonesSkinData = function(skinDatas, index, skeletalData, bonesIndex, textures){
    var skinData = skinDatas[index];
    
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
        this.type = gdjs.sk.SLOT_IMAGE;

        this.renderer.loadAsSprite(textures[skinData.display[0].path]);

        this.aabb.vertices[0] = [-this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[1] = [ this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[2] = [ this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
        this.aabb.vertices[3] = [-this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
    }
    
    else if(skinData.display[0].type === "armature"){
		this.type = gdjs.sk.SLOT_ARMATURE;

		for(var i=0; i<skeletalData.armature.length; i++){
			if(skeletalData.armature[i].name === skinData.display[0].path){

				this.childArmature = new gdjs.sk.Armature(this.armature.skeleton, this.armature, this);
				this.childArmature.loadDragonBones(skeletalData, i, textures);
				this.addChild(this.childArmature);

				var verts = this.childArmature.getAABB().vertices;
				for(var j=0; j<verts.length; j++){
					this.aabb.vertices[i] = [verts[j][0], verts[j][1]];
				}
			}
		}
	}

	else if(skinData.display[0].type === "boundingBox"){
		this.type = gdjs.sk.SLOT_POLYGON;

		var polygon = new gdjs.Polygon();
		var verts = skinData.display[0].vertices;
		for(var i=0; i<verts.length; i+=2){
			polygon.vertices.push([verts[i], verts[i+1]]);
		}
		this.polygons.push(polygon);
	}

	else if(skinData.display[0].type === "mesh"){
		
		// Show mashes as images until GD PIXI version update
		this.type = gdjs.sk.SLOT_IMAGE;
        this.renderer.loadAsSprite(textures[skinData.display[0].path]);
        this.aabb.vertices[0] = [-this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[1] = [ this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
        this.aabb.vertices[2] = [ this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
        this.aabb.vertices[3] = [-this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
        this.resetState();
        return;
		
		
		this.type = gdjs.sk.SLOT_MESH;

		for(var i=0; i<skinData.display[0].vertices.length; i+=2){
			this.defaultVertices.push([skinData.display[0].vertices[i],
									   skinData.display[0].vertices[i+1]]);
		}

		this.renderer.loadAsMesh(textures[skinData.display[0].path],
								 skinData.display[0].vertices,
								 skinData.display[0].uvs,
								 skinData.display[0].triangles);

		if(skinData.display[0].hasOwnProperty("weights")){
			this.skinned = true;
			
			this.update();
			var worldMatrixInverse = this.worldMatrix.inverse();

			// maps Armature.bones index -> skinBones index
			var boneMap = {};
			for(var i=0, j=0; i<skinData.display[0].bonePose.length; i+=7, j++){
				boneMap[skinData.display[0].bonePose[i]] = j;
				this.skinBones.push(bonesIndex[skinData.display[0].bonePose[i]]);
				var boneWorldMatrix = bonesIndex[skinData.display[0].bonePose[i]].worldMatrix;
				this.skinBonesMatricesInverses.push(worldMatrixInverse.mul(boneWorldMatrix).inverse());
			}

			for(var i=0; i<skinData.display[0].weights.length;){
				var boneCount = skinData.display[0].weights[i];

				var vertexWeights = [];
				var vertexBones = [];
				for(var k=0; k<boneCount; k++){

					var boneId = skinData.display[0].weights[i + 2*k + 1];
					vertexBones.push(boneMap[boneId]);

					var boneWeight = skinData.display[0].weights[i + 2*k + 2];
					vertexWeights.push(boneWeight);
				}
				this.vertexBones.push(vertexBones);
				this.vertexWeights.push(vertexWeights);

				i += 2 * boneCount + 1;
			}
		}

		this.aabb.vertices[0] = [-this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
		this.aabb.vertices[1] = [ this.renderer.getWidth()/2.0,-this.renderer.getHeight()/2.0];
		this.aabb.vertices[2] = [ this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
		this.aabb.vertices[3] = [-this.renderer.getWidth()/2.0, this.renderer.getHeight()/2.0];
	}
    
    this.resetState();
};

gdjs.sk.Slot.prototype.resetState = function(){
    this.setZ(this.defaultZ);
    this.setColor(this.defaultR, this.defaultG, this.defaultB);
    this.setAlpha(this.defaultAlpha);
    this.setVisible(this.defaultVisible);
    if(this.type === gdjs.sk.SLOT_MESH){
        var verts = [];
        var updateList = [];
        for(var i=0; i<this.defaultVertices.length; i++){
            verts.push([0, 0]);
            updateList.push(i);
        }
        this.setVertices(verts, updateList);
    }
};

gdjs.sk.Slot.prototype.setZ = function(z){
	this.z = z;
	if(this.type === gdjs.sk.SLOT_IMAGE || this.type === gdjs.sk.SLOT_MESH){
		this.renderer.setZ(z);
	}
};

gdjs.sk.Slot.prototype.getColor = function(){
	if(!this.armature.parentSlot){
		return [this.r, this.g, this.b];
	}

	var armatureColor = this.armature.parentSlot.getColor();
	return [this.r * armatureColor[0] / 255,
			this.g * armatureColor[1] / 255,
			this.b * armatureColor[2] / 255];
};

gdjs.sk.Slot.prototype.setColor = function(r, g, b){
	if(this.r !== r || this.g !== g || this.b !== b){
		this.r = r;
		this.g = g;
		this.b = b;
		this.updateRendererColor();
	}
};

gdjs.sk.Slot.prototype.updateRendererColor = function(){
	if(this.type === gdjs.sk.SLOT_IMAGE || this.type === gdjs.sk.SLOT_MESH){
		this.renderer.setColor(this.getColor());
	}
	else if(this.type === gdjs.sk.SLOT_ARMATURE && this.childArmature){
		for(var i=0; i<this.childArmature.slots.length; i++){
			this.childArmature.slots[i].updateRendererColor();
		}
	}
};

gdjs.sk.Slot.prototype.getAlpha = function(){
	if(!this.armature.parentSlot){
		return this.alpha;
	}
	var armatureAlpha = this.armature.parentSlot.getAlpha();
	return (this.alpha * armatureAlpha);
};

gdjs.sk.Slot.prototype.setAlpha = function(alpha){
	if(this.alpha !== alpha){
		this.alpha = alpha;
		this.updateRendererAlpha();
	}
};

gdjs.sk.Slot.prototype.updateRendererAlpha = function(){
	if(this.type === gdjs.sk.SLOT_IMAGE || this.type === gdjs.sk.SLOT_MESH){
		this.renderer.setAlpha(this.getAlpha());
	}
	else if(this.type === gdjs.sk.SLOT_ARMATURE && this.childArmature){
		for(var i=0; i<this.childArmature.slots.length; i++){
			this.childArmature.slots[i].updateRendererAlpha();
		}
	}
};

gdjs.sk.Slot.prototype.getVisible = function(){
	if(!this.armature.parentSlot){
		return this.visible;
	}
	var armatureVisible = this.armature.parentSlot.getVisible();
	return (this.visible && armatureVisible);
};

gdjs.sk.Slot.prototype.setVisible = function(visible){
	if(this.visible !== visible){
		this.visible = visible;
		this.updateRendererVisible();
	}
};

gdjs.sk.Slot.prototype.updateRendererVisible = function(){
	if(this.type === gdjs.sk.SLOT_IMAGE || this.type === gdjs.sk.SLOT_MESH){
		this.renderer.setVisible(this.getVisible());
	}
	else if(this.type === gdjs.sk.SLOT_ARMATURE && this.childArmature){
		for(var i=0; i<this.childArmature.slots.length; i++){
			this.childArmature.slots[i].updateRendererVisible();
		}
	}
};

// Mesh only
gdjs.sk.Slot.prototype.setVertices = function(vertices, updateList){
	var verts = [];
	for(var i=0; i<updateList.length; i++){
		this.vertices[updateList[i]] = [vertices[i][0] + this.defaultVertices[updateList[i]][0],
										vertices[i][1] + this.defaultVertices[updateList[i]][1]];
		verts.push(this.vertices[updateList[i]]);
	}
	this.renderer.setVertices(verts, updateList);
}
// Mesh only
gdjs.sk.Slot.prototype.updateSkinning = function(){
	var verts = [];
	var updateList = [];
	var boneMatrices = [];
	var inverseWorldMatrix = this.worldMatrix.inverse();
	for(var i=0; i<this.skinBones.length; i++){
		var localBoneMatrix = inverseWorldMatrix.mul(this.skinBones[i].worldMatrix);
		boneMatrices.push(localBoneMatrix.mul(this.skinBonesMatricesInverses[i]));
	}
	for(var i=0; i<this.vertexWeights.length; i++){
		var vx = 0.0;
		var vy = 0.0;
		for(var j=0; j<this.vertexWeights[i].length; j++){
			var v = boneMatrices[this.vertexBones[i][j]].mulVec(this.vertices[i]);
			vx += this.vertexWeights[i][j] * v[0];
			vy += this.vertexWeights[i][j] * v[1];
		}
		verts.push([vx, vy]);
		updateList.push(i);
	}
	this.renderer.setVertices(verts, updateList);
};

gdjs.sk.Slot.prototype.getPolygons = function(){
	if(this.type === gdjs.sk.SLOT_POLYGON){
		var worldPolygons = [];
		for(var i=0; i<this.polygons.length; i++){
			worldPolygons.push(this.transformPolygon(this.polygons[i]));
		}
		return worldPolygons;
	}

	return [this.transformPolygon(this.aabb)];
};

gdjs.sk.Slot.prototype.update = function(){
    gdjs.sk.Transform.prototype.update.call(this);

    if(this._updateRender && (this.type === gdjs.sk.SLOT_IMAGE || this.type === gdjs.sk.SLOT_MESH)){
		this.renderer.setPos(this.worldMatrix.tx, this.worldMatrix.ty);
		var sx = Math.sqrt(this.worldMatrix.a * this.worldMatrix.a +
                           this.worldMatrix.c * this.worldMatrix.c );
		var sy = Math.sqrt(this.worldMatrix.b * this.worldMatrix.b +
                           this.worldMatrix.d * this.worldMatrix.d );
		this.renderer.setScale(sx, sy);
		if(this.renderer.skewSupported()){
			this.renderer.setSkew(-Math.atan2(this.worldMatrix.d, this.worldMatrix.b) + Math.PI/2.0,
								   Math.atan2(this.worldMatrix.c, this.worldMatrix.a));
		}
		else{
			this.renderer.setRotation(Math.atan2(-this.worldMatrix.b/sy, this.worldMatrix.a/sx));
		}
		this._updateRender = false;
    }
};

gdjs.sk.Slot.prototype.updateTransform = function(){
    if(this._updateMatrix || this._updateWorldMatrix){
        this._updateRender = true;
    }
    gdjs.sk.Transform.prototype.updateTransform.call(this);
};
