namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  gdjs.sk.SharedSlot = function () {
    // Transform
    this.x = 0;
    this.y = 0;
    this.rot = 0;
    this.sx = 1;
    this.sy = 1;

    // Slot
    this.name = '';
    this.type = gdjs.sk.SLOT_UNDEFINED;
    this.path = '';
    this.parent = -1;
    this.defaultZ = 0;
    this.defaultR = 255;
    this.defaultG = 255;
    this.defaultB = 255;
    this.defaultAlpha = 1.0;
    this.defaultVisible = true;
    this.aabb = null;

    // Polygon
    this.polygons = [];

    // Mesh
    this.rawVertices = [];
    this.rawUVs = [];
    this.rawTriangles = [];
    this.defaultVertices = [];
    this.skinned = false;
    this.skinBones = [];
    this.skinBonesMatricesInverses = [];
    this.vertexBones = [];
    this.vertexWeights = [];

    // Armature
    this.armature = '';
  };
  gdjs.sk.SharedSlot.prototype.loadDragonBonesSlotData = function (slotData) {
    this.name = slotData.name;
    this.defaultZ = slotData.hasOwnProperty('z') ? slotData.z : 0;
    this.defaultR = slotData.color.hasOwnProperty('rM')
      ? Math.ceil((slotData.color.rM * 255) / 100)
      : 255;
    this.defaultG = slotData.color.hasOwnProperty('gM')
      ? Math.ceil((slotData.color.gM * 255) / 100)
      : 255;
    this.defaultB = slotData.color.hasOwnProperty('bM')
      ? Math.ceil((slotData.color.bM * 255) / 100)
      : 255;
    this.defaultAlpha = slotData.color.hasOwnProperty('aM')
      ? slotData.color.aM / 100.0
      : 1.0;
    this.defaultVisible = slotData.hasOwnProperty(
      // {-1, 1} -> {0, 1}
      'displayIndex'
    )
      ? (slotData.displayIndex + 1) / 2
      : 1;
  };
  gdjs.sk.SharedSlot.prototype.loadDragonBonesSkinData = function (
    skinDatas,
    index
  ) {
    const skinData = skinDatas[index];
    const transformData = skinData.display[0].transform;
    this.x = transformData.hasOwnProperty('x') ? transformData.x : 0;
    this.y = transformData.hasOwnProperty('y') ? transformData.y : 0;
    this.rot = transformData.hasOwnProperty('skX')
      ? (transformData.skX * Math.PI) / 180.0
      : 0;
    this.sx = transformData.hasOwnProperty('scX') ? transformData.scX : 1;
    this.sy = transformData.hasOwnProperty('scY') ? transformData.scY : 1;

    // If another slot is already using the same image path we have to search for it
    if (!skinData.display[0].hasOwnProperty('path')) {
      for (let i = 0; i < skinDatas.length; i++) {
        if (
          skinDatas[i].display[0].name === skinData.display[0].name &&
          skinDatas[i].display[0].path
        ) {
          this.path = skinDatas[i].display[0].path;
          break;
        }
      }
    } else {
      this.path = skinData.display[0].path;
    }
    if (skinData.display[0].type === 'image') {
      this.type = gdjs.sk.SLOT_IMAGE;
    } else {
      if (skinData.display[0].type === 'armature') {
        this.type = gdjs.sk.SLOT_ARMATURE;
      } else {
        if (skinData.display[0].type === 'boundingBox') {
          this.type = gdjs.sk.SLOT_POLYGON;
          const polygon = [];
          const verts = skinData.display[0].vertices;
          for (let i = 0; i < verts.length; i += 2) {
            polygon.push([verts[i], verts[i + 1]]);
          }
          this.polygons.push(polygon);
        } else {
          if (skinData.display[0].type === 'mesh') {
            this.type = gdjs.sk.SLOT_MESH;
            for (let i = 0; i < skinData.display[0].vertices.length; i += 2) {
              this.defaultVertices.push([
                skinData.display[0].vertices[i],
                skinData.display[0].vertices[i + 1],
              ]);
            }
            this.rawVertices = skinData.display[0].vertices;
            this.rawUVs = skinData.display[0].uvs;
            this.rawTriangles = skinData.display[0].triangles;
            if (skinData.display[0].hasOwnProperty('weights')) {
              this.skinned = true;
              const slotPose = skinData.display[0].slotPose;
              const worldMatrixInverse = new gdjs.sk.Matrix(
                slotPose[0],
                -slotPose[1],
                slotPose[4],
                -slotPose[2],
                slotPose[3],
                slotPose[5]
              );
              worldMatrixInverse.invert();

              // maps Armature.bones index -> skinBones index
              const boneMap = {};
              for (
                let i = 0, j = 0;
                i < skinData.display[0].bonePose.length;
                i += 7, j++
              ) {
                const bonePose = skinData.display[0].bonePose;
                const boneWorldMatrix = new gdjs.sk.Matrix(
                  bonePose[i + 1],
                  -bonePose[i + 2],
                  bonePose[i + 5],
                  -bonePose[i + 3],
                  bonePose[i + 4],
                  bonePose[i + 6]
                );
                boneMap[bonePose[i]] = j;
                this.skinBones.push(bonePose[i]);
                this.skinBonesMatricesInverses.push(
                  worldMatrixInverse.mul(boneWorldMatrix).invert()
                );
              }
              for (let i = 0; i < skinData.display[0].weights.length; ) {
                const boneCount = skinData.display[0].weights[i];
                const vertexWeights = [];
                const vertexBones = [];
                for (let k = 0; k < boneCount; k++) {
                  const boneId = skinData.display[0].weights[i + 2 * k + 1];
                  vertexBones.push(boneMap[boneId]);
                  const boneWeight = skinData.display[0].weights[i + 2 * k + 2];
                  vertexWeights.push(boneWeight);
                }
                this.vertexBones.push(vertexBones);
                this.vertexWeights.push(vertexWeights);
                i += 2 * boneCount + 1;
              }
            }
          }
        }
      }
    }
  };

  /**
   * The Slot display images transformed by animations itself and bones.
   */
  gdjs.sk.Slot = function (armature) {
    gdjs.sk.Transform.call(this);
    this.shared = null;
    this.armature = armature;
    this.z = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.alpha = 0;
    this.visible = false;
    this.renderer = new gdjs.sk.SlotRenderer();
    this._updateRender = false;

    // Mesh only
    this.vertices = [];

    // same as this.shared.defaultVertices, but modified on animations
    this.skinBones = [];

    // Armature only
    this.childArmature = null;

    // Debug only
    this.debugRenderer = null;
  };
  gdjs.sk.Slot.prototype = Object.create(gdjs.sk.Transform.prototype);
  gdjs.sk.Slot.prototype.loadData = function (
    slotData,
    skeletalData,
    textures,
    debugPolygons
  ) {
    this.shared = slotData;
    this.z = this.shared.defaultZ;
    this.r = this.shared.defaultR;
    this.g = this.shared.defaultG;
    this.b = this.shared.defaultB;
    this.alpha = this.shared.defaultAlpha;
    this.visible = this.shared.defaultVisible;
    this.x = this.shared.x;
    this.y = this.shared.y;
    this.rot = this.shared.rot;
    this.sx = this.shared.sx;
    this.sy = this.shared.sy;
    this._updateMatrix = true;
    this._updateWorldMatrix = true;
    if (this.shared.type === gdjs.sk.SLOT_IMAGE) {
      this.renderer.loadAsSprite(textures[this.shared.path]);
      if (!this.shared.aabb) {
        this.shared.aabb = [];
        this.shared.aabb.push([
          -this.renderer.getWidth() / 2.0,
          -this.renderer.getHeight() / 2.0,
        ]);
        this.shared.aabb.push([
          this.renderer.getWidth() / 2.0,
          -this.renderer.getHeight() / 2.0,
        ]);
        this.shared.aabb.push([
          this.renderer.getWidth() / 2.0,
          this.renderer.getHeight() / 2.0,
        ]);
        this.shared.aabb.push([
          -this.renderer.getWidth() / 2.0,
          this.renderer.getHeight() / 2.0,
        ]);
      }
      if (debugPolygons) {
        this.debugRenderer = new gdjs.sk.DebugRenderer();
        this.debugRenderer.loadVertices(
          this.shared.aabb,
          [255, 100, 100],
          false
        );
      }
    } else {
      if (this.shared.type === gdjs.sk.SLOT_MESH) {
        for (let i = 0; i < this.shared.defaultVertices.length; i++) {
          this.vertices.push([
            this.shared.defaultVertices[i][0],
            this.shared.defaultVertices[i][1],
          ]);
        }
        for (let i = 0; i < this.shared.skinBones.length; i++) {
          this.skinBones.push(this.armature.bones[this.shared.skinBones[i]]);
        }
        this.renderer.loadAsMesh(
          textures[this.shared.path],
          this.shared.rawVertices,
          this.shared.rawUVs,
          this.shared.rawTriangles
        );
        if (!this.shared.aabb) {
          this.shared.aabb = [];
          this.shared.aabb.push([
            -this.renderer.getWidth() / 2.0,
            -this.renderer.getHeight() / 2.0,
          ]);
          this.shared.aabb.push([
            this.renderer.getWidth() / 2.0,
            -this.renderer.getHeight() / 2.0,
          ]);
          this.shared.aabb.push([
            this.renderer.getWidth() / 2.0,
            this.renderer.getHeight() / 2.0,
          ]);
          this.shared.aabb.push([
            -this.renderer.getWidth() / 2.0,
            this.renderer.getHeight() / 2.0,
          ]);
        }
        if (debugPolygons) {
          this.debugRenderer = new gdjs.sk.DebugRenderer();
          this.debugRenderer.loadVertices(
            this.shared.aabb,
            [255, 100, 100],
            false
          );
        }
      } else {
        if (this.shared.type === gdjs.sk.SLOT_POLYGON) {
          if (debugPolygons) {
            this.debugRenderer = new gdjs.sk.DebugRenderer();
            this.debugRenderer.loadVertices(
              this.shared.polygons[0],
              [100, 255, 100],
              true
            );
          }
        } else {
          if (this.shared.type === gdjs.sk.SLOT_ARMATURE) {
            for (let i = 0; i < skeletalData.armatures.length; i++) {
              if (skeletalData.armatures[i].name === this.shared.path) {
                this.childArmature = new gdjs.sk.Armature(
                  this.armature.skeleton,
                  this.armature,
                  this
                );
                this.childArmature
                  .getRenderer()
                  .extraInitialization(this.armature.getRenderer());
                this.childArmature.loadData(
                  skeletalData.armatures[i],
                  skeletalData,
                  debugPolygons
                );
                this.addChild(this.childArmature);
                if (!this.shared.aabb) {
                  this.shared.aabb = [];
                  const verts = this.childArmature.getAABB().vertices;
                  for (let j = 0; j < verts.length; j++) {
                    this.shared.aabb.push([verts[j][0], verts[j][1]]);
                  }
                }
              }
            }
          }
        }
      }
    }
    this.updateRendererColor();
    this.updateRendererAlpha();
    this.updateRendererVisible();
  };
  gdjs.sk.Slot.prototype.resetState = function () {
    this.setZ(this.shared.defaultZ);
    this.setColor(
      this.shared.defaultR,
      this.shared.defaultG,
      this.shared.defaultB
    );
    this.setAlpha(this.shared.defaultAlpha);
    this.setVisible(this.shared.defaultVisible);
    if (this.shared.type === gdjs.sk.SLOT_MESH) {
      const verts = [];
      const updateList = [];
      for (let i = 0; i < this.shared.defaultVertices.length; i++) {
        verts.push([0, 0]);
        updateList.push(i);
      }
      this.setVertices(verts, updateList);
    }
    if (this.shared.type === gdjs.sk.SLOT_ARMATURE) {
      this.childArmature.resetState();
    }
  };
  gdjs.sk.Slot.prototype.getZ = function () {
    return this.z;
  };
  gdjs.sk.Slot.prototype.setZ = function (z) {
    this.z = z;
    if (
      this.shared.type === gdjs.sk.SLOT_IMAGE ||
      this.shared.type === gdjs.sk.SLOT_MESH
    ) {
      this.renderer.setZ(z);
    }
  };
  gdjs.sk.Slot.prototype.getColor = function () {
    if (!this.armature.parentSlot) {
      return [this.r, this.g, this.b];
    }
    const armatureColor = this.armature.parentSlot.getColor();
    return [
      (this.r * armatureColor[0]) / 255,
      (this.g * armatureColor[1]) / 255,
      (this.b * armatureColor[2]) / 255,
    ];
  };
  gdjs.sk.Slot.prototype.setColor = function (r, g, b) {
    if (this.r !== r || this.g !== g || this.b !== b) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.updateRendererColor();
    }
  };
  gdjs.sk.Slot.prototype.updateRendererColor = function () {
    if (
      this.shared.type === gdjs.sk.SLOT_IMAGE ||
      this.shared.type === gdjs.sk.SLOT_MESH
    ) {
      this.renderer.setColor(this.getColor());
    } else {
      if (this.shared.type === gdjs.sk.SLOT_ARMATURE && this.childArmature) {
        for (let i = 0; i < this.childArmature.slots.length; i++) {
          this.childArmature.slots[i].updateRendererColor();
        }
      }
    }
  };
  gdjs.sk.Slot.prototype.getAlpha = function () {
    if (!this.armature.parentSlot) {
      return this.alpha;
    }
    const armatureAlpha = this.armature.parentSlot.getAlpha();
    return this.alpha * armatureAlpha;
  };
  gdjs.sk.Slot.prototype.setAlpha = function (alpha) {
    if (this.alpha !== alpha) {
      this.alpha = alpha;
      this.updateRendererAlpha();
    }
  };
  gdjs.sk.Slot.prototype.updateRendererAlpha = function () {
    if (
      this.shared.type === gdjs.sk.SLOT_IMAGE ||
      this.shared.type === gdjs.sk.SLOT_MESH
    ) {
      this.renderer.setAlpha(this.getAlpha());
    } else {
      if (this.shared.type === gdjs.sk.SLOT_ARMATURE && this.childArmature) {
        for (let i = 0; i < this.childArmature.slots.length; i++) {
          this.childArmature.slots[i].updateRendererAlpha();
        }
      }
    }
  };
  gdjs.sk.Slot.prototype.getVisible = function () {
    if (!this.armature.parentSlot) {
      return this.visible;
    }
    return this.visible && this.armature.parentSlot.getVisible();
  };
  gdjs.sk.Slot.prototype.setVisible = function (visible) {
    if (this.visible !== visible) {
      this.visible = visible;
      this.updateRendererVisible();
    }
  };
  gdjs.sk.Slot.prototype.updateRendererVisible = function () {
    if (
      this.shared.type === gdjs.sk.SLOT_IMAGE ||
      this.shared.type === gdjs.sk.SLOT_MESH
    ) {
      this.renderer.setVisible(this.getVisible());
    } else {
      if (this.shared.type === gdjs.sk.SLOT_ARMATURE && this.childArmature) {
        for (let i = 0; i < this.childArmature.slots.length; i++) {
          this.childArmature.slots[i].updateRendererVisible();
        }
      }
    }
  };

  // Mesh only
  gdjs.sk.Slot.prototype.setVertices = function (vertices, updateList) {
    const verts = [];
    for (let i = 0; i < updateList.length; i++) {
      this.vertices[updateList[i]] = [
        vertices[i][0] + this.shared.defaultVertices[updateList[i]][0],
        vertices[i][1] + this.shared.defaultVertices[updateList[i]][1],
      ];
      verts.push(this.vertices[updateList[i]]);
    }
    this.renderer.setVertices(verts, updateList);
  };

  // Mesh only
  gdjs.sk.Slot.prototype.updateSkinning = function () {
    const verts = [];
    const updateList = [];
    const boneMatrices = [];
    const inverseWorldMatrix = this.worldMatrix.inverse();
    for (let i = 0; i < this.skinBones.length; i++) {
      const localBoneMatrix = inverseWorldMatrix.mul(
        this.skinBones[i].worldMatrix
      );
      boneMatrices.push(
        localBoneMatrix.mul(this.shared.skinBonesMatricesInverses[i])
      );
    }
    for (let i = 0; i < this.shared.vertexWeights.length; i++) {
      let vx = 0.0;
      let vy = 0.0;
      for (let j = 0; j < this.shared.vertexWeights[i].length; j++) {
        const v = boneMatrices[this.shared.vertexBones[i][j]].mulVec(
          this.vertices[i]
        );
        vx += this.shared.vertexWeights[i][j] * v[0];
        vy += this.shared.vertexWeights[i][j] * v[1];
      }
      verts.push([vx, vy]);
      updateList.push(i);
    }
    this.renderer.setVertices(verts, updateList);
  };
  gdjs.sk.Slot.prototype.getPolygons = function () {
    if (this.shared.type === gdjs.sk.SLOT_POLYGON) {
      const worldPolygons = [];
      for (let i = 0; i < this.shared.polygons.length; i++) {
        worldPolygons.push(this.transformPolygon(this.shared.polygons[i]));
      }
      return worldPolygons;
    }
    return [this.transformPolygon(this.shared.aabb)];
  };
  gdjs.sk.Slot.prototype.update = function () {
    gdjs.sk.Transform.prototype.update.call(this);
    if (
      this._updateRender &&
      (this.shared.type === gdjs.sk.SLOT_IMAGE ||
        this.shared.type === gdjs.sk.SLOT_MESH)
    ) {
      let transform = gdjs.sk.Transform.decomposeMatrix(this.worldMatrix);
      this.renderer.setTransform(transform);
    }
    if (this._updateRender && this.debugRenderer) {
      let transform = gdjs.sk.Transform.decomposeMatrix(this.worldMatrix);
      this.debugRenderer.setTransform(transform);
    }
    this._updateRender = false;
  };
  gdjs.sk.Slot.prototype.updateTransform = function () {
    if (this._updateMatrix || this._updateWorldMatrix) {
      this._updateRender = true;
    }
    gdjs.sk.Transform.prototype.updateTransform.call(this);
  };
}
