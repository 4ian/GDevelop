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
