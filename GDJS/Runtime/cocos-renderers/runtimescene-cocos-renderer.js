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
        update: function(dt) {
            runtimeGameRenderer.onSceneUpdated(dt*1000);
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
    var layerNames = gdjs.staticArray(gdjs.RuntimeSceneCocosRenderer.prototype.onSceneUnloaded);
    this._runtimeScene.getAllLayerNames(layerNames);
    for(var i = 0;i < layerNames.length;++i) {
        this._runtimeScene.getLayer(layerNames[i]).getRenderer().onSceneUnloaded();
    }

    this._runtimeScene.getGame().getRenderer().getDirectorManager().onSceneUnloaded(this._cocosScene);
};

gdjs.RuntimeSceneCocosRenderer.prototype.onCanvasResized = function() {
    // Nothing to do here.
};

gdjs.RuntimeSceneCocosRenderer.prototype.render = function() {
    var intColor = this._runtimeScene.getBackgroundColor();
    var r = (intColor >> 16) & 255;
    var g = (intColor >> 8) & 255;
    var b = intColor & 255;

    this._cocosBgLayer.setColor(cc.color(r, g, b));

    var layerNames = gdjs.staticArray(gdjs.RuntimeSceneCocosRenderer.prototype.onSceneUnloaded);
    this._runtimeScene.getAllLayerNames(layerNames);
    for(var i = 0;i < layerNames.length;++i) {
        this._runtimeScene.getLayer(layerNames[i]).getRenderer().render();
    }

    //this._renderProfileText(); //Uncomment to display profiling times
};

gdjs.RuntimeSceneCocosRenderer.prototype._renderProfileText = function() {
    if (!this._profilerText) {
        this._profilerText = new cc.LabelTTF(" ", "Arial", 30);
        this._profilerText.setAnchorPoint(cc.p(0, -1.2));
        this._cocosScene.addChild(this._profilerText, 100);
    }

    var average = this._runtimeScene._profiler.getAverage();
    var total = Object.keys(average).reduce(function(sum, key) {
        return sum + (key !== 'total' ? average[key] : 0);
    }, 0);

    var text = '';
    for (var p in average) {
        text += p + ': ' + average[p].toFixed(2) +'ms' + '('+(average[p]/total*100).toFixed(1)+'%)\n';
    }

    this._profilerText.setString(text);
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
        },
        onMouseScroll: function(event) {
            that._runtimeScene.getGame().getInputManager().onMouseWheel(
                event.getScrollY());
        },
    }), cc.EventListener.create({
	    event: cc.EventListener.KEYBOARD,
	    onKeyPressed: function(keyCode){
		    that._runtimeScene.getGame().getInputManager().onKeyPressed(keyCode);
	    },
	    onKeyReleased: function(keyCode){
		    that._runtimeScene.getGame().getInputManager().onKeyReleased(keyCode);
	    }
    }), cc.EventListener.create({
	    event: cc.EventListener.TOUCH_ALL_AT_ONCE,
	    onTouchesBegan: function(touches){
            for (var i = 0;i<touches.length;++i) {
                var touch = touches[i];

                that._runtimeScene.getGame().getInputManager().onTouchStart(
                    touch.getID(),
                    touch.getLocationX(),
                    that.convertYPosition(touch.getLocationY())
                );
            }

            return true;
	    },
	    onTouchesMoved: function(touches, event){
            for (var i = 0;i<touches.length;++i) {
                var touch = touches[i];

                that._runtimeScene.getGame().getInputManager().onTouchMove(
                    touch.getID(),
                    touch.getLocationX(),
                    that.convertYPosition(touch.getLocationY())
                );
            }
	    },
	    onTouchesEnded: function(touches, event){
            for (var i = 0;i<touches.length;++i) {
                var touch = touches[i];

                that._runtimeScene.getGame().getInputManager().onTouchEnd(
                    touch.getID(),
                    touch.getLocationX(),
                    that.convertYPosition(touch.getLocationY())
                );
            }
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
