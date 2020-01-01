/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Renderer for a gdjs.RuntimeScene with Cocos2d-JS.
 * @memberof gdjs
 * @class RuntimeSceneCocosRenderer
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

            // Hide the first frame of the scene (until update is called)
            // to let the scene render method run (including scene events).
            // This can avoid a glitchy first frame where objects are shown before
            // events are run.
            this.visible = false;
        },
        update: function(dt) {
            runtimeGameRenderer.onSceneUpdated(dt*1000);
            this.visible = true;
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

gdjs.RuntimeSceneCocosRenderer.prototype.onGameResolutionResized = function() {
    // Nothing to do here.
};

/**
 * Render the scene
 */
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
    if (!this._runtimeScene.getProfiler()) return;

    if (!this._profilerText) {
        this._profilerText = new cc.LabelTTF(" ", "Arial", 20);
        this._profilerText.setAnchorPoint(cc.p(0, -1.2));
        this._cocosScene.addChild(this._profilerText, 100);
    }

    var average = this._runtimeScene.getProfiler().getFramesAverageMeasures();
    var outputs = [];
    gdjs.Profiler.getProfilerSectionTexts("All", average, outputs);

    this._profilerText.setString(outputs.join("\n"));
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
                event.getButton() === cc.EventMouse.BUTTON_RIGHT ? gdjs.InputManager.MOUSE_RIGHT_BUTTON :
                (event.getButton() === cc.EventMouse.BUTTON_MIDDLE ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON :
                gdjs.InputManager.MOUSE_LEFT_BUTTON));
        },
        onMouseUp: function(event) {
            that._runtimeScene.getGame().getInputManager().onMouseButtonReleased(
                event.getButton() === cc.EventMouse.BUTTON_RIGHT ? gdjs.InputManager.MOUSE_RIGHT_BUTTON :
                (event.getButton() === cc.EventMouse.BUTTON_MIDDLE ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON :
                gdjs.InputManager.MOUSE_LEFT_BUTTON));
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

gdjs.RuntimeSceneCocosRenderer.prototype.renderDebugDraw = function() {
    // Not implemented
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
