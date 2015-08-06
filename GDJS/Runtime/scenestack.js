gdjs.SceneStack = function(runtimeGame) {
    if (!runtimeGame) {
    	throw "SceneStack must be constructed with a gdjs.RuntimeGame."
    }

    this._runtimeGame = runtimeGame;
    this._pixiRenderer = null;
	this._stack = [];
};

gdjs.SceneStack.prototype.setPixiRenderer = function(pixiRenderer) {
    this._pixiRenderer = pixiRenderer;
};

gdjs.SceneStack.prototype.onRendererResized = function() {
	for(var i = 0;i < this._stack.length; ++i) {
		this._stack[i].onCanvasResized();
	}
};

gdjs.SceneStack.prototype.step = function() {
	if (this._stack.length === 0) return false;

	var currentScene = this._stack[this._stack.length - 1];
    if (currentScene.renderAndStep()) {
    	var request = currentScene.getRequestedChange();
        //Something special was requested by the current scene.
        if (request === gdjs.RuntimeScene.STOP_GAME) {
            //postGameScreen(); //TODO
            return false;
        } else if (request === gdjs.RuntimeScene.POP_SCENE) {
        	this.pop();
        } else if (request === gdjs.RuntimeScene.PUSH_SCENE) {
        	this.push(currentScene.getRequestedScene());
        } else if (request === gdjs.RuntimeScene.REPLACE_SCENE) {
            this.replace(currentScene.getRequestedScene());
        } else if (request === gdjs.RuntimeScene.CLEAR_SCENES) {
        	this.replace(currentScene.getRequestedScene(), true);
        } else {
        	console.error("Unrecognized change in scene stack.");
        	return false;
        }
    }

    return true;
};

gdjs.SceneStack.prototype.pop = function() {
	if (this._stack.length <= 1) return false;
	return this._stack.pop();
};

gdjs.SceneStack.prototype.push = function(newSceneName) {
    var newScene = new gdjs.RuntimeScene(this._runtimeGame, this._pixiRenderer);
    newScene.loadFromScene(this._runtimeGame.getSceneData(newSceneName));

    this._stack.push(newScene);
    return newScene;
};

gdjs.SceneStack.prototype.replace = function(newSceneName, clear) {
	if (!!clear) {
        this._stack.length = 0;
    } else {
        if (this._stack.length !== 0) this._stack.pop();
    }

	return this.push(newSceneName);
};
