/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

gdjs.LayerCocosRenderer = function(layer, runtimeSceneRenderer)
{
    var CocosLayer = cc.Layer.extend({
        ctor:function () {
            this._super();
            return true;
        }
    });

    this._layer = layer;
    this._cocosLayer = new CocosLayer();
    this.convertYPosition = runtimeSceneRenderer.convertYPosition;
    runtimeSceneRenderer.getCocosScene().addChild(this._cocosLayer);
}

gdjs.LayerRenderer = gdjs.LayerCocosRenderer; //Register the class to let the engine use it.

gdjs.LayerCocosRenderer.prototype.updatePosition = function() {
    var angle = gdjs.toRad(this._layer.getCameraRotation());
    var zoomFactor = this._layer.getCameraZoom();

	this._cocosLayer.setRotation(-this._layer.getCameraRotation());
	this._cocosLayer.setScale(zoomFactor, zoomFactor);

	var centerX = (this._layer.getCameraX()-this._layer.getWidth()/2)*Math.cos(-angle)
        - (this._layer.getCameraY()-this._layer.getHeight()/2)*Math.sin(-angle);
	var centerY = (this._layer.getCameraX()-this._layer.getWidth()/2)*Math.sin(-angle)
        + (this._layer.getCameraY()-this._layer.getHeight()/2)*Math.cos(-angle);

	this._cocosLayer.setPositionX(-centerX);
	this._cocosLayer.setPositionY(+centerY);
};

gdjs.LayerCocosRenderer.prototype.updateVisibility = function(visible) {
    this._cocosLayer.setVisible(visible);
}

gdjs.LayerCocosRenderer.prototype.addRendererObject = function(child, zOrder) {
    this._cocosLayer.addChild(child, zOrder);
};

gdjs.LayerCocosRenderer.prototype.changeRendererObjectZOrder = function(child, newZOrder) {
    child.setLocalZOrder(newZOrder);
};

gdjs.LayerCocosRenderer.prototype.removeRendererObject = function(child) {
    this._cocosLayer.removeChild(child);
};

gdjs.LayerCocosRenderer.prototype.getCocosLayer = function() {
    return this._cocosLayer;
};
