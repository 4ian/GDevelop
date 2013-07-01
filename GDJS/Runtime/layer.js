/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * Represents a layer used to display objects.<br>
 * The layer connects its Pixi container to the Pixi stage during its construction,
 * but then it is objects responsibility to connect themselves to the layer's container
 * ( See addChildToPIXIContainer method ).<br>
 * Layers do not provide direct access to their pixi container as they do some extra work
 * to ensure that z orders remains correct.
 *
 * TODO : Viewports and support for multiple cameras
 *
 * @class layer
 * @namespace gdjs
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
     * Add a child to the pixi container associated to the layer.<br>
     * All objects which are on this layer must be children of this container.<br>
     *
     * @method addChildToPIXIContainer
     * @param child The child ( PIXI object ) to be added.
     * @param zOrder The z order of the associated object.
     */
    that.addChildToPIXIContainer = function(child, zOrder) {
        child.zOrder = zOrder; //Extend the pixi object with a z order.

        for( var i = 0, len = my.pixiContainer.children.length; i < len;++i) {
            if ( my.pixiContainer.children[i].zOrder >= zOrder ) { //TODO : Dichotomic search
                my.pixiContainer.addChildAt(child, i);
                return;
            }
        }
        my.pixiContainer.addChild(child);
    }

    /**
     * Change the z order of a child associated to an object.
     *
     * @method changePIXIContainerChildZOrder
     * @param child The child ( PIXI object ) to be modified.
     * @param newZOrder The z order of the associated object.
     */
    that.changePIXIContainerChildZOrder = function(child, newZOrder) {
        my.pixiContainer.removeChild(child);
        that.addChildToPIXIContainer(child, newZOrder);
    }

    /**
     * Remove a child from the internal pixi container.<br>
     * Should be called when an object is deleted or removed from the layer.
     *
     * @method removePIXIContainerChild
     * @param child The child ( PIXI object ) to be removed.
     */
    that.removePIXIContainerChild = function(child) {
        my.pixiContainer.removeChild(child);
    }

    /**
     * Change the camera X position.<br>
     * The camera position refers to the position of top left point of the rendered view,
     * expressed in world coordinates.
     *
     * @method getCameraX
     * @param cameraId The camera number. Currently ignored.
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
     * @param cameraId The camera number. Currently ignored.
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
     * @param cameraId The camera number. Currently ignored.
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
     * @param cameraId The camera number. Currently ignored.
     */
    that.setCameraY = function(y, cameraId) {
        my.cameraY = y;
        my.updatePixiContainerPosition();
    }

    that.getCameraWidth = function(cameraId) {
        return +my.pixiRenderer.width;
    }

    that.getCameraHeight = function(cameraId) {
        return +my.pixiRenderer.height;
    }

    that.show = function(enable) {
        my.hidden = !enable;
        my.pixiContainer.visible = !!enable;
    }

    /**
     * Check if the layer is visible.<br>
     *
     * @method isVisible
     * @return true if the layer is visible.
     */
    that.isVisible = function() {
        return !my.hidden;
    }

    /**
     * Set the zoom of a camera.<br>
     *
     * @method setZoom
     * @param The new zoom. Must be superior to 0. 1 is the default zoom.
     * @param cameraId The camera number. Currently ignored.
     */
    that.setZoom = function(newZoom, cameraId) {
        my.pixiContainer.scale.x = newZoom;
        my.pixiContainer.scale.y = newZoom;
    }

    /**
     * Get the zoom of a camera,.<br>
     *
     * @method getZoom
     * @param cameraId The camera number. Currently ignored.
     * @return The zoom.
     */
    that.getZoom = function(cameraId) {
        return my.pixiContainer.scale.x;
    }

    /**
     * Get the rotation of the camera, expressed in degrees.<br>
     *
     * @method getCameraRotation
     * @param cameraId The camera number. Currently ignored.
     * @return The rotation, in degrees.
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
     * @param cameraId The camera number. Currently ignored.
     */
    that.setCameraRotation = function(rotation, cameraId) {
        my.cameraRotation = rotation;
        my.updatePixiContainerPosition();
    }
    
    /**
     * Convert a point from the canvas coordinates ( For example, the mouse position ) to the
     * "world" coordinates.
     *
     * @method convertCoords
     * @param x {Number} The x position, in canvas coordinates.
     * @param y {Number} The y position, in canvas coordinates.
     * @param cameraId The camera number. Currently ignored.
     */
    that.convertCoords = function(x,y, cameraId) {
            
        x -= that.getCameraWidth(cameraId)/2;
        y -= that.getCameraHeight(cameraId)/2;
        x /= Math.abs(my.pixiContainer.scale.x);
        y /= Math.abs(my.pixiContainer.scale.y);

        var tmp = x;
        x = Math.cos(my.cameraRotation/180*3.14159)*x - Math.sin(my.cameraRotation/180*3.14159)*y;
        y = Math.sin(my.cameraRotation/180*3.14159)*tmp + Math.cos(my.cameraRotation/180*3.14159)*y;

        return [x+that.getCameraX(cameraId)+that.getCameraWidth(cameraId)/2, 
                y+that.getCameraY(cameraId)+that.getCameraHeight(cameraId)/2];
    }

    return that;
}
