gdjs.LayerCocosRenderer = function(layer, runtimeSceneRenderer)
{
    console.log("new LayerCocosRenderer");
    var HelloWorldLayer = cc.Layer.extend({
        sprite:null,
        ctor:function () {
            this._super();

            var size = cc.winSize;


            var helloLabel = new cc.LabelTTF("Hello World!", "Arial", 38);
            // position the label on the center of the screen
            helloLabel.x = 178;
            helloLabel.y = size.height / 2 + 200;
            // add the label as a child to this layer
            this.addChild(helloLabel, 5);

            return true;
        }
    });

    this._layer = new HelloWorldLayer();
    this.convertYPosition = runtimeSceneRenderer.convertYPosition;
    runtimeSceneRenderer.getCocosScene().addChild(this._layer);
}

gdjs.LayerRenderer = gdjs.LayerCocosRenderer; //Register the class to let the engine use it.

gdjs.LayerCocosRenderer.prototype.updatePosition = function() {
	var angle = -this._layer.getCameraRotation();
    var zoomFactor = this._layer.getCameraZoom();

	this._layer.setRotation(angle);
	this._layer.setScale(zoomFactor, zoomFactor);

	var centerX = (this._layer.getCameraX()*zoomFactor)*Math.cos(angle)
        - (this._layer.getCameraY()*zoomFactor)*Math.sin(angle);
	var centerY = (this._layer.getCameraX()*zoomFactor)*Math.sin(angle)
        + (this._layer.getCameraY()*zoomFactor)*Math.cos(angle);

	this._layer.setPositionX(this._layer.getWidth()/2-centerX);
	this._layer.setPositionY(this._convertYPosition(this._layer.getHeight()/2-centerY));
};

gdjs.LayerCocosRenderer.prototype.updateVisibility = function(visible) {
    this._layer.setVisible(visible);
}

gdjs.LayerCocosRenderer.prototype.addRendererObject = function(child, zOrder) {
    this._layer.addChild(child, zOrder);
};

gdjs.LayerCocosRenderer.prototype.changeRendererObjectZOrder = function(child, newZOrder) {
    child.setLocalZOrder(newZOrder);
};

gdjs.LayerCocosRenderer.prototype.removeRendererObject = function(child) {
    this._layer.removeChild(child);
};

gdjs.LayerCocosRenderer.prototype.getCocosLayer = function() {
    return this._layer;
};
