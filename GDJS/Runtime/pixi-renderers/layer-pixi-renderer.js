gdjs.LayerPixiRenderer = function(layer, runtimeSceneRenderer)
{
    this._pixiContainer = new PIXI.Container();
    this._layer = layer;
    runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);
}

gdjs.LayerRenderer = gdjs.LayerPixiRenderer; //Register the class to let the engine use it.

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position, zoom or rotation of the camera.
 * @private
 */
gdjs.LayerPixiRenderer.prototype.updatePosition = function() {
	var angle = -gdjs.toRad(this._layer.getCameraRotation());
    var zoomFactor = this._layer.getCameraZoom();

	this._pixiContainer.rotation = angle;
	this._pixiContainer.scale.x = zoomFactor;
	this._pixiContainer.scale.y = zoomFactor;

	var centerX = (this._layer.getCameraX()*zoomFactor)*Math.cos(angle)
        - (this._layer.getCameraY()*zoomFactor)*Math.sin(angle);
	var centerY = (this._layer.getCameraX()*zoomFactor)*Math.sin(angle)
        + (this._layer.getCameraY()*zoomFactor)*Math.cos(angle);

	this._pixiContainer.position.x = -centerX;
	this._pixiContainer.position.y = -centerY;
	this._pixiContainer.position.x += this._layer.getWidth()/2;
	this._pixiContainer.position.y += this._layer.getHeight()/2;
};

gdjs.LayerPixiRenderer.prototype.updateVisibility = function(visible) {
    this._pixiContainer.visible = !!visible;
}

/**
 * Add a child to the pixi container associated to the layer.
 * All objects which are on this layer must be children of this container.
 *
 * @method addRendererObject
 * @param child The child (PIXI object) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.addRendererObject = function(child, zOrder) {
	child.zOrder = zOrder; //Extend the pixi object with a z order.

	for( var i = 0, len = this._pixiContainer.children.length; i < len;++i) {
		if ( this._pixiContainer.children[i].zOrder >= zOrder ) { //TODO : Dichotomic search
			this._pixiContainer.addChildAt(child, i);
			return;
		}
	}
	this._pixiContainer.addChild(child);
};

/**
 * Change the z order of a child associated to an object.
 *
 * @method changeRendererObjectZOrder
 * @param child The child (PIXI object) to be modified.
 * @param newZOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.changeRendererObjectZOrder = function(child, newZOrder) {
	this._pixiContainer.removeChild(child);
	this.addRendererObject(child, newZOrder);
};

/**
 * Remove a child from the internal pixi container.
 * Should be called when an object is deleted or removed from the layer.
 *
 * @method removeRendererObject
 * @param child The child (PIXI object) to be removed.
 */
gdjs.LayerPixiRenderer.prototype.removeRendererObject = function(child) {
	this._pixiContainer.removeChild(child);
};
