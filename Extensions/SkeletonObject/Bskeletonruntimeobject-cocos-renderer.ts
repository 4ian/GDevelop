/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

namespace gdjs {
  gdjs.sk.CocosDataLoader = function () {
    this.textures = {};
  };
  gdjs.sk.DataLoader = gdjs.sk.CocosDataLoader;
  gdjs.sk.CocosDataLoader.prototype.getData = function (dataName) {
    return cc.loader.getRes('res/' + dataName);
  };

  /**
   * Load the textures from DragonBones data
   */
  gdjs.sk.CocosDataLoader.prototype.loadDragonBones = function (
    runtimeScene: gdjs.RuntimeScene,
    objectData: Object
  ) {
    const jsonManager = runtimeScene.getGame().getJsonManager();
    if (!jsonManager.isJsonLoaded(objectData.textureDataFilename)) {
      console.error(
        'Tried to load DragonBones textures from "' +
          objectData.textureDataFilename +
          '" but this resource is not loaded.'
      );
      return;
    }
    const textureData = jsonManager.getLoadedJson(
      objectData.textureDataFilename
    );
    const texture = runtimeScene
      .getGame()
      .getImageManager()
      .getTexture(objectData.textureName);
    if (!textureData || !texture._textureLoaded) {
      console.error(
        'Tried to load DragonBones textures from "' +
          objectData.textureDataFilename +
          '" resource but the texture or the texture data could not be loaded properly.'
      );
      return;
    }
    for (let i = 0; i < textureData.SubTexture.length; i++) {
      const subTex = textureData.SubTexture[i];
      const frame = new cc.rect(
        subTex.x,
        subTex.y,
        subTex.width,
        subTex.height
      );
      if (subTex.hasOwnProperty('frameWidth')) {
        frame.width = subTex.frameWidth;
      }
      if (subTex.hasOwnProperty('frameHeight')) {
        frame.height = subTex.frameHeight;
      }
      this.textures[subTex.name] = { texture: texture, frame: frame };
    }
  };
  gdjs.sk.ArmatureCocosRenderer = function () {
    this.layer = new cc.Layer();
    this.slotsRenderers = new cc.Layer();
    this.layer.addChild(this.slotsRenderers);
    this.debugRenderers = new cc.Layer();
    this.layer.addChild(this.debugRenderers);
    this._convertYPosition = function (y) {
      return y;
    };
  };
  gdjs.sk.ArmatureRenderer = gdjs.sk.ArmatureCocosRenderer;
  gdjs.sk.ArmatureCocosRenderer.prototype.putInScene = function (
    runtimeObject,
    runtimeScene
  ) {
    const layerRenderer = runtimeScene.getLayer('').getRenderer();
    layerRenderer.addRendererObject(this.layer, runtimeObject.getZOrder());
    this._convertYPosition = layerRenderer.convertYPosition;
  };
  gdjs.sk.ArmatureCocosRenderer.prototype.getRendererObject = function () {
    return this.layer;
  };
  gdjs.sk.ArmatureCocosRenderer.prototype.addRenderer = function (renderer) {
    this.slotsRenderers.addChild(renderer.getRendererObject());
    renderer._convertYPosition = this._convertYPosition;
  };
  gdjs.sk.ArmatureCocosRenderer.prototype.sortRenderers = function () {
    this.slotsRenderers.children.sort(function (a, b) {
      return a.z - b.z;
    });
  };
  gdjs.sk.ArmatureCocosRenderer.prototype.addDebugRenderer = function (
    renderer
  ) {
    this.debugRenderers.addChild(renderer.getRendererObject());
    renderer._convertYPosition = this._convertYPosition;
  };
  gdjs.sk.ArmatureCocosRenderer.prototype.extraInitialization = function (
    parentArmatureRenderer
  ) {
    this._convertYPosition = parentArmatureRenderer._convertYPosition;
  };
  gdjs.sk.SlotCocosRenderer = function () {
    this.renderer = null;
    this._convertYPosition = function (y) {
      return y;
    };
  };
  gdjs.sk.SlotRenderer = gdjs.sk.SlotCocosRenderer;
  gdjs.sk.SlotCocosRenderer.prototype.getRendererObject = function () {
    return this.renderer;
  };
  gdjs.sk.SlotCocosRenderer.prototype.loadAsSprite = function (texture) {
    if (!texture) {
      this.renderer = new cc.Sprite();
    } else {
      this.renderer = new cc.Sprite.createWithTexture(
        texture.texture,
        texture.frame
      );
    }
    this.renderer.z = 0;
  };
  gdjs.sk.SlotCocosRenderer.prototype.loadAsMesh = function (
    texture,
    vertices,
    uvs,
    triangles
  ) {
    // Meshes not supported, load as sprites
    this.loadAsSprite(texture);
  };
  gdjs.sk.SlotCocosRenderer.prototype.getWidth = function () {
    return this.renderer.width;
  };
  gdjs.sk.SlotCocosRenderer.prototype.getHeight = function () {
    return this.renderer.height;
  };
  gdjs.sk.SlotCocosRenderer.prototype.setTransform = function (transform) {
    this.renderer.setPositionX(transform.x);
    this.renderer.setPositionY(this._convertYPosition(transform.y));
    this.renderer.setScaleX(transform.sx);
    this.renderer.setScaleY(transform.sy);
    this.renderer.setRotationX((-transform.skx * 180.0) / Math.PI);
    this.renderer.setRotationY((transform.sky * 180.0) / Math.PI);
  };
  gdjs.sk.SlotCocosRenderer.prototype.setZ = function (z) {
    this.renderer.z = z;
  };
  gdjs.sk.SlotCocosRenderer.prototype.setColor = function (color) {
    this.renderer.setColor(cc.color(color[0], color[1], color[2]));
  };
  gdjs.sk.SlotCocosRenderer.prototype.setAlpha = function (alpha) {
    this.renderer.setOpacity(255 * alpha);
  };
  gdjs.sk.SlotCocosRenderer.prototype.setVisible = function (visible) {
    this.renderer.setVisible(visible);
  };

  // Meshes not supported
  gdjs.sk.SlotCocosRenderer.prototype.setVertices = function (
    vertices,
    updateList
  ) {};
  gdjs.sk.DebugCocosRenderer = function () {
    this.renderer = new cc.DrawNode();
    this._convertYPosition = function (y) {
      return y;
    };
  };
  gdjs.sk.DebugRenderer = gdjs.sk.DebugCocosRenderer;
  gdjs.sk.DebugCocosRenderer.prototype.getRendererObject = function () {
    return this.renderer;
  };
  gdjs.sk.DebugCocosRenderer.prototype.loadVertices = function (
    verts,
    color,
    fill
  ) {
    const fillAlpha = fill ? 100 : 0;
    const fillColor = new cc.Color(color[0], color[1], color[2], fillAlpha);
    const lineColor = new cc.Color(color[0], color[1], color[2], 225);
    for (let i = 0; i < verts.length; i++) {
      const vertices = [];
      for (let i = 0; i < verts.length; i++) {
        vertices.push(cc.p(verts[i][0], -verts[i][1]));
      }
      this.renderer.drawPoly(vertices, fillColor, 3, lineColor);
    }
  };
  gdjs.sk.DebugCocosRenderer.prototype.setTransform = function (transform) {
    this.renderer.setPositionX(transform.x);
    this.renderer.setPositionY(this._convertYPosition(transform.y));
    this.renderer.setScaleX(transform.sx);
    this.renderer.setScaleY(transform.sy);
    this.renderer.setRotationX((-transform.skx * 180.0) / Math.PI);
    this.renderer.setRotationY((transform.sky * 180.0) / Math.PI);
  };
}
