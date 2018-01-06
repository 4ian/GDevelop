
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonMatrix hold the basic transformation data in a matrix form.
 *
 * @namespace gdjs
 * @class SkeletonMatrix
 * @namespace gdjs
 */
gdjs.SkeletonMatrix = function(a=1, b=0, tx=0, c=0, d=1, ty=0){
	this.a = a; this.b = b; this.tx = tx;
	this.c = c; this.d = d; this.ty = ty;
	this.a31 = 0;   this.a32 = 0;   this.a33 = 1;
}

gdjs.SkeletonMatrix.prototype.translation = function(x, y){
	this.tx = x;
	this.ty = y;
	return this;
}

gdjs.SkeletonMatrix.prototype.rotation = function(angle){
	this.a = Math.cos(angle); this.b = -Math.sin(angle);
	this.c = Math.sin(angle); this.d =  Math.cos(angle);
	return this;
}

gdjs.SkeletonMatrix.prototype.scale = function(sx, sy){
	this.a = sx;
	this.d = sy;
	return this;
}

gdjs.SkeletonMatrix.prototype.clone = function(){
	return new gdjs.SkeletonMatrix(this.a, this.b, this.tx,
					  this.c, this.d, this.ty,
					  this.a31, this.a32, this.a33);
}

gdjs.SkeletonMatrix.prototype.mul = function(m){
	return new gdjs.SkeletonMatrix(this.a*m.a + this.b*m.c, this.a*m.b + this.b*m.d,
					  this.a*m.tx + this.b*m.ty + this.tx,
					  this.c*m.a + this.d*m.c, this.c*m.b + this.d*m.d,
					  this.c*m.tx + this.d*m.ty + this.ty);
}

gdjs.SkeletonMatrix.prototype.mulVec = function(v){
	return [this.a*v[0] + this.b*v[1] + this.tx,
			this.c*v[0] + this.d*v[1] + this.ty];
}

gdjs.SkeletonMatrix.prototype.inverse = function(){
	var det_inv = 1.0 / (this.a*this.d - this.b*this.c);
	return new gdjs.SkeletonMatrix( this.d*det_inv, - this.b*det_inv,
					  (this.b*this.ty - this.d*this.tx)*det_inv,
					  -this.c*det_inv,   this.a*det_inv,
					  (this.c*this.tx - this.a*this.ty)*det_inv);
}

gdjs.SkeletonMatrix.prototype.str = function(){
	return "|" + this.a.toFixed(2) + ", " + this.b.toFixed(2) + ", " + this.tx.toFixed(2) + "|\n" +
		   "|" + this.c.toFixed(2) + ", " + this.d.toFixed(2) + ", " + this.ty.toFixed(2) + "|\n" +
		   "|" + this.a31.toFixed(2) + ", " + this.a32.toFixed(2) + ", " + this.a33.toFixed(2) + "|\n";
}



gdjs.SkeletonTransform = function(x=0, y=0, rot=0, sx=1, sy=1){
	this.parent = null;
	this.children = [];
	this.x = x;
	this.y = y;
	this.rot = rot * Math.PI / 180.0;
	this.sx = sx;
	this.sy = sy;
	this.matrix = new gdjs.SkeletonMatrix();
	this.worldMatrix = new gdjs.SkeletonMatrix();
	this._updateMatrix = true;
	this._updateWorldMatrix = false;
	this.inheritTranslation = true;
	this.inheritRotation = true;
	this.inheritScale = true;
}

gdjs.SkeletonTransform.prototype.addChild = function(child){
	this.children.push(child);
	child.reparent(this);
}

gdjs.SkeletonTransform.prototype.reparent = function(parent){
	if(this.parent){
		this.parent.removeChild(this);
	}
	this.parent = parent;
	this._updateWorldMatrix = true;
}

gdjs.SkeletonTransform.prototype.removeChild = function(child){
	var index = this.children.indexOf(child);
	if(index > -1){
		this.children.splice(index, 1);
	}
}

gdjs.SkeletonTransform.prototype.setPos = function(x, y){
	if(this.x !== x || this.y !== y){
		this.x = x;
		this.y = y;
		this._updateMatrix = true;
	}
}

gdjs.SkeletonTransform.prototype.setRot = function(angle){
	angle *= Math.PI / 180.0;
	if(this.rot !== angle){
		this.rot = angle;
		this._updateMatrix = true;
	}
}

gdjs.SkeletonTransform.prototype.setScale = function(sx, sy){
	if(this.sx !== sx || this.sy !== sy){
		this.sx = sx;
		this.sy = sy;
		this._updateMatrix = true;
	}
}

gdjs.SkeletonTransform.prototype.move = function(x, y){
	this.x += x;
	this.y += y;
	this._updateMatrix = true;
}

gdjs.SkeletonTransform.prototype.rotate = function(angle){
	this.rot += angle * Math.PI / 180.0;
	this._updateMatrix = true;
}

gdjs.SkeletonTransform.prototype.scale = function(sx, sy){
	this.sx *= sx;
	this.sy *= sy;
	this._updateMatrix = true;
}

gdjs.SkeletonTransform.prototype.update = function(){
	this.updateTransform();

	for(var i=0; i<this.children.length; i++){
		this.children[i].update();
	}
}

gdjs.SkeletonTransform.prototype.updateTransform = function(){
	var sin_rot, cos_rot;
	if(this._updateMatrix || this._updateWorldMatrix){
		sin_rot = Math.sin(this.rot);
		cos_rot = Math.cos(this.rot);
	}

	if(this._updateMatrix){
		this.matrix = new gdjs.SkeletonMatrix(this.sx*cos_rot,-this.sy*sin_rot, this.x,
											  this.sx*sin_rot, this.sy*cos_rot, this.y,
															0,				 0,		 1);
	}
	if(this._updateMatrix || this._updateWorldMatrix){
		if(!this.parent){
			this.worldMatrix = this.matrix.clone();
		}
		else{
			this.worldMatrix = this.parent.worldMatrix.mul(this.matrix);

			if(!this.inheritRotation || !this.inheritScale){
				if(this.inheritScale){ // non iherited rotation
					var worldSx = Math.sqrt(this.worldMatrix.a*this.worldMatrix.a +
						   					this.worldMatrix.c*this.worldMatrix.c);
					var worldSy = Math.sqrt(this.worldMatrix.b*this.worldMatrix.b +
						   					this.worldMatrix.d*this.worldMatrix.d);
					this.worldMatrix.a =  worldSx*cos_rot;
					this.worldMatrix.b = -worldSy*sin_rot;
					this.worldMatrix.c =  worldSx*sin_rot;
					this.worldMatrix.d =  worldSy*cos_rot;
				}
				else if(this.inheritRotation){ // non inherited scale
					var worldSx = Math.sqrt(this.worldMatrix.a*this.worldMatrix.a +
						   					this.worldMatrix.c*this.worldMatrix.c);
					var worldSy = Math.sqrt(this.worldMatrix.b*this.worldMatrix.b +
						   					this.worldMatrix.d*this.worldMatrix.d);
					this.worldMatrix.a *= this.sx / worldSx;
					this.worldMatrix.b *= this.sy / worldSy;
					this.worldMatrix.c *= this.sx / worldSx;
					this.worldMatrix.d *= this.sy / worldSy;
				}
				else{ // non inherited rotation and scale
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

gdjs.SkeletonTransform.prototype.updateParentsTransform = function(){
	if(this.parent){
		this.parent.updateParentsTransform();
	}
	this.updateTransform();
}

gdjs.SkeletonTransform.prototype.transformPolygon = function(polygon){
	this.updateParentsTransform();

	var worldPoly = new Polygon();
	for(var i=0; i<polygon.vertices.length; i++){
		worldPoly.vertices.push(this.worldMatrix.mulVec(polygon.vertices[i]));
	}
	return worldPoly;
}
