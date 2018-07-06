/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to runtime scene, for events generated code.
 * @memberof gdjs.evtTools
 * @class runtimeScene
 * @static
 * @private
 */
gdjs.evtTools.runtimeScene = gdjs.evtTools.runtimeScene || {};

gdjs.evtTools.runtimeScene.sceneJustBegins = function(runtimeScene) {
    return runtimeScene.getTimeManager().isFirstFrame();
};

gdjs.evtTools.runtimeScene.getSceneName = function(runtimeScene) {
    return runtimeScene.getName();
};

gdjs.evtTools.runtimeScene.setBackgroundColor = function(runtimeScene, rgbColor) {

    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    runtimeScene.setBackgroundColor(parseInt(colors[0]),
                                    parseInt(colors[1]),
                                    parseInt(colors[2]));
};

gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds = function(runtimeScene) {
    return runtimeScene.getTimeManager().getElapsedTime() / 1000;
};

gdjs.evtTools.runtimeScene.setTimeScale = function(runtimeScene, timeScale) {
    return runtimeScene.getTimeManager().setTimeScale(timeScale);
};

gdjs.evtTools.runtimeScene.getTimeScale = function(runtimeScene) {
    return runtimeScene.getTimeManager().getTimeScale();
};

gdjs.evtTools.runtimeScene.timerElapsedTime = function(runtimeScene, timeInSeconds, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if ( !timeManager.hasTimer(timerName) ) {
        timeManager.addTimer(timerName);
        return false;
    }

    return timeManager.getTimer(timerName).getTime() / 1000 >= timeInSeconds;
};

gdjs.evtTools.runtimeScene.timerPaused = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if ( !timeManager.hasTimer(timerName) ) return false;

    return timeManager.getTimer(timerName).isPaused();
};

gdjs.evtTools.runtimeScene.resetTimer = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if ( !timeManager.hasTimer(timerName) )
        timeManager.addTimer(timerName);
    else
        timeManager.getTimer(timerName).reset();
};

gdjs.evtTools.runtimeScene.pauseTimer = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if ( !timeManager.hasTimer(timerName) ) timeManager.addTimer(timerName);

    timeManager.getTimer(timerName).setPaused(true);
};

gdjs.evtTools.runtimeScene.unpauseTimer = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if ( !timeManager.hasTimer(timerName) ) timeManager.addTimer(timerName);

    return timeManager.getTimer(timerName).setPaused(false);
};

gdjs.evtTools.runtimeScene.removeTimer = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    timeManager.removeTimer(timerName);
};

gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSeconds = function(runtimeScene, timerName) {
    var timeManager = runtimeScene.getTimeManager();
    if (!timeManager.hasTimer(timerName)) return 0;

    return timeManager.getTimer(timerName).getTime() / 1000;
};

gdjs.evtTools.runtimeScene.getTimeFromStartInSeconds = function(runtimeScene) {
    return runtimeScene.getTimeManager().getTimeFromStart() / 1000;
};

gdjs.evtTools.runtimeScene.getTime = function(runtimeScene, what) {
    var now = new Date();

    if ( what === "hour" )
        return now.getHours();
    else if ( what === "min" )
        return now.getMinutes();
    else if ( what === "sec" )
        return now.getSeconds();
    else if ( what === "mday" )
        return now.getDate();
    else if ( what === "mon" )
        return now.getMonth();
    else if ( what === "year" )
        return now.getFullYear() - 1900; //Conform to the C way of returning years.
    else if ( what === "wday" )
        return now.getDay();
    else if ( what === "yday" ) {
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    return 0;
};

gdjs.evtTools.runtimeScene.replaceScene = function(runtimeScene, newSceneName, clearOthers) {
    if (!runtimeScene.getGame().getSceneData(newSceneName)) return;

    runtimeScene.requestChange(clearOthers ?
        gdjs.RuntimeScene.CLEAR_SCENES :
        gdjs.RuntimeScene.REPLACE_SCENE, newSceneName);
};

gdjs.evtTools.runtimeScene.pushScene = function(runtimeScene, newSceneName) {
    if (!runtimeScene.getGame().getSceneData(newSceneName)) return;

    runtimeScene.requestChange(gdjs.RuntimeScene.PUSH_SCENE, newSceneName);
};

gdjs.evtTools.runtimeScene.popScene = function(runtimeScene) {
    runtimeScene.requestChange(gdjs.RuntimeScene.POP_SCENE);
};

gdjs.evtTools.runtimeScene.stopGame = function(runtimeScene) {
    runtimeScene.requestChange(gdjs.RuntimeScene.STOP_GAME);
};

gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout = function(scene, externalLayout, xPos, yPos) {
    var externalLayoutData = scene.getGame().getExternalLayoutData(externalLayout);
    if ( externalLayoutData === null ) return;

    scene.createObjectsFrom(externalLayoutData.instances, xPos, yPos);
};
