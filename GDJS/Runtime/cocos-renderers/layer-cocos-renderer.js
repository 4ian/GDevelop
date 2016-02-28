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
    var angle = -gdjs.toRad(this._layer.getCameraRotation());
    var zoomFactor = this._layer.getCameraZoom();

	this._cocosLayer.setRotation(this._layer.getCameraRotation());
	this._cocosLayer.setScale(zoomFactor, zoomFactor);

	var centerX = (this._layer.getCameraX()*zoomFactor)*Math.cos(angle)
        - (this._layer.getCameraY()*zoomFactor)*Math.sin(angle);
	var centerY = (this._layer.getCameraX()*zoomFactor)*Math.sin(angle)
        + (this._layer.getCameraY()*zoomFactor)*Math.cos(angle);

	this._cocosLayer.setPositionX(this._layer.getWidth()/2-centerX);
	this._cocosLayer.setPositionY(-this._layer.getHeight()/2+centerY);
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
