namespace gdjs {
  /**
   * Hold the stack of scenes (gdjs.RuntimeScene) being played.
   *
   * @memberof gdjs
   * @class SceneStack
   */
  export class SceneStack {
    _runtimeGame: gdjs.RuntimeGame;
    _stack: gdjs.RuntimeScene[] = [];
    _wasFirstSceneLoaded: boolean = false;

    /**
     * @param runtimeGame The runtime game that is using the scene stack
     */
    constructor(runtimeGame: gdjs.RuntimeGame) {
      if (!runtimeGame) {
        throw 'SceneStack must be constructed with a gdjs.RuntimeGame.';
      }
      this._runtimeGame = runtimeGame;
    }

    /**
     * Called by the RuntimeGame when the game resolution is changed.
     * Useful to notify scene and layers that resolution is changed, as they
     * might be caching it.
     */
    onGameResolutionResized() {
      for (let i = 0; i < this._stack.length; ++i) {
        this._stack[i].onGameResolutionResized();
      }
    }

    step(elapsedTime) {
      if (this._stack.length === 0) {
        return false;
      }
      const currentScene = this._stack[this._stack.length - 1];
      if (currentScene.renderAndStep(elapsedTime)) {
        const request = currentScene.getRequestedChange();

        //Something special was requested by the current scene.
        if (request === gdjs.RuntimeScene.STOP_GAME) {
          this._runtimeGame.getRenderer().stopGame();
          return true;
        } else {
          if (request === gdjs.RuntimeScene.POP_SCENE) {
            this.pop();
          } else {
            if (request === gdjs.RuntimeScene.PUSH_SCENE) {
              this.push(currentScene.getRequestedScene());
            } else {
              if (request === gdjs.RuntimeScene.REPLACE_SCENE) {
                this.replace(currentScene.getRequestedScene());
              } else {
                if (request === gdjs.RuntimeScene.CLEAR_SCENES) {
                  this.replace(currentScene.getRequestedScene(), true);
                } else {
                  console.error('Unrecognized change in scene stack.');
                  return false;
                }
              }
            }
          }
        }
      }
      return true;
    }

    renderWithoutStep() {
      if (this._stack.length === 0) {
        return false;
      }
      const currentScene = this._stack[this._stack.length - 1];
      currentScene.render();
      return true;
    }

    pop() {
      if (this._stack.length <= 1) {
        return null;
      }

      // Unload the current scene
      const scene = this._stack.pop();
      if (!scene) {
        return null;
      }
      scene.unloadScene();

      // Tell the new current scene it's being resumed
      const currentScene = this._stack[this._stack.length - 1];
      if (currentScene) {
        currentScene.onResume();
      }
      return scene;
    }

    /**
     * Pause the scene currently being played and start the new scene that is specified.
     * If `externalLayoutName` is set, also instantiate the objects from this external layout.
     */
    push(newSceneName: string, externalLayoutName?: string) {
      // Tell the scene it's being paused
      const currentScene = this._stack[this._stack.length - 1];
      if (currentScene) {
        currentScene.onPause();
      }

      // Load the new one
      const newScene = new gdjs.RuntimeScene(this._runtimeGame);
      newScene.loadFromScene(this._runtimeGame.getSceneData(newSceneName));
      this._wasFirstSceneLoaded = true;

      // Optionally create the objects from an external layout.
      if (externalLayoutName) {
        const externalLayoutData = this._runtimeGame.getExternalLayoutData(
          externalLayoutName
        );
        if (externalLayoutData) {
          newScene.createObjectsFrom(
            externalLayoutData.instances,
            0,
            0,
            /*trackByPersistentUuid=*/
            true
          );
        }
      }
      this._stack.push(newScene);
      return newScene;
    }

    /**
     * Start the specified scene, replacing the one currently being played.
     * If `clear` is set to true, all running scenes are also removed from the stack of scenes.
     */
    replace(newSceneName: string, clear?: boolean) {
      if (!!clear) {
        // Unload all the scenes
        while (this._stack.length !== 0) {
          let scene = this._stack.pop();
          if (scene) {
            scene.unloadScene();
          }
        }
      } else {
        // Unload the current scene
        if (this._stack.length !== 0) {
          let scene = this._stack.pop();
          if (scene) {
            scene.unloadScene();
          }
        }
      }
      return this.push(newSceneName);
    }

    /**
     * Return the current gdjs.RuntimeScene being played, or null if none is run.
     */
    getCurrentScene() {
      if (this._stack.length === 0) {
        return null;
      }
      return this._stack[this._stack.length - 1];
    }

    /**
     * Return true if a scene was loaded, false otherwise (i.e: game not yet started).
     */
    wasFirstSceneLoaded() {
      return this._wasFirstSceneLoaded;
    }
  }
}
