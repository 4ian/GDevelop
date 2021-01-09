/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Encapsulate the Cocos2D director singleton, and makes sure that
   * Cocos scenes that are pushed/popped from it are done according to the
   * director needs (always a scene living, different call to push the 1st scene).
   */
  export class CocosDirectorManager {
    _cocosDirector: any;
    _scenes: any = [];
    _replaceByNextScene: boolean = false;

    /**
     * @param The Cocos2D-JS to use. If not specified, `cc.director` will be used.
     */
    constructor(cocosDirector?: any) {
      if (!cocosDirector) {
        cocosDirector = cc.director;
      }
      this._cocosDirector = cocosDirector;
    }

    onSceneLoaded(cocosScene) {
      if (this._scenes.length === 0) {
        //Cocos director needs runScene to be called instead of pushScene
        //for the first scene.
        this._cocosDirector.runScene(cocosScene);
      } else {
        if (this._replaceByNextScene) {
          this._cocosDirector.runScene(cocosScene);
          this._scenes.pop();
          this._replaceByNextScene = false;
        } else {
          this._cocosDirector.pushScene(cocosScene);
        }
      }
      this._scenes.push(cocosScene);
    }

    onSceneUnloaded(cocosScene) {
      if (cocosScene !== this._scenes[this._scenes.length - 1]) {
        throw new Error(
          "You've unloaded a scene that wasn't on the top of the " +
            'scene stack. This is not supported by CocosDirectorManager.'
        );
      }
      if (this._scenes.length === 1) {
        // There is only one scene in the stack, so don't pop it now (it would
        // terminate the game execution), but mark it as being replaced by the
        // the next scene that will be launched.
        this._replaceByNextScene = true;
      } else {
        this._cocosDirector.popScene();
        this._scenes.pop();
      }
    }

    end() {
      this._cocosDirector.end();
    }
  }
}
