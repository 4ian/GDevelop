
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

 /**
 * @namespace gdjs.sk
 */
gdjs.sk = gdjs.sk || {
	// Cached loaded skeletons per object
	loadedSkeletons: {},
	// Some useful constants
	SLOT_UNDEFINED: -1,
	SLOT_IMAGE: 0,
	SLOT_MESH: 1,
	SLOT_POLYGON: 2,
	SLOT_ARMATURE: 3,
	EASING_CONST: 0,
	EASING_LINEAR: 1,
	EASING_CURVE: 2,
	EVENT_STOP: 0,
	EVENT_PLAY: 1,
	EVENT_PLAYSINGLE: 2
};


/**
 * The Matrix holds the basic transformation data in a matrix form.
 *
 * @namespace gdjs.sk
 * @class Matrix
 */
gdjs.sk.Matrix = function(a=1, b=0, tx=0, c=0, d=1, ty=0){
	this.a = a; this.b = b; this.tx = tx;
	this.c = c; this.d = d; this.ty = ty;
	this.u = 0; this.v = 0; this.w  = 1;
}

gdjs.sk.Matrix.prototype.translation = function(x, y){
	this.tx = x;
	this.ty = y;
	return this;
}

gdjs.sk.Matrix.prototype.rotation = function(angle){
	this.a = Math.cos(angle); this.b = -Math.sin(angle);
	this.c = Math.sin(angle); this.d =  Math.cos(angle);
	return this;
}

gdjs.sk.Matrix.prototype.scale = function(sx, sy){
	this.a = sx;
	this.d = sy;
	return this;
}

gdjs.sk.Matrix.prototype.clone = function(){
	return new gdjs.sk.Matrix(this.a, this.b, this.tx,
								   this.c, this.d, this.ty,
								   this.u, this.v, this.w );
}

gdjs.sk.Matrix.prototype.mul = function(m){
	return new gdjs.sk.Matrix(this.a*m.a + this.b*m.c,
								   this.a*m.b + this.b*m.d,
								   this.a*m.tx + this.b*m.ty + this.tx,
								   this.c*m.a + this.d*m.c,
								   this.c*m.b + this.d*m.d,
								   this.c*m.tx + this.d*m.ty + this.ty);
}

gdjs.sk.Matrix.prototype.mulVec = function(v){
	return [this.a*v[0] + this.b*v[1] + this.tx,
			this.c*v[0] + this.d*v[1] + this.ty];
}

gdjs.sk.Matrix.prototype.inverse = function(){
	var det_inv = 1.0 / (this.a*this.d - this.b*this.c);
	return new gdjs.sk.Matrix( this.d*det_inv,
								   -this.b*det_inv,
								   (this.b*this.ty - this.d*this.tx)*det_inv,
								   -this.c*det_inv,
								    this.a*det_inv,
								   (this.c*this.tx - this.a*this.ty)*det_inv);
}

gdjs.sk.Matrix.prototype.str = function(){
	return "|" + this.a.toFixed(2) + ", " + this.b.toFixed(2) + ", " + this.tx.toFixed(2) + "|\n" +
		   "|" + this.c.toFixed(2) + ", " + this.d.toFixed(2) + ", " + this.ty.toFixed(2) + "|\n" +
		   "|" + this.u.toFixed(2) + ", " + this.v.toFixed(2) + ", " + this.w.toFixed(2) + "|\n";
}



/**
 * The Transform is the basic class for transformable objects as bones, slots and armatures.
 *
 * @namespace gdjs.sk
 * @class Transform
 */
gdjs.sk.Transform = function(x=0, y=0, rot=0, sx=1, sy=1){
	this.parent = null;
	this.children = [];
	this.x = x;
	this.y = y;
	this.rot = rot * Math.PI / 180.0;
	this.sx = sx;
	this.sy = sy;
	this.matrix = new gdjs.sk.Matrix();
	this.worldMatrix = new gdjs.sk.Matrix();
	this._updateMatrix = true;
	this._updateWorldMatrix = false;
	this.inheritTranslation = true;
	this.inheritRotation = true;
	this.inheritScale = true;
}

gdjs.sk.Transform.prototype.addChild = function(child){
	this.children.push(child);
	child.reparent(this);
}

gdjs.sk.Transform.prototype.reparent = function(parent){
	if(this.parent){
		this.parent.removeChild(this);
	}
	this.parent = parent;
	this._updateWorldMatrix = true;
}

gdjs.sk.Transform.prototype.removeChild = function(child){
	var index = this.children.indexOf(child);
	if(index > -1){
		this.children.splice(index, 1);
	}
}

gdjs.sk.Transform.prototype.setPos = function(x, y){
	if(this.x !== x || this.y !== y){
		this.x = x;
		this.y = y;
		this._updateMatrix = true;
	}
}

gdjs.sk.Transform.prototype.setRot = function(angle){
	angle *= Math.PI / 180.0;
	if(this.rot !== angle){
		this.rot = angle;
		this._updateMatrix = true;
	}
}

gdjs.sk.Transform.prototype.setScale = function(sx, sy){
	if(this.sx !== sx || this.sy !== sy){
		this.sx = sx;
		this.sy = sy;
		this._updateMatrix = true;
	}
}

gdjs.sk.Transform.prototype.move = function(x, y){
	this.x += x;
	this.y += y;
	this._updateMatrix = true;
}

gdjs.sk.Transform.prototype.rotate = function(angle){
	this.rot += angle * Math.PI / 180.0;
	this._updateMatrix = true;
}

gdjs.sk.Transform.prototype.scale = function(sx, sy){
	this.sx *= sx;
	this.sy *= sy;
	this._updateMatrix = true;
}

gdjs.sk.Transform.prototype.update = function(){
	this.updateTransform();

	for(var i=0; i<this.children.length; i++){
		this.children[i].update();
	}
}

gdjs.sk.Transform.prototype.updateTransform = function(){
	var sin_rot, cos_rot;
	if(this._updateMatrix || this._updateWorldMatrix){
		sin_rot = Math.sin(this.rot);
		cos_rot = Math.cos(this.rot);
	}

	if(this._updateMatrix){
		this.matrix = new gdjs.sk.Matrix(this.sx*cos_rot,-this.sy*sin_rot, this.x,
										 this.sx*sin_rot, this.sy*cos_rot, this.y,
													   0,				0,		1);
	}
	if(this._updateMatrix || this._updateWorldMatrix){
		if(!this.parent){
			this.worldMatrix = this.matrix.clone();
		}
		else{
			this.worldMatrix = this.parent.worldMatrix.mul(this.matrix);

			if(!this.inheritRotation || !this.inheritScale){
				if(this.inheritScale){ // Non iherited rotation
					var worldSx = Math.sqrt(this.worldMatrix.a*this.worldMatrix.a +
						   					this.worldMatrix.c*this.worldMatrix.c);
					var worldSy = Math.sqrt(this.worldMatrix.b*this.worldMatrix.b +
						   					this.worldMatrix.d*this.worldMatrix.d);
					this.worldMatrix.a =  worldSx*cos_rot;
					this.worldMatrix.b = -worldSy*sin_rot;
					this.worldMatrix.c =  worldSx*sin_rot;
					this.worldMatrix.d =  worldSy*cos_rot;
				}
				else if(this.inheritRotation){ // Non inherited scale
					var worldSx = Math.sqrt(this.worldMatrix.a*this.worldMatrix.a +
						   					this.worldMatrix.c*this.worldMatrix.c);
					var worldSy = Math.sqrt(this.worldMatrix.b*this.worldMatrix.b +
						   					this.worldMatrix.d*this.worldMatrix.d);
					this.worldMatrix.a *= this.sx / worldSx;
					this.worldMatrix.b *= this.sy / worldSy;
					this.worldMatrix.c *= this.sx / worldSx;
					this.worldMatrix.d *= this.sy / worldSy;
				}
				else{ // Non inherited rotation nor scale
					this.worldMatrix.a =  this.sx*cos_rot;
					this.worldMatrix.b = -this.sy*sin_rot;
					this.worldMatrix.c =  this.sx*sin_rot;
					this.worldMatrix.d =  this.sy*cos_rot;
				}
			}

			if(!this.inheritTranslation){
				this.worldMatrix.tx = this.x;
				this.worldMatrix.ty = this.y;
			}

		}

		for(var i=0; i<this.children.length; i++){
			this.children[i]._updateWorldMatrix = true;
		}
	}

	this._updateMatrix = false;
	this._updateWorldMatrix = false;
}

gdjs.sk.Transform.prototype.updateParentsTransform = function(){
	if(this.parent){
		this.parent.updateParentsTransform();
	}
	this.updateTransform();
}

gdjs.sk.Transform.prototype.transformPolygon = function(polygon){
	this.updateParentsTransform();

	var worldPoly = new gdjs.Polygon();
	for(var i=0; i<polygon.vertices.length; i++){
		worldPoly.vertices.push(this.worldMatrix.mulVec(polygon.vertices[i]));
	}
	return worldPoly;
}
