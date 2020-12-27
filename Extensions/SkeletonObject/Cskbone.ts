namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  /**
   * @memberof gdjs.sk
   * @class SharedBone
   */
  gdjs.sk.SharedBone = function () {
    this.x = 0;
    this.y = 0;
    this.rot = 0;
    this.sx = 1;
    this.sy = 1;
    this.name = '';
    this.length = 0;
    this.parent = -1;
    this.childBones = [];
    this.childSlots = [];
    this.restX = 0;
    this.restY = 0;
    this.restRot = 0;
    this.restSx = 1;
    this.restSy = 1;
  };
  gdjs.sk.SharedBone.prototype.loadDragonBones = function (boneData) {
    this.name = boneData.name;
    this.length = boneData.hasOwnProperty('length') ? boneData.length : 0;
    const transformData = boneData.transform;
    this.restX = transformData.hasOwnProperty('x') ? transformData.x : 0;
    this.restY = transformData.hasOwnProperty('y') ? transformData.y : 0;
    this.restRot = transformData.hasOwnProperty('skX')
      ? (transformData.skX * Math.PI) / 180.0
      : 0;
    this.restSx = transformData.hasOwnProperty('scX') ? transformData.scX : 1;
    this.restSy = transformData.hasOwnProperty('scY') ? transformData.scY : 1;
    this.inheritRotation = boneData.hasOwnProperty('inheritRotation')
      ? transformData.inheritRotation
      : true;
    this.inheritScale = boneData.hasOwnProperty('inheritScale')
      ? transformData.inheritScale
      : true;
  };

  /**
   * The Bone holds basic transform data in a hierarchy tree.
   *
   * @memberof gdjs.sk
   * @class Bone
   * @extends gdjs.sk.Transform
   */
  gdjs.sk.Bone = function (armature) {
    gdjs.sk.Transform.call(this);
    this.shared = null;
    this.armature = armature;
  };
  gdjs.sk.Bone.prototype = Object.create(gdjs.sk.Transform.prototype);
  gdjs.sk.Bone.prototype.loadData = function (boneData) {
    this.shared = boneData;
    this.resetState();
  };
  gdjs.sk.Bone.prototype.resetState = function () {
    this.setPos(0, 0);
    this.setRot(0);
    this.setScale(1, 1);
  };
  gdjs.sk.Bone.prototype.setX = function (x) {
    const prevX = this.x;
    this.x = this.shared.restX + x;
    if (this.x !== prevX) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setY = function (y) {
    const prevY = this.y;
    this.y = this.shared.restY + y;
    if (this.y !== prevY) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setPos = function (x, y) {
    const prevX = this.x;
    const prevY = this.y;
    this.x = this.shared.restX + x;
    this.y = this.shared.restY + y;
    if (this.x !== prevX || this.y !== prevY) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setRot = function (angle) {
    const prevRot = this.rot;
    this.rot = this.shared.restRot + (angle * Math.PI) / 180.0;
    if (this.rot !== prevRot) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setSx = function (sx) {
    const prevSx = this.sx;
    this.sx = this.shared.restSx * sx;
    if (this.sx !== prevSx) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setSy = function (sy) {
    const prevSy = this.sy;
    this.sy = this.shared.restSy * sy;
    if (this.sy !== prevSy) {
      this._updateMatrix = true;
    }
  };
  gdjs.sk.Bone.prototype.setScale = function (sx, sy) {
    const prevSx = this.sx;
    const prevSy = this.sy;
    this.sx = this.shared.restSx * sx;
    this.sy = this.shared.restSy * sy;
    if (this.sx !== prevSx || this.sy !== prevSy) {
      this._updateMatrix = true;
    }
  };
}
