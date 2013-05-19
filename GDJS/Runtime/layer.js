
/**
 * Represents a layer used to display objects.<br>
 * The layer connects its Pixi container to the Pixi stage during its construction,
 * but then its objects responsibility to connect themselves to the layer's container
 * ( See getPIXIContainer method ).
 * 
 * TODO : Viewports and support for multiple cameras
 *
 * @class layer
 * @constructor
 */
gdjs.layer = function(name, runtimeScene)
{
    var that = {};
    var my = {};
    
    my.name = name;
    my.cameraX = 0;
    my.cameraY = 0;
    my.cameraRotation = 0;
    my.hidden = false;
    my.pixiStage = runtimeScene.getPIXIStage();
    my.pixiRenderer = runtimeScene.getPIXIRenderer();
    my.pixiContainer = new PIXI.DisplayObjectContainer();
    
    my.pixiStage.addChild(my.pixiContainer);
    
    /**
     * Update the position of the PIXI container. To be called after each change
     * made to position or rotation of the camera.
     * @private
     */
    my.updatePixiContainerPosition = function() {
        var angle = gdjs.toRad(my.cameraRotation);
        my.pixiContainer.rotation = angle;
        
        var centerX = my.pixiRenderer.width/2*Math.cos(angle)-my.pixiRenderer.height/2*Math.sin(angle);
        var centerY = my.pixiRenderer.width/2*Math.sin(angle)+my.pixiRenderer.height/2*Math.cos(angle);
        
        my.pixiContainer.position.x = -my.cameraX+my.pixiRenderer.width/2-centerX;
        my.pixiContainer.position.y = -my.cameraY+my.pixiRenderer.height/2-centerY;
    }

    /**
     * Get the name of the layer
     * @method getName
     * @return {String} The name of the layer
     */
    that.getName = function() {
        return my.name;
    }
    
    /**
     * Get the pixi container associated to the layer.<br>
     * All objects which are on this layer must be children of this container.
     * @method getPIXIContainer
     * @return The pixi container of the layer
     */
    that.getPIXIContainer = function() {
        return my.pixiContainer;
    }
    
    /**
     * Change the camera X position.<br>
     * The camera position refers to the position of top left point of the rendered view,
     * expressed in world coordinates.
     *
     * @method getCameraX
     * @return The x position of the camera
     */
    that.getCameraX = function(cameraId) {
        return my.cameraX;
    }
    
    /**
     * Change the camera Y position.<br>
     * The camera position refers to the position of top left point of the rendered view,
     * expressed in world coordinates.
     *
     * @method getCameraY
     * @return The y position of the camera
     */
    that.getCameraY = function(cameraId) {
        return my.cameraY;
    }
    
    /**
     * Set the camera X position.<br>
     * The camera position refers to the position of top left point of the rendered view,
     * expressed in world coordinates.
     *
     * @method setCameraX
     * @param x {Number} The new x position
     */
    that.setCameraX = function(x, cameraId) {
        my.cameraX = x;
        my.updatePixiContainerPosition();
    }
    
    /**
     * Set the camera Y position.<br>
     * The camera position refers to the position of top left point of the rendered view,
     * expressed in world coordinates.
     *
     * @method setCameraY
     * @param y {Number} The new y position
     */
    that.setCameraY = function(y, cameraId) {
        my.cameraY = y;
        my.updatePixiContainerPosition();
    }
    
    that.getCameraWidth = function(cameraId) {
        return my.pixiRenderer.width;
    }
    
    that.getCameraHeight = function(cameraId) {
        return my.pixiRenderer.height;
    }
    
    that.show = function(enable) {
        my.hidden = !enable;
        my.pixiContainer.visible = !!enable;
    }
    
    that.isVisible = function() {
        return !my.hidden;
    }
    
    that.setZoom = function(newZoom, cameraId) {
        my.pixiContainer.scale.x = newZoom;
        my.pixiContainer.scale.y = newZoom;
    }
    
    that.getZoom = function(cameraId) {
        return my.pixiContainer.scale.x;
    }
    
    /**
     * Get the rotation of the camera, expressed in degrees.<br>
     *
     * @method setCameraRotation
     * @param y {Number} The new r
     */
    that.getCameraRotation = function(cameraId) {
        return my.cameraRotation;
    }
    
    /**
     * Set the rotation of the camera, expressed in degrees.<br>
     * The rotation is made around the camera center.
     *
     * @method setCameraRotation
     * @param rotation {Number} The new rotation, in degrees.
     */
    that.setCameraRotation = function(rotation, cameraId) {
        my.cameraRotation = rotation;
        my.updatePixiContainerPosition();
    }
    
    return that;
}