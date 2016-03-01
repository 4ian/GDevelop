/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

gdjs.RuntimeSceneCocosRenderer = function(runtimeScene, runtimeGameRenderer)
{
    this._runtimeScene = runtimeScene;

    var that = this;
    var eventListeners = this.makeEventListeners();
    var ContainerScene = cc.Scene.extend({
        ctor: function() {
            this._super();
            eventListeners.forEach(function(listener) {
                cc.eventManager.addListener(listener.clone(), 1);
            });
        },
        onEnter: function() {
            this._super();
            this.scheduleUpdate();
        },
        update: function() {
            runtimeGameRenderer.onSceneUpdated();
        }
    });
    this._cocosScene = new ContainerScene();

    this._cocosBgLayer = new cc.LayerColor(cc.color(32, 32, 32, 255));
    this._cocosScene.addChild(this._cocosBgLayer, 0);
    this.convertYPosition = runtimeGameRenderer.convertYPosition.bind(runtimeGameRenderer);

    runtimeGameRenderer.getDirectorManager().onSceneLoaded(this._cocosScene);
}

gdjs.RuntimeSceneRenderer = gdjs.RuntimeSceneCocosRenderer; //Register the class to let the engine use it.

gdjs.RuntimeSceneCocosRenderer.prototype.onSceneUnloaded = function() {
    this._runtimeScene.getGame().getRenderer().getDirectorManager().onSceneUnloaded(this._cocosScene);
};

gdjs.RuntimeSceneCocosRenderer.prototype.onCanvasResized = function() {
    //TODO
};

gdjs.RuntimeSceneCocosRenderer.prototype.render = function() {
    var intColor = this._runtimeScene.getBackgroundColor();
    var r = (intColor >> 16) & 255;
    var g = (intColor >> 8) & 255;
    var b = intColor & 255;

    this._cocosBgLayer.setColor(cc.color(r, g, b));
};

gdjs.RuntimeSceneCocosRenderer.prototype.makeEventListeners = function() {
    var that = this;
    return [cc.EventListener.create({
        event: cc.EventListener.MOUSE,
        onMouseMove: function (event) {
            that._runtimeScene.getGame().getInputManager().onMouseMove(
                event.getLocationX(),
                that.convertYPosition(event.getLocationY())
            );
        },
        onMouseDown: function(event) {
            that._runtimeScene.getGame().getInputManager().onMouseButtonPressed(
                event.getButton() === 0 ? 0 : 1);
        },
        onMouseUp: function(event) {
            that._runtimeScene.getGame().getInputManager().onMouseButtonReleased(
                event.getButton() === 0 ? 0 : 1);
        }
    }), cc.EventListener.create({
	    event: cc.EventListener.KEYBOARD,
	    onKeyPressed:  function(keyCode){
		    that._runtimeScene.getGame().getInputManager().onKeyPressed(keyCode);
	    },
	    onKeyReleased: function(keyCode){
		    that._runtimeScene.getGame().getInputManager().onKeyReleased(keyCode);
	    }
    }), cc.EventListener.create({
	    event: cc.EventListener.TOUCH_ONE_BY_ONE,
	    onTouchBegan:  function(touch){
            that._runtimeScene.getGame().getInputManager().onTouchStart(
                touch.getID(),
                touch.getLocationX(),
                that.convertYPosition(touch.getLocationY())
            );

            return true;
	    },
	    onTouchMoved: function(touch, event){
            that._runtimeScene.getGame().getInputManager().onTouchMove(
                touch.getID(),
                touch.getLocationX(),
                that.convertYPosition(touch.getLocationY())
            );
	    },
	    onTouchEnd: function(touch, event){
            that._runtimeScene.getGame().getInputManager().onTouchMove(
                touch.getID(),
                touch.getLocationX(),
                that.convertYPosition(touch.getLocationY())
            );
	    }
    })];
}

gdjs.RuntimeSceneCocosRenderer.prototype.hideCursor = function() {
    //TODO
}

gdjs.RuntimeSceneCocosRenderer.prototype.showCursor = function() {
    //TODO
}

gdjs.RuntimeSceneCocosRenderer.prototype.getCocosScene = function() {
    return this._cocosScene;
}
