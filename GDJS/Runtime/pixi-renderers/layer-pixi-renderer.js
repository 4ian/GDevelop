gdjs.LayerPixiRenderer = function(layer, runtimeSceneRenderer)
{
    this._pixiContainer = new PIXI.Container();
    this._filters = {};
    this._layer = layer;
    runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);

    this._addFilters();
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

    var cosValue = Math.cos(angle);
    var sinValue = Math.sin(angle);
	var centerX = (this._layer.getCameraX()*zoomFactor)*cosValue
        - (this._layer.getCameraY()*zoomFactor)*sinValue;
	var centerY = (this._layer.getCameraX()*zoomFactor)*sinValue
        + (this._layer.getCameraY()*zoomFactor)*cosValue;

	this._pixiContainer.position.x = -centerX;
	this._pixiContainer.position.y = -centerY;
	this._pixiContainer.position.x += this._layer.getWidth()/2;
	this._pixiContainer.position.y += this._layer.getHeight()/2;
};

gdjs.LayerPixiRenderer.prototype.updateVisibility = function(visible) {
    this._pixiContainer.visible = !!visible;
}

gdjs.LayerPixiRenderer.prototype._addFilters = function() {
    var effects = this._layer.getEffects();
    if (effects.length === 0) {
        return;
    } else if (effects.length > 1) {
        console.log('Only a single effect by Layer is supported for now by the Pixi renderer');
    }

    var filter = gdjs.PixiFiltersTools.getFilter(effects[0].effectName);
    if (!filter) {
        console.log('Filter \"' + effects[0].name + '\" not found');
        return;
    }

    var theFilter = {
        filter: filter.makeFilter(),
        updateParameter: filter.updateParameter
    };

    this._pixiContainer.filters = [theFilter.filter];
    this._filters = {};
    this._filters[effects[0].name] = theFilter;
}

/**
 * Add a child to the pixi container associated to the layer.
 * All objects which are on this layer must be children of this container.
 *
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
 * @param child The child (PIXI object) to be removed.
 */
gdjs.LayerPixiRenderer.prototype.removeRendererObject = function(child) {
	this._pixiContainer.removeChild(child);
};

gdjs.LayerPixiRenderer.prototype.setEffectParameter = function (name, parameterName, value) {
    if (!this._filters.hasOwnProperty(name)) return;

    var theFilter = this._filters[name];
    theFilter.updateParameter(theFilter.filter, parameterName, value);
};
