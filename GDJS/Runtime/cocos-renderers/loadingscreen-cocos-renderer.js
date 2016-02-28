gdjs.LoadingScreenCocosRenderer = function(runtimeGamePixiRenderer)
{
    console.log("LoadingScreenCocosRenderer"); //TODO
}

gdjs.LoadingScreenRenderer = gdjs.LoadingScreenCocosRenderer; //Register the class to let the engine use it.

gdjs.LoadingScreenCocosRenderer.prototype.render = function(percent) {
    console.log("Loading", percent);
};
