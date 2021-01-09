/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Renderer for a gdjs.RuntimeScene with Cocos2d-JS.
   */
  export class RuntimeSceneCocosRenderer {
    _runtimeScene: gdjs.RuntimeScene;

    // Hide the first frame of the scene (until update is called)
    // to let the scene render method run (including scene events).
    // This can avoid a glitchy first frame where objects are shown before
    // events are run.
    visible: any;
    _cocosScene: any;
    _cocosBgLayer: any;
    convertYPosition: any;
    _profilerText: any;

    constructor(runtimeScene, runtimeGameRenderer) {
      this._runtimeScene = runtimeScene;
      const that = this;
      const eventListeners = this.makeEventListeners();
      const ContainerScene = cc.Scene.extend({
        ctor: function () {
          this._super();
          eventListeners.forEach(function (listener) {
            cc.eventManager.addListener(listener.clone(), 1);
          });
        },
        onEnter: function () {
          this._super();
          this.scheduleUpdate();
          this.visible = false;
        },
        update: function (dt) {
          runtimeGameRenderer.onSceneUpdated(dt * 1000);
          this.visible = true;
        },
      });
      this._cocosScene = new ContainerScene();
      this._cocosBgLayer = new cc.LayerColor(cc.color(32, 32, 32, 255));
      this._cocosScene.addChild(this._cocosBgLayer, 0);
      this.convertYPosition = runtimeGameRenderer.convertYPosition.bind(
        runtimeGameRenderer
      );
      runtimeGameRenderer.getDirectorManager().onSceneLoaded(this._cocosScene);
    }

    onSceneUnloaded() {
      const layerNames = gdjs.staticArray(
        RuntimeSceneCocosRenderer.prototype.onSceneUnloaded
      );
      this._runtimeScene.getAllLayerNames(layerNames);
      for (let i = 0; i < layerNames.length; ++i) {
        this._runtimeScene
          .getLayer(layerNames[i])
          .getRenderer()
          .onSceneUnloaded();
      }
      this._runtimeScene
        .getGame()
        .getRenderer()
        .getDirectorManager()
        .onSceneUnloaded(this._cocosScene);
    }

    onGameResolutionResized() {}

    // Nothing to do here.
    /**
     * Render the scene
     */
    render() {
      const intColor = this._runtimeScene.getBackgroundColor();
      const r = (intColor >> 16) & 255;
      const g = (intColor >> 8) & 255;
      const b = intColor & 255;
      this._cocosBgLayer.setColor(cc.color(r, g, b));
      const layerNames = gdjs.staticArray(
        RuntimeSceneCocosRenderer.prototype.onSceneUnloaded
      );
      this._runtimeScene.getAllLayerNames(layerNames);
      for (let i = 0; i < layerNames.length; ++i) {
        this._runtimeScene.getLayer(layerNames[i]).getRenderer().render();
      }
    }

    //this._renderProfileText(); //Uncomment to display profiling times
    _renderProfileText() {
      if (!this._runtimeScene.getProfiler()) {
        return;
      }
      if (!this._profilerText) {
        this._profilerText = new cc.LabelTTF(' ', 'Arial', 20);
        this._profilerText.setAnchorPoint(cc.p(0, -1.2));
        this._cocosScene.addChild(this._profilerText, 100);
      }
      const average = this._runtimeScene
        .getProfiler()
        .getFramesAverageMeasures();
      const outputs = [];
      gdjs.Profiler.getProfilerSectionTexts('All', average, outputs);
      this._profilerText.setString(outputs.join('\n'));
    }

    makeEventListeners() {
      const that = this;
      return [
        cc.EventListener.create({
          event: cc.EventListener.MOUSE,
          onMouseMove: function (event) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onMouseMove(
                event.getLocationX(),
                that.convertYPosition(event.getLocationY())
              );
          },
          onMouseDown: function (event) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onMouseButtonPressed(
                event.getButton() === cc.EventMouse.BUTTON_RIGHT
                  ? gdjs.InputManager.MOUSE_RIGHT_BUTTON
                  : event.getButton() === cc.EventMouse.BUTTON_MIDDLE
                  ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON
                  : gdjs.InputManager.MOUSE_LEFT_BUTTON
              );
          },
          onMouseUp: function (event) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onMouseButtonReleased(
                event.getButton() === cc.EventMouse.BUTTON_RIGHT
                  ? gdjs.InputManager.MOUSE_RIGHT_BUTTON
                  : event.getButton() === cc.EventMouse.BUTTON_MIDDLE
                  ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON
                  : gdjs.InputManager.MOUSE_LEFT_BUTTON
              );
          },
          onMouseScroll: function (event) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onMouseWheel(event.getScrollY());
          },
        }),
        cc.EventListener.create({
          event: cc.EventListener.KEYBOARD,
          onKeyPressed: function (keyCode) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onKeyPressed(keyCode);
          },
          onKeyReleased: function (keyCode) {
            that._runtimeScene
              .getGame()
              .getInputManager()
              .onKeyReleased(keyCode);
          },
        }),
        cc.EventListener.create({
          event: cc.EventListener.TOUCH_ALL_AT_ONCE,
          onTouchesBegan: function (touches) {
            for (let i = 0; i < touches.length; ++i) {
              const touch = touches[i];
              that._runtimeScene
                .getGame()
                .getInputManager()
                .onTouchStart(
                  touch.getID(),
                  touch.getLocationX(),
                  that.convertYPosition(touch.getLocationY())
                );
            }
            return true;
          },
          onTouchesMoved: function (touches, event) {
            for (let i = 0; i < touches.length; ++i) {
              const touch = touches[i];
              that._runtimeScene
                .getGame()
                .getInputManager()
                .onTouchMove(
                  touch.getID(),
                  touch.getLocationX(),
                  that.convertYPosition(touch.getLocationY())
                );
            }
          },
          onTouchesEnded: function (touches, event) {
            for (let i = 0; i < touches.length; ++i) {
              const touch = touches[i];
              that._runtimeScene
                .getGame()
                .getInputManager()
                .onTouchEnd(
                  touch.getID(),
                  touch.getLocationX(),
                  that.convertYPosition(touch.getLocationY())
                );
            }
          },
        }),
      ];
    }

    renderDebugDraw() {}

    // Not implemented
    hideCursor(): void {}

    //TODO
    showCursor(): void {}

    //TODO
    getCocosScene() {
      return this._cocosScene;
    }

    setLayerIndex(layer: gdjs.Layer, index: float): void {}
  }

  // Not implemented
  gdjs.RuntimeSceneRenderer = gdjs.RuntimeSceneCocosRenderer;

  //Register the class to let the engine use it.
}
