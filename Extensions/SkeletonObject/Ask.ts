namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  /**
   * @memberof gdjs.sk
   */
  gdjs.sk = gdjs.sk || {
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
    EVENT_PLAYSINGLE: 2,
  };

  /**
   * The Matrix holds the basic transformation data in a matrix form.
   *
   * @memberof gdjs.sk
   * @class Matrix
   */
  gdjs.sk.Matrix = function (a = 1, b = 0, tx = 0, c = 0, d = 1, ty = 0) {
    this.a = a;
    this.b = b;
    this.tx = tx;
    this.c = c;
    this.d = d;
    this.ty = ty;
    this.u = 0;
    this.v = 0;
    this.w = 1;
  };
  gdjs.sk.Matrix.prototype.translation = function (x, y) {
    this.tx = x;
    this.ty = y;
    return this;
  };
  gdjs.sk.Matrix.prototype.rotation = function (angle) {
    this.a = Math.cos(angle);
    this.b = -Math.sin(angle);
    this.c = Math.sin(angle);
    this.d = Math.cos(angle);
    return this;
  };
  gdjs.sk.Matrix.prototype.scale = function (sx, sy) {
    this.a = sx;
    this.d = sy;
    return this;
  };
  gdjs.sk.Matrix.prototype.clone = function () {
    return new gdjs.sk.Matrix(
      this.a,
      this.b,
      this.tx,
      this.c,
      this.d,
      this.ty,
      this.u,
      this.v,
      this.w
    );
  };
  gdjs.sk.Matrix.prototype.mul = function (m) {
    return new gdjs.sk.Matrix(
      this.a * m.a + this.b * m.c,
      this.a * m.b + this.b * m.d,
      this.a * m.tx + this.b * m.ty + this.tx,
      this.c * m.a + this.d * m.c,
      this.c * m.b + this.d * m.d,
      this.c * m.tx + this.d * m.ty + this.ty
    );
  };
  gdjs.sk.Matrix.prototype.mulVec = function (v) {
    return [
      this.a * v[0] + this.b * v[1] + this.tx,
      this.c * v[0] + this.d * v[1] + this.ty,
    ];
  };
  gdjs.sk.Matrix.prototype.invert = function () {
    const det_inv = 1.0 / (this.a * this.d - this.b * this.c);
    const a = this.a;
    const tx = this.tx;
    this.tx = (this.b * this.ty - this.d * tx) * det_inv;
    this.ty = (this.c * tx - this.a * this.ty) * det_inv;
    this.a = this.d * det_inv;
    this.b = -this.b * det_inv;
    this.c = -this.c * det_inv;
    this.d = a * det_inv;
    return this;
  };
  gdjs.sk.Matrix.prototype.inverse = function () {
    const det_inv = 1.0 / (this.a * this.d - this.b * this.c);
    return new gdjs.sk.Matrix(
      this.d * det_inv,
      -this.b * det_inv,
      (this.b * this.ty - this.d * this.tx) * det_inv,
      -this.c * det_inv,
      this.a * det_inv,
      (this.c * this.tx - this.a * this.ty) * det_inv
    );
  };
  gdjs.sk.Matrix.prototype.str = function () {
    return (
      '|' +
      this.a.toFixed(2) +
      ', ' +
      this.b.toFixed(2) +
      ', ' +
      this.tx.toFixed(2) +
      '|\n' +
      '|' +
      this.c.toFixed(2) +
      ', ' +
      this.d.toFixed(2) +
      ', ' +
      this.ty.toFixed(2) +
      '|\n' +
      '|' +
      this.u.toFixed(2) +
      ', ' +
      this.v.toFixed(2) +
      ', ' +
      this.w.toFixed(2) +
      '|\n'
    );
  };

  /**
   * The Transform is the basic class for transformable objects as bones, slots and armatures.
   *
   * @memberof gdjs.sk
   * @class Transform
   */
  gdjs.sk.Transform = function (x = 0, y = 0, rot = 0, sx = 1, sy = 1) {
    this.parent = null;
    this.children = [];
    this.x = x;
    this.y = y;
    this.rot = (rot * Math.PI) / 180.0;
    this.sx = sx;
    this.sy = sy;
    this.matrix = new gdjs.sk.Matrix();
    this.worldMatrix = new gdjs.sk.Matrix();
    this._updateMatrix = true;
    this._updateWorldMatrix = false;
    this.inheritTranslation = true;
    this.inheritRotation = true;
    this.inheritScale = true;
  };
  gdjs.sk.Transform.prototype.addChild = function (child) {
    this.children.push(child);
    child.reparent(this);
  };
  gdjs.sk.Transform.prototype.reparent = function (parent) {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = parent;
    this._updateWorldMatrix = true;
  };
  gdjs.sk.Transform.prototype.removeChild = function (child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  };
  gdjs.sk.Transform.prototype.getX = function () {
    return this.x;
  };
  gdjs.sk.Transform.prototype.setX = function (x) {
    if (this.x !== x) {
      this.x = x;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.getGlobalX = function () {
    this.updateParentsTransform();
    return this.worldMatrix.tx;
  };
  gdjs.sk.Transform.prototype.setGlobalX = function (x) {
    const globalY =
      // Also updates parent transforms
      this.getGlobalY();
    const localPos = this.parent.worldMatrix
      .inverse()
      .mulVec([x, globalY, 1.0]);
    this.x = localPos[0];
    this.y = localPos[1];
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.getY = function () {
    return this.y;
  };
  gdjs.sk.Transform.prototype.setY = function (y) {
    if (this.y !== y) {
      this.y = y;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.getGlobalY = function () {
    this.updateParentsTransform();
    return this.worldMatrix.ty;
  };
  gdjs.sk.Transform.prototype.setGlobalY = function (y) {
    const globalX =
      // Also updates parent transforms
      this.getGlobalX();
    const localPos = this.parent.worldMatrix
      .inverse()
      .mulVec([globalX, y, 1.0]);
    this.x = localPos[0];
    this.y = localPos[1];
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.setPos = function (x, y) {
    if (this.x !== x || this.y !== y) {
      this.x = x;
      this.y = y;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.getRot = function () {
    return (this.rot * 180.0) / Math.PI;
  };
  gdjs.sk.Transform.prototype.setRot = function (angle) {
    angle *= Math.PI / 180.0;
    if (this.rot !== angle) {
      this.rot = angle;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.getGlobalRot = function () {
    this.updateParentsTransform();
    const sx = Math.sqrt(
      this.worldMatrix.a * this.worldMatrix.a +
        this.worldMatrix.c * this.worldMatrix.c
    );
    const sy = Math.sqrt(
      this.worldMatrix.b * this.worldMatrix.b +
        this.worldMatrix.d * this.worldMatrix.d
    );
    return (
      (Math.atan2(-this.worldMatrix.b / sy, this.worldMatrix.a / sx) * 180.0) /
      Math.PI
    );
  };
  gdjs.sk.Transform.prototype.setGlobalRot = function (rot) {
    const parentGlobalRot = this.parent ? this.parent.getGlobalRot() : 0;
    this.rot = ((rot - parentGlobalRot) * Math.PI) / 180.0;
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.getSx = function () {
    return this.sx;
  };
  gdjs.sk.Transform.prototype.getSy = function () {
    return this.sy;
  };
  gdjs.sk.Transform.prototype.setSx = function (sx) {
    if (this.sx !== sx) {
      this.sx = sx;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.setSy = function (sy) {
    if (this.sy !== sy) {
      this.sy = sy;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.setScale = function (sx, sy) {
    if (this.sx !== sx || this.sy !== sy) {
      this.sx = sx;
      this.sy = sy;
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Transform.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.rotate = function (angle) {
    this.rot += (angle * Math.PI) / 180.0;
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.scale = function (sx, sy) {
    this.sx *= sx;
    this.sy *= sy;
    this._updateMatrix = true;
  };
  gdjs.sk.Transform.prototype.update = function () {
    this.updateTransform();
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }
  };
  gdjs.sk.Transform.prototype.updateTransform = function () {
    let sin_rot, cos_rot;
    if (this._updateMatrix || this._updateWorldMatrix) {
      sin_rot = Math.sin(this.rot);
      cos_rot = Math.cos(this.rot);
    }
    if (this._updateMatrix) {
      this.matrix = new gdjs.sk.Matrix(
        this.sx * cos_rot,
        -this.sy * sin_rot,
        this.x,
        this.sx * sin_rot,
        this.sy * cos_rot,
        this.y,
        0,
        0,
        1
      );
    }
    if (this._updateMatrix || this._updateWorldMatrix) {
      if (!this.parent) {
        this.worldMatrix = this.matrix.clone();
      } else {
        this.worldMatrix = this.parent.worldMatrix.mul(this.matrix);
        if (!this.inheritRotation || !this.inheritScale) {
          if (this.inheritScale) {
            // Non iherited rotation
            let worldSx = Math.sqrt(
              this.worldMatrix.a * this.worldMatrix.a +
                this.worldMatrix.c * this.worldMatrix.c
            );
            let worldSy = Math.sqrt(
              this.worldMatrix.b * this.worldMatrix.b +
                this.worldMatrix.d * this.worldMatrix.d
            );
            this.worldMatrix.a = worldSx * cos_rot;
            this.worldMatrix.b = -worldSy * sin_rot;
            this.worldMatrix.c = worldSx * sin_rot;
            this.worldMatrix.d = worldSy * cos_rot;
          } else {
            if (this.inheritRotation) {
              // Non inherited scale
              let worldSx = Math.sqrt(
                this.worldMatrix.a * this.worldMatrix.a +
                  this.worldMatrix.c * this.worldMatrix.c
              );
              let worldSy = Math.sqrt(
                this.worldMatrix.b * this.worldMatrix.b +
                  this.worldMatrix.d * this.worldMatrix.d
              );
              this.worldMatrix.a *= this.sx / worldSx;
              this.worldMatrix.b *= this.sy / worldSy;
              this.worldMatrix.c *= this.sx / worldSx;
              this.worldMatrix.d *= this.sy / worldSy;
            } else {
              // Non inherited rotation nor scale
              this.worldMatrix.a = this.sx * cos_rot;
              this.worldMatrix.b = -this.sy * sin_rot;
              this.worldMatrix.c = this.sx * sin_rot;
              this.worldMatrix.d = this.sy * cos_rot;
            }
          }
        }
        if (!this.inheritTranslation) {
          this.worldMatrix.tx = this.x;
          this.worldMatrix.ty = this.y;
        }
      }
      for (let i = 0; i < this.children.length; i++) {
        this.children[i]._updateWorldMatrix = true;
      }
    }
    this._updateMatrix = false;
    this._updateWorldMatrix = false;
  };
  gdjs.sk.Transform.prototype.updateParentsTransform = function () {
    if (this.parent) {
      this.parent.updateParentsTransform();
    }
    this.updateTransform();
  };
  gdjs.sk.Transform.prototype.transformPolygon = function (vertices) {
    this.updateParentsTransform();
    const worldPoly = new gdjs.Polygon();
    for (let i = 0; i < vertices.length; i++) {
      worldPoly.vertices.push(this.worldMatrix.mulVec(vertices[i]));
    }
    return worldPoly;
  };
  gdjs.sk.Transform._statics = {
    transform: { x: 0, y: 0, sx: 1, sy: 1, skx: 0, sky: 0, rot: 0 },
  };
  gdjs.sk.Transform.decomposeMatrix = function (matrix) {
    const transform = gdjs.sk.Transform._statics.transform;
    transform.x = matrix.tx;
    transform.y = matrix.ty;
    const sx = Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c);
    const sy = Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d);
    transform.sx = sx;
    transform.sy = sy;
    transform.skx = -Math.atan2(matrix.d, matrix.b) + Math.PI / 2.0;
    transform.sky = Math.atan2(matrix.c, matrix.a);
    transform.rot = Math.atan2(-matrix.b / sy, matrix.a / sx);
    return transform;
  };
}
