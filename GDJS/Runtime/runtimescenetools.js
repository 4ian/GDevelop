/**
 * @module runtimeSceneTools
 * @private
 */
gdjs.runtimeSceneTools = gdjs.runtimeSceneTools || {}

gdjs.runtimeSceneTools.sceneJustBegins = function(runtimeScene) {
    return runtimeScene.isFirstFrame();
}

gdjs.runtimeSceneTools.setBackgroundColor = function(runtimeScene, color) {
    
    colors = color.split(";");
    if ( colors.length < 3 ) return;
    
    runtimeScene.setBackgroundColor(parseInt(colors[0]),
                                    parseInt(colors[1]),
                                    parseInt(colors[2]));
}

gdjs.runtimeSceneTools.getElapsedTimeInSeconds = function(runtimeScene) {
    return runtimeScene.getElapsedTime()/1000;
}

gdjs.runtimeSceneTools.setTimeScale = function(runtimeScene, timeScale) {
    return runtimeScene.setTimeScale(timeScale);
}

gdjs.runtimeSceneTools.getTimeScale = function(runtimeScene) {
    return runtimeScene.getTimeScale();
}

gdjs.runtimeSceneTools.timerElapsedTime = function(runtimeScene, timeInSeconds, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) {
        runtimeScene.addTimer(timerName);
        return false;
    }
    
    return runtimeScene.getTimer(timerName).getTime()/1000 >= timeInSeconds;
}

gdjs.runtimeSceneTools.timerPaused = function(runtimeScene, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) return false;
    
    return runtimeScene.getTimer(timerName).isPaused();
}

gdjs.runtimeSceneTools.resetTimer = function(runtimeScene, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) 
        runtimeScene.addTimer(timerName);
    else
        runtimeScene.getTimer(timerName).reset();
}

gdjs.runtimeSceneTools.pauseTimer = function(runtimeScene, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) runtimeScene.addTimer(timerName);
    
    runtimeScene.getTimer(timerName).setPaused(true);
}

gdjs.runtimeSceneTools.unpauseTimer = function(runtimeScene, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) runtimeScene.addTimer(timerName);
    
    return runtimeScene.getTimer(timerName).setPaused(false);
}

gdjs.runtimeSceneTools.removeTimer = function(runtimeScene, timerName) {
    if ( runtimeScene.hasTimer(timerName) ) runtimeScene.removeTimer(timerName);
}

gdjs.runtimeSceneTools.getTimerElapsedTimeInSeconds = function(runtimeScene, timerName) {
    if ( !runtimeScene.hasTimer(timerName) ) return 0;
    
    return runtimeScene.getTimer(timerName).getTime()/1000;
}

gdjs.runtimeSceneTools.getTimeFromStartInSeconds = function(runtimeScene) {
    return runtimeScene.getTimeFromStart()/1000;
}

gdjs.runtimeSceneTools.getTime = function(what) {
    var now = new Date();
    
    if ( what === "hour" )
        return now.getHours();
    else if ( what === "min" )
        return now.getMinutes();
    else if ( what === "sec" )
        return now.getSeconds();
    else if ( what === "mday" )
        return now.getdate();
    else if ( what === "mon" )
        return now.getMonth();
    else if ( what === "year" )
        return now.getFullYear()-1900; //Conform to the C way of returning years.
    else if ( what === "wday" )
        return now.getday();
    else if ( what === "yday" ) {
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
        
    return 0;
}

gdjs.runtimeSceneTools.changeScene = function(currentScene, newSceneName) {
    if ( currentScene.getGame().getSceneXml(newSceneName) != undefined )
        currentScene.requestSceneChange(newSceneName);
}

gdjs.runtimeSceneTools.stopGame = function(currentScene) {
    currentScene.requestGameStop();
}