// "Polyfill" self which is not defined in Cocos2d-JS (v3.10)
// and used by some library like Shopify SDK.
if (typeof self === 'undefined') {
    console.log("Add polyfill for 'self'");
    self = window;
}

// Patch XMLHttpRequest.send as Cocos2d-JS v3.15 and below are not supporting
// passing null or undefined as parameter, even if it is compliant to do so.
if (typeof XMLHttpRequest !== 'undefined') {
    console.log("Patching XMLHttpRequest for Cocos2d-JS v3.15 and below");
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        console.log("(Using patched XMLHttpRequest.send)");
        if (body === null || body === undefined) {
            return originalSend.call(this);
        }
        originalSend.apply(this, arguments);
    }
}

cc.game.onStart = function(){
    if(!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));

    var game = new gdjs.RuntimeGame(gdjs.projectData, {});

    // Pass true to enable retina display, disabled by default to improve performance
    cc.view.enableRetina(false);
    // Adjust viewport meta
    cc.view.adjustViewPort(true);
    // Setup the resolution policy and design resolution size
    cc.view.setDesignResolutionSize(game.getGameResolutionWidth(), game.getGameResolutionHeight(), cc.ResolutionPolicy.SHOW_ALL);
    // The game will be resized when browser size change
    cc.view.resizeWithBrowserSize(true);

    //Load all assets and start the game
    game.loadAllAssets(function() {
        game.startGameLoop();
    });
};

cc.game.run();
