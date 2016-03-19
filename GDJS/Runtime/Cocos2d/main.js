cc.game.onStart = function(){
    if(!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));

    gdjs.registerObjects();
    gdjs.registerBehaviors();
    gdjs.registerGlobalCallbacks();

    var game = new gdjs.RuntimeGame(gdjs.projectData, {});

    // Pass true to enable retina display, disabled by default to improve performance
    cc.view.enableRetina(false);
    // Adjust viewport meta
    cc.view.adjustViewPort(true);
    // Setup the resolution policy and design resolution size
    cc.view.setDesignResolutionSize(game.getDefaultWidth(), game.getDefaultHeight(), cc.ResolutionPolicy.SHOW_ALL);
    // The game will be resized when browser size change
    cc.view.resizeWithBrowserSize(true);

    //Load all assets and start the game
    game.loadAllAssets(function() {
        game.startGameLoop();
    });
};

cc.game.run();
