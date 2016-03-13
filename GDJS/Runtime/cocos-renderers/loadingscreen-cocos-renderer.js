/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

gdjs.LoadingScreenCocosRenderer = function(runtimeGamePixiRenderer)
{
}

gdjs.LoadingScreenRenderer = gdjs.LoadingScreenCocosRenderer; //Register the class to let the engine use it.

gdjs.LoadingScreenCocosRenderer.prototype.render = function(percent) {
    console.log("Loading " + percent + "%");
};
