namespace gdjs {
  const logger = new gdjs.Logger('Scene stack');

  /**
   * Hold the stack of scenes ({@link gdjs.RuntimeScene}) being played.
   */
  export class SceneStack {
    _runtimeGame: gdjs.RuntimeGame;
    _stack: gdjs.RuntimeScene[] = [];
    _wasFirstSceneLoaded: boolean = false;
    _isNextLayoutLoading: boolean = false;

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
    onGameResolutionResized(): void {
      for (let i = 0; i < this._stack.length; ++i) {
        this._stack[i].onGameResolutionResized();
      }
    }

    step(elapsedTime: float): boolean {
      if (this._isNextLayoutLoading || this._stack.length === 0) {
        return false;
      }
      const currentScene = this._stack[this._stack.length - 1];
      if (currentScene.renderAndStep(elapsedTime)) {
        const request = currentScene.getRequestedChange();

        //Something special was requested by the current scene.
        if (request === gdjs.SceneChangeRequest.STOP_GAME) {
          this._runtimeGame.getRenderer().stopGame();
          return true;
        } else if (request === gdjs.SceneChangeRequest.POP_SCENE) {
          this.pop();
        } else if (request === gdjs.SceneChangeRequest.PUSH_SCENE) {
          this.push(currentScene.getRequestedScene());
        } else if (request === gdjs.SceneChangeRequest.REPLACE_SCENE) {
          this.replace(currentScene.getRequestedScene());
        } else if (request === gdjs.SceneChangeRequest.CLEAR_SCENES) {
          this.replace(currentScene.getRequestedScene(), true);
        } else {
          logger.error('Unrecognized change in scene stack: ' + request);
          return false;
        }
      }
      return true;
    }

    renderWithoutStep(): boolean {
      if (this._stack.length === 0) {
        return false;
      }
      const currentScene = this._stack[this._stack.length - 1];
      currentScene.render();
      return true;
    }

    pop(): gdjs.RuntimeScene | null {
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
    push(
      newSceneName: string,
      externalLayoutName?: string
    ): gdjs.RuntimeScene | null {
      // Tell the scene it's being paused
      const currentScene = this._stack[this._stack.length - 1];
      if (currentScene) {
        currentScene.onPause();
      }

      // Avoid a risk of displaying an intermediate loading screen
      // during 1 frame.
      if (this._runtimeGame.areSceneAssetsReady(newSceneName)) {
        return this._loadNewScene(newSceneName, externalLayoutName);
      }

      this._isNextLayoutLoading = true;
      this._runtimeGame.loadSceneAssets(newSceneName).then(() => {
        this._loadNewScene(newSceneName);
        this._isNextLayoutLoading = false;
      });
      return null;
    }

    private _loadNewScene(
      newSceneName: string,
      externalLayoutName?: string
    ): gdjs.RuntimeScene {
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
    replace(newSceneName: string, clear?: boolean): gdjs.RuntimeScene | null {
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
    getCurrentScene(): gdjs.RuntimeScene | null {
      if (this._stack.length === 0) {
        return null;
      }
      return this._stack[this._stack.length - 1];
    }

    /**
     * Return true if a scene was loaded, false otherwise (i.e: game not yet started).
     */
    wasFirstSceneLoaded(): boolean {
      return this._wasFirstSceneLoaded;
    }
  }
}
