
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
function gdjs.SkeletonSlot(armature){
    gdjs.SkeletonTransform.call(this);
    this.name = "";
    this.armature = armature;
    this.type = SLOT_UNDEFINED;
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
